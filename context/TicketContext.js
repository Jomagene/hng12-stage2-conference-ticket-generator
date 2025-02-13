'use client';
import { createContext, useState, useContext } from 'react';

// Create context
const TicketContext = createContext();

// Provider component
export const TicketProvider = ({ children }) => {
  const [ticket, setTicket] = useState({
    ticketInfosType: '',
    ticketQuantity: 0,
    profileName: '',
    profileEmail: '',
    profileAvatar: '',
    specialRequest: '',
  });

  // Function to update any profile field
  const updateTicket = (key, val) => {
    setTicket((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <TicketContext.Provider value={{ ticket, updateTicket }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
