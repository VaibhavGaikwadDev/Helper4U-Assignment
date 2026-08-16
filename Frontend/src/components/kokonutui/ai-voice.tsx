"use client";

import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AIVoiceProps {
  onRecordingComplete?: (blob: Blob) => void;
  disabled?: boolean;
}

export default function AIVoice({
  onRecordingComplete,
  disabled = false,
}: AIVoiceProps) {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!recording) {
      setTime(0);
      return;
    }

    const interval = setInterval(() => {
      setTime((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [recording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type: recorder.mimeType || "audio/webm",
          }
        );

        onRecordingComplete?.(blob);

        stream
          .getTracks()
          .forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error(
        "Microphone permission error:",
        error
      );

      alert(
        "Microphone access is required to record your requirement."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
  };

  const handleClick = () => {
    if (disabled) return;

    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        aria-label={
          recording
            ? "Stop recording"
            : "Start recording"
        }
        className={cn(
          "group flex h-14 w-14 items-center justify-center rounded-2xl transition-all",
          recording
            ? "bg-[#F6C6D5]"
            : "bg-[#F6C6D5]/40 hover:bg-[#F6C6D5]/65",
          disabled &&
            "cursor-not-allowed opacity-50"
        )}
      >
        {recording ? (
          <Square className="h-5 w-5 fill-black" />
        ) : (
          <Mic className="h-6 w-6 text-black" />
        )}
      </button>

      <span
        className={cn(
          "mt-1 font-mono text-xs",
          recording
            ? "text-black/70"
            : "text-black/35"
        )}
      >
        {formatTime(time)}
      </span>

      <div className="mt-1 flex h-5 items-center justify-center gap-0.5">
        {[...Array(36)].map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-0.5 rounded-full transition-all",
              recording
                ? "animate-pulse bg-black/50"
                : "h-1 bg-black/10"
            )}
            style={
              recording
                ? {
                    height: `${
                      20 +
                      ((index * 17) % 70)
                    }%`,
                    animationDelay: `${
                      index * 0.04
                    }s`,
                  }
                : undefined
            }
          />
        ))}
      </div>

      <p className="mt-1 text-[10px] text-black/50">
        {recording
          ? "Tap to stop"
          : "Tap to speak"}
      </p>
    </div>
  );
}