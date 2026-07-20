import type { ReactNode } from "react";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";
import { PageContainer } from "@/components/layout/PageContainer";

type StepPageShellProps = {
  step: number;
  label: string;
  title: string;
  description?: ReactNode;
  maxWidth?: number;
  panelClassName?: string;
  children: ReactNode;
};

export function StepPageShell({
  step,
  label,
  title,
  description,
  maxWidth = 640,
  panelClassName = "flow-panel",
  children,
}: StepPageShellProps) {
  return (
    <PageContainer maxWidth={maxWidth}>
      <FlowStepCaption step={step} label={label} />
      <section className={`${panelClassName} step-page-shell`}>
        <h1 style={{ marginTop: 0, marginBottom: "0.45rem" }}>{title}</h1>
        {description ? <p className="step-page-shell-description">{description}</p> : null}
        <div className="step-page-shell-content">{children}</div>
      </section>
    </PageContainer>
  );
}
