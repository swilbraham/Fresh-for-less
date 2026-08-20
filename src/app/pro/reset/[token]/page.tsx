import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  cleanerIdFromResetToken,
  verifyResetToken,
} from "@/lib/marketplace/auth";
import { getCleaner, getCleanerPasswordHash } from "@/lib/marketplace/repo";
import { Alert, Card, Field } from "@/components/marketplace/shell";
import { resetPasswordAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const cleanerId = cleanerIdFromResetToken(token);
  const currentHash = cleanerId ? await getCleanerPasswordHash(cleanerId) : null;
  const valid =
    cleanerId !== null &&
    currentHash !== null &&
    verifyResetToken(token, currentHash) !== null;
  const cleaner = valid ? await getCleaner(cleanerId!) : null;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 pt-10 pb-20">
        <div className="mx-auto max-w-md px-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Set a new password
          </h1>

          <div className="mt-6">{error && <Alert>{error}</Alert>}</div>

          {!valid ? (
            <Card>
              <p className="text-slate-600">
                This reset link has expired or has already been used. Links last
                48 hours and only work once.
              </p>
              <p className="mt-3 text-slate-600">
                Call{" "}
                <a href="tel:03300434811" className="font-semibold underline">
                  0330 043 4811
                </a>{" "}
                and we&apos;ll send you a fresh one, or{" "}
                <Link href="/pro" className="font-semibold text-primary-600 underline">
                  sign in
                </Link>{" "}
                if you remember your password.
              </p>
            </Card>
          ) : (
            <Card
              title={`Hello ${cleaner?.name ?? ""}`}
              description="Choose a new password and we'll sign you straight in."
            >
              <form action={resetPasswordAction} className="mt-4 space-y-4">
                <input type="hidden" name="token" value={token} />
                <Field
                  label="New password"
                  name="password"
                  type="password"
                  required
                  hint="At least 8 characters."
                />
                <Field
                  label="Confirm new password"
                  name="confirm"
                  type="password"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                >
                  Save new password
                </button>
              </form>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
