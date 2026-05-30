"use client";

import { Drawer } from "./ui/drawer";
import { Button } from "./ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  isError?: boolean;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "OK",
  isError = false,
}: AlertModalProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{description}</p>
        
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            className="w-full"
            variant={isError ? "destructive" : "default"}
            onClick={onClose}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
