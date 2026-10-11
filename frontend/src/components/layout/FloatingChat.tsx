'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ZaloIcon } from '@/components/ui/SocialIcons';

function FloatingChatComponent() {
  const t = useTranslations('floatingChat');
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const contacts = useMemo(
    () => [
      {
        id: 'zalo',
        label: t('zalo'),
        sublabel: t('zaloSub'),
        href: 'https://zalo.me/0987654321',
        color: 'bg-blue-500 hover:bg-blue-600',
        icon: <ZaloIcon className="w-5 h-auto text-white" />,
      },
      {
        id: 'whatsapp',
        label: t('whatsapp'),
        sublabel: t('whatsappSub'),
        href: 'https://wa.me/84987654321',
        color: 'bg-green-500 hover:bg-green-600',
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        ),
      },
      {
        id: 'phone',
        label: t('phone'),
        sublabel: t('phoneSub'),
        href: 'tel:1800646888',
        color: 'bg-orange-500 hover:bg-orange-600',
        icon: <Phone className="w-5 h-5 text-white" />,
      },
    ],
    [t]
  );

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* Contact options */}
      {open && (
        <div className="flex flex-col gap-2 mb-1 animate-in slide-in-from-bottom-4 fade-in duration-200">
          {contacts.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-slate-100 px-3.5 py-2.5 sm:px-4 sm:py-3 pr-4 sm:pr-5 hover:shadow-2xl transition-all hover:-translate-y-0.5 group"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${c.color} flex items-center justify-center shadow-md shrink-0 transition-colors`}>
                {c.icon}
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none">{c.label}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{c.sublabel}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-slate-700 hover:bg-slate-800 rotate-0'
            : 'bg-gradient-to-br from-blue-600 to-teal-500 hover:scale-110'
        } shadow-blue-500/30 cursor-pointer`}
        aria-label="Contact"
      >
        {open ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        )}
      </button>

      {/* Pulse ring when closed */}
      {!open && (
        <span className="absolute bottom-0 right-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
      )}
    </div>
  );
}

export default memo(FloatingChatComponent);
