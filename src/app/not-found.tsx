import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-zinc-600">
        The page you are looking for does not exist.
      </p>
      <Link className="rounded-full border px-4 py-2 text-sm" href="/">
        Back to home
      </Link>
    </main>
  );
}
