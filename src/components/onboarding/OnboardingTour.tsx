"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Step = {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
};

const steps: Step[] = [
  {
    target: "[data-onboarding='compose']",
    title: "Compose new email",
    description: "Click here to write a new email. You can reply to existing threads or start fresh.",
    position: "right",
  },
  {
    target: "[data-onboarding='folders']",
    title: "Navigate folders",
    description: "Switch between Inbox, Sent, Drafts, and more. Each folder shows the message count.",
    position: "right",
  },
  {
    target: "[data-onboarding='search']",
    title: "Search your mail",
    description: "Find any email instantly. Search works across all your connected accounts.",
    position: "bottom",
  },
  {
    target: "[data-onboarding='filters']",
    title: "Filter messages",
    description: "Quickly filter by unread, starred, or other criteria to focus on what matters.",
    position: "bottom",
  },
  {
    target: "[data-onboarding='bulk-actions']",
    title: "Bulk actions",
    description: "Select multiple emails to archive, delete, or mark as read at once.",
    position: "bottom",
  },
];

export function OnboardingTour() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem("tarnmail.onboarding.seen");
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    const target = document.querySelector(step.target);
    if (!target) return;

    const updateRect = () => {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem("tarnmail.onboarding.seen", "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem("tarnmail.onboarding.seen", "true");
    setIsOpen(false);
  };

  if (!isOpen || !targetRect) return null;

  const step = steps[currentStep];
  const padding = 8;
  const tooltipWidth = 300;
  const tooltipHeight = 160;

  let tooltipStyle: React.CSSProperties = {};
  let arrowStyle: React.CSSProperties = {};

  switch (step.position) {
    case "right":
      tooltipStyle = {
        top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
        left: targetRect.right + padding,
      };
      arrowStyle = {
        top: "50%",
        left: -8,
        transform: "translateY(-50%) rotate(45deg)",
      };
      break;
    case "left":
      tooltipStyle = {
        top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
        left: targetRect.left - tooltipWidth - padding,
      };
      arrowStyle = {
        top: "50%",
        right: -8,
        transform: "translateY(-50%) rotate(45deg)",
      };
      break;
    case "bottom":
      tooltipStyle = {
        top: targetRect.bottom + padding,
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      };
      arrowStyle = {
        top: -8,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
      };
      break;
    case "top":
      tooltipStyle = {
        top: targetRect.top - tooltipHeight - padding,
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      };
      arrowStyle = {
        bottom: -8,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
      };
      break;
  }

  return (
    <>
      {/* Overlay with cutout */}
      <div className="fixed inset-0 z-40 bg-black/50">
        <div
          className="absolute rounded-lg ring-4 ring-accent ring-offset-2 transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 w-[300px] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
        style={tooltipStyle}
      >
        <div
          className="absolute h-4 w-4 border-l border-t border-slate-200 bg-white"
          style={arrowStyle}
        />

        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-accent">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Skip tour
          </button>
        </div>

        <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {step.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i === currentStep ? "bg-accent" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            {currentStep === steps.length - 1 ? "Got it!" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
