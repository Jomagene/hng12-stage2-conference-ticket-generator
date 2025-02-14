'use client';
import { createContext, useState, useContext, useEffect } from 'react';

// Create context
const TicketContext = createContext();

// Provider component
export const TicketProvider = ({ children }) => {
  // Load ticket data from localStorage or set default values
  const [ticket, setTicket] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTicket = localStorage.getItem('ticket');
      return storedTicket
        ? JSON.parse(storedTicket)
        : {
            ticketInfosType: 'free',
            ticketQuantity: 1,
            profileName: '',
            profileEmail: '',
            profileAvatar: '',
            specialRequest: '',
          };
    }
    return {
      ticketInfosType: 'free',
      ticketQuantity: 1,
      profileName: '',
      profileEmail: '',
      profileAvatar: '',
      specialRequest: '',
    };
  });

  // Function to update any profile field
  const updateTicket = (key, val) => {
    setTicket((prev) => {
      const updatedTicket = { ...prev, [key]: val };
      if (typeof window !== 'undefined') {
        localStorage.setItem('ticket', JSON.stringify(updatedTicket));
      }
      return updatedTicket;
    });
  };

  // Sync state with localStorage when ticket changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ticket', JSON.stringify(ticket));
    }
  }, [ticket]);

  return (
    <TicketContext.Provider value={{ ticket, updateTicket }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
