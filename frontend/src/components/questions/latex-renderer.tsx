'use client';

import React from 'react';
import katex from 'katex';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

// Ultra-fast in-memory KaTeX string cache to bypass redundant heavy parsing
const katexCache = new Map<string, string>();

function LaTeXRendererComponent({ content, className = '', displayMode = false }: LaTeXRendererProps) {
  const renderContent = (text: string): string => {
    const cacheKey = `inline:${text}`;
    if (katexCache.has(cacheKey)) {
      return katexCache.get(cacheKey)!;
    }

    // Replace display math $$...$$ 
    let rendered = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math, { displayMode: true, throwOnError: false });
      } catch {
        return math;
      }
    });

    // Replace inline math $...$
    rendered = rendered.replace(/\$(.*?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      } catch {
        return math;
      }
    });

    katexCache.set(cacheKey, rendered);
    return rendered;
  };

  if (displayMode) {
    const cacheKey = `display:${content}`;
    if (katexCache.has(cacheKey)) {
      const html = katexCache.get(cacheKey)!;
      return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    }

    try {
      const html = katex.renderToString(content, { displayMode: true, throwOnError: false });
      katexCache.set(cacheKey, html);
      return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <div className={className}>{content}</div>;
    }
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  );
}

// Memoize to prevent unnecessary re-renders when parent states trigger
export const LaTeXRenderer = React.memo(LaTeXRendererComponent);
