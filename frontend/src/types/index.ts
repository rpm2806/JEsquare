// ─── User & Auth ───────────────────────────────────────────────
export type UserRole = 'STUDENT' | 'TEACHER' | 'INSTITUTE_ADMIN' | 'SUPER_ADMIN' | 'SOLVER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleConfirmed?: boolean;
  balance?: number;
  avatar?: string;
  phone?: string;
  instituteId?: string;
  institute?: Institute;
  subscriptionPlan?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ─── Institute ─────────────────────────────────────────────────
export interface Institute {
  id: string;
  name: string;
  code: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  subscriptionId?: string;
  subscription?: Subscription;
  ownerId: string;
  owner?: User;
  teachers?: User[];
  batches?: Batch[];
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  instituteId: string;
  institute?: Institute;
  students?: User[];
  studentCount?: number;
  tests?: Test[];
  createdAt: string;
  updatedAt: string;
}

// ─── Subscription & Billing ────────────────────────────────────
export type PlanType = 'FREE' | 'BASIC' | 'PRO' | 'INSTITUTE';

export interface Subscription {
  id: string;
  plan: PlanType;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  maxQuestions: number;
  maxTests: number;
  maxStudents: number;
  usedQuestions: number;
  usedTests: number;
  usedStudents: number;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Question Bank ─────────────────────────────────────────────
export type QuestionType = 'MCQ' | 'NUMERICAL' | 'MULTI_CORRECT' | 'ASSERTION_REASON' | 'MATRIX_MATCH';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Subject = 'PHYSICS' | 'CHEMISTRY' | 'MATHEMATICS';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  subject: Subject;
  chapter: string;
  topic?: string;
  options?: QuestionOption[];
  correctAnswer: string;
  solution?: string;
  solutionImage?: string;
  image?: string;
  marks: number;
  negativeMarks: number;
  tags?: string[];
  createdById: string;
  createdBy?: User;
  instituteId?: string;
  isVerified: boolean;
  isAIGenerated: boolean;
  sourceExam?: string;
  year?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  image?: string;
  isCorrect: boolean;
}

export interface QuestionFilters {
  subject?: Subject;
  chapter?: string;
  topic?: string;
  difficulty?: Difficulty;
  type?: QuestionType;
  search?: string;
  page?: number;
  limit?: number;
  isVerified?: boolean;
}

// ─── Test ──────────────────────────────────────────────────────
export type TestType = 'FULL_SYLLABUS' | 'PART_SYLLABUS' | 'CHAPTER_WISE' | 'CUSTOM';
export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Test {
  id: string;
  title: string;
  description?: string;
  type: TestType;
  status: TestStatus;
  duration: number; // in minutes
  totalMarks: number;
  totalQuestions: number;
  sections: TestSection[];
  instructions?: string;
  startTime?: string;
  endTime?: string;
  createdById: string;
  createdBy?: User;
  instituteId?: string;
  batchIds?: string[];
  batches?: Batch[];
  attemptCount?: number;
  avgScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestSection {
  id: string;
  name: string;
  subject: Subject;
  questions: Question[];
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface TestCreatePayload {
  title: string;
  type: TestType;
  duration: number;
  subjects: Subject[];
  chapters: string[];
  difficultyDistribution: DifficultyDistribution;
  questionCount: number;
  sections?: Partial<TestSection>[];
}

// ─── Exam Attempt ──────────────────────────────────────────────
export type AnswerStatus = 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface Attempt {
  id: string;
  testId: string;
  test?: Test;
  userId: string;
  user?: User;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  totalMarks: number;
  percentage?: number;
  rank?: number;
  totalAttempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  timeTaken: number; // in seconds
  answers: Answer[];
  sectionScores?: SectionScore[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  question?: Question;
  selectedOption?: string;
  numericalAnswer?: number;
  isCorrect?: boolean;
  marksAwarded: number;
  timeTaken: number; // in seconds
  status: AnswerStatus;
}

export interface SectionScore {
  subject: Subject;
  score: number;
  totalMarks: number;
  attempted: number;
  correct: number;
  incorrect: number;
}

// ─── Doubt Marketplace ────────────────────────────────────────
export type DoubtStatus = 'OPEN' | 'AI_RESPONDED' | 'HUMAN_RESPONDED' | 'RESOLVED' | 'CLOSED';

export interface Doubt {
  id: string;
  title: string;
  description: string;
  image?: string;
  subject: Subject;
  chapter?: string;
  topic?: string;
  status: DoubtStatus;
  askerId: string;
  asker?: User;
  solverId?: string;
  solver?: User;
  aiResponse?: string;
  humanResponse?: string;
  rating?: number;
  bounty?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ────────────────────────────────────────────────
export interface TestAnalytics {
  testId: string;
  totalAttempts: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  avgTimeTaken: number;
  scoreDistribution: { range: string; count: number }[];
  questionAnalysis: QuestionAnalysis[];
}

export interface QuestionAnalysis {
  questionId: string;
  question: Question;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracy: number;
  avgTimeTaken: number;
}

export interface StudentAnalytics {
  userId: string;
  totalTests: number;
  avgScore: number;
  avgPercentage: number;
  bestScore: number;
  subjectWise: SubjectAnalytics[];
  scoreProgression: { date: string; score: number; testName: string }[];
  weakChapters: { chapter: string; subject: Subject; accuracy: number; attempts: number }[];
  ranking: { rank: number; total: number; percentile: number };
}

export interface SubjectAnalytics {
  subject: Subject;
  avgScore: number;
  accuracy: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  avgTimeTaken: number;
}

// ─── Common / Pagination ──────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
