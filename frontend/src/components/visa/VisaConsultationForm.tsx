'use client';

import { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Loader2, Sparkles, Calendar, Users, Phone, User } from 'lucide-react';

export default function VisaConsultationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Japan');
  const [travelDate, setTravelDate] = useState('');
  const [guests, setGuests] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xl space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/60 to-purple-100/60 rounded-bl-full pointer-events-none opacity-60" />

      <div>
        <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-blue-100 tracking-wider inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" /> Tư Vấn Miễn Phí 24/7
        </span>
        <h3 className="font-black text-xl text-slate-900 mt-2 tracking-tight">Đăng Ký Tư Vấn Visa</h3>
        <p className="text-xs text-slate-500 mt-1">Nhận thẩm định hồ sơ & báo giá ưu đãi trong vòng 15 phút</p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-base">Đã Gửi Yêu Cầu Thành Công!</h4>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            Cảm ơn <strong>{name}</strong>! Chuyên viên Visa của chúng tôi sẽ liên hệ Zalo số <strong>{phone}</strong> trong 15 phút tới.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setName('');
              setPhone('');
            }}
            className="text-xs text-blue-600 font-bold hover:underline pt-2 inline-block"
          >
            + Gửi thêm yêu cầu khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 mb-1 block uppercase tracking-wider text-[11px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Họ và tên du khách *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-3 text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Số điện thoại Zalo / Gọi *</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0987 654 321"
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-3 text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block uppercase tracking-wider text-[11px]">
              Quốc gia cần làm Visa *
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all shadow-inner"
            >
              <option value="Japan">🇯🇵 Nhật Bản (5-7 ngày)</option>
              <option value="Korea">🇰🇷 Hàn Quốc (3-5 ngày)</option>
              <option value="Schengen">🇪🇺 Khối Schengen Châu Âu (10-15 ngày)</option>
              <option value="USA">🇺🇸 Mỹ (Hoa Kỳ) (Phỏng vấn)</option>
              <option value="Australia">🇦🇺 Úc (Australia)</option>
              <option value="Canada">🇨🇦 Canada</option>
              <option value="Other">🌍 Quốc gia khác...</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 mb-1 block uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>Dự định đi</span>
              </label>
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-[11px] text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-500" />
                <span>Số người</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-[11px] text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Gửi...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Yêu Cầu Tư Vấn</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-slate-100 space-y-2.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Cam kết bảo mật thông tin cá nhân tuyệt đối</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Hỗ trợ dịch thuật thuật ngữ pháp lý</span>
        </div>
      </div>
    </div>
  );
}
