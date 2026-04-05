# Hydroponic Greenhouse Assistant

He thong giam sat nha kinh san sang demo voi:

- Bang dieu khien web (Next.js + TypeScript + Tailwind)
- Du lieu cam bien/thiet bi mo phong
- Dieu khien cac kich ban bat thuong
- Danh gia canh bao voi muc do/giai thich/de xuat
- Cau truc luu tru Supabase (tuy chon luc chay)
- Cau truc tich hop tro ly Telegram qua OpenClaw

Tat ca du lieu trong du an nay deu la mo phong. Khong yeu cau phan cung that hoac secret that.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase JS SDK
- Node.js/TypeScript service logic

## Architecture

See [docs/architecture.md](docs/architecture.md).

Luong chinh:

1. Simulator tao reading binh thuong hoac reading bi anh huong boi kich ban.
2. Evaluator phat hien bat thuong va sinh canh bao.
3. Tang service cap nhat state va ghi Supabase khi duoc cau hinh.
4. Cac canh bao nghiem trong co the duoc day chu dong qua OpenClaw -> Telegram.
5. Dashboard poll API va hien thi chi so, trang thai, canh bao va dieu khien.

## Data model covered

Moi truong:

- light_intensity (umol/m2/s)
- temperature (C)
- humidity (%)
- co2 (ppm)

Dung dich dinh duong:

- ec (mS/cm)
- ph
- water_level (%)

Thiet bi:

- pump_status
- fan_status
- operating_time

Metadata:

- timestamp

## Scenario support

- normal
- high_temperature
- ph_drift
- low_ec
- falling_water_level
- fan_failure
- pump_off_too_long

## API endpoints

- `GET /api/state`: lay state nha kinh hien tai
- `POST /api/simulate/tick`: sinh them 1 tick mo phong
- `POST /api/scenario`: chuyen kich ban dang active
- `POST /api/assistant/query`: gui cau hoi cho tro ly
- `POST /api/integrations/openclaw/telegram`: endpoint adapter webhook OpenClaw

## Setup

1. Cai dependency:

```bash
npm install
```

2. Sao chep file env mau:

```bash
cp .env.example .env.local
```

3. Chay dev server:

```bash
npm run dev
```

4. Mo http://localhost:3000

## Tich hop Supabase (tuy chon)

Neu chua cau hinh env, ung dung van chay day du voi bo nho in-memory.

De bat luu tru tren Supabase:

1. Tao du an Supabase.
2. Chay SQL trong [supabase/schema.sql](supabase/schema.sql).
3. Dien gia tri trong `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Cau truc tich hop Telegram + OpenClaw

Repository nay co adapter abstraction cho luong nhan/gui Telegram qua OpenClaw:

- Outbound: day canh bao nghiem trong chu dong tu tang service.
- Inbound: endpoint kieu webhook de chuyen text dau vao thanh cau tra loi tro ly.

De bat gui nhan that, can dien:

- `OPENCLAW_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Neu thieu cac bien nay, luong gui nhan se duoc bo qua an toan va app van hoat dong.

## Cau hoi mau cho tro ly

- Nhiet do hien tai la bao nhieu?
- Nha kinh co on dinh khong?
- Co dieu kien bat thuong nao khong?
- Vi sao pH bi canh bao?
- Toi nen lam gi ngay bay gio?

## Ghi chu

- Day la app demo uu tien mo phong.
- State store mac dinh la in-memory de demo local khong can setup.
- Tranh su dung secret production trong repository nay.
