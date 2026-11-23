"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";
import { PostListingForm, type PostListingResult } from "@/features/landlord/components/PostListingForm";

/** Trang /landlord/post — cùng form với modal "Đăng tin" (dùng khi mở link trực tiếp). */
export const LandlordPostPage = () => {
  const [result, setResult] = useState<PostListingResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  if (result) {
    return (
      <div className="max-w-xl mx-auto mt-16 rounded-[28px] bg-card px-8 py-10 text-center">
        <span className="mx-auto w-16 h-16 rounded-full bg-[#E2EADD] dark:bg-[#263022] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#3E5638] dark:text-[#B7CCAD]" />
        </span>
        <h1 className="mt-5 text-[22px] font-medium">Đăng tin thành công!</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">Tin sẽ hiển thị công khai sau khi admin duyệt.</p>
        <div className="mt-4 mx-auto w-fit flex items-center gap-2 rounded-full bg-secondary px-4 h-9 text-[12.5px]">
          <Clock3 className="w-4 h-4" /> Chờ admin duyệt
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setFormKey((k) => k + 1);
            }}
            className="px-5 h-11 rounded-full border border-border text-[13px] font-medium cursor-pointer"
          >
            Đăng tin khác
          </button>
          <Link href={`/landlord/rooms?id=${result.listing.id}`} className="px-5 h-11 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center no-underline">
            Xem trong Quản lý sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-[26px] font-medium tracking-tight">Đăng tin cho thuê</h1>
        <p className="text-[13px] text-muted-foreground">Tin mới sẽ được admin duyệt trước khi hiển thị công khai</p>
      </div>
      <PostListingForm key={formKey} onSuccess={setResult} />
    </div>
  );
};
