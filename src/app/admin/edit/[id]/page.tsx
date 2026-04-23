"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useAuthUser } from "@/lib/firebase/auth";
import { signOut } from "firebase/auth";
import dynamic from "next/dynamic";

const SunEditorComponent = dynamic(
  () => import("@/lib/components/SunEditorComponent"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-gray-500">Loading editor...</div>,
  },
);

type FormState = {
  title: string;
  slug: string;
  html: string;
  published: boolean;
};

// Generate slug from title (handles Unicode/Vietnamese)
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const pageIdParam = params?.id;
  const pageId = Array.isArray(pageIdParam) ? pageIdParam[0] : pageIdParam;
  const isNewPage = pageId === "new";
  const { user, loading: authLoading } = useAuthUser();
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(() => !authLoading, [authLoading]);

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }

    if (isNewPage) {
      setForm({
        title: "",
        slug: "",
        html: "",
        published: false,
      });
      setLoading(false);
      return;
    }

    const load = async () => {
      if (!pageId) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "pages", pageId));
        if (!snapshot.exists()) {
          console.error("Document not found:", pageId);
          setError("Page not found.");
          setLoading(false);
          return;
        }

        const data = snapshot.data();
        console.log("Loaded page data:", data);

        setForm({
          title: String(data.title ?? ""),
          slug: String(data.slug ?? ""),
          html: String(data.html ?? ""),
          published: Boolean(data.published),
        });
        setLoading(false);
      } catch (err) {
        console.error("Error loading page:", err);
        setError("Failed to load page.");
        setLoading(false);
      }
    };

    load();
  }, [ready, pageId, isNewPage]);

  const handleTitleChange = (title: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title,
        slug: generateSlug(title),
      };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) {
      setError("Form data missing.");
      return;
    }

    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    try {
      if (!user) {
        setError("You must be logged in to save pages.");
        return;
      }

      if (isNewPage) {
        console.log("Creating new page with user:", user.uid);
        await addDoc(collection(db, "pages"), {
          title: form.title.trim(),
          slug: form.slug.trim(),
          html: form.html,
          published: form.published,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else if (pageId && pageId !== "new") {
        console.log("Updating page:", pageId, "with user:", user.uid);
        await updateDoc(doc(db, "pages", pageId), {
          title: form.title.trim(),
          slug: form.slug.trim(),
          html: form.html,
          published: form.published,
          updatedAt: serverTimestamp(),
        });
      }
      router.push("/admin");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Save error:", errorMessage, "User:", user?.uid);
      setError(`Unable to save page: ${errorMessage}`);
    }
  };

  const handleDelete = async () => {
    if (isNewPage || !pageId || pageId === "new") {
      return;
    }

    const confirmed = window.confirm("Delete this page permanently?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, "pages", pageId));
      router.push("/admin");
    } catch (err) {
      setError("Unable to delete page.");
    }
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-bold">Admin login required</h1>
          <p className="text-gray-600">Sign in to edit this page.</p>
          <Link
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            href="/admin"
          >
            Go to admin login
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <p className="text-sm text-gray-500">Loading page...</p>
        </div>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-bold">Page not found</h1>
          <Link
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            href="/admin"
          >
            Back to admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isNewPage ? "Create New Page" : "Edit Page"}
            </h1>
            <p className="text-gray-600">
              {form.title || "Untitled"} {form.slug && `(/${form.slug})`}
            </p>
          </div>
          <Link
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
            href="/admin"
          >
            Back to admin
          </Link>
        </div>

        <div>
          {/* Main Form */}
          <form
            className="rounded-lg border border-gray-200 bg-white p-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">Title</span>
              <input
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter page title..."
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">
                Slug (URL-friendly name)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">/</span>
                <input
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, slug: e.target.value } : prev,
                    )
                  }
                  placeholder="auto-generated from title"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated from title. You can edit it manually.
              </p>
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">
                Content
              </span>
              <SunEditorComponent
                value={form.html}
                onChange={(html) =>
                  setForm((prev) => (prev ? { ...prev, html } : prev))
                }
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                checked={form.published}
                onChange={(e) =>
                  setForm((prev) =>
                    prev ? { ...prev, published: e.target.checked } : prev,
                  )
                }
              />
              <span className="text-sm text-gray-700">Publish immediately</span>
            </label>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
                type="submit"
              >
                {isNewPage ? "Create Page" : "Save Changes"}
              </button>
              {!isNewPage && (
                <button
                  className="rounded-lg bg-red-50 px-6 py-2 font-semibold text-red-600 hover:bg-red-100"
                  type="button"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
