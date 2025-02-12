import AttendeeDetails from '@/components/AttendeeDetails';
import PageHeader from '@/components/PageHeader';

export default function PageTwo() {
  return (
    <section className="border border-[#197686] bg-[#08252B] md:bg-[#041E23] rounded-3xl sm:rounded-[40px] p-6 md:p-12 flex flex-col gap-8 md:w-[700px] w-full mx-auto">
      <PageHeader title="Attendee Details" step={2} indic="326px" />
      <AttendeeDetails />
    </section>
  );
}
