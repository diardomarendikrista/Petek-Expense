"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Type casting for webkitSpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // keep recording until manually stopped
    recognition.interimResults = true; // get results as they are spoken
    recognition.lang = options.lang || "id-ID";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      if (options.onResult) {
        options.onResult(currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      // 'no-speech' and 'network' are common on Android — don't treat as fatal
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        if (options.onError) {
          options.onError(event.error);
        }
        setIsRecording(false);
      }
      // Other errors (no-speech, network, aborted) will be handled by onend auto-restart
    };

    recognition.onend = () => {
      // Check if the user intentionally stopped or Android killed it
      if (recognitionRef.current?._isStopping) {
        // User pressed stop — process normally
        recognitionRef.current._isStopping = false;
        setIsRecording(false);
      } else if (recognitionRef.current?._isRecording) {
        // Android killed it silently — restart immediately without resetting transcript
        try {
          recognition.start();
        } catch (e) {
          // If restart fails, give up gracefully
          setIsRecording(false);
        }
      }
    };

    recognitionRef.current = recognition;
    // Attach tracking flags directly onto the ref object
    recognitionRef.current._isStopping = false;
    recognitionRef.current._isRecording = false;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current._isRecording = false;
        recognitionRef.current._isStopping = true;
        recognitionRef.current.abort();
      }
    };
  }, [options.lang]); // Only depend on the primitive values, not the entire object

  const startRecording = useCallback(() => {
    setTranscript("");
    if (recognitionRef.current) {
      try {
        recognitionRef.current._isStopping = false;
        recognitionRef.current._isRecording = true;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recognition", error);
        // It might already be started
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      // Flag as intentional stop BEFORE calling stop()
      recognitionRef.current._isStopping = true;
      recognitionRef.current._isRecording = false;
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    isSupported,
  };
}
