"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (question: string) => Promise<void>;
  isAsking: boolean;
  hasDocument: boolean;
}

const STARTER_QUESTIONS = [
  "Summarize the main points",
  "What are the key dates mentioned?",
  "List any names or organizations",
];

export function ChatPanel({
  messages,
  onSend,
  isAsking,
  hasDocument,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAsking]);

  const submit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isAsking || !hasDocument) return;
    setInput("");
    await onSend(trimmed);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className="flex h-full min-h-[480px] flex-col rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-stone-900">Ask your document</h2>
        <p className="mt-0.5 text-xs text-stone-500">
          Answers are grounded in the uploaded PDF using semantic search + Gemini.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {!hasDocument ? (
          <EmptyState />
        ) : messages.length === 0 ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-stone-500">
              Your PDF is ready. Try one of these, or type your own question.
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isAsking}
                  onClick={() => void onSend(q)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {isAsking && (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
            </span>
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-100 p-4">
        <div className="flex gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!hasDocument || isAsking}
            placeholder={
              hasDocument
                ? "Ask anything about the document…"
                : "Upload a PDF to start asking questions"
            }
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!hasDocument || isAsking || !input.trim()}
            className="self-end rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-stone-700">No document yet</p>
      <p className="mt-1 max-w-xs text-xs text-stone-500">
        Upload a PDF on the left to index its contents and start a conversation.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-stone-900 text-white"
            : "border border-stone-100 bg-stone-50 text-stone-800",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 border-t border-stone-200/80 pt-2">
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              className="text-xs font-medium text-amber-800 hover:text-amber-900"
            >
              {showSources ? "Hide" : "Show"} {message.sources.length} source
              {message.sources.length === 1 ? "" : "s"}
            </button>
            {showSources && (
              <ul className="mt-2 space-y-2">
                {message.sources.map((chunk, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-stone-600 ring-1 ring-stone-200/80"
                  >
                    {chunk.trim()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
