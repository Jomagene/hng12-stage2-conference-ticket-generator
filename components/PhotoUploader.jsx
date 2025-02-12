import Image from 'next/image';

const PhotoUploader = () => {
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
        />
        <label
          htmlFor="profile-pic"
          className="border-4 border-[#24A0B580] rounded-[32px] bg-[#0E464F] w-60 h-60 p-6 flex flex-col gap-4 justify-center items-center relative top-[-220px] mx-auto">
          <Image
            src="/cloud-download.png"
            height={32}
            width={32}
            alt="cloud download icon"
          />
          <p className="text-center">Drag & drop or click to Upload</p>
        </label>
      </div>
    </div>
  );
};
export default PhotoUploader;
