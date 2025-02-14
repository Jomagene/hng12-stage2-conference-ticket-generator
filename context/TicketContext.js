'use client';
import { createContext, useState, useContext, useEffect, useMemo } from 'react';

const DEFAULT_TICKET = {
  ticketInfosType: 'free',
  ticketQuantity: 1,
  profileName: '',
  profileEmail: '',
  profileAvatar: '',
  specialRequest: '',
};

const TicketContext = createContext(null);

const loadStoredTicket = () => {
  if (typeof window === 'undefined') return DEFAULT_TICKET;
  try {
    const storedTicket = localStorage.getItem('ticket');
    return storedTicket ? JSON.parse(storedTicket) : DEFAULT_TICKET;
  } catch (error) {
    console.error('Error loading ticket from localStorage:', error);
    return DEFAULT_TICKET;
  }
};

export const TicketProvider = ({ children }) => {
  const [ticket, setTicket] = useState(loadStoredTicket);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ticket', JSON.stringify(ticket));
    }
  }, [ticket]);

  const updateTicket = (key, val) => {
    setTicket((prev) => ({ ...prev, [key]: val }));
  };

  const contextValue = useMemo(() => ({ ticket, updateTicket }), [ticket]);

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  return context;
};
