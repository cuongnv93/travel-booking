export function isValidVisaEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidVisaPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!/^\+?[0-9\s\-().]{8,20}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

const TAG_TRANSLATIONS: Record<string, Record<string, string>> = {
  'Hot': { vi: 'Hot', en: 'Hot', zh: '热门', ko: '인기', ja: '人気' },
  'Ưa chuộng': { vi: 'Ưa chuộng', en: 'Popular', zh: '热门优选', ko: '선호', ja: '好評' },
  '27 Quốc gia': { vi: '27 Quốc gia', en: '27 Countries', zh: '27 个国家', ko: '27개국', ja: '27カ国' },
  'Thời hạn 1 năm': { vi: 'Thời hạn 1 năm', en: '1-Year Validity', zh: '1年有效期', ko: '1년 유효', ja: '1年間有効' },
  'E-Visa Điện Tử': { vi: 'E-Visa Điện Tử', en: 'Electronic E-Visa', zh: '电子签证', ko: '전자 비자', ja: '電子ビザ' },
  'Thời hạn 10 năm': { vi: 'Thời hạn 10 năm', en: 'Up to 10 Years', zh: '长达10年', ko: '최대 10년', ja: '最長10年' },
};

export function translateVisaTag(tag: string, locale: string): string {
  if (!tag) return '';
  if (locale === 'vi') return tag;
  return TAG_TRANSLATIONS[tag]?.[locale] || TAG_TRANSLATIONS[tag]?.en || tag;
}

export const VISA_EXTRA_I18N: Record<string, Record<string, string>> = {
  emailLabel: {
    vi: 'Email (Không bắt buộc)',
    en: 'Email (Optional)',
    zh: '电子邮箱（选填）',
    ko: '이메일 (선택사항)',
    ja: 'メールアドレス（任意）',
  },
  emailPlaceholder: {
    vi: 'VD: example@gmail.com',
    en: 'e.g. example@gmail.com',
    zh: '例：example@gmail.com',
    ko: '예: example@gmail.com',
    ja: '例: example@gmail.com',
  },
  invalidName: {
    vi: 'Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).',
    en: 'Please enter a valid full name (at least 2 characters).',
    zh: '请输入有效的姓名（至少 2 个字符）。',
    ko: '유효한 성명을 입력해주세요 (최소 2자).',
    ja: '有効なお名前を入力してください（2文字以上）。',
  },
  invalidPhone: {
    vi: 'Số điện thoại không hợp lệ (vui lòng nhập 8–15 chữ số).',
    en: 'Invalid phone number (please enter 8–15 digits).',
    zh: '电话号码无效（请输入 8–15 位数字）。',
    ko: '유효하지 않은 전화번호입니다 (8~15자리 숫자).',
    ja: '電話番号が無効です（8〜15桁で入力してください）。',
  },
  invalidEmail: {
    vi: 'Địa chỉ email không đúng định dạng.',
    en: 'Please enter a valid email address.',
    zh: '邮箱地址格式不正确。',
    ko: '이메일 형식이 올바르지 않습니다.',
    ja: 'メールアドレスの形式が正しくありません。',
  },
  invalidTravelDate: {
    vi: 'Ngày dự định đi không được ở trong quá khứ.',
    en: 'Intended travel date cannot be in the past.',
    zh: '计划出行日期不能早于今天。',
    ko: '출발 예정일은 과거 날짜일 수 없습니다.',
    ja: '出発予定日に過去の日付は指定できません。',
  },
  offlineQueued: {
    vi: 'Hệ thống đã lưu tạm yêu cầu của bạn và sẽ tự động đồng bộ ngay khi có kết nối!',
    en: 'Your request has been saved safely and will automatically sync when connected!',
    zh: '您的请求已安全保存，网络恢复后将自动同步！',
    ko: '요청이 안전하게 저장되었으며 연결 시 자동 동기화됩니다!',
    ja: 'ご依頼内容は安全に保存され、接続復帰後に自動送信されます！',
  },
  selectCountryHint: {
    vi: 'Nhấp chọn quốc gia để tự động điền vào biểu mẫu tư vấn bên cạnh',
    en: 'Click any country card to select it in the consultation form',
    zh: '点击任意国家卡片即可快速选择咨询该国签证',
    ko: '국가 카드를 클릭하면 상담 신청서에 자동 선택됩니다',
    ja: '国カードをクリックすると相談フォームに自動選択されます',
  },
  selectedBadge: {
    vi: 'Đang chọn',
    en: 'Selected',
    zh: '已选择',
    ko: '선택됨',
    ja: '選択中',
  },
  consultNowAction: {
    vi: 'Chọn tư vấn →',
    en: 'Select →',
    zh: '选择咨询 →',
    ko: '상담 선택 →',
    ja: '選択する →',
  },
  faqBadge: {
    vi: 'Giải Đáp Thắc Mắc',
    en: 'Frequently Asked Questions',
    zh: '常见问题解答',
    ko: '자주 묻는 질문',
    ja: 'よくあるご質問',
  },
  faqTitle: {
    vi: 'Câu Hỏi Thường Gặp Khi Xin Visa',
    en: 'Common Visa Application Questions',
    zh: '签证申请常见问题',
    ko: '비자 신청 FAQ',
    ja: 'ビザ申請に関するFAQ',
  },
};

export function getVisaUiText(key: keyof typeof VISA_EXTRA_I18N, locale: string): string {
  const entry = VISA_EXTRA_I18N[key];
  if (!entry) return String(key);
  return entry[locale] || entry.en || entry.vi;
}

export interface LocalizedVisaFaq {
  question: Record<string, string> | string;
  answer: Record<string, string> | string;
}

export const DEFAULT_VISA_FAQS: LocalizedVisaFaq[] = [
  {
    question: {
      vi: 'Tôi cần chuẩn bị hồ sơ xin Visa trước chuyến đi bao lâu?',
      en: 'How far in advance should I prepare my visa application?',
      zh: '我需要提前多久准备签证申请材料？',
      ko: '여행 출발 전 비자 서류는 얼마나 미리 준비해야 하나요?',
      ja: 'ビザ申請の書類は旅行のどれくらい前から準備すべきですか？',
    },
    answer: {
      vi: 'Với Visa Nhật Bản, Hàn Quốc nên chuẩn bị trước 3–4 tuần; với Visa Schengen, Úc, Canada hoặc Mỹ nên bắt đầu trước ít nhất 6–8 tuần để đảm bảo lịch hẹn sinh trắc học và phỏng vấn.',
      en: 'For Japan or Korea visas, apply 3–4 weeks ahead; for Schengen, Australia, Canada, or USA visas, prepare at least 6–8 weeks early to secure biometrics and interview appointments.',
      zh: '日本、韩国签证建议提前3–4周准备；申根、澳、加、美签证建议至少提前6–8周准备，以便预约指纹采集及面签时间。',
      ko: '일본·한국 비자는 3~4주 전, 솅겐·호주·캐나다·미국 비자는 지문 등록 및 인터뷰 일정을 고려해 최소 6~8주 전 준비를 권장합니다.',
      ja: '日本・韓国ビザは3〜4週間前、シェンゲン・豪州・カナダ・米国ビザは生体認証や面接予約のため6〜8週間前からのご準備をおすすめします。',
    },
  },
  {
    question: {
      vi: 'Nếu từng bị từ chối Visa trước đây, Travel có hỗ trợ nộp lại không?',
      en: 'Can Travel help if my previous visa application was refused?',
      zh: '如果之前曾被拒签过，Travel 能否协助重新递交？',
      ko: '이전에 비자가 거절된 적이 있어도 재신청 지원이 가능한가요?',
      ja: '過去にビザが却下された場合でも再申請のサポートは可能ですか？',
    },
    answer: {
      vi: 'Có. Chuyên viên sẽ rà soát nguyên nhân từ chối cũ, củng cố chứng minh tài chính/công việc và luyện phỏng vấn 1-1 trước khi nộp lại để tối đa hóa tỷ lệ đậu.',
      en: 'Yes. Our specialists analyze past refusal reasons, strengthen financial/employment documentation, and run 1-on-1 interview prep before re-applying.',
      zh: '可以。我们的专家团队会详细排查过往拒签原因，完善资产与在职证明，并提供一对一面签模拟辅导。',
      ko: '네. 전문 컨설턴트가 이전 거절 사유를 정밀 분석하여 재정·재직 서류를 보완하고 1:1 인터뷰 코칭을 제공합니다.',
      ja: 'はい。過去の却下理由を徹底分析し、財務・在職証明書類の補強や1対1の面接対策を行って再申請をサポートいたします。',
    },
  },
  {
    question: {
      vi: 'Chi phí dịch vụ Visa đã bao gồm lệ phí Đại Sứ Quán chưa?',
      en: 'Does the visa service fee include Embassy fees?',
      zh: '签证服务费是否已包含大使馆签证费？',
      ko: '비자 대행 수수료에 대사관 인지대가 포함되어 있나요?',
      ja: 'ビザサポート料金に大使館の申請料は含まれていますか？',
    },
    answer: {
      vi: 'Báo giá của Travel luôn minh bạch rõ ràng từng khoản (lệ phí lãnh sự, phí dịch thuật công chứng, phí dịch vụ trọn gói) và cam kết không phát sinh chi phí ẩn.',
      en: 'Our quote breaks down Embassy fees, notarized translation, and service charges transparently with zero hidden costs.',
      zh: '我们的报价清晰列出领馆签证费、公证翻译费及服务费明细，承诺绝无任何隐形额外收费。',
      ko: '상담 시 대사관 수수료, 번역·공증비, 대행료를 투명하게 안내해 드리며 숨겨진 추가 비용은 일절 없습니다.',
      ja: 'お見積り時に大使館申請料・翻訳公証費・サポート料を明確にご提示し、追加費用のない明朗会計をお約束します。',
    },
  },
];
