import React from 'react';

const RenderBody = ({ text, className }) => {
  if (!text) return null;

  // Split into paragraphs by double newlines
  const paragraphs = String(text).split(/\n\s*\n/).map((para, idx) => {
    // Within a paragraph, split single-line breaks
    const lines = para.split('\n').map((line, i) => {
      const trimmed = line.trim();
      // detect numbered lines like "1: something" or "2. something"
      if (/^\d+\s*[:.-]/.test(trimmed)) {
        return <div key={i} className="numbered-line">{trimmed}</div>;
      }

      // detect leading whitespace (indentation)
      if (/^[\s\t]{2,}/.test(line)) {
        // preserve the trimmed text but render with indentation
        return <div key={i} className="indented-line">{trimmed}</div>;
      }

      return <div key={i}>{line}</div>;
    });

    return (
      <div key={idx} className="post-paragraph">
        {lines}
      </div>
    );
  });

  return <div className={className}>{paragraphs}</div>;
};

export default RenderBody;
