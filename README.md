# Webpapp

Hệ thống **dashboard nhà kính thủy canh thông minh** kết hợp **IoT**, **AI phân tích**, và **agent thực thi OpenClaw** để theo dõi môi trường, phát hiện cảnh báo, hỗ trợ điều khiển và tương tác qua Telegram.

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Mục tiêu dự án](#mục-tiêu-dự-án)
- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Biến môi trường](#biến-môi-trường)
- [Luồng hoạt động](#luồng-hoạt-động)
- [Use cases tiêu biểu](#use-cases-tiêu-biểu)
- [Hướng phát triển](#hướng-phát-triển)
- [Tác giả](#tác-giả)

---

## Giới thiệu

Dự án này được xây dựng nhằm mô phỏng và giám sát một hệ thống **nông nghiệp thông minh / nhà kính thủy canh**.

Hệ thống cho phép:

- Hiển thị dữ liệu môi trường theo thời gian thực
- Theo dõi lịch sử cảm biến dưới dạng biểu đồ
- Phát hiện cảnh báo khi chỉ số vượt ngưỡng
- Hỗ trợ điều khiển thiết bị
- Phân tích trạng thái hệ thống bằng AI
- Tương tác với agent qua Telegram
- Lưu trữ dữ liệu lịch sử và truy vết vận hành bằng Supabase

Đây không chỉ là một dashboard IoT thông thường, mà là một mô hình **Agentic IoT System**: AI không chỉ quan sát mà còn hỗ trợ đưa ra quyết định và phối hợp thực thi hành động.

---

## Mục tiêu dự án

- Xây dựng dashboard trực quan cho hệ thống nhà kính thủy canh
- Chuẩn hóa luồng dữ liệu từ cảm biến đến UI
- Tích hợp rule engine để phát hiện cảnh báo tự động
- Tích hợp GPT-5.4 để phân tích tình trạng hệ thống
- Tích hợp OpenClaw để thực thi hành động và tương tác ngôn ngữ tự nhiên
- Lưu trữ lịch sử vận hành trên Supabase để phục vụ báo cáo và audit

---

## Tính năng chính

### 1. Monitoring Dashboard

- Hiển thị các chỉ số môi trường theo thời gian thực
- Theo dõi lịch sử dữ liệu bằng biểu đồ
- Hiển thị trạng thái thiết bị và cảnh báo
- Hỗ trợ theo dõi trực quan trên web

### 2. Rule Engine

- Kiểm tra ngưỡng các chỉ số như:
  - nhiệt độ
  - độ ẩm
  - CO₂
  - EC
  - pH
  - mực nước
  - ánh sáng
- Sinh cảnh báo khi môi trường vượt ngưỡng an toàn

### 3. AI Assistant

- Phân tích trạng thái hệ thống bằng GPT-5.4
- Trả lời câu hỏi bằng ngôn ngữ tự nhiên
- Đưa ra khuyến nghị vận hành
- Gợi ý hành động phù hợp theo ngữ cảnh

### 4. OpenClaw Integration

- Nhận yêu cầu từ người dùng qua Telegram
- Nhận khuyến nghị từ tầng AI / workflow
- Gọi API để thực thi hành động
- Phản hồi kết quả cho người dùng

### 5. Data Persistence

- Lưu readings, alerts, snapshots và logs
- Hỗ trợ truy vết lịch sử hệ thống
- Cung cấp dữ liệu cho dashboard và phân tích dài hạn

---

## Kiến trúc hệ thống

Hệ thống được tổ chức theo mô hình phân lớp đơn giản, dễ mở rộng:

### 1. Presentation Layer

Giao diện web hiển thị:

- chỉ số môi trường
- biểu đồ lịch sử
- cảnh báo
- trạng thái thiết bị

### 2. API Layer

Xử lý:

- request từ frontend
- webhook từ Telegram / OpenClaw
- validation và chuẩn hóa response

### 3. Business Logic & Rule Engine

Xử lý:

- logic nghiệp vụ
- phát hiện cảnh báo theo ngưỡng
- đánh giá trạng thái môi trường
- mô phỏng / xử lý kịch bản điều khiển

### 4. AI Decision Layer

GPT-5.4 chịu trách nhiệm:

- phân tích dữ liệu hệ thống
- hiểu câu hỏi người dùng
- sinh tư vấn vận hành
- đề xuất hành động

### 5. Agent Execution Layer

OpenClaw chịu trách nhiệm:

- nhận yêu cầu từ Telegram
- gọi API điều khiển hệ thống
- thực thi hành động thật
- gửi phản hồi cho người dùng

### 6. Data Layer

Supabase lưu:

- readings
- alerts
- scenarios
- snapshots
- logs

---

## Công nghệ sử dụng

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

## Cấu trúc thư mục

```bash
.
├── docs/                  # Tài liệu dự án
├── public/                # Static assets
├── src/                   # Mã nguồn chính
├── supabase/              # Cấu hình / migration / script liên quan Supabase
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

## Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone <your-repo-url>
cd Webpapp
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Chạy môi trường phát triển

```bash
npm run dev
```

Ứng dụng sẽ chạy tại:

- http://localhost:3000

### 4. Build production

```bash
npm run build
npm start
```

---

## Biến môi trường

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENCLAW_BASE_URL=http://127.0.0.1:18789
```

Nếu bạn dùng cấu hình auth riêng cho OpenClaw hoặc Codex/OAuth, hãy thay đổi cho phù hợp với môi trường triển khai.

---

## Luồng hoạt động

1. Dữ liệu cảm biến hoặc bộ mô phỏng được gửi vào hệ thống
2. API Next.js tiếp nhận và chuẩn hóa dữ liệu
3. Rule Engine kiểm tra ngưỡng và tạo cảnh báo nếu cần
4. Dashboard hiển thị dữ liệu theo thời gian thực
5. GPT-5.4 phân tích trạng thái môi trường và câu hỏi người dùng
6. OpenClaw nhận quyết định hoặc yêu cầu điều khiển
7. OpenClaw gọi API để thực thi hành động
8. Kết quả được lưu vào Supabase và phản hồi lại UI / Telegram

---

## Use cases tiêu biểu

### 1. Giám sát môi trường

Người dùng mở dashboard để xem:

- nhiệt độ
- độ ẩm
- CO₂
- EC
- pH
- mực nước
- cường độ ánh sáng

### 2. Phát hiện cảnh báo

Khi một chỉ số vượt ngưỡng:

- rule engine sinh cảnh báo
- dashboard hiển thị trạng thái bất thường
- hệ thống có thể gửi thông báo hoặc gợi ý xử lý

### 3. Hỏi đáp với AI

Người dùng hỏi:

"Tình trạng nhà kính hiện tại có ổn không?"

Hệ thống sẽ:

- lấy dữ liệu mới nhất
- phân tích bằng GPT-5.4
- trả lời bằng ngôn ngữ tự nhiên
- đưa ra khuyến nghị nếu môi trường chưa tối ưu

### 4. Điều khiển qua agent

Người dùng gửi lệnh qua Telegram:

"Bật quạt và kiểm tra lại nhiệt độ"

OpenClaw sẽ:

- nhận yêu cầu
- gọi API điều khiển
- lưu log
- phản hồi kết quả

---

## Hướng phát triển

- Hoàn thiện điều khiển tự động theo rule
- Bổ sung dự báo xu hướng dữ liệu
- Mở rộng hỗ trợ nhiều thiết bị và nhiều khu vực trồng
- Tối ưu phân quyền người dùng
- Tích hợp thêm nhiều kênh cảnh báo ngoài Telegram
- Nâng cấp AI để gợi ý vận hành chính xác hơn

---

## Tác giả

- Nguyễn Hoàng Tùng
- Nguyễn Chí Minh
- Phạm Ngọc Kỳ Sơn

Dự án: IoT Agentic  
Repo: Webpapp

---

## Ghi chú

Dự án phục vụ cho mục đích:

- học tập
- nghiên cứu
- mô phỏng hệ thống IoT thông minh
