"use client";
import { useState } from "react";

export default function ChatWidget({ lang, dict }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(
        "https://mtlverde-production.up.railway.app/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
body: JSON.stringify({ message: userMsg, lang }),        }
      );
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
{ role: "assistant", text: dict.chatWidget.error },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {open ? (
        <div className="w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col border">
          <div className="bg-green-600 text-white p-3 rounded-t-lg flex justify-between items-center">
<span>{dict.chatWidget.title}</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded max-w-[80%] ${
                  m.role === "user"
                    ? "bg-green-100 ml-auto"
                    : "bg-gray-100 mr-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-sm text-gray-400">Thinking...</div>}
          </div>
          <div className="p-2 border-t flex gap-1">
            <input
              className="flex-1 border rounded px-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
placeholder={dict.chatWidget.placeholder}
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-3 rounded text-sm"
            >
              {dict.chatWidget.send}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-green-600 text-white rounded-full w-14 h-14 shadow-lg"
        >
          💬
        </button>
      )}
    </div>
  );
}
