/**
 * Universal Error & Notification Localizer
 * Maps backend error strings & codes to localized messages across vi, en, zh, ko, ja
 */

export const ERROR_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Auth Errors
  'Invalid credentials': {
    vi: 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.',
    en: 'Incorrect email or password. Please try again.',
    zh: '邮箱或密码不正确，请重试。',
    ko: '이메일 또는 비밀번호가 올바르지 않습니다. 다시 시도해주세요.',
    ja: 'メールアドレスまたはパスワードが正しくありません。もう一度お試しください。',
  },
  'User already exists': {
    vi: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác.',
    en: 'This email is already registered. Please sign in or use another email.',
    zh: '该邮箱已被注册，请直接登录或使用其他邮箱。',
    ko: '이미 등록된 이메일입니다. 로그인하거나 다른 이메일을 사용해주세요.',
    ja: 'このメールアドレスは既に登録されています。ログインするか別のメールをご利用ください。',
  },
  'Not authorized, no token': {
    vi: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
    en: 'Session expired. Please log in again.',
    zh: '登录已过期，请重新登录。',
    ko: '세션이 만료되었습니다. 다시 로그인해주세요.',
    ja: 'セッションの有効期限が切れました。再度ログインしてください。',
  },
  'Not authorized, token failed': {
    vi: 'Phiên làm việc không hợp lệ. Vui lòng đăng nhập lại.',
    en: 'Invalid session. Please log in again.',
    zh: '登录凭证无效，请重新登录。',
    ko: '유효하지 않은 세션입니다. 다시 로그인해주세요.',
    ja: 'セッションが無効です。再度ログインしてください。',
  },
  'User not found or account deactivated': {
    vi: 'Tài khoản không tồn tại hoặc đã bị khóa.',
    en: 'Account does not exist or has been suspended.',
    zh: '账户不存在或已被停用。',
    ko: '계정이 존재하지 않거나 비활성화되었습니다.',
    ja: 'アカウントが存在しないか、停止されています。',
  },

  // Booking & Cart Errors
  'Booking not found': {
    vi: 'Không tìm thấy thông tin đơn đặt chỗ.',
    en: 'Booking reservation not found.',
    zh: '未找到预订订单信息。',
    ko: '예약 내역을 찾을 수 없습니다.',
    ja: '予約情報が見つかりませんでした。',
  },
  'Chỉ có thể hủy đơn đang ở trạng thái chờ xác nhận': {
    vi: 'Chỉ có thể hủy đơn khi đang ở trạng thái chờ xác nhận.',
    en: 'Only reservations in pending status can be cancelled.',
    zh: '仅待确认状态下的预订订单可以取消。',
    ko: '대기 중인 예약만 취소할 수 있습니다.',
    ja: '保留中の予約のみキャンセル可能です。',
  },
  'Mã giảm giá đã bị vô hiệu hóa': {
    vi: 'Mã giảm giá này hiện không còn áp dụng.',
    en: 'This promo code has been deactivated.',
    zh: '该优惠码已失效停用。',
    ko: '해당 할인 코드는 비활성화되었습니다.',
    ja: 'このクーポンコードは現在ご利用いただけません。',
  },
  'Mã giảm giá đã hết hạn': {
    vi: 'Mã giảm giá đã quá hạn sử dụng.',
    en: 'This promo code has expired.',
    zh: '该优惠码已过期。',
    ko: '할인 코드 사용 기한이 만료되었습니다.',
    ja: 'クーポンコードの有効期限が切れています。',
  },
  'Mã giảm giá đã hết lượt sử dụng': {
    vi: 'Mã giảm giá đã vượt quá số lượt dùng tối đa.',
    en: 'This promo code has reached its usage limit.',
    zh: '该优惠码使用次数已达上限。',
    ko: '할인 코드의 최대 사용 횟수가 초과되었습니다.',
    ja: 'このクーポンは利用上限数に達しました。',
  },
  'Mã giảm giá không tồn tại': {
    vi: 'Mã giảm giá không chính xác hoặc không tồn tại.',
    en: 'Invalid promo code or code does not exist.',
    zh: '优惠券代码不存在或输入有误。',
    ko: '할인 코드가 존재하지 않거나 잘못되었습니다.',
    ja: 'クーポンコードが存在しないか、間違っています。',
  },

  // General & Network Errors
  'Network Error': {
    vi: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
    en: 'Unable to connect to server. Please check your network connection.',
    zh: '无法连接到服务器，请检查您的网络连接。',
    ko: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
    ja: 'サーバーに接続できません。通信環境をご確認ください。',
  },
  'Timeout': {
    vi: 'Yêu cầu quá thời gian phản hồi. Vui lòng thử lại sau giây lát.',
    en: 'Request timed out. Please try again in a moment.',
    zh: '请求超时，请稍后再试。',
    ko: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
    ja: 'リクエストがタイムアウトしました。しばらく経ってから再度お試しください。',
  },
  'Internal Server Error': {
    vi: 'Đã xảy ra lỗi trên hệ thống máy chủ. Vui lòng thử lại sau.',
    en: 'Internal server error occurred. Please try again later.',
    zh: '服务器内部错误，请稍后重试。',
    ko: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    ja: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
  },
};

/**
 * Resolves a localized error message given an error object, current locale, and optional fallback.
 */
export function getLocalizedError(error: any, locale: string = 'vi', fallbackMessage?: string): string {
  const currentLocale = ['vi', 'en', 'zh', 'ko', 'ja'].includes(locale) ? locale : 'vi';

  // 1. Extract backend message string
  const rawMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    (typeof error === 'string' ? error : '');

  if (!rawMessage) {
    return fallbackMessage || ERROR_TRANSLATIONS['Internal Server Error']?.[currentLocale] || 'Đã có lỗi xảy ra';
  }

  // 2. Direct dictionary lookup
  if (ERROR_TRANSLATIONS[rawMessage] && ERROR_TRANSLATIONS[rawMessage][currentLocale]) {
    return ERROR_TRANSLATIONS[rawMessage][currentLocale];
  }

  // 3. Substring fuzzy match
  for (const [key, translations] of Object.entries(ERROR_TRANSLATIONS)) {
    if (rawMessage.toLowerCase().includes(key.toLowerCase())) {
      if (translations[currentLocale]) {
        return translations[currentLocale];
      }
    }
  }

  // 4. Fallback or cleaned message
  return fallbackMessage || rawMessage;
}
