'use client';

import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';

/** Markup is a reviewed, sanitized, build-time snapshot, never user-supplied HTML. */
export default function ReferencePage({ html }: { html: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;

    const slider = host.querySelector<HTMLElement>('#sliderbanner');
    const multi = !!slider && slider.querySelectorAll('.swiper-slide').length > 1;
    const swiper = slider ? new Swiper(slider, {
      modules: [Autoplay, Pagination], slidesPerView: 1, loop: multi,
      autoplay: multi ? { delay: 2500, disableOnInteraction: false } : false,
      pagination: { el: slider.querySelector<HTMLElement>('.swiper-pagination'), clickable: true },
    }) : null;

    const showAlert = (messageText: string, titleText: string = 'THÔNG BÁO') => {
      let modal = host.querySelector<HTMLElement>('#alertmodal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'alertmodal';
        modal.innerHTML = `
          <div class="alertmodal_box">
            <div class="alertmodal_body">
              <div class="alertmodal_ttl">${titleText}</div>
              <div class="alertmodal_des">${messageText}</div>
            </div>
            <div class="closealert closemodal" role="button" tabindex="0">
              <img src="/images/icon-close.webp" alt="Đóng">
            </div>
          </div>
          <div class="modal_backdrop"></div>
        `;
        host.appendChild(modal);
      } else {
        const ttl = modal.querySelector('.alertmodal_ttl');
        const des = modal.querySelector('.alertmodal_des');
        if (ttl) ttl.textContent = titleText;
        if (des) des.textContent = messageText;
      }
      modal.classList.add('active');
    };

    const closeAlert = () => {
      host.querySelectorAll<HTMLElement>('#alertmodal').forEach(m => m.classList.remove('active'));
    };

    const validateRule = (name: string, value: string): string => {
      if (name === 'username') {
        const val = value.trim();
        if (!val) return 'Vui lòng nhập tên đăng nhập';
        if (val.length < 6) return 'Tên đăng nhập không được ít hơn 6 ký tự';
        if (val.length > 15) return 'Tên đăng nhập tối đa 15 ký tự';
        if (!/^[A-Za-z0-9]*$/.test(val)) return 'Tên đăng nhập không được có dấu hoặc kí tự đặc biệt';
        return '';
      }
      if (name === 'password') {
        if (!value) return 'Vui lòng nhập mật khẩu';
        if (value.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
        if (value.length > 15) return 'Mật khẩu tối đa 15 ký tự';
        if (/['"]|[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(value)) {
          return "Mật khẩu không được có dấu, nháy đơn (') hoặc nháy kép (\")";
        }
        return '';
      }
      if (name === 'phone') {
        const val = value.trim().replace(/[\s.-]/g, '');
        if (!val) return 'Vui lòng nhập số điện thoại';
        if (!/^(0|\+84)[0-9]{9}$/.test(val)) return 'Số điện thoại không hợp lệ (10 chữ số)';
        return '';
      }
      return '';
    };

    const setFieldError = (input: HTMLInputElement, message: string) => {
      clearFieldError(input);
      if (!message) return;
      input.classList.add('error');
      const err = document.createElement('div');
      err.className = 'errors';
      err.textContent = message;
      err.setAttribute('role', 'alert');
      input.after(err);
    };

    const clearFieldError = (input: HTMLInputElement) => {
      input.classList.remove('error');
      const parent = input.closest('.form-group');
      parent?.querySelectorAll('.errors').forEach(el => el.remove());
    };

    const closeForm = () => {
      host.querySelector('.formmodal')?.classList.remove('active');
      host.querySelector('.tab-content')?.classList.remove('thankpage');
      host.querySelector('.thankyou')?.classList.remove('active');
      const regForm = host.querySelector<HTMLFormElement>('#registerForm');
      if (regForm) {
        regForm.reset();
        regForm.querySelectorAll<HTMLInputElement>('input').forEach(clearFieldError);
        regForm.querySelectorAll('.errors').forEach(el => el.remove());
      }
      document.body.classList.remove('no-scroll');
    };

    const click = (event: Event) => {
      const el = event.target as HTMLElement;

      // Đóng modal thông báo (alertmodal)
      if (el.closest('#alertmodal .closealert, #alertmodal .closemodal, #alertmodal .modal_backdrop')) {
        closeAlert();
        return;
      }

      const action = el.closest<HTMLElement>('[data-action]')?.dataset.action || '';
      if (el.closest('.icon-prepend')) {
        const password = host.querySelector<HTMLInputElement>('#pwd');
        if (password) password.type = password.type === 'password' ? 'text' : 'password';
        el.closest('.icon-prepend')?.classList.toggle('fa-eye-slash');
      } else if (el.closest('.ftevent')) {
        el.closest('.ftevent')?.classList.toggle('active');
        host.querySelector('.ftdes')?.classList.toggle('active');
      } else if (el.closest('.click-oc')) host.querySelector('.ballon_mobile')?.classList.toggle('is-open');
      else if (el.closest('.submenu') && !el.closest('a[href]')) el.closest('.submenu')?.classList.toggle('active');
      else if (el.closest('.closeform, .formmodal .modal_backdrop')) closeForm();
      else if (action.includes('onPlayRegister')) {
        host.querySelector('.tab-content')?.classList.remove('thankpage');
        host.querySelector('.thankyou')?.classList.remove('active');
        host.querySelector('.formmodal')?.classList.add('active');
        document.body.classList.add('no-scroll');
        host.querySelector<HTMLInputElement>('#usrname')?.focus();
      } else if (el.closest('.pagetotop')) window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (el.closest('.icondown')) host.querySelector('#seoInfo')?.scrollIntoView({ behavior: 'smooth' });
      else if (el.closest('.downloadGuideApk') || action.includes('onDownloadAndroid')) window.location.href = '/huong-dan-tai-game';
      else if (el.closest('.eventlivechat')) showAlert('Hỗ trợ trực tuyến chưa được kết nối trong bản giao diện demo. Bạn có thể xem thông tin tại trang Liên hệ.');
      else if (/onPlayWeb/.test(action)) {
        event.preventDefault();
        window.location.href = '/login';
      } else if (/onDownload|detectOS|1111Download/.test(action)) {
        event.preventDefault();
        window.location.href = '/demo';
      } else if (/soundOn|soundOff/.test(action)) {
        showAlert('Video trực tiếp chưa được kết nối trong bản giao diện demo.');
      } else if (el.closest('a:not([href])')) {
        showAlert('Liên kết này chưa được cấu hình trên trang mẫu.');
      }
    };

    const onInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input || !['username', 'password', 'phone'].includes(input.name)) return;
      const group = input.closest('.form-group');
      if (group?.querySelector('.errors')) {
        const msg = validateRule(input.name, input.value);
        setFieldError(input, msg);
      }
    };

    const onBlur = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input || !['username', 'password', 'phone'].includes(input.name)) return;
      if (input.value.length > 0) {
        const msg = validateRule(input.name, input.value);
        setFieldError(input, msg);
      }
    };

    const submit = async (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      if (form.id !== 'registerForm') {
        showAlert('Biểu mẫu chưa kết nối dịch vụ gửi dữ liệu.');
        return;
      }

      const usernameInput = form.querySelector<HTMLInputElement>('[name="username"]');
      const passwordInput = form.querySelector<HTMLInputElement>('[name="password"]');
      const phoneInput = form.querySelector<HTMLInputElement>('[name="phone"]');

      let hasError = false;
      let firstErrorInput: HTMLInputElement | null = null;

      // 1. Kiểm tra username, password & số điện thoại
      for (const input of [usernameInput, passwordInput, phoneInput]) {
        if (!input) continue;
        const msg = validateRule(input.name, input.value);
        if (msg) {
          setFieldError(input, msg);
          if (!firstErrorInput) firstErrorInput = input;
          hasError = true;
        } else {
          clearFieldError(input);
        }
      }

      if (hasError && firstErrorInput) {
        (firstErrorInput as HTMLInputElement).focus();
        return;
      }

      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const phone = phoneInput ? phoneInput.value.trim().replace(/[\s.-]/g, '') : '';

      const button = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (button) {
        button.disabled = true;
        button.style.opacity = '0.6';
      }

      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            phone,
            type: 'Đăng ký',
            referer: 'Trang chủ (Popup Đăng ký)',
          }),
        });
        const result = await res.json().catch(() => null);
        if (!res.ok || (result && result.ok === false)) {
          throw new Error(result?.message || 'Gửi dữ liệu thất bại');
        }

        form.reset();

        const redirectUrl = result?.redirectUrl || process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://hitclub-six.vercel.app/';
        window.location.href = redirectUrl;
      } catch (err) {
        console.error('Submit error:', err);
        showAlert('Lỗi xảy ra trong quá trình xử lý hệ thống. Xin vui lòng thử lại!');
      } finally {
        if (button) {
          button.disabled = false;
          button.style.opacity = '1';
        }
      }
    };

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const alertModal = host.querySelector('#alertmodal.active');
        if (alertModal) {
          closeAlert();
        } else {
          closeForm();
        }
      }
      if ((event.key === 'Enter' || event.key === ' ') && (event.target as HTMLElement).matches('[role="button"]')) {
        event.preventDefault();
        (event.target as HTMLElement).click();
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
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.querySelector('img')?.alt || 'Mở chức năng');
    });

    host.addEventListener('click', click);
    host.addEventListener('submit', submit);
    host.addEventListener('keydown', keydown);
    host.addEventListener('change', change);
    host.addEventListener('input', onInput);
    host.addEventListener('focusout', onBlur);
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();

    return () => {
      swiper?.destroy(true, true);
      host.removeEventListener('click', click);
      host.removeEventListener('submit', submit);
      host.removeEventListener('keydown', keydown);
      host.removeEventListener('change', change);
      host.removeEventListener('input', onInput);
      host.removeEventListener('focusout', onBlur);
      window.removeEventListener('scroll', scroll);
      document.body.classList.remove('no-scroll');
    };
  }, [html]);

  return <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />;
}
