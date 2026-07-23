"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-6xl font-semibold text-accent">Oh dear</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message ||
          "We hit an unexpected snag. Please try again in a moment."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
