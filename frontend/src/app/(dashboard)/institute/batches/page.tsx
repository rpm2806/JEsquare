'use client';

import React, { useState } from 'react';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Modal } from '../../../../components/ui/modal';

const batches = [
  { id: '1', name: '2025 Regular Batch', description: 'Students appearing for JEE 2025 (first attempt)', students: 120, tests: 34, status: 'ACTIVE' },
  { id: '2', name: '2025 Dropper Batch', description: 'Students re-appearing for JEE 2025', students: 85, tests: 28, status: 'ACTIVE' },
  { id: '3', name: '2026 Foundation', description: 'Foundation batch for Class 11 students', students: 156, tests: 12, status: 'ACTIVE' },
  { id: '4', name: 'Weekend Crash Course', description: 'Intensive weekend batch for quick revision', students: 45, tests: 8, status: 'ACTIVE' },
  { id: '5', name: '2024 Batch (Archived)', description: 'Previous year batch', students: 200, tests: 56, status: 'ARCHIVED' },
];

export default function BatchesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', description: '' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Batches</h1>
          <p className="text-slate-400 mt-1">Organize students into batches</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        }>
          Create Batch
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {batches.map((batch) => (
          <Card key={batch.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{batch.name}</h3>
                  <Badge variant={batch.status === 'ACTIVE' ? 'success' : 'default'} dot>
                    {batch.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">{batch.description}</p>
              </div>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </Button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{batch.students}</p>
                  <p className="text-xs text-slate-500">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{batch.tests}</p>
                  <p className="text-xs text-slate-500">Tests</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Batch" description="Create a new student batch.">
        <div className="space-y-4">
          <Input label="Batch Name" placeholder="e.g., 2026 Regular Batch" value={newBatch.name} onChange={(e) => setNewBatch((prev) => ({ ...prev, name: e.target.value }))} />
          <Textarea label="Description" placeholder="Describe this batch..." value={newBatch.description} onChange={(e) => setNewBatch((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button>Create Batch</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
