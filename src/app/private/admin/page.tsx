import AdminEntryList from "@/components/admin/AdminEntryList";

/**
 * Developer-only tool: view every submission and delete one if someone
 * asks to be removed after launch. NOT part of the MIKA-facing experience —
 * not linked from anywhere in the public UI (same "unlisted URL" pattern as
 * /private/production).
 *
 * Three layers of access control stack here:
 *   1. GATE 1 (site passphrase) — middleware, covers this whole site.
 *   2. GATE 2 (private experience passphrase) — middleware, covers /private/**.
 *   3. ADMIN_KEY (?key=... query param, checked here, server-side only) —
 *      on top of both gates, since this page can delete data and neither
 *      gate above was designed with that in mind (GATE 2's passphrase is
 *      effectively MIKA's — it protects her viewing experience, not a
 *      destructive admin tool).
 *
 * The API route (src/app/api/admin/entries/route.ts) independently
 * re-checks ADMIN_KEY on every request too — never trust a page-level gate
 * alone for something that can delete data.
 */
export default function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const expected = process.env.ADMIN_KEY;
  const provided = searchParams.key;
  const authorized = Boolean(expected) && provided === expected;

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1a1625] px-6 text-center">
        <p className="font-body text-xs text-white/40">Not found.</p>
      </main>
    );
  }

  return <AdminEntryList adminKey={expected as string} />;
}
