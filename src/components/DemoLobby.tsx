'use client';
import Link from 'next/link';
import { useState } from 'react';
import styles from './DemoLobby.module.css';

const games = [
  { name: 'Vương quốc pha lê', category: 'Khám phá', symbol: '◆', tone: 'purple', text: 'HÀNH TRÌNH KỲ DIỆU' },
  { name: 'Đại dương xanh', category: 'Khám phá', symbol: '◈', tone: 'blue', text: 'KHÁM PHÁ BIỂN SÂU' },
  { name: 'Đêm hoàng kim', category: 'Thẻ bài', symbol: '♠', tone: 'gold', text: 'BỘ SƯU TẬP THẺ BÀI' },
  { name: 'Vườn ánh sáng', category: 'Giải đố', symbol: '✿', tone: 'green', text: 'THỬ THÁCH TRÍ TUỆ' },
  { name: 'Dải ngân hà', category: 'Giải đố', symbol: '✦', tone: 'pink', text: 'CHẠM TỚI VÌ SAO' },
  { name: 'Lâu đài bí ẩn', category: 'Khám phá', symbol: '♜', tone: 'red', text: 'MỞ CỬA PHIÊU LƯU' },
];
export default function DemoLobby({ login = false }: { login?: boolean }) {
  const [category, setCategory] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const visible = games.filter(g => (category === 'Tất cả' || g.category === category) && g.name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));
  return <div className={styles.shell}>
    <div className={styles.notice}>BẢN DEMO ĐỘC LẬP · Không phải HITCLUB · Không thu thập tài khoản · Không có giao dịch tiền thật</div>
    <div className={styles.header}>
      <Link href="/demo" className={styles.brand}><span>✦</span><div>AURORA<small>PLAY / INTERFACE DEMO</small></div></Link>
      <nav aria-label="Điều hướng demo"><Link href="/demo">Sảnh trải nghiệm</Link><Link href="/">Trang giới thiệu</Link></nav>
      <Link href="/demo/login" className={styles.goldButton}>Đăng nhập demo</Link>
    </div>
    {login ? <div className={styles.loginLayout}>
      <div className={styles.loginArt}><div className={styles.eyebrow}>AURORA PLAY</div><div className={styles.orb}>✦</div><h1>Một không gian.<br /><em>Nhiều trải nghiệm.</em></h1><p>Khám phá giao diện sảnh giải trí với tài khoản khách được điền sẵn.</p></div>
      <section className={styles.loginCard} aria-labelledby="login-title"><span className={styles.pill}>GIAO DIỆN DEMO</span><h2 id="login-title">Chào mừng trở lại</h2><p>Các trường bên dưới chỉ minh họa và không thể nhập thông tin thật.</p>
        <form action="/demo" method="get">
          <label htmlFor="demo-username">Tên tài khoản</label><input id="demo-username" value="guest_demo" readOnly autoComplete="off" aria-describedby="demo-note" />
          <label htmlFor="demo-password">Mật khẩu mẫu</label><div className={styles.password}><input id="demo-password" type={showPassword ? 'text' : 'password'} value="demo-only" readOnly autoComplete="off" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu mẫu' : 'Hiện mật khẩu mẫu'}>{showPassword ? 'Ẩn' : 'Hiện'}</button></div>
          <p id="demo-note" className={styles.safeNote}>◈ Không xác thực, không gửi hoặc lưu thông tin. Tiếp tục sẽ mở sảnh dưới dạng khách.</p>
          <button className={styles.goldButton} type="submit">Vào sảnh với tư cách khách →</button>
        </form><Link className={styles.back} href="/demo">← Quay lại sảnh demo</Link>
      </section>
    </div> : <div className={styles.content}>
      <section className={styles.hero}><div><span className={styles.pill}>BỘ SƯU TẬP TRẢI NGHIỆM</span><h1>Khám phá thế giới<br /><em>giải trí của bạn.</em></h1><p>Sắc màu mới. Cảm hứng mới. Một bản trình diễn giao diện được thiết kế dành cho mọi màn hình.</p><a href="#collection" className={styles.goldButton}>Khám phá bộ sưu tập ↓</a></div><div className={styles.heroArt} aria-hidden="true"><span>✦</span><b>PLAY</b><small>THE DEMO COLLECTION</small></div></section>
      <div className={styles.ticker}><span>✧ THÔNG BÁO</span> Tất cả trò chơi chỉ là thẻ giới thiệu giao diện. Không có đặt cược, nạp hoặc rút tiền.</div>
      <section id="collection"><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>CHỌN TRẢI NGHIỆM CỦA BẠN</span><h2>Bộ sưu tập nổi bật</h2></div><label className={styles.search}><span className={styles.srOnly}>Tìm trò chơi demo</span><input placeholder="Tìm trong bộ sưu tập…" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      <div className={styles.tabs} role="group" aria-label="Lọc danh mục">{['Tất cả', 'Khám phá', 'Thẻ bài', 'Giải đố'].map(c => <button key={c} aria-pressed={category === c} className={category === c ? styles.active : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
      <div className={styles.grid}>{visible.map((g, i) => <button key={g.name} className={styles.game} onClick={() => setSelected(g.name)}><div className={`${styles.gameArt} ${styles[g.tone]}`}><span className={styles.cardBadge}>DEMO {String(i + 1).padStart(2, '0')}</span><strong>{g.symbol}</strong><small>{g.text}</small></div><div className={styles.gameCaption}><div><h3>{g.name}</h3><span>{g.category}</span></div><b>↗</b></div></button>)}</div>{!visible.length && <p className={styles.empty}>Không tìm thấy trò chơi phù hợp. Hãy thử từ khóa khác.</p>}
      </section><div className={styles.bottomCard}><div><span className={styles.eyebrow}>THIẾT KẾ ĐỂ KHÁM PHÁ</span><h2>Trải nghiệm bằng tài khoản khách</h2><p>Không đăng ký, không cung cấp thông tin cá nhân.</p></div><Link className={styles.goldButton} href="/demo/login">Xem trang đăng nhập →</Link></div>
    </div>}
    <div className={styles.footer}><span>✦ AURORA PLAY</span><p>Bản trình diễn giao diện độc lập. Các nội dung và trò chơi đều là minh họa.</p><Link href="/">Về trang giới thiệu ↑</Link></div>
    {selected && <div className={styles.overlay} onClick={() => setSelected(null)}><section className={styles.modal} role="dialog" aria-modal="true" aria-label={selected} onClick={e => e.stopPropagation()}><span className={styles.pill}>XEM TRƯỚC</span><h2>{selected}</h2><p>Đây là thẻ minh họa trong bộ sưu tập demo, chưa có trò chơi hoặc giao dịch được kết nối.</p><button autoFocus className={styles.goldButton} onKeyDown={e => { if(e.key === 'Escape') setSelected(null); }} onClick={() => setSelected(null)}>Quay lại bộ sưu tập</button></section></div>}
  </div>;
}
