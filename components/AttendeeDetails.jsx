'use client';
import { useState } from 'react';
import { useTicket } from '@/context/TicketContext';

import PhotoUploader from './PhotoUploader';
import TextInputs from './TextInputs';
import toast, { Toaster } from 'react-hot-toast';

const AttendeeDetails = () => {
  const { ticket, updateTicket } = useTicket();
  const [file, setFile] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(ticket.profileAvatar);

  const handleUpload = async () => {
    if (!file && !uploadedUrl)
      return toast.error('Please select an image first.');
    setUploading(true);
    const toastId = toast.loading('Uploading picture...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'profile_upload');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/ds0sysk6d/image/upload',
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      setUploadedUrl(data.secure_url);

      updateTicket('profileAvatar', data.secure_url);
      toast.dismiss(toastId);
      toast.success('Picture uploaded successfully!', {
        duration: 2000,
        position: 'right-center',
      });
      setTimeout(() => {
        toast(
          'Click on the button Get My free Ticket again to see your designed ticket',
          {
            icon: '🤩',
          }
        );
      }, 4000);
    } catch (error) {
      console.error('Upload failed :', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#08252B] md:border md:p-6 border-[#0E464F] flex flex-col gap-8 rounded-[32px]">
      <Toaster position="right-center" />
      <PhotoUploader
        file={file}
        setFile={setFile}
        uploading={uploading}
        uploadedUrl={uploadedUrl}
      />
      <div className="h-1 bg-[#07373F]"></div>
      <TextInputs
        handleUpload={handleUpload}
        file={file}
        uploadedUrl={uploadedUrl}
      />
    </div>
  );
};
export default AttendeeDetails;
