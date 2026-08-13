'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, ShieldCheck, Loader2, Sparkles, Calendar, Users, Phone, User, ChevronDown, Check } from 'lucide-react';

interface CountryOption {
  key: string;
  flag: string;
  nameKey: string;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { key: 'Japan', flag: 'https://flagcdn.com/w40/jp.png', nameKey: 'japanName' },
  { key: 'Korea', flag: 'https://flagcdn.com/w40/kr.png', nameKey: 'koreaName' },
  { key: 'Schengen', flag: 'https://flagcdn.com/w40/eu.png', nameKey: 'europeName' },
  { key: 'USA', flag: 'https://flagcdn.com/w40/us.png', nameKey: 'usaName' },
  { key: 'Australia', flag: 'https://flagcdn.com/w40/au.png', nameKey: 'australiaName' },
  { key: 'Canada', flag: 'https://flagcdn.com/w40/ca.png', nameKey: 'canadaName' },
];

export default function VisaConsultationForm() {
  const t = useTranslations('visa');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryKey, setSelectedCountryKey] = useState<string>('Japan');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  const [travelDate, setTravelDate] = useState('');
  const [guests, setGuests] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = COUNTRY_OPTIONS.find((c) => c.key === selectedCountryKey) || COUNTRY_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const getCountryName = (c: CountryOption) => {
    try {
      return t(c.nameKey as any) || c.key;
    } catch {
      return c.key;
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/60 to-purple-100/60 rounded-bl-full pointer-events-none opacity-60" />

      <div>
        <span className="bg-blue-50 text-blue-700 text-xs font-bold uppercase px-2.5 py-1 rounded-full border border-blue-100 tracking-wider inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {t('formBadge')}
        </span>
        <h3 className="font-bold text-xl text-slate-900 mt-2 tracking-tight">{t('formTitle')}</h3>
        <p className="text-xs text-slate-500 mt-1">{t('formSub')}</p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">{t('formSuccessTitle')}</h4>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            {t('formSuccessSub', { name, phone })}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setName('');
              setPhone('');
            }}
            className="text-xs text-blue-600 font-bold hover:underline pt-2 inline-block cursor-pointer"
          >
            {t('formSendAnother')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 mb-1.5 block uppercase tracking-wider text-xs flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('formNameLabel')}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('formNamePlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1.5 block uppercase tracking-wider text-xs flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('formPhoneLabel')}</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('formPhonePlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          {/* Custom Country Selector with Flag CDN Images */}
          <div className="relative" ref={countryRef}>
            <label className="font-semibold text-slate-700 mb-1.5 block uppercase tracking-wider text-xs">
              {t('formCountryLabel')}
            </label>
            <button
              type="button"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/80 rounded-xl px-3.5 py-3 text-slate-900 font-medium flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 border-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedCountry.flag}
                  alt={selectedCountry.key}
                  className="w-5 h-3.5 object-cover rounded-xs shadow-2xs border border-black/10 shrink-0"
                />
                <span className="font-semibold text-slate-800 text-xs">{getCountryName(selectedCountry)}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isCountryOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isCountryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 overflow-hidden"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setSelectedCountryKey(c.key);
                        setIsCountryOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors font-medium cursor-pointer ${
                        selectedCountryKey === c.key ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.flag}
                          alt={c.key}
                          className="w-5 h-3.5 object-cover rounded-xs shadow-2xs border border-black/10 shrink-0"
                        />
                        <span className="text-slate-800 text-xs">{getCountryName(c)}</span>
                      </div>
                      {selectedCountryKey === c.key && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 mb-1 block uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('formTravelDateLabel')}</span>
              </label>
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 mb-1 block uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>{t('formGuestsLabel')}</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('formSubmitting')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('formSubmitBtn')}</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{t('formSecCommit')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{t('formSupportTrans')}</span>
        </div>
      </div>
    </div>
  );
}
