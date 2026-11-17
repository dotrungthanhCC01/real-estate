"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Check } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { EditableProfile } from "@/features/auth/types/auth.types";
import { CustomSelect } from "@/components/ui/select";
import { VIETNAM_CITIES, OTHER_PROVINCES } from "@/features/properties/data/vietnamLocations";

const CITY_OPTIONS = [...VIETNAM_CITIES.map((c) => c.name), ...OTHER_PROVINCES].map((name) => ({
  value: name,
  label: name,
}));

const parseAddress = (address: string) => {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { district: parts[0], city: parts[parts.length - 1] };
  return { district: "", city: parts[0] ?? "" };
};

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: EditableProfile;
  onSave: (data: EditableProfile) => void;
}

type Errors = Partial<Record<keyof EditableProfile, string>>;

const validate = (v: EditableProfile): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Vui lòng nhập họ tên";
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Email không hợp lệ";
  const digits = (v.phone ?? "").replace(/\s/g, "");
  if (digits && !/^0\d{9,10}$/.test(digits)) e.phone = "Số điện thoại gồm 10–11 số, bắt đầu bằng 0";
  return e;
};

const Field = ({
  icon: Icon,
  label,
  error,
  ...input
}: {
  icon: React.ElementType;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block">
    <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
    <div
      className={`mt-1.5 flex items-center gap-2.5 px-3.5 h-11 rounded-xl border bg-white dark:bg-zinc-900 transition-colors focus-within:border-zinc-900 dark:focus-within:border-white ${
        error ? "border-rose-400" : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
      <input
        {...input}
        className="flex-1 bg-transparent outline-none text-[14px] text-zinc-900 dark:text-white placeholder:text-zinc-400"
      />
    </div>
    {error && <span className="mt-1 block text-[12px] text-rose-500">{error}</span>}
  </label>
);

// Form tách riêng để mỗi lần mở modal là state mới, lấy đúng dữ liệu hiện tại
const EditProfileForm = ({
  initial,
  onSave,
  onClose,
}: {
  initial: EditableProfile;
  onSave: (data: EditableProfile) => void;
  onClose: () => void;
}) => {
  const [values, setValues] = useState<EditableProfile>(initial);
  const [errors, setErrors] = useState<Errors>({});

  // address lưu dạng "Quận, Tỉnh" → tách ra để điền sẵn 2 ô chọn
  const parsed = parseAddress(initial.address ?? "");
  const [city, setCity] = useState(parsed.city);
  const [district, setDistrict] = useState(parsed.district);
  const districtOptions =
    VIETNAM_CITIES.find((c) => c.name === city)?.districts.map((d) => ({ value: d.name, label: d.name })) ?? [];

  const set = (key: keyof EditableProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim(),
      address: city ? (district ? `${district}, ${city}` : city) : "",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <div>
          <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
          <DialogDescription>Thông tin này giúp chủ nhà / môi giới liên hệ khi bạn đặt lịch xem nhà.</DialogDescription>
        </div>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      {/* overflow-visible: để danh sách của ô chọn khu vực không bị cắt trong khung cuộn */}
      <DialogContent className="space-y-4 overflow-visible max-h-none">
        <Field icon={User} label="Họ và tên" value={values.name} onChange={set("name")} error={errors.name} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            icon={Mail}
            label="Email"
            type="email"
            value={values.email}
            onChange={set("email")}
            error={errors.email}
          />
          <Field
            icon={Phone}
            label="Số điện thoại"
            inputMode="tel"
            placeholder="0901 234 567"
            value={values.phone ?? ""}
            onChange={set("phone")}
            error={errors.phone}
          />
        </div>
        {/* Khu vực sinh sống: chọn Tỉnh/Thành rồi Quận/Huyện */}
        <div>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Khu vực sinh sống
          </span>
          <div className="mt-1.5 grid sm:grid-cols-2 gap-3">
            <CustomSelect
              placement="top"
              placeholder="Chọn Tỉnh / Thành phố"
              options={CITY_OPTIONS}
              value={city}
              onChange={(v) => {
                setCity(v);
                setDistrict(""); // đổi tỉnh thì chọn lại quận
              }}
            />
            <CustomSelect
              placement="top"
              placeholder={districtOptions.length ? "Chọn Quận / Huyện" : "Không có dữ liệu quận/huyện"}
              options={districtOptions}
              value={district}
              onChange={setDistrict}
            />
          </div>
        </div>
      </DialogContent>

      <DialogFooter className="justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 h-10 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-5 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13px] font-semibold shadow-md hover:-translate-y-px transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" /> Lưu thay đổi
        </button>
      </DialogFooter>
    </form>
  );
};

export const EditProfileDialog = ({ open, onOpenChange, initial, onSave }: EditProfileDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {open && <EditProfileForm initial={initial} onSave={onSave} onClose={() => onOpenChange(false)} />}
  </Dialog>
);
