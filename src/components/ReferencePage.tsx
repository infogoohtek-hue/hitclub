'use client';

import { useEffect, useRef, useState } from 'react';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import { captchaMarkup } from './captcha';

/** Markup is a reviewed, sanitized, build-time snapshot, never user-supplied HTML. */
export default function ReferencePage({ html }: { html: string }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { if (message) dialog.current?.showModal(); }, [message]);

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    let captcha = 'HIT826';
    const initialCaptcha = host.querySelector('.recaptcha-bg');
    if (initialCaptcha) initialCaptcha.innerHTML = captchaMarkup(captcha);
    const slider = host.querySelector<HTMLElement>('#sliderbanner');
    const multi = !!slider && slider.querySelectorAll('.swiper-slide').length > 1;
    const swiper = slider ? new Swiper(slider, {
      modules: [Autoplay, Pagination], slidesPerView: 1, loop: multi,
      autoplay: multi ? { delay: 2500, disableOnInteraction: false } : false,
      pagination: { el: slider.querySelector<HTMLElement>('.swiper-pagination'), clickable: true },
    }) : null;
    const closeForm = () => {
      host.querySelector('.formmodal')?.classList.remove('active');
      document.body.classList.remove('no-scroll');
    };
    const click = (event: Event) => {
      const el = event.target as HTMLElement;
      const action = el.closest<HTMLElement>('[data-action]')?.dataset.action || '';
      if (el.closest('.icon-prepend')) {
        const password = host.querySelector<HTMLInputElement>('#pwd');
        if (password) password.type = password.type === 'password' ? 'text' : 'password';
        el.closest('.icon-prepend')?.classList.toggle('fa-eye-slash');
      } else if (el.closest('.capcha_icon')) {
        captcha = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '8');
        const box = host.querySelector('.recaptcha-bg');
        if (box) { box.innerHTML = captchaMarkup(captcha); box.setAttribute('aria-label', 'Mã xác nhận demo ' + captcha); }
      } else if (el.closest('.ftevent')) {
        el.closest('.ftevent')?.classList.toggle('active');
        host.querySelector('.ftdes')?.classList.toggle('active');
      } else if (el.closest('.click-oc')) host.querySelector('.ballon_mobile')?.classList.toggle('is-open');
      else if (el.closest('.submenu') && !el.closest('a[href]')) el.closest('.submenu')?.classList.toggle('active');
      else if (el.closest('.closeform, .modal_backdrop')) closeForm();
      else if (action.includes('onPlayRegister')) {
        host.querySelector('.formmodal')?.classList.add('active');
        document.body.classList.add('no-scroll');
        host.querySelector<HTMLInputElement>('#usrname')?.focus();
      } else if (el.closest('.pagetotop')) window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (el.closest('.icondown')) host.querySelector('#seoInfo')?.scrollIntoView({ behavior: 'smooth' });
      else if (el.closest('.downloadGuideApk')) window.location.href = '/huong-dan-tai-game';
      else if (el.closest('.eventlivechat')) setMessage('Hỗ trợ trực tuyến chưa được kết nối trong bản giao diện demo. Bạn có thể xem thông tin tại trang Liên hệ.');
      else if (/onPlayWeb|onDownload|detectOS|1111Download/.test(action)) {
        event.preventDefault();
        setMessage('Đây là bản giao diện demo. Chưa cấu hình đường dẫn chơi game hoặc tải ứng dụng.');
      } else if (/soundOn|soundOff/.test(action)) {
        setMessage('Video trực tiếp chưa được kết nối trong bản giao diện demo.');
      } else if (el.closest('a:not([href])')) {
        setMessage('Liên kết này chưa được cấu hình trên trang mẫu.');
      }
    };
    const submit = (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      if (form.id !== 'registerForm') { setMessage('Biểu mẫu demo chưa kết nối dịch vụ gửi dữ liệu.'); return; }
      form.querySelectorAll('.errors').forEach(el => el.remove());
      const data = new FormData(form);
      const username = String(data.get('username') || '');
      const password = String(data.get('password') || '');
      const code = String(data.get('captcha') || '');
      const errors: [string, string][] = [];
      if (!/^[a-zA-Z0-9]{6,15}$/.test(username)) errors.push(['username', 'Tên đăng nhập gồm 6–15 chữ cái hoặc chữ số.']);
      if (password.length < 6 || password.length > 15) errors.push(['password', 'Mật khẩu gồm 6–15 ký tự.']);
      if (code.toUpperCase() !== captcha) errors.push(['captcha', 'Mã xác nhận không đúng.']);
      errors.forEach(([name, text]) => {
        const error = document.createElement('div'); error.className = 'errors'; error.textContent = text; error.setAttribute('role', 'alert');
        form.querySelector(`[name="${name}"]`)?.closest('.form-group')?.append(error);
      });
      if (errors.length) { form.querySelector<HTMLInputElement>(`[name="${errors[0][0]}"]`)?.focus(); return; }
      form.reset();
      setMessage('Thông tin hợp lệ. Đây là bản demo giao diện: chưa tạo tài khoản và không gửi hoặc lưu tên đăng nhập, mật khẩu.');
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeForm();
      if ((event.key === 'Enter' || event.key === ' ') && (event.target as HTMLElement).matches('[role="button"]')) {
        event.preventDefault(); (event.target as HTMLElement).click();
      }
    };
    const scroll = () => {
      host.querySelector('.icondown')?.classList.toggle('active', window.scrollY > 50);
      const top = host.querySelector<HTMLElement>('.pagetotop');
      if (top) top.style.display = window.scrollY > 100 ? 'block' : 'none';
    };
    const change = (event: Event) => {
      const select = event.target as HTMLSelectElement;
      if (select.id === 'phoneSelect' && /^\+\d+$/.test(select.value)) window.location.href = 'tel:' + select.value;
    };
    host.querySelectorAll<HTMLElement>('[data-action], .closeform, .pagetotop, .icondown, .eventlivechat, .ftevent, .click-oc, .submenu').forEach(el => {
      el.setAttribute('role', 'button'); el.tabIndex = 0;
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.querySelector('img')?.alt || 'Mở chức năng');
    });
    host.addEventListener('click', click);
    host.addEventListener('submit', submit);
    host.addEventListener('keydown', keydown);
    host.addEventListener('change', change);
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => {
      swiper?.destroy(true, true);
      host.removeEventListener('click', click);
      host.removeEventListener('submit', submit);
      host.removeEventListener('keydown', keydown);
      host.removeEventListener('change', change);
      window.removeEventListener('scroll', scroll);
      document.body.classList.remove('no-scroll');
    };
  }, [html]);

  return <>
    <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />
    <dialog ref={dialog} className="demo-dialog" onClose={() => setMessage('')} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <h2>Thông báo</h2><p>{message}</p>
      <button autoFocus onClick={() => dialog.current?.close()}>Đóng</button>
    </dialog>
  </>;
}
