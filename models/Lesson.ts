export interface Lesson {
  newWords: Word[];
  allWords: Word[];
  allSenses: any;
}

interface Root {
  id: string;
  root: string;
  meaning: string;
}

export interface Word {
  id: string;
  root_id: string;
  word: string;
  prefix: string;
  infix: string;
  postfix: string;
  prefix_meaning: string;
  infix_meaning: string;
  postfix_meaning: string;
  phonetic: string;
  vocab_senses: VocabSense[];
  audio_path: string;
}

interface VocabSense {
  id: string;
  pos: string;
  word: string;
  definition: string;
}

export interface Question {
  question: string;
  answer_blocks: string[];
  correct_answer: string;
  type: "fill_in_blank" | "multiple_choice";
  vocab_id: string;
}
