import PhotoUploader from './PhotoUploader';
import TextInputs from './TextInputs';

const AttendeeDetails = () => {
  return (
    <div className="bg-[#08252B] md:border md:p-6 border-[#0E464F] flex flex-col gap-8 rounded-[32px]">
      <PhotoUploader />
      <div className="h-1 bg-[#07373F]"></div>
      <TextInputs />
    </div>
  );
};
export default AttendeeDetails;
