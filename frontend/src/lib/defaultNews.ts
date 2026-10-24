/**
 * defaultNews.ts — Pre-rendered SEO-optimized long-form travel articles and destination reviews.
 * Serves as resilient fallback when database is starting up, during static builds, or for cold SSR.
 */

export interface DefaultNewsItem {
  _id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  thumbnail: string;
  category: 'experience' | 'food' | 'destination' | 'international';
  author: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
}

export const DEFAULT_NEWS: DefaultNewsItem[] = [
  {
    _id: 'news-hanoi-2026',
    slug: 'kinh-nghiem-du-lich-ha-noi-2026',
    title: {
      vi: 'Cẩm nang du lịch Hà Nội tự túc 2026: Lịch trình 3N2Đ, ăn gì, ở đâu và chi phí từ A-Z',
      en: 'Complete Hanoi Travel Guide 2026: 3D2N Itinerary, Food Map & Budget Tips',
      zh: '2026年河内自由行终极攻略：3天2晚经典行程、必尝美食与住宿省钱秘籍',
      ko: '2026 하노이 자유여행 완벽 가이드: 3박4일 추천 코스, 맛집 지도 & 알뜰 팁',
      ja: '2026年ハノイ個人旅行完全ガイド：おすすめ2泊3日モデルコース・絶品グルメ・宿泊エリア徹底解説'
    },
    excerpt: {
      vi: 'Tổng hợp trọn bộ kinh nghiệm du lịch Hà Nội tự túc 2026 mới nhất: cách di chuyển, lịch trình khám phá 36 phố phường, thưởng thức phở Bát Đàn, cà phê trứng và dự toán chi phí chi tiết.',
      en: 'Comprehensive 2026 Hanoi travel handbook: transport guide, 36 old quarter walking routes, iconic egg coffee tasting, and transparent budget calculations.',
      zh: '2026最新河内旅游手册：从三十六行街漫步、文庙访古，到品味百年传承生牛肉河粉与蛋咖啡，全方位解析自由行精髓。',
      ko: '하노이 여행의 모든 것: 36거리 골목 탐방, 호안끼엠 호수 산책, 백년 전통 에그커피와 쌀국수 맛집, 실전 여행 경비 총정리.',
      ja: 'ハノイ旧市街の散策から世界遺産タンロン遺跡、絶品フォーやエッグコーヒーの名店まで、初めてのハノイ旅行に役立つ実践情報を完全網羅。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    category: 'experience',
    author: 'Nguyễn Hương Giang',
    isPublished: true,
    publishedAt: '2026-03-15T08:00:00.000Z',
    createdAt: '2026-03-15T08:00:00.000Z',
    content: {
      vi: `
<h2>1. Giới thiệu tổng quan về du lịch Hà Nội – Trái tim ngàn năm văn hiến</h2>
<p>Hà Nội, thủ đô nghìn năm tuổi của Việt Nam, luôn là điểm dừng chân không thể thiếu trong hành trình khám phá đất nước hình chữ S. Nơi đây quyến rũ du khách bởi sự giao thoa hài hòa giữa nét cổ kính rêu phong của 36 phố phường, kiến trúc Pháp cổ điển thanh lịch và nhịp sống đô thị hiện đại, sôi động bậc nhất.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200" alt="Hồ Gươm Hà Nội và Tháp Rùa cổ kính sớm mai" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Hồ Hoàn Kiếm thơ mộng – Biểu tượng văn hóa trường tồn của thủ đô Hà Nội</figcaption>
</figure>

<h2>2. Thời điểm lý tưởng nhất để du lịch Hà Nội</h2>
<p>Mỗi mùa Hà Nội lại khoác lên mình một tấm áo riêng, nhưng thời điểm đẹp và lãng mạn nhất chính là <strong>mùa thu (từ tháng 9 đến tháng 11)</strong>. Tiết trời lúc này mát mẻ, nắng hanh vàng dịu nhẹ, thoang thoảng hương hoa sữa nồng nàn và cốm non Làng Vòng xanh mướt. Ngoài ra, mùa xuân từ tháng 2 đến tháng 4 cũng là mùa của lễ hội và muôn hoa đua nở trên các nẻo đường phố cổ.</p>

<h2>3. Hướng dẫn di chuyển đến và đi lại trong Hà Nội</h2>
<div class="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl my-4 text-slate-800 text-sm">
  <strong>Mẹo di chuyển tiết kiệm:</strong> Từ sân bay Quốc tế Nội Bài về trung tâm Phố Cổ, bạn có thể bắt xe buýt chất lượng cao tuyến số 86 với giá chỉ 35.000 VNĐ/lượt hoặc đặt xe công nghệ Grab khoảng 250.000 – 300.000 VNĐ.
</div>
<ul>
  <li><strong>Thuê xe máy:</strong> Giá từ 100.000 – 150.000 VNĐ/ngày, thích hợp cho các bạn trẻ thích tự do luồn lách qua từng con ngõ nhỏ.</li>
  <li><strong>Xe buýt City Sightseeing 2 tầng:</strong> Lựa chọn lý tưởng để ngắm toàn cảnh các danh thắng nổi tiếng như Nhà hát Lớn, Lăng Bác, Hoàng thành Thăng Long với góc nhìn từ trên cao.</li>
  <li><strong>Xích lô phố cổ:</strong> Trải nghiệm thư thái, chậm rãi ngắm nhìn đời sống sinh hoạt thường nhật của người dân Tràng An.</li>
</ul>

<h2>4. Gợi ý lịch trình du lịch Hà Nội 3 ngày 2 đêm chuẩn nhất</h2>
<h3>Ngày 1: Khám phá Phố Cổ – Hồ Gươm – Văn Miếu Quốc Tử Giám</h3>
<p>Buổi sáng bắt đầu bằng một tô phở Bát Đàn nóng hổi, sau đó dạo bộ quanh Hồ Gươm, viếng đền Ngọc Sơn và chụp ảnh bên cầu Thê Húc đỏ son. Buổi chiều, ghé thăm Văn Miếu Quốc Tử Giám – trường đại học đầu tiên của Việt Nam và Nhà tù Hỏa Lò giàu giá trị lịch sử. Buổi tối, đừng quên thưởng thức một ly cà phê trứng Giảng béo ngậy và hòa mình vào không khí tấp nập tại ngã tư Tạ Hiện.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200" alt="Cà phê trứng Hà Nội đặc sản thơm ngon béo ngậy" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Cà phê trứng – Tinh hoa ẩm thực sáng tạo độc đáo của người Hà Nội</figcaption>
</figure>

<h3>Ngày 2: Viếng Lăng Chủ tịch Hồ Chí Minh – Chùa Trấn Quốc – Hồ Tây lộng gió</h3>
<p>Buổi sáng vào Lăng viếng Bác, thăm Nhà sàn, Ao cá Bác Hồ và Chùa Một Cột. Buổi chiều di chuyển ra Hồ Tây ngắm hoàng hôn đỏ rực tại bến Hàn Quốc hoặc đường Thanh Niên, ghé chùa Trấn Quốc cổ kính bậc nhất Việt Nam và thưởng thức bánh tôm Hồ Tây giòn rụm.</p>

<h3>Ngày 3: Hoàng Thành Thăng Long – Mua sắm quà đặc sản</h3>
<p>Dành buổi sáng tham quan Di sản Thế giới Hoàng thành Thăng Long, chiêm ngưỡng Cột cờ Hà Nội oai nghiêm. Buổi chiều ghé chợ Đồng Xuân hoặc phố Hàng Đường mua ô mai, bánh chè lam, trà sen Tây Hồ về làm quà cho người thân.</p>

<h2>5. Bản đồ ẩm thực Hà Nội: Ăn gì ngon chuẩn vị?</h2>
<ul>
  <li><strong>Phở Hà Nội:</strong> Phở Bát Đàn (49 Bát Đàn), Phở Thìn (13 Lò Đúc), Phở Lý Quốc Sư.</li>
  <li><strong>Bún chả:</strong> Bún chả Hương Liên (nơi Tổng thống Obama từng ghé thăm), Bún chả Đắc Kim Hàng Mành.</li>
  <li><strong>Bún đậu mắm tôm:</strong> Bún đậu ngõ Tràng Tiền hoặc bún đậu Hàng Khay.</li>
  <li><strong>Chả cá Lã Vọng:</strong> Chả cá Thăng Long (Đường Thành) với từng miếng cá lăng nướng vàng ươm ăn kèm thì là và mắm tôm đánh sủi bọt.</li>
</ul>

<h2>6. Tổng kết chi phí dự kiến cho chuyến đi</h2>
<p>Chi phí trung bình cho chuyến du lịch Hà Nội 3N2Đ dao động từ <strong>2.500.000 – 4.000.000 VNĐ/người</strong> (đã bao gồm lưu trú khách sạn 3 sao phố cổ, ăn uống thả ga và vé tham quan). Chắc chắn thủ đô Hà Nội sẽ mang đến cho bạn những ký ức tuyệt vời và sâu đậm khó phai!</p>
`,
      en: `
<h2>1. Introduction to Hanoi – Vietnam's Cultural Soul</h2>
<p>Hanoi, the charming thousand-year-old capital of Vietnam, is a must-visit destination combining French colonial architecture, ancient temples, bustling street life, and world-renowned street food culture.</p>
<h2>2. Best Season to Visit</h2>
<p>Autumn (September to November) offers pleasant breezes, golden sunlight, and blooming milk flowers. Spring (February to April) is also lively with festive springtime ceremonies.</p>
<h2>3. 3-Day Recommended Itinerary</h2>
<p><strong>Day 1:</strong> Hoan Kiem Lake, Ngoc Son Temple, Temple of Literature, and famous street food in Hanoi Old Quarter.</p>
<p><strong>Day 2:</strong> Ho Chi Minh Mausoleum complex, One Pillar Pagoda, Tran Quoc Pagoda on West Lake, and sunset dinner.</p>
<p><strong>Day 3:</strong> Imperial Citadel of Thang Long, Dong Xuan Market souvenir shopping, and train street cafe experience.</p>
<h2>4. Iconic Dishes You Cannot Miss</h2>
<p>Pho Bo (Beef noodle soup), Bun Cha (Grilled pork noodles), Egg Coffee, and Cha Ca (Turmeric fish with dill).</p>
`
    }
  },
  {
    _id: 'news-da-nang-food-2026',
    slug: 'top-mon-an-da-nang-phai-thu',
    title: {
      vi: 'Top 15 món ngon đặc sản Đà Nẵng nhất định phải thử: Bản đồ ẩm thực chuẩn vị miền Trung',
      en: 'Top 15 Must-Try Da Nang Foods: The Ultimate Central Vietnam Gourmet Map',
      zh: '岘港不可错过的15大特色地道美食精选：品味最纯正的越南中部风味',
      ko: '다낭에서 꼭 맛봐야 할 대표 미식 TOP 15: 중부 베트남 먹방 지도',
      ja: 'ダナン旅行で絶対に食べたい絶品ご当地グルメ15選：ベトナム中部ローカル飯徹底ガイド'
    },
    excerpt: {
      vi: 'Khám phá thế giới ẩm thực phong phú của Đà Nẵng: từ Mì Quảng tôm thịt đậm đà, bánh tráng cuốn thịt heo hai đầu da đến hải sản tươi sống giá rẻ tại chợ hải sản ven biển.',
      en: 'Explore the culinary wonders of Da Nang: from signature Quang noodles, pork belly rice paper rolls, to ultra-fresh coastal seafood markets.',
      zh: '深度探秘岘港美食天堂：广南米粉、双头肥瘦水煮猪肉米纸卷、鲜香鱼饼米线与物美价廉的生猛海鲜盛宴。',
      ko: '다낭의 대표 미식 총정리: 진한 육수의 미꽝, 돼지고기 라이스페이퍼 롤, 바삭한 반세오와 미케비치 신선한 해산물 맛집 완벽 가이드.',
      ja: 'ダナンの食の魅力を満喫：名物和え麺ミークアン、豚肉のライスペーパー巻き、揚げたてバインセオから海沿いシーフードまで詳しく紹介。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    category: 'food',
    author: 'Trần Minh Tuấn',
    isPublished: true,
    publishedAt: '2026-03-18T09:30:00.000Z',
    createdAt: '2026-03-18T09:30:00.000Z',
    content: {
      vi: `
<h2>1. Nét độc đáo của ẩm thực thành phố biển Đà Nẵng</h2>
<p>Không chỉ nổi danh là "thành phố đáng sống nhất Việt Nam", Đà Nẵng còn là một thiên đường ẩm thực quyến rũ thực khách bốn phương. Ẩm thực nơi đây là sự dung hòa tinh tế giữa vị cay nồng, mặn mòi của biển cả miền Trung cùng phong cách chế biến dân dã, thơm thảo của người dân xứ Quảng.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200" alt="Món ngon ẩm thực Đà Nẵng đặc sắc" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Ẩm thực Đà Nẵng – Sự kết hợp hài hòa giữa hương vị đồng nội và sản vật biển cả</figcaption>
</figure>

<h2>2. Danh sách 5 món ăn biểu tượng bạn nhất định phải thử</h2>
<h3>1. Mì Quảng – Đậm đà phong vị xứ Quảng</h3>
<p>Sợi mì Quảng dày, mềm mượt màu trắng gạo hoặc vàng nghệ, chan xâm xấp nước dùng nấu từ xương hầm, tôm nõn, thịt heo hoặc ức gà. Khi ăn kèm rau sống hoa chuối tươi non, bánh tráng mè nướng giòn rụm và đậu phộng rang bùi béo. <em>Địa chỉ gợi ý: Mì Quảng Bà Mua (19 Trần Bình Trọng), Mì Quảng Ếch Bếp Trang.</em></p>

<h3>2. Bánh tráng cuốn thịt heo hai đầu da</h3>
<p>Điểm làm nên sự đặc biệt của món ăn này chính là lát thịt heo luộc khéo léo để lộ hai đầu mỡ giòn trong veo. Cuốn cùng bánh tráng Đại Lộc dẻo dai, đủ loại rau thơm và chấm ngập trong chén mắm nêm đậm đà pha ớt tỏi cay xé lưỡi. <em>Địa chỉ gợi ý: Quán Trần (04 Lê Duẩn), Ẩm thực Mậu (35 Đỗ Thúc Tịnh).</em></p>

<h3>3. Bún chả cá Đà Nẵng</h3>
<p>Tô bún chả cá thơm nức với nước dùng ninh từ xương cá biển, cà chua, bí đỏ, bắp cải và thơm ngọt thanh. Chả cá gồm chả hấp và chả chiên dai giòn sần sật. <em>Địa chỉ gợi ý: Bún chả cá 109 Nguyễn Chí Thanh, Bún chả cá Bà Lữ.</em></p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200" alt="Hải sản tươi sống bên bờ biển Đà Nẵng" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Hải sản Đà Nẵng tươi rói được đánh bắt trong ngày tại vùng biển Mỹ Khê</figcaption>
</figure>

<h3>4. Bánh xèo, Nem lụi giòn rụm</h3>
<p>Bánh xèo Đà Nẵng có lớp vỏ dày vừa phải, vàng ruộm, nhân đầy ắp tôm tươi và giá đỗ. Nước chấm đi kèm là bí quyết gia truyền nấu từ gan heo, tương đậu phộng sánh mịn, béo ngậy khó cưỡng. <em>Địa chỉ gợi ý: Bánh xèo Bà Dưỡng (K280/23 Hoàng Diệu).</em></p>

<h3>5. Hải sản tươi sống ven biển</h3>
<p>Đến Đà Nẵng mà chưa ăn hải sản thì coi như chưa trọn vẹn chuyến đi. Bạn có thể tự tay chọn tôm tít, ghẹ xanh, mực cơm, chip chip hấp xả ngay tại các bể nuôi tươi rói. <em>Địa chỉ gợi ý: Hải sản Bé Mặn, Hải sản Năm Đảnh, Chợ đêm Sơn Trà.</em></p>
`,
      en: `
<h2>1. The Soul of Central Vietnamese Cuisine</h2>
<p>Da Nang is renowned worldwide not only for its stunning bridges and beaches but also as a premier culinary paradise blending spicy, savory flavors from land and sea.</p>
<h2>2. Top Signature Dishes</h2>
<p><strong>Mi Quang:</strong> Turmeric rice noodles with savory broth, pork, shrimp, fresh herbs, and toasted rice crackers.</p>
<p><strong>Pork belly rolls (Banh Trang Thit Heo):</strong> Delicate pork rolls wrapped with fresh greens and dipped in aromatic fermented anchovy sauce.</p>
<p><strong>Fish Cake Noodle Soup (Bun Cha Ca):</strong> Sweet, naturally flavored broth with steamed and fried mackerel patties.</p>
<p><strong>Fresh Coastal Seafood:</strong> Steamed clams with lemongrass, grilled scallops with scallion oil, and tamarind crabs.</p>
`
    }
  },
  {
    _id: 'news-phu-quoc-2026',
    slug: 'phu-quoc-nen-di-mua-nao',
    title: {
      vi: 'Du lịch Phú Quốc nên đi mùa nào đẹp nhất? Kinh nghiệm khám phá đảo ngọc 4 mùa trọn vẹn',
      en: 'Best Time to Visit Phu Quoc Island: Comprehensive 4-Season Vacation Guide',
      zh: '富国岛最佳旅游时节全指南：玩转越南珍珠海岛四季风光与避雨秘籍',
      ko: '푸꾸옥 언제 가는 게 가장 좋을까? 사계절 날씨 분석 및 완벽 여행 가이드',
      ja: 'フーコック島旅行のベストシーズン徹底比較：乾季と雨季の楽しみ方とおすすめスポット'
    },
    excerpt: {
      vi: 'Giải đáp chi tiết du lịch Phú Quốc mùa nào đẹp nhất, so sánh mùa khô và mùa mưa, top bãi biển lặn ngắm san hô đẹp nhất và kinh nghiệm đặt phòng resort giá tốt.',
      en: 'Detailed seasonal comparison for Phu Quoc: dry season vs green season, top snorkeling beaches in An Thoi archipelago, and insider resort booking tips.',
      zh: '深度解析富国岛气候特点：旱季碧海晴天与雨季超高性价比对比，附安泰群岛浮潜与日落海滩打卡指南。',
      ko: '푸꾸옥 건기와 우기 완벽 비교: 바다 상태, 안토이 군도 호핑투어, 인생 선셋 포인트 및 가성비 럭셔리 리조트 예약 꿀팁.',
      ja: 'ベストシーズンの乾季と穴場の雨季を徹底比較。透明度抜群のシュノーケリングスポットや絶景サンセット情報もお届け。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
    category: 'destination',
    author: 'Lê Thu Hà',
    isPublished: true,
    publishedAt: '2026-03-20T10:15:00.000Z',
    createdAt: '2026-03-20T10:15:00.000Z',
    content: {
      vi: `
<h2>1. Tổng quan khí hậu Đảo Ngọc Phú Quốc</h2>
<p>Nằm sâu trong vịnh Thái Lan, đảo ngọc Phú Quốc được thiên nhiên ưu ái ban tặng khí hậu nhiệt đới gió mùa mát mẻ quanh năm. Khí hậu Phú Quốc chia làm 2 mùa rõ rệt: <strong>mùa khô (từ tháng 11 đến tháng 4 năm sau)</strong> và <strong>mùa mưa (từ tháng 5 đến tháng 10)</strong>.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200" alt="Bãi Sao Phú Quốc bờ cát trắng mịn biển trong vắt" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Bãi Sao Phú Quốc – Một trong những bãi biển hoang sơ đẹp nhất hành tinh</figcaption>
</figure>

<h2>2. Thời điểm vàng: Mùa khô (Tháng 11 – Tháng 4)</h2>
<p>Đây là thời gian đẹp nhất để du lịch Phú Quốc. Lúc này, hòn đảo tràn ngập ánh nắng vàng ruộm, sóng biển êm ả, nước trong xanh thấu đáy như ngọc bích. Đây là điều kiện lý tưởng cho các hoạt động:
<ul>
  <li>Tham gia tour cano 4 đảo, lặn ngắm san hô tự nhiên tại Hòn Móng Tay, Hòn Gầm Ghì, Hòn Mây Rút.</li>
  <li>Trải nghiệm tuyến cáp treo vượt biển 3 dây Hòn Thơm dài nhất thế giới.</li>
  <li>Thưởng ngoạn cảnh hoàng hôn tím huyền ảo tại Sunset Sanato hoặc OCSEN Beach Bar.</li>
</ul>
</p>

<h2>3. Du lịch Phú Quốc mùa mưa (Tháng 5 – Tháng 10): Có nên đi không?</h2>
<div class="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl my-4 text-slate-800 text-sm">
  <strong>Ưu điểm mùa mưa:</strong> Giá vé máy bay và giá phòng tại các khu nghỉ dưỡng 5 sao giảm sâu tới 40% - 60%. Lượng khách không quá đông, giúp bạn tận hưởng không gian nghỉ dưỡng biệt lập, thanh bình tuyệt đối.
</div>
<p>Nếu đi vào mùa này, bạn nên ưu tiên tắm biển tại <strong>Bãi Sao</strong> hoặc <strong>Bãi Khem</strong> ở bờ Đông Nam đảo, vì khu vực này biển kín gió, vẫn giữ được làn nước trong xanh và êm đềm suốt mùa hè.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200" alt="Hoàng hôn Phú Quốc rực rỡ buông xuống mặt biển" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Khoảnh khắc hoàng hôn lãng mạn mê đắm lòng người tại bờ Tây đảo ngọc</figcaption>
</figure>

<h2>4. Top trải nghiệm không thể bỏ lỡ tại Phú Quốc</h2>
<ul>
  <li><strong>Grand World – Thành phố không ngủ:</strong> Trải nghiệm du thuyền Gondola trên dòng kênh Venice lãng mạn và thưởng thức show thực cảnh "Tinh hoa Việt Nam".</li>
  <li><strong>Vinpearl Safari:</strong> Công viên chăm sóc và bảo tồn động vật bán hoang dã đầu tiên và lớn nhất tại Việt Nam.</li>
  <li><strong>Thưởng thức ẩm thực địa phương:</strong> Gỏi cá trích cuốn bánh tráng rau rừng, nhum biển nướng mỡ hành, bún quậy Kiến Xây trứ danh.</li>
</ul>
`,
      en: `
<h2>1. Climate Overview of Phu Quoc</h2>
<p>Located in the Gulf of Thailand, Phu Quoc features a tropical monsoon climate with two distinct seasons: the Dry Season (Nov to Apr) and the Green/Rainy Season (May to Oct).</p>
<h2>2. The Peak Dry Season (November – April)</h2>
<p>Calm azure waters, low humidity, and endless sunshine make this period perfect for island hopping, coral reef snorkeling, and cable car rides to Hon Thom.</p>
<h2>3. Why Visit During Green Season?</h2>
<p>Enjoy luxury 5-star oceanfront resorts at 40-50% discounts with peaceful, crowd-free beaches at Bai Sao and Bai Khem.</p>
`
    }
  },
  {
    _id: 'news-halong-cruise-2026',
    slug: 'halong-bay-cruise-guide',
    title: {
      vi: 'Review kinh nghiệm chọn du thuyền Vịnh Hạ Long 5 sao: Bảng giá, lịch trình và bí kíp sống ảo',
      en: 'Ha Long Bay 5-Star Luxury Cruise Review: Best Itineraries, Pricing & Photo Spots',
      zh: '下龙湾五星级豪华邮轮全方位评测指南：星级航线选择、价格参考与登船秘籍',
      ko: '하롱베이 5성급 럭셔리 크루즈 완벽 리뷰: 추천 코스, 가격 비교 및 인생샷 명소',
      ja: '世界遺産ハロン湾5つ星ラグジュアリークルーズ宿泊レビュー：船の選び方・料金相場・過ごし方'
    },
    excerpt: {
      vi: 'Kinh nghiệm chọn du thuyền ngủ đêm Vịnh Hạ Long và Vịnh Lan Hạ 5 sao đẳng cấp: review chi tiết lịch trình 2N1Đ, ngắm hang Sửng Sốt, chèo thuyền kayak và săn bình minh.',
      en: 'Everything you need to know about booking an overnight luxury cruise in Ha Long and Lan Ha Bay: cave expeditions, kayaking, fine dining and sunrise Tai Chi.',
      zh: '下龙湾与兰哈湾五星级过夜游轮深度测评：独家剖析惊喜洞探秘、海上独木舟皮划艇体验及顶层甲板太极晨练。',
      ko: '하롱베이 & 란하베이 1박2일 럭셔리 크루즈 여행기: 성우솟 동굴 탐험, 카약 체험, 선셋 파티 및 일출 태극권 클래스 총정리.',
      ja: 'ハロン湾・ランハ湾の一泊二日クルーズ完全攻略。壮大な鍾乳洞探検、カヤック体験、船上フレンチディナーの魅力を凝縮。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=1200',
    category: 'experience',
    author: 'Phạm Đức Hùng',
    isPublished: true,
    publishedAt: '2026-03-22T14:00:00.000Z',
    createdAt: '2026-03-22T14:00:00.000Z',
    content: {
      vi: `
<h2>1. Tại sao ngủ đêm trên du thuyền Hạ Long là trải nghiệm "nhất định phải thử một lần trong đời"?</h2>
<p>Vịnh Hạ Long, 2 lần được UNESCO công nhận là Di sản Thiên nhiên Thế giới, sở hữu gần 2.000 hòn đảo đá vôi kỳ vĩ nhô lên giữa làn nước xanh lục bảo. Thay vì các tour tàu tiếng đi về trong ngày vội vã, một chuyến <strong>du thuyền ngủ đêm 5 sao</strong> sẽ đưa bạn đắm chìm trọn vẹn vào không gian thiên nhiên tĩnh lặng, chiêm ngưỡng hoàng hôn rực rỡ và thức giấc giữa biển trời mây nước bồng bềnh.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1559563458-527698bf5295?w=1200" alt="Du thuyền 5 sao sang trọng giữa Vịnh Hạ Long hùng vĩ" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Du thuyền 5 sao đẳng cấp quốc tế neo đậu giữa lòng kỳ quan Vịnh Hạ Long</figcaption>
</figure>

<h2>2. Bật mí lịch trình du thuyền Hạ Long 2 ngày 1 đêm chuẩn 5 sao</h2>
<h3>Ngày 1: Tuần Châu – Vịnh Hạ Long – Hang Sửng Sốt – Đảo Ti Tốp</h3>
<ul>
  <li><strong>11:30 – 12:00:</strong> Làm thủ tục check-in tại cảng tàu quốc tế Tuần Châu hoặc Cảng tàu khách quốc tế Hạ Long, thưởng thức nước uống chào mừng trên tàu.</li>
  <li><strong>13:00:</strong> Dùng bữa trưa buffet hải sản thượng hạng trong lúc du thuyền nhẹ nhàng lướt qua các hòn đảo đá vôi biểu tượng như Hòn Trống Mái, Hòn Đỉnh Hương.</li>
  <li><strong>15:00:</strong> Khám phá <strong>Hang Sửng Sốt</strong> – hang động lớn và lộng lẫy bậc nhất vịnh với hệ thống thạch nhũ hàng triệu năm tuổi biến ảo muôn hình vạn trạng.</li>
  <li><strong>16:30:</strong> Tắm biển tại <strong>Đảo Ti Tốp</strong> và leo hơn 400 bậc đá lên đỉnh núi để ngắm nhìn toàn cảnh 360 độ vịnh Hạ Long từ trên cao.</li>
  <li><strong>18:00 – 19:30:</strong> Tiệc Sunset Party trên Sundeck, lớp học nấu món nem rán truyền thống và thưởng thức bữa tối lãng mạn chuẩn phong cách fine dining.</li>
  <li><strong>21:00:</strong> Trải nghiệm câu mực đêm, hát karaoke hoặc thư giãn tại quầy bar và spa.</li>
</ul>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200" alt="Chèo thuyền kayak giữa làn nước ngọc bích Vịnh Hạ Long" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Tự tay chèo thuyền kayak luồn lách qua các hang luồn kỳ bí</figcaption>
</figure>

<h3>Ngày 2: Chèo thuyền Kayak – Hang Luồn – Trở về đất liền</h3>
<ul>
  <li><strong>06:00:</strong> Tham gia lớp tập Taichi (Thái Cực Quyền) đón tia nắng bình minh đầu tiên trên boong tàu lộng gió.</li>
  <li><strong>07:00:</strong> Ăn sáng nhẹ với trà, cà phê và bánh ngọt.</li>
  <li><strong>07:45:</strong> Trải nghiệm chèo kayak hoặc thuyền nan thăm <strong>Hang Luồn</strong>, chiêm ngưỡng những đàn khỉ hoang dã chuyền cành trên vách đá.</li>
  <li><strong>09:30:</strong> Trở về tàu thu dọn hành lý, dùng bữa trưa sớm (Brunch) và thanh toán dịch vụ.</li>
  <li><strong>11:30:</strong> Tàu cập bến cảng, kết thúc chuyến hải trình đáng nhớ.</li>
</ul>

<h2>3. Bảng giá tham khảo các dòng du thuyền Hạ Long</h2>
<div class="overflow-x-auto my-4">
  <table class="w-full text-left text-sm border border-slate-200 rounded-xl overflow-hidden">
    <thead class="bg-slate-100 text-slate-800 font-bold">
      <tr>
        <th class="p-3 border-b">Hạng Du Thuyền</th>
        <th class="p-3 border-b">Mức Giá (VNĐ/khách)</th>
        <th class="p-3 border-b">Tiện Ích Nổi Bật</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 text-slate-700">
      <tr>
        <td class="p-3 font-semibold">Du thuyền 4 sao</td>
        <td class="p-3 text-orange-600 font-bold">2.200.000 – 2.800.000</td>
        <td class="p-3">Phòng ban công riêng, trọn gói 4 bữa ăn</td>
      </tr>
      <tr>
        <td class="p-3 font-semibold">Du thuyền 5 sao Tiêu Chuẩn</td>
        <td class="p-3 text-orange-600 font-bold">3.200.000 – 4.500.000</td>
        <td class="p-3">Bồn tắm sục Jacuzzi, bể bơi vô cực, buffet tôm hùm</td>
      </tr>
      <tr>
        <td class="p-3 font-semibold">Du thuyền 5 sao Siêu Sang (Luxury)</td>
        <td class="p-3 text-orange-600 font-bold">5.000.000 – 9.000.000</td>
        <td class="p-3">Phòng tổng thống, sân golf mini, hầm rượu vang cao cấp</td>
      </tr>
    </tbody>
  </table>
</div>
`,
      en: `
<h2>1. Why Choose an Overnight Cruise?</h2>
<p>An overnight cruise is the quintessential way to experience UNESCO World Heritage Ha Long Bay, taking you away from day-trip crowds to serene emerald waters and soaring limestone islands.</p>
<h2>2. Highlights of a 2D1N Itinerary</h2>
<p>Marvel at Sung Sot Cave, climb Ti Top Island for panoramic views, kayak through Luon Cave, savor seafood feasts, and wake up to Tai Chi at sunrise on the sundeck.</p>
`
    }
  },
  {
    _id: 'news-sapa-rice-2026',
    slug: 'kinh-nghiem-du-lich-sapa',
    title: {
      vi: 'Kinh nghiệm du lịch Sa Pa mùa lúa chín & săn mây: Lịch trình 3N2Đ chinh phục Fansipan',
      en: 'Sa Pa Golden Terraces & Cloud Hunting Guide: 3D2N Mount Fansipan Adventure',
      zh: '沙坝金色稻浪与云海秘境全攻略：3天2晚登顶印度支那屋脊番西邦峰',
      ko: '사파 황금빛 다랑이논 & 운해 사냥 가이드: 2박3일 판시판 정복 일정',
      ja: 'サパ黄金の棚田と雲海を巡る旅：2泊3日インドシナ最高峰ファンシーパン登頂完全攻略'
    },
    excerpt: {
      vi: 'Bí kíp du lịch Sa Pa mùa lúa vàng và săn mây đèo Ô Quy Hồ: hướng dẫn di chuyển, trải nghiệm bản Cát Cát, thung lũng Mường Hoa và cáp treo Sun World Fansipan Legend.',
      en: 'Complete guide to Sa Pa golden rice season and O Quy Ho pass cloud chasing: Muong Hoa valley trekking, ethnic village homestays, and Fansipan cable car.',
      zh: '深度领略沙坝金色梯田与云海翻腾的绝美风光：芒花山谷徒步漫游、黑苗族古村探访及番西邦缆车实用贴士。',
      ko: '황금빛 계단식 논과 웅장한 운해를 감상하는 사파 힐링 여행: 깟깟마을, 므엉호아 밸리 트레킹 및 판시판 케이블카 꿀팁.',
      ja: '秋のサパで息を呑む絶景の棚田と雲海に出会う。カットカット村の伝統文化体験からファンシーパン山頂へのアクセスまで詳解。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=1200',
    category: 'destination',
    author: 'Ngô Thị Bích',
    isPublished: true,
    publishedAt: '2026-03-25T11:20:00.000Z',
    createdAt: '2026-03-25T11:20:00.000Z',
    content: {
      vi: `
<h2>1. Sa Pa – Thành phố trong sương huyền ảo</h2>
<p>Tọa lạc ở độ cao 1.600m so với mực nước biển thuộc tỉnh Lào Cai, Sa Pa là điểm đến nổi tiếng bậc nhất vùng Tây Bắc. Nơi đây hấp dẫn du khách bởi khí hậu mát lạnh ôn đới quanh năm, những dãy núi Hoàng Liên Sơn điệp trùng và bức tranh ruộng bậc thang uốn lượn kỳ vĩ từng được tạp chí Travel + Leisure vinh danh là một trong 7 ruộng bậc thang kỳ vĩ nhất thế giới.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=1200" alt="Ruộng bậc thang Sa Pa mùa lúa chín vàng óng ánh" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Bức tranh thêu dệt kỳ vĩ của những thửa ruộng bậc thang mùa lúa chín tháng 9 – 10</figcaption>
</figure>

<h2>2. Thời điểm vàng để đến Sa Pa</h2>
<ul>
  <li><strong>Tháng 9 – Tháng 10 (Mùa lúa chín):</strong> Toàn bộ thung lũng Mường Hoa, Tả Van chuyển sang sắc vàng rực rỡ, hương lúa mới thơm ngát ngập tràn không gian.</li>
  <li><strong>Tháng 11 – Tháng 3 (Mùa săn mây & ngắm hoa):</strong> Thời điểm lý tưởng nhất để săn biển mây bồng bềnh tại đèo Ô Quy Hồ, đỉnh Fansipan và ngắm hoa mai anh đào, hoa mận nở trắng rừng.</li>
</ul>

<h2>3. Lịch trình 3 ngày 2 đêm khám phá Sa Pa trọn vẹn</h2>
<h3>Ngày 1: Hà Nội – Sa Pa – Bản Cát Cát – Nhà thờ Đá</h3>
<p>Đi xe Limousine từ Hà Nội lên Sa Pa qua cao tốc Hà Nội - Lào Cai chỉ mất khoảng 4.5 – 5 tiếng. Nhận phòng khách sạn, buổi chiều ghé thăm bản Cát Cát của người H'Mông, thuê trang phục dân tộc check-in thác Tiên Sa và cối xay nước khổng lồ. Buổi tối dạo phố đi bộ, chụp ảnh Nhà thờ Đá cổ và thưởng thức lẩu cá hồi, cá tầm nóng hổi.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200" alt="Đỉnh Fansipan nóc nhà Đông Dương ngập tràn biển mây" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Chinh phục đỉnh Fansipan 3.143m – Cột mốc tự hào nóc nhà Đông Dương</figcaption>
</figure>

<h3>Ngày 2: Chinh phục đỉnh Fansipan – Thung lũng Mường Hoa – Đèo Ô Quy Hồ</h3>
<p>Trải nghiệm tuyến tàu hỏa leo núi Mường Hoa hiện đại đến ga cáp treo Sun World Fansipan Legend. Tuyến cáp treo giữ hai kỷ lục Guinness thế giới đưa bạn lướt qua thung lũng mây để chạm tay vào cột mốc 3.143m huyền thoại. Buổi chiều, di chuyển lên Cổng trời đèo Ô Quy Hồ ngắm hoàng hôn rực rỡ và săn biển mây cuồn cuộn.</p>

<h3>Ngày 3: Khám phá bản Tả Van – Mua sắm quà lưu niệm</h3>
<p>Dạo bước giữa thung lũng Tả Van, nhâm nhi tách cà phê ngắm suối Mường Hoa róc rách. Mua sắm hạt dẻ nướng, mận sấy dẻo và thịt trâu gác bếp về làm quà trước khi lên xe về lại Hà Nội.</p>
`,
      en: `
<h2>1. Welcome to Misty Sa Pa</h2>
<p>Nestled in the majestic Hoang Lien Son mountain range at 1,600m altitude, Sa Pa captivates travelers with terraced rice fields, vibrant hill-tribe culture, and cool mountain air.</p>
<h2>2. Best Seasons to Explore</h2>
<p>Visit in September-October for golden cascading rice terraces, or November-March for spectacular cloud seas and blooming cherry blossoms.</p>
<h2>3. Key Highlights</h2>
<p>Summit Mount Fansipan (3,143m) via world-record cable car, trek through Cat Cat and Ta Van ethnic villages, and watch breathtaking sunsets atop O Quy Ho mountain pass.</p>
`
    }
  },
  {
    _id: 'news-ninh-binh-2026',
    slug: 'review-du-lich-ninh-binh-trang-an',
    title: {
      vi: 'Review du lịch Ninh Bình 2026: Khám phá Tràng An, Tam Cốc và Hang Múa từ A-Z',
      en: 'Ninh Binh Travel Review 2026: Trang An, Tam Coc & Hang Mua Peak Itinerary',
      zh: '2026宁平旅游全景测评：深度漫游陆上下龙湾长安、三谷碧洞与跳舞洞',
      ko: '2026 닌빈 여행 완벽 리뷰: 짱안 보트투어, 땀꼭 & 항무아 인생샷 명소 총정리',
      ja: '2026年ニンビン観光完全レビュー：世界遺産チャンアン・タムコック・ハンムア絶景巡り'
    },
    excerpt: {
      vi: 'Review chi tiết du lịch Ninh Bình 2 ngày 1 đêm: đi thuyền nan Tràng An, leo 500 bậc đá Hang Múa ngắm Tam Cốc, viếng chùa Bái Đính và thưởng thức đặc sản dê núi cơm cháy.',
      en: 'Complete 2D1N Ninh Binh guide: Trang An UNESCO boat tour, Hang Mua dragon peak hike, Bai Dinh pagoda and local crispy rice delicacies.',
      zh: '宁平两日游超全指南：乘木船探寻长安喀斯特溶洞群、登顶跳舞洞巨龙俯瞰三谷绝景，品味地道烤羊肉与酥脆锅巴。',
      ko: '닌빈 1박2일 핵심 투어: 유네스코 세계유산 짱안 나룻배 투어, 항무아 용 조각상 포토존, 바이딘 사원 및 현지 염소고기 맛집 리뷰.',
      ja: '「陸のハロン湾」ニンビンの見どころ徹底紹介。手漕ぎボートで巡るチャンアン、絶景のハンムア、東南アジア屈指の大寺院バイディン寺院を巡る。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    category: 'destination',
    author: 'Đỗ Hoàng Nam',
    isPublished: true,
    publishedAt: '2026-03-28T08:45:00.000Z',
    createdAt: '2026-03-28T08:45:00.000Z',
    content: {
      vi: `
<h2>1. Ninh Bình – Vịnh Hạ Long trên cạn ngàn năm lịch sử</h2>
<p>Chỉ cách Hà Nội khoảng 95km về phía Nam, Ninh Bình là vùng đất "địa linh nhân kiệt", nơi lưu giữ Quần thể danh thắng Tràng An – di sản văn hóa và thiên nhiên hỗn hợp duy nhất tại khu vực Đông Nam Á được UNESCO công nhận. Với hệ thống núi đá vôi kỳ vĩ soi bóng xuống dòng sông êm đềm, Ninh Bình là điểm đến nghỉ dưỡng và check-in lý tưởng hàng đầu miền Bắc.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200" alt="Khám phá Tràng An Ninh Bình bằng thuyền nan" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Ngồi thuyền nan xuôi dòng nước trong vắt khám phá Quần thể danh thắng Tràng An</figcaption>
</figure>

<h2>2. Top 4 địa điểm check-in "đỉnh cao" nhất Ninh Bình</h2>
<h3>1. Quần thể danh thắng Tràng An (Tuyến thuyền số 2 và số 3)</h3>
<p>Hành trình kéo dài khoảng 2.5 – 3 tiếng đưa du khách luồn lách qua các hang động kỳ bí như Hang Lam, Hang Vạng, Hang Đại và dừng chân viếng Đền Suối Tiên linh thiêng. Nước sông trong đến mức có thể nhìn thấy rong rêu uốn lượn dưới đáy nước xanh ngắt.</p>

<h3>2. Hang Múa – Vạn Lý Trường Thành thu nhỏ</h3>
<p>Vượt qua gần 500 bậc đá uốn lượn men theo sườn núi dốc đứng, bạn sẽ đặt chân lên đỉnh Ngọa Long oai nghiêm. Từ đây, thu trọn vào tầm mắt toàn cảnh thung lũng Tam Cốc với dòng sông Ngô Đồng uốn lượn mềm mại giữa đôi bờ lúa chín vàng ươm.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200" alt="Đỉnh Ngọa Long Hang Múa Ninh Bình ngắm trọn thung lũng Tam Cốc" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Góc ngắm toàn cảnh thung lũng Tam Cốc từ đỉnh Hang Múa</figcaption>
</figure>

<h3>3. Chùa Bái Đính – Ngôi chùa của những kỷ lục châu Á</h3>
<p>Quần thể tâm linh đồ sộ giữ hàng loạt kỷ lục: tượng Phật bằng đồng dát vàng lớn nhất châu Á, hành lang 500 tượng La Hán bằng đá xanh dài nhất và chuông đồng lớn nhất Việt Nam.</p>

<h3>4. Cố đô Hoa Lư – Hào khí non sông</h3>
<p>Kinh đô đầu tiên của nhà nước phong kiến tập quyền Việt Nam dưới triều Đinh – Tiền Lê, nơi gìn giữ dấu ấn lịch sử hào hùng dựng nước và giữ nước của cha ông.</p>

<h2>3. Đặc sản Ninh Bình nhất định phải thưởng thức</h2>
<ul>
  <li><strong>Thịt dê núi:</strong> Dê nuôi thả tự nhiên trên các triền núi đá vôi nên thịt săn chắc, thơm ngọt. Các món ngon gồm: dê tái chanh, dê nướng tảng, dê xào lăn, lẩu dê.</li>
  <li><strong>Cơm cháy chà bông ruốc:</strong> Từng miếng cơm cháy giòn rụm chấm cùng nước sốt tim cật dê béo ngậy đậm đà.</li>
  <li><strong>Ốc núi Ninh Bình:</strong> Loài ốc sống trong các hang đá chỉ xuất hiện vào mùa mưa, thịt giòn ngọt chấm nước mắm gừng ớt sả.</li>
</ul>
`,
      en: `
<h2>1. Discover Ninh Binh – Halong Bay on Land</h2>
<p>Located just 95km south of Hanoi, Ninh Binh is home to UNESCO World Heritage Trang An, characterized by majestic karst peaks, serene waterways, and centuries-old imperial history.</p>
<h2>2. Must-Visit Attractions</h2>
<p><strong>Trang An Eco-boat Tour:</strong> Float through mystical caves and ancient shrines on emerald-green rivers.</p>
<p><strong>Hang Mua Viewpoint:</strong> Climb 500 steps to the stone dragon peak for sweeping panoramic views of Tam Coc valley.</p>
<p><strong>Bai Dinh Pagoda:</strong> The largest Buddhist pagoda complex in Southeast Asia holding multiple cultural records.</p>
`
    }
  },
  {
    _id: 'news-da-nang-hoi-an-2026',
    slug: 'review-du-lich-da-nang-hoi-an',
    title: {
      vi: 'Review du lịch Đà Nẵng – Hội An 4 ngày 3 đêm: Lịch trình chi tiết, ăn chơi thả ga và tối ưu chi phí',
      en: 'Da Nang & Hoi An 4D3N Comprehensive Review: Full Itinerary, Ba Na Hills & Lantern Night',
      zh: '岘港与会安4天3晚深度游评测：巴拿山黄金桥、古镇放水灯与超高性价比攻略',
      ko: '다낭 & 호이안 3박4일 완벽 여행기: 바나힐 골든브릿지, 야경 투어 & 알뜰 경비',
      ja: 'ダナン＆ホイアン3泊4日モデルコース徹底レビュー：バーナーヒルズ黄金の橋と灯篭流し'
    },
    excerpt: {
      vi: 'Hành trình kết hợp tuyệt vời giữa thành phố biển hiện đại Đà Nẵng và phố cổ di sản Hội An: check-in Cầu Vàng Bà Nà Hills, tắm biển Mỹ Khê, đi thuyền thúng rừng dừa và thả đèn hoa đăng sông Hoài.',
      en: 'The perfect combination of modern coastal Da Nang and UNESCO Hoi An Ancient Town: Golden Bridge, My Khe beach, Bay Mau coconut basket boat, and river lantern release.',
      zh: '现代海滨名城岘港与千年古韵会安的完美邂逅：登临巴拿山巨手黄金桥、漫步美溪沙滩、体验水椰林簸箕船与秋盆河河灯祈福。',
      ko: '휴양과 낭만을 동시에 즐기는 다낭-호이안 코스: 바나힐 골든브릿지, 미케비치 해수욕, 바구니배 체험 및 유네스코 호이안 올드타운 야경 투어.',
      ja: '近代的なビーチリゾート・ダナンと風情あふれる世界遺産ホイアンを巡る3泊4日。バナヒルズ、ミーケビーチ、ランタンの灯る夜の街を満喫。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    category: 'experience',
    author: 'Vũ Thanh Hằng',
    isPublished: true,
    publishedAt: '2026-03-30T16:20:00.000Z',
    createdAt: '2026-03-30T16:20:00.000Z',
    content: {
      vi: `
<h2>1. Tổng quan cặp đôi điểm đến Đà Nẵng – Hội An</h2>
<p>Đà Nẵng và Hội An là bộ đôi du lịch hoàn hảo nhất miền Trung Việt Nam. Chỉ cách nhau 30km, một bên là Đà Nẵng năng động với những cây cầu biểu tượng và bãi biển Mỹ Khê quyến rũ hàng đầu châu Á, một bên là Hội An trầm mặc, cổ kính với những dãy nhà quét vôi vàng đặc trưng và ánh đèn lồng lung linh huyền ảo khi đêm về.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200" alt="Phố cổ Hội An lung linh đèn lồng bên dòng sông Hoài" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Vẻ đẹp cổ kính, trầm mặc của Di sản Văn hóa Thế giới Phố cổ Hội An</figcaption>
</figure>

<h2>2. Lịch trình chi tiết 4 ngày 3 đêm tối ưu nhất</h2>
<h3>Ngày 1: Đà Nẵng – Bán đảo Sơn Trà – Biển Mỹ Khê – Cầu Rồng phun lửa</h3>
<p>Buổi sáng đáp chuyến bay đến Đà Nẵng, xe đưa về khách sạn nhận phòng nghỉ ngơi. Buổi chiều viếng Chùa Linh Ứng trên bán đảo Sơn Trà chiêm bái tượng Phật Bà Quan Âm cao 67m hướng ra biển Đông. Chiều muộn tắm biển Mỹ Khê cát trắng mịn màng. Tối thứ Bảy hoặc Chủ Nhật, ra cầu Rồng ngắm rồng thép phun lửa và phun nước rực sáng bầu trời.</p>

<h3>Ngày 2: Trọn ngày khám phá Sun World Ba Na Hills</h3>
<p>Dành nguyên ngày trải nghiệm "chốn bồng lai tiên cảnh" Bà Nà Hills. Check-in siêu phẩm <strong>Cầu Vàng (Golden Bridge)</strong> được nâng đỡ bởi hai bàn tay khổng lồ phủ rêu phong, dạo bước Làng Pháp cổ kính, vui chơi không giới hạn tại Fantasy Park và hầm rượu cổ Debay.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200" alt="Cầu Vàng Bà Nà Hills kiệt tác kiến trúc nổi danh thế giới" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Cầu Vàng Bà Nà Hills – Biểu tượng kiến trúc du lịch nổi danh toàn cầu</figcaption>
</figure>

<h3>Ngày 3: Rừng dừa Bảy Mẫu – Khám phá Phố cổ Hội An</h3>
<p>Buổi sáng trải nghiệm đi thuyền thúng tròn len lỏi giữa rừng dừa Bảy Mẫu Cẩm Thanh, xem các nghệ nhân lắc thúng xoay tròn điệu nghệ. Buổi chiều di chuyển vào trung tâm Phố Cổ Hội An, dạo bước qua Chùa Cầu Nhật Bản, nhà cổ Tấn Ký, hội quán Phúc Kiến. Buổi tối đi thuyền thả đèn hoa đăng trên sông Hoài và ăn cao lầu, cơm gà bà Buội.</p>

<h3>Ngày 4: Mua sắm đặc sản Chợ Hàn – Tạm biệt miền Trung</h3>
<p>Sáng ghé chợ Hàn mua chả bò Đà Nẵng, tré, mực rim me, bánh khô mè Cẩm Lệ về làm quà. Ra sân bay Đà Nẵng kết thúc chuyến đi tuyệt vời.</p>
`,
      en: `
<h2>1. The Ultimate Central Vietnam Duo</h2>
<p>Just 30km apart, dynamic coastal Da Nang and romantic UNESCO Hoi An Ancient Town create an unbeatable 4-day travel experience for all types of travelers.</p>
<h2>2. Unforgettable Highlights</h2>
<p>Walk across the world-famous Golden Bridge at Ba Na Hills, cruise the green waterways of Bay Mau coconut forest in round bamboo basket boats, and float paper lanterns along Hoi An's lantern-lit river.</p>
`
    }
  },
  {
    _id: 'news-mien-tay-2026',
    slug: 'review-du-lich-mien-tay-song-nuoc',
    title: {
      vi: 'Review du lịch Miền Tây sông nước: Trải nghiệm chợ nổi Cái Răng, miệt vườn và rừng tràm Trà Sư',
      en: 'Mekong Delta Travel Review: Cai Rang Floating Market, Fruit Orchards & Tra Su Forest',
      zh: '越南湄公河水乡全景体验指南：探秘丐冷水上市场、热带果园采摘与茶师白千层林',
      ko: '베트남 메콩델타 투어 리뷰: 까이랑 수상시장, 열대 과일 과수원 및 짜수 맹그로브 숲',
      ja: 'メコンデルタ水上マーケット＆マングローブ林の旅：カントー・チャウドック完全ガイド'
    },
    excerpt: {
      vi: 'Hành trình về miền Tây Nam Bộ mộc mạc: trải nghiệm họp chợ trên sông Cái Răng từ sáng sớm, xuồng ba lá lướt thảm bèo xanh rừng tràm Trà Sư và thưởng thức cá lóc nướng trui.',
      en: 'Immerse in authentic Southern Vietnam: morning Cai Rang floating market, paddling through emerald duckweed carpets in Tra Su cajuput forest, and savoring rustic Mekong dishes.',
      zh: '走进原汁原味的湄公河水上人家：清晨乘船感受热闹非凡的水上交易市场、小木舟穿梭于绿毯般的白千层森林，品尝稻草烤黑鱼与椰子煎饼。',
      ko: '메콩강 유역의 정겨운 정취를 만끽하는 코스: 활기 넘치는 까이랑 수상시장, 초록빛 부평초 가득한 짜수 숲 나룻배 투어 및 전통 메콩 미식 탐방.',
      ja: '南ベトナム・メコンデルタの豊かな自然と水上生活を体験。活気ある水上マーケット、緑の絨毯のようなマングローブ林の絶景クルーズ。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    category: 'destination',
    author: 'Lâm Văn Phát',
    isPublished: true,
    publishedAt: '2026-04-02T13:30:00.000Z',
    createdAt: '2026-04-02T13:30:00.000Z',
    content: {
      vi: `
<h2>1. Miền Tây Nam Bộ – Vùng đất hào sảng và trù phú</h2>
<p>Miền Tây sông nước (Đồng bằng sông Cửu Long) mang vẻ đẹp dung dị, êm đềm với những con kênh rạch chằng chịt, những rặng dừa nước nghiêng mình soi bóng và tấm lòng hiếu khách, hào sảng nồng ấm của người dân Nam Bộ. Đây là điểm đến lý tưởng để tạm gác lại những ồn ào phố thị, hòa mình vào không gian miệt vườn thanh bình.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200" alt="Chợ nổi Cái Răng Cần Thơ tấp nập buổi bình minh" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Chợ nổi Cái Răng Cần Thơ – Bức tranh văn hóa sông nước độc nhất vô nhị</figcaption>
</figure>

<h2>2. Những trải nghiệm độc bản không thể bỏ qua</h2>
<h3>1. Chợ nổi Cái Răng (Cần Thơ) – Văn hóa thương hồ trên sông</h3>
<p>Thức dậy thật sớm từ 05:00 sáng để xuống ghe máy ra chợ nổi. Lúc này, hàng trăm chiếc ghe chở đầy ắp dưa hấu, khóm, vú sữa, sầu riêng tấp nập neo đậu trao đổi hàng hóa. Đặc biệt, người bán treo sản vật của mình lên cây sào gọi là "cây bẹo" để khách từ xa dễ dàng nhận biết. Thưởng thức một tô hủ tiếu nóng hổi và ly cà phê sữa đá chòng chành trên sông là trải nghiệm nhớ đời.</p>

<h3>2. Rừng tràm Trà Sư (An Giang) – Thiên đường sinh thái xanh biếc</h3>
<p>Ngồi trên chiếc xuồng ba lá mộc mạc do các cô gái miền Tây mặc áo bà ba chèo lái, nhẹ nhàng lướt qua thảm bèo cám xanh mướt trải dài như vô tận. Lắng nghe tiếng chim ríu rít gọi bầy và ngắm nhìn những đàn cò trắng chao liệng giữa tán rừng tràm cổ thụ.</p>

<h2>3. Ẩm thực miệt vườn đậm đà tình quê</h2>
<ul>
  <li><strong>Cá lóc nướng trui:</strong> Cá lóc tươi sống vùi vào rơm rạ khô đốt cháy, khi chín gạt lớp vảy cháy đen lộ ra thớ thịt cá trắng ngần, thơm nức cuốn bánh tráng rau rừng chấm mắm me.</li>
  <li><strong>Lẩu mắm miền Tây:</strong> Nấu từ mắm cá linh hoặc mắm cá sặc thơm nồng, ăn kèm hơn 20 loại rau đồng nội như bông điên điển, bông súng, rau nhút, so đũa.</li>
  <li><strong>Bánh xèo củ hủ dừa:</strong> Chiếc bánh xèo vàng giòn to bằng chiếc mâm, nhân thịt ba chỉ, tôm sông và củ hủ dừa giòn ngọt tự nhiên.</li>
</ul>
`,
      en: `
<h2>1. Discover the Mekong Delta</h2>
<p>The Mekong Delta charms visitors with its labyrinth of canals, verdant fruit orchards, floating markets, and legendary Southern Vietnamese hospitality.</p>
<h2>2. Signature Experiences</h2>
<p>Awake early for the vibrant Cai Rang floating market in Can Tho, glide through carpeted green duckweed waters in Tra Su cajuput forest, and savor fresh grilled snakehead fish with tamarind sauce.</p>
`
    }
  },
  {
    _id: 'news-quynhon-phuyen-2026',
    slug: 'review-du-lich-quy-nhon-phu-yen',
    title: {
      vi: 'Review du lịch Quy Nhơn – Phú Yên: Hành trình biển xanh xứ sở hoa vàng trên cỏ xanh',
      en: 'Quy Nhon & Phu Yen Travel Review: Emerald Coast & Yellow Flowers Itinerary',
      zh: '归仁与富安海滨深度测评：探秘蔚蓝海岸与“绿草黄花”电影取景圣地',
      ko: '퀴논 & 푸옌 자유여행 리뷰: 에메랄드빛 해안과 낭만적인 노란 꽃밭 투어',
      ja: 'クイニョン＆フーイエン絶景海岸巡り：巨岩の岬エオゾーと映画の舞台バイセップ'
    },
    excerpt: {
      vi: 'Kinh nghiệm du lịch Quy Nhơn Phú Yên 4 ngày 3 đêm tự túc: ngắm hoàng hôn Kỳ Co Eo Gió, check-in tuyệt tác Gành Đá Đĩa và bãi Xép xứ sở hoa vàng cỏ xanh.',
      en: 'Complete 4D3N coastal adventure covering Ky Co beach, Eo Gio cliffside walk, the geological marvel Ganh Da Dia, and fresh seafood by O Loan lagoon.',
      zh: '打卡越南中南部最美秘境海岸：探访“小马尔代夫”祈戈海滩、风口悬崖栈道、大自然的蜂巢奇迹巨石海角与生蚝海鲜大餐。',
      ko: '숨겨진 보석 같은 휴양지 퀴논 & 푸옌: 끼꼬 비치 스노클링, 에오지오 해안 산책로, 주상절리 간다디아 및 오로안 석호 해산물 맛집 투어.',
      ja: '手つかずの自然が残るクイニョンとフーイエン。断崖絶壁のエオゾー、神秘的な柱状節理ガンダーディア、新鮮なシーフードを満喫。'
    },
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    category: 'destination',
    author: 'Nguyễn Đăng Khoa',
    isPublished: true,
    publishedAt: '2026-04-05T15:10:00.000Z',
    createdAt: '2026-04-05T15:10:00.000Z',
    content: {
      vi: `
<h2>1. Vẻ đẹp hoang sơ của dải đất duyên hải Nam Trung Bộ</h2>
<p>Nếu bạn đang tìm kiếm một vùng biển hoang sơ, làn nước trong vắt đến độ có thể nhìn rõ từng đàn cá tung tăng bơi lội mà không quá đông đúc xô bồ, thì hành trình liên tuyến <strong>Quy Nhơn (Bình Định) – Phú Yên</strong> chính là sự lựa chọn số 1. Nơi đây sở hữu những kiệt tác địa chất tự nhiên độc nhất vô nhị cùng những bãi tắm cát vàng mịn thoai thoải trải dài hút tầm mắt.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200" alt="Eo Gió Quy Nhơn cung đường đi bộ ven biển ngoạn mục" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Eo Gió Quy Nhơn – Cung đường đi bộ ven biển ngắm sóng vỗ tuyệt mỹ</figcaption>
</figure>

<h2>2. Những điểm đến biểu tượng trong hành trình</h2>
<h3>1. Kỳ Co – Eo Gió (Quy Nhơn): Maldives thu nhỏ của Việt Nam</h3>
<p>Kỳ Co sở hữu dải cát trắng ôm trọn lấy làn nước biển 2 màu xanh ngọc bích kỳ ảo, được bao bọc bởi những rặng núi đá sừng sững. Sau khi tắm biển Kỳ Co, du khách di chuyển sang <strong>Eo Gió</strong> – eo biển hút gió quanh năm với con đường đi bộ uốn lượn có lan can đỏ trắng men theo vách núi sát mép sóng biển.</p>

<h3>2. Gành Đá Đĩa (Phú Yên): Tuyệt tác địa chất tự nhiên triệu năm</h3>
<p>Được công nhận là Di tích Quốc gia đặc biệt, Gành Đá Đĩa là hiện tượng địa chất hiếm có trên thế giới với hàng chục nghìn cột đá bazan hình lục lăng xếp khít vào nhau như một tổ ong khổng lồ vươn mình ra biển cả mênh mông.</p>

<figure class="my-6">
  <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200" alt="Gành Đá Đĩa Phú Yên kỳ quan địa chất tự nhiên độc nhất vô nhị" class="rounded-2xl w-full object-cover shadow-md" />
  <figcaption class="text-center text-xs text-slate-500 mt-2 italic font-medium">Gành Đá Đĩa Phú Yên – Tuyệt tác đá núi lửa xếp hình tổ ong vươn ra biển Đông</figcaption>
</figure>

<h3>3. Bãi Xép & Gành Ông: Xứ sở hoa vàng trên cỏ xanh</h3>
<p>Khung cảnh xuất hiện trong bộ phim nổi tiếng của đạo diễn Victor Vũ với bãi cỏ xanh mướt trải dài trên vách đá ngắm sóng vỗ, điểm xuyết những rặng xương rồng hoang dại và bãi biển Bãi Xép thoai thoải cát vàng.</p>

<h3>4. Hải sản Đầm Ô Loan trứ danh</h3>
<p>Đừng quên dừng chân thưởng thức đặc sản sò huyết đầm Ô Loan rang me hoặc nướng mọi béo ngậy ngọt lịm, cua huỳnh đế hấp và bánh xèo tôm nhảy giòn rụm.</p>
`,
      en: `
<h2>1. Pristine South-Central Coast</h2>
<p>Quy Nhon and Phu Yen form an extraordinary coastal duo featuring turquoise bays, towering ocean cliffs, and unique volcanic stone formations.</p>
<h2>2. Top Highlights</h2>
<p><strong>Ky Co & Eo Gio:</strong> The "Maldives of Vietnam" with crystal waters and a scenic cliffside walking path.</p>
<p><strong>Ganh Da Dia:</strong> A rare geological wonder of basalt hexagonal columns stacked like giant beehives by the sea.</p>
<p><strong>Bai Xep:</strong> The dreamy filming location of "Yellow Flowers on Green Grass".</p>
`
    }
  }
];
