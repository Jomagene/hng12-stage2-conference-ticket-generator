'use client';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import TransitionLink from '@/lib/TransitionLink';
import { useTicket } from '@/context/TicketContext';

const NavigationBtn = ({
  btn1,
  btn2,
  link1,
  link2,
  isDisabled,
  handleDownload,
  handleUpload,
  final,
}) => {
  const router = useRouter();
  return (
    <div className="flex gap-4 sm:gap-6 flex-col-reverse sm:flex-row">
      {!final ? (
        <TransitionLink
          href={link1}
          className="py-3 px-6 rounded-[8px] border border-[#24A0B5] fontJeju text-[#24A0B5] flex-[1] flex items-center justify-center btn">
          <Button tabIndex={-1} className="focus:outline-none focus:ring-0">
            {btn1}
          </Button>
        </TransitionLink>
      ) : (
        <Button
          className="py-3 px-6 rounded-[8px] border border-[#24A0B5] fontJeju text-[#24A0B5] flex-[1] flex items-center justify-center btn"
          onClick={() => {
            localStorage.removeItem('ticket');
            window.location.href = '/';
          }}>
          {btn1}
        </Button>
      )}

      {final ? (
        <Button
          className="py-3 px-6 rounded-[8px] bg-[#24A0B5] fontJeju text-white flex-[1] flex items-center justify-center disabled:opacity-50 btn"
          type="button"
          onClick={handleDownload}>
          {btn2}
        </Button>
      ) : (
        <Button
          className="py-3 px-6 rounded-[8px] bg-[#24A0B5] fontJeju text-white flex-[1] flex items-center justify-center disabled:opacity-50 btn"
          type="submit"
          onClick={isDisabled ? handleUpload : () => router.push(link2)}>
          {btn2}
        </Button>
      )}
    </div>
  );
};
export default NavigationBtn;
