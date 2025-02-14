'use client';
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

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
    <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
      {link1 ? (
        <Link
          href={link1}
          className="py-3 px-6 rounded-[8px] border border-[#24A0B5] fontJeju text-[#24A0B5] flex-[1] flex items-center justify-center">
          <Button>{btn1}</Button>
        </Link>
      ) : (
        <button className="py-3 px-6 rounded-[8px] border border-[#24A0B5] fontJeju text-[#24A0B5] flex-[1]">
          {btn1}
        </button>
      )}
      {final ? (
        <Button
          className="py-3 px-6 rounded-[8px] bg-[#24A0B5] fontJeju text-white flex-[1] flex items-center justify-center disabled:opacity-50"
          type="button"
          onClick={handleDownload}>
          {btn2}
        </Button>
      ) : (
        <Button
          className="py-3 px-6 rounded-[8px] bg-[#24A0B5] fontJeju text-white flex-[1] flex items-center justify-center disabled:opacity-50"
          type="submit"
          onClick={isDisabled ? handleUpload : () => router.push(link2)}>
          {btn2}
        </Button>
      )}
    </div>
  );
};
export default NavigationBtn;
