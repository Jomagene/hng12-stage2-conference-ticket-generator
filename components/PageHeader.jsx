const PageHeader = ({ title, step, indic }) => {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl sm:text-[32px] font-[JejuMyeongjo] min-w-80">
          {title}
        </h1>
        <span className="leading-normal">Step {step}/3</span>
      </div>
      <div className="h-1 bg-[#0E464F] flex rounded-[5px]">
        <span
          className={`h-1 inline-block bg-[#24A0B5] !w-[${indic}] rounded-[5px]`}></span>
      </div>
    </header>
  );
};
export default PageHeader;
