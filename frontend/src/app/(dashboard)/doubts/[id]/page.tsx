'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';

const mockDoubt = {
  id: '1',
  title: 'How to solve projectile motion problems with air resistance?',
  description: 'I understand basic projectile motion without air resistance, where we decompose velocity into horizontal and vertical components. But when air resistance is included (proportional to velocity), the equations become differential equations. How do I approach solving these? Is there a standard technique for JEE-level problems?',
  subject: 'PHYSICS',
  chapter: 'Kinematics',
  status: 'AI_RESPONDED',
  asker: { name: 'Rahul Kumar', avatar: 'RK' },
  createdAt: '2 hours ago',
  aiResponse: `Great question! Projectile motion with air resistance is indeed more complex. Here's how to approach it:

**For JEE, you typically encounter two cases:**

1. **Linear drag (F = -bv):** This is the most common case at JEE level.
   - Horizontal: $ma_x = -bv_x$ → $v_x = v_0\\cos\\theta \\cdot e^{-bt/m}$
   - Vertical: $ma_y = -mg - bv_y$

2. **Quadratic drag (F = -cv²):** Less common but appears in advanced problems.

**Key concepts to remember:**
- Terminal velocity: $v_t = mg/b$ (for linear drag)
- The trajectory is no longer parabolic
- Range is always less than the ideal case
- Maximum height is reached earlier than $t = v_0\\sin\\theta/g$

**Tip for JEE:** Most problems will give you simplifying assumptions. Look for keywords like "linear drag" or "drag coefficient."`,
  humanResponse: null,
  rating: null,
};

function parseMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function DoubtDetailPage() {
  const params = useParams();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="info" dot>AI Answered</Badge>
          <Badge variant="default">{mockDoubt.subject}</Badge>
          <Badge variant="default">{mockDoubt.chapter}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">{mockDoubt.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
            {mockDoubt.asker.avatar}
          </div>
          <span className="text-sm text-slate-400">{mockDoubt.asker.name}</span>
          <span className="text-xs text-slate-500">• {mockDoubt.createdAt}</span>
        </div>
      </div>

      {/* Question */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Question</h3>
        <p className="text-sm text-slate-200 leading-relaxed">{mockDoubt.description}</p>
      </Card>

      {/* AI Response */}
      {mockDoubt.aiResponse && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-400">AI Response</h3>
              <p className="text-xs text-slate-500">Powered by JEsquare AI</p>
            </div>
          </div>
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {parseMarkdown(mockDoubt.aiResponse)}
          </div>
        </Card>
      )}

      {/* Human Response */}
      {mockDoubt.humanResponse ? (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Expert Response</h3>
              <p className="text-xs text-slate-500">From a verified expert</p>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{mockDoubt.humanResponse}</p>
        </Card>
      ) : (
        <Card className="border-dashed border-slate-700 bg-transparent text-center py-8">
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-slate-500">Waiting for expert response...</p>
          <p className="text-xs text-slate-600 mt-1">An expert teacher will review your doubt soon</p>
        </Card>
      )}

      {/* Rating */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-3">Rate this response</h3>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-125"
            >
              <svg
                className={cn('w-8 h-8', (hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-600')}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-slate-400 ml-2">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </span>
          )}
        </div>
        {rating > 0 && (
          <div className="mt-3">
            <Button size="sm">Submit Rating</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
