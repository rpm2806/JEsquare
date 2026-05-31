'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import api from '../../../../lib/api';
import { Loader2, Upload, BookOpen, Check, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { LaTeXRenderer } from '../../../../components/questions/latex-renderer';

interface ExtractedQuestion {
  text: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  type: string;
  difficulty: string;
  subjectId: string;
  chapterId: string;
  confidence: number;
  accepted?: boolean;
  source?: string;
  year?: number;
  tags?: string;
  subjectName?: string;
  chapterName?: string;
}

type UploadStep = 'upload' | 'processing' | 'review';

interface ActiveJob {
  jobId: string;
  filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  processedPages: number;
  totalPages: number;
  questionsCount: number;
  error?: string;
  questions?: ExtractedQuestion[];
}

export default function ExtractQuestionsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Uploading documents...');
  
  const [bookDetected, setBookDetected] = useState('');
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  const [jobId, setJobId] = useState<string | null>(null);
  const [processedPages, setProcessedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [questionsCount, setQuestionsCount] = useState(0);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  const startPollingAllJobs = (jobsToPoll: ActiveJob[]) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const updatedJobs = await Promise.all(
          jobsToPoll.map(async (job) => {
            if (job.status === 'COMPLETED' || job.status === 'FAILED') {
              return job;
            }
            try {
              const res = await api.get(`/ocr/job/${job.jobId}`);
              const { status, progress: jobProgress, processedPages: jobProcessed, totalPages: jobTotal, questionsCount: jobQCount, questions: jobQuestions } = res.data;
              return {
                ...job,
                status: status || 'PROCESSING',
                progress: jobProgress || 0,
                processedPages: jobProcessed || 0,
                totalPages: jobTotal || 1,
                questionsCount: jobQCount || 0,
                questions: jobQuestions || [],
              };
            } catch (err) {
              console.error(`Error polling job ${job.jobId}:`, err);
              return job;
            }
          })
        );

        setActiveJobs(updatedJobs);

        // Compute aggregate metrics for legacy states / charts
        const totalPagesSum = updatedJobs.reduce((acc, j) => acc + (j.totalPages || 1), 0);
        const processedPagesSum = updatedJobs.reduce((acc, j) => acc + (j.processedPages || 0), 0);
        const totalCount = updatedJobs.reduce((acc, j) => acc + (j.questionsCount || 0), 0);
        const avgProgress = Math.round(updatedJobs.reduce((acc, j) => acc + (j.progress || 0), 0) / updatedJobs.length);

        setProgress(avgProgress);
        setProcessedPages(processedPagesSum);
        setTotalPages(totalPagesSum);
        setQuestionsCount(totalCount);
        setTotalQuestionsCount(totalCount);

        const hasIncomplete = updatedJobs.some(
          (j) => j.status === 'PENDING' || j.status === 'PROCESSING'
        );

        if (!hasIncomplete) {
          // Finalize and merge all extracted questions
          const aggregatedQuestions: ExtractedQuestion[] = [];
          updatedJobs.forEach((j) => {
            if (j.status === 'COMPLETED' && j.questions) {
              aggregatedQuestions.push(...j.questions);
            }
          });

          // De-duplicate aggregated questions by normalized text
          const uniqueQuestions: ExtractedQuestion[] = [];
          const texts = new Set<string>();
          aggregatedQuestions.forEach((q) => {
            const normalized = q.text.trim().toLowerCase();
            if (!texts.has(normalized)) {
              texts.add(normalized);
              uniqueQuestions.push({
                ...q,
                accepted: true,
              });
            }
          });

          setQuestions(uniqueQuestions);
          
          const books = updatedJobs
            .filter((j) => j.status === 'COMPLETED')
            .map((j) => j.filename.replace(/\.[^/.]+$/, ''));
          setBookDetected(books.join(', ') || 'JEE Multi-Book Ingest');

          setTimeout(() => {
            setStep('review');
          }, 1000);
        } else {
          startPollingAllJobs(updatedJobs);
        }
      } catch (err) {
        console.error('Error in multi-polling cycle:', err);
        startPollingAllJobs(jobsToPoll);
      }
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const startExtraction = async () => {
    if (selectedFiles.length === 0) return;

    setStep('processing');
    setProgress(0);
    setProcessedPages(0);
    setTotalPages(1);
    setQuestionsCount(0);
    setTotalQuestionsCount(0);
    setActiveJobs([]);
    setStatusMessage('Uploading and queuing documents...');

    try {
      const initializedJobs: ActiveJob[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/ocr/ingest-job', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const { jobId: newJobId, totalPages: pagesCount } = res.data;
        initializedJobs.push({
          jobId: newJobId,
          filename: file.name,
          status: 'PENDING',
          progress: 0,
          processedPages: 0,
          totalPages: pagesCount || 1,
          questionsCount: 0,
        });
      }

      setActiveJobs(initializedJobs);
      setStatusMessage('Sequential background extraction active...');
      
      startPollingAllJobs(initializedJobs);
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      const errMsg = err.response?.data?.message || 'OCR Question extraction failed to initialize. Please ensure all files are under 50MB and try again.';
      alert(errMsg);
      setStep('upload');
    }
  };

  const toggleAccept = (index: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, accepted: !q.accepted } : q))
    );
  };

  const handleImport = async () => {
    const acceptedList = questions.filter((q) => q.accepted);
    if (acceptedList.length === 0) {
      alert('Please accept at least one question to import.');
      return;
    }

    try {
      setImporting(true);
      const questionsToImport = acceptedList.map((q) => ({
        type: q.type,
        text: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        subjectId: q.subjectId,
        chapterId: q.chapterId,
        source: q.source || bookDetected,
        year: q.year ? parseInt(q.year as any) : undefined,
        tags: q.tags,
      }));

      await api.post('/questions/bulk', { questions: questionsToImport });
      alert(`Successfully imported ${acceptedList.length} questions into your question bank!`);
      router.push('/questions');
    } catch (e) {
      console.error('Bulk import failed:', e);
      alert('Import failed. Please check backend connection.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Upload className="w-8 h-8 text-indigo-400" />
            Upload Question Paper
          </h1>
          <p className="text-slate-400 mt-1">Upload a PDF or image. The system will auto-detect the book and categorize subjects and chapters.</p>
        </div>
        {step === 'review' && (
          <Button variant="ghost" size="sm" onClick={() => setStep('upload')} icon={<ArrowLeft className="w-4 h-4" />}>
            Upload Another
          </Button>
        )}
      </div>

      {/* Steps Progress Header */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { id: 'upload', label: 'Upload Paper', num: 1 },
          { id: 'processing', label: 'Auto-Detect & Process', num: 2 },
          { id: 'review', label: 'Review & Import', num: 3 },
        ].map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                step === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' :
                ['upload', 'processing', 'review'].indexOf(step) > i ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                'bg-slate-800 text-slate-500 border border-slate-700/50'
              )}>
                {['upload', 'processing', 'review'].indexOf(step) > i ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={cn('text-sm font-medium', step === s.id ? 'text-white' : 'text-slate-500')}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div className={cn('flex-1 h-0.5 rounded transition-all duration-500', ['upload', 'processing', 'review'].indexOf(step) > i ? 'bg-indigo-500' : 'bg-slate-800')} />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: UPLOAD ZONE */}
      {step === 'upload' && (
        <Card className="p-8">
          <div className="flex flex-col items-center py-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerBrowse}
              className={cn(
                'w-full max-w-xl border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center',
                dragOver 
                  ? 'border-indigo-400 bg-indigo-500/5 shadow-2xl shadow-indigo-500/5' 
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
              )}
            >
              <div className="w-16 h-16 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              
              {selectedFiles.length > 0 ? (
                <div className="w-full max-w-md">
                  <Badge variant="primary" className="mb-3">
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'} Selected
                  </Badge>
                  
                  <div className="space-y-2 mt-2 w-full text-left max-h-48 overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-xs text-slate-300 shadow-sm"
                      >
                        <span className="truncate font-semibold max-w-[260px]">{file.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">Drag & drop your question books here</p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Select <span className="text-indigo-400 font-medium">one or multiple files</span> to ingest in one go
                  </p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                multiple
              />
              <p className="text-[11px] text-slate-600 mt-6 uppercase tracking-wider">PDF, PNG, JPEG books or papers</p>
            </div>

            <Button
              onClick={startExtraction}
              disabled={selectedFiles.length === 0}
              className="mt-8 px-12"
              size="lg"
            >
              Start Ingestion
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: PROCESSING TICKER */}
      {step === 'processing' && (
        <Card className="py-16 text-center animate-fade-in px-6">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
              <BookOpen className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Ingesting Question Banks
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              {totalQuestionsCount > 0 
                ? `✨ Extracted ${totalQuestionsCount} questions so far across all books...` 
                : 'Initializing sequential background extractions...'}
            </p>

            {/* Average Progress Bar */}
            <div className="w-full max-w-md mt-6">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Average Ingestion Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Active Document Ingestion Queue */}
            <div className="w-full max-w-xl mt-10 space-y-4 text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Document Ingestion Queue ({activeJobs.length})
              </h4>
              
              <div className="space-y-3">
                {activeJobs.map((job) => {
                  const isCompleted = job.status === 'COMPLETED';
                  const isFailed = job.status === 'FAILED';
                  const isProcessing = job.status === 'PROCESSING';
                  
                  return (
                    <div 
                      key={job.jobId} 
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md",
                        isCompleted ? "border-emerald-500/25 bg-emerald-500/[0.02]" :
                        isFailed ? "border-rose-500/25 bg-rose-500/[0.02]" :
                        "border-slate-800 bg-slate-900/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BookOpen className={cn(
                            "w-4 h-4 shrink-0",
                            isCompleted ? "text-emerald-400" :
                            isFailed ? "text-rose-400" :
                            "text-indigo-400 animate-pulse"
                          )} />
                          <span className="text-xs font-bold text-white truncate max-w-xs">{job.filename}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {isProcessing && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                              Page {job.processedPages}/{job.totalPages}
                            </span>
                          )}
                          {isCompleted && (
                            <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5">
                              Completed
                            </Badge>
                          )}
                          {isFailed && (
                            <Badge className="bg-rose-500/10 border-rose-500/20 text-rose-400 text-[10px] font-semibold px-2 py-0.5">
                              Failed
                            </Badge>
                          )}
                          {job.status === 'PENDING' && (
                            <Badge className="bg-slate-800 border-slate-700 text-slate-400 text-[10px] font-semibold px-2 py-0.5">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress Metrics & Subtext */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 font-medium">
                        <span>
                          {job.questionsCount > 0 
                            ? `✨ ${job.questionsCount} questions extracted` 
                            : isFailed 
                              ? `Error: ${job.error || 'Parsing failed'}`
                              : 'Queued for sequential processing...'}
                        </span>
                        <span className="font-mono">{job.progress}%</span>
                      </div>

                      {/* Job Progress Indicator */}
                      <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isCompleted ? "bg-emerald-500" :
                            isFailed ? "bg-rose-500" :
                            "bg-gradient-to-r from-indigo-500 to-violet-500"
                          )}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-10 max-w-md px-4 leading-relaxed">
              Respecting Gemini API rate limits. All queued books are processed page-by-page sequentially with a 4-second delay to guarantee complete, timeout-free ingestion.
            </p>
          </div>
        </Card>
      )}

      {/* STEP 3: REVIEW & PERSISTENCE */}
      {step === 'review' && (
        <div className="space-y-6 animate-fade-in">
          {/* Book Detection Announcement */}
          <Card className="border-emerald-500/30 bg-emerald-500/[0.02] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Auto-Detection Success</span>
                <h3 className="text-lg font-bold text-white mt-0.5">📚 Detected Book: {bookDetected}</h3>
              </div>
            </div>
          </Card>

          {/* Action Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Accepted <span className="text-white font-semibold">{questions.filter((q) => q.accepted).length}</span> of <span className="text-white font-semibold">{questions.length}</span> extracted questions.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setQuestions((prev) => prev.map((q) => ({ ...q, accepted: true })))}
                size="sm"
              >
                Accept All
              </Button>
              <Button
                onClick={handleImport}
                isLoading={importing}
                size="sm"
                icon={<Check className="w-4 h-4" />}
              >
                Import Questions
              </Button>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="space-y-4">
            {questions.map((q, i) => (
              <Card
                key={i}
                className={cn(
                  'transition-all border',
                  q.accepted 
                    ? 'border-indigo-500/30 bg-indigo-500/[0.01]' 
                    : 'border-slate-800 bg-slate-900/20 opacity-50'
                )}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-4 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-500">QUESTION {i + 1}</span>
                      <Badge variant={q.type === 'MCQ' ? 'primary' : 'warning'}>
                        {q.type}
                      </Badge>
                      <Badge variant={q.difficulty === 'HARD' ? 'danger' : q.difficulty === 'MEDIUM' ? 'warning' : 'success'}>
                        {q.difficulty}
                      </Badge>
                      {q.subjectName && (
                        <Badge variant="default" className="bg-blue-500/10 border-blue-500/25 text-blue-400">
                          🧪 {q.subjectName}
                        </Badge>
                      )}
                      {q.chapterName && (
                        <Badge variant="default" className="bg-violet-500/10 border-violet-500/25 text-violet-400">
                          📂 {q.chapterName}
                        </Badge>
                      )}
                      <Badge variant="success">
                        🎯 {q.confidence}% confidence
                      </Badge>
                      {q.source && (
                        <Badge variant="default" className="bg-indigo-500/10 border-indigo-500/25 text-indigo-400">
                          📚 {q.source}
                        </Badge>
                      )}
                      {q.year && (
                        <Badge variant="default" className="bg-amber-500/10 border-amber-500/25 text-amber-400">
                          📅 {q.year}
                        </Badge>
                      )}
                      {q.tags && (
                        <Badge variant="default" className="bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
                          🏷️ {q.tags}
                        </Badge>
                      )}
                    </div>

                    {/* Question Body */}
                    <div className="text-slate-200 text-sm leading-relaxed">
                      <LaTeXRenderer content={q.text} />
                    </div>

                    {/* Options (MCQ types) */}
                    {(q.type === 'MCQ' || q.type === 'MULTI_CORRECT') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {[
                          { key: 'A', text: q.optionA },
                          { key: 'B', text: q.optionB },
                          { key: 'C', text: q.optionC },
                          { key: 'D', text: q.optionD },
                        ].map((opt) => {
                          if (!opt.text) return null;
                          const isCorrect = q.correctAnswer.includes(opt.key);
                          return (
                            <div
                              key={opt.key}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border transition-all text-xs',
                                isCorrect 
                                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300 font-semibold' 
                                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
                              )}
                            >
                              <span className={cn(
                                'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border shrink-0',
                                isCorrect 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                  : 'bg-slate-800 border-slate-700 text-slate-500'
                              )}>
                                {opt.key}
                              </span>
                              <LaTeXRenderer content={opt.text} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Numerical (Numerical types) */}
                    {q.type === 'NUMERICAL' && (
                      <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 text-xs inline-flex items-center gap-2 font-semibold">
                        <span>Numerical Answer:</span>
                        <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-white">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  {/* Toggle Accept Button */}
                  <button
                    onClick={() => toggleAccept(i)}
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center transition-all border shrink-0 shadow-lg',
                      q.accepted
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/5'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5'
                    )}
                  >
                    {q.accepted ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom Sticky Action Panel */}
          <Card className="flex items-center justify-between p-4 border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky bottom-4 z-10 shadow-2xl">
            <span className="text-xs text-slate-400 font-medium">Ready to import questions? Verified book mappings will be stored in your SQLite database.</span>
            <Button
              onClick={handleImport}
              isLoading={importing}
              icon={<Check className="w-4 h-4" />}
            >
              Import {questions.filter((q) => q.accepted).length} Questions
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
