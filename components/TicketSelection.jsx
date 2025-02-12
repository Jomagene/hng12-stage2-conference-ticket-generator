import NavigationBtn from './NavigationBtn';
import EventInfos from './EventInfos';
import TicketNumber from './TicketNumber';
import TicketType from './TicketType';

const TicketSelection = () => {
  return (
    <div className="bg-[#08252B] md:border md:p-6 border-[#0E464F] flex flex-col gap-8 rounded-[32px]">
      <EventInfos />
      <div className="h-1 bg-[#07373F]"></div>
      <TicketType />
      <TicketNumber />
      <NavigationBtn
        btn1="Cancel"
        btn2="Next"
        link1="/"
        link2="/attendee-details"
      />
    </div>
  );
};
export default TicketSelection;
