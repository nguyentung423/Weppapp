# Webpapp

He thong **dashboard nha kinh thuy canh thong minh** ket hop **IoT**, **AI phan tich**, va **agent thuc thi OpenClaw** de theo doi moi truong, phat hien canh bao, ho tro dieu khien va tuong tac qua Telegram.

---

## Muc luc

- [Gioi thieu](#gioi-thieu)
- [Muc tieu du an](#muc-tieu-du-an)
- [Tinh nang chinh](#tinh-nang-chinh)
- [Kien truc he thong](#kien-truc-he-thong)
- [Cong nghe su dung](#cong-nghe-su-dung)
- [Cau truc thu muc](#cau-truc-thu-muc)
- [Cai dat va chay du an](#cai-dat-va-chay-du-an)
- [Bien moi truong](#bien-moi-truong)
- [Luong hoat dong](#luong-hoat-dong)
- [Use cases tieu bieu](#use-cases-tieu-bieu)
- [Huong phat trien](#huong-phat-trien)
- [Tac gia](#tac-gia)

---

## Gioi thieu

Du an nay duoc xay dung nham mo phong va giam sat mot he thong **nong nghiep thong minh / nha kinh thuy canh**.

He thong cho phep:

- Hien thi du lieu moi truong theo thoi gian thuc
- Theo doi lich su cam bien duoi dang bieu do
- Phat hien canh bao khi chi so vuot nguong
- Ho tro dieu khien thiet bi
- Phan tich trang thai he thong bang AI
- Tuong tac voi agent qua Telegram
- Luu tru du lieu lich su va truy vet van hanh bang Supabase

Day khong chi la mot dashboard IoT thong thuong, ma la mot mo hinh **Agentic IoT System**: AI khong chi quan sat ma con ho tro dua ra quyet dinh va phoi hop thuc thi hanh dong.

---

## Muc tieu du an

- Xay dung dashboard truc quan cho he thong nha kinh thuy canh
- Chuan hoa luong du lieu tu cam bien den UI
- Tich hop rule engine de phat hien canh bao tu dong
- Tich hop GPT-5.4 de phan tich tinh trang he thong
- Tich hop OpenClaw de thuc thi hanh dong va tuong tac ngon ngu tu nhien
- Luu tru lich su van hanh tren Supabase de phuc vu bao cao va audit

---

## Tinh nang chinh

### 1. Monitoring Dashboard

- Hien thi cac chi so moi truong theo thoi gian thuc
- Theo doi lich su du lieu bang bieu do
- Hien thi trang thai thiet bi va canh bao
- Ho tro theo doi truc quan tren web

### 2. Rule Engine

- Kiem tra nguong cac chi so nhu:
  - nhiet do
  - do am
  - CO2
  - EC
  - pH
  - muc nuoc
  - anh sang
- Sinh canh bao khi moi truong vuot nguong an toan

### 3. AI Assistant

- Phan tich trang thai he thong bang GPT-5.4
- Tra loi cau hoi bang ngon ngu tu nhien
- Dua ra khuyen nghi van hanh
- Goi y hanh dong phu hop theo ngu canh

### 4. OpenClaw Integration

- Nhan yeu cau tu nguoi dung qua Telegram
- Nhan khuyen nghi tu tang AI / workflow
- Goi API de thuc thi hanh dong
- Phan hoi ket qua cho nguoi dung

### 5. Data Persistence

- Luu readings, alerts, snapshots va logs
- Ho tro truy vet lich su he thong
- Cung cap du lieu cho dashboard va phan tich dai han

---

## Kien truc he thong

He thong duoc to chuc theo mo hinh phan lop don gian, de mo rong:

### 1. Presentation Layer

Giao dien web hien thi:

- chi so moi truong
- bieu do lich su
- canh bao
- trang thai thiet bi

### 2. API Layer

Xu ly:

- request tu frontend
- webhook tu Telegram / OpenClaw
- validation va chuan hoa response

### 3. Business Logic & Rule Engine

Xu ly:

- logic nghiep vu
- phat hien canh bao theo nguong
- danh gia trang thai moi truong
- mo phong / xu ly kich ban dieu khien

### 4. AI Decision Layer

GPT-5.4 chiu trach nhiem:

- phan tich du lieu he thong
- hieu cau hoi nguoi dung
- sinh tu van van hanh
- de xuat hanh dong

### 5. Agent Execution Layer

OpenClaw chiu trach nhiem:

- nhan yeu cau tu Telegram
- goi API dieu khien he thong
- thuc thi hanh dong that
- gui phan hoi cho nguoi dung

### 6. Data Layer

Supabase luu:

- readings
- alerts
- scenarios
- snapshots
- logs

---

## Cong nghe su dung

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend / API

- Next.js API Routes

### Database

- Supabase

### AI / Agent

- GPT-5.4
- OpenClaw

### External Integration

- Telegram Bot API

### Tooling

- ESLint
- PostCSS

---

## Cau truc thu muc

```bash
.
├── docs/                  # Tai lieu du an
├── public/                # Static assets
├── src/                   # Ma nguon chinh
├── supabase/              # Cau hinh / migration / script lien quan Supabase
├── .gitignore
├── README.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Cai dat va chay du an

### 1. Clone repository

```bash
git clone <your-repo-url>
cd Webpapp
```

### 2. Cai dependencies

```bash
npm install
```

### 3. Chay moi truong phat trien

```bash
npm run dev
```

Ung dung se chay tai:

- http://localhost:3000

### 4. Build production

```bash
npm run build
npm start
```

---

## Bien moi truong

Tao file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENCLAW_BASE_URL=http://127.0.0.1:18789
```

Neu ban dung cau hinh auth rieng cho OpenClaw hoac Codex/OAuth, hay thay doi cho phu hop voi moi truong trien khai.

---

## Luong hoat dong

1. Du lieu cam bien hoac bo mo phong duoc gui vao he thong
2. API Next.js tiep nhan va chuan hoa du lieu
3. Rule Engine kiem tra nguong va tao canh bao neu can
4. Dashboard hien thi du lieu theo thoi gian thuc
5. GPT-5.4 phan tich trang thai moi truong va cau hoi nguoi dung
6. OpenClaw nhan quyet dinh hoac yeu cau dieu khien
7. OpenClaw goi API de thuc thi hanh dong
8. Ket qua duoc luu vao Supabase va phan hoi lai UI / Telegram

---

## Use cases tieu bieu

### 1. Giam sat moi truong

Nguoi dung mo dashboard de xem:

- nhiet do
- do am
- CO2
- EC
- pH
- muc nuoc
- cuong do anh sang

### 2. Phat hien canh bao

Khi mot chi so vuot nguong:

- rule engine sinh canh bao
- dashboard hien thi trang thai bat thuong
- he thong co the gui thong bao hoac goi y xu ly

### 3. Hoi dap voi AI

Nguoi dung hoi:

"Tinh trang nha kinh hien tai co on khong?"

He thong se:

- lay du lieu moi nhat
- phan tich bang GPT-5.4
- tra loi bang ngon ngu tu nhien
- dua ra khuyen nghi neu moi truong chua toi uu

### 4. Dieu khien qua agent

Nguoi dung gui lenh qua Telegram:

"Bat quat va kiem tra lai nhiet do"

OpenClaw se:

- nhan yeu cau
- goi API dieu khien
- luu log
- phan hoi ket qua

---

## Huong phat trien

- Hoan thien dieu khien tu dong theo rule
- Bo sung du bao xu huong du lieu
- Mo rong ho tro nhieu thiet bi va nhieu khu vuc trong
- Toi uu phan quyen nguoi dung
- Tich hop them nhieu kenh canh bao ngoai Telegram
- Nang cap AI de goi y van hanh chinh xac hon

---

## Tac gia

- Nguyen Hoang Tung
- Nguyen Chi Minh
- Pham Ngoc Ky Son

Du an: IoT Agentic  
Repo: Webpapp

---

## Ghi chu

Du an phuc vu cho muc dich:

- hoc tap
- nghien cuu
- mo phong he thong IoT thong minh
