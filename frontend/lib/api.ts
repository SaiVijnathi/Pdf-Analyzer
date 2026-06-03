import type { AskResponse, UploadResponse } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function isApiError(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  );
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  if (isApiError(data)) {
    throw new Error(data.error);
  }
  if (!response.ok) {
    throw new Error("Something went wrong. Please try again.");
  }
  return data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/`, { method: "GET" });
    if (!response.ok) return false;
    const data = (await response.json()) as { message?: string };
    return data.message === "Hello";
  } catch {
    return false;
  }
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload_file`, {
    method: "POST",
    body: formData,
  });

  return parseJson<UploadResponse>(response);
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const params = new URLSearchParams({ question });
  const response = await fetch(`${API_BASE}/ask?${params.toString()}`, {
    method: "POST",
  });

  return parseJson<AskResponse>(response);
}
