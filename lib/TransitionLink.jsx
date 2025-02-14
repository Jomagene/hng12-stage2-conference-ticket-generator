'use client';
import { useRouter } from 'next/navigation';

import Link from 'next/link';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TransitionLink = ({ children, href, ...rest }) => {
  const router = useRouter();

  const handleTransition = async (e) => {
    e.preventDefault();

    document.body.classList.add('page-transition');
    await sleep(500);
    router.push(href);
    await sleep(500);
    document.body.classList.remove('page-transition');
  };
  return (
    <Link href={href} {...rest} onClick={handleTransition}>
      {children}
    </Link>
  );
};
export default TransitionLink;
