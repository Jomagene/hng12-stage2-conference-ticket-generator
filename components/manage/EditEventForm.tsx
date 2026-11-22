'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { manageHref } from '@/config/site';
import { updateEventAction } from '@/lib/server/actions';
import { EventForm } from './EventForm';
import type { EventFormValues, EventInput } from '@/lib/types';

export function EditEventForm({ slug, defaultValues }: { slug: string; defaultValues: EventFormValues }) {
  const router = useRouter();

  async function handleSubmit(values: EventInput) {
    const result = await updateEventAction(slug, values);
    if (result.ok) {
      toast.success('Event updated');
      router.push(manageHref(slug));
    }
    return result;
  }

  return <EventForm mode="edit" defaultValues={defaultValues} onSubmit={handleSubmit} />;
}
