export type AnimalType = 'tiger' | 'peacock' | 'koala' | 'owl' | 'chameleon';

export interface Question {
  id: number;          // 排序序号 1-30
  text: string;        // 题干
  options: Option[];   // 5个选项
}

export interface Option {
  score: number;       // 1-5
  content: string;     // "完全不同意" 等
}

export interface ScoreMap {
  tiger: number;
  peacock: number;
  koala: number;
  owl: number;
  chameleon: number;
}

export interface ResultData {
  primaryType: AnimalType;
  scores: ScoreMap;
  totalCompleted: number;
}

export type AssessmentState = 'idle' | 'in_progress' | 'submitted' | 'completed';
