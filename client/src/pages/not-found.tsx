import React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <h1 className="text-3xl font-bold mb-6">404 - Page Not Found</h1>
        <img
          src="https://i.ytimg.com/vi/6QfJURAhBZo/maxresdefault.jpg"
          alt="404 Not Found"
          className="max-w-full h-auto rounded shadow-lg"
          style={{ maxWidth: 600 }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
