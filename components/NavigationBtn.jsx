const NavigationBtn = () => {
  return (
    <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
      <button className="py-3 px-6 rounded-[8px] border border-[#24A0B5] font-[JejuMyeongjo] text-[#24A0B5] flex-[1]">
        Cancel
      </button>
      <button className="py-3 px-6 rounded-[8px] bg-[#24A0B5] font-[JejuMyeongjo] text-white flex-[1]">
        Next
      </button>
    </div>
  );
};
export default NavigationBtn;
