import React from "react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500/10 to-gray-50">
      <section
        className="rounded-xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-blue-100 p-8 text-center"
        role="alert"
        aria-live="assertive"
      >
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          404 – Page Not Found
        </h1>
        <p className="text-gray-600">
          The page you’re looking for doesn’t exist.
        </p>
      </section>
    </main>
  );
}
