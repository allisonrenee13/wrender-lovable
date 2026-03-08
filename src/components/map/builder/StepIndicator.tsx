import { Check } from "lucide-react";

export type BuilderStep = 1 | 2 | 3;

interface StepIndicatorProps {
  currentStep: BuilderStep;
  completedSteps: Set<number>;
}

const steps = [
  { num: 1, label: "Shape", activeDesc: "Define your world's shape. Choose a template, upload a reference, or draw from scratch." },
  { num: 2, label: "Style", activeDesc: "Choose how your map looks. You can change this any time." },
  { num: 3, label: "Render", activeDesc: "Wrender will finish your map. Consistent strokes, compass, and labels." },
];

const StepIndicator = ({ currentStep, completedSteps }: StepIndicatorProps) => {
  const activeDesc = steps.find((s) => s.num === currentStep)?.activeDesc || "";

  return (
    <div className="px-6 py-4 border-b border-border bg-card">
      {/* Step circles */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, i) => {
          const isActive = step.num === currentStep;
          const isComplete = completedSteps.has(step.num);
          const isUpcoming = !isActive && !isComplete;

          return (
            <div key={step.num} className="flex items-center">
              {/* Step */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                    isComplete
                      ? "bg-secondary text-secondary-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? <Check className="h-3 w-3" /> : step.num}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    isActive
                      ? "text-foreground font-medium"
                      : isComplete
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Arrow */}
              {i < steps.length - 1 && (
                <svg className="w-8 h-4 mx-2 text-border" viewBox="0 0 24 12">
                  <path d="M2 6 L18 6 M14 2 L18 6 L14 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Active step description */}
      <p className="text-xs text-muted-foreground text-center mt-2">{activeDesc}</p>
    </div>
  );
};

export default StepIndicator;
