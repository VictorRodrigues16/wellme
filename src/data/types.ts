// Tipos compartilhados do SaúdeQuest.

export type MissionStatus = 'locked' | 'available' | 'completed';
export type MissionCategory = 'hidratacao' | 'movimento' | 'alimentacao' | 'mente' | 'sono' | 'prevencao' | 'habitos';
export type MissionType = 'calculator' | 'multi_select' | 'timer_sequence' | 'quiz' | 'drag_drop_plate' | 'true_false' | 'breathing';

// Calculator
export interface CalculatorInput {
  key: string;
  type: 'slider' | 'buttonGroup' | 'timeInput';
  label: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number | string;
  unit?: string;
  options?: { value: number; label: string; subtitle?: string }[];
}

export interface CalculatorContent {
  intro?: string;
  inputs: CalculatorInput[];
  formula?: string;
  customCalculation?: string;
  resultLabel: string;
  resultUnit?: string;
  extraDisplay?: string;
  explanation: string[];
}

// MultiSelect
export interface MultiSelectOption {
  text: string;
  correct: boolean;
  explanation: string;
}

export interface MultiSelectContent {
  question: string;
  options: MultiSelectOption[];
}

// TimerSequence
export interface TimerStep {
  icon: string;
  name: string;
  duration: number;
  instruction: string;
}

export interface TimerSequenceContent {
  intro: string;
  steps: TimerStep[];
  completion: string;
}

// Quiz (new format)
export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  emoji?: string;
  text: string;
  options: QuizOption[];
  explanation: string;
}

export interface QuizContent {
  intro?: string;
  questions: QuizQuestion[];
}

// DragDropPlate
export interface PlateFood {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

export interface PlateScoring {
  hasVegetal: number;
  hasProteina: number;
  hasCarboBom: number;
  hasGorduraBoa: number;
  noUltra: number;
  perUltraPenalty: number;
}

export interface PlateFeedbackRange {
  min: number;
  title: string;
  message: string;
}

export interface DragDropPlateContent {
  instruction: string;
  maxItems: number;
  foods: PlateFood[];
  scoring: PlateScoring;
  feedbackRanges: PlateFeedbackRange[];
}

// TrueFalse
export interface TrueFalseStatement {
  text: string;
  isTrue: boolean;
  explanation: string;
}

export interface TrueFalseContent {
  intro: string;
  statements: TrueFalseStatement[];
}

// Breathing
export interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
}

export interface BreathingContent {
  intro: string;
  cycles: number;
  phases: BreathingPhase[];
  completion: string;
}

export type MissionContent =
  | CalculatorContent
  | MultiSelectContent
  | TimerSequenceContent
  | QuizContent
  | DragDropPlateContent
  | TrueFalseContent
  | BreathingContent;

export interface Mission {
  id: number;
  module: string;
  moduleIcon: string;
  title: string;
  description: string;
  category: MissionCategory;
  xpReward: number;
  type: MissionType;
  status: MissionStatus;
  content: MissionContent;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface User {
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastCompletedDate: string | null;
  completedDates: string[];
}

export interface GameState {
  user: User;
  missions: Mission[];
  achievements: Achievement[];
}
