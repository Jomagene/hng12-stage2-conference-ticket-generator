import PageHeader from '@/components/PageHeader';
import TicketReady from '@/components/TicketReady';

export default function PageThree() {
  return (
    <section className="border border-[#197686] bg-[#08252B] md:bg-[#041E23] rounded-3xl sm:rounded-[40px] p-6 md:p-12 flex flex-col gap-8 min-w-[700px] mx-auto">
      <PageHeader title="Ready" step={3} indic="232px" />
      <TicketReady />
    </section>
  );
}
