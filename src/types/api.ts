export interface Passage {
  id: string;
  text: string;
  source?: string | null;
  cc_labels: string[];
  created_at?: string;
}

export interface Reference {
  id: string;
  passage_id: string;
  questions: string;
  answers: string;
  llm_model?: string | null;
  generated_at?: string;
  structured_payload?: ReferenceStructuredPayload | null;
}

export interface SearchResult {
  passage_id: string;
  preview: string;
  source?: string | null;
  cc_labels: string[];
  created_at?: string;
}

export interface ReferenceStructuredPayload {
  items: ReferenceStructuredItem[];
}

export interface ReferenceStructuredItem {
  type: "paragraph" | "integrated";
  paragraph?: number;
  index?: number;
  question: string;
  correct_answer: string;
  explanation: string;
}

export interface RequestRecord {
  id: string;
  text: string;
  source?: string | null;
  cc_name?: string | null;
  status: "pending" | "processing" | "completed";
  request_count: number;
  created_at?: string;
}
