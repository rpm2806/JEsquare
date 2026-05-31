'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Pagination } from '../../../components/ui/pagination';
import { QuestionFiltersPanel } from '../../../components/questions/question-filters';
import { truncate } from '../../../lib/utils';
import type { QuestionFilters, Question } from '../../../types';
import api from '../../../lib/api';
import { Loader2, Plus, Sparkles, Inbox, Trash2, Edit } from 'lucide-react';

const difficultyColor: Record<string, 'success' | 'warning' | 'danger'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'danger',
};

const subjectColors: Record<string, 'primary' | 'purple' | 'info'> = {
  PHYSICS: 'primary',
  CHEMISTRY: 'purple',
  MATHEMATICS: 'info',
};

export default function QuestionsPage() {
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Dynamic API fetching of question bank
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          limit: 10,
        };

        if (search) params.search = search;
        if (filters.subject) params.subject = filters.subject;
        if (filters.chapter) params.chapter = filters.chapter;
        if (filters.topic) params.topic = filters.topic;
        if (filters.difficulty) params.difficulty = filters.difficulty;
        if (filters.type) params.type = filters.type;

        const res = await api.get('/questions', { params });
        setQuestions(res.data.questions || []);
        setTotalQuestions(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching dynamic questions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [currentPage, search, filters]);

  const handleDelete = async (questionId: string) => {
    const confirmDelete = confirm("Are you sure you want to permanently delete this question?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/questions/${questionId}`);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setTotalQuestions((prev) => prev - 1);
      alert("Question deleted successfully!");
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Failed to delete question.");
    }
  };

  return (
    <div className="animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Question Bank</h1>
          <p className="text-slate-400 mt-1">Manage and organize your question library</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/questions/extract">
            <Button variant="secondary" icon={<Sparkles className="w-4 h-4" />}>
              Extract from PDF
            </Button>
          </Link>
          <Link href="/questions/create">
            <Button icon={<Plus className="w-4 h-4" />}>
              Create Question
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <QuestionFiltersPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters({})}
            />
          </Card>
        </div>

        {/* Questions Area */}
        <div className="lg:col-span-3 space-y-5">
          {/* Search */}
          <Input
            placeholder="Search questions by text..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          {/* Results Info Panel */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-slate-500 text-sm">Querying database question records...</p>
            </div>
          ) : questions.length === 0 ? (
            /* Premium Empty State */
            <Card className="py-20 text-center border-slate-800/80 bg-slate-900/10">
              <Inbox className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">Question Bank is Empty</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                There are currently no questions in your database. 
                Upload an exam PDF to let the AI automatically extract them, or create questions manually!
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/questions/extract">
                  <Button variant="secondary" icon={<Sparkles className="w-4 h-4" />}>
                    Extract from PDF
                  </Button>
                </Link>
                <Link href="/questions/create">
                  <Button icon={<Plus className="w-4 h-4" />}>
                    Create Question
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Showing <span className="text-white font-medium">{questions.length}</span> of <span className="text-white font-medium">{totalQuestions}</span> questions
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Sort by:</span>
                  <select className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                    <option>Newest</option>
                    <option>Difficulty</option>
                    <option>Subject</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Question Cards */}
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="lazy-render">
                    <Card hover className="group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant={subjectColors[q.subject?.name?.toUpperCase() || 'PHYSICS']}>
                              {q.subject?.name || 'PHYSICS'}
                            </Badge>
                            <Badge variant={difficultyColor[q.difficulty || 'MEDIUM']}>
                              {q.difficulty}
                            </Badge>
                            <Badge variant="default">{q.type}</Badge>
                            {q.code && (
                              <Badge variant="info">
                                🔑 {q.code}
                              </Badge>
                            )}
                            {q.isVerified && <Badge variant="success" dot>Verified</Badge>}
                            {q.flagCount > 0 && (
                              <Badge variant="danger">
                                🚩 Reported ({q.flagCount})
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{truncate(q.text, 220)}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                            <span>{q.chapter?.name || 'General'}</span>
                            <span>•</span>
                            <span>{q.source || 'Standard Reference'}</span>
                            {q.year && (
                              <>
                                <span>•</span>
                                <span>Year {q.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/questions/${q.id}/edit`}>
                            <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Dynamic Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
