# Hydroponic Greenhouse Assistant

Tai lieu huong dan cai dat va van hanh du an.

Du an la he thong dashboard giam sat nha kinh thuy canh, co mo phong du lieu, canh bao bat thuong, API dieu khien, va tich hop OpenClaw + Telegram.

## 1) Tong quan

Tinh nang chinh:

- Dashboard web (Next.js + TypeScript)
- Mo phong chi so moi truong va dinh duong
- Dieu khien thiet bi (pump, fan, lights, curtain, CO2)
- Can bang pH theo lenh
- Chuyen kich ban van hanh (scenario)
- API tro ly va webhook OpenClaw
- Luu tru du lieu tren Supabase (tuy chon)

Luu y:

- Neu khong cau hinh Supabase, app van chay bang in-memory store.
- Du lieu trong du an la mo phong, phu hop demo va nghien cuu luong xu ly.

## 2) Yeu cau he thong

- Node.js 20+
- npm 10+
- He dieu hanh: macOS, Linux, hoac Windows

Kiem tra nhanh:

```bash
node -v
npm -v
```

## 3) Cai dat du an

### Buoc 1: Clone source

```bash
git clone <repo-url>
cd hydroponic-greenhouse-assistant
```

### Buoc 2: Cai dependencies

```bash
npm install
```

### Buoc 3: Tao file env

```bash
cp .env.example .env.local
```

Noi dung .env.example:

```env
# Supabase (optional for demo, leave blank to run in-memory only)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Telegram/OpenClaw integration (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
OPENCLAW_WEBHOOK_URL=
```

## 4) Chay du an

### Development mode

```bash
npm run dev
```

Mo trinh duyet tai:

- http://localhost:3000

### Production mode

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

## 5) Van hanh he thong

### 5.1 Van hanh co ban

1. Mo Dashboard tai trang chu.
2. Theo doi cac card metric: nhiet do, do am, CO2, EC, pH, muc nuoc.
3. Neu metric lech nguong, card se hien canh bao nhe (vien vang + icon).
4. Dung khu Dieu khien thiet bi de bat/tat va dieu chinh thong so.
5. Dung trang Cai dat de chuyen scenario khi can test tinh huong bat thuong.

### 5.2 Doi scenario

- Scenario duoc cap nhat qua API scenario.
- Sau khi doi scenario, du lieu se phan ung sau khoang 10 giay.

### 5.3 Tich hop OpenClaw

Muc tieu:

- OpenClaw goi API de dieu khien he thong.
- OpenClaw/Telegram gui cau hoi de lay cau tra loi tro ly.

Can cau hinh bien moi truong:

- OPENCLAW_WEBHOOK_URL
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

Neu thieu bien, app van chay nhung luong gui ra ben ngoai se duoc bo qua an toan.

## 6) Supabase (tuy chon)

Neu muon luu du lieu ben vung:

1. Tao project Supabase.
2. Chay schema SQL trong file supabase/schema.sql.
3. Dien NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY vao .env.local.

Khi co Supabase, he thong se:

- Luu snapshot readings
- Luu alerts
- Luu scenario state
- Doc history cho API history

## 7) API endpoints chinh

- GET /api/state
  - Lay trang thai nha kinh hien tai

- GET /api/history?window=30m|2h
  - Lay lich su theo khung thoi gian

- GET /api/devices/control
  - Lay trang thai dieu khien thiet bi

- POST /api/devices/control
  - Cap nhat dieu khien thiet bi

- POST /api/devices/ph-balance
  - Can bang pH theo mode va so giot

- POST /api/scenario
  - Chuyen scenario

- POST /api/simulate/tick
  - Chay 1 tick mo phong thu cong

- POST /api/assistant/query
  - Hoi tro ly

- POST /api/integrations/openclaw/telegram
  - Webhook/adapter OpenClaw Telegram

## 8) Cau truc thu muc quan trong

```txt
src/
   app/
      api/
   components/
      dashboard.tsx
   lib/
      services/greenhouseService.ts
      logic/evaluator.ts
      logic/assistant.ts
      simulator/generator.ts
      store/
      supabase/
```

Tai lieu kien truc bo sung:

- docs/architecture.md

## 9) Scripts

- npm run dev: chay local dev
- npm run build: build production
- npm run start: chay ban build
- npm run lint: kiem tra lint

## 10) Troubleshooting

### Loi port da duoc su dung

- Dung process dang chiem port 3000 hoac doi port cho Next.js.

### Khong thay du lieu thay doi

- Kiem tra dev server dang chay.
- Kiem tra API state va history co response 200.
- Kiem tra scenario vua doi va doi khoang 10 giay de thay doi phan anh.

### Khong gui duoc Telegram/OpenClaw

- Kiem tra OPENCLAW_WEBHOOK_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
- Kiem tra outbound network tu moi truong runtime.

## 11) Ghi chu bao mat

- Khong commit .env.local len git.
- Khong su dung secret production trong moi truong demo.
- Nen them co che auth/verify cho API dieu khien truoc khi public internet.
