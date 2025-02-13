'use client';
import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NavigationBtn from './NavigationBtn';

const TicketForm = () => {
  const [ticketType, setTicketType] = React.useState('free');
  const [ticketNumber, setTicketNumber] = React.useState(1);

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Selected Ticket: ${ticketType}, Quantity: ${ticketNumber}`);
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span>Select Ticket Type:</span>
        <div className="flex flex-col sm:flex-row justify-between gap-6 p-4 border border-[#07373F] bg-[#052228] rounded-3xl">
          {[
            {
              price: 'Free',
              access: 'REGULAR ACCESS',
              spots: '20/52',
              value: 'free',
            },
            {
              price: '$150',
              access: 'VIP ACCESS',
              spots: '20/52',
              value: 'vip',
            },
            {
              price: '$150',
              access: 'VVIP ACCESS',
              spots: '20/52',
              value: 'vvip',
            },
          ].map((option, index) => (
            <label
              key={index}
              className="border-[2px] border-[#197685] rounded-xl w-full sm:w-[31.5%] overflow-hidden hover:cursor-pointer">
              <input
                checked={ticketType === option.value}
                type="radio"
                name="ticket"
                value={option.value}
                className="hidden ticket-option-input"
                onChange={() => setTicketType(option.value)}
              />
              <div className="ticket-option-card h-full p-3 flex flex-col gap-3">
                <p className="font-semibold text-2xl">{option.price}</p>
                <div>
                  <p className="text-[#FAFAFA]">{option.access}</p>
                  <p className="text-[#D9D9D9] text-sm">{option.spots}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p>Number of Tickets</p>
        <Select onValueChange={setTicketNumber}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="1" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Numbers</SelectLabel>
              <SelectItem value={1}>1</SelectItem>
              <SelectItem value={2}>2</SelectItem>
              <SelectItem value={3}>3</SelectItem>
              <SelectItem value={4}>4</SelectItem>
              <SelectItem value={5}>5</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <NavigationBtn
        btn1="Cancel"
        btn2="Next"
        link1="/"
        link2="/attendee-details"
        isDisabled={false}
      />
    </form>
  );
};

export default TicketForm;
