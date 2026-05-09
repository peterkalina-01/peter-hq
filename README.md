# Peter HQ — Command Center

Personálny + biznis operačný systém pre Petra Kalinu (LeadsFlow Media).

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PWA-ready** (manifest + ikona)
- **Mobile-first responsive**

## Lokálne spustenie

```bash
npm install
npm run dev
```

Otvor [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel — krok za krokom

### 1) Pushni na GitHub
- Vytvor nový repo na GitHub: `peter-hq`
- V terminále z tohto priečinka:

```bash
git init
git add .
git commit -m "Initial commit — Peter HQ command center"
git branch -M main
git remote add origin https://github.com/peterkalina-01/peter-hq.git
git push -u origin main
```

### 2) Pripoj Vercel
- Choď na [vercel.com](https://vercel.com)
- Sign up / Login cez GitHub (peterkalina-01)
- Klikni **Add New Project**
- Vyber repo `peter-hq`
- Klikni **Deploy** (žiadne extra nastavenia netreba)
- Po 30 sekundách máš live URL

### 3) Premenuj subdoménu
- V projekte → **Settings** → **Domains**
- Pridaj alebo zmeň na `peter-hq.vercel.app`

### 4) Pridaj na home screen telefónu
- Otvor `https://peter-hq.vercel.app` v Safari (iOS) alebo Chrome (Android)
- iOS: tlačidlo Share → **Pridať na plochu**
- Android: tlačidlo menu → **Pridať na hlavnú obrazovku**
- Apka funguje ako natívna

## Štruktúra

```
app/
  page.tsx           — Dashboard (hlavná stránka)
  finance/           — Finančný prehľad (coming soon)
  personal/          — Osobné metriky (coming soon)
  business/          — Biznis dashboard (coming soon)
  mentor/            — AI mentor (coming soon)
  sales/             — Sales coach + roleplay (coming soon)
  layout.tsx         — Root layout s PWA setup
  globals.css        — Globálne štýly + Tailwind
components/
  TopBar.tsx         — Hore navigácia
  MobileNav.tsx      — Spodná nav na mobile
  Hero.tsx           — Greeting + vízia
  KpiStrip.tsx       — Biznis KPI
  DayModules.tsx     — Spánok, šport, timeline, skincare, calls, pipeline
  MentorSection.tsx  — 3 AI karty
  Subscriptions.tsx  — Predplatné
  FooterMetrics.tsx  — Mini metriky
public/
  manifest.json      — PWA manifest
  icon.svg           — Logo
```

## Roadmap
- **Fáza 1 (live)**: Dashboard s mockup dátami ✅
- **Fáza 2**: Supabase databáza + ukladanie zmien
- **Fáza 3**: Stripe + SuperFaktúra + Garmin + Meta + GHL napojenie
- **Fáza 4**: Claude AI mentor + Sales coach
- **Fáza 5**: ElevenLabs realtime voice roleplay
