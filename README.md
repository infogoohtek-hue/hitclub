# HITCLUB — Next.js 14

Bản giao diện cục bộ được tái dựng từ https://hitclub.istanbul/ ngày 21/10/2026.

## Chạy dự án

Yêu cầu Node.js 20 trở lên.

```bash
npm ci
npm run dev
```

Mở http://localhost:3000. Nếu cổng đã được sử dụng: `npm run dev -- --port 3001`.

```bash
npm run build
npm start
```

## Nội dung

- Next.js **14.2.35**, React 18, TypeScript, App Router.
- 18 trang tĩnh: trang chủ, đại sứ thương hiệu, hướng dẫn, tin tức và 5 bài viết, liên hệ, giới thiệu, cảnh báo và các chính sách.
- 218 tài nguyên gốc trong `public/`: ảnh, banner, nền, GIF và font. Không hotlink hình ảnh hay tải Google Fonts khi truy cập.
- Giữ CSS, các breakpoint responsive và nội dung từ bản mẫu; slider được khởi tạo lại bằng Swiper.
- Form có kiểm tra dữ liệu, đổi mã demo, hiện/ẩn mật khẩu; popup, trở về đầu trang và điều hướng nội bộ hoạt động.

## Cấu trúc

- `src/app/[[...slug]]/page.tsx`: routing và metadata từng trang, tạo HTML tĩnh lúc build.
- `src/components/ReferencePage.tsx`: tương tác React phía client.
- `src/content/pages.json`: HTML tĩnh đã loại bỏ script, iframe, inline handler và trường tracking từ website gốc; được render dưới dạng snapshot để giữ cấu trúc giao diện chính xác. Chỉ sử dụng nội dung đã kiểm tra, không đưa HTML từ người dùng vào đây.
- `src/content/assets-manifest.json`: URL nguồn và kích thước từng tài nguyên.
- `public/build/reference.css`: stylesheet gốc với đường dẫn tài nguyên cục bộ.
- `src/app/globals.css`: CSS bổ sung cho trạng thái demo và accessibility.
- `scripts/sync-reference.mjs`: tải lại nội dung và tài nguyên (cần mạng, `curl.exe`, dùng trên Windows).

## Phạm vi và khác biệt

Đây là **frontend**, chưa có backend tài khoản, game, thanh toán, tải APK hay live chat. Form không gửi hoặc lưu thông tin tài khoản. CAPTCHA là mã demo cục bộ, không phải cơ chế bảo mật production. Video livestream không được sao chép; giữ khung và ảnh nền. Các chức năng chưa kết nối sẽ thông báo rõ trong popup.

Các liên kết Telegram, đối tác, số điện thoại và QR trong ảnh vẫn là dữ liệu của trang gốc. Cần cấu hình lại khi sử dụng với thương hiệu/dịch vụ của bạn. Metadata hiện đặt `noindex` cho bản sao giao diện.

Ảnh và CSS gốc được giữ nguyên nội dung trực quan, nhưng không cam kết pixel-perfect 100% trên mọi thiết bị; font rendering, nội dung động, livestream và CAPTCHA có thể khác.

## Kiểm tra

```bash
node scripts/verify-source.mjs
npm run build
```

Script xác minh hình ảnh tồn tại, không có hotlink ảnh hay script/iframe/inline handler từ trang gốc, và liệt kê liên kết nội bộ thiếu. Development và production sử dụng thư mục build riêng (`.next-dev` / `.next`).

Tải lại dữ liệu: `npm run sync:reference`. Lệnh này ghi đè snapshot nội dung, CSS và tài nguyên; kiểm tra diff trước khi sử dụng bản cập nhật.
