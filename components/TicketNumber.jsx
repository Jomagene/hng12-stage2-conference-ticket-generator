import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TicketNumber = () => {
  return (
    <div className="flex flex-col gap-2">
      <p>Number of Tickets</p>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="1" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Numbers</SelectLabel>
            <SelectItem value="one">1</SelectItem>
            <SelectItem value="two">2</SelectItem>
            <SelectItem value="three">3</SelectItem>
            <SelectItem value="four">4</SelectItem>
            <SelectItem value="five">5</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
export default TicketNumber;
