"use client";

export function GlobalBackgroundFx() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          top: -220,
          left: -180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0))",
          filter: "blur(36px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 640,
          height: 640,
          right: -260,
          bottom: -260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(147, 197, 253, 0.16), rgba(147, 197, 253, 0))",
          filter: "blur(36px)",
        }}
      />
    </div>
  );
}
