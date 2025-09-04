"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoClient({ slug, url }: { slug: string; url: string }) {
  const router = useRouter();

  useEffect(() => {
    // Open the tool in a new tab, then send the user back to the Hub
    window.open(url, "_blank", "noopener,noreferrer");
    router.replace("/");
  }, [url, router]);

  return (
    <main className="max-w-xl mx-auto p-6">
      <p>Opening <b>{slug}</b>…</p>
      <div className="mt-4 flex gap-4">
        <a className="underline" href="/">Back to Belto EdStore</a>
        <a className="underline" href={url} target="_blank" rel="noopener noreferrer">Open directly</a>
      </div>
    </main>
  );
}
