"use client";

import { useActionState } from "react";
import { createSupportTicket, type ContactFormState } from "./actions";

const initialContactFormState: ContactFormState = {
  status: "idle",
  message: "",
};

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return <p id={id} className="mt-2 text-xs font-medium text-[#bb3f3f]">{errors[0]}</p>;
}
function ResultMessage({ state }: { state: ContactFormState }) {
  if (state.status === "idle") return null;

  const isPositive = state.status === "success";
  const isWarning = state.status === "warning";

  return (
    <div
      aria-live="polite"
      className={`mb-6 rounded-2xl border p-4 ${
        isPositive
          ? "border-[#58cc70]/35 bg-[#58cc70]/10"
          : isWarning
            ? "border-[#d6a42c]/35 bg-[#d6a42c]/10"
            : "border-[#d85a5a]/30 bg-[#d85a5a]/10"
      }`}
    >
      {state.ticketNumber && (
        <p className="font-mono text-sm font-bold text-[var(--ink)]">{state.ticketNumber}</p>
      )}
      <p className={`${state.ticketNumber ? "mt-1" : ""} text-sm leading-6 text-[var(--muted)]`}>
        {state.message}
      </p>
    </div>
  );
}

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, formAction, pending] = useActionState(
    createSupportTicket,
    initialContactFormState,
  );

  return (
    <div className="rounded-[1.75rem] border border-[var(--line-strong)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.08)] sm:p-8">
      <ResultMessage state={state} />

      <form action={formAction} className="space-y-5">
        <p className="text-xs text-[var(--subtle)]">
          All fields are required. Name must have 2 characters, subject 4, and description 20.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="form-label">Name <span aria-hidden="true">*</span></label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
              className="form-control"
              placeholder="Your name"
              defaultValue={state.values?.name ?? ""}
            />
            <FieldError id="name-error" errors={state.fieldErrors?.name} />
          </div>
          <div>
            <label htmlFor="email" className="form-label">Email <span aria-hidden="true">*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
              className="form-control"
              placeholder="you@company.com"
              defaultValue={state.values?.email ?? ""}
            />
            <FieldError id="email-error" errors={state.fieldErrors?.email} />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="form-label">Subject <span aria-hidden="true">*</span></label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            minLength={4}
            maxLength={160}
            defaultValue={state.values?.subject ?? defaultSubject}
            aria-invalid={Boolean(state.fieldErrors?.subject)}
            aria-describedby={state.fieldErrors?.subject ? "subject-error" : undefined}
            className="form-control"
            placeholder="What can we help with?"
          />
          <FieldError id="subject-error" errors={state.fieldErrors?.subject} />
        </div>

        <div>
          <label htmlFor="description" className="form-label">Description <span aria-hidden="true">*</span></label>
          <textarea
            id="description"
            name="description"
            required
            minLength={20}
            maxLength={5000}
            rows={8}
            aria-invalid={Boolean(state.fieldErrors?.description)}
            aria-describedby={state.fieldErrors?.description ? "description-error" : undefined}
            className="form-control resize-y"
            placeholder="Tell us what happened, what you expected, and any steps that help us reproduce the issue."
            defaultValue={state.values?.description ?? ""}
          />
          <FieldError id="description-error" errors={state.fieldErrors?.description} />
          <p className="mt-2 text-xs text-[var(--subtle)]">Do not include passwords, access tokens, or payment card details.</p>
        </div>

        <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="company_website">Company website</label>
          <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-sm font-semibold text-[var(--page)] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Opening ticket..." : "Open support ticket"}
        </button>
      </form>
    </div>
  );
}
