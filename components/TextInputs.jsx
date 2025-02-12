'use client';
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

const formSchema = z.object({
  emailAdress: z.string().email(),
});

const TextInputs = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailAdress: '',
    },
  });

  const handleSubmit = () => {};
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="emailAdress"
          render={({ field }) => {
            return (
              <>
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Enter your email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="hello@avioflagos.io"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Enter your name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
              </>
            );
          }}
        />
      </form>
    </Form>
  );
};
export default TextInputs;
