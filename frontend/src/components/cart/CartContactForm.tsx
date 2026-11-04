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

export interface CartContactFormProps {
  formData: CartContactFormData;
  onChange: (field: keyof CartContactFormData, value: string) => void;
  t: (key: string, options?: any) => string;
}

export const CartContactForm = memo(function CartContactForm({
  formData,
  onChange,
  t,
}: CartContactFormProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/90 shadow-sm space-y-5">
      <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        {t('contact_info_title', { fallback: 'Thông Tin Liên Hệ Đặt Chỗ' })}
      </h3>

      {/* Input Form */}
      <div className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            {t('full_name_label', { fallback: 'Họ và tên khách hàng *' })}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              required
              type="text"
              placeholder={t('full_name_placeholder', { fallback: 'Nguyễn Văn A' })}
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              {t('phone_label', { fallback: 'Số điện thoại *' })}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                required
                type="tel"
                placeholder="0912345678"
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              {t('email_label', { fallback: 'Email nhận vé *' })}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                required
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            {t('address_label', { fallback: 'Địa chỉ sinh sống' })}
          </label>
          <input
            type="text"
            placeholder={t('address_placeholder', { fallback: 'Nhập địa chỉ của bạn...' })}
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">
            {t('notes_label', { fallback: 'Ghi chú đặc biệt' })}
          </label>
          <textarea
            rows={2}
            placeholder={t('notes_placeholder', { fallback: 'Yêu cầu phòng, dị ứng thức ăn,...' })}
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50/50"
          />
        </div>
      </div>
    </div>
  );
});
