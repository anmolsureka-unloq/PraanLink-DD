import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, Mic, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// How long a pause has to "stick" (no resume) before the check-in is
// finalized. Purely internal timing - never shown to the user as a
// countdown or a blocking gate.
const POST_PAUSE_DELAY_MS = 15000;
const SAMPLE_AUDIO_PATH = "/uploads/checkins/audio/checkin_1762026039554.wav";

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
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<CheckInSummary | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const stopElapsedTimer = () => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  };

  const startElapsedTimer = () => {
    stopElapsedTimer();
    elapsedTimerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const clearCompletionTimer = () => {
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopElapsedTimer();
      clearCompletionTimer();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start -> play the complete sample recording. Pause -> pauses playback
  // right there and arms a 15s completion timer. Tapping again before that
  // timer fires resumes playback and cancels it - however many times this
  // happens, finalizeCheckIn() below always submits the same complete
  // pre-existing transcript, never a partial one.
  const handleMicClick = () => {
    if (!isRecording) {
      setResult(null);
      setElapsed(0);

      const audio = new Audio(`${BACKEND_URL}${SAMPLE_AUDIO_PATH}`);
      audioRef.current = audio;
      audio.play().catch((error) => console.error("Audio playback error:", error));

      setIsRecording(true);
      setIsPaused(false);
      startElapsedTimer();
    } else if (!isPaused) {
      audioRef.current?.pause();
      stopElapsedTimer();
      setIsPaused(true);
      completionTimerRef.current = setTimeout(finalizeCheckIn, POST_PAUSE_DELAY_MS);
    } else {
      clearCompletionTimer();
      audioRef.current?.play().catch((error) => console.error("Audio playback error:", error));
      startElapsedTimer();
      setIsPaused(false);
    }
  };

  const finalizeCheckIn = async () => {
    completionTimerRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(true);

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
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-5 py-6">
      <div className="mx-auto max-w-md space-y-5">
        {/* Recording Interface */}
        <Card className="p-6 shadow-md">
          <div className="flex flex-col items-center space-y-5">
            {/* Timer Display */}
            {isRecording && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="text-display text-foreground">{formatTime(elapsed)}</div>
              </motion.div>
            )}

            {/* Audio Visualizer */}
            <AnimatePresence>
              {isRecording && !isPaused && (
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

            {/* Mic / Pause / Resume Button */}
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              className={cn(
                "relative flex h-28 w-28 items-center justify-center rounded-full transition-smooth active:scale-95",
                isRecording && !isPaused
                  ? "bg-destructive shadow-lg shadow-destructive/30 animate-pulse"
                  : isPaused
                  ? "bg-warning shadow-lg shadow-warning/30"
                  : "bg-primary shadow-lg shadow-primary/25 hover:scale-105",
                isProcessing && "cursor-not-allowed opacity-50"
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
              ) : isPaused ? (
                <Play className="h-8 w-8 text-warning-foreground" />
              ) : isRecording ? (
                <Pause className="h-8 w-8 text-destructive-foreground" />
              ) : (
                <Mic className="h-8 w-8 text-primary-foreground" />
              )}

              {isRecording && !isPaused && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-5 w-5 rounded-full bg-destructive" />
                </span>
              )}
            </button>

            <div className="text-center">
              <p className="text-subtitle text-foreground">
                {isProcessing
                  ? "Processing your check-in..."
                  : isPaused
                  ? "Paused - tap to resume"
                  : isRecording
                  ? "Listening... tap to pause"
                  : "Tap to start your check-in"}
              </p>
            </div>
          </div>
        </Card>

        {/* Tips Card */}
        {!isRecording && !result && (
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

              {result.date && (
                <p className="text-caption text-muted-foreground">Mentioned date: {result.date}</p>
              )}

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
