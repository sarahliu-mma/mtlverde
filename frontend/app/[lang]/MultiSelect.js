"use client";
import { useEffect, useRef, useState } from "react";
import { tField } from "./eventData";

// A checkbox dropdown used for the multi-value filters (type, borough,
// audience). `selected` is an array of raw (French) field values; an empty
// array means "no filter" -- i.e. show everything, matching the single-select
// "All" default. `onChange` receives the next array.
//
// The button mirrors the single <select> styling so it sits inline with the
// other filters; a small count pill appears once anything is selected. The
// panel closes on outside-click or Escape.
export default function MultiSelect({ label, field, options, selected, onChange, dict, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const count = selected.length;
  const active = count > 0;

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2 border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 ${
          active || open ? "border-green-400" : "border-gray-200"
        } ${active ? "text-gray-800" : "text-gray-500"}`}
      >
        {active && (
          <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold px-2 leading-5">
            {count}
          </span>
        )}
        <span>{label}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 w-56 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-20"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs text-gray-400">
              {dict.filters.selectedCount.replace("{count}", count)}
            </span>
            {active && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-green-700 hover:text-green-800"
              >
                {dict.filters.clear}
              </button>
            )}
          </div>
          {options.map((o) => {
            const checked = selected.includes(o);
            return (
              <label
                key={o}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm cursor-pointer ${
                  checked ? "bg-green-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o)}
                  className="w-4 h-4 rounded accent-green-600"
                />
                <span>{tField(field, o, lang)}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
