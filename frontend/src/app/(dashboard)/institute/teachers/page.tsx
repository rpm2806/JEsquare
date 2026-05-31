'use client';

import React, { useState } from 'react';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Modal } from '../../../../components/ui/modal';
import { getInitials } from '../../../../lib/utils';

const teachers = [
  { id: '1', name: 'Dr. Amit Verma', email: 'amit@institute.com', role: 'Head Teacher', subjects: ['Physics'], status: 'ACTIVE', questions: 456, tests: 34 },
  { id: '2', name: 'Priya Sharma', email: 'priya@institute.com', role: 'Teacher', subjects: ['Chemistry'], status: 'ACTIVE', questions: 312, tests: 22 },
  { id: '3', name: 'Rajesh Kumar', email: 'rajesh@institute.com', role: 'Teacher', subjects: ['Mathematics'], status: 'ACTIVE', questions: 289, tests: 28 },
  { id: '4', name: 'Sunita Patel', email: 'sunita@institute.com', role: 'Teacher', subjects: ['Physics', 'Mathematics'], status: 'ACTIVE', questions: 198, tests: 15 },
  { id: '5', name: 'Vikram Singh', email: 'vikram@institute.com', role: 'Teacher', subjects: ['Chemistry'], status: 'INACTIVE', questions: 67, tests: 5 },
];

export default function TeachersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Teachers</h1>
          <p className="text-slate-400 mt-1">Manage your teaching staff</p>
        </div>
        <Button onClick={() => setShowInvite(true)} icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        }>
          Invite Teacher
        </Button>
      </div>

      <div className="grid gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                  {getInitials(teacher.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{teacher.name}</h3>
                    <Badge variant={teacher.role === 'Head Teacher' ? 'primary' : 'default'}>
                      {teacher.role}
                    </Badge>
                    <Badge variant={teacher.status === 'ACTIVE' ? 'success' : 'danger'} dot>
                      {teacher.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{teacher.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {teacher.subjects.map((s) => (
                      <Badge key={s} variant="default" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-lg font-bold text-white">{teacher.questions}</p>
                  <p className="text-xs text-slate-500">Questions</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{teacher.tests}</p>
                  <p className="text-xs text-slate-500">Tests</p>
                </div>
                <Button variant="ghost" size="sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Teacher" description="Send an invitation to join your institute.">
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="teacher@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button>Send Invitation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
