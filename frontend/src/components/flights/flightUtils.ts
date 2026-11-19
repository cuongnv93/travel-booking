import { removeVietnameseTones } from '@/lib/utils';
import { DEFAULT_AIRPORTS } from '@/hooks/useSettings';

export function findAirportCode(query: string | null, customAirports: any[] = DEFAULT_AIRPORTS): string | null {
  if (!query) return null;
  const list = Array.isArray(customAirports) && customAirports.length > 0 ? customAirports : DEFAULT_AIRPORTS;
  const raw = query.trim().toLowerCase();
  const qClean = removeVietnameseTones(query);
  if (!qClean) return null;

  const directMatch = list.find(
    (a: any) =>
      a &&
      a.code &&
      (a.code.toLowerCase() === raw || removeVietnameseTones(a.code) === qClean)
  );
  if (directMatch) return directMatch.code;

  const nameMatch = list.find((a: any) => {
    if (!a) return false;
    const cityObj = a.cities || a.city || {};
    const cityValues = typeof cityObj === 'object' && cityObj ? Object.values(cityObj) : [cityObj];
    const nameClean = removeVietnameseTones(a.name || '');

    const matchesName =
      nameClean.length > 0 && (nameClean.includes(qClean) || qClean.includes(nameClean));

    const matchesCity = cityValues.some((cityName: any) => {
      if (typeof cityName !== 'string') return false;
      const cnClean = removeVietnameseTones(cityName);
      return cnClean.length > 0 && (cnClean.includes(qClean) || qClean.includes(cnClean));
    });

    return matchesName || matchesCity;
  });

  return nameMatch ? nameMatch.code : null;
}

/**
 * Parses flight duration strings like "2h 15m", "1h 00m", "90m", "2h" into total minutes.
 */
export function parseFlightDuration(duration?: string | null): number {
  if (!duration || typeof duration !== 'string') return Number.MAX_SAFE_INTEGER;
  const hoursMatch = duration.match(/(\d+)\s*h/i);
  const minsMatch = duration.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  if (!hoursMatch && !minsMatch) {
    const numeric = parseInt(duration, 10);
    return Number.isNaN(numeric) ? Number.MAX_SAFE_INTEGER : numeric;
  }
  return hours * 60 + mins;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!/^\+?[0-9\s\-().]{8,20}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export const FLIGHT_EXTRA_I18N: Record<string, Record<string, string>> = {
  swapAirports: {
    vi: 'Đổi chiều bay',
    en: 'Swap airports',
    zh: '交换出发与到达机场',
    ko: '출발/도착 공항 바꾸기',
    ja: '出発地と到着地を入れ替え',
  },
  returnDate: {
    vi: 'Ngày về',
    en: 'Return Date',
    zh: '返程日期',
    ko: '오는 날',
    ja: '復路日',
  },
  shortestDuration: {
    vi: 'Thời gian bay ngắn nhất',
    en: 'Shortest Duration',
    zh: '飞行时间最短',
    ko: '최단 비행시간순',
    ja: '所要時間が短い順',
  },
  adults: {
    vi: 'Người lớn',
    en: 'Adults',
    zh: '成人',
    ko: '성인',
    ja: '大人',
  },
  children: {
    vi: 'Trẻ em (75%)',
    en: 'Children (75%)',
    zh: '儿童 (75%)',
    ko: '아동 (75%)',
    ja: '小児 (75%)',
  },
  addToCartBtn: {
    vi: 'Thêm vào giỏ',
    en: 'Add to Cart',
    zh: '加入购物车',
    ko: '장바구니 담기',
    ja: 'カートに追加',
  },
  addedToCart: {
    vi: 'Đã thêm vé máy bay vào giỏ hàng!',
    en: 'Flight ticket added to your cart!',
    zh: '机票已成功加入购物车！',
    ko: '항공권이 장바구니에 추가되었습니다!',
    ja: '航空券をカートに追加しました！',
  },
  sameAirportError: {
    vi: 'Điểm đi và điểm đến không được trùng nhau.',
    en: 'Departure and destination airports cannot be the same.',
    zh: '出发地和目的地不能相同。',
    ko: '출발지와 도착지는 같을 수 없습니다.',
    ja: '出発地と目的地を同じにすることはできません。',
  },
  invalidName: {
    vi: 'Vui lòng nhập họ tên hành khách hợp lệ (tối thiểu 2 ký tự).',
    en: 'Please enter a valid passenger full name (at least 2 characters).',
    zh: '请输入有效的乘客姓名（至少 2 个字符）。',
    ko: '유효한 탑승객 성명을 입력해주세요 (최소 2자).',
    ja: '有効な搭乗者氏名を入力してください（2文字以上）。',
  },
  invalidPhone: {
    vi: 'Số điện thoại liên hệ không hợp lệ (8–15 chữ số).',
    en: 'Please enter a valid phone number (8–15 digits).',
    zh: '请输入有效的联系电话（8–15 位数字）。',
    ko: '유효한 전화번호를 입력해주세요 (8~15자리 숫자).',
    ja: '有効な電話番号を入力してください（8〜15桁）。',
  },
  invalidEmail: {
    vi: 'Địa chỉ email nhận vé không hợp lệ.',
    en: 'Please enter a valid ticket delivery email address.',
    zh: '请输入有效的接收电子客票邮箱地址。',
    ko: '유효한 이메일 주소를 입력해주세요.',
    ja: '有効なメールアドレスを入力してください。',
  },
  invalidDate: {
    vi: 'Vui lòng chọn ngày bay hợp lệ.',
    en: 'Please select a valid departure date.',
    zh: '请选择有效的出发日期。',
    ko: '유효한 출발 날짜를 선택해주세요.',
    ja: '有効な出発日を選択してください。',
  },
  seatLimitError: {
    vi: 'Tổng số hành khách vượt quá số ghế còn trống.',
    en: 'Total passengers exceed available seats on this flight.',
    zh: '乘客总人数超过该航班剩余座位数。',
    ko: '총 탑승객 수가 잔여 좌석을 초과했습니다.',
    ja: '合計搭乗者数が空席数を超えています。',
  },
  loadError: {
    vi: 'Không thể tải danh sách chuyến bay. Vui lòng thử lại.',
    en: 'Unable to load flights. Please try again.',
    zh: '无法加载航班列表，请重试。',
    ko: '항공편 목록을 불러올 수 없습니다. 다시 시도해주세요.',
    ja: 'フライト一覧を読み込めませんでした。もう一度お試しください。',
  },
  retryBtn: {
    vi: 'Thử lại',
    en: 'Retry',
    zh: '重试',
    ko: '다시 시도',
    ja: '再試行',
  },
  closeModal: {
    vi: 'Đóng hộp thoại',
    en: 'Close modal',
    zh: '关闭窗口',
    ko: '닫기',
    ja: '閉じる',
  },
  seatsLeft: {
    vi: 'Còn {count} ghế',
    en: '{count} seats left',
    zh: '仅剩 {count} 座',
    ko: '잔여 {count}석',
    ja: '残り {count}席',
  },
};

export function getFlightUiText(key: keyof typeof FLIGHT_EXTRA_I18N, locale: string): string {
  const entry = FLIGHT_EXTRA_I18N[key];
  if (!entry) return String(key);
  return entry[locale] || entry.en || entry.vi;
}
