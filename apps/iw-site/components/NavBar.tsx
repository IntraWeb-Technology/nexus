import Link from 'next/link';
import Image from 'next/image';

export function NavBar() {
  return (
    <nav aria-label="Main navigation" className="flex items-center gap-6">
      <Link href="/">
        <Image src="/IW-logo-q2.png" alt="IntraWeb." width={140} height={36} className="mr-4 h-9 w-auto max-w-[160px]" />
      </Link>
      <Link href="/" className="focus:outline-brand-primary">Home</Link>
      {/* <Link href="/work" className="focus:outline-brand-primary">Work</Link> */}
      {/* <Link href="/process" className="focus:outline-brand-primary">Process</Link> */}
      <Link href="/about" className="focus:outline-brand-primary">About</Link>
      {/* <Link href="/faq" className="focus:outline-brand-primary">FAQ</Link> */}
    </nav>
  );
} 