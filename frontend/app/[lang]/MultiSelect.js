"use client";
import { useEffect, useRef, useState } from "react";
import { tField } from "./eventData";

// A checkbox dropdown for the multi-value filters (type, borough, audience).
// `selected` is an array of raw (French) field values; an empty array means
// "no filter" -- show everything, matching the single-select "All" default.
// `onChange` receives the next array. Styled inline to match the redesigned
// filter row. The panel closes on outside-click or Escape.
const GREEN_LIGHT = "#e8f0e4";
const GREEN_DARK  = "#1e4d2b";
const GREEN_MID   = "#6a9e5a";
const DARK        = "#111";

export default function MultiSelect({ label, field, options, selected, onChange, dict, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const count = selected.length;
  const active = count > 0;

  const toggleValue = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 7 }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          border: `1.5px solid ${active || open ? GREEN_MID : GREEN_LIGHT}`,
          borderRadius: 10, padding: "9px 14px", fontSize: 13,
          background: "#fff", cursor: "pointer", color: active ? DARK : "#666",
        }}
      >
        {active && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: GREEN_LIGHT, color: GREEN_DARK, fontSize: 11, fontWeight: 800, padding: "0 7px", height: 18 }}>
            {count}
          </span>
        )}
        <span>{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div role="listbox" style={{ position: "absolute", left: 0, top: "100%", marginTop: 6, width: 230, maxHeight: 288, overflowY: "auto", background: "#fff", border: `1px solid ${GREEN_LIGHT}`, borderRadius: 12, boxShadow: "0 8px 28px rgba(0,0,0,0.12)", padding: 6, zIndex: 30 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px" }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>
              {(dict?.filters?.selectedCount || "{count} selected").replace("{count}", count)}
            </span>
            {active && (
              <button type="button" onClick={() => onChange([])} style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, background: "none", border: "none", cursor: "pointer" }}>
                {dict?.filters?.clear || "Clear"}
              </button>
            )}
          </div>
          {options.map((o) => {
            const checked = selected.includes(o);
            return (
              <label key={o} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: checked ? GREEN_LIGHT : "transparent", color: DARK }}>
                <input type="checkbox" checked={checked} onChange={() => toggleValue(o)} style={{ width: 15, height: 15, accentColor: GREEN_DARK }} />
                <span>{tField(field, o, lang)}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
