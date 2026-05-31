'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExamStore } from '../../../../store/exam-store';
import { ExamTimer } from '../../../../components/exam/exam-timer';
import { QuestionPalette } from '../../../../components/exam/question-palette';
import { QuestionDisplay } from '../../../../components/exam/question-display';
import { ExamNavigation } from '../../../../components/exam/exam-navigation';
import { SubmitModal } from '../../../../components/exam/submit-modal';
import { cn } from '../../../../lib/utils';
import api from '../../../../lib/api';
import { Loader2, ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useAuthStore } from '../../../../store/auth-store';
import Link from 'next/link';

const mockQuestions = [
  { id: 'q1', text: 'A particle is thrown vertically upward with velocity u from the top of a tower of height H. The time taken by the particle to reach the ground is:', type: 'MCQ' as const, options: [{ label: 'A', text: 'u/g + √(2H/g)' }, { label: 'B', text: '(u + √(u² + 2gH))/g' }, { label: 'C', text: '(u - √(u² + 2gH))/g' }, { label: 'D', text: '2u/g + √(2H/g)' }] },
  { id: 'q2', text: 'Two blocks of masses m₁ = 2 kg and m₂ = 4 kg are connected by a light string passing over a frictionless pulley. The acceleration of the system is:', type: 'MCQ' as const, options: [{ label: 'A', text: 'g/3' }, { label: 'B', text: 'g/2' }, { label: 'C', text: '2g/3' }, { label: 'D', text: 'g/4' }] },
  { id: 'q3', text: 'The electric field at the center of a uniformly charged ring of total charge Q and radius R is:', type: 'MCQ' as const, options: [{ label: 'A', text: 'kQ/R²' }, { label: 'B', text: '0' }, { label: 'C', text: 'kQ/2R²' }, { label: 'D', text: '2kQ/R²' }] },
  { id: 'q4', text: 'For a simple harmonic oscillator, the total energy is proportional to:', type: 'MCQ' as const, options: [{ label: 'A', text: 'Amplitude' }, { label: 'B', text: 'Amplitude²' }, { label: 'C', text: '1/Amplitude' }, { label: 'D', text: '1/Amplitude²' }] },
  { id: 'q5', text: 'The de Broglie wavelength of an electron accelerated through a potential difference of V volts is:', type: 'MCQ' as const, options: [{ label: 'A', text: '12.27/√V Å' }, { label: 'B', text: '1.227/√V Å' }, { label: 'C', text: '0.1227/√V Å' }, { label: 'D', text: '122.7/√V Å' }] },
  { id: 'q6', text: 'Calculate the pH of 0.1 M acetic acid solution (Ka = 1.8 × 10⁻⁵):', type: 'NUMERICAL' as const },
  { id: 'q7', text: 'The number of sp² hybridized carbon atoms in benzene is:', type: 'MCQ' as const, options: [{ label: 'A', text: '2' }, { label: 'B', text: '4' }, { label: 'C', text: '6' }, { label: 'D', text: '3' }] },
  { id: 'q8', text: 'Which of the following are correct about the d-block elements? (Select all that apply)', type: 'MULTI_CORRECT' as const, options: [{ label: 'A', text: 'They show variable oxidation states' }, { label: 'B', text: 'They form colored compounds' }, { label: 'C', text: 'They are always paramagnetic' }, { label: 'D', text: 'They show catalytic activity' }] },
  { id: 'q9', text: 'If f(x) = x³ - 3x² + 2, then the value of f\'(1) is:', type: 'MCQ' as const, options: [{ label: 'A', text: '-3' }, { label: 'B', text: '0' }, { label: 'C', text: '3' }, { label: 'D', text: '-6' }] },
  { id: 'q10', text: 'The area bounded by the curve y = x², the x-axis, and the lines x = 0 and x = 2 is:', type: 'MCQ' as const, options: [{ label: 'A', text: '8/3 sq units' }, { label: 'B', text: '4/3 sq units' }, { label: 'C', text: '2 sq units' }, { label: 'D', text: '4 sq units' }] },
  { id: 'q11', text: 'The eccentricity of the ellipse x²/25 + y²/16 = 1 is:', type: 'MCQ' as const, options: [{ label: 'A', text: '3/5' }, { label: 'B', text: '4/5' }, { label: 'C', text: '5/3' }, { label: 'D', text: '1/5' }] },
  { id: 'q12', text: 'If vectors a = 2i + 3j - k and b = i - 2j + 3k, then a × b equals:', type: 'MCQ' as const, options: [{ label: 'A', text: '7i - 7j - 7k' }, { label: 'B', text: '7i + 7j + 7k' }, { label: 'C', text: '-7i + 7j - 7k' }, { label: 'D', text: '7i - 7j + 7k' }] },
  { id: 'q13', text: 'A carnot engine operates between temperatures 600K and 300K. Its efficiency is:', type: 'MCQ' as const, options: [{ label: 'A', text: '25%' }, { label: 'B', text: '50%' }, { label: 'C', text: '75%' }, { label: 'D', text: '100%' }] },
  { id: 'q14', text: 'The work done by gravity on a projectile of mass m launched at angle θ with velocity v after time t is:', type: 'MCQ' as const, options: [{ label: 'A', text: '-mg²t²/2' }, { label: 'B', text: 'mg²t²/2' }, { label: 'C', text: '-mgvt sinθ + mg²t²/2' }, { label: 'D', text: 'mgvt cosθ' }] },
  { id: 'q15', text: 'Find the value of ∫₀^π sin²x dx:', type: 'NUMERICAL' as const },
];

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSectionsList] = useState<string[]>([]);
  const [testTitle, setTestTitle] = useState('JEsquare Mock Exam');
  const [test, setTest] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const isSubmittingRef = React.useRef(false);

  const {
    currentQuestion,
    setTotalQuestions,
    setSections,
    setTimeRemaining,
    visitQuestion,
    currentSection,
    setCurrentSection,
    goToQuestion,
    reset,
  } = useExamStore();

  useEffect(() => {
    async function loadExam() {
      if (!params.testId) return;



      try {
        setLoading(true);
        
        // 1. Start the test attempt in the database!
        const attemptRes = await api.post('/attempts/start', { testId: params.testId });
        setAttemptId(attemptRes.data.id);

        // 2. Fetch test details
        const res = await api.get(`/tests/${params.testId}`);
        const dbTest = res.data;
        setTest(dbTest);
        setTestTitle(dbTest.title);

        const sectNames = dbTest.sections?.map((s: any) => s.name) || ['Physics', 'Chemistry', 'Mathematics'];
        setSectionsList(sectNames);

        const flatQuestions: any[] = [];
        dbTest.sections?.forEach((sec: any, secIdx: number) => {
          sec.questions?.forEach((q: any) => {
            const options = q.question.type === 'MCQ' || q.question.type === 'MULTI_CORRECT'
              ? [
                  { label: 'A', text: q.question.optionA || 'Option A' },
                  { label: 'B', text: q.question.optionB || 'Option B' },
                  { label: 'C', text: q.question.optionC || 'Option C' },
                  { label: 'D', text: q.question.optionD || 'Option D' },
                ]
              : undefined;

            flatQuestions.push({
              id: q.question.id,
              text: q.question.text,
              type: q.question.type,
              options,
              sectionIndex: secIdx,
            });
          });
        });

        // Use mock fallback if generated test has zero questions
        const finalQuestions = flatQuestions.length > 0
          ? flatQuestions
          : mockQuestions.map((q, i) => ({
              ...q,
              sectionIndex: i < 5 ? 0 : i < 10 ? 1 : 2,
            }));

        setQuestions(finalQuestions);

        reset();
        setTotalQuestions(finalQuestions.length);
        setSections(sectNames);
        setTimeRemaining((dbTest.duration || 180) * 60);
        visitQuestion(0);
      } catch (err) {
        console.error('Error fetching dynamic exam details, falling back:', err);
        const mappedMockQuestions = mockQuestions.map((q, i) => ({
          ...q,
          sectionIndex: i < 5 ? 0 : i < 10 ? 1 : 2,
        }));
        setQuestions(mappedMockQuestions);
        setSectionsList(['Physics', 'Chemistry', 'Mathematics']);
        reset();
        setTotalQuestions(mappedMockQuestions.length);
        setSections(['Physics', 'Chemistry', 'Mathematics']);
        setTimeRemaining(180 * 60);
        visitQuestion(0);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [params.testId]);

  // Synchronize section tab when current question changes
  useEffect(() => {
    const question = questions[currentQuestion];
    if (question && question.sectionIndex !== undefined && question.sectionIndex !== currentSection) {
      setCurrentSection(question.sectionIndex);
    }
  }, [currentQuestion, questions, currentSection, setCurrentSection]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setLoading(true);
    try {
      const answersMap = useExamStore.getState().answers;

      if (attemptId) {
        // Sequentially post all selected answers to the database
        const savePromises = [];
        for (let i = 0; i < questions.length; i++) {
          const ans = answersMap.get(i);
          if (ans) {
            const q = questions[i];
            const payload: any = { questionId: q.id };
            if (q.type === 'NUMERICAL') {
              payload.numericalAnswer = parseFloat(ans);
            } else {
              payload.selectedOption = ans;
            }
            savePromises.push(api.post(`/attempts/${attemptId}/answer`, payload));
          }
        }
        
        // Wait for all answers to save
        if (savePromises.length > 0) {
          await Promise.all(savePromises);
        }

        // Submit the attempt to evaluate the test
        await api.post(`/attempts/${attemptId}/submit`);

        // Force clean exit fullscreen
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }

        router.push(`/exam/${params.testId}/result?attemptId=${attemptId}`);
      } else {
        router.push('/analytics');
      }
    } catch (err) {
      console.error('Error submitting dynamic exam attempt:', err);
      alert('Failed to submit attempt. Make sure your network is online.');
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Proctoring Fullscreen & Tab Focus Violations management
  useEffect(() => {
    if (!hasStarted) return;

    let lastFullscreenState = true;

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);

      // If they went from fullscreen (true) to non-fullscreen (false)
      if (lastFullscreenState && !isFull) {
        setViolations((prev) => {
          const nextVal = prev + 1;
          if (nextVal >= 3) {
            handleSubmit();
          }
          return nextVal;
        });
      }
      lastFullscreenState = isFull;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const nextVal = prev + 1;
          if (nextVal >= 3) {
            handleSubmit();
          } else {
            // Force exit fullscreen if they switch tabs so they get the proctoring lock overlay on return
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
          }
          return nextVal;
        });
      }
    };

    setIsFullscreen(!!document.fullscreenElement);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasStarted, attemptId, questions]);

  const startTest = () => {
    document.documentElement.requestFullscreen()
      .then(() => {
        setIsFullscreen(true);
        setHasStarted(true);
        setViolations(0);
      })
      .catch((err) => {
        console.log('Fullscreen request failed:', err);
        setIsFullscreen(true);
        setHasStarted(true);
        setViolations(0);
      });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 z-50">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Synchronizing dynamic NTA mock environment...</p>
      </div>
    );
  }

  // Non-students cannot attempt tests
  if (user && user.role !== 'STUDENT') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-50 animate-fade-in">
        <div className="max-w-md w-full bg-slate-900/80 border border-rose-500/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
            <ShieldOff className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Only <span className="text-white font-semibold">Students</span> are allowed to appear in mock test examinations.
            Teachers and admins can view test details and analytics, but cannot attempt tests.
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/tests/${params.testId}`}>
              <Button variant="outline" className="w-full" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Test Details
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="ghost" className="w-full">
                All Tests
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-[100] overflow-y-auto animate-fade-in">
        <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between max-h-[90vh]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 text-white text-xl font-bold mb-3">
              📝
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              JEE CBT Exam Instructions
            </h2>
            <p className="text-slate-400 mt-1 text-sm">
              Please read the following guidelines carefully before starting the exam.
            </p>
          </div>

          {/* Instructions Content */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-slate-300 text-sm mb-6 max-h-[50vh] text-left">
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <h3 className="font-bold text-white mb-2">⚡ Proctored Examination Integrity Rules</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>This is a <strong className="font-bold text-white">strictly proctored mock exam</strong>. Full-screen mode is mandatory and will be enabled automatically.</li>
                <li><strong className="font-bold text-white">Do NOT exit full-screen mode</strong>. If full-screen is deactivated, your workspace will be locked until you return to full-screen.</li>
                <li>Copying, pasting, and navigating away from this window is locked and monitored.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-white">General Rules:</h3>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>The exam consists of sections covering <strong className="font-bold text-white">Physics, Chemistry, and Mathematics</strong>.</li>
                <li>Each question in Section A (MCQ) carries <strong className="font-bold text-white">+4 marks</strong> for a correct response and <strong className="font-bold text-white">-1 mark</strong> for a wrong response.</li>
                <li>Section B contains <strong className="font-bold text-white">Numerical questions</strong>. Answers must be entered using the virtual keypad.</li>
                <li>The total duration of the mock test is <strong className="font-bold text-white">{test?.duration || 180} minutes</strong>.</li>
                <li>The countdown timer in the top right shows the remaining time. The test will auto-submit upon timer expiry.</li>
              </ol>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium">
                I have read, understood, and agree to abide by all the instructions.
              </span>
            </label>
            <Button
              onClick={startTest}
              disabled={!agreed}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              Start Attempt 🚀
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50">
      {/* Proctoring Lock Overlay */}
      {hasStarted && !isFullscreen && violations < 3 && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[150] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mb-6 animate-pulse border",
            violations === 2
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
              : "bg-amber-500/10 border-amber-500/30 text-amber-500"
          )}>
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {violations === 2 ? "🔴 FINAL WARNING (2/2)" : "🟡 Proctoring Warning (1/2)"}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
            {violations === 2 ? (
              <>
                You have exited the secure proctored environment for the <strong className="text-rose-400 font-semibold">second time</strong>.
                Exiting full-screen mode or switching tabs <strong className="text-rose-400 font-bold underline">one more time</strong> will instantly and automatically submit your exam and terminate your attempt!
              </>
            ) : (
              <>
                Exiting full-screen mode or switching tabs is not allowed during the NTA JEE mock exam.
                This is your <strong className="text-amber-400 font-semibold">first warning</strong>. Please return to full-screen mode immediately to avoid auto-submission.
              </>
            )}
          </p>
          <Button 
            onClick={() => {
              document.documentElement.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch((err) => console.log(err));
            }}
            className={cn(
              "px-8 py-3 font-semibold rounded-xl shadow-lg transition-all",
              violations === 2
                ? "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-500/25"
                : "bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 shadow-indigo-500/25"
            )}
          >
            Return to Exam Workspace 📺
          </Button>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white hidden md:inline truncate max-w-[150px]">{testTitle}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          {/* Section Tabs */}
          <div className="flex items-center gap-1">
            {sections.map((section, i) => (
              <button
                key={section}
                onClick={() => {
                  const firstQIdx = questions.findIndex((q) => q.sectionIndex === i);
                  if (firstQIdx !== -1) {
                    goToQuestion(firstQIdx);
                  } else {
                    setCurrentSection(i);
                  }
                }}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                  i === currentSection
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        <ExamTimer />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {question && <QuestionDisplay question={question} />}
        </div>

        {/* Right Panel - Question Palette */}
        <div className="w-64 border-l border-slate-800/50 bg-slate-900/50 overflow-y-auto p-4 hidden md:block">
          <h3 className="text-sm font-semibold text-white mb-3">Question Palette</h3>
          <QuestionPalette />
        </div>
      </div>

      {/* Bottom Navigation */}
      <ExamNavigation />

      {/* Submit Modal */}
      <SubmitModal onSubmit={handleSubmit} />
    </div>
  );
}
