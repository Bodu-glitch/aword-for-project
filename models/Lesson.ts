export interface Lesson {
  newWords: Word[];
  allWords: Word[];
  questions: Question[];
}

interface Root {
  id: string;
  root: string;
  meaning: string;
}

interface Word {
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
}

interface VocabSense {
  id: string;
  pos: string;
  word: string;
  definition: string;
}

interface Question {
  question: string;
  answer_blocks: string[];
  correct_answer: string;
  type: "fill_in_blank" | "multiple_choice";
  vocab_id: string;
}
