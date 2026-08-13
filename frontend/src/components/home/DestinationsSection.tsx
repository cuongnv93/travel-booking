'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, ArrowRight, Compass } from 'lucide-react';
import api from '@/lib/api';

const fetchDestinations = async () => {
  try {
    const res: any = await api.get('/tours/destinations');
    return Array.isArray(res) ? res : [];
  } catch {
    return ['Hà Nội', 'Đà Nẵng', 'Hội An', 'Phú Quốc', 'Sa Pa', 'Nha Trang'];
  }
};

const DESTINATION_PHOTOS: Record<string, string> = {
  'Hà Nội': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
  'Đà Nẵng': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
  'Hội An': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
  'Phú Quốc': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
  'Sa Pa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
  'Nha Trang': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'Hạ Long': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
  'TP. Hồ Chí Minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
  'Cao Bằng': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
  'Huế': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
};

export default function DestinationsSection() {
  const t = useTranslations('destinations');
  const locale = useParams().locale as string;

  const { data: destinations = [] } = useQuery({
    queryKey: ['home-destinations'],
    queryFn: fetchDestinations,
  });

  const displayList = destinations.length > 0
    ? destinations
    : [
        { name: 'Hà Nội', image: DESTINATION_PHOTOS['Hà Nội'] },
        { name: 'Đà Nẵng', image: DESTINATION_PHOTOS['Đà Nẵng'] },
        { name: 'Hội An', image: DESTINATION_PHOTOS['Hội An'] },
        { name: 'Phú Quốc', image: DESTINATION_PHOTOS['Phú Quốc'] },
        { name: 'Sa Pa', image: DESTINATION_PHOTOS['Sa Pa'] },
        { name: 'Cao Bằng', image: DESTINATION_PHOTOS['Cao Bằng'] },
      ];

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <div className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>{t('badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{t('title')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <Link 
          href={`/${locale}/tours`} 
          className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm"
        >
          <span>{t('viewAll')}</span> <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayList.slice(0, 6).map((item: any, idx: number) => {
          const destName = typeof item === 'string' ? item : item.name;
          const photo = (typeof item === 'object' && item.image) 
            ? item.image 
            : (DESTINATION_PHOTOS[destName] || 'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=800');

          return (
            <motion.div
              key={destName}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link href={`/${locale}/tours?destination=${encodeURIComponent(destName)}`}>
                <div className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <img src={photo} alt={destName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3 h-3 text-blue-400" /> {destName}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base leading-tight group-hover:text-amber-300 transition-colors">
                      {destName}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
