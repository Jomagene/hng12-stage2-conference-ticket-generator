'use client';
import FinalTicket from '@/components/FinalTicket';
import NavigationBtn from '@/components/NavigationBtn';
import PageHeader from '@/components/PageHeader';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function PageThree() {
  const handleDownload = async () => {
    const ticketElement = document.getElementById('final-ticket');
    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement);
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'ticket.png';
      link.click();
    } catch (error) {
      toast.error('Error downloading ticket:', error);
    }
  };
  return (
    <section className="border border-[#197686] bg-[#08252B] md:bg-[#041E23] rounded-3xl sm:rounded-[40px] p-6 md:p-12 flex flex-col gap-8 md:w-[700px] w-full mx-auto">
      <PageHeader title="Ready" step={3} indic="232px" />

      <div className="flex flex-col items-center gap-3 md:gap-4">
        <h2 className="text-2xl md:text-[32px]">Your Ticket is Booked!</h2>
        <p>Check your email for a copy or you can download</p>
      </div>
      <FinalTicket />
      <NavigationBtn
        btn1="Book another Ticket"
        btn2="Download Ticket"
        link1="/"
        link2="/attendee-details"
        handleDownload={handleDownload}
        final={true}
      />
    </section>
  );
}
