'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { getVisaUiText } from './visaConstants';

export interface NormalizedVisaCountry {
  key: string;
  flag: string;
  name: string;
  desc: string;
  time: string;
  tag: string;
  passBadge: string;
  bg: string;
  border: string;
}

interface VisaCountryCatalogProps {
  countries: NormalizedVisaCountry[];
  locale: string;
}

export const VisaCountryCatalog = memo(function VisaCountryCatalog({
  countries,
  locale,
}: VisaCountryCatalogProps) {
  const [selectedKey, setSelectedKey] = useState<string>(countries[0]?.key || 'Japan');

  useEffect(() => {
    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setSelectedKey(detail);
    };
    window.addEventListener('visa:country-synced', handleSync);
    return () => window.removeEventListener('visa:country-synced', handleSync);
  }, []);

  const handleSelectCountry = useCallback((key: string) => {
    setSelectedKey(key);
    window.dispatchEvent(new CustomEvent('visa:select-country', { detail: key }));
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const formEl = document.getElementById('visa-consultation-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-medium">{getVisaUiText('selectCountryHint', locale)}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {countries.map((country, idx) => {
          const isSelected = selectedKey === country.key;
          const isImageFlag = typeof country.flag === 'string' && country.flag.startsWith('http');

          return (
            <button
              key={country.key || idx}
              type="button"
              onClick={() => handleSelectCountry(country.key)}
              aria-pressed={isSelected}
              className={`text-left bg-gradient-to-br ${country.bg} border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : `${country.border} hover:border-blue-300`
              }`}
            >
              <div className="w-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {isImageFlag ? (
                      <img
                        src={country.flag}
                        alt={country.name}
                        width={36}
                        height={24}
                        loading="lazy"
                        className="w-9 h-6 object-cover rounded shadow-sm border border-slate-200 shrink-0"
                      />
                    ) : (
                      <span className="text-4xl leading-none shrink-0">{country.flag}</span>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors leading-snug">
                        {country.name}
                      </h3>
                      {country.tag && (
                        <span className="inline-block text-xs font-semibold bg-white/90 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100 mt-1">
                          {country.tag}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      {getVisaUiText('selectedBadge', locale)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{country.desc}</p>
              </div>

              <div className="w-full pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {country.time}
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full text-xs shrink-0">
                  {country.passBadge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
