import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const TextInputs = () => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="name">Enter your name</label>
        <Input type="text" id="name" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email">Enter your email *</label>
        <Input type="email" id="email" placeholder="hello@avioflagos.io" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="textarea">Special request?</label>
        <Textarea type="" id="textarea" placeholder="Textarea" />
      </div>
    </>
  );
};
export default TextInputs;
