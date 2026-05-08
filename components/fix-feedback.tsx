"use client";

import { useMemo, useRef, useState } from "react";

type FeedbackChoice = "yes" | "no";

type FixFeedbackProps = {
  fixId: string;
  initialFailureCount: number;
  initialSuccessCount: number;
};

type FeedbackResponse = {
  failureCount: number;
  successCount: number;
};

function getStoredChoice(storageKey: string): FeedbackChoice | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedChoice = window.sessionStorage.getItem(storageKey);

  return storedChoice === "yes" || storedChoice === "no" ? storedChoice : null;
}

export function FixFeedback({
  fixId,
  initialFailureCount,
  initialSuccessCount,
}: FixFeedbackProps) {
  const storageKey = useMemo(() => `fieldfix:fix-feedback:${fixId}`, [fixId]);
  const [successCount, setSuccessCount] = useState(initialSuccessCount);
  const [failureCount, setFailureCount] = useState(initialFailureCount);
  const [submittedChoice, setSubmittedChoice] = useState<FeedbackChoice | null>(() =>
    getStoredChoice(storageKey),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(() =>
    getStoredChoice(storageKey) ? "Feedback already recorded for this session." : null,
  );
  const isSubmittingRef = useRef(false);

  async function submitFeedback(choice: FeedbackChoice) {
    if (submittedChoice || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/fixes/${fixId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ success: choice === "yes" }),
      });

      const payload = (await response.json()) as Partial<FeedbackResponse> & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Feedback could not be recorded.");
      }

      if (typeof payload.successCount === "number") {
        setSuccessCount(payload.successCount);
      }

      if (typeof payload.failureCount === "number") {
        setFailureCount(payload.failureCount);
      }

      window.sessionStorage.setItem(storageKey, choice);
      setSubmittedChoice(choice);
      setMessage("Feedback recorded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Feedback could not be recorded.");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const isDisabled = Boolean(submittedChoice) || isSubmitting;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Did this fix work?</h2>
          <p className="mt-1 text-sm text-slate-600">
            Yes: {successCount} · No: {failureCount}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => submitFeedback("yes")}
            className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            YES
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => submitFeedback("no")}
            className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            NO
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}
