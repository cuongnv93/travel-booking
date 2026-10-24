import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Tour from '../models/Tour';
import News from '../models/News';
import Hotel from '../models/Hotel';
import Specialty from '../models/Specialty';
import Page from '../models/Page';
import Setting from '../models/Setting';
import Flight from '../models/Flight';
import { constants } from '../config/constants';

dotenv.config();

const createI18n = (vi: string, en: string, zh = '', ko = '', ja = '') => ({
  vi,
  en: en || vi,
  zh: zh || '',
  ko: ko || '',
  ja: ja || '',
});

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const seedDataInternal = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already contains data. Dropping database for re-seed...');
      if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    }

    console.log('Seeding initial data into database...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const userPass = await bcrypt.hash('user123', salt);

    await User.create([
      { name: 'Admin User', email: 'admin@travel.com', password: adminPass, role: 'admin' },
      { name: 'Regular User', email: 'user@travel.com', password: userPass, role: 'user' }
    ]);

    // ========== TOURS (9 tours) ==========
    await Tour.create([
      {
        slug: 'ho-guom-hanoi',
        title: createI18n('Hồ Gươm & Phố Cổ Hà Nội', 'Hoan Kiem Lake & Old Quarter Hanoi'),
        description: createI18n(
          'Khám phá trái tim của thủ đô ngàn năm văn hiến. Thăm Hồ Gươm thơ mộng, Đền Ngọc Sơn huyền bí, và dạo bộ qua 36 phố phường cổ kính với vô số món ăn đặc sản Hà Nội.',
          'Discover the heart of the thousand-year-old capital. Visit the romantic Hoan Kiem Lake, the mystical Ngoc Son Temple, and stroll through the ancient 36 Streets.'
        ),
        images: [
          'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
          'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        ],
        price: 1500000,
        originalPrice: 2000000,
        duration: 2,
        destination: 'Hà Nội',
        highlights: [
          createI18n('Cầu Thê Húc & Đền Ngọc Sơn', 'The Huc Bridge & Ngoc Son Temple'),
          createI18n('Phố cổ 36 phường Hà Nội', 'Hanoi 36 Ancient Streets'),
          createI18n('Ăn tối phố đi bộ Hồ Gươm', 'Dinner at Hoan Kiem Walking Street'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Hồ Gươm & Đền Ngọc Sơn', 'Day 1: Hoan Kiem & Ngoc Son'), description: createI18n('Sáng: Đón đoàn tại sân bay, nhận phòng khách sạn. Chiều: Tham quan Hồ Gươm, Đền Ngọc Sơn, Cầu Thê Húc. Tối: Ăn tối phố đi bộ.', 'Morning: Airport pickup, hotel check-in. Afternoon: Hoan Kiem Lake, Ngoc Son Temple tour. Evening: Walking street dinner.') },
          { title: createI18n('Ngày 2: Phố Cổ & Văn Miếu', 'Day 2: Old Quarter & Temple of Literature'), description: createI18n('Sáng: Thăm Văn Miếu - Quốc Tử Giám, Lăng Bác. Chiều: Dạo phố cổ mua sắm. Trả phòng và tiễn đoàn.', 'Morning: Temple of Literature, Ho Chi Minh Mausoleum. Afternoon: Old Quarter shopping. Check-out and departure.') },
        ],
        maxGuests: 20,
        category: 'city-tour',
        isFeatured: true,
        rating: 4.8,
        reviewCount: 124,
        departureDates: [
          { date: new Date('2026-09-01'), price: 1500000, availableSlots: 15 },
          { date: new Date('2026-09-15'), price: 1500000, availableSlots: 18 },
          { date: new Date('2026-10-01'), price: 1700000, availableSlots: 20 },
        ]
      },
      {
        slug: 'da-nang-ba-na-hills',
        title: createI18n('Đà Nẵng – Bà Nà Hills – Hội An', 'Da Nang – Ba Na Hills – Hoi An'),
        description: createI18n(
          'Hành trình khám phá 3 viên ngọc của miền Trung: Thành phố biển Đà Nẵng năng động, Bà Nà Hills huyền ảo trên đỉnh núi và Phố cổ Hội An lung linh về đêm.',
          'Journey through 3 gems of Central Vietnam: vibrant Da Nang beach city, mystical Ba Na Hills mountain resort, and glowing Hoi An Ancient Town at night.'
        ),
        images: [
          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        ],
        price: 4200000,
        originalPrice: 5500000,
        duration: 4,
        destination: 'Đà Nẵng',
        highlights: [
          createI18n('Cầu Vàng Bà Nà Hills', 'Golden Bridge Ba Na Hills'),
          createI18n('Phố cổ Hội An về đêm', 'Hoi An Ancient Town at night'),
          createI18n('Bãi biển Mỹ Khê thơ mộng', 'Romantic My Khe Beach'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Bay đến Đà Nẵng', 'Day 1: Arrival in Da Nang'), description: createI18n('Đón sân bay, nhận phòng resort ven biển. Chiều tắm biển Mỹ Khê.', 'Airport pickup, beach resort check-in. Afternoon swimming at My Khe Beach.') },
          { title: createI18n('Ngày 2: Bà Nà Hills', 'Day 2: Ba Na Hills'), description: createI18n('Cáp treo lên Bà Nà Hills, tham quan Cầu Vàng, Làng Pháp, Fantasy Park. Tối về Đà Nẵng xem Cầu Rồng phun lửa.', 'Cable car to Ba Na Hills, Golden Bridge, French Village, Fantasy Park. Evening Dragon Bridge show.') },
          { title: createI18n('Ngày 3: Hội An', 'Day 3: Hoi An'), description: createI18n('Thăm Phố cổ Hội An, Chùa Cầu Nhật Bản, làng rau Trà Quế. Tối đèn lồng lung linh trên sông Hoài.', 'Hoi An Ancient Town, Japanese Bridge, Tra Que vegetable village. Evening lantern release on Hoai River.') },
          { title: createI18n('Ngày 4: Mua sắm & Bay về', 'Day 4: Shopping & Departure'), description: createI18n('Sáng tự do mua sắm. Trưa trả phòng, tiễn sân bay.', 'Free morning for shopping. Noon check-out and airport transfer.') },
        ],
        maxGuests: 15,
        category: 'beach',
        isFeatured: true,
        rating: 4.9,
        reviewCount: 256,
        departureDates: [
          { date: new Date('2026-09-05'), price: 4200000, availableSlots: 12 },
          { date: new Date('2026-09-20'), price: 4500000, availableSlots: 8 },
          { date: new Date('2026-10-10'), price: 4200000, availableSlots: 15 },
        ]
      },
      {
        slug: 'ban-gioc-cao-bang',
        title: createI18n('Thác Bản Giốc – Động Ngườm Ngao', 'Ban Gioc Waterfall – Nguom Ngao Cave'),
        description: createI18n(
          'Chinh phục vẻ đẹp hùng vĩ nhất của Đông Bắc Việt Nam. Thác Bản Giốc – thác nước đẹp nhất Việt Nam trên biên giới Việt-Trung, và Động Ngườm Ngao kỳ vĩ ẩn sâu trong lòng núi.',
          'Conquer the most majestic beauty of Northeast Vietnam. Ban Gioc Waterfall – the most beautiful waterfall in Vietnam on the Vietnam-China border, and the magnificent Nguom Ngao Cave.'
        ),
        images: [
          'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        ],
        price: 2800000,
        originalPrice: 3200000,
        duration: 3,
        destination: 'Cao Bằng',
        highlights: [
          createI18n('Thác Bản Giốc – thác đôi lớn nhất Đông Nam Á', 'Ban Gioc – largest twin waterfall in Southeast Asia'),
          createI18n('Động Ngườm Ngao huyền bí', 'Mystical Nguom Ngao Cave'),
          createI18n('Hồ Thang Hen cảnh quan tuyệt đẹp', 'Stunning Thang Hen Lake landscape'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Hà Nội – Cao Bằng', 'Day 1: Hanoi to Cao Bang'), description: createI18n('Xe khởi hành từ Hà Nội, đến Cao Bằng buổi trưa. Chiều thăm Hồ Thang Hen.', 'Bus departure from Hanoi, arrive Cao Bang at noon. Afternoon visit Thang Hen Lake.') },
          { title: createI18n('Ngày 2: Thác Bản Giốc – Động Ngườm Ngao', 'Day 2: Ban Gioc Waterfall & Cave'), description: createI18n('Sáng tham quan Thác Bản Giốc, đi bè tre ngắm thác gần. Chiều khám phá Động Ngườm Ngao.', 'Morning Ban Gioc Waterfall tour, bamboo raft trip to view falls up close. Afternoon Nguom Ngao Cave exploration.') },
          { title: createI18n('Ngày 3: Trở về Hà Nội', 'Day 3: Return to Hanoi'), description: createI18n('Sáng thăm Pác Bó di tích lịch sử Bác Hồ. Trưa về Hà Nội.', 'Morning Pac Bo historical site. Noon return to Hanoi.') },
        ],
        maxGuests: 20,
        category: 'nature',
        isFeatured: true,
        rating: 4.7,
        reviewCount: 89,
        departureDates: [
          { date: new Date('2026-09-12'), price: 2800000, availableSlots: 18 },
          { date: new Date('2026-10-03'), price: 2800000, availableSlots: 20 },
        ]
      },
      {
        slug: 'phu-quoc-paradise',
        title: createI18n('Phú Quốc – Đảo Ngọc Thiên Đường', 'Phu Quoc – Paradise Island'),
        description: createI18n(
          'Khám phá hòn đảo xinh đẹp nhất Việt Nam với bãi biển cát trắng mịn, nước biển trong xanh như ngọc bích. Thăm VinWonders, lặn ngắm san hô, thưởng thức hải sản tươi ngon.',
          'Discover Vietnam\'s most beautiful island with white sandy beaches and crystal clear emerald waters. Visit VinWonders, go coral snorkeling, enjoy fresh seafood.'
        ),
        images: [
          'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
          'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
        ],
        price: 5500000,
        originalPrice: 7000000,
        duration: 4,
        destination: 'Phú Quốc',
        highlights: [
          createI18n('Bãi Sao – bãi biển đẹp nhất Phú Quốc', 'Sao Beach – most beautiful beach in Phu Quoc'),
          createI18n('VinWonders & Cáp treo ra đảo', 'VinWonders & Cable car to island'),
          createI18n('Lặn ngắm san hô biển Nam', 'Southern sea coral snorkeling'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Bay đến Phú Quốc', 'Day 1: Fly to Phu Quoc'), description: createI18n('Bay từ Hà Nội/HCM. Nhận phòng resort 5 sao. Chiều nghỉ ngơi và tắm biển.', 'Flight from Hanoi/HCM. 5-star resort check-in. Afternoon relax and beach swimming.') },
          { title: createI18n('Ngày 2: Tour đảo phía Nam', 'Day 2: South Island Tour'), description: createI18n('Thăm Bãi Sao, Hồ Tiêu, Dinh Cậu. Tối chợ đêm Phú Quốc thưởng thức hải sản.', 'Visit Sao Beach, Pepper Farm, Dinh Cau. Evening Phu Quoc Night Market for seafood.') },
          { title: createI18n('Ngày 3: VinWonders & Cáp Treo', 'Day 3: VinWonders & Cable Car'), description: createI18n('Cả ngày vui chơi tại VinWonders. Cáp treo qua biển ra đảo Hòn Thơm.', 'Full day at VinWonders. Cable car across the sea to Hon Thom Island.') },
          { title: createI18n('Ngày 4: Lặn Biển & Bay Về', 'Day 4: Snorkeling & Departure'), description: createI18n('Sáng lặn ngắm san hô An Thới. Trưa trả phòng, bay về.', 'Morning An Thoi coral snorkeling. Noon checkout and flight home.') },
        ],
        maxGuests: 18,
        category: 'beach',
        isFeatured: true,
        rating: 4.9,
        reviewCount: 312,
        departureDates: [
          { date: new Date('2026-09-07'), price: 5500000, availableSlots: 10 },
          { date: new Date('2026-09-21'), price: 5500000, availableSlots: 14 },
          { date: new Date('2026-10-05'), price: 6000000, availableSlots: 18 },
        ]
      },
      {
        slug: 'sapa-fansipan',
        title: createI18n('Sa Pa – Fansipan – Nóc nhà Đông Dương', 'Sa Pa – Fansipan – Roof of Indochina'),
        description: createI18n(
          'Chinh phục đỉnh Fansipan 3143m – nóc nhà của Đông Dương bằng cáp treo hiện đại. Dạo bộ qua những thửa ruộng bậc thang xanh mướt, gặp gỡ đồng bào dân tộc H\'Mông, Dao đỏ.',
          'Conquer Fansipan peak 3143m – the Roof of Indochina via modern cable car. Trek through lush rice terraces, meet H\'Mong and Red Dao ethnic minorities.'
        ),
        images: [
          'https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=800',
          'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=800',
        ],
        price: 3800000,
        originalPrice: 4500000,
        duration: 3,
        destination: 'Sa Pa',
        highlights: [
          createI18n('Cáp treo Fansipan 3143m', 'Fansipan Cable Car 3143m'),
          createI18n('Ruộng bậc thang Mù Cang Chải', 'Mu Cang Chai Rice Terraces'),
          createI18n('Bản làng dân tộc thiểu số', 'Ethnic minority villages'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Hà Nội – Sa Pa', 'Day 1: Hanoi – Sa Pa'), description: createI18n('Xe Limousine từ Hà Nội đến Sa Pa. Chiều thăm bản Cát Cát của người H\'Mông.', 'Limousine from Hanoi to Sa Pa. Afternoon visit Cat Cat village of H\'Mong people.') },
          { title: createI18n('Ngày 2: Fansipan', 'Day 2: Fansipan Peak'), description: createI18n('Sáng cáp treo lên đỉnh Fansipan, tham quan các điểm nhìn hùng vĩ. Chiều thăm ruộng bậc thang.', 'Morning cable car to Fansipan summit, panoramic viewpoints. Afternoon rice terrace trek.') },
          { title: createI18n('Ngày 3: Bản Làng & Về Hà Nội', 'Day 3: Villages & Return'), description: createI18n('Sáng thăm bản làng người Dao Đỏ, chợ phiên Sa Pa. Chiều về Hà Nội.', 'Morning Red Dao village, Sa Pa market. Afternoon return to Hanoi.') },
        ],
        maxGuests: 16,
        category: 'nature',
        isFeatured: false,
        rating: 4.6,
        reviewCount: 178,
        departureDates: [
          { date: new Date('2026-09-13'), price: 3800000, availableSlots: 14 },
          { date: new Date('2026-10-11'), price: 3800000, availableSlots: 16 },
        ]
      },
      {
        slug: 'ha-long-bay',
        title: createI18n('Vịnh Hạ Long – Kỳ quan thiên nhiên thế giới', 'Ha Long Bay – World Natural Wonder'),
        description: createI18n(
          'Du thuyền trên vịnh Hạ Long – Di sản thiên nhiên thế giới UNESCO với hơn 1600 hòn đảo đá vôi kỳ vĩ. Khám phá hang động, chèo kayak, tắm biển tại vịnh Lan Hạ hoang sơ.',
          'Cruise Ha Long Bay – UNESCO World Natural Heritage with over 1600 magnificent limestone islands. Explore caves, kayak, swim at pristine Lan Ha Bay.'
        ),
        images: [
          'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
          'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        ],
        price: 3200000,
        originalPrice: 4000000,
        duration: 2,
        destination: 'Hạ Long',
        highlights: [
          createI18n('Du thuyền 5 sao trên vịnh Hạ Long', '5-star cruise on Ha Long Bay'),
          createI18n('Chèo kayak vịnh Lan Hạ', 'Kayaking in Lan Ha Bay'),
          createI18n('Khám phá hang Thiên Cung', 'Thien Cung Cave exploration'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Hà Nội – Hạ Long', 'Day 1: Hanoi – Ha Long'), description: createI18n('Xe đưa đón từ Hà Nội. Lên du thuyền, check-in phòng cabin. Khám phá hang động Thiên Cung, tắm biển, chèo kayak vịnh Lan Hạ. Tối tiệc hải sản trên thuyền.', 'Transfer from Hanoi. Board cruise, cabin check-in. Thien Cung Cave, swimming, Lan Ha Bay kayaking. Evening seafood dinner on boat.') },
          { title: createI18n('Ngày 2: Sáng sớm & Về Hà Nội', 'Day 2: Sunrise & Return'), description: createI18n('Sáng sớm ngắm bình minh trên vịnh. Tai chi trên boong. Buffet sáng. Trả phòng cabin, về Hà Nội buổi trưa.', 'Early morning bay sunrise viewing. Tai chi on deck. Breakfast buffet. Cabin checkout, return to Hanoi at noon.') },
        ],
        maxGuests: 24,
        category: 'nature',
        isFeatured: true,
        rating: 4.8,
        reviewCount: 421,
        departureDates: [
          { date: new Date('2026-09-06'), price: 3200000, availableSlots: 22 },
          { date: new Date('2026-09-20'), price: 3200000, availableSlots: 20 },
          { date: new Date('2026-10-04'), price: 3500000, availableSlots: 24 },
        ]
      },
      {
        slug: 'hue-culture-tour',
        title: createI18n('Cố Đô Huế – Di sản Văn hóa Thế giới', 'Hue Imperial City – World Cultural Heritage'),
        description: createI18n(
          'Khám phá kinh đô cuối cùng của triều Nguyễn – Di sản Văn hóa Thế giới UNESCO. Thăm Đại Nội, lăng tẩm vua chúa, chùa Thiên Mụ, thưởng thức ẩm thực cung đình tinh tế.',
          'Explore the last imperial capital of the Nguyen dynasty – UNESCO World Cultural Heritage. Visit Imperial Citadel, royal tombs, Thien Mu Pagoda, and enjoy refined royal cuisine.'
        ),
        images: [
          'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
          'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
        ],
        price: 2500000,
        originalPrice: 3000000,
        duration: 3,
        destination: 'Huế',
        highlights: [
          createI18n('Đại Nội Huế – Cố đô triều Nguyễn', 'Hue Imperial Citadel – Nguyen Dynasty capital'),
          createI18n('Lăng Minh Mạng & Tự Đức', 'Minh Mang & Tu Duc Royal Tombs'),
          createI18n('Ẩm thực cung đình Huế', 'Hue royal imperial cuisine'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Đến Huế', 'Day 1: Arrival in Hue'), description: createI18n('Bay hoặc tàu đến Huế. Chiều thăm chùa Thiên Mụ, sông Hương. Tối thưởng thức ẩm thực Huế.', 'Fly or train to Hue. Afternoon Thien Mu Pagoda, Perfume River. Evening Hue cuisine dining.') },
          { title: createI18n('Ngày 2: Đại Nội & Lăng Tẩm', 'Day 2: Imperial Citadel & Tombs'), description: createI18n('Sáng Đại Nội Huế. Chiều thăm lăng Minh Mạng và lăng Tự Đức. Tối thuyền rồng trên sông Hương với ca Huế.', 'Morning Imperial Citadel. Afternoon Minh Mang and Tu Duc tombs. Evening dragon boat with Hue music.') },
          { title: createI18n('Ngày 3: Mua Sắm & Về', 'Day 3: Shopping & Departure'), description: createI18n('Sáng thăm chợ Đông Ba, mua đặc sản Huế. Trưa trả phòng, về.', 'Morning Dong Ba Market, buy Hue specialties. Noon checkout and departure.') },
        ],
        maxGuests: 20,
        category: 'culture',
        isFeatured: false,
        rating: 4.7,
        reviewCount: 143,
        departureDates: [
          { date: new Date('2026-09-08'), price: 2500000, availableSlots: 18 },
          { date: new Date('2026-10-06'), price: 2500000, availableSlots: 20 },
        ]
      },
      {
        slug: 'nha-trang-diving',
        title: createI18n('Nha Trang – Thành phố Biển & Lặn San Hô', 'Nha Trang – Beach City & Coral Diving'),
        description: createI18n(
          'Nha Trang – thành phố biển quyến rũ với 6km bờ biển trải dài. Lặn ngắm san hô tuyệt đẹp, thăm tháp Chăm Po Nagar hàng nghìn năm tuổi và vui chơi tại Vinpearl Land.',
          'Nha Trang – charming beach city with 6km of coastline. Go coral diving, visit the thousand-year-old Po Nagar Cham Towers, and have fun at Vinpearl Land.'
        ),
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
        ],
        price: 4800000,
        originalPrice: 6000000,
        duration: 4,
        destination: 'Nha Trang',
        highlights: [
          createI18n('Lặn ngắm san hô Hòn Mun', 'Hon Mun coral diving'),
          createI18n('Vinpearl Land & cáp treo biển', 'Vinpearl Land & sea cable car'),
          createI18n('Tháp Chăm Po Nagar cổ kính', 'Ancient Po Nagar Cham Towers'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Đến Nha Trang', 'Day 1: Arrival'), description: createI18n('Bay đến Nha Trang, nhận phòng khách sạn ven biển. Chiều tắm biển trần Phú.', 'Fly to Nha Trang, beach hotel check-in. Afternoon Tran Phu Beach swimming.') },
          { title: createI18n('Ngày 2: Tour 4 Đảo', 'Day 2: 4 Islands Tour'), description: createI18n('Cả ngày tour 4 đảo: Hòn Tằm, Hòn Miễu, Hòn Mun (lặn san hô), Hòn Một. Tiệc buffet trên biển.', 'Full day 4-island tour: Hon Tam, Hon Mieu, Hon Mun (coral diving), Hon Mot. Floating buffet lunch.') },
          { title: createI18n('Ngày 3: Vinpearl Land', 'Day 3: Vinpearl Land'), description: createI18n('Cáp treo biển ra đảo Hòn Tre, cả ngày vui chơi Vinpearl Land, Aquarium, Water Park.', 'Cable car to Hon Tre Island, full day Vinpearl Land, Aquarium, Water Park.') },
          { title: createI18n('Ngày 4: Tháp Chăm & Về', 'Day 4: Cham Towers & Departure'), description: createI18n('Sáng thăm Tháp Chăm Po Nagar, Suối khoáng nóng I-Resort. Chiều bay về.', 'Morning Po Nagar Cham Towers, I-Resort hot spring. Afternoon flight home.') },
        ],
        maxGuests: 20,
        category: 'beach',
        isFeatured: false,
        rating: 4.8,
        reviewCount: 267,
        departureDates: [
          { date: new Date('2026-09-14'), price: 4800000, availableSlots: 16 },
          { date: new Date('2026-10-12'), price: 4800000, availableSlots: 20 },
        ]
      },
      {
        slug: 'saigon-mekong-delta',
        title: createI18n('Sài Gòn – Miền Tây Sông Nước', 'Saigon – Mekong Delta'),
        description: createI18n(
          'Khám phá thành phố năng động Sài Gòn và trải nghiệm cuộc sống miền Tây sông nước với chợ nổi Cái Bè, vườn trái cây, nghe đờn ca tài tử Nam Bộ và làm bánh tráng truyền thống.',
          'Discover vibrant Saigon and experience Mekong Delta water life with Cai Be floating market, fruit orchards, Nam Bo folk music, and traditional rice paper making.'
        ),
        images: [
          'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
          'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=800',
        ],
        price: 2200000,
        originalPrice: 2800000,
        duration: 3,
        destination: 'TP. Hồ Chí Minh',
        highlights: [
          createI18n('Chợ nổi Cái Bè miền Tây', 'Cai Be floating market, Mekong Delta'),
          createI18n('Vườn trái cây nhiệt đới', 'Tropical fruit orchards'),
          createI18n('Địa đạo Củ Chi lịch sử', 'Cu Chi Tunnels historical site'),
        ],
        itinerary: [
          { title: createI18n('Ngày 1: Sài Gòn', 'Day 1: Saigon'), description: createI18n('Thăm Dinh Độc Lập, Bảo tàng Chiến tích Chiến tranh, Nhà thờ Đức Bà, Chợ Bến Thành.', 'Reunification Palace, War Remnants Museum, Notre-Dame Cathedral, Ben Thanh Market.') },
          { title: createI18n('Ngày 2: Miền Tây Sông Nước', 'Day 2: Mekong Delta'), description: createI18n('Xuống thuyền khám phá chợ nổi Cái Bè, vườn cây ăn trái, nghe đờn ca tài tử. Nghỉ đêm tại nhà vườn.', 'Boat trip to Cai Be floating market, fruit orchard visit, Nam Bo folk music. Overnight at garden house.') },
          { title: createI18n('Ngày 3: Địa Đạo Củ Chi & Về', 'Day 3: Cu Chi Tunnels & Departure'), description: createI18n('Thăm Địa đạo Củ Chi. Chiều trả phòng, sân bay.', 'Cu Chi Tunnels visit. Afternoon checkout and airport transfer.') },
        ],
        maxGuests: 22,
        category: 'culture',
        isFeatured: false,
        rating: 4.6,
        reviewCount: 195,
        departureDates: [
          { date: new Date('2026-09-10'), price: 2200000, availableSlots: 20 },
          { date: new Date('2026-10-08'), price: 2200000, availableSlots: 22 },
        ]
      },
    ]);

    // ========== NEWS (9 comprehensive articles with full 5-language SEO support) ==========
    await News.create([
      {
        slug: "kinh-nghiem-du-lich-ha-noi-2026",
        title: {
                  "vi": "Cẩm nang du lịch Hà Nội tự túc 2026: Lịch trình 3N2Đ, ăn gì, ở đâu và chi phí từ A-Z",
                  "en": "Complete Hanoi Travel Guide 2026: 3D2N Itinerary, Food Map & Budget Tips",
                  "zh": "2026年河内自由行终极攻略：3天2晚经典行程、必尝美食与住宿省钱秘籍",
                  "ko": "2026 하노이 자유여행 완벽 가이드: 3박4일 추천 코스, 맛집 지도 & 알뜰 팁",
                  "ja": "2026年ハノイ個人旅行完全ガイド：おすすめ2泊3日モデルコース・絶品グルメ・宿泊エリア徹底解説"
        },
        excerpt: {
                  "vi": "Tổng hợp trọn bộ kinh nghiệm du lịch Hà Nội tự túc 2026 mới nhất: cách di chuyển, lịch trình khám phá 36 phố phường, thưởng thức phở Bát Đàn, cà phê trứng và dự toán chi phí chi tiết.",
                  "en": "Comprehensive 2026 Hanoi travel handbook: transport guide, 36 old quarter walking routes, iconic egg coffee tasting, and transparent budget calculations.",
                  "zh": "2026最新河内旅游手册：从三十六行街漫步、文庙访古，到品味百年传承生牛肉河粉与蛋咖啡，全方位解析自由行精髓。",
                  "ko": "하노이 여행의 모든 것: 36거리 골목 탐방, 호안끼엠 호수 산책, 백년 전통 에그커피와 쌀국수 맛집, 실전 여행 경비 총정리.",
                  "ja": "ハノイ旧市街の散策から世界遺産タンロン遺跡、絶品フォーやエッグコーヒーの名店まで、初めてのハノイ旅行に役立つ実践情報を完全網羅。"
        },
        content: {
                  "vi": "\n<h2>1. Giới thiệu tổng quan về du lịch Hà Nội – Trái tim ngàn năm văn hiến</h2>\n<p>Hà Nội, thủ đô nghìn năm tuổi của Việt Nam, luôn là điểm dừng chân không thể thiếu trong hành trình khám phá đất nước hình chữ S. Nơi đây quyến rũ du khách bởi sự giao thoa hài hòa giữa nét cổ kính rêu phong của 36 phố phường, kiến trúc Pháp cổ điển thanh lịch và nhịp sống đô thị hiện đại, sôi động bậc nhất.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1528127269322-539801943592?w=1200\" alt=\"Hồ Gươm Hà Nội và Tháp Rùa cổ kính sớm mai\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Hồ Hoàn Kiếm thơ mộng – Biểu tượng văn hóa trường tồn của thủ đô Hà Nội</figcaption>\n</figure>\n\n<h2>2. Thời điểm lý tưởng nhất để du lịch Hà Nội</h2>\n<p>Mỗi mùa Hà Nội lại khoác lên mình một tấm áo riêng, nhưng thời điểm đẹp và lãng mạn nhất chính là <strong>mùa thu (từ tháng 9 đến tháng 11)</strong>. Tiết trời lúc này mát mẻ, nắng hanh vàng dịu nhẹ, thoang thoảng hương hoa sữa nồng nàn và cốm non Làng Vòng xanh mướt. Ngoài ra, mùa xuân từ tháng 2 đến tháng 4 cũng là mùa của lễ hội và muôn hoa đua nở trên các nẻo đường phố cổ.</p>\n\n<h2>3. Hướng dẫn di chuyển đến và đi lại trong Hà Nội</h2>\n<div class=\"p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl my-4 text-slate-800 text-sm\">\n  <strong>Mẹo di chuyển tiết kiệm:</strong> Từ sân bay Quốc tế Nội Bài về trung tâm Phố Cổ, bạn có thể bắt xe buýt chất lượng cao tuyến số 86 với giá chỉ 35.000 VNĐ/lượt hoặc đặt xe công nghệ Grab khoảng 250.000 – 300.000 VNĐ.\n</div>\n<ul>\n  <li><strong>Thuê xe máy:</strong> Giá từ 100.000 – 150.000 VNĐ/ngày, thích hợp cho các bạn trẻ thích tự do luồn lách qua từng con ngõ nhỏ.</li>\n  <li><strong>Xe buýt City Sightseeing 2 tầng:</strong> Lựa chọn lý tưởng để ngắm toàn cảnh các danh thắng nổi tiếng như Nhà hát Lớn, Lăng Bác, Hoàng thành Thăng Long với góc nhìn từ trên cao.</li>\n  <li><strong>Xích lô phố cổ:</strong> Trải nghiệm thư thái, chậm rãi ngắm nhìn đời sống sinh hoạt thường nhật của người dân Tràng An.</li>\n</ul>\n\n<h2>4. Gợi ý lịch trình du lịch Hà Nội 3 ngày 2 đêm chuẩn nhất</h2>\n<h3>Ngày 1: Khám phá Phố Cổ – Hồ Gươm – Văn Miếu Quốc Tử Giám</h3>\n<p>Buổi sáng bắt đầu bằng một tô phở Bát Đàn nóng hổi, sau đó dạo bộ quanh Hồ Gươm, viếng đền Ngọc Sơn và chụp ảnh bên cầu Thê Húc đỏ son. Buổi chiều, ghé thăm Văn Miếu Quốc Tử Giám – trường đại học đầu tiên của Việt Nam và Nhà tù Hỏa Lò giàu giá trị lịch sử. Buổi tối, đừng quên thưởng thức một ly cà phê trứng Giảng béo ngậy và hòa mình vào không khí tấp nập tại ngã tư Tạ Hiện.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200\" alt=\"Cà phê trứng Hà Nội đặc sản thơm ngon béo ngậy\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Cà phê trứng – Tinh hoa ẩm thực sáng tạo độc đáo của người Hà Nội</figcaption>\n</figure>\n\n<h3>Ngày 2: Viếng Lăng Chủ tịch Hồ Chí Minh – Chùa Trấn Quốc – Hồ Tây lộng gió</h3>\n<p>Buổi sáng vào Lăng viếng Bác, thăm Nhà sàn, Ao cá Bác Hồ và Chùa Một Cột. Buổi chiều di chuyển ra Hồ Tây ngắm hoàng hôn đỏ rực tại bến Hàn Quốc hoặc đường Thanh Niên, ghé chùa Trấn Quốc cổ kính bậc nhất Việt Nam và thưởng thức bánh tôm Hồ Tây giòn rụm.</p>\n\n<h3>Ngày 3: Hoàng Thành Thăng Long – Mua sắm quà đặc sản</h3>\n<p>Dành buổi sáng tham quan Di sản Thế giới Hoàng thành Thăng Long, chiêm ngưỡng Cột cờ Hà Nội oai nghiêm. Buổi chiều ghé chợ Đồng Xuân hoặc phố Hàng Đường mua ô mai, bánh chè lam, trà sen Tây Hồ về làm quà cho người thân.</p>\n\n<h2>5. Bản đồ ẩm thực Hà Nội: Ăn gì ngon chuẩn vị?</h2>\n<ul>\n  <li><strong>Phở Hà Nội:</strong> Phở Bát Đàn (49 Bát Đàn), Phở Thìn (13 Lò Đúc), Phở Lý Quốc Sư.</li>\n  <li><strong>Bún chả:</strong> Bún chả Hương Liên (nơi Tổng thống Obama từng ghé thăm), Bún chả Đắc Kim Hàng Mành.</li>\n  <li><strong>Bún đậu mắm tôm:</strong> Bún đậu ngõ Tràng Tiền hoặc bún đậu Hàng Khay.</li>\n  <li><strong>Chả cá Lã Vọng:</strong> Chả cá Thăng Long (Đường Thành) với từng miếng cá lăng nướng vàng ươm ăn kèm thì là và mắm tôm đánh sủi bọt.</li>\n</ul>\n\n<h2>6. Tổng kết chi phí dự kiến cho chuyến đi</h2>\n<p>Chi phí trung bình cho chuyến du lịch Hà Nội 3N2Đ dao động từ <strong>2.500.000 – 4.000.000 VNĐ/người</strong> (đã bao gồm lưu trú khách sạn 3 sao phố cổ, ăn uống thả ga và vé tham quan). Chắc chắn thủ đô Hà Nội sẽ mang đến cho bạn những ký ức tuyệt vời và sâu đậm khó phai!</p>\n",
                  "en": "\n<h2>1. Introduction to Hanoi – Vietnam's Cultural Soul</h2>\n<p>Hanoi, the charming thousand-year-old capital of Vietnam, is a must-visit destination combining French colonial architecture, ancient temples, bustling street life, and world-renowned street food culture.</p>\n<h2>2. Best Season to Visit</h2>\n<p>Autumn (September to November) offers pleasant breezes, golden sunlight, and blooming milk flowers. Spring (February to April) is also lively with festive springtime ceremonies.</p>\n<h2>3. 3-Day Recommended Itinerary</h2>\n<p><strong>Day 1:</strong> Hoan Kiem Lake, Ngoc Son Temple, Temple of Literature, and famous street food in Hanoi Old Quarter.</p>\n<p><strong>Day 2:</strong> Ho Chi Minh Mausoleum complex, One Pillar Pagoda, Tran Quoc Pagoda on West Lake, and sunset dinner.</p>\n<p><strong>Day 3:</strong> Imperial Citadel of Thang Long, Dong Xuan Market souvenir shopping, and train street cafe experience.</p>\n<h2>4. Iconic Dishes You Cannot Miss</h2>\n<p>Pho Bo (Beef noodle soup), Bun Cha (Grilled pork noodles), Egg Coffee, and Cha Ca (Turmeric fish with dill).</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200",
        category: "experience",
        author: "Nguyễn Hương Giang",
        isPublished: true,
        publishedAt: new Date("2026-03-15T08:00:00.000Z"),
        createdAt: new Date("2026-03-15T08:00:00.000Z"),
      },
      {
        slug: "top-mon-an-da-nang-phai-thu",
        title: {
                  "vi": "Top 15 món ngon đặc sản Đà Nẵng nhất định phải thử: Bản đồ ẩm thực chuẩn vị miền Trung",
                  "en": "Top 15 Must-Try Da Nang Foods: The Ultimate Central Vietnam Gourmet Map",
                  "zh": "岘港不可错过的15大特色地道美食精选：品味最纯正的越南中部风味",
                  "ko": "다낭에서 꼭 맛봐야 할 대표 미식 TOP 15: 중부 베트남 먹방 지도",
                  "ja": "ダナン旅行で絶対に食べたい絶品ご当地グルメ15選：ベトナム中部ローカル飯徹底ガイド"
        },
        excerpt: {
                  "vi": "Khám phá thế giới ẩm thực phong phú của Đà Nẵng: từ Mì Quảng tôm thịt đậm đà, bánh tráng cuốn thịt heo hai đầu da đến hải sản tươi sống giá rẻ tại chợ hải sản ven biển.",
                  "en": "Explore the culinary wonders of Da Nang: from signature Quang noodles, pork belly rice paper rolls, to ultra-fresh coastal seafood markets.",
                  "zh": "深度探秘岘港美食天堂：广南米粉、双头肥瘦水煮猪肉米纸卷、鲜香鱼饼米线与物美价廉的生猛海鲜盛宴。",
                  "ko": "다낭의 대표 미식 총정리: 진한 육수의 미꽝, 돼지고기 라이스페이퍼 롤, 바삭한 반세오와 미케비치 신선한 해산물 맛집 완벽 가이드.",
                  "ja": "ダナンの食の魅力を満喫：名物和え麺ミークアン、豚肉のライスペーパー巻き、揚げたてバインセオから海沿いシーフードまで詳しく紹介。"
        },
        content: {
                  "vi": "\n<h2>1. Nét độc đáo của ẩm thực thành phố biển Đà Nẵng</h2>\n<p>Không chỉ nổi danh là \"thành phố đáng sống nhất Việt Nam\", Đà Nẵng còn là một thiên đường ẩm thực quyến rũ thực khách bốn phương. Ẩm thực nơi đây là sự dung hòa tinh tế giữa vị cay nồng, mặn mòi của biển cả miền Trung cùng phong cách chế biến dân dã, thơm thảo của người dân xứ Quảng.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200\" alt=\"Món ngon ẩm thực Đà Nẵng đặc sắc\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Ẩm thực Đà Nẵng – Sự kết hợp hài hòa giữa hương vị đồng nội và sản vật biển cả</figcaption>\n</figure>\n\n<h2>2. Danh sách 5 món ăn biểu tượng bạn nhất định phải thử</h2>\n<h3>1. Mì Quảng – Đậm đà phong vị xứ Quảng</h3>\n<p>Sợi mì Quảng dày, mềm mượt màu trắng gạo hoặc vàng nghệ, chan xâm xấp nước dùng nấu từ xương hầm, tôm nõn, thịt heo hoặc ức gà. Khi ăn kèm rau sống hoa chuối tươi non, bánh tráng mè nướng giòn rụm và đậu phộng rang bùi béo. <em>Địa chỉ gợi ý: Mì Quảng Bà Mua (19 Trần Bình Trọng), Mì Quảng Ếch Bếp Trang.</em></p>\n\n<h3>2. Bánh tráng cuốn thịt heo hai đầu da</h3>\n<p>Điểm làm nên sự đặc biệt của món ăn này chính là lát thịt heo luộc khéo léo để lộ hai đầu mỡ giòn trong veo. Cuốn cùng bánh tráng Đại Lộc dẻo dai, đủ loại rau thơm và chấm ngập trong chén mắm nêm đậm đà pha ớt tỏi cay xé lưỡi. <em>Địa chỉ gợi ý: Quán Trần (04 Lê Duẩn), Ẩm thực Mậu (35 Đỗ Thúc Tịnh).</em></p>\n\n<h3>3. Bún chả cá Đà Nẵng</h3>\n<p>Tô bún chả cá thơm nức với nước dùng ninh từ xương cá biển, cà chua, bí đỏ, bắp cải và thơm ngọt thanh. Chả cá gồm chả hấp và chả chiên dai giòn sần sật. <em>Địa chỉ gợi ý: Bún chả cá 109 Nguyễn Chí Thanh, Bún chả cá Bà Lữ.</em></p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200\" alt=\"Hải sản tươi sống bên bờ biển Đà Nẵng\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Hải sản Đà Nẵng tươi rói được đánh bắt trong ngày tại vùng biển Mỹ Khê</figcaption>\n</figure>\n\n<h3>4. Bánh xèo, Nem lụi giòn rụm</h3>\n<p>Bánh xèo Đà Nẵng có lớp vỏ dày vừa phải, vàng ruộm, nhân đầy ắp tôm tươi và giá đỗ. Nước chấm đi kèm là bí quyết gia truyền nấu từ gan heo, tương đậu phộng sánh mịn, béo ngậy khó cưỡng. <em>Địa chỉ gợi ý: Bánh xèo Bà Dưỡng (K280/23 Hoàng Diệu).</em></p>\n\n<h3>5. Hải sản tươi sống ven biển</h3>\n<p>Đến Đà Nẵng mà chưa ăn hải sản thì coi như chưa trọn vẹn chuyến đi. Bạn có thể tự tay chọn tôm tít, ghẹ xanh, mực cơm, chip chip hấp xả ngay tại các bể nuôi tươi rói. <em>Địa chỉ gợi ý: Hải sản Bé Mặn, Hải sản Năm Đảnh, Chợ đêm Sơn Trà.</em></p>\n",
                  "en": "\n<h2>1. The Soul of Central Vietnamese Cuisine</h2>\n<p>Da Nang is renowned worldwide not only for its stunning bridges and beaches but also as a premier culinary paradise blending spicy, savory flavors from land and sea.</p>\n<h2>2. Top Signature Dishes</h2>\n<p><strong>Mi Quang:</strong> Turmeric rice noodles with savory broth, pork, shrimp, fresh herbs, and toasted rice crackers.</p>\n<p><strong>Pork belly rolls (Banh Trang Thit Heo):</strong> Delicate pork rolls wrapped with fresh greens and dipped in aromatic fermented anchovy sauce.</p>\n<p><strong>Fish Cake Noodle Soup (Bun Cha Ca):</strong> Sweet, naturally flavored broth with steamed and fried mackerel patties.</p>\n<p><strong>Fresh Coastal Seafood:</strong> Steamed clams with lemongrass, grilled scallops with scallion oil, and tamarind crabs.</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200",
        category: "food",
        author: "Trần Minh Tuấn",
        isPublished: true,
        publishedAt: new Date("2026-03-18T09:30:00.000Z"),
        createdAt: new Date("2026-03-18T09:30:00.000Z"),
      },
      {
        slug: "phu-quoc-nen-di-mua-nao",
        title: {
                  "vi": "Du lịch Phú Quốc nên đi mùa nào đẹp nhất? Kinh nghiệm khám phá đảo ngọc 4 mùa trọn vẹn",
                  "en": "Best Time to Visit Phu Quoc Island: Comprehensive 4-Season Vacation Guide",
                  "zh": "富国岛最佳旅游时节全指南：玩转越南珍珠海岛四季风光与避雨秘籍",
                  "ko": "푸꾸옥 언제 가는 게 가장 좋을까? 사계절 날씨 분석 및 완벽 여행 가이드",
                  "ja": "フーコック島旅行のベストシーズン徹底比較：乾季と雨季の楽しみ方とおすすめスポット"
        },
        excerpt: {
                  "vi": "Giải đáp chi tiết du lịch Phú Quốc mùa nào đẹp nhất, so sánh mùa khô và mùa mưa, top bãi biển lặn ngắm san hô đẹp nhất và kinh nghiệm đặt phòng resort giá tốt.",
                  "en": "Detailed seasonal comparison for Phu Quoc: dry season vs green season, top snorkeling beaches in An Thoi archipelago, and insider resort booking tips.",
                  "zh": "深度解析富国岛气候特点：旱季碧海晴天与雨季超高性价比对比，附安泰群岛浮潜与日落海滩打卡指南。",
                  "ko": "푸꾸옥 건기와 우기 완벽 비교: 바다 상태, 안토이 군도 호핑투어, 인생 선셋 포인트 및 가성비 럭셔리 리조트 예약 꿀팁.",
                  "ja": "ベストシーズンの乾季と穴場の雨季を徹底比較。透明度抜群のシュノーケリングスポットや絶景サンセット情報もお届け。"
        },
        content: {
                  "vi": "\n<h2>1. Tổng quan khí hậu Đảo Ngọc Phú Quốc</h2>\n<p>Nằm sâu trong vịnh Thái Lan, đảo ngọc Phú Quốc được thiên nhiên ưu ái ban tặng khí hậu nhiệt đới gió mùa mát mẻ quanh năm. Khí hậu Phú Quốc chia làm 2 mùa rõ rệt: <strong>mùa khô (từ tháng 11 đến tháng 4 năm sau)</strong> và <strong>mùa mưa (từ tháng 5 đến tháng 10)</strong>.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200\" alt=\"Bãi Sao Phú Quốc bờ cát trắng mịn biển trong vắt\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Bãi Sao Phú Quốc – Một trong những bãi biển hoang sơ đẹp nhất hành tinh</figcaption>\n</figure>\n\n<h2>2. Thời điểm vàng: Mùa khô (Tháng 11 – Tháng 4)</h2>\n<p>Đây là thời gian đẹp nhất để du lịch Phú Quốc. Lúc này, hòn đảo tràn ngập ánh nắng vàng ruộm, sóng biển êm ả, nước trong xanh thấu đáy như ngọc bích. Đây là điều kiện lý tưởng cho các hoạt động:\n<ul>\n  <li>Tham gia tour cano 4 đảo, lặn ngắm san hô tự nhiên tại Hòn Móng Tay, Hòn Gầm Ghì, Hòn Mây Rút.</li>\n  <li>Trải nghiệm tuyến cáp treo vượt biển 3 dây Hòn Thơm dài nhất thế giới.</li>\n  <li>Thưởng ngoạn cảnh hoàng hôn tím huyền ảo tại Sunset Sanato hoặc OCSEN Beach Bar.</li>\n</ul>\n</p>\n\n<h2>3. Du lịch Phú Quốc mùa mưa (Tháng 5 – Tháng 10): Có nên đi không?</h2>\n<div class=\"p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl my-4 text-slate-800 text-sm\">\n  <strong>Ưu điểm mùa mưa:</strong> Giá vé máy bay và giá phòng tại các khu nghỉ dưỡng 5 sao giảm sâu tới 40% - 60%. Lượng khách không quá đông, giúp bạn tận hưởng không gian nghỉ dưỡng biệt lập, thanh bình tuyệt đối.\n</div>\n<p>Nếu đi vào mùa này, bạn nên ưu tiên tắm biển tại <strong>Bãi Sao</strong> hoặc <strong>Bãi Khem</strong> ở bờ Đông Nam đảo, vì khu vực này biển kín gió, vẫn giữ được làn nước trong xanh và êm đềm suốt mùa hè.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200\" alt=\"Hoàng hôn Phú Quốc rực rỡ buông xuống mặt biển\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Khoảnh khắc hoàng hôn lãng mạn mê đắm lòng người tại bờ Tây đảo ngọc</figcaption>\n</figure>\n\n<h2>4. Top trải nghiệm không thể bỏ lỡ tại Phú Quốc</h2>\n<ul>\n  <li><strong>Grand World – Thành phố không ngủ:</strong> Trải nghiệm du thuyền Gondola trên dòng kênh Venice lãng mạn và thưởng thức show thực cảnh \"Tinh hoa Việt Nam\".</li>\n  <li><strong>Vinpearl Safari:</strong> Công viên chăm sóc và bảo tồn động vật bán hoang dã đầu tiên và lớn nhất tại Việt Nam.</li>\n  <li><strong>Thưởng thức ẩm thực địa phương:</strong> Gỏi cá trích cuốn bánh tráng rau rừng, nhum biển nướng mỡ hành, bún quậy Kiến Xây trứ danh.</li>\n</ul>\n",
                  "en": "\n<h2>1. Climate Overview of Phu Quoc</h2>\n<p>Located in the Gulf of Thailand, Phu Quoc features a tropical monsoon climate with two distinct seasons: the Dry Season (Nov to Apr) and the Green/Rainy Season (May to Oct).</p>\n<h2>2. The Peak Dry Season (November – April)</h2>\n<p>Calm azure waters, low humidity, and endless sunshine make this period perfect for island hopping, coral reef snorkeling, and cable car rides to Hon Thom.</p>\n<h2>3. Why Visit During Green Season?</h2>\n<p>Enjoy luxury 5-star oceanfront resorts at 40-50% discounts with peaceful, crowd-free beaches at Bai Sao and Bai Khem.</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200",
        category: "destination",
        author: "Lê Thu Hà",
        isPublished: true,
        publishedAt: new Date("2026-03-20T10:15:00.000Z"),
        createdAt: new Date("2026-03-20T10:15:00.000Z"),
      },
      {
        slug: "halong-bay-cruise-guide",
        title: {
                  "vi": "Review kinh nghiệm chọn du thuyền Vịnh Hạ Long 5 sao: Bảng giá, lịch trình và bí kíp sống ảo",
                  "en": "Ha Long Bay 5-Star Luxury Cruise Review: Best Itineraries, Pricing & Photo Spots",
                  "zh": "下龙湾五星级豪华邮轮全方位评测指南：星级航线选择、价格参考与登船秘籍",
                  "ko": "하롱베이 5성급 럭셔리 크루즈 완벽 리뷰: 추천 코스, 가격 비교 및 인생샷 명소",
                  "ja": "世界遺産ハロン湾5つ星ラグジュアリークルーズ宿泊レビュー：船の選び方・料金相場・過ごし方"
        },
        excerpt: {
                  "vi": "Kinh nghiệm chọn du thuyền ngủ đêm Vịnh Hạ Long và Vịnh Lan Hạ 5 sao đẳng cấp: review chi tiết lịch trình 2N1Đ, ngắm hang Sửng Sốt, chèo thuyền kayak và săn bình minh.",
                  "en": "Everything you need to know about booking an overnight luxury cruise in Ha Long and Lan Ha Bay: cave expeditions, kayaking, fine dining and sunrise Tai Chi.",
                  "zh": "下龙湾与兰哈湾五星级过夜游轮深度测评：独家剖析惊喜洞探秘、海上独木舟皮划艇体验及顶层甲板太极晨练。",
                  "ko": "하롱베이 & 란하베이 1박2일 럭셔리 크루즈 여행기: 성우솟 동굴 탐험, 카약 체험, 선셋 파티 및 일출 태극권 클래스 총정리.",
                  "ja": "ハロン湾・ランハ湾の一泊二日クルーズ完全攻略。壮大な鍾乳洞探検、カヤック体験、船上フレンチディナーの魅力を凝縮。"
        },
        content: {
                  "vi": "\n<h2>1. Tại sao ngủ đêm trên du thuyền Hạ Long là trải nghiệm \"nhất định phải thử một lần trong đời\"?</h2>\n<p>Vịnh Hạ Long, 2 lần được UNESCO công nhận là Di sản Thiên nhiên Thế giới, sở hữu gần 2.000 hòn đảo đá vôi kỳ vĩ nhô lên giữa làn nước xanh lục bảo. Thay vì các tour tàu tiếng đi về trong ngày vội vã, một chuyến <strong>du thuyền ngủ đêm 5 sao</strong> sẽ đưa bạn đắm chìm trọn vẹn vào không gian thiên nhiên tĩnh lặng, chiêm ngưỡng hoàng hôn rực rỡ và thức giấc giữa biển trời mây nước bồng bềnh.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1559563458-527698bf5295?w=1200\" alt=\"Du thuyền 5 sao sang trọng giữa Vịnh Hạ Long hùng vĩ\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Du thuyền 5 sao đẳng cấp quốc tế neo đậu giữa lòng kỳ quan Vịnh Hạ Long</figcaption>\n</figure>\n\n<h2>2. Bật mí lịch trình du thuyền Hạ Long 2 ngày 1 đêm chuẩn 5 sao</h2>\n<h3>Ngày 1: Tuần Châu – Vịnh Hạ Long – Hang Sửng Sốt – Đảo Ti Tốp</h3>\n<ul>\n  <li><strong>11:30 – 12:00:</strong> Làm thủ tục check-in tại cảng tàu quốc tế Tuần Châu hoặc Cảng tàu khách quốc tế Hạ Long, thưởng thức nước uống chào mừng trên tàu.</li>\n  <li><strong>13:00:</strong> Dùng bữa trưa buffet hải sản thượng hạng trong lúc du thuyền nhẹ nhàng lướt qua các hòn đảo đá vôi biểu tượng như Hòn Trống Mái, Hòn Đỉnh Hương.</li>\n  <li><strong>15:00:</strong> Khám phá <strong>Hang Sửng Sốt</strong> – hang động lớn và lộng lẫy bậc nhất vịnh với hệ thống thạch nhũ hàng triệu năm tuổi biến ảo muôn hình vạn trạng.</li>\n  <li><strong>16:30:</strong> Tắm biển tại <strong>Đảo Ti Tốp</strong> và leo hơn 400 bậc đá lên đỉnh núi để ngắm nhìn toàn cảnh 360 độ vịnh Hạ Long từ trên cao.</li>\n  <li><strong>18:00 – 19:30:</strong> Tiệc Sunset Party trên Sundeck, lớp học nấu món nem rán truyền thống và thưởng thức bữa tối lãng mạn chuẩn phong cách fine dining.</li>\n  <li><strong>21:00:</strong> Trải nghiệm câu mực đêm, hát karaoke hoặc thư giãn tại quầy bar và spa.</li>\n</ul>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1528127269322-539801943592?w=1200\" alt=\"Chèo thuyền kayak giữa làn nước ngọc bích Vịnh Hạ Long\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Tự tay chèo thuyền kayak luồn lách qua các hang luồn kỳ bí</figcaption>\n</figure>\n\n<h3>Ngày 2: Chèo thuyền Kayak – Hang Luồn – Trở về đất liền</h3>\n<ul>\n  <li><strong>06:00:</strong> Tham gia lớp tập Taichi (Thái Cực Quyền) đón tia nắng bình minh đầu tiên trên boong tàu lộng gió.</li>\n  <li><strong>07:00:</strong> Ăn sáng nhẹ với trà, cà phê và bánh ngọt.</li>\n  <li><strong>07:45:</strong> Trải nghiệm chèo kayak hoặc thuyền nan thăm <strong>Hang Luồn</strong>, chiêm ngưỡng những đàn khỉ hoang dã chuyền cành trên vách đá.</li>\n  <li><strong>09:30:</strong> Trở về tàu thu dọn hành lý, dùng bữa trưa sớm (Brunch) và thanh toán dịch vụ.</li>\n  <li><strong>11:30:</strong> Tàu cập bến cảng, kết thúc chuyến hải trình đáng nhớ.</li>\n</ul>\n\n<h2>3. Bảng giá tham khảo các dòng du thuyền Hạ Long</h2>\n<div class=\"overflow-x-auto my-4\">\n  <table class=\"w-full text-left text-sm border border-slate-200 rounded-xl overflow-hidden\">\n    <thead class=\"bg-slate-100 text-slate-800 font-bold\">\n      <tr>\n        <th class=\"p-3 border-b\">Hạng Du Thuyền</th>\n        <th class=\"p-3 border-b\">Mức Giá (VNĐ/khách)</th>\n        <th class=\"p-3 border-b\">Tiện Ích Nổi Bật</th>\n      </tr>\n    </thead>\n    <tbody class=\"divide-y divide-slate-100 text-slate-700\">\n      <tr>\n        <td class=\"p-3 font-semibold\">Du thuyền 4 sao</td>\n        <td class=\"p-3 text-orange-600 font-bold\">2.200.000 – 2.800.000</td>\n        <td class=\"p-3\">Phòng ban công riêng, trọn gói 4 bữa ăn</td>\n      </tr>\n      <tr>\n        <td class=\"p-3 font-semibold\">Du thuyền 5 sao Tiêu Chuẩn</td>\n        <td class=\"p-3 text-orange-600 font-bold\">3.200.000 – 4.500.000</td>\n        <td class=\"p-3\">Bồn tắm sục Jacuzzi, bể bơi vô cực, buffet tôm hùm</td>\n      </tr>\n      <tr>\n        <td class=\"p-3 font-semibold\">Du thuyền 5 sao Siêu Sang (Luxury)</td>\n        <td class=\"p-3 text-orange-600 font-bold\">5.000.000 – 9.000.000</td>\n        <td class=\"p-3\">Phòng tổng thống, sân golf mini, hầm rượu vang cao cấp</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n",
                  "en": "\n<h2>1. Why Choose an Overnight Cruise?</h2>\n<p>An overnight cruise is the quintessential way to experience UNESCO World Heritage Ha Long Bay, taking you away from day-trip crowds to serene emerald waters and soaring limestone islands.</p>\n<h2>2. Highlights of a 2D1N Itinerary</h2>\n<p>Marvel at Sung Sot Cave, climb Ti Top Island for panoramic views, kayak through Luon Cave, savor seafood feasts, and wake up to Tai Chi at sunrise on the sundeck.</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1559563458-527698bf5295?w=1200",
        category: "experience",
        author: "Phạm Đức Hùng",
        isPublished: true,
        publishedAt: new Date("2026-03-22T14:00:00.000Z"),
        createdAt: new Date("2026-03-22T14:00:00.000Z"),
      },
      {
        slug: "kinh-nghiem-du-lich-sapa",
        title: {
                  "vi": "Kinh nghiệm du lịch Sa Pa mùa lúa chín & săn mây: Lịch trình 3N2Đ chinh phục Fansipan",
                  "en": "Sa Pa Golden Terraces & Cloud Hunting Guide: 3D2N Mount Fansipan Adventure",
                  "zh": "沙坝金色稻浪与云海秘境全攻略：3天2晚登顶印度支那屋脊番西邦峰",
                  "ko": "사파 황금빛 다랑이논 & 운해 사냥 가이드: 2박3일 판시판 정복 일정",
                  "ja": "サパ黄金の棚田と雲海を巡る旅：2泊3日インドシナ最高峰ファンシーパン登頂完全攻略"
        },
        excerpt: {
                  "vi": "Bí kíp du lịch Sa Pa mùa lúa vàng và săn mây đèo Ô Quy Hồ: hướng dẫn di chuyển, trải nghiệm bản Cát Cát, thung lũng Mường Hoa và cáp treo Sun World Fansipan Legend.",
                  "en": "Complete guide to Sa Pa golden rice season and O Quy Ho pass cloud chasing: Muong Hoa valley trekking, ethnic village homestays, and Fansipan cable car.",
                  "zh": "深度领略沙坝金色梯田与云海翻腾的绝美风光：芒花山谷徒步漫游、黑苗族古村探访及番西邦缆车实用贴士。",
                  "ko": "황금빛 계단식 논과 웅장한 운해를 감상하는 사파 힐링 여행: 깟깟마을, 므엉호아 밸리 트레킹 및 판시판 케이블카 꿀팁.",
                  "ja": "秋のサパで息を呑む絶景の棚田と雲海に出会う。カットカット村の伝統文化体験からファンシーパン山頂へのアクセスまで詳解。"
        },
        content: {
                  "vi": "\n<h2>1. Sa Pa – Thành phố trong sương huyền ảo</h2>\n<p>Tọa lạc ở độ cao 1.600m so với mực nước biển thuộc tỉnh Lào Cai, Sa Pa là điểm đến nổi tiếng bậc nhất vùng Tây Bắc. Nơi đây hấp dẫn du khách bởi khí hậu mát lạnh ôn đới quanh năm, những dãy núi Hoàng Liên Sơn điệp trùng và bức tranh ruộng bậc thang uốn lượn kỳ vĩ từng được tạp chí Travel + Leisure vinh danh là một trong 7 ruộng bậc thang kỳ vĩ nhất thế giới.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=1200\" alt=\"Ruộng bậc thang Sa Pa mùa lúa chín vàng óng ánh\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Bức tranh thêu dệt kỳ vĩ của những thửa ruộng bậc thang mùa lúa chín tháng 9 – 10</figcaption>\n</figure>\n\n<h2>2. Thời điểm vàng để đến Sa Pa</h2>\n<ul>\n  <li><strong>Tháng 9 – Tháng 10 (Mùa lúa chín):</strong> Toàn bộ thung lũng Mường Hoa, Tả Van chuyển sang sắc vàng rực rỡ, hương lúa mới thơm ngát ngập tràn không gian.</li>\n  <li><strong>Tháng 11 – Tháng 3 (Mùa săn mây & ngắm hoa):</strong> Thời điểm lý tưởng nhất để săn biển mây bồng bềnh tại đèo Ô Quy Hồ, đỉnh Fansipan và ngắm hoa mai anh đào, hoa mận nở trắng rừng.</li>\n</ul>\n\n<h2>3. Lịch trình 3 ngày 2 đêm khám phá Sa Pa trọn vẹn</h2>\n<h3>Ngày 1: Hà Nội – Sa Pa – Bản Cát Cát – Nhà thờ Đá</h3>\n<p>Đi xe Limousine từ Hà Nội lên Sa Pa qua cao tốc Hà Nội - Lào Cai chỉ mất khoảng 4.5 – 5 tiếng. Nhận phòng khách sạn, buổi chiều ghé thăm bản Cát Cát của người H'Mông, thuê trang phục dân tộc check-in thác Tiên Sa và cối xay nước khổng lồ. Buổi tối dạo phố đi bộ, chụp ảnh Nhà thờ Đá cổ và thưởng thức lẩu cá hồi, cá tầm nóng hổi.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200\" alt=\"Đỉnh Fansipan nóc nhà Đông Dương ngập tràn biển mây\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Chinh phục đỉnh Fansipan 3.143m – Cột mốc tự hào nóc nhà Đông Dương</figcaption>\n</figure>\n\n<h3>Ngày 2: Chinh phục đỉnh Fansipan – Thung lũng Mường Hoa – Đèo Ô Quy Hồ</h3>\n<p>Trải nghiệm tuyến tàu hỏa leo núi Mường Hoa hiện đại đến ga cáp treo Sun World Fansipan Legend. Tuyến cáp treo giữ hai kỷ lục Guinness thế giới đưa bạn lướt qua thung lũng mây để chạm tay vào cột mốc 3.143m huyền thoại. Buổi chiều, di chuyển lên Cổng trời đèo Ô Quy Hồ ngắm hoàng hôn rực rỡ và săn biển mây cuồn cuộn.</p>\n\n<h3>Ngày 3: Khám phá bản Tả Van – Mua sắm quà lưu niệm</h3>\n<p>Dạo bước giữa thung lũng Tả Van, nhâm nhi tách cà phê ngắm suối Mường Hoa róc rách. Mua sắm hạt dẻ nướng, mận sấy dẻo và thịt trâu gác bếp về làm quà trước khi lên xe về lại Hà Nội.</p>\n",
                  "en": "\n<h2>1. Welcome to Misty Sa Pa</h2>\n<p>Nestled in the majestic Hoang Lien Son mountain range at 1,600m altitude, Sa Pa captivates travelers with terraced rice fields, vibrant hill-tribe culture, and cool mountain air.</p>\n<h2>2. Best Seasons to Explore</h2>\n<p>Visit in September-October for golden cascading rice terraces, or November-March for spectacular cloud seas and blooming cherry blossoms.</p>\n<h2>3. Key Highlights</h2>\n<p>Summit Mount Fansipan (3,143m) via world-record cable car, trek through Cat Cat and Ta Van ethnic villages, and watch breathtaking sunsets atop O Quy Ho mountain pass.</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=1200",
        category: "destination",
        author: "Ngô Thị Bích",
        isPublished: true,
        publishedAt: new Date("2026-03-25T11:20:00.000Z"),
        createdAt: new Date("2026-03-25T11:20:00.000Z"),
      },
      {
        slug: "review-du-lich-ninh-binh-trang-an",
        title: {
                  "vi": "Review du lịch Ninh Bình 2026: Khám phá Tràng An, Tam Cốc và Hang Múa từ A-Z",
                  "en": "Ninh Binh Travel Review 2026: Trang An, Tam Coc & Hang Mua Peak Itinerary",
                  "zh": "2026宁平旅游全景测评：深度漫游陆上下龙湾长安、三谷碧洞与跳舞洞",
                  "ko": "2026 닌빈 여행 완벽 리뷰: 짱안 보트투어, 땀꼭 & 항무아 인생샷 명소 총정리",
                  "ja": "2026年ニンビン観光完全レビュー：世界遺産チャンアン・タムコック・ハンムア絶景巡り"
        },
        excerpt: {
                  "vi": "Review chi tiết du lịch Ninh Bình 2 ngày 1 đêm: đi thuyền nan Tràng An, leo 500 bậc đá Hang Múa ngắm Tam Cốc, viếng chùa Bái Đính và thưởng thức đặc sản dê núi cơm cháy.",
                  "en": "Complete 2D1N Ninh Binh guide: Trang An UNESCO boat tour, Hang Mua dragon peak hike, Bai Dinh pagoda and local crispy rice delicacies.",
                  "zh": "宁平两日游超全指南：乘木船探寻长安喀斯特溶洞群、登顶跳舞洞巨龙俯瞰三谷绝景，品味地道烤羊肉与酥脆锅巴。",
                  "ko": "닌빈 1박2일 핵심 투어: 유네스코 세계유산 짱안 나룻배 투어, 항무아 용 조각상 포토존, 바이딘 사원 및 현지 염소고기 맛집 리뷰.",
                  "ja": "「陸のハロン湾」ニンビンの見どころ徹底紹介。手漕ぎボートで巡るチャンアン、絶景のハンムア、東南アジア屈指の大寺院バイディン寺院を巡る。"
        },
        content: {
                  "vi": "\n<h2>1. Ninh Bình – Vịnh Hạ Long trên cạn ngàn năm lịch sử</h2>\n<p>Chỉ cách Hà Nội khoảng 95km về phía Nam, Ninh Bình là vùng đất \"địa linh nhân kiệt\", nơi lưu giữ Quần thể danh thắng Tràng An – di sản văn hóa và thiên nhiên hỗn hợp duy nhất tại khu vực Đông Nam Á được UNESCO công nhận. Với hệ thống núi đá vôi kỳ vĩ soi bóng xuống dòng sông êm đềm, Ninh Bình là điểm đến nghỉ dưỡng và check-in lý tưởng hàng đầu miền Bắc.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200\" alt=\"Khám phá Tràng An Ninh Bình bằng thuyền nan\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Ngồi thuyền nan xuôi dòng nước trong vắt khám phá Quần thể danh thắng Tràng An</figcaption>\n</figure>\n\n<h2>2. Top 4 địa điểm check-in \"đỉnh cao\" nhất Ninh Bình</h2>\n<h3>1. Quần thể danh thắng Tràng An (Tuyến thuyền số 2 và số 3)</h3>\n<p>Hành trình kéo dài khoảng 2.5 – 3 tiếng đưa du khách luồn lách qua các hang động kỳ bí như Hang Lam, Hang Vạng, Hang Đại và dừng chân viếng Đền Suối Tiên linh thiêng. Nước sông trong đến mức có thể nhìn thấy rong rêu uốn lượn dưới đáy nước xanh ngắt.</p>\n\n<h3>2. Hang Múa – Vạn Lý Trường Thành thu nhỏ</h3>\n<p>Vượt qua gần 500 bậc đá uốn lượn men theo sườn núi dốc đứng, bạn sẽ đặt chân lên đỉnh Ngọa Long oai nghiêm. Từ đây, thu trọn vào tầm mắt toàn cảnh thung lũng Tam Cốc với dòng sông Ngô Đồng uốn lượn mềm mại giữa đôi bờ lúa chín vàng ươm.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200\" alt=\"Đỉnh Ngọa Long Hang Múa Ninh Bình ngắm trọn thung lũng Tam Cốc\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Góc ngắm toàn cảnh thung lũng Tam Cốc từ đỉnh Hang Múa</figcaption>\n</figure>\n\n<h3>3. Chùa Bái Đính – Ngôi chùa của những kỷ lục châu Á</h3>\n<p>Quần thể tâm linh đồ sộ giữ hàng loạt kỷ lục: tượng Phật bằng đồng dát vàng lớn nhất châu Á, hành lang 500 tượng La Hán bằng đá xanh dài nhất và chuông đồng lớn nhất Việt Nam.</p>\n\n<h3>4. Cố đô Hoa Lư – Hào khí non sông</h3>\n<p>Kinh đô đầu tiên của nhà nước phong kiến tập quyền Việt Nam dưới triều Đinh – Tiền Lê, nơi gìn giữ dấu ấn lịch sử hào hùng dựng nước và giữ nước của cha ông.</p>\n\n<h2>3. Đặc sản Ninh Bình nhất định phải thưởng thức</h2>\n<ul>\n  <li><strong>Thịt dê núi:</strong> Dê nuôi thả tự nhiên trên các triền núi đá vôi nên thịt săn chắc, thơm ngọt. Các món ngon gồm: dê tái chanh, dê nướng tảng, dê xào lăn, lẩu dê.</li>\n  <li><strong>Cơm cháy chà bông ruốc:</strong> Từng miếng cơm cháy giòn rụm chấm cùng nước sốt tim cật dê béo ngậy đậm đà.</li>\n  <li><strong>Ốc núi Ninh Bình:</strong> Loài ốc sống trong các hang đá chỉ xuất hiện vào mùa mưa, thịt giòn ngọt chấm nước mắm gừng ớt sả.</li>\n</ul>\n",
                  "en": "\n<h2>1. Discover Ninh Binh – Halong Bay on Land</h2>\n<p>Located just 95km south of Hanoi, Ninh Binh is home to UNESCO World Heritage Trang An, characterized by majestic karst peaks, serene waterways, and centuries-old imperial history.</p>\n<h2>2. Must-Visit Attractions</h2>\n<p><strong>Trang An Eco-boat Tour:</strong> Float through mystical caves and ancient shrines on emerald-green rivers.</p>\n<p><strong>Hang Mua Viewpoint:</strong> Climb 500 steps to the stone dragon peak for sweeping panoramic views of Tam Coc valley.</p>\n<p><strong>Bai Dinh Pagoda:</strong> The largest Buddhist pagoda complex in Southeast Asia holding multiple cultural records.</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
        category: "destination",
        author: "Đỗ Hoàng Nam",
        isPublished: true,
        publishedAt: new Date("2026-03-28T08:45:00.000Z"),
        createdAt: new Date("2026-03-28T08:45:00.000Z"),
      },
      {
        slug: "review-du-lich-da-nang-hoi-an",
        title: {
                  "vi": "Review du lịch Đà Nẵng – Hội An 4 ngày 3 đêm: Lịch trình chi tiết, ăn chơi thả ga và tối ưu chi phí",
                  "en": "Da Nang & Hoi An 4D3N Comprehensive Review: Full Itinerary, Ba Na Hills & Lantern Night",
                  "zh": "岘港与会安4天3晚深度游评测：巴拿山黄金桥、古镇放水灯与超高性价比攻略",
                  "ko": "다낭 & 호이안 3박4일 완벽 여행기: 바나힐 골든브릿지, 야경 투어 & 알뜰 경비",
                  "ja": "ダナン＆ホイアン3泊4日モデルコース徹底レビュー：バーナーヒルズ黄金の橋と灯篭流し"
        },
        excerpt: {
                  "vi": "Hành trình kết hợp tuyệt vời giữa thành phố biển hiện đại Đà Nẵng và phố cổ di sản Hội An: check-in Cầu Vàng Bà Nà Hills, tắm biển Mỹ Khê, đi thuyền thúng rừng dừa và thả đèn hoa đăng sông Hoài.",
                  "en": "The perfect combination of modern coastal Da Nang and UNESCO Hoi An Ancient Town: Golden Bridge, My Khe beach, Bay Mau coconut basket boat, and river lantern release.",
                  "zh": "现代海滨名城岘港与千年古韵会安的完美邂逅：登临巴拿山巨手黄金桥、漫步美溪沙滩、体验水椰林簸箕船与秋盆河河灯祈福。",
                  "ko": "휴양과 낭만을 동시에 즐기는 다낭-호이안 코스: 바나힐 골든브릿지, 미케비치 해수욕, 바구니배 체험 및 유네스코 호이안 올드타운 야경 투어.",
                  "ja": "近代的なビーチリゾート・ダナンと風情あふれる世界遺産ホイアンを巡る3泊4日。バナヒルズ、ミーケビーチ、ランタンの灯る夜の街を満喫。"
        },
        content: {
                  "vi": "\n<h2>1. Tổng quan cặp đôi điểm đến Đà Nẵng – Hội An</h2>\n<p>Đà Nẵng và Hội An là bộ đôi du lịch hoàn hảo nhất miền Trung Việt Nam. Chỉ cách nhau 30km, một bên là Đà Nẵng năng động với những cây cầu biểu tượng và bãi biển Mỹ Khê quyến rũ hàng đầu châu Á, một bên là Hội An trầm mặc, cổ kính với những dãy nhà quét vôi vàng đặc trưng và ánh đèn lồng lung linh huyền ảo khi đêm về.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200\" alt=\"Phố cổ Hội An lung linh đèn lồng bên dòng sông Hoài\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Vẻ đẹp cổ kính, trầm mặc của Di sản Văn hóa Thế giới Phố cổ Hội An</figcaption>\n</figure>\n\n<h2>2. Lịch trình chi tiết 4 ngày 3 đêm tối ưu nhất</h2>\n<h3>Ngày 1: Đà Nẵng – Bán đảo Sơn Trà – Biển Mỹ Khê – Cầu Rồng phun lửa</h3>\n<p>Buổi sáng đáp chuyến bay đến Đà Nẵng, xe đưa về khách sạn nhận phòng nghỉ ngơi. Buổi chiều viếng Chùa Linh Ứng trên bán đảo Sơn Trà chiêm bái tượng Phật Bà Quan Âm cao 67m hướng ra biển Đông. Chiều muộn tắm biển Mỹ Khê cát trắng mịn màng. Tối thứ Bảy hoặc Chủ Nhật, ra cầu Rồng ngắm rồng thép phun lửa và phun nước rực sáng bầu trời.</p>\n\n<h3>Ngày 2: Trọn ngày khám phá Sun World Ba Na Hills</h3>\n<p>Dành nguyên ngày trải nghiệm \"chốn bồng lai tiên cảnh\" Bà Nà Hills. Check-in siêu phẩm <strong>Cầu Vàng (Golden Bridge)</strong> được nâng đỡ bởi hai bàn tay khổng lồ phủ rêu phong, dạo bước Làng Pháp cổ kính, vui chơi không giới hạn tại Fantasy Park và hầm rượu cổ Debay.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200\" alt=\"Cầu Vàng Bà Nà Hills kiệt tác kiến trúc nổi danh thế giới\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Cầu Vàng Bà Nà Hills – Biểu tượng kiến trúc du lịch nổi danh toàn cầu</figcaption>\n</figure>\n\n<h3>Ngày 3: Rừng dừa Bảy Mẫu – Khám phá Phố cổ Hội An</h3>\n<p>Buổi sáng trải nghiệm đi thuyền thúng tròn len lỏi giữa rừng dừa Bảy Mẫu Cẩm Thanh, xem các nghệ nhân lắc thúng xoay tròn điệu nghệ. Buổi chiều di chuyển vào trung tâm Phố Cổ Hội An, dạo bước qua Chùa Cầu Nhật Bản, nhà cổ Tấn Ký, hội quán Phúc Kiến. Buổi tối đi thuyền thả đèn hoa đăng trên sông Hoài và ăn cao lầu, cơm gà bà Buội.</p>\n\n<h3>Ngày 4: Mua sắm đặc sản Chợ Hàn – Tạm biệt miền Trung</h3>\n<p>Sáng ghé chợ Hàn mua chả bò Đà Nẵng, tré, mực rim me, bánh khô mè Cẩm Lệ về làm quà. Ra sân bay Đà Nẵng kết thúc chuyến đi tuyệt vời.</p>\n",
                  "en": "\n<h2>1. The Ultimate Central Vietnam Duo</h2>\n<p>Just 30km apart, dynamic coastal Da Nang and romantic UNESCO Hoi An Ancient Town create an unbeatable 4-day travel experience for all types of travelers.</p>\n<h2>2. Unforgettable Highlights</h2>\n<p>Walk across the world-famous Golden Bridge at Ba Na Hills, cruise the green waterways of Bay Mau coconut forest in round bamboo basket boats, and float paper lanterns along Hoi An's lantern-lit river.</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200",
        category: "experience",
        author: "Vũ Thanh Hằng",
        isPublished: true,
        publishedAt: new Date("2026-03-30T16:20:00.000Z"),
        createdAt: new Date("2026-03-30T16:20:00.000Z"),
      },
      {
        slug: "review-du-lich-mien-tay-song-nuoc",
        title: {
                  "vi": "Review du lịch Miền Tây sông nước: Trải nghiệm chợ nổi Cái Răng, miệt vườn và rừng tràm Trà Sư",
                  "en": "Mekong Delta Travel Review: Cai Rang Floating Market, Fruit Orchards & Tra Su Forest",
                  "zh": "越南湄公河水乡全景体验指南：探秘丐冷水上市场、热带果园采摘与茶师白千层林",
                  "ko": "베트남 메콩델타 투어 리뷰: 까이랑 수상시장, 열대 과일 과수원 및 짜수 맹그로브 숲",
                  "ja": "メコンデルタ水上マーケット＆マングローブ林の旅：カントー・チャウドック完全ガイド"
        },
        excerpt: {
                  "vi": "Hành trình về miền Tây Nam Bộ mộc mạc: trải nghiệm họp chợ trên sông Cái Răng từ sáng sớm, xuồng ba lá lướt thảm bèo xanh rừng tràm Trà Sư và thưởng thức cá lóc nướng trui.",
                  "en": "Immerse in authentic Southern Vietnam: morning Cai Rang floating market, paddling through emerald duckweed carpets in Tra Su cajuput forest, and savoring rustic Mekong dishes.",
                  "zh": "走进原汁原味的湄公河水上人家：清晨乘船感受热闹非凡的水上交易市场、小木舟穿梭于绿毯般的白千层森林，品尝稻草烤黑鱼与椰子煎饼。",
                  "ko": "메콩강 유역의 정겨운 정취를 만끽하는 코스: 활기 넘치는 까이랑 수상시장, 초록빛 부평초 가득한 짜수 숲 나룻배 투어 및 전통 메콩 미식 탐방.",
                  "ja": "南ベトナム・メコンデルタの豊かな自然と水上生活を体験。活気ある水上マーケット、緑の絨毯のようなマングローブ林の絶景クルーズ。"
        },
        content: {
                  "vi": "\n<h2>1. Miền Tây Nam Bộ – Vùng đất hào sảng và trù phú</h2>\n<p>Miền Tây sông nước (Đồng bằng sông Cửu Long) mang vẻ đẹp dung dị, êm đềm với những con kênh rạch chằng chịt, những rặng dừa nước nghiêng mình soi bóng và tấm lòng hiếu khách, hào sảng nồng ấm của người dân Nam Bộ. Đây là điểm đến lý tưởng để tạm gác lại những ồn ào phố thị, hòa mình vào không gian miệt vườn thanh bình.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1528127269322-539801943592?w=1200\" alt=\"Chợ nổi Cái Răng Cần Thơ tấp nập buổi bình minh\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Chợ nổi Cái Răng Cần Thơ – Bức tranh văn hóa sông nước độc nhất vô nhị</figcaption>\n</figure>\n\n<h2>2. Những trải nghiệm độc bản không thể bỏ qua</h2>\n<h3>1. Chợ nổi Cái Răng (Cần Thơ) – Văn hóa thương hồ trên sông</h3>\n<p>Thức dậy thật sớm từ 05:00 sáng để xuống ghe máy ra chợ nổi. Lúc này, hàng trăm chiếc ghe chở đầy ắp dưa hấu, khóm, vú sữa, sầu riêng tấp nập neo đậu trao đổi hàng hóa. Đặc biệt, người bán treo sản vật của mình lên cây sào gọi là \"cây bẹo\" để khách từ xa dễ dàng nhận biết. Thưởng thức một tô hủ tiếu nóng hổi và ly cà phê sữa đá chòng chành trên sông là trải nghiệm nhớ đời.</p>\n\n<h3>2. Rừng tràm Trà Sư (An Giang) – Thiên đường sinh thái xanh biếc</h3>\n<p>Ngồi trên chiếc xuồng ba lá mộc mạc do các cô gái miền Tây mặc áo bà ba chèo lái, nhẹ nhàng lướt qua thảm bèo cám xanh mướt trải dài như vô tận. Lắng nghe tiếng chim ríu rít gọi bầy và ngắm nhìn những đàn cò trắng chao liệng giữa tán rừng tràm cổ thụ.</p>\n\n<h2>3. Ẩm thực miệt vườn đậm đà tình quê</h2>\n<ul>\n  <li><strong>Cá lóc nướng trui:</strong> Cá lóc tươi sống vùi vào rơm rạ khô đốt cháy, khi chín gạt lớp vảy cháy đen lộ ra thớ thịt cá trắng ngần, thơm nức cuốn bánh tráng rau rừng chấm mắm me.</li>\n  <li><strong>Lẩu mắm miền Tây:</strong> Nấu từ mắm cá linh hoặc mắm cá sặc thơm nồng, ăn kèm hơn 20 loại rau đồng nội như bông điên điển, bông súng, rau nhút, so đũa.</li>\n  <li><strong>Bánh xèo củ hủ dừa:</strong> Chiếc bánh xèo vàng giòn to bằng chiếc mâm, nhân thịt ba chỉ, tôm sông và củ hủ dừa giòn ngọt tự nhiên.</li>\n</ul>\n",
                  "en": "\n<h2>1. Discover the Mekong Delta</h2>\n<p>The Mekong Delta charms visitors with its labyrinth of canals, verdant fruit orchards, floating markets, and legendary Southern Vietnamese hospitality.</p>\n<h2>2. Signature Experiences</h2>\n<p>Awake early for the vibrant Cai Rang floating market in Can Tho, glide through carpeted green duckweed waters in Tra Su cajuput forest, and savor fresh grilled snakehead fish with tamarind sauce.</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200",
        category: "destination",
        author: "Lâm Văn Phát",
        isPublished: true,
        publishedAt: new Date("2026-04-02T13:30:00.000Z"),
        createdAt: new Date("2026-04-02T13:30:00.000Z"),
      },
      {
        slug: "review-du-lich-quy-nhon-phu-yen",
        title: {
                  "vi": "Review du lịch Quy Nhơn – Phú Yên: Hành trình biển xanh xứ sở hoa vàng trên cỏ xanh",
                  "en": "Quy Nhon & Phu Yen Travel Review: Emerald Coast & Yellow Flowers Itinerary",
                  "zh": "归仁与富安海滨深度测评：探秘蔚蓝海岸与“绿草黄花”电影取景圣地",
                  "ko": "퀴논 & 푸옌 자유여행 리뷰: 에메랄드빛 해안과 낭만적인 노란 꽃밭 투어",
                  "ja": "クイニョン＆フーイエン絶景海岸巡り：巨岩の岬エオゾーと映画の舞台バイセップ"
        },
        excerpt: {
                  "vi": "Kinh nghiệm du lịch Quy Nhơn Phú Yên 4 ngày 3 đêm tự túc: ngắm hoàng hôn Kỳ Co Eo Gió, check-in tuyệt tác Gành Đá Đĩa và bãi Xép xứ sở hoa vàng cỏ xanh.",
                  "en": "Complete 4D3N coastal adventure covering Ky Co beach, Eo Gio cliffside walk, the geological marvel Ganh Da Dia, and fresh seafood by O Loan lagoon.",
                  "zh": "打卡越南中南部最美秘境海岸：探访“小马尔代夫”祈戈海滩、风口悬崖栈道、大自然的蜂巢奇迹巨石海角与生蚝海鲜大餐。",
                  "ko": "숨겨진 보석 같은 휴양지 퀴논 & 푸옌: 끼꼬 비치 스노클링, 에오지오 해안 산책로, 주상절리 간다디아 및 오로안 석호 해산물 맛집 투어.",
                  "ja": "手つかずの自然が残るクイニョンとフーイエン。断崖絶壁のエオゾー、神秘的な柱状節理ガンダーディア、新鮮なシーフードを満喫。"
        },
        content: {
                  "vi": "\n<h2>1. Vẻ đẹp hoang sơ của dải đất duyên hải Nam Trung Bộ</h2>\n<p>Nếu bạn đang tìm kiếm một vùng biển hoang sơ, làn nước trong vắt đến độ có thể nhìn rõ từng đàn cá tung tăng bơi lội mà không quá đông đúc xô bồ, thì hành trình liên tuyến <strong>Quy Nhơn (Bình Định) – Phú Yên</strong> chính là sự lựa chọn số 1. Nơi đây sở hữu những kiệt tác địa chất tự nhiên độc nhất vô nhị cùng những bãi tắm cát vàng mịn thoai thoải trải dài hút tầm mắt.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200\" alt=\"Eo Gió Quy Nhơn cung đường đi bộ ven biển ngoạn mục\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Eo Gió Quy Nhơn – Cung đường đi bộ ven biển ngắm sóng vỗ tuyệt mỹ</figcaption>\n</figure>\n\n<h2>2. Những điểm đến biểu tượng trong hành trình</h2>\n<h3>1. Kỳ Co – Eo Gió (Quy Nhơn): Maldives thu nhỏ của Việt Nam</h3>\n<p>Kỳ Co sở hữu dải cát trắng ôm trọn lấy làn nước biển 2 màu xanh ngọc bích kỳ ảo, được bao bọc bởi những rặng núi đá sừng sững. Sau khi tắm biển Kỳ Co, du khách di chuyển sang <strong>Eo Gió</strong> – eo biển hút gió quanh năm với con đường đi bộ uốn lượn có lan can đỏ trắng men theo vách núi sát mép sóng biển.</p>\n\n<h3>2. Gành Đá Đĩa (Phú Yên): Tuyệt tác địa chất tự nhiên triệu năm</h3>\n<p>Được công nhận là Di tích Quốc gia đặc biệt, Gành Đá Đĩa là hiện tượng địa chất hiếm có trên thế giới với hàng chục nghìn cột đá bazan hình lục lăng xếp khít vào nhau như một tổ ong khổng lồ vươn mình ra biển cả mênh mông.</p>\n\n<figure class=\"my-6\">\n  <img src=\"https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200\" alt=\"Gành Đá Đĩa Phú Yên kỳ quan địa chất tự nhiên độc nhất vô nhị\" class=\"rounded-2xl w-full object-cover shadow-md\" />\n  <figcaption class=\"text-center text-xs text-slate-500 mt-2 italic font-medium\">Gành Đá Đĩa Phú Yên – Tuyệt tác đá núi lửa xếp hình tổ ong vươn ra biển Đông</figcaption>\n</figure>\n\n<h3>3. Bãi Xép & Gành Ông: Xứ sở hoa vàng trên cỏ xanh</h3>\n<p>Khung cảnh xuất hiện trong bộ phim nổi tiếng của đạo diễn Victor Vũ với bãi cỏ xanh mướt trải dài trên vách đá ngắm sóng vỗ, điểm xuyết những rặng xương rồng hoang dại và bãi biển Bãi Xép thoai thoải cát vàng.</p>\n\n<h3>4. Hải sản Đầm Ô Loan trứ danh</h3>\n<p>Đừng quên dừng chân thưởng thức đặc sản sò huyết đầm Ô Loan rang me hoặc nướng mọi béo ngậy ngọt lịm, cua huỳnh đế hấp và bánh xèo tôm nhảy giòn rụm.</p>\n",
                  "en": "\n<h2>1. Pristine South-Central Coast</h2>\n<p>Quy Nhon and Phu Yen form an extraordinary coastal duo featuring turquoise bays, towering ocean cliffs, and unique volcanic stone formations.</p>\n<h2>2. Top Highlights</h2>\n<p><strong>Ky Co & Eo Gio:</strong> The \"Maldives of Vietnam\" with crystal waters and a scenic cliffside walking path.</p>\n<p><strong>Ganh Da Dia:</strong> A rare geological wonder of basalt hexagonal columns stacked like giant beehives by the sea.</p>\n<p><strong>Bai Xep:</strong> The dreamy filming location of \"Yellow Flowers on Green Grass\".</p>\n"
        },
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
        category: "destination",
        author: "Nguyễn Đăng Khoa",
        isPublished: true,
        publishedAt: new Date("2026-04-05T15:10:00.000Z"),
        createdAt: new Date("2026-04-05T15:10:00.000Z"),
      },
    ]);

    // ========== HOTELS (2 hotels with full room/policy details) ==========
    await Hotel.create([
      {
        slug: 'hanoi-luxury-hotel',
        name: createI18n('Khách sạn Super Candle', 'Super Candle Hotel'),
        description: createI18n(
          'Tọa lạc tại trung tâm Hà Nội, Khách sạn Super Candle mang đến không gian nghỉ dưỡng sang trọng với đầy đủ tiện nghi hiện đại.',
          'Located in the heart of Hanoi, Super Candle Hotel offers luxurious accommodation with full modern amenities.'
        ),
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1600&auto=format&fit=crop'
        ],
        pricePerNight: 1000000,
        stars: 4,
        location: 'Hà Nội',
        address: '287-301 Đội Cấn, Liễu Giai, Ba Đình, Hà Nội',
        amenities: ['WiFi miễn phí', 'Hồ bơi trong nhà', 'Nhà hàng', 'Phòng gym', 'Spa & Massage', 'Lễ tân 24h'],
        policies: [
          'Nhận phòng: Từ 14:00',
          'Trả phòng: Trước 12:00',
          'Trẻ em dưới 6 tuổi được ngủ chung giường miễn phí (Tối đa 1 trẻ/phòng)',
          'Không cho phép mang theo thú cưng',
          'Yêu cầu CCCD hoặc Hộ chiếu khi nhận phòng'
        ],
        locationDetails: {
          lat: 21.0362,
          lng: 105.8156,
          nearbyPlaces: [
            { name: 'Lăng Chủ tịch Hồ Chí Minh', distance: '1.5 km' },
            { name: 'Văn Miếu Quốc Tử Giám', distance: '2.5 km' },
            { name: 'Hồ Tây', distance: '1.8 km' }
          ]
        },
        rooms: [
          {
            name: 'Phòng Superior Double/Twin',
            description: 'Phòng tiêu chuẩn với thiết kế ấm cúng, phù hợp cho cặp đôi hoặc chuyến công tác.',
            price: 1000000,
            capacity: { adults: 2, children: 1 },
            size: 28,
            bedType: '1 Giường đôi hoặc 2 Giường đơn',
            amenities: ['Điều hòa', 'TV màn hình phẳng', 'Tủ lạnh mini', 'Máy sấy tóc', 'Nước suối miễn phí'],
            images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop']
          },
          {
            name: 'Phòng Deluxe City View',
            description: 'Phòng rộng rãi với cửa sổ lớn nhìn ra toàn cảnh thành phố Hà Nội.',
            price: 1350000,
            capacity: { adults: 2, children: 1 },
            size: 32,
            bedType: '1 Giường đôi lớn',
            amenities: ['View thành phố', 'Bồn tắm', 'Áo choàng tắm', 'Máy pha cà phê', 'Bàn làm việc'],
            images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop']
          },
          {
            name: 'Phòng Suite Cao Cấp',
            description: 'Trải nghiệm đỉnh cao với không gian phòng khách riêng biệt và tiện ích cao cấp nhất.',
            price: 2500000,
            capacity: { adults: 2, children: 2 },
            size: 55,
            bedType: '1 Giường King siêu lớn',
            amenities: ['Phòng khách riêng', 'View toàn cảnh', 'Bồn tắm sục Jacuzzi', 'Trái cây chào mừng', 'Dịch vụ VIP'],
            images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop']
          }
        ]
      },
      {
        slug: 'danang-ocean-resort',
        name: createI18n('Đà Nẵng Ocean Front Resort 5 Sao', 'Da Nang 5-Star Ocean Front Resort'),
        description: createI18n(
          'Resort 5 sao đẳng cấp nằm trực tiếp trên bãi biển Mỹ Khê – một trong những bãi biển đẹp nhất hành tinh. Tất cả phòng đều hướng biển, view sunrise tuyệt đẹp.',
          '5-star luxury resort located directly on My Khe Beach – one of the most beautiful beaches on the planet. All rooms face the ocean with stunning sunrise views.'
        ),
        images: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
        ],
        pricePerNight: 3500000,
        stars: 5,
        location: 'Đà Nẵng',
        address: '168 Võ Nguyên Giáp, Mỹ Khê, Đà Nẵng',
        amenities: ['WiFi miễn phí', 'Bãi biển riêng', 'Hồ bơi vô cực', 'Buffet sáng', 'Spa 5 sao', 'Nhà hàng fine dining', 'Kids club', 'Đưa đón sân bay'],
        policies: [
          'Nhận phòng: Từ 15:00',
          'Trả phòng: Trước 12:00',
          'Không hút thuốc trong phòng',
          'Có phụ thu trẻ em'
        ],
        locationDetails: {
          lat: 16.0601,
          lng: 108.2483,
          nearbyPlaces: [{ name: 'Bãi biển Mỹ Khê', distance: '0.1 km' }, { name: 'Cầu Rồng', distance: '3 km' }]
        },
        rooms: [
          {
            name: 'Ocean View Deluxe',
            description: 'Phòng Deluxe hướng biển trực diện tuyệt đẹp.',
            price: 3500000,
            capacity: { adults: 2, children: 1 },
            size: 40,
            bedType: '1 Giường đôi siêu lớn',
            amenities: ['Ban công', 'Bồn tắm', 'Minibar', 'Trà & Cà phê'],
            images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop']
          }
        ]
      },
      {
        slug: 'phu-quoc-paradise-resort',
        name: createI18n('Phú Quốc Paradise Beach Resort', 'Phu Quoc Paradise Beach Resort'),
        description: createI18n(
          'Ẩn mình trong khu rừng nhiệt đới xanh mát sát biển tại Bãi Sao – bãi biển đẹp nhất Phú Quốc. Resort mang phong cách eco-luxury, hài hòa với thiên nhiên.',
          'Nestled in lush tropical forest by the sea at Sao Beach – the most beautiful beach in Phu Quoc. Eco-luxury resort in harmony with nature.'
        ),
        images: [
          'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        ],
        pricePerNight: 2800000,
        stars: 5,
        location: 'Phú Quốc',
        address: 'Bãi Sao, An Thới, Phú Quốc, Kiên Giang',
        amenities: ['WiFi miễn phí', 'Bãi biển riêng', 'Hồ bơi', 'Lặn ngắm san hô', 'Buffet sáng', 'Bar & Nhà hàng', 'Yoga & Thiền'],
        policies: [
          'Nhận phòng: Từ 14:00',
          'Trả phòng: Trước 12:00',
          'Miễn phí bữa sáng cho tối đa 2 người'
        ],
        locationDetails: {
          lat: 10.0354,
          lng: 104.0305,
          nearbyPlaces: [{ name: 'Bãi Sao', distance: '0.5 km' }, { name: 'Cáp treo Hòn Thơm', distance: '5 km' }]
        },
        rooms: [
          {
            name: 'Eco Bungalow Garden View',
            description: 'Bungalow gỗ sinh thái hướng vườn nhiệt đới.',
            price: 2800000,
            capacity: { adults: 2, children: 1 },
            size: 45,
            bedType: '1 Giường đôi lớn',
            amenities: ['Ban công', 'Vòi sen ngoài trời', 'Minibar', 'Lưới chống muỗi'],
            images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800']
          },
          {
            name: 'Beachfront Villa with Pool',
            description: 'Biệt thự sát biển với hồ bơi vô cực riêng.',
            price: 8500000,
            capacity: { adults: 4, children: 2 },
            size: 120,
            bedType: '2 Giường King',
            amenities: ['Hồ bơi riêng', 'View biển trực diện', 'Bồn tắm', 'Quản gia riêng'],
            images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800']
          }
        ]
      },
      {
        slug: 'sapa-mountain-lodge',
        name: createI18n('Sa Pa Mountain View Lodge', 'Sa Pa Mountain View Lodge'),
        description: createI18n(
          'Nhà nghỉ phong cách mountain lodge ấm áp với view ruộng bậc thang tuyệt đẹp ngay tại thị trấn Sa Pa. Lò sưởi trong phòng, tắm ngâm thảo mộc dân tộc.',
          'Cozy mountain lodge style with stunning rice terrace views right in Sa Pa town. In-room fireplace, ethnic herbal bath.'
        ),
        images: [
          'https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        ],
        pricePerNight: 850000,
        stars: 3,
        location: 'Sa Pa',
        address: '8 Nguyễn Chí Thanh, Sa Pa, Lào Cai',
        amenities: ['WiFi miễn phí', 'Lò sưởi', 'Tắm ngâm thảo mộc', 'Bữa sáng kiểu dân tộc', 'Tour trekking', 'Thuê xe máy'],
        policies: [
          'Nhận phòng: Từ 13:00',
          'Trả phòng: Trước 11:00',
          'Cho phép mang theo thú cưng nhỏ'
        ],
        locationDetails: {
          lat: 22.3364,
          lng: 103.8438,
          nearbyPlaces: [{ name: 'Nhà thờ đá Sa Pa', distance: '1.2 km' }, { name: 'Núi Hàm Rồng', distance: '2 km' }]
        },
        rooms: [
          {
            name: 'Standard Mountain View',
            description: 'Phòng tiêu chuẩn ấm cúng với ban công nhìn ra thung lũng Mường Hoa.',
            price: 850000,
            capacity: { adults: 2, children: 1 },
            size: 25,
            bedType: '1 Giường đôi',
            amenities: ['Lò sưởi', 'Ban công', 'Trà thảo mộc'],
            images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800']
          }
        ]
      }
    ]);

    // ========== SPECIALTIES (9 items) ==========
    await Specialty.create([
      {
        slug: 'pho-ha-noi',
        name: createI18n('Phở Bò Hà Nội Gia Truyền', 'Hanoi Traditional Beef Pho'),
        description: createI18n(
          'Phở bò Hà Nội – linh hồn ẩm thực thủ đô với nước dùng trong vắt ninh từ xương bò hàng chục tiếng, bánh phở mềm dai, thịt bò tươi ngon và hương thơm đặc trưng của quế, hồi.',
          'Hanoi beef pho – the soul of the capital cuisine with clear broth simmered from beef bones for dozens of hours, soft chewy noodles, fresh beef, and the distinctive aroma of cinnamon and star anise.'
        ),
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
        price: 60000,
        region: 'Miền Bắc',
        location: 'Hà Nội'
      },
      {
        slug: 'bun-cha-ha-noi',
        name: createI18n('Bún Chả Hà Nội – Hương vị Obama', 'Hanoi Bun Cha – Obama\'s Favorite'),
        description: createI18n(
          'Bún chả Hà Nội nổi tiếng thế giới từ khi Tổng thống Obama thưởng thức. Thịt lợn nướng than hoa thơm lừng, chả viên bọc lá lốt, bún tươi và nước chấm ngọt chua đặc biệt.',
          'Hanoi Bun Cha became world famous when President Obama enjoyed it. Charcoal-grilled pork, betel leaf wrapped meatballs, fresh vermicelli and special sweet-sour dipping sauce.'
        ),
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        price: 50000,
        region: 'Miền Bắc',
        location: 'Hà Nội'
      },
      {
        slug: 'bun-bo-hue',
        name: createI18n('Bún Bò Huế Chuẩn Vị Cố Đô', 'Authentic Hue Beef Noodle Soup'),
        description: createI18n(
          'Bún bò Huế – món ăn đậm đà vị sả, mắm ruốc đặc trưng cố đô, sợi bún to tròn ăn kèm nạm bò, chả cua, huyết và giò heo béo ngậy thơm nức.',
          'Hue beef noodle soup – rich flavor of lemongrass and traditional shrimp paste, thick round noodles served with beef flank, crab sausage, and pork trotters.'
        ),
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        price: 55000,
        region: 'Miền Trung',
        location: 'Thừa Thiên Huế'
      },
      {
        slug: 'mi-quang-da-nang',
        name: createI18n('Mì Quảng Đà Nẵng Chuẩn Vị', 'Da Nang Authentic Quang Noodles'),
        description: createI18n(
          'Mì Quảng – đặc sản số 1 của xứ Quảng. Sợi mì vàng óng ánh từ bột gạo tươi, nước lèo sệt sệt đậm đà từ tôm cua, thịt heo, thêm rau sống, bánh đa giòn và đậu phộng rang bùi bùi.',
          'Quang Noodles – the #1 specialty of Quang province. Golden fresh rice noodles, thick rich broth from shrimp and crab, pork, topped with fresh herbs, crunchy rice crackers and roasted peanuts.'
        ),
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        price: 45000,
        region: 'Miền Trung',
        location: 'Đà Nẵng'
      },
      {
        slug: 'cao-lau-hoi-an',
        name: createI18n('Cao Lầu Phố Cổ Hội An', 'Hoi An Ancient Town Cao Lau'),
        description: createI18n(
          'Cao lầu – tinh hoa ẩm thực xứ Quảng với sợi mì vàng giòn đặc chế ngâm nước tro giếng Bá Lễ, ăn kèm xá xíu đậm vị, da heo chiên giòn và rau sống Trà Quế.',
          'Cao Lau – the culinary essence of Quang province with chewy noodles soaked in Ba Le well ash water, served with savory char siu pork, crispy pork skin, and Tra Que herbs.'
        ),
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
        price: 45000,
        region: 'Miền Trung',
        location: 'Quảng Nam'
      },
      {
        slug: 'nem-nuong-nha-trang',
        name: createI18n('Nem Nướng Nha Trang Đậm Đà', 'Nha Trang Grilled Pork Rolls'),
        description: createI18n(
          'Nem nướng lợn tươi nướng than hồng thơm nức, cuộn bánh tráng giòn rum, rau thơm đa dạng và chấm cùng nước sốt nếp thịt béo ngậy trứ danh.',
          'Charcoal-grilled pork rolls wrapped in crispy rice paper with fresh fragrant herbs, dipped in famous rich creamy sticky-rice pork sauce.'
        ),
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        price: 60000,
        region: 'Miền Trung',
        location: 'Khánh Hòa'
      },
      {
        slug: 'banh-mi-sai-gon',
        name: createI18n('Bánh Mì Sài Gòn – Đặc Sản Đường Phố', 'Saigon Banh Mi – Street Food Specialty'),
        description: createI18n(
          'Bánh mì Sài Gòn được CNN bầu chọn là một trong những món ăn đường phố ngon nhất thế giới. Ổ bánh mì vỏ giòn, nhân thịt nguội, pate, rau cải và nước sốt tương đặc biệt.',
          'Saigon Banh Mi was voted by CNN as one of the best street foods in the world. Crusty baguette filled with cold cuts, pate, pickled vegetables and special soy sauce.'
        ),
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        price: 25000,
        region: 'Miền Nam',
        location: 'TP. Hồ Chí Minh'
      },
      {
        slug: 'com-tam-sai-gon',
        name: createI18n('Cơm Tấm Sài Gòn Sườn Bì Chả', 'Saigon Broken Rice with Pork Ribs'),
        description: createI18n(
          'Cơm tấm Sài Gòn – niềm tự hào ẩm thực phương Nam. Hạt cơm tấm dẻo quánh, sườn nướng mật ong thơm lừng, bì giòn sần sật, chả trứng béo ngậy và nước mắm kẹo chua ngọt.',
          'Saigon broken rice – pride of Southern cuisine. Fragrant broken rice served with honey-marinated grilled pork ribs, crispy pork skin, egg loaf and sweet sticky fish sauce.'
        ),
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        price: 50000,
        region: 'Miền Nam',
        location: 'TP. Hồ Chí Minh'
      },
      {
        slug: 'hu-tieu-nam-vang',
        name: createI18n('Hủ Tiếu Nam Vang Sài Gòn', 'Saigon Nam Vang Rice Noodle Soup'),
        description: createI18n(
          'Hủ tiếu Nam Vang – món ăn gốc Hoa được người Sài Gòn yêu thích. Nước dùng trong veo từ xương heo ninh lâu, hủ tiếu dai, thịt thái mỏng, tôm, cật heo, hành phi và giò quẩy giòn.',
          'Nam Vang rice noodle soup – a Chinese-origin dish beloved by Saigonites. Clear pork bone broth, chewy noodles, thin sliced meat, shrimp, pork kidney, fried shallots and crispy crullers.'
        ),
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
        price: 55000,
        region: 'Miền Nam',
        location: 'TP. Hồ Chí Minh'
      },
    ]);

    // ========== FLIGHTS (6 flights) ==========
    await Flight.create([
      { airline: 'Vietnam Airlines', logo: 'VN', flightNumber: 'VN-234', from: 'SGN', to: 'HAN', departureTime: '08:00', arrivalTime: '10:15', duration: '2h 15m', price: 1450000, availableSeats: 80, isAvailable: true },
      { airline: 'Vietjet Air', logo: 'VJ', flightNumber: 'VJ-112', from: 'SGN', to: 'HAN', departureTime: '10:30', arrivalTime: '12:40', duration: '2h 10m', price: 980000, availableSeats: 60, isAvailable: true },
      { airline: 'Bamboo Airways', logo: 'QH', flightNumber: 'QH-208', from: 'SGN', to: 'HAN', departureTime: '14:15', arrivalTime: '16:30', duration: '2h 15m', price: 1290000, availableSeats: 50, isAvailable: true },
      { airline: 'Vietnam Airlines', logo: 'VN', flightNumber: 'VN-510', from: 'HAN', to: 'DAD', departureTime: '09:00', arrivalTime: '10:20', duration: '1h 20m', price: 1150000, availableSeats: 70, isAvailable: true },
      { airline: 'Vietjet Air', logo: 'VJ', flightNumber: 'VJ-620', from: 'SGN', to: 'PQC', departureTime: '07:30', arrivalTime: '08:30', duration: '1h 00m', price: 850000, availableSeats: 45, isAvailable: true },
      { airline: 'Bamboo Airways', logo: 'QH', flightNumber: 'QH-740', from: 'DAD', to: 'HAN', departureTime: '18:00', arrivalTime: '19:20', duration: '1h 20m', price: 1050000, availableSeats: 90, isAvailable: true },
    ]);

    await Page.create([
      {
        slug: 'visa',
        title: createI18n('Thông tin & Hỗ trợ Thủ tục Visa', 'Visa Information & Support'),
        content: createI18n(
          '<h2>Dịch vụ hỗ trợ Visa du lịch</h2><p>Travel cung cấp dịch vụ tư vấn và hỗ trợ làm visa cho hơn 50 quốc gia và vùng lãnh thổ. Đội ngũ chuyên gia giàu kinh nghiệm sẽ đồng hành cùng bạn trong suốt quá trình.</p><h3>Các loại Visa phổ biến</h3><ul><li><strong>Visa Nhật Bản:</strong> Thời gian 5-7 ngày làm việc, tỷ lệ đậu cao</li><li><strong>Visa Hàn Quốc:</strong> 3-5 ngày làm việc, nhiều loại (du lịch, thăm thân)</li><li><strong>Visa Schengen:</strong> Châu Âu, 10-15 ngày, cần nhiều hồ sơ</li><li><strong>Visa Mỹ:</strong> 1-2 tháng, phỏng vấn lãnh sự quán</li></ul><h3>Liên hệ</h3><p>Hotline: 1800 646 888 (miễn phí) | Email: visa@travel.com</p>',
          '<h2>Visa Support Services</h2><p>Travel provides consulting and visa support services for over 50 countries and territories. Our experienced team will accompany you throughout the process.</p>'
        ),
        metaDescription: createI18n('Dịch vụ hỗ trợ visa du lịch uy tín tại Travel – tư vấn và làm hồ sơ cho hơn 50 quốc gia.', 'Trusted travel visa support at Travel – consulting for 50+ countries.'),
      },
      {
        slug: 'contact',
        title: createI18n('Liên hệ với Travel', 'Contact Travel'),
        content: createI18n('Liên hệ với chúng tôi qua các kênh bên dưới.', 'Contact us through the channels below.'),
        metaDescription: createI18n('Liên hệ Travel để được tư vấn miễn phí.', 'Contact Travel for free consultation.'),
      },
      {
        slug: 'about',
        title: createI18n('Về chúng tôi – Travel', 'About Us – Travel'),
        content: createI18n(
          '<h2>Câu chuyện của Travel</h2><p>Travel được thành lập năm 2010 với sứ mệnh mang đến cho người Việt Nam những trải nghiệm du lịch đáng nhớ và dịch vụ chuyên nghiệp nhất.</p><h3>Con số ấn tượng</h3><ul><li>15+ năm kinh nghiệm</li><li>500.000+ khách hàng hài lòng</li><li>200+ điểm đến trong và ngoài nước</li><li>50+ chi nhánh toàn quốc</li></ul>',
          '<h2>Travel\'s Story</h2><p>Travel was founded in 2010 with the mission of bringing Vietnamese people memorable travel experiences and the most professional service.</p>'
        ),
        metaDescription: createI18n('Tìm hiểu về Travel – hành trình 15 năm phát triển và phục vụ 500.000+ khách hàng.', 'Learn about Travel – 15 years of growth serving 500,000+ customers.'),
      },
    ]);

    await Setting.create([
      { key: 'site_name', value: createI18n('Travel – Khám phá Việt Nam', 'Travel – Discover Vietnam'), group: 'general' },
      { key: 'site_slogan', value: createI18n('Hành trình của bạn bắt đầu từ đây', 'Your journey starts here'), group: 'general' },
      { key: 'logo_url', value: '/logo.png', group: 'general' },
      {
        key: 'contact_info',
        value: {
          email: 'contact@travel.com',
          phone: '1800 646 888',
          address: '123 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội',
          maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096929704!2d105.8474!3d21.0285',
          working_hours: 'Thứ 2 – Thứ 7: 8:00 – 18:00'
        },
        group: 'contact'
      },
    ]);

    console.log('✅ Seed data created successfully! (9 tours, 5 news, 4 hotels, 6 specialties)');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

export default seedDataInternal;
