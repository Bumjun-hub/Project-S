import type { ReactNode } from "react";

type GlassStateBlockProps = {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function GlassStateBlock({ title, description, children, className = "flow-measure-card" }: GlassStateBlockProps) {
  return (
    <section className={className} style={{ padding: "0.9rem 1rem" }}>
      <h2 style={{ marginTop: 0, marginBottom: "0.42rem", fontSize: "1rem" }}>{title}</h2>
      {description ? (
        <p style={{ marginTop: 0, marginBottom: children ? "0.65rem" : 0, color: "var(--muted)" }}>{description}</p>
      ) : null}
      {children}
    </section>
  );
}
