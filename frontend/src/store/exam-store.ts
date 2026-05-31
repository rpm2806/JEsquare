'use client';

import { create } from 'zustand';
import type { AnswerStatus } from '../types';

interface ExamState {
  currentQuestion: number;
  totalQuestions: number;
  answers: Map<number, string>;
  statuses: Map<number, AnswerStatus>;
  markedForReview: Set<number>;
  visited: Set<number>;
  timeRemaining: number; // in seconds
  currentSection: number;
  sectionNames: string[];
  isSubmitModalOpen: boolean;

  // Actions
  setTotalQuestions: (total: number) => void;
  setSections: (sections: string[]) => void;
  setCurrentSection: (section: number) => void;
  setAnswer: (questionIndex: number, answer: string) => void;
  clearAnswer: (questionIndex: number) => void;
  markForReview: (questionIndex: number) => void;
  unmarkForReview: (questionIndex: number) => void;
  visitQuestion: (questionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (questionIndex: number) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  getStatus: (questionIndex: number) => AnswerStatus;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
  getSummary: () => {
    answered: number;
    notAnswered: number;
    markedForReview: number;
    answeredAndMarked: number;
    notVisited: number;
  };
  reset: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  currentQuestion: 0,
  totalQuestions: 0,
  answers: new Map(),
  statuses: new Map(),
  markedForReview: new Set(),
  visited: new Set(),
  timeRemaining: 0,
  currentSection: 0,
  sectionNames: [],
  isSubmitModalOpen: false,

  setTotalQuestions: (total) => set({ totalQuestions: total }),

  setSections: (sections) => set({ sectionNames: sections }),

  setCurrentSection: (section) => set({ currentSection: section }),

  setAnswer: (questionIndex, answer) => {
    const answers = new Map(get().answers);
    const statuses = new Map(get().statuses);
    const marked = get().markedForReview;
    answers.set(questionIndex, answer);
    statuses.set(
      questionIndex,
      marked.has(questionIndex) ? 'ANSWERED_AND_MARKED' : 'ANSWERED'
    );
    set({ answers, statuses });
  },

  clearAnswer: (questionIndex) => {
    const answers = new Map(get().answers);
    const statuses = new Map(get().statuses);
    answers.delete(questionIndex);
    statuses.set(questionIndex, 'NOT_ANSWERED');
    set({ answers, statuses });
  },

  markForReview: (questionIndex) => {
    const marked = new Set(get().markedForReview);
    const statuses = new Map(get().statuses);
    const hasAnswer = get().answers.has(questionIndex);
    marked.add(questionIndex);
    statuses.set(questionIndex, hasAnswer ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW');
    set({ markedForReview: marked, statuses });
  },

  unmarkForReview: (questionIndex) => {
    const marked = new Set(get().markedForReview);
    const statuses = new Map(get().statuses);
    const hasAnswer = get().answers.has(questionIndex);
    marked.delete(questionIndex);
    statuses.set(questionIndex, hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED');
    set({ markedForReview: marked, statuses });
  },

  visitQuestion: (questionIndex) => {
    const visited = new Set(get().visited);
    const statuses = new Map(get().statuses);
    visited.add(questionIndex);
    if (!statuses.has(questionIndex)) {
      statuses.set(questionIndex, 'NOT_ANSWERED');
    }
    set({ visited, statuses });
  },

  nextQuestion: () => {
    const { currentQuestion, totalQuestions } = get();
    if (currentQuestion < totalQuestions - 1) {
      const next = currentQuestion + 1;
      set({ currentQuestion: next });
      get().visitQuestion(next);
    }
  },

  prevQuestion: () => {
    const { currentQuestion } = get();
    if (currentQuestion > 0) {
      const prev = currentQuestion - 1;
      set({ currentQuestion: prev });
      get().visitQuestion(prev);
    }
  },

  goToQuestion: (questionIndex) => {
    set({ currentQuestion: questionIndex });
    get().visitQuestion(questionIndex);
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  decrementTime: () => {
    const { timeRemaining } = get();
    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  getStatus: (questionIndex) => {
    return get().statuses.get(questionIndex) || 'NOT_VISITED';
  },

  openSubmitModal: () => set({ isSubmitModalOpen: true }),
  closeSubmitModal: () => set({ isSubmitModalOpen: false }),

  getSummary: () => {
    const { totalQuestions, statuses } = get();
    let answered = 0;
    let notAnswered = 0;
    let markedForReview = 0;
    let answeredAndMarked = 0;
    let notVisited = 0;

    for (let i = 0; i < totalQuestions; i++) {
      const status = statuses.get(i) || 'NOT_VISITED';
      switch (status) {
        case 'ANSWERED':
          answered++;
          break;
        case 'NOT_ANSWERED':
          notAnswered++;
          break;
        case 'MARKED_FOR_REVIEW':
          markedForReview++;
          break;
        case 'ANSWERED_AND_MARKED':
          answeredAndMarked++;
          break;
        case 'NOT_VISITED':
          notVisited++;
          break;
      }
    }

    return { answered, notAnswered, markedForReview, answeredAndMarked, notVisited };
  },

  reset: () =>
    set({
      currentQuestion: 0,
      totalQuestions: 0,
      answers: new Map(),
      statuses: new Map(),
      markedForReview: new Set(),
      visited: new Set(),
      timeRemaining: 0,
      currentSection: 0,
      sectionNames: [],
      isSubmitModalOpen: false,
    }),
}));
