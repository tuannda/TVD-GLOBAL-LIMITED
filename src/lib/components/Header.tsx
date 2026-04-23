"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/#home" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            TVD
          </div>
          <span className="font-bold text-lg">TVD GLOBAL LIMITED</span>
        </Link>

        {/* Menu */}
        <nav className="flex items-center gap-6">
          <a
            href="/#home"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Home
          </a>
          <a
            href="/#contact"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
