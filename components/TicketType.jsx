const TicketType = () => {
  return (
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
          { price: '$150', access: 'VIP ACCESS', spots: '20/52', value: 'vip' },
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
              defaultChecked={index === 0}
              type="radio"
              name="ticket"
              value={option.value}
              className="hidden ticket-option-input"
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
  );
};

export default TicketType;
