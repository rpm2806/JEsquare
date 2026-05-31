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

export default function ExtractQuestionsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Uploading document...');
  
  const [bookDetected, setBookDetected] = useState('');
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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

  const pollJobStatus = (id: string) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/ocr/job/${id}`);
        const { status, progress, processedPages, totalPages, questionsCount, questions: extractedQuestions, bookDetected: detectedBook, error } = res.data;

        setProgress(progress || 0);
        setProcessedPages(processedPages || 0);
        setTotalPages(totalPages || 1);
        setQuestionsCount(questionsCount || 0);

        if (status === 'COMPLETED') {
          setProgress(100);
          setBookDetected(detectedBook || 'JEE Test Bank');
          const parsed = (extractedQuestions || []).map((q: any) => ({
            ...q,
            accepted: true,
          }));
          setQuestions(parsed);
          setTimeout(() => {
            setStep('review');
          }, 800);
        } else if (status === 'FAILED') {
          alert(`Extraction job failed: ${error || 'Unknown error'}`);
          setStep('upload');
        } else {
          pollJobStatus(id);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        pollJobStatus(id);
      }
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const startExtraction = async () => {
    if (!selectedFile) return;

    setStep('processing');
    setProgress(0);
    setProcessedPages(0);
    setTotalPages(1);
    setQuestionsCount(0);
    setStatusMessage('Uploading and parsing document...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/ocr/ingest-job', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { jobId: newJobId, totalPages: pagesCount } = res.data;
      setJobId(newJobId);
      setTotalPages(pagesCount || 1);
      setStatusMessage('Initializing background extraction...');
      
      pollJobStatus(newJobId);
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      const errMsg = err.response?.data?.message || 'OCR Question extraction failed to initialize. Please ensure the file is under 50MB and try again.';
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
              
              {selectedFile ? (
                <div>
                  <Badge variant="primary" className="mb-2">Selected File</Badge>
                  <p className="text-base font-semibold text-white truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">Drag & drop your question bank here</p>
                  <p className="text-xs text-slate-500 mt-1.5"><span className="text-indigo-400">Browse files</span> from your local system</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
              />
              <p className="text-[11px] text-slate-600 mt-6 uppercase tracking-wider">PDF, PNG, JPEG up to 50MB</p>
            </div>

            <Button
              onClick={startExtraction}
              disabled={!selectedFile}
              className="mt-8 px-10"
              size="lg"
            >
              Start Extraction
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: PROCESSING TICKER */}
      {step === 'processing' && (
        <Card className="py-16 text-center animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
              <BookOpen className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {processedPages > 0 ? `Processing Page ${processedPages} of ${totalPages}` : statusMessage}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              {questionsCount > 0 
                ? `✨ Extracted ${questionsCount} questions so far...` 
                : 'Analyzing document structure and parsing pages...'}
            </p>

            <div className="w-full max-w-md mt-8">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-8 max-w-md px-4 leading-relaxed">
              Respecting Gemini API rate limits. The system processes each page sequentially with a 4-second delay to guarantee complete ingestion of massive books or documents without timeout failures.
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
