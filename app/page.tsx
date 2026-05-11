import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import DashboardClient from '@/components/DashboardClient';

export default function Dashboard() {
  return (
    <>
      <TopBar />
      <DashboardClient />
      <MobileNav />
    </>
  );
}
