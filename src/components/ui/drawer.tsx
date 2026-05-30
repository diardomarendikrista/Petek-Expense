"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Handle mobile hardware back button dengan menambahkan hash URL
      window.history.pushState(
        { drawerOpen: true },
        "",
        window.location.pathname + window.location.search + "#drawer",
      );

      const handlePopState = () => {
        onClose();
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("popstate", handlePopState);

        // If closed via UI button (not hardware back), clean up the history state
        if (window.history.state?.drawerOpen) {
          window.history.back();
        }
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex justify-center pointer-events-none">
          <div className="w-full max-w-md relative pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={cn(
                "fixed bottom-0 z-[100] mt-24 flex max-h-[90vh] w-full max-w-md flex-col rounded-t-[2rem] bg-background border-t border-border shadow-2xl pb-safe",
                className,
              )}
            >
              {/* Drag Handle (Visual only for now) */}
              <div className="flex w-full items-center justify-center pt-3 pb-2">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 pt-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto px-6 pb-8">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
