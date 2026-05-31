'use client';

import React, { useState } from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function BrandingPage() {
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Branding</h1>
        <p className="text-slate-400 mt-1">Customize your institute&apos;s appearance</p>
      </div>

      {/* Logo Upload */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Institute Logo</h2>
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 text-slate-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-slate-500">Upload Logo</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-300 mb-2">Upload your institute logo. Recommended size: 200x200px</p>
            <p className="text-xs text-slate-500 mb-4">Supported formats: PNG, JPG, SVG (max 2MB)</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Upload Image</Button>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Colors */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Brand Colors</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-700 bg-transparent"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-700 bg-transparent"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
        <div className="rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Mock Header */}
          <div
            className="h-14 flex items-center px-6 gap-3"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              LG
            </div>
            <span className="text-white font-semibold">Your Institute Name</span>
          </div>
          {/* Mock Content */}
          <div className="p-6 bg-slate-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: primaryColor, opacity: 0.2 }} />
              <div>
                <div className="h-3 w-32 bg-slate-700 rounded mb-1.5" />
                <div className="h-2 w-20 bg-slate-800 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: secondaryColor }}>
                Secondary Button
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost">Reset to Default</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
