import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import ComingSoon from '@/components/ComingSoon';

export default function FinancePage() {
  return (
    <>
      <TopBar />
      <main className="pb-24 lg:pb-0">
        <ComingSoon
          title="Financie"
          description="Detailný prehľad tržieb, nákladov, čistého zisku a marže — firma + osobné. Live napojené na Stripe a SuperFaktúru."
          features={[
            'Tržby firmy live zo Stripe + SuperFaktúra',
            'Náklady firmy: Meta Ads spend, editori, software, iné',
            'Osobné výdavky a budgeting',
            'Čistý zisk + marža · trend 7d / 30d / 90d / YTD',
            'Breakdown nákladov s vizualizáciou',
            'Tabuľka transakcií + filter',
            'Faktúry · stav (vystavené / zaplatené / po splatnosti)',
            'Export pre účtovníčku jedným klikom',
          ]}
        />
      </main>
      <MobileNav />
    </>
  );
}
