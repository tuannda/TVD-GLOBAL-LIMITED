"use client";

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Home Section */}
      <section
        id="home"
        className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16 text-center"
      >
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">GlobalSoft</h1>
          <p className="text-lg text-gray-600">
            Welcome to our platform. A modern solution for managing your
            content.
          </p>
          <p className="text-gray-500">
            Explore our services and get in touch with us through the contact
            section below.
          </p>
        </div>
        <a
          href="#contact"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition"
        >
          Get in Touch
        </a>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 py-16"
      >
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">Contact Us</h2>
          <p className="text-gray-600">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Contact Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-2 h-24 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-3 text-center text-sm text-gray-600">
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:phamvanhai.cntt@gmail.com"
                className="text-blue-600 hover:underline"
              >
                phamvanhai.cntt@gmail.com
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a
                href="tel:+84789150989"
                className="text-blue-600 hover:underline"
              >
                +84789150989
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
