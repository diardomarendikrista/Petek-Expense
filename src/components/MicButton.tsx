"use client";

import { Mic } from "lucide-react";
import { motion } from "framer-motion";

interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export function MicButton({ isRecording, onClick }: MicButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse effect when recording */}
      {isRecording && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-brand-500 opacity-20"
            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-brand-500 opacity-20"
            animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.3, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
          />
        </>
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-colors duration-300 ${
          isRecording
            ? "bg-brand-600 text-white shadow-brand-500/50"
            : "bg-white text-brand-600 dark:bg-card dark:text-brand-500 dark:border dark:border-border"
        }`}
        aria-label={isRecording ? "Hentikan Rekaman" : "Mulai Rekaman"}
      >
        <Mic className={`h-10 w-10 ${isRecording ? "animate-pulse" : ""}`} />
      </motion.button>
    </div>
  );
}
