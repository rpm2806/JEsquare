'use client';

import { create } from 'zustand';
import type { AnswerStatus } from '../types';
import api from '../lib/api';

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
  attemptId: string | null;
  questions: any[];

  // Actions
  setAttemptInfo: (attemptId: string, questions: any[]) => void;
  restoreAttemptState: (attemptId: string, questions: any[], savedAnswers: any[]) => void;
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
  attemptId: null,
  questions: [],

  setAttemptInfo: (attemptId, questions) => set({ attemptId, questions }),

  restoreAttemptState: (attemptId: string, questions: any[], savedAnswers: any[]) => {
    const answers = new Map<number, string>();
    const statuses = new Map<number, AnswerStatus>();
    const markedForReview = new Set<number>();
    const visited = new Set<number>();

    questions.forEach((q, index) => {
      const sa = savedAnswers.find((a) => a.questionId === q.id);
      if (sa) {
        const answerVal = q.type === 'NUMERICAL'
          ? (sa.numericalAnswer !== null && sa.numericalAnswer !== undefined ? String(sa.numericalAnswer) : undefined)
          : sa.selectedOption;

        if (answerVal !== undefined && answerVal !== null && answerVal !== '') {
          answers.set(index, answerVal);
        }

        if (sa.isMarkedForReview) {
          markedForReview.add(index);
        }

        if (sa.isVisited) {
          visited.add(index);
        }

        // Determine status
        const hasAnswer = answers.has(index);
        if (hasAnswer) {
          statuses.set(
            index,
            sa.isMarkedForReview ? 'ANSWERED_AND_MARKED' : 'ANSWERED'
          );
        } else {
          if (sa.isMarkedForReview) {
            statuses.set(index, 'MARKED_FOR_REVIEW');
          } else if (sa.isVisited) {
            statuses.set(index, 'NOT_ANSWERED');
          }
        }
      }
    });

    // Make sure we always mark the first question as visited
    if (questions.length > 0) {
      visited.add(0);
      if (!statuses.has(0)) {
        statuses.set(0, 'NOT_ANSWERED');
      }
    }

    set({
      attemptId,
      questions,
      answers,
      statuses,
      markedForReview,
      visited,
      currentQuestion: 0,
      currentSection: 0,
    });
  },

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

    // Autosave to backend if attempt info is active
    const { attemptId, questions } = get();
    if (attemptId && questions[questionIndex]) {
      const q = questions[questionIndex];
      const payload: any = {
        questionId: q.id,
        isMarkedForReview: marked.has(questionIndex),
        isVisited: true,
      };
      if (q.type === 'NUMERICAL') {
        payload.numericalAnswer = parseFloat(answer);
      } else {
        payload.selectedOption = answer;
      }
      api.post(`/attempts/${attemptId}/answer`, payload).catch((err) => {
        console.error('Autosave answer failed:', err);
      });
    }
  },

  clearAnswer: (questionIndex) => {
    const answers = new Map(get().answers);
    const statuses = new Map(get().statuses);
    answers.delete(questionIndex);
    statuses.set(questionIndex, 'NOT_ANSWERED');
    set({ answers, statuses });

    // Autosave clear response to backend if attempt info is active
    const { attemptId, questions, markedForReview } = get();
    if (attemptId && questions[questionIndex]) {
      const q = questions[questionIndex];
      api.post(`/attempts/${attemptId}/answer`, {
        questionId: q.id,
        selectedOption: null,
        numericalAnswer: null,
        isMarkedForReview: markedForReview.has(questionIndex),
        isVisited: true,
      }).catch((err) => {
        console.error('Autosave clear failed:', err);
      });
    }
  },

  markForReview: (questionIndex) => {
    const marked = new Set(get().markedForReview);
    const statuses = new Map(get().statuses);
    const hasAnswer = get().answers.has(questionIndex);
    marked.add(questionIndex);
    statuses.set(questionIndex, hasAnswer ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW');
    set({ markedForReview: marked, statuses });

    // Autosave mark for review to backend if attempt info is active
    const { attemptId, questions, answers } = get();
    if (attemptId && questions[questionIndex]) {
      const q = questions[questionIndex];
      const ans = answers.get(questionIndex);
      const payload: any = {
        questionId: q.id,
        isMarkedForReview: true,
        isVisited: true,
      };
      if (ans !== undefined) {
        if (q.type === 'NUMERICAL') {
          payload.numericalAnswer = parseFloat(ans);
        } else {
          payload.selectedOption = ans;
        }
      }
      api.post(`/attempts/${attemptId}/answer`, payload).catch((err) => {
        console.error('Autosave mark for review failed:', err);
      });
    }
  },

  unmarkForReview: (questionIndex) => {
    const marked = new Set(get().markedForReview);
    const statuses = new Map(get().statuses);
    const hasAnswer = get().answers.has(questionIndex);
    marked.delete(questionIndex);
    statuses.set(questionIndex, hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED');
    set({ markedForReview: marked, statuses });

    // Autosave unmark to backend if attempt info is active
    const { attemptId, questions, answers } = get();
    if (attemptId && questions[questionIndex]) {
      const q = questions[questionIndex];
      const ans = answers.get(questionIndex);
      const payload: any = {
        questionId: q.id,
        isMarkedForReview: false,
        isVisited: true,
      };
      if (ans !== undefined) {
        if (q.type === 'NUMERICAL') {
          payload.numericalAnswer = parseFloat(ans);
        } else {
          payload.selectedOption = ans;
        }
      }
      api.post(`/attempts/${attemptId}/answer`, payload).catch((err) => {
        console.error('Autosave unmark failed:', err);
      });
    }
  },

  visitQuestion: (questionIndex) => {
    const visited = new Set(get().visited);
    const statuses = new Map(get().statuses);
    visited.add(questionIndex);
    if (!statuses.has(questionIndex)) {
      statuses.set(questionIndex, 'NOT_ANSWERED');
    }
    set({ visited, statuses });

    // Autosave visit state to backend if attempt info is active
    const { attemptId, questions, answers, markedForReview } = get();
    if (attemptId && questions[questionIndex]) {
      const q = questions[questionIndex];
      const ans = answers.get(questionIndex);
      const payload: any = {
        questionId: q.id,
        isMarkedForReview: markedForReview.has(questionIndex),
        isVisited: true,
      };
      if (ans !== undefined) {
        if (q.type === 'NUMERICAL') {
          payload.numericalAnswer = parseFloat(ans);
        } else {
          payload.selectedOption = ans;
        }
      }
      api.post(`/attempts/${attemptId}/answer`, payload).catch((err) => {
        console.error('Autosave visit failed:', err);
      });
    }
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
      attemptId: null,
      questions: [],
    }),
}));
