"use client";

import { useState } from "react";
import { Plus, PenTool, CheckCircle2, Clock, Wrench, Star } from "lucide-react";
import { useTickets, type TicketCategory } from "@/features/tickets/context/TicketContext";
import { useAuth } from "@/features/auth/context/AuthContext";

const MY_RENTALS = [
  {
    id: "p-001",
    title: "Phòng trọ Bình Thạnh 20m²",
    landlordId: "l-001",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
    address: "Bình Thạnh, Hồ Chí Minh",
    price: "3.500.000đ/tháng",
  }
];

export const MyPropertiesPage = () => {
  const { user } = useAuth();
  const { tickets, createTicket, rateTicket } = useTickets();
  const myTickets = tickets.filter(t => t.userId === user?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState("");
  const [category, setCategory] = useState<TicketCategory>("Điện");
  const [desc, setDesc] = useState("");
  
  // Rating Modal state
  const [ratingModalId, setRatingModalId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = MY_RENTALS.find(p => p.id === selectedPropId);
    if (!prop || !user) return;
    
    createTicket({
      userId: user.id,
      propertyId: prop.id,
      propertyTitle: prop.title,
      landlordId: prop.landlordId,
      category,
      description: desc,
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80", // Mock
    });
    setIsModalOpen(false);
    setDesc("");
  };

  const handleRate = () => {
    if (ratingModalId) {
      rateTicket(ratingModalId, rating);
      setRatingModalId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* ── Heading ── */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Quản lý Bất động sản</h1>
        <p className="text-sm text-zinc-500">Xem các BĐS bạn đang thuê và gửi yêu cầu hỗ trợ tới Chủ nhà.</p>
      </div>

      {/* ── BĐS Đang Thuê ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Phòng đang thuê</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MY_RENTALS.map(prop => (
            <div key={prop.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm group">
              <div className="aspect-video relative">
                <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">ĐANG THUÊ</div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[14px] text-zinc-900 dark:text-white truncate mb-1">{prop.title}</h3>
                <p className="text-[12px] text-zinc-500 mb-2 truncate">{prop.address}</p>
                <p className="font-extrabold text-[14px] text-zinc-900 dark:text-white mb-4">{prop.price}</p>
                <button
                  onClick={() => { setSelectedPropId(prop.id); setIsModalOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors text-[13px] font-semibold"
                >
                  <Wrench size={14} /> Tạo yêu cầu sửa chữa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lịch sử Yêu cầu ── */}
      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Yêu cầu bảo trì / sửa chữa</h2>
        
        {myTickets.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">Bạn chưa có yêu cầu nào.</p>
        ) : (
          <div className="space-y-3">
            {myTickets.map(ticket => (
              <div key={ticket.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <PenTool className="text-zinc-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px] text-zinc-900 dark:text-white mb-1">
                      {ticket.category} — {ticket.propertyTitle}
                    </h4>
                    <p className="text-[12px] text-zinc-500 line-clamp-1">{ticket.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12}/> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.appointmentDate && (
                        <span className="text-blue-500">Lịch thợ đến: {ticket.appointmentDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                    ticket.status === 'Mới tạo' ? 'bg-zinc-100 text-zinc-600' :
                    ticket.status === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'Chờ nghiệm thu' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ticket.status}
                  </span>
                  
                  {ticket.status === 'Chờ nghiệm thu' && (
                    <button
                      onClick={() => setRatingModalId(ticket.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-[12px] font-bold hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle2 size={14}/> Nghiệm thu
                    </button>
                  )}
                  {ticket.status === 'Hoàn thành' && ticket.rating && (
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: ticket.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Tạo yêu cầu ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Tạo yêu cầu sửa chữa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-800"><Plus className="rotate-45" size={20}/></button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-zinc-700 mb-1.5">Danh mục</label>
                <select value={category} onChange={e => setCategory(e.target.value as TicketCategory)} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm outline-none">
                  <option>Điện</option>
                  <option>Nước</option>
                  <option>Nội thất</option>
                  <option>Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-zinc-700 mb-1.5">Mô tả sự cố</label>
                <textarea required rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả chi tiết vấn đề..." className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-zinc-700 mb-1.5">Ảnh/Video hiện trạng (Tùy chọn)</label>
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:bg-zinc-50">
                  <Plus size={20} />
                  <span className="text-[11px] mt-1">Bấm để tải ảnh lên</span>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800">
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Đánh giá ── */}
      {ratingModalId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Đánh giá sửa chữa</h3>
            <p className="text-[12px] text-zinc-500 mb-6">Bạn đánh giá tốc độ xử lý của chủ nhà thế nào?</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className={`transition-colors ${star <= rating ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}`}>
                  <Star size={32} fill="currentColor" />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRatingModalId(null)} className="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-[13px] font-bold">Hủy</button>
              <button onClick={handleRate} className="flex-1 py-2 rounded-xl bg-green-500 text-white text-[13px] font-bold hover:bg-green-600">Hoàn tất</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
