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

    // ========== NEWS (5 articles with full 5-language support) ==========
    await News.create([
      {
        slug: 'kinh-nghiem-du-lich-ha-noi-2026',
        title: createI18n(
          'Kinh nghiệm du lịch Hà Nội tự túc đầy đủ 2026',
          'Complete Hanoi Self-Tour Guide 2026',
          '2026年河内自由行全攻略与旅游指南',
          '2026년 하노이 자유여행 완벽 가이드',
          '2026年 ハノイ個人旅行 完全攻略ガイド'
        ),
        content: createI18n(
          '<h2>Hà Nội – Thủ đô ngàn năm văn hiến</h2><p>Hà Nội không chỉ là trung tâm chính trị mà còn là nơi lưu giữ những giá trị văn hóa, lịch sử đặc sắc nhất của Việt Nam. Từ Hồ Gươm thơ mộng, Phố cổ 36 phường nhộn nhịp đến Lăng Bác trang nghiêm – mỗi góc phố đều kể câu chuyện riêng của mình.</p><h3>Di chuyển</h3><p>Từ sân bay Nội Bài vào trung tâm: Xe buýt 86 (35.000đ) hoặc taxi (250.000-350.000đ). Trong thành phố nên đi Grab hoặc xe máy thuê.</p><h3>Ăn gì?</h3><p>Phở Bát Đàn, Bún chả Hàng Mành, Bún Ốc Cầu Gỗ, Bánh mì Phố Huế, Kem Tràng Tiền, Cà phê trứng Giảng.</p><h3>Chỗ ở</h3><p>Phố cổ: 300.000-800.000đ/đêm. Quận Hai Bà Trưng: yên tĩnh hơn, giá 500.000-1.500.000đ/đêm.</p>',
          '<h2>Hanoi – Thousand-year-old Capital</h2><p>Hanoi is not only the political center but also the keeper of Vietnam\'s most distinctive cultural and historical values. From the poetic Hoan Kiem Lake, the bustling 36 Ancient Streets to the solemn Ho Chi Minh Mausoleum – every corner tells its own story.</p><h3>Transportation</h3><p>From Noi Bai Airport to city center: Bus 86 ($1.5) or taxi ($10-$15). In the city, use Grab or rent a motorbike.</p><h3>Must-try Cuisine</h3><p>Bat Dan Pho, Hang Manh Bun Cha, Cau Go Snail Noodles, Pho Hue Banh Mi, Trang Tien Ice Cream, Giang Egg Coffee.</p><h3>Accommodation</h3><p>Old Quarter: $15-$40/night. Hai Ba Trung district: quieter, $25-$70/night.</p>',
          '<h2>河内 – 千年文化之都</h2><p>河内不仅是政治文化中心，更是越南悠久历史文化的核心。从诗意的还剑湖、熙攘的三十六行街到庄严的胡志明陵——每个转角都诉说着动人故事。</p><h3>交通指南</h3><p>内排机场到市区：86路公交车（约10元人民币）或网约车出租车（约80-100元）。市内推荐Grab打车或租借摩托车。</p><h3>必尝美食</h3><p>钵坛街牛肉粉、行慢街烤肉米线、木桥螺肉米线、长钱冰淇淋、鸡蛋咖啡。</p>',
          '<h2>하노이 – 천년의 역사를 품은 수도</h2><p>하노이는 베트남의 독보적인 문화와 역사가 살아 숨쉬는 곳입니다. 서정적인 호안끼엠 호수, 활기 넘치는 36거리 구시가지부터 호치민 묘소까지 매 순간이 감동입니다.</p><h3>교통편</h3><p>노이바이 공항에서 시내까지: 86번 공항버스 또는 그랩 택시. 시내에서는 그랩 호출을 권장합니다.</p><h3>추천 미식</h3><p>밧단 쌀국수, 항만 분짜, 짱띠엔 아이스크림, 카페 지앙 에그커피.</p>',
          '<h2>ハノイ – 千年の歴史が息づく首都</h2><p>ハノイはベトナムの伝統と文化が凝縮された魅力的な都です。風情あふれるホアンキエム湖、賑やかなハノイ旧市街36通り、厳かなホー・チ・ミン廟など見どころ満載です。</p><h3>アクセス</h3><p>ノイバイ国際空港から市内へ：86番バスまたはタクシー/Grab。市内移動はGrabが便利です。</p><h3>おすすめグルメ</h3><p>バットダン・フォー、ブンチャー、バインミー、エッグコーヒー。</p>'
        ),
        excerpt: createI18n(
          'Tổng hợp đầy đủ kinh nghiệm du lịch Hà Nội tự túc 2026: ăn gì, ở đâu, đi đâu, di chuyển như thế nào để tiết kiệm nhất.',
          'Complete guide to self-touring Hanoi in 2026: what to eat, where to stay, where to go, and how to get around most economically.',
          '2026年河内自由行综合指南：吃什么、住在哪里、必游景点以及最划算的交通方式。',
          '2026년 하노이 자유여행 종합 팁: 맛집, 추천 숙소, 필수 명소 및 알뜰 교통 팁.',
          '2026年ハノイ個人旅行ガイド：グルメ、宿泊エリア、観光名所、お得な移動方法を徹底解説。'
        ),
        thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        category: 'experience',
        author: 'Nguyễn Hương Giang',
        isPublished: true,
      },
      {
        slug: 'top-mon-an-da-nang-phai-thu',
        title: createI18n(
          'Top 15 món ăn Đà Nẵng nhất định phải thử một lần',
          'Top 15 Must-Try Foods in Da Nang You Cannot Miss',
          '岘港不可错过的15大特色地道美食精选',
          '다낭에서 꼭 맛봐야 할 대표 미식 TOP 15',
          'ダナン旅行で絶対に食べたい絶品ご当地グルメ15選'
        ),
        content: createI18n(
          '<h2>Ẩm thực Đà Nẵng – Hòa quyện 3 miền</h2><p>Nằm ở vị trí địa lý giao thoa giữa Bắc và Nam, ẩm thực Đà Nẵng mang trong mình nét đặc trưng riêng biệt, vừa đậm đà của miền Trung, vừa phong phú đa dạng.</p><p>1. Mì Quảng - món ăn đặc trưng nhất; 2. Bánh tráng thịt heo - không ở đâu có; 3. Bún chả cá; 4. Bánh xèo Đà Nẵng cỡ lớn; 5. Cơm gà Hải Nam...</p>',
          '<h2>Da Nang Cuisine – Blend of Three Regions</h2><p>Located at the geographic intersection of North and South, Da Nang cuisine carries its own unique character, both rich in Central flavor and diverse variety.</p><p>1. Quang Noodles (Mi Quang); 2. Pork belly rolled in rice paper; 3. Fish cake noodle soup; 4. Crispy Da Nang pancake; 5. Hoi An chicken rice...</p>',
          '<h2>岘港美食 – 荟萃三地风味</h2><p>岘港美食兼具越南中部的浓郁鲜辣与南北的调和特色，风味独特且丰富多样。</p><p>1. 广南米粉（Mi Quang）；2. 猪肉米纸卷；3. 鲜鱼饼米线；4. 岘港特色大脆煎饼；5. 招牌海南鸡饭...</p>',
          '<h2>다낭 미식 – 베트남 3대 지역의 조화</h2><p>다낭 음식은 중부 지역 특유의 깊은 풍미와 신선한 식재료가 어우러져 한국인 여행객에게도 큰 사랑을 받고 있습니다.</p><p>1. 미꽝(대표 국수); 2. 돼지고기 라이스페이퍼 롤; 3. 어묵 쌀국수; 4. 바삭한 반세오; 5. 하이난 치킨라이스...</p>',
          '<h2>ダナンの名物グルメ – 3つの地域の調和</h2><p>ダナン料理はベトナム中部の奥深い旨味と新鮮な海の幸が融合した、日本人の口にもよく合う絶品グルメの宝庫です。</p><p>1. 名物ミークアン（和え麺）；2. 豚肉のライスペーパー巻き；3. さつま揚げ入り米粉麺；4. パリパリのバインセオ；5. チキンライス...</p>'
        ),
        excerpt: createI18n(
          'Khám phá nền ẩm thực phong phú và độc đáo của Đà Nẵng – từ Mì Quảng, bánh tráng thịt heo đến hải sản tươi ngon nhất miền Trung.',
          'Discover Da Nang\'s rich culinary scene – from iconic Quang noodles, pork rolls to the freshest seafood in Central Vietnam.',
          '探索岘港丰富独特的饮食文化——从广南米粉、水煮猪肉卷到中部最鲜美多汁的海鲜大餐。',
          '다낭의 다채롭고 특별한 미식을 탐험하세요 – 미꽝, 돼지고기 라이스페이퍼 롤부터 신선한 중부 해산물까지.',
          'ダナンの豊かな食文化を探求——名物ミークアン、豚肉のライスペーパー巻きから新鮮なシーフードまで。'
        ),
        thumbnail: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        category: 'food',
        author: 'Trần Minh Tuấn',
        isPublished: true,
      },
      {
        slug: 'phu-quoc-nen-di-mua-nao',
        title: createI18n(
          'Phú Quốc nên đi mùa nào? Bí kíp du lịch đảo ngọc 2026',
          'Best Time to Visit Phu Quoc? 2026 Pearl Island Travel Guide',
          '富国岛最佳旅游季节指南：2026珍珠岛出行秘籍',
          '푸꾸옥 언제 가는 게 좋을까? 2026 진주섬 여행 꿀팁',
          'フーコック島ベストシーズンはいつ？2026 観光完全ガイド'
        ),
        content: createI18n(
          '<h2>Phú Quốc – 4 mùa đều đẹp</h2><p>Phú Quốc có 2 mùa chính: mùa khô (tháng 11 – tháng 4) và mùa mưa (tháng 5 – tháng 10). Mỗi mùa đều có vẻ đẹp và trải nghiệm riêng.</p><h3>Mùa cao điểm (tháng 11 – tháng 4)</h3><p>Thời tiết đẹp nhất, biển calme, lặn ngắm san hô tuyệt vời. Giá phòng cao hơn 30-50%, cần đặt trước.</p><h3>Mùa thấp điểm (tháng 5 – tháng 10)</h3><p>Giá rẻ hơn nhiều, ít đông. Một số ngày mưa nhưng vẫn có thể vui chơi indoor tại Vinpearl.</p>',
          '<h2>Phu Quoc – Beautiful All Year Round</h2><p>Phu Quoc has 2 main seasons: dry season (November – April) and rainy season (May – October). Each season has its own beauty and experiences.</p><h3>Peak Season (Nov – Apr)</h3><p>Clear skies, calm crystal seas, ideal for snorkeling & diving. Room rates higher by 30-50%, advance booking recommended.</p><h3>Off-Peak Season (May – Oct)</h3><p>Much lower prices, fewer crowds, and lush green scenery with great indoor entertainment at VinWonders.</p>',
          '<h2>富国岛 – 四季皆美的海岛度假胜地</h2><p>富国岛主要分为旱季（11月至次年4月）和雨季（5月至10月），各个季节均有独具特色的度假体验。</p><h3>旱季旺季（11月 - 4月）</h3><p>风和日丽，海水清澈见底，是浮潜与海滩度假的最佳时机。酒店房价较高，建议提前预订。</p><h3>淡季出行（5月 - 10月）</h3><p>性价比极高，游客较少，可尽情体验珍珠乐园与野生动物园等室内外娱乐设施。</p>',
          '<h2>푸꾸옥 – 사계절 내내 아름다운 휴양지</h2><p>푸꾸옥은 건기(11월~4월)와 우기(5월~10월) 두 계절로 나뉘며 각 시즌마다 색다른 매력을 자랑합니다.</p><h3>성수기(11월 ~ 4월)</h3><p>파도가 잔잔하고 맑은 날씨가 이어져 스노클링 및 호핑 투어에 이상적입니다. 사전 숙소 예약 필수.</p><h3>비수기(5월 ~ 10월)</h3><p>가성비가 뛰어나고 여유로운 여행이 가능하며 빈원더스 등 실내외 테마파크를 알차게 즐길 수 있습니다.</p>',
          '<h2>フーコック島 – 一年中楽しめる常夏の楽園</h2><p>フーコック島には乾季（11月〜4月）と雨季（5月〜10月）の2つの季節があり、それぞれ異なる楽しみ方ができます。</p><h3>ベストシーズン・乾季（11月〜4月）</h3><p>晴天が続き波も穏やかで、シュノーケリングやビーチでのんびり過ごすのに最適です。</p><h3>雨季・グリーンシーズン（5月〜10月）</h3><p>リゾートホテルが格安で宿泊でき、混雑を避けてリラックスした滞在が叶います。</p>'
        ),
        excerpt: createI18n(
          'Tư vấn chi tiết thời điểm lý tưởng để du lịch Phú Quốc, các lưu ý quan trọng và bí kíp tiết kiệm chi phí khi đến đảo ngọc.',
          'Detailed advice on the ideal time to visit Phu Quoc, essential tips and budget-friendly secrets for the pearl island.',
          '详细分析富国岛四季气候特征、最佳旅游时节、出行注意事项以及珍珠岛省钱实用小贴士。',
          '푸꾸옥을 방문하기 가장 좋은 시기, 중요 체크리스트 및 알뜰한 여행 경비 절약 팁 상세 안내.',
          'フーコック島旅行のベストシーズン、乾季・雨季の過ごし方、旅費を賢く抑えるお得なコツを解説。'
        ),
        thumbnail: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        category: 'destination',
        author: 'Lê Thu Hà',
        isPublished: true,
      },
      {
        slug: 'halong-bay-cruise-guide',
        title: createI18n(
          'Hướng dẫn đặt du thuyền Hạ Long: Phân loại, giá cả và lưu ý',
          'Ha Long Bay Cruise Guide: Star Ratings, Prices & Insider Tips',
          '下龙湾游轮预订全攻略：星级分类、价格对比与避坑指南',
          '하롱베이 크루즈 예약 가이드: 등급별 분류, 가격 및 필수 팁',
          'ハロン湾クルーズ予約ガイド：クラス別比較・料金相場・注意点'
        ),
        content: createI18n(
          '<h2>Du thuyền Hạ Long – Trải nghiệm đỉnh cao</h2><p>Du thuyền là cách tốt nhất để khám phá vịnh Hạ Long. Hiện có 3 phân khúc: Economy (1-1.5 triệu/đêm), Superior (2-3 triệu/đêm), Luxury (4-8 triệu/đêm).</p><h3>Nên chọn tour mấy ngày?</h3><p>2 ngày 1 đêm: phù hợp người ít thời gian. 3 ngày 2 đêm: trải nghiệm đầy đủ nhất. 4 ngày 3 đêm: cho người muốn khám phá vịnh Lan Hạ.</p>',
          '<h2>Ha Long Bay Cruise – Peak Experience</h2><p>Cruises are the premier way to explore UNESCO World Heritage Ha Long Bay. Currently 3 main tiers: Economy ($50-65/night), Superior ($85-130/night), Luxury ($175-350/night).</p><h3>How Many Days to Choose?</h3><p>2 Days 1 Night: perfect for short visits. 3 Days 2 Nights: the most complete experience exploring caves & kayaking. 4 Days: deep exploration into pristine Lan Ha Bay.</p>',
          '<h2>下龙湾游轮 – 顶级海上度假体验</h2><p>搭乘游轮是领略世界自然遗产下龙湾千峰竞秀的最佳方式。目前主要分为三个档次：经济型、高档型与顶级奢华型。</p><h3>游玩天数建议</h3><p>2天1晚：适合行程紧凑的游客。3天2晚：深度体验溶洞探秘、海上皮划艇的最佳选择。</p>',
          '<h2>하롱베이 크루즈 – 베트남 최고의 힐링 여행</h2><p>유네스코 세계자연유산 하롱베이를 온전히 감상하는 가장 완벽한 방법은 1박 이상의 오버나잇 크루즈입니다.</p><h3>추천 일정</h3><p>1박 2일: 일정 여유가 적은 여행자에게 적합. 2박 3일: 카약, 동굴 탐험, 쿠킹 클래스까지 모두 즐기는 최적의 일정.</p>',
          '<h2>ハロン湾クルーズ – 世界遺産を満喫する極上の船旅</h2><p>世界自然遺産ハロン湾の奇岩群を堪能するなら、宿泊型クルーズが一番のおすすめです。</p><h3>おすすめのクルーズ日数</h3><p>1泊2日：手軽にハロン湾の主要スポットを満喫。2泊3日：鍾乳洞探検やカヤック体験までゆったり楽しめます。</p>'
        ),
        excerpt: createI18n(
          'Hướng dẫn toàn diện về cách chọn du thuyền Hạ Long phù hợp: từ phân loại hạng sao, giá cả, thời gian đến những lưu ý quan trọng.',
          'Comprehensive guide to choosing the right Ha Long Bay cruise: star categories, price ranges, itineraries and tips.',
          '全面解析下龙湾游轮选择方法：从星级分级、行程天数、价格区间到登船重要注意事项。',
          '하롱베이 크루즈 선택 완벽 가이드: 성급 분류, 가격대, 1박2일/2박3일 일정 및 필수 유의사항.',
          'ハロン湾クルーズの選び方を徹底解説：星付きランク、料金相場、おすすめ泊数と予約時の注意点。'
        ),
        thumbnail: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800',
        category: 'experience',
        author: 'Phạm Đức Hùng',
        isPublished: true,
      },
      {
        slug: 'kinh-nghiem-du-lich-sapa',
        title: createI18n(
          'Sa Pa mùa lúa vàng – Thiên đường ảnh đẹp nhất Việt Nam',
          'Sa Pa Golden Rice Season – Vietnam\'s Most Breathtaking Photo Paradise',
          '沙坝金色梯田季 – 越南最壮丽的摄影天堂全解析',
          '사파 황금빛 다랑이논 시즌 – 베트남 최고의 인생샷 명소',
          'サパの黄金の棚田シーズン – ベトナム随一の絶景フォトスポット'
        ),
        content: createI18n(
          '<h2>Sa Pa mùa vàng (tháng 9 – tháng 10)</h2><p>Đây là thời điểm đẹp nhất trong năm khi những thửa ruộng bậc thang chuyển sang màu vàng rực rỡ. Đặc biệt ấn tượng ở Mù Cang Chải, Tú Lệ và Y Tý.</p><h3>Cách đi Sa Pa</h3><p>Xe limousine từ Hà Nội: 200.000-350.000đ/người (4 tiếng). Tàu đêm từ ga Hà Nội: 200.000-600.000đ (8 tiếng). Fly đến Điện Biên rồi xe: nhanh hơn nhưng đắt hơn.</p>',
          '<h2>Sa Pa Golden Season (September – October)</h2><p>This is the most breathtaking time of year when sweeping terraced rice fields transform into brilliant cascading gold. Particularly stunning in Mu Cang Chai, Tu Le, and Ta Van valley.</p><h3>Getting to Sa Pa</h3><p>Limousine bus from Hanoi: 4-5 hours via highway. Overnight sleeper train from Hanoi station: romantic and comfortable 8-hour journey.</p>',
          '<h2>沙坝黄金梯田季（9月 - 10月）</h2><p>这是沙坝全年最壮丽的时节，层层叠叠的高山梯田换上金黄锦缎，宛如人间仙境，是摄影爱好者的朝圣之地。</p><h3>交通出行</h3><p>河内直达豪华商务车：约4-5小时高速路程。河内夜间卧铺火车：舒适惬意，清晨抵达老街站。</p>',
          '<h2>사파 황금빛 다랑이논 시즌(9월 ~ 10월)</h2><p>푸른 계단식 논이 눈부신 황금빛으로 물드는 9~10월은 사파 여행의 백미이자 인생 사진을 남길 수 있는 최고의 계절입니다.</p><h3>사파 가는 법</h3><p>하노이에서 리무진 버스 이용 시 약 4~5시간 소요되며, 낭만적인 야간 침대 열차도 인기 있는 선택지입니다.</p>',
          '<h2>サパの黄金色の棚田（9月〜10月）</h2><p>見渡す限りの棚田が黄金色に輝く秋のサパは、一年で最も美しい季節です。どこを切り取っても絵になる絶景が広がります。</p><h3>アクセス方法</h3><p>ハノイから高速リムジンバスで約4〜5時間、または風情ある寝台列車でのアクセスが一般的です。</p>'
        ),
        excerpt: createI18n(
          'Trải nghiệm Sa Pa mùa lúa vàng tháng 9-10: hướng dẫn chi tiết về cách đi, ở đâu, chụp ảnh ruộng bậc thang đẹp nhất.',
          'Experience Sa Pa golden rice season in Sep-Oct: comprehensive guide on transport, lodging, and best terrace photo spots.',
          '9-10月沙坝金色梯田季深度体验：往返交通、景观住宿推荐与绝佳梯田机位指南。',
          '9~10월 사파 황금빛 벼베기 시즌 여행: 교통편, 뷰 맛집 숙소, 최적의 다랑이논 포토존 가이드.',
          '9〜10月限定のサパ黄金の棚田：行き方、絶景ロッジ、棚田を一番美しく撮影できるスポットを解説。'
        ),
        thumbnail: 'https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=800',
        category: 'destination',
        author: 'Ngô Thị Bích',
        isPublished: true,
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
