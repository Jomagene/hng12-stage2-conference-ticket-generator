'use client';
import { useTicket } from '@/context/TicketContext';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import Image from 'next/image';
import NavigationBtn from './NavigationBtn';

const formSchema = z.object({
  emailAdress: z.string().email(),
  attendeeName: z.string().min(1),
  specialRequest: z.string().min(1),
});

const TextInputs = ({ handleUpload, file, uploadedUrl }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailAdress: '',
      attendeeName: '',
      specialRequest: '',
    },
    mode: 'onChange',
  });
  const isFormValid = form.formState.isValid;
  const { ticket, updateTicket } = useTicket();

  const handleSubmit = (data) => {
    if (!updateTicket) {
      console.error('updateTicket function is missing from context');
      return;
    }

    updateTicket('profileName', data.attendeeName);
    updateTicket('profileEmail', data.emailAdress);
    updateTicket('specialRequest', data.specialRequest);

    return true;
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-8">
        <FormField
          control={form.control}
          name="attendeeName"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Enter your name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="emailAdress"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Enter your email *</FormLabel>
                <FormControl>
                  <div className="relative h-12">
                    <Input
                      {...field}
                      type="email"
                      placeholder="hello@avioflagos.io"
                      className="pl-10"
                    />
                    <Image
                      src="/email.svg"
                      width={24}
                      height={24}
                      alt="email icon"
                      className="relative left-3 top-[-38px]"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="specialRequest"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Special request?</FormLabel>
                <FormControl>
                  <Textarea
                    type=""
                    id="textarea"
                    {...field}
                    placeholder="Textarea"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <NavigationBtn
          btn1="Back"
          btn2="Get My Free Ticket"
          link1="/"
          link2="/ticket-ready"
          isDisabled={!isFormValid || uploadedUrl == null || !file}
          handleUpload={handleUpload}
        />
      </form>
    </Form>
  );
};
export default TextInputs;
