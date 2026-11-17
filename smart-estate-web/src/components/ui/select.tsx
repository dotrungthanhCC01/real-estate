import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Hướng mở danh sách: "bottom" (mặc định) hoặc "top" khi ô nằm sát đáy khung */
  placement?: "bottom" | "top";
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  className,
  placement = "bottom",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative w-full text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-[13px] font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all outline-none"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className={cn(
            "absolute left-0 right-0 max-h-60 overflow-y-auto rounded-lg bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-zinc-700/80 shadow-2xl z-50 p-1.5 animate-in fade-in duration-150",
            placement === "top" ? "bottom-full mb-1.5 slide-in-from-bottom-1" : "top-full mt-1.5 slide-in-from-top-1"
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-sm text-[12.5px] font-medium transition-colors text-left",
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
