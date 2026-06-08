import Link from "next/link";
import Image from "next/image";
import { LoginForm, AgreementText } from "./LoginForm";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Logo from "@/app/tarnmail.svg";

export default async function LoginPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise and must be awaited.
  searchParams?: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const callbackUrl = params?.callbackUrl;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Nav />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2.5"
          >
            <Image
              src={Logo}
              alt="tarnmail"
              width={140}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <LoginForm error={error} callbackUrl={callbackUrl} />
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
            <AgreementText />
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
