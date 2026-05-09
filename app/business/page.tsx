import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import ComingSoon from '@/components/ComingSoon';

export default function BusinessPage() {
  return (
    <>
      <TopBar />
      <main className="pb-24 lg:pb-0">
        <ComingSoon
          title="Biznis"
          description="LeadsFlow command center — pipeline, klienti, cally, ads, denné tasky, biznis health score."
          features={[
            'MRR + tržby live zo Stripe',
            'Pipeline · prospekti, deals, status, hodnota',
            'Cally · count, close rate, recent calls',
            'Ads spend · Meta Ads kampane + ROAS',
            'Klienti · aktívni, retention, LTV',
            'Denné tasky · čo posunie firmu vpred',
            'Biznis health score · AI vyhodnotenie',
            'Najbližšie kroky · AI návrhy',
            'Tracker scriptov a roleplayov',
            'Týždenné a mesačné reporty',
          ]}
        />
      </main>
      <MobileNav />
    </>
  );
}
