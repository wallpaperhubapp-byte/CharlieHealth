"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  {
    title: "Welcome",
    detail: "A warm start and a few helpful details about your first days.",
  },
  {
    title: "Personal information",
    detail: "Confirm your legal name and preferred name in My profile.",
  },
  {
    title: "Contact information",
    detail: "Add your home address, personal email and phone number.",
  },
  {
    title: "Emergency contact",
    detail: "Add a primary contact who we can reach if needed.",
  },
  {
    title: "Employment information",
    detail: "Review the work details shared with you by People Operations.",
  },
  {
    title: "Tax information",
    detail: "Complete your withholding preferences.",
  },
  {
    title: "Payroll & direct deposit",
    detail: "Review payroll information and request direct-deposit changes.",
  },
  {
    title: "Benefits",
    detail: "Review eligible plan information and enrollment deadlines.",
  },
  {
    title: "Required documents",
    detail: "Review any documents shared with your employee account.",
  },
  {
    title: "Policies & acknowledgements",
    detail: "Read and acknowledge the company policies assigned to you.",
  },
  {
    title: "Final review",
    detail:
      "Review your steps and return to anything that needs a second look.",
  },
  {
    title: "All set",
    detail: "Your onboarding checklist is ready for your People team.",
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/onboarding", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.onboarding) {
          setCurrent(data.onboarding.currentStep ?? 0);
          setCompleted(data.onboarding.completedSteps ?? []);
        }
      })
      .catch(() =>
        setError("Progress couldn’t be loaded. Refresh and try again."),
      );
  }, []);
  async function persist(nextStep: number, nextCompleted: number[]) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const csrfResponse = await fetch("/api/auth/csrf", { cache: "no-store" });
      const { csrfToken } = await csrfResponse.json();
      const response = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          currentStep: nextStep,
          completedSteps: nextCompleted,
        }),
      });
      if (!response.ok) throw new Error();
      setCurrent(nextStep);
      setCompleted(nextCompleted);
      setMessage("Progress saved securely.");
    } catch {
      setError(
        "Your progress couldn’t be saved. Try again when you’re back online.",
      );
    } finally {
      setSaving(false);
    }
  }
  const done = completed.includes(current);
  return (
    <main className="onboarding-screen">
      <header className="onboarding-header">
        <a href="/">
          <ArrowLeft size={15} /> Employee portal
        </a>
        <span>
          <ShieldCheck size={14} /> Secure onboarding
        </span>
      </header>
      <div className="onboarding-wrap">
        <div className="onboarding-intro">
          <span className="eyebrow">WELCOME TO CHARLIE HEALTH</span>
          <h1>
            Let’s get you <em>settled in.</em>
          </h1>
          <p>
            Your onboarding, at your own pace. You can save and come back
            whenever you’re ready.
          </p>
        </div>
        <div className="onboarding-progress">
          <div>
            <span>YOUR PROGRESS</span>
            <strong>{completed.length} of 12 steps</strong>
          </div>
          <div className="onboarding-progress-track">
            <span
              style={{ width: `${Math.round((completed.length / 12) * 100)}%` }}
            />
          </div>
        </div>
        <div className="onboarding-layout">
          <nav className="onboarding-steps" aria-label="Onboarding steps">
            {steps.map((step, index) => (
              <button
                key={step.title}
                className={`${current === index ? "onboarding-step-active" : ""} ${completed.includes(index) ? "onboarding-step-complete" : ""}`}
                onClick={() => setCurrent(index)}
              >
                <span>
                  {completed.includes(index) ? (
                    <Check size={13} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                {step.title}
              </button>
            ))}
          </nav>
          <section className="onboarding-card">
            <div className="onboarding-card-top">
              <span className="eyebrow">
                STEP {String(current + 1).padStart(2, "0")} · 12
              </span>
              <span>{Math.round((completed.length / 12) * 100)}% complete</span>
            </div>
            <div className="onboarding-step-icon">
              {current === 0 ? (
                <CheckCircle2 size={20} />
              ) : current === 8 || current === 9 ? (
                <FileCheck2 size={20} />
              ) : (
                <ShieldCheck size={20} />
              )}
            </div>
            <h2>{steps[current].title}</h2>
            <p>{steps[current].detail}</p>
            {current === 6 && (
              <div className="onboarding-security-note">
                <ShieldCheck size={16} /> This portal does not collect full
                bank-account details.
              </div>
            )}
            {current === 1 ||
            current === 2 ||
            current === 3 ||
            current === 4 ? (
              <a className="onboarding-action-link" href="/?section=profile">
                Review your profile <ArrowRight size={15} />
              </a>
            ) : current === 5 || current === 6 ? (
              <span className="onboarding-provider-note">
                Contact People Operations for payroll assistance.
              </span>
            ) : null}
            <div className="onboarding-card-footer">
              <button
                className="outline-button"
                disabled={current === 0 || saving}
                onClick={() => setCurrent((step) => Math.max(0, step - 1))}
              >
                Back
              </button>
              <span>
                {saving
                  ? "Saving…"
                  : error ||
                    message ||
                    "Your progress is saved to your employee account."}
              </span>
              {current === steps.length - 1 ? (
                <button
                  className="primary-button"
                  disabled={saving || done}
                  onClick={() =>
                    void persist(
                      current,
                      completed.includes(current)
                        ? completed
                        : [...completed, current],
                    )
                  }
                >
                  {done ? "Completed" : "Finish"}
                  <Check size={15} />
                </button>
              ) : (
                <button
                  className="primary-button"
                  disabled={saving}
                  onClick={() =>
                    void persist(
                      current + 1,
                      completed.includes(current)
                        ? completed
                        : [...completed, current],
                    )
                  }
                >
                  {done ? "Continue" : "Save & continue"}
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </section>
        </div>
        <footer className="onboarding-footer">
          <CircleHelp size={14} /> Need a hand? Contact{" "}
          <a href="mailto:people@example.test">People Operations</a>.
        </footer>
      </div>
    </main>
  );
}
