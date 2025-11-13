export interface Vocabulary {
  id: string;
  prefix: string;
  infix: string;
  postfix: string;
  prefix_meaning: string;
  infix_meaning: string;
  postfix_meaning: string;
  phonetic: string;
  vocab_examples: Vocab_Example[];
  vocab_senses: Vocab_Sense[];
  word: string;
  definition_vi: string;
  created_at: string;
  // Optional fields used by UI components
  pos?: string;
  example_en?: string;
  example_vi?: string;
  audio_path: string;
}

interface Vocab_Sense {
  id: string;
  vocab_id: string;
  word: string;
  pos: string;
  definition: string;
  sense_order: number;
  created_at: string;
}

interface Vocab_Example {
  id: string;
  vocab_id: string;
  example_en: string;
  example_vi: string;
  example_order: number;
  created_at: string;
}
