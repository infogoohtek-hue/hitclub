/** Match the reference captcha's 130 × 65 image proportions. */
export function captchaMarkup(code: string) {
  const safeCode = code.replace(/[^a-zA-Z0-9]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 65" width="100%" height="100%" aria-hidden="true"><text x="65" y="42" text-anchor="middle" fill="#080808" font-family="CaptchaGeorgia, Georgia, serif" font-weight="700" font-style="italic" font-size="30">${safeCode}</text></svg>`;
}
