import Image from "next/image";
import Link from "next/link";
import Logo from "../../app/tarnmail.svg";

export default function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src={Logo}
        alt="tarnmail logo"
        height={32}
        width={160}
        priority
        className="h-8 w-auto"
      />
    </Link>
  );
}
