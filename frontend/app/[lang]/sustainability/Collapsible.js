"use client";
import { useState } from "react";

export default function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
      >
        <span className="text-lg font-semibold text-green-700">{title}</span>
        <span className={`shrink-0 text-gray-400 text-xs transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          {"\u25BC"}
        </span>
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-gray-100">{children}</div>}
    </div>
  );
}
