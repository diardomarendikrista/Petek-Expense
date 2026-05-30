"use client";

import { Drawer } from "./ui/drawer";
import { Button } from "./ui/button";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import "react-day-picker/style.css";
import { useState, useEffect } from "react";

interface DateRangeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (range: DateRange | undefined) => void;
  initialRange: DateRange | undefined;
}

export function DateRangeDrawer({
  isOpen,
  onClose,
  onApply,
  initialRange,
}: DateRangeDrawerProps) {
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  useEffect(() => {
    if (isOpen) {
      setRange(initialRange);
    }
  }, [isOpen, initialRange]);

  const handleApply = () => {
    onApply(range);
    onClose();
  };

  const handleReset = () => {
    setRange(undefined);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Pilih Rentang Waktu">
      <div className="flex flex-col items-center pb-4 w-full px-2">
        <style>
          {`
            .rdp-root {
              --rdp-accent-color: #10b981; /* brand-500 */
              --rdp-accent-background-color: #10b981;
              --rdp-range_middle-background-color: rgba(16, 185, 129, 0.2);
              --rdp-range_middle-color: #ffffff;
              --rdp-day-color: #e4e4e7;
              width: 100%;
              display: flex;
              justify-content: center;
              margin: 0;
            }
            .rdp-months {
              width: 100%;
              justify-content: center;
            }
            .rdp-day_selected:not(.rdp-range_middle) {
              background-color: var(--rdp-accent-color);
              color: white;
              font-weight: bold;
            }
            .rdp-range_middle {
              background-color: var(--rdp-range_middle-background-color) !important;
              color: white !important;
            }
          `}
        </style>
        
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          locale={id}
          showOutsideDays
          className="bg-card p-3 rounded-xl border border-border mt-2 max-w-full overflow-hidden"
        />

        <div className="w-full mt-6 flex flex-col gap-2">
          <p className="text-sm text-center text-muted-foreground mb-2">
            {range?.from ? (
              <>
                {format(range.from, "d MMM yyyy", { locale: id })}
                {range.to ? ` - ${format(range.to, "d MMM yyyy", { locale: id })}` : ""}
              </>
            ) : (
              "Semua waktu"
            )}
          </p>
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleApply}
            >
              Terapkan
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
