"use client";

import {
  AudioLines,
  Mic,
  Paperclip,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface AudioInputProps {
  onAudioChange?: (file: File | null) => void;
}

export default function AudioInput({
  onAudioChange,
}: AudioInputProps) {
  const [isRecording, setIsRecording] =
    useState(false);

  const [audioFile, setAudioFile] =
    useState<File | null>(null);

  const [audioUrl, setAudioUrl] =
    useState<string | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [duration, setDuration] =
    useState(0);

  const [currentTime, setCurrentTime] =
    useState(0);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* ------------------------------------------ */
  /* CLEANUP */
  /* ------------------------------------------ */

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  /* ------------------------------------------ */
  /* CREATE AUDIO FILE */
  /* ------------------------------------------ */

  const setAudio = (file: File) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);

    setAudioFile(file);
    setAudioUrl(url);
    setCurrentTime(0);

    onAudioChange?.(file);
  };

  /* ------------------------------------------ */
  /* START RECORDING */
  /* ------------------------------------------ */

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mimeType =
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        const extension =
          recorder.mimeType.includes(
            "webm"
          )
            ? "webm"
            : "audio";

        const file = new File(
          [blob],
          `smart-match-${Date.now()}.${extension}`,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        setAudio(file);

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      };

      recorder.start();

      setIsRecording(true);
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      alert(
        "Please allow microphone access to record audio."
      );
    }
  };

  /* ------------------------------------------ */
  /* STOP RECORDING */
  /* ------------------------------------------ */

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }

    setIsRecording(false);
  };

  /* ------------------------------------------ */
  /* FILE UPLOAD */
  /* ------------------------------------------ */

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("Please select an audio file.");
      return;
    }

    setAudio(file);

    event.target.value = "";
  };

  /* ------------------------------------------ */
  /* PLAY / PAUSE */
  /* ------------------------------------------ */

  const togglePlay = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  /* ------------------------------------------ */
  /* AUDIO EVENTS */
  /* ------------------------------------------ */

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setDuration(audio.duration);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setCurrentTime(audio.currentTime);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  /* ------------------------------------------ */
  /* DELETE AUDIO */
  /* ------------------------------------------ */

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    audioRef.current?.pause();

    setAudioFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    onAudioChange?.(null);
  };

  /* ------------------------------------------ */
  /* RECORD AGAIN */
  /* ------------------------------------------ */

  const recordAgain = () => {
    deleteAudio();

    setTimeout(() => {
      startRecording();
    }, 50);
  };

  /* ------------------------------------------ */
  /* FORMAT TIME */
  /* ------------------------------------------ */

  const formatTime = (
    value: number
  ) => {
    if (!Number.isFinite(value)) {
      return "00:00";
    }

    const minutes = Math.floor(
      value / 60
    );

    const seconds = Math.floor(
      value % 60
    );

    return `${minutes
      .toString()
      .padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  /* ========================================== */
  /* AUDIO EXISTS */
  /* ========================================== */

  if (audioFile && audioUrl) {
    const progress =
      duration > 0
        ? (currentTime / duration) * 100
        : 0;

    return (
      <div className="rounded-xl border border-black/5 bg-[#FAF8F4] px-3 py-2.5">
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={
            handleLoadedMetadata
          }
          onTimeUpdate={
            handleTimeUpdate
          }
          onPlay={() =>
            setIsPlaying(true)
          }
          onPause={() =>
            setIsPlaying(false)
          }
          onEnded={handleAudioEnded}
        />

        <div className="flex items-center gap-2.5">
          {/* PLAY */}

          <button
            type="button"
            onClick={togglePlay}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#29251F]
              text-white
              transition
              hover:opacity-85
            "
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="ml-0.5 h-3.5 w-3.5" />
            )}
          </button>

          {/* WAVEFORM */}

          <div className="min-w-0 flex-1">
            <div className="flex h-6 items-center gap-[2px]">
              {Array.from({
                length: 32,
              }).map((_, index) => {
                const height =
                  25 +
                  ((index * 37) % 65);

                return (
                  <div
                    key={index}
                    className={`
                      w-[2px]
                      rounded-full
                      transition-colors
                      ${
                        index <
                        (progress / 100) *
                          32
                          ? "bg-[#C59AB0]"
                          : "bg-black/10"
                      }
                    `}
                    style={{
                      height: `${height}%`,
                    }}
                  />
                );
              })}
            </div>

            <div className="mt-0.5 flex justify-between text-[9px] text-black/40">
              <span>
                {formatTime(currentTime)}
              </span>

              <span>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* DELETE */}

          <button
            type="button"
            onClick={deleteAudio}
            aria-label="Delete recording"
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-black/40
              transition
              hover:bg-red-50
              hover:text-red-500
            "
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* SECONDARY ACTIONS */}

        <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2">
          <span className="flex items-center gap-1.5 text-[10px] text-black/45">
            <AudioLines className="h-3 w-3" />
            Audio ready
          </span>

          <button
            type="button"
            onClick={recordAgain}
            className="
              flex
              items-center
              gap-1.5
              rounded-lg
              px-2
              py-1
              text-[10px]
              font-medium
              text-black/60
              transition
              hover:bg-black/5
            "
          >
            <RotateCcw className="h-3 w-3" />
            Record again
          </button>
        </div>
      </div>
    );
  }

  /* ========================================== */
  /* RECORDING STATE */
  /* ========================================== */

  if (isRecording) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl bg-[#F6C6D5]/30 px-3 py-2">
        <div className="flex items-center gap-1.5">
          {Array.from({
            length: 16,
          }).map((_, index) => (
            <div
              key={index}
              className="w-[2px] animate-pulse rounded-full bg-[#C59AB0]"
              style={{
                height: `${
                  8 +
                  ((index * 13) % 14)
                }px`,
                animationDelay: `${
                  index * 50
                }ms`,
              }}
            />
          ))}
        </div>

        <span className="text-[11px] font-medium text-black/60">
          Recording...
        </span>

        <button
          type="button"
          onClick={stopRecording}
          className="
            ml-auto
            flex
            h-8
            items-center
            gap-1.5
            rounded-lg
            bg-[#29251F]
            px-2.5
            text-[10px]
            font-medium
            text-white
          "
        >
          <span className="h-2 w-2 rounded-sm bg-white" />
          Stop
        </button>
      </div>
    );
  }

  /* ========================================== */
  /* DEFAULT STATE */
  /* ========================================== */

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex items-center gap-1">
        {/* UPLOAD */}

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          aria-label="Upload audio"
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            text-black/40
            transition
            hover:bg-black/5
            hover:text-black
          "
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* MICROPHONE */}

        <button
          type="button"
          onClick={startRecording}
          aria-label="Record audio"
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            text-black/45
            transition
            hover:bg-[#F6C6D5]/50
            hover:text-black
          "
        >
          <Mic className="h-[17px] w-[17px]" />
        </button>

        <span className="ml-1 text-[10px] text-black/30">
          Type or speak your requirement
        </span>
      </div>
    </>
  );
}