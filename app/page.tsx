"use client";

import dynamic from "next/dynamic";

// Dynamically import the home page content to prevent SSR
const HomePage = dynamic(() => import("./HomePage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-gray-300">Initializing...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <HomePage />;
}