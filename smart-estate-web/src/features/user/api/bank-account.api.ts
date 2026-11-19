import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/axios";

/** Tài khoản nhận tiền. Backend chỉ trả 4 số cuối, số đầy đủ được mã hóa khi lưu. */
export interface BankAccount {
  bankName: string;
  accountHolder: string;
  accountLast4: string;
  updatedAt: string;
}

export interface UpsertBankAccountInput {
  bankName: string;
  /** 6–19 chữ số */
  accountNumber: string;
  accountHolder: string;
}

const KEY = ["users", "me", "bank-account"] as const;

/** GET /users/me/bank-account. Chưa khai báo (404) thì trả null thay vì lỗi. */
const fetchBankAccount = async (): Promise<BankAccount | null> => {
  try {
    return (await api.get<BankAccount>("/users/me/bank-account")).data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
};

export const useBankAccount = (enabled = true) =>
  useQuery({ queryKey: KEY, queryFn: fetchBankAccount, enabled });

/** PUT /users/me/bank-account: khai mới hoặc ghi đè. */
export const useSaveBankAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertBankAccountInput) =>
      api.put<BankAccount>("/users/me/bank-account", input).then((r) => r.data),
    onSuccess: (saved) => qc.setQueryData(KEY, saved),
  });
};
