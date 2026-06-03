export interface UploadSuccess {
  message: string;
  total_chunks: number;
  embedding_dimension: number;
}

export interface AskSuccess {
  question: string;
  answer: string;
  retrieved_chunks: string[];
}

export interface ApiError {
  error: string;
}

export type UploadResponse = UploadSuccess | ApiError;
export type AskResponse = AskSuccess | ApiError;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}
