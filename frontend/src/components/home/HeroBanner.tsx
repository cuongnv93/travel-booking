'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { getI18nText } from '@/lib/utils';

const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
    title: {
      vi: 'Kỳ Quan Vịnh Hạ Long',
      en: 'Ha Long Bay Wonder of the World',
      zh: '世界自然遗产下龙湾奇观',
      ko: '세계 자연유산 하롱베이 탐험',
      ja: '世界遺産ハロン湾の絶景を巡る旅'
    },
    subtitle: {
      vi: 'Trải nghiệm du thuyền 5 sao lướt qua nghìn đảo đá vôi hùng vĩ',
      en: 'Experience 5-star luxury cruise through majestic limestone karst islands',
      zh: '乘坐五星级豪华邮轮，穿梭于壮丽的喀斯特石灰岩群岛之间',
      ko: '웅장한 석회암 섬들을 지나는 5성급 럭셔리 크루즈를 경험해보세요',
      ja: '5つ星クルーズで壮大なハロン湾の島々を贅沢に巡る'
    },
    ctaText: { vi: 'Khám Phá Tour Hạ Long', en: 'Explore Ha Long Tours', zh: '探索下龙湾行程', ko: '하롱베이 투어 탐색', ja: 'ハロン湾ツアーを見る' },
    ctaLink: '/tours',
  },
  {
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600',
    title: {
      vi: 'Nghỉ Dưỡng Biển Đà Nẵng & Hội An',
      en: '5-Star Luxury Resort in Da Nang & Hoi An',
      zh: '岘港与会安五星级海滨度假',
      ko: '다낭 & 호이안 5성급 럭셔리 휴양',
      ja: 'ダナン＆ホイアン極上リゾート'
    },
    subtitle: {
      vi: 'Tận hưởng khoảnh khắc tại Cầu Vàng Bà Nà Hills & Phố Cổ lung linh',
      en: 'Enjoy breathtaking moments at Golden Bridge Ba Na Hills & romantic Hoi An',
      zh: '尽情享用巴拿山黄金桥与会安古镇浪漫夜景的绝美时光',
      ko: '바나힐 골든브릿지와 환상적인 호이안에서 특별한 순간을 즐기세요',
      ja: 'バーナーヒルズの Golden Bridge と幻想的なホイアンの夜景を満喫'
    },
    ctaText: { vi: 'Đặt Khách Sạn Đà Nẵng', en: 'Book Da Nang Hotels', zh: '预订岘港酒店', ko: '다낭 호텔 예약', ja: 'ダナンのホテルを予約' },
    ctaLink: '/hotels',
  },
  {
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600',
    title: {
      vi: 'Phú Quốc – Đảo Ngọc Thiên Đường',
      en: 'Phu Quoc – Tropical Island Paradise',
      zh: '富国岛 – 热带天堂珍珠岛',
      ko: '푸꾸옥 – 천국의 파라다이스 섬',
      ja: 'フーコック島 – 楽園のトロピカルアイランド'
    },
    subtitle: {
      vi: 'Bãi biển cát trắng mịn, lặn ngắm san hô & VinWonders sôi động',
      en: 'Pristine white sand beaches, coral reef snorkeling & VinWonders',
      zh: '细白沙滩、浮潜观赏珊瑚及体验精彩纷呈的 VinWonders 主题乐园',
      ko: '하얀 모래사장, 산호초 스노클링 및 활기찬 빈원더스 테마파크 체험',
      ja: '白砂のビーチ、珊瑚礁スノーケリング、人気のテーマパークVinWondersを満喫'
    },
    ctaText: { vi: 'Săn Deal Phú Quốc', en: 'Phu Quoc Deals', zh: '特惠富国岛', ko: '푸꾸옥 딜 보기', ja: 'フーコック島プラン' },
    ctaLink: '/tours',
  },
];

const fetchHeroBanners = async () => {
  try {
    const res: any = await api.get('/settings/hero_banners');
    if (res?.value && Array.isArray(res.value) && res.value.length > 0) {
      return res.value;
    }
  } catch (err) {
    // fallback
  }
  return DEFAULT_SLIDES;
};

export default function HeroBanner() {
  const locale = useParams().locale as string;
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slides = DEFAULT_SLIDES } = useQuery({
    queryKey: ['hero-banners-setting'],
    queryFn: fetchHeroBanners,
  });

  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  const current = slides[currentSlide] || slides[0] || DEFAULT_SLIDES[0];

  const titleText = getI18nText(current.title, locale) || 'Khám Phá Cùng Travel';
  const subtitleText = getI18nText(current.subtitle, locale) || 'Trải nghiệm những chuyến đi tuyệt vời';
  const ctaText = getI18nText(current.ctaText, locale) || 'Khám Phá Ngay';

  const getLink = (rawLink?: string) => {
    if (!rawLink) return `/${locale}/tours`;
    if (rawLink.startsWith('http')) return rawLink;
    if (rawLink.startsWith('/')) {
      if (rawLink.startsWith(`/${locale}`)) return rawLink;
      return `/${locale}${rawLink}`;
    }
    return `/${locale}/${rawLink}`;
  };

  return (
    <section className="relative w-full h-[65vh] md:h-[82vh] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={current.image || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600'}
            alt={titleText}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600';
            }}
            className="w-full h-full object-cover"
          />
          {/* Gradient Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Overlay */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center flex flex-col items-center max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight leading-tight drop-shadow-lg">
              {titleText}
            </h1>

            <p className="text-sm md:text-xl text-blue-100 mb-8 font-light max-w-2xl drop-shadow-md">
              {subtitleText}
            </p>

            <Link href={getLink(current.ctaLink)}>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base md:text-lg px-8 py-4 rounded-full shadow-2xl shadow-blue-900/60 hover:shadow-blue-900/90 hover:-translate-y-0.5 transition-all flex items-center gap-2 group">
                <span>{ctaText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </section>
  );
}
