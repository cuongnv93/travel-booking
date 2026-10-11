import Setting from '../models/Setting';
import { cacheService } from '../services/cacheService';

export const MASTER_SETTINGS_SEEDS = [
  // 1. Home - Điểm đến nổi bật (Featured Destinations)
  {
    key: 'home_featured_destinations',
    group: 'home',
    value: [
      {
        id: 'hanoi',
        name: { vi: 'Hà Nội', en: 'Hanoi', zh: '河内', ko: '하노이', ja: 'ハノイ' },
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        tag: { vi: 'Văn Hóa Nghìn Năm', en: 'Ancient Culture', zh: '千年古都', ko: '천년 문화', ja: '千年の歴史' },
        tourQuery: 'Hà Nội',
        order: 1,
        isActive: true
      },
      {
        id: 'danang',
        name: { vi: 'Đà Nẵng', en: 'Da Nang', zh: '岘港', ko: '다낭', ja: 'ダナン' },
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        tag: { vi: 'Thành Phố Đáng Sống', en: 'Most Livable City', zh: '宜居海滨城市', ko: '살기 좋은 도시', ja: '最も住みやすい街' },
        tourQuery: 'Đà Nẵng',
        order: 2,
        isActive: true
      },
      {
        id: 'hoian',
        name: { vi: 'Hội An', en: 'Hoi An', zh: '会安', ko: '호이안', ja: 'ホイアン' },
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        tag: { vi: 'Phố Cổ Lung Linh', en: 'Ancient Lantern Town', zh: '浪漫灯笼古镇', ko: '등불 고대 마을', ja: 'ランタンの古都' },
        tourQuery: 'Hội An',
        order: 3,
        isActive: true
      },
      {
        id: 'phuquoc',
        name: { vi: 'Phú Quốc', en: 'Phu Quoc', zh: '富国岛', ko: '푸꾸옥', ja: 'フーコック' },
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
        tag: { vi: 'Đảo Ngọc Thiên Đường', en: 'Tropical Paradise', zh: '热带珍珠岛', ko: '진주섬 파라다이스', ja: '楽園の真珠島' },
        tourQuery: 'Phú Quốc',
        order: 4,
        isActive: true
      },
      {
        id: 'sapa',
        name: { vi: 'Sa Pa', en: 'Sa Pa', zh: '沙坝', ko: '사파', ja: 'サパ' },
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
        tag: { vi: 'Xứ Sở Sương Mù', en: 'Misty Mountains', zh: '云雾之乡', ko: '안개 낀 고원', ja: '霧の高原' },
        tourQuery: 'Sa Pa',
        order: 5,
        isActive: true
      },
      {
        id: 'nhatrang',
        name: { vi: 'Nha Trang', en: 'Nha Trang', zh: '芽庄', ko: '나트랑', ja: 'ニャチャン' },
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        tag: { vi: 'Vịnh Biển Xanh Ngọc', en: 'Turquoise Bay', zh: '蔚蓝海湾', ko: '푸른 해변 휴양지', ja: 'エメラルドブルーの湾' },
        tourQuery: 'Nha Trang',
        order: 6,
        isActive: true
      },
      {
        id: 'halong',
        name: { vi: 'Hạ Long', en: 'Ha Long Bay', zh: '下龙湾', ko: '하롱베이', ja: 'ハロン湾' },
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        tag: { vi: 'Kỳ Quan Thiên Nhiên', en: 'Natural Wonder', zh: '世界奇观', ko: '세계 7대 자연경관', ja: '世界自然遺産' },
        tourQuery: 'Hạ Long',
        order: 7,
        isActive: true
      },
      {
        id: 'hcm',
        name: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市', ko: '호치민시', ja: 'ホーチミン市' },
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        tag: { vi: 'Sôi Động & Hoa Lệ', en: 'Vibrant Metropolis', zh: '繁华都市', ko: '활기찬 대도시', ja: '活気あふれる大都市' },
        tourQuery: 'TP. Hồ Chí Minh',
        order: 8,
        isActive: true
      },
      {
        id: 'caobang',
        name: { vi: 'Cao Bằng', en: 'Cao Bang', zh: '高平', ko: '까오방', ja: 'カオバン' },
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        tag: { vi: 'Thác Bản Giốc Hùng Vĩ', en: 'Ban Gioc Waterfall', zh: '壮美德天瀑布', ko: '반족 폭포의 절경', ja: 'バンゾック滝' },
        tourQuery: 'Cao Bằng',
        order: 9,
        isActive: true
      },
      {
        id: 'hue',
        name: { vi: 'Huế', en: 'Hue', zh: '顺化', ko: '후에', ja: 'フエ' },
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        tag: { vi: 'Cố Đô Di Sản', en: 'Imperial Heritage', zh: '历史古都', ko: '유네스코 왕도', ja: '古都の遺産' },
        tourQuery: 'Huế',
        order: 10,
        isActive: true
      }
    ]
  },

  // 2. Home - Cam kết chất lượng (Why Choose Us)
  {
    key: 'home_why_choose_us',
    group: 'home',
    value: [
      {
        id: 'trust',
        icon: 'Shield',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        title: {
          vi: 'Uy Tín Hàng Đầu',
          en: 'Top-tier Reputation',
          zh: '卓越信誉',
          ko: '최고의 신뢰성',
          ja: 'トップクラスの信頼性'
        },
        detail: {
          vi: 'Hơn 15 năm kinh nghiệm dẫn đầu thị trường du lịch với hàng trăm ngàn lượt khách hài lòng.',
          en: 'Over 15 years leading the tourism industry with hundreds of thousands of satisfied travelers.',
          zh: '拥有逾15年领跑旅游市场的丰富经验，深受数十万满意旅客赞誉。',
          ko: '15년 이상의 여행 업계 선도 경험으로 수십만 명의 만족 고객을 보유하고 있습니다.',
          ja: '15年以上の観光業界実績を誇り、何十万人ものお客様に選ばれています。'
        }
      },
      {
        id: 'price',
        icon: 'Wallet',
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
        title: {
          vi: 'Giá Tốt & Minh Bạch',
          en: 'Best & Transparent Price',
          zh: '价格透明实惠',
          ko: '최적의 투명한 가격',
          ja: '安心の明朗会計'
        },
        detail: {
          vi: 'Cam kết giá cạnh tranh nhất, không phí ẩn phát sinh, chính sách hoàn hủy linh hoạt.',
          en: 'Guaranteed best competitive pricing, zero hidden fees, and flexible refund policies.',
          zh: '承诺最具竞争力的超值特价，绝无隐形消费，退订政策灵活贴心。',
          ko: '숨겨진 추가 비용 없이 최상의 가격 경쟁력과 유연한 취소/환불 정책을 보장합니다.',
          ja: '不透明な追加料金なし。市場競争力のある適正価格と安心のキャンセル規定。'
        }
      },
      {
        id: 'support',
        icon: 'Headphones',
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        title: {
          vi: 'Hỗ Trợ 24/7 Tận Tâm',
          en: '24/7 Dedicated Support',
          zh: '24/7 全天候管家服务',
          ko: '24/7 연중무휴 고객지원',
          ja: '24時間365日対応サポート'
        },
        detail: {
          vi: 'Đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng hỗ trợ khách hàng mọi lúc, mọi nơi.',
          en: 'Professional consulting team always ready to assist you anytime, anywhere.',
          zh: '专业资深的旅游顾问团队，随时随地为您排忧解难，保驾护航。',
          ko: '전문 상담팀이 언제 어디서나 고객님의 여행 일정을 신속하고 친절하게 지원합니다.',
          ja: 'プロのトラベルコンサルタントが、いつでもどこでもお客様の旅を全力でサポート。'
        }
      },
      {
        id: 'safety',
        icon: 'MapPin',
        color: 'text-purple-600',
        bg: 'bg-purple-100',
        title: {
          vi: 'Trải Nghiệm Đẳng Cấp',
          en: 'Premium Experience',
          zh: '顶级尊贵体验',
          ko: '프리미엄 여행 경험',
          ja: 'ワンランク上の上質な体験'
        },
        detail: {
          vi: 'Lịch trình độc quyền, khách sạn 4-5 sao tuyển chọn và bảo hiểm du lịch toàn diện.',
          en: 'Exclusive itineraries, handpicked 4-5 star hotels and comprehensive insurance.',
          zh: '精选特色独家线路，甄选4-5星级高品质酒店并配备全程高额旅游保险。',
          ko: '차별화된 단독 일정, 엄선된 4-5성급 호텔 및 전 일정 안심 여행자 보험 제공.',
          ja: '厳選された4〜5つ星ホテル、独自の特別ルート、充実の国内・海外旅行保険。'
        }
      }
    ]
  },

  // 3. Home - Số liệu thống kê thương hiệu (Brand Stats)
  {
    key: 'home_stats_counters',
    group: 'home',
    value: [
      {
        value: '500+',
        icon: 'Compass',
        color: 'text-blue-600 bg-blue-50',
        label: { vi: 'Hành Trình Khám Phá', en: 'Tour Itineraries', zh: '精彩旅游路线', ko: '탐험 일정', ja: 'ツアープラン' },
        sub: { vi: 'Đa dạng trong & ngoài nước', en: 'Domestic & International', zh: '覆盖海内外热门胜地', ko: '국내 및 해외 전역', ja: '国内外の豊富な目的地' }
      },
      {
        value: '120K+',
        icon: 'Users',
        color: 'text-emerald-600 bg-emerald-50',
        label: { vi: 'Khách Hàng Hài Lòng', en: 'Happy Travelers', zh: '尊贵满意旅客', ko: '만족 고객 수', ja: '満足されたお客様' },
        sub: { vi: 'Đã tin tưởng và đồng hành', en: 'Trusted across years', zh: '携手同行见证美好', ko: '신뢰로 보답한 동행', ja: '旅をご一緒した実績' }
      },
      {
        value: '99.2%',
        icon: 'Star',
        color: 'text-amber-600 bg-amber-50',
        label: { vi: 'Đánh Giá 5 Sao', en: '5-Star Reviews', zh: '五星好评率', ko: '5성급 만족도', ja: '高評価レビュー率' },
        sub: { vi: 'Dịch vụ chuẩn mực vượt trội', en: 'Excellence in service', zh: '卓越服务体验保障', ko: '차원 높은 고품격 서비스', ja: '高品質なサービス水準' }
      },
      {
        value: '15+',
        icon: 'Award',
        color: 'text-purple-600 bg-purple-50',
        label: { vi: 'Năm Kinh Nghiệm', en: 'Years Experience', zh: '行业深耕年限', ko: '업계 전문 경력', ja: '創業からの実績年数' },
        sub: { vi: 'Thương hiệu lữ hành uy tín', en: 'Trusted travel brand', zh: '国家知名诚信品牌', ko: '공인된 우수 여행 브랜드', ja: '信頼のトラベルブランド' }
      }
    ]
  },

  // 4. Flights - Danh mục sân bay (Airports Catalog)
  {
    key: 'flight_airports',
    group: 'flights',
    value: [
      {
        code: 'SGN',
        name: 'Tân Sơn Nhất',
        city: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市', ko: '호치민', ja: 'ホーチミン' },
        country: 'Vietnam',
        order: 1,
        isDomestic: true
      },
      {
        code: 'HAN',
        name: 'Nội Bài',
        city: { vi: 'Hà Nội', en: 'Hanoi', zh: '河内', ko: '하노이', ja: 'ハノイ' },
        country: 'Vietnam',
        order: 2,
        isDomestic: true
      },
      {
        code: 'DAD',
        name: 'Đà Nẵng',
        city: { vi: 'Đà Nẵng', en: 'Da Nang', zh: '岘港', ko: '다낭', ja: 'ダナン' },
        country: 'Vietnam',
        order: 3,
        isDomestic: true
      },
      {
        code: 'PQC',
        name: 'Phú Quốc',
        city: { vi: 'Phú Quốc', en: 'Phu Quoc', zh: '富国岛', ko: '푸꾸옥', ja: 'フーコック' },
        country: 'Vietnam',
        order: 4,
        isDomestic: true
      },
      {
        code: 'CXR',
        name: 'Cam Ranh / Nha Trang',
        city: { vi: 'Nha Trang', en: 'Nha Trang', zh: '芽庄', ko: '나트랑', ja: 'ニャチャン' },
        country: 'Vietnam',
        order: 5,
        isDomestic: true
      },
      {
        code: 'DLI',
        name: 'Liên Khương / Đà Lạt',
        city: { vi: 'Đà Lạt', en: 'Da Lat', zh: '大叻', ko: '달랏', ja: 'ダラット' },
        country: 'Vietnam',
        order: 6,
        isDomestic: true
      },
      {
        code: 'HUI',
        name: 'Phú Bài / Huế',
        city: { vi: 'Huế', en: 'Hue', zh: '顺化', ko: '후에', ja: 'フエ' },
        country: 'Vietnam',
        order: 7,
        isDomestic: true
      },
      {
        code: 'UIH',
        name: 'Phù Cát / Quy Nhơn',
        city: { vi: 'Quy Nhơn', en: 'Quy Nhon', zh: '归仁', ko: '퀴논', ja: 'クイニョン' },
        country: 'Vietnam',
        order: 8,
        isDomestic: true
      },
      {
        code: 'VCL',
        name: 'Chu Lai / Quảng Nam',
        city: { vi: 'Quảng Nam', en: 'Quang Nam', zh: '广南', ko: '꽝남', ja: 'クアンナム' },
        country: 'Vietnam',
        order: 9,
        isDomestic: true
      },
      {
        code: 'HPH',
        name: 'Cát Bi / Hải Phòng',
        city: { vi: 'Hải Phòng', en: 'Hai Phong', zh: '海防', ko: '하이퐁', ja: 'ハイフォン' },
        country: 'Vietnam',
        order: 10,
        isDomestic: true
      }
    ]
  },

  // 5. Flights - Hãng hàng không đối tác (Airlines Catalog)
  {
    key: 'flight_airlines',
    group: 'flights',
    value: [
      {
        code: 'VU',
        name: 'Vietravel Airlines',
        isPartner: true,
        partnerBadge: 'Đối tác chiến lược',
        logoText: 'VU',
        badgeColor: 'bg-amber-400 text-blue-950 border-amber-300'
      },
      {
        code: 'VN',
        name: 'Vietnam Airlines',
        isPartner: false,
        partnerBadge: 'Hãng HK Quốc gia',
        logoText: 'VN',
        badgeColor: 'bg-blue-900 text-yellow-300 border-blue-800'
      },
      {
        code: 'VJ',
        name: 'Vietjet Air',
        isPartner: false,
        partnerBadge: 'Bay cùng Vietjet',
        logoText: 'VJ',
        badgeColor: 'bg-red-600 text-white border-red-500'
      },
      {
        code: 'QH',
        name: 'Bamboo Airways',
        isPartner: false,
        partnerBadge: 'Hơn cả một chuyến bay',
        logoText: 'QH',
        badgeColor: 'bg-emerald-600 text-white border-emerald-500'
      }
    ]
  },

  // 6. Visa - Danh mục quốc gia cấp Visa (Visa Countries Catalog)
  {
    key: 'visa_countries_catalog',
    group: 'visa',
    value: [
      {
        key: 'Japan',
        flag: 'https://flagcdn.com/w40/jp.png',
        name: { vi: 'Visa Nhật Bản', en: 'Japan Visa', zh: '日本签证', ko: '일본 비자', ja: '日本ビザ' },
        processingTime: { vi: '5 - 7 ngày làm việc', en: '5 - 7 working days' },
        price: 2500000,
        passRate: '99.2%',
        tag: 'Hot',
        bg: 'from-rose-50/80 to-amber-50/50',
        border: 'border-rose-100',
        desc: {
          vi: 'Hồ sơ tối giản, hỗ trợ dịch thuật công chứng và nộp diện ủy thác không cần trình diện.',
          en: 'Minimal documents, notarized translation, agency delegation without in-person interview.'
        },
        isFeatured: true
      },
      {
        key: 'Korea',
        flag: 'https://flagcdn.com/w40/kr.png',
        name: { vi: 'Visa Hàn Quốc', en: 'Korea Visa', zh: '韩国签证', ko: '한국 비자', ja: '韓国ビザ' },
        processingTime: { vi: '7 - 10 ngày làm việc', en: '7 - 10 working days' },
        price: 1900000,
        passRate: '98.8%',
        tag: 'Ưa chuộng',
        bg: 'from-blue-50/80 to-indigo-50/50',
        border: 'border-blue-100',
        desc: {
          vi: 'Hỗ trợ visa du lịch tự túc C-3-9, visa đại đô thị 5 năm nhiều lần, thủ tục nhanh chóng.',
          en: 'Single entry C-3-9 tourist visa, 5-year multiple entry visa for metropolitan citizens.'
        },
        isFeatured: true
      },
      {
        key: 'Schengen',
        flag: 'https://flagcdn.com/w40/eu.png',
        name: { vi: 'Visa Châu Âu (Schengen)', en: 'Schengen Visa (Europe)', zh: '欧洲申根签证', ko: '솅겐 유럽 비자', ja: 'シェンゲンビザ' },
        processingTime: { vi: '15 - 20 ngày làm việc', en: '15 - 20 working days' },
        price: 4500000,
        passRate: '97.5%',
        tag: '27 Quốc gia',
        bg: 'from-sky-50/80 to-blue-50/50',
        border: 'border-sky-100',
        desc: {
          vi: 'Tự do đi lại 27 nước khối Schengen (Pháp, Ý, Đức, Thụy Sĩ, Hà Lan...). Hỗ trợ chứng minh tài chính.',
          en: 'Free travel across 27 Schengen countries. Financial proof & flight booking support.'
        },
        isFeatured: true
      },
      {
        key: 'USA',
        flag: 'https://flagcdn.com/w40/us.png',
        name: { vi: 'Visa Mỹ (B1/B2)', en: 'US Visa (B1/B2)', zh: '美国签证 (B1/B2)', ko: '미국 비자 (B1/B2)', ja: '米国ビザ (B1/B2)' },
        processingTime: { vi: '3 - 5 ngày sau PV', en: '3 - 5 days post-interview' },
        price: 5500000,
        passRate: '96.2%',
        tag: 'Thời hạn 1 năm',
        bg: 'from-purple-50/80 to-indigo-50/50',
        border: 'border-purple-100',
        desc: {
          vi: 'Luyện phỏng vấn 1-1 với cựu chuyên viên, khai form DS-160 chuẩn xác, tối ưu hóa điểm mạnh hồ sơ.',
          en: '1-on-1 interview simulation, accurate DS-160 filling, profile optimization.'
        },
        isFeatured: true
      },
      {
        key: 'Australia',
        flag: 'https://flagcdn.com/w40/au.png',
        name: { vi: 'Visa Úc (Subclass 600)', en: 'Australia Visa (Subclass 600)', zh: '澳大利亚签证 (600)', ko: '호주 비자 (600)', ja: 'オーストラリアビザ' },
        processingTime: { vi: '10 - 15 ngày làm việc', en: '10 - 15 working days' },
        price: 3800000,
        passRate: '97.8%',
        tag: 'E-Visa Điện Tử',
        bg: 'from-emerald-50/80 to-teal-50/50',
        border: 'border-emerald-100',
        desc: {
          vi: 'Visa điện tử Subclass 600 du lịch/thăm thân, thời hạn lên đến 1-3 năm nhiều lần.',
          en: 'Electronic Subclass 600 tourist visa, multi-entry validity up to 1-3 years.'
        },
        isFeatured: false
      },
      {
        key: 'Canada',
        flag: 'https://flagcdn.com/w40/ca.png',
        name: { vi: 'Visa Canada (V-1)', en: 'Canada Visa (V-1)', zh: '加拿大签证 (V-1)', ko: '캐나다 비자', ja: 'カナダビザ' },
        processingTime: { vi: '20 - 30 ngày làm việc', en: '20 - 30 working days' },
        price: 4200000,
        passRate: '96.0%',
        tag: 'Thời hạn 10 năm',
        bg: 'from-amber-50/80 to-orange-50/50',
        border: 'border-amber-100',
        desc: {
          vi: 'Visa du lịch dán tem theo thời hạn hộ chiếu lên đến 10 năm. Hỗ trợ lấy dấu sinh trắc học.',
          en: 'Tourist visa up to passport validity (up to 10 years). Biometrics assistance.'
        },
        isFeatured: false
      }
    ]
  },

  // 7. Visa - Quy trình 4 bước (Process Steps)
  {
    key: 'visa_process_steps',
    group: 'visa',
    value: [
      {
        step: '01',
        icon: 'HelpCircle',
        title: { vi: 'Tư Vấn & Thẩm Định Hồ Sơ', en: 'Consultation & Assessment' },
        desc: { vi: 'Tiếp nhận thông tin, phân tích điểm mạnh hồ sơ và đưa ra lộ trình chuẩn xác trong 15 phút.', en: 'Analyze profile strengths and propose optimal roadmap within 15 minutes.' }
      },
      {
        step: '02',
        icon: 'FileCheck',
        title: { vi: 'Hoàn Thiện Dịch Thuật & Công Chứng', en: 'Translation & Document Preparation' },
        desc: { vi: 'Hỗ trợ dịch thuật tư pháp, chứng minh tài chính, đặt vé máy bay và phòng khách sạn mẫu.', en: 'Notarized translations, financial proofing, flight & hotel sample bookings.' }
      },
      {
        step: '03',
        icon: 'UserCheck',
        title: { vi: 'Nộp Hồ Sơ & Luyện Phỏng Vấn', en: 'Submission & Interview Coaching' },
        desc: { vi: 'Đồng hành cùng quý khách lấy sinh trắc học hoặc luyện phỏng vấn 1-1 tự tin đạt kết quả cao.', en: 'Accompany during biometrics appointment and 1-on-1 confident interview coaching.' }
      },
      {
        step: '04',
        icon: 'Award',
        title: { vi: 'Nhận Kết Quả Visa Tận Tay', en: 'Receive Visa Result' },
        desc: { vi: 'Theo dõi tiến độ theo thời gian thực và chuyển phát nhanh visa tận nơi an toàn tuyệt đối.', en: 'Real-time tracking and safe door-to-door express delivery of your visa.' }
      }
    ]
  },

  // 8. Visa - Thống kê uy tín (Visa Stats Badges)
  {
    key: 'visa_stats_badges',
    group: 'visa',
    value: [
      { label: { vi: 'Quốc Gia Hỗ Trợ', en: 'Supported Countries' }, value: '50+', sub: { vi: 'Toàn cầu', en: 'Worldwide' }, icon: 'Globe', color: 'text-purple-600 bg-purple-50' },
      { label: { vi: 'Tỷ Lệ Đậu Visa', en: 'Success Rate' }, value: '99.2%', sub: { vi: 'Được kiểm chứng', en: 'Verified' }, icon: 'ShieldCheck', color: 'text-emerald-600 bg-emerald-50' },
      { label: { vi: 'Thời Gian Thẩm Định', en: 'Assessment Time' }, value: '24h', sub: { vi: 'Phản hồi siêu tốc', en: 'Fast response' }, icon: 'Clock', color: 'text-blue-600 bg-blue-50' },
      { label: { vi: 'Bảo Mật Thông Tin', en: 'Data Security' }, value: '100%', sub: { vi: 'Tuyệt đối an toàn', en: 'High confidentiality' }, icon: 'Award', color: 'text-amber-600 bg-amber-50' }
    ]
  },

  // 9. Contact - Hệ thống chi nhánh (Company Branches)
  {
    key: 'company_branches',
    group: 'contact',
    value: [
      {
        id: 'hcm',
        name: { vi: 'Trụ Sở Chính TP. Hồ Chí Minh', en: 'Ho Chi Minh City Headquarter' },
        address: { vi: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', en: '123 Nguyen Hue Street, Ben Nghe Ward, District 1, Ho Chi Minh City' },
        phone: '1800 646 888',
        email: 'hcm@travel.com',
        isMain: true,
        mapEmbedUrl: ''
      },
      {
        id: 'danang',
        name: { vi: 'Chi Nhánh Đà Nẵng', en: 'Da Nang Regional Office' },
        address: { vi: '168 Nguyễn Văn Linh, Phường Vĩnh Trung, Quận Thanh Khê, Đà Nẵng', en: '168 Nguyen Van Linh Street, Thanh Khe District, Da Nang' },
        phone: '0236 388 9999',
        email: 'danang@travel.com',
        isMain: false,
        mapEmbedUrl: ''
      },
      {
        id: 'hanoi',
        name: { vi: 'Văn Phòng Đại Diện Hà Nội', en: 'Hanoi Representative Office' },
        address: { vi: '45 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', en: '45 Trang Tien Street, Hoan Kiem District, Hanoi' },
        phone: '024 3999 8888',
        email: 'hanoi@travel.com',
        isMain: false,
        mapEmbedUrl: ''
      }
    ]
  },

  // 10. Contact - Thời gian làm việc (Working Hours)
  {
    key: 'working_hours',
    group: 'contact',
    value: {
      weekdays: { vi: 'Thứ Hai - Thứ Sáu: 08:00 - 21:00', en: 'Monday - Friday: 08:00 - 21:00' },
      weekend: { vi: 'Thứ Bảy - Chủ Nhật: 08:30 - 18:00', en: 'Saturday - Sunday: 08:30 - 18:00' },
      hotlineNote: { vi: 'Tổng đài chăm sóc khách hàng hỗ trợ 24/7 kể cả ngày Lễ & Tết', en: 'Customer Care Hotline operates 24/7 including Public Holidays' }
    }
  },

  // 11. About - Giá trị cốt lõi (Core Values)
  {
    key: 'about_core_values',
    group: 'about',
    value: [
      {
        id: 'vision',
        icon: 'Target',
        title: { vi: 'Tầm Nhìn', en: 'Vision' },
        desc: { vi: 'Trở thành thương hiệu du lịch và lữ hành hàng đầu Đông Nam Á, tiên phong ứng dụng công nghệ du lịch số.', en: 'To become the leading travel and tourism brand in Southeast Asia, pioneering digital travel experiences.' },
        color: 'bg-blue-100 text-blue-600'
      },
      {
        id: 'mission',
        icon: 'ShieldCheck',
        title: { vi: 'Sứ Mệnh', en: 'Mission' },
        desc: { vi: 'Kiến tạo những hải trình văn hóa giàu cảm xúc, kết nối triệu du khách với vẻ đẹp di sản đất nước.', en: 'Creating inspiring cultural journeys and connecting millions of travelers with natural heritage.' },
        color: 'bg-emerald-100 text-emerald-600'
      },
      {
        id: 'explore',
        icon: 'Compass',
        title: { vi: 'Triết Lý Phục Vụ', en: 'Philosophy' },
        desc: { vi: 'Đặt sự an tâm và hài lòng của khách hàng làm trọng tâm trong từng khoảnh khắc trải nghiệm.', en: 'Placing customers peace of mind and utmost satisfaction at the center of every experience.' },
        color: 'bg-purple-100 text-purple-600'
      }
    ]
  },

  // 12. Policy - Điều khoản tour mặc định (Default Tour Inclusions & Exclusions)
  {
    key: 'tour_default_inclusions_exclusions',
    group: 'policy',
    value: {
      inclusions: [
        'Xe ô tô du lịch đời mới chất lượng cao đưa đón tham quan suốt hành trình.',
        'Khách sạn / Resort tiêu chuẩn cao cấp (2-3 khách/phòng tiện nghi).',
        'Tất cả các bữa ăn theo tiêu chuẩn thực đơn phong phú địa phương.',
        'Vé vào cổng tất cả các danh lam thắng cảnh theo lịch trình chi tiết.',
        'Hướng dẫn viên chuyên nghiệp, nhiệt tình, am hiểu văn hóa phục vụ suốt tuyến.',
        'Bảo hiểm du lịch nội địa mức trách nhiệm tối đa 100.000.000 VNĐ/vụ.',
        'Nước uống tinh khiết đóng chai (1 chai/người/ngày) và nón du lịch thời trang.'
      ],
      exclusions: [
        'Thuế giá trị gia tăng (VAT 8%) theo quy định nhà nước.',
        'Phụ thu phòng đơn dành cho khách đăng ký đi một mình.',
        'Chi phí cá nhân: giặt ủi, điện thoại, đồ uống minibar và dịch vụ ngoài tour.',
        'Tiền bồi dưỡng (Tip) tự nguyện dành cho Hướng dẫn viên và Lái xe.'
      ],
      importantNotes: [
        'Quý khách vui lòng xuất trình CCCD hoặc Hộ chiếu gốc còn thời hạn khi làm thủ tục.',
        'Trẻ em dưới 14 tuổi chưa có CCCD bắt buộc phải có Giấy khai sinh bản sao công chứng.',
        'Vui lòng có mặt tại điểm đón trước giờ khởi hành tối thiểu 30 phút.'
      ]
    }
  },

  // 13. Policy - Danh mục tiện ích khách sạn chuẩn (Hotel Amenities Master)
  {
    key: 'hotel_amenities_master',
    group: 'policy',
    value: [
      'WiFi miễn phí', 'Hồ bơi ngoài trời', 'Buffet sáng tiêu chuẩn', 'Spa & Massage trị liệu',
      'Phòng tập Gym hiện đại', 'Quầy Bar & Lounge', 'Nhà hàng ẩm thực Á-Âu', 'Bãi biển riêng tư',
      'Xe đưa đón sân bay', 'Khu vui chơi trẻ em (Kids Club)', 'Lớp học Yoga bờ biển',
      'Bồn tắm ngâm thảo mộc', 'Lò sưởi ấm cúng', 'Hồ bơi nước ấm trong nhà', 'Lễ tân phục vụ 24/7'
    ]
  },

  // 14. Layout - Mạng xã hội & Kênh truyền thông (Social Media Links)
  {
    key: 'layout_social_links',
    group: 'layout',
    value: {
      facebook: 'https://facebook.com/travelbooking',
      zalo: 'https://zalo.me/0912345678',
      youtube: 'https://youtube.com/@travelbooking',
      tiktok: 'https://tiktok.com/@travelbooking',
      instagram: 'https://instagram.com/travelbooking'
    }
  },

  // 15. Layout - Giấy phép & Chứng nhận kinh doanh (Business License)
  {
    key: 'layout_business_license',
    group: 'layout',
    value: {
      taxCode: '0102030405',
      issuedBy: 'Sở Kế Hoạch & Đầu Tư Thành Phố Hồ Chí Minh cấp ngày 15/08/2012',
      internationalLicense: 'GP Lữ Hành Quốc Tế: 79-0123/2026/TCDL-GP LHQT',
      hotlineComplaints: '1900 6868 (Phản ánh chất lượng dịch vụ)'
    }
  },

  // 16. Homepage - Đánh giá từ khách hàng (Testimonials)
  {
    key: 'testimonials',
    group: 'homepage',
    value: [
      {
        id: 1,
        name: { vi: 'Nguyễn Văn A', en: 'Alex Nguyen', zh: '阮文安', ko: '알렉스 응우옌', ja: 'アレックス' },
        role: { vi: 'Khách hàng thân thiết', en: 'Frequent Traveler', zh: '忠实客户', ko: '단골 고객', ja: 'リピーター様' },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        content: {
          vi: 'Chuyến đi tuyệt vời! Hướng dẫn viên rất nhiệt tình và chu đáo. Khách sạn đẹp và đồ ăn rất ngon. Chắc chắn tôi sẽ đặt tour của Travel cho những chuyến đi tiếp theo.',
          en: 'Wonderful trip! The tour guide was super enthusiastic and attentive. Beautiful hotel and delicious food. I will definitely book with Travel again!',
          zh: '极好的旅行体验！导游热情周到，酒店豪华舒适，餐饮丰富美味。下次出行一定会继续选择 Travel。',
          ko: '정말 멋진 여행이었습니다! 가이드님이 친절하고 섬세하게 챙겨주셨어요. 호텔도 깔끔하고 음식도 훌륭했습니다.',
          ja: '素晴らしい旅行でした！ガイドさんの対応がとても丁寧で親切でした。ホテルも豪華で料理も美味しく大満足です。'
        },
        rating: 5,
        location: 'Hà Nội'
      },
      {
        id: 2,
        name: { vi: 'Trần Thị B', en: 'Sarah Tran', zh: '陈氏碧', ko: '사라 쩐', ja: 'サラ' },
        role: { vi: 'Du khách Hà Nội', en: 'Traveler from Hanoi', zh: '河内游客', ko: '하노이 여행객', ja: 'ハノイからの旅行者' },
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        content: {
          vi: 'Dịch vụ đặt tour và vé máy bay rất nhanh chóng, giá cả hợp lý so với chất lượng. Sẽ giới thiệu cho bạn bè và người thân.',
          en: 'Tour and flight booking services are so fast, reasonable prices for great quality. Highly recommend to friends and family!',
          zh: '旅游和机票预订服务非常快捷，价格合理且品质优秀。一定会向亲友大力推荐。',
          ko: '투어 및 항공권 예약 서비스가 매우 빠르고 가격 대비 만족도가 높았습니다. 지인들에게 적극 추천합니다.',
          ja: 'ツアーや航空券の手配が非常に迅速で、コスパも最高でした。友人や家族にもぜひお勧めしたいです。'
        },
        rating: 5,
        location: 'Đà Nẵng'
      },
      {
        id: 3,
        name: { vi: 'Lê Văn C', en: 'Michael Le', zh: '黎文强', ko: '마이클 레', ja: 'マイケル' },
        role: { vi: 'Du khách TP.HCM', en: 'Traveler from HCMC', zh: '胡志明市游客', ko: '호치민 여행객', ja: 'ホーチミンからの旅行者' },
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
        content: {
          vi: 'Đã đi nhiều tour của các bên khác nhau nhưng Travel làm tôi hài lòng nhất. Đội ngũ tư vấn nhiệt tình, hỗ trợ 24/7.',
          en: 'I have traveled with many companies, but Travel impressed me the most. Super dedicated team with 24/7 support.',
          zh: '体验过许多不同旅行社的服务，但 Travel 让我最为满意。客服团队极富热情且全天候专业响应。',
          ko: '여러 여행사를 이용해봤지만 Travel이 가장 만족스러웠습니다. 상담 팀이 열정적이고 24시간 지원해줍니다.',
          ja: '多くのツアー会社を利用してきましたが、Travelが一番満足度が高かったです。24時間丁寧に対応してくれました。'
        },
        rating: 5,
        location: 'TP. Hồ Chí Minh'
      },
      {
        id: 4,
        name: { vi: 'Phạm Thị D', en: 'Emily Pham', zh: '范氏蓉', ko: '에밀리 팜', ja: 'エミリー' },
        role: { vi: 'Khách hàng tour Quốc tế', en: 'International Tour Client', zh: '出境游客户', ko: '해외 투어 고객', ja: '海外ツアーのお客様' },
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        content: {
          vi: 'Tour Thái Lan rất vui và trọn vẹn, lịch trình hợp lý không bị mệt. Cảm ơn Travel đã mang lại trải nghiệm đáng nhớ!',
          en: 'Thailand tour was so much fun and fulfilling! Well-balanced itinerary without fatigue. Thanks Travel for memorable moments!',
          zh: '泰国之旅充实而愉快，行程安排合理轻松不累。非常感谢 Travel 带来的难忘旅行回忆！',
          ko: '태국 투어가 정말 즐겁고 알찼습니다. 일정이 무리하지 않아서 좋았어요. 특별한 추억을 만들어준 Travel에 감사드립니다!',
          ja: 'タイツアーは本当に楽しく充実していました。ゆったりとした行程で疲れませんでした。素敵な旅の思い出をありがとう！'
        },
        rating: 5,
        location: 'Cần Thơ'
      }
    ]
  },

  // 17. Page Banners & Videos
  {
    key: 'page_banners',
    group: 'banners',
    value: {
      toursBanner: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600',
      toursVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/mountains.mp4',
      hotelsBanner: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600',
      hotelsVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/glide-over-coastal-beach.mp4',
      flightsBanner: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600',
      flightsVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/airplane.mp4',
      visaBanner: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600',
      visaVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4',
      newsBanner: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600',
      newsVideo: 'https://res.cloudinary.com/demo/video/upload/so_0,eo_12,q_auto,w_1280,ac_none/forest_bike.mp4',
      specialtiesBanner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600',
      specialtiesVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/walking.mp4',
      contactBanner: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600',
      contactVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/travel.mp4',
      lookupBanner: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600',
      lookupVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,w_1280,ac_none/airplane.mp4',
    }
  }
];

export async function runMasterSettingsSeed(forceUpdate = false): Promise<{ seededCount: number; message: string }> {
  try {
    let seededCount = 0;
    for (const item of MASTER_SETTINGS_SEEDS) {
      if (forceUpdate) {
        await Setting.findOneAndUpdate(
          { key: item.key },
          { key: item.key, group: item.group, value: item.value, updatedAt: new Date() },
          { upsert: true, new: true }
        );
        seededCount++;
      } else {
        const existing = await Setting.findOne({ key: item.key }).lean();
        if (!existing) {
          await Setting.create({
            key: item.key,
            group: item.group,
            value: item.value,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          seededCount++;
        }
      }
    }

    cacheService.del('settings_all');
    return {
      seededCount,
      message: `Master settings seed completed successfully (${seededCount} items inserted/updated).`
    };
  } catch (error: any) {
    console.error('Error seeding master settings:', error);
    throw error;
  }
}
