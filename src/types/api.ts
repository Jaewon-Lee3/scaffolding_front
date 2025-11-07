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
}

export interface SearchResult {
  passage_id: string;
  preview: string;
  source?: string | null;
  cc_labels: string[];
  created_at?: string;
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
