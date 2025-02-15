'use client';
import { useTicket } from '@/context/TicketContext';
import Image from 'next/image';

const FinalTicket = () => {
  const { ticket, updateTicket } = useTicket();
  const {
    ticketInfosType,
    ticketQuantity,
    profileName,
    profileEmail,
    profileAvatar,
    specialRequest,
  } = ticket;

  return (
    <div className="py-8" id="final-ticket">
      <div className="bg-ticket flex flex-col items-center justify-between gap-[20px] h-[600px] w-[300px] m-auto p-[20px] rounded">
        <div className="h-[446px] w-[260px] p-[14px] border border-[#24A0B5] rounded-2xl bg-dark-ticket flex flex-col gap-[20px]">
          <div>
            <p className="text-[34px] fontRage text-center leading-none">
              Techember Fest ”25
            </p>
            <p className="flex flex-col items-center p-1 gap-1 text-[10px]">
              <span>📍 04 Rumens road, Ikoyi, Lagos</span>
              <span>📅 March 15, 2025 | 7:00 PM</span>
            </p>
          </div>
          <div className="w-[140px] h-[140px] mx-auto rounded-xl img-container overflow-hidden">
            <Image
              src={profileAvatar}
              width={140}
              height={140}
              alt="profile avatar"
              className="object-cover"
            />
          </div>
          <div className="p-1 grid the-template h-40 w-[232px] bg-[#08343C] border border-[#133D44] rounded-[8px]">
            <div className="p-1 flex flex-col gap-1 border-r border-[#12464E]">
              <span className="text-[10px] opacity-[0.33]">
                Enter your name
              </span>
              <p className="text-xs font-bold">{profileName}</p>
            </div>
            <div className="p-1 flex flex-col gap-1">
              <span className="text-[10px] opacity-[0.33]">
                Enter your email *
              </span>
              <p className="text-xs font-bold break-all overflow-y-clip">
                {profileEmail}
              </p>
            </div>
            <div className="p-1 flex flex-col gap-1 border-t border-r border-[#12464E]">
              <span className="text-[10px] opacity-[0.33]">Ticket Type </span>
              <p className="text-xs font-bold">{ticketInfosType}</p>
            </div>
            <div className="p-1 flex flex-col gap-1 border-t border-[#12464E]">
              <span className="text-[10px] opacity-[0.33]">Ticket for :</span>
              <p className="text-xs font-bold">{ticketQuantity}</p>
            </div>
            <div className="last p-2 flex flex-col gap-1 border-t border-[#12464E]">
              <span className="text-[10px] opacity-[0.33]">
                Special request
              </span>
              <p className="text-[10px] overflow-y-clip break-all">
                {specialRequest}
              </p>
            </div>
          </div>
        </div>
        <Image src="/BarCode.png" width={236} height={68} alt="code bar" />
      </div>
    </div>
  );
};
export default FinalTicket;
