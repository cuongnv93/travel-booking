'use client';

import { memo } from 'react';
import { User, Phone, Mail } from 'lucide-react';

export interface CartContactFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export type CartContactFieldErrors = Partial<Record<'name' | 'phone' | 'email', string>>;

export interface CartContactFormProps {
  formData: CartContactFormData;
  fieldErrors?: CartContactFieldErrors;
  onChange: (field: keyof CartContactFormData, value: string) => void;
  t: (key: string) => string;
}

export const CartContactForm = memo(function CartContactForm({
  formData,
  fieldErrors,
  onChange,
  t,
}: CartContactFormProps) {
  return (
    <section
      id="cart-contact-form"
      aria-labelledby="cart-contact-heading"
      className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200/90 shadow-sm space-y-5"
    >
      <h2
        id="cart-contact-heading"
        className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"
      >
        <User className="w-5 h-5 text-blue-600" />
        {t('contact_info_title')}
      </h2>

      {/* Input Form */}
      <div className="space-y-4 text-xs">
        <div>
          <label htmlFor="cart-contact-name" className="font-bold text-slate-700 block mb-1.5">
            {t('full_name_label')}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              id="cart-contact-name"
              required
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors?.name)}
              aria-describedby={fieldErrors?.name ? 'cart-contact-name-error' : undefined}
              placeholder={t('full_name_placeholder')}
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 bg-slate-50/50 transition-colors ${
                fieldErrors?.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/15'
              }`}
            />
          </div>
          {fieldErrors?.name && (
            <p id="cart-contact-name-error" className="text-red-600 font-semibold mt-1">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cart-contact-phone" className="font-bold text-slate-700 block mb-1.5">
              {t('phone_label')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="cart-contact-phone"
                required
                type="tel"
                autoComplete="tel"
                aria-invalid={Boolean(fieldErrors?.phone)}
                aria-describedby={fieldErrors?.phone ? 'cart-contact-phone-error' : undefined}
                placeholder="0912345678"
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 bg-slate-50/50 transition-colors ${
                  fieldErrors?.phone
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/15'
                }`}
              />
            </div>
            {fieldErrors?.phone && (
              <p id="cart-contact-phone-error" className="text-red-600 font-semibold mt-1">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cart-contact-email" className="font-bold text-slate-700 block mb-1.5">
              {t('email_label')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="cart-contact-email"
                required
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors?.email)}
                aria-describedby={fieldErrors?.email ? 'cart-contact-email-error' : undefined}
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 bg-slate-50/50 transition-colors ${
                  fieldErrors?.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/15'
                }`}
              />
            </div>
            {fieldErrors?.email && (
              <p id="cart-contact-email-error" className="text-red-600 font-semibold mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="cart-contact-address" className="font-bold text-slate-700 block mb-1.5">
            {t('address_label')}
          </label>
          <input
            id="cart-contact-address"
            type="text"
            autoComplete="street-address"
            placeholder={t('address_placeholder')}
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 bg-slate-50/50 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="cart-contact-notes" className="font-bold text-slate-700 block mb-1.5">
            {t('notes_label')}
          </label>
          <textarea
            id="cart-contact-notes"
            rows={2}
            placeholder={t('notes_placeholder')}
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 bg-slate-50/50 transition-colors"
          />
        </div>
      </div>
    </section>
  );
});
