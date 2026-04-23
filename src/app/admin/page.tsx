"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useAuthUser } from "@/lib/firebase/auth";

type PageItem = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuthUser();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(
    null,
  );
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const ready = useMemo(() => !authLoading, [authLoading]);

  const pageStats = useMemo(() => {
    const publishedCount = pages.filter((page) => page.published).length;
    return {
      total: pages.length,
      published: publishedCount,
      draft: pages.length - publishedCount,
    };
  }, [pages]);

  const loadPages = async () => {
    setLoading(true);
    const snapshot = await getDocs(
      query(collection(db, "pages"), orderBy("updatedAt", "desc")),
    );
    setPages(
      snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          title: String(data.title ?? ""),
          slug: String(data.slug ?? ""),
          published: Boolean(data.published),
        };
      }),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (ready && user) {
      loadPages();
    }
  }, [ready, user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Check email/password.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);

    if (!oldPassword.trim()) {
      setChangePasswordError("Current password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError("New password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      if (!user) throw new Error("User not found");
      if (!user.email) throw new Error("User email not found");

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password changed successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change password";
      if (errorMessage.includes("wrong-password")) {
        setChangePasswordError("Current password is incorrect");
      } else if (errorMessage.includes("requires-recent-login")) {
        setChangePasswordError(
          "Please sign out and sign in again, then try changing your password",
        );
      } else {
        setChangePasswordError(errorMessage);
      }
      console.error("Password change error:", err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    const confirmed = window.confirm("Delete this page?");
    if (!confirmed) {
      return;
    }

    await deleteDoc(doc(db, "pages", pageId));
    await loadPages();
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-6">
          <div className="w-full text-center">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="mt-2 text-gray-600">Sign in to manage pages</p>
          </div>

          <form onSubmit={handleSignIn} className="w-full space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>
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
            <h1 className="text-3xl font-bold">Page Manager</h1>
            <p className="text-gray-600">Manage your website content</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => signOut(auth)}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>

              {changePasswordError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {changePasswordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setChangePasswordError(null);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold">{pages.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Published
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {pages.filter((p) => p.published).length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Drafts
            </p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {pages.filter((p) => !p.published).length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex gap-3">
          <Link
            href="/admin/edit/new"
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          >
            + Create New Page
          </Link>
          <button
            onClick={loadPages}
            className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100"
          >
            Refresh
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100"
          >
            View Public Site
          </Link>
        </div>

        {/* Pages Table */}
        <div className="rounded-lg border border-gray-200 bg-white">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading pages...
            </div>
          ) : pages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pages yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr
                      key={page.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium">{page.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        /{page.slug}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            page.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {page.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/edit/${page.id}`}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
