import { Request, Response } from 'express';
import Setting from '../models/Setting';

export const getAll = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getByKey = async (req: Request, res: Response) => {
  try {
    let setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      if (req.params.key === 'hero_banners') {
        const defaultSlides = [
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
              ja: 'バーナーヒルズの Golden Bridge と幻想적인 ホイアンの夜景を満喫'
            },
            ctaText: { vi: 'Đặt Khách Sạn Đà Nẵng', en: 'Book Da Nang Hotels', zh: '预订岘港酒店', ko: '다낭 호텔 예약', ja: 'ダナンのホテルを予約' },
            ctaLink: '/hotels',
          }
        ];
        setting = await Setting.create({ key: 'hero_banners', group: 'homepage', value: defaultSlides });
      } else if (req.params.key === 'site_info') {
        setting = await Setting.create({
          key: 'site_info',
          group: 'general',
          value: {
            siteName: 'Travel Booking',
            hotline: '1800 646 888',
            email: 'support@travel.com',
            address: {
              vi: '168 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng',
              en: '168 Nguyen Van Linh, Thanh Khe, Da Nang',
              zh: '岘港市清溪郡阮文灵路168号',
              ko: '다낭시 탄케구 응우옌반린 168번지',
              ja: 'ダナン市タケー区グエンバンリン168番地',
            }
          }
        });
      } else {
        return res.status(404).json({ message: 'Setting not found' });
      }
    }
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsert = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { ...req.body, key },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const seedMultiLang = async (_req: Request, res: Response) => {
  try {
    const slides = [
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
          ja: 'バーナーヒルズの Golden Bridge と幻想적인 ホイアンの夜景を満喫'
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

    const heroSetting = await Setting.findOneAndUpdate(
      { key: 'hero_banners' },
      { key: 'hero_banners', group: 'homepage', value: slides },
      { new: true, upsert: true }
    );

    const address = {
      vi: '168 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng',
      en: '168 Nguyen Van Linh, Thanh Khe, Da Nang',
      zh: '岘港市清溪郡阮文灵路168号',
      ko: '다낭시 탄케구 응우옌반린 168번지',
      ja: 'ダナン市タケー区グエンバンリン168番地',
    };

    const siteInfoSetting = await Setting.findOneAndUpdate(
      { key: 'site_info' },
      {
        key: 'site_info',
        group: 'general',
        value: {
          siteName: 'Travel Booking',
          hotline: '1800 646 888',
          email: 'support@travel.com',
          address
        }
      },
      { new: true, upsert: true }
    );

    res.json({ message: 'Seeded multi-language hero banners & site_info successfully!', heroSetting, siteInfoSetting });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
