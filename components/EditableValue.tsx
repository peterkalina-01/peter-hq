'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableValueProps {
  value: string | number | undefined;
  onSave: (val: string) => void;
  isOverridden?: boolean;
  onClear?: () => void;
  className?: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export function EditableValue({
  value,
  onSave,
  isOverridden,
  onClear,
  className = '',
  prefix = '',
  suffix = '',
  placeholder = '0',
}: EditableValueProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setInput(String(value ?? ''));
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [editing, value]);

  const save = () => {
    if (input.trim()) onSave(input.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        {prefix && <span className={className}>{prefix}</span>}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          onBlur={save}
          className="bg-bg-elev border border-accent rounded-lg px-2 py-0.5 text-accent font-bold outline-none"
          style={{ width: `${Math.max(input.length + 1, 4)}ch`, fontSize: 'inherit' }}
        />
        {suffix && <span className={className}>{suffix}</span>}
      </span>
    );
  }

  return (
    <span
      className={`cursor-pointer group relative ${className}`}
      onClick={() => setEditing(true)}
      title={isOverridden ? 'Manuálna hodnota — klikni pre úpravu' : 'Klikni pre manuálnu úpravu'}
    >
      {prefix}{value !== undefined ? value : <span className="text-text-dim">{placeholder}</span>}{suffix}
      {isOverridden && (
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-warm rounded-full" title="Manuálna hodnota"/>
      )}
      <span className="absolute -top-5 left-0 text-[9px] bg-bg-elev border border-border px-1.5 py-0.5 rounded text-text-dim opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {isOverridden ? '✏ manuálne · klikni pre úpravu' : '✏ klikni pre úpravu'}
        {isOverridden && onClear && (
          <button
            onClick={e => { e.stopPropagation(); onClear?.(); }}
            className="ml-1 text-rose hover:underline"
          > · reset</button>
        )}
      </span>
    </span>
  );
}
