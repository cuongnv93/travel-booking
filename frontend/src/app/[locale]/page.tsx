import HeroBanner from '@/components/home/HeroBanner';
import QuickSearch from '@/components/home/QuickSearch';
import FeaturedTours from '@/components/home/FeaturedTours';
import DestinationsSection from '@/components/home/DestinationsSection';
import FeaturedHotels from '@/components/home/FeaturedHotels';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import NewsSection from '@/components/home/NewsSection';
import Testimonials from '@/components/home/Testimonials';

export default async function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner />
      
      {/* Search box seamlessly overlapping the Hero section */}
      <div className="container mx-auto px-4 md:px-6 relative z-30 -mt-24 md:-mt-36 mb-16 max-w-5xl">
        <QuickSearch />
      </div>

      <div className="flex-1 space-y-24 pb-24">
        <FeaturedTours />
        <DestinationsSection />
        <FeaturedHotels />
        <FlashSaleSection />
        <WhyChooseUs />
        <Testimonials />
        <NewsSection />
      </div>
    </div>
  );
}
