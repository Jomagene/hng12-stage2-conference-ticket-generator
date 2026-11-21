'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { manageHref } from '@/config/site';
import { updateEventAction } from '@/lib/server/actions';
import { EventForm } from './EventForm';

export function EditEventForm({ slug, defaultValues }) {
  const router = useRouter();

  async function handleSubmit(values) {
    const result = await updateEventAction(slug, values);
    if (result.ok) {
      toast.success('Event updated');
      router.push(manageHref(slug));
    }
    return result;
  }

  return <EventForm mode="edit" defaultValues={defaultValues} onSubmit={handleSubmit} />;
}
