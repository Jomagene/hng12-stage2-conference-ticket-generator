import PageInfos from './PageInfos';
import TicketNumber from './TicketNumber';
import TicketType from './TicketType';

const PageContent = () => {
  return (
    <div className="bg-[#08252B] md:border md:p-6 border-[#0E464F] flex flex-col gap-8 rounded-[32px]">
      <PageInfos />
      <div className="h-1 bg-[#07373F]"></div>
      <TicketType />
      <TicketNumber />
    </div>
  );
};
export default PageContent;
