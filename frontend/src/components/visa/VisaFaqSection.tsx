'use client';

import { useState, memo } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getVisaUiText } from './visaConstants';

export interface NormalizedFaqItem {
  question: string;
  answer: string;
}

interface VisaFaqSectionProps {
  faqs: NormalizedFaqItem[];
  locale: string;
}

export const VisaFaqSection = memo(function VisaFaqSection({ faqs, locale }: VisaFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-6">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>{getVisaUiText('faqBadge', locale)}</span>
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {getVisaUiText('faqTitle', locale)}
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-50/50 transition-colors"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
