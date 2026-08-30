import { isAdmin } from "@/lib/marketplace/auth";
import { AdminNav } from "@/components/marketplace/shell";

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * The frame every admin page sits in.
 *
 * The nav used to be rendered by each page individually, which worked until
 * one of them forgot: /admin/messages shipped without it and stranded anyone
 * who opened it, with no way back but the browser's back button. Rendering it
 * here means a new admin page cannot make that mistake.
 *
 * The nav is hidden until you are signed in. Otherwise the sign-in screen
 * would carry a full menu of links that all bounce straight back to it, and
 * would list the shape of the admin area to anyone who found the URL.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signedIn = await isAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      {signedIn && <AdminNav />}
      {children}
    </div>
  );
}
