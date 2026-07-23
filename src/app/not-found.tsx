import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">
        This page isn't on our shelves
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for may have been moved or never catalogued.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/catalog">Browse the catalogue</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
