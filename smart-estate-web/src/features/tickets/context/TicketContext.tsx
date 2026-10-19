"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type TicketStatus = "Mới tạo" | "Đang xử lý" | "Chờ nghiệm thu" | "Hoàn thành";
export type TicketCategory = "Điện" | "Nước" | "Nội thất" | "Khác";

export interface Ticket {
  id: string;
  userId: string;
  propertyId: string;
  propertyTitle: string; // Tên BĐS (mock)
  landlordId: string;
  category: TicketCategory;
  description: string;
  imageUrl?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  appointmentDate?: string; // Lịch hẹn thợ
  rating?: number;
}

interface TicketContextValue {
  tickets: Ticket[];
  createTicket: (ticket: Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt">) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, appointmentDate?: string) => void;
  rateTicket: (ticketId: string, rating: number) => void;
}

const TicketContext = createContext<TicketContextValue | null>(null);

const STORAGE_KEY = "smart_estate_tickets";

// Mock DB mặc định nếu chưa có
const INITIAL_TICKETS: Ticket[] = [
  {
    id: "t-001",
    userId: "u-001",
    propertyId: "p-001",
    propertyTitle: "Phòng trọ Bình Thạnh 20m²",
    landlordId: "l-001",
    category: "Nước",
    description: "Vòi nước bồn rửa mặt bị rỉ nước liên tục.",
    status: "Mới tạo",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  const createTicket = (ticket: Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt">) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `t-${Date.now()}`,
      status: "Mới tạo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, appointmentDate?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            appointmentDate: appointmentDate || t.appointmentDate,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const rateTicket = (ticketId: string, rating: number) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, rating, status: "Hoàn thành", updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  return (
    <TicketContext.Provider value={{ tickets, createTicket, updateTicketStatus, rateTicket }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};
