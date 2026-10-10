import { useState } from "react";
import { PenTool, CheckCircle2, Clock, Calendar, ChevronRight } from "lucide-react";
import { useTickets, type Ticket } from "@/features/tickets/context/TicketContext";
import { useAuth } from "@/features/auth/context/AuthContext";

export const LandlordTicketsPage = () => {
  const { user } = useAuth();
  const { tickets, updateTicketStatus } = useTickets();
  const myTickets = tickets.filter(t => t.landlordId === user?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");

  const handleAcceptTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket && appointmentDate) {
      updateTicketStatus(selectedTicket.id, "Đang xử lý", appointmentDate);
      setIsModalOpen(false);
      setSelectedTicket(null);
      setAppointmentDate("");
    }
  };

  const handleCompleteRepair = (ticketId: string) => {
    updateTicketStatus(ticketId, "Chờ nghiệm thu");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* ── Heading ── */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Yêu cầu bảo trì / sửa chữa</h1>
        <p className="text-sm text-zinc-500">Quản lý các yêu cầu hỗ trợ từ người thuê nhà.</p>
      </div>

      {/* ── Danh sách Ticket ── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        {myTickets.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Không có yêu cầu nào</p>
            <p className="text-[13px] text-zinc-500">Mọi thứ đang hoạt động tốt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTickets.map(ticket => (
              <div key={ticket.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <PenTool className="text-zinc-500" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ticket.status === 'Mới tạo' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' :
                        ticket.status === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'Chờ nghiệm thu' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-[12px] font-bold text-zinc-500">{ticket.category}</span>
                    </div>
                    <h4 className="font-bold text-[15px] text-zinc-900 dark:text-white mb-1">
                      {ticket.propertyTitle}
                    </h4>
                    <p className="text-[13px] text-zinc-500 mb-2">Người thuê ID: {ticket.userId}</p>
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800/50">
                      <p className="text-[13px] text-zinc-700 dark:text-zinc-300">"{ticket.description}"</p>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-400 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12}/> Ngày gửi: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.appointmentDate && (
                        <span className="flex items-center gap-1 text-blue-500"><Calendar size={12}/> Lịch hẹn: {ticket.appointmentDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-2 shrink-0 md:min-w-[140px]">
                  {ticket.status === 'Mới tạo' && (
                    <button
                      onClick={() => { setSelectedTicket(ticket); setIsModalOpen(true); }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-[13px] font-bold hover:opacity-90 transition-opacity"
                    >
                      Tiếp nhận <ChevronRight size={14}/>
                    </button>
                  )}
                  {ticket.status === 'Đang xử lý' && (
                    <button
                      onClick={() => handleCompleteRepair(ticket.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl text-[13px] font-bold hover:bg-blue-600 transition-colors"
                    >
                      Đã sửa xong <CheckCircle2 size={14}/>
                    </button>
                  )}
                  {ticket.status === 'Chờ nghiệm thu' && (
                    <div className="text-center px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-xl text-[12px] font-bold border border-amber-200 dark:border-amber-800">
                      Đang chờ khách duyệt
                    </div>
                  )}
                  {ticket.status === 'Hoàn thành' && (
                    <div className="text-center px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-xl text-[12px] font-bold border border-green-200 dark:border-green-800">
                      Đã hoàn thành {ticket.rating ? `(${ticket.rating}★)` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Tiếp Nhận ── */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Tiếp nhận yêu cầu</h3>
            <p className="text-[13px] text-zinc-500 mb-5">Nhập ngày giờ thợ sẽ đến sửa chữa cho khách.</p>
            
            <form onSubmit={handleAcceptTicket} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-zinc-700 mb-1.5">Lịch hẹn (Ngày / Giờ)</label>
                <input 
                  type="datetime-local" 
                  required
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm outline-none focus:border-zinc-400" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-200 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
