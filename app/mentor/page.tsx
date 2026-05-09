import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import ComingSoon from '@/components/ComingSoon';

export default function MentorPage() {
  return (
    <>
      <TopBar />
      <main className="pb-24 lg:pb-0">
        <ComingSoon
          title="Mentor"
          description="Tvoj osobný AI mentor s pamäťou. Pozná tvoju víziu, tvoj týždeň, tvoj spánok, tvoje cally a tvoj pokrok. Hovor s ním ako s človekom."
          features={[
            'Trvalá pamäť · vie kto si a čo robíš',
            'Kontext z celej apky · spánok, biznis, financie, štúdium',
            'Text alebo hlas (ElevenLabs / OpenAI Realtime)',
            'Denné check-iny · "Ako šiel deň?"',
            'Týždenné reflection · čo fungovalo, čo nie',
            'Goal setting · pomáha ti rozbiť víziu na kroky',
            'Mindset coaching keď to potrebuješ',
            'Žiadne generické rady — pozná tvoj kontext',
          ]}
        />
      </main>
      <MobileNav />
    </>
  );
}
