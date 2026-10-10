import { Users, Phone, Mail, MessageSquare, MoreVertical } from "lucide-react";

const TENANTS = [
  { id: 1, name: "Nguyễn Văn An", room: "Phòng 101", phone: "0901 234 567", email: "an@gmail.com", since: "01/06/2026", contract: "01/06/2027", paid: true },
  { id: 2, name: "Trần Thị Bảo", room: "Phòng 201", phone: "0912 345 678", email: "bao@gmail.com", since: "15/07/2026", contract: "15/07/2027", paid: true },
  { id: 3, name: "Lê Minh Cường", room: "Phòng 301", phone: "0923 456 789", email: "cuong@gmail.com", since: "01/08/2026", contract: "01/08/2027", paid: false },
  { id: 4, name: "Phạm Thị Diệu", room: "Phòng 103", phone: "0934 567 890", email: "dieu@gmail.com", since: "20/08/2026", contract: "20/08/2027", paid: true },
  { id: 5, name: "Hoàng Văn Em", room: "Phòng 203", phone: "0945 678 901", email: "em@gmail.com", since: "10/09/2026", contract: "10/09/2027", paid: false },
];

export const LandlordTenantsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-amber-600 dark:text-amber-400" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Danh Sách Khách Thuê</h1>
        </div>
        <p className="text-sm text-zinc-500">{TENANTS.length} khách đang thuê · {TENANTS.filter(t => !t.paid).length} chưa đóng tiền tháng này</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {TENANTS.map((t) => (
          <div key={t.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {t.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full">{t.room}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.paid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"}`}>
                  {t.paid ? "Đã đóng tiền" : "Chưa đóng tiền"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-zinc-500"><Phone size={10} /> {t.phone}</span>
                <span className="flex items-center gap-1 text-[11px] text-zinc-500"><Mail size={10} /> {t.email}</span>
                <span className="text-[11px] text-zinc-400">Thuê từ {t.since} · HĐ đến {t.contract}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors cursor-pointer">
                <MessageSquare size={14} />
              </button>
              <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer">
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
