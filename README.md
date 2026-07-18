# IELTS Control

IELTS imtihoniga tayyorgarlik ko'rish uchun veb-sayt. Barcha 4 ta bo'lim
(Reading, Listening, Writing, Speaking) mavjud. Reading va Listening
avtomatik baholanadi; Writing va Speaking javoblarini Claude (Anthropic)
IELTS band-score mezonlari asosida tahlil qiladi.

## Ishga tushirish

1. Bog'liqliklarni o'rnating:

   ```bash
   npm install
   ```

2. `.env.example` faylidan nusxa oling va to'ldiring:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` / `DIRECT_URL` — Postgres ulanish satrlari (masalan [Neon](https://neon.tech) bepul rejasidan)
   - `AUTH_SECRET` — `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` orqali generatsiya qiling
   - `ANTHROPIC_API_KEY` — Writing/Speaking bo'limlarini AI baholashi uchun kerak. [console.anthropic.com](https://console.anthropic.com/settings/keys) dan oling. Kalit qo'yilmasa, boshqa bo'limlar ishlayveradi, faqat Writing/Speaking AI baholashi xato qaytaradi.

3. Bazani yarating va namunaviy testlarni yuklang:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Dasturni ishga tushiring:

   ```bash
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) manzilida ochiladi.

## Texnologiyalar

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL (Neon)
- Auth.js (NextAuth v5) — email/parol orqali ro'yxatdan o'tish va kirish
- Anthropic SDK (Claude) — Writing/Speaking javoblarini baholash
- Brauzer Web Speech API — Listening uchun matndan ovoz (TTS), Speaking uchun ovozdan matn (STT)

## Eslatmalar

- Reading/Listening band-score konversiyasi taxminiy foizga asoslangan egri chiziq — rasmiy IELTS 40 savolli jadvaliga aynan mos emas.
- Speaking bo'limida "Pronunciation" bahosi faqat matn transkripti asosida taxminiy hisoblanadi — haqiqiy talaffuzni audio orqaligina to'liq baholash mumkin.
- Barcha test kontenti (Reading matnlari, Listening skriptlari, Writing/Speaking mavzulari) original — IELTS rasmiy materiallaridan nusxa olinmagan.
