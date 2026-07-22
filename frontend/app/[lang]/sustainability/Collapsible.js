"use client";
// frontend/app/[lang]/sustainability/Collapsible.js
import { useState } from "react";

const PINE  = "#1a2e1a";
const CREAM = "#f5f0e8";

export default function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: "100%", textAlign: "left", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "none", border: "none", cursor: "pointer", transition: "background 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.background = CREAM; }}
        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: PINE }}>{title}</span>
        <span
          style={{ flexShrink: 0, color: "#aaa", fontSize: 11, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        >
          {"▼"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "4px 24px 24px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
