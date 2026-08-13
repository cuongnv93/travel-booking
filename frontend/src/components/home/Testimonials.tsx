'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { getI18nText } from '@/lib/utils';

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: { vi: 'Nguyễn Văn A', en: 'Alex Nguyen', zh: '阮文安', ko: '알렉스 응우옌', ja: 'アレックス' },
    role: { vi: 'Khách hàng thân thiết', en: 'Frequent Traveler', zh: '忠实客户', ko: '단골 고객', ja: 'リピーター様' },
    content: {
      vi: 'Chuyến đi tuyệt vời! Hướng dẫn viên rất nhiệt tình và chu đáo. Khách sạn đẹp và đồ ăn rất ngon. Chắc chắn tôi sẽ đặt tour của Travel cho những chuyến đi tiếp theo.',
      en: 'Wonderful trip! The tour guide was super enthusiastic and attentive. Beautiful hotel and delicious food. I will definitely book with Travel again!',
      zh: '极好的旅行体验！导游热情周到，酒店豪华舒适，餐饮丰富美味。下次出行一定会继续选择 Travel。',
      ko: '정말 멋진 여행이었습니다! 가이드님이 친절하고 섬세하게 챙겨주셨어요. 호텔도 깔끔하고 음식도 훌륭했습니다.',
      ja: '素晴らしい旅行でした！ガイドさんの対応がとても丁寧で親切でした。ホテルも豪華で料理も美味しく大満足です。'
    },
    rating: 5,
  },
  {
    id: 2,
    name: { vi: 'Trần Thị B', en: 'Sarah Tran', zh: '陈氏碧', ko: '사라 트란', ja: 'サラ' },
    role: { vi: 'Gia đình 4 người', en: 'Family of 4', zh: '4人家庭出游', ko: '4인 가족 여행', ja: '4人家族旅行' },
    content: {
      vi: 'Dịch vụ chăm sóc khách hàng rất tốt. Khi gia đình tôi có yêu cầu đổi phòng, nhân viên đã xử lý rất nhanh chóng. Cảm ơn Travel đã mang đến một kỳ nghỉ trọn vẹn.',
      en: 'Excellent customer service! When my family asked for a room change, the staff handled it instantly. Thank you Travel for a perfect vacation.',
      zh: '客服服务态度非常好！当我们提出更换房间时，工作人员迅速协助安排。非常感谢 Travel 带来完美的假期。',
      ko: '고객 서비스가 정말 훌륭합니다. 룸 변경 요청 시 직원분들이 신속하게 처리해 주셨어요. 덕분에 완벽한 휴가를 보냈습니다.',
      ja: 'カスタマーサービスの対応が迅速でした。部屋の変更リクエストにも快く応じてくれました。おかげで最高の休日になりました。'
    },
    rating: 5,
  },
  {
    id: 3,
    name: { vi: 'Lê Minh C', en: 'David Le', zh: '黎明', ko: '데이비드 리', ja: 'デイビッド' },
    role: { vi: 'Doanh nhân', en: 'Business Traveler', zh: '商务人士', ko: '비즈니스 고객', ja: 'ビジネス利用' },
    content: {
      vi: 'Tôi thường xuyên đặt vé máy bay và khách sạn qua Travel. Hệ thống dễ sử dụng, giá cả minh bạch và thường xuyên có ưu đãi tốt. Rất hài lòng với chất lượng dịch vụ.',
      en: 'I regularly book flights and hotels through Travel. Easy system, transparent pricing and great discount offers.',
      zh: '我经常通过 Travel 预订机票和酒店。系统便捷易用，价格透明且优惠力度大，非常满意。',
      ko: '자주 항공권과 호텔을 Travel에서 예약합니다. 시스템이 편리하고 가격이 투명하며 프로모션 혜택이 좋습니다.',
      ja: 'いつも Travel で航空券とホテルを予約しています。システムが使いやすく、透明性の高い価格設定で満足しています。'
    },
    rating: 5,
  },
  {
    id: 4,
    name: { vi: 'Phạm Hương D', en: 'Hannah Pham', zh: '范香', ko: '한나 팜', ja: 'ハンナ' },
    role: { vi: 'Blogger du lịch', en: 'Travel Blogger', zh: '旅游博主', ko: '여행 블로거', ja: 'トラベルブロガー' },
    content: {
      vi: 'Tôi đã đi qua nhiều công ty du lịch nhưng Travel thực sự nổi bật. Lịch trình chi tiết, hướng dẫn viên am hiểu văn hóa địa phương. Sẽ giới thiệu cho bạn bè.',
      en: 'I have traveled with many companies, but Travel really stands out. Detailed itinerary, knowledgeable guide. Highly recommended!',
      zh: '我体验过许多旅行社，但 Travel 确实脱颖而出。行程安排细致，导游懂文化。一定会推荐给朋友！',
      ko: '많은 여행사를 이용해봤지만 Travel은 정말 특별합니다. 알찬 일정과 현지 문화에 해박한 가이드에 감동했습니다.',
      ja: '多くの旅行会社を利用してきましたが、Travelは本当に素晴らしいです。詳しい日程と現地ガイドの知識が豊富でした。'
    },
    rating: 5,
  },
];

function ReviewCard({ review, locale }: { review: any; locale: string }) {
  const nameText = getI18nText(review.name, locale) || 'Khách hàng';
  const roleText = getI18nText(review.role, locale) || 'Du khách';
  const contentText = getI18nText(review.content, locale) || '';

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full flex flex-col group">
      <Quote className="absolute top-5 right-5 w-12 h-12 text-blue-100/70 group-hover:text-blue-200/90 transition-colors rotate-180 pointer-events-none" />

      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < (review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
          />
        ))}
      </div>

      {/* Review Content */}
      <p className="text-slate-600 text-sm leading-relaxed italic mb-6 flex-1 line-clamp-5">
        &ldquo;{contentText}&rdquo;
      </p>

      {/* Author Profile */}
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
          {nameText ? nameText.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm">{nameText}</h4>
          <p className="text-[11px] text-slate-500 font-medium">{roleText}</p>
        </div>
      </div>
    </div>
  );
}

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const locale = (useParams()?.locale as string) || 'vi';

  const { data: settings = [] } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return Array.isArray(res) ? res : (res?.data || []);
    },
    placeholderData: keepPreviousData,
  });

  const reviewsSetting = settings.find((s: any) => s.key === 'testimonials')?.value;
  const baseReviews: any[] =
    Array.isArray(reviewsSetting) && reviewsSetting.length > 0
      ? reviewsSetting
      : DEFAULT_REVIEWS;

  return (
    <section className="py-16 bg-slate-50/60 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 text-center mb-12">
        <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-2">
          {t('tag', { fallback: 'Ý KIẾN KHÁCH HÀNG' })}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {t('title', { fallback: 'Đánh Giá Từ Khách Hàng' })}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-12 relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ clickable: true, el: '.custom-pagination' }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-12"
        >
          {baseReviews.map((review, idx) => (
            <SwiperSlide key={review.id || idx} className="h-auto">
              <ReviewCard review={review} locale={locale} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="swiper-button-prev !left-0 !w-11 !h-11 !rounded-full !bg-white/90 hover:!bg-white !text-slate-700 hover:!text-blue-600 !border !border-slate-200/80 !shadow-lg hover:!scale-110 transition-all after:!text-lg"></button>
        <button className="swiper-button-next !right-0 !w-11 !h-11 !rounded-full !bg-white/90 hover:!bg-white !text-slate-700 hover:!text-blue-600 !border !border-slate-200/80 !shadow-lg hover:!scale-110 transition-all after:!text-lg"></button>
        
        <div className="custom-pagination flex justify-center gap-2 mt-4"></div>
      </div>
    </section>
  );
}
