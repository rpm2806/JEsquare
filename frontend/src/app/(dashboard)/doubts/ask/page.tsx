'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Select } from '../../../../components/ui/select';

export default function AskDoubtPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    chapter: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/doubts');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Ask a Doubt</h1>
        <p className="text-slate-400 mt-1">Get instant AI-powered answers or escalate to an expert</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="space-y-5">
            <Input
              label="Question Title"
              placeholder="Briefly describe your doubt..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />

            <Textarea
              label="Detailed Description"
              placeholder="Explain your doubt in detail. You can use LaTeX with $...$"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-[150px]"
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Select Subject"
                options={[
                  { value: 'PHYSICS', label: 'Physics' },
                  { value: 'CHEMISTRY', label: 'Chemistry' },
                  { value: 'MATHEMATICS', label: 'Mathematics' },
                ]}
              />
              <Input
                label="Chapter"
                placeholder="e.g., Kinematics"
                value={formData.chapter}
                onChange={(e) => setFormData((prev) => ({ ...prev, chapter: e.target.value }))}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Attach Image (optional)</label>
              <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center hover:border-indigo-500/30 transition-colors cursor-pointer">
                <svg className="w-10 h-10 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-slate-400">Drag & drop an image or <span className="text-indigo-400 font-medium">click to browse</span></p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI will analyze your doubt instantly
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Submit Doubt</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
