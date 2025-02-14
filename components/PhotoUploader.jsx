'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

const PhotoUploader = ({ setFile, uploadedUrl }) => {
  const [image, setImage] = useState('');
  const [dragOver, setDragOver] = useState(false);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ')
      document.getElementById('profile-pic').click();
  };

  return (
    <div className="p-6 pb-12 rounded-3xl bg-[#052228] flex flex-col border border-[#07373F] gap-8">
      <p>Upload Profile Photo</p>
      <div className="relative h-[200px]">
        <div className="w-full h-[200px] bg-[#00000033]"></div>
        <Input
          type="file"
          name="profile-pic"
          id="profile-pic"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <Label
          htmlFor="profile-pic"
          tabIndex="0"
          onKeyDown={handleKeyDown}
          className="border-4 border-[#24A0B580] rounded-[32px] bg-[#0E464F] w-60 h-60 overflow-hidden flex flex-col gap-4 justify-center items-center relative top-[-220px] mx-auto btn"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}>
          {image ? (
            <Image
              src={image || uploadedUrl}
              height={240}
              width={240}
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
        </Label>
      </div>
    </div>
  );
};
export default PhotoUploader;
