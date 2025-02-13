'use client';
import Image from 'next/image';
import { useState } from 'react';

const PhotoUploader = () => {
  const [image, setImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleImageUpload = (file) => {
    if (file) {
      setFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (event) => {
    handleImageUpload(event.target.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleImageUpload(event.dataTransfer.files[0]);
  };

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
    <div className="p-6 pb-12 rounded-3xl bg-[#052228] flex flex-col border border-[#07373F] gap-8">
      <p>Upload Profile Photo</p>
      <div className="relative h-[200px]">
        <div className="w-full h-[200px] bg-[#00000033]"></div>
        <input
          type="file"
          name="profile-pic"
          id="profile-pic"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <label
          htmlFor="profile-pic"
          className="border-4 border-[#24A0B580] rounded-[32px] bg-[#0E464F] w-60 h-60 overflow-hidden flex flex-col gap-4 justify-center items-center relative top-[-220px] mx-auto"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}>
          {image ? (
            <Image
              src={image}
              height={264}
              width={264}
              alt="Uploaded preview"
            />
          ) : (
            <>
              <Image
                src="/cloud-download.png"
                height={32}
                width={32}
                alt="cloud download icon"
              />
              <p className="text-center">Drag & drop or click to Upload</p>
            </>
          )}
        </label>
      </div>
      <button
        onClick={handleUpload}
        className="bg-[#24A0B5] text-white py-2 px-4 rounded-md disabled:opacity-50"
        disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
      </button>
    </div>
  );
};
export default PhotoUploader;
