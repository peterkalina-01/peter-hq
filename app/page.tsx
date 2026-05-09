import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import Hero from '@/components/Hero';
import KpiStrip from '@/components/KpiStrip';
import DayModules from '@/components/DayModules';
import MentorSection from '@/components/MentorSection';
import Subscriptions from '@/components/Subscriptions';
import FooterMetrics from '@/components/FooterMetrics';

export default function Dashboard() {
  return (
    <>
      <TopBar />
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1600px] mx-auto">
        <Hero />
        <KpiStrip />
        <DayModules />
        <MentorSection />
        <Subscriptions />
        <FooterMetrics />
      </main>
      <MobileNav />
    </>
  );
}
