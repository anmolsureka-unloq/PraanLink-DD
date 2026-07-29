import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bot, CheckCircle2, Loader2, Mic, Square, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// How long after Stop to wait before showing the check-in summary. Purely
// internal timing - never shown to the user as a countdown or a gate.
const POST_STOP_DELAY_MS = 15000;
const SAMPLE_AUDIO_PATH = "/uploads/checkins/audio/checkin_1762026039554.wav";

// A line's full text only appears once its utterance has actually finished
// playing (audio.currentTime >= line.end) - never mid-sentence. This extra
// beat after that makes the reveal feel like a natural caption catching up
// rather than snapping in instantly.
const REVEAL_DELAY_SEC = 0.5;

// The fixed sample recording's real WhisperX transcript (verbatim text and
// timestamps), with speaker turns attributed by conversational content -
// the source diarization only produced a single speaker label, but who's
// asking questions vs. answering with symptoms is unambiguous from the text.
interface TranscriptLine {
  start: number;
  end: number;
  text: string;
  role: "agent" | "patient";
}

const SAMPLE_TRANSCRIPT: TranscriptLine[] = [
  { start: 1.229, end: 1.89, text: "Hello.", role: "agent" },
  { start: 6.437, end: 6.898, text: "Hi there.", role: "agent" },
  { start: 7.198, end: 8.921, text: "How has your week been, health-wise?", role: "agent" },
  { start: 9.762, end: 12.106, text: "Anything in particular you'd like to discuss today?", role: "agent" },
  { start: 13.989, end: 14.53, text: "Nothing.", role: "patient" },
  { start: 19.397, end: 19.778, text: "Okay.", role: "agent" },
  {
    start: 19.938,
    end: 24.826,
    text: "Has there been anything at all that you've noticed about your physical or mental well-being this week?",
    role: "agent",
  },
  {
    start: 25.126,
    end: 29.413,
    text: "Maybe any changes in your mood, sleep, energy levels, or anything else?",
    role: "agent",
  },
  { start: 29.933, end: 31.816, text: "My hand is itching continuously.", role: "patient" },
  { start: 38.286, end: 38.627, text: "I see.", role: "agent" },
  { start: 38.947, end: 41.171, text: "You mentioned your hand is itching continuously.", role: "agent" },
  { start: 41.231, end: 43.194, text: "That must be quite irritating.", role: "agent" },
  { start: 43.495, end: 45.838, text: "Is there a specific area of your hand that's itching?", role: "agent" },
  { start: 46.519, end: 47.321, text: "Or is it all over?", role: "agent" },
  { start: 48.503, end: 49.825, text: "Just between my fingers.", role: "patient" },
  { start: 50.105, end: 51.908, text: "And I also have a cold.", role: "patient" },
  { start: 57.473, end: 60.316, text: "Okay, itching between your fingers and a cold.", role: "agent" },
  { start: 61.017, end: 61.738, text: "That's good to know.", role: "agent" },
  {
    start: 61.918,
    end: 64.461,
    text: "I'm sorry to hear that you're dealing with both of those things.",
    role: "agent",
  },
  { start: 64.741, end: 66.182, text: "Let's start with the itching.", role: "agent" },
  {
    start: 66.623,
    end: 72.589,
    text: "Since it's between your fingers, I'm wondering if we should check your user history for any past skin conditions or allergies.",
    role: "agent",
  },
  { start: 73.33, end: 74.451, text: "Would you like me to do that?", role: "agent" },
  { start: 75.613, end: 80.578, text: "Okay.", role: "patient" },
];

type Phase = "idle" | "recording" | "waiting" | "processing";

interface CheckInSummary {
  date?: string | null;
  mood?: string | null;
  symptoms?: string[];
  medications_taken?: string[];
  sleep_quality?: string | null;
  energy_level?: string | null;
  concerns?: string | null;
  summary?: string | null;
  ai_insights?: string[];
  overall_score?: string | null;
}

export default function CheckIn() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [result, setResult] = useState<CheckInSummary | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const stopElapsedTimer = () => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopElapsedTimer();
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleCount, activeIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start plays the complete sample recording while a live transcript
  // reveals each line in sync with actual playback position. Stop is a
  // one-way, complete stop - not a pause: it freezes the transcript where it
  // is and arms a 15s timer after which the same complete pre-existing
  // transcript is submitted to the real agent pipeline and the summary
  // replaces the transcript panel.
  const handleMicClick = () => {
    if (phase !== "idle") return;

    setResult(null);
    setElapsed(0);
    setVisibleCount(0);
    setActiveIndex(-1);

    const audio = new Audio(`${BACKEND_URL}${SAMPLE_AUDIO_PATH}`);
    audio.addEventListener("timeupdate", () => {
      const currentTime = audio.currentTime;

      // A line only becomes "complete" (full text revealed) once it has
      // actually finished playing, plus a small buffer - never while it's
      // still being spoken.
      let completed = 0;
      let inProgress = -1;
      for (let i = 0; i < SAMPLE_TRANSCRIPT.length; i++) {
        const line = SAMPLE_TRANSCRIPT[i];
        if (currentTime >= line.end + REVEAL_DELAY_SEC) {
          completed = i + 1;
        } else if (currentTime >= line.start) {
          inProgress = i;
        }
      }

      setVisibleCount((prev) => (completed > prev ? completed : prev));
      setActiveIndex(inProgress >= completed ? inProgress : -1);
    });
    audioRef.current = audio;
    audio.play().catch((error) => console.error("Audio playback error:", error));

    setPhase("recording");
    elapsedTimerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
  };

  const handleStopClick = () => {
    if (phase !== "recording") return;

    audioRef.current?.pause();
    stopElapsedTimer();
    setActiveIndex(-1);
    setPhase("waiting");
    completionTimerRef.current = setTimeout(finalizeCheckIn, POST_STOP_DELAY_MS);
  };

  const finalizeCheckIn = async () => {
    completionTimerRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPhase("processing");

    const loadingToast = toast.loading("Saving your check-in...");

    try {
      // Runs the real conversation_summarizer_agent pipeline against the
      // fixed sample transcript and stores the result - no live recording
      // or transcription involved.
      const response = await fetch(`${BACKEND_URL}/simulate-checkin`, { method: "POST" });

      if (response.ok) {
        const data = await response.json();
        toast.success("Check-in saved successfully!", { id: loadingToast });
        setResult(data.summary?.summary ?? null);
      } else {
        toast.error("Failed to save check-in", { id: loadingToast });
      }
    } catch (error: any) {
      console.error("Error ending check-in:", error);
      toast.error("Error ending check-in: " + error.message, { id: loadingToast });
    } finally {
      setPhase("idle");
    }
  };

  const isRecording = phase === "recording";
  const isBusy = phase === "waiting" || phase === "processing";
  const showTranscript = (phase === "recording" || phase === "waiting") && (visibleCount > 0 || activeIndex >= 0);

  return (
    <div className="px-5 py-6">
      <div className="mx-auto max-w-md space-y-5">
        {/* Recording Interface */}
        <Card className="p-6 shadow-md">
          <div className="flex flex-col items-center space-y-5">
            {/* Timer Display */}
            {phase !== "idle" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="text-display text-foreground">{formatTime(elapsed)}</div>
              </motion.div>
            )}

            {/* Audio Visualizer */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-14 items-end justify-center gap-1"
                >
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                      className="w-1.5 rounded-full bg-gradient-to-t from-primary to-secondary"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mic / Stop Button */}
            <button
              onClick={isRecording ? handleStopClick : handleMicClick}
              disabled={isBusy}
              className={cn(
                "relative flex h-28 w-28 items-center justify-center rounded-full transition-smooth active:scale-95",
                isRecording
                  ? "bg-destructive shadow-lg shadow-destructive/30 animate-pulse"
                  : "bg-primary shadow-lg shadow-primary/25 hover:scale-105",
                isBusy && "cursor-not-allowed opacity-50"
              )}
            >
              {isBusy ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
              ) : isRecording ? (
                <Square className="h-8 w-8 text-destructive-foreground" />
              ) : (
                <Mic className="h-8 w-8 text-primary-foreground" />
              )}

              {isRecording && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-5 w-5 rounded-full bg-destructive" />
                </span>
              )}
            </button>

            <div className="text-center">
              <p className="text-subtitle text-foreground">
                {phase === "processing"
                  ? "Processing your check-in..."
                  : phase === "waiting"
                  ? "Wrapping up..."
                  : isRecording
                  ? "Listening... tap to stop"
                  : "Tap to start your check-in"}
              </p>
            </div>
          </div>
        </Card>

        {/* Live synced transcript */}
        {showTranscript && (
          <Card className="p-4">
            <h3 className="mb-3 px-1 text-caption font-medium text-muted-foreground">Live transcript</h3>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {SAMPLE_TRANSCRIPT.slice(0, visibleCount).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex items-end gap-2", line.role === "patient" && "flex-row-reverse")}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                        line.role === "agent" ? "bg-primary/15 text-primary" : "bg-secondary/20 text-secondary"
                      )}
                    >
                      {line.role === "agent" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={cn("flex max-w-[75%] flex-col", line.role === "patient" && "items-end")}>
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-2 text-body",
                          line.role === "agent"
                            ? "rounded-bl-sm bg-muted text-foreground"
                            : "rounded-br-sm bg-primary text-primary-foreground"
                        )}
                      >
                        {line.text}
                      </div>
                      <span className="mt-0.5 px-1 text-[11px] text-muted-foreground">
                        {formatTime(line.start)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {activeIndex >= 0 && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex items-end gap-2",
                      SAMPLE_TRANSCRIPT[activeIndex].role === "patient" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                        SAMPLE_TRANSCRIPT[activeIndex].role === "agent"
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary/20 text-secondary"
                      )}
                    >
                      {SAMPLE_TRANSCRIPT[activeIndex].role === "agent" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-2xl px-3 py-2.5",
                        SAMPLE_TRANSCRIPT[activeIndex].role === "agent"
                          ? "rounded-bl-sm bg-muted"
                          : "rounded-br-sm bg-primary/20"
                      )}
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay: dot * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={transcriptEndRef} />
            </div>
          </Card>
        )}

        {/* Tips Card */}
        {phase === "idle" && !result && (
          <Card className="p-5 bg-muted/50">
            <h3 className="mb-3 text-subtitle text-foreground">What we'll talk about</h3>
            <ul className="space-y-2 text-body text-muted-foreground">
              <li>• How you've been feeling physically this week</li>
              <li>• Your sleep quality and energy levels</li>
              <li>• Any medications or treatments you're following</li>
              <li>• Your emotional wellbeing and stress levels</li>
              <li>• Any specific health concerns you'd like to discuss</li>
            </ul>
            <div className="mt-4 rounded-xl bg-primary/10 p-3">
              <p className="text-caption font-medium text-primary">
                💡 Speak naturally and take your time. The assistant can search medical information and your past
                records to support you.
              </p>
            </div>
          </Card>
        )}

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="text-subtitle text-foreground">Check-in results</h3>
              </div>

              {result.date && <p className="text-caption text-muted-foreground">Mentioned date: {result.date}</p>}

              {result.summary && <p className="text-body text-muted-foreground">{result.summary}</p>}

              {result.overall_score && (
                <p className="text-body">
                  <span className="font-medium text-foreground">Overall: </span>
                  {result.overall_score}
                </p>
              )}

              {result.mood && (
                <p className="text-body">
                  <span className="font-medium text-foreground">Mood: </span>
                  {result.mood}
                </p>
              )}

              {result.sleep_quality && (
                <p className="text-body">
                  <span className="font-medium text-foreground">Sleep quality: </span>
                  {result.sleep_quality}
                </p>
              )}

              {result.energy_level && (
                <p className="text-body">
                  <span className="font-medium text-foreground">Energy level: </span>
                  {result.energy_level}
                </p>
              )}

              {!!result.symptoms?.length && (
                <p className="text-body">
                  <span className="font-medium text-foreground">Symptoms: </span>
                  {result.symptoms.join(", ")}
                </p>
              )}

              {!!result.medications_taken?.length && (
                <p className="text-body">
                  <span className="font-medium text-foreground">Medications taken: </span>
                  {result.medications_taken.join(", ")}
                </p>
              )}

              {result.concerns && (
                <p className="text-body">
                  <span className="font-medium text-foreground">Concerns: </span>
                  {result.concerns}
                </p>
              )}

              {!!result.ai_insights?.length && (
                <div>
                  <p className="text-body font-medium text-foreground">Insights</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-body text-muted-foreground">
                    {result.ai_insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
