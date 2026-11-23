"use client";

import { Check, X, EyeOff } from "lucide-react";
import type { ManagedProperty } from "@/features/listings/api/listings.api";
import { cn } from "@/lib/utils";

/**
 * Tiến trình đăng tin — 3 bước: Đăng tin → Chờ duyệt → Hiển thị công khai.
 * Tính từ approvalStatus / status của BE.
 */
type StepState = "done" | "current" | "failed" | "todo";

export const buildApprovalSteps = (p: ManagedProperty) => {
  const approved = p.approvalStatus === "APPROVED";
  const rejected = p.approvalStatus === "REJECTED";
  const hidden = p.beStatus === "HIDDEN";

  return [
    { label: "Đăng tin", state: "done" as StepState, note: "Đã gửi" },
    {
      label: rejected ? "Bị từ chối" : approved ? "Đã duyệt" : "Chờ duyệt",
      state: (rejected ? "failed" : approved ? "done" : "current") as StepState,
      note: rejected ? "Sửa tin để gửi duyệt lại" : approved ? "Admin đã duyệt" : "Đang chờ admin duyệt",
    },
    {
      label: hidden ? "Đang ẩn" : "Hiển thị công khai",
      state: (!approved ? "todo" : hidden ? "failed" : "done") as StepState,
      note: !approved ? "Sau khi được duyệt" : hidden ? "Bạn đang ẩn tin" : "Người thuê tìm thấy được",
    },
  ];
};

const DOT: Record<StepState, string> = {
  done: "bg-[#121212] text-[#F9F8F6] dark:bg-[#F9F8F6] dark:text-[#121212]",
  current: "bg-[#F0E5CE] text-[#765A22] ring-2 ring-[#C9A253] dark:bg-[#352C1A] dark:text-[#DCC28E]",
  failed: "bg-[#F1DDD5] text-[#86402F] dark:bg-[#38221C] dark:text-[#E3AE9F]",
  todo: "bg-secondary text-muted-foreground",
};
const LABEL: Record<StepState, string> = {
  done: "text-foreground",
  current: "text-[#765A22] dark:text-[#DCC28E] font-semibold",
  failed: "text-[#86402F] dark:text-[#E3AE9F] font-semibold",
  todo: "text-muted-foreground",
};

/** 3 chấm nối nhau + nhãn; `showNotes` hiện thêm dòng giải thích dưới mỗi bước */
export const ApprovalStepper = ({ p, showNotes = false, className }: { p: ManagedProperty; showNotes?: boolean; className?: string }) => {
  const steps = buildApprovalSteps(p);
  return (
    <ol className={cn("grid grid-cols-3 w-[330px] max-w-full", className)}>
      {steps.map((s, i) => {
        const Icon = s.state === "failed" ? (s.label === "Đang ẩn" ? EyeOff : X) : Check;
        return (
          <li key={i} className="relative flex flex-col items-center text-center px-1">
            {/* Đường nối tới bước kế tiếp */}
            {i < steps.length - 1 && (
              <span
                className={cn("absolute top-3 left-1/2 h-px w-full", steps[i + 1].state === "todo" ? "bg-border" : "bg-foreground/50")}
              />
            )}
            <span className={cn("relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold", DOT[s.state])}>
              {s.state === "todo" || s.state === "current" ? i + 1 : <Icon className="w-3.5 h-3.5" />}
            </span>
            <span className={cn("mt-1.5 text-[11.5px] leading-tight", LABEL[s.state])}>{s.label}</span>
            {showNotes && <span className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">{s.note}</span>}
          </li>
        );
      })}
    </ol>
  );
};
