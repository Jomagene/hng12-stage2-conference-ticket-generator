'use client';
import { useState } from 'react';
import PhotoUploader from './PhotoUploader';
import TextInputs from './TextInputs';

const AttendeeDetails = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select an image first.');
    setUploading(true);

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

      alert('Upload successful!');
    } catch (error) {
      console.error('Upload failed :', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#08252B] md:border md:p-6 border-[#0E464F] flex flex-col gap-8 rounded-[32px]">
      <PhotoUploader file={file} setFile={setFile} uploading={uploading} />
      <div className="h-1 bg-[#07373F]"></div>
      <TextInputs
        handleUpload={handleUpload}
        file={file}
        uploading={uploading}
      />
    </div>
  );
};
export default AttendeeDetails;
