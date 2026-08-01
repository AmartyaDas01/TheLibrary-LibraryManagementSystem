"use client";

import { useActionState, useEffect } from "react";
import { registerAction, type FormState } from "@/lib/actions";
import { Field, Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/submit-button";

const initial: FormState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initial);
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    const firstInvalidId = Object.keys(fe)[0];
    if (firstInvalidId) document.getElementById(firstInvalidId)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field label="Full name" htmlFor="name" required error={fe.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          placeholder="Ada Lovelace"
          aria-invalid={!!fe.name}
        />
      </Field>

      <Field label="Email" htmlFor="email" required error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-invalid={!!fe.email}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        required
        error={fe.password}
        hint="At least 8 characters."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          aria-invalid={!!fe.password}
        />
      </Field>

      <SubmitButton className="w-full" pendingText="Creating account…">
        Create my membership
      </SubmitButton>
    </form>
  );
}
