import { Eyebrow } from "@/components/ui/typography";
import type { MvvStep } from "@/types/about";

/** A mission / vision / values step's copy: a statement, or a row of numbered values. */
export function MvvStepCopy({ step }: { step: MvvStep }) {
  return (
    <div className="flex flex-col gap-4">
      <Eyebrow>{step.eyebrow}</Eyebrow>
      {step.kind === "statement" ? (
        <p className="m-0 max-w-[38ch] text-pretty text-[clamp(19px,1.7cqw,26px)] font-medium leading-[1.4] tracking-[-0.015em] text-ink">
          {step.text}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-x-[clamp(16px,2cqw,28px)] gap-y-4">
          {step.values.map((value, i) => (
            <div key={value.title} className="flex flex-col gap-2 border-t border-ink/16 pt-3">
              <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[clamp(17px,1.4cqw,21px)] font-medium leading-[1.15] tracking-[-0.02em]">
                {value.title}
              </span>
              <span className="text-pretty text-[13px] leading-[1.45] text-ink-600">{value.body}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
