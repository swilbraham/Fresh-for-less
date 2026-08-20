import Link from "next/link";
import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import { Alert, Card, Field } from "@/components/marketplace/shell";
import { requestResetAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forgotten your password",
  robots: { index: false, follow: false },
};

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 pt-10 pb-20">
        <div className="mx-auto max-w-md px-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Forgotten your password?
          </h1>
          <p className="mt-2 text-slate-600">
            Enter the email you registered with and we&apos;ll text you a link
            to set a new one.
          </p>

          <div className="mt-6">
            {sent && (
              <Alert tone="success">
                If that email matches a cleaner account, we&apos;ve just texted
                and emailed a reset link. It lasts 48 hours and only works once.
              </Alert>
            )}
          </div>

          <Card>
            <form action={requestResetAction} className="space-y-4">
              <Field label="Email" name="email" type="email" required />
              <button
                type="submit"
                className="w-full rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
              >
                Send me a reset link
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-500">
              Remembered it?{" "}
              <Link href="/pro" className="font-semibold text-primary-600 underline">
                Sign in
              </Link>
            </p>
          </Card>

          <p className="mt-6 text-center text-sm text-slate-500">
            Changed your mobile number since registering? Call{" "}
            <a href="tel:03300434811" className="font-semibold underline">
              0330 043 4811
            </a>{" "}
            and we&apos;ll sort it.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
