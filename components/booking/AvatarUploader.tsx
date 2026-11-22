'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { CloudUpload, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { UPLOAD } from '@/config/upload';
import { UploadError, uploadAvatar, validateImageFile } from '@/lib/upload-avatar';
import { cn } from '@/lib/utils';

interface AvatarUploaderProps {
  title?: string;
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  invalid?: boolean;
  describedBy?: string;
}

export function AvatarUploader({
  title = 'Upload Profile Photo',
  value,
  onChange,
  onUploadingChange,
  invalid,
  describedBy,
}: AvatarUploaderProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  useEffect(() => () => controllerRef.current?.abort(), []);

  function setBusy(busy: boolean) {
    setUploading(busy);
    onUploadingChange?.(busy);
  }

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const url = await uploadAvatar(file, { signal: controller.signal });
      onChange(url);
      toast.success('Photo uploaded');
    } catch (error) {
      if (controller.signal.aborted) return;
      setPreview(null);
      toast.error(error instanceof UploadError ? error.message : 'Upload failed. Please try again.');
    } finally {
      if (controllerRef.current === controller) setBusy(false);
    }
  }

  const imageSrc = preview ?? value;

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-line-subtle bg-well p-6 pb-12">
      <p id={`${inputId}-title`}>{title}</p>
      <div className="relative flex justify-center">
        <div className="absolute inset-x-0 top-1/2 hidden h-[200px] -translate-y-1/2 bg-black/20 md:block" />
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'group relative flex size-60 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-[32px] border-4 border-accent/50 bg-line-muted p-6 text-center transition',
            'hover:shadow-glow focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-well',
            dragOver && 'border-accent bg-accent-soft',
            invalid && !imageSrc && 'border-danger',
          )}>
          <input
            id={inputId}
            type="file"
            accept={UPLOAD.acceptedTypes.join(',')}
            className="sr-only"
            aria-labelledby={`${inputId}-title`}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            disabled={uploading}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = ''; // allow re-picking the same file
            }}
          />

          {imageSrc && <Image src={imageSrc} alt="Your profile photo" fill sizes="240px" className="object-cover" />}

          <span
            className={cn(
              'relative flex flex-col items-center gap-4',
              imageSrc &&
                'absolute inset-0 justify-center bg-black/50 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100',
              uploading && 'opacity-100',
            )}
            aria-live="polite">
            {uploading ? (
              <>
                <LoaderCircle className="size-8 animate-spin" aria-hidden />
                Uploading…
              </>
            ) : (
              <>
                <CloudUpload className="size-8" aria-hidden />
                {imageSrc ? 'Change photo' : 'Drag & drop or click to upload'}
              </>
            )}
          </span>
        </label>
      </div>
    </div>
  );
}
