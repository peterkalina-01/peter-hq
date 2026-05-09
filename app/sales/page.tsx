import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import ComingSoon from '@/components/ComingSoon';

export default function SalesPage() {
  return (
    <>
      <TopBar />
      <main className="pb-24 lg:pb-0">
        <ComingSoon
          title="Sales · Coach + Roleplay"
          description="Tvoj sales tréner a roleplay partner. Hodíš transcript callu — dostaneš detailný breakdown. Vyber profil prospekta — predávaj v reálnom čase hlasom."
          features={[
            'Sales coach · analýza transcriptov callov',
            'Hodnotenie podľa tvojho 9-bodového Hormozi frameworku',
            'Detailný feedback · čo si mohol povedať inak',
            'Skóre · štruktúra, námietky, closing',
            'Roleplay · text mode (rýchly)',
            'Roleplay · realtime voice (ElevenLabs)',
            'Profily prospektov · skeptický, cenovo citlivý, ľahký close, vyhovárky',
            'Po session · automatický feedback od coacha',
            'Tracker · koľko roleplayov + sessions týždenne',
            'Knižnica scriptov a hookov',
          ]}
        />
      </main>
      <MobileNav />
    </>
  );
}
