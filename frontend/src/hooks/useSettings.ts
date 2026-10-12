'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// ==========================================
// Default Fallbacks (Instant Zero-Flicker)
// ==========================================

export const DEFAULT_DESTINATIONS = [
  {
    id: 'hanoi',
    name: { vi: 'Hà Nội', en: 'Hanoi', zh: '河内', ko: '하노이', ja: 'ハノイ' },
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    tag: { vi: 'Thủ Đô Ngàn Năm', en: 'Ancient Capital', zh: '千年古都', ko: '천년 고도', ja: '千年の古都' },
    tourQuery: 'Hà Nội',
    order: 1,
    isActive: true,
  },
  {
    id: 'danang',
    name: { vi: 'Đà Nẵng', en: 'Da Nang', zh: '岘港', ko: '다낭', ja: 'ダナン' },
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    tag: { vi: 'Thành Phố Đáng Sống', en: 'Coastal Haven', zh: '宜居之城', ko: '살기 좋은 도시', ja: '住みやすい街' },
    tourQuery: 'Đà Nẵng',
    order: 2,
    isActive: true,
  },
  {
    id: 'hoian',
    name: { vi: 'Hội An', en: 'Hoi An', zh: '会安', ko: '호이안', ja: 'ホイアン' },
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    tag: { vi: 'Phố Cổ Di Sản', en: 'Heritage Ancient Town', zh: '世界遗产古镇', ko: '세계문화유산 고도', ja: '世界遺産の古都' },
    tourQuery: 'Hội An',
    order: 3,
    isActive: true,
  },
  {
    id: 'phuquoc',
    name: { vi: 'Phú Quốc', en: 'Phu Quoc', zh: '富国岛', ko: '푸꾸옥', ja: 'フーコック' },
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    tag: { vi: 'Đảo Ngọc Nghỉ Dưỡng', en: 'Tropical Pearl Island', zh: '珍珠度假海岛', ko: '에메랄드빛 진주섬', ja: '真珠の楽園' },
    tourQuery: 'Phú Quốc',
    order: 4,
    isActive: true,
  },
  {
    id: 'sapa',
    name: { vi: 'Sa Pa', en: 'Sa Pa', zh: '沙坝', ko: '사파', ja: 'サパ' },
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    tag: { vi: 'Thị Xã Trong Mây', en: 'Town in the Clouds', zh: '云雾缭绕之乡', ko: '구름 위의 마을', ja: '雲の上の町' },
    tourQuery: 'Sa Pa',
    order: 5,
    isActive: true,
  },
  {
    id: 'nhatrang',
    name: { vi: 'Nha Trang', en: 'Nha Trang', zh: '芽庄', ko: '나트랑', ja: 'ニャチャン' },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    tag: { vi: 'Vịnh Biển Thiên Đường', en: 'Paradise Bay', zh: '阳光度假胜地', ko: '천혜의 휴양지', ja: '楽園のビーチ' },
    tourQuery: 'Nha Trang',
    order: 6,
    isActive: true,
  },
];

export const DEFAULT_WHY_CHOOSE_US = [
  {
    id: 'trust',
    icon: 'Shield',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    title: { vi: 'Uy Tín Hàng Đầu', en: 'Top-tier Reputation' },
    detail: { vi: 'Hơn 15 năm kinh nghiệm dẫn đầu thị trường du lịch với hàng trăm ngàn lượt khách hài lòng.', en: 'Over 15 years leading the tourism industry with hundreds of thousands of satisfied travelers.' },
  },
  {
    id: 'price',
    icon: 'Wallet',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    title: { vi: 'Giá Tốt & Minh Bạch', en: 'Best & Transparent Price' },
    detail: { vi: 'Cam kết giá cạnh tranh nhất, không phí ẩn phát sinh, chính sách hoàn hủy linh hoạt.', en: 'Guaranteed best competitive pricing, zero hidden fees, and flexible refund policies.' },
  },
  {
    id: 'support',
    icon: 'Headphones',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    title: { vi: 'Hỗ Trợ 24/7 Tận Tâm', en: '24/7 Dedicated Support' },
    detail: { vi: 'Đội ngũ chuyên viên tư vấn phục vụ 24/7, luôn đồng hành và xử lý mọi tình huống khẩn cấp.', en: 'Dedicated travel experts support you 24/7, ensuring peaceful journeys at every step.' },
  },
  {
    id: 'safety',
    icon: 'MapPin',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    title: { vi: 'Bảo Hiểm & An Toàn Tuyệt Đối', en: 'Safety & Premium Insurance' },
    detail: { vi: 'Mọi chuyến đi đều được bảo hiểm trọn gói với hạn mức cao nhất và quy chuẩn an toàn khắt khe.', en: 'Every journey is backed by comprehensive premium travel insurance and strict safety guidelines.' },
  },
];

export const DEFAULT_STATS_COUNTERS = [
  { value: '100,000+', icon: 'Users', color: 'text-blue-600', label: { vi: 'Du Khách Hài Lòng', en: 'Satisfied Travelers' }, sub: { vi: 'Mỗi năm trên toàn quốc', en: 'Annually across Vietnam' } },
  { value: '99.2%', icon: 'Star', color: 'text-amber-500', label: { vi: 'Đánh Giá 5 Sao', en: '5-Star Reviews' }, sub: { vi: 'Từ trải nghiệm khách hàng', en: 'Verified passenger reviews' } },
  { value: '15+', icon: 'Shield', color: 'text-emerald-600', label: { vi: 'Năm Kinh Nghiệm', en: 'Years Experience' }, sub: { vi: 'Dẫn đầu ngành lữ hành', en: 'Leading the tourism industry' } },
  { value: '50+', icon: 'Sparkles', color: 'text-purple-600', label: { vi: 'Giải Thưởng Du Lịch', en: 'Tourism Awards' }, sub: { vi: 'Trong nước & quốc tế', en: 'National & Global recognition' } },
];

export const DEFAULT_AIRPORTS = [
  { code: 'SGN', name: 'Tân Sơn Nhất', cities: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', ko: '호치민', ja: 'ホーチミン', zh: '胡志明市' } },
  { code: 'HAN', name: 'Nội Bài', cities: { vi: 'Hà Nội', en: 'Hanoi', ko: '하노이', ja: 'ハノイ', zh: '河内' } },
  { code: 'DAD', name: 'Đà Nẵng', cities: { vi: 'Đà Nẵng', en: 'Da Nang', ko: '다낭', ja: 'ダナン', zh: '岘港' } },
  { code: 'PQC', name: 'Phú Quốc', cities: { vi: 'Phú Quốc', en: 'Phu Quoc', ko: '푸꾸옥', ja: 'フーコック', zh: '富国岛' } },
  { code: 'CXR', name: 'Cam Ranh / Nha Trang', cities: { vi: 'Nha Trang', en: 'Nha Trang', ko: '나트랑', ja: 'ニャチャン', zh: '芽庄' } },
  { code: 'DLI', name: 'Liên Khương / Đà Lạt', cities: { vi: 'Đà Lạt', en: 'Da Lat', ko: '달랏', ja: 'ダラット', zh: '大叻' } },
  { code: 'HUI', name: 'Phú Bài / Huế', cities: { vi: 'Huế', en: 'Hue', ko: '후에', ja: 'フエ', zh: '顺化' } },
  { code: 'UIH', name: 'Phù Cát / Quy Nhơn', cities: { vi: 'Quy Nhơn', en: 'Quy Nhon', ko: '퀴논', ja: 'クイニョン', zh: '归仁' } },
  { code: 'VCL', name: 'Chu Lai / Quảng Nam', cities: { vi: 'Quảng Nam', en: 'Quang Nam', ko: '꽝남', ja: 'クアンナム', zh: '广南' } },
  { code: 'HPH', name: 'Cát Bi / Hải Phòng', cities: { vi: 'Hải Phòng', en: 'Hai Phong', ko: '하이퐁', ja: 'ハイフォン', zh: '海防' } },
];

export const DEFAULT_AIRLINES = [
  { code: 'VU', name: 'Vietravel Airlines', isPartner: true, partnerBadge: 'Đối tác chiến lược', logoText: 'VU', badgeColor: 'bg-amber-400 text-blue-950 border-amber-300' },
  { code: 'VN', name: 'Vietnam Airlines', isPartner: false, partnerBadge: 'Hãng HK Quốc gia', logoText: 'VN', badgeColor: 'bg-blue-900 text-yellow-300 border-blue-800' },
  { code: 'VJ', name: 'Vietjet Air', isPartner: false, partnerBadge: 'Bay cùng Vietjet', logoText: 'VJ', badgeColor: 'bg-red-600 text-white border-red-500' },
  { code: 'QH', name: 'Bamboo Airways', isPartner: false, partnerBadge: 'Hơn cả một chuyến bay', logoText: 'QH', badgeColor: 'bg-emerald-600 text-white border-emerald-500' },
];

export const DEFAULT_BRANCHES = [
  {
    id: 'hcm',
    name: {
      vi: 'Trụ Sở Chính TP. Hồ Chí Minh',
      en: 'Ho Chi Minh City Headquarter',
      zh: '胡志明市总公司',
      ko: '호치민시 본사',
      ja: 'ホーチミン市本社'
    },
    address: {
      vi: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      en: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
      zh: '胡志明市第一郡阮惠大道 123 号',
      ko: '호치민시 1군 응우옌후에 거리 123',
      ja: 'ホーチミン市1区グエンフエ通り123'
    },
    phone: '1800 646 888',
    email: 'hcm@travel.com',
    isMain: true,
  },
  {
    id: 'danang',
    name: {
      vi: 'Chi Nhánh Đà Nẵng',
      en: 'Da Nang Regional Office',
      zh: '岘港分公司',
      ko: '다낭 지사',
      ja: 'ダナン支社'
    },
    address: {
      vi: '168 Nguyễn Văn Linh, Phường Vĩnh Trung, Quận Thanh Khê, Đà Nẵng',
      en: '168 Nguyen Van Linh, Thanh Khe, Da Nang',
      zh: '岘港市清溪郡阮文灵路 168 号',
      ko: '다낭시 탄케군 응우옌반린 거리 168',
      ja: 'ダナン市タインケー区グエンヴァンリン通り168'
    },
    phone: '0236 388 9999',
    email: 'danang@travel.com',
    isMain: false,
  },
  {
    id: 'hanoi',
    name: {
      vi: 'Văn Phòng Đại Diện Hà Nội',
      en: 'Hanoi Representative Office',
      zh: '河内代表处',
      ko: '하노이 지사',
      ja: 'ハノイ支社'
    },
    address: {
      vi: '45 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
      en: '45 Trang Tien Street, Hoan Kiem District, Hanoi',
      zh: '河内市还剑郡长钱路 45 号',
      ko: '하노이시 호안끼엠군 짱띠엔 거리 45',
      ja: 'ハノイ市ホアンキエム区チャンティエン通り45'
    },
    phone: '024 3999 8888',
    email: 'hanoi@travel.com',
    isMain: false,
  },
];

export const DEFAULT_WORKING_HOURS = {
  weekdays: {
    vi: 'Thứ Hai - Thứ Sáu: 08:00 - 21:00',
    en: 'Monday - Friday: 08:00 - 21:00',
    zh: '周一至周五：08:00 - 21:00',
    ko: '월요일 - 금요일: 08:00 - 21:00',
    ja: '月曜日 - 金曜日: 08:00 - 21:00'
  },
  weekend: {
    vi: 'Thứ Bảy - Chủ Nhật: 08:30 - 18:00',
    en: 'Saturday - Sunday: 08:30 - 18:00',
    zh: '周六至周日：08:30 - 18:00',
    ko: '토요일 - 일요일: 08:30 - 18:00',
    ja: '土曜日 - 日曜日: 08:30 - 18:00'
  },
  hotlineNote: {
    vi: 'Tổng đài chăm sóc khách hàng hỗ trợ 24/7 kể cả ngày Lễ & Tết',
    en: 'Customer Care Hotline operates 24/7 including Public Holidays',
    zh: '客服热线 24/7 全天候支持，节假日无休',
    ko: '고객 센터 24시간 연중무휴 지원',
    ja: 'カスタマーサポート 24時間年中無休'
  },
};

export const DEFAULT_TOUR_POLICIES = {
  inclusions: [
    'Xe ô tô du lịch đời mới chất lượng cao đưa đón tham quan suốt hành trình.',
    'Khách sạn / Resort tiêu chuẩn cao cấp (2-3 khách/phòng tiện nghi).',
    'Tất cả các bữa ăn theo tiêu chuẩn thực đơn phong phú địa phương.',
    'Vé vào cổng tất cả các danh lam thắng cảnh theo lịch trình chi tiết.',
    'Hướng dẫn viên chuyên nghiệp, nhiệt tình, am hiểu văn hóa phục vụ suốt tuyến.',
    'Bảo hiểm du lịch nội địa mức trách nhiệm tối đa 100.000.000 VNĐ/vụ.',
    'Nước uống tinh khiết đóng chai (1 chai/người/ngày) và nón du lịch thời trang.',
  ],
  exclusions: [
    'Thuế giá trị gia tăng (VAT 8%) theo quy định nhà nước.',
    'Phụ thu phòng đơn dành cho khách đăng ký đi một mình.',
    'Chi phí cá nhân: giặt ủi, điện thoại, đồ uống minibar và dịch vụ ngoài tour.',
    'Tiền bồi dưỡng (Tip) tự nguyện dành cho Hướng dẫn viên và Lái xe.',
  ],
  importantNotes: [
    'Quý khách vui lòng xuất trình CCCD hoặc Hộ chiếu gốc còn thời hạn khi làm thủ tục.',
    'Trẻ em dưới 14 tuổi chưa có CCCD bắt buộc phải có Giấy khai sinh bản sao công chứng.',
    'Vui lòng có mặt tại điểm đón trước giờ khởi hành tối thiểu 30 phút.',
  ],
};

export const DEFAULT_HOTEL_AMENITIES = [
  'WiFi miễn phí', 'Hồ bơi ngoài trời', 'Buffet sáng tiêu chuẩn', 'Spa & Massage trị liệu',
  'Phòng tập Gym hiện đại', 'Quầy Bar & Lounge', 'Nhà hàng ẩm thực Á-Âu', 'Bãi biển riêng tư',
  'Xe đưa đón sân bay', 'Khu vui chơi trẻ em (Kids Club)', 'Lễ tân phục vụ 24/7',
];

export const DEFAULT_BUSINESS_LICENSE = {
  taxCode: '0102030405',
  issuedBy: 'Sở Kế Hoạch & Đầu Tư Thành Phố Hồ Chí Minh cấp ngày 15/08/2012',
  internationalLicense: 'GP Lữ Hành Quốc Tế: 79-0123/2026/TCDL-GP LHQT',
  hotlineComplaints: '1900 6868 (Phản ánh chất lượng dịch vụ)',
};

export const DEFAULT_SOCIAL_LINKS = {
  facebook: 'https://facebook.com/travelbooking',
  zalo: 'https://zalo.me/0912345678',
  youtube: 'https://youtube.com/@travelbooking',
  tiktok: 'https://tiktok.com/@travelbooking',
  instagram: 'https://instagram.com/travelbooking',
};

import { DEFAULT_PAGE_BANNERS } from '@/lib/constants';
export { DEFAULT_PAGE_BANNERS };

export const DEFAULT_SITE_INFO = {
  siteName: 'Travel Booking',
  hotline: '1800 646 888',
  email: 'support@travel.com',
  address: {
    vi: '168 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng',
    en: '168 Nguyen Van Linh, Thanh Khe, Da Nang',
    zh: '岘港市清溪郡阮文灵路168号',
    ko: '다낭시 탄케구 응우옌반린 168번지',
    ja: 'ダナン市タケー区グエンバンリン168番地',
  },
};

export const DEFAULT_HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
    title: {
      vi: 'Khám Phá Hà Nội Ngàn Năm Văn Hiến',
      en: 'Explore Thousand-Year-Old Hanoi Culture',
      zh: '探索千年文化古都河内',
      ko: '천년의 역사를 간직한 하노이 탐험',
      ja: '千年の歴史を誇るハノイを巡る旅',
    },
    subtitle: {
      vi: 'Trải nghiệm văn hóa, ẩm thực và vẻ đẹp cổ kính của phố cổ 36 phường',
      en: 'Experience culture, cuisine, and ancient beauty of Hanoi 36 Old Streets',
      zh: '体验河内 36 古街的丰富文化、地道美食与古朴风貌',
      ko: '하노이 36개 구시가지의 문화, 음식 및 예스러운 아름다움을 체험하세요',
      ja: 'ハノイ36古街の歴史ある美しさ、文化、絶品グルメをご体感ください',
    },
    ctaText: { vi: 'Khám Phá Tours', en: 'Explore Tours', zh: '探索行程', ko: '투어 탐색', ja: 'ツアーを探す' },
    ctaLink: '/tours',
  },
  {
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600',
    title: {
      vi: 'Nghỉ Dưỡng 5 Sao Tại Biển Đà Nẵng',
      en: '5-Star Luxury Resort in Da Nang Coast',
      zh: '岘港海滨五星级奢华度假',
      ko: '다낭 해변의 5성급 럭셔리 리조트 휴양',
      ja: 'ダナンビーチの5つ星極上リゾート',
    },
    subtitle: {
      vi: 'Tận hưởng khoảnh khắc tuyệt đẹp tại Cầu Vàng Bà Nà Hills & Hội An lung linh',
      en: 'Enjoy breathtaking moments at Golden Bridge Ba Na Hills & romantic Hoi An',
      zh: '尽情享用巴拿山黄金桥与会安古镇浪漫夜景的绝美时光',
      ko: '바나힐 골든브릿지와 환상적인 호이안에서 특별한 순간을 즐기세요',
      ja: 'バーナーヒルズの神の hand 橋と幻想的なホイアンの夜景を満喫',
    },
    ctaText: { vi: 'Đặt Khách Sạn', en: 'Book Hotels', zh: '预订酒店', ko: '호텔 예약', ja: 'ホテルを予約' },
    ctaLink: '/hotels',
  },
  {
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
    title: {
      vi: 'Phú Quốc – Đảo Ngọc Thiên Đường',
      en: 'Phu Quoc – Tropical Island Paradise',
      zh: '富国岛 – 热带天堂珍珠岛',
      ko: '푸꾸옥 – 천국의 파라다이스 섬',
      ja: 'フーコック島 – 楽園のトロピカルアイランド',
    },
    subtitle: {
      vi: 'Bãi biển cát trắng mịn, ngắm san hô biển Nam và VinWonders sôi động',
      en: 'Pristine white sand beaches, coral reef snorkeling & vibrant VinWonders',
      zh: '细白沙滩、浮潜观赏珊瑚及体验精彩纷呈的 VinWonders 主题乐园',
      ko: '하얀 모래사장, 산호초 스노클링 및 활기찬 빈원더스 테마파크 체험',
      ja: '白砂のビーチ、珊瑚礁スノーケリング、人気のテーマパークVinWondersを満喫',
    },
    ctaText: { vi: 'Xem Chuyến Đi', en: 'View Trip', zh: '查看行程', ko: '일정 보기', ja: 'プランを見る' },
    ctaLink: '/tours/phu-quoc-paradise',
  },
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: '1',
    name: 'Nguyễn Thu Trang',
    role: 'Khách hàng tour Đà Nẵng 4N3Đ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    rating: 5,
    comment: 'Chuyến đi tuyệt vời nhất của gia đình mình trong năm nay! Khách sạn 5 sao view biển cực đẹp, hướng dẫn viên nhiệt tình chu đáo.',
    location: 'Hà Nội'
  },
  {
    id: '2',
    name: 'Trần Minh Hoàng',
    role: 'Doanh nhân - Khách hàng thân thiết',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 5,
    comment: 'Dịch vụ đặt vé máy bay và hỗ trợ visa Nhật Bản siêu nhanh gọn. Đội ngũ hỗ trợ 24/7 giải quyết phát sinh rất chuyên nghiệp.',
    location: 'TP. Hồ Chí Minh'
  },
  {
    id: '3',
    name: 'Lê Hoàng Yến',
    role: 'Khách hàng tour Phú Quốc',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    rating: 5,
    comment: 'Giá tour rất hợp lý so với chất lượng dịch vụ nhận được. Lịch trình thư giãn phù hợp cho cả người lớn tuổi và trẻ nhỏ.',
    location: 'Đà Nẵng'
  }
];

export const DEFAULT_PAYMENT_INFO = {
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  bankAccount: '999988887777',
  bankHolder: 'CÔNG TY TNHH DU LỊCH TRAVEL BOOKING',
  enableBooking: true,
};

// ==========================================
// Base React Query Settings Hook (Cached 30m)
// ==========================================

export function useSetting<T>(key: string, fallback: T): { data: T; isLoading: boolean; isError: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      try {
        const res: any = await api.get(`/settings/${key}`);
        if (!res) return fallback;
        const val = res.value !== undefined ? res.value : res;
        return val ?? fallback;
      } catch {
        return fallback;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes fresh (infrequently changing master settings)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache retention in memory
    refetchOnWindowFocus: false,
  });

  return {
    data: (data ?? fallback) as T,
    isLoading,
    isError,
  };
}

// ==========================================
// Feature-Specific Convenience Hooks
// ==========================================

export function useFeaturedDestinations() {
  return useSetting('home_featured_destinations', DEFAULT_DESTINATIONS);
}

export function useWhyChooseUs() {
  return useSetting('home_why_choose_us', DEFAULT_WHY_CHOOSE_US);
}

export function useHomeStatsCounters() {
  return useSetting('home_stats_counters', DEFAULT_STATS_COUNTERS);
}

export function useAirportsCatalog() {
  return useSetting('flight_airports', DEFAULT_AIRPORTS);
}

export function useAirlinesCatalog() {
  return useSetting('flight_airlines', DEFAULT_AIRLINES);
}

export function useVisaCountriesCatalog() {
  return useSetting('visa_countries_catalog', []);
}

export function useVisaProcessSteps() {
  return useSetting('visa_process_steps', []);
}

export function useVisaStatsBadges() {
  return useSetting('visa_stats_badges', []);
}

export function useCompanyBranches() {
  return useSetting('company_branches', DEFAULT_BRANCHES);
}

export function useWorkingHours() {
  return useSetting('working_hours', DEFAULT_WORKING_HOURS);
}

export function useTourDefaultPolicies() {
  return useSetting('tour_default_inclusions_exclusions', DEFAULT_TOUR_POLICIES);
}

export function useHotelAmenitiesMaster() {
  return useSetting('hotel_amenities_master', DEFAULT_HOTEL_AMENITIES);
}

export function useBusinessLicense() {
  return useSetting('layout_business_license', DEFAULT_BUSINESS_LICENSE);
}

export function useSocialLinks() {
  return useSetting('layout_social_links', DEFAULT_SOCIAL_LINKS);
}

export function usePageBanners() {
  return useSetting('page_banners', DEFAULT_PAGE_BANNERS);
}

export function useSiteInfo() {
  return useSetting('site_info', DEFAULT_SITE_INFO);
}

export function useHeroBanners() {
  return useSetting('hero_banners', DEFAULT_HERO_SLIDES);
}

export function useTestimonials() {
  return useSetting('testimonials', DEFAULT_TESTIMONIALS);
}

export function usePaymentInfo() {
  return useSetting('payment_info', DEFAULT_PAYMENT_INFO);
}
