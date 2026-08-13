const mongoose = require('mongoose');

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=1600',
    title: {
      vi: 'Khám Phá Hà Nội Ngàn Năm Văn Hiến',
      en: 'Explore Thousand-Year-Old Hanoi Culture',
      zh: '探索千年文化古都河内',
      ko: '천년의 역사를 간직한 하노이 탐험',
      ja: '千年の歴史を誇るハノイを巡る旅'
    },
    subtitle: {
      vi: 'Trải nghiệm văn hóa, ẩm thực và vẻ đẹp cổ kính của phố cổ 36 phường',
      en: 'Experience culture, cuisine, and ancient beauty of Hanoi 36 Old Streets',
      zh: '体验河内 36 古街的丰富文化、地道美食与古朴风貌',
      ko: '하노이 36개 구시가지의 문화, 음식 및 예스러운 아름다움을 체험하세요',
      ja: 'ハノイ36古街の歴史ある美しさ、文化、絶品グルメをご体感ください'
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
      ja: 'ダナンビーチの5つ星極上リゾート'
    },
    subtitle: {
      vi: 'Tận hưởng khoảnh khắc tuyệt đẹp tại Cầu Vàng Bà Nà Hills & Hội An lung linh',
      en: 'Enjoy breathtaking moments at Golden Bridge Ba Na Hills & romantic Hoi An',
      zh: '尽情享用巴拿山黄金桥与会安古镇浪漫夜景的绝美时光',
      ko: '바나힐 골든브릿지와 환상적인 호이안에서 특별한 순간을 즐기세요',
      ja: 'バーナーヒルズの神の hand 橋と幻想的なホイアンの夜景を満喫'
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
      ja: 'フーコック島 – 楽園のトロピカルアイランド'
    },
    subtitle: {
      vi: 'Bãi biển cát trắng mịn, ngắm san hô biển Nam và VinWonders sôi động',
      en: 'Pristine white sand beaches, coral reef snorkeling & vibrant VinWonders',
      zh: '细白沙滩、浮潜观赏珊瑚及体验精彩纷呈的 VinWonders 主题乐园',
      ko: '하얀 모래사장, 산호초 스노클링 및 활기찬 빈원더스 테마파크 체험',
      ja: '白砂のビーチ、珊瑚礁スノーケリング、人気のテーマパークVinWondersを満喫'
    },
    ctaText: { vi: 'Xem Chuyến Đi', en: 'View Trip', zh: '查看行程', ko: '일정 보기', ja: 'プランを見る' },
    ctaLink: '/tours/phu-quoc-paradise',
  },
];

async function updateDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/travel-booking');
  const db = mongoose.connection;
  
  const result = await db.collection('settings').updateOne(
    { key: 'hero_banners' },
    { $set: { value: slides } },
    { upsert: true }
  );
  
  console.log('Update Result:', result);
  mongoose.disconnect();
}

updateDB().catch(console.error);
