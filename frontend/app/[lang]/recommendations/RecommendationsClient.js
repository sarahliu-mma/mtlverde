"use client";
import { useState, useRef, useEffect } from "react";
import Header from "../Header";
import { API_BASE } from "@/lib/api";

export default function RecommendationsClient({ dict, lang }) {
  const r = dict.recommendations;
  const c = dict.chatWidget;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to the latest message whenever the conversation grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, lang }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: c.error },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header dict={dict} lang={lang} subtitle={r.heading} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{r.heading}</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">{r.intro}</p>

        {/* Conversation area */}
        <div className="flex-1 bg-white rounded-xl shadow border flex flex-col min-h-[50vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400">{r.chatEmptyHint}</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-3 rounded-lg max-w-[80%] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-green-100 ml-auto"
                    : "bg-gray-100 mr-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-400">{c.thinking}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={c.placeholder}
            />
            <button
              onClick={sendMessage}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
            >
              {c.send}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
