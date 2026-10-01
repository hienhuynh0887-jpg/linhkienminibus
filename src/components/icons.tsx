// Bộ icon SVG 3D/neon — tách nguyên văn từ App.tsx (không sửa nội dung).

// ═══════════════════════════════════════════════════════════════
//  🎨 ICON 3D / NEON — dùng cho thanh 4 mục (Ngôn ngữ / Đổi MK / Sửa ký / Tài khoản)
//  Thay cho emoji phẳng (🌐 🔑 ✏️ 🏢) bằng SVG gradient phong cách 3D/neon.
// ═══════════════════════════════════════════════════════════════

// Bản "3D/neon" của icon Ngôn ngữ — cùng phong cách với IconKey3D/IconPenSign3D/
// IconUserGear3D (nền tròn radial-gradient tối + khối gradient nổi bật + vài nét sáng trang
// trí), đồng bộ với bộ icon 3D dùng cho thanh 4 mục.
export function IconGlobe3D({size=30}){
  const id="g3"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1e3a6b"/><stop offset="100%" stopColor="#0a0e1e"/>
        </radialGradient>
        <linearGradient id={id+"g"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc"/><stop offset="45%" stopColor="#2563eb"/><stop offset="100%" stopColor="#0f2a6b"/>
        </linearGradient>
        <radialGradient id={id+"hl"} cx="32%" cy="28%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".9"/><stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <circle cx="30" cy="31" r="19" fill={`url(#${id}g)`}/>
      <g stroke="#bfe6ff" strokeWidth="1.1" opacity=".8" fill="none">
        <ellipse cx="30" cy="31" rx="19" ry="7"/>
        <ellipse cx="30" cy="31" rx="19" ry="13"/>
        <ellipse cx="30" cy="31" rx="7"  ry="19"/>
        <ellipse cx="30" cy="31" rx="13" ry="19"/>
        <line x1="11" y1="31" x2="49" y2="31"/>
      </g>
      <circle cx="30" cy="31" r="19" fill={`url(#${id}hl)`}/>
      <g stroke="#93c5fd" strokeWidth="2" opacity=".6" strokeLinecap="round">
        <line x1="2"  y1="18" x2="12" y2="18"/>
        <line x1="0"  y1="24" x2="11" y2="24"/>
      </g>
      <g>
        <rect x="37" y="35" width="25" height="20" rx="6" fill={`url(#${id}g)`} stroke="#0c2a63" strokeWidth="1"/>
        <path d="M43 55 l0 6.5 l7.5 -6.5 Z" fill={`url(#${id}g)`}/>
        <text x="49.5" y="49" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="sans-serif">中</text>
      </g>
    </svg>
  );
}

export function IconKey3D({size=30}){
  const id="kk"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#3b2f63"/><stop offset="100%" stopColor="#0b0a1e"/>
        </radialGradient>
        <linearGradient id={id+"k"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="45%" stopColor="#fb923c"/><stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <g transform="rotate(-38 32 32)">
        <circle cx="24" cy="24" r="10" fill="none" stroke={`url(#${id}k)`} strokeWidth="6"/>
        <rect x="24" y="30" width="6" height="20" rx="1.5" fill={`url(#${id}k)`}/>
        <rect x="24" y="38" width="11" height="5" rx="1.2" fill={`url(#${id}k)`}/>
        <rect x="24" y="45" width="8" height="5" rx="1.2" fill={`url(#${id}k)`}/>
      </g>
      <g stroke="#93c5fd" strokeWidth="2" opacity=".6" strokeLinecap="round">
        <line x1="6"  y1="20" x2="16" y2="20"/>
        <line x1="4"  y1="26" x2="15" y2="26"/>
        <line x1="7"  y1="32" x2="17" y2="32"/>
      </g>
    </svg>
  );
}

export function IconPenSign3D({size=30}){
  const id="pp"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <linearGradient id={id+"pad"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#312e81"/>
        </linearGradient>
        <linearGradient id={id+"pen"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9"/><stop offset="60%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#4c1d95"/>
        </linearGradient>
      </defs>
      <rect x="6" y="24" width="46" height="32" rx="6" fill={`url(#${id}pad)`} stroke="#4c1d95" strokeWidth="1.4" transform="rotate(-4 29 40)"/>
      <path d="M12 46 C 18 40, 22 50, 28 44 S 38 38, 44 42" stroke="#67e8f9" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".9" transform="rotate(-4 29 40)"/>
      <g transform="rotate(38 40 20)">
        <rect x="37" y="4"  width="7" height="30" rx="3.2" fill={`url(#${id}pen)`}/>
        <path d="M37 34 L44 34 L40.5 44 Z" fill="#c4b5fd"/>
        <rect x="37" y="4" width="7" height="7" rx="2" fill="#0f172a"/>
      </g>
      <circle cx="10" cy="14" r="1.4" fill="#a5f3fc"/>
      <circle cx="16" cy="9"  r="1.1" fill="#a5f3fc"/>
    </svg>
  );
}

export function IconUserGear3D({size=30}){
  const id="uu"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <linearGradient id={id+"ring"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6"/><stop offset="55%" stopColor="#a855f7"/><stop offset="100%" stopColor="#4338ca"/>
        </linearGradient>
        <linearGradient id={id+"face"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#fb923c"/>
        </linearGradient>
        <radialGradient id={id+"bg"} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0b0a1e"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill={`url(#${id}bg)`}/>
      <circle cx="30" cy="30" r="26" fill="none" stroke={`url(#${id}ring)`} strokeWidth="2.4"/>
      <circle cx="30" cy="23" r="8" fill={`url(#${id}face)`}/>
      <path d="M14 45 C14 34, 46 34, 46 45 L46 49 C46 49 14 49 14 45 Z" fill={`url(#${id}face)`}/>
      <g transform="translate(44,42)">
        <circle r="10" fill="#1e1b4b" stroke={`url(#${id}ring)`} strokeWidth="1.6"/>
        <circle r="3.6" fill="none" stroke="#e9d5ff" strokeWidth="1.6"/>
        {[0,60,120,180,240,300].map(a=>(
          <rect key={a} x="-1" y="-8.6" width="2" height="3.2" rx=".8" fill="#e9d5ff" transform={`rotate(${a})`}/>
        ))}
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  🎨 ICON 3D / LUNG LINH — bộ icon riêng cho THANH SIDEBAR (9 tab chính), thay cho emoji
//  phẳng cũ (🏠🔧✅📄📊🏁🗂️👥🖼️). Cùng phong cách gradient/glow như bộ icon phía trên
//  (nền tròn/bo góc gradient + khối chi tiết nổi khối + vài chấm sáng lấp lánh).
// ═══════════════════════════════════════════════════════════════
export function IconBox3D({size=30}){ // 📦 VẬT TƯ
  const id="bx"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#134e4a"/><stop offset="100%" stopColor="#052e2b"/>
        </radialGradient>
        <linearGradient id={id+"top"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
        <linearGradient id={id+"l"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="#047857"/>
        </linearGradient>
        <linearGradient id={id+"r"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669"/><stop offset="100%" stopColor="#022c22"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <path d="M32 15 L50 24 L32 33 L14 24 Z" fill={`url(#${id}top)`}/>
      <path d="M14 24 L32 33 L32 51 L14 42 Z" fill={`url(#${id}l)`}/>
      <path d="M50 24 L32 33 L32 51 L50 42 Z" fill={`url(#${id}r)`}/>
      <path d="M20 21 L38 30" stroke="#052e2b" strokeWidth="1.4" opacity=".5"/>
      <circle cx="45" cy="16" r="1.6" fill="#a7f3d0"/>
      <circle cx="16" cy="36" r="1.2" fill="#a7f3d0"/>
    </svg>
  );
}

export function IconClipboardCheck3D({size=30}){ // 📋 SOẠN HÀNG / KIỂM TRA
  const id="cb"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1e3a8a"/><stop offset="100%" stopColor="#050b2e"/>
        </radialGradient>
        <linearGradient id={id+"board"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbeafe"/><stop offset="100%" stopColor="#93c5fd"/>
        </linearGradient>
        <linearGradient id={id+"clip"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="16" y="14" width="32" height="40" rx="5" fill={`url(#${id}board)`} stroke="#1e40af" strokeWidth="1.2"/>
      <rect x="24" y="10" width="16" height="9" rx="3" fill={`url(#${id}clip)`} stroke="#92400e" strokeWidth="1"/>
      <line x1="21" y1="26" x2="35" y2="26" stroke="#1e3a8a" strokeWidth="2" opacity=".4" strokeLinecap="round"/>
      <line x1="21" y1="32" x2="31" y2="32" stroke="#1e3a8a" strokeWidth="2" opacity=".4" strokeLinecap="round"/>
      <path d="M22 42 L28 48 L43 33" fill="none" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="45" cy="17" r="1.5" fill="#bfdbfe"/>
    </svg>
  );
}

export function IconShieldCheck3D({size=30}){ // ✅ KIỂM TRA XÁC NHẬN
  const id="sc"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#064e3b"/><stop offset="100%" stopColor="#022c22"/>
        </radialGradient>
        <linearGradient id={id+"sh"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7"/><stop offset="55%" stopColor="#10b981"/><stop offset="100%" stopColor="#047857"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <path d="M32 11 L49 18 L49 32 C49 44 41 51 32 55 C23 51 15 44 15 32 L15 18 Z" fill={`url(#${id}sh)`} stroke="#022c22" strokeWidth="1.2"/>
      <path d="M23 32 L29 39 L42 24" fill="none" stroke="#f0fdf4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="46" cy="15" r="1.6" fill="#d1fae5"/>
      <circle cx="18" cy="40" r="1.2" fill="#d1fae5"/>
    </svg>
  );
}

export function IconReceipt3D({size=30}){ // 📄 PHIẾU GN
  const id="rc"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#312e81"/><stop offset="100%" stopColor="#0b0a2e"/>
        </radialGradient>
        <linearGradient id={id+"pap"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fde68a"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <path d="M18 12 h28 v38 l-4 4 -4 -4 -4 4 -4 -4 -4 4 -4 -4 -4 4 Z" fill={`url(#${id}pap)`} stroke="#92400e" strokeWidth="1"/>
      <line x1="23" y1="22" x2="41" y2="22" stroke="#92400e" strokeWidth="2" opacity=".55" strokeLinecap="round"/>
      <line x1="23" y1="29" x2="41" y2="29" stroke="#92400e" strokeWidth="2" opacity=".55" strokeLinecap="round"/>
      <line x1="23" y1="36" x2="34" y2="36" stroke="#92400e" strokeWidth="2" opacity=".55" strokeLinecap="round"/>
      <circle cx="47" cy="16" r="1.6" fill="#fef3c7"/>
    </svg>
  );
}

export function IconChartBar3D({size=30}){ // 📊 BÁO CÁO
  const id="cbr"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#7c2d12"/><stop offset="100%" stopColor="#1c0a03"/>
        </radialGradient>
        <linearGradient id={id+"b1"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5"/><stop offset="100%" stopColor="#dc2626"/>
        </linearGradient>
        <linearGradient id={id+"b2"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <linearGradient id={id+"b3"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="14" y="34" width="9" height="18" rx="2" fill={`url(#${id}b1)`}/>
      <rect x="27" y="22" width="9" height="30" rx="2" fill={`url(#${id}b2)`}/>
      <rect x="40" y="12" width="9" height="40" rx="2" fill={`url(#${id}b3)`}/>
      <path d="M14 18 L24 27 L33 19 L50 10" fill="none" stroke="#fef3c7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/>
      <circle cx="50" cy="10" r="2.2" fill="#fef3c7"/>
    </svg>
  );
}

export function IconFlagFinish3D({size=30}){ // 🏁 CÁC DỰ ÁN ĐÃ HOÀN THÀNH
  const id="fl"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1e293b"/><stop offset="100%" stopColor="#020617"/>
        </radialGradient>
        <linearGradient id={id+"pole"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e2e8f0"/><stop offset="100%" stopColor="#94a3b8"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="20" y="10" width="4" height="42" rx="2" fill={`url(#${id}pole)`}/>
      <path d="M24 13 h22 l-6 7 6 7 h-22 Z" fill="#f8fafc"/>
      {[0,1,2,3].map(row=>[0,1,2,3].map(col=>(((row+col)%2===0)&&(
        <rect key={row+"-"+col} x={24+col*5.5} y={13+row*3.5} width="5.5" height="3.5" fill="#0f172a"/>
      ))))}
      <circle cx="22" cy="54" r="3.2" fill="#94a3b8"/>
      <circle cx="47" cy="16" r="1.6" fill="#fde68a"/>
      <circle cx="43" cy="12" r="1.1" fill="#fde68a"/>
    </svg>
  );
}

export function IconFolderGear3D({size=30}){ // 🗂️ TẠO BOM MẪU
  const id="fg"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#581c87"/><stop offset="100%" stopColor="#160726"/>
        </radialGradient>
        <linearGradient id={id+"fd"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9d5ff"/><stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
        <linearGradient id={id+"gr"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <path d="M12 22 h14 l4 5 h22 v23 a3 3 0 0 1 -3 3 h-34 a3 3 0 0 1 -3 -3 Z" fill={`url(#${id}fd)`} stroke="#6b21a8" strokeWidth="1.2"/>
      <g transform="translate(41,40)">
        <circle r="8.5" fill={`url(#${id}gr)`} stroke="#92400e" strokeWidth="1"/>
        <circle r="3" fill="#fffbeb"/>
        {[0,45,90,135,180,225,270,315].map(a=>(
          <rect key={a} x="-1.3" y="-10.5" width="2.6" height="3.6" rx=".8" fill={`url(#${id}gr)`} transform={`rotate(${a})`}/>
        ))}
      </g>
      <circle cx="18" cy="18" r="1.5" fill="#f3e8ff"/>
    </svg>
  );
}

export function IconUsersLock3D({size=30}){ // 👥 PHÂN QUYỀN SỬ DỤNG
  const id="ul"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#0c4a6e"/><stop offset="100%" stopColor="#03101c"/>
        </radialGradient>
        <linearGradient id={id+"face"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#fb923c"/>
        </linearGradient>
        <linearGradient id={id+"lock"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc"/><stop offset="100%" stopColor="#0284c7"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <circle cx="21" cy="24" r="6.4" fill={`url(#${id}face)`} opacity=".9"/>
      <path d="M9 44 C9 34, 33 34, 33 44 L33 47 C33 47 9 47 9 44 Z" fill={`url(#${id}face)`} opacity=".9"/>
      <circle cx="37" cy="24" r="6.4" fill={`url(#${id}face)`}/>
      <path d="M25 44 C25 34, 49 34, 49 44 L49 47 C49 47 25 47 25 44 Z" fill={`url(#${id}face)`}/>
      <g transform="translate(46,42)">
        <rect x="-8" y="-2" width="16" height="13" rx="3" fill={`url(#${id}lock)`} stroke="#0c4a6e" strokeWidth="1"/>
        <path d="M-4.5 -2 v-4 a4.5 4.5 0 0 1 9 0 v4" fill="none" stroke={`url(#${id}lock)`} strokeWidth="2.4"/>
        <circle cx="0" cy="4.5" r="1.8" fill="#0c4a6e"/>
      </g>
      <circle cx="14" cy="14" r="1.3" fill="#e0f2fe"/>
    </svg>
  );
}

export function IconImageCms3D({size=30}){ // 🖼️ QUẢN TRỊ CMS
  const id="ic"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#831843"/><stop offset="100%" stopColor="#1a0510"/>
        </radialGradient>
        <linearGradient id={id+"fr"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbcfe8"/><stop offset="100%" stopColor="#f472b6"/>
        </linearGradient>
        <linearGradient id={id+"mt"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="12" y="14" width="40" height="32" rx="4" fill={`url(#${id}fr)`} stroke="#831843" strokeWidth="1.2"/>
      <rect x="16" y="18" width="32" height="24" rx="2" fill="#fdf2f8"/>
      <circle cx="24" cy="26" r="4" fill="#fbbf24"/>
      <path d="M16 40 L27 29 L34 36 L41 27 L48 40 Z" fill={`url(#${id}mt)`}/>
      <circle cx="46" cy="18" r="1.6" fill="#fce7f3"/>
    </svg>
  );
}

export function IconChatHeart3D({size=30}){ // 💬 GÓP Ý KIẾN - CẢI TIẾN PM
  const id="ch"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#0e4f4f"/><stop offset="100%" stopColor="#052222"/>
        </radialGradient>
        <linearGradient id={id+"bb"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4"/><stop offset="100%" stopColor="#0d9488"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <path d="M14 18 h36 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 H30 l-9 8 v-8 h-7 a4 4 0 0 1 -4 -4 V22 a4 4 0 0 1 4 -4 Z" fill={`url(#${id}bb)`} stroke="#052222" strokeWidth="1"/>
      <path d="M32 34 c-5 -6 -13 -3 -13 3.5 0 4.5 8 8.5 13 12 5 -3.5 13 -7.5 13 -12 0 -6.5 -8 -9.5 -13 -3.5Z" fill="#fecdd3" transform="translate(0,-6) scale(0.72)" transformOrigin="32 32"/>
      <path d="M22 27 c3.4 -4.2 8.8 -2 8.8 2.3 0 3 -5.4 5.7 -8.8 8 -3.4 -2.3 -8.8 -5 -8.8 -8 0 -4.3 5.4 -6.5 8.8 -2.3Z" fill="#fb7185"/>
      <circle cx="47" cy="16" r="1.6" fill="#99f6e4"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  🎨 ICON 3D — dùng cho các KHỐI nhóm trong "CMS — Quản lý Nội dung"
//  (Nội dung hiển thị / Giao diện & Hình ảnh / Tài khoản & Bảo mật /
//  Tùy biến dữ liệu / Phản hồi & Nhật ký) — cùng phong cách 3D/neon
//  (nền tròn radial-gradient tối + khối gradient nổi bật + nét sáng trang trí).
// ═══════════════════════════════════════════════════════════════
export function IconContentStack3D({size=30}){ // 📝 NỘI DUNG HIỂN THỊ
  const id="ct"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#0e4f4f"/><stop offset="100%" stopColor="#052222"/>
        </radialGradient>
        <linearGradient id={id+"cd"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#99f6e4"/><stop offset="100%" stopColor="#0d9488"/>
        </linearGradient>
        <linearGradient id={id+"ph"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="9" y="14" width="46" height="36" rx="5" fill={`url(#${id}cd)`} stroke="#052222" strokeWidth="1.2"/>
      <rect x="14" y="19" width="15" height="13" rx="2" fill={`url(#${id}ph)`}/>
      <circle cx="18.5" cy="23.5" r="2" fill="#fffbeb"/>
      <path d="M14.5 31 L20 25.5 L23.5 29 L27.5 24 L28.5 31 Z" fill="#92400e" opacity=".85"/>
      <line x1="33" y1="21" x2="50" y2="21" stroke="#052222" strokeWidth="2" opacity=".55" strokeLinecap="round"/>
      <line x1="33" y1="27" x2="50" y2="27" stroke="#052222" strokeWidth="2" opacity=".55" strokeLinecap="round"/>
      <line x1="14" y1="38" x2="50" y2="38" stroke="#052222" strokeWidth="1.8" opacity=".4" strokeLinecap="round"/>
      <line x1="14" y1="43" x2="40" y2="43" stroke="#052222" strokeWidth="1.8" opacity=".4" strokeLinecap="round"/>
      <circle cx="47" cy="17" r="1.6" fill="#99f6e4"/>
    </svg>
  );
}

export function IconLayoutDash3D({size=30}){ // 🧭 GIAO DIỆN & HÌNH ẢNH
  const id="ld"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#581c87"/><stop offset="100%" stopColor="#160726"/>
        </radialGradient>
        <linearGradient id={id+"hd"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0abfc"/><stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
        <linearGradient id={id+"sb"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b5fd"/><stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="10" y="13" width="44" height="38" rx="5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="1.2"/>
      <rect x="10" y="13" width="44" height="10" rx="5" fill={`url(#${id}hd)`}/>
      <rect x="10" y="23" width="14" height="28" fill={`url(#${id}sb)`}/>
      <rect x="29" y="28" width="20" height="6" rx="2" fill="#e9d5ff"/>
      <rect x="29" y="38" width="20" height="6" rx="2" fill="#e9d5ff"/>
      <circle cx="47" cy="17" r="1.6" fill="#3b0764"/>
    </svg>
  );
}

export function IconShieldKey3D({size=30}){ // 🔐 TÀI KHOẢN & BẢO MẬT
  const id="sk"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#7c2d12"/><stop offset="100%" stopColor="#1a0805"/>
        </radialGradient>
        <linearGradient id={id+"sh"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74"/><stop offset="45%" stopColor="#f97316"/><stop offset="100%" stopColor="#c2410c"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <path d="M32 10 L50 17 V30 C50 43 42 51 32 55 C22 51 14 43 14 30 V17 Z" fill={`url(#${id}sh)`} stroke="#7c2d12" strokeWidth="1.3"/>
      <circle cx="32" cy="29" r="5.5" fill="#fff7ed"/>
      <rect x="29.6" y="33" width="4.8" height="10" rx="2.2" fill="#fff7ed"/>
      <circle cx="16" cy="16" r="1.5" fill="#fed7aa"/>
    </svg>
  );
}

export function IconPuzzleTable3D({size=30}){ // 🧩 TÙY BIẾN DỮ LIỆU
  const id="pt"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#0c4a6e"/><stop offset="100%" stopColor="#03101c"/>
        </radialGradient>
        <linearGradient id={id+"tb"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bae6fd"/><stop offset="100%" stopColor="#0284c7"/>
        </linearGradient>
        <linearGradient id={id+"pz"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="10" y="14" width="34" height="34" rx="4" fill={`url(#${id}tb)`} stroke="#0c4a6e" strokeWidth="1.2"/>
      <line x1="10" y1="25" x2="44" y2="25" stroke="#0c4a6e" strokeWidth="1.4" opacity=".55"/>
      <line x1="10" y1="36" x2="44" y2="36" stroke="#0c4a6e" strokeWidth="1.4" opacity=".55"/>
      <line x1="21" y1="14" x2="21" y2="48" stroke="#0c4a6e" strokeWidth="1.4" opacity=".55"/>
      <line x1="33" y1="14" x2="33" y2="48" stroke="#0c4a6e" strokeWidth="1.4" opacity=".4"/>
      <path d="M38 30 h9 a3.2 3.2 0 0 1 0 6.4 a3.2 3.2 0 1 0 0 6.4 h-9 v-6.4 a3.2 3.2 0 1 1 0 -6.4 Z" fill={`url(#${id}pz)`} stroke="#92400e" strokeWidth="1"/>
      <circle cx="16" cy="18" r="1.4" fill="#e0f2fe"/>
    </svg>
  );
}

export function IconNotebookBell3D({size=30}){ // 📬 PHẢN HỒI & NHẬT KÝ
  const id="nb"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1e3a6b"/><stop offset="100%" stopColor="#0a0e1e"/>
        </radialGradient>
        <linearGradient id={id+"nt"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id={id+"bl"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fca5a5"/><stop offset="100%" stopColor="#dc2626"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <rect x="12" y="11" width="30" height="42" rx="4" fill={`url(#${id}nt)`} stroke="#92400e" strokeWidth="1.1"/>
      <line x1="12" y1="20" x2="42" y2="20" stroke="#92400e" strokeWidth="1.3" opacity=".5"/>
      <line x1="17" y1="27" x2="37" y2="27" stroke="#92400e" strokeWidth="1.6" opacity=".55" strokeLinecap="round"/>
      <line x1="17" y1="33" x2="37" y2="33" stroke="#92400e" strokeWidth="1.6" opacity=".55" strokeLinecap="round"/>
      <line x1="17" y1="39" x2="30" y2="39" stroke="#92400e" strokeWidth="1.6" opacity=".55" strokeLinecap="round"/>
      <g transform="translate(44,42)">
        <path d="M0 -9 a7 7 0 0 1 7 7 v3 l2.4 3.6 h-18.8 L-7 1 v-3 a7 7 0 0 1 7 -7 Z" fill={`url(#${id}bl)`} stroke="#7f1d1d" strokeWidth="1"/>
        <circle cy="8.6" r="2.2" fill={`url(#${id}bl)`}/>
      </g>
      <circle cx="18" cy="16" r="1.4" fill="#fffbeb"/>
    </svg>
  );
}

export function IconBookGuide3D({size=30}){ // 📖 HƯỚNG DẪN SỬ DỤNG PM
  const id="bg"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <radialGradient id={id+"bg"} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1e3a8a"/><stop offset="100%" stopColor="#050b26"/>
        </radialGradient>
        <linearGradient id={id+"pl"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe"/><stop offset="100%" stopColor="#60a5fa"/>
        </linearGradient>
        <linearGradient id={id+"pr"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fde68a"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}bg)`}/>
      <path d="M32 20 C27 16 19 15 14 17 V42 C19 40 27 41 32 45 Z" fill={`url(#${id}pl)`} stroke="#1e3a8a" strokeWidth="1"/>
      <path d="M32 20 C37 16 45 15 50 17 V42 C45 40 37 41 32 45 Z" fill={`url(#${id}pr)`} stroke="#92400e" strokeWidth="1"/>
      <line x1="19" y1="24" x2="27" y2="23" stroke="#1e3a8a" strokeWidth="1.6" opacity=".6" strokeLinecap="round"/>
      <line x1="19" y1="30" x2="27" y2="29" stroke="#1e3a8a" strokeWidth="1.6" opacity=".6" strokeLinecap="round"/>
      <line x1="37" y1="23" x2="45" y2="24" stroke="#92400e" strokeWidth="1.6" opacity=".6" strokeLinecap="round"/>
      <line x1="37" y1="29" x2="45" y2="30" stroke="#92400e" strokeWidth="1.6" opacity=".6" strokeLinecap="round"/>
      <circle cx="47" cy="16" r="1.6" fill="#dbeafe"/>
    </svg>
  );
}
