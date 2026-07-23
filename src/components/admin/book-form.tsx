"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  createBookAction,
  updateBookAction,
  type FormState,
} from "@/lib/actions";
import { CATEGORIES } from "@/lib/constants";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { BookCover } from "@/components/book-cover";

type BookValues = {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  publisher: string;
  publishedYear: string;
  pageCount: string;
  totalCopies: string;
  coverHue: number;
};

const empty: BookValues = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  description: "",
  publisher: "",
  publishedYear: "",
  pageCount: "",
  totalCopies: "1",
  coverHue: 150,
};

export function BookForm({ initial }: { initial?: Partial<BookValues> }) {
  const isEdit = Boolean(initial?.id);
  const action = isEdit ? updateBookAction : createBookAction;
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};

  const start = { ...empty, ...initial };
  const [title, setTitle] = useState(start.title);
  const [author, setAuthor] = useState(start.author);
  const [hue, setHue] = useState<number>(start.coverHue);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_240px]" noValidate>
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}

      <div className="space-y-4">
        {state.error && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </p>
        )}

        <Field label="Title" htmlFor="title" required error={fe.title}>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The Name of the Wind"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Author" htmlFor="author" required error={fe.author}>
            <Input
              id="author"
              name="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Patrick Rothfuss"
            />
          </Field>
          <Field label="Category" htmlFor="category" required error={fe.category}>
            <Select id="category" name="category" defaultValue={start.category}>
              <option value="" disabled>
                Choose a subject…
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ISBN" htmlFor="isbn" required error={fe.isbn}>
            <Input
              id="isbn"
              name="isbn"
              defaultValue={start.isbn}
              placeholder="9780756404741"
            />
          </Field>
          <Field label="Publisher" htmlFor="publisher">
            <Input
              id="publisher"
              name="publisher"
              defaultValue={start.publisher}
              placeholder="DAW Books"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Published year" htmlFor="publishedYear">
            <Input
              id="publishedYear"
              name="publishedYear"
              type="number"
              inputMode="numeric"
              defaultValue={start.publishedYear}
              placeholder="2007"
            />
          </Field>
          <Field label="Pages" htmlFor="pageCount">
            <Input
              id="pageCount"
              name="pageCount"
              type="number"
              inputMode="numeric"
              defaultValue={start.pageCount}
              placeholder="662"
            />
          </Field>
          <Field
            label="Total copies"
            htmlFor="totalCopies"
            required
            hint="How many the library owns."
          >
            <Input
              id="totalCopies"
              name="totalCopies"
              type="number"
              inputMode="numeric"
              min={1}
              defaultValue={start.totalCopies}
            />
          </Field>
        </div>

        <Field
          label="Description"
          htmlFor="description"
          required
          error={fe.description}
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={start.description}
            placeholder="A short synopsis that helps members decide."
            rows={4}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <SubmitButton pendingText="Saving…">
            {isEdit ? "Save changes" : "Add to catalogue"}
          </SubmitButton>
        </div>
      </div>

      {/* Live cover preview + hue */}
      <aside className="space-y-4">
        <p className="text-sm font-medium">Cover preview</p>
        <div className="w-40">
          <BookCover
            title={title || "Untitled"}
            author={author || "Unknown author"}
            hue={hue}
          />
        </div>
        <div>
          <label htmlFor="coverHue" className="mb-1.5 block text-sm font-medium">
            Cover colour
          </label>
          <input
            id="coverHue"
            name="coverHue"
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full cursor-pointer accent-[var(--primary)]"
            style={{
              background:
                "linear-gradient(to right, hsl(0 50% 45%), hsl(60 50% 45%), hsl(120 50% 45%), hsl(180 50% 45%), hsl(240 50% 45%), hsl(300 50% 45%), hsl(360 50% 45%))",
              borderRadius: 999,
              height: 8,
              appearance: "none",
            }}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Covers are generated from this hue — no image upload needed.
          </p>
        </div>
      </aside>
    </form>
  );
}
