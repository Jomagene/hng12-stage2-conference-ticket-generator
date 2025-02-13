import EventInfos from './EventInfos';
import TicketForm from './TicketForm';

const TicketSelection = () => {
  return (
    <div className="bg-[#08252B] md:border md:p-6 border-[#0E464F] flex flex-col gap-8 rounded-[32px]">
      <EventInfos />
      <div className="h-1 bg-[#07373F]"></div>

      <TicketForm />
    </div>
  );
};
export default TicketSelection;
