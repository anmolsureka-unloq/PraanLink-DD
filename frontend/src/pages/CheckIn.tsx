import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Import your utility classes (make sure these exist in your project)
// If not, you'll need to copy them from your other project
import { GeminiLiveAPI } from "@/utils/gemini-live-api";
import { AudioRecorder } from "@/utils/audio-recorder";
import { AudioStreamer } from "@/utils/audio-streamer";
import { SequentialCallRecorder } from "@/utils/sequential-call-recorder";

export default function CheckIn() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const geminiAPIRef = useRef<any>(null);
  const audioRecorderRef = useRef<any>(null);
  const audioStreamerRef = useRef<any>(null);
  const callRecorderRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const initializedRef = useRef(false);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const endpoint = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Initialize Gemini API
  useEffect(() => {
    const systemInstruction = `You are a compassionate and empathetic health assistant conducting a weekly check-in with a patient.

YOUR ROLE:
- You are a caring healthcare companion who checks in with patients about their weekly health and wellbeing
- You listen actively and ask thoughtful follow-up questions
- You show genuine concern and empathy for their health concerns
- You help patients reflect on their physical and mental health over the past week

CONVERSATION STYLE:
- Speak naturally and conversationally in English or Hindi if asked
- Ask open-ended questions to encourage detailed responses
- Show empathy and understanding for their concerns
- Acknowledge their feelings and experiences
- Be warm, friendly, and professional

KEY AREAS TO EXPLORE:
1. Physical Health: Ask about symptoms, pain, energy levels, sleep quality
2. Mental Wellbeing: Inquire about mood, stress levels, emotional state
3. Medications: Check if they've taken medications as prescribed
4. Lifestyle: Ask about diet, exercise, and daily activities
5. Concerns: Listen to any specific health worries they may have

IMPORTANT GUIDELINES:
- Start with a warm greeting and ask how their week has been
- Listen more than you speak - let them share their experiences
- Ask follow-up questions based on what they tell you
- Use the searchMedicalKnowledge tool when they mention specific symptoms or conditions
- Use the searchUserHistory tool to reference their past check-ins, reports, or prescriptions
- Provide supportive, non-judgmental responses
- Never provide definitive medical diagnoses - always recommend consulting their doctor for serious concerns
- Keep the conversation flowing naturally, like talking to a trusted healthcare friend

Begin by warmly greeting the user and asking them how their week has been health-wise.`;

    const customSetupConfig = {
      model: "models/gemini-2.0-flash-exp",
      system_instruction: {
        parts: [{
          text: systemInstruction
        }]
      },
      generation_config: {
        response_modalities: ["audio"],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: {
              voice_name: "Aoede" // Use a gentle, caring voice
            }
          }
        }
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: "searchMedicalKnowledge",
              description: "Search medical knowledge base for information about symptoms, conditions, medications, or treatments. Use this when the user mentions specific health concerns.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The medical query or symptom to search for",
                  },
                },
                required: ["query"],
              },
            },
            {
              name: "searchUserHistory",
              description: "Search the user's health history including past check-ins, medical reports, prescriptions, and summaries. Use this to provide personalized context.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "What to search for in the user's history",
                  },
                },
                required: ["query"],
              },
            },
          ],
        },
      ],
    };

    geminiAPIRef.current = new GeminiLiveAPI(endpoint, true, customSetupConfig);

    geminiAPIRef.current.onSetupComplete = () => {
      console.log('Gemini API setup complete');
    };

    geminiAPIRef.current.onAudioData = async (audioData: string) => {
      if (!audioStreamerRef.current?.isPlaying) {
        setIsAISpeaking(true);
      }
      
      const arrayBuffer = base64ToArrayBuffer(audioData);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      if (callRecorderRef.current) {
        callRecorderRef.current.addAIAudio(uint8Array);
      }
      
      await playAudioChunk(audioData);
    };

    geminiAPIRef.current.onInterrupted = () => {
      console.log('AI interrupted');
      setIsAISpeaking(false);
      audioStreamerRef.current?.stop();
    };

    geminiAPIRef.current.onToolCall = async (toolCall: any) => {
      console.log("Tool call received:", toolCall);
    
      if (toolCall.name === "searchMedicalKnowledge") {
        const query = toolCall.arguments.query;
        
        try {
          const response = await fetch(`${BACKEND_URL}/medical-search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
      
          const data = await response.json();
      
          geminiAPIRef.current.sendToolResult(toolCall.call_id, {
            result: data.answer || "No medical information found for this query.",
          });
        } catch (error) {
          console.error('Medical search error:', error);
          geminiAPIRef.current.sendToolResult(toolCall.call_id, {
            result: "Unable to search medical knowledge at this time.",
          });
        }
      } else if (toolCall.name === "searchUserHistory") {
        const query = toolCall.arguments.query;
        
        try {
          const response = await fetch(`${BACKEND_URL}/user-history-search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
      
          const data = await response.json();
      
          geminiAPIRef.current.sendToolResult(toolCall.call_id, {
            result: data.answer || "No relevant history found.",
          });
        } catch (error) {
          console.error('User history search error:', error);
          geminiAPIRef.current.sendToolResult(toolCall.call_id, {
            result: "Unable to search user history at this time.",
          });
        }
      }
    };

    geminiAPIRef.current.onTurnComplete = () => {
      console.log('AI finished speaking');
      setIsAISpeaking(false);
      audioStreamerRef.current?.complete();
    };

    geminiAPIRef.current.onError = (message: string) => {
      console.error('Gemini API error:', message);
      toast.error(message);
    };

    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
      }
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const ensureAudioInitialized = async () => {
    if (!initializedRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 24000 
      });
      audioStreamerRef.current = new AudioStreamer(audioContextRef.current);
      await audioContextRef.current.resume();
      initializedRef.current = true;
      console.log('Audio context initialized:', audioContextRef.current.state);
    }
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const playAudioChunk = async (base64AudioChunk: string) => {
    try {
      await ensureAudioInitialized();
      const arrayBuffer = base64ToArrayBuffer(base64AudioChunk);
      const uint8Array = new Uint8Array(arrayBuffer);
      audioStreamerRef.current?.addPCM16(uint8Array);
      audioStreamerRef.current?.resume();
    } catch (error) {
      console.error('Error queuing audio chunk:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    try {
      await ensureAudioInitialized();

      audioStreamerRef.current?.stop();

      if (geminiAPIRef.current.ws.readyState !== WebSocket.OPEN) {
        toast.error("Connection not ready. Please wait...");
        return;
      }

      audioRecorderRef.current = new AudioRecorder();
      await audioRecorderRef.current.start();

      audioRecorderRef.current.on('data', (base64Data: string) => {
        geminiAPIRef.current?.sendAudioChunk(base64Data);
      });

      callRecorderRef.current = new SequentialCallRecorder(24000);
      
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await callRecorderRef.current.startRecording(userStream);

      setIsRecording(true);
      setElapsed(0);
      toast.success("Check-in started - Recording in progress");

    } catch (error: any) {
      console.error('Error starting recording:', error);
      toast.error('Error starting check-in: ' + error.message);
    }
  };

  const handleStopRecording = async () => {
    setIsProcessing(true);
    
    try {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
        audioRecorderRef.current.off('data');
      }

      let recordingBlob: Blob | null = null;
      if (callRecorderRef.current && callRecorderRef.current.isCurrentlyRecording()) {
        recordingBlob = await callRecorderRef.current.stopRecording();
        console.log('Recording captured:', recordingBlob.size, 'bytes');
      }

      geminiAPIRef.current?.sendEndMessage();

      setIsRecording(false);

      if (recordingBlob) {
        toast.loading("Saving your check-in...");
        
        // Upload recording to backend
        const formData = new FormData();
        const fileName = `checkin_${Date.now()}.wav`;
        formData.append('file', recordingBlob, fileName);

        const response = await fetch(`${BACKEND_URL}/upload-checkin`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          toast.success("Check-in saved successfully!");
          console.log('Check-in saved:', data);
        } else {
          toast.error("Failed to save check-in");
        }
      }
    } catch (error: any) {
      console.error('Error ending check-in:', error);
      toast.error('Error ending check-in: ' + error.message);
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

            {/* Mic Button */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
              className={cn(
                "relative flex h-28 w-28 items-center justify-center rounded-full transition-smooth active:scale-95",
                isRecording
                  ? "bg-destructive shadow-lg shadow-destructive/30 animate-pulse"
                  : "bg-primary shadow-lg shadow-primary/25 hover:scale-105",
                isProcessing && "cursor-not-allowed opacity-50"
              )}
            >
              {isProcessing ? (
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
                {isProcessing
                  ? "Processing your check-in..."
                  : isRecording
                  ? "Listening... tap to stop"
                  : "Tap to start your check-in"}
              </p>
              <p className="mt-1 text-caption text-muted-foreground">
                {isRecording && "Talk naturally with your health assistant"}
                {isAISpeaking && (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mt-2 block font-medium text-primary"
                  >
                    Assistant is speaking...
                  </motion.span>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Tips Card */}
        {!isRecording && (
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
      </div>
    </div>
  );
}