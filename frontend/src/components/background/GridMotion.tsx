"use client";

import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { memo, useEffect, useMemo, useRef } from "react";

export type GridMotionItem = {
  title: string;
  image?: string;
};

type GridMotionProps = {
  gradientColor?: string;
  items?: GridMotionItem[];
};

const DEFAULT_ITEMS: GridMotionItem[] = [
  { title: "Item 1" },
  { title: "Item 2" },
  { title: "Item 3" },
];

function wrapMod(n: number, m: number) {
  return ((n % m) + m) % m;
}

type GridMotionRowProps = {
  row: Array<GridMotionItem & { key: string }>;
  rowIdx: number;
  singleRowWidthPx: number;
  scrollX: MotionValue<number>;
  tileGapPx: number;
  tileWidthPx: number;
  tileHeightPx: number;
};

const GridMotionRow = memo(function GridMotionRow({
  row,
  rowIdx,
  singleRowWidthPx,
  scrollX,
  tileGapPx,
  tileWidthPx,
  tileHeightPx,
}: GridMotionRowProps) {
  const driftRight = rowIdx % 2 === 0;
  const x = useTransform(scrollX, (v) => {
    const s = wrapMod(v, singleRowWidthPx);
    return driftRight ? -singleRowWidthPx + s : -s;
  });

  const renderTile = (tile: GridMotionItem & { key: string }) => (
    <div
      key={tile.key}
      style={{
        position: "relative",
        minWidth: tileWidthPx,
        width: tileWidthPx,
        minHeight: tileHeightPx,
        borderRadius: 16,
        border: "1px solid rgba(88, 92, 103, 0.45)",
        background: tile.image
          ? `linear-gradient(rgba(7,7,8,0.72), rgba(7,7,8,0.72)), url('${tile.image}') center/cover no-repeat`
          : "linear-gradient(160deg, rgba(12,12,14,0.9), rgba(18,18,22,0.9))",
        overflow: "hidden",
      }}
    />
  );

  const rowCopies = 3;
  const extendedRow = Array.from({ length: rowCopies }, (_, round) =>
    row.map((tile) => ({ ...tile, key: `${tile.key}-c${round}` })),
  ).flat();

  return (
    <motion.div
      style={{
        display: "flex",
        gap: tileGapPx,
        width: "max-content",
        willChange: "transform",
        x,
      }}
    >
      {extendedRow.map((tile, idx) => renderTile({ ...tile, key: `${tile.key}-i${idx}` }))}
    </motion.div>
  );
});

export function GridMotion({ gradientColor = "#2f2f32", items = DEFAULT_ITEMS }: GridMotionProps) {
  const rowCount = 3;
  const visibleColumns = 2;
  const rowLength = visibleColumns + 2;
  const tileWidthPx = 300;
  const tileGapPx = 24;
  const tileHeightPx = 220;
  const singleRowWidthPx = rowLength * (tileWidthPx + tileGapPx) - tileGapPx;

  const scrollX = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const rafRef = useRef(0);
  const accRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;

    const onVisibility = () => {
      if (typeof document === "undefined") return;
      accRef.current = 0;
      if (rafRef.current !== 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      const dy = e.movementY;
      if (Math.abs(dy) < 0.05) return;
      accRef.current += dy * 0.14;
      if (rafRef.current !== 0) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const a = accRef.current;
        accRef.current = 0;
        if (Math.abs(a) < 1e-6) return;
        scrollX.set(scrollX.get() + a);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current !== 0) cancelAnimationFrame(rafRef.current);
    };
  }, [reduceMotion, scrollX]);

  const rows = useMemo(
    () =>
      Array.from({ length: rowCount }, (_, rowIdx) =>
        Array.from({ length: rowLength }, (_, colIdx) => {
          const idx = (rowIdx * rowLength + colIdx) % items.length;
          const item = items[idx]!;
          return { ...item, key: `${item.title}-${rowIdx}-${colIdx}` };
        }),
      ),
    [items, rowCount, rowLength],
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", contain: "paint" }}>
      <div
        style={{
          position: "absolute",
          inset: "-28%",
          display: "grid",
          gridTemplateRows: `repeat(${rowCount}, minmax(${tileHeightPx}px, 1fr))`,
          gap: tileGapPx,
          opacity: 0.5,
          transform: "rotate(-12deg) scale(1.12)",
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {rows.map((row, rowIdx) => (
          <GridMotionRow
            key={`row-${rowIdx}`}
            row={row}
            rowIdx={rowIdx}
            singleRowWidthPx={singleRowWidthPx}
            scrollX={scrollX}
            tileGapPx={tileGapPx}
            tileWidthPx={tileWidthPx}
            tileHeightPx={tileHeightPx}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: "-20%",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "180px 180px",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 82%)",
          opacity: 0.4,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          top: -240,
          right: -220,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${gradientColor}66, transparent 62%)`,
          filter: "blur(22px)",
        }}
      />
    </div>
  );
}
