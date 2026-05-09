import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import ComingSoon from '@/components/ComingSoon';

export default function PersonalPage() {
  return (
    <>
      <TopBar />
      <main className="pb-24 lg:pb-0">
        <ComingSoon
          title="Osobné"
          description="Tvoj osobný systém — spánok, šport, meditácia, štúdium, vzťahy, návyky. Všetko na jednom mieste."
          features={[
            'Spánok · Garmin live (deep, REM, skóre)',
            'Šport · beh, workout, resting HR z Garminu',
            'Meditácia · streak, čas, intenzita',
            'Skincare rutina · AM + PM s checklistom',
            'Štúdium · maturita prep + materiály',
            'Anglický jazyk · čas trávený rozprávaním',
            'Kofeín tracker · denný limit',
            'Screen time · PC + telefón',
            'Dates · čas s priateľkou',
            'Timeline dňa · čo si robil hodinu po hodine',
          ]}
        />
      </main>
      <MobileNav />
    </>
  );
}
