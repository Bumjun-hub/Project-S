"use client";

import { usePathname } from "next/navigation";
import { GridMotion } from "@/components/background/GridMotion";

const BG_ITEMS = [
  { title: "cloth1", image: "/images/cloth1.jpg" },
  { title: "cloth2", image: "/images/cloth2.jpg" },
  { title: "cloth3", image: "/images/cloth3.jpg" },
  { title: "cloth4", image: "/images/cloth4.jpg" },
  { title: "cloth5", image: "/images/cloth5.jpg" },
  { title: "cloth6", image: "/images/cloth6.jpg" },
  { title: "cloth7", image: "/images/cloth7.jpg" },
  { title: "cloth8", image: "/images/cloth8.jpg" },
  { title: "cloth9", image: "/images/cloth9.jpg" },
];

export function GlobalBackgroundFx() {
  const pathname = usePathname();
  const showGridMotion = pathname === "/";
  const showSoftGridMotion =
    pathname === "/profile" ||
    pathname === "/my-fit" ||
    pathname === "/result" ||
    pathname.startsWith("/recommend/");

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
        background:
          "linear-gradient(180deg, rgba(5,6,8,0.98) 0%, rgba(10,11,16,0.92) 28%, rgba(22,24,34,0.72) 62%, rgba(42,45,62,0.48) 100%), radial-gradient(circle at 50% 12%, rgba(70,78,96,0.22), rgba(0,0,0,0) 62%)",
      }}
    >
      {showGridMotion ? <GridMotion gradientColor="#2f2f32" items={BG_ITEMS} /> : null}
      {showSoftGridMotion ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            filter: "blur(1.5px)",
          }}
        >
          <GridMotion gradientColor="#252933" items={BG_ITEMS} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          top: -220,
          left: -180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(104, 114, 132, 0.22), rgba(104, 114, 132, 0))",
          filter: "blur(22px)",
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
          background: "radial-gradient(circle, rgba(88, 96, 112, 0.25), rgba(88, 96, 112, 0))",
          filter: "blur(22px)",
        }}
      />
    </div>
  );
}
