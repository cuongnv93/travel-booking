'use client';

import { useRef, useEffect, useState, memo } from 'react';
import { useInView, animate } from 'framer-motion';

export interface CounterParsedData {
  prefix: string;
  target: number;
  decimals: number;
  suffix: string;
  hasComma: boolean;
}

export function parseCounterValue(raw: string | number): CounterParsedData {
  if (typeof raw !== 'string') raw = String(raw ?? '');
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^\d.]*)([\d,.]+)(.*)$/);
  if (!match) {
    return { prefix: '', target: 0, decimals: 0, suffix: trimmed, hasComma: false };
  }

  const prefix = match[1];
  const rawNum = match[2];
  const suffix = match[3];

  const hasComma = rawNum.includes(',') && !rawNum.includes('.');
  const cleanNum = hasComma ? rawNum.replace(/,/g, '') : rawNum;
  const target = parseFloat(cleanNum) || 0;
  const decimals = cleanNum.includes('.') ? (cleanNum.split('.')[1] || '').length : 0;

  return { prefix, target, decimals, suffix, hasComma };
}

export interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter = memo(function AnimatedCounter({
  value,
  duration = 2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [displayValue, setDisplayValue] = useState<string>(() => String(value ?? '0'));

  useEffect(() => {
    const stringValue = String(value ?? '');
    const { prefix, target, decimals, suffix, hasComma } = parseCounterValue(stringValue);

    if (!isInView) {
      const initialZero = decimals > 0 ? (0).toFixed(decimals) : '0';
      setDisplayValue(`${prefix}${initialZero}${suffix}`);
      return;
    }

    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        let formatted = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
        if (hasComma) {
          formatted = Math.round(latest).toLocaleString('en-US');
        }
        setDisplayValue(`${prefix}${formatted}${suffix}`);
      },
      onComplete: () => {
        setDisplayValue(stringValue);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className || ''}`}>
      {displayValue}
    </span>
  );
});

export default AnimatedCounter;
