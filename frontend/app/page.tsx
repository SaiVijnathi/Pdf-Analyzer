"use client";

import { useCallback, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { askQuestion, uploadPdf } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

export default function Home() {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [totalChunks, setTotalChunks] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasDocument = uploadedFileName !== null && totalChunks !== null;

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadPdf(file);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      setUploadedFileName(file.name);
      setTotalChunks(result.total_chunks);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleAsk = useCallback(
    async (question: string) => {
      if (!hasDocument) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsAsking(true);
      setError(null);

      try {
        const result = await askQuestion(question);
        if ("error" in result) {
          setError(result.error);
          return;
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
          sources: result.retrieved_chunks,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not get an answer.");
      } finally {
        setIsAsking(false);
      }
    },
    [hasDocument],
  );

  return (
    <div className="flex min-h-full flex-col bg-[#f7f5f2]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-xl">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl">
            Talk to your PDF
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
            Drop in a document and ask questions in plain English. The app
            finds relevant passages and answers using Gemini.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <span className="mt-0.5 shrink-0">!</span>
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-8">
          <aside className="space-y-4">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Document
              </h3>
              <UploadZone
                onUpload={handleUpload}
                isUploading={isUploading}
                uploadedFileName={uploadedFileName}
                totalChunks={totalChunks}
              />
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-xs leading-relaxed text-stone-500 shadow-sm">
              <p className="font-medium text-stone-700">How it works</p>
              <ol className="mt-2 list-inside list-decimal space-y-1.5">
                <li>Text is extracted from each page</li>
                <li>Content is split into searchable chunks</li>
                <li>Your question pulls the top 3 matches</li>
                <li>Gemini answers using that context only</li>
              </ol>
            </div>
          </aside>

          <section className="min-h-[520px]">
            <ChatPanel
              messages={messages}
              onSend={handleAsk}
              isAsking={isAsking}
              hasDocument={hasDocument}
            />
          </section>
        </div>
      </main>

      <footer className="border-t border-stone-200/80 py-4 text-center text-xs text-stone-400">
        Built with FastAPI, FAISS & Gemini
      </footer>
    </div>
  );
}
