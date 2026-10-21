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

## Sảnh và đăng nhập demo

- `/demo`: sảnh Aurora Play độc lập, lọc danh mục, tìm kiếm và xem mô tả thẻ.
- `/demo/login`: trang đăng nhập minh họa với thông tin cố định, chỉ đọc; tiếp tục dưới dạng khách.
- Nút Truy cập web ở trang giới thiệu mở `/login`.
- `/api/submit` trả HTTP 410, không đọc request body, không ghi file, không gửi Sheets/Telegram.
- Các trường tài khoản/mật khẩu trong HTML trang giới thiệu bị disabled từ server.
- Các biến cấu hình tích hợp cũ không còn được mã ứng dụng sử dụng. Dữ liệu lịch sử trong `data/`, nếu có, không được mở hoặc thay đổi bởi bản cập nhật này.
- Kiểm tra: `node scripts/verify-demo.mjs`; kiểm tra HTTP khi server chạy: `node scripts/verify-demo.mjs http://localhost:3002`.

## Trang login theo mẫu

- `/login`: màn hình chào và hộp đăng nhập dùng ảnh nền, sprite và font tải từ trang tham khảo.
- Các asset được phục vụ cục bộ trong `public/login/`; không chạy mã Cocos, API đăng nhập hoặc tracking của website gốc.
- Form là giao diện minh họa, các trường chỉ đọc; nút đăng nhập hiển thị popup thông báo.
- Bố cục giữ tỷ lệ sân khấu 1280 × 720, tự thu phóng theo viewport. CAPTCHA là mẫu cục bộ, không phải CAPTCHA của dịch vụ gốc.
