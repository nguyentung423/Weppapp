# Kien truc va cau truc thu muc

## Luong tong quan

1. Simulator tao reading binh thuong hoac reading bi anh huong boi kich ban.
2. Evaluator phat hien bat thuong, gan muc do va tao khuyen nghi.
3. Tang service cap nhat state in-memory va ghi Supabase (neu da cau hinh).
4. Cac canh bao nghiem trong co the duoc day chu dong qua OpenClaw -> Telegram.
5. API routes cua Next.js cung cap state, tick mo phong, doi kich ban va cau tra loi tro ly.
6. Dashboard poll API de hien thi chi so, canh bao va dieu khien.

## Cau truc thu muc

```txt
src/
  app/
    api/
      assistant/query/route.ts
      integrations/openclaw/telegram/route.ts
      scenario/route.ts
      simulate/tick/route.ts
      state/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    dashboard.tsx
  lib/
    config/env.ts
    integrations/telegramOpenClaw.ts
    logic/assistant.ts
    logic/evaluator.ts
    services/greenhouseService.ts
    simulator/generator.ts
    simulator/random.ts
    store/inMemoryStore.ts
    supabase/client.ts
    supabase/repository.ts
    types/domain.ts
```

## Luu y thiet ke

- Tat ca chi so deu la mo phong; khong phu thuoc phan cung that.
- Neu thieu bien moi truong, cac tich hop ben ngoai se tu dong duoc tat an toan.
- Supabase la tuy chon luc chay; in-memory store van giu demo hoat dong khi khong co credentials.
- Tich hop OpenClaw duoc tach theo kieu adapter de de mo rong hanh vi kenh giao tiep.
