"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, ArrowRight, Plus, AlertTriangle, BadgeCheck } from "lucide-react";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { PostListingForm, type PostListingResult } from "@/features/landlord/components/PostListingForm";
import type { ManagedProperty } from "@/features/listings/api/listings.api";

/**
 * Modal đăng tin / sửa tin của khu chủ trọ.
 *   const { openPostListing, openEditListing } = usePostListing();
 */
interface PostListingContextValue {
  openPostListing: () => void;
  openEditListing: (listing: ManagedProperty) => void;
}

const PostListingContext = createContext<PostListingContextValue | null>(null);

const ResultView = ({
  result,
  editing,
  onClose,
  onAnother,
}: {
  result: PostListingResult;
  editing: boolean;
  onClose: () => void;
  onAnother: () => void;
}) => {
  const router = useRouter();
  const pending = result.listing.approvalStatus === "PENDING_REVIEW";
  return (
    <div className="px-8 py-10 text-center">
      <span className="mx-auto w-16 h-16 rounded-full bg-[#E2EADD] dark:bg-[#263022] flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-[#3E5638] dark:text-[#B7CCAD]" />
      </span>
      <h2 className="mt-5 text-[22px] font-medium tracking-tight">{editing ? "Đã lưu thay đổi!" : "Đăng tin thành công!"}</h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground max-w-md mx-auto">
        {pending
          ? `“${result.listing.title}” đang chờ admin duyệt${editing ? " lại" : ""}. Tin sẽ hiển thị công khai sau khi được duyệt.`
          : `“${result.listing.title}” đã được cập nhật và vẫn đang hiển thị công khai.`}
      </p>
      <div className="mt-5 mx-auto w-fit flex items-center gap-2 rounded-full bg-secondary px-4 h-9 text-[12.5px]">
        {pending ? <Clock3 className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
        Trạng thái: <b className="font-semibold">{pending ? "Chờ admin duyệt" : "Đã duyệt"}</b>
      </div>
      {result.failedImages.length > 0 && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-[#765A22] dark:text-[#DCC28E]">
          <AlertTriangle className="w-4 h-4" /> {result.failedImages.length} ảnh tải lên thất bại: {result.failedImages.join(", ")}
        </p>
      )}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2">
        {editing ? (
          <button type="button" onClick={onClose} className="px-5 h-11 rounded-full border border-border text-[13px] font-medium hover:bg-secondary cursor-pointer">
            Đóng
          </button>
        ) : (
          <button type="button" onClick={onAnother} className="flex items-center gap-1.5 px-5 h-11 rounded-full border border-border text-[13px] font-medium hover:bg-secondary cursor-pointer">
            <Plus className="w-4 h-4" /> Đăng tin khác
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push(`/landlord/listings?id=${result.listing.id}`);
          }}
          className="flex items-center gap-1.5 px-5 h-11 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 cursor-pointer"
        >
          Xem trong Quản lý đăng tin <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const PostListingProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedProperty | null>(null);
  const [result, setResult] = useState<PostListingResult | null>(null);
  // Đổi key để form mới hoàn toàn mỗi lần mở
  const [formKey, setFormKey] = useState(0);

  const openPostListing = useCallback(() => {
    setEditing(null);
    setResult(null);
    setFormKey((k) => k + 1);
    setOpen(true);
  }, []);
  const openEditListing = useCallback((listing: ManagedProperty) => {
    setEditing(listing);
    setResult(null);
    setFormKey((k) => k + 1);
    setOpen(true);
  }, []);
  const close = () => setOpen(false);

  return (
    <PostListingContext.Provider value={{ openPostListing, openEditListing }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen} className="max-w-3xl max-h-[92vh] flex flex-col">
        {result ? (
          <ResultView result={result} editing={!!editing} onClose={close} onAnother={openPostListing} />
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div className="min-w-0">
                <h2 className="text-[18px] font-semibold">{editing ? "Sửa tin đăng" : "Đăng tin cho thuê"}</h2>
                <p className="text-[12.5px] text-muted-foreground truncate">
                  {editing ? editing.title : "Tin mới sẽ được admin duyệt trước khi hiển thị công khai"}
                </p>
              </div>
              <DialogClose onClick={close} />
            </div>
            <PostListingForm key={formKey} initial={editing ?? undefined} scrollBody onCancel={close} onSuccess={setResult} />
          </>
        )}
      </Dialog>
    </PostListingContext.Provider>
  );
};

export const usePostListing = () => {
  const ctx = useContext(PostListingContext);
  if (!ctx) throw new Error("usePostListing must be used within <PostListingProvider>");
  return ctx;
};
