import Image from 'next/image';

const Header = () => {
  return (
    <header className="border border-[#197686] px-4 py-3 flex justify-between items-center rounded-xl sm:rounded-3xl fontJeju bg-header w-full max-w-[1200px] m-auto">
      <Image src="/logo.png" alt="This is the logo" width={91.8} height={36} />
      <nav className="h-[34px] hidden md:flex gap-4 items-center text-lg text-[#B3B3B3] p-[10px]">
        <span className="text-[white]">Event</span>
        <span>My Tickets</span>
        <span>About Project</span>
      </nav>
      <button
        className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 
       bg-[white] rounded-xl text-[#0A0C11]">
        <p className="!text-sm sm:!text-base">MY TICKETS</p>
        <img src="/arrow.svg" alt="This is the logo" className="w-4" />
      </button>
    </header>
  );
};
export default Header;
