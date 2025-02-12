const EventInfos = () => {
  return (
    <div className="px-6 py-4 md:py-6 rounded-3xl bg-ticket-info flex flex-col items-center gap-2">
      <p className="text-5xl md:text-[62px] road-rage-regular text-center">
        Techember Fest ”25
      </p>
      <p className="max-w-[340px] text-center text-[14px] md:text-base">
        Join us for an unforgettable experience at [Event Name]! Secure your
        spot now.
      </p>
      <p className="flex flex-col md:flex-row">
        <span>📍 [Event Location]</span>
        <span className="hidden md:inline-block px-4">| |</span>
        <span>March 15, 2025 | 7:00 PM</span>
      </p>
    </div>
  );
};
export default EventInfos;
