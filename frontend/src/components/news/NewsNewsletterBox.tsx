'use client';

import React, { useState, memo } from 'react';
import { Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { toast } from '@/stores/toastStore';

export interface NewsNewsletterBoxProps {
  title: string;
  desc: string;
  placeholder: string;
  btnText: string;
  badgeText?: string;
  subscribedSuccessText?: string;
  invalidEmailText?: string;
  subscribeSuccessToast?: string;
}

export const NewsNewsletterBox = memo(function NewsNewsletterBox({
  title,
  desc,
  placeholder,
  btnText,
  badgeText,
  subscribedSuccessText,
  invalidEmailText,
  subscribeSuccessToast,
}: NewsNewsletterBoxProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.warning(invalidEmailText || 'Vui lòng nhập đúng định dạng email hợp lệ!');
      return;
    }
    setSubscribed(true);
    toast.success(subscribeSuccessToast || 'Đăng ký nhận cẩm nang du lịch thành công! Chúng tôi đã gửi email xác nhận.');
  };

  return (
    <div className="relative my-14 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
      {/* Decorative Blur Circles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{badgeText || 'Bản Tin Du Lịch VIP'}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
          {title}
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {desc}
        </p>

        {subscribed ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl max-w-md mx-auto text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{subscribedSuccessText || 'Cảm ơn bạn! Hãy kiểm tra hộp thư để nhận cẩm nang mới nhất.'}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{btnText}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
});
