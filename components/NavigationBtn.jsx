import Link from 'next/link';

const NavigationBtn = ({ btn1, btn2, link1, link2 }) => {
  return (
    <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
      {link1 ? (
        <Link
          href={link1}
          className="py-3 px-6 rounded-[8px] border border-[#24A0B5] font-[JejuMyeongjo] text-[#24A0B5] flex-[1] flex items-center justify-center">
          <button>{btn1}</button>
        </Link>
      ) : (
        <button className="py-3 px-6 rounded-[8px] border border-[#24A0B5] font-[JejuMyeongjo] text-[#24A0B5] flex-[1]">
          {btn1}
        </button>
      )}

      <Link
        href={link2}
        className="py-3 px-6 rounded-[8px] bg-[#24A0B5] font-[JejuMyeongjo] text-white flex-[1] flex items-center justify-center">
        <button>{btn2}</button>
      </Link>
    </div>
  );
};
export default NavigationBtn;
