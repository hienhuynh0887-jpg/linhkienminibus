import { useState, useMemo, useRef, useCallback, Fragment, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ──
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if(!SUPABASE_URL || !SUPABASE_KEY){
  console.error("Thieu bien moi truong Supabase!", {url: SUPABASE_URL, key: !!SUPABASE_KEY});
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "", {
  auth: { persistSession: false }
});

// ═══════════════════════════════════════════════════════════════
//  🎨 ICON 3D / NEON — dùng cho thanh 4 mục (Ngôn ngữ / Đổi MK / Sửa ký / Tài khoản)
//  Thay cho emoji phẳng (🌐 🔑 ✏️ 🏢) bằng SVG gradient phong cách 3D/neon.
// ═══════════════════════════════════════════════════════════════
function IconGlobeCN({size=30}){
  const id="gg"+Math.random().toString(36).slice(2,8);
  return(
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display:"block"}}>
      <defs>
        <linearGradient id={id+"a"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc"/><stop offset="50%" stopColor="#2563eb"/><stop offset="100%" stopColor="#0f2a6b"/>
        </linearGradient>
        <linearGradient id={id+"b"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
      </defs>
      <circle cx="27" cy="27" r="21" fill={`url(#${id}a)`}/>
      <g stroke="#bfe6ff" strokeWidth="1.1" opacity=".85" fill="none">
        <ellipse cx="27" cy="27" rx="21" ry="8"/>
        <ellipse cx="27" cy="27" rx="21" ry="15"/>
        <ellipse cx="27" cy="27" rx="8"  ry="21"/>
        <ellipse cx="27" cy="27" rx="15" ry="21"/>
        <line x1="6" y1="27" x2="48" y2="27"/>
      </g>
      <circle cx="10" cy="18" r="1.6" fill="#e0f2fe"/>
      <circle cx="41" cy="14" r="1.3" fill="#e0f2fe"/>
      <circle cx="8"  cy="34" r="1.3" fill="#e0f2fe"/>
      <g>
        <rect x="34" y="30" width="26" height="21" rx="7" fill={`url(#${id}b)`} stroke="#0c2a63" strokeWidth="1"/>
        <path d="M40 51 l0 7 l8 -7 Z" fill={`url(#${id}b)`}/>
        <text x="47" y="45" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="sans-serif">中</text>
      </g>
    </svg>
  );
}

// ✅ Bản "3D/neon" của icon Ngôn ngữ — cùng phong cách với IconKey3D/IconPenSign3D/
// IconUserGear3D (nền tròn radial-gradient tối + khối gradient nổi bật + vài nét sáng trang
// trí) thay vì nền phẳng như IconGlobeCN cũ, để đồng bộ với bộ icon 3D dùng cho thanh 4 mục.
function IconGlobe3D({size=30}){
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

function IconKey3D({size=30}){
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

function IconPenSign3D({size=30}){
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

function IconUserGear3D({size=30}){
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
function IconBox3D({size=30}){ // 📦 VẬT TƯ
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

function IconClipboardCheck3D({size=30}){ // 📋 SOẠN HÀNG / KIỂM TRA
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

function IconShieldCheck3D({size=30}){ // ✅ KIỂM TRA XÁC NHẬN
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

function IconReceipt3D({size=30}){ // 📄 PHIẾU GN
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

function IconChartBar3D({size=30}){ // 📊 BÁO CÁO
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

function IconFlagFinish3D({size=30}){ // 🏁 CÁC DỰ ÁN ĐÃ HOÀN THÀNH
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

function IconFolderGear3D({size=30}){ // 🗂️ TẠO BOM MẪU
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

function IconUsersLock3D({size=30}){ // 👥 PHÂN QUYỀN SỬ DỤNG
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

function IconImageCms3D({size=30}){ // 🖼️ QUẢN TRỊ CMS
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

// Nhận diện avatar là ẢNH THẬT (data URL đã upload / URL http) hay chỉ là 1 EMOJI mặc định
// (🏭📦👤...) — dùng ở mọi nơi hiển thị avatar (header, bảng Phân quyền, CMS...) để quyết
// định render <img> hay render text emoji.
function isImgAvatar(a){
  return typeof a==="string" && (a.startsWith("data:image")||a.startsWith("http"));
}

// ⚠️ Đã bỏ hẳn dữ liệu mẫu (seed) hard-code trong code (trước đây là 2 mảng BOM_XH/BOM_MB2
// với hàng trăm dòng vật tư mẫu). Toàn bộ BOM mẫu giờ chỉ đọc từ Supabase (bảng "bom_mau" /
// "bom_mau_loai"). Nếu bảng rỗng thật sự (đã bị xoá hết), app sẽ hiển thị RỖNG — không tự
// tạo lại dữ liệu mẫu cũ nữa (xem thêm phần sửa logic load bên dưới, khu vực useEffect load()).

// ═══════════════════════════════════════════════════════════════
//  BOM MẪU — DANH SÁCH LOẠI (động, quản lý được trong app)
// ═══════════════════════════════════════════════════════════════
// Trước đây app chỉ có đúng 2 loại BOM Mẫu cứng ("xh"/"mb2") gắn chết trong code.
// Giờ chuyển sang mô hình động: 1 bảng Supabase DUY NHẤT "bom_mau" (có cột "loai"
// để phân biệt), cộng thêm bảng "bom_mau_loai" lưu DANH SÁCH các loại (tên/icon/màu),
// người dùng có thể bấm "➕ Thêm loại BOM mẫu mới" để tạo bao nhiêu loại tùy ý mà
// không cần sửa code. 2 loại "xh"/"mb2" dưới đây chỉ còn là dữ liệu MẶC ĐỊNH dùng để
// tạo sẵn (seed) lần đầu khi bảng Supabase chưa có gì — sau khi đã lưu lên Supabase,
// app sẽ luôn đọc theo dữ liệu thật trong 2 bảng "bom_mau_loai" và "bom_mau".
//
// ⚠️ SQL cần chạy 1 lần trên Supabase (SQL Editor) trước khi dùng tính năng này:
//
//   create table if not exists bom_mau_loai (
//     id text primary key,
//     ten text not null,
//     icon text default '🚐',
//     mau text default '#7c3aed',
//     thu_tu integer default 0,
//     dong_xe text default 'minibus'  -- ✅ mới: "12m" | "citybus" | "minibus" — mỗi loại BOM
//                                     --   mẫu chỉ hiển thị cho đúng tab dòng xe tương ứng
//   );
//   -- Nếu bảng đã có sẵn từ trước, chạy thêm dòng dưới để bổ sung cột mới:
//   alter table bom_mau_loai add column if not exists dong_xe text default 'minibus';
//   insert into bom_mau_loai (id,ten,icon,mau,thu_tu) values
//     ('xh','XE KIM MAI 9','🚗','#1d4ed8',1),
//     ('mb2','XE MINIBUS X9','🚐','#b45309',2)
//   on conflict (id) do nothing;
//
//   create table if not exists bom_mau (
//     loai text not null references bom_mau_loai(id) on delete cascade,
//     id text not null,
//     stt integer default 0,
//     ten text not null,
//     dv text default 'Cái',
//     dm numeric default 1,
//     ng text,
//     vt text,
//     jig text,
//     gc text,
//     primary key (loai, id)
//   );
//
//   -- Nếu trước đây đã có dữ liệu ở 2 bảng cũ bom_mau_xh / bom_mau_mb2, gộp qua bảng mới:
//   insert into bom_mau (loai,id,stt,ten,dv,dm,ng,vt,jig,gc)
//     select 'xh',id,stt,ten,dv,dm,ng,vt,jig,gc from bom_mau_xh
//     union all
//     select 'mb2',id,stt,ten,dv,dm,ng,vt,jig,gc from bom_mau_mb2
//   on conflict (loai,id) do nothing;
//
const BOM_MAU_LOAI_DEFAULT = [
  {id:"xh",  ten:"XE KIM MAI 9",   icon:"🚗", mau:"#1d4ed8", thu_tu:1},
  {id:"mb2", ten:"XE MINIBUS X9",  icon:"🚐", mau:"#b45309", thu_tu:2},
];
// (Đã bỏ BOM_MAU_SEED — không còn seed mặc định cho BOM mẫu; xem bomMauByLoai bên dưới.)
// Chuyển tên loại BOM mẫu → id (slug) khi tạo loại mới, đảm bảo không trùng.
const slugifyLoaiId = (ten) => {
  const base = String(ten||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/đ/gi,"d")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  return base || "loai";
};

// (Đã bỏ SEED — dự án khởi tạo với BOM rỗng, dữ liệu thật chỉ đến từ Supabase.)
const PROJS_DEF = [
  {id:"proj_xh", ten:"XE KIM MAI 9", mo_ta:"BOM XE KIM MAI 9 ( BẢN MỚI ) · NHÀ MÁY BUS", mau:"#1d4ed8", icon:"🚐", so_xe:1},
  {id:"proj_mb2",ten:"XE MINIBUS X9",  mo_ta:"BOM XE MINIBUS X9 ( BẢN MỚI ) · NHÀ MÁY BUS",  mau:"#b45309", icon:"🚐", so_xe:1},
];
const uid=()=>`id${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
// ✅ Hàm định dạng số (thêm dấu chấm phân cách hàng nghìn theo chuẩn VN) — dùng ở khắp nơi
// trong app để hiển thị số lượng/tồn kho/thống kê. Nhận null/undefined/chuỗi số/NaN đều an toàn.
const fmt=(n)=>{
  const num=Number(n);
  if(n==null||n===""||Number.isNaN(num))return "0";
  return num.toLocaleString("vi-VN");
};

// ✅ Hàm lấy màu nền nhạt theo dự án
const getProjectBgColor = (projId, projs) => {
  const proj = projs.find(p => p.id === projId);
  if (!proj) return "#f9fafb"; // Default màu xám nhạt
  
  // Map màu chủ sang màu nền nhạt
  const colorMap = {
    "#1d4ed8": "#eff6ff", // Xanh đậm → Xanh nhạt (Kim Mai)
    "#b45309": "#fef3c7", // Cam đậm → Cam nhạt (MINI Bus)
  };
  return colorMap[proj.mau] || "#f9fafb";
};

const mkBom=(pid,arr)=>arr.map(v=>({id:uid(),pid,stt:v.stt,ma:v.id,ten:v.ten,dv:v.dv,dm:v.dm,ng:v.ng,vt:v.vt,gc:v.gc,anh:""}));
const initBom={};
PROJS_DEF.forEach(p=>{initBom[p.id]=[];}); // Không seed — chờ dữ liệu thật từ Supabase

// ═══════════════════════════════════════════════════════════════
//  USERS & AUTH
// ═══════════════════════════════════════════════════════════════
const USERS_DEF = [
  {id:"admin",  ten:"QUẢN TRỊ VIÊN", pw:"thck2024", role:"thck",     don_vi:"NHÀ MÁY THCK", avatar:"🏭", mau:"#1d4ed8"},
  {id:"thck01", ten:"NGUYỄN VĂN AN", pw:"thck01",   role:"thck",     don_vi:"NHÀ MÁY THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"thck02", ten:"TRẦN THỊ BÍCH", pw:"thck02",   role:"thck",     don_vi:"NHÀ MÁY THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"xh01",   ten:"LÊ VĂN CƯỜNG",  pw:"xh01",     role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"xh02",   ten:"PHẠM THỊ DUNG", pw:"xh02",     role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"xh03",   ten:"HOÀNG VĂN EM",  pw:"xh03",     role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"kho",    ten:"QUẢN LÝ KHO",   pw:"kho2024",  role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"📦", mau:"#0f766e"},
  {id:"kho01",  ten:"TRẦN VĂN HÙNG", pw:"kho01",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho02",  ten:"NGUYỄN THỊ LAN",pw:"kho02",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho03",  ten:"LÊ VĂN MINH",   pw:"kho03",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho04",  ten:"PHẠM THỊ NGA",  pw:"kho04",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"khth",   ten:"PHÒNG KH-TH",  pw:"khth2024", role:"khth",     don_vi:"PHÒNG KH-TH",  avatar:"📋", mau:"#7c3aed"},
  // ✅ Các đơn vị "theo dõi tổng thể" — chỉ xem (Vật tư · Phiếu GN · Báo Cáo), không
  // soạn hàng/nhận hàng/quản lý BOM/người dùng. Vai trò suy ra từ donViBaseRole (mặc định "khth").
  {id:"phongkt01", ten:"NV PHÒNG KT",   pw:"phongkt01", role:"khth", don_vi:"PHÒNG KT",   avatar:"📋", mau:"#7c3aed"},
  {id:"bancn01",   ten:"NV BAN CN",     pw:"bancn01",   role:"khth", don_vi:"BAN CN",     avatar:"📋", mau:"#7c3aed"},
  {id:"banldnm01", ten:"NV BAN LĐNM",   pw:"banldnm01", role:"khth", don_vi:"BAN LĐNM",   avatar:"📋", mau:"#7c3aed"},
  // ✅ Các đơn vị chuyên trách riêng từng dòng xe — mỗi đơn vị chỉ Soạn Hàng/Nhận Hàng
  // đúng dòng xe được cấp quyền (xem LINE_QUYEN_DEFAULT). Vai trò suy ra từ quy ước tên
  // (donViBaseRole): "KHO ..." → kho (Soạn Hàng), "XH_..." → xuonghan (Duyệt/Nhận Hàng).
  {id:"kho_citybus01", ten:"NV KHO CITYBUS",  pw:"citybus01", role:"kho",      don_vi:"KHO CITYBUS", avatar:"📦", mau:"#0fe0a4"},
  {id:"kho_12m01",     ten:"NV KHO 12M",      pw:"kho12m01",  role:"kho",      don_vi:"KHO 12M",     avatar:"📦", mau:"#2f8fff"},
  {id:"xh_minibus01",  ten:"NV XƯỞNG MINIBUS",pw:"xhmini01",  role:"xuonghan", don_vi:"XH_MINIBUS",  avatar:"🚐", mau:"#ff9a1f"},
  {id:"xh_citybus01",  ten:"NV XƯỞNG CITYBUS",pw:"xhcity01",  role:"xuonghan", don_vi:"XH_CITYBUS",  avatar:"🚌", mau:"#0fe0a4"},
  {id:"xh_12_01",      ten:"NV XƯỞNG 12M",    pw:"xh12m01",   role:"xuonghan", don_vi:"XH_12",       avatar:"🚍", mau:"#2f8fff"},
];

// ✅ Tài khoản có quyền QUẢN TRỊ TOÀN HỆ THỐNG (toàn quyền cả 3 dòng xe, thấy tab CMS,
// bỏ qua bảng phân quyền dòng xe...). Gồm "admin" (mặc định) và "xh04" (được nâng cấp
// ngang quyền admin theo yêu cầu — vẫn giữ nguyên đơn vị/role gốc là Xưởng Hàn để không
// ảnh hưởng các luồng nghiệp vụ khác, chỉ được CỘNG THÊM quyền quản trị).
const isAdminAccount = (u) => !!u && (u.id === "admin" || u.id === "xh04" || u.is_admin === true);

// ═══════════════════════════════════════════════════════════════
//  ✅ ICON THẬT CHO TỪNG ĐƠN VỊ — cắt trực tiếp từ bộ icon minh hoạ do người dùng cung
//  cấp (thay cho emoji). Mỗi icon là ảnh WebP nhúng base64 (nhẹ, không cần thư mục asset
//  riêng, hoạt động ngay khi build lên Vercel). Đơn vị tùy chỉnh thêm sau này (không có
//  trong danh sách) sẽ tự rơi về icon emoji cũ (DONVI_ICON_META) như trước.
// ═══════════════════════════════════════════════════════════════
const DONVI_ICON_IMG={
  "BAN LĐNM": "data:image/webp;base64,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",
  "PHÒNG KH-TH": "data:image/webp;base64,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",
  "PHÒNG KT": "data:image/webp;base64,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",
  "BAN CN": "data:image/webp;base64,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",
  "XƯỞNG HÀN": "data:image/webp;base64,UklGRlAKAABXRUJQVlA4IEQKAACQKwCdASqgAGYAPmEsk0akIqGhJ1cJyIAMCWIA0qTV0laniQf49mP0MeYBzp/MB+zv7Ae9d6Nf8j6gH9o/uHWdegn5aX7i/B7/cf+H+7HtCf/+9PcY/Jv7f9wOVb0J5n/yr8A/p/NP/Y+Cfwx/svKJ/o9+jAB+Zf0j/meDD/X+hXcr/57jmaAH539WL+z8lX57/lf/V/nfgK/l/91/63Y09JlgXn6n3L4GBHJcLUZRF88qm5/0+jnrmAR0V2nJT+/rZsefz5HPdUor6T92K9GIQwq1S3EPLf/gOW8T39YOoavQ4uljkfbPJBTEobD0Hrsrrf6nxCy7pQ13LYCZYzgIH8EZ306tavvqTsvOEGka3EA9G6XimZ86KHSpOrvJFTERnrjv0VQe4ePgbZK4iUI6CqCPD8PwANqRZw48muZPf1b6Zw0FzKMgO+/O6X9eJxJ2GYap/r4c2QBfMZkIpNc4URADrAAA/v4PYCIYrJfCSoL8k/y/rNxwq0XTE57QBWn4XSrTl9WFxpqI0yMzsVKVVXBQY8XrRlWdoXSb9Hl3rdYIcLUSBsiqQwNVoylWLXok+W9lQie0oB+AVX59e0Uyx8zehdVMFpHjkn2hER6Jh++AKOZkSVaaNkaNYZ22o194i/Skgk7vK7fSKDVWbVZFbuwMq2ErMRNvxcJK9vrFmMLH2HljoHiPBb0CQCucwArY+jh+3RTaokV+LtxgzoWjVgGD6iMf/M49w0zeRP/cVMjiN3lucMqGK76KTJmNjhX0FGAZ37BoX39xAuuCGruIbcDra+CknLqmg99Svw1x48v/nCuUT2hAT33FSmffyaCzOiktxEEzRvGDOkhhzgvRrLVCH8/rmUOaCnSBjj5LBHQty1YijYtga096jo+RSsEv0qLtuhJRs16FGy+9q/JpKRwhdkH59PxO22DR4Jtvm1WvGO0wUGat+ygs1cW0PrZYZq7rDmH3/eMu2QZSwKT4+8Bg7P7MP5/zri2H3v+badIO/r0cqfO/0/Ce5SYYqVyt9C+Q69VXzjCLHeVBVEm/b8Tib46UzHy3N1SEvOBMxMnACo7M9f62MU18nzyrbbW99Oc4fkIUzX/+xvOvbR0+OOge8p22eYCXaUuE7/SYTXjMMwuWXgikJ+UwkoVdmptF6c9bPkT1ArfLdBn6R9PNm9iQDdT+ZKseVoZnjv6c3UKknjttJg1zIllfKUf2ISBb9iBM+x2ZpPNWLAvjQW6iwiUjZqFcIZBpE0xu4t44zSbddAUOJ+n5nv65MMpW/QS1HN2Qp2mUSsAXdWk+Z1Ccsv7rDh991L5w2TnY0WmhqTTXQp5y1cGhjen6yI3ZI/r4rWfKxhlahUUb6lPOSgNxYItSQltp2zFmHOGssPXHlEsvI7VaETRrFz7waN5fpWkFYDb/sbDfO9wTHOv6SNVihmZ2KhVeWcio29ZddqtkjybTew6vLoYnH4Hqz7ejxmvkFMhup+EKUYbzRzi6aCXFzNZORknKkxlO8gUP/f4vihxgIQS33zE58nP+LuO8iMsL/vP7J+l0vrLruyxxur+gNNO4Lf29GxVpLZuQXzzVslg2WQDt4HDlPglVJFaMc5eWveHHfqF17NhSz69uYQS9kMjz5b3mjUVtsEPyWcJ8NhChKwcFvXYGrxsev/q1LH/5ad2BUUG6ymsab99LIGmacq1jmmtLOVYFaDRRGZMSAbezaXvyFkTGTLZ/sHx5u97fw54eE3+DVPjHoRVmbxk0+nsdwH5uSOCdTesE1omh9/juYYu0OzcPno5C4u5Nxipl/J31Vf+K2EudK7Ex3pq3U8ZuG2IPMm2H67d6//E+VRWq/Je7N1/9qB+Hk4IBY9JUud2F5+RsRPv7+uFCBksc2YXEqLDfFf8JJ8mAsNeFuFUUU+yiF1d6XOb85JkjpQ+CXUzx/TX+NsBRW/f52alyU3rWW8u5axTTaWFULv92Fbb8vNJf7fJ/BqLn/VK7ivdAxfKN+gY7mlPSMxzQTXbBo79eOadrmwaC/Cg3Rm3OmGEmaYfypB0HkN0sOKxHyRCXrcpAfmiGfWjQf1tTmX86spF0LbvcpMBqYT8HtaYNJ8lCbv4U+aSt2LbRi5Ah58pD/4Hdr97rNI2mBmwI6ClEslcZinec0YsTW69kRWkUPM4JnZ4S51cL6y0Q+AkR0fKTb2ZC3i4MF8Yj/+EBJs9JJoDG5m6g4FjLiv5igQz4JffIfMg3Dh3Ph+Bllab19ltAOJe33gjFqbBET7Ce9Uf9L00p/GJv6nLr5mgUzLn/0V02Wzt2sIRJakzcM/6dmFf5AYb1j5nm6wLRKNV0AQaC4s3IXsga4x8/XcfPNVs58IPoB2GYTpKOT2CnxM9Eq1XSy5eFF5FFJ93UOmyfYGd/pMCPm7zm5oHno5OpBfV9h8QJBNmHjlfwWAqE+A0jM4EhJkeI88VbP2wnpLrIOn6pFJ6wZdcPMCwt1e21j84zGKLr0BKcg2MCedoek7ooULfIkpVSJ5rQ5gBBy/flBBda4+ZD8t+xOO7KBKHnQYiXgjztLNpVvWCphgvFjKlGzDAi/bOTFt65wR+dkqTEVCJXq95wnk7pK427jBC3n2ZFuCYAspt7Ie0T5Mxfj1etdz5CI/CX/xUAEf4QBVnnW8X9EmFIax6Cd0CpO29fa/tj2h4X9NBCsJtwlZf9DjXrthObJqf2QG1nCtYlyEpd8KHtPRC+3Zt+EfJ2/v3eclu5xqpjFtH4DKLV2gPDRh6JRYuz+YjOdZsTbk/8T9ZCxsLkT7/m5VlOEpbm8OSeX4UpW+zoGeO0l6HDqkpe/ebxrRUy/ScPQXoVGSmPwnd5zGJfpFQybh/DQQdi0pcQ4YcE2gWHzVLFK233LQ3scUnGls8Me9wQ2u3vuEAZz8ecizNIWAyzDaGHN7Oe92UxgazGkZY7aHZ+sXILCBYFFTWTGgUbZT8tPcQrHr8bZv2n1XXa4SoBQrEe41crt4HLnBt62VGuvuP5WFyHo6sHfUuHNNZsI9ev6xzvfGlOGOx+GxCa0PpRz1FhBXPxWx0f/1mVBIbkLjAK0uBvIA9KZbEllWMQwApVfznI8NRBYovSeEUpf1r1r3NsrvZU1hUczzzFvLo4fj3ptn4nLscCbTsJo4HtukxxHVQYkpJwM2yIxhe7ZteYh1U7FCGNZI2CpWLHPZTSbhAZ2CF6J5R4IEfyU3GmlFi+dYtgOq9+esbKIQ8gGtd3IdzCVsJGxDnup389/+GHpcQrcXWn84pCbRtDibpYOXIBjITdpPs0vvfw38ByykZvwdxlAgyx8VaPQKCfBv/nGt6DBn4kL0s8P8dR1FsXliPydujk60KyQfXdxjazjx08J5dTG4YsLwY1ex3Nn9enJ+9W32YnuntX1aEkCowBky5Om1vzjwkNkN7kj++SQzdfya3Bwg2dj7wcagXgAEwFovRZ7MuemraAB68YWkqsdTWemjAWSGeaGeGYHKSQI9TdySrAqcYT1dKzKpr25qAAAAA=",
  "XH_MINIBUS": "data:image/webp;base64,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",
  "XH_CITYBUS": "data:image/webp;base64,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",
  "XH_12": "data:image/webp;base64,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",
  "NHÀ MÁY THCK": "data:image/webp;base64,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",
  "KHO VẬT TƯ": "data:image/webp;base64,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",
  "KHO CITYBUS": "data:image/webp;base64,UklGRooJAABXRUJQVlA4IH4JAADwKQCdASqgAGIAPmEskkakIqGhKFjqKIAMCWIAy5zpJ28729v4DhWq28l5/r/S+q38yewB+on906mfmE/mHo0+jX/Seir1L3oQfsZ1r3+I/79eY8LfNb7rl88s3dyfJ8VvqS8kH93/K/iXNI8Fb6v/p+ODuP/87+V/PcUBP45/b/+H/c/xu+T/Pl+Xf57/w+4N/JP67/zSXLkfWS2mBgNiQn74WhV9GuTaSt1Rk5k08kzUvr//hGureWFBr5kXCZuVNiDjizdt13j2yVfTmz5z/8HU+kWQq8EtAFcefmSk2VGTcd0TwTObl6W1ZIEmdHXSintjL+YkbjX0Kf0DpR4aMIyvh9ESLfcNcGp/lODjLxAb1/JLeS62FtS0uBAOAFyijTYHHUgpXfQ913P+LVykTEofD6QP9f67BnN+va5QBYULNu7h8MjDPKHMWFdgaWTocFua51Ly4AD+/xLwof//ygmAmIzYUaq9NhKS1RdcN9rEuZzK5gs/ggNYi7TYuFj0m6MVR+xKrWKJp0A9QWQwEnQJExsibKW7NNCMrQ/+FZg+8fz07KQvcGq1oZjt0xCpv4G+olfaf9H9X9Cy9vV4reOUqLmnEmoM9LS0DPgvzQPSQ6bbv2l0hFAs+uL4cF/2f8bKofF1qYqNrW+bRxqytRwN48E/ponLK0s81Zn6qriTUSzotBJiHArbLgtYOG0YpCQrZB9nu1pQX6r96ry5VqDLboMASazC7u7JA6ewN/c4dTv1OtOu6FrdljIFA87x/uiF3f5pV+YtDlqa12TvzWKolg7NZy96q14Y8XwBaNavLJTWX/hjnvjVZcNcfvMRnaVZB8OObS6aee2LlVnKNLJ0nCAuKRuLzMR2tkDi3Dn4nifbEIyBYj/KBWoeYQ9LXIBGWZRnT76VE/bfzShO9RdQAQDL8yW4H4ot+DiAOh2kUnNV+SgJ/qEb/NeQYNx9VkUUcVgAuIayPUQtvZlK8rbEyv3aZzS/xtwVAAxY2g2SmCyqZIov29V728Des4QPhEa/7wsaOPKv3sxGMWBHRw4/UnDTKBCcjT3rbE5cLW/hxx9yUseIjb34/A/fzVLkgVsltohm/ZKIT1K+CTlkFo0EwlQDOUiqoMlTrRlwO5ADHlgesBSKfcdZkqDuGW+c3T2xTfsxhxxhtYmZRVzaqP1GeisJQtT4VxolwOX+Up6i4emBYu+2WfOVMiK5ws66ZyNoqM7EG7zjP0ic0PM1b54slp9gT1y+O4SJfgWdx/kc7QjXZB69Nu2+J048/qKTjC8H7BnO/ruhUCVMz+rLpvAD9oZ9KWrILH/GA3HZ+netjkeZc+edk+Rlam8IlFZ+CX+6gvQFurM4fXGihQsLDetZycmfeAvz8zD/aLalDZaoGDOLS9v4IZZNNjYsieZLq1pGQyqLq5xfGwsVAuOziCaMHhU7TNJ6gEuf73sb9a3/EqHLaUbVtfxFwyZGOEAsPF3g+bCxvNb+hEi4yH+Zl8BzbzDMeaAWfrf+s30L1DMH1S+DH8e+Cjqi+H1rfwwzld9RPZUEV+Dp4bnOdT8H6F60MdjRP5IDIzVBXgtkpLhuNH4+sOOqyst+YOii3utAuWT/x/gUzUj3n+DtjL0JXlQ9lN7hn+7BoOr7hSBMoGP6vxZ/LBJTiKrt3s+sl9Ur0MgdFSYM3arqlIQuANNk4FnPOQl/4emS5lTDhdK1cHkwqaAfRHgXwy3zl6vs5lamsGhj0aLdy7OCA04XNCIk/Ch6i8BdOT/a/MI9eh1+7Uno24kn/Z87Y29C0//oiScuLkCzvPlYmH0DJv7McARmukmZ7vfpNVuAF9DHqX3NvTwrSIIDNWzK5sE0WGlbk8Tz3WxhUuVOQULH6/SgJsijQc66VR+mSsFIfn/uv2eQPNQjTx1zGnEP+eD7zcQqtcUV2BmXIETFyfdDcUmDOUz6wLMmhgF84wfD4X1/Sph+xWOm9+i10qBZ8J4j/r+weH+uxe9/nDVbRAi9FZ5/Wb7RhmPjzkTlyz6z+rL/0/VymgOJ6NmYw04OBapDxsOeVBhdUrcACBHJ+XbgBj6fJ7IZ9d63u6HOyBuCtymTaXcVMDUc2x/xHN6NIWYiro+dCaQDGPHZS3ii2OabFr8glW0/Se/7UFs2XX9gb1gjdkUHu1lex5GjSnvgLb4chKEFT9AJ7kLomka1deybauR8k2ovTppNf97bqawhX8r0IYUwbgQopsffhqZNHz0qbSD6RtItscf+TaF0xqo74cxWosgzhli14DhdiEWYyUatgy7twYJlYlw8l2ET0eLuS3I2c3jB5Z/2MkThMerEavexH5y8m7N8XIYOcs49Z7bWOCyQBugVLocqsr1gNPsMtw+tacenzOdBMbU/sK4Wm8gKjOERxT+88SETvpgA0jxFz8ajyRujMPFqPlDlxbRe7/NNIL5wlJW6nZev4Ec4rVoKJZxuKvBdKpLPGtmW+iwZn/JBmdgC6bb0KgpLfTB3+4kS/2WRP9a3tfEc0LO4CkwtDRFZWjQref7fD6HSCyVgPuURtpfQO6lBypAnUGxJSAT8JKvlX/eIDZDjbCiAY5UNdCWf0EglhdAqwcr3fkhXhKmnuIWCZbM9PCHqmfPCXgTEMsnr8iMuX8g/TeUyeF/6aOJBJXpEfYmKXzVJ7JzJkruXCfP8oGFjBuz3KF8YBj2Hh1SkdKibnmJsA0AflEBX3dI5dqwR6L4hzA8duB95TavQLVOoTfg0xXJIS+jAt+FykkPWRw4dcJPbCQx+RME/RlqfDG7rQlbrUrP6B0IVP2Y6gi3VEuH8Q99npAgLhcslc2sW+itrffv8FJCxiI5wQF/lE31byR6vx3FJIpqt3rYhyKTReearfsGDiFJMdgLtL1/6JB4sW8KeTJ+PJxp6QzNKn6IICnr1TFm2Y1MsYw57anBBpRST9f8adZ9Zf/V/HaoJqkNYsz1cWt+18ZEeyGr7PYYqL//0U6fdXr7eMnn1lk+DZLgjLoYnw1QJj7N0G7tINlyfJbqJiJiJlfX+wLZngLec/R3Ed9IW+zdiWiG5bwVvgICE6SRbQEDPt45kf8TV8RMrn20vPNSgQlby3tlimPxywNjX+ZJ5Lf/nP1f74esNoYdAhNAM7w9GjOiUMTGDWpPQCIgjRM3bwvjp7GPQc6qu6ZUnLNVQd4hSh03l2oP/x0fDw1xiAGMd0nNEtRiy7U7Jfa71VmaLmEnEN/AtSmPzpG5jnWvug9RoAAA=",
  // ⚠️ Lưu ý: ảnh 2 KHÔNG có icon riêng cho "KHO 12M" (chỉ có KHO VẬT TƯ, KHO CITYBUS,
  // KHO MINIBUS) — nên "KHO 12M" KHÔNG được gán ảnh ở đây, sẽ tự dùng icon emoji cũ (🚍)
  // để tránh hiển thị nhầm hình xe khác loại.
};

// ═══════════════════════════════════════════════════════════════
//  ✅ UNIT SYNCHRONIZATION & CONSOLIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Synchronize units by name
 * Groups users by their normalized unit names (UPPERCASE, trimmed)
 * Returns: { "UNIT NAME": [user_id1, user_id2, ...], ... }
 */
const getUnitSync = (users) => {
  const unitsByName = {};
  users.forEach(u => {
    const unitName = (u.don_vi || '').toUpperCase().trim();
    if (!unitsByName[unitName]) unitsByName[unitName] = [];
    unitsByName[unitName].push(u.id);
  });
  return unitsByName;
};

/**
 * Get unique synchronized unit names, sorted for display
 */
const getUnitOptions = (users) => {
  const unitSync = getUnitSync(users);
  return Object.keys(unitSync).sort((a, b) => {
    const aPriority = a.includes('_') ? 0 : 1;
    const bPriority = b.includes('_') ? 0 : 1;
    return aPriority - bPriority || a.localeCompare(b, 'vi');
  });
};

/**
 * Consolidate line permissions (phân quyền dòng xe theo đơn vị)
 * Ensures all users in the same unit have identical vehicle line permissions
 * Parameters:
 *   - lineQuyen: { userId: [line1, line2, ...], ... }
 *   - users: list of user objects with don_vi field
 * Returns: consolidated lineQuyen with permissions synced by unit
 */
const consolidateLinePermissions = (lineQuyen, users) => {
  const unitSync = getUnitSync(users);
  const consolidated = {};
  
  // Collect all permissions for each unit
  const unitPermissions = {};
  Object.entries(lineQuyen).forEach(([userId, lines]) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const unitName = (user.don_vi || '').toUpperCase().trim();
      if (!unitPermissions[unitName]) unitPermissions[unitName] = new Set();
      lines.forEach(line => unitPermissions[unitName].add(line));
    }
  });
  
  // Apply consolidated permissions to ALL users in each unit
  Object.entries(unitPermissions).forEach(([unitName, lines]) => {
    const usersInUnit = unitSync[unitName] || [];
    usersInUnit.forEach(uid => {
      consolidated[uid] = Array.from(lines);
    });
  });
  
  return consolidated;
};

/**
 * Consolidate function permissions (phân quyền chức năng theo đơn vị)
 * Ensures all users in the same unit have identical function/role permissions
 * Parameters:
 *   - roleByUnit: { unitName: role, ... }
 *   - users: list of user objects
 * Returns: consolidated permissions with all users in same unit getting same role
 */
const consolidateFunctionPermissions = (roleByUnit, users) => {
  const unitSync = getUnitSync(users);
  const consolidated = {};
  
  // For each unit and its assigned role, apply to ALL users in that unit
  Object.entries(roleByUnit).forEach(([unitName, role]) => {
    const normalizedUnit = unitName.toUpperCase().trim();
    const usersInUnit = unitSync[normalizedUnit] || [];
    usersInUnit.forEach(uid => {
      consolidated[uid] = role;
    });
  });
  
  return consolidated;
};

/**
 * Apply all synchronization at once
 * Returns object with synced lineQuyen and roleByUnit
 */
const applyUnitSync = (users, lineQuyen, roleByUnit) => {
  return {
    users,
    lineQuyen: consolidateLinePermissions(lineQuyen, users),
    roleByUnit: consolidateFunctionPermissions(roleByUnit, users)
  };
};

/**
 * Get all users in a specific unit (by name or by user id)
 */
const getUsersByUnit = (users, unitName) => {
  const normalized = (unitName || '').toUpperCase().trim();
  return users.filter(u => (u.don_vi || '').toUpperCase().trim() === normalized);
};

/**
 * Check if two units are synchronized (have the same name)
 */
const isSyncedUnit = (unit1, unit2) => {
  return (unit1 || '').toUpperCase().trim() === (unit2 || '').toUpperCase().trim();
};


// Cả 2 role đều thấy đủ tabs — chỉ khác quyền hành động
// THCK  → Soạn hàng, tạo phiếu, gửi đơn (KHÔNG xác nhận/duyệt)
// XH    → Xem phiếu, xác nhận, duyệt, quản lý BOM, người dùng
// KHTH  → Vai trò MỚI, chỉ xem — không soạn hàng, không duyệt, không quản lý BOM/người dùng
const TABS_ALL = [
  ["ds",        "📦 Vật tư"],
  ["soan",      "📋 Soạn Hàng"],
  ["duyet",     "✅ Kiểm Tra Xác Nhận"],
  ["pgn",       "📄 Phiếu GN"],
  ["bc",        "📈 Báo Cáo"],
  ["hoanthanh", "🏁 Dự Án Đã Hoàn Thành Vật Tư"],
  ["bom_mau",   "🗂️ Tạo BOM Mẫu"],
  ["users",     "👥 Phân Quyền Sử Dụng"],
];
const TABS_THCK     = TABS_ALL.filter(([k])=>!["users","duyet","bom_mau"].includes(k));
const TABS_XUONGHAN = TABS_ALL.filter(([k])=>!["users"].includes(k));
const TABS_KHO      = TABS_ALL.filter(([k])=>!["duyet","bom_mau","users"].includes(k));
// KHTH: chỉ xem — bỏ hẳn các tab thao tác (Soạn Hàng, Duyệt Đơn, BOM Mẫu, Người dùng)
const TABS_KHTH     = TABS_ALL.filter(([k])=>!["soan","duyet","bom_mau","users"].includes(k));

// ✅ Danh sách khoá (key) của các bộ tab theo từng VAI TRÒ — dùng làm "mặc định" cho
// bảng "Phân quyền chức năng theo đơn vị" (xem TAB_QUYEN_DEFAULT bên dưới) khi 1 đơn vị
// chưa được admin cấu hình riêng.
const TABS_THCK_KEYS     = TABS_THCK.map(([k])=>k);
const TABS_XUONGHAN_KEYS = TABS_XUONGHAN.map(([k])=>k);
const TABS_KHO_KEYS      = TABS_KHO.map(([k])=>k);
const TABS_KHTH_KEYS     = TABS_KHTH.map(([k])=>k);
// Bộ khoá mặc định theo vai trò — dùng khi 1 đơn vị (kể cả đơn vị tự thêm sau này) chưa
// có dòng riêng trong bảng "quyen_chuc_nang" trên Supabase.
const TAB_KEYS_BY_ROLE = {thck:TABS_THCK_KEYS, xuonghan:TABS_XUONGHAN_KEYS, kho:TABS_KHO_KEYS, khth:TABS_KHTH_KEYS};

// ─── Từ điển đa ngôn ngữ TOÀN APP (dùng qua LangCtx) ────────────────
const APP_I18N = {
  // Tabs
  tab_ds:        {vi:"📦 Vật tư",              zh:"📦 物料"},
  tab_soan:      {vi:"📋 Soạn Hàng",           zh:"📋 备料"},
  tab_duyet:     {vi:"✅ Kiểm Tra Xác Nhận",   zh:"✅ 核实确认"},
  tab_pgn:       {vi:"📄 Phiếu GN",            zh:"📄 收发单"},
  tab_bc:        {vi:"📈 Báo Cáo",             zh:"📈 报表"},
  tab_hoanthanh: {vi:"🏁 Dự Án Đã Hoàn Thành Vật Tư", zh:"🏁 已完成物料项目"},
  tab_bom_mau:   {vi:"🗂️ Tạo BOM Mẫu",        zh:"🗂️ 创建BOM模板"},
  tab_users:     {vi:"👥 Phân Quyền Sử Dụng",  zh:"👥 权限分配"},
  tab_cms:       {vi:"🖼️ Quản Trị CMS",       zh:"🖼️ CMS管理"},
  // Header brand / role
  brandTitle:  {vi:"Quản Lý Vật Tư BOM", zh:"BOM 物料管理系统"},
  roleTHCK:    {vi:"NHÀ MÁY THCK",     zh:"THCK 工厂"},
  roleKHO:     {vi:"KHO VẬT TƯ",       zh:"物料仓库"},
  roleXH:      {vi:"XƯỞNG HÀN",        zh:"焊接车间"},
  roleKHTH:    {vi:"PHÒNG KH-TH",      zh:"计划综合科"},
  subTHCK_KHO: {vi:"Soạn hàng · Lập phiếu giao vật tư", zh:"备料 · 制作发货单"},
  subXH:       {vi:"Kiểm tra · Xác nhận · Quản lý BOM", zh:"检查 · 确认 · 管理BOM"},
  subKHTH:     {vi:"Chỉ xem · Không thao tác",          zh:"仅查看 · 无操作权限"},
  // ExportBar
  btnExcel:    {vi:"Xuất Excel", zh:"导出Excel"},
  btnPDF:      {vi:"Xuất PDF",   zh:"导出PDF"},
  btnShare:    {vi:"Share",      zh:"分享"},
  btnPdfShare: {vi:"Xuất & Chia sẻ", zh:"导出并分享"},
  // Nút chung
  btnView:       {vi:"Xem",             zh:"查看"},
  btnConfirm:    {vi:"✓ Xác nhận",      zh:"✓ 确认"},
  btnConfirmAll: {vi:"✓ Duyệt tất cả",  zh:"✓ 全部审批"},
  btnEdit:       {vi:"✏️ Sửa phiếu",    zh:"✏️ 编辑单据"},
  btnMore:       {vi:"📋 Xem thêm",     zh:"📋 查看更多"},
  btnAddNew:     {vi:"+ Thêm mới",      zh:"+ 新增"},
  btnCreatePh:   {vi:"+ Tạo phiếu",     zh:"+ 创建单据"},
  // Trạng thái phiếu (chỉ hiển thị, KHÔNG đổi giá trị dữ liệu gốc)
  statusChoXN:    {vi:"Chờ xác nhận", zh:"待确认"},
  statusDaXN:     {vi:"Đã xác nhận",  zh:"已确认"},
  // Bộ lọc
  filterAll:        {vi:"Tất cả",         zh:"全部"},
  filterThieu:      {vi:"Còn thiếu",      zh:"缺料"},
  filterDaNhan:     {vi:"Đã nhận",        zh:"已收"},
  filterChuaSoan:   {vi:"Chưa soạn",      zh:"未备料"},
  filterGiaoThieu:  {vi:"Giao thiếu SL",  zh:"交货不足"},
  filterThieuTHCK:  {vi:"Thiếu THCK",     zh:"THCK缺料"},
  filterThieuCKD:   {vi:"Thiếu CKD",      zh:"CKD缺料"},
  // Bảng
  thSTT:        {vi:"STT",         zh:"序号"},
  thMa:         {vi:"Mã số",       zh:"编号"},
  thTen:        {vi:"Tên vật tư",  zh:"物料名称"},
  thDVT:        {vi:"ĐVT",         zh:"单位"},
  thDM:         {vi:"ĐM",          zh:"定额"},
  thCan:        {vi:"Cần",         zh:"需求"},
  thDaNhan:     {vi:"Đã nhận",     zh:"已收"},
  thConThieu:   {vi:"Còn thiếu",   zh:"缺少"},
  thTrangThai:  {vi:"Trạng thái",  zh:"状态"},
  thGhiChu:     {vi:"Ghi chú",     zh:"备注"},
  thNguonGoc:   {vi:"Nguồn gốc",   zh:"来源"},
  thTienDo:     {vi:"Tiến độ",     zh:"进度"},
  thNguoiDuyet: {vi:"Người duyệt", zh:"审批人"},
  thNguoiSoan:  {vi:"Người soạn",  zh:"制单人"},
  thPhieu:      {vi:"Phiếu",       zh:"单据"},
  thVuot:       {vi:"Vượt",        zh:"超出"},
  thCanNhan:    {vi:"Cần nhận",    zh:"需接收"},
  thAnh:        {vi:"Ảnh",         zh:"图片"},
  thThaoTac:    {vi:"Thao tác",    zh:"操作"},
  thMaTk:       {vi:"Mã",          zh:"编号"},
  progTitle:      {vi:"📊 Tiến độ Nhận Vật Tư Tích Lũy", zh:"📊 累计收料进度"},
  progTitleDone:  {vi:"✅ Đã nhận đủ vật tư!",           zh:"✅ 物料已全部收齐！"},
  progTienDoTichLuy: {vi:"Tiến độ nhận vật tư tích lũy", zh:"累计收料进度"},
  progDaNhanNhan: {vi:"Đã nhận",  zh:"已收"},
  progThieuNhan:  {vi:"Thiếu",    zh:"缺料"},
  progTongNhan:   {vi:"Tổng",     zh:"总计"},
  progCan:        {vi:"Cần",      zh:"需求"},
  progDaNhan:     {vi:"Đã nhận",  zh:"已收"},
  progConThieu:   {vi:"Còn thiếu",zh:"缺少"},
  searchPlaceholderMaPGN: {vi:"🔍 Tìm mã/tên vật tư để xem nằm trong Phiếu GN nào (VD: KL2801)...", zh:"🔍 搜索物料编号/名称，查看所属收发单（例：KL2801）..."},
  btnXoaTim:    {vi:"✕ Xóa",      zh:"✕ 清除"},
  khongTimThayVT: {vi:"❌ Không tìm thấy vật tư nào khớp với", zh:"❌ 未找到匹配的物料"},
  trangThaiDu:   {vi:"✅ Đủ",     zh:"✅ 已足量"},
  trangThaiThieu:{vi:"⚠️ Thiếu",  zh:"⚠️ 缺料"},
  // Tiêu đề khu vực từng tab
  titleDs:      {vi:"📦 Danh sách Vật tư",         zh:"📦 物料清单"},
  titleSoan:    {vi:"📋 Soạn Hàng",                zh:"📋 备料"},
  titleDuyet:   {vi:"✅ Duyệt Đơn Hàng — XƯỞNG HÀN", zh:"✅ 审批订单 — 焊接车间"},
  titlePgnSent: {vi:"📄 Phiếu đã gửi",              zh:"📄 已发送单据"},
  titleBc:      {vi:"📈 Báo Cáo Tổng Hợp Nhận Vật Tư", zh:"📈 收料综合报表"},
  titleBcDone:  {vi:"✅ Đã nhận đủ vật tư toàn bộ!", zh:"✅ 已全部收齐物料！"},
  titleBomMau:  {vi:"🗂️ BOM Mẫu",                 zh:"🗂️ BOM 模板"},
  titleUsers:   {vi:"👥 Người dùng",                zh:"👥 用户管理"},
  // Tiêu đề báo cáo khi Xuất PDF (khác chút so với tiêu đề tab để giữ đúng ngữ cảnh in ấn)
  rpDs:      {vi:"📦 Danh sách Vật Tư BOM",              zh:"📦 BOM物料清单"},
  rpSoan:    {vi:"📋 Danh sách Soạn Hàng",               zh:"📋 备料清单"},
  rpDuyet:   {vi:"✅ Danh Sách Đơn Hàng",                zh:"✅ 订单清单"},
  rpPgn:     {vi:"📄 Phiếu Giao Nhận — Bảng Tích Lũy",   zh:"📄 收发单 — 累计表"},
  rpLs:      {vi:"🕓 Lịch Sử Giao Dịch",                 zh:"🕓 交易历史记录"},
  rpTk:      {vi:"📊 Thống Kê Vật Tư Theo Vị Trí",       zh:"📊 按位置统计物料"},
  // Tiêu đề các popup/modal
  modalAdd:          {vi:"➕ Thêm vật tư",              zh:"➕ 添加物料"},
  modalUpdate:       {vi:"✏️ Cập nhật",                 zh:"✏️ 更新"},
  modalNhap:         {vi:"📥 Nhập kho",                  zh:"📥 入库"},
  modalXuat:         {vi:"📤 Xuất kho",                  zh:"📤 出库"},
  modalNewProj:      {vi:"🆕 Thêm dự án mới",            zh:"🆕 新增项目"},
  modalTaoPGN:       {vi:"📋 Tạo Phiếu Giao Nhận",       zh:"📋 创建收发单"},
  modalImportExcel:  {vi:"📊 Import BOM từ Excel",       zh:"📊 从Excel导入BOM"},
  modalImportProj:   {vi:"📥 Import BOM vào dự án",      zh:"📥 导入BOM到项目"},
  // Bảng người dùng
  thHoTen:    {vi:"Họ tên",    zh:"姓名"},
  thMatKhau:  {vi:"Mật khẩu",  zh:"密码"},
  // Bảng thống kê theo vị trí
  thSoMa:     {vi:"Số mã",     zh:"编号数"},
  thTongDM:   {vi:"Tổng ĐM",   zh:"总定额"},
  thTiLe:     {vi:"Tỉ lệ",     zh:"比例"},
  // Bảng lịch sử
  thThoiGian: {vi:"Thời gian",  zh:"时间"},
  thDuAn:     {vi:"Dự án",      zh:"项目"},
  thMaVT:     {vi:"Mã VT",      zh:"物料编号"},
  thTenVT:    {vi:"Tên VT",     zh:"物料名称"},
  thLoai:     {vi:"Loại",       zh:"类型"},
  thSL:       {vi:"SL",         zh:"数量"},
  thSoSoan:   {vi:"SL soạn",    zh:"备料数量"},
  thTinhTrang:{vi:"Tình trạng", zh:"状况"},
  // Nhãn ô nhập liệu (form vật tư)
  lbMa:      {vi:"Mã số",      zh:"编号"},
  lbMaReq:   {vi:"Mã số *",    zh:"编号 *"},
  lbTen:     {vi:"Tên vật tư", zh:"物料名称"},
  lbTenReq:  {vi:"Tên vật tư *", zh:"物料名称 *"},
  lbDV:      {vi:"Đơn vị",     zh:"单位"},
  lbVT:      {vi:"Vị trí",     zh:"位置"},
  lbDM1XE:   {vi:"ĐM/1XE",     zh:"定额/每车"},
  // Nhãn bảng còn lại
  thDuyet:      {vi:"Duyệt",         zh:"审批"},
  thSLThucNhan: {vi:"SL thực nhận",  zh:"实收数量"},
  thThieu:      {vi:"Thiếu",         zh:"缺少"},
  thXoa:        {vi:"Xóa",           zh:"删除"},
  thSua:        {vi:"Sửa",           zh:"编辑"},
  thSoLuong:    {vi:"Số lượng",      zh:"数量"},
  thSLThieu:    {vi:"SL thiếu",      zh:"缺少数量"},
  statMaVT:     {vi:"Mã vật tư",     zh:"物料编号"},
  statTongDM:   {vi:"Tổng ĐM/1XE",   zh:"总定额/每车"},
  statCoAnh:    {vi:"Có ảnh",        zh:"有图片"},
};
const LangCtx = createContext({lang:"vi", t:(k)=>APP_I18N[k]?.vi||k, setLang:()=>{}});
const useLang = ()=>useContext(LangCtx);

const LOGIN_I18N = {
  vi: {
    brand: "QUẢN LÝ VẬT TƯ BOM",
    brandSub: "XƯỞNG HÀN XE BUÝT",
    title: "Đăng nhập hệ thống",
    accLabel: "Tài khoản",
    accPlaceholder: "Nhập hoặc chọn tài khoản...",
    pwLabel: "Mật khẩu",
    pwPlaceholder: "Nhập mật khẩu...",
    loginBtn: "Đăng nhập →",
    demoAcc: "Tài khoản demo",
    errNoAcc: "Vui lòng chọn tài khoản!",
    errBadPw: "Mật khẩu không đúng!",
    roleThck: "Soạn hàng · Lập phiếu giao",
    roleKho: "Quản lý kho · Xuất/Nhập vật tư",
    roleXh: "Kiểm tra · Xác nhận · Quản lý",
    roleKhth: "Chỉ xem · Không thao tác",
  },
  zh: {
    brand: "BOM 物料管理系统",
    brandSub: "公交车焊接车间",
    title: "系统登录",
    accLabel: "账号",
    accPlaceholder: "输入或选择账号...",
    pwLabel: "密码",
    pwPlaceholder: "请输入密码...",
    loginBtn: "登录 →",
    demoAcc: "演示账号",
    errNoAcc: "请选择账号！",
    errBadPw: "密码不正确！",
    roleThck: "备料 · 制作发货单",
    roleKhth: "仅查看 · 无操作权限",
    roleKho: "仓库管理 · 出/入库物料",
    roleXh: "检查 · 确认 · 管理",
  },
};

// ─── Login Screen — Chọn dòng xe rồi đăng nhập (thiết kế Kim Long Motor) ──
// Chỉ khi chọn "Mini Bus" mới thực sự đăng nhập vào hệ thống (kết nối Supabase).
// 2 dòng còn lại (12M, City Bus) hiển thị y hệt nhưng chưa kích hoạt đăng nhập thật.
const KL_LOGO_B64 = "data:image/png;base64,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";
const KL_BANNER_B64 = "data:image/jpeg;base64,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";
const XH_BUS_ICON_B64 = "data:image/jpeg;base64,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";

// ═══════════════════════════════════════════════════════════════
// 🎨 BỘ ICON VECTOR (SVG line-art) — thay thế emoji cho khu vực header
// đăng nhập (Production System / Xin chào / 4 icon Bảo mật-Hiệu quả-
// Chính xác-Kết nối), phong cách nét mảnh đồng nhất giống ảnh mẫu.
// ═══════════════════════════════════════════════════════════════
function KlIconShieldCheck({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5.5c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5V6l7-3z"/>
    <path d="M9 12l2 2 4-4.2"/>
  </svg>);
}
function KlIconGauge({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15a8 8 0 1 1 16 0"/>
    <path d="M12 15l4-5"/>
    <path d="M12 15h.01"/>
    <path d="M4 15h1.5M18.5 15H20M6.5 8.5l1 1M17.5 8.5l-1 1"/>
  </svg>);
}
function KlIconTrendingUp({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 14.5l5.5-6 3.5 3 6.5-7.5"/>
    <path d="M14.5 4h4.5v4.5"/>
    <path d="M4 19h16"/>
  </svg>);
}
function KlIconGear({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.2"/>
    <path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.36 5.64l-1.7 1.7M7.34 16.66l-1.7 1.7M18.36 18.36l-1.7-1.7M7.34 7.34l-1.7-1.7"/>
  </svg>);
}
function KlIconPower({size=20,color="#fff",strokeWidth=2}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v8"/>
    <path d="M7 6a8 8 0 1 0 10 0"/>
  </svg>);
}
function KlIconKey({size=18,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="15" r="4"/>
    <path d="M11 12l8-8"/>
    <path d="M16 7l2.5 2.5"/>
    <path d="M13.5 9.5L16 12"/>
  </svg>);
}
function KlIconBell({size=20,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z"/>
    <path d="M10 19a2 2 0 0 0 4 0"/>
  </svg>);
}
function KlIconUser({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.6"/>
    <path d="M4.8 20c1-3.4 3.9-5.4 7.2-5.4s6.2 2 7.2 5.4"/>
  </svg>);
}
function KlIconClock({size=13,color="#94a3b8",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M12 7.5V12l3 2"/>
  </svg>);
}
function KlIconChevronRight({size=16,color="#fff",strokeWidth=2.2}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7"/>
  </svg>);
}

const KL_LOGIN_CSS = `
.kl-select-login{
  --bg:#0d1318;
  --panel:#1c2831;
  --panel-2:#22303a;
  --line:#37474f;
  --text:#f5f9fb;
  --muted:#a6b6c0;
  --steel:#2f8fff;
  --teal:#0fe0a4;
  --amber:#ff9a1f;
  background:
    radial-gradient(ellipse at top, #131c22 0%, var(--bg) 55%),
    repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 26px);
  color:var(--text);
  font-family:'Inter', sans-serif;
  min-height:100vh;
  width:100%;
  display:flex;
  flex-direction:column;
  overflow-x:hidden;
  box-sizing:border-box;
}
.kl-select-login.kl-gate{
  background:#ffffff;
  align-items:center;
  justify-content:center;
  padding:24px;
}
.kl-select-login *{box-sizing:border-box;}
.kl-select-login header{
  padding:36px 6vw 20px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:1px solid var(--line);
}
.kl-select-login .brand{display:flex; align-items:stretch; gap:14px; cursor:pointer; transition:opacity .2s ease;}
.kl-select-login .brand:hover{opacity:.8;}
.kl-select-login .brand-mark{height:64px; width:auto; flex-shrink:0; object-fit:contain; align-self:center;}
.kl-select-login .brand-textbox{
  display:flex; flex-direction:column; justify-content:center;
  gap:3px;
  background:#050b1c;
  border:2px solid #f97316;
  border-radius:10px;
  padding:8px 18px;
  min-height:64px;
  box-sizing:border-box;
}
.kl-select-login .brand-textbox .eyebrow{
  font-family:'JetBrains Mono', monospace;
  font-size:11px;
  letter-spacing:.18em;
  color:var(--muted);
  text-transform:uppercase;
}
.kl-select-login .brand-textbox h1{
  font-family:'Oswald', sans-serif;
  font-size:22px;
  font-weight:600;
  letter-spacing:.04em;
  text-transform:uppercase;
  color:var(--text);
  margin:0;
}
.kl-select-login .status{
  font-family:'JetBrains Mono', monospace;
  font-size:11px;
  color:var(--muted);
  text-align:right;
  line-height:1.6;
}
.kl-select-login .status span{color:var(--teal);}
.kl-select-login .hero{padding:56px 6vw 10px;}
.kl-select-login #select-view .hero{padding:60px 6vw 12px; text-align:center;}
.kl-select-login #select-view .hero .eyebrow{
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-family:'JetBrains Mono', monospace;
  font-size:11.5px;
  font-weight:600;
  letter-spacing:.2em;
  color:var(--steel);
  text-transform:uppercase;
  margin-bottom:20px;
  padding:7px 16px;
  border:1px solid rgba(47,143,255,0.35);
  border-radius:999px;
  background:rgba(47,143,255,0.08);
}
.kl-select-login #select-view .hero .eyebrow::before{
  content:"";
  width:6px; height:6px; border-radius:50%;
  background:var(--steel);
  box-shadow:0 0 8px var(--steel);
  flex-shrink:0;
}
.kl-select-login #select-view .hero h2{
  font-family:'Oswald', sans-serif;
  font-weight:700;
  font-size:clamp(24px, 3.6vw, 36px);
  text-transform:none;
  letter-spacing:.005em;
  line-height:1.28;
  color:var(--text);
  max-width:640px;
  margin:0 auto;
}
.kl-select-login #select-view .hero p{margin:16px auto 0; color:var(--muted); font-size:14.5px; line-height:1.65; max-width:460px;}
.kl-select-login main{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:40px 6vw 70px;
}
/* ── Màn hình "Chọn trạng thái dự án" (Bước 3): đưa các thẻ Giai đoạn lên sát
   ngay dưới đoạn mô tả, thay vì canh giữa màn hình (tạo khoảng trắng lớn). ── */
#project-view main{
  align-items:flex-start;
  justify-content:flex-start;
  padding-top:18px;
}
.kl-select-login .lines{
  display:grid;
  grid-template-columns:repeat(3, minmax(200px,260px));
  gap:34px;
  width:100%;
  max-width:960px;
}
.kl-select-login .card{
  position:relative;
  background:linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
  border:1px solid var(--line);
  border-radius:26px 26px 14px 14px;
  padding:30px 22px 26px;
  cursor:pointer;
  transition:transform .25s ease, border-color .25s ease, box-shadow .25s ease;
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  gap:18px;
  isolation:isolate;
  overflow:hidden;
  box-shadow:0 10px 26px -18px rgba(0,0,0,0.6);
}
.kl-select-login .card::before{
  content:"";
  position:absolute; inset:0;
  background:radial-gradient(circle at 50% 0%, var(--accent) 0%, transparent 60%);
  opacity:0;
  transition:opacity .3s ease;
  z-index:-1;
}
.kl-select-login .card::after{
  content:"";
  position:absolute; top:0; left:14%; right:14%; height:3px;
  border-radius:0 0 3px 3px;
  background:var(--accent);
  opacity:.7;
}
.kl-select-login .card.card-locked{
  opacity:.5;
  filter:grayscale(.55);
}
.kl-select-login .card.card-locked:hover{ transform:none; }
.kl-select-login .card.card-locked .enter{ color:#9ca3af; }
.kl-select-login .card:hover, .kl-select-login .card:focus-visible{
  transform:translateY(-6px);
  border-color:var(--accent);
  box-shadow:0 22px 46px -16px var(--accent);
}
.kl-select-login .card:hover::before, .kl-select-login .card:focus-visible::before{opacity:.16;}
.kl-select-login .icon-wrap{
  width:92px; height:92px;
  border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--accent) 20%, transparent), rgba(255,255,255,0.02) 70%);
  border:1px solid color-mix(in srgb, var(--accent) 45%, var(--line));
  box-shadow:0 0 0 1px rgba(255,255,255,0.02) inset, 0 8px 24px -10px var(--accent);
  transition:box-shadow .25s ease, transform .25s ease;
}
.kl-select-login .card:hover .icon-wrap, .kl-select-login .card:focus-visible .icon-wrap{
  box-shadow:0 0 0 1px rgba(255,255,255,0.04) inset, 0 10px 32px -8px var(--accent);
  transform:scale(1.05);
}
.kl-select-login .icon-wrap svg{width:54px; height:54px;}
.kl-select-login .card .tag{
  font-family:'JetBrains Mono', monospace;
  font-size:10.5px;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--accent);
}
.kl-select-login .card h3{
  font-family:'Oswald', sans-serif;
  font-size:24px;
  font-weight:600;
  letter-spacing:.02em;
  text-transform:uppercase;
  color:var(--text);
}
.kl-select-login .card .desc{font-size:12.5px; color:var(--muted); line-height:1.5;}
.kl-select-login .enter{
  margin-top:6px;
  font-family:'Oswald', sans-serif;
  font-size:12.5px;
  font-weight:700;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:var(--accent);
  display:flex; align-items:center; gap:6px;
  opacity:.95;
  transition:opacity .25s ease, gap .25s ease;
}
.kl-select-login .card:hover .enter{opacity:1; gap:10px;}
.kl-select-login footer{
  padding:16px 6vw 26px;
  text-align:center;
  font-family:'JetBrains Mono', monospace;
  font-size:10.5px;
  color:var(--muted);
  letter-spacing:.08em;
}
.kl-select-login #project-view{
  flex:1;
  display:flex;
  flex-direction:column;
}
.kl-select-login #project-view .hero{padding-top:36px;}
.kl-select-login #project-view .hero .back-btn{margin-bottom:20px;}
.kl-select-login #project-view .login-head{margin-bottom:14px;}
.kl-select-login #project-view .hero p{color:var(--muted); font-size:14px; margin-top:2px;}
.kl-select-login .login-box{
  width:100%;
  max-width:380px;
  background:linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
  border:1px solid var(--line);
  border-radius:18px;
  padding:38px 34px 34px;
  position:relative;
}
.kl-select-login .login-box::before{
  content:"";
  position:absolute; top:0; left:0; right:0; height:3px;
  border-radius:18px 18px 0 0;
  background:var(--accent, var(--steel));
}
.kl-select-login .back-btn{
  background:rgba(249,115,22,0.08); border:1.5px solid #f97316; border-radius:999px; color:#fff;
  font-family:'JetBrains Mono', monospace;
  font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
  display:inline-flex; align-items:center; gap:6px;
  padding:7px 16px;
  cursor:pointer; margin-bottom:22px;
  transition:color .2s ease, opacity .2s ease, background .2s ease;
}
.kl-select-login .back-btn:hover{background:rgba(249,115,22,0.18); opacity:.9;}
.kl-select-login .login-head{display:flex; align-items:center; gap:14px; margin-bottom:26px;}
.kl-select-login .login-head .icon-wrap{width:52px; height:52px;}
.kl-select-login .login-head .icon-wrap svg{width:28px; height:28px;}
.kl-select-login .login-head .tag{display:block; margin-bottom:2px;}
.kl-select-login .login-head h2{font-family:'Oswald', sans-serif; font-size:20px; text-transform:uppercase; letter-spacing:.02em; color:var(--text);}
.kl-select-login .field{margin-bottom:16px;}
.kl-select-login .field label{
  display:block;
  font-family:'JetBrains Mono', monospace;
  font-size:11px;
  font-weight:700;
  letter-spacing:.1em;
  text-transform:uppercase;
  color:var(--accent, var(--steel));
  margin-bottom:7px;
}
.kl-select-login .field input{
  width:100%;
  background:#0f161c;
  border:1px solid var(--line);
  border-radius:8px;
  padding:12px 13px;
  color:var(--text);
  font-family:'Inter', sans-serif;
  font-size:14px;
  outline:none;
  transition:border-color .2s ease;
}
.kl-select-login .field input:focus{border-color:var(--accent, var(--steel));}
.kl-select-login .submit-btn{
  width:100%;
  margin-top:10px;
  padding:13px;
  border:none;
  border-radius:8px;
  background:var(--accent, var(--steel));
  color:#0a0f14;
  font-family:'Oswald', sans-serif;
  font-weight:700;
  font-size:15px;
  letter-spacing:.06em;
  text-transform:uppercase;
  cursor:pointer;
  transition:filter .2s ease;
}
.kl-select-login .submit-btn:hover{filter:brightness(1.1);}
.kl-select-login .login-foot{margin-top:18px; text-align:center; font-size:12px; color:var(--muted);}
@media (max-width:760px){
  .kl-select-login .lines{grid-template-columns:1fr; max-width:320px;}
}

/* ---------- GATE LOGIN (tài khoản / mật khẩu) ---------- */
.kl-select-login .gate-grid{
  width:100%;
  max-width:1040px;
  min-height:600px;
  margin:5vh auto;
  display:grid;
  grid-template-columns:1.05fr 1fr;
  background:#ffffff;
  border:1px solid #ffd6ad;
  border-radius:22px;
  overflow:hidden;
  box-shadow:0 30px 70px -30px rgba(255,106,0,0.25);
}
.kl-select-login .gate-visual{
  position:relative;
  background:
    radial-gradient(circle at 20% 15%, rgba(255,106,0,0.10) 0%, transparent 55%),
    #fff7f0;
  border-right:1px solid #ffd6ad;
  overflow:hidden;
  display:flex;
}
.kl-select-login .gate-visual-inner{position:relative; flex:1; padding:48px 42px; display:flex; align-items:flex-end;}
.kl-select-login .kl-blueprint{position:absolute; inset:0; width:100%; height:100%; opacity:.9;}
.kl-select-login .kl-blueprint path, .kl-select-login .kl-blueprint circle, .kl-select-login .kl-blueprint line{stroke:rgba(255,106,0,0.45) !important;}
.kl-select-login .kl-blueprint rect{opacity:.5;}
.kl-select-login .kl-grid-pattern path{stroke:rgba(255,106,0,0.14) !important;}
.kl-select-login .scan-line{
  position:absolute; left:0; right:0; height:120px; top:-120px;
  background:linear-gradient(180deg, transparent, rgba(255,106,0,0.16), transparent);
  animation:kl-scan 7s linear infinite;
}
@keyframes kl-scan{ 0%{top:-120px;} 100%{top:100%;} }
.kl-select-login .gate-visual-content{position:relative; z-index:1;}
.kl-select-login .gate-visual-eyebrow{
  font-family:'JetBrains Mono', monospace;
  font-size:11px; font-weight:700; letter-spacing:.18em;
  color:#ff6a00; text-transform:uppercase; margin-bottom:14px;
}
.kl-select-login .gate-visual-title{
  font-family:'Oswald', sans-serif;
  font-size:clamp(26px, 3vw, 34px);
  font-weight:700;
  text-transform:uppercase;
  line-height:1.15;
  letter-spacing:.01em;
  margin-bottom:16px;
  background:linear-gradient(180deg, #1c1c1c, #4a4a4a);
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
}
.kl-select-login .gate-visual-sub{
  color:#6b6b6b;
  font-size:13.5px;
  line-height:1.6;
  max-width:340px;
  margin-bottom:28px;
}
.kl-select-login .module-chips{display:flex; gap:10px; flex-wrap:wrap;}
.kl-select-login .chip{
  display:flex; align-items:center; gap:7px;
  font-family:'JetBrains Mono', monospace;
  font-size:11px; font-weight:600; letter-spacing:.04em;
  color:#3a3a3a;
  background:#fff2e6;
  border:1px solid #ffcf9e;
  border-radius:999px;
  padding:6px 12px;
}
.kl-select-login .chip .dot{width:7px; height:7px; border-radius:50%; display:inline-block; background:#ff6a00 !important;}
.kl-select-login .corner{position:absolute; width:22px; height:22px; border-color:#ff6a00; opacity:.5;}
.kl-select-login .corner.tl{top:-30px; left:-6px; border-top:2px solid; border-left:2px solid;}
.kl-select-login .corner.tr{top:-30px; right:-6px; border-top:2px solid; border-right:2px solid;}
.kl-select-login .gate-form-panel{display:flex; align-items:center; justify-content:center; padding:48px 40px;}
.kl-select-login .gate-box{width:100%; max-width:340px; --accent:#ff6a00;}
.kl-select-login .gate-eyebrow{
  font-family:'JetBrains Mono', monospace;
  font-size:11px; font-weight:700; letter-spacing:.18em;
  color:#ff6a00; text-transform:uppercase; margin-bottom:8px;
}
.kl-select-login .gate-title{
  font-family:'Oswald', sans-serif;
  font-weight:700;
  font-size:clamp(24px, 3vw, 30px);
  text-transform:uppercase;
  letter-spacing:.01em;
  color:#1c1c1c;
  margin-bottom:8px;
}
.kl-select-login .gate-sub{color:#6b6b6b; font-size:13.5px; line-height:1.55; margin-bottom:28px;}
.kl-select-login .field-icon .input-wrap{position:relative; display:flex; align-items:center;}
.kl-select-login .field-icon .input-icon{
  position:absolute; left:14px;
  width:16px; height:16px;
  color:#b5794a;
  pointer-events:none;
  z-index:1;
}
.kl-select-login .field-icon input{padding-left:46px !important;}
.kl-select-login .field-icon .input-wrap:focus-within .input-icon{color:#ff6a00;}
.kl-select-login .field-icon .pw-toggle{
  position:absolute; right:14px;
  background:none; border:none; padding:0; margin:0;
  display:flex; align-items:center; justify-content:center;
  width:19px; height:19px;
  color:#b5794a; cursor:pointer; z-index:1;
}
.kl-select-login .field-icon .pw-toggle:hover{color:#ff6a00;}
.kl-select-login .field-icon.has-toggle input{padding-right:42px !important;}
.kl-select-login .gate-row{
  display:flex; align-items:center; justify-content:space-between;
  margin:2px 0 18px;
  font-size:12.5px;
}
.kl-select-login .remember{display:flex; align-items:center; gap:7px; color:#6b6b6b; cursor:pointer;}
.kl-select-login .remember input{accent-color:#ff6a00; width:14px; height:14px;}
.kl-select-login .forgot{color:#ff6a00; text-decoration:none; font-weight:600;}
.kl-select-login .forgot:hover{text-decoration:underline;}
.kl-select-login .gate-box .field{margin-bottom:16px;}
.kl-select-login .gate-box .field label{
  display:block;
  font-family:'JetBrains Mono', monospace;
  font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
  color:#ff6a00; margin-bottom:7px;
}
.kl-select-login .gate-box .field input{
  width:100%;
  background:#fffaf5;
  border:1.5px solid #ffcf9e;
  border-radius:10px;
  padding:12px 13px;
  color:#1c1c1c;
  font-family:'Inter', sans-serif;
  font-size:14px; font-weight:500;
  outline:none;
  transition:border-color .2s ease;
}
.kl-select-login .gate-box .field input::placeholder{color:#c9a583;}
.kl-select-login .gate-box .field input:focus{border-color:#ff6a00; box-shadow:0 0 0 3px rgba(255,106,0,0.12);}
.kl-select-login .gate-box .field.field-icon input{padding-left:46px !important;}
.kl-select-login .gate-submit{
  width:100%;
  margin-top:2px;
  padding:13px;
  border:none;
  border-radius:8px;
  background:#ff6a00;
  color:#ffffff;
  font-family:'Oswald', sans-serif;
  font-weight:700;
  font-size:14.5px;
  letter-spacing:.06em;
  text-transform:uppercase;
  cursor:pointer;
  box-shadow:0 10px 24px -10px rgba(255,106,0,0.55);
  transition:filter .2s ease;
}
.kl-select-login .gate-submit:hover{filter:brightness(1.06);}
.kl-select-login .gate-foot{
  margin-top:26px;
  font-family:'JetBrains Mono', monospace;
  font-size:10.5px;
  color:#9a9a9a;
  letter-spacing:.08em;
}
.kl-select-login .gate-err{
  background:#fee2e2; border:1px solid #fca5a5; border-radius:8px;
  padding:9px 13px; font-size:12px; color:#991b1b; margin-bottom:14px;
}
@media (max-width:820px){
  .kl-select-login .gate-grid{grid-template-columns:1fr; max-width:440px; margin:0; min-height:100vh; border-radius:0; border:none;}
  .kl-select-login .gate-visual{display:none;}
  .kl-select-login .gate-form-panel{padding:44px 30px;}
}

/* ---------- FOLDER / PROJECT STATUS CARDS ---------- */
.kl-select-login .folder-card .desc{min-height:34px;}
`;

const KL_LINES = [
  {
    id:"12m", title:"Xe 12M", tagText:"Dòng xe · 01",
    desc:"Khung gầm cỡ lớn, sản lượng chính của dây chuyền hàn.",
    accent:"var(--steel)",
    icon:(
      <svg viewBox="0 0 64 40" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="g-12m" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--steel)" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="var(--steel)" stopOpacity="0.08"/>
          </linearGradient>
        </defs>
        <rect x="3" y="9" width="58" height="21" rx="3" fill="url(#g-12m)" stroke="var(--steel)" strokeWidth="1.6"/>
        <rect x="7" y="12.5" width="9" height="8" rx="1.4" fill="var(--steel)" fillOpacity="0.85" stroke="none"/>
        <rect x="19" y="12.5" width="9" height="8" rx="1.4" fill="var(--steel)" fillOpacity="0.55" stroke="none"/>
        <rect x="31" y="12.5" width="9" height="8" rx="1.4" fill="var(--steel)" fillOpacity="0.55" stroke="none"/>
        <rect x="43" y="12.5" width="9" height="8" rx="1.4" fill="var(--steel)" fillOpacity="0.55" stroke="none"/>
        <line x1="55" y1="9" x2="55" y2="30" stroke="var(--steel)" strokeWidth="1.2" strokeOpacity="0.6"/>
        <circle cx="16" cy="33" r="4.6" fill="#0d1318" stroke="var(--steel)" strokeWidth="1.8"/>
        <circle cx="48" cy="33" r="4.6" fill="#0d1318" stroke="var(--steel)" strokeWidth="1.8"/>
        <circle cx="59" cy="17" r="1.4" fill="var(--steel)" stroke="none"/>
      </svg>
    ),
  },
  {
    id:"citybus", title:"City Bus", tagText:"Dòng xe · 02",
    desc:"Xe buýt phục vụ tuyến nội thành, sàn thấp.",
    accent:"var(--teal)",
    icon:(
      <svg viewBox="0 0 64 44" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="g-city" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.08"/>
          </linearGradient>
        </defs>
        <path d="M6 33V13a5 5 0 0 1 5-5h20l13 9.5V33a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" fill="url(#g-city)" stroke="var(--teal)" strokeWidth="1.6"/>
        <rect x="10" y="11.5" width="9" height="8.5" rx="1.4" fill="var(--teal)" fillOpacity="0.85" stroke="none"/>
        <rect x="22" y="11.5" width="9" height="8.5" rx="1.4" fill="var(--teal)" fillOpacity="0.55" stroke="none"/>
        <path d="M34 11.5h5.5L42 17.5v2.5H34Z" fill="var(--teal)" fillOpacity="0.4" stroke="none"/>
        <line x1="10" y1="26" x2="42" y2="26" stroke="var(--teal)" strokeWidth="1.2" strokeOpacity="0.5"/>
        <circle cx="16" cy="36" r="4.6" fill="#0d1318" stroke="var(--teal)" strokeWidth="1.8"/>
        <circle cx="42" cy="36" r="4.6" fill="#0d1318" stroke="var(--teal)" strokeWidth="1.8"/>
        <circle cx="7" cy="30" r="1.3" fill="var(--teal)" stroke="none"/>
      </svg>
    ),
  },
  {
    id:"minibus", title:"Mini Bus", tagText:"Dòng xe · 03",
    desc:"Xe cỡ nhỏ, linh hoạt cho tuyến ngắn.",
    accent:"var(--amber)",
    icon:(
      <svg viewBox="0 0 64 40" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="g-mini" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.08"/>
          </linearGradient>
        </defs>
        <path d="M9 30V11a4 4 0 0 1 4-4h29a4 4 0 0 1 4 4v3h5a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2h-4" fill="url(#g-mini)" stroke="var(--amber)" strokeWidth="1.6"/>
        <rect x="12.5" y="10" width="8.5" height="8" rx="1.4" fill="var(--amber)" fillOpacity="0.85" stroke="none"/>
        <rect x="24" y="10" width="8.5" height="8" rx="1.4" fill="var(--amber)" fillOpacity="0.55" stroke="none"/>
        <rect x="35.5" y="10" width="7" height="8" rx="1.4" fill="var(--amber)" fillOpacity="0.55" stroke="none"/>
        <rect x="47" y="16" width="8" height="7" rx="1.2" fill="var(--amber)" fillOpacity="0.4" stroke="none"/>
        <circle cx="20" cy="33" r="4.2" fill="#0d1318" stroke="var(--amber)" strokeWidth="1.8"/>
        <circle cx="49" cy="33" r="4.2" fill="#0d1318" stroke="var(--amber)" strokeWidth="1.8"/>
        <circle cx="58" cy="20" r="1.3" fill="var(--amber)" stroke="none"/>
      </svg>
    ),
  },
];

// ─── Phân quyền dòng xe theo Đơn vị (Bước 2 màn đăng nhập) ───
// Mỗi đơn vị (NHÀ MÁY THCK / XƯỞNG HÀN / KHO VẬT TƯ / PHÒNG KH-TH / các phòng ban tự thêm)
// được cấp quyền truy cập MỘT hoặc NHIỀU dòng xe. Quản trị viên (tài khoản có id "admin")
// LUÔN có toàn quyền truy cập cả 3 dòng xe, không phụ thuộc bảng phân quyền này.
// Mặc định (khi Supabase chưa có dữ liệu) giữ nguyên hành vi cũ: chỉ "Mini Bus" được cấp
// cho mọi đơn vị — Admin vào "👥 Người dùng" → "🚌 Phân quyền dòng xe" để cấp thêm.
// ⚠️ SQL cần chạy 1 lần trên Supabase (SQL Editor) để lưu phân quyền lâu dài:
//   create table if not exists quyen_dong_xe (
//     don_vi text primary key,
//     dong_xe jsonb not null default '["minibus"]'::jsonb
//   );
const LINE_IDS = KL_LINES.map(l=>l.id); // ["12m","citybus","minibus"]

// 🏷️ Nhãn ngắn gọn theo dòng xe — dùng để gắn TRƯỚC tin nhắn "🚨 Báo khẩn cấp" (cả trong app
// lẫn trong nội dung chia sẻ ra Zalo/SMS) để người nhận biết ngay cảnh báo thuộc dòng xe nào,
// không cần mở app / đổi tab mới biết.
const DONG_XE_NHAN = {
  "12m":     {text:"12M",      icon:"🚛", mau:"#334155", nen:"#e2e8f0"},
  citybus:   {text:"CITY BUS", icon:"🚌", mau:"#0f766e", nen:"#ccfbf1"},
  minibus:   {text:"MINI BUS", icon:"🚐", mau:"#b45309", nen:"#fef3c7"},
};
const nhanDongXe = (id)=> DONG_XE_NHAN[id] || DONG_XE_NHAN.minibus;

// ═══════════════════════════════════════════════════════════════
//  ĐƠN VỊ "CHUYÊN TRÁCH" — LUÔN VÀO THẲNG ĐÚNG TAB, KHÔNG BAO GIỜ RA "TỔNG QUAN"
// ═══════════════════════════════════════════════════════════════
// ✅ Các đơn vị dưới đây (NHÀ MÁY THCK, Kho Vật Tư, Kho CityBus, Kho 12M, XH_Minibus,
// XH_CityBus, XH_12) PHẢI vào THẲNG đúng tab nghiệp vụ của mình ngay sau khi đăng nhập:
//   - Nhóm "kho/soạn hàng" (NHÀ MÁY THCK, KHO VẬT TƯ, KHO CITYBUS, KHO 12M) → tab "soan" (📋 Soạn Hàng)
//   - Nhóm "xưởng/nhận hàng" (XH_MINIBUS, XH_CITYBUS, XH_12) → tab "duyet" (✅ Nhận Hàng)
// TUYỆT ĐỐI KHÔNG được rơi vào màn "Tổng Quan / Danh mục dự án" (showTongQuan), "Khởi tạo
// Dự án" (showKhoiTao) hay "Đã thực hiện" (showDaThucHien) — dù có truyền statusId gì đi nữa.
// Hàm getDirectEntry() dùng CHUNG cho cả màn đăng nhập (LoginScreen) lẫn xử lý onLogin
// trong App, để chỉ có 1 nguồn sự thật duy nhất — sửa 1 chỗ, áp dụng mọi nơi.
// Tên đơn vị được CHUẨN HOÁ (bỏ dấu, bỏ khoảng trắng/gạch dưới, viết hoa) trước khi so khớp,
// nên "XH_12"/"XH 12M"/"xh_12m" hay "Kho Citybus"/"KHO CITYBUS" đều nhận diện đúng như nhau.
const normalizeDonViKey = (dv) => String(dv||"")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/đ/gi,"d")
  .toUpperCase()
  .replace(/[^A-Z0-9]/g,"");
// ✅ Mỗi đơn vị chuyên trách gắn CỨNG với ĐÚNG 1 tab + 1 dòng xe cố định — KHÔNG lấy dòng
// xe theo allowed[0]/thứ tự bảng "quyen_dong_xe" nữa (thứ tự đó phụ thuộc dữ liệu đã lưu
// trên Supabase, có thể lệch nếu trước đây từng cấp nhầm nhiều dòng cho 1 đơn vị chuyên
// trách — VD "NHÀ MÁY THCK" từng bị lưu luôn cả "12M"/"CityBus" khiến allerd[0] trả về
// "12m" thay vì "minibus"). Gán cứng ở đây đảm bảo LUÔN đúng bất kể dữ liệu server thế nào.
const DIRECT_ENTRY_BY_DON_VI = {
  "NHAMAYTHCK": {tab:"soan",  line:"minibus"},
  "KHOVATTU":   {tab:"soan",  line:"minibus"},
  "KHOCITYBUS": {tab:"soan",  line:"citybus"},
  "KHO12M":     {tab:"soan",  line:"12m"},
  "XHMINIBUS":  {tab:"duyet", line:"minibus"},
  "XHCITYBUS":  {tab:"duyet", line:"citybus"},
  "XH12":       {tab:"duyet", line:"12m"},  // chấp nhận cả "XH_12" và "XH_12M" (đều normalize về "XH12"/"XH12M")
  "XH12M":      {tab:"duyet", line:"12m"},
};
const getDirectEntry = (don_vi) => DIRECT_ENTRY_BY_DON_VI[normalizeDonViKey(don_vi)] || null;

// ✅ Nút "＋ Thêm xe mới" + biểu tượng "🗑️ Xoá dự án" trong khối "Tổng quan dự án" — theo
// yêu cầu CHỈ hiển thị cho đúng 3 đơn vị được phân công nhiệm vụ khởi tạo/xoá dự án:
// XƯỞNG HÀN, Phòng KT, PHÒNG KH-TH. Mọi đơn vị khác (kể cả NHÀ MÁY THCK, các kho/xưởng
// chuyên trách từng dòng xe, Ban CN, Ban LĐNM...) đều không thấy 2 nút này.
const SHOW_THEM_XE_DON_VI = ["XƯỞNG HÀN","Phòng KT","PHÒNG KH-TH"];

// ── Màu đặc trưng của từng dòng xe (dùng cho vòng tròn icon) ──
const LINE_ICON_COLOR = {"12m":"#2f8fff", "citybus":"#0fe0a4", "minibus":"#ff9a1f"};
// ✅ Hàm dùng chung: vẽ 1 vòng tròn tô màu bao quanh icon chiếc xe — áp dụng cho MỌI
// dòng xe (12M / City Bus / Mini Bus...) và có thể tái sử dụng ở bất kỳ đâu cần hiển thị
// icon dòng xe (badge "Dòng xe:", thẻ dự án, danh sách chọn dòng xe...). Màu vòng tròn
// tự động lấy theo lineId; nếu không tìm thấy dùng màu mặc định (cam).
function VehicleIconCircle({lineId, size=22, icon="🚌", color}){
  const mau = color || LINE_ICON_COLOR[lineId] || "#ff9a1f";
  return (
    <span style={{width:size,height:size,minWidth:size,borderRadius:"50%",background:mau,
      display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",flexShrink:0}}>
      <span style={{fontSize:Math.round(size*0.6),lineHeight:1}}>{icon}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
//  THANH TIÊU ĐỀ DÙNG CHUNG — 3 MÀN HÌNH ĐỘC LẬP
//  (Khởi tạo Dự án · Tổng Quan/Đang thực hiện · Đã thực hiện)
// ═══════════════════════════════════════════════════════════════
// ✅ 1 hàm dùng chung cho cả 3 màn, áp dụng ĐỒNG NHẤT cho MỌI dòng xe (Mini Bus/City Bus/12M)
// — chỉ cần truyền activeLine, tự lấy đúng icon/tên dòng xe qua KL_LINES/VehicleIconCircle.
// Bố cục: [← Trở về] ── [🚌 Dòng xe: ... — CĂN GIỮA] ── [Đăng xuất].
// Nút "Đăng xuất": nền đen nhạt, chữ trắng in đậm, viền bo tròn màu cam.
function ScreenTopBar({onBack, badgeBorderColor, activeLine, onLogout}){
  const baseBtn={border:"none",borderRadius:999,cursor:"pointer",fontFamily:"inherit",padding:"5px 9px",fontSize:10,whiteSpace:"nowrap",flexShrink:0};
  return (
    <div style={{display:"flex",flexWrap:"nowrap",alignItems:"center",justifyContent:"space-between",gap:5,marginBottom:10}}>
      <button onClick={onBack}
        style={{...baseBtn,background:"rgba(249,115,22,0.12)",color:"#fdba74",fontWeight:700,border:"1.5px solid #f97316"}}>
        ← Trở về
      </button>
      {/* Badge dòng xe: co giãn để luôn vừa 1 hàng cùng 2 nút hai bên, tên dài sẽ tự rút gọn "..." */}
      <div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"3px 8px",border:`2px solid ${badgeBorderColor}`,minWidth:0,flex:"0 1 auto"}}>
        <VehicleIconCircle lineId={activeLine} size={15}/>
        <span style={{fontSize:9,opacity:.75,whiteSpace:"nowrap"}}>Dòng xe:</span>
        <span style={{fontSize:10,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{KL_LINES.find(l=>l.id===activeLine)?.title||"Mini Bus"}</span>
      </div>
      <button onClick={onLogout}
        style={{...baseBtn,background:"rgba(0,0,0,0.45)",color:"#fff",fontWeight:800,border:"1.5px solid #f97316"}}>
        Đăng xuất
      </button>
    </div>
  );
}
const LINE_QUYEN_DEFAULT = {
  "NHÀ MÁY THCK": ["minibus"],
  "XƯỞNG HÀN":    ["minibus","citybus","12m"],
  "KHO VẬT TƯ":   ["minibus"],
  "PHÒNG KH-TH":  ["minibus","citybus","12m"],
  // ✅ Các đơn vị chuyên trách riêng từng dòng xe (soạn hàng / nhận hàng tách biệt):
  "KHO CITYBUS":  ["citybus"],
  "KHO 12M":      ["12m"],
  "XH_MINIBUS":   ["minibus"],
  "XH_CITYBUS":   ["citybus"],
  "XH_12":        ["12m"],
  // ✅ Các đơn vị "theo dõi tổng thể" — xem toàn bộ 3 dòng xe (không thao tác soạn/nhận):
  "PHÒNG KT":     ["minibus","citybus","12m"],
  "BAN CN":       ["minibus","citybus","12m"],
  "BAN LĐNM":     ["minibus","citybus","12m"],
};

// ═══════════════════════════════════════════════════════════════
//  PHÂN QUYỀN CHỨC NĂNG (TAB) THEO ĐƠN VỊ
// ═══════════════════════════════════════════════════════════════
// ✅ Trước đây: bộ TAB (Soạn Hàng / Nhận Hàng / Phiếu GN / Báo cáo / BOM Mẫu / Người dùng)
// hiển thị cho 1 tài khoản chỉ phụ thuộc VAI TRÒ (thck/kho/xuonghan/khth) — nghĩa là MỌI
// đơn vị cùng vai trò (VD "KHO VẬT TƯ" và "KHO CITYBUS" cùng vai trò "kho") đều thấy Y
// HỆT nhau bộ chức năng, dù dòng xe phụ trách khác nhau. Nay thêm 1 lớp phân quyền RIÊNG
// THEO TỪNG ĐƠN VỊ (độc lập với dòng xe) để Admin có thể giới hạn đúng nhiệm vụ đã phân
// công cho từng đơn vị (VD: "XH_MINIBUS" chỉ cần "✅ Nhận Hàng" cho dòng Mini Bus, không
// cần thấy "🗂️ BOM Mẫu" hay "📋 Soạn Hàng" của các đơn vị khác).
// Mặc định (khi chưa cấu hình riêng) LUÔN giữ nguyên hành vi cũ — lấy theo vai trò —
// nên KHÔNG có đơn vị nào bị mất chức năng đột ngột khi vừa nâng cấp.
// ⚠️ SQL cần chạy 1 lần trên Supabase (SQL Editor) để lưu phân quyền lâu dài:
//   create table if not exists quyen_chuc_nang (
//     don_vi text primary key,
//     chuc_nang jsonb not null default '[]'::jsonb
//   );
//
// ⚠️ SQL cần chạy 1 lần trên Supabase (SQL Editor) để dùng tính năng "🚨 Báo khẩn cấp"
// (gửi tin nhắn đến các bộ phận liên quan khi có mã vật tư còn thiếu cần gấp):
//   create table if not exists canh_bao_khan (
//     id text primary key,
//     pid text,
//     ten_du_an text,
//     danh_sach jsonb not null default '[]'::jsonb,  -- [{ma,ten,dv,can,daGiao,conThieu}]
//     ghi_chu text default '',
//     nguoi_gui text,
//     don_vi_gui text,
//     don_vi_nhan jsonb not null default '[]'::jsonb, -- ["KHO VẬT TƯ","NHÀ MÁY THCK",...]
//     ts timestamptz default now(),
//     doc_boi jsonb not null default '[]'::jsonb,      -- đơn vị nào đã xem: ["KHO VẬT TƯ",...]
//     phan_hoi jsonb not null default '[]'::jsonb,     -- phản hồi: [{nguoi,don_vi,noi_dung,ts}]
//     dong_xe text default 'minibus',                  -- ✅ mới: "12m" | "citybus" | "minibus" —
//                                                       --   nhãn dòng xe hiện trước tin nhắn
//     phan_hoi_chua_doc jsonb not null default '[]'::jsonb -- ✅ mới: danh sách đơn vị CHƯA XEM
//                                                       --   phản hồi mới nhất → hiện trên 🔔.
//                                                       --   MỌI đơn vị liên quan (người gửi gốc +
//                                                       --   tất cả đơn vị nhận, trừ đơn vị vừa
//                                                       --   phản hồi) đều được báo — kể cả khi có
//                                                       --   nhiều lượt phản hồi qua lại liên tiếp.
//   );
// (Nếu bảng đã tạo từ trước, chạy thêm:
//  alter table canh_bao_khan add column if not exists phan_hoi jsonb not null default '[]'::jsonb;
//  alter table canh_bao_khan add column if not exists dong_xe text default 'minibus';
//  alter table canh_bao_khan add column if not exists phan_hoi_chua_doc jsonb not null default '[]'::jsonb;
//  — nhớ chạy cho CẢ 3 bảng theo dòng xe:
//  canh_bao_khan, canh_bao_khan_citybus, canh_bao_khan_12m.)
// (Vì dùng chung quy ước T() như các bảng khác, nếu tên bảng có hậu tố dòng xe — VD
// "canh_bao_khan_citybus" — hãy tạo thêm bảng tương ứng hoặc bỏ hậu tố tùy nhu cầu.)
const TAB_META = [
  {id:"ds",        label:"📦 VẬT TƯ"},
  {id:"soan",      label:"📋 SOẠN HÀNG / KIỂM TRA"},
  {id:"duyet",     label:"✅ KIỂM TRA XÁC NHẬN"},
  {id:"pgn",       label:"📄 PHIẾU GN"},
  {id:"bc",        label:"📈 BÁO CÁO"},
  {id:"hoanthanh", label:"🏁 CÁC DỰ ÁN ĐÃ HOÀN THÀNH"},
  {id:"bom_mau",   label:"🗂️ TẠO BOM MẪU"},
  {id:"users",     label:"👥 PHÂN QUYỀN SỬ DỤNG"},
];
// Xác định vai trò GỐC của 1 tên đơn vị theo quy ước đặt tên (dùng để suy ra bộ tab mặc
// định cho đơn vị chưa có dòng riêng trong bảng phân quyền chức năng).
const baseRoleOfDonViName = (dv) => {
  if(dv==="NHÀ MÁY THCK") return "thck";
  if(dv==="XƯỞNG HÀN")    return "xuonghan";
  if(dv==="KHO VẬT TƯ")   return "kho";
  if(dv==="PHÒNG KH-TH")  return "khth";
  if(/^KHO/i.test(dv||"")) return "kho";
  if(/^XH[_\s-]/i.test(dv||"")) return "xuonghan";
  return "khth";
};
// Bộ chức năng MẶC ĐỊNH cho từng đơn vị có sẵn — khớp 100% hành vi cũ trước khi có bảng
// phân quyền riêng (đơn vị chuyên trách 1 dòng xe vẫn giữ nguyên trọn bộ chức năng theo
// vai trò của mình — Admin có thể vào "👥 Người dùng" → "🎛️ Phân quyền chức năng theo đơn
// vị" để bớt/thêm cho đúng nhiệm vụ thực tế đã phân công).
const TAB_QUYEN_DEFAULT = {
  "NHÀ MÁY THCK": TABS_THCK_KEYS,
  // ✅ "XƯỞNG HÀN" (xh01/xh02/xh03, role "khth" — CHỈ XEM, không thao tác) được xem TẤT CẢ
  // các tab nghiệp vụ (📦 Vật tư/📋 Soạn Hàng/✅ Nhận Hàng/📄 Phiếu GN/📈 Báo Cáo/🗂️ BOM Mẫu),
  // CHỈ ẩn "👥 Người dùng" — riêng cho đơn vị này (khác với Phòng KT, Ban CN, Ban LĐNM,
  // PHÒNG KH-TH vẫn giữ nguyên TABS_KHTH_KEYS — chỉ 3 tab xem). Vì role vẫn là "khth" nên
  // các nút thao tác (thêm vật tư, import...) bên trong từng tab vẫn ẩn theo isKHTH — đây là
  // XEM ĐƯỢC MỌI TAB để theo dõi, không phải được thao tác.
  // (Các đơn vị chuyên trách thật sự duyệt/nhận hàng theo dòng xe là "XH_MINIBUS",
  // "XH_CITYBUS", "XH_12" bên dưới — vẫn giữ nguyên đầy đủ chức năng.)
  "XƯỞNG HÀN":    TABS_XUONGHAN_KEYS,
  "KHO VẬT TƯ":   TABS_KHO_KEYS,
  "PHÒNG KH-TH":  TABS_KHTH_KEYS,
  "KHO CITYBUS":  TABS_KHO_KEYS,
  "KHO 12M":      TABS_KHO_KEYS,
  "XH_MINIBUS":   TABS_XUONGHAN_KEYS,
  "XH_CITYBUS":   TABS_XUONGHAN_KEYS,
  "XH_12":        TABS_XUONGHAN_KEYS,
  "PHÒNG KT":     TABS_KHTH_KEYS,
  "BAN CN":       TABS_KHTH_KEYS,
  "BAN LĐNM":     TABS_KHTH_KEYS,
};
// Lấy bộ chức năng áp dụng cho 1 đơn vị: ưu tiên bảng đã cấu hình (tabQuyen, có thể đã
// được Admin chỉnh tay hoặc tải từ Supabase) → nếu chưa có, dùng TAB_QUYEN_DEFAULT → nếu
// vẫn chưa có (đơn vị hoàn toàn mới), suy ra theo quy ước tên đơn vị (baseRoleOfDonViName).
const getTabKeysForDonVi = (tabQuyen, dv) => {
  if(tabQuyen && Array.isArray(tabQuyen[dv])) return tabQuyen[dv];
  if(Array.isArray(TAB_QUYEN_DEFAULT[dv])) return TAB_QUYEN_DEFAULT[dv];
  return TAB_KEYS_BY_ROLE[baseRoleOfDonViName(dv)] || TABS_KHTH_KEYS;
};

// ─── Trạng thái dự án — 3 thẻ thư mục sau khi chọn dòng xe ───
// ⚠️ "inprogress" (Đang thực hiện) dẫn thẳng vào hệ thống quản lý vật tư (web chính).
// "new" (Khởi tạo Dự án) cũng dẫn vào hệ thống nhưng tự động mở sẵn modal "🆕 Thêm dự án mới"
// (đúng y hệt nút "＋ Thêm" trên thanh dự án của trang chính).
// "done" (Đã thực hiện) hiển thị danh sách các dự án đã bấm "Hoàn thành".
const KL_PROJECT_STATUSES = [
  {
    id:"new", tagText:"Giai đoạn · 01", title:"Khởi tạo Dự án",
    desc:"Tạo mới dự án, thiết lập BOM và định mức ban đầu.",
    accent:"var(--steel)", active:true,
    icon:(
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7a2 2 0 0 1 2-2h4.2l2 2H18a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="1.6"/>
        <line x1="12" y1="12" x2="12" y2="16.5" stroke="var(--accent)" strokeWidth="1.8"/>
        <line x1="9.7" y1="14.2" x2="14.3" y2="14.2" stroke="var(--accent)" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id:"inprogress", tagText:"Giai đoạn · 02", title:"Đang thực hiện",
    desc:"Theo dõi tiến độ sản xuất, soạn hàng và phiếu giao nhận.",
    accent:"var(--amber)", active:true,
    icon:(
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7a2 2 0 0 1 2-2h4.2l2 2H18a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="1.6"/>
        <path d="M9 13.5l2 2 4-4.5" stroke="var(--accent)" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id:"done", tagText:"Giai đoạn · 03", title:"Đã thực hiện",
    desc:"Lưu trữ hồ sơ, đối chiếu và tổng kết dự án hoàn tất.",
    accent:"var(--teal)", active:true,
    icon:(
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7a2 2 0 0 1 2-2h4.2l2 2H18a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="1.6"/>
        <path d="M8.5 12.2l2.3 2.3 4.7-4.9" stroke="var(--accent)" strokeWidth="1.9"/>
      </svg>
    ),
  },
];

// ─── Login Screen — Cổng vào (tài khoản) → chọn dòng xe → trạng thái dự án ────
// resume: khi quay lại từ màn "Tổng quan" (nút "← Trở về"), truyền {authedUser,userList,activeLine}
// để mở thẳng BƯỚC 3 (chọn trạng thái dự án) — không bắt đăng nhập lại từ đầu.
function LoginScreen({onLogin, resume, onLogout, allUsers, headerBannerUrl}){
  // "gate" (đăng nhập tài khoản) → "select" (chọn dòng xe) → "project" (chọn trạng thái dự án)
  const [step, setStep]   = useState(resume ? "project" : "gate");
  const [activeLine, setActiveLine] = useState(resume?.activeLine || null);
  // ✅ Ngôn ngữ hiển thị nút bấm cạnh chuông "Thông báo" — dùng CHUNG khoá localStorage
  // "appLang" với hệ thống chính (xem lang/setLangSaved trong component App chính) để khi
  // đăng nhập vào hệ thống chính, ngôn ngữ vừa chọn ở màn Gate này được giữ nguyên liền mạch.
  // Màn Gate hiện tại chưa có bộ từ điển zh riêng cho các nhãn của chính nó (CHÍNH XÁC, Đổi
  // mật khẩu...) nên nút này chủ yếu để CHỌN TRƯỚC ngôn ngữ cho hệ thống chính sắp vào.
  const [gateLang, setGateLang] = useState(()=>{try{return localStorage.getItem("appLang")||"vi";}catch{return "vi";}});
  const toggleGateLang=()=>{const nl=gateLang==="vi"?"zh":"vi";setGateLang(nl);try{localStorage.setItem("appLang",nl);}catch{}};
  const [uid2, setUid2]   = useState("");
  const [pw, setPw]       = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr]     = useState("");
  const [userList,setUserList]=useState(resume?.userList || USERS_DEF);
  const [authedUser,setAuthedUser]=useState(resume?.authedUser || null);
  const [lineQuyen,setLineQuyen]=useState(LINE_QUYEN_DEFAULT); // phân quyền dòng xe theo đơn vị
  const [showCpw2, setShowCpw2] = useState(false);
  const [cpwForm2, setCpwForm2] = useState({cur:"",next:"",confirm:""});
  const [cpwShow2, setCpwShow2] = useState({cur:false,next:false,confirm:false});
  const [cpwErr2, setCpwErr2] = useState("");
  const [cpwOk2, setCpwOk2] = useState("");
  const {lang} = useLang();
  const t = LOGIN_I18N[lang];

  // ✅ FIX: nút "trở lui" (back) vật lý/gesture trên điện thoại trước đây KHÔNG lùi về bước
  // trước trong app (gate→select→project) — vì SPA này không đồng bộ với lịch sử trình
  // duyệt, nên back sẽ thoát thẳng khỏi trang. Đoạn dưới đồng bộ "step" với History API:
  // mỗi lần tiến 1 bước (gate→select, select→project) sẽ pushState; khi bấm back (nút vật
  // lý/gesture HOẶC nút "← Quay lại" trên màn hình — cả 2 đều gọi goStep/goBack bên dưới)
  // trình duyệt phát sự kiện "popstate", app bắt sự kiện này và tự lùi "step" lại, KHÔNG
  // rời khỏi trang.
  const stepRef = useRef(step);
  useEffect(()=>{ stepRef.current=step; },[step]);
  useEffect(()=>{
    // đánh dấu entry ban đầu (trang vừa mở) bằng chính step khởi tạo, để khi back về tới
    // đây thì popstate trả state đúng bằng step ban đầu thay vì rỗng.
    // ✅ FIX: khi mở qua "resume" (bấm "← Trở về" từ Tổng quan → vào THẲNG bước "project"),
    // trước đó KHÔNG hề có entry "select" nào được push trong lịch sử của phiên này — nếu chỉ
    // replaceState mỗi "project" thì bấm "← Quay lại chọn dòng xe" (hoặc nút back vật lý) sẽ
    // lùi ra NGOÀI luồng app (mất trắng, không về được màn chọn dòng xe). Nên ở trường hợp
    // resume, ta dựng sẵn 1 entry "select" bên dưới rồi mới push "project" lên trên, để back
    // luôn có chỗ lùi về đúng ý.
    try{
      if(resume){
        window.history.replaceState({klStep:"select"}, "");
        window.history.pushState({klStep:"project"}, "");
      }else{
        window.history.replaceState({klStep:step}, "");
      }
    }catch{}
    const onPop=(e)=>{
      const s=e.state?.klStep;
      if(s) setStep(s);
    };
    window.addEventListener("popstate", onPop);
    return ()=>window.removeEventListener("popstate", onPop);
  },[]);

  // ✅ FIX: màn đăng nhập (khi KHÔNG resume, tức đang ở gate mới/F5) khởi tạo userList từ
  // USERS_DEF cứng — nên các tài khoản tạo THÊM sau này qua bảng "👥 Người dùng" (vd. "xh04")
  // dù đã lưu trong DB (Supabase) vẫn KHÔNG đăng nhập được, vì App chỉ fetch danh sách "users"
  // mới nhất SAU khi mount, còn LoginScreen không hề nhận lại danh sách đó. Effect này đồng bộ
  // userList của LoginScreen theo "allUsers" (danh sách thật từ DB) ngay khi nó tải xong.
  useEffect(()=>{
    if(!resume && allUsers && allUsers.length){
      setUserList(allUsers);
    }
  },[allUsers]);

  // Tiến 1 bước: lưu bước mới vào lịch sử trình duyệt rồi mới đổi state.
  const goStep=(next)=>{
    try{ window.history.pushState({klStep:next}, ""); }catch{}
    setStep(next);
  };
  // Lùi 1 bước: đi qua window.history.back() (thay vì setStep trực tiếp) để nút bấm trên
  // màn hình và nút back vật lý luôn đồng bộ, không bị lệch ngăn xếp lịch sử.
  const goBackHistory=(fallbackStep)=>{
    if(window.history.state?.klStep && window.history.state.klStep!==stepRef.current){
      window.history.back();
    }else{
      window.history.back();
      // phòng khi không có entry hợp lệ để back tới (hiếm khi xảy ra) — vẫn đảm bảo lùi step
      setTimeout(()=>{ if(stepRef.current===fallbackStep) setStep(fallbackStep); },50);
    }
  };

  // Nạp font chữ cho giao diện đăng nhập (chỉ 1 lần)
  useEffect(()=>{
    if(!document.getElementById("kl-fonts-link")){
      const pre=document.createElement("link");
      pre.rel="preconnect"; pre.href="https://fonts.googleapis.com";
      const fonts=document.createElement("link");
      fonts.id="kl-fonts-link"; fonts.rel="stylesheet";
      fonts.href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap";
      document.head.appendChild(pre);
      document.head.appendChild(fonts);
    }
  },[]);

  useEffect(()=>{
    supabase.from("users").select("*").then(({data})=>{
      if(data?.length) setUserList(data);
    });
    // Tải phân quyền dòng xe theo đơn vị — nếu bảng chưa được tạo trên Supabase, giữ
    // nguyên mặc định LINE_QUYEN_DEFAULT (chỉ Mini Bus) và không báo lỗi cho người dùng.
    supabase.from("quyen_dong_xe").select("*").then(({data,error})=>{
      if(error){ console.warn("Chưa đọc được bảng quyen_dong_xe (có thể chưa tạo bảng):",error.message); return; }
      if(data?.length){
        const m={};
        data.forEach(r=>{ if(r.don_vi) m[r.don_vi]=Array.isArray(r.dong_xe)?r.dong_xe:[]; });
        setLineQuyen(q=>({...q,...m}));
      }
    });
  },[]);

  // ✅ Danh sách dòng xe mà 1 tài khoản được phép truy cập.
  // Tài khoản "admin" luôn có toàn quyền, không phụ thuộc bảng phân quyền.
  const getAllowedLines=(u)=>{
    if(!u) return [];
    if(isAdminAccount(u)) return LINE_IDS;
    return lineQuyen[u.don_vi] || [];
  };

  // ── Bước 1: Đăng nhập tài khoản (cổng vào chung) ──
  // ✅ QUY ƯỚC ĐIỀU HƯỚNG THEO ĐƠN VỊ:
  //   - Đơn vị chỉ được cấp ĐÚNG 1 dòng xe (VD: XH_MINIBUS, KHO CITYBUS, KHO 12M, XH_CITYBUS,
  //     XH_12, NHÀ MÁY THCK, KHO VẬT TƯ...) → bỏ qua màn "Chọn dòng xe" (ảnh 2), vào THẲNG
  //     "Hệ thống chính" (ảnh 1) với dòng xe duy nhất đó, y hệt bấm "Đang thực hiện".
  //   - Đơn vị được cấp NHIỀU dòng xe (VD: Xưởng Hàn, PHÒNG KH-TH, Phòng KT, Ban CN, Ban LĐNM
  //     — nhóm "theo dõi tổng thể") hoặc tài khoản admin → dừng ở màn "Chọn dòng xe" (ảnh 2)
  //     để tự chọn dòng muốn theo dõi, rồi mới vào hệ thống chính.
  //   - Đơn vị chưa được cấp dòng xe nào (0 dòng) → vẫn dừng ở màn chọn để hiển thị thông
  //     báo "chưa được cấp quyền" rõ ràng thay vì im lặng chặn truy cập.
  const handleGateLogin=(e)=>{
    e.preventDefault();
    if(!uid2){setErr(t.errNoAcc);return;}
    const u=userList.find(u=>u.id===uid2&&u.pw===pw);
    if(!u){setErr(t.errBadPw);return;}
    setErr("");
    setAuthedUser(u);
    const allowed=getAllowedLines(u);
    const directEntry=getDirectEntry(u.don_vi);
    if(directEntry){
      // ✅ Đơn vị chuyên trách (NHÀ MÁY THCK/KHO VẬT TƯ/KHO CITYBUS/KHO 12M/XH_MINIBUS/
      // XH_CITYBUS/XH_12) → BẮT BUỘC vào thẳng đúng tab VÀ đúng dòng xe cố định của mình,
      // không qua màn chọn dòng xe lẫn Tổng Quan/Danh mục dự án, không phụ thuộc thứ tự
      // bảng phân quyền đã lưu trên Supabase.
      setActiveLine(directEntry.line);
      onLogin(u, userList, {openNewProject:false, line:directEntry.line, directTab:directEntry.tab});
      return;
    }
    if(allowed.length===1){
      // ✅ Đơn vị 1-dòng-xe khác (đơn vị tuỳ chỉnh thêm sau này, chưa có trong bảng
      // DIRECT_ENTRY_TAB_BY_DON_VI ở trên) → vẫn vào thẳng Hệ thống chính theo vai trò,
      // KHÔNG truyền statusId (statusId:"inprogress" dẫn nhầm vào màn "Tổng Quan").
      setActiveLine(allowed[0]);
      onLogin(u, userList, {openNewProject:false, line:allowed[0]});
      return;
    }
    goStep("select");
  };

  // ── Bước 2: Chọn dòng xe ──
  // ✅ Quyền truy cập từng dòng xe được cấp theo Đơn vị (xem lineQuyen/getAllowedLines).
  // Tài khoản "admin" luôn được vào cả 3 dòng.
  const chooseLine=(l)=>{
    const allowed=getAllowedLines(authedUser);
    if(!allowed.includes(l.id)){
      setErr(`Tài khoản "${authedUser?.ten||uid2}" (${authedUser?.don_vi||"—"}) chưa được cấp quyền truy cập dòng "${l.title}". Vui lòng liên hệ Quản trị viên để được cấp quyền.`);
      return;
    }
    setErr("");
    setActiveLine(l.id);
    goStep("project");
  };

  // ── Bước 3: Chọn trạng thái dự án ──
  // "Đang thực hiện" → vào thẳng hệ thống quản lý vật tư như bình thường.
  // "Khởi tạo Dự án" → vào hệ thống VÀ tự mở sẵn modal "🆕 Thêm dự án mới".
  // "Đã thực hiện" → xem danh sách dự án đã hoàn thành (chỉ xem, không sửa vật tư).
  const chooseStatus=(s)=>{
    if(!s.active){
      setErr(`Trạng thái "${s.title}" chưa được kích hoạt. Vui lòng chọn "Khởi tạo Dự án" hoặc "Đang thực hiện" để vào hệ thống.`);
      return;
    }
    setErr("");
    onLogin(authedUser, userList, {openNewProject:s.id==="new", line:activeLine, statusId:s.id});
  };

  const backToSelect=()=>{ setErr(""); goBackHistory("select"); };

  const line = KL_LINES.find(l=>l.id===activeLine) || KL_LINES[2];

  // ════════════════ BƯỚC 1: CỔNG ĐĂNG NHẬP ════════════════
  if(step==="gate"){
    return(
      <div className="kl-select-login kl-gate">
        <style>{KL_LOGIN_CSS}</style>
        <div className="gate-grid">
          <div className="gate-visual">
            <div className="gate-visual-inner">
              <svg className="kl-blueprint" viewBox="0 0 400 400" fill="none">
                <defs>
                  <pattern id="klGateGridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="400" height="400" fill="url(#klGateGridPattern)" className="kl-grid-pattern"/>
                <path d="M40 260 V150 a24 24 0 0 1 24-24 h192 l64 52 v82a10 10 0 0 1-10 10H50a10 10 0 0 1-10-10Z" strokeWidth="1.6"/>
                <circle cx="95" cy="270" r="22" strokeWidth="1.6"/>
                <circle cx="255" cy="270" r="22" strokeWidth="1.6"/>
                <line x1="64" y1="126" x2="64" y2="248" strokeWidth="1.2"/>
                <line x1="140" y1="126" x2="140" y2="248" strokeWidth="1.2"/>
                <line x1="216" y1="126" x2="216" y2="248" strokeWidth="1.2"/>
              </svg>
              <div className="scan-line"></div>
              <div className="gate-visual-content">
                <div className="corner tl"></div>
                <div className="corner tr"></div>
                <div className="gate-visual-eyebrow">Kim Long Motor · Huế</div>
                <h2 className="gate-visual-title">Hệ thống<br/>Quản lý Vật tư</h2>
                <p className="gate-visual-sub">Theo dõi BOM, định mức, phiếu giao nhận và tiến độ sản xuất theo thời gian thực trên toàn bộ dây chuyền.</p>
                <div className="module-chips">
                  <div className="chip"><span className="dot"></span>12M</div>
                  <div className="chip"><span className="dot"></span>City Bus</div>
                  <div className="chip"><span className="dot"></span>Mini Bus</div>
                </div>
              </div>
            </div>
          </div>

          <div className="gate-form-panel">
            <div className="gate-box">
              <div className="gate-eyebrow">Truy cập hệ thống</div>
              <h1 className="gate-title">Đăng nhập</h1>
              <p className="gate-sub">Nhập thông tin tài khoản nội bộ để tiếp tục.</p>

              <form onSubmit={handleGateLogin}>
                <div className="field field-icon">
                  <label>Tài khoản</label>
                  <div className="input-wrap">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" list="tk-list" value={uid2}
                      onChange={e=>{setUid2(e.target.value);setErr("");}}
                      placeholder="Tên đăng nhập" autoComplete="off" required/>
                  </div>
                  <datalist id="tk-list">
                    {userList.map(u=>(
                      <option key={u.id} value={u.id}>{`${isImgAvatar(u.avatar)?"🧑":u.avatar} ${u.ten} (${u.don_vi})`}</option>
                    ))}
                  </datalist>
                </div>
                <div className="field field-icon has-toggle">
                  <label>Mật khẩu</label>
                  <div className="input-wrap">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    <input type={showPw?"text":"password"} value={pw}
                      onChange={e=>{setPw(e.target.value);setErr("");}}
                      placeholder="Nhập mật khẩu" required/>
                    <button type="button" className="pw-toggle" onClick={()=>setShowPw(s=>!s)} title={showPw?"Ẩn mật khẩu":"Hiện mật khẩu"} tabIndex={-1}>
                      {showPw?(
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ):(
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="gate-row">
                  <label className="remember"><input type="checkbox"/>Ghi nhớ đăng nhập</label>
                </div>
                {err&&<div className="gate-err">⚠️ {err}</div>}
                <button type="submit" className="gate-submit">Đăng nhập →</button>
              </form>

              <div className="gate-foot">KIM LONG MOTOR HUẾ &nbsp;·&nbsp; HỆ THỐNG NỘI BỘ &nbsp;·&nbsp; V1.0</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════ BƯỚC 2 & 3: CHỌN DÒNG XE / TRẠNG THÁI DỰ ÁN ════════════════
  return(
    <div className="kl-select-login">
      <style>{KL_LOGIN_CSS}</style>

      {/* ══════════════════ HEADER — banner ảnh Kim Long Motor (nhà máy + logo) thay cho
          khối logo + chữ "PRODUCTION / KIM LONG / MOTOR". Nút "Đăng xuất" được nhúng nhỏ
          vào góc phải-trên của banner (position:absolute), GIỮ NGUYÊN 100% logic xử lý
          (backToSelect, setAuthedUser/setStep/onLogout). ══════════════════ */}
      <header style={{border:"none",padding:"12px 3vw 10px"}}>
        <div onClick={backToSelect} title="Về trang chọn dòng xe"
          style={{position:"relative",width:"100%",height:130,borderRadius:10,overflow:"hidden",cursor:"pointer",lineHeight:0,boxShadow:"0 4px 14px rgba(0,0,0,0.35)"}}>
          <img src={headerBannerUrl||KL_BANNER_B64} alt="Kim Long Motor" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",display:"block"}}/>

          {/* Nút Đăng xuất — nhúng góc phải-trên của banner. ⚠️ FIX: trước đây bấm là ĐĂNG
              XUẤT NGAY LẬP TỨC, không hỏi lại — dễ bấm nhầm mất luôn phiên làm việc. Nay
              luôn hỏi xác nhận trước; bấm "Hủy" trên hộp thoại sẽ KHÔNG làm gì cả, ở nguyên
              màn hình hiện tại. */}
          <button onClick={e=>{e.stopPropagation();if(!window.confirm("Đăng xuất khỏi hệ thống?"))return;setAuthedUser(null);setErr("");setStep("gate");onLogout&&onLogout();}} title="Đăng xuất"
            style={{
              position:"absolute",top:8,right:8,zIndex:2,
              background:"rgba(127,29,29,0.9)",border:"1px solid rgba(255,255,255,0.4)",color:"#fff",cursor:"pointer",fontFamily:"inherit",
              borderRadius:10,padding:"7px 13px",display:"flex",alignItems:"center",gap:6,
              boxShadow:"0 2px 8px rgba(0,0,0,0.45)"
            }}>
            <KlIconPower size={15} color="#fff"/>
            <span style={{fontWeight:800,fontSize:12,whiteSpace:"nowrap"}}>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* ══════════════════ Hàng "Xin chào" — avatar / tên / lời chào / chuông / Đổi mật khẩu ══════════════════
          Logic xử lý giữ NGUYÊN: GlobalCanhBaoBell, modal Đổi mật khẩu (setShowCpw2...). */}
      <div style={{margin:"14px 6vw 0",background:"linear-gradient(180deg,#141b24 0%,#0f151d 100%)",border:"1px solid #232f3b",borderRadius:16,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:14,minWidth:0}}>
          <div style={{position:"relative",width:52,height:52,borderRadius:"50%",border:"2px solid #22c55e",display:"flex",alignItems:"center",justifyContent:"center",background:"#0d1318",flexShrink:0}}>
            <KlIconUser size={25} color="#e5e7eb"/>
            <span style={{position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:"#22c55e",border:"2px solid #0d1318"}}/>
          </div>
          <div style={{minWidth:0}}>
            <div style={{color:"#e5e7eb",fontSize:13.5,fontWeight:600}}>Xin chào,</div>
            <div style={{color:"#4ade80",fontSize:19,fontWeight:800,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{authedUser?authedUser.ten||authedUser.id:"—"}</div>
            <div style={{color:"#94a3b8",fontSize:11,marginTop:4,display:"flex",alignItems:"center",gap:5}}><KlIconClock size={12} color="#94a3b8"/> Chúc bạn một ngày làm việc hiệu quả!</div>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
          {/* ✅ Biểu tượng đổi ngôn ngữ (Việt/Trung) — đặt ngay cạnh chuông Thông báo */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <button onClick={toggleGateLang} title={gateLang==="vi"?"Chuyển sang tiếng Trung":"切换为越南语"}
              style={{border:"none",cursor:"pointer",background:"#0d1318",width:44,height:44,borderRadius:"50%",
                display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 1px #232f3b"}}>
              <IconGlobe3D size={26}/>
            </button>
            <span style={{fontSize:10,color:"#9ca3af",fontWeight:600}}>{gateLang==="vi"?"Việt · Trung":"越南语 · 中文"}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {authedUser&&<GlobalCanhBaoBell donVi={authedUser.don_vi} ten={authedUser.ten} style={{width:44,height:44,fontSize:19}}/>}
            <span style={{fontSize:10,color:"#9ca3af",fontWeight:600}}>Thông báo</span>
          </div>
          <button onClick={()=>{setShowCpw2(true);setCpwForm2({cur:"",next:"",confirm:""});setCpwShow2({cur:false,next:false,confirm:false});setCpwErr2("");setCpwOk2("");}}
            title="Đổi mật khẩu"
            style={{
              background:"linear-gradient(135deg,#166534,#22c55e)",border:"none",color:"#fff",cursor:"pointer",fontFamily:"inherit",
              clipPath:"polygon(16px 0,calc(100% - 16px) 0,100% 50%,calc(100% - 16px) 100%,16px 100%,0 50%)",
              padding:"11px 26px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 18px -8px rgba(34,197,94,0.55)"
            }}>
            <KlIconKey size={17} color="#fff"/>
            <span style={{display:"flex",flexDirection:"column",alignItems:"flex-start",lineHeight:1.25}}>
              <span style={{fontWeight:800,fontSize:13}}>Đổi mật khẩu</span>
              <span style={{fontWeight:500,fontSize:9.5,opacity:.85}}>Bảo mật tài khoản</span>
            </span>
            <KlIconChevronRight size={15} color="#fff"/>
          </button>
        </div>
      </div>

      {/* ══════════════════ 4 icon: Bảo mật / Hiệu quả / Chính xác / Kết nối — thuần trang trí, giống Ảnh 1 ══════════════════
          ✅ Bắt buộc 1 HÀNG DUY NHẤT trên mobile: flexWrap "nowrap" + thu nhỏ kích thước từng thẻ. */}
      <div style={{margin:"14px 3vw 0",display:"flex",gap:6,flexWrap:"nowrap"}}>
        {[
          {ten:"BẢO MẬT",mo:"An toàn dữ liệu",Icon:KlIconShieldCheck,mau:"#dc2626"},
          {ten:"HIỆU QUẢ",mo:"Tối ưu quy trình",Icon:KlIconGauge,mau:"#2f8fff"},
          {ten:"CHÍNH XÁC",mo:"Dữ liệu tin cậy",Icon:KlIconTrendingUp,mau:"#a855f7"},
          {ten:"KẾT NỐI",mo:"Hệ thống đồng bộ",Icon:KlIconGear,mau:"#f59e0b"},
        ].map(f=>(
          <div key={f.ten} style={{flex:"1 1 0",minWidth:0,background:"linear-gradient(180deg,#141b24 0%,#0f151d 100%)",border:"1px solid #232f3b",borderRadius:10,padding:"10px 4px 8px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{
              width:38,height:38,
              clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
              background:`radial-gradient(circle at 50% 35%, ${f.mau}33, transparent 70%)`,
              border:`1.5px solid ${f.mau}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 0 10px ${f.mau}55`
            }}><f.Icon size={16} color="#f5f9fb" strokeWidth={1.7}/></div>
            <div style={{color:"#f1f5f9",fontWeight:800,fontSize:9.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}>{f.ten}</div>
            <div style={{color:"#94a3b8",fontSize:7.5,lineHeight:1.2}}>{f.mo}</div>
            <div style={{width:16,height:2,background:f.mau,borderRadius:2,marginTop:1}}/>
            <KlIconChevronRight size={11} color={f.mau}/>
          </div>
        ))}
      </div>

      {/* ✅ Trường hợp ĐẶC BIỆT riêng cho tài khoản "xh04" — cho vào thẳng "Hệ thống chính" ở tab
          "✅ Nhận Hàng" (duyệt), bỏ qua bước chọn Trạng thái dự án, y hệt quyền của 1 đơn vị
          chuyên trách. Không áp dụng cho bất kỳ tài khoản nào khác.
          ✅ ĐẶT Ở PHẦN DÙNG CHUNG (cùng cấp với header/lời chào/4 icon) — LUÔN HIỂN THỊ xuyên
          suốt mọi bước (Chọn dòng xe / Chọn trạng thái dự án), không biến mất khi điều hướng. */}
      {authedUser?.id==="xh04"&&(
        <div style={{margin:"18px 3vw 0",paddingTop:18,borderTop:"1px dashed rgba(255,255,255,0.16)",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div onClick={()=>{setActiveLine("minibus");onLogin(authedUser,userList,{openNewProject:false,line:"minibus",directTab:"duyet"});}}
            style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,width:"100%",
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",
              borderRadius:16,padding:"14px 24px",maxWidth:420,textAlign:"center",boxSizing:"border-box"}}>
            <span style={{color:"#f59e0b",fontWeight:800,fontSize:14}}>
              ⚡ Truy cập hệ thống chính →
            </span>
            <span style={{color:"#fff",fontSize:12,lineHeight:1.55,opacity:.85}}>
              Là hệ thống vận hành giao/nhận vật tư của các xưởng liên quan
            </span>
          </div>
        </div>
      )}

      {/* ✅ Lối tắt "Truy cập hệ thống chính" cho nhóm "theo dõi tổng thể" (role "khth" — Xưởng
          Hàn, Ban CN, Phòng KT, Ban LĐNM, PHÒNG KH-TH, và mọi đơn vị khth được cấp nhiều hơn 1
          dòng xe). Trước đây các đơn vị này CHỈ vào được màn "Tổng Quan" độc lập (chỉ xem số
          liệu, không có tab) sau khi chọn dòng xe + trạng thái dự án — không bao giờ chạm tới
          hệ thống chính có đủ tab (📦 Vật tư / 📄 Phiếu GN / 📈 Báo Cáo). Nay cho vào thẳng
          hệ thống chính ở tab "📦 Vật tư" (tab đầu tiên mà khth được xem), dùng dòng xe đang
          được chọn trên màn hình (activeLine), mặc định "minibus" nếu chưa chọn — vẫn có thể
          đổi dòng xe sau khi đã vào hệ thống chính (không mất chức năng chọn dòng xe). */}
      {authedUser?.role==="khth"&&authedUser?.id!=="xh04"&&getAllowedLines(authedUser).length>1&&(
        <div style={{margin:"18px 3vw 0",paddingTop:18,borderTop:"1px dashed rgba(255,255,255,0.16)",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div onClick={()=>{const l=activeLine||"minibus";setActiveLine(l);onLogin(authedUser,userList,{openNewProject:false,line:l,directTab:"ds"});}}
            style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,width:"100%",
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",
              borderRadius:16,padding:"14px 24px",maxWidth:420,textAlign:"center",boxSizing:"border-box"}}>
            <span style={{color:"#f59e0b",fontWeight:800,fontSize:14}}>
              ⚡ Truy cập hệ thống chính →
            </span>
            <span style={{color:"#fff",fontSize:12,lineHeight:1.55,opacity:.85}}>
              Xem Vật tư / Phiếu GN / Báo cáo của dòng xe đang chọn bên dưới
            </span>
          </div>
        </div>
      )}

      {showCpw2&&authedUser&&(
        <div onClick={e=>{if(e.target===e.currentTarget){setShowCpw2(false);}}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
          <div style={{background:"#fff",borderRadius:14,padding:22,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.35)"}}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4,color:"#111827"}}>🔑 Đổi mật khẩu</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Tài khoản: <b>{authedUser.ten||authedUser.id}</b></div>
            {[["cur","Mật khẩu hiện tại"],["next","Mật khẩu mới"],["confirm","Nhập lại mật khẩu mới"]].map(([key,label])=>(
              <div key={key} style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:4}}>{label}</label>
                <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                  <input type={cpwShow2[key]?"text":"password"} value={cpwForm2[key]}
                    onChange={e=>{setCpwForm2(f=>({...f,[key]:e.target.value}));setCpwErr2("");}}
                    style={{width:"100%",padding:"9px 40px 9px 12px",border:"1.5px solid #d1d5db",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
                  <button type="button" onClick={()=>setCpwShow2(s=>({...s,[key]:!s[key]}))} tabIndex={-1}
                    style={{position:"absolute",right:10,background:"none",border:"none",padding:0,cursor:"pointer",color:"#9ca3af",display:"flex"}}>
                    {cpwShow2[key]?(
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ):(
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {cpwErr2&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#991b1b",marginBottom:12}}>⚠️ {cpwErr2}</div>}
            {cpwOk2&&<div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#065f46",marginBottom:12}}>✅ {cpwOk2}</div>}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={()=>setShowCpw2(false)}
                style={{flex:1,padding:"9px 0",borderRadius:8,border:"1.5px solid #d1d5db",background:"#fff",color:"#374151",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Huỷ
              </button>
              <button onClick={async()=>{
                setCpwErr2("");setCpwOk2("");
                if(!cpwForm2.cur||!cpwForm2.next||!cpwForm2.confirm){setCpwErr2("Vui lòng điền đầy đủ!");return;}
                if(cpwForm2.cur!==authedUser.pw){setCpwErr2("Mật khẩu hiện tại không đúng!");return;}
                if(cpwForm2.next.length<4){setCpwErr2("Mật khẩu mới tối thiểu 4 ký tự!");return;}
                if(cpwForm2.next!==cpwForm2.confirm){setCpwErr2("Mật khẩu mới không khớp!");return;}
                const updated={...authedUser,pw:cpwForm2.next};
                setAuthedUser(updated);
                setUserList(us=>us.map(u=>u.id===authedUser.id?{...u,pw:cpwForm2.next}:u));
                try{ await supabase.from("users").update({pw:cpwForm2.next}).eq("id",authedUser.id); }catch{}
                setCpwOk2("Đổi mật khẩu thành công!");
                setTimeout(()=>{setShowCpw2(false);setCpwOk2("");},1500);
              }} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:"#65a30d",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {step==="select" && (
        <div id="select-view">
          <div className="hero">
            <div className="eyebrow">Hệ thống quản lý vật tư</div>
            <h2>Bạn muốn chọn dòng xe nào?</h2>
            <p>Chọn dòng sản phẩm để tiếp tục vào hệ thống quản lý sản xuất tương ứng.</p>
          </div>
          <main>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
              <div className="lines">
                {KL_LINES.map(l=>{
                  const allowed=getAllowedLines(authedUser).includes(l.id);
                  return (
                    <div key={l.id} className={`card${allowed?"":" card-locked"}`} tabIndex={0} style={{"--accent":l.accent}}
                      onClick={()=>chooseLine(l)}
                      onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();chooseLine(l);}}}>
                      <div className="icon-wrap">{l.icon}</div>
                      <div>
                        <div className="tag">{l.tagText}</div>
                        <h3>{l.title}</h3>
                      </div>
                      <div className="desc">{l.desc}</div>
                      <div className="enter">{allowed?"Truy cập →":"🔒 Chưa có quyền"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
          {err&&(
            <div style={{margin:"0 6vw 20px",background:"rgba(220,38,38,0.15)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#fca5a5"}}>
              ⚠️ {err}
            </div>
          )}
          <footer>KIM LONG MOTOR HUẾ &nbsp;·&nbsp; HỆ THỐNG NỘI BỘ &nbsp;·&nbsp; V1.0</footer>
        </div>
      )}

      {step==="project" && (
        <div id="project-view">
          <div className="hero">
            <button type="button" className="back-btn" onClick={backToSelect}>← Quay lại chọn dòng xe</button>
            <div className="login-head">
              <div className="icon-wrap" style={{"--accent":line.accent}}>{line.icon}</div>
              <div>
                <span className="tag">{line.tagText}</span>
                <h2 style={{fontFamily:"'Oswald',sans-serif",fontSize:22,textTransform:"uppercase"}}>{line.title}</h2>
              </div>
            </div>
            <p>Chọn khu vực quản lý dự án cho dòng xe này.</p>
          </div>
          <main>
            <div className="lines">
              {KL_PROJECT_STATUSES.map(s=>(
                <div key={s.id} className="card folder-card" tabIndex={0} style={{"--accent":s.accent}}
                  onClick={()=>chooseStatus(s)}
                  onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();chooseStatus(s);}}}>
                  <div className="icon-wrap">{s.icon}</div>
                  <div>
                    <div className="tag">{s.tagText}</div>
                    <h3>{s.title}</h3>
                  </div>
                  <div className="desc">{s.desc}</div>
                  <div className="enter">Truy cập →</div>
                </div>
              ))}
            </div>
          </main>
          {err&&(
            <div style={{margin:"0 6vw 20px",background:"rgba(220,38,38,0.15)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#fca5a5"}}>
              ⚠️ {err}
            </div>
          )}
          <footer>KIM LONG MOTOR HUẾ &nbsp;·&nbsp; HỆ THỐNG NỘI BỘ &nbsp;·&nbsp; V1.0</footer>
        </div>
      )}
    </div>
  );
}



// ─── Users Management Panel ────────────────────────────────────
function SignaturePad({initial, onSave, onClose}){
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef({x:0,y:0});
  const [empty, setEmpty] = useState(true);

  useEffect(()=>{
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,cv.width,cv.height);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if(initial){
      const img = new Image();
      img.onload = ()=>{ ctx.drawImage(img,0,0,cv.width,cv.height); setEmpty(false); };
      img.src = initial;
    }
  },[]);

  const getPos = (e)=>{
    const cv = canvasRef.current;
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width/rect.width, scaleY = cv.height/rect.height;
    const t = e.touches ? e.touches[0] : e;
    return {x:(t.clientX-rect.left)*scaleX, y:(t.clientY-rect.top)*scaleY};
  };
  const start = (e)=>{ e.preventDefault(); drawingRef.current = true; lastRef.current = getPos(e); };
  const move = (e)=>{
    if(!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    setEmpty(false);
  };
  const end = ()=>{ drawingRef.current = false; };
  const clear = ()=>{
    const cv = canvasRef.current, ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,cv.width,cv.height);
    setEmpty(true);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2100,padding:16}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fff",borderRadius:14,padding:22,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>✍️ Chữ ký điện tử</div>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:12}}>Ký bằng ngón tay hoặc chuột trong khung dưới đây, sau đó bấm Lưu.</div>
        <canvas ref={canvasRef} width={360} height={160}
          style={{width:"100%",height:160,border:"1.5px dashed #c7d2fe",borderRadius:8,touchAction:"none",background:"#fff",cursor:"crosshair"}}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}/>
        <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:14}}>
          <button onClick={clear} style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,padding:"8px 16px",background:"#f3f4f6",color:"#374151"}}>🗑 Xóa</button>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,padding:"8px 16px",background:"#f3f4f6",color:"#374151"}}>Hủy</button>
            <button onClick={()=>{ if(empty) return; onSave(canvasRef.current.toDataURL("image/png")); }} disabled={empty}
              style={{border:"none",borderRadius:8,cursor:empty?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"8px 20px",background:"#1d4ed8",color:"#fff",opacity:empty?.5:1}}>
              💾 Lưu chữ ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Đơn vị chuyên trách riêng từng dòng xe — seed mặc định lần đầu (khi chưa có gì trên
// localStorage lẫn Supabase "custom_depts") để "KHO CITYBUS", "KHO 12M", "XH_MINIBUS",
// "XH_CITYBUS", "XH_12" hiện diện ngay trong Hệ thống chính, không cần bấm "+ Thêm" thủ công.
// Kèm theo các đơn vị "theo dõi tổng thể" (chỉ xem): "Phòng KT", "Ban CN", "Ban LĐNM".
const DEFAULT_CUSTOM_DEPTS = ["KHO CITYBUS","KHO 12M","XH_MINIBUS","XH_CITYBUS","XH_12","PHÒNG KT","BAN CN","BAN LĐNM"];

// ── Khối gấp/mở (accordion) dùng chung cho trang "Người dùng" — giúp gom các bảng lớn
// (phân quyền, form thêm tài khoản, danh sách theo đơn vị) lại gọn gàng, đỡ rối mắt. ──
function AccordionCard({icon,title,subtitle,badge,badgeColor="#1d4ed8",open,onToggle,right,children}){
  return(
    <div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:12}}>
      <div onClick={onToggle} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:onToggle?"pointer":"default",background:"#f8fafc",userSelect:"none"}}>
        <span style={{fontSize:17,flexShrink:0}}>{icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:13,color:"#1f2937",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span>{title}</span>
            {badge!=null&&<span style={{background:badgeColor,color:"#fff",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{badge}</span>}
          </div>
          {subtitle&&<div style={{fontSize:11,color:"#6b7280",marginTop:3}}>{subtitle}</div>}
        </div>
        {right}
        {onToggle&&<span style={{fontSize:11,color:"#9ca3af",flexShrink:0,transform:open?"rotate(180deg)":"none",transition:"transform .18s",marginLeft:4}}>▼</span>}
      </div>
      {open&&<div style={{padding:16,borderTop:"1px solid #e5e7eb"}}>{children}</div>}
    </div>
  );
}
const StatCard=({icon,label,value,color,compact})=>(
  <div style={{background:"#fff",borderRadius:10,padding:compact?"10px 8px":"12px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",display:"flex",flexDirection:compact?"column":"row",alignItems:compact?"flex-start":"center",gap:compact?6:10}}>
    <div style={{width:compact?28:34,height:compact?28:34,borderRadius:9,background:color+"1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:compact?14:17,flexShrink:0}}>{icon}</div>
    <div style={{minWidth:0}}>
      <div style={{fontSize:compact?14:16,fontWeight:800,color:"#1f2937",lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:compact?9.5:10.5,color:"#6b7280",whiteSpace:compact?"normal":"nowrap",lineHeight:1.2}}>{label}</div>
    </div>
  </div>
);

// ── Modal xác nhận xoá đơn vị còn tài khoản (bắt tick "Tôi hiểu" mới cho xoá — tránh bấm nhầm) ──
function DeleteDeptModal({modal,onClose,onConfirm}){
  const {name,affected}=modal;
  const [agree,setAgree]=useState(false);
  const [busy,setBusy]=useState(false);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}
      onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}>
      <div style={{background:"#fff",borderRadius:14,padding:28,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:4,color:"#991b1b"}}>⚠️ Đơn vị "{name}" còn {affected.length} tài khoản</div>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:12}}>Bạn không thể xoá đơn vị mà giữ nguyên các tài khoản này. Chọn một trong hai cách bên dưới:</div>
        <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 12px",marginBottom:14,maxHeight:140,overflowY:"auto"}}>
          {affected.map(u=>(
            <div key={u.id} style={{fontSize:12,padding:"3px 0",display:"flex",gap:6,alignItems:"center"}}>
              <span>{isImgAvatar(u.avatar)?<img src={u.avatar} alt="" style={{width:16,height:16,borderRadius:"50%",objectFit:"cover",verticalAlign:"middle"}}/>:u.avatar}</span><span style={{fontWeight:700}}>{u.ten}</span><span style={{color:"#9ca3af",fontFamily:"monospace"}}>({u.id})</span>
            </div>
          ))}
        </div>
        <label style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:12,color:"#374151",marginBottom:16,cursor:"pointer",background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"10px 12px"}}>
          <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} style={{marginTop:2,width:16,height:16,cursor:"pointer"}}/>
          <span>Tôi hiểu và muốn <b>xoá luôn cả {affected.length} tài khoản</b> ở trên cùng với đơn vị "{name}". Thao tác này KHÔNG thể hoàn tác.</span>
        </label>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} disabled={busy}
            style={{border:"none",borderRadius:8,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,padding:"8px 16px",background:"#f3f4f6",color:"#374151",opacity:busy?0.6:1}}>Huỷ, giữ nguyên</button>
          <button onClick={async()=>{setBusy(true);await onConfirm(name,affected);setBusy(false);}} disabled={!agree||busy}
            style={{border:"none",borderRadius:8,cursor:!agree||busy?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"8px 20px",background:!agree||busy?"#fca5a5":"#991b1b",color:"#fff",opacity:!agree||busy?0.7:1}}>
            {busy?"⏳ Đang xoá...":`🗑️ Xoá đơn vị + ${affected.length} tài khoản`}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersPanel({currentUser, users, setUsers, dbUpsertUser, dbDeleteUser, lockOtherXH, lineQuyen, setLineQuyen, dbUpsertQuyenDongXe, tabQuyen, setTabQuyen, dbUpsertQuyenChucNang}){
  const {t} = useLang();
  const [form, setForm]   = useState({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧",is_admin:false});
  const [editing,setEdit] = useState(null);
  const [flash2, setFlash2]= useState("");
  // ── State cho giao diện gọn (accordion) + tìm kiếm ──
  const [permOpen,setPermOpen]     = useState(false);   // khối "Phân quyền dòng xe" — mặc định gấp lại
  const [permOpen2,setPermOpen2]   = useState(false);   // khối "Phân quyền chức năng" — mặc định gấp lại
  const [addOpen,setAddOpen]       = useState(false);   // khối "Thêm tài khoản mới" — mặc định gấp lại
  const [selectedDept,setSelectedDept]=useState(null); // đơn vị đang được chọn nổi bật trong lưới icon (chỉ 1 đơn vị/lần)
  const [confirmDelDept,setConfirmDelDept]=useState(null); // tên đơn vị đang chờ bấm xác nhận xoá lần 2
  const [renameDept,setRenameDept]=useState(null); // {oldName,value} — đơn vị đang đổi tên qua modal (thay cho window.prompt)
  const [deleteDeptModal,setDeleteDeptModal]=useState(null); // {name,affected:[user...]} — modal hỏi xoá kèm tài khoản khi đơn vị còn người
  // ✅ Danh sách phòng/ban tùy chỉnh do người dùng tự thêm (hoạt động như "PHÒNG KH-TH" — chỉ xem, không thao tác)
  // Dùng chung cho MỌI dòng xe/thiết bị — đồng bộ qua Supabase bảng "custom_depts" (không qua T(),
  // vì đơn vị/phòng ban là cơ cấu tổ chức chung, không tách theo dòng xe). localStorage chỉ còn
  // vai trò cache tạm để hiển thị ngay khi vừa mở app (trước khi Supabase load xong).
  // ⚠️ SQL cần chạy 1 lần trên Supabase (SQL Editor):
  //   create table if not exists custom_depts (
  //     ten text primary key
  //   );
  const [customDepts, setCustomDepts] = useState(()=>{
    try{
      const s=localStorage.getItem("customDepts");
      // ⚠️ FIX BUG NGHIÊM TRỌNG ("xoá xong reload lại hiện y như cũ"): code cũ ép HỢP NHẤT
      // (union) danh sách đã lưu với DEFAULT_CUSTOM_DEPTS ("XH_12","Phòng KT","Ban CN",
      // "Ban LĐNM"...) ở MỌI LẦN mở app — kể cả khi người dùng đã chủ động XOÁ hoặc ĐỔI TÊN
      // các đơn vị này từ lâu. Vì DEFAULT_CUSTOM_DEPTS là hằng số cứng trong code, nó cứ bị
      // "hồi sinh" lại mỗi lần tải trang, rồi bị đồng bộ (upsert) NGƯỢC LẠI lên Supabase ở
      // effect merge bên dưới — khiến đơn vị tưởng đã xoá vĩnh viễn lại tự xuất hiện lại y
      // hệt cũ (kèm theo bị TRÙNG LẶP nếu người dùng đã đổi tên đơn vị đó, ví dụ vừa có
      // "PHÒNG KT" mới lẫn "Phòng KT" cũ bị hồi sinh — đúng như ảnh chụp màn hình báo lỗi).
      // Nay: DEFAULT_CUSTOM_DEPTS CHỈ được dùng làm dữ liệu khởi tạo lần đầu tiên (khi máy
      // CHƯA TỪNG lưu customDepts bao giờ — s===null). Nếu đã từng lưu (kể cả mảng rỗng "[]"
      // sau khi xoá hết), luôn tôn trọng đúng dữ liệu đã lưu, không ép thêm mặc định vào nữa.
      if(s!==null){
        const saved=JSON.parse(s);
        return Array.isArray(saved)?saved:[...DEFAULT_CUSTOM_DEPTS];
      }
      return [...DEFAULT_CUSTOM_DEPTS];
    }catch{return [...DEFAULT_CUSTOM_DEPTS];}
  });
  useEffect(()=>{
    supabase.from("custom_depts").select("ten").then(({data,error})=>{
      if(error){ console.warn("Chưa đọc được bảng custom_depts (có thể chưa tạo bảng):",error.message); return; }
      // ✅ FIX QUAN TRỌNG (đơn vị mới thêm bị "biến mất"): CODE CŨ ghi đè thẳng
      // customDepts bằng dữ liệu Supabase — kể cả khi mảng rỗng "[]" (mảng rỗng vẫn
      // là truthy trong JS nên "if(data)" luôn đúng!). Nếu bảng "custom_depts" chưa
      // được tạo trên Supabase, hoặc lệnh upsert lúc thêm bị lỗi/mất mạng, Supabase trả
      // về [] → toàn bộ đơn vị vừa thêm (kho VT1, kho VT2, xh_minibus...) bị xoá khỏi
      // màn hình ngay khi component tải lại, dù đã lưu trong localStorage.
      // Nay: HỢP NHẤT (merge) danh sách cục bộ với danh sách server thay vì ghi đè,
      // đồng thời tự động đẩy lại (upsert) lên Supabase các đơn vị có ở máy nhưng
      // server chưa có — để tự "chữa lành" và đồng bộ lâu dài giữa các thiết bị.
      const remoteList=(data||[]).map(r=>r.ten).filter(Boolean);
      setCustomDepts(local=>{
        const merged=Array.from(new Set([...local,...remoteList]));
        try{localStorage.setItem("customDepts",JSON.stringify(merged));}catch{}
        // ⚠️ PHÒNG THỦ THÊM: KHÔNG tự đẩy (upsert) lên Supabase những tên nằm trong
        // DEFAULT_CUSTOM_DEPTS nếu chúng không có trên server — vì nếu server không có, rất có
        // thể đây là đơn vị NGƯỜI DÙNG ĐÃ CHỦ ĐỘNG XOÁ (không phải mới thêm offline), tự đẩy
        // lên sẽ vô tình "hồi sinh" lại đúng lỗi đã sửa ở effect dọn trùng lặp bên dưới. Một
        // đơn vị TỰ THÊM thật sự (qua nút "Thêm đơn vị") sẽ không trùng tên với 8 tên mặc định
        // cứng này, nên cách phân biệt này an toàn cho luồng thêm mới bình thường.
        const missingOnServer=local.filter(d=>!remoteList.includes(d)&&!DEFAULT_CUSTOM_DEPTS.includes(d));
        if(missingOnServer.length){
          supabase.from("custom_depts").upsert(missingOnServer.map(ten=>({ten})),{onConflict:"ten"})
            .then(({error})=>{ if(error) console.warn("Đồng bộ lại đơn vị lên Supabase thất bại:",error.message); });
        }
        return merged;
      });
    });
  },[]);
  const addCustomDept=(updateForm=true)=>{
    const name=window.prompt("Nhập tên đơn vị/phòng ban muốn thêm (VD: Kho 1, Ban CN, Phòng KT):");
    if(!name||!name.trim())return;
    const label=name.trim();
    setCustomDepts(l=>{
      if(l.includes(label))return l;
      const updated=[...l,label];
      try{localStorage.setItem("customDepts",JSON.stringify(updated));}catch{}
      return updated;
    });
    supabase.from("custom_depts").upsert({ten:label},{onConflict:"ten"}).then(({error})=>{
      if(error){
        console.error("Lưu phòng/ban lên Supabase thất bại:",error.message);
        // ✅ Trước đây lỗi này chỉ log console, người dùng không biết đơn vị mới
        // có thể KHÔNG được lưu lâu dài trên máy chủ (chỉ tồn tại tạm trên máy này).
        // Nguyên nhân thường gặp: chưa chạy SQL tạo bảng "custom_depts" trên Supabase.
        alert(`⚠️ Đã thêm "${label}" trên máy này, nhưng LƯU LÊN MÁY CHỦ THẤT BẠI (${error.message}).\nĐơn vị có thể biến mất khi tải lại trang hoặc dùng máy khác.\nHãy kiểm tra bảng "custom_depts" đã được tạo trên Supabase chưa.`);
      }
    });
    if(updateForm){const r=donViBaseRole(label);setForm(f=>({...f,role:r,don_vi:label,avatar:donViAvatar(label)}));}
  };

  // ✅ Suy luận VAI TRÒ THẬT (chức năng) của 1 đơn vị tùy chỉnh dựa theo QUY ƯỚC ĐẶT TÊN:
  //   "KHO ..."    → vai trò "kho" (có chức năng Soạn Hàng)  — VD: "KHO VT1", "KHO CITYBUS", "KHO 12M"
  //   "XH_..."     → vai trò "xuonghan" (có chức năng Duyệt/Nhận Hàng) — VD: "XH_MINIBUS", "XH_CITYBUS", "XH_12M"
  //   còn lại      → "khth" (chỉ xem, như PHÒNG KH-TH) — VD: "Phòng KT", "Ban CN"
  // Dòng xe cụ thể mà đơn vị đó được thao tác là do Ô TICK ở bảng "Phân quyền dòng xe theo
  // đơn vị" phía trên quyết định (ví dụ tick riêng "City Bus" cho "KHO CITYBUS") — không hardcode ở đây.
  // ✅ FIX: trước đây chỉ nhận diện đúng "KHO VT..." (bắt buộc có chữ "VT" ngay sau "KHO"),
  // nên các kho đặt tên theo dòng xe như "KHO CITYBUS"/"KHO 12M" bị rơi vào nhánh mặc định
  // "khth" (chỉ xem) — KHÔNG có chức năng Soạn Hàng dù ý định rõ ràng là một kho vật tư.
  // Nay: mọi đơn vị bắt đầu bằng "KHO" (không phân biệt hoa/thường, có hay không có "VT")
  // đều được coi là vai trò "kho".
  const donViBaseRole=(dv)=>{
    if(/^KHO/i.test(dv)) return "kho";
    if(/^XH[_\s-]/i.test(dv)) return "xuonghan";
    return "khth";
  };
  const donViAvatar=(dv)=>{
    const r=donViBaseRole(dv);
    return r==="kho"?"📦":r==="xuonghan"?"🚗":"📋";
  };

  // ✅ TỰ "CHỮA LÀNH" tài khoản cũ: những tài khoản đã được TẠO TRƯỚC KHI quy ước đặt tên
  // ở trên được sửa đúng (ví dụ tài khoản dưới "KHO CITYBUS"/"KHO 12M" từng bị lưu nhầm
  // role "khth" - chỉ xem - vì lúc đó "donViBaseRole" chưa nhận diện được các tên này) sẽ
  // KHÔNG tự động đổi vai trò dù hàm donViBaseRole đã được sửa, vì role là dữ liệu đã lưu
  // cứng trong bảng "users". Đoạn dưới đây quét lại TOÀN BỘ tài khoản thuộc mọi đơn vị tùy
  // chỉnh, tính lại vai trò ĐÚNG theo tên đơn vị hiện tại, và tự cập nhật (cả local +
  // Supabase) nếu phát hiện lệch — áp dụng chung cho mọi đơn vị (KHO CITYBUS, KHO 12M, và
  // bất kỳ đơn vị tùy chỉnh nào thêm sau này), không cần sửa tay từng tài khoản.
  const fixedRolesRef=useRef(new Set());
  useEffect(()=>{
    if(!customDepts.length||!users.length) return;
    users.forEach(u=>{
      if(!customDepts.includes(u.don_vi)) return;
      const correctRole=donViBaseRole(u.don_vi);
      const key=u.id+"::"+correctRole;
      if(u.role===correctRole||fixedRolesRef.current.has(key)) return;
      fixedRolesRef.current.add(key);
      const fixedUser={...u,role:correctRole,avatar:donViAvatar(u.don_vi)};
      setUsers(l=>l.map(x=>x.id===u.id?fixedUser:x));
      dbUpsertUser&&dbUpsertUser(fixedUser);
    });
  },[customDepts,users]);

  // ═══════════════════════════════════════════════════════════════
  //  🧹 TỰ ĐỘNG DỌN DẸP ĐƠN VỊ BỊ TRÙNG LẶP (di sản của lỗi cũ ở trên)
  // ═══════════════════════════════════════════════════════════════
  // ⚠️ NGUYÊN NHÂN GỐC của việc "xoá xong reload lại hiện y như cũ": phần khởi tạo
  // customDepts phía trên (nay đã sửa) từng ÉP HỢP NHẤT danh sách đã lưu với
  // DEFAULT_CUSTOM_DEPTS ("XH_12","Phòng KT","Ban CN","Ban LĐNM"...) ở MỌI LẦN mở app, kể cả
  // khi người dùng đã chủ động xoá/đổi tên các đơn vị này từ lâu — khiến chúng bị "hồi sinh"
  // liên tục, rồi effect merge Supabase bên trên lại tưởng đây là đơn vị mới thêm trên máy
  // nên tự ĐẨY NGƯỢC (upsert) chúng trở lại server. Kết quả: dữ liệu cũ trên localStorage lẫn
  // Supabase của các máy đã dùng app từ trước có thể đã bị lưu TRÙNG LẶP (VD vừa có "PHÒNG KT"
  // người dùng đã đổi tên, vừa có "Phòng KT" bị hồi sinh) — đúng như trong ảnh chụp màn hình.
  // Lỗi gốc đã được sửa (xem phần khởi tạo customDepts), nhưng dữ liệu trùng đã lỡ lưu từ
  // trước cần được DỌN 1 LẦN. Effect dưới đây tự phát hiện các đơn vị trùng tên (không phân
  // biệt hoa/thường/khoảng trắng thừa), gộp quyền dòng xe + quyền chức năng, chuyển tài khoản
  // đang thuộc bản trùng sang bản được giữ lại, rồi xoá hẳn bản trùng khỏi local + Supabase.
  // Idempotent: chỉ thao tác khi THỰC SỰ phát hiện trùng lặp, nên chạy lại nhiều lần vẫn an toàn.
  const dedupBusyRef=useRef(false);
  useEffect(()=>{
    if(dedupBusyRef.current||!customDepts.length) return;
    const normKey=s=>String(s||"").trim().toUpperCase().replace(/\s+/g," "); // bản viết HOA TOÀN BỘ, chuẩn hoá khoảng trắng
    const groups={};
    customDepts.forEach(d=>{ const k=normKey(d); (groups[k]=groups[k]||[]).push(d); });
    const dupEntries=Object.entries(groups).filter(([,g])=>g.length>1);
    if(!dupEntries.length) return;
    dedupBusyRef.current=true;
    (async()=>{
      for(const [keep,group] of dupEntries){
        // ✅ Theo yêu cầu: LUÔN giữ lại đúng bản VIẾT HOA TOÀN BỘ ("keep" chính là normKey —
        // bản viết hoa 100% + gộp khoảng trắng thừa) — kể cả khi trong nhóm trùng chưa có sẵn
        // bản nào đúng y hệt dạng viết hoa này (VD nhóm chỉ có "Phòng KT"/"phòng kt", chưa có
        // bản viết hoa sẵn) thì vẫn tự tạo/đổi thành đúng bản viết hoa "PHÒNG KT".
        const removeList = group.filter(d=>d!==keep);
        if(!removeList.length) continue; // nhóm đã đúng chuẩn viết hoa, không có gì để dọn
        for(const removeName of removeList){
          // Gộp quyền dòng xe (hợp cả 2 bên, không mất quyền đã tick)
          const mergedLines = Array.from(new Set([...(lineQuyen[keep]||[]),...(lineQuyen[removeName]||[])]));
          setLineQuyen(q=>{ const {[removeName]:_,...rest}=q; return {...rest,[keep]:mergedLines}; });
          dbUpsertQuyenDongXe&&dbUpsertQuyenDongXe(keep,mergedLines);
          // Gộp quyền chức năng
          const mergedTabs = Array.from(new Set([...getTabKeysForDonVi(tabQuyen,keep),...getTabKeysForDonVi(tabQuyen,removeName)]));
          setTabQuyen(q=>{ const {[removeName]:_,...rest}=q; return {...rest,[keep]:mergedTabs}; });
          dbUpsertQuyenChucNang&&dbUpsertQuyenChucNang(keep,mergedTabs);
          // Chuyển tài khoản đang thuộc bản trùng sang bản được giữ lại
          users.filter(u=>u.don_vi===removeName).forEach(u=>{
            const updatedUser={...u,don_vi:keep};
            setUsers(us=>us.map(x=>x.id===u.id?updatedUser:x));
            dbUpsertUser&&dbUpsertUser(updatedUser);
          });
          // Xoá hẳn bản trùng khỏi Supabase (không chỉ localStorage) để không bị hồi sinh lại
          try{ await supabase.from("custom_depts").delete().eq("ten",removeName); }
          catch(e){ console.warn("Dọn đơn vị trùng lặp thất bại:",removeName,e.message); }
        }
        // Đảm bảo bản viết hoa "keep" có mặt trên Supabase (kể cả khi phải tự tạo mới)
        try{ await supabase.from("custom_depts").upsert({ten:keep},{onConflict:"ten"}); }
        catch(e){ console.warn("Lưu bản viết hoa lên Supabase thất bại:",keep,e.message); }
        setCustomDepts(l=>{
          const updated=Array.from(new Set([...l.filter(d=>!removeList.includes(d)),keep]));
          try{localStorage.setItem("customDepts",JSON.stringify(updated));}catch{}
          return updated;
        });
      }
      const tongSoDon=dupEntries.reduce((n,[,g])=>n+g.length-1,0);
      if(tongSoDon>0) fl(`🧹 Đã tự động dọn ${tongSoDon} đơn vị bị trùng lặp, giữ lại bản viết hoa toàn bộ (dữ liệu/tài khoản đã được gộp an toàn).`);
      dedupBusyRef.current=false;
    })();
  },[customDepts,users,lineQuyen,tabQuyen]);

  // ✅ Đổi tên 1 đơn vị tùy chỉnh — cập nhật đồng bộ: danh sách đơn vị, phân quyền dòng xe,
  // và toàn bộ tài khoản đang thuộc đơn vị đó (đổi sang tên mới), cả trên Supabase.
  // ⚠️ FIX: nút "Sửa" trước đây dùng window.prompt() để hỏi tên mới. Giống lỗi đã gặp với
  // window.confirm() ở nút "Xoá" (xem ghi chú bên dưới), window.prompt() cũng bị CHẶN hoặc
  // không hiển thị được trên nhiều webview di động (trình duyệt trong Zalo, PWA đã "Thêm vào
  // màn hình chính"...) — khiến người dùng bấm "Sửa" nhưng KHÔNG THẤY GÌ XẢY RA, tưởng nút bị
  // lỗi ("không thực hiện triệt để"). Nay thay bằng modal nhập liệu NGAY TRONG GIAO DIỆN
  // (giống các modal khác của app), không phụ thuộc hộp thoại của trình duyệt/webview nữa.
  const renameCustomDept=(oldName)=>{
    setRenameDept({oldName, value: oldName});
  };
  const doRenameCustomDept=async(oldName,newNameRaw)=>{
    const name=String(newNameRaw||"");
    if(!name.trim()||name.trim()===oldName){ setRenameDept(null); return; }
    const newName=name.trim();
    if(customDepts.includes(newName)||BASE_DON_VI.includes(newName)){
      fl(`⚠️ Tên đơn vị "${newName}" đã tồn tại!`);
      return;
    }
    setRenameDept(null);
    setCustomDepts(l=>{
      const updated=l.map(d=>d===oldName?newName:d);
      try{localStorage.setItem("customDepts",JSON.stringify(updated));}catch{}
      return updated;
    });
    const oldLines=lineQuyen[oldName]||[];
    setLineQuyen(q=>{const {[oldName]:_,...rest}=q;return {...rest,[newName]:oldLines};});
    dbUpsertQuyenDongXe&&dbUpsertQuyenDongXe(newName,oldLines);
    const oldTabs=getTabKeysForDonVi(tabQuyen,oldName);
    setTabQuyen(q=>{const {[oldName]:_,...rest}=q;return {...rest,[newName]:oldTabs};});
    dbUpsertQuyenChucNang&&dbUpsertQuyenChucNang(newName,oldTabs);
    users.filter(u=>u.don_vi===oldName).forEach(u=>{
      const updatedUser={...u,don_vi:newName};
      setUsers(us=>us.map(x=>x.id===u.id?updatedUser:x));
      dbUpsertUser&&dbUpsertUser(updatedUser);
    });
    try{
      await supabase.from("custom_depts").delete().eq("ten",oldName);
      await supabase.from("custom_depts").upsert({ten:newName},{onConflict:"ten"});
    }catch(e){console.error("Đổi tên đơn vị thất bại:",e.message);}
  };

  // ── Xoá 1 đơn vị tùy chỉnh ──
  // ⚠️ FIX: nút "Xoá" trước đây dùng window.confirm() để hỏi xác nhận. Trên một số trình
  // duyệt/khung nhúng di động (webview trong app khác, PWA đã "Thêm vào màn hình chính"...),
  // window.confirm()/alert() có thể bị chặn hoặc không hiển thị được gì cả — khiến người
  // dùng bấm "Xoá" nhưng KHÔNG THẤY GÌ XẢY RA (tưởng nút bị lỗi). Nay thay bằng cơ chế xác
  // nhận NGAY TRONG GIAO DIỆN (bấm lần 1 → nút chuyển thành "Xác nhận xoá?", bấm lần 2 trong
  // vòng 4 giây mới thực sự xoá) — không phụ thuộc hộp thoại của trình duyệt nữa.
  // Đồng thời: nếu xoá trên Supabase thất bại (mất mạng, quyền RLS chặn...), sẽ HOÀN TÁC lại
  // đơn vị vừa xoá trên giao diện và báo lỗi rõ ràng, thay vì chỉ log console rồi "biến mất"
  // âm thầm — trước đây lỗi này bị nuốt lặng lẽ khiến đơn vị tưởng đã xoá nhưng vẫn còn trên
  // máy chủ, tải lại trang là hiện lại y như chưa xoá được.
  const doDeleteCustomDept=async(name)=>{
    setConfirmDelDept(null);
    const prevDepts=customDepts;
    const prevLineQuyen=lineQuyen;
    const prevTabQuyen=tabQuyen;
    setCustomDepts(l=>{
      const updated=l.filter(d=>d!==name);
      try{localStorage.setItem("customDepts",JSON.stringify(updated));}catch{}
      return updated;
    });
    setLineQuyen(q=>{const {[name]:_,...rest}=q;return rest;});
    setTabQuyen(q=>{const {[name]:_,...rest}=q;return rest;});
    try{
      const {error}=await supabase.from("custom_depts").delete().eq("ten",name);
      if(error)throw error;
      fl(`✓ Đã xoá đơn vị "${name}"`);
    }catch(e){
      // Xoá trên máy chủ thất bại — hoàn tác lại trên giao diện để không bị lệch dữ liệu
      setCustomDepts(prevDepts);
      setLineQuyen(prevLineQuyen);
      setTabQuyen(prevTabQuyen);
      fl(`⚠️ Xoá "${name}" thất bại (${e.message||"lỗi không rõ"}). Vui lòng thử lại.`);
    }
  };
  const deleteCustomDept=(name)=>{
    const affected=users.filter(u=>u.don_vi===name);
    if(affected.length>0){
      // ✅ Thay vì chặn hẳn, mở modal riêng hỏi rõ: xoá kèm luôn các tài khoản này hay huỷ.
      setDeleteDeptModal({name,affected});
      return;
    }
    if(confirmDelDept===name){ doDeleteCustomDept(name); return; }
    setConfirmDelDept(name);
    setTimeout(()=>setConfirmDelDept(cur=>cur===name?null:cur),4000);
  };
  // ── Xoá đơn vị KÈM xoá luôn các tài khoản còn thuộc đơn vị đó (bấm từ modal deleteDeptModal) ──
  const doDeleteCustomDeptWithUsers=async(name,affected)=>{
    setDeleteDeptModal(null);
    const ids=affected.map(u=>u.id);
    setUsers(l=>l.filter(u=>!ids.includes(u.id)));
    for(const u of affected){
      try{ dbDeleteUser&&await dbDeleteUser(u.id); }
      catch(e){ console.error("Xoá tài khoản",u.id,"thất bại:",e.message); }
    }
    await doDeleteCustomDept(name);
    fl(`✓ Đã xoá đơn vị "${name}" và ${ids.length} tài khoản đi kèm`);
  };
  const inp={width:"100%",padding:"8px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f0f4ff",boxShadow:"0 1px 4px rgba(99,102,241,0.08)"};
  const btn={border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 11px"};
  const fl=m=>{setFlash2(m);setTimeout(()=>setFlash2(""),2500);};

  // ⚠️ FIX LỖI NGHIÊM TRỌNG ("tạo tài khoản xong nhưng không đăng nhập được"): code cũ gọi
  // dbUpsertUser(...) nhưng KHÔNG chờ (await) kết quả — nếu lưu lên Supabase thất bại (vd. cột
  // dữ liệu sai kiểu, mất mạng, RLS chặn...), hàm vẫn cứ thêm tài khoản vào state cục bộ (local)
  // và báo "✓ Đã thêm tài khoản" y như thành công. Tài khoản khi đó CHỈ tồn tại tạm trong bộ nhớ
  // trình duyệt hiện tại — hễ tải lại trang (F5) hoặc đăng nhập từ máy/trình duyệt khác, danh
  // sách "users" được nạp lại TỪ SUPABASE (không có tài khoản này) → đăng nhập báo sai mật khẩu,
  // dù lúc tạo không thấy báo lỗi gì. Nay: PHẢI chờ dbUpsertUser xác nhận lưu THÀNH CÔNG trên máy
  // chủ rồi mới cập nhật state cục bộ + báo "✓ Đã thêm"; nếu thất bại, báo lỗi rõ ràng và KHÔNG
  // thêm vào danh sách, tránh ảo giác "đã tạo xong" trong khi máy chủ chưa hề có bản ghi đó.
  const save=async()=>{
    if(!form.id.trim()||!form.ten.trim()||!form.pw.trim()){fl("⚠️ Điền đủ thông tin!");return;}
    if(editing){
      const updated={...(users.find(u=>u.id===editing)||{}),...form};
      const ok = dbUpsertUser ? await dbUpsertUser(updated) : true;
      if(!ok){ fl("⚠️ Lưu lên máy chủ THẤT BẠI — chưa cập nhật!"); return; }
      setUsers(l=>l.map(u=>u.id===editing?updated:u));
      fl("✓ Đã cập nhật");
    } else {
      if(users.find(u=>u.id===form.id)){fl("⚠️ ID đã tồn tại!");return;}
      const newUser={...form};
      const ok = dbUpsertUser ? await dbUpsertUser(newUser) : true;
      if(!ok){ fl("⚠️ Lưu lên máy chủ THẤT BẠI — tài khoản CHƯA được tạo, vui lòng thử lại!"); return; }
      setUsers(l=>[...l,newUser]);
      fl("✓ Đã thêm tài khoản");
    }
    setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧",is_admin:false});setEdit(null);
  };
  const del=id=>{
    if(id===currentUser.id){fl("⚠️ Không thể xóa tài khoản đang dùng!");return;}
    if(!window.confirm("Xóa tài khoản này?"))return;
    setUsers(l=>l.filter(u=>u.id!==id));
    dbDeleteUser&&dbDeleteUser(id);
    fl("✓ Đã xóa");
  };
  const startEdit=u=>{setForm({...u});setEdit(u.id);setAddOpen(true);};
  const resetForm=()=>{setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧",is_admin:false});setEdit(null);};

  // Coi là "Online" nếu last_active trong vòng 45s gần nhất (heartbeat gửi mỗi 20s)
  const ONLINE_MS=45000;
  const [nowTick,setNowTick]=useState(Date.now());
  useEffect(()=>{const iv=setInterval(()=>setNowTick(Date.now()),5000);return ()=>clearInterval(iv);},[]);
  const isOnline=u=>{
    if(u.id===currentUser.id) return true; // chính mình luôn online
    if(!u.last_active) return false;
    return (nowTick-new Date(u.last_active).getTime())<ONLINE_MS;
  };

  // ── Phân quyền dòng xe theo đơn vị (áp dụng cho cả đơn vị, không phải từng tài khoản) ──
  const ALL_LINES_META=[{id:"12m",label:"XE 12M"},{id:"citybus",label:"CITY BUS"},{id:"minibus",label:"MINI BUS"}];
  const BASE_DON_VI=["NHÀ MÁY THCK","XƯỞNG HÀN","KHO VẬT TƯ","PHÒNG KH-TH"];
  const allDonViGroups=[...BASE_DON_VI, ...customDepts.filter(d=>!BASE_DON_VI.includes(d))];
  const toggleLineQuyen=(donVi,lineId)=>{
    const cur=lineQuyen[donVi]||[];
    const next=cur.includes(lineId)?cur.filter(x=>x!==lineId):[...cur,lineId];
    setLineQuyen(q=>({...q,[donVi]:next}));
    dbUpsertQuyenDongXe&&dbUpsertQuyenDongXe(donVi,next);
  };

  // ── Phân quyền CHỨC NĂNG (tab) theo đơn vị — độc lập với phân quyền dòng xe ở trên.
  // Quyết định đơn vị đó thấy đúng NHIỆM VỤ nào (Soạn Hàng / Nhận Hàng / Phiếu GN / Báo
  // cáo / BOM Mẫu / Người dùng), tách biệt với việc đơn vị đó xem dữ liệu DÒNG XE nào.
  const toggleTabQuyen=(donVi,tabId)=>{
    const cur=getTabKeysForDonVi(tabQuyen,donVi);
    const next=cur.includes(tabId)?cur.filter(x=>x!==tabId):[...cur,tabId];
    setTabQuyen(q=>({...q,[donVi]:next}));
    dbUpsertQuyenChucNang&&dbUpsertQuyenChucNang(donVi,next);
  };

  // ✅ TRƯỚC ĐÂY: chỉ gom tài khoản theo 4 VAI TRÒ (thck/xuonghan/kho/khth) — nghĩa là
  // MỌI đơn vị cùng vai trò "kho" (KHO VẬT TƯ, KHO CITYBUS, KHO 12M...) bị dồn chung
  // vào MỘT bảng "📦 KHO VẬT TƯ" duy nhất, và mọi đơn vị "khth" (PHÒNG KH-TH, Phòng KT,
  // Ban CN, BAN LĐNM...) bị dồn chung vào bảng "📋 PHÒNG KH-TH" — không tách riêng
  // được từng đơn vị như mong muốn.
  // NAY: mỗi ĐƠN VỊ (don_vi) có bảng tài khoản RIÊNG của mình — áp dụng chung cho MỌI
  // đơn vị tùy chỉnh, kể cả các đơn vị thêm sau này, không cần sửa code thêm nữa.
  const roleMeta={thck:{icon:"🏭",mau:"#1d4ed8"},xuonghan:{icon:"🚗",mau:"#b45309"},kho:{icon:"📦",mau:"#0f766e"},khth:{icon:"📋",mau:"#7c3aed"}};
  // ✅ Icon + màu RIÊNG cho từng đơn vị cụ thể (thay cho icon chung theo vai trò) — mỗi
  // đơn vị có 1 icon đặc trưng dễ nhận diện, đơn vị tùy chỉnh thêm sau này (không có trong
  // bảng) sẽ tự rơi về icon theo vai trò (roleMeta) như cũ.
  const DONVI_ICON_META={
    "NHÀ MÁY THCK":{icon:"🏭",mau:"#1d4ed8"},
    "XƯỞNG HÀN":   {icon:"🔥",mau:"#dc2626"},
    "KHO VẬT TƯ":  {icon:"📦",mau:"#16a34a"},
    "KHO CITYBUS": {icon:"🚌",mau:"#2563eb"},
    "KHO 12M":     {icon:"🚍",mau:"#0f766e"},
    "KHO MINIBUS": {icon:"🚐",mau:"#0f766e"},
    "XH_MINIBUS":  {icon:"🚐",mau:"#ea580c"},
    "XH_CITYBUS":  {icon:"🚌",mau:"#1e3a8a"},
    "XH_12":       {icon:"🚍",mau:"#0d9488"},
    "XH_12M":      {icon:"🚍",mau:"#0d9488"},
    "PHÒNG KH-TH": {icon:"🖥️",mau:"#2563eb"},
    "PHÒNG KT":    {icon:"📝",mau:"#ea580c"},
    "BAN CN":      {icon:"👥",mau:"#3b82f6"},
    "BAN LĐNM":    {icon:"🛡️",mau:"#7c3aed"},
  };
  const baseRoleOf=dv=>dv==="NHÀ MÁY THCK"?"thck":dv==="XƯỞNG HÀN"?"xuonghan":dv==="KHO VẬT TƯ"?"kho":dv==="PHÒNG KH-TH"?"khth":donViBaseRole(dv);
  // Đề phòng tài khoản nào đó có don_vi không khớp bất kỳ đơn vị nào đang biết (đơn vị
  // đã bị xoá/đổi tên...) — vẫn gom vào 1 nhóm riêng theo đúng tên đó để KHÔNG có tài
  // khoản nào bị "mất tích" khỏi danh sách.
  const knownDv=new Set(allDonViGroups);
  const extraDv=Array.from(new Set(users.filter(u=>!knownDv.has(u.don_vi)).map(u=>u.don_vi)));
  const allGroupDv=[...allDonViGroups,...extraDv];
  const allGroups=allGroupDv.map(dv=>{
    const grpList=users.filter(u=>u.don_vi===dv);
    const role=grpList[0]?.role||baseRoleOf(dv);
    const meta=DONVI_ICON_META[dv]||roleMeta[role]||roleMeta.khth;
    return {dv,grpList,grpOnline:grpList.filter(isOnline).length,grpMau:meta.mau,grpIcon:meta.icon};
  });
  const unsortedGroupsWithAccounts=allGroups.filter(g=>g.grpList.length>0);
  // ── Thứ tự hiển thị cố định cho lưới icon (Hàng 1: BAN LĐNM, PHÒNG KH-TH, PHÒNG KT, BAN CN
  // — Hàng 2: NHÀ MÁY THCK, KHO VẬT TƯ, KHO CITYBUS, KHO 12M — Hàng 3: XƯỞNG HÀN, XH_MINIBUS,
  // XH_CITYBUS, XH_12M). Đơn vị nào không có trong danh sách này sẽ xếp cuối, giữ nguyên thứ tự cũ.
  const DEPT_GRID_ORDER=["BAN LĐNM","PHÒNG KH-TH","PHÒNG KT","BAN CN","NHÀ MÁY THCK","KHO VẬT TƯ","KHO CITYBUS","KHO 12M","XƯỞNG HÀN","XH_MINIBUS","XH_CITYBUS","XH_12M"];
  const groupsWithAccounts=[...unsortedGroupsWithAccounts].sort((a,b)=>{
    const ia=DEPT_GRID_ORDER.indexOf(a.dv), ib=DEPT_GRID_ORDER.indexOf(b.dv);
    if(ia===-1&&ib===-1)return 0;
    if(ia===-1)return 1;
    if(ib===-1)return -1;
    return ia-ib;
  });
  const totalOnline=users.filter(isOnline).length;

  return(
    <div>
      {/* ── TỔNG QUAN ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        <StatCard compact icon="🏢" label="Đơn vị đang dùng" value={`${groupsWithAccounts.length}/${allGroups.length}`} color="#7c3aed"/>
        <StatCard compact icon="👥" label="Tổng tài khoản" value={users.length} color="#1d4ed8"/>
        <StatCard compact icon="🟢" label="Đang online" value={totalOnline} color="#16a34a"/>
      </div>

      {/* ── PHÂN QUYỀN DÒNG XE (gấp gọn mặc định) ── */}
      <AccordionCard icon="🚌" title={<b>PHÂN QUYỀN DÒNG XE THEO ĐƠN VỊ</b>} badge={`${allGroups.length} đơn vị`} badgeColor="#7c3aed"
        open={permOpen} onToggle={()=>setPermOpen(o=>!o)}>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:12}}>Tick chọn (các) dòng xe mà mỗi đơn vị được phép truy cập ở màn hình đăng nhập. Áp dụng chung cho cả đơn vị. Tài khoản <b>admin</b> luôn có toàn quyền cả 3 dòng, không phụ thuộc bảng này.</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
              <th style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:"#6b7280",fontSize:11}}>Đơn vị</th>
              {ALL_LINES_META.map(l=><th key={l.id} style={{padding:"8px 12px",textAlign:"center",fontWeight:700,color:"#6b7280",fontSize:11}}>{l.label}</th>)}
              <th style={{padding:"8px 12px",textAlign:"center",fontWeight:700,color:"#6b7280",fontSize:11}}>Sửa/Xoá</th>
            </tr></thead>
            <tbody>
              {allDonViGroups.map((dv,i)=>{
                const isCore=BASE_DON_VI.includes(dv); // 4 đơn vị gốc — không cho sửa/xoá vì gắn liền vai trò hệ thống
                return(
                <tr key={dv} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f9fafb"}}>
                  <td style={{padding:"8px 12px",fontWeight:600}}>{dv}</td>
                  {ALL_LINES_META.map(l=>{
                    const checked=(lineQuyen[dv]||[]).includes(l.id);
                    return (
                      <td key={l.id} style={{padding:"8px 12px",textAlign:"center"}}>
                        <input type="checkbox" checked={checked} onChange={()=>toggleLineQuyen(dv,l.id)} style={{width:16,height:16,cursor:"pointer"}}/>
                      </td>
                    );
                  })}
                  <td style={{padding:"8px 12px",textAlign:"center",whiteSpace:"nowrap"}}>
                    {isCore?(
                      <span style={{fontSize:10,color:"#cbd5e1"}}>—</span>
                    ):(
                      <div style={{display:"inline-flex",gap:6}}>
                        <button onClick={()=>renameCustomDept(dv)} style={{...btn,background:"#fef3c7",color:"#92400e",padding:"4px 9px",fontSize:11}}>Sửa</button>
                        <button onClick={()=>deleteCustomDept(dv)} style={{...btn,background:confirmDelDept===dv?"#991b1b":"#fee2e2",color:confirmDelDept===dv?"#fff":"#991b1b",padding:"4px 9px",fontSize:11,fontWeight:confirmDelDept===dv?800:600}}>{confirmDelDept===dv?"Bấm lại để xoá":"Xoá"}</button>
                      </div>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,flexWrap:"wrap"}}>
          <button onClick={()=>addCustomDept(false)} style={{...btn,background:"#eef2ff",color:"#4338ca",fontWeight:700,padding:"7px 14px"}}>➕ Thêm đơn vị</button>
          {flash2&&<span style={{fontSize:12,color:flash2.startsWith("⚠️")?"#dc2626":"#16a34a"}}>{flash2}</span>}
        </div>
      </AccordionCard>

      {/* ── PHÂN QUYỀN CHỨC NĂNG (TAB) THEO ĐƠN VỊ (gấp gọn mặc định) ── */}
      <AccordionCard icon="🎛️" title={<b>PHÂN QUYỀN CHỨC NĂNG THEO ĐƠN VỊ</b>} badge={`${allDonViGroups.length} đơn vị`} badgeColor="#0f766e"
        open={permOpen2} onToggle={()=>setPermOpen2(o=>!o)}>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:12}}>Tick chọn (các) nhiệm vụ mà mỗi đơn vị được phép thao tác/xem sau khi đăng nhập — độc lập với bảng "Phân quyền dòng xe" ở trên (bảng đó quyết định XEM DỮ LIỆU DÒNG XE NÀO, bảng này quyết định LÀM NHIỆM VỤ GÌ). Bỏ tick "🗂️ Tạo BOM Mẫu"/"✅ Kiểm Tra Xác Nhận" khỏi 1 kho chuyên trách chỉ Soạn Hàng, hoặc bỏ tick "📋 Soạn Hàng" khỏi 1 xưởng chuyên trách chỉ Kiểm Tra Xác Nhận, v.v. Mọi tab luôn HIỆN ĐỦ trên thanh công cụ của mọi tài khoản — tab nào KHÔNG được tick ở đây sẽ hiện MỜ và báo "Bạn chưa được quyền truy cập" khi bấm vào. Tài khoản <b>admin</b> và tài khoản đặc biệt <b>xh04</b> luôn giữ trọn bộ chức năng của mình.</div>
        {/* ✅ FIX: bảng nhiều cột (mỗi dòng xe/nhiệm vụ 1 cột) tràn ngang trên màn hình nhỏ —
            đã có overflowX:"auto" để vuốt ngang xem hết, và giờ GHIM CỐ ĐỊNH cột "Đơn vị"
            (position:"sticky", left:0) để cuộn ngang bao xa vẫn luôn biết đang xem đơn vị nào,
            kèm bóng đổ nhẹ bên phải để phân tách rõ với phần đang cuộn. */}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
              <th style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:"#6b7280",fontSize:11,position:"sticky",left:0,zIndex:2,background:"#f8fafc",boxShadow:"2px 0 4px -2px rgba(0,0,0,0.18)"}}>Đơn vị</th>
              {TAB_META.map(tb=><th key={tb.id} style={{padding:"8px 8px",textAlign:"center",fontWeight:700,color:"#6b7280",fontSize:10.5,whiteSpace:"nowrap"}}>{tb.label}</th>)}
            </tr></thead>
            <tbody>
              {allDonViGroups.map((dv,i)=>{
                const dvTabs=getTabKeysForDonVi(tabQuyen,dv);
                const rowBg=i%2===0?"#fff":"#f9fafb";
                return(
                <tr key={dv} style={{borderBottom:"1px solid #f1f5f9",background:rowBg}}>
                  <td style={{padding:"8px 12px",fontWeight:600,whiteSpace:"nowrap",position:"sticky",left:0,zIndex:1,background:rowBg,boxShadow:"2px 0 4px -2px rgba(0,0,0,0.18)"}}>{dv}</td>
                  {TAB_META.map(tb=>{
                    const checked=dvTabs.includes(tb.id);
                    return (
                      <td key={tb.id} style={{padding:"8px 8px",textAlign:"center"}}>
                        <input type="checkbox" checked={checked} onChange={()=>toggleTabQuyen(dv,tb.id)} style={{width:16,height:16,cursor:"pointer"}}/>
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AccordionCard>

      {/* ── THÊM / SỬA TÀI KHOẢN (gấp gọn mặc định, tự mở khi bấm Sửa) ── */}
      <AccordionCard icon={editing?"✏️":"➕"} title={editing?"Cập nhật tài khoản":"Thêm tài khoản mới"}
        open={editing?true:addOpen} onToggle={editing?undefined:()=>setAddOpen(o=>!o)}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:12}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>ID đăng nhập *</label>
            <input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value.toLowerCase().replace(/\s/g,"")}))} disabled={!!editing}
              style={{...inp,background:editing?"#f1f5f9":"#f0f4ff",color:editing?"#9ca3af":"inherit"}} placeholder="xh04"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Họ tên *</label>
            <input value={form.ten} onChange={e=>setForm(f=>({...f,ten:e.target.value}))} style={inp} placeholder="Nguyễn Văn A"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Mật khẩu *</label>
            <input value={form.pw} onChange={e=>setForm(f=>({...f,pw:e.target.value}))} style={inp} placeholder="Mật khẩu"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Vai trò</label>
            <select
              value={customDepts.includes(form.don_vi)?`${form.role}::${form.don_vi}`:form.role}
              onChange={e=>{
                const v=e.target.value;
                if(v==="__add_new__"){addCustomDept();return;}
                if(v.includes("::")){const [r,label]=v.split("::");setForm(f=>({...f,role:r,don_vi:label,avatar:donViAvatar(label)}));return;}
                const r=v;setForm(f=>({...f,role:r,don_vi:r==="thck"?"NHÀ MÁY THCK":r==="kho"?"KHO VẬT TƯ":r==="khth"?"PHÒNG KH-TH":"XƯỞNG HÀN",avatar:r==="thck"?"🏭":r==="kho"?"📦":r==="khth"?"📋":"🚗"}));
              }} style={inp}>
              <option value="thck">🏭 NHÀ MÁY THCK</option>
              <option value="xuonghan">🚗 XƯỞNG HÀN</option>
              <option value="kho">📦 KHO VẬT TƯ</option>
              <option value="khth">📋 PHÒNG KH-TH (chỉ xem)</option>
              {customDepts.map(d=>{
                const r=donViBaseRole(d);
                const label=r==="kho"?`📦 ${d} (Soạn hàng)`:r==="xuonghan"?`🚗 ${d} (Duyệt hàng)`:`📋 ${d} (chỉ xem)`;
                return <option key={d} value={`${r}::${d}`}>{label}</option>;
              })}
              <option value="__add_new__">➕ Thêm phòng/ban khác...</option>
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Avatar</label>
            <select value={form.avatar} onChange={e=>setForm(f=>({...f,avatar:e.target.value}))} style={inp}>
              {["👤","🧑","👩","🏭","🔧","👷","👨‍🔧","👩‍🔧","⚙️","🛠️"].map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"9px 12px",background:form.is_admin?"#fef3c7":"#f8fafc",border:form.is_admin?"1.5px solid #f59e0b":"1.5px solid #e5e7eb",borderRadius:8,cursor:"pointer",width:"fit-content"}}>
          <input type="checkbox" checked={!!form.is_admin} onChange={e=>setForm(f=>({...f,is_admin:e.target.checked}))} style={{width:16,height:16,cursor:"pointer"}}/>
          <span style={{fontSize:12.5,fontWeight:700,color:"#92400e"}}>🛡️ Cấp quyền Quản trị viên (Admin — toàn quyền cả 3 dòng xe, thấy tab CMS &amp; Người dùng)</span>
        </label>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:flash2.startsWith("⚠️")?"#dc2626":"#16a34a",minWidth:160}}>{flash2}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {editing&&<button onClick={()=>{resetForm();setAddOpen(false);}} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px"}}>Hủy</button>}
            {currentUser.id==="xh04"&&<button onClick={lockOtherXH} style={{...btn,background:"#dc2626",color:"#fff",padding:"7px 14px"}}>🔒 Khóa XH khác</button>}
            <button onClick={save} style={{...btn,background:"#1d4ed8",color:"#fff",padding:"7px 18px",fontSize:13}}>{editing?"Lưu cập nhật":"Thêm tài khoản"}</button>
          </div>
        </div>
      </AccordionCard>

      {/* ── TIÊU ĐỀ "QUẢN LÝ TÀI KHOẢN" — chữ hoa, in đậm, chữ trắng, nền đen bo tròn ── */}
      <div style={{textAlign:"center",margin:"6px 0 18px"}}>
        <span style={{display:"inline-block",background:"#0a0a0a",color:"#fff",fontWeight:800,fontSize:14,letterSpacing:0.6,textTransform:"uppercase",padding:"10px 30px",borderRadius:999,boxShadow:"0 6px 16px rgba(0,0,0,0.28)"}}>
          Quản Lý Tài Khoản
        </span>
      </div>

      {/* ── LƯỚI ICON THEO ĐƠN VỊ — thu nhỏ, 4 ô/hàng. Bấm 1 ô để chọn (viền nổi bật) và
          xem danh sách tài khoản của đơn vị đó ở bảng cuối cùng, bên dưới toàn bộ lưới ── */}
      {groupsWithAccounts.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:8,marginBottom:16}}>
          {groupsWithAccounts.map(g=>{
            const {dv,grpList,grpOnline,grpMau,grpIcon}=g;
            const selected=selectedDept===dv;
            return (
              <button key={dv} onClick={()=>setSelectedDept(d=>d===dv?null:dv)}
                style={{cursor:"pointer",border:selected?`2.5px solid ${grpMau}`:"1.5px solid #e5e7eb",borderRadius:14,background:selected?`${grpMau}1c`:"#fff",padding:"10px 4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,boxShadow:selected?`0 4px 14px ${grpMau}4d`:"0 1px 4px rgba(0,0,0,0.06)",transform:selected?"scale(1.04)":"none",transition:"all .15s",position:"relative",fontFamily:"inherit"}}>
                {grpOnline>0&&<span style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 0 2px #fff"}}/>}
                <div style={{width:36,height:36,borderRadius:10,background:`${grpMau}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,overflow:"hidden"}}>
                  {DONVI_ICON_IMG[dv]?<img src={DONVI_ICON_IMG[dv]} alt={dv} style={{width:"100%",height:"100%",objectFit:"contain",padding:3,boxSizing:"border-box"}}/>:grpIcon}
                </div>
                <div style={{fontWeight:800,fontSize:9,textTransform:"uppercase",color:"#1f2937",textAlign:"center",lineHeight:1.2}}>{dv}</div>
                <span style={{background:grpMau,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:8.5,fontWeight:700,whiteSpace:"nowrap"}}>{grpList.length} TK</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── BẢNG TÀI KHOẢN CỦA ĐƠN VỊ ĐANG ĐƯỢC CHỌN — hiển thị ngay dưới cùng của lưới icon ── */}
      {selectedDept&&(()=>{
        const g=groupsWithAccounts.find(x=>x.dv===selectedDept);
        if(!g)return null;
        const {dv,grpList,grpMau,grpIcon}=g;
        return(
          <div style={{background:"#fff",borderRadius:12,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            <div style={{height:4,background:grpMau}}/>
            <div style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:8,background:`${grpMau}14`,borderBottom:`1px solid ${grpMau}33`}}>
              <span style={{fontSize:18,display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22}}>
                {DONVI_ICON_IMG[dv]?<img src={DONVI_ICON_IMG[dv]} alt={dv} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:grpIcon}
              </span>
              <span style={{fontWeight:800,fontSize:13,textTransform:"uppercase",color:grpMau}}>{dv}</span>
              <span style={{marginLeft:"auto",fontSize:11,color:"#6b7280",fontWeight:600}}>{grpList.length} tài khoản</span>
              <button onClick={()=>setSelectedDept(null)} style={{border:"none",background:"transparent",cursor:"pointer",color:"#9ca3af",fontSize:13,padding:4,lineHeight:1}}>✕</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                  {["","ID",t("thHoTen"),t("lbDV"),t("thTrangThai"),t("thMatKhau"),"",""].map((h,i)=><th key={i} style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:"#6b7280",fontSize:11}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {grpList.map((u,i)=>(
                    <tr key={u.id} style={{borderBottom:"1px solid #f1f5f9",background:u.id===currentUser.id?"#eff6ff":i%2===0?"#fff":"#f9fafb"}}>
                      <td style={{padding:"8px 12px",fontSize:20,width:40}}>
                        {isImgAvatar(u.avatar)
                          ? <img src={u.avatar} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",display:"block"}}/>
                          : u.avatar}
                      </td>
                      <td style={{padding:"8px 12px",fontWeight:700,color:grpMau,fontFamily:"monospace"}}>{u.id}</td>
                      <td style={{padding:"8px 12px",fontWeight:600}}>{u.ten}{u.id===currentUser.id&&<span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"1px 8px",fontSize:10,marginLeft:6,fontWeight:700}}>Đang dùng</span>}{isAdminAccount(u)&&<span style={{background:"#fef3c7",color:"#92400e",borderRadius:10,padding:"1px 8px",fontSize:10,marginLeft:6,fontWeight:700}}>🛡️ Admin</span>}</td>
                      <td style={{padding:"8px 12px",color:"#6b7280"}}>{u.don_vi}</td>
                      <td style={{padding:"8px 12px"}}>
                        {isOnline(u)
                          ?<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#dcfce7",color:"#15803d",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}><span style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>Online</span>
                          :<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f3f4f6",color:"#9ca3af",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}><span style={{width:7,height:7,borderRadius:"50%",background:"#cbd5e1",display:"inline-block"}}/>Offline</span>}
                      </td>
                      <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{"•".repeat(Math.min(u.pw.length,8))}</td>
                      <td style={{padding:"8px 12px"}}><button onClick={()=>startEdit(u)} style={{...btn,background:"#fef3c7",color:"#92400e"}}>Sửa</button></td>
                      <td style={{padding:"8px 12px"}}><button onClick={()=>del(u.id)} disabled={u.id===currentUser.id} style={{...btn,background:u.id===currentUser.id?"#f3f4f6":"#fee2e2",color:u.id===currentUser.id?"#9ca3af":"#991b1b"}}>Xóa</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL XOÁ ĐƠN VỊ CÒN TÀI KHOẢN — cho chọn xoá kèm luôn các tài khoản hoặc huỷ ── */}
      {deleteDeptModal&&(
        <DeleteDeptModal modal={deleteDeptModal} onClose={()=>setDeleteDeptModal(null)} onConfirm={doDeleteCustomDeptWithUsers}/>
      )}

      {/* ── MODAL ĐỔI TÊN ĐƠN VỊ (thay cho window.prompt — không hoạt động trong 1 số webview) ── */}
      {renameDept&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}
          onClick={e=>{if(e.target===e.currentTarget)setRenameDept(null);}}>
          <div style={{background:"#fff",borderRadius:14,padding:28,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>✏️ Đổi tên đơn vị</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Đơn vị hiện tại: <b>{renameDept.oldName}</b></div>
            <input autoFocus value={renameDept.value}
              onChange={e=>setRenameDept(r=>({...r,value:e.target.value}))}
              onKeyDown={e=>{if(e.key==="Enter")doRenameCustomDept(renameDept.oldName,renameDept.value);if(e.key==="Escape")setRenameDept(null);}}
              style={{width:"100%",padding:"9px 12px",border:"1.5px solid #c7d2fe",borderRadius:8,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f0f4ff",marginBottom:16}}/>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setRenameDept(null)}
                style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,padding:"8px 16px",background:"#f3f4f6",color:"#374151"}}>Hủy</button>
              <button onClick={()=>doRenameCustomDept(renameDept.oldName,renameDept.value)}
                style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"8px 20px",background:"#1d4ed8",color:"#fff"}}>
                ✓ Xác nhận đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  🖼️ CMS — Quản lý Nội dung / Banner / Ảnh đại diện (CHỈ admin)
// ═══════════════════════════════════════════════════════════════
const CMS_LOAI = [
  {v:"noi_dung", l:"📝 Nội dung",     mo:"Khối văn bản (tiêu đề + mô tả) hiển thị trong app."},
  {v:"banner",   l:"🖼️ Banner",       mo:"Ảnh banner kèm tiêu đề, có thể gắn liên kết."},
  {v:"banner_header", l:"🏭 Banner đầu trang", mo:"Ảnh banner hiển thị ở đầu trang chọn dòng xe (đăng nhập) — thay cho ảnh mặc định. Chỉ cần bật \"Đang áp dụng\" và chọn ảnh, KHÔNG cần sửa code. Nếu có nhiều mục đang áp dụng, mục có \"Thứ tự hiển thị\" nhỏ nhất sẽ được dùng."},
  {v:"avatar",   l:"👤 Ảnh đại diện (mẫu)", mo:"Kho ảnh đại diện MẪU dùng chung, chưa gắn cho tài khoản cụ thể nào."},
  {v:"tai_khoan", l:"📸 Ảnh đại diện Tài khoản", mo:"Tải và gắn TRỰC TIẾP 1 ảnh đại diện thật cho từng tài khoản đăng nhập — ảnh này sẽ hiện ngay ở góc phải thanh header (cạnh chuông thông báo) khi tài khoản đó đăng nhập."},
];
const CMS_E0 = {id:"", loai:"noi_dung", tieu_de:"", mo_ta:"", anh:"", lien_ket:"", thu_tu:0, an_hien:true};

// Đọc 1 file ảnh do người dùng chọn → chuỗi base64 (data URL), kèm giới hạn dung lượng
// nhẹ (~800KB sau mã hoá) để tránh làm phình bảng cms_content trên Supabase.
const readImageAsBase64 = (file) => new Promise((resolve, reject) => {
  if(!file) return resolve("");
  if(file.size > 1_200_000){
    alert("⚠️ Ảnh khá nặng (>1.2MB) — nên chọn ảnh nhẹ hơn (nén/giảm kích thước trước) để tránh app tải chậm.");
  }
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

function AccountAvatarManager({users, setUsers, dbUpsertUser}){
  const [busyId, setBusyId] = useState("");
  const [q, setQ] = useState("");
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"7px 14px"};

  const list = (users||[]).filter(u=>{
    const s=q.trim().toLowerCase();
    if(!s) return true;
    return u.ten.toLowerCase().includes(s) || u.id.toLowerCase().includes(s) || (u.don_vi||"").toLowerCase().includes(s);
  });

  const onPick = async(u, file)=>{
    if(!file) return;
    setBusyId(u.id);
    try{
      const b64 = await readImageAsBase64(file);
      if(!b64){ setBusyId(""); return; }
      const updated = {...u, avatar:b64};
      const ok = await dbUpsertUser(updated);
      if(ok) setUsers(list=>list.map(x=>x.id===u.id?updated:x));
    }catch(err){
      alert("⚠️ Không đọc được ảnh: "+(err.message||"lỗi không xác định"));
    }
    setBusyId("");
  };

  const onReset = async(u)=>{
    if(!window.confirm(`Xoá ảnh đại diện của "${u.ten}", trả về biểu tượng mặc định?`)) return;
    setBusyId(u.id);
    const updated = {...u, avatar:"👤"};
    const ok = await dbUpsertUser(updated);
    if(ok) setUsers(list=>list.map(x=>x.id===u.id?updated:x));
    setBusyId("");
  };

  return(
    <div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"10px 12px"}}>
        📸 Tải 1 ảnh thật (chân dung) cho từng tài khoản bên dưới — ảnh sẽ thay thế icon mặc định, hiển thị ngay tại vòng tròn avatar ở góc phải thanh header khi tài khoản đó đăng nhập.
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔎 Tìm theo tên / ID / đơn vị..."
        style={{width:"100%",padding:"9px 12px",border:"1.5px solid #c7d2fe",borderRadius:8,fontSize:13,marginBottom:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
      <div style={{display:"grid",gap:8}}>
        {list.length===0 && <div style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:24}}>Không tìm thấy tài khoản.</div>}
        {list.map(u=>(
          <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:10,padding:10,flexWrap:"wrap"}}>
            <div style={{width:46,height:46,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:"1.5px solid #e5e7eb"}}>
              {isImgAvatar(u.avatar) ? <img src={u.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (u.avatar||"👤")}
            </div>
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontWeight:700,fontSize:13,color:"#0b2545"}}>{u.ten}</div>
              <div style={{fontSize:11,color:"#9ca3af",fontFamily:"monospace"}}>{u.id} · {u.don_vi}</div>
            </div>
            <label style={{...btn,background:"#eef2ff",color:"#1d4ed8",opacity:busyId===u.id?.6:1}}>
              {busyId===u.id?"Đang tải...":"⬆️ Tải ảnh lên"}
              <input type="file" accept="image/*" disabled={busyId===u.id} style={{display:"none"}}
                onChange={e=>{const f=e.target.files?.[0];onPick(u,f);e.target.value="";}}/>
            </label>
            {isImgAvatar(u.avatar) && (
              <button onClick={()=>onReset(u)} disabled={busyId===u.id} style={{...btn,background:"#fef2f2",color:"#dc2626",opacity:busyId===u.id?.6:1}}>Xoá ảnh</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CmsPanel({items, setItems, dbUpsertCms, dbDeleteCms, users, setUsers, dbUpsertUser}){
  const [subTab, setSubTab] = useState("noi_dung");
  const [form, setForm] = useState(CMS_E0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  const inp={width:"100%",padding:"8px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f8fafc"};
  const lbl={display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4};
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"8px 16px"};

  const listOfType = items.filter(it=>it.loai===subTab).sort((a,b)=>(a.thu_tu||0)-(b.thu_tu||0));

  const resetForm = () => { setForm({...CMS_E0, loai:subTab}); setEditing(false); };

  const onPickImage = async(e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    try{
      const b64 = await readImageAsBase64(file);
      setForm(f=>({...f, anh:b64}));
    }catch(err){
      alert("⚠️ Không đọc được ảnh: "+(err.message||"lỗi không xác định"));
    }
  };

  const onSave = async()=>{
    if(!form.anh && subTab==="banner_header"){
      alert("⚠️ Vui lòng chọn ảnh banner."); return;
    }
    if(!form.tieu_de.trim() && subTab!=="avatar" && subTab!=="banner_header"){
      alert("⚠️ Vui lòng nhập tiêu đề."); return;
    }
    setSaving(true);
    const id = form.id || (subTab+"_"+Date.now());
    const row = {...form, id, loai:subTab, updated_at:new Date().toISOString()};
    const ok = await dbUpsertCms(row);
    if(!ok){ setSaving(false); return; }
    // ✅ Banner đầu trang: mỗi lúc chỉ nên tồn tại 1 banner để đỡ phình bảng cms_content
    // (ảnh lưu base64 khá nặng) — mỗi khi ÁP DỤNG banner MỚI (không phải đang sửa banner cũ),
    // tự động xoá hết các banner_header khác đang có trên Supabase lẫn trong danh sách hiển thị.
    let oldIdsToRemove = [];
    if(subTab==="banner_header" && !editing){
      oldIdsToRemove = items.filter(x=>x.loai==="banner_header" && x.id!==id).map(x=>x.id);
      for(const oldId of oldIdsToRemove){ await dbDeleteCms(oldId); }
    }
    setSaving(false);
    setItems(list=>{
      const exist = list.some(x=>x.id===id);
      const merged = exist ? list.map(x=>x.id===id?row:x) : [...list, row];
      return merged.filter(x=>!oldIdsToRemove.includes(x.id));
    });
    resetForm();
  };

  const onEdit = (it)=>{ setForm(it); setEditing(true); };

  const onDelete = async(id)=>{
    const ok = await dbDeleteCms(id);
    if(!ok) return;
    setItems(list=>list.filter(x=>x.id!==id));
    setDelConfirm(null);
    if(form.id===id) resetForm();
  };

  return (
    <div style={{padding:"16px 4px"}}>
      <div style={{fontSize:18,fontWeight:800,color:"#0b2545",marginBottom:4}}>🖼️ CMS — Quản lý Nội dung</div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Chỉ tài khoản <b>admin</b> nhìn thấy và chỉnh sửa được khu vực này.</div>

      {/* Chọn loại nội dung */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {CMS_LOAI.map(o=>(
          <div key={o.v} onClick={()=>{setSubTab(o.v); setForm({...CMS_E0, loai:o.v}); setEditing(false);}}
            style={{padding:"9px 16px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,
              background:subTab===o.v?"#0b2545":"#f1f5f9", color:subTab===o.v?"#fff":"#374151",
              border:subTab===o.v?"2px solid #0b2545":"2px solid transparent"}}>
            {o.l}
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:"#9ca3af",marginBottom:16,marginTop:-8}}>
        {CMS_LOAI.find(o=>o.v===subTab)?.mo}
      </div>

      {/* Form thêm/sửa — ẨN khi đang ở mục "📸 Ảnh đại diện Tài khoản" vì mục này dùng UI
          riêng (danh sách tài khoản thật + nút tải ảnh từng dòng) thay vì form chung. */}
      {subTab==="tai_khoan" ? (
        <AccountAvatarManager users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser}/>
      ) : (<>
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:12,padding:16,marginBottom:20,boxShadow:"0 1px 6px rgba(15,23,42,0.05)"}}>
        <div style={{fontSize:13,fontWeight:800,color:"#0b2545",marginBottom:12}}>
          {editing ? "✏️ Sửa mục" : "➕ Thêm mục mới"}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div>
            <label style={lbl}>{subTab==="avatar" ? "Tên hiển thị" : subTab==="banner_header" ? "Ghi chú (không bắt buộc)" : "Tiêu đề"}</label>
            <input style={inp} value={form.tieu_de} onChange={e=>setForm(f=>({...f,tieu_de:e.target.value}))}
              placeholder={subTab==="avatar" ? "VD: Nguyễn Văn A / Xưởng Hàn" : subTab==="banner_header" ? "VD: Banner mùa hè 2026 (chỉ để ghi nhớ)" : "Nhập tiêu đề..."}/>
          </div>
          <div>
            <label style={lbl}>Thứ tự hiển thị{subTab==="banner_header"?" (mục nhỏ nhất được dùng)":""}</label>
            <input style={inp} type="number" value={form.thu_tu} onChange={e=>setForm(f=>({...f,thu_tu:Number(e.target.value)||0}))}/>
          </div>
        </div>
        {subTab!=="avatar" && subTab!=="banner_header" && (
          <div style={{marginBottom:12}}>
            <label style={lbl}>Mô tả / Nội dung</label>
            <textarea style={{...inp,minHeight:70,resize:"vertical"}} value={form.mo_ta}
              onChange={e=>setForm(f=>({...f,mo_ta:e.target.value}))} placeholder="Nội dung chi tiết..."/>
          </div>
        )}
        {subTab==="banner" && (
          <div style={{marginBottom:12}}>
            <label style={lbl}>Liên kết (khi bấm vào banner) — không bắt buộc</label>
            <input style={inp} value={form.lien_ket} onChange={e=>setForm(f=>({...f,lien_ket:e.target.value}))}
              placeholder="https://..."/>
          </div>
        )}
        <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:12,flexWrap:"wrap"}}>
          <div>
            <label style={lbl}>{subTab==="avatar" ? "Ảnh đại diện" : subTab==="banner" ? "Ảnh banner" : subTab==="banner_header" ? "Ảnh banner đầu trang (bắt buộc)" : "Ảnh minh hoạ (không bắt buộc)"}</label>
            <input type="file" accept="image/*" onChange={onPickImage}/>
          </div>
          {form.anh && (
            <div style={{position:"relative"}}>
              <img src={form.anh} alt="" style={{width:subTab==="avatar"?64:120, height:subTab==="avatar"?64:70,
                objectFit:"cover", borderRadius:subTab==="avatar"?"50%":8, border:"1.5px solid #e5e7eb"}}/>
              <button onClick={()=>setForm(f=>({...f,anh:""}))}
                style={{position:"absolute",top:-8,right:-8,width:20,height:20,borderRadius:"50%",border:"none",
                  background:"#dc2626",color:"#fff",fontSize:11,cursor:"pointer",lineHeight:"20px",padding:0}}>✕</button>
            </div>
          )}
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#374151",marginBottom:14,cursor:"pointer"}}>
          <input type="checkbox" checked={form.an_hien} onChange={e=>setForm(f=>({...f,an_hien:e.target.checked}))}/>
          Đang áp dụng (hiển thị)
        </label>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onSave} disabled={saving}
            style={{...btn,
              background: (subTab==="banner_header"&&!editing) ? "#8BC34A" : "#0b2545",
              color: (subTab==="banner_header"&&!editing) ? "#1a2e05" : "#fff",
              opacity:saving?0.6:1}}>
            {saving ? "Đang lưu..." : (editing ? "💾 Lưu thay đổi" : (subTab==="banner_header" ? "✅ ÁP DỤNG" : "➕ Thêm mới"))}
          </button>
          {editing && (
            <button onClick={resetForm} style={{...btn,background:"#f1f5f9",color:"#374151"}}>Huỷ</button>
          )}
        </div>
      </div>

      {/* Danh sách */}
      <div style={{display:"grid",gap:10}}>
        {listOfType.length===0 && (
          <div style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:24}}>Chưa có mục nào.</div>
        )}
        {listOfType.map(it=>(
          <div key={it.id} style={{display:"flex",alignItems:"center",gap:12,background:"#fff",
            border:"1.5px solid #e5e7eb",borderRadius:10,padding:12}}>
            {it.anh && (
              <img src={it.anh} alt="" style={{width:subTab==="avatar"?44:64, height:subTab==="avatar"?44:40,
                objectFit:"cover", borderRadius:subTab==="avatar"?"50%":6, flexShrink:0}}/>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:13,color:"#0b2545"}}>
                {it.tieu_de||"(không có tiêu đề)"}
                {!it.an_hien && <span style={{marginLeft:8,fontSize:10,color:"#dc2626",fontWeight:700}}>ẨN</span>}
              </div>
              {it.mo_ta && <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{it.mo_ta}</div>}
              {it.lien_ket && <div style={{fontSize:11,color:"#0ea5a0",marginTop:2}}>{it.lien_ket}</div>}
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>onEdit(it)} style={{...btn,background:"#eef2ff",color:"#1d4ed8",padding:"6px 12px"}}>Sửa</button>
              {delConfirm===it.id ? (
                <>
                  <button onClick={()=>onDelete(it.id)} style={{...btn,background:"#dc2626",color:"#fff",padding:"6px 12px"}}>Xác nhận xoá</button>
                  <button onClick={()=>setDelConfirm(null)} style={{...btn,background:"#f1f5f9",color:"#374151",padding:"6px 12px"}}>Huỷ</button>
                </>
              ) : (
                <button onClick={()=>setDelConfirm(it.id)} style={{...btn,background:"#fef2f2",color:"#dc2626",padding:"6px 12px"}}>Xoá</button>
              )}
            </div>
          </div>
        ))}
      </div>
      </>)}
    </div>
  );
}
const E0={stt:0,ma:"",ten:"",dv:"Cái",dm:1,ng:"",vt:"",jig:"",gc:"",anh:"",
  // ✅ 7 trường MỚI — chỉ áp dụng/hiển thị khi activeLine==="12m" (xem Modal thêm/sửa
  // và bảng danh sách vật tư bên dưới). Với các dòng xe khác các trường này luôn rỗng
  // và không được gửi lên Supabase (xem dbUpsertBomRows).
  ckgh:"dung_chung", px:"", dai:"", rong:"", day_kt:"", tram:"", tnxh:""};

// ── Thứ tự chuẩn Nguồn gốc: SUB MINI 1 → SUB MINI 2 → UB → MB → FT ──
const DM_ORDER=["SUB MINI 1","SUB MINI 2","UB","MB","FT"];
// ✅ Nhãn 5 "trang" vật tư (tab Xưởng hàn) — mỗi trang gộp đúng 1 nhóm trong DM_ORDER,
// nhãn phụ chỉ mang tính mô tả trực quan cho người dùng (dải mã tham khảo).
const TRANG_VT=[
  {ten:"SUB MINI 1",mo:"Vị trí SUB MINI 1"},
  {ten:"SUB MINI 2",mo:"Vị trí SUB MINI 2"},
  {ten:"UB",mo:"UB10 → UB80"},
  {ten:"MB",mo:"MB10 → MB90"},
  {ten:"FT",mo:"FT01 → FT08"},
];
const dmPriority=(dm)=>{
  const u=String(dm||"").toUpperCase();
  for(let i=0;i<DM_ORDER.length;i++){if(u.startsWith(DM_ORDER[i]))return i;}
  return DM_ORDER.length;
};
const sapXepDM=(a,b)=>{
  const pa=dmPriority(a),pb=dmPriority(b);
  if(pa!==pb)return pa-pb;
  return String(a).localeCompare(String(b));
};

// ═══════════════════════════════════════════════════════════════
//  XUẤT EXCEL & PDF UTILITIES
// ═══════════════════════════════════════════════════════════════

// Xuất Excel từ mảng rows (mỗi phần tử là object {col:value})
// ⚠️ Dùng "exceljs" thay vì "xlsx" (SheetJS bản community/miễn phí KHÔNG ghi được style khi
// xuất file — thuộc tính ws[addr].s trước đây bị bỏ qua hoàn toàn lúc writeFile, nên file Excel
// xuất ra luôn bị mất màu nền/chữ trắng/viền dù code có gán style). exceljs hỗ trợ ghi đầy đủ
// font/fill/border khi xuất, nên tiêu đề sẽ luôn có nền xanh đậm + chữ trắng in hoa + kẻ bảng.
//
// ⚠️ CẦN CÀI ĐẶT: thêm "exceljs" vào package.json của dự án (npm install exceljs) nếu chưa có.
async function xuatExcel(rows, tenFile="BaoCao", tieuDe="Báo cáo vật tư"){
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet((tieuDe||"Sheet1").slice(0,31));
  const cols = rows&&rows.length ? Object.keys(rows[0]) : [];
  // ✅ Mặc định canh GIỮA mọi cột — riêng "Tên vật tư" / "Vị trí" giữ canh TRÁI (dễ đọc nội
  // dung dài hơn) và được nới rộng cột hơn để không bị bó chữ.
  const colTrai=new Set(["Tên vật tư","Vị trí"]);
  ws.columns = cols.map(c=>({header:String(c).toUpperCase(), key:c, width:colTrai.has(c)?Math.max(22,String(c).length+4):Math.max(12,String(c).length+4)}));
  (rows||[]).forEach(r=>ws.addRow(r));

  const thin={style:"thin",color:{argb:"FF9CA3AF"}};
  const border={top:thin,bottom:thin,left:thin,right:thin};
  ws.eachRow((row,rowIdx)=>{
    row.eachCell({includeEmpty:true},(cell,colNumber)=>{
      cell.border=border;
      if(rowIdx===1){
        cell.font={bold:true,color:{argb:"FFFFFFFF"}};
        cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF1D4ED8"}};
        cell.alignment={vertical:"middle",horizontal:"center"};
      }else{
        const ten=cols[colNumber-1];
        cell.alignment={vertical:"middle",horizontal:colTrai.has(ten)?"left":"center"};
      }
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=`${tenFile}_${new Date().toISOString().slice(0,10)}.xlsx`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
}


// HTML/CSS dùng chung cho bản in & bản render ảnh/PDF
const BAO_CAO_STYLE=`
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:16px;background:#fff;}
  h2{font-size:15px;font-weight:700;margin-bottom:4px;color:#1d4ed8;}
  p.sub{font-size:10px;color:#6b7280;margin-bottom:12px;}
  table{width:100%;border-collapse:collapse;font-size:10px;}
  thead tr{background:#1d4ed8;color:#fff;}
  th{padding:5px 7px;text-align:center;font-weight:700;white-space:nowrap;}
  td{padding:4px 7px;border-bottom:1px solid #e5e7eb;text-align:center;}
  td.l,th.l{text-align:left;}
  tr:nth-child(even){background:#f8fafc;}
  .badge{display:inline-block;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:700;}
  .ok{background:#d1fae5;color:#065f46;}
  .warn{background:#fef3c7;color:#92400e;}
  .err{background:#fee2e2;color:#991b1b;}
  .footer{margin-top:14px;font-size:9px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:6px;}
  @media print{body{padding:8px;}}
`;

// Dựng 1 tấm ẢNH (Blob PNG) từ htmlContent bằng html2canvas, để chia sẻ như 1 tệp ảnh
// đính kèm thực sự (Zalo/Gmail/Messenger sẽ hiện thumbnail ảnh ngay, không phải link chữ).
//
// QUAN TRỌNG: nếu báo cáo có bảng rất dài (hàng trăm dòng), chụp toàn bộ bảng thành 1 tấm ảnh
// khổng lồ trong 1 lần rất dễ làm trình duyệt di động bị treo cứng (không lỗi, không phản hồi).
// Vì vậy ở đây bảng được CHIA NHỎ thành từng nhóm ít dòng (mặc định 25 dòng/nhóm) để chụp riêng
// từng nhóm cho nhẹ, rồi GHÉP tất cả lại thành 1 tấm ảnh dài duy nhất — nội dung y hệt bản PDF
// trước đây (cùng tiêu đề, cùng bảng, cùng chân trang), chỉ khác là xuất ra ảnh thay vì PDF.
async function taoAnhBaoCao(htmlContent, tenFile="BaoCao", soHangMoiTrang=25){
  const {default:html2canvas} = await import("html2canvas");

  // Tách htmlContent thành: tiêu đề/mô tả (phần trước bảng) + bảng (nếu có)
  const parsed = new DOMParser().parseFromString(htmlContent, "text/html");
  const bang = parsed.querySelector("table");

  const cacKhoiDaChup = [];

  // Hàm dùng chung: chụp 1 khối HTML (nhỏ) thành 1 canvas, gom lại để ghép sau
  const chupKhoi = async (htmlKhoi) => {
    const wrap=document.createElement("div");
    wrap.style.cssText="position:fixed;left:-99999px;top:0;width:900px;background:#fff;";
    wrap.innerHTML=`<style>${BAO_CAO_STYLE}</style><div style="padding:16px">${htmlKhoi}</div>`;
    document.body.appendChild(wrap);
    try{
      const canvas=await html2canvas(wrap, {scale:2, backgroundColor:"#ffffff", useCORS:true});
      if(!canvas || !canvas.width || !canvas.height){
        throw new Error("Không tạo được ảnh (canvas rỗng).");
      }
      cacKhoiDaChup.push(canvas);
    } finally {
      document.body.removeChild(wrap);
      // Nhường lại luồng xử lý cho trình duyệt 1 nhịp, tránh treo khi có nhiều nhóm liên tiếp
      await new Promise(r=>setTimeout(r,0));
    }
  };

  if(!bang){
    // Không có bảng (nội dung ngắn) -> chụp nguyên khối như cũ
    await chupKhoi(`${htmlContent}<div class="footer">Xuất lúc: ${new Date().toLocaleString("vi-VN")} · ${tenFile}</div>`);
  } else {
    // Có bảng -> chia nhỏ theo từng nhóm dòng
    const tieuDeHtml = [...parsed.body.children].filter(el=>el.tagName!=="TABLE").map(el=>el.outerHTML).join("");
    const theadHtml = bang.querySelector("thead") ? bang.querySelector("thead").outerHTML : "";
    const tatCaDong = [...bang.querySelectorAll("tbody tr")];
    const soNhom = Math.max(1, Math.ceil(tatCaDong.length / soHangMoiTrang));

    for(let i=0;i<soNhom;i++){
      const nhomDong = tatCaDong.slice(i*soHangMoiTrang, (i+1)*soHangMoiTrang).map(tr=>tr.outerHTML).join("");
      const laTrangDau = i===0;
      const tieuDeNhom = laTrangDau ? tieuDeHtml : `<p class="sub">(tiếp theo — nhóm ${i+1}/${soNhom})</p>`;
      const chanTrang = (i===soNhom-1) ? `<div class="footer">Xuất lúc: ${new Date().toLocaleString("vi-VN")} · ${tenFile}</div>` : "";
      const khoiHtml = `${tieuDeNhom}<table>${theadHtml}<tbody>${nhomDong}</tbody></table>${chanTrang}`;
      await chupKhoi(khoiHtml);
    }
  }

  // Ghép tất cả các khối đã chụp thành 1 tấm ảnh dài duy nhất (nối theo chiều dọc)
  const chieuRongChung = Math.max(...cacKhoiDaChup.map(c=>c.width));
  const tongChieuCao = cacKhoiDaChup.reduce((s,c)=>s+c.height,0);
  const anhGhep = document.createElement("canvas");
  anhGhep.width = chieuRongChung;
  anhGhep.height = tongChieuCao;
  const ctx = anhGhep.getContext("2d");
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,anhGhep.width,anhGhep.height);
  let yHienTai=0;
  for(const canvas of cacKhoiDaChup){
    ctx.drawImage(canvas,0,yHienTai);
    yHienTai += canvas.height;
  }

  return await new Promise(res=>anhGhep.toBlob(res,"image/png"));
}

// Xuất báo cáo: tạo file ẢNH (nội dung y hệt bản PDF trước đây) rồi chia sẻ dạng file
// (Zalo, Gmail, Messenger...) hoặc tải về máy nếu không chia sẻ trực tiếp được.
//
// QUAN TRỌNG: KHÔNG mở thêm tab/cửa sổ nào trong lúc xử lý. Mở thêm 1 tab (kể cả tab trắng
// "đang chuẩn bị...") sẽ đẩy tab hiện tại xuống làm việc "ở nền" — mà trình duyệt di động
// luôn cố tình làm chậm/tạm dừng các tab chạy nền để tiết kiệm pin, khiến việc tạo ảnh có
// thể bị "treo" vô thời hạn (kể cả các timeout cũng bị đóng băng theo). Toàn bộ xử lý ở đây
// vì vậy được giữ nguyên trên tab hiện tại — không có bất kỳ window.open() nào.
async function xuatPDF(htmlContent, tenFile="BaoCao"){
  let file=null;
  let loiTaoAnh=null;
  try{
    const timeoutMs = 25000;
    const blob = await Promise.race([
      taoAnhBaoCao(htmlContent, tenFile),
      new Promise((_, reject)=>setTimeout(()=>reject(new Error(`Quá ${timeoutMs/1000}s không phản hồi (có thể máy xử lý quá chậm với báo cáo này)`)), timeoutMs)),
    ]);
    if(blob) file=new File([blob], `${tenFile}_${new Date().toISOString().slice(0,10)}.png`, {type:"image/png"});
  }catch(e){
    loiTaoAnh = (e && (e.message||String(e))) || "Lỗi không rõ";
    console.error("Lỗi tạo ảnh báo cáo:", e);
  }

  if(!file){
    // Không mở tab nào nên alert() chắc chắn hiện ngay trên màn hình đang xem, không bị "mất tích".
    alert("Không tạo được ảnh báo cáo.\n\nLỗi: " + loiTaoAnh + "\n\nBạn có thể thử lại, hoặc dùng nút Xuất Excel thay thế.");
    return;
  }

  // Thử chia sẻ trực tiếp dạng file (Zalo/Gmail/Messenger...) nếu máy hỗ trợ
  let coHoTroChiaSeFile=false;
  try{ coHoTroChiaSeFile = !!(navigator.canShare && navigator.canShare({files:[file]})); }catch(e){ coHoTroChiaSeFile=false; }

  if(coHoTroChiaSeFile){
    try{
      await navigator.share({files:[file], title:tenFile, text:tenFile});
      return;
    }catch(e){
      // navigator.share thất bại (user hủy, hoặc quá lâu nên mất "quyền chia sẻ theo cú bấm")
      // -> không sao cả, tự động rơi xuống tải file về máy bên dưới thay vì báo lỗi.
      console.warn("navigator.share thất bại, chuyển sang tải file:", e);
    }
  }

  // Tải file ảnh về máy — luôn hoạt động, không phụ thuộc trạng thái "cử chỉ người dùng"
  // như window.open()/navigator.share(), nên đây là phương án chắc chắn nhất.
  const url=URL.createObjectURL(file);
  const a=document.createElement("a");
  a.href=url; a.download=file.name; a.click();
  URL.revokeObjectURL(url);
}

// Chia sẻ 1 phiếu GN dạng ẢNH — chụp đúng vùng nội dung phiếu (DOM element truyền vào)
// bằng html2canvas, rồi chia sẻ dạng FILE ẢNH qua Web Share API (Zalo/Messenger/Gmail...).
// Nếu máy không hỗ trợ chia sẻ file trực tiếp thì tự động tải ảnh về máy để người dùng tự gửi.
async function chiaSePhieuAnh(el, vp){
  if(!el){
    alert("Không tìm thấy nội dung phiếu để chụp ảnh.");
    return;
  }

  let file=null;
  try{
    const {default:html2canvas} = await import("html2canvas");
    const canvas = await html2canvas(el, {scale:2, backgroundColor:"#ffffff", useCORS:true});
    const blob = await new Promise(res=>canvas.toBlob(res,"image/png"));
    if(blob){
      const tenFile = `PhieuGN_${(vp.sp||"phieu").replace(/[^\w-]+/g,"_")}_${new Date().toISOString().slice(0,10)}.png`;
      file = new File([blob], tenFile, {type:"image/png"});
    }
  }catch(e){
    console.error("Lỗi chụp ảnh phiếu:", e);
  }

  if(!file){
    alert("Không tạo được ảnh phiếu.\nBạn có thể thử lại hoặc dùng nút 🖨 In phiếu.");
    return;
  }

  // Thử chia sẻ trực tiếp dạng file ảnh (Zalo/Gmail/Messenger...) nếu máy hỗ trợ
  let coHoTroChiaSeFile=false;
  try{ coHoTroChiaSeFile = !!(navigator.canShare && navigator.canShare({files:[file]})); }catch(e){ coHoTroChiaSeFile=false; }

  if(coHoTroChiaSeFile){
    try{
      await navigator.share({files:[file], title:`Phiếu ${vp.sp}`});
      return;
    }catch(e){
      if(e && e.name==="AbortError") return; // người dùng tự hủy hộp thoại chia sẻ
      console.warn("navigator.share thất bại, chuyển sang tải ảnh:", e);
    }
  }

  // Không chia sẻ trực tiếp được -> tải ảnh về máy để người dùng tự gửi qua Zalo/Messenger...
  const url=URL.createObjectURL(file);
  const a=document.createElement("a");
  a.href=url; a.download=file.name; a.click();
  URL.revokeObjectURL(url);
  alert("📥 Đã tải ảnh phiếu về máy (trình duyệt không hỗ trợ chia sẻ trực tiếp).\nBạn có thể gửi ảnh này qua Zalo/Messenger...");
}

// Nút xuất dùng chung
function ExportBar({onExcel, onPDF, shareTitle="", shareText="", label="", fluid=false, compact=false}){
  const [busy, setBusy] = useState(false);
  const {t} = useLang();
  const s=fluid
    ? {border:"1.5px solid",borderRadius:12,cursor:"pointer",fontFamily:"inherit",fontWeight:800,fontSize:compact?11:12.5,padding:compact?"11px 6px":"11px 10px",display:"flex",alignItems:"center",justifyContent:"center",gap:compact?4:6,flex:1,minWidth:0,whiteSpace:"nowrap"}
    : {border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,padding:"6px 13px",display:"flex",alignItems:"center",gap:5};

  const handleClick = async () => {
    setBusy(true);
    try { await onPDF(); } finally { setBusy(false); }
  };

  return(
    <div style={{display:"flex",gap:fluid?(compact?6:10):6,alignItems:"center",width:fluid?"auto":"auto",flex:fluid?2:"none",minWidth:0}}>
      {label&&<span style={{fontSize:11,color:"#6b7280",fontWeight:600}}>{label}</span>}
      <button onClick={onExcel} style={{...s,background:"#f0fdf4",color:"#16a34a",borderColor:"#bbf7d0"}}>
        <span>📊</span> <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{compact?"Excel":t("btnExcel")}</span>
      </button>
      <button onClick={handleClick} disabled={busy} style={{...s,background:busy?"#ede9fe":"#fff7ed",color:busy?"#6d28d9":"#c2410c",borderColor:busy?"#c4b5fd":"#fed7aa",transition:"all .2s",opacity:busy?0.75:1}}>
        <span>{busy?"⏳":"🖼️🔗"}</span> <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{busy?"...":(compact?"Chia sẻ":t("btnPdfShare"))}</span>
      </button>
    </div>
  );
}

// 🚨 Modal soạn & gửi "Báo khẩn cấp" — cho phép bỏ bớt mã, ghi chú, chọn đơn vị nhận,
// gửi song song 2 nơi: (1) lưu vào Supabase để hiện trong 🔔 app của đơn vị nhận,
// (2) mở Web Share API (Zalo/SMS/Email/Messenger...) để gửi ra ngoài ngay lập tức.
function KhanCapModal({items, proj, donViOptions, onClose, onSubmit, preSelectMa, activeLine}){
  const [checked,setChecked]=useState(()=>preSelectMa
    ? Object.fromEntries(items.map(v=>[v.ma, v.ma===preSelectMa]))
    : Object.fromEntries(items.map(v=>[v.ma,true])));
  const [ghiChu,setGhiChu]=useState("");
  const [donViChon,setDonViChon]=useState([]);
  const [sending,setSending]=useState(false);
  const inp={width:"100%",padding:"8px 10px",border:"1.5px solid #fecaca",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#fff"};
  const chosenItems=items.filter(v=>checked[v.ma]);
  const toggleDv=dv=>setDonViChon(s=>s.includes(dv)?s.filter(x=>x!==dv):[...s,dv]);
  const submit=async()=>{
    if(chosenItems.length===0){alert("Chọn ít nhất 1 mã vật tư!");return;}
    if(donViChon.length===0){alert("Chọn ít nhất 1 đơn vị nhận!");return;}
    setSending(true);
    try{ await onSubmit(chosenItems,ghiChu,donViChon); onClose(); }
    finally{ setSending(false); }
  };
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200}}/>
      <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:201,background:"#fff",borderRadius:"18px 18px 0 0",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 -6px 24px rgba(0,0,0,0.25)"}}>
        <div style={{padding:"16px 18px 10px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:20}}>🚨</span>
          <div style={{fontWeight:800,fontSize:15,color:"#b91c1c"}}>Báo khẩn cấp — Vật tư thiếu gấp</div>
          <button onClick={onClose} style={{marginLeft:"auto",border:"none",background:"none",fontSize:18,color:"#9ca3af",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:"14px 18px",flex:1}}>
          {(()=>{const nh=nhanDongXe(activeLine);return(
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:nh.nen,color:nh.mau,border:`1.5px solid ${nh.mau}33`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:800,marginBottom:10}}>
              {nh.icon} {nh.text}
            </div>
          );})()}
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Dự án: <b style={{color:"#111827"}}>{proj?.icon} {proj?.ten}</b></div>
          <div style={{fontWeight:700,fontSize:12,color:"#374151",marginBottom:6}}>Danh sách mã vật tư ({chosenItems.length}/{items.length} chọn)</div>
          <div style={{border:"1px solid #fecaca",borderRadius:10,overflow:"hidden",marginBottom:14}}>
            {items.map((v,i)=>(
              <label key={v.ma} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderBottom:i<items.length-1?"1px solid #fef2f2":"none",background:checked[v.ma]?"#fff":"#f9fafb",cursor:"pointer"}}>
                <input type="checkbox" checked={!!checked[v.ma]} onChange={()=>setChecked(c=>({...c,[v.ma]:!c[v.ma]}))}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#374151"}}>{v.ma} <span style={{fontWeight:400,color:"#6b7280"}}>— {v.ten}</span></div>
                  <div style={{fontSize:10,color:"#b45309"}}>Cần {fmt(v.can)} {v.dv} · đã giao {fmt(v.daGiao||0)} · còn thiếu <b>{fmt(v.conThieu)}</b> {v.dv}</div>
                </div>
              </label>
            ))}
          </div>
          <div style={{fontWeight:700,fontSize:12,color:"#374151",marginBottom:6}}>Ghi chú thêm (tùy chọn)</div>
          <textarea value={ghiChu} onChange={e=>setGhiChu(e.target.value)} placeholder="VD: Cần gấp trước 14h chiều nay để kịp ráp xe..." rows={3} style={{...inp,marginBottom:14,resize:"vertical"}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{fontWeight:700,fontSize:12,color:"#374151"}}>Gửi đến đơn vị nào? ({donViChon.length}/{donViOptions.length} chọn)</div>
            <button type="button" onClick={()=>setDonViChon(s=>s.length===donViOptions.length?[]:[...donViOptions])}
              style={{border:"none",background:"none",color:"#dc2626",fontWeight:700,fontSize:11.5,cursor:"pointer",padding:"2px 0"}}>
              {donViChon.length===donViOptions.length?"Bỏ chọn tất cả":"Chọn tất cả"}
            </button>
          </div>
          {/* ✅ Dạng tích chọn (ô vuông) thay vì nút bo tròn — mỗi đơn vị 1 dòng riêng, xếp dọc
              cho vừa màn hình mobile (không bị wrap lệch dòng như dạng pill trước đây). Danh
              sách LUÔN lấy từ donViOptions (tự động cập nhật khi Admin thêm đơn vị mới ở "👥
              Người dùng"), và được sắp xếp theo alphabet tiếng Việt (sortAZ) để đơn vị mới thêm
              sau tự chèn đúng vị trí — không cần sửa code khi có thêm đơn vị mới. Container có
              maxHeight + cuộn riêng để danh sách dài (nhiều đơn vị) không đẩy nút "Gửi" ra ngoài
              màn hình. */}
          <div style={{border:"1px solid #fecaca",borderRadius:10,overflow:"hidden",marginBottom:6,maxHeight:220,overflowY:"auto"}}>
            {[...donViOptions].sort((a,b)=>a.localeCompare(b,"vi")).map((dv,i,arr)=>(
              <label key={dv} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderBottom:i<arr.length-1?"1px solid #fef2f2":"none",background:donViChon.includes(dv)?"#fef2f2":"#fff",cursor:"pointer"}}>
                <input type="checkbox" checked={donViChon.includes(dv)} onChange={()=>toggleDv(dv)}/>
                <div style={{flex:1,minWidth:0,fontSize:12.5,fontWeight:700,color:donViChon.includes(dv)?"#b91c1c":"#374151"}}>{dv}</div>
              </label>
            ))}
          </div>
        </div>
        <div style={{padding:"12px 18px",borderTop:"1px solid #f1f5f9",display:"flex",gap:10,flexShrink:0}}>
          <button onClick={onClose} style={{flex:1,border:"1px solid #e5e7eb",background:"#fff",color:"#374151",borderRadius:12,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>Hủy</button>
          <button onClick={submit} disabled={sending} style={{flex:2,border:"none",background:sending?"#fca5a5":"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",borderRadius:12,padding:"12px 0",fontWeight:800,fontSize:13,cursor:sending?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {sending?"⏳ Đang gửi...":"🚨 Gửi báo khẩn cấp"}
          </button>
        </div>
      </div>
    </>
  );
}

// 🔔 Modal xem danh sách "Báo khẩn cấp" đã nhận/đã gửi — tự đánh dấu đã đọc khi mở lên.
function CanhBaoListModal({list, user, onClose, onMarkRead, onReply, onMarkReplySeen}){
  const [replyOpenId,setReplyOpenId]=useState(null);
  const [replyText,setReplyText]=useState("");
  useEffect(()=>{
    list.forEach(c=>{
      if((c.don_vi_nhan||[]).includes(user.don_vi)&&!(c.doc_boi||[]).includes(user.don_vi)){
        onMarkRead(c.id,user.don_vi);
      }
      // 💬 Nếu đơn vị mình CHƯA XEM phản hồi mới nhất của cảnh báo này (dù mình là người gửi gốc
      // hay 1 trong các đơn vị nhận) → đánh dấu đã xem khi mở 🔔. Áp dụng cho MỌI lượt phản hồi
      // liên tiếp: mỗi khi có phản hồi mới, đơn vị mình lại được thêm lại vào danh sách chưa xem.
      if((c.phan_hoi_chua_doc||[]).includes(user.don_vi)&&onMarkReplySeen){
        onMarkReplySeen(c.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200}}/>
      <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:201,background:"#fff",borderRadius:"18px 18px 0 0",maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 -6px 24px rgba(0,0,0,0.25)"}}>
        <div style={{padding:"16px 18px 10px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:20}}>🔔</span>
          <div style={{fontWeight:800,fontSize:13,letterSpacing:0.4,textTransform:"uppercase",color:"#fff",background:"linear-gradient(135deg,#ef4444,#b91c1c)",borderRadius:999,padding:"6px 14px",boxShadow:"0 2px 6px rgba(239,68,68,0.35)"}}>Cảnh báo khẩn cấp</div>
          <button onClick={onClose} style={{marginLeft:"auto",border:"none",background:"none",fontSize:18,color:"#9ca3af",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:"12px 14px",flex:1}}>
          {list.length===0&&<div style={{textAlign:"center",color:"#9ca3af",padding:40,fontSize:13}}>Chưa có cảnh báo khẩn cấp nào.</div>}
          {list.map(c=>{
            const nh=nhanDongXe(c.dong_xe);
            const coPhanHoiMoi = (c.phan_hoi_chua_doc||[]).includes(user.don_vi);
            return(
            <div key={c.id} style={{border:coPhanHoiMoi?"1.5px solid #f59e0b":"1px solid #fecaca",background:"#fff7f7",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:4,background:nh.nen,color:nh.mau,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:800}}>
                  {nh.icon} {nh.text}
                </span>
                {coPhanHoiMoi&&<span style={{display:"inline-flex",alignItems:"center",gap:3,background:"#fef3c7",color:"#92400e",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:800}}>🆕 Phản hồi mới</span>}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
                <div style={{fontWeight:800,fontSize:12,color:"#b91c1c"}}>🚨 {c.ten_du_an}</div>
                <div style={{fontSize:10,color:"#9ca3af",whiteSpace:"nowrap",flexShrink:0}}>{c.ts?new Date(c.ts).toLocaleString("vi-VN"):""}</div>
              </div>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>Từ: <b>{c.nguoi_gui}</b> ({c.don_vi_gui}) → {(c.don_vi_nhan||[]).join(", ")}</div>
              <div style={{fontSize:12,color:"#374151"}}>
                {(c.danh_sach||[]).map((v,i)=>(
                  <div key={i}>• <b>{v.ma}</b> — {v.ten}: thiếu <b style={{color:"#b45309"}}>{fmt(v.conThieu)} {v.dv}</b></div>
                ))}
              </div>
              {c.ghi_chu&&<div style={{marginTop:6,fontSize:15,fontWeight:800,fontStyle:"italic",color:"#dc2626"}}>"{c.ghi_chu}"</div>}
              {(c.phan_hoi||[]).length>0&&(
                <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed #fca5a5",display:"flex",flexDirection:"column",gap:6}}>
                  {(c.phan_hoi||[]).map((r,i)=>(
                    <div key={i} style={{fontSize:11,background:"#fff",border:"1px solid #f3d4d4",borderRadius:8,padding:"6px 8px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:6}}>
                        <b style={{color:"#1d4ed8"}}>{r.nguoi} ({r.don_vi})</b>
                        <span style={{color:"#9ca3af",whiteSpace:"nowrap",fontSize:10}}>{r.ts?new Date(r.ts).toLocaleString("vi-VN"):""}</span>
                      </div>
                      <div style={{color:"#374151",marginTop:2}}>{r.noi_dung}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{marginTop:8,display:"flex",gap:6}}>
                {replyOpenId===c.id?(
                  <>
                    <input autoFocus value={replyText} onChange={e=>setReplyText(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&replyText.trim()){onReply(c,replyText.trim());setReplyText("");setReplyOpenId(null);}}}
                      placeholder="Nhập phản hồi..." style={{flex:1,border:"1.5px solid #fca5a5",borderRadius:8,padding:"6px 10px",fontSize:12,outline:"none"}}/>
                    <button onClick={()=>{if(replyText.trim()){onReply(c,replyText.trim());setReplyText("");setReplyOpenId(null);}}}
                      style={{border:"none",background:"#dc2626",color:"#fff",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Gửi</button>
                    <button onClick={()=>{setReplyOpenId(null);setReplyText("");}}
                      style={{border:"1px solid #e5e7eb",background:"#fff",color:"#6b7280",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer"}}>Hủy</button>
                  </>
                ):(
                  <button onClick={()=>{setReplyOpenId(c.id);setReplyText("");}}
                    style={{border:"1px solid #dc2626",background:"#fff",color:"#dc2626",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>↩ Phản hồi</button>
                )}
              </div>
            </div>
            );})}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🔔 CHUÔNG CẢNH BÁO KHẨN CẤP TOÀN CỤC (GlobalCanhBaoBell)
// ═══════════════════════════════════════════════════════════════
// Chuông "cố định" — độc lập với dòng xe (activeLine) đang chọn và độc lập với việc đã vào
// "Hệ thống chính" (App) hay chưa. Tự đọc dữ liệu SONG SONG từ CẢ 3 bảng cảnh báo khẩn cấp
// (canh_bao_khan / canh_bao_khan_citybus / canh_bao_khan_12m) theo đúng đơn vị (don_vi) của
// tài khoản đang đăng nhập, rồi gộp lại 1 danh sách duy nhất — nhờ vậy dù người dùng đang ở
// màn "Chọn dòng xe", "Chọn trạng thái dự án" hay bất kỳ trang nào có gắn component này, đều
// thấy đầy đủ cảnh báo của MỌI dòng xe liên quan đến đơn vị mình, không riêng dòng đang mở.
// Tự làm mới định kỳ (poll) để cập nhật số chưa đọc mà không cần người dùng bấm gì.
const CANH_BAO_BANG_THEO_DONG_XE = [
  {dong_xe:"minibus", table:"canh_bao_khan"},
  {dong_xe:"citybus", table:"canh_bao_khan_citybus"},
  {dong_xe:"12m",     table:"canh_bao_khan_12m"},
];
function GlobalCanhBaoBell({donVi, ten, style, pollMs=20000}){
  const [list,setList]=useState([]);
  const [showList,setShowList]=useState(false);

  const taiDuLieu=useCallback(async()=>{
    if(!donVi) return;
    try{
      const ketQua=await Promise.all(CANH_BAO_BANG_THEO_DONG_XE.map(async(b)=>{
        try{
          const {data,error}=await supabase.from(b.table).select("*").order("ts",{ascending:false}).range(0,999);
          if(error) return [];
          return (data||[]).map(r=>({...r,_tbl:b.table}));
        }catch{ return []; }
      }));
      const gop=ketQua.flat().filter(c=>(c.don_vi_nhan||[]).includes(donVi)||c.don_vi_gui===donVi);
      gop.sort((a,b)=>new Date(b.ts||0)-new Date(a.ts||0));
      setList(gop);
    }catch(e){ console.error("GlobalCanhBaoBell taiDuLieu:",e); }
  },[donVi]);

  useEffect(()=>{
    taiDuLieu();
    const iv=setInterval(taiDuLieu,pollMs);
    return ()=>clearInterval(iv);
  },[taiDuLieu,pollMs]);

  // Mở lại danh sách → làm mới ngay để chắc chắn thấy cảnh báo mới nhất
  const moDanhSach=()=>{ taiDuLieu(); setShowList(true); };

  const chuaDoc=list.filter(c=>{
    const laNguoiNhanChuaDoc=(c.don_vi_nhan||[]).includes(donVi)&&!(c.doc_boi||[]).includes(donVi);
    const laLienQuanCoPhanHoiChuaXem=((c.don_vi_nhan||[]).includes(donVi)||c.don_vi_gui===donVi)&&(c.phan_hoi_chua_doc||[]).includes(donVi);
    return laNguoiNhanChuaDoc||laLienQuanCoPhanHoiChuaXem;
  }).length;

  const onMarkRead=async(id,dv)=>{
    const cb=list.find(c=>c.id===id);
    if(!cb||(cb.doc_boi||[]).includes(dv))return;
    const docBoiMoi=[...(cb.doc_boi||[]),dv];
    setList(cs=>cs.map(c=>c.id===id?{...c,doc_boi:docBoiMoi}:c));
    try{ await supabase.from(cb._tbl).update({doc_boi:docBoiMoi}).eq("id",id); }catch(e){console.error("GlobalCanhBaoBell onMarkRead:",e);}
  };

  const onReply=async(cb,noiDung)=>{
    const reply={nguoi:ten||donVi, don_vi:donVi, noi_dung:noiDung, ts:new Date().toISOString()};
    const phanHoiMoi=[...(cb.phan_hoi||[]),reply];
    const donViLienQuan=Array.from(new Set([cb.don_vi_gui,...(cb.don_vi_nhan||[])].filter(Boolean)));
    const phanHoiChuaDoc=donViLienQuan.filter(dv=>dv!==donVi);
    setList(cs=>cs.map(c=>c.id===cb.id?{...c,phan_hoi:phanHoiMoi,phan_hoi_chua_doc:phanHoiChuaDoc}:c));
    try{
      await supabase.from(cb._tbl).update({phan_hoi:phanHoiMoi,phan_hoi_chua_doc:phanHoiChuaDoc}).eq("id",cb.id);
    }catch(e){console.error("GlobalCanhBaoBell onReply:",e);}
  };

  const onMarkReplySeen=async(id)=>{
    const cb=list.find(c=>c.id===id);
    if(!cb||!(cb.phan_hoi_chua_doc||[]).includes(donVi))return;
    const chuaDocMoi=(cb.phan_hoi_chua_doc||[]).filter(dv=>dv!==donVi);
    setList(cs=>cs.map(c=>c.id===id?{...c,phan_hoi_chua_doc:chuaDocMoi}:c));
    try{ await supabase.from(cb._tbl).update({phan_hoi_chua_doc:chuaDocMoi}).eq("id",id); }catch(e){console.error("GlobalCanhBaoBell onMarkReplySeen:",e);}
  };

  if(!donVi) return null;

  return(
    <>
      <div onClick={moDanhSach} title="Cảnh báo khẩn cấp"
        style={{position:"relative",width:36,height:36,borderRadius:"50%",background:chuaDoc>0?"rgba(220,38,38,0.22)":"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:chuaDoc>0?"1.5px solid #fca5a5":"1.5px solid rgba(255,255,255,0.3)",...style}}>
        <KlIconBell size={19} color={chuaDoc>0?"#fca5a5":"#e5e7eb"}/>
        {chuaDoc>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#dc2626",color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>{chuaDoc>9?"9+":chuaDoc}</span>}
      </div>
      {showList&&(
        <CanhBaoListModal
          list={list}
          user={{don_vi:donVi, ten:ten||donVi}}
          onClose={()=>setShowList(false)}
          onMarkRead={onMarkRead}
          onReply={onReply}
          onMarkReplySeen={onMarkReplySeen}
        />
      )}
    </>
  );
}

function AnhModal({src,onClose}){
  if(!src)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,cursor:"zoom-out"}}>
      <img src={src} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8}} onClick={e=>e.stopPropagation()}/>
      <button onClick={onClose} style={{position:"absolute",top:16,right:20,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",fontSize:22,cursor:"pointer",borderRadius:"50%",width:36,height:36}}>✕</button>
    </div>
  );
}

function Prog({p,done,h=8}){
  const c=done?"#16a34a":p>60?"#f59e0b":"#ef4444";
  return(
    <div style={{flex:1,height:h,background:"#e5e7eb",borderRadius:99,overflow:"hidden"}}>
      <div style={{width:`${p}%`,height:"100%",background:c,borderRadius:99,transition:"width .3s"}}/>
    </div>
  );
}

// ✅ Ô nhập SL dạng stepper (−/+) dễ bấm trên điện thoại.
// Cho phép XOÁ HẲN số (kể cả số 0) để gõ số mới: giá trị hiển thị trong ô là state
// chữ (raw) cục bộ, chỉ "chốt" (parse + báo lên cha qua onChange) khi bấm nút −/+ hoặc
// khi rời khỏi ô (onBlur) — không ép về 0 ngay khi người dùng đang gõ dở.
function SlStepper({value,onChange,warn}){
  const [raw,setRaw]=useState(String(value));
  useEffect(()=>{ setRaw(String(value)); },[value]);
  const commit=(s)=>{
    const n=s===""?0:Math.max(0,parseInt(s,10)||0);
    setRaw(String(n));
    if(n!==value)onChange(n);
  };
  const step=(d)=>{
    const cur=raw===""?0:(parseInt(raw,10)||0);
    const n=Math.max(0,cur+d);
    setRaw(String(n));
    onChange(n);
  };
  const bd=warn?"#f59e0b":"#c7d2fe";
  const bg=warn?"#fffbeb":"#f0f4ff";
  const cl=warn?"#92400e":"#1d4ed8";
  return(
    <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",border:`1.5px solid ${bd}`,borderRadius:8,overflow:"hidden",background:bg,height:30}}>
      <button type="button" onClick={()=>step(-1)}
        style={{width:26,height:"100%",border:"none",borderRight:`1px solid ${bd}`,background:"transparent",color:cl,fontSize:16,fontWeight:700,cursor:"pointer",touchAction:"manipulation"}}>−</button>
      <input
        type="text" inputMode="numeric" pattern="[0-9]*"
        value={raw}
        onChange={e=>setRaw(e.target.value.replace(/[^0-9]/g,""))}
        onBlur={()=>commit(raw)}
        onFocus={e=>e.target.select()}
        style={{width:36,textAlign:"center",border:"none",outline:"none",background:"transparent",fontSize:13,fontWeight:700,color:cl,fontFamily:"inherit",padding:0}}/>
      <button type="button" onClick={()=>step(1)}
        style={{width:26,height:"100%",border:"none",borderLeft:`1px solid ${bd}`,background:"transparent",color:cl,fontSize:16,fontWeight:700,cursor:"pointer",touchAction:"manipulation"}}>+</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ✅ HOOK DÙNG CHUNG: "useManualOverride" — giữ nguyên MỌI vị trí/lựa chọn người
// dùng đã TỰ TAY chọn (1 mục, 1 tab con, 1 bộ lọc...) ngay cả khi app tự làm mới
// dữ liệu ngầm định kỳ (poll mỗi 10-20s) ở BẤT KỲ đâu trong ứng dụng.
//
// VẤN ĐỀ GỐC: nhiều nơi trong app có logic "tự đồng bộ theo dữ liệu mới nhất"
// (VD: tab con "Báo cáo" tự nhảy theo trạng thái dự án). Nếu logic đó chạy lại
// mỗi khi dữ liệu NỀN được tải mới (dù nội dung không đổi, chỉ đổi tham chiếu),
// nó sẽ ÂM THẦM GHI ĐÈ lựa chọn tay của người dùng — gây cảm giác "tự nhảy về
// chỗ cũ sau vài giây" dù người dùng không hề bấm gì.
//
// CÁCH DÙNG: gọi 1 lần cho mỗi "nhóm vị trí" cần bảo vệ (VD: trang con Báo cáo,
// tab lọc, mục đang xem...). Ghép với 1 "khoá" đại diện cho NGỮ CẢNH đang xem
// (thường là id của dự án/đối tượng đang chọn — vì đổi ngữ cảnh thì các lựa chọn
// tay cũ không còn ý nghĩa, cần tự tính lại từ đầu):
//
//   const bcNav = useManualOverride();
//   ...
//   useEffect(()=>{
//     if(bcNav.isManual(pid)) return;              // người dùng đã tự chọn cho ĐÚNG ngữ cảnh này — giữ nguyên
//     setBcSubTab(tinhTuDong());                    // chỉ tự đồng bộ khi CHƯA có lựa chọn tay
//   },[pid, ...]);
//   ...
//   <button onClick={()=>{bcNav.markManual(pid); setBcSubTab("done");}}>...</button>
//
// Lựa chọn tay chỉ hết hiệu lực khi NGỮ CẢNH (khoá) thực sự đổi (VD: người dùng
// chuyển sang xem 1 dự án khác) — lúc đó cơ chế tự đồng bộ sẽ hoạt động lại bình
// thường cho ngữ cảnh mới, không bị "kẹt" mãi theo lựa chọn của ngữ cảnh cũ.
function useManualOverride(){
  const ref=useRef(null);
  const isManual=(key)=>ref.current===key;
  const markManual=(key)=>{ ref.current=key; };
  const clear=()=>{ ref.current=null; };
  return {isManual,markManual,clear};
}
// ════════════════════════════════════════════════════════════════════════════

export default function App(){
  const I=S=>S.inp; // shorthand for style
  const B=S=>S.btn;

  // ✅ FIX: một số tiện ích mở rộng trình duyệt (từ điển y khoa, dịch thuật, gõ tiếng Việt...)
  // tự động quét chữ trên MỌI trang web và thay các từ viết tắt trùng khớp bằng nghĩa đầy đủ
  // của chúng — ví dụ "CKD" (viết tắt nội bộ của mình cho nguồn vật tư) trùng với "CKD" =
  // "Chronic Kidney Disease" trong y khoa nên bị 1 số tiện ích tự đổi thành "Bệnh thận mãn
  // tính" ngay trên màn hình người dùng. Đây KHÔNG phải lỗi ở code/font của app, mà do phần
  // mềm chạy ở tầng trình duyệt chỉnh sửa lại DOM sau khi trang đã hiển thị.
  // → Giải pháp: 1 effect DUY NHẤT chạy 1 lần ở gốc App, tự động chèn ký tự "vô hình"
  // (zero-width space, mắt người không thấy, không ảnh hưởng bố cục/copy-paste) xen giữa các
  // chữ cái của những từ viết tắt nhạy cảm, phá vỡ chuỗi ký tự mà các tiện ích đó tìm-thay-thế,
  // trong khi người dùng vẫn đọc thấy đúng "CKD" bình thường. Áp dụng cho TOÀN BỘ trang (kể cả
  // nội dung được render động sau này) nhờ MutationObserver theo dõi mọi thay đổi DOM.
  useEffect(()=>{
    const ZW="\u200B"; // zero-width space — vô hình, không đổi cách hiển thị hay khi copy ra vẫn đọc đúng chữ
    const SHIELD_WORDS=["CKD"]; // thêm từ khác vào đây nếu sau này phát hiện bị thay nghĩa tương tự
    const RE=new RegExp("\\b("+SHIELD_WORDS.join("|")+")\\b","g");
    const SKIP_TAGS=new Set(["SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT"]);

    const shieldTextNode=(tn)=>{
      const p=tn.parentNode;
      if(!p||SKIP_TAGS.has(p.tagName)) return;
      const v=tn.nodeValue;
      if(v&&RE.test(v)){
        RE.lastIndex=0;
        tn.nodeValue=v.replace(RE,(m)=>m.split("").join(ZW));
      }
    };
    const shieldSubtree=(root)=>{
      if(root.nodeType===Node.TEXT_NODE){ shieldTextNode(root); return; }
      if(root.nodeType!==Node.ELEMENT_NODE) return;
      if(SKIP_TAGS.has(root.tagName)) return;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
        acceptNode:n=>SKIP_TAGS.has(n.parentNode?.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
      });
      let n; while(n=walker.nextNode()) shieldTextNode(n);
    };

    shieldSubtree(document.body);
    const obs=new MutationObserver(muts=>{
      for(const m of muts){
        if(m.type==="characterData") shieldTextNode(m.target);
        else for(const node of m.addedNodes) shieldSubtree(node);
      }
    });
    obs.observe(document.body,{childList:true,subtree:true,characterData:true});
    return ()=>obs.disconnect();
  },[]);

  const inp={width:"100%",padding:"7px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f0f4ff",boxShadow:"0 1px 4px rgba(99,102,241,0.08)",transition:"border-color .15s,box-shadow .15s"};
  const btn={border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 11px"};
  // ✅ Đăng xuất dùng CHUNG cho cả 3 màn hình độc lập (Khởi tạo Dự án/Tổng Quan/Đã thực hiện)
  // qua <ScreenTopBar/> — áp dụng như nhau cho mọi dòng xe (Mini Bus/City Bus/12M).
  const handleLogoutScreenDocLap=()=>{
    if(window.confirm("Đăng xuất?")){
      try{localStorage.removeItem("loggedInUser");localStorage.removeItem("screenMode");}catch{}
      setUser(null);setShowTongQuan(false);setShowKhoiTao(false);setShowDaThucHien(false);
    }
  };

  // ── State ──
  const [lang, setLang] = useState(()=>localStorage.getItem("appLang")||"vi");
  const setLangSaved = l=>{setLang(l);localStorage.setItem("appLang",l);};
  const t = k => (APP_I18N[k]&&APP_I18N[k][lang]) || APP_I18N[k]?.vi || k;
  const [user,     setUser]     = useState(()=>{try{const s=localStorage.getItem("loggedInUser");return s?JSON.parse(s):null;}catch{return null;}});   // logged-in user
  // ─── Dòng xe đang hoạt động (12m / citybus / minibus) ───────────────────────
  // ⚠️ Toàn bộ dữ liệu "vật tư" (dự án, BOM, phiếu giao nhận, lịch sử, BOM mẫu...)
  // được TÁCH RIÊNG theo dòng xe bằng cách đổi tên bảng Supabase qua hàm T() bên dưới.
  // "minibus" giữ NGUYÊN tên bảng gốc (không hậu tố) để không ảnh hưởng dữ liệu cũ đã có.
  // Các dòng khác (vd. "citybus") dùng bảng riêng "<tên_bảng>_<dòng_xe>" — hoạt động
  // HOÀN TOÀN ĐỘC LẬP, không đọc/ghi chung với dữ liệu Mini Bus.
  // Tài khoản (users) và phân quyền dòng xe (quyen_dong_xe) vẫn dùng CHUNG 1 bảng vì đây
  // là dữ liệu định danh/quyền hạn toàn công ty, không thuộc riêng dòng xe nào.
  const [activeLine, setActiveLine] = useState(()=>{try{return localStorage.getItem("activeLine")||"minibus";}catch{return "minibus";}});
  const T = useCallback((base)=> (activeLine && activeLine!=="minibus") ? `${base}_${activeLine}` : base, [activeLine]);
  // ✅ "Tổng quan" giờ là MÀN HÌNH ĐỘC LẬP (không nằm trong thanh tab) — hiển thị ngay sau khi
  // chọn "Đang thực hiện" ở màn đăng nhập. showTongQuan=true → chỉ render riêng màn hình này.
  // ✅ FIX: Lưu màn hình hiện tại (screenMode) vào localStorage — khi refresh (F5), app phải ở
  // ĐÚNG màn hình đang xem (Khởi tạo Dự án / Tổng quan / hệ thống chính), không tự thoát ra
  // màn khác.
  const [showTongQuan, setShowTongQuan] = useState(()=>{try{return localStorage.getItem("screenMode")==="tongQuan";}catch{return false;}});
  // ✅ "Khởi tạo Dự án" (Giai đoạn 01) — MÀN HÌNH ĐỘC LẬP riêng, gắn thẳng form "Thêm dự án"
  // ngay tại đây (không cần vào hệ thống chính rồi mở modal như trước). Sau khi tạo dự án
  // xong (mkProj chạy xong) sẽ tự động chuyển sang màn "Đang thực hiện" (showTongQuan=true).
  const [showKhoiTao, setShowKhoiTao] = useState(()=>{try{return localStorage.getItem("screenMode")==="khoiTao";}catch{return false;}});
  // ✅ "Đã thực hiện" (Giai đoạn 03) — MÀN HÌNH ĐỘC LẬP hiển thị các dự án đã bấm "Hoàn thành",
  // dạng thẻ trong bảng, dự án hoàn thành GẦN NHẤT luôn ở STT 1.
  const [showDaThucHien, setShowDaThucHien] = useState(()=>{try{return localStorage.getItem("screenMode")==="daThucHien";}catch{return false;}});
  // Bấm "← Trở về" trên Tổng quan → quay lại BƯỚC 3 (chọn trạng thái dự án) của màn đăng nhập,
  // KHÔNG bắt đăng nhập lại (xem prop "resume" của LoginScreen).
  // ✅ FIX: backToGate trước đây chỉ là state trong bộ nhớ (không lưu localStorage) — khi
  // người dùng bấm "← Trở về" để lùi về màn "Chọn trạng thái dự án" (LoginScreen bước "project")
  // rồi F5, backToGate reset về false trong khi "user" vẫn còn trong localStorage, khiến điều
  // kiện `!user || backToGate` sai và app nhảy thẳng vào hệ thống chính thay vì ở lại đúng màn
  // đang xem. Nay đọc/ghi backToGate qua localStorage giống các screenMode khác để F5 giữ đúng
  // màn hình.
  const [backToGate, setBackToGate] = useState(()=>{try{return localStorage.getItem("screenMode")==="gate";}catch{return false;}});
  // ✅ Màn "Tổng quan": mở/đóng bảng chi tiết vật tư khi bấm "SL đã nhận" / "SL thiếu"
  // trong khối THCK/CKD. nguon: "THCK"|"CKD"|"" (đóng). field: "done"|"thieu".
  const [tqVtOpen, setTqVtOpen] = useState({nguon:"", field:""});
  const tqVtRef = useRef(null); // vùng chi tiết vật tư đang mở, dùng để chụp ảnh "Xuất & chia sẻ"
  const [tqDangChiaSe, setTqDangChiaSe] = useState(false);
  const [tqDangXuatExcel, setTqDangXuatExcel] = useState(false);
  // Chi tiết đang mở trong bảng "Đã thực hiện" (Giai đoạn 03) khi bấm vào ô SL xe/Đã giao/Đã nhận
  // {pid, kind:"xe"|"giao"|"nhan", nguon?:"THCK"|"CKD"}
  const [dtOpenDaTH, setDtOpenDaTH] = useState(null);
  // ✅ Modal "GHI NHẬN GIAO XE" — thay thế hộp thoại prompt() cũ khi bấm "✎ Bấm để sửa" ở
  // khối "Tiến độ giao xe". gxModalPid = id dự án đang ghi nhận (null = đóng modal).
  const [gxModalPid, setGxModalPid] = useState(null);
  const [gxForm, setGxForm] = useState({sop:"", ngayGiao:"", hoVaTen:"", slXe:1});
  const [gxNow, setGxNow] = useState(new Date());
  const [showGiaoXeChiTiet, setShowGiaoXeChiTiet] = useState(false);
  const [users,    setUsers]    = useState(USERS_DEF);
  const [lineQuyen,setLineQuyen]= useState(LINE_QUYEN_DEFAULT); // phân quyền dòng xe theo đơn vị
  const [tabQuyen, setTabQuyen] = useState({}); // phân quyền chức năng (tab) theo đơn vị — rỗng = dùng TAB_QUYEN_DEFAULT
  // 🖼️ CMS — nội dung / banner / ảnh đại diện, CHỈ tài khoản "admin" được xem & chỉnh sửa
  // (xem tab "cms" được tự thêm riêng cho admin ở TABS_NOW, và bảng Supabase "cms_content"):
  //   CREATE TABLE cms_content (
  //     id text primary key, loai text not null,      -- 'noi_dung' | 'banner' | 'banner_header' | 'avatar'
  //     tieu_de text, mo_ta text, anh text, lien_ket text,
  //     thu_tu integer default 0, an_hien boolean default true, updated_at timestamptz default now()
  //   );
  const [cmsItems, setCmsItems] = useState([]);
  // ✅ Banner đầu trang chọn dòng xe (đăng nhập) — lấy từ CMS (loai:"banner_header", đang áp
  // dụng, "Thứ tự hiển thị" nhỏ nhất). Rỗng ("") nếu admin chưa cấu hình → LoginScreen sẽ tự
  // dùng ảnh mặc định (KL_BANNER_B64). Nhờ vậy đổi banner chỉ cần vào tab CMS chọn ảnh mới,
  // KHÔNG cần sửa code.
  const headerBannerUrl = cmsItems
    .filter(it=>it.loai==="banner_header" && it.an_hien && it.anh)
    .sort((a,b)=>(a.thu_tu||0)-(b.thu_tu||0))[0]?.anh || "";
  const [dbErr,    setDbErr]    = useState("");
  // 🚨 Cảnh báo khẩn cấp — danh sách các lượt "báo khẩn cấp" đã gửi (mã vật tư còn thiếu cần gấp)
  const [canhBaoKhan, setCanhBaoKhan] = useState([]);
  const [khanCapModal, setKhanCapModal] = useState(null); // {items:[...]} khi mở form gửi báo khẩn, null = đóng
  const [showCanhBaoList, setShowCanhBaoList] = useState(false); // mở/đóng danh sách 🔔 đã nhận
  const [projs,    setProjs]    = useState([]);
  const [projPickerOpen, setProjPickerOpen] = useState(false);
  const [linePickerOpen, setLinePickerOpen] = useState(false);
  const [bomDB,    setBomDB]    = useState(initBom);
  const [lsDB,     setLsDB]     = useState({});
  const [phDB,     setPhDB]     = useState({});
  const [soanDB,   setSoanDB]   = useState(()=>{try{const s=localStorage.getItem("soanDB");return s?JSON.parse(s):{};}catch{return{};}});
  const [pid,      setPid]      = useState("");
  // ✅ Nhớ tab đang xem qua localStorage — sau khi tạo dự án xong (hoặc bất kỳ lúc nào)
  // reload/refresh trang, người dùng ở lại ĐÚNG tab đang xem, không bị nhảy về tab mặc định.
  const [tab,      setTab]      = useState(()=>{try{return localStorage.getItem("lastTab")||"ds";}catch{return "ds";}});
  // ✅ FIX: nút "trở lui" vật lý/gesture trên điện thoại trước đây KHÔNG lùi về bước trước
  // trong app — vì SPA này không đồng bộ với lịch sử trình duyệt, back sẽ thoát thẳng khỏi
  // trang. Đoạn dưới đồng bộ TOÀN BỘ điều hướng cấp cao với History API:
  //   • 3 màn hình độc lập: Tổng quan / Khởi tạo Dự án / Đã thực hiện
  //   • "Hệ thống chính" (giao diện tab: Danh sách/Soạn hàng/Duyệt...) — mỗi lần đổi tab sẽ
  //     lưu 1 mốc lịch sử, back sẽ lùi qua từng tab đã xem trước khi thoát hẳn ra màn đăng nhập.
  // Mỗi lần "tiến" (đổi tab, hoặc mở 1 trong 3 màn độc lập) → pushState 1 mốc mới. Khi bấm
  // back (vật lý/gesture HOẶC nút "← Trở về"/"← Quay lại" trên màn hình — tất cả đều đi qua
  // history.back()), popstate được bắt và app tự lùi lại đúng 1 bước, KHÔNG rời khỏi trang.
  const navRef = useRef(null); // mốc điều hướng hiện tại đã ghi nhận: "khoiTao"|"tongQuan"|"daThucHien"|"main:<tab>"|null
  const fromPopRef = useRef(false); // true khi đang set state DO popstate gây ra — tránh push lại lịch sử
  useEffect(()=>{
    const cur = showKhoiTao?"khoiTao":showTongQuan?"tongQuan":showDaThucHien?"daThucHien":(user&&!backToGate)?`main:${tab}`:null;
    if(cur!==navRef.current){
      if(fromPopRef.current){
        // state vừa đổi là do popstate (back) gây ra → chỉ cập nhật mốc, KHÔNG push thêm
        fromPopRef.current=false;
      }else if(cur){
        try{ window.history.pushState({klNav:cur}, ""); }catch{}
      }
      navRef.current=cur;
    }
  },[showTongQuan,showKhoiTao,showDaThucHien,user,backToGate,tab]);
  useEffect(()=>{
    const onPop=(e)=>{
      const s=e.state?.klNav;
      fromPopRef.current=true;
      if(s&&s.startsWith("main:")){
        setBackToGate(false); setShowTongQuan(false); setShowKhoiTao(false); setShowDaThucHien(false);
        setTab(s.slice(5));
      }else if(s==="khoiTao"||s==="tongQuan"||s==="daThucHien"){
        setBackToGate(false);
        setShowKhoiTao(s==="khoiTao"); setShowTongQuan(s==="tongQuan"); setShowDaThucHien(s==="daThucHien");
      }else{
        // hết mốc điều hướng nội bộ (lùi ra khỏi cả "hệ thống chính" lẫn 3 màn độc lập)
        // → quay lại BƯỚC 3 (chọn trạng thái dự án) của màn đăng nhập, KHÔNG rời trang.
        if(navRef.current){ setBackToGate(true); setShowTongQuan(false); setShowKhoiTao(false); setShowDaThucHien(false); }
        else fromPopRef.current=false;
      }
    };
    window.addEventListener("popstate", onPop);
    return ()=>window.removeEventListener("popstate", onPop);
  },[]);
  // Dùng cho nút "← Trở về" trên cả 3 màn độc lập — ĐI THẲNG về màn "Chọn khu vực quản lý dự
  // án" (BƯỚC 3 của màn đăng nhập, xem LoginScreen step==="project") một cách chắc chắn, không
  // phụ thuộc vào window.history.back()/popstate (trước đây có thể không đáng tin cậy — ví dụ
  // khi không có đủ mốc lịch sử đã lưu, back() có thể thoát hẳn ra ngoài trang thay vì lùi đúng
  // 1 bước trong app).
  const goBackScreen=()=>{
    setShowTongQuan(false);
    setShowKhoiTao(false);
    setShowDaThucHien(false);
    setBackToGate(true);
  };
  const [xhDaXNShowAll, setXhDaXNShowAll] = useState(false);
  const [search,   setSearch]   = useState("");
  const [fdm,      setFdm]      = useState("Tất cả");
  // ✅ Trang vật tư (tab "Xưởng hàn"/ds): chia danh sách theo 5 nhóm Nguồn gốc cố định
  // Trang 1: SUB MINI 1 · Trang 2: SUB MINI 2 · Trang 3: UB10→UB80 · Trang 4: MB10→MB90 · Trang 5: FT01→FT08
  const [trangVT,  setTrangVT]  = useState(0);
  const [modal,    setModal]    = useState(null);
  const [cur,      setCur]      = useState(E0);
  const [anhPv,    setAnhPv]    = useState(null);
  const [slXT,     setSlXT]     = useState(1);
  const [gcXT,     setGcXT]     = useState("");
  const [newP,     setNewP]     = useState(false);
  const [nPF,      setNPF]      = useState({ten:"",moTa:"",mau:"#7c3aed",icon:"🚐",so_xe:1,bom:"import_file",
    loSx:"",lenhSx:"",ngayKhoiTao:new Date().toISOString().slice(0,10),ngayHoanThanh:"",sopTu:"",sopDen:""});
  const newProjFileRef = useRef();
  const [msg,      setMsg]      = useState("");
  const [showPh,   setShowPh]   = useState(false);
  const [viewPh,   setViewPh]   = useState(null);
  const phieuRef = useRef(null); // vùng nội dung phiếu GN để chụp thành ảnh khi bấm "Chia sẻ"
  const bcCardRef = useRef(null); // vùng toàn bộ thẻ Báo Cáo (banner+thống kê+donut+biểu đồ+bảng) để chụp thành ảnh khi bấm "Xuất báo cáo"
  // ✅ Ghi nhớ vị trí (trang con "dang"/"done") mà người dùng VỪA TỰ TAY chọn cho tab "Báo cáo"
  // — dùng chung "useManualOverride" (định nghĩa ở trên component) để KHÔNG bị effect tự đồng
  // bộ bcSubTab ghi đè ngược mỗi khi app tự làm mới dữ liệu ngầm định kỳ. Khoá bảo vệ là "pid"
  // (dự án đang xem) — đổi sang xem dự án khác thì tự đồng bộ lại bình thường cho dự án mới.
  const bcNav = useManualOverride();
  const [dangChiaSe, setDangChiaSe] = useState(false);
  const [slThucEdit, setSlThucEdit] = useState<Record<string,number>>({}); // ctid -> sl thực nhận đang sửa
  const [editPh,   setEditPh]   = useState(null);  // phiếu đang chỉnh sửa {id, sp, ngay, gc, ct:[]}
  const [phF,      setPhF]      = useState({sp:"",ngay:new Date().toISOString().slice(0,10),gc:""});
  const [phIt,     setPhIt]     = useState([]);
  const [addIt,    setAddIt]    = useState({ma:"",sl:1});
  const [bcDmO,    setBcDmO]    = useState({});
  const [bcViTriChiTiet, setBcViTriChiTiet] = useState(false); // ẩn/hiện 2 bảng THCK · CKD trong "Tiến độ theo Vị trí"
  const [bcBlockOpen, setBcBlockOpen] = useState({THCK:"", CKD:""}); // lọc theo nguồn: ""(đóng) · "done"(Đã nhận) · "thieu"(Còn thiếu)
  // ✅ Tab Báo Cáo tách 2 trang con: "dang" (Đang thực hiện — báo cáo chi tiết dự án đang
  // chọn, y hệt hành vi cũ) và "done" (Đã hoàn thành — danh sách dự án đã hoàn thành của
  // dòng xe hiện tại, bấm vào 1 dự án sẽ chuyển pid sang dự án đó rồi quay lại trang "dang"
  // để hiện đúng báo cáo chi tiết, tái dùng 100% UI báo cáo hiện có, không cần tính lại).
  const [bcSubTab, setBcSubTab] = useState("dang"); // "dang" | "done"
  // ✅ Khi bcSubTab==="done", mặc định hiện DANH SÁCH các dự án đã hoàn thành. Bấm vào 1 dự án
  // trong danh sách đó thì set "bcDoneViewPid" = id dự án đó để chuyển sang xem CHI TIẾT báo
  // cáo (banner + thống kê) của đúng dự án đó — mà KHÔNG cần đổi bcSubTab (nút "✅ Đã hoàn
  // thành" vẫn giữ nguyên trạng thái được chọn, không tự nhảy về "🚧 Đang thực hiện" nữa).
  // Điều kiện hiện danh sách hay chi tiết: so khớp "bcDoneViewPid===pid" (không chỉ khác null)
  // để tự động rơi về danh sách nếu dự án đang chọn đổi sang project khác không qua click này.
  const [bcDoneViewPid, setBcDoneViewPid] = useState(null);
  const [pgnSr,    setPgnSr]    = useState("");
  const [pgnDm,    setPgnDm]    = useState("Tất cả");
  const [pgnSO,    setPgnSO]    = useState("all");
  const [searchMa, setSearchMa] = useState("");
  const [showChoXN, setShowChoXN] = useState(8); // ✅ Số phiếu "Chờ duyệt" hiển thị (mặc định 8)
  const [showPhList, setShowPhList] = useState(5); // ✅ Số phiếu "Phiếu đã gửi" hiển thị (mặc định 5)
  const [soanSearch, setSoanSearch] = useState("");
  const [soanFilter, setSoanFilter] = useState("all"); // "all" | "chua" | "da" | "thieu" — bộ lọc nhanh tab Soạn Hàng
  const [soanCollapsed, setSoanCollapsed] = useState({}); // {[viTri]: true} — nhóm vị trí nào đang thu gọn
  const [showChangePw, setShowChangePw] = useState(false);
  const [cpwForm, setCpwForm] = useState({cur:"",next:"",confirm:""});
  const [showSignPad, setShowSignPad] = useState(false);
  const [cpwErr, setCpwErr] = useState("");
  const [cpwOk, setCpwOk] = useState("");

  // ── Cập nhật Nguồn gốc theo Mã số ──
  const [showUpdateNg, setShowUpdateNg] = useState(false);
  const [updateNgFile, setUpdateNgFile] = useState(null);
  const [updateNgLoading, setUpdateNgLoading] = useState(false);
  const [updateNgMsg, setUpdateNgMsg] = useState("");
  const [updateNgErr, setUpdateNgErr] = useState("");
  const updateNgFileRef = useRef();

  const fRef=useRef();

  // ── BOM Mẫu state (động — nhiều loại, không giới hạn) ──
  // bomMauLoaiList: danh sách các LOẠI BOM mẫu (tên/icon/màu) — quản lý được trong app,
  // thêm mới bằng nút "➕ Thêm loại BOM mẫu mới", lưu ở bảng Supabase "bom_mau_loai".
  // ✅ FIX: BOM_MAU_LOAI_DEFAULT chỉ là dữ liệu mẫu của MINI BUS — nếu dòng xe đã lưu (localStorage)
  // KHÁC Mini Bus (City Bus/12M) thì phải khởi động RỖNG, không được hiện tạm BOM mẫu của Mini Bus
  // trong lúc chờ Supabase tải xong (hoặc nếu bảng riêng của dòng xe đó chưa có/lỗi).
  const isMinibusLine = ()=>{try{return (localStorage.getItem("activeLine")||"minibus")==="minibus";}catch{return true;}};
  const [bomMauLoaiList, setBomMauLoaiList] = useState(()=>isMinibusLine()?BOM_MAU_LOAI_DEFAULT.map(x=>({...x})):[]);
  // bomMauByLoai: { [loaiId]: rows[] } — toàn bộ mã vật tư của từng loại, lưu chung 1 bảng
  // Supabase "bom_mau" (phân biệt bằng cột "loai").
  const [bomMauByLoai, setBomMauByLoai] = useState(()=>{
    if(!isMinibusLine())return {};
    const m={};
    BOM_MAU_LOAI_DEFAULT.forEach(l=>{
      m[l.id]=[]; // Không seed — chờ dữ liệu thật từ Supabase (bảng "bom_mau")
    });
    return m;
  });
  const [bmTab,     setBmTab]     = useState(()=>isMinibusLine()?(BOM_MAU_LOAI_DEFAULT[0]?.id||"xh"):""); // id loại đang xem
  const [bmSearch,  setBmSearch]  = useState("");
  const [bmModal,   setBmModal]   = useState(null);       // null | "add" | "edit"
  const [bmCur,     setBmCur]     = useState({id:"",ten:"",dv:"Cái",dm:1,ng:"",vt:"",jig:"",gc:""});
  const [bmEditIdx, setBmEditIdx] = useState(null);
  const [bmConfirm, setBmConfirm] = useState(null);       // index to delete
  const [bmShowImport, setBmShowImport] = useState(false);
  const [bmXlsPreview, setBmXlsPreview] = useState([]);
  const [bmXlsErr, setBmXlsErr] = useState("");
  const bmXlsRef = useRef();
  // ── Quản lý LOẠI BOM mẫu (thêm/xóa loại) ──
  const [bmLoaiModal, setBmLoaiModal] = useState(false);
  const [bmLoaiForm,  setBmLoaiForm]  = useState({ten:"",icon:"🚐",mau:"#7c3aed",dongXe:activeLine||"minibus"});
  const [bmLoaiDelConfirm, setBmLoaiDelConfirm] = useState(null); // id loại đang chờ xác nhận xóa
  // ✅ Mới: file BOM mẫu đính kèm ngay lúc TẠO loại mới (để có sẵn dữ liệu, khỏi Nhập Excel lại lần 2)
  const [bmLoaiFilePreview, setBmLoaiFilePreview] = useState([]); // rows đọc được từ file
  const [bmLoaiFileErr,     setBmLoaiFileErr]     = useState("");
  const [bmLoaiFileName,    setBmLoaiFileName]    = useState("");
  const bmLoaiFileRef = useRef();
  const handleBmLoaiFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    setBmLoaiFileErr("");setBmLoaiFilePreview([]);setBmLoaiFileName(file.name);
    parseXlsFile(file,(rows,err)=>{
      if(err){setBmLoaiFileErr(err);return;}
      setBmLoaiFilePreview(rows);
    });
    e.target.value="";
  };
  // ✅ Mới: tab lọc DANH SÁCH loại BOM mẫu theo DÒNG XE (12M / CITYBUS / MINIBUS) — mỗi loại
  // được tạo cho dòng xe nào thì chỉ hiện ra khi đang xem đúng dòng xe đó (bmDongXeFilter).
  const [bmDongXeFilter, setBmDongXeFilter] = useState(activeLine||"minibus");
  // Khi đổi tab dòng xe (12M/CITYBUS/MINIBUS), nếu loại BOM mẫu đang xem (bmTab) không thuộc
  // dòng xe vừa chọn thì tự nhảy sang loại đầu tiên thuộc dòng xe đó (tránh hiển thị nhầm dữ liệu).
  useEffect(()=>{
    const visible = bomMauLoaiList.filter(l=>(l.dong_xe||activeLine||"minibus")===bmDongXeFilter);
    if(!visible.some(l=>l.id===bmTab)){
      setBmTab(visible[0]?.id||"");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[bmDongXeFilter, bomMauLoaiList]);

  // Helper: lấy/ghi danh sách mã của loại BOM mẫu đang chọn (bmTab), hỗ trợ cả truyền
  // mảng trực tiếp lẫn hàm cập nhật (updater) như setState thông thường.
  const getBomMauRows = (loaiId) => bomMauByLoai[loaiId] || [];
  const setBomMauRows = (loaiId, updater) => {
    setBomMauByLoai(m=>{
      const prev = m[loaiId] || [];
      const next = typeof updater === "function" ? updater(prev) : updater;
      return {...m, [loaiId]: next};
    });
  };

  // ✅ FIX: Bảo hiểm thêm — mỗi khi ĐANG Ở dòng xe khác Mini Bus, đảm bảo không còn sót lại
  // BOM mẫu của Mini Bus (vd. do lỗi tải bảng riêng của dòng xe đó, hoặc chuyển dòng xe giữa
  // phiên làm việc mà không qua lại màn đăng nhập). Dòng xe nào chỉ được thấy BOM mẫu của
  // chính dòng xe đó — không bao giờ hiện chung với Mini Bus.
  useEffect(()=>{
    if(activeLine!=="minibus"){
      setBomMauLoaiList(l=>l.length?[]:l);
      setBomMauByLoai(m=>Object.keys(m).length?{}:m);
      setBmTab(t=>t?"":t);
    }
  },[activeLine]);

  // ── Load dữ liệu từ Supabase khi khởi động ──
  useEffect(()=>{
    const load=async()=>{
      // ✅ Báo ngay từ đầu nếu thiếu biến môi trường — không chờ query thất bại mới biết,
      // để tránh trường hợp app "âm thầm" chạy tiếp với dữ liệu mẫu hard-code.
      if(!SUPABASE_URL||!SUPABASE_KEY){
        setDbErr("THIẾU BIẾN MÔI TRƯỜNG SUPABASE (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — app đang hiển thị DỮ LIỆU MẪU, KHÔNG PHẢI dữ liệu thật. Vào Vercel → Settings → Environment Variables để kiểm tra.");
      }
      try{
        const [r1,r2,r3,r4,r5,r6,r7,r8,r10,r11,r12,r13]=await Promise.all([
          // ✅ FIX: thêm .range(0,9999) tường minh cho MỌI bảng. Trước đây chỉ "bom_items"
          // có .range(), các bảng còn lại gọi .select("*") KHÔNG giới hạn tường minh — mà
          // Supabase/PostgREST mặc định chỉ trả tối đa ~1000 dòng và ÂM THẦM cắt bớt phần
          // dư, KHÔNG báo lỗi. Với dữ liệu dạng "phiếu × mã vật tư" (vd. 33 phiếu × 39 mã),
          // bảng "phieu_ct" hoàn toàn có thể vượt 1000 dòng → Báo Cáo bị thiếu số liệu mà
          // không có cảnh báo gì. Đây chính là nguyên nhân "không load được hết dữ liệu".
          supabase.from("users").select("*").range(0, 9999),
          supabase.from(T("projects")).select("*").range(0, 9999),
          supabase.from(T("bom_items")).select("*").range(0, 9999),
          supabase.from(T("phieu")).select("*").order("ts",{ascending:false}).range(0, 9999),
          supabase.from(T("phieu_ct")).select("*").range(0, 9999),
          supabase.from(T("lich_su")).select("*").order("ts",{ascending:false}).limit(500),
          supabase.from(T("bom_mau_loai")).select("*").order("thu_tu").range(0, 9999),
          supabase.from(T("bom_mau")).select("*").order("stt").range(0, 9999),
          supabase.from("quyen_dong_xe").select("*").range(0, 9999),
          supabase.from("quyen_chuc_nang").select("*").range(0, 9999),
          supabase.from(T("canh_bao_khan")).select("*").order("ts",{ascending:false}).range(0, 999),
          supabase.from("cms_content").select("*").order("thu_tu").range(0, 9999),
        ]);
        const errs=[r1,r2,r3,r4,r5,r6].filter(r=>r.error).map(r=>r.error.message);
        if(errs.length){
          console.error("Supabase errors:",errs);
          setDbErr("Lỗi kết nối DB: "+errs[0]);
        } else {
          setDbErr("");
        }
        const [usersData,projsData,bomData,phieuData,phCtData,lsData]=[r1.data,r2.data,r3.data,r4.data,r5.data,r6.data];
        if(usersData?.length){
          setUsers(usersData);
        }
        if(!r2.error){
          setProjs(projsData||[]);
          // ✅ Nhớ dự án đang xem qua localStorage — không luôn nhảy về dự án đầu tiên khi reload
          if(projsData?.length){
            const savedPid=localStorage.getItem("lastPid");
            const validPid=savedPid&&projsData.find(p=>p.id===savedPid)?savedPid:projsData[0].id;
            setPid(validPid);
          } else {
            setPid("");
          }
        }
        // ✅ Chỉ giữ nguyên state cũ khi có LỖI thật (mất mạng, bảng chưa tạo...). Nếu Supabase
        // trả về thành công nhưng bảng rỗng (đã xoá hết dữ liệu), phải set về rỗng — không được
        // giữ lại initBom (đã bỏ seed, giờ initBom cũng rỗng) như một dữ liệu "cũ" nào khác.
        if(!r3.error){
          const grouped={};
          (bomData||[]).forEach(v=>{if(!grouped[v.pid])grouped[v.pid]=[];grouped[v.pid].push(v);});
          setBomDB(grouped);
        }
        if(phieuData?.length){
          const ctMap={};
          (phCtData||[]).forEach(c=>{if(!ctMap[c.phid])ctMap[c.phid]=[];ctMap[c.phid].push(c);});
          const grouped={};
          phieuData.forEach(p=>{
            const ph={...p,ct:ctMap[p.id]||[]};
            if(!grouped[p.pid])grouped[p.pid]=[];
            grouped[p.pid].push(ph);
          });
          setPhDB(grouped);
        }
        if(lsData?.length){
          const grouped={};
          lsData.forEach(v=>{if(!grouped[v.pid])grouped[v.pid]=[];grouped[v.pid].push(v);});
          setLsDB(grouped);
        }
        // BOM Mẫu: KHÔNG còn seed hard-code trong code nữa (đã bỏ hẳn BOM_XH/BOM_MB2).
        // Nguyên tắc: chỉ giữ nguyên state hiện tại khi Supabase báo LỖI thật (bảng chưa
        // tạo, mất mạng...). Nếu query THÀNH CÔNG nhưng bảng rỗng (đã xoá hết loại/mã),
        // phải set về rỗng thật sự — tuyệt đối không được để lộ lại state khởi tạo cũ hay
        // "hồi sinh" dữ liệu mẫu nào, vì giờ dữ liệu mẫu 100% chỉ đến từ Supabase.
        if(r7.error){
          console.warn("Chưa đọc được bảng bom_mau_loai (có thể chưa tạo bảng):",r7.error.message);
        } else {
          const loaiList=r7.data||[];
          setBomMauLoaiList(loaiList);
          // Nếu loại đang chọn (bmTab) không còn tồn tại trong danh sách thật từ DB,
          // tự chuyển về loại đầu tiên (hoặc rỗng nếu DB không còn loại nào) để tránh
          // tham chiếu tới 1 loại "ma" không có trong dữ liệu thật.
          setBmTab(t=>loaiList.some(l=>l.id===t)?t:(loaiList[0]?.id||""));
        }
        if(r8.error){
          console.warn("Chưa đọc được bảng bom_mau (có thể chưa tạo bảng):",r8.error.message);
        } else {
          const grouped={};
          (r8.data||[]).forEach(row=>{if(!grouped[row.loai])grouped[row.loai]=[];grouped[row.loai].push(row);});
          setBomMauByLoai(grouped);
        }
        // Phân quyền dòng xe theo đơn vị — nếu bảng chưa tạo, giữ nguyên LINE_QUYEN_DEFAULT.
        if(r10.error){
          console.warn("Chưa đọc được bảng quyen_dong_xe (có thể chưa tạo bảng):",r10.error.message);
        } else if(r10.data?.length){
          const m={};
          r10.data.forEach(row=>{ if(row.don_vi) m[row.don_vi]=Array.isArray(row.dong_xe)?row.dong_xe:[]; });
          setLineQuyen(q=>({...q,...m}));
        }
        // Phân quyền chức năng (tab) theo đơn vị — nếu bảng chưa tạo, mỗi đơn vị vẫn dùng
        // đúng bộ chức năng mặc định theo vai trò (xem TAB_QUYEN_DEFAULT/getTabKeysForDonVi).
        if(r11.error){
          console.warn("Chưa đọc được bảng quyen_chuc_nang (có thể chưa tạo bảng):",r11.error.message);
        } else if(r11.data?.length){
          const m={};
          r11.data.forEach(row=>{ if(row.don_vi) m[row.don_vi]=Array.isArray(row.chuc_nang)?row.chuc_nang:[]; });
          setTabQuyen(q=>({...q,...m}));
        }
        // 🚨 Cảnh báo khẩn cấp — nếu bảng chưa tạo, im lặng bỏ qua (tính năng tự ẩn, không báo lỗi đỏ toàn app).
        if(r12.error){
          console.warn("Chưa đọc được bảng canh_bao_khan (có thể chưa tạo bảng):",r12.error.message);
        } else {
          setCanhBaoKhan(r12.data||[]);
        }
        // 🖼️ CMS Nội dung/Banner/Ảnh đại diện — nếu bảng chưa tạo, im lặng bỏ qua (chỉ admin
        // dùng tính năng này, không ảnh hưởng các tài khoản khác).
        if(r13.error){
          console.warn("Chưa đọc được bảng cms_content (có thể chưa tạo bảng):",r13.error.message);
        } else {
          setCmsItems(r13.data||[]);
        }
      }catch(e){
        console.error("Supabase load error:",e);
        // ✅ FIX QUAN TRỌNG: trước đây lỗi ở đây chỉ log console, KHÔNG setDbErr — nếu
        // toàn bộ Promise.all thất bại (vd. thiếu biến môi trường VITE_SUPABASE_URL/
        // VITE_SUPABASE_ANON_KEY sau khi deploy bản mới, hoặc mất mạng), app vẫn tiếp
        // tục hiển thị BÌNH THƯỜNG với dữ liệu MẪU hard-code sẵn trong code (PROJS_DEF/
        // initBom/USERS_DEF) mà không có bất kỳ cảnh báo nào — trông y hệt như "mất hết
        // dữ liệu" dù dữ liệu thật trên Supabase vẫn còn nguyên, chỉ là app không đọc
        // được. Giờ báo rõ cho người dùng biết để không hoang mang tưởng mất dữ liệu.
        setDbErr(
          !SUPABASE_URL||!SUPABASE_KEY
            ? "THIẾU BIẾN MÔI TRƯỜNG SUPABASE (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — app đang hiển thị DỮ LIỆU MẪU, KHÔNG PHẢI dữ liệu thật. Vào Vercel → Settings → Environment Variables để kiểm tra."
            : `KHÔNG TẢI ĐƯỢC DỮ LIỆU TỪ SERVER (${e.message||"lỗi không xác định"}) — app đang hiển thị DỮ LIỆU MẪU, KHÔNG PHẢI dữ liệu thật. Kiểm tra kết nối mạng hoặc thử tải lại trang.`
        );
      }
    };
    load();
    // ✅ Chỉ tự động tải lại dữ liệu NGẦM (không reload cả trang) khi đã đăng nhập —
    // giúp nhận thay đổi mới nhất từ người dùng khác mà không làm mất dữ liệu đang
    // gõ dở trên các form khác trong lúc tải.
    if(!user) return;
    const pollTimer=setInterval(load,10000);
    return ()=>clearInterval(pollTimer);
  },[user,activeLine]);

  // ✅ TỰ SỬA "dòng xe đang xem" nếu lệch quyền: trước đây ô "DÒNG XE" trong dashboard cho
  // phép MỌI tài khoản tự đổi sang dòng xe bất kỳ (không kiểm tra bảng "Phân quyền dòng xe
  // theo đơn vị"), nên có thể tồn tại tài khoản đang lưu sẵn (localStorage) 1 dòng xe KHÔNG
  // thuộc quyền của mình (VD tài khoản "KHO VẬT TƯ" — chỉ được cấp Mini Bus — lại đang xem
  // dữ liệu City Bus). Khi phát hiện activeLine hiện tại không nằm trong danh sách dòng xe
  // được cấp (và danh sách đó không rỗng), tự động đưa về đúng dòng xe được phép đầu tiên.
  useEffect(()=>{
    if(!user || isAdminAccount(user)) return; // admin/xh04 luôn có toàn quyền cả 3 dòng
    const allowed = lineQuyen[user.don_vi];
    if(!allowed || !allowed.length) return; // chưa tải xong bảng phân quyền / đơn vị chưa cấu hình — không đoán bừa
    if(!allowed.includes(activeLine)){
      const fixedLine = allowed[0];
      setActiveLine(fixedLine);
      try{localStorage.setItem("activeLine",fixedLine);}catch{}
    }
  },[user,lineQuyen,activeLine]);

  // ── Realtime: đồng bộ bảng bom_items giữa các thiết bị/người dùng gần như tức thời.
  // Đây là LỚP BẢO VỆ BỔ SUNG chống mất dữ liệu nhiều trạm: lớp chính là đã đổi mọi thao
  // tác ghi/xóa 1 mã sang đúng-1-dòng (dbUpsertBomRows/dbDeleteBomItems ở trên) thay vì
  // "upsert cả mảng rồi xóa những gì local không có" — nhưng nếu 1 máy vẫn lỡ mở rất lâu
  // và local có sai lệch nhỏ, realtime này giúp local luôn bắt kịp thay đổi của người khác
  // gần như ngay lập tức, thay vì phải tải lại trang mới thấy.
  useEffect(()=>{
    const upsertLocal=row=>{
      if(!row?.pid||!row?.id)return;
      setBomDB(s=>{
        const arr=s[row.pid]||[];
        const idx=arr.findIndex(v=>v.id===row.id);
        const next=idx>=0?arr.map((v,i)=>i===idx?{...v,...row}:v):[...arr,row];
        return {...s,[row.pid]:next};
      });
    };
    const removeLocal=id=>{
      if(!id)return;
      setBomDB(s=>{
        let changed=false;
        const next={...s};
        for(const p of Object.keys(next)){
          if((next[p]||[]).some(v=>v.id===id)){
            next[p]=next[p].filter(v=>v.id!==id);
            changed=true;
          }
        }
        return changed?next:s;
      });
    };
    const channel=supabase
      .channel("bom_items_realtime")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:T("bom_items")},payload=>upsertLocal(payload.new))
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:T("bom_items")},payload=>upsertLocal(payload.new))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:T("bom_items")},payload=>removeLocal(payload.old?.id))
      .subscribe();
    return ()=>{ supabase.removeChannel(channel); };
  },[activeLine]);

  // ── Theo dõi trạng thái Online ──
  // Heartbeat: mỗi 20s, cập nhật last_active của user đang đăng nhập lên Supabase
  // (yêu cầu bảng "users" có cột "last_active" kiểu timestamptz — nếu chưa có, lệnh update
  // dưới đây sẽ báo lỗi console nhưng không ảnh hưởng phần còn lại của app).
  useEffect(()=>{
    if(!user?.id) return;
    const beat=()=>{
      supabase.from("users").update({last_active:new Date().toISOString()}).eq("id",user.id)
        .then(({error})=>{if(error) console.error("heartbeat last_active:",error.message);});
    };
    beat();
    const iv=setInterval(beat,20000);
    return ()=>clearInterval(iv);
  },[user?.id]);

  // Polling: mỗi 15s, lấy last_active của toàn bộ user để suy ra ai đang online
  useEffect(()=>{
    if(!user?.id) return;
    const poll=()=>{
      supabase.from("users").select("id,last_active").then(({data,error})=>{
        if(error||!data) return;
        setUsers(l=>l.map(u=>{
          const found=data.find(d=>d.id===u.id);
          return found?{...u,last_active:found.last_active}:u;
        }));
      });
    };
    poll();
    const iv=setInterval(poll,15000);
    return ()=>clearInterval(iv);
  },[user?.id]);

  // ── Supabase write helpers ──
  // ✅ FIX: Upsert dữ liệu MỚI trước (không xóa gì), chỉ xóa các dòng id CŨ không còn
  // xuất hiện trong danh sách mới SAU KHI toàn bộ dữ liệu mới đã lưu thành công.
  // Trước đây: xóa hết theo pid trước → nếu insert lỗi giữa đường (vd. 1 dòng vi phạm
  // constraint ở chunk thứ N) thì các chunk insert trước đó vẫn nằm trên Supabase,
  // nhưng các chunk sau bị mất, dữ liệu cũ đã xóa không khôi phục được → vào lại thấy
  // thiếu mã (vd. 148 mã import nhưng chỉ còn 25 mã sống sót).
  // Dùng upsert (không phải insert thuần) vì rows truyền vào có thể chứa CẢ id cũ đã
  // tồn tại (case save/sửa/xóa 1 dòng — next[pid] là toàn bộ danh sách) VÀ id mới
  // (case import) — insert thuần sẽ lỗi trùng khóa chính với các id cũ.
  // Không dùng pid giả/tạm vì cột pid có thể có foreign key tới bảng projects.
  const dbUpsertBom=async(pid,rows,oldIds=[])=>{
    // Làm sạch + validate từng dòng trước khi gửi lên Supabase để tránh 1 dòng lỗi
    // (vd. dm là NaN, ma/ten rỗng, chuỗi quá dài so với giới hạn cột) làm fail cả chunk.
    const cleanRows=(rows||[]).map(r=>({
      id:r.id,
      pid, // dùng pid thật được truyền vào, không phụ thuộc r.pid (tránh lệch closure)
      stt:Number(r.stt)||0,
      ma:String(r.ma??"").trim().slice(0,200),
      ten:String(r.ten??"").trim().slice(0,500),
      dv:String(r.dv||"Cái").trim().slice(0,50),
      dm:Number.isFinite(Number(r.dm))?Number(r.dm):1,
      ng:r.ng?String(r.ng).trim().slice(0,200):null,
      vt:r.vt?String(r.vt).trim().slice(0,200):null,
      gc:r.gc?String(r.gc).trim().slice(0,1000):null,
      anh:r.anh||null,
    })).filter(r=>r.ma&&r.ten); // bỏ dòng thiếu Mã số/Tên vật tư (tránh insert rác)

    const nSkipped=(rows?.length||0)-cleanRows.length;
    if(nSkipped>0){
      console.warn(`dbUpsertBom: bỏ qua ${nSkipped}/${rows.length} dòng thiếu Mã số/Tên vật tư`,
        (rows||[]).filter(r=>!String(r.ma??"").trim()||!String(r.ten??"").trim()));
    }

    // ⚠️ FIX (2026-07-20, lần 4): Theo yêu cầu — copy lại đúng cách "Tạo dự án mới" đang
    // làm (mkProj): lúc tạo dự án mới, BOM luôn được ghi bằng dbUpsertBomRows — ĐƠN GIẢN,
    // không có bước dò/xóa id cũ nào cả — và chưa từng báo lỗi dù BOM tới 136+ mã. Sở dĩ
    // nó đơn giản được vì dự án mới luôn RỖNG.
    // → Áp dụng y hệt cho "Thay thế": chủ động làm dự án RỖNG LẠI trước (xóa toàn bộ
    // bom_items theo đúng 1 giá trị pid — 1 lệnh DELETE DUY NHẤT, KHÔNG cần liệt kê từng
    // id nên không có rủi ro URL quá dài), rồi gọi ĐÚNG dbUpsertBomRows để ghi mã mới vào
    // — y hệt cách "Thêm vào" và "Tạo dự án mới" đang làm, đã được chứng minh chạy ổn định.
    try{
      const {error:delErr}=await supabase.from(T("bom_items")).delete().eq("pid",pid);
      if(delErr){
        console.error("dbUpsertBom (xóa toàn bộ theo pid) lỗi:",delErr.message,delErr);
        throw new Error("Lỗi xóa dữ liệu cũ: "+delErr.message);
      }
      console.log("dbUpsertBom: đã xóa sạch mã cũ của dự án",pid,"— bắt đầu ghi",cleanRows.length,"mã mới...");
      // ✅ Ghi mã mới bằng ĐÚNG hàm dbUpsertBomRows (dùng chung với "Thêm vào" + lúc Tạo
      // dự án mới) — đã có sẵn: chia lô, kiểm tra RLS chặn âm thầm, báo lỗi rõ theo từng lô.
      const res=await dbUpsertBomRows(pid,rows);
      console.log("dbUpsertBom OK:",pid,res.count,"mã đã ghi",nSkipped?`(bỏ qua ${nSkipped} dòng lỗi)`:"");
      return res;
    }catch(e){
      console.error("dbUpsertBom exception:",e);
      throw e;
    }
  };
  // ✅ GHI AN TOÀN NHIỀU NGƯỜI DÙNG: chỉ upsert ĐÚNG những dòng được truyền vào,
  // KHÔNG bao giờ xóa bất kỳ dòng nào khác trên Supabase. Dùng cho MỌI thao tác
  // thêm/sửa 1 (hoặc vài) mã cụ thể — vì bomDB cục bộ trên máy mỗi người dùng có thể
  // đang cũ hơn dữ liệu thật trên server (app không có realtime đồng bộ đầy đủ cho
  // bom_items), nên KHÔNG được coi "mảng local" là danh sách đầy đủ rồi xóa hết những
  // gì server có mà local không có — đó chính là nguyên nhân gây "mất dữ liệu nhiều
  // trạm" khi nhiều người cùng thao tác. Việc XÓA (nếu cần) phải làm riêng, có chủ đích,
  // bằng dbDeleteBomItems ngay bên dưới.
  const dbUpsertBomRows=async(pid,rows)=>{
    const cleanRows=(rows||[]).map(r=>({
      id:r.id,
      pid,
      stt:Number(r.stt)||0,
      ma:String(r.ma??"").trim().slice(0,200),
      ten:String(r.ten??"").trim().slice(0,500),
      dv:String(r.dv||"Cái").trim().slice(0,50),
      dm:Number.isFinite(Number(r.dm))?Number(r.dm):1,
      ng:r.ng?String(r.ng).trim().slice(0,200):null,
      vt:r.vt?String(r.vt).trim().slice(0,200):null,
      gc:r.gc?String(r.gc).trim().slice(0,1000):null,
      anh:r.anh||null,
      // ✅ CHỈ gửi 7 cột mới khi đang ở dòng xe 12m (activeLine==="12m") — bảng
      // bom_items của minibus/citybus KHÔNG có các cột này nên phải loại trừ, nếu
      // không Supabase/PostgREST sẽ báo lỗi "column ... does not exist".
      ...(activeLine==="12m" ? {
        ckgh:   r.ckgh ? String(r.ckgh).trim().slice(0,20) : "dung_chung",
        px:     r.px ? String(r.px).trim().slice(0,100) : null,
        dai:    (r.dai!=null && r.dai!=="") ? Number(r.dai) : null,
        rong:   (r.rong!=null && r.rong!=="") ? Number(r.rong) : null,
        day_kt: (r.day_kt!=null && r.day_kt!=="") ? Number(r.day_kt) : null,
        tram:   r.tram ? String(r.tram).trim().slice(0,50) : null,
        tnxh:   r.tnxh ? String(r.tnxh).trim().slice(0,100) : null,
      } : {}),
    })).filter(r=>r.ma&&r.ten);
    const nSkipped=(rows?.length||0)-cleanRows.length;
    if(nSkipped>0){
      console.warn(`dbUpsertBomRows: bỏ qua ${nSkipped}/${rows.length} dòng thiếu Mã số/Tên vật tư`);
    }
    if(!cleanRows.length) return {ok:true,count:0,skipped:nSkipped};
    const batch=100;
    for(let i=0;i<cleanRows.length;i+=batch){
      const chunk=cleanRows.slice(i,i+batch);
      const {data:insData,error:insErr}=await supabase.from(T("bom_items")).upsert(chunk,{onConflict:"id"}).select("id");
      if(insErr){
        console.error("dbUpsertBomRows upsert error:",insErr.message,insErr,"sample:",chunk[0]);
        throw new Error(`Lỗi lưu mã VT (dòng ${i+1}-${i+chunk.length}/${cleanRows.length}): ${insErr.message}`);
      }
      if((insData?.length||0)<chunk.length){
        console.error("dbUpsertBomRows: RLS/permission chặn âm thầm — gửi",chunk.length,"dòng nhưng DB chỉ xác nhận ghi",insData?.length||0,"dòng.");
        throw new Error(`Supabase chỉ lưu được ${insData?.length||0}/${chunk.length} dòng (khả năng cao do Row Level Security policy chặn quyền ghi bảng bom_items) — kiểm tra lại RLS policy trên Supabase`);
      }
    }
    console.log("dbUpsertBomRows OK:",pid,cleanRows.length,"rows",nSkipped?`(bỏ qua ${nSkipped} dòng lỗi)`:"");
    return {ok:true,count:cleanRows.length,skipped:nSkipped};
  };
  // ✅ Xóa ĐÚNG các id được chỉ định — không đụng tới bất kỳ dòng nào khác. Dùng khi
  // người dùng CHỦ ĐỘNG xóa 1 (hoặc vài) mã cụ thể, thay cho cách "xóa mọi thứ không có
  // trong mảng local" (nguồn gốc lỗi mất dữ liệu nhiều trạm trước đây).
  const dbDeleteBomItems=async(ids)=>{
    const clean=[...new Set((ids||[]).filter(Boolean))];
    if(!clean.length) return {ok:true,count:0};
    const {error}=await supabase.from(T("bom_items")).delete().in("id",clean).select("id");
    if(error){
      console.error("dbDeleteBomItems error:",error.message,error);
      throw new Error("Lỗi xóa mã VT: "+error.message);
    }
    return {ok:true,count:clean.length};
  };
  // ✅ Xóa TOÀN BỘ vật tư (bom_items) của MỘT dự án theo pid — dùng cho nút "🗑️ Xoá Bom"
  // (chỉ dành cho tài khoản Xưởng hàn). Khác với dbDeleteBomItems (xóa theo danh sách id
  // cụ thể), hàm này xóa thẳng theo pid — 1 lệnh DELETE DUY NHẤT, không phụ thuộc mảng
  // local có đầy đủ hay không.
  const dbDeleteBomByPid=async(pidToDelete)=>{
    const {error}=await supabase.from(T("bom_items")).delete().eq("pid",pidToDelete);
    if(error){
      console.error("dbDeleteBomByPid error:",error.message,error);
      throw new Error("Lỗi xóa toàn bộ vật tư: "+error.message);
    }
    return {ok:true};
  };
  // Đồng bộ toàn bộ 1 BOM Mẫu (theo "loai") lên Supabase — dùng CHUNG 1 bảng "bom_mau"
  // cho mọi loại (phân biệt bằng cột "loai"), khóa duy nhất là cặp (loai, id).
  // Nhận "loai" (id của loại BOM mẫu, vd "xh"/"mb2"/loại tự thêm) + TOÀN BỘ mảng hiện
  // tại (không phải 1 dòng lẻ), rồi upsert + xóa các dòng không còn xuất hiện — cùng
  // cách làm với dbUpsertBom ở trên.
  const dbSyncBomMau=async(loai, rows)=>{
    const cleanRows=(rows||[]).map(r=>({
      loai:String(loai),
      id:String(r.id??"").trim().slice(0,200),
      stt:Number(r.stt)||0,
      ten:String(r.ten??"").trim().slice(0,500),
      dv:String(r.dv||"Cái").trim().slice(0,50),
      dm:Number.isFinite(Number(r.dm))?Number(r.dm):1,
      ng:r.ng?String(r.ng).trim().slice(0,200):null,
      vt:r.vt?String(r.vt).trim().slice(0,200):null,
      jig:r.jig?String(r.jig).trim().slice(0,200):null,
      gc:r.gc?String(r.gc).trim().slice(0,1000):null,
    })).filter(r=>r.id&&r.ten);

    const {data:oldData,error:selErr}=await supabase.from(T("bom_mau")).select("id").eq("loai",loai);
    if(selErr){console.error(`dbSyncBomMau(${loai}) select old error:`,selErr.message,selErr);throw new Error("Lỗi đọc dữ liệu cũ: "+selErr.message);}
    const oldIds=(oldData||[]).map(r=>r.id);

    try{
      if(cleanRows.length){
        const batch=100;
        for(let i=0;i<cleanRows.length;i+=batch){
          const chunk=cleanRows.slice(i,i+batch);
          // ✅ Khóa duy nhất là cặp (loai,id) — xem SQL tạo bảng "bom_mau" ở đầu file.
          const {data:insData,error:insErr}=await supabase.from(T("bom_mau")).upsert(chunk,{onConflict:"loai,id"}).select("id");
          if(insErr){
            console.error(`dbSyncBomMau(${loai}) upsert error:`,insErr.message,insErr,"sample:",chunk[0]);
            throw new Error(`Lỗi lưu BOM Mẫu (dòng ${i+1}-${i+chunk.length}/${cleanRows.length}): ${insErr.message}`);
          }
          if((insData?.length||0)<chunk.length){
            console.error(`dbSyncBomMau(${loai}): RLS/permission chặn âm thầm — gửi`,chunk.length,"dòng nhưng DB chỉ xác nhận ghi",insData?.length||0,"dòng.");
            throw new Error(`Supabase chỉ lưu được ${insData?.length||0}/${chunk.length} dòng (khả năng do Row Level Security policy chặn quyền ghi bảng bom_mau) — kiểm tra lại RLS policy trên Supabase`);
          }
        }
      }

      const newIdSet=new Set(cleanRows.map(r=>r.id));
      const idsToDelete=oldIds.filter(oid=>!newIdSet.has(oid));
      if(idsToDelete.length){
        const delBatch=200;
        for(let i=0;i<idsToDelete.length;i+=delBatch){
          const idsChunk=idsToDelete.slice(i,i+delBatch);
          const {error:delErr}=await supabase.from(T("bom_mau")).delete().eq("loai",loai).in("id",idsChunk).select("id");
          if(delErr){
            console.error(`dbSyncBomMau(${loai}) delete old error:`,delErr.message,delErr);
            throw new Error("Lỗi xóa dữ liệu cũ: "+delErr.message);
          }
        }
      }
      console.log(`dbSyncBomMau(${loai}) OK:`,cleanRows.length,"rows");
      return {ok:true,count:cleanRows.length};
    }catch(e){
      console.error(`dbSyncBomMau(${loai}) exception:`,e);
      throw e;
    }
  };
  // ✅ Bản an toàn của dbSyncBomMau: chỉ upsert đúng những dòng truyền vào, KHÔNG xóa gì.
  // Dùng cho thêm/sửa 1 mã trong BOM Mẫu, tránh cùng lỗi "xóa-theo-khác-biệt-cả-mảng"
  // như đã sửa ở dbUpsertBomRows phía trên.
  const dbUpsertBomMauRows=async(loai, rows)=>{
    const cleanRows=(rows||[]).map(r=>({
      loai:String(loai),
      id:String(r.id??"").trim().slice(0,200),
      stt:Number(r.stt)||0,
      ten:String(r.ten??"").trim().slice(0,500),
      dv:String(r.dv||"Cái").trim().slice(0,50),
      dm:Number.isFinite(Number(r.dm))?Number(r.dm):1,
      ng:r.ng?String(r.ng).trim().slice(0,200):null,
      vt:r.vt?String(r.vt).trim().slice(0,200):null,
      jig:r.jig?String(r.jig).trim().slice(0,200):null,
      gc:r.gc?String(r.gc).trim().slice(0,1000):null,
    })).filter(r=>r.id&&r.ten);
    if(!cleanRows.length) return {ok:true,count:0};
    const batch=100;
    for(let i=0;i<cleanRows.length;i+=batch){
      const chunk=cleanRows.slice(i,i+batch);
      const {data:insData,error:insErr}=await supabase.from(T("bom_mau")).upsert(chunk,{onConflict:"loai,id"}).select("id");
      if(insErr){
        console.error(`dbUpsertBomMauRows(${loai}) upsert error:`,insErr.message,insErr,"sample:",chunk[0]);
        throw new Error(`Lỗi lưu BOM Mẫu (dòng ${i+1}-${i+chunk.length}/${cleanRows.length}): ${insErr.message}`);
      }
      if((insData?.length||0)<chunk.length){
        console.error(`dbUpsertBomMauRows(${loai}): RLS/permission chặn âm thầm — gửi`,chunk.length,"dòng nhưng DB chỉ xác nhận ghi",insData?.length||0,"dòng.");
        throw new Error(`Supabase chỉ lưu được ${insData?.length||0}/${chunk.length} dòng (khả năng do Row Level Security policy chặn quyền ghi bảng bom_mau) — kiểm tra lại RLS policy trên Supabase`);
      }
    }
    return {ok:true,count:cleanRows.length};
  };
  // ✅ Xóa đúng các id trong 1 loại BOM Mẫu cụ thể — không xóa-theo-khác-biệt cả mảng.
  const dbDeleteBomMauRows=async(loai, ids)=>{
    const clean=[...new Set((ids||[]).filter(Boolean))];
    if(!clean.length) return {ok:true,count:0};
    const {error}=await supabase.from(T("bom_mau")).delete().eq("loai",loai).in("id",clean).select("id");
    if(error){
      console.error(`dbDeleteBomMauRows(${loai}) error:`,error.message,error);
      throw new Error("Lỗi xóa BOM Mẫu: "+error.message);
    }
    return {ok:true,count:clean.length};
  };
  // Thêm/sửa 1 LOẠI BOM mẫu (tên/icon/màu) lên bảng "bom_mau_loai".
  const dbUpsertBomMauLoai=async(l)=>{
    const {data,error}=await supabase.from(T("bom_mau_loai")).upsert(l,{onConflict:"id"}).select("id");
    if(error){
      console.error("dbUpsertBomMauLoai error:",error.message,error);
      throw new Error("Lỗi lưu loại BOM mẫu: "+error.message);
    }
    if(!data?.length){
      console.error("dbUpsertBomMauLoai: RLS/permission chặn âm thầm cho loại",l.id);
      throw new Error("Supabase không xác nhận lưu được loại BOM mẫu (khả năng do Row Level Security policy chặn quyền ghi bảng bom_mau_loai) — kiểm tra lại RLS policy trên Supabase");
    }
  };
  // Xóa 1 loại BOM mẫu — nhờ khóa ngoại "on delete cascade" trên bảng "bom_mau",
  // toàn bộ mã vật tư thuộc loại đó cũng tự xóa theo.
  const dbDeleteBomMauLoai=async(id)=>{
    const {error}=await supabase.from(T("bom_mau_loai")).delete().eq("id",id);
    if(error){
      console.error("dbDeleteBomMauLoai error:",error.message,error);
      throw new Error("Lỗi xóa loại BOM mẫu: "+error.message);
    }
  };
  // ✅ FIX (Lô SX/Lệnh SX/Ngày/SOP): "Thêm dự án mới" giờ gửi thêm các cột mới (lo_sx, lenh_sx,
  // ngay_khoi_tao, ngay_hoan_thanh, sop_tu, sop_den) lên bảng "projects". PHẢI chạy SQL dưới đây
  // trên Supabase (SQL Editor) 1 LẦN cho MỖI bảng projects đang dùng (bảng gốc "projects" của
  // Mini Bus, và "projects_citybus"/"projects_12m"... của các dòng xe khác nếu có) — nếu không,
  // upsert sẽ báo lỗi "column ... does not exist":
  //
  //   alter table projects add column if not exists lo_sx text default '';
  //   alter table projects add column if not exists lenh_sx text default '';
  //   alter table projects add column if not exists ngay_khoi_tao text default '';
  //   alter table projects add column if not exists ngay_hoan_thanh text default '';
  //   alter table projects add column if not exists sop_tu text default '';
  //   alter table projects add column if not exists sop_den text default '';
  //   alter table projects add column if not exists ngay_du_vt text default '';
  //   alter table projects add column if not exists du_vt_ts text default '';
  // ("ngay_du_vt"/"du_vt_ts" — NGÀY dự án ĐẠT ĐỦ 100% vật tư lần đầu tiên, ghi tự động, dùng
  // cho cột "NGÀY HOÀN THÀNH VẬT TƯ" ở bảng danh sách "Dự án đã hoàn thành", xem effect gần
  // "projFullyReceived" ở trên.)
  const dbUpsertProj=async(p)=>{
    // ✅ FIX: supabase.from(...).upsert() KHÔNG tự throw khi lưu thất bại — nó trả về
    // {data, error}. Code cũ chỉ try/catch lỗi network/exception, không kiểm tra field
    // `error`, nên nếu upsert project thất bại (RLS, lỗi cột, v.v.) thì lỗi bị nuốt im
    // lặng và mkProj() vẫn tưởng project đã lưu xong, tiếp tục lưu BOM cho 1 project
    // không tồn tại trên DB → reload lại thấy mất luôn cả project + BOM.
    //
    // ✅ QUAN TRỌNG: thêm .select(). Nếu Row Level Security (RLS) chặn quyền INSERT/UPDATE
    // (vd. policy chỉ cho phép SELECT với anon key), Postgrest KHÔNG trả lỗi (error vẫn
    // null) — nó chỉ âm thầm ghi được 0 dòng. Đây là nguyên nhân rất phổ biến của triệu
    // chứng "lưu xong, không báo lỗi, nhưng reload là mất dữ liệu" với Supabase.
    const {data,error}=await supabase.from(T("projects")).upsert(p).select("id");
    if(error){
      console.error("dbUpsertProj error:",error.message,error);
      throw new Error("Lỗi lưu dự án: "+error.message);
    }
    if(!data?.length){
      console.error("dbUpsertProj: RLS/permission chặn âm thầm — upsert không trả về dòng nào cho project",p.id);
      throw new Error("Supabase không xác nhận lưu được dự án (khả năng cao do Row Level Security policy chặn quyền ghi bảng projects) — kiểm tra lại RLS policy trên Supabase");
    }
  };
  const dbDeleteProj=async(id)=>{
    try{await supabase.from(T("projects")).delete().eq("id",id);}catch(e){console.error("dbDeleteProj:",e);}
  };
  const dbSavePhieu=async(ph)=>{
    // ⚠️ FIX BUG: "Kho Vật Tư soạn 15 mã nhưng XƯỞNG HÀN mở lên thấy 0 mã, dù Tổng cộng
    // vẫn ghi 15 chủng loại". Nguyên nhân: hàm này TRƯỚC ĐÂY chỉ try/catch lỗi network,
    // không kiểm tra field `error` Supabase trả về, và không dùng .select() để xác nhận
    // đã ghi đủ dòng. Nếu RLS chặn quyền ghi bảng "phieu_ct" (rất phổ biến), Postgrest
    // KHÔNG báo lỗi — nó chỉ âm thầm ghi 0 dòng. Bảng "phieu" (chứa cột tong=15) vẫn lưu
    // được bình thường vì không bị chặn, nên người soạn thấy phiếu "lưu thành công" và
    // local state của họ vẫn có đủ ct — nhưng khi người khác (XƯỞNG HÀN) tải phiếu từ
    // Supabase, phieu_ct trống trơn → 0 mã, 0/0 đã duyệt, dù tong vẫn hiện 15.
    // Giờ kiểm tra chặt: nếu ghi thiếu dòng, NÉM LỖI ngay để người soạn biết và thử lại,
    // thay vì âm thầm để lại một phiếu "ma" (có tong nhưng rỗng ct) trên hệ thống.
    const {ct,...phData}=ph;
    const {data:phRes,error:phErr}=await supabase.from(T("phieu")).upsert(phData).select("id");
    if(phErr) throw new Error("Lỗi lưu phiếu: "+phErr.message);
    if(!phRes?.length) throw new Error("Supabase không xác nhận lưu được phiếu (khả năng cao do Row Level Security chặn quyền ghi bảng phieu) — kiểm tra lại RLS policy trên Supabase");
    if(ct?.length){
      const {data:ctRes,error:ctErr}=await supabase.from(T("phieu_ct")).upsert(ct).select("id");
      if(ctErr) throw new Error("Lỗi lưu chi tiết phiếu: "+ctErr.message);
      if((ctRes?.length||0)<ct.length) throw new Error(`Supabase chỉ lưu được ${ctRes?.length||0}/${ct.length} dòng chi tiết vật tư (khả năng cao do Row Level Security chặn quyền ghi bảng phieu_ct) — kiểm tra lại RLS policy trên bảng phieu_ct. Nếu không sửa, bên nhận sẽ thấy phiếu "${ph.sp}" bị THIẾU MÃ hoặc trống trơn!`);
    }
  };
  // ✅ FIX: Bảng "chi tiết giao xe" trước đây KHÔNG lưu lên Supabase — dbAddLS chỉ là hàm
  // rỗng (no-op) do quyết định cũ "không phát sinh thêm dữ liệu" cho MỌI loại lịch sử (tạo
  // mới BOM, xuất kho, duyệt phiếu...). Giờ bật lại RIÊNG cho việc ghi nhận GIAO XE (gọi từ
  // submitGiaoXe bên dưới) — các addLS() khác trong app (tạo BOM, xuất kho, duyệt phiếu…)
  // VẪN chỉ lưu cục bộ như cũ, không đổi hành vi, để không phát sinh thêm ghi DB ngoài ý muốn.
  //
  // ⚠️ SQL cần chạy 1 lần trên Supabase (SQL Editor) nếu bảng "lich_su" (hoặc "lich_su_<dòng
  // xe>") chưa có các cột dưới đây — script này AN TOÀN chạy nhiều lần (IF NOT EXISTS):
  //
  //   alter table lich_su add column if not exists ho_va_ten text;
  //   alter table lich_su add column if not exists ngay_giao text;
  //   alter table lich_su add column if not exists gio_giao text;
  //   alter table lich_su add column if not exists dong_xe text;
  //   alter table lich_su add column if not exists sop text;
  //   -- Nếu app đang chạy nhiều dòng xe riêng bảng (vd lich_su_xh, lich_su_mb2...), chạy
  //   -- thêm câu lệnh trên cho từng bảng lich_su_<dòng xe> tương ứng.
  //
  const dbAddLS=async(row)=>{
    const {data,error}=await supabase.from(T("lich_su")).upsert(row).select("id");
    if(error){
      console.error("dbAddLS error:",error.message,error);
      throw new Error("Lỗi lưu lịch sử giao xe: "+error.message);
    }
    if(!data?.length){
      console.error("dbAddLS: RLS/permission chặn âm thầm — upsert không trả về dòng nào cho lịch sử",row.id);
      throw new Error("Supabase không xác nhận lưu được lịch sử giao xe (khả năng do RLS policy chặn quyền ghi bảng lich_su)");
    }
  };
  // ✅ Xoá 1 dòng lịch sử giao xe (dùng để dọn các dòng trùng Sop do ghi nhận đồng thời
  // từ nhiều phiên/thiết bị gây ra). Xoá cả trên Supabase lẫn state cục bộ.
  const dbDeleteLS=async(id)=>{
    const {error}=await supabase.from(T("lich_su")).delete().eq("id",id);
    if(error){
      console.error("dbDeleteLS error:",error.message,error);
      throw new Error("Lỗi xoá lịch sử giao xe: "+error.message);
    }
  };
  // ⚠️ Đã bỏ hẳn "Nhật ký thay đổi BOM" (bảng Supabase "bom_log") cùng với tab Thống kê.
  const addBomLog=()=>{};
  const dbUpdatePhieuCt=async(ctid,ok,nguoi_duyet?,sl_thuc_nhan?,sl_thieu?)=>{
    try{
      const upd:any={ok};
      if(nguoi_duyet!==undefined)upd.nguoi_duyet=nguoi_duyet;
      if(sl_thuc_nhan!==undefined)upd.sl_thuc_nhan=sl_thuc_nhan;
      if(sl_thieu!==undefined)upd.sl_thieu=sl_thieu;
      await supabase.from(T("phieu_ct")).update(upd).eq("id",ctid);
    }catch(e){console.error("dbUpdatePhieuCt:",e);}
  };
  const dbUpdatePhieuTt=async(phid,tt)=>{
    try{await supabase.from(T("phieu")).update({tt}).eq("id",phid);}catch(e){console.error("dbUpdatePhieuTt:",e);}
  };
  const dbDeletePhieu=async(phid)=>{
    try{
      await supabase.from(T("phieu_ct")).delete().eq("phid",phid);
      await supabase.from(T("phieu")).delete().eq("id",phid);
    }catch(e){console.error("dbDeletePhieu:",e);}
  };
  const dbUpsertUser=async(u)=>{
    const {error}=await supabase.from("users").upsert(u,{onConflict:"id"});
    if(error){
      console.error("dbUpsertUser:",error);
      alert("⚠️ Lưu thất bại: "+error.message+"\nThay đổi CHƯA được lưu xuống máy chủ.");
      return false;
    }
    return true;
  };
  const dbDeleteUser=async(id)=>{
    const {error}=await supabase.from("users").delete().eq("id",id);
    if(error){
      console.error("dbDeleteUser:",error);
      alert("⚠️ Xóa thất bại: "+error.message);
      return false;
    }
    return true;
  };
  // ✅ Lưu phân quyền dòng xe của 1 đơn vị (bảng quyen_dong_xe). Nếu bảng chưa được
  // tạo trên Supabase, báo lỗi nhẹ ở console — không chặn UI, thay đổi vẫn giữ ở state
  // cục bộ cho phiên làm việc hiện tại.
  const dbUpsertQuyenDongXe=async(don_vi,dong_xe)=>{
    try{
      const {error}=await supabase.from("quyen_dong_xe").upsert({don_vi,dong_xe},{onConflict:"don_vi"});
      if(error){
        console.error("dbUpsertQuyenDongXe:",error);
        alert("⚠️ Chưa lưu được phân quyền xuống máy chủ: "+error.message+"\n(Có thể bảng quyen_dong_xe chưa được tạo trên Supabase — xem hướng dẫn SQL ở comment gần LINE_QUYEN_DEFAULT trong code.)");
        return false;
      }
      return true;
    }catch(e){
      console.error("dbUpsertQuyenDongXe:",e);
      return false;
    }
  };
  const dbUpsertQuyenChucNang=async(don_vi,chuc_nang)=>{
    try{
      const {error}=await supabase.from("quyen_chuc_nang").upsert({don_vi,chuc_nang},{onConflict:"don_vi"});
      if(error){
        console.error("dbUpsertQuyenChucNang:",error);
        alert("⚠️ Chưa lưu được phân quyền chức năng xuống máy chủ: "+error.message+"\n(Có thể bảng quyen_chuc_nang chưa được tạo trên Supabase — xem hướng dẫn SQL ở comment gần TAB_QUYEN_DEFAULT trong code.)");
        return false;
      }
      return true;
    }catch(e){
      console.error("dbUpsertQuyenChucNang:",e);
      return false;
    }
  };
  // 🖼️ Lưu/xóa 1 mục CMS (nội dung / banner / ảnh đại diện) — bảng "cms_content".
  const dbUpsertCms=async(item)=>{
    try{
      const {error}=await supabase.from("cms_content").upsert(item,{onConflict:"id"});
      if(error){
        console.error("dbUpsertCms:",error);
        alert("⚠️ Lưu thất bại: "+error.message+"\n(Có thể bảng cms_content chưa được tạo trên Supabase — xem hướng dẫn SQL ở comment gần khai báo state cmsItems trong code.)");
        return false;
      }
      return true;
    }catch(e){
      console.error("dbUpsertCms:",e);
      alert("⚠️ Lưu thất bại: "+(e.message||"lỗi không xác định"));
      return false;
    }
  };
  const dbDeleteCms=async(id)=>{
    try{
      const {error}=await supabase.from("cms_content").delete().eq("id",id);
      if(error){
        console.error("dbDeleteCms:",error);
        alert("⚠️ Xóa thất bại: "+error.message);
        return false;
      }
      return true;
    }catch(e){
      console.error("dbDeleteCms:",e);
      return false;
    }
  };
  // được chọn nhận nhìn thấy trong app (🔔), song song vẫn trả về true/false để caller
  // tiếp tục gọi Web Share API (Zalo/SMS/Email) ngay sau khi lưu thành công.
  const dbGuiCanhBao=async(row)=>{
    try{
      const {error}=await supabase.from(T("canh_bao_khan")).upsert(row);
      if(error){
        console.error("dbGuiCanhBao:",error);
        alert("⚠️ Chưa lưu được cảnh báo khẩn cấp lên hệ thống: "+error.message+"\n(Có thể bảng canh_bao_khan chưa được tạo trên Supabase — xem hướng dẫn SQL ở comment gần TAB_META trong code.)\nVẫn có thể tiếp tục gửi ra ngoài (Zalo/SMS/Email).");
        return false;
      }
      setCanhBaoKhan(cs=>[row,...cs]);
      return true;
    }catch(e){
      console.error("dbGuiCanhBao:",e);
      return false;
    }
  };
  // Đánh dấu 1 đơn vị đã xem 1 cảnh báo khẩn cấp (cộng dồn vào doc_boi, không ghi đè)
  const dbDanhDauDocCanhBao=async(id,donVi)=>{
    try{
      const cb=canhBaoKhan.find(c=>c.id===id);
      if(!cb||(cb.doc_boi||[]).includes(donVi))return;
      const docBoiMoi=[...(cb.doc_boi||[]),donVi];
      setCanhBaoKhan(cs=>cs.map(c=>c.id===id?{...c,doc_boi:docBoiMoi}:c));
      await supabase.from(T("canh_bao_khan")).update({doc_boi:docBoiMoi}).eq("id",id);
    }catch(e){console.error("dbDanhDauDocCanhBao:",e);}
  };
  // 💬 Phản hồi lại 1 cảnh báo khẩn cấp — cộng dồn vào phan_hoi (không ghi đè), lưu Supabase
  // để TẤT CẢ đơn vị liên quan (người gửi gốc + các đơn vị nhận) đều thấy phản hồi này khi
  // mở lại 🔔. ✅ MỌI đơn vị liên quan (trừ đơn vị vừa phản hồi) đều được đưa vào danh sách
  // "phan_hoi_chua_doc" → hiện badge đỏ trên chuông 🔔 — kể cả khi phản hồi qua lại NHIỀU LẦN
  // liên tiếp, mỗi lần đều báo lại cho tất cả các bên (không chỉ người gửi gốc).
  const dbPhanHoiCanhBao=async(cb,noiDung)=>{
    try{
      const reply={nguoi:user.ten, don_vi:user.don_vi, noi_dung:noiDung, ts:new Date().toISOString()};
      const phanHoiMoi=[...(cb.phan_hoi||[]),reply];
      const donViLienQuan=Array.from(new Set([cb.don_vi_gui,...(cb.don_vi_nhan||[])].filter(Boolean)));
      const phanHoiChuaDoc=donViLienQuan.filter(dv=>dv!==user.don_vi);
      setCanhBaoKhan(cs=>cs.map(c=>c.id===cb.id?{...c,phan_hoi:phanHoiMoi,phan_hoi_chua_doc:phanHoiChuaDoc}:c));
      const {error}=await supabase.from(T("canh_bao_khan")).update({phan_hoi:phanHoiMoi,phan_hoi_chua_doc:phanHoiChuaDoc}).eq("id",cb.id);
      if(error){
        console.error("dbPhanHoiCanhBao:",error);
        alert("⚠️ Chưa lưu được phản hồi lên hệ thống: "+error.message+"\n(Có thể cần chạy: alter table canh_bao_khan add column if not exists phan_hoi jsonb not null default '[]'::jsonb; alter table canh_bao_khan add column if not exists phan_hoi_chua_doc jsonb not null default '[]'::jsonb; — cho cả 3 bảng theo dòng xe.)");
        return;
      }
      flash("💬 Đã gửi phản hồi");
    }catch(e){console.error("dbPhanHoiCanhBao:",e);}
  };
  // 🔕 Đánh dấu ĐƠN VỊ CỦA MÌNH đã xem phản hồi mới nhất (bỏ mình ra khỏi phan_hoi_chua_doc)
  // — gọi khi mở 🔔. Áp dụng cho mọi đơn vị liên quan, không riêng người gửi gốc.
  const dbDanhDauDaXemPhanHoi=async(id)=>{
    try{
      const cb=canhBaoKhan.find(c=>c.id===id);
      if(!cb||!(cb.phan_hoi_chua_doc||[]).includes(user.don_vi))return;
      const chuaDocMoi=(cb.phan_hoi_chua_doc||[]).filter(dv=>dv!==user.don_vi);
      setCanhBaoKhan(cs=>cs.map(c=>c.id===id?{...c,phan_hoi_chua_doc:chuaDocMoi}:c));
      await supabase.from(T("canh_bao_khan")).update({phan_hoi_chua_doc:chuaDocMoi}).eq("id",id);
    }catch(e){console.error("dbDanhDauDaXemPhanHoi:",e);}
  };

  // ── Derived ──
  const bom   = bomDB[pid]  || [];
  const bomFull = bom; // alias giữ tham chiếu gốc — dùng khi cần lọc riêng theo role (VD tab Soạn Hàng) mà không ảnh hưởng chỗ khác
  const ls    = lsDB[pid]   || [];
  const phList= phDB[pid]   || [];
  const soan  = soanDB[pid] || {};
  const proj  = projs.find(p=>p.id===pid) || projs[0] || {mau:"#1d4ed8",icon:"🚐",ten:"",so_xe:1};
  const soXe  = proj.so_xe||1;
  const DMS   = [...new Set(bom.map(v=>v.ng).filter(Boolean))].sort(sapXepDM);

  // ✅ Một dự án được coi là "đã nhận đủ vật tư toàn bộ" khi MỌI mã trong BOM của dự án đó
  // đã được xác nhận nhận đủ số lượng cần — tính riêng cho TỪNG dự án p bằng bomDB[p.id] +
  // phDB[p.id] (không phụ thuộc dự án đang chọn/pid). Dùng chung cho cả useEffect đồng bộ
  // trang con "Báo cáo" bên dưới và danh sách "Đã hoàn thành" trong tab Báo cáo.
  const projFullyReceived=useCallback((p)=>{
    const soXeP=p.so_xe||1;
    const bomP=bomDB[p.id]||[];
    // ✅ So sánh pid bằng String(...) ở cả 2 vế để tránh lệch do khác kiểu dữ liệu
    // (string vs number) giữa p.id và trường "pid" lưu trong từng phiếu — lệch kiểu khiến
    // phP luôn rỗng và dự án bị coi nhầm là "chưa đủ vật tư" dù thực tế đã đủ.
    const phP=(phDB[p.id]||[]).filter(x=>String(x.pid)===String(p.id));
    const dnXNMapP={};
    for(const ph of phP){
      for(const c of(ph.ct||[])){
        if(c.ok) dnXNMapP[c.ma]=(dnXNMapP[c.ma]||0)+(c.sl_thuc_nhan??c.sl??0);
      }
    }
    const EPS=1e-6;
    return bomP.length>0&&bomP.every(v=>{
      const cn=(Number(v.dm)||0)*soXeP;
      const dn=Number(dnXNMapP[v.ma])||0;
      return dn+EPS>=cn;
    });
  },[bomDB,phDB]);

  // ✅ Tự động ghi nhận "NGÀY HOÀN THÀNH VẬT TƯ" = ngày dự án ĐẠT ĐỦ 100% vật tư LẦN ĐẦU TIÊN
  // — dùng cho cột "NGÀY HOÀN THÀNH VẬT TƯ (ngày duyệt đủ vật tư)" ở bảng "Dự án đã hoàn thành".
  // Hệ thống không lưu sẵn thời điểm duyệt đủ của TỪNG mã, nên ta đánh dấu ngay thời điểm PHÁT
  // HIỆN dự án đủ 100% (projFullyReceived) — chỉ ghi 1 LẦN DUY NHẤT (bỏ qua nếu đã có
  // "du_vt_ts"), áp dụng cho MỌI dự án (không chỉ dự án đang chọn/pid) nhờ projFullyReceived
  // hoạt động độc lập theo bomDB/phDB của từng dự án.
  useEffect(()=>{
    const toStamp=projs.filter(p=>!p.du_vt_ts&&projFullyReceived(p));
    if(toStamp.length===0) return;
    const now=new Date();
    const ngay=now.toISOString().slice(0,10);
    setProjs(ps=>ps.map(p=>toStamp.some(x=>x.id===p.id)?{...p,ngay_du_vt:ngay,du_vt_ts:now.toISOString()}:p));
    toStamp.forEach(p=>{ dbUpsertProj({...p,ngay_du_vt:ngay,du_vt_ts:now.toISOString()}).catch(()=>{}); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[projs,projFullyReceived]);

  // ✅ bcDoneList (danh sách "Đã hoàn thành" của tab Báo cáo) được tính bên dưới, SAU khi
  // "duAll" (biến đã kiểm chứng đúng, dùng để tô màu banner "Đã nhận đủ vật tư toàn bộ!")
  // được khai báo — để dự án ĐANG XEM luôn dùng CHUNG 1 kết quả duy nhất với banner, tránh
  // lệch số liệu giữa banner và badge đếm.
  //
  // ⚠️ FIX "màn hình trắng" (Cannot access 'duAll' before initialization): effect tự đồng bộ
  // trang con của tab "Báo cáo" (trước đây đặt ngay tại đây) dùng biến "duAll" trong dependency
  // array, nhưng "duAll" là `const` được khai báo PHÍA DƯỚI (gần dòng tính maDone/bom) — cùng
  // 1 component nên bị Temporal Dead Zone, ReactDOM ném lỗi ngay khi mount → crash toàn bộ app.
  // Đã DI CHUYỂN nguyên khối effect đó xuống ngay sau chỗ khai báo "const duAll=..." để đảm bảo
  // biến được khởi tạo trước khi effect đọc nó. Xem effect đó ở gần "const duAll=...".

  // ── Helpers ──
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(""),2500);};

  const addLS=(p2,r)=>setLsDB(s=>({...s,[p2]:[{id:uid(),ts:new Date().toISOString(),...r},...(s[p2]||[])].slice(0,200)}));
  const sw=useCallback(id=>{setPid(id);setSearch("");setFdm("Tất cả");localStorage.setItem("lastPid",id);},[]);

  // ✅ Đánh dấu 1 dự án là "Hoàn thành" — chuyển sang hiển thị ở màn "Đã thực hiện".
  // Dự án nào bấm "Hoàn thành" SAU CÙNG luôn hiện STT 1 (sắp theo hoan_thanh_ts giảm dần).
  const markProjectDone=async(p)=>{
    if(!window.confirm(`Đánh dấu dự án "${p.ten}" là ĐÃ HOÀN THÀNH?\nDự án sẽ chuyển sang mục "Đã thực hiện".`))return;
    const now=new Date();
    const updated={...p,trang_thai:"hoan_thanh",ngay_hoan_thanh:now.toISOString().slice(0,10),hoan_thanh_ts:now.toISOString()};
    setProjs(ps=>ps.map(x=>x.id===p.id?updated:x));
    try{ await dbUpsertProj(updated); }
    catch(e){ flash(`⚠️ Lưu trạng thái hoàn thành thất bại: ${e.message}`); }
  };

  // ── Lưu soanDB vào localStorage mỗi khi thay đổi ──
  useEffect(()=>{try{localStorage.setItem("soanDB",JSON.stringify(soanDB));}catch{};},[soanDB]);

  // ── Lưu tab đang xem vào localStorage mỗi khi thay đổi (giữ đúng trang qua các lần reload) ──
  useEffect(()=>{try{if(tab)localStorage.setItem("lastTab",tab);}catch{};},[tab]);

  // ✅ FIX: Lưu MÀN HÌNH đang xem (Khởi tạo Dự án / Tổng quan / hệ thống chính) vào localStorage.
  // Nhờ vậy khi người dùng refresh (F5) ở bất kỳ trang nào, app sẽ mở lại ĐÚNG trang đó — không
  // tự thoát về trang khác (trang chính/gate...).
  useEffect(()=>{
    try{
      if(showKhoiTao) localStorage.setItem("screenMode","khoiTao");
      else if(showTongQuan) localStorage.setItem("screenMode","tongQuan");
      else if(showDaThucHien) localStorage.setItem("screenMode","daThucHien");
      else if(backToGate) localStorage.setItem("screenMode","gate");
      else localStorage.setItem("screenMode","main");
    }catch{}
  },[showKhoiTao,showTongQuan,showDaThucHien,backToGate]);

  // ── Đồng bộ phiên đăng nhập vào localStorage (giữ đăng nhập qua các lần auto-reload) ──
  useEffect(()=>{
    try{
      if(user) localStorage.setItem("loggedInUser",JSON.stringify(user));
      else localStorage.removeItem("loggedInUser");
    }catch{}
  },[user]);

  // ── BOM CRUD ──
  const save=async()=>{
    if(!cur.ma.trim()||!cur.ten.trim())return;
    const edit=modal==="edit";
    // ✅ FIX: tính savedRow TRỰC TIẾP từ bomDB hiện có, KHÔNG gán bên trong callback của
    // setBomDB nữa. Trước đây savedRow chỉ được gán khi callback của setBomDB chạy, nhưng
    // React KHÔNG đảm bảo callback đó chạy đồng bộ ngay lúc gọi (tùy thời điểm/lượt render
    // đang chờ xử lý) — nên có lúc await dbUpsertBomRows(pid,[savedRow]) chạy với savedRow
    // vẫn còn là null, khiến việc "Sửa" xong bấm "Lưu" không được ghi lên Supabase. Tính
    // savedRow ngay tại đây đảm bảo luôn có giá trị đúng trước khi gửi lên máy chủ.
    const oldRows=bomDB[pid]||[];
    let savedRow;
    if(edit){
      const existing=oldRows.find(v=>v.ma===cur.ma);
      savedRow={...(existing||{}),...cur};
    }else{
      const ns=oldRows.length?Math.max(...oldRows.map(v=>v.stt))+1:1;
      savedRow={id:uid(),pid,stt:ns,...cur};
    }
    setBomDB(s=>{
      const old=s[pid]||[];
      const next= edit
        ? {...s,[pid]:old.map(v=>v.ma===cur.ma?{...v,...savedRow}:v)}
        : {...s,[pid]:[...old,savedRow]};
      return next;
    });
    if(!edit)addLS(pid,{pid,ma:cur.ma,ten:cur.ten,loai:"Tạo mới",sl:cur.dm,gc:""});
    addBomLog(edit?"sua":"them",cur);
    setModal(null);
    // ✅ AN TOÀN NHIỀU NGƯỜI DÙNG + KHÔNG BÁO THÀNH CÔNG GIẢ: chỉ upsert ĐÚNG 1 dòng vừa
    // lưu (dbUpsertBomRows — không xóa gì cả, xem giải thích chi tiết ở định nghĩa hàm),
    // và PHẢI await xác nhận lưu Supabase xong rồi mới báo "✓ Đã lưu" — trước đây báo
    // thành công ngay lập tức dù chưa biết lệnh lưu có thật sự thành công hay không.
    flash("⏳ Đang lưu...");
    try{
      await dbUpsertBomRows(pid,[savedRow]);
      flash("✓ Đã lưu");
    }catch(e){
      console.error("save() error:",e);
      flash("❌ Lưu lên máy chủ thất bại: "+e.message+" — hãy thử lại!");
    }
  };
  const del=async v=>{
    if(!window.confirm(`Xóa "${v.ten}"?`))return;
    setBomDB(s=>({...s,[pid]:(s[pid]||[]).filter(x=>x.ma!==v.ma)}));
    addBomLog("xoa",v);
    // ✅ Chỉ xóa ĐÚNG dòng này theo id (dbDeleteBomItems) — không còn dùng cách "xóa mọi
    // dòng không có trong mảng local" như trước, để không lỡ tay xóa dữ liệu người khác
    // vừa thêm ở trạm khác mà máy này chưa kịp có. Và PHẢI await xác nhận xóa xong trên
    // Supabase rồi mới báo "✓ Đã xóa", không báo thành công giả.
    flash("⏳ Đang xóa...");
    try{
      await dbDeleteBomItems([v.id]);
      flash("✓ Đã xóa");
    }catch(e){
      console.error("del() error:",e);
      flash("❌ Xóa trên máy chủ thất bại: "+e.message+" — hãy thử lại!");
    }
  };
  // ── Xoá TOÀN BỘ vật tư (BOM) của dự án đang xem — chỉ dành cho tài khoản Xưởng hàn ──
  const xoaToanBoBom=async()=>{
    if(!isXH)return;
    if(!bom.length){flash("Dự án này chưa có vật tư nào.");return;}
    if(!window.confirm(`⚠️ XOÁ TOÀN BỘ ${bom.length} mã vật tư của dự án "${proj.ten}"?\n\nHành động này sẽ xoá VĨNH VIỄN toàn bộ danh sách vật tư (kể cả trạng thái đã nhận, ảnh...) và KHÔNG THỂ hoàn tác.`))return;
    if(!window.confirm(`Xác nhận lần cuối: XOÁ VĨNH VIỄN ${bom.length} mã vật tư?`))return;
    const rowsCu=bom;
    setBomDB(s=>({...s,[pid]:[]}));
    addBomLog("xoa",{ma:"—",ten:`Xoá toàn bộ BOM (${rowsCu.length} mã)`});
    flash("⏳ Đang xoá toàn bộ vật tư...");
    try{
      await dbDeleteBomByPid(pid);
      flash(`✓ Đã xoá toàn bộ ${rowsCu.length} mã vật tư`);
    }catch(e){
      console.error("xoaToanBoBom() error:",e);
      // Khôi phục lại state local nếu xóa trên server thất bại
      setBomDB(s=>({...s,[pid]:rowsCu}));
      flash("❌ Xoá trên máy chủ thất bại: "+e.message+" — hãy thử lại!");
    }
  };
  const doIO=()=>{
    const loai=modal==="nhap"?"Nhập kho":"Xuất kho";
    const sl=parseInt(slXT)||1;
    const row={id:uid(),pid,ma:cur.ma,ten:cur.ten,loai,sl:modal==="nhap"?sl:-sl,gc:gcXT,ts:new Date().toISOString()};
    addLS(pid,row);
    dbAddLS(row);
    setModal(null);flash(`✓ ${loai} ${sl} ${cur.dv}`);
  };

  // ── Projects ──
  const mkProj=async()=>{
    if(!nPF.ten.trim())return;
    const id="proj_"+Date.now();
    const p={id,ten:nPF.ten,mo_ta:nPF.moTa||nPF.ten,mau:nPF.mau,icon:nPF.icon,so_xe:parseInt(nPF.so_xe)||1,
      lo_sx:nPF.loSx||"",lenh_sx:nPF.lenhSx||"",ngay_khoi_tao:nPF.ngayKhoiTao||"",ngay_hoan_thanh:nPF.ngayHoanThanh||"",
      sop_tu:nPF.sopTu||"",sop_den:nPF.sopDen||"",trang_thai:"dang_thuc_hien",hoan_thanh_ts:""};
    const seed=nPF.bom==="import_file"?[]:getBomMauRows(nPF.bom);
    // Nếu chọn "Import BOM (Excel, CSV)" VÀ đã đọc được file → dùng dữ liệu file đó làm BOM ban đầu
    // (dùng CHUNG cách map dữ liệu với doXlsImport: id,pid + các field đã chuẩn hoá từ parseXlsFile)
    const willImport=nPF.bom==="import_file";
    const bomRows = (willImport && newProjXlsPreview.length)
      ? newProjXlsPreview.map(v=>({id:uid(),pid:id,...v,anh:""}))
      : mkBom(id,seed);

    // ✅ FIX: Lưu project lên Supabase TRƯỚC, chờ chắc chắn thành công, rồi mới cập nhật
    // state local + lưu BOM. Trước đây: cập nhật state local (setProjs/setBomDB) và đóng
    // modal NGAY, rồi mới gọi dbUpsertProj — nếu dbUpsertProj thất bại (trước đây lỗi này
    // còn bị nuốt im lặng), người dùng vẫn thấy dự án xuất hiện trên UI như bình thường,
    // nhưng reload lại thì dự án (và BOM của nó) biến mất hoàn toàn vì chưa từng có trên DB.
    try{
      await dbUpsertProj(p);
    }catch(e){
      flash(`❌ TẠO DỰ ÁN THẤT BẠI: ${e.message} — Chưa có gì được lưu, hãy thử lại`);
      console.error("mkProj: lỗi lưu project:",e);
      return; // dừng hẳn, KHÔNG cập nhật state local, KHÔNG lưu BOM
    }

    // Project đã chắc chắn tồn tại trên DB → giờ mới cập nhật UI + đóng modal
    setProjs(ps=>[...ps,p]);
    setBomDB(s=>({...s,[id]:bomRows}));
    setNewP(false);
    setNPF({ten:"",moTa:"",mau:"#7c3aed",icon:"🚐",so_xe:1,bom:"import_file",
      loSx:"",lenhSx:"",ngayKhoiTao:new Date().toISOString().slice(0,10),ngayHoanThanh:"",sopTu:"",sopDen:""});
    setNewProjXlsPreview([]);
    setNewProjXlsErr("");

    // Có BOM (mẫu có sẵn hoặc từ file import) thì lưu luôn lên Supabase
    if(bomRows.length){
      try{
        const res=await dbUpsertBomRows(id,bomRows);
        // ✅ Nếu Supabase bỏ qua vài dòng lỗi (thiếu mã/tên...), đồng bộ lại state
        // local cho khớp với DB, để không bị "ảo" thấy đủ trên UI mà DB thiếu.
        if(res?.skipped>0){
          setBomDB(s=>({...s,[id]:bomRows.filter(r=>String(r.ma||"").trim()&&String(r.ten||"").trim())}));
        }
        sw(id);
        // ✅ Nếu đang ở màn "Khởi tạo Dự án" độc lập, tự động chuyển sang "Đang thực hiện"
        // ngay sau khi tạo dự án xong — dự án đã lưu lên Supabase (giao/nhận vật tư dùng
        // được bình thường như mọi dự án khác).
        if(showKhoiTao){setShowKhoiTao(false);setShowTongQuan(true);}
        if(res?.skipped>0){
          flash(`⚠️ Tạo dự án thành công nhưng ${res.skipped} dòng bị bỏ qua (thiếu Mã số/Tên vật tư) — đã lưu ${res.count}/${bomRows.length} mã`);
        } else {
          flash(`✓ Tạo dự án thành công (${bomRows.length} mã VT)`);
        }
      }catch(e){
        // ✅ Lưu BOM lỗi giữa đường → báo rõ cho người dùng, KHÔNG để họ tưởng đã xong.
        // Project đã chắc chắn tồn tại trên DB (bước trên đã chờ xong), nhưng BOM cần
        // import lại qua tab Vật tư.
        sw(id);
        if(showKhoiTao){setShowKhoiTao(false);setShowTongQuan(true);}
        flash(`⚠️ Tạo dự án xong nhưng LƯU BOM THẤT BẠI: ${e.message}. Vào tab Vật tư → Import Excel để thử lại`);
        console.error("mkProj: lỗi lưu BOM:",e);
      }
    } else {
      sw(id);
      if(showKhoiTao){setShowKhoiTao(false);setShowTongQuan(true);}
      if(willImport){
        flash("✓ Tạo dự án xong! Chưa có file BOM — vào tab Vật tư → bấm Import Excel để tải BOM");
      } else {
        flash(`✓ Tạo dự án thành công (0 mã VT)`);
      }
    }
  };
  const delProj=id=>{
    if(projs.length<=1){alert("Phải có ít nhất 1 dự án!");return;}
    if(!window.confirm("Xóa dự án?"))return;
    setProjs(ps=>ps.filter(p=>p.id!==id));
    dbDeleteProj(id);
    const nid=projs.find(p=>p.id!==id)?.id;
    if(nid)sw(nid);
  };
  const editProjName=(id,curTen)=>{
    const v=prompt("Sửa tên dự án:",curTen);
    if(v&&v.trim()){
      setProjs(ps=>{
        const next=ps.map(p=>p.id===id?{...p,ten:v.trim()}:p);
        const updated=next.find(p=>p.id===id);
        // ✅ dbUpsertProj giờ throw khi lỗi (trước đây tự nuốt lỗi) → bắt lỗi ở đây
        // để tránh unhandled rejection, đồng thời báo cho người dùng nếu lưu thất bại.
        if(updated)dbUpsertProj(updated).catch(e=>{
          console.error("editProjName: lỗi lưu:",e);
          flash(`⚠️ Lỗi lưu tên dự án: ${e.message}`);
        });
        return next;
      });
      flash("✓ Đã sửa tên dự án");
    }
  };
  // ✅ "Dòng xe" (cột mo_ta) — trước đây KHÔNG có cách nào sửa lại sau khi tạo dự án, nên
  // với các dự án cũ (tạo trước khi đổi nhãn "Mô tả"→"Dòng xe", hoặc bỏ trống lúc tạo) giá
  // trị này bị fallback về đúng TÊN dự án (mo_ta:nPF.moTa||nPF.ten lúc mkProj) → khiến ô
  // "Dòng xe" trong modal "Giao xe" hiển thị trùng tên dự án thay vì đúng dòng xe thật.
  const editProjMoTa=(id,curMoTa)=>{
    const v=prompt("Sửa Dòng xe:",curMoTa||"");
    if(v!==null){
      setProjs(ps=>{
        const next=ps.map(p=>p.id===id?{...p,mo_ta:v.trim()}:p);
        const updated=next.find(p=>p.id===id);
        if(updated)dbUpsertProj(updated).catch(e=>{
          console.error("editProjMoTa: lỗi lưu:",e);
          flash(`⚠️ Lỗi lưu Dòng xe: ${e.message}`);
        });
        return next;
      });
      flash("✓ Đã sửa Dòng xe");
    }
  };
  const editSoXe=()=>{
    const v=prompt("Số xe:",soXe);
    if(v&&!isNaN(v)&&Number(v)>0){
      setProjs(ps=>{
        const next=ps.map(p=>p.id===pid?{...p,so_xe:Math.round(Number(v))}:p);
        const updated=next.find(p=>p.id===pid);
        // ✅ dbUpsertProj giờ throw khi lỗi (trước đây tự nuốt lỗi) → bắt lỗi ở đây
        // để tránh unhandled rejection, đồng thời báo cho người dùng nếu lưu thất bại.
        if(updated)dbUpsertProj(updated).catch(e=>{
          console.error("editSoXe: lỗi lưu:",e);
          flash(`⚠️ Lỗi lưu số xe: ${e.message}`);
        });
        return next;
      });
    }
  };
  // ✅ "SL xe đã giao" — trước đây dùng prompt() đơn giản, giờ thay bằng modal "GHI NHẬN
  // GIAO XE" đầy đủ (loại xe, ngày giao, thời gian, nhân sự giao, SL xe). Mỗi lần xác nhận
  // là 1 ĐỢT giao xe mới — SL xe của đợt sẽ CỘNG DỒN vào tổng "da_giao" (kẹp không vượt so_xe).
  // ✅ Sinh danh sách Sop tuần tự từ khoảng "sop_tu" → "sop_den" khai báo lúc tạo dự án.
  // Giữ nguyên độ dài số 0 ở đầu (vd "001"→"010") theo độ dài dài nhất giữa 2 mốc.
  const buildSopRange=(tu,den)=>{
    const tuStr=String(tu||"").trim(), denStr=String(den||"").trim();
    if(!tuStr||!denStr) return[];
    const a=parseInt(tuStr,10), b=parseInt(denStr,10);
    if(isNaN(a)||isNaN(b)) return[];
    const lo=Math.min(a,b), hi=Math.max(a,b);
    const width=Math.max(tuStr.replace(/[^0-9]/g,"").length, denStr.replace(/[^0-9]/g,"").length);
    const out=[];
    for(let i=lo;i<=hi;i++) out.push(String(i).padStart(width,"0"));
    return out;
  };
  const openGiaoXeModal=(projId)=>{
    const p2=projs.find(p=>p.id===projId); if(!p2) return;
    const now=new Date();
    setGxNow(now);
    const allSop=buildSopRange(p2.sop_tu,p2.sop_den);
    const usedSop=new Set((lsDB[projId]||[]).filter(r=>r.loai==="Giao xe"&&r.sop).map(r=>r.sop));
    const firstAvail=allSop.find(s=>!usedSop.has(s))||"";
    setGxForm({sop:firstAvail, ngayGiao:now.toISOString().slice(0,10), hoVaTen:user?.ten||"", slXe:1});
    setGxModalPid(projId);
  };
  const submitGiaoXe=()=>{
    const projId=gxModalPid; if(!projId) return;
    const p2=projs.find(p=>p.id===projId); if(!p2) return;
    const slXe=Math.round(Number(gxForm.slXe));
    const allSopChk=buildSopRange(p2.sop_tu,p2.sop_den);
    if(allSopChk.length>0&&!gxForm.sop){flash("⚠️ Vui lòng chọn Sop!");return;}
    if(!gxForm.hoVaTen.trim()){flash("⚠️ Vui lòng nhập Họ và Tên nhân sự giao xe!");return;}
    if(!slXe||slXe<=0){flash("⚠️ SL xe phải lớn hơn 0!");return;}
    if(!gxForm.ngayGiao){flash("⚠️ Vui lòng chọn ngày giao!");return;}
    const now=new Date();
    const pad=n=>String(n).padStart(2,"0");
    const gioGiao=`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const idLog=uid();
    const tsLog=now.toISOString();
    const dongXe=p2.mo_ta||p2.ten;
    setProjs(ps=>{
      const next=ps.map(p=>p.id===projId?{...p,da_giao:Math.min((p.da_giao||0)+slXe,p.so_xe||1)}:p);
      const updated=next.find(p=>p.id===projId);
      if(updated)dbUpsertProj(updated).catch(e=>{
        console.error("submitGiaoXe: lỗi lưu:",e);
        flash(`⚠️ Lỗi lưu SL xe đã giao: ${e.message}`);
      });
      return next;
    });
    const lsRow={id:idLog,ts:tsLog,pid:projId,loai:"Giao xe",sl:slXe,ten:p2.ten,
      ho_va_ten:gxForm.hoVaTen,ngay_giao:gxForm.ngayGiao,gio_giao:gioGiao,dong_xe:dongXe,sop:gxForm.sop||"",
      nguoi_duyet:gxForm.hoVaTen,
      gc:`${dongXe} · Sop ${gxForm.sop||"—"} · Giao ${slXe} xe · ${gxForm.ngayGiao} ${gioGiao} · NS giao: ${gxForm.hoVaTen}`};
    addLS(projId,lsRow);
    // ✅ Lưu lịch sử giao xe lên Supabase — trước đây addLS chỉ lưu cục bộ nên reload là
    // mất, giờ gọi thêm dbAddLS để bảng "chi tiết giao xe" tồn tại lâu dài trên máy chủ.
    dbAddLS(lsRow).catch(e=>{
      console.error("submitGiaoXe: lỗi lưu lịch sử giao xe:",e);
      flash(`⚠️ Đã cập nhật SL xe nhưng LƯU LỊCH SỬ GIAO XE lên máy chủ thất bại: ${e.message}`);
    });
    setGxModalPid(null);
    flash("✅ Đã ghi nhận giao xe!");
  };
  // ✅ Xoá 1 dòng trong bảng "chi tiết giao xe" — dùng khi có dòng bị TRÙNG (do ghi nhận
  // đồng thời từ nhiều phiên/thiết bị chọn trùng Sop) hoặc ghi nhận NHẦM. Sau khi xoá,
  // "SL xe đã giao" tự cập nhật lại vì được tính trực tiếp từ tổng bảng này.
  const deleteGiaoXeLog=(projId,row)=>{
    if(!window.confirm(`Xoá dòng giao xe này?\nSop ${row.sop||"—"} · ${fmt(row.sl||0)} xe · ${row.ngay_giao||""}\nKhông thể hoàn tác!`))return;
    setLsDB(s=>({...s,[projId]:(s[projId]||[]).filter(r=>r.id!==row.id)}));
    dbDeleteLS(row.id).then(()=>{
      flash("✅ Đã xoá dòng giao xe!");
    }).catch(e=>{
      console.error("deleteGiaoXeLog:",e);
      flash(`⚠️ Xoá cục bộ thành công nhưng xoá trên máy chủ thất bại: ${e.message}`);
    });
  };
  // ⏱️ Đồng hồ thời gian thực trong modal Giao xe — chỉ chạy khi modal đang mở.
  useEffect(()=>{
    if(!gxModalPid)return;
    const iv=setInterval(()=>setGxNow(new Date()),1000);
    return ()=>clearInterval(iv);
  },[gxModalPid]);

  const [selMa,      setSelMa]      = useState(null);  // hàng được click
  const [showImport, setShowImport] = useState(false);
  const [importSrc,  setImportSrc]  = useState(()=>BOM_MAU_LOAI_DEFAULT[0]?.id||"xh");
  const [importMode, setImportMode] = useState("them"); // "them" | "thay"
  const [showXlsImport, setShowXlsImport] = useState(false);
  const [xlsPreview, setXlsPreview] = useState([]);
  const [xlsErr, setXlsErr] = useState("");
  const xlsRef = useRef();
  const importPidRef = useRef(null); // lưu pid đích khi import Excel
  // ── Import file ngay khi Tạo dự án mới (dùng CHUNG logic đọc file với Import Excel) ──
  const [newProjXlsPreview, setNewProjXlsPreview] = useState([]); // BOM đọc được từ file, áp dụng lúc bấm "Tạo dự án"
  const [newProjXlsErr, setNewProjXlsErr] = useState("");

  const doImport=async()=>{
    const seed=getBomMauRows(importSrc);
    // ✅ CHẨN ĐOÁN: nếu BOM Mẫu nguồn đang trống hoặc thiếu Mã số/Tên ở nhiều dòng, báo
    // ngay từ đầu — trước đây các trường hợp này chỉ lặng lẽ import ra 0 mã mà không có
    // cảnh báo rõ ràng nào (chỉ có flash() tự ẩn sau ~2.5s, rất dễ bị bỏ lỡ).
    if(!seed.length){
      alert(`⚠️ BOM Mẫu nguồn đang KHÔNG CÓ mã vật tư nào (0 mã) — không có gì để import.`);
      return;
    }
    const seedThieu=seed.filter(v=>!String(v.id??"").trim()||!String(v.ten??"").trim());
    if(seedThieu.length){
      console.warn(`doImport: ${seedThieu.length}/${seed.length} dòng trong BOM Mẫu nguồn thiếu Mã số hoặc Tên vật tư — các dòng này sẽ bị BỎ QUA khi import:`, seedThieu);
    }
    const rows=mkBom(pid,seed);
    // ✅ Lấy id các mã CŨ ngay tại đây (đồng bộ, từ state hiện có) — không phụ thuộc vào
    // biến "old" tính bên trong setBomDB (updater có thể được React gọi trễ hơn dòng code
    // tiếp theo), và không cần query lại Supabase để lấy id cũ.
    const oldIdsSnapshot = bom.map(v=>v.id);
    let removedRows=[];
    let rowsToSave=rows;
    const replaceAll = importMode==="thay";
    setBomDB(s=>{
      const old=s[pid]||[];
      let next;
      if(replaceAll){
        // "Thay thế toàn bộ": có xác nhận rõ ràng của người dùng và CHỦ ĐÍCH là xóa hết
        // mã cũ, nên đây là 1 trong số ít nơi vẫn dùng dbUpsertBom (upsert + xóa những gì
        // không còn trong danh sách mới).
        const newMaSet=new Set(rows.map(v=>v.ma));
        removedRows=old.filter(v=>!newMaSet.has(v.ma));
        next={...s,[pid]:rows};
        rowsToSave=rows;
      }
      else{
        // "Thêm mới": CHỈ upsert đúng các dòng vừa thêm — không đụng tới các mã khác đang
        // có trên server (an toàn khi nhiều người dùng cùng thao tác ở các trạm khác nhau).
        const existMa=new Set(old.map(v=>v.ma));
        const news=rows.filter(v=>!existMa.has(v.ma));
        const maxStt=old.length?Math.max(...old.map(v=>v.stt)):0;
        const newsWithStt=news.map((v,i)=>({...v,stt:maxStt+i+1}));
        next={...s,[pid]:[...old,...newsWithStt]};
        rowsToSave=newsWithStt;
      }
      return next;
    });
    setShowImport(false);
    // ✅ CHẨN ĐOÁN: nếu ở chế độ "Thêm vào" mà KHÔNG có mã nào mới (toàn bộ đã trùng Mã số
    // với dự án hiện tại), báo rõ ngay — đây chính là trường hợp trước đây khiến người dùng
    // tưởng đã import 147 mã nhưng số liệu vẫn giữ nguyên như cũ, không thấy lỗi gì.
    if(!replaceAll&&rowsToSave.length===0){
      alert(`⚠️ KHÔNG CÓ MÃ NÀO MỚI ĐƯỢC THÊM.\n\nTất cả ${rows.length} mã trong BOM Mẫu nguồn đều đã trùng Mã số với dự án hiện tại (chế độ "Thêm vào" tự bỏ qua mã đã có).\n\nNếu bạn muốn ghi đè/thay toàn bộ, hãy chọn "Thay thế toàn bộ danh sách" thay vì "Thêm vào".`);
      return;
    }
    flash(`⏳ Đang lưu ${rowsToSave.length} mã lên server...`);
    const tenNguon=bomMauLoaiList.find(l=>l.id===importSrc)?.ten||importSrc;
    // ✅ QUAN TRỌNG: PHẢI await và xác nhận Supabase lưu thành công rồi mới báo "✓ Import
    // thành công" và ghi Nhật ký. Trước đây gọi dbUpsertBom KHÔNG await — local state đã
    // đổi ngay (vd. Thay thế 86→147 mã) và luôn báo "✓ Import thành công" NGAY LẬP TỨC dù
    // lệnh lưu lên Supabase có thất bại hay không (mất mạng, RLS chặn quyền ghi...). Người
    // dùng thấy "thành công" trên máy mình, nhưng dữ liệu thật trên server KHÔNG đổi — mở
    // lại trang (hoặc máy khác) sẽ thấy BOM cũ, giống hệt triệu chứng "mất dữ liệu".
    try{
      const res=replaceAll
        ? await dbUpsertBom(pid,rowsToSave,oldIdsSnapshot)
        : await dbUpsertBomRows(pid,rowsToSave);
      if(res?.skipped>0){
        setBomDB(s=>({...s,[pid]:(s[pid]||[]).filter(r=>String(r.ma||"").trim()&&String(r.ten||"").trim())}));
      }
      // ✅ Ghi Nhật ký — đặc biệt log rõ khi "Thay thế" xóa mất mã/vị trí cũ. Ghi SAU khi
      // đã xác nhận lưu Supabase thành công, để nhật ký không nói dối là đã lưu xong.
      if(replaceAll&&removedRows.length){
        const viTriMat=[...new Set(removedRows.map(v=>v.vt).filter(Boolean))];
        addBomLog("xoa",{ma:"",ten:`Import BOM Mẫu — Thay thế toàn bộ BOM`},
          `Đã XÓA ${removedRows.length} mã cũ (thuộc vị trí: ${viTriMat.join(", ")||"—"}) để thay bằng BOM Mẫu "${tenNguon}"`);
      }
      addBomLog("them",{ma:"",ten:`Import BOM Mẫu — ${tenNguon}`},
        `Đã ${replaceAll?"thay thế bằng":"thêm"} ${rows.length} mã từ BOM Mẫu "${tenNguon}"`);
      flash(res?.skipped>0
        ? `⚠️ Đã lưu ${res.count}/${rowsToSave.length} mã — ${res.skipped} dòng bị bỏ qua (thiếu Mã số/Tên vật tư)`
        : `✓ Đã lưu ${rowsToSave.length} mã lên Supabase (${tenNguon})`);
      // ✅ CHẨN ĐOÁN: dùng thêm alert() cho trường hợp "skipped" — trước đây chỉ có flash()
      // tự ẩn sau ~2.5s, người dùng rất dễ bỏ lỡ cảnh báo quan trọng này (ví dụ vừa xảy ra:
      // import 147 mã nhưng bị bỏ qua gần hết do thiếu Mã số/Tên ở nguồn).
      if(res?.skipped>0){
        alert(`⚠️ CHỈ LƯU ĐƯỢC ${res.count}/${rowsToSave.length} MÃ.\n\n${res.skipped} dòng bị bỏ qua vì thiếu Mã số hoặc Tên vật tư trong BOM Mẫu nguồn.\n\nHãy vào tab "BOM Mẫu" kiểm tra lại dữ liệu nguồn (${tenNguon}) — mở Console (F12) để xem chi tiết từng dòng bị bỏ qua.`);
      }
    }catch(e){
      // ❌ Lưu thất bại: local đang hiển thị dữ liệu MỚI nhưng Supabase CHƯA có (hoặc chỉ
      // có 1 phần) — báo rõ ràng, không im lặng coi như thành công, để người dùng biết cần
      // thử lại ngay, tránh rời trang rồi mất trắng thao tác vừa làm.
      console.error("doImport save error:",e);
      const msg=`❌ LƯU SUPABASE THẤT BẠI: ${e.message}\n\nDữ liệu trên màn hình CHƯA chắc đã lưu lên server — hãy thử Import lại ngay!`;
      flash(`❌ LƯU SUPABASE THẤT BẠI: ${e.message} — hãy thử Import lại ngay!`);
      alert(msg); // ✅ dùng thêm alert() vì flash() tự biến mất sau vài giây, dễ bị bỏ lỡ lỗi quan trọng này
    }
  };
  // ── CORE: đọc file Excel/CSV và trả kết quả qua callback ──
  // Dùng CHUNG cho cả "Import Excel" (tab Vật tư) và "Import BOM" (modal Tạo dự án mới)
  const parseXlsFile=(file,onResult)=>{
    if(!file){return;}
    const name=file.name.toLowerCase();
    if(name.endsWith(".csv")){
      const reader=new FileReader();
      reader.onload=ev=>{
        try{
          const text=ev.target.result;
          const lines=text.split(/\r?\n/).filter(l=>l.trim());
          if(lines.length<2){onResult([],"File CSV trống!");return;}
          const headers=lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
          const mapped=lines.slice(1).map((line,i)=>{
            const cols=line.split(",").map(c=>c.replace(/"/g,"").trim());
            const r={};
            headers.forEach((h,j)=>{r[h]=cols[j]||"";});
            return{
              stt:r["STT"]||r["stt"]||i+1,
              ma:String(r["Mã số"]||r["ma"]||r["MA"]||r["id"]||"").trim(),
              ten:String(r["Tên Vật Tư"]||r["Tên vật tư"]||r["ten"]||r["TEN"]||r["name"]||"").trim(),
              dv:String(r["Đơn vị"]||r["ĐVT"]||r["dv"]||"Cái").trim(),
              dm:Number(r["Định Mức"]||r["ĐM/1XE"]||r["ĐM"]||r["dm"]||1),
              ng:String(r["Nguồn gốc"]||r["dmuc"]||r["Trạm"]||"").trim(),
              vt:String(r["Vị trí"]||r["vt"]||r["Trạm"]||"").trim(),
              jig:String(r["JIG"]||r["Jig"]||r["jig"]||"").trim(),
              gc:String(r["Ghi chú"]||r["gc"]||"").trim(),
              // ✅ 7 cột MỚI — chỉ có ý nghĩa khi import vào dòng xe 12m (nếu file không
              // có các cột này thì để rỗng, không ảnh hưởng các dòng xe khác)
              ckgh:(()=>{const s=String(r["Check GH29Y"]||r["CHECK GH29Y"]||r["ckgh"]||"").trim().toLowerCase();
                return (s.includes("riêng")||s.includes("rieng"))?"rieng":"dung_chung";})(),
              px:String(r["Phân xưởng"]||r["PHÂN XƯỞNG"]||r["Phan xuong"]||r["px"]||"").trim(),
              dai:String(r["Dài"]||r["DÀI"]||r["Dai"]||r["dai"]||"").trim(),
              rong:String(r["Rộng"]||r["RỘNG"]||r["Rong"]||r["rong"]||"").trim(),
              day_kt:String(r["Dày"]||r["DÀY"]||r["Day"]||r["day_kt"]||"").trim(),
              tram:String(r["Trạm/Xí"]||r["Trạm Xí"]||r["[STT Trạm XH]"]||r["STT Trạm XH"]||r["Trạm XH"]||r["tram"]||"").trim(),
              tnxh:String(r["Trách nhiệm XH"]||r["TRÁCH NHIỆM XH"]||r["Trach nhiem XH"]||r["tnxh"]||"").trim(),
            };
          }).filter(r=>r.ma&&r.ten);
          if(!mapped.length){onResult([],"Không tìm thấy cột Mã số / Tên vật tư!");return;}
          onResult(mapped,"");
        }catch(err){onResult([],"Lỗi đọc CSV: "+err.message);}
      };
      reader.readAsText(file,"UTF-8");
    } else {
      const reader=new FileReader();
      reader.onload=async ev=>{
        try{
          const {read,utils}=await import("xlsx");
          let wb;
          try{
            wb=read(new Uint8Array(ev.target.result),{
              type:"array",cellText:false,cellDates:true,
              cellNF:false,cellStyles:false,WTF:false,
              dense:true,
            });
          }catch{
            // Thử lại với option tối giản hơn
            wb=read(new Uint8Array(ev.target.result),{
              type:"array",WTF:false,dense:false,bookVBA:false,
            });
          }
          // Thử tất cả các sheet, ưu tiên sheet có cột "Mã số" / "Tên vật tư"
          const hasMaSo=(rows)=>rows.slice(0,6).some(row=>
            row.some(c=>{const s=String(c).toLowerCase();return(s.includes("mã")&&s.includes("số"))||(s.includes("ma")&&s.includes("vat tu"))||s.includes("part no");})
          );
          // Tìm sheet phù hợp (ưu tiên sheet có header đúng, fallback sheet đầu)
          let bestSheetName=wb.SheetNames[0];
          for(const sn of wb.SheetNames){
            const wsCheck=wb.Sheets[sn];
            const rowsCheck=utils.sheet_to_json(wsCheck,{defval:"",raw:false,header:1});
            if(hasMaSo(rowsCheck)){bestSheetName=sn;break;}
          }
          const ws=wb.Sheets[bestSheetName];
          // Tìm hàng header (bỏ qua hàng tiêu đề gộp ở đầu)
          const allRows=utils.sheet_to_json(ws,{defval:"",raw:false,header:1});
          // Tìm hàng có "Mã số" / "Mã vật tư" / "Part No" / "MÃ VẬT TƯ"
          let headerIdx=0;
          for(let i=0;i<Math.min(8,allRows.length);i++){
            const row=allRows[i];
            const hasMa=row.some(c=>{const s=String(c).toLowerCase();return(s.includes("mã")&&(s.includes("số")||s.includes("vật tư")||s.includes("vat tu")))||s.includes("part no");});
            if(hasMa){headerIdx=i;break;}
          }
          // Trim header keys để tránh dấu cách thừa (vd: "Nguồn gốc ")
          const headers=allRows[headerIdx].map(h=>String(h).replace(/\n.*$/,"").trim());
          const dataRows=allRows.slice(headerIdx+1);
          const mapped=dataRows.map((row,i)=>{
            const r={};
            headers.forEach((h,j)=>{r[h]=row[j]??""});
            const g=(...ks)=>{for(const k of ks){const v=String(r[k]||"").trim();if(v)return v;}return "";};
            // Hỗ trợ cả tên cột tiếng Anh (PART NO, PART NAME) và tiếng Việt
            const ma=g("Mã số","Mã Số","MÃ VẬT TƯ","PART NO","MÃ SỐ","ma","MA","id");
            const ten=g("Tên Vật Tư","TÊN VẬT TƯ TIẾNG VIỆT","PART NAME VIETNAM","Tên vật tư","TEN VẬT TƯ","ten","TEN","name");
            return{
              stt:Number(r["STT"]||r["stt"]||r["NO."])||i+1,
              ma,ten,
              dv:g("Đơn vị","ĐVT","dv")||"Cái",
              dm:Number(r["Định Mức"]||r["ĐM/1XE"]||r["ĐỊNH MỨC/ XE"]||r["ĐM"]||r["dm"]||r["ĐỊNH MỨC/ XE"]||1)||1,
              ng:g("Nguồn gốc","Danh Mục","TRẠM","Trạm","dmuc"),
              vt:g("Vị Trí","Vị trí","TRẠM","Trạm","vt"),
              jig:g("JIG","Jig","jig"),
              gc:g("Ghi chú","Ghi Chú","GHI CHÚ","gc"),
              // ✅ 7 cột MỚI — chỉ có ý nghĩa khi import vào dòng xe 12m (nếu file không
              // có các cột này thì để rỗng, không ảnh hưởng các dòng xe khác)
              ckgh:(()=>{const s=g("Check GH29Y","CHECK GH29Y","ckgh").toLowerCase();
                return (s.includes("riêng")||s.includes("rieng"))?"rieng":"dung_chung";})(),
              px:g("Phân xưởng","PHÂN XƯỞNG","Phan xuong","px"),
              dai:g("Dài","DÀI","Dai","dai"),
              rong:g("Rộng","RỘNG","Rong","rong"),
              day_kt:g("Dày","DÀY","Day","day_kt"),
              tram:g("Trạm/Xí","Trạm Xí","[STT Trạm XH]","STT Trạm XH","Trạm XH","tram"),
              tnxh:g("Trách nhiệm XH","TRÁCH NHIỆM XH","Trach nhiem XH","tnxh"),
            };
          }).filter(r=>r.ma&&r.ten);
          if(!mapped.length){onResult([],`Không tìm thấy dữ liệu! Sheet đọc: "${bestSheetName}". Kiểm tra cột Mã số / Tên vật tư.`);return;}
          onResult(mapped,"");
        }catch(err){onResult([],"Lỗi đọc file Excel: "+err.message);}
      };
      reader.readAsArrayBuffer(file);
    }
  };
  // Import Excel (tab Vật tư) — dùng parseXlsFile chung
  const handleXlsFile=e=>{
    const file=e.target.files[0];
    setXlsErr("");
    setXlsPreview([]);
    parseXlsFile(file,(rows,err)=>{
      if(err){setXlsErr(err);return;}
      setXlsPreview(rows);
    });
    e.target.value="";
  };
  // Import BOM ngay trong modal "Thêm dự án mới" — dùng parseXlsFile chung
  // Import Excel trực tiếp vào BOM Mẫu (tab "BOM Mẫu") — dùng parseXlsFile chung
  const handleBmXlsFile=e=>{
    const file=e.target.files[0];
    setBmXlsErr("");
    setBmXlsPreview([]);
    parseXlsFile(file,(rows,err)=>{
      if(err){setBmXlsErr(err);return;}
      setBmXlsPreview(rows);
    });
    e.target.value="";
  };

  const handleNewProjXlsFile=e=>{
    const file=e.target.files[0];
    setNewProjXlsErr("");
    setNewProjXlsPreview([]);
    parseXlsFile(file,(rows,err)=>{
      if(err){setNewProjXlsErr(err);return;}
      setNewProjXlsPreview(rows);
    });
    e.target.value="";
  };

  // Ghi dữ liệu đã đọc từ Excel vào đúng BOM Mẫu đang chọn (KIM MAI 9 / MINIBUS X9)
  const doBmImport=(mode)=>{
    if(!bmXlsPreview.length)return;
    const setActiveBom = updater=>setBomMauRows(bmTab, updater);
    const rows = bmXlsPreview.map(v=>({id:v.ma,ten:v.ten,dv:v.dv||"Cái",dm:v.dm||1,ng:v.ng||"",vt:v.vt||"",jig:v.jig||"",gc:v.gc||""}));
    let finalRows=null;   // toàn bộ mảng sau khi xong (để cập nhật state local)
    let rowsToSave=null;  // đúng những dòng cần ghi lên Supabase
    let replaceAll=false;
    if(mode==="thay"){
      finalRows=rows.map((r,i)=>({...r,stt:i+1,_id:Date.now()+i}));
      rowsToSave=finalRows;
      replaceAll=true;
      setActiveBom(finalRows);
    } else {
      setActiveBom(prev=>{
        const existingIds=new Set(prev.map(r=>r.id));
        const newRows=rows.filter(r=>r.id&&!existingIds.has(r.id));
        const skipped=rows.length-newRows.length;
        let nextStt=prev.length?Math.max(...prev.map(r=>r.stt||0)):0;
        const withStt=newRows.map(r=>({...r,stt:++nextStt,_id:Date.now()+Math.random()}));
        finalRows=[...prev,...withStt];
        rowsToSave=withStt; // ✅ CHỈ lưu đúng các dòng mới thêm, không đụng tới dòng khác
        return finalRows;
      });
    }
    setBmShowImport(false);
    setBmXlsPreview([]);
    setBmXlsErr("");
    flash("⏳ Đang lưu lên server...");
    // Lưu lên Supabase sau khi state đã cập nhật (đã tính sẵn ở trên, không cần chờ re-render)
    // ✅ Chỉ báo "✓ Đã lưu" SAU KHI xác nhận Supabase lưu xong — trước đây báo thành công
    // ngay lập tức bất kể lệnh lưu có thật sự thành công hay không.
    setTimeout(async()=>{
      if(!rowsToSave)return;
      try{
        // "Thay thế toàn bộ" là thao tác có chủ đích, xác nhận rõ ràng → giữ dbSyncBomMau
        // (upsert + xóa mã không còn). "Thêm mới" thì chỉ upsert đúng dòng mới, an toàn hơn.
        await(replaceAll?dbSyncBomMau(bmTab, rowsToSave):dbUpsertBomMauRows(bmTab, rowsToSave));
        flash(replaceAll?`✓ Đã thay thế bằng ${rowsToSave.length} mã từ Excel`:`✓ Đã thêm ${rowsToSave.length} mã mới lên server`);
      }catch(e){
        console.error("doBmImport save error:",e);
        flash(`❌ Lưu lên Supabase thất bại: ${e.message} — hãy thử Import lại!`);
      }
    },0);
  };

  // ── Thêm / Xóa LOẠI BOM mẫu (danh mục động) ──
  const addBomMauLoai=async()=>{
    const ten=bmLoaiForm.ten.trim();
    if(!ten){alert("Vui lòng nhập tên loại BOM mẫu!");return;}
    const base=slugifyLoaiId(ten);
    let id=base,n=2;
    while(bomMauLoaiList.some(l=>l.id===id)){id=`${base}_${n++}`;}
    const dongXe=bmLoaiForm.dongXe||activeLine||"minibus";
    const newLoai={id,ten,icon:bmLoaiForm.icon.trim()||"🚐",mau:bmLoaiForm.mau||"#7c3aed",thu_tu:bomMauLoaiList.length+1,dong_xe:dongXe};
    // Nếu người dùng có đính kèm file (Excel/CSV) lúc tạo → nạp sẵn luôn các mã vật tư
    const fileRows = bmLoaiFilePreview.length
      ? bmLoaiFilePreview.map((v,i)=>({id:v.ma,ten:v.ten,dv:v.dv||"Cái",dm:v.dm||1,ng:v.ng||"",vt:v.vt||"",jig:v.jig||"",gc:v.gc||"",stt:i+1,_id:Date.now()+i}))
      : [];
    setBomMauLoaiList(l=>[...l,newLoai]);
    setBomMauByLoai(m=>({...m,[id]:fileRows}));
    setBmTab(id);
    setBmDongXeFilter(dongXe); // nhảy sang đúng tab dòng xe vừa tạo để thấy ngay loại mới
    setBmLoaiModal(false);
    setBmLoaiForm({ten:"",icon:"🚐",mau:"#7c3aed",dongXe:activeLine||"minibus"});
    setBmLoaiFilePreview([]);setBmLoaiFileErr("");setBmLoaiFileName("");
    try{
      await dbUpsertBomMauLoai(newLoai);
      if(fileRows.length) await dbUpsertBomMauRows(id, fileRows);
      flash(`✓ Đã thêm loại BOM mẫu "${ten}"${fileRows.length?` cùng ${fileRows.length} mã từ file`:""}`);
    }catch(e){
      console.error("addBomMauLoai:",e);
      alert("⚠️ Lưu loại BOM mẫu lên Supabase thất bại: "+e.message+" — loại vẫn hiển thị tạm trên máy bạn, hãy kiểm tra kết nối/RLS rồi thử lại.");
    }
  };
  const deleteBomMauLoai=async(id)=>{
    if(bomMauLoaiList.length<=1){alert("Phải còn ít nhất 1 loại BOM mẫu!");return;}
    setBmLoaiDelConfirm(null);
    const remain=bomMauLoaiList.filter(l=>l.id!==id);
    setBomMauLoaiList(remain);
    setBomMauByLoai(m=>{const n={...m};delete n[id];return n;});
    if(bmTab===id) setBmTab(remain[0]?.id||"");
    try{
      await dbDeleteBomMauLoai(id);
      flash("✓ Đã xóa loại BOM mẫu");
    }catch(e){
      console.error("deleteBomMauLoai:",e);
      alert("⚠️ Xóa loại BOM mẫu trên Supabase thất bại: "+e.message);
    }
  };

  const doXlsImport=async(mode)=>{
    if(!xlsPreview.length)return;
    // Dùng importPidRef để đảm bảo import vào đúng project (tránh closure pid cũ)
    const targetPid = importPidRef.current || pid;
    const rows=xlsPreview.map(v=>({id:uid(),pid:targetPid,...v,anh:""}));
    let finalRows=rows;   // toàn bộ mảng sau khi xong (để cập nhật state local / báo số liệu)
    let rowsToSave=rows;  // ✅ đúng những dòng cần ghi lên Supabase
    const replaceAll = mode==="thay";
    let removedRows=[]; // ✅ các mã CŨ bị xóa (chỉ có ở mode "thay") — dùng để ghi Nhật ký
    // ✅ Lấy id các mã CŨ ngay tại đây (đồng bộ, từ state hiện có) — không phụ thuộc vào
    // biến "oldRows" tính bên trong setBomDB (updater có thể được React gọi trễ hơn dòng
    // code tiếp theo), và không cần query lại Supabase để lấy id cũ.
    const oldIdsSnapshot = (bomDB[targetPid]||[]).map(v=>v.id);
    setBomDB(s=>{
      const oldRows=s[targetPid]||[];
      let next;
      if(mode==="thay"){
        const newMaSet=new Set(rows.map(v=>v.ma));
        removedRows=oldRows.filter(v=>!newMaSet.has(v.ma));
        next={...s,[targetPid]:rows};
        rowsToSave=rows;
      }
      else{
        const existMa=new Set(oldRows.map(v=>v.ma));
        const news=rows.filter(v=>!existMa.has(v.ma));
        const maxStt=oldRows.length?Math.max(...oldRows.map(v=>v.stt)):0;
        const newsWithStt=news.map((v,i)=>({...v,stt:maxStt+i+1}));
        finalRows=[...oldRows,...newsWithStt];
        next={...s,[targetPid]:finalRows};
        rowsToSave=newsWithStt; // chỉ lưu đúng các dòng mới, không đụng tới mã khác trên server
      }
      return next;
    });
    setShowXlsImport(false);
    setXlsPreview([]);
    importPidRef.current = null;
    flash(`✓ Import ${rows.length} mã – Đang lưu lên server...`);
    // ✅ Ghi Nhật ký thay đổi BOM cho thao tác Nhập Excel — đặc biệt log rõ khi
    // "Thay thế" xóa mất các mã/vị trí cũ, để tra được ai làm và lúc nào.
    if(mode==="thay"){
      if(removedRows.length){
        const viTriMat=[...new Set(removedRows.map(v=>v.vt).filter(Boolean))];
        addBomLog("xoa",{ma:"",ten:`Nhập Excel — Thay thế toàn bộ BOM`},
          `Đã XÓA ${removedRows.length} mã cũ (thuộc vị trí: ${viTriMat.join(", ")||"—"}) để thay bằng ${rows.length} mã từ file Excel`,
          targetPid);
      }
      addBomLog("them",{ma:"",ten:`Nhập Excel — Thay thế toàn bộ BOM`},
        `Đã thêm ${rows.length} mã mới từ file Excel (chế độ Thay thế)`, targetPid);
    } else {
      addBomLog("them",{ma:"",ten:`Nhập Excel — Thêm vào BOM`},
        `Đã thêm ${rows.length} mã từ file Excel (chế độ Thêm vào, không xóa mã cũ)`, targetPid);
    }
    // Lưu lên Supabase sau khi state đã update
    try{
      // "Thay thế toàn bộ" là thao tác có chủ đích, người dùng đã xác nhận xóa hết mã cũ
      // → giữ dbUpsertBom (upsert + xóa mã không còn). "Thêm vào" thì chỉ upsert đúng các
      // dòng vừa thêm (dbUpsertBomRows — không xóa gì), an toàn khi nhiều người dùng khác
      // đang thao tác song song ở các trạm/mã khác.
      const res=replaceAll
        ? await dbUpsertBom(targetPid,rowsToSave,oldIdsSnapshot)
        : await dbUpsertBomRows(targetPid,rowsToSave);
      // ✅ Nếu Supabase bỏ qua vài dòng lỗi (thiếu mã/tên...), đồng bộ lại state
      // local cho khớp với DB, để tránh UI hiện đủ nhưng DB thiếu.
      if(res?.skipped>0){
        setBomDB(s=>({...s,[targetPid]:finalRows.filter(r=>String(r.ma||"").trim()&&String(r.ten||"").trim())}));
        flash(`⚠️ Đã lưu ${res.count}/${rowsToSave.length} mã — ${res.skipped} dòng bị bỏ qua (thiếu Mã số/Tên vật tư)`);
      } else {
        flash(`✓ Đã lưu ${rowsToSave.length} mã lên Supabase`);
      }
    }catch(e){
      // ✅ Lưu thất bại giữa đường: state local hiện đang có finalRows nhưng Supabase
      // KHÔNG có (hoặc chỉ có 1 phần) → báo rõ + để người dùng thử "Import Excel" lại,
      // không tự ý xóa state local để họ không mất bản xem trước vừa đọc từ file.
      const msg=`❌ LƯU SUPABASE THẤT BẠI: ${e.message}\n\nDữ liệu đang hiện trên màn hình CHƯA được lưu lên server, hãy thử Import lại.`;
      flash(`❌ LƯU SUPABASE THẤT BẠI: ${e.message} — hãy thử Import lại`);
      console.error("doXlsImport save error:",e);
      alert(msg); // ✅ dùng thêm alert() vì flash() tự biến mất sau vài giây, dễ bị bỏ lỡ lỗi quan trọng này
    }
  };

  const togSoan=(ma,slCN,defaultSl)=>setSoanDB(s=>{
    const c=(s[pid]||{})[ma];
    // ✅ FIX: Nếu mã chưa có SL lưu (c?.sl undefined), lấy theo defaultSl (giá trị ĐANG
    // hiển thị trên ô nhập — có thể là SL còn thiếu nếu mã đã giao một phần) thay vì luôn
    // luôn rơi về SL cần (slCN). Nếu defaultSl không được truyền vào thì fallback về slCN
    // như hành vi cũ, đảm bảo tương thích các nơi gọi khác.
    const curSl=c?.sl??(defaultSl??slCN);
    if(c?.on){
      // Đang tick → bỏ tick
      return{...s,[pid]:{...(s[pid]||{}),[ma]:{on:false,sl:curSl}}};
    } else {
      // ✅ FIX: Chưa tick → tick LUÔN, không bắt buộc SL thực >= SL cần.
      // Trước đây nếu SL thực < SL cần thì bấm tick vẫn không set on=true (chỉ hiện
      // icon "…" cảnh báo), khiến người dùng tưởng đã "soạn" mã đó (đã nhập SL, có
      // badge "Còn thiếu") nhưng guiDon() lọc theo on=true nên bỏ sót mã này khỏi đơn
      // gửi đi — đúng triệu chứng "tick 2 mã, đơn chỉ có 1 mã". Giờ tick là tick, soạn
      // thiếu hay đủ đều được gửi (đủ bao nhiêu gửi bấy nhiêu), trạng thái thiếu chỉ
      // còn là cảnh báo hiển thị (badge vàng "Còn thiếu"), không chặn việc gửi đơn.
      const slThuc=curSl;
      const duSl=slThuc>=slCN;
      return{...s,[pid]:{...(s[pid]||{}),[ma]:{on:true,sl:slThuc,chuaDu:!duSl}}};
    }
  });
  const setSlSoan=(ma,v,slCN?)=>setSoanDB(s=>{
    const c=(s[pid]||{})[ma]||{};
    // ✅ FIX: Giữ nguyên trạng thái on hiện tại khi sửa số lượng — không tự ý bật/tắt
    // theo việc đủ hay thiếu SL nữa (lý do tương tự togSoan ở trên). Người dùng tick là
    // tick, sửa số lượng chỉ cập nhật số, không làm mã bị "rớt" khỏi danh sách đã soạn.
    return{...s,[pid]:{...(s[pid]||{}),[ma]:{...c,sl:v,on:c.on??false,chuaDu:slCN!==undefined&&v<slCN}}};
  });
  const togGrp=(items,all)=>setSoanDB(s=>{
    const c=s[pid]||{};const p={};
    items.forEach(v=>{
      const slCN=v.dm*soXe;
      // ✅ FIX: đồng bộ với logic ở từng dòng vật tư — nếu mã đã giao một phần (canhBao),
      // mặc định SL = SL còn thiếu (conThieu) thay vì luôn luôn = SL cần (slCN).
      const thV=thByMa[v.ma];
      const canNhan=thV?.cn??slCN;
      const daGiaoXHDuyet=thV?.dnXN||0;
      const conThieu=Math.max(0,canNhan-daGiaoXHDuyet);
      const canhBao=!!thV?.giaoThieu&&conThieu>0&&daGiaoXHDuyet>0;
      p[v.ma]={on:!all,sl:c[v.ma]?.sl??(canhBao?conThieu:slCN)};
    });
    return{...s,[pid]:{...c,...p}};
  });

  // 🚨 Gửi "Báo khẩn cấp" — nhận (chosenItems, ghiChu, donViChon) từ KhanCapModal.
  // Lưu vào Supabase (để hiện trong 🔔 của các đơn vị được chọn), sau đó mở Web Share API
  // (Zalo/SMS/Email/Messenger — cùng cơ chế đã dùng cho nút "Chia sẻ" ảnh phiếu) để gửi ra
  // ngoài ngay lập tức; nếu máy không hỗ trợ chia sẻ, copy nội dung vào clipboard để dán tay.
  const guiCanhBaoKhan=async(chosenItems,ghiChu,donViChon)=>{
    const ts=new Date().toISOString();
    const dongXeGui = activeLine||"minibus";
    const nhanDX = nhanDongXe(dongXeGui);
    const row={
      id:uid(), pid, ten_du_an:proj?.ten||"",
      danh_sach:chosenItems.map(v=>({ma:v.ma,ten:v.ten,dv:v.dv,can:v.can,daGiao:v.daGiao||0,conThieu:v.conThieu})),
      ghi_chu:ghiChu||"", nguoi_gui:user.ten, don_vi_gui:user.don_vi,
      don_vi_nhan:donViChon, ts, doc_boi:[], phan_hoi:[],
      dong_xe:dongXeGui, phan_hoi_chua_doc:[]
    };
    await dbGuiCanhBao(row);
    const noiDung=`(${nhanDX.icon} ${nhanDX.text}) 🚨 BÁO KHẨN CẤP — VẬT TƯ THIẾU GẤP\n`+
      `Dự án: ${proj?.icon||""} ${proj?.ten||""}\n`+
      `Người gửi: ${user.ten} (${user.don_vi})\n`+
      `Thời gian: ${new Date(ts).toLocaleString("vi-VN")}\n\n`+
      `Danh sách vật tư cần gấp:\n`+
      chosenItems.map((v,i)=>`${i+1}. ${v.ma} - ${v.ten}: cần ${fmt(v.can)} ${v.dv}, đã giao ${fmt(v.daGiao||0)}, còn thiếu ${fmt(v.conThieu)} ${v.dv}`).join("\n")+
      (ghiChu?`\n\nGhi chú: ${ghiChu}`:"")+
      `\n\nGửi đến: ${donViChon.join(", ")}`;
    try{
      if(navigator.share){
        await navigator.share({title:"🚨 Báo khẩn cấp — Vật tư thiếu gấp",text:noiDung});
      }else{
        throw new Error("no-share-api");
      }
    }catch(e){
      try{
        await navigator.clipboard.writeText(noiDung);
        alert("📋 Đã copy nội dung báo khẩn cấp — dán vào Zalo/SMS/Email để gửi.\n(Đã lưu vào hệ thống, các đơn vị được chọn sẽ thấy trong 🔔.)");
      }catch{
        alert("✓ Đã lưu báo khẩn cấp vào hệ thống.\nKhông tự mở được ứng dụng gửi tin — vui lòng tự soạn tin nhắn gửi các đơn vị:\n\n"+noiDung);
      }
    }
    flash(`🚨 Đã gửi báo khẩn cấp ${chosenItems.length} mã đến ${donViChon.length} đơn vị`);
  };

  // ── Gửi đơn ──
  const guiDon=()=>{
    const d=new Date();
    const sp=`DH-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String((phList.length||0)+1).padStart(3,"0")}`;
    const phid=uid();
    // ✅ Giới hạn theo role — khớp với danh sách hiển thị ở tab Soạn Hàng, tránh gửi nhầm
    // mã ngoài phạm vi (VD dữ liệu tick còn sót từ tài khoản khác trong cùng dự án).
    const bomRole = isKHO ? bom.filter(v=>(v.ng||"").trim().toUpperCase()==="CKD")
                  : isTHCK ? bom.filter(v=>(v.ng||"").trim().toUpperCase()==="THCK")
                  : bom;
    // ✅ FIX: loại các mã ĐÃ DUYỆT ĐỦ (Xưởng Hàn đã duyệt đủ SL) ra khỏi phiếu gửi, dù cờ
    // "on" trong state `soan` của mã đó vẫn còn sót lại true từ trước (cờ này chỉ được dọn
    // trong chính guiDon() khi tự tay gửi đủ SL — không được dọn khi XƯỞNG HÀN duyệt đủ qua
    // đường khác). Nếu không loại, những mã đã ẩn khỏi danh sách Soạn Hàng (banner "ẩn N mã
    // đã duyệt đủ") vẫn có thể lọt vào phiếu gửi ngoài ý muốn, khiến số mã gửi > số mã tick
    // đang hiển thị (VD tick 1 mã nhưng phiếu lại ghi "gửi 3 mã").
    const daDuyetDuSet = new Set(thFull.filter(v=>v.done).map(v=>v.ma));
    // Chỉ gửi các mã đã soạn (có tick ✓) và CHƯA duyệt đủ
    const daSoan=bomRole.filter(v=>soan[v.ma]?.on&&!daDuyetDuSet.has(v.ma));
    if(daSoan.length===0){flash("⚠️ Chưa soạn mã nào!");return;}

    // Cộng dồn: gộp mã đã có trong phiếu cũ + SL hiện tại soạn
    // dnMap chứa tổng SL đã giao từ các phiếu trước
    const maMap: Record<string,{ten:string,dv:string,sl:number}>={};
    // ✅ remainMap: SL còn thiếu sau khi gửi đợt này (SL cần - tổng đã giao tính cả đợt này)
    // dùng để giữ mã đó lại trong Soạn Hàng nếu SL giao < SL cần nhận
    const remainMap: Record<string,number>={};
    daSoan.forEach(v=>{
      const slCN=v.dm*soXe;
      const slThuc=soan[v.ma]?.sl??slCN;
      const slDaGiao=dnMap[v.ma]||0; // đã giao từ phiếu trước — CHỈ dùng để theo dõi "còn thiếu", KHÔNG trừ khi gửi
      // ✅ FIX: SL nhập ở ô "SL THỰC" được gửi ĐÚNG NGUYÊN SỐ đó trên phiếu mới, KHÔNG tự động
      // trừ đi phần đã giao ở (các) phiếu trước. Việc CỘNG DỒN vào tổng đã nhận chỉ diễn ra khi
      // Xưởng Hàn "duyệt" phiếu này (tính qua dnMap/dnXNMap ở các nơi khác), không phải ở bước gửi.
      const slGui=slThuc;
      if(slGui>0){
        if(maMap[v.ma]) maMap[v.ma].sl+=slGui;
        else maMap[v.ma]={ten:v.ten,dv:v.dv,sl:slGui};
      }
      // SL còn thiếu so với SL cần nhận, sau khi cộng cả phần vừa gửi đợt này (chỉ để theo dõi
      // Soạn Hàng — không ảnh hưởng số lượng thực gửi trên phiếu ở trên)
      remainMap[v.ma]=Math.max(0,slCN-(slDaGiao+slGui));
    });

    const ct=Object.entries(maMap).map(([ma,info],i)=>({
      id:uid(),phid,stt:i+1,ma,ten:info.ten,dv:info.dv,sl:info.sl,ok:false
    }));

    if(ct.length===0){flash("⚠️ Tất cả mã đã giao đủ số lượng!");return;}

    const ph={id:phid,pid,sp,ngay:d.toISOString().slice(0,10),gc:`Đơn hàng ${proj.icon} ${proj.ten} — ${soXe} xe (${ct.length} mã)`,bg:"LINH KIỆN BUS",bn:"XƯỞNG HÀN",tt:"Chờ xác nhận",tong:ct.length,ts:d.toISOString(),ct,nguoi_soan:user.ten,don_vi_soan:user.don_vi};
    setPhDB(s=>({...s,[pid]:[ph,...(s[pid]||[])]}));
    dbSavePhieu(ph).catch(e=>{
      console.error("dbSavePhieu:",e);
      flash("❌ LƯU PHIẾU THẤT BẠI: "+e.message);
      // Rollback: gỡ phiếu khỏi local state để không hiển thị "phiếu ma" (có vẻ đã gửi
      // nhưng thực chất chưa lưu được lên Supabase) — tránh trường hợp XƯỞNG HÀN mở lên
      // thấy phiếu trống hoặc thiếu mã mà không ai biết.
      setPhDB(s=>({...s,[pid]:(s[pid]||[]).filter(p=>p.id!==ph.id)}));
    });
    const lsRows=ct.map(c=>({id:uid(),pid,ma:c.ma,ten:c.ten,loai:"Xuất kho",sl:-c.sl,gc:`Đơn ${sp}`,ts:new Date().toISOString(),nguoi_duyet:user.ten,don_vi_duyet:user.don_vi}));
    lsRows.forEach(r=>addLS(pid,r));
    // ✅ FIX: Không xoá trắng toàn bộ Soạn Hàng nữa. Mã nào gửi đi mà SL giao < SL cần nhận
    // thì vẫn giữ lại trong Soạn Hàng với SL = SL cần - SL đã giao (để soạn tiếp phần còn thiếu).
    // Mã đã giao đủ thì xoá khỏi checklist soạn (đã gửi xong). Mã không nằm trong đợt gửi
    // này (chưa tick) thì giữ nguyên trạng thái cũ.
    const soMaConThieu=Object.values(remainMap).filter(r=>r>0).length;
    setSoanDB(s=>{
      const cur=s[pid]||{};
      const next={...cur};
      daSoan.forEach(v=>{
        const conLai=remainMap[v.ma]||0;
        // ✅ FIX: conLai là SỐ LƯỢNG CÒN THIẾU (chưa gửi đủ), không phải "đã có" — đánh dấu
        // tuPhieuThieu:true để khớp với ngữ cảnh hiển thị badge "Đã nhận X (còn thiếu Y)"
        // (cùng công thức đã fix cho trường hợp Xưởng Hàn duyệt thiếu SL), tránh hiện ngược
        // thành "Còn thiếu Y (đã có X)" như trước.
        // ⚠️ FIX MỚI: KHÔNG set sl=conLai nữa (trước đây gán nhầm SL Ô "SL THỰC" = SL CÒN
        // THIẾU, khiến ô nhập hiển thị đúng bằng số thiếu thay vì SL cần soạn). Bỏ trống sl
        // để ô nhập tự rơi về mặc định slCN (SL cần) qua công thức `soan[v.ma]?.sl ?? slCN`
        // ở màn Soạn Hàng — badge "⚠️ thiếu X" vẫn hiển thị riêng để báo phần còn thiếu.
        if(conLai>0) next[v.ma]={on:false,chuaDu:true,tuPhieuThieu:true};
        else delete next[v.ma];
      });
      const updated={...s,[pid]:next};
      try{localStorage.setItem("soanDB",JSON.stringify(updated));}catch{}
      return updated;
    });
    setTab("pgn");
    flash(`✓ Đã gửi đơn ${sp} (${ct.length} mã, đã cộng dồn)${soMaConThieu>0?` · ⚠️ ${soMaConThieu} mã vẫn còn thiếu SL, đã giữ lại ở Soạn Hàng`:""}`);
  };

  // ── Phiếu thủ công ──
  const spAuto=()=>{const d=new Date();return`PGN-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String((phList.length||0)+1).padStart(3,"0")}`;};
  const openPh=()=>{setPhF({sp:spAuto(),ngay:new Date().toISOString().slice(0,10),gc:""});setPhIt([]);setAddIt({ma:"",sl:1});setShowPh(true);};
  const addPhIt=()=>{
    const vt=bom.find(v=>v.ma===addIt.ma);if(!vt)return;
    const sl=parseInt(addIt.sl)||1;
    setPhIt(ps=>{const ex=ps.find(p=>p.ma===vt.ma);if(ex)return ps.map(p=>p.ma===vt.ma?{...p,sl:p.sl+sl}:p);return[...ps,{ma:vt.ma,ten:vt.ten,dv:vt.dv,sl}];});
    setAddIt({ma:"",sl:1});
  };
  const submitPh=()=>{
    // ✅ VALIDATION: Kiểm tra dữ liệu đầu vào
    if(!phF.sp||phIt.length===0){
      flash("⚠️ Chưa nhập tên phiếu hoặc mã vật tư");
      return;
    }
    if(!pid){
      console.error("submitPh: pid undefined - không thể tạo phiếu");
      flash("❌ Lỗi: Dự án không hợp lệ. Hãy chọn dự án khác");
      return;
    }
    
    // ✅ Kiểm tra dự án hiện tại có tồn tại không
    const projHienTai = projs.find(p => p.id === pid);
    if(!projHienTai){
      console.error(`submitPh: Dự án ${pid} không tồn tại`,{projs,pid});
      flash("❌ Lỗi: Dự án không tồn tại. Vui lòng reload trang");
      return;
    }
    
    // ✅ CONFIRM DIALOG: Xác nhận dự án & dữ liệu trước lưu
    const confirmMsg = `📋 Xác nhận tạo phiếu:
🚐 Dự án: ${projHienTai.ten}
📦 Phiếu: ${phF.sp}
📝 Mã VT: ${phIt.length} mã
👤 Người soạn: ${user.ten}

Bạn có chắc chắn không?`;
    
    if(!window.confirm(confirmMsg)){
      return; // Người dùng bấm Hủy
    }
    
    // ✅ Tạo phiếu với pid đúng
    const phid=uid();
    const ph={
      id:phid,
      pid, // ✅ SỬ DỤNG pid từ state (đã được validate)
      sp:phF.sp,
      ngay:phF.ngay,
      gc:phF.gc,
      bg:"LINH KIỆN BUS",
      bn:"XƯỞNG HÀN",
      tt:"Chờ xác nhận",
      tong:phIt.length,
      ts:new Date().toISOString(),
      nguoi_soan:user.ten,
      don_vi_soan:user.don_vi,
      ct:phIt.map((it,i)=>({id:uid(),phid,stt:i+1,ma:it.ma,ten:it.ten,dv:it.dv,sl:it.sl,ok:false}))
    };
    
    // ✅ Log để debug sau này
    console.log(`[submitPh] Tạo phiếu:`, {
      phid: ph.id,
      sp: ph.sp,
      pid: ph.pid,
      duan: projHienTai.ten,
      so_ma: ph.tong,
      nguoi_soan: ph.nguoi_soan,
      timestamp: ph.ts
    });
    
    // Lưu vào state local
    setPhDB(s=>({...s,[pid]:[ph,...(s[pid]||[])]}));
    dbSavePhieu(ph).catch(e=>{
      console.error("dbSavePhieu:",e);
      flash("❌ LƯU PHIẾU THẤT BẠI: "+e.message);
      // Rollback: gỡ phiếu khỏi local state để không hiển thị "phiếu ma" (có vẻ đã gửi
      // nhưng thực chất chưa lưu được lên Supabase) — tránh trường hợp XƯỞNG HÀN mở lên
      // thấy phiếu trống hoặc thiếu mã mà không ai biết.
      setPhDB(s=>({...s,[pid]:(s[pid]||[]).filter(p=>p.id!==ph.id)}));
    });
    
    // ✅ Ghi lịch sử: log phiếu được soạn bởi ai
    const lsPhieuSoan={
      id:uid(),
      pid,
      ma:phF.sp, // Mã phiếu
      ten:`Soạn phiếu ${phF.sp}`,
      loai:"Soạn phiếu", // Loại hoạt động
      sl:phIt.length, // Số mã trong phiếu
      gc:`NV soạn: ${user.ten} · Đơn vị: ${user.don_vi}`,
      ts:new Date().toISOString(),
      nguoi_duyet:user.ten,
      don_vi_duyet:user.don_vi
    };
    addLS(pid, lsPhieuSoan);
    
    // Ghi lịch sử chi tiết cho mỗi mã (Xuất kho)
    const lsRows=phIt.map(it=>({id:uid(),pid,ma:it.ma,ten:it.ten,loai:"Xuất kho",sl:-it.sl,gc:`Phiếu ${phF.sp}`,ts:new Date().toISOString(),nguoi_duyet:user.ten,don_vi_duyet:user.don_vi}));
    lsRows.forEach(r=>addLS(pid,r));
    
    setShowPh(false);
    flash(`✓ Tạo phiếu ${phF.sp} cho dự án "${projHienTai.ten}" thành công`);
  };
  const xacNhan=(phid,projId)=>{
    const ph=(phDB[projId]||[]).find(p=>p.id===phid);
    setPhDB(s=>({...s,[projId]:(s[projId]||[]).map(p=>p.id===phid?{...p,tt:"Đã xác nhận"}:p)}));
    dbUpdatePhieuTt(phid,"Đã xác nhận");
    // Ghi lịch sử duyệt kèm người duyệt
    const lsRow={id:uid(),pid:projId,ma:ph?.sp||phid,ten:`Duyệt phiếu ${ph?.sp||""} (${ph?.tong||0} mã)`,
      loai:"Duyệt phiếu",sl:0,gc:`Phiếu: ${ph?.sp||""} · Ngày: ${ph?.ngay||""}`,
      ts:new Date().toISOString(),nguoi_duyet:user.ten,don_vi_duyet:user.don_vi};
    addLS(projId,lsRow);
    dbAddLS(lsRow);
  };
  const lockOtherXH=()=>{
    const otherXH=users.filter(u=>u.role==="xuonghan"&&u.id!==user.id);
    if(otherXH.length===0){flash("ℹ️ Không có tài khoản XH khác để khóa");return;}
    if(!window.confirm(`Khóa ${otherXH.length} tài khoản XH khác?\nChỉ "${user.ten}" (${user.id}) sẽ có thể đăng nhập.`))return;
    const updated=users.map(u=>u.role==="xuonghan"&&u.id!==user.id?{...u,an:true}:u);
    setUsers(updated);
    otherXH.forEach(u=>dbUpsertUser({...u,an:true}));
    flash(`✓ Đã khóa ${otherXH.length} tài khoản XH khác`);
  };
  const huyDuyet=(phid,projId)=>{
    const ph=(phDB[projId]||[]).find(p=>p.id===phid);
    if(!window.confirm(`Hủy duyệt đơn "${ph?.sp||phid}"?\nPhiếu này sẽ bị xóa khỏi hệ thống và SL đã cộng dồn sẽ được hủy. Không thể hoàn tác!`))return;
    // Ghi lịch sử hủy duyệt trước khi xóa phiếu (để còn lưu vết)
    const lsRow={id:uid(),pid:projId,ma:ph?.sp||phid,ten:`Hủy duyệt đơn ${ph?.sp||""} (${ph?.tong||0} mã)`,
      loai:"Hủy duyệt",sl:0,gc:`Phiếu: ${ph?.sp||""} · Ngày: ${ph?.ngay||""} · Đã hủy và xóa khỏi hệ thống`,
      ts:new Date().toISOString(),nguoi_duyet:user.ten,don_vi_duyet:user.don_vi};
    addLS(projId,lsRow);
    dbAddLS(lsRow);
    // Xóa phiếu khỏi state cục bộ → phiếu không còn hiển thị & không còn được tính vào dnMap (cộng dồn SL)
    setPhDB(s=>({...s,[projId]:(s[projId]||[]).filter(p=>p.id!==phid)}));
    if(viewPh?.id===phid)setViewPh(null);
    // Xóa phiếu khỏi Supabase (cả phieu và phieu_ct)
    dbDeletePhieu(phid);
    flash(`✓ Đã hủy duyệt & xóa đơn ${ph?.sp||""}`);
  };
  const saveEditPh=async()=>{
    if(!editPh)return;
    setPhDB(s=>({...s,[pid]:(s[pid]||[]).map(p=>p.id===editPh.id?{...p,sp:editPh.sp,ngay:editPh.ngay,gc:editPh.gc,tong:editPh.ct.length,ct:editPh.ct}:p)}));
    setViewPh(null);setEditPh(null);
    // ⚠️ FIX QUAN TRỌNG: TRƯỚC ĐÂY hàm này xóa hết "phieu_ct" của phiếu rồi mới chèn lại
    // editPh.ct — nếu editPh.ct (dữ liệu đang có trong bộ nhớ) vì lý do gì đó bị thiếu so
    // với DB thật (vd. bug giới hạn dòng khi load, hoặc lỗi mạng lúc chèn lại), toàn bộ chi
    // tiết phiếu bị XÓA VĨNH VIỄN mà không có cảnh báo gì (.then(()=>{}) nuốt luôn lỗi).
    // Giờ đổi sang: upsert dữ liệu mới TRƯỚC (không mất gì nếu nó thất bại), xác nhận ghi
    // đủ số dòng, rồi MỚI xóa đúng những id không còn xuất hiện — giống cách dbUpsertBom
    // đang làm ở trên. Nếu có lỗi ở bất kỳ bước nào, dừng lại và báo cho người dùng biết
    // ngay, không âm thầm coi như đã lưu xong.
    try{
      const {error:phErr}=await supabase.from(T("phieu")).update({sp:editPh.sp,ngay:editPh.ngay,gc:editPh.gc,tong:editPh.ct.length}).eq("id",editPh.id);
      if(phErr) throw new Error("Lỗi cập nhật phiếu: "+phErr.message);

      const {data:oldData,error:selErr}=await supabase.from(T("phieu_ct")).select("id").eq("phid",editPh.id);
      if(selErr) throw new Error("Lỗi đọc dữ liệu chi tiết cũ: "+selErr.message);
      const oldIds=(oldData||[]).map(r=>r.id);

      if(editPh.ct.length){
        const {data:insData,error:insErr}=await supabase.from(T("phieu_ct")).upsert(editPh.ct,{onConflict:"id"}).select("id");
        if(insErr) throw new Error("Lỗi lưu chi tiết phiếu: "+insErr.message);
        if((insData?.length||0)<editPh.ct.length){
          throw new Error(`Supabase chỉ lưu được ${insData?.length||0}/${editPh.ct.length} dòng chi tiết (có thể do Row Level Security chặn quyền ghi) — kiểm tra lại RLS policy trên bảng phieu_ct`);
        }
      }

      const newIdSet=new Set(editPh.ct.map(c=>c.id));
      const idsToDelete=oldIds.filter(oid=>!newIdSet.has(oid));
      if(idsToDelete.length){
        const {error:delErr}=await supabase.from(T("phieu_ct")).delete().in("id",idsToDelete);
        if(delErr) throw new Error("Lỗi xóa dòng chi tiết cũ: "+delErr.message);
      }
      flash("✓ Đã cập nhật phiếu");
    }catch(e:any){
      console.error("saveEditPh error:",e);
      flash("❌ Lưu phiếu thất bại: "+(e?.message||"lỗi không xác định")+" — vui lòng thử lại, kiểm tra kỹ dữ liệu trước khi rời trang!");
    }
  };
  const duyetCt=(phid,ctid,slThucNhan?:number,projId?:string)=>{
    // Dùng projId truyền vào nếu có, không thì tìm trong phDB
    let ph=null,phPid=projId||pid;
    if(!projId){
      for(const[pId,phs] of Object.entries(phDB)){const found=(phs||[]).find((p:any)=>p.id===phid);if(found){ph=found;phPid=pId;break;}}
    } else {
      ph=(phDB[projId]||[]).find((p:any)=>p.id===phid);
    }
    const ct=(ph?.ct||[]).find((c:any)=>c.id===ctid);
    const slGiao=ct?.sl||0;
    const slThuc=slThucNhan!==undefined?slThucNhan:slGiao;
    const slThieu=Math.max(0,slGiao-slThuc);
    const updateCt=(c:any)=>c.id===ctid?{...c,ok:true,nguoi_duyet:user.ten,sl_thuc_nhan:slThuc,sl_thieu:slThieu}:c;
    setPhDB((s:any)=>({...s,[phPid]:(s[phPid]||[]).map((p:any)=>p.id===phid?{...p,ct:(p.ct||[]).map(updateCt)}:p)}));
    setViewPh((vp:any)=>vp?({...vp,ct:(vp.ct||[]).map(updateCt)}):vp);
    dbUpdatePhieuCt(ctid,true,user.ten,slThuc,slThieu);
    // Nếu thiếu SL → đưa mã về đúng dự án trong soạn hàng để bổ sung (cộng dồn)
    if(slThieu>0&&ct?.ma){
      setSoanDB((s:any)=>{
        const cur=s[phPid]||{};
        const existing=cur[ct.ma];
        const slTruoc=existing?.tuPhieuThieu?existing.sl||0:0;
        const slMoi=slTruoc+slThieu;
        const nx={on:false,sl:slMoi,tuPhieuThieu:true,chuaDu:true};
        const next={...s,[phPid]:{...cur,[ct.ma]:nx}};
        try{localStorage.setItem("soanDB",JSON.stringify(next));}catch{}
        return next;
      });
      flash(`⚠️ Mã ${ct.ma}: nhận ${slThuc}/${slGiao} — thiếu ${slThieu} ${ct.dv||""} → đã đưa về Soạn hàng dự án`);
    } else {
      flash("✓ Đã duyệt mã vật tư");
    }
    const lsRow={id:uid(),pid:phPid,ma:ct?.ma||"",ten:ct?.ten||"",
      loai:"Duyệt mã VT",sl:slThuc,gc:`Phiếu: ${ph?.sp||""} · SL giao: ${slGiao} · SL thực nhận: ${slThuc}${slThieu>0?` · SL thiếu: ${slThieu} → đưa về Soạn hàng`:""}`,
      ts:new Date().toISOString(),nguoi_duyet:user.ten,don_vi_duyet:user.don_vi};
    addLS(phPid,lsRow);
    dbAddLS(lsRow);
  };
  const duyetAll=(phid,projId?:string)=>{
    let ph=null,phPid=projId||pid;
    if(!projId){
      for(const[pId,phs] of Object.entries(phDB)){const found=(phs||[]).find((p:any)=>p.id===phid);if(found){ph=found;phPid=pId;break;}}
    } else {
      ph=(phDB[projId]||[]).find((p:any)=>p.id===phid);
    }
    const hasThieu=(ph?.ct||[]).some((c:any)=>{
      const slThuc=slThucEdit[c.id]!==undefined?slThucEdit[c.id]:(c.sl_thuc_nhan??c.sl);
      return slThuc<(c.sl||0);
    });
    const confirmMsg=hasThieu
      ?"⚠️ Một số mã có SL thực nhận < SL giao. Xác nhận duyệt?\nMã thiếu SL sẽ tự động đưa về Soạn hàng để bổ sung."
      :"Duyệt tất cả? SL thực nhận sẽ được tính bằng SL giao.";
    if(!window.confirm(confirmMsg))return;
    const updatedCts=(ph?.ct||[]).map((c:any)=>{
      const slThuc=slThucEdit[c.id]!==undefined?slThucEdit[c.id]:(c.sl_thuc_nhan??c.sl);
      const slThieu=Math.max(0,(c.sl||0)-slThuc);
      return{...c,ok:true,nguoi_duyet:user.ten,sl_thuc_nhan:slThuc,sl_thieu:slThieu};
    });
    setPhDB((s:any)=>{
      const next={...s,[phPid]:(s[phPid]||[]).map((p:any)=>p.id===phid?{...p,tt:"Đã xác nhận",ct:updatedCts}:p)};
      dbUpdatePhieuTt(phid,"Đã xác nhận");
      updatedCts.forEach((c:any)=>dbUpdatePhieuCt(c.id,true,user.ten,c.sl_thuc_nhan,c.sl_thieu));
      return next;
    });
    setViewPh((vp:any)=>vp?({...vp,tt:"Đã xác nhận",ct:updatedCts}):vp);
    // Đưa các mã thiếu về đúng dự án trong soạn hàng
    const maDuaVeSoan=updatedCts.filter((c:any)=>c.sl_thieu>0);
    if(maDuaVeSoan.length>0){
      setSoanDB((s:any)=>{
        const cur=s[phPid]||{};
        const patch:any={};
        maDuaVeSoan.forEach((c:any)=>{
          const existing=cur[c.ma];
          const slTruoc=existing?.tuPhieuThieu?existing.sl||0:0;
          const slMoi=slTruoc+c.sl_thieu;
          patch[c.ma]={on:false,sl:slMoi,tuPhieuThieu:true,chuaDu:true};
        });
        const next={...s,[phPid]:{...cur,...patch}};
        try{localStorage.setItem("soanDB",JSON.stringify(next));}catch{}
        return next;
      });
    }
    const lsRow={id:uid(),pid:phPid,ma:ph?.sp||phid,ten:`Duyệt toàn bộ phiếu ${ph?.sp||""} (${ph?.tong||0} mã)`,
      loai:"Duyệt tất cả",sl:ph?.tong||0,gc:`Phiếu: ${ph?.sp||""} · Ngày: ${ph?.ngay||""}${maDuaVeSoan.length>0?` · ${maDuaVeSoan.length} mã thiếu → Soạn hàng`:""}`,
      ts:new Date().toISOString(),nguoi_duyet:user.ten,don_vi_duyet:user.don_vi};
    addLS(phPid,lsRow);
    dbAddLS(lsRow);
    flash(maDuaVeSoan.length>0?`✓ Đã duyệt · ⚠️ ${maDuaVeSoan.length} mã thiếu SL → đã đưa về Soạn hàng dự án`:"✓ Đã duyệt toàn bộ");
  };

  const hdAnh=e=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>5*1024*1024){alert("Max 5MB");return;}
    const r=new FileReader();r.onload=ev=>setCur(c=>({...c,anh:ev.target.result}));r.readAsDataURL(f);e.target.value="";
  };

  // ── Cập nhật Nguồn gốc theo Mã số ──
  const handleUpdateNgFile=e=>{
    const f=e.target.files[0];
    if(!f){setUpdateNgFile(null);return;}
    if(f.size>10*1024*1024){setUpdateNgErr("File quá lớn (max 10MB)");return;}
    setUpdateNgFile(f);
    setUpdateNgErr("");
    setUpdateNgMsg("");
    e.target.value="";
  };

  const updateNgFromFile=async()=>{
    if(!updateNgFile){setUpdateNgErr("Chưa chọn file");return;}
    if(bom.length===0){setUpdateNgErr("Chưa có dữ liệu BOM để cập nhật");return;}
    
    setUpdateNgLoading(true);
    setUpdateNgErr("");
    setUpdateNgMsg("Đang xử lý...");

    try{
      // Đọc file
      const name=updateNgFile.name.toLowerCase();
      const updData={}; // ma -> {ng?, jig?}

      if(name.endsWith(".csv")){
        const reader=new FileReader();
        reader.onload=async ev=>{
          try{
            const text=ev.target.result;
            const lines=text.split(/\r?\n/).filter(l=>l.trim());
            if(lines.length<2){
              setUpdateNgErr("File CSV trống!");
              setUpdateNgLoading(false);
              return;
            }
            const headers=lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
            const maidx=headers.findIndex(h=>["Mã số","ma","MA","id","Mã vật tư"].includes(h));
            const ngidx=headers.findIndex(h=>["Nguồn gốc","ng","Nguồn gốc","source"].includes(h));
            const jigidx=headers.findIndex(h=>["JIG","Jig","jig"].includes(h));

            if(maidx<0||(ngidx<0&&jigidx<0)){
              setUpdateNgErr("File phải có cột 'Mã số' và ít nhất 1 trong 2 cột 'Nguồn gốc' / 'JIG'");
              setUpdateNgLoading(false);
              return;
            }

            lines.slice(1).forEach(line=>{
              const cols=line.split(",").map(c=>c.replace(/"/g,"").trim());
              const ma=cols[maidx]?.trim();
              const ng=ngidx>=0?cols[ngidx]?.trim():"";
              const jig=jigidx>=0?cols[jigidx]?.trim():"";
              if(ma&&(ng||jig)){updData[ma]={...(ng&&{ng}),...(jig&&{jig})};}
            });

            await doUpdateNg(updData);
          }catch(err){
            setUpdateNgErr("Lỗi đọc CSV: "+err.message);
          }finally{
            setUpdateNgLoading(false);
          }
        };
        reader.readAsText(updateNgFile,"UTF-8");
      } else {
        // Đọc Excel
        const reader=new FileReader();
        reader.onload=async ev=>{
          try{
            const {read,utils}=await import("xlsx");
            const wb=read(new Uint8Array(ev.target.result),{type:"array",cellText:false});
            const ws=wb.Sheets[wb.SheetNames[0]];
            const rows=utils.sheet_to_json(ws,{defval:"",raw:false,header:1});
            
            if(rows.length<2){
              setUpdateNgErr("File Excel trống!");
              setUpdateNgLoading(false);
              return;
            }

            const headers=rows[0].map(h=>String(h).trim());
            const maidx=headers.findIndex(h=>["Mã số","ma","MA","id","Mã vật tư"].includes(h));
            const ngidx=headers.findIndex(h=>["Nguồn gốc","ng","Nguồn gốc","source"].includes(h));
            const jigidx=headers.findIndex(h=>["JIG","Jig","jig"].includes(h));

            if(maidx<0||(ngidx<0&&jigidx<0)){
              setUpdateNgErr("File phải có cột 'Mã số' và ít nhất 1 trong 2 cột 'Nguồn gốc' / 'JIG'");
              setUpdateNgLoading(false);
              return;
            }

            rows.slice(1).forEach(row=>{
              const ma=String(row[maidx]||"").trim();
              const ng=ngidx>=0?String(row[ngidx]||"").trim():"";
              const jig=jigidx>=0?String(row[jigidx]||"").trim():"";
              if(ma&&(ng||jig)){updData[ma]={...(ng&&{ng}),...(jig&&{jig})};}
            });

            await doUpdateNg(updData);
          }catch(err){
            setUpdateNgErr("Lỗi đọc Excel: "+err.message);
          }finally{
            setUpdateNgLoading(false);
          }
        };
        reader.readAsArrayBuffer(updateNgFile);
      }
    }catch(err){
      setUpdateNgErr(err.message);
      setUpdateNgLoading(false);
    }
  };

  const doUpdateNg=async(updData)=>{
    try{
      const currentBom=bom||[];
      let updated=0;
      const updateList=currentBom.map(item=>{
        const u=updData[item.ma];
        if(u&&((u.ng&&u.ng!==item.ng)||(u.jig&&u.jig!==item.jig))){
          updated++;
          return {...item,...(u.ng&&{ng:u.ng}),...(u.jig&&{jig:u.jig})};
        }
        return item;
      });

      if(updated===0){
        setUpdateNgErr("Không tìm thấy mã nào để cập nhật");
        setUpdateNgLoading(false);
        return;
      }

      // Cập nhật state
      setBomDB(s=>({...s,[pid]:updateList}));
      
      // Cập nhật Supabase - chỉ gửi các bản ghi có thay đổi
      const updateChunks=updateList.filter(item=>updData[item.ma]);
      const batch=100;
      for(let i=0;i<updateChunks.length;i+=batch){
        const chunk=updateChunks.slice(i,i+batch);
        const {error}=await supabase.from(T("bom_items")).upsert(chunk,{onConflict:"id"}).select("id");
        if(error){
          throw new Error(`Lỗi lưu Supabase (dòng ${i+1}-${i+chunk.length}): ${error.message}`);
        }
      }

      setUpdateNgMsg(`✓ Cập nhật thành công ${updated} mã`);
      setUpdateNgFile(null);
      setTimeout(()=>{
        setShowUpdateNg(false);
        setUpdateNgMsg("");
        setUpdateNgFile(null);
      },1500);
      
      flash(`✓ Đã cập nhật Nguồn gốc / JIG cho ${updated} mã`);
    }catch(err){
      setUpdateNgErr(err.message);
    }finally{
      setUpdateNgLoading(false);
    }
  };

  // ── Sort/filter ──
  // ✅ Gọn lại: sCol/sAsc (cột sắp xếp / chiều sắp xếp) trước đây có state nhưng KHÔNG có
  // control nào trên UI để đổi (hàm sortBy từng cho phép đổi đã không còn được gọi ở đâu) —
  // nghĩa là luôn cố định "stt" tăng dần. Bỏ state, sắp xếp thẳng theo stt tăng dần — HÀNH VI
  // GIỮ NGUYÊN 100%, chỉ gọn code hơn.
  const filtered=useMemo(()=>{
    let d=fdm!=="Tất cả"?bom.filter(v=>v.ng===fdm):bom;
    d=d.filter(v=>dmPriority(v.vt)===trangVT);
    if(search){const q=search.toLowerCase();d=d.filter(v=>String(v.stt).includes(q)||v.ma.toLowerCase().includes(q)||v.ten.toLowerCase().includes(q)||(v.vt||"").toLowerCase().includes(q));}
    return[...d].sort((a,b)=>{let va=a.stt,vb=b.stt;if(typeof va==="string"){va=va.toLowerCase();vb=vb.toLowerCase();}return va<vb?-1:va>vb?1:0;});
  },[bom,search,fdm,trangVT]);

  // ── Tích lũy ──
  const {dnMap,dnXNMap,hasOkMap,phByMa}=useMemo(()=>{
    const dnMap={},dnXNMap={},hasOkMap={},phByMa={};
    // ✅ FIX: Lọc CHỈ phiếu của dự án hiện tại (pid), tránh cộng dồn từ dự án khác
    const phieuHienTai = phList.filter(p => p.pid === pid);
    for(const ph of [...phieuHienTai].reverse()){
      for(const c of(ph.ct||[])){
        // dnMap: tổng SL đã giao (cộng dồn mọi đợt, kể cả đợt đang chờ duyệt) — dùng để
        // tính tiến độ chung (p/ct/vt) và để ẩn mã khỏi Soạn Hàng khi đã giao đủ.
        dnMap[c.ma]=(dnMap[c.ma]||0)+(c.sl||0);
        // dnXNMap: CHỈ tính SL THỰC NHẬN đã được XƯỞNG HÀN xác nhận (duyệt) — KHÔNG tính
        // optimistically phần đang chờ duyệt. Dùng để xác định "Giao thiếu SL" — badge này
        // phải tiếp tục hiển thị cho tới khi thực sự nhận đủ (đã duyệt xác nhận), kể cả khi
        // phần thiếu đã được soạn/gửi lại nhưng XƯỞNG HÀN CHƯA duyệt đợt gửi lại đó.
        if(c.ok){
          dnXNMap[c.ma]=(dnXNMap[c.ma]||0)+(c.sl_thuc_nhan??c.sl??0);
          hasOkMap[c.ma]=true;
        }
        if(!phByMa[c.ma])phByMa[c.ma]=[];
        phByMa[c.ma].push({sp:ph.sp,ngay:ph.ngay,sl:c.sl,id:ph.id});
      }
    }
    return{dnMap,dnXNMap,hasOkMap,phByMa};
  },[phList,pid]);

  // ✅ EPS: dung sai nhỏ cho phép so sánh số thực (tránh lệch do làm tròn thập phân của
  // ĐM × số xe). Không đổi kết quả với số nguyên, chỉ giúp trường hợp dm lẻ (vd 0.1) không
  // bị kẹt "thiếu" 1 cách giả do sai số dấu phẩy động.
  const EPS=1e-6;
  // ✅ numOr0: ép kiểu số an toàn — nếu dm/sl_thuc_nhan lỡ là chuỗi rỗng, null, hoặc giá trị
  // không hợp lệ (NaN) do nhập tay/lỗi import, coi như 0 thay vì để NaN âm thầm làm mọi phép
  // so sánh (>=, <) luôn ra false — đây là nguồn gây bug "kẹt thiếu dù đã đủ" khó phát hiện
  // nhất vì không có lỗi hiển thị, số liệu chỉ lặng lẽ sai.
  const numOr0=x=>{const n=Number(x);return Number.isFinite(n)?n:0;};

  const th=useMemo(()=>bom.map(v=>{
    const cn=numOr0(v.dm)*numOr0(soXe);
    const dnGui=numOr0(dnMap[v.ma]); // Tổng SL đã GỬI (kể cả phần đang chờ Xưởng Hàn duyệt) — chỉ dùng nội bộ (vd tính toán khi soạn/gửi đơn tiếp theo), KHÔNG hiển thị cho người dùng
    const dn=numOr0(dnXNMap[v.ma]); // ✅ "Đã nhận" HIỂN THỊ = SL đã được Xưởng Hàn xác nhận — NGUỒN DUY NHẤT cho mọi nơi hiển thị (Báo Cáo, Phiếu GN, Soạn Hàng) để số liệu luôn đồng nhất
    const dnXN=dn; // giữ tên cũ để tương thích các chỗ khác đang tham chiếu v.dnXN
    const ct=Math.max(0,cn-dn),vuot=Math.max(0,dn-cn);
    const p=cn>0?Math.min(100,Math.round(dn/cn*100)):0;
    // ✅ done: SL đã XÁC NHẬN (Xưởng Hàn duyệt) >= SL cần (dùng EPS để không kẹt do sai số
    // thập phân). Điều kiện này quyết định badge "✅ Đã nhận / Đủ" ở các tab liên quan tới
    // XÁC NHẬN THỰC NHẬN (Phiếu GN, Soạn Hàng…) — PHẢI giữ nguyên gắn với xác nhận thực tế.
    const done=dn+EPS>=cn;
    // ✅ doneGui: SL đã GỬI (kể cả phần đang chờ Xưởng Hàn duyệt) >= SL cần. Đây là điều kiện
    // để xác định TRÁCH NHIỆM GIAO HÀNG của bên soạn (THCK/CKD) đã hoàn thành hay chưa — khác
    // với "done" (bên NHẬN đã xác nhận hay chưa). Trước đây "Thiếu THCK/CKD" dùng chung điều
    // kiện "done" nên mã đã giao đủ/giao dư nhưng Xưởng Hàn CHƯA bấm duyệt bị kẹt mãi trong
    // danh sách "Thiếu THCK/CKD" dù bên giao đã hoàn thành nhiệm vụ — ĐÂY LÀ LỖI GỐC cần sửa.
    const doneGui=dnGui+EPS>=cn;
    // chuaSoan: chưa có trong bất kỳ phiếu nào (chưa gửi lần nào)
    const chuaSoan=!phByMa[v.ma]||phByMa[v.ma].length===0;
    // giaoThieu: đã từng được XƯỞNG HÀN duyệt nhưng tổng SL THỰC NHẬN xác nhận vẫn < SL cần
    // (vẫn tính là "giao thiếu" kể cả khi đã soạn/gửi bù phần thiếu mà CHƯA được duyệt lại)
    // — ràng buộc !done ở đây đảm bảo dn ≥ cn thì KHÔNG BAO GIỜ bị tính là giao thiếu nữa.
    const giaoThieu=!chuaSoan&&!!hasOkMap[v.ma]&&!done;
    // ✅ choDuyet: đã GỬI đủ/dư (doneGui) nhưng Xưởng Hàn CHƯA xác nhận đủ (done=false).
    // Trạng thái trung gian này KHÔNG được tính là "thiếu" (bên giao đã xong việc), chỉ còn
    // chờ bên nhận duyệt — hiển thị riêng để tránh gây hiểu lầm "còn thiếu vật tư".
    const choDuyet=doneGui&&!done;
    // ✅ FIX CHÍNH: Thiếu THCK/CKD = mã thuộc nguồn THCK/CKD MÀ BÊN GIAO CHƯA GỬI ĐỦ, xét theo
    // "doneGui" (SL ĐÃ GỬI, không phụ thuộc đã được duyệt hay chưa) — KHÔNG dùng "done"/dn như
    // trước. Nhờ vậy mã đã giao đủ hoặc giao dư sẽ biến mất khỏi danh sách "Thiếu THCK/CKD"
    // NGAY LẬP TỨC tại thời điểm gửi, không phải đợi Xưởng Hàn duyệt xong mới hết "thiếu".
    // Tính sẵn 1 lần duy nhất tại đây để mọi nơi hiển thị/xuất Excel/PDF dùng chung 1 nguồn.
    const ng=(v.ng||"").trim().toUpperCase();
    const thieu=!done&&(chuaSoan||giaoThieu);
    const thieuTHCK=!doneGui&&ng==="THCK";
    const thieuCKD=!doneGui&&ng==="CKD";
    return{...v,cn,dn,dnGui,dnXN,ct,vuot,p,done,doneGui,choDuyet,phs:phByMa[v.ma]||[],chuaSoan,giaoThieu,thieuTHCK,thieuCKD,thieu};
  }),[bom,dnMap,dnXNMap,hasOkMap,phByMa,soXe]);
  // Map tra cứu nhanh theo mã — dùng làm NGUỒN DUY NHẤT để tính "Còn thiếu" ở Soạn Hàng:
  // Còn thiếu = Cần nhận (cn) − Đã giao cho XH và ĐÃ ĐƯỢC DUYỆT (dnXN)
  const thByMa=useMemo(()=>{const m={};th.forEach(v=>{m[v.ma]=v;});return m;},[th]);
  const thFull = th; // alias giữ tham chiếu gốc — dùng khi cần lọc riêng theo role (VD tab Soạn Hàng) mà không ảnh hưởng chỗ khác

  const maDone=th.filter(v=>v.done).length;
  const maChuaSoan=th.filter(v=>v.chuaSoan).length;
  const maGiaoThieu=th.filter(v=>v.giaoThieu).length;
  const totCN=th.reduce((s,v)=>s+v.cn,0);
  const totDN=th.reduce((s,v)=>s+v.dn,0);
  const totCT=th.reduce((s,v)=>s+v.ct,0);
  const pctT=bom.length>0?Math.round(maDone/bom.length*100):0;
  const duAll=maDone===bom.length&&bom.length>0;

  // ✅ Tự đồng bộ trang con của tab "Báo cáo" theo ĐÚNG trạng thái dự án đang chọn: dự án ĐÃ
  // HOÀN THÀNH — tức là đã bấm tay nút "✅ Hoàn thành" (trang_thai==="hoan_thanh") HOẶC đã
  // nhận đủ 100% vật tư (duAll) — sẽ LUÔN được tự động chuyển hẳn sang "✅ Đã hoàn thành".
  // Dự án chưa đạt 1 trong 2 điều kiện trên thì tự chuyển về "🚧 Đang thực hiện".
  // ⚠️ Việc ép về "done" áp dụng CHO MỌI TRƯỜNG HỢP, kể cả khi người dùng trước đó đã tự bấm
  // xem "🚧 Đang thực hiện" cho đúng dự án này (không xét cờ manual) — vì nghiệp vụ yêu cầu:
  // hễ đủ điều kiện hoàn thành thì phải chuyển hẳn, không được phép "kẹt" ở Đang thực hiện.
  // Cờ "manual" (bcNav) chỉ còn tác dụng cho dự án CHƯA đủ điều kiện hoàn thành (cho phép xem
  // trước danh sách "Đã hoàn thành" trong lúc dự án vẫn đang làm dở).
  useEffect(()=>{
    if(!pid) return;
    const p=projs.find(x=>x.id===pid);
    if(!p) return;
    const daHoanThanh = p.trang_thai==="hoan_thanh"||duAll;
    if(daHoanThanh){ setBcSubTab("done"); return; }
    if(bcNav.isManual(pid)) return; // dự án CHƯA hoàn thành: vẫn tôn trọng lựa chọn tay của người dùng
    setBcSubTab("dang");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pid,duAll,projs]);

  // ✅ Danh sách dự án ĐÃ HOÀN THÀNH của dòng xe hiện tại (dùng cho tab "Báo cáo" · trang con
  // "done") — gồm dự án đã bấm "Hoàn thành" thủ công (trang_thai==="hoan_thanh") HOẶC đã nhận
  // đủ 100% vật tư. Với dự án ĐANG ĐƯỢC CHỌN (p.id===pid) dùng thẳng biến "duAll" ở trên (đúng
  // với banner "Đã nhận đủ vật tư toàn bộ!" đang hiển thị); các dự án khác tự tính qua
  // projFullyReceived(p).
  const bcDoneList=useMemo(()=>[...projs].filter(p=>p.trang_thai==="hoan_thanh"||(p.id===pid?duAll:projFullyReceived(p))).sort((a,b)=>{
    const ka=a.hoan_thanh_ts||a.ngay_hoan_thanh||"";
    const kb=b.hoan_thanh_ts||b.ngay_hoan_thanh||"";
    if(ka!==kb) return String(kb).localeCompare(String(ka));
    return String(b.id||"").localeCompare(String(a.id||""));
  }),[projs,projFullyReceived,pid,duAll]);

  // ✅ FIX: Danh sách dự án "Đang thực hiện" (dùng cho dropdown "CHỌN DỰ ÁN" khi ở trang con
  // "dang") — PHẢI loại trừ đúng những dự án đã tính là "Đã hoàn thành" ở bcDoneList (đã bấm
  // nút HOẶC đã nhận đủ 100% vật tư). Trước đây dropdown này hiện thẳng "projs" (không lọc),
  // nên 1 dự án dù đã nhận đủ vật tư & hiện banner xanh "Đã nhận đủ vật tư toàn bộ!" vẫn còn bị
  // liệt kê nhầm trong danh sách "Đang thực hiện". Dùng CHUNG 1 nguồn (bcDoneList) để đảm bảo
  // 1 dự án CHỈ thuộc đúng 1 trong 2 danh sách, không bao giờ vừa "đang" vừa "đã xong".
  const bcDangList=useMemo(()=>{
    const doneIds=new Set(bcDoneList.map(p=>p.id));
    return projs.filter(p=>!doneIds.has(p.id));
  },[projs,bcDoneList]);

  const nhomDM=useMemo(()=>{const m={};th.forEach(v=>{const k=v.vt||"(Chưa có vị trí)";if(!m[k])m[k]=[];m[k].push(v);});return m;},[th]);
  const freshVP=viewPh?(phList.find(p=>p.id===viewPh.id)||viewPh):null;
  const mauP=proj.mau||"#1d4ed8";

  const Tag=({bg="#eff6ff",c="#1d4ed8",ch})=><span style={{background:bg,color:c,padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700}}>{ch}</span>;

  // ✅ Nội dung FORM "Thêm dự án" — dùng CHUNG cho cả modal cũ (bên trong hệ thống chính,
  // nút "＋ Thêm") VÀ màn hình độc lập "Khởi tạo Dự án" (Giai đoạn 01) mới, để đảm bảo
  // logic tạo dự án/import BOM chỉ có 1 nguồn duy nhất, không lệch nhau.
  const newProjFormFields=(
    <div style={{display:"grid",gap:11}}>
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Tên dự án *</label>
        <input value={nPF.ten} onChange={e=>setNPF(f=>({...f,ten:e.target.value}))} style={inp} placeholder="Tên dự án..."/>
      </div>
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Dòng xe</label>
        <input value={nPF.moTa} onChange={e=>setNPF(f=>({...f,moTa:e.target.value}))} style={inp} placeholder="Dòng xe..."/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Lô SX</label>
          <input value={nPF.loSx} onChange={e=>setNPF(f=>({...f,loSx:e.target.value}))} style={inp} placeholder="Lô SX..."/>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Lệnh SX</label>
          <input value={nPF.lenhSx} onChange={e=>setNPF(f=>({...f,lenhSx:e.target.value}))} style={inp} placeholder="Lệnh SX..."/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ngày bắt đầu</label>
          <input type="date" value={nPF.ngayKhoiTao} onChange={e=>setNPF(f=>({...f,ngayKhoiTao:e.target.value}))} style={inp}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ngày hoàn thành</label>
          <input type="date" value={nPF.ngayHoanThanh} onChange={e=>setNPF(f=>({...f,ngayHoanThanh:e.target.value}))} style={inp}/>
        </div>
      </div>
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Sop (từ số ... đến số ...)</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <input value={nPF.sopTu} onChange={e=>setNPF(f=>({...f,sopTu:e.target.value}))} style={inp} placeholder="Từ Sop..."/>
          <input value={nPF.sopDen} onChange={e=>setNPF(f=>({...f,sopDen:e.target.value}))} style={inp} placeholder="Đến Sop..."/>
        </div>
      </div>
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#065f46",marginBottom:3}}>🚌 SL XE *</label>
        <input type="number" min={1} value={nPF.so_xe} onChange={e=>setNPF(f=>({...f,so_xe:e.target.value}))}
          style={{...inp,fontWeight:700,color:"#065f46",border:"1.5px solid #6ee7b7",background:"#f0fdf4"}}/>
      </div>
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6}}>📋 BOM mẫu</label>
        {[{v:"import_file",l:"📂 Import BOM (Excel, CSV UTF-8)",d:"Tải file .xlsx hoặc CSV UTF-8 để lấy dữ liệu",c:"#7c3aed"},
          ...bomMauLoaiList.map(l=>({v:l.id,l:`${l.icon} BOM ${l.ten}`,d:`${getBomMauRows(l.id).length} mã`,c:l.mau}))
        ].map(o=>o.v==="import_file"?(
          <div key={o.v} style={{borderRadius:8,border:`2px solid ${nPF.bom===o.v?o.c:"#e5e7eb"}`,background:nPF.bom===o.v?"#faf5ff":"#fff",marginBottom:6,overflow:"hidden"}}>
            <div onClick={()=>setNPF(f=>({...f,bom:o.v}))} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer"}}>
              <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${o.c}`,background:nPF.bom===o.v?o.c:"transparent",flexShrink:0}}/>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:nPF.bom===o.v?o.c:"#374151"}}>{o.l}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{o.d}</div>
              </div>
            </div>
            {nPF.bom==="import_file"&&(
              <div style={{padding:"0 12px 12px"}}>
                <input ref={newProjFileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleNewProjXlsFile}/>
                <button onClick={()=>newProjFileRef.current.click()} style={{...btn,background:"#7c3aed",color:"#fff",padding:"7px 14px",fontSize:12,width:"100%"}}>
                  📂 Chọn file Excel / CSV
                </button>
                {newProjXlsErr&&<div style={{marginTop:8,background:"#fee2e2",borderRadius:6,padding:"7px 10px",fontSize:11,color:"#991b1b"}}>⚠️ {newProjXlsErr}</div>}
                {newProjXlsPreview.length>0&&(
                  <div style={{marginTop:8,fontSize:12,color:"#065f46",fontWeight:700}}>
                    ✓ Đọc được {newProjXlsPreview.length} mã vật tư — sẽ lưu lên Supabase khi tạo dự án
                  </div>
                )}
                {!newProjXlsPreview.length&&!newProjXlsErr&&(
                  <div style={{marginTop:6,fontSize:11,color:"#9ca3af"}}>Chưa chọn file. Có thể bỏ qua và Import Excel sau ở tab Vật tư.</div>
                )}
              </div>
            )}
          </div>
        ):(
          <div key={o.v} onClick={()=>setNPF(f=>({...f,bom:o.v}))}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:`2px solid ${nPF.bom===o.v?o.c:"#e5e7eb"}`,background:nPF.bom===o.v?"#f8fafc":"#fff",cursor:"pointer",marginBottom:6}}>
            <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${o.c}`,background:nPF.bom===o.v?o.c:"transparent",flexShrink:0}}/>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:nPF.bom===o.v?o.c:"#374151"}}>{o.l}</div>
              <div style={{fontSize:11,color:"#9ca3af"}}>{o.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Màu sắc</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["#1d4ed8","#16a34a","#dc2626","#b45309","#7c3aed","#0891b2","#1f2937"].map(c=>(
            <div key={c} onClick={()=>setNPF(f=>({...f,mau:c}))}
              style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:nPF.mau===c?"3px solid #000":"3px solid transparent"}}/>
          ))}
        </div>
      </div>
    </div>
  );


  // ── RENDER ──
  if(!user || backToGate) return (
    <LangCtx.Provider value={{lang,t,setLang:setLangSaved}}>
      <LoginScreen
        resume={backToGate && user ? {authedUser:user, userList:users, activeLine} : null}
        allUsers={users}
        headerBannerUrl={headerBannerUrl}
        onLogout={handleLogoutScreenDocLap}
        onLogin={(u,us,opts)=>{setUser(u);if(us)setUsers(us);
        try{localStorage.setItem("loggedInUser",JSON.stringify(u));}catch{}
        // ✅ Ghi nhận dòng xe vừa chọn (12m / citybus / minibus) — quyết định app sẽ đọc/ghi
        // vào bộ bảng Supabase nào (xem hàm T() ở đầu component).
        const line = opts?.line || "minibus";
        setActiveLine(line);
        try{localStorage.setItem("activeLine",line);}catch{}
        if(line!=="minibus" && (!user || line!==activeLine)){
          // Dòng xe khác Mini Bus (vd. City Bus) hoạt động HOÀN TOÀN ĐỘC LẬP — không dùng
          // dữ liệu mẫu "Kim Mai 9 / Minibus X9", bắt đầu TRỐNG để người dùng tự tạo dự án
          // (giống hệt luồng "Khởi tạo Dự án"), tránh lẫn với dữ liệu Mini Bus.
          // ⚠️ Chỉ reset khi ĐĂNG NHẬP MỚI hoặc ĐỔI DÒNG XE — nếu chỉ quay lại (backToGate) rồi
          // chọn lại đúng dòng xe cũ, KHÔNG reset để tránh xoá mất dữ liệu đã tải từ Supabase.
          setProjs([]); setBomDB({}); setPid("");
          setBomMauLoaiList([]); setBomMauByLoai({}); setBmTab("");
        }
        setBackToGate(false);
        if(opts?.directTab){
          // ✅ ƯU TIÊN TUYỆT ĐỐI: đơn vị chuyên trách (xem getDirectEntry) luôn vào thẳng
          // đúng tab nghiệp vụ của Hệ thống chính — bỏ qua hoàn toàn statusId, KHÔNG BAO GIỜ
          // mở Tổng Quan/Khởi Tạo Dự án/Đã Thực Hiện dù opts có truyền gì đi nữa.
          setShowTongQuan(false);
          setShowKhoiTao(false);
          setShowDaThucHien(false);
          setTab(opts.directTab);
        }else if(opts?.statusId==="inprogress"){
          // "Đang thực hiện" → màn hình "Tổng quan" ĐỘC LẬP (chỉ xem số liệu), có nút "← Trở về".
          setShowTongQuan(true);
          setShowKhoiTao(false);
          setShowDaThucHien(false);
        }else if(opts?.statusId==="new"){
          // ✅ "Khởi tạo Dự án" → màn hình ĐỘC LẬP riêng, gắn thẳng form "Thêm dự án" tại đây,
          // KHÔNG vào hệ thống chính (topbar/tabs) như trước.
          setShowTongQuan(false);
          setShowKhoiTao(true);
          setShowDaThucHien(false);
        }else if(opts?.statusId==="done"){
          // ✅ "Đã thực hiện" → màn hình ĐỘC LẬP hiển thị các dự án đã hoàn thành.
          setShowTongQuan(false);
          setShowKhoiTao(false);
          setShowDaThucHien(true);
        }else{
          setShowTongQuan(false);
          setShowKhoiTao(false);
          setShowDaThucHien(false);
          setTab(u.role==="thck"||u.role==="kho"?"soan":u.role==="khth"?"ds":"duyet");
        }
      }}/>
    </LangCtx.Provider>
  );

  // ── MÀN HÌNH "KHỞI TẠO DỰ ÁN" (Giai đoạn 01) ĐỘC LẬP — gắn thẳng form "Thêm dự án" ──
  // Sau khi tạo dự án thành công (mkProj), tự động chuyển sang "Đang thực hiện" (showTongQuan).
  if(showKhoiTao) return (
    <LangCtx.Provider value={{lang,t,setLang:setLangSaved}}>
      <div style={{minHeight:"100vh",background:"#f1f5f9",padding:"14px 14px 40px"}}>
        <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:12,padding:"16px 18px",marginBottom:14,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
          <ScreenTopBar onBack={goBackScreen} badgeBorderColor="#3b82f6" activeLine={activeLine} onLogout={handleLogoutScreenDocLap}/>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:.5}}>🆕 GIAI ĐOẠN · 01 — KHỞI TẠO DỰ ÁN</div>
          <div style={{fontSize:11,opacity:.75,marginTop:4}}>Tạo mới dự án, thiết lập BOM và định mức ban đầu.</div>
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",maxWidth:560,margin:"0 auto"}}>
          {newProjFormFields}
          <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
            <button onClick={()=>{setBackToGate(true);setShowKhoiTao(false);setNewProjXlsPreview([]);setNewProjXlsErr("");}}
              style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
            <button onClick={mkProj} style={{...btn,background:nPF.mau,color:"#fff",padding:"7px 16px",fontWeight:800}}>✅ Tạo dự án</button>
          </div>
        </div>
      </div>
    </LangCtx.Provider>
  );

  // ── MÀN HÌNH "TỔNG QUAN" ĐỘC LẬP — thay thế hoàn toàn topbar/tab của hệ thống chính ──
  if(showTongQuan) return (
    <LangCtx.Provider value={{lang,t,setLang:setLangSaved}}>
      {(()=>{
        // ✅ FIX: tính "SL xe đã giao" trực tiếp từ bảng lịch sử "Giao xe" (ls) — nguồn dữ liệu
        // gốc và luôn đầy đủ — thay vì dùng proj.da_giao (một bộ đếm cộng dồn lưu riêng trên
        // dự án). proj.da_giao có thể bị LỆCH so với bảng chi tiết khi có ghi nhận đồng thời
        // từ nhiều phiên/thiết bị (mỗi phiên đọc da_giao cũ rồi ghi đè — "last write wins" —
        // làm mất một phần số đã cộng), trong khi các dòng lịch sử (đợt giao) luôn được thêm
        // mới, không bị ghi đè. Vì vậy tổng SL trong bảng chi tiết mới là số ĐÚNG.
        const daGiao=Math.min((ls||[]).filter(r=>r.loai==="Giao xe").reduce((s,r)=>s+(Number(r.sl)||0),0),soXe);
        const conLai=Math.max(0,soXe-daGiao);
        const pctGiao=soXe>0?Math.round(daGiao/soXe*100):0;
        return(
        <div style={{minHeight:"100vh",background:"#f1f5f9",padding:"14px 14px 40px"}}>
          <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:12,padding:"16px 18px",marginBottom:14,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
            <ScreenTopBar onBack={goBackScreen} badgeBorderColor="#f59e0b" activeLine={activeLine} onLogout={handleLogoutScreenDocLap}/>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:.5}}>DANH MỤC CÁC DỰ ÁN ĐANG THỰC HIỆN</div>
          </div>
          {/* Danh sách dự án ĐANG THỰC HIỆN — dạng THẺ (mỗi dự án 1 dòng full-width).
              ✅ Sắp xếp MỚI NHẤT lên đầu (id chứa timestamp tăng dần) — dự án vừa khởi tạo
              luôn hiện ở vị trí đầu tiên (STT 1), áp dụng chung cho MỌI dòng xe/mọi lúc.
              ✅ Chỉ hiển thị dự án CHƯA hoàn thành — dự án đã bấm "Hoàn thành" sẽ ẩn khỏi đây
              và chuyển sang màn "Đã thực hiện" (Giai đoạn 03). */}
          {projs.filter(p=>p.trang_thai!=="hoan_thanh").length>0&&(()=>{
            const projsSorted=[...projs].filter(p=>p.trang_thai!=="hoan_thanh").sort((a,b)=>String(b.id||"").localeCompare(String(a.id||"")));
            const sttMau=["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#84cc16"];
            // ✅ Điều kiện để nút "Hoàn thành" sáng lên và thao tác được: dự án phải ĐỒNG THỜI
            // (1) đã GIAO HẾT xe (da_giao ≥ so_xe) và (2) đã NHẬN ĐỦ vật tư (mọi mã trong BOM
            // của dự án đó đã được xác nhận nhận đủ số lượng cần). Tính riêng cho TỪNG dự án p
            // (không phải chỉ dự án đang chọn/pid) bằng cách tự tổng hợp từ bomDB[p.id] +
            // phDB[p.id] — logic tương tự useMemo "th" ở trên nhưng áp cho mọi dự án trong list.
            const checkProjDu=(p)=>{
              const soXeP=p.so_xe||1;
              // ✅ FIX: cùng lý do như "daGiao" ở trên — tính từ lịch sử giao xe của TỪNG
              // dự án (lsDB[p.id]) thay vì p.da_giao để tránh lệch số.
              const daGiaoP=Math.min((lsDB[p.id]||[]).filter(r=>r.loai==="Giao xe").reduce((s,r)=>s+(Number(r.sl)||0),0),soXeP);
              const daGiaoDu=daGiaoP>=soXeP;
              const bomP=bomDB[p.id]||[];
              const phP=(phDB[p.id]||[]).filter(x=>x.pid===p.id);
              const dnXNMapP={};
              for(const ph of phP){
                for(const c of(ph.ct||[])){
                  if(c.ok) dnXNMapP[c.ma]=(dnXNMapP[c.ma]||0)+(c.sl_thuc_nhan??c.sl??0);
                }
              }
              const EPS=1e-6;
              const vatTuDu=bomP.length>0&&bomP.every(v=>{
                const cn=(Number(v.dm)||0)*soXeP;
                const dn=Number(dnXNMapP[v.ma])||0;
                return dn+EPS>=cn;
              });
              return{daGiaoDu,vatTuDu,duDieuKien:daGiaoDu&&vatTuDu};
            };
            return(
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {projsSorted.map((p,idx)=>{
                const {duDieuKien}=checkProjDu(p);
                return(
                <div key={p.id}
                  style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",padding:"10px 12px",borderRadius:12,fontSize:12,fontWeight:700,
                    background:p.id===pid?(p.mau||"#2563eb"):"#fff",color:p.id===pid?"#fff":"#374151",
                    border:`1.5px solid ${p.id===pid?(p.mau||"#2563eb"):"#e5e7eb"}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div onClick={()=>{setPid(p.id);try{localStorage.setItem("lastPid",p.id);}catch{}}}
                    style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",flex:1,cursor:"pointer",minWidth:0}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:sttMau[idx%sttMau.length],color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0}}>{idx+1}</div>
                    <span>{p.ten}</span>
                    {p.lenh_sx&&<span style={{whiteSpace:"nowrap"}}>LỆNH SX: {p.lenh_sx}</span>}
                    {p.lo_sx&&<span style={{whiteSpace:"nowrap"}}>LÔ SX: {p.lo_sx}</span>}
                    {p.ngay_khoi_tao&&<span style={{whiteSpace:"nowrap"}}>NGÀY BẮT ĐẦU: {p.ngay_khoi_tao}</span>}
                    {p.ngay_hoan_thanh&&<span style={{whiteSpace:"nowrap"}}>NGÀY HOÀN THÀNH: {p.ngay_hoan_thanh}</span>}
                  </div>
                  <button disabled={!duDieuKien} onClick={(e)=>{e.stopPropagation();if(duDieuKien)markProjectDone(p);}}
                    title={duDieuKien?"":"Chỉ thao tác được khi đã giao hết xe và nhận đủ vật tư"}
                    style={{flexShrink:0,border:"none",borderRadius:8,
                      background:duDieuKien?"#16a34a":"#4b5563",color:duDieuKien?"#fff":"#9ca3af",fontWeight:800,fontSize:11,
                      padding:"7px 12px",cursor:duDieuKien?"pointer":"not-allowed",opacity:duDieuKien?1:0.6,
                      boxShadow:duDieuKien?"0 2px 0 rgba(0,0,0,0.18)":"none",whiteSpace:"nowrap"}}>
                    Hoàn thành
                  </button>
                </div>
                );
              })}
            </div>
            );
          })()}
          {projs.length===0?(
            <div style={{textAlign:"center",padding:"40px 16px",color:"#9ca3af",background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
              — Chưa có dự án nào cho dòng xe này —
            </div>
          ):projs.filter(p=>p.trang_thai!=="hoan_thanh").length===0?(
            <div style={{textAlign:"center",padding:"40px 16px",color:"#9ca3af",background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
              — Tất cả dự án của dòng xe này đã "Hoàn thành". Xem ở mục "Đã thực hiện". —
            </div>
          ):(
          <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
            {/* ── Khối 1: Tiến Trình Giao Xe ── */}
            <div style={{flex:"1 1 300px",minWidth:280,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:"1.5px solid #9ca3af",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"14px 16px",background:"#fffbeb",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>🚌</span>
                <span style={{fontWeight:800,fontSize:14,color:"#b45309"}}>TIẾN ĐỘ GIAO XE</span>
              </div>
              <div style={{padding:16,display:"flex",flexDirection:"column",flex:1}}>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <div onClick={()=>openGiaoXeModal(pid)} style={{flex:1,textAlign:"center",background:"#fffbeb",borderRadius:8,padding:"10px 6px",cursor:"pointer",border:"1px solid #9ca3af"}}>
                    <div style={{fontWeight:800,fontSize:22,color:"#16a34a"}}>{fmt(daGiao)}</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#b45309",background:"#fffbeb",borderRadius:6,padding:"3px 6px",marginTop:4}}>SL xe đã giao</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#fff",background:"#000",border:"1.5px solid #a3e635",borderRadius:6,padding:"2px 8px",marginTop:4,display:"inline-block"}}>✎ Giao xe</div>
                  </div>
                  <div style={{flex:1,textAlign:"center",background:"#fffbeb",borderRadius:8,padding:"10px 6px",border:"1px solid #9ca3af"}}>
                    <div style={{fontWeight:800,fontSize:22,color:"#dc2626"}}>{fmt(conLai)}</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#b45309",background:"#fffbeb",borderRadius:6,padding:"3px 6px",marginTop:4}}>SL xe còn lại</div>
                  </div>
                </div>
                <div style={{marginTop:"auto"}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6b7280",marginBottom:4}}>
                    <span>Tổng {fmt(soXe)} xe</span><span style={{fontWeight:700}}>{pctGiao}%</span>
                  </div>
                  <Prog p={pctGiao} done={conLai===0&&soXe>0}/>
                </div>
                <button onClick={()=>setShowGiaoXeChiTiet(s=>!s)}
                  style={{marginTop:12,width:"100%",border:"1.5px solid #2563eb",borderRadius:8,
                    background:"rgba(17,24,39,0.85)",color:"#fff",fontWeight:800,fontSize:11,
                    padding:"8px 10px",cursor:"pointer",letterSpacing:.3,fontFamily:"inherit"}}>
                  {showGiaoXeChiTiet?"▲ ẨN THÔNG TIN CHI TIẾT":"XEM THÔNG TIN CHI TIẾT"}
                </button>
                {showGiaoXeChiTiet&&(()=>{
                  const giaoXeLog=ls.filter(r=>r.loai==="Giao xe");
                  const cols="34px 1.3fr 60px 50px 1.2fr 72px 60px";
                  return(
                  <div style={{marginTop:10,border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden"}}>
                    <div style={{overflowX:"auto"}}>
                    <div style={{minWidth:520}}>
                    <div style={{display:"grid",gridTemplateColumns:cols,gap:4,padding:"6px 8px",background:"#111827",color:"#fff",fontSize:9,fontWeight:800,textTransform:"uppercase"}}>
                      <span>STT</span><span>Dòng xe</span><span>Sop</span><span>SL xe</span><span>Nhân sự giao</span><span>Ngày giao</span><span>Giờ giao</span>
                    </div>
                    <div style={{maxHeight:575,overflowY:"auto"}}>
                    {giaoXeLog.length===0?(
                      <div style={{padding:14,textAlign:"center",fontSize:11,color:"#9ca3af"}}>— Chưa có dữ liệu giao xe —</div>
                    ):giaoXeLog.map((r,i)=>(
                      <div key={r.id} style={{display:"grid",gridTemplateColumns:cols,gap:4,padding:"6px 8px",fontSize:10.5,color:"#374151",borderTop:"1px solid #f1f5f9",background:i%2?"#f9fafb":"#fff",alignItems:"center"}}>
                        <span>{i+1}</span><span style={{wordBreak:"break-word"}}>{r.dong_xe||r.ten||proj.ten}</span><span>{r.sop||"—"}</span><span>{fmt(r.sl||0)}</span><span style={{wordBreak:"break-word"}}>{r.ho_va_ten||r.nguoi_duyet||"—"}</span><span>{r.ngay_giao||(r.ts?r.ts.slice(0,10):"—")}</span><span>{r.gio_giao||(r.ts?r.ts.slice(11,19):"—")}</span>
                      </div>
                    ))}
                    </div>
                    </div>
                    </div>
                  </div>
                  );
                })()}
              </div>
            </div>
            {/* ── Khối 2: Tiến độ nhận vật tư (THCK / CKD) ── */}
            <div style={{flex:"1 1 420px",minWidth:320,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:"1.5px solid #9ca3af",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"14px 16px",background:"#fffbeb",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>📦</span>
                <span style={{fontWeight:800,fontSize:14,color:"#b45309"}}>TIẾN ĐỘ NHẬN VẬT TƯ</span>
              </div>
              <div style={{padding:"16px 16px 4px",display:"flex",flexDirection:"column",flex:1}}>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {[["THCK","🏭","#b45309","#fffbeb","#9ca3af"],["CKD","📦","#0369a1","#fffbeb","#9ca3af"]].map(([nguon,icon,mau,bgLight,bd])=>{
                  const itemsNg=th.filter(v=>(v.ng||"").trim().toUpperCase()===nguon);
                  const tongMa=itemsNg.length;
                  const maDaNhanNg=itemsNg.filter(v=>v.done).length;
                  const maConThieuNg=tongMa-maDaNhanNg;
                  return(
                    <div key={nguon} style={{flex:"1 1 160px",minWidth:150,borderRadius:10,overflow:"hidden",border:`1.5px solid ${bd}`}}>
                      <div style={{padding:"8px 10px",background:bgLight,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:14}}>{icon}</span>
                        <span style={{fontWeight:800,fontSize:12,color:mau}}>{nguon}</span>
                      </div>
                      <div style={{padding:"10px",display:"flex",flexDirection:"column",gap:6,background:bgLight}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                          <span style={{color:"#6b7280"}}>Tổng mã</span><b style={{color:"#374151"}}>{fmt(tongMa)}</b>
                        </div>
                        <div onClick={()=>setTqVtOpen(s=>s.nguon===nguon&&s.field==="done"?{nguon:"",field:""}:{nguon,field:"done"})}
                          style={{display:"flex",justifyContent:"space-between",fontSize:11,cursor:"pointer",padding:"3px 4px",borderRadius:6,background:tqVtOpen.nguon===nguon&&tqVtOpen.field==="done"?"#f0fdf4":"transparent"}}>
                          <span style={{color:"#6b7280"}}>SL đã nhận</span><b style={{color:"#16a34a",textDecoration:"underline"}}>{fmt(maDaNhanNg)}</b>
                        </div>
                        <div onClick={()=>setTqVtOpen(s=>s.nguon===nguon&&s.field==="thieu"?{nguon:"",field:""}:{nguon,field:"thieu"})}
                          style={{display:"flex",justifyContent:"space-between",fontSize:11,cursor:"pointer",padding:"3px 4px",borderRadius:6,background:tqVtOpen.nguon===nguon&&tqVtOpen.field==="thieu"?"#fef2f2":"transparent"}}>
                          <span style={{color:"#6b7280"}}>SL thiếu</span><b style={{color:maConThieuNg>0?"#dc2626":"#16a34a",textDecoration:"underline"}}>{fmt(maConThieuNg)}</b>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(()=>{
                const nguonList=["THCK","CKD"];
                const itemsAll=th.filter(v=>nguonList.includes((v.ng||"").trim().toUpperCase()));
                const tongMaAll=itemsAll.length;
                const daNhanAll=itemsAll.filter(v=>v.done).length;
                const pctVT=tongMaAll>0?Math.round(daNhanAll/tongMaAll*100):0;
                return(
                <div style={{marginTop:"auto",paddingTop:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6b7280",marginBottom:4}}>
                    <span>Đã nhận {fmt(daNhanAll)}/{fmt(tongMaAll)} mã</span><span style={{fontWeight:700}}>{pctVT}%</span>
                  </div>
                  <Prog p={pctVT} done={pctVT>=100&&tongMaAll>0}/>
                </div>
                );
              })()}
              </div>
              {tqVtOpen.nguon&&(()=>{
                const itemsNg=th.filter(v=>(v.ng||"").trim().toUpperCase()===tqVtOpen.nguon);
                const rows=tqVtOpen.field==="done"?itemsNg.filter(v=>v.done):itemsNg.filter(v=>!v.done);
                const tieuDe=`${tqVtOpen.nguon} · ${tqVtOpen.field==="done"?"Đã nhận":"Còn thiếu"} (${rows.length})`;
                const vtCols="30px 70px 170px 64px 80px 80px 62px";
                return(
                <div style={{margin:"0 16px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
                  <div ref={tqVtRef} style={{background:"#fff"}}>
                    <div style={{padding:"8px 10px",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                      <b style={{fontSize:12,color:"#374151"}}>{tieuDe}</b>
                    </div>
                    {/* ✅ FIX: bọc trong khung cuộn NGANG (giống bảng "Giao xe") thay vì để lưới tự
                        co cột lại trên màn hình hẹp — trước đây cột "Tên vật tư" bị bóp quá hẹp khiến
                        chữ bị bẻ xuống dòng từng ký tự một (rất khó đọc). */}
                    <div style={{overflowX:"auto"}}>
                    <div style={{minWidth:610}}>
                    <div style={{display:"grid",gridTemplateColumns:vtCols,gap:6,padding:"6px 10px",background:"#111827",color:"#fff",fontSize:9,fontWeight:800,textTransform:"uppercase"}}>
                      <span>STT</span><span>Mã</span><span>Tên vật tư</span><span>Định mức</span><span>Vị trí</span><span>Nguồn gốc</span><span style={{textAlign:"right"}}>SL</span>
                    </div>
                    <div style={{maxHeight:tqDangChiaSe?"none":592,overflowY:tqDangChiaSe?"visible":"auto"}}>
                      {rows.length===0?(
                        <div style={{padding:14,textAlign:"center",fontSize:11,color:"#9ca3af"}}>— Không có mã nào —</div>
                      ):rows.map((v,i)=>(
                        <div key={v.id||v.ma} style={{display:"grid",gridTemplateColumns:vtCols,gap:6,padding:"7px 10px",borderTop:"1px solid #f1f5f9",background:i%2?"#f9fafb":"#fff",alignItems:"center"}}>
                          <span style={{fontSize:10,color:"#94a3b8"}}>{i+1}</span>
                          <span style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:.3,wordBreak:"break-word"}}>{v.ma}</span>
                          <span style={{fontSize:12,color:"#1f2937",fontWeight:600,lineHeight:1.3,wordBreak:"break-word"}}>{v.ten}</span>
                          <span style={{fontSize:10.5,color:"#374151"}}>{fmt(v.dm)}</span>
                          <span style={{fontSize:10.5,color:"#374151",wordBreak:"break-word"}}>{v.vt||"—"}</span>
                          <span style={{fontSize:10.5,color:"#374151",wordBreak:"break-word"}}>{v.ng||"—"}</span>
                          {tqVtOpen.field==="thieu"?(
                            <span style={{fontSize:10,fontWeight:800,color:"#dc2626",background:"#fee2e2",borderRadius:8,padding:"2px 6px",whiteSpace:"nowrap",textAlign:"center"}}>{fmt(v.ct)}</span>
                          ):(
                            <span style={{fontSize:10,fontWeight:800,color:"#16a34a",background:"#dcfce7",borderRadius:8,padding:"2px 6px",whiteSpace:"nowrap",textAlign:"center"}}>{fmt(v.dn)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    </div>
                    </div>
                  </div>
                  <div style={{display:"flex"}}>
                  <button disabled={tqDangChiaSe} onClick={async()=>{
                      setTqDangChiaSe(true);
                      try{
                        // ✅ Dùng chung pipeline xuatPDF/taoAnhBaoCao (giống các nút "Xuất & chia sẻ" khác
                        // trong app): dựng HTML tiêu đề + bảng riêng (KHÔNG chụp trực tiếp DOM đang hiển
                        // thị), rồi taoAnhBaoCao tự chia nhỏ thành từng nhóm 25 dòng/lần để chụp, tránh
                        // treo máy / quá thời gian chờ (timeout) khi danh sách dài — đồng thời có cùng
                        // định dạng (tiêu đề, cột, viền) với file Excel xuất ra.
                        const rowsHtml=rows.map((v,i)=>`<tr>
                          <td>${i+1}</td><td><b>${v.ma}</b></td><td class="l">${v.ten}</td>
                          <td>${v.dv||""}</td>
                          <td class="l">${v.vt||""}</td>
                          <td>${fmt(v.cn)}</td>
                          <td style="color:#065f46;font-weight:700">${fmt(v.dn)}</td>
                          <td style="color:${v.ct>0?"#dc2626":"#16a34a"}">${fmt(v.ct)}</td>
                        </tr>`).join("");
                        const daNhanNg=itemsNg.filter(v=>v.done).length;
                        await xuatPDF(`<h2>📋 Chi tiết vật tư ${tqVtOpen.nguon} — ${tqVtOpen.field==="thieu"?"Còn thiếu":"Đã nhận"} (${rows.length} mã)</h2>
                          <p class="sub">🚌 ${proj.icon||""} ${proj.ten} · ${itemsNg.length} mã · Đã nhận ${daNhanNg} · Còn thiếu ${itemsNg.length-daNhanNg}</p>
                          <table><thead><tr><th>STT</th><th>Mã số</th><th>Tên vật tư</th><th>ĐVT</th><th>Vị trí</th><th>Cần</th><th>Đã nhận</th><th>Còn thiếu</th></tr></thead><tbody>${rowsHtml}</tbody></table>`,
                          `VatTu_${tqVtOpen.nguon}_${tqVtOpen.field}`);
                      }catch(e){
                        console.error("xuatPDF vat tu:",e);
                        flash("❌ Tạo ảnh thất bại: "+e.message);
                      }finally{ setTqDangChiaSe(false); }
                    }}
                    style={{flex:1,border:"none",borderTop:"1px solid #e5e7eb",borderRight:"1px solid #e5e7eb",background:"#eff6ff",color:"#1d4ed8",fontWeight:700,fontSize:12,padding:"9px 0",cursor:tqDangChiaSe?"not-allowed":"pointer",opacity:tqDangChiaSe?0.6:1}}>
                    {tqDangChiaSe?"⏳ Đang tạo ảnh...":"📤 Xuất & chia sẻ"}
                  </button>
                  <button disabled={tqDangXuatExcel} onClick={async()=>{
                      setTqDangXuatExcel(true);
                      try{
                        const rows2=rows.map((v,i)=>({
                          "STT":i+1,
                          "Mã":v.ma,
                          "Tên vật tư":v.ten,
                          "Định mức":v.dm,
                          "Vị trí":v.vt,
                          "Nguồn gốc":v.ng,
                          [tqVtOpen.field==="thieu"?"SL thiếu":"SL đã nhận"]: tqVtOpen.field==="thieu"?(v.ct||0):(v.dn||0)
                        }));
                        await xuatExcel(rows2, `VatTu_${tqVtOpen.nguon}_${tqVtOpen.field}`, tieuDe);
                      }catch(e){
                        console.error("xuatExcel vat tu:",e);
                        flash("❌ Xuất Excel thất bại: "+e.message);
                      }finally{ setTqDangXuatExcel(false); }
                    }}
                    style={{flex:1,border:"none",borderTop:"1px solid #e5e7eb",background:"#f0fdf4",color:"#15803d",fontWeight:700,fontSize:12,padding:"9px 0",cursor:tqDangXuatExcel?"not-allowed":"pointer",opacity:tqDangXuatExcel?0.6:1}}>
                    {tqDangXuatExcel?"⏳ Đang xuất...":"📊 Xuất Excel"}
                  </button>
                  </div>
                </div>
                );
              })()}
            </div>
          </div>
          )}

          {/* ── MODAL "BẢNG TIẾN ĐỘ GIAO XE" — ghi nhận 1 đợt giao xe (thay cho prompt() cũ) ── */}
          {gxModalPid&&(()=>{
            const p2=projs.find(p=>p.id===gxModalPid);
            const dongXeVal=p2?(p2.mo_ta||p2.ten):"";
            const allSop=p2?buildSopRange(p2.sop_tu,p2.sop_den):[];
            const usedSop=new Set((lsDB[gxModalPid]||[]).filter(r=>r.loai==="Giao xe"&&r.sop).map(r=>r.sop));
            const availableSop=allSop.filter(s=>!usedSop.has(s));
            return(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}
              onClick={e=>{if(e.target===e.currentTarget)setGxModalPid(null);}}>
              <div style={{background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
                <div style={{fontWeight:800,fontSize:15,color:"#b45309"}}>🚌 BẢNG TIẾN ĐỘ GIAO XE</div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:14}}>{p2?`${p2.icon||"🚐"} ${p2.ten}`:""}</div>

                <div style={{borderTop:"1.5px dashed #e5e7eb",margin:"0 0 14px"}}/>

                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Dòng xe</label>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <div style={{...inp,flex:1,background:"#f3f4f6",color:"#374151",fontWeight:700}}>{dongXeVal||"—"}</div>
                    <span onClick={()=>{editProjMoTa(gxModalPid,p2?.mo_ta);}} title="Sửa Dòng xe"
                      style={{fontSize:16,cursor:"pointer",flexShrink:0,padding:"6px 8px",background:"#f3f4f6",borderRadius:7,border:"1.5px solid #e5e7eb"}}>✏️</span>
                  </div>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Sop</label>
                  <select value={gxForm.sop} onChange={e=>setGxForm(f=>({...f,sop:e.target.value}))} style={inp}>
                    <option value="">-- Chọn Sop --</option>
                    {availableSop.map(s=><option key={s} value={s}>{s}</option>)}
                    {gxForm.sop&&!availableSop.includes(gxForm.sop)&&<option value={gxForm.sop}>{gxForm.sop}</option>}
                  </select>
                  {allSop.length===0&&<div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>Dự án chưa khai báo khoảng Sop.</div>}
                  {allSop.length>0&&availableSop.length===0&&<div style={{fontSize:10,color:"#dc2626",marginTop:3}}>⚠️ Đã hết Sop khả dụng.</div>}
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ngày giao</label>
                  <input type="date" value={gxForm.ngayGiao} onChange={e=>setGxForm(f=>({...f,ngayGiao:e.target.value}))} style={inp}/>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Thời gian</label>
                  <div style={{...inp,background:"#f3f4f6",color:"#374151",fontWeight:700,textAlign:"center"}}>
                    {gxNow.toLocaleTimeString("vi-VN",{hour12:false})} · {gxNow.toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Nhân sự giao (Họ và Tên)</label>
                  <input value={gxForm.hoVaTen} onChange={e=>setGxForm(f=>({...f,hoVaTen:e.target.value}))} placeholder="Nhập họ và tên..." style={inp}/>
                </div>

                <div style={{marginBottom:18}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>SL xe</label>
                  <input type="number" min={1} value={gxForm.slXe} onChange={e=>setGxForm(f=>({...f,slXe:e.target.value}))} style={inp}/>
                </div>

                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button onClick={()=>setGxModalPid(null)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"8px 16px"}}>Hủy</button>
                  <button onClick={submitGiaoXe} style={{...btn,background:"#16a34a",color:"#fff",padding:"8px 18px",fontWeight:800}}>✅ Lưu</button>
                </div>
              </div>
            </div>
            );
          })()}
        </div>
        );
      })()}
    </LangCtx.Provider>
  );

  // ── MÀN HÌNH "ĐÃ THỰC HIỆN" (Giai đoạn 03) ĐỘC LẬP — danh sách dự án đã bấm "Hoàn thành" ──
  // Hiển thị dạng THẺ trong 1 bảng có tiêu đề cột: STT · Tên dự án · Lệnh SX · Lô SX ·
  // Ngày khởi tạo · Ngày hoàn thành · SL xe. Dự án bấm "Hoàn thành" SAU CÙNG luôn ở STT 1.
  if(showDaThucHien) return (
    <LangCtx.Provider value={{lang,t,setLang:setLangSaved}}>
      <div style={{minHeight:"100vh",background:"#f1f5f9",padding:"14px 14px 40px"}}>
        <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:12,padding:"16px 18px",marginBottom:14,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
          <ScreenTopBar onBack={goBackScreen} badgeBorderColor="#14b8a6" activeLine={activeLine} onLogout={handleLogoutScreenDocLap}/>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:.5}}>✅ GIAI ĐOẠN · 03 — ĐÃ THỰC HIỆN</div>
          <div style={{fontSize:11,opacity:.75,marginTop:4}}>Lưu trữ hồ sơ, đối chiếu và tổng kết dự án hoàn tất.</div>
        </div>

        {(()=>{
          // ✅ Dự án bấm "Hoàn thành" GẦN NHẤT luôn ở STT 1 (sắp theo hoan_thanh_ts giảm dần,
          // dự phòng theo ngay_hoan_thanh rồi id nếu thiếu hoan_thanh_ts — dữ liệu cũ).
          const doneList=[...projs].filter(p=>p.trang_thai==="hoan_thanh").sort((a,b)=>{
            const ka=a.hoan_thanh_ts||a.ngay_hoan_thanh||"";
            const kb=b.hoan_thanh_ts||b.ngay_hoan_thanh||"";
            if(ka!==kb) return String(kb).localeCompare(String(ka));
            return String(b.id||"").localeCompare(String(a.id||""));
          });
          if(doneList.length===0) return (
            <div style={{textAlign:"center",padding:"40px 16px",color:"#9ca3af",background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
              — Chưa có dự án nào hoàn thành cho dòng xe này —
            </div>
          );
          // ✅ Sop (từ số → đến số): lấy TOÀN BỘ SOP đã ghi nhận trong lịch sử "Giao xe" của
          // từng dự án (lsDB[p.id]), lấy giá trị nhỏ nhất → lớn nhất.
          const sopRange=(p)=>{
            const sops=(lsDB[p.id]||[]).filter(r=>r.loai==="Giao xe"&&r.sop!=null&&r.sop!=="").map(r=>Number(r.sop)).filter(n=>Number.isFinite(n));
            if(sops.length===0) return "—";
            const mn=Math.min(...sops),mx=Math.max(...sops);
            return mn===mx?`${mn}`:`${mn} → ${mx}`;
          };
          // ✅ Vật tư THCK/CKD của TỪNG dự án đã hoàn thành — tính lại độc lập từ bomDB[p.id] +
          // phDB[p.id] (không phụ thuộc dự án đang chọn/pid), theo cùng công thức "th" ở trên:
          // Đã giao = SL đã GỬI (kể cả chờ duyệt) ≥ SL cần · Đã nhận = SL ĐÃ XÁC NHẬN ≥ SL cần.
          const EPS=1e-6;
          const vatTuItems=(p)=>{
            const soXeP=p.so_xe||1;
            const bomP=bomDB[p.id]||[];
            const phP=(phDB[p.id]||[]).filter(x=>x.pid===p.id);
            const dnGuiMap={},dnXNMap={};
            for(const ph of phP){
              for(const c of(ph.ct||[])){
                dnGuiMap[c.ma]=(dnGuiMap[c.ma]||0)+(c.sl||0);
                if(c.ok) dnXNMap[c.ma]=(dnXNMap[c.ma]||0)+(c.sl_thuc_nhan??c.sl??0);
              }
            }
            return bomP.map(v=>{
              const cn=(Number(v.dm)||0)*soXeP;
              const dnGui=Number(dnGuiMap[v.ma])||0;
              const dnXN=Number(dnXNMap[v.ma])||0;
              return{...v,cn,dnGui,dnXN,doneGui:dnGui+EPS>=cn,done:dnXN+EPS>=cn};
            });
          };
          const vatTuStats=(p)=>{
            const items=vatTuItems(p);
            const out={};
            for(const nguon of["THCK","CKD"]){
              const itemsNg=items.filter(v=>(v.ng||"").trim().toUpperCase()===nguon);
              out[nguon]={tongMa:itemsNg.length,daGiao:itemsNg.filter(v=>v.doneGui).length,daNhan:itemsNg.filter(v=>v.done).length};
            }
            return out;
          };
          const thBold={fontSize:9,fontWeight:800,color:"#fff",textTransform:"uppercase",padding:"7px 9px",background:"#111827",textAlign:"center",whiteSpace:"nowrap"};
          const td={fontSize:12,color:"#374151",padding:"7px 9px",borderTop:"1px solid #f1f5f9",textAlign:"center"};
          const clickTd={...td,cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted",fontWeight:800};
          const dt=dtOpenDaTH&&doneList.find(p=>p.id===dtOpenDaTH.pid)?dtOpenDaTH:null;
          const dtProj=dt?doneList.find(p=>p.id===dt.pid):null;
          const toggleDt=(pid_,kind,nguon)=>{
            setDtOpenDaTH(cur=>(cur&&cur.pid===pid_&&cur.kind===kind&&cur.nguon===nguon)?null:{pid:pid_,kind,nguon});
          };
          const vtCols="70px 1fr 62px";
          const xeCols="36px 50px 1fr 60px 1.2fr 72px 60px";
          return(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* ── Bảng gộp: NỘI DUNG DỰ ÁN + NHẬN VẬT TƯ (THCK & CKD) song song, dùng chung STT/Tên dự án ── */}
            <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden",border:"1.5px solid #1e3a8a"}}>
              <div style={{padding:"8px 14px",background:"#f0fdfa",fontSize:12,fontWeight:800,color:"#0f766e"}}>📋 NỘI DUNG DỰ ÁN &amp; NHẬN VẬT TƯ</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:920}}>
                  <thead>
                    <tr>
                      <th style={{...thBold,width:34}} rowSpan={2}>STT</th>
                      <th style={thBold} rowSpan={2}>Tên dự án</th>
                      <th style={thBold} colSpan={5}>Nội dung dự án</th>
                      <th style={{...thBold,background:"#b45309"}} colSpan={3}>THCK</th>
                      <th style={{...thBold,background:"#0369a1"}} colSpan={3}>CKD</th>
                    </tr>
                    <tr>
                      <th style={thBold}>Sop</th>
                      <th style={thBold}>Dòng xe</th>
                      <th style={thBold}>Ngày bắt đầu</th>
                      <th style={thBold}>Ngày kết thúc</th>
                      <th style={thBold}>SL xe</th>
                      <th style={{...thBold,background:"#b45309"}}>Tổng mã</th>
                      <th style={{...thBold,background:"#b45309"}}>Đã giao</th>
                      <th style={{...thBold,background:"#b45309"}}>Đã nhận</th>
                      <th style={{...thBold,background:"#0369a1"}}>Tổng mã</th>
                      <th style={{...thBold,background:"#0369a1"}}>Đã giao</th>
                      <th style={{...thBold,background:"#0369a1"}}>Đã nhận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doneList.map((p,idx)=>{
                      const st=vatTuStats(p);
                      return(
                      <tr key={p.id} style={{background:idx%2?"#f9fafb":"#fff"}}>
                        <td style={td}>{idx+1}</td>
                        <td style={{...td,fontWeight:700,color:"#1f2937",textAlign:"left"}}>{p.ten}</td>
                        <td style={td}>{sopRange(p)}</td>
                        <td style={td}>{p.mo_ta||p.ten}</td>
                        <td style={td}>{p.ngay_khoi_tao||"—"}</td>
                        <td style={{...td,fontWeight:700,color:"#0f766e"}}>{p.ngay_hoan_thanh||"—"}</td>
                        <td style={{...clickTd,background:"#111827",color:"#fff",fontWeight:800}} onClick={()=>toggleDt(p.id,"xe")} title="Xem chi tiết giao xe">{p.so_xe||1}</td>
                        <td style={{...td,background:"#374151",color:"#fff",fontWeight:800}}>{st.THCK.tongMa}</td>
                        <td style={{...clickTd,background:"#111827",color:"#fff",fontWeight:800}} onClick={()=>toggleDt(p.id,"giao","THCK")} title="Xem chi tiết đã giao THCK">{st.THCK.daGiao}</td>
                        <td style={{...clickTd,background:"#374151",color:"#fff",fontWeight:800}} onClick={()=>toggleDt(p.id,"nhan","THCK")} title="Xem chi tiết đã nhận THCK">{st.THCK.daNhan}</td>
                        <td style={{...td,background:"#111827",color:"#fff",fontWeight:800}}>{st.CKD.tongMa}</td>
                        <td style={{...clickTd,background:"#374151",color:"#fff",fontWeight:800}} onClick={()=>toggleDt(p.id,"giao","CKD")} title="Xem chi tiết đã giao CKD">{st.CKD.daGiao}</td>
                        <td style={{...clickTd,background:"#111827",color:"#fff",fontWeight:800}} onClick={()=>toggleDt(p.id,"nhan","CKD")} title="Xem chi tiết đã nhận CKD">{st.CKD.daNhan}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Bảng chi tiết — hiện ra khi bấm vào ô SL xe / Đã giao / Đã nhận ── */}
            {dt&&dtProj&&(()=>{
              const tieuDe=dt.kind==="xe"
                ?`🚌 Chi tiết giao xe — ${dtProj.ten}`
                :`📦 Chi tiết ${dt.kind==="giao"?"đã giao":"đã nhận"} ${dt.nguon} — ${dtProj.ten}`;
              return(
              <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden",border:"1.5px solid #bae6fd"}}>
                <div style={{padding:"8px 14px",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                  <b style={{fontSize:12,color:"#1d4ed8"}}>{tieuDe}</b>
                  <button onClick={()=>setDtOpenDaTH(null)} style={{border:"none",background:"transparent",color:"#1d4ed8",fontWeight:800,fontSize:14,cursor:"pointer",lineHeight:1,padding:4}}>✕</button>
                </div>
                {dt.kind==="xe"?(()=>{
                  const rows=(lsDB[dtProj.id]||[]).filter(r=>r.loai==="Giao xe");
                  return(
                  <div style={{overflowX:"auto"}}>
                    <div style={{minWidth:520}}>
                      <div style={{display:"grid",gridTemplateColumns:xeCols,gap:4,padding:"6px 8px",background:"#111827",color:"#fff",fontSize:9,fontWeight:800,textTransform:"uppercase"}}>
                        <span>Stt</span><span>Sop</span><span>Dòng xe</span><span>SL xe</span><span>Nhân sự giao</span><span>Ngày giao</span><span>Giờ giao</span>
                      </div>
                      <div style={{maxHeight:296,overflowY:"auto"}}>
                        {rows.length===0?(
                          <div style={{padding:14,textAlign:"center",fontSize:11,color:"#9ca3af"}}>— Chưa có dữ liệu giao xe —</div>
                        ):rows.map((r,i)=>(
                          <div key={r.id} style={{display:"grid",gridTemplateColumns:xeCols,gap:4,padding:"6px 8px",fontSize:10.5,color:"#374151",borderTop:"1px solid #f1f5f9",background:i%2?"#f9fafb":"#fff",alignItems:"center"}}>
                            <span>{i+1}</span><span>{r.sop||"—"}</span><span style={{wordBreak:"break-word"}}>{r.dong_xe||r.ten||dtProj.ten}</span><span>{fmt(r.sl||0)}</span><span style={{wordBreak:"break-word"}}>{r.ho_va_ten||r.nguoi_duyet||"—"}</span><span>{r.ngay_giao||(r.ts?r.ts.slice(0,10):"—")}</span><span>{r.gio_giao||(r.ts?r.ts.slice(11,19):"—")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })():(()=>{
                  const items=vatTuItems(dtProj).filter(v=>(v.ng||"").trim().toUpperCase()===dt.nguon&&(dt.kind==="giao"?v.doneGui:v.done));
                  return(
                  <div style={{overflowX:"auto"}}>
                    <div style={{minWidth:420}}>
                      <div style={{display:"grid",gridTemplateColumns:vtCols,gap:6,padding:"6px 10px",background:"#111827",color:"#fff",fontSize:9,fontWeight:800,textTransform:"uppercase"}}>
                        <span>Mã</span><span>Tên vật tư</span><span style={{textAlign:"right"}}>SL</span>
                      </div>
                      <div style={{maxHeight:296,overflowY:"auto"}}>
                        {items.length===0?(
                          <div style={{padding:14,textAlign:"center",fontSize:11,color:"#9ca3af"}}>— Không có mã nào —</div>
                        ):items.map((v,i)=>(
                          <div key={v.id||v.ma} style={{display:"grid",gridTemplateColumns:vtCols,gap:6,padding:"7px 10px",borderTop:"1px solid #f1f5f9",background:i%2?"#f9fafb":"#fff",alignItems:"center"}}>
                            <span style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:.3,wordBreak:"break-word"}}>{v.ma}</span>
                            <span style={{fontSize:12,color:"#1f2937",fontWeight:600,lineHeight:1.3,wordBreak:"break-word"}}>{v.ten}</span>
                            <span style={{fontSize:10,fontWeight:800,color:"#16a34a",background:"#dcfce7",borderRadius:8,padding:"2px 6px",whiteSpace:"nowrap",textAlign:"center"}}>{fmt(dt.kind==="giao"?v.dnGui:v.dnXN)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>
              );
            })()}
          </div>
          );
        })()}
      </div>
    </LangCtx.Provider>
  );


  const role      = user.role;           // "thck" | "xuonghan" | "kho" | "khth"
  const isTHCK    = role==="thck";
  const isXH      = role==="xuonghan";
  const isKHO     = role==="kho";
  const isKHTH    = role==="khth";       // Vai trò mới — CHỈ XEM, không thao tác
  // ✅ Bộ tab hiển thị = giao giữa (a) chức năng đã cấp cho ĐƠN VỊ của tài khoản (bảng
  // "Phân quyền chức năng theo đơn vị" — tabQuyen, mặc định theo TAB_QUYEN_DEFAULT nếu
  // Admin chưa tuỳ chỉnh) và (b) thứ tự/nhãn chuẩn của TABS_ALL. Nhờ vậy mỗi đơn vị chỉ
  // thấy đúng nhiệm vụ đã được phân công (VD "XH_MINIBUS" có thể bị giới hạn chỉ còn
  // "✅ Nhận Hàng" thay vì trọn bộ chức năng của vai trò "xuonghan").
  const donViTabKeys = getTabKeysForDonVi(tabQuyen, user.don_vi);
  // ✅ TABS_NOW = bộ tab tài khoản này ĐƯỢC PHÉP truy cập (dùng để xác định tab nào bấm
  // được, tab nào bị khoá) — giữ nguyên 100% logic tính quyền như trước.
  const TABS_NOW  = (()=>{
    let tabs = TABS_ALL.filter(([k])=>donViTabKeys.includes(k));
    if(isAdminAccount(user) && !tabs.some(([k])=>k==="users")) {
      // Thêm "users" tab cho MỌI tài khoản quản trị (admin, xh04, hoặc tài khoản bất kỳ
      // được tick "🛡️ Cấp quyền Quản trị viên") dù bảng phân quyền chức năng của đơn vị
      // đó có bị giới hạn đến đâu — admin luôn cần thấy "👥 Phân Quyền Sử Dụng" để quản lý.
      tabs = [...tabs, ["users", "👥 Phân Quyền Sử Dụng"]];
    }
    if(isAdminAccount(user) && !tabs.some(([k])=>k==="cms")) {
      // Tab "Quản Trị CMS" — CHỈ tài khoản quản trị (admin, xh04) thấy & chỉnh sửa (quản
      // lý nội dung, banner, ảnh đại diện hiển thị trong app). Không nằm trong bảng phân
      // quyền chức năng theo đơn vị vì không đơn vị nào khác được cấp quyền này.
      tabs = [...tabs, ["cms", "🖼️ Quản Trị CMS"]];
    }
    // An toàn: nếu 1 đơn vị lỡ bị cấu hình 0 chức năng, vẫn giữ lại tối thiểu "📦 Vật tư"
    // để tài khoản không rơi vào màn trắng không điều hướng được.
    if(!tabs.length) tabs = TABS_ALL.filter(([k])=>k==="ds");
    return tabs;
  })();
  // ✅ Bộ KEY được phép truy cập (Set để tra cứu nhanh trong sidebar).
  const allowedTabKeySet = new Set(TABS_NOW.map(([k])=>k));
  // ✅ TABS_DISPLAY = TOÀN BỘ tab hiển thị trên thanh công cụ cho MỌI tài khoản (kể cả tab
  // chưa được cấp quyền) — thống nhất giao diện cho tất cả tài khoản. Tab không có quyền
  // vẫn HIỆN nhưng bị làm mờ + bấm vào báo "Bạn chưa được quyền truy cập" (xem sidebar bên
  // dưới), thay vì bị ẩn hẳn như trước đây.
  const TABS_DISPLAY = (()=>{
    let tabs = [...TABS_ALL];
    if(!tabs.some(([k])=>k==="cms")) tabs = [...tabs, ["cms", "🖼️ Quản Trị CMS"]];
    return tabs;
  })();
  // ✅ Dòng xe mà tài khoản đang đăng nhập được PHÉP truy cập, dùng để giới hạn bộ chọn
  // "DÒNG XE" ngay trong màn hình chính (dashboard) — trước đây bộ chọn này liệt kê CẢ 3
  // dòng xe cho MỌI tài khoản, không kiểm tra bảng "Phân quyền dòng xe theo đơn vị", nên
  // 1 tài khoản chỉ được cấp 1 dòng (VD "KHO VẬT TƯ" → chỉ Mini Bus) vẫn có thể tự bấm đổi
  // sang dòng xe khác (VD City Bus) và xem/thao tác nhầm dữ liệu không thuộc phận sự của
  // mình. Nay giới hạn đúng theo lineQuyen — tài khoản "admin" luôn có toàn quyền cả 3.
  const allowedLinesForUser = isAdminAccount(user) ? LINE_IDS : (lineQuyen[user.don_vi] || []);
  const linesPickable = KL_LINES.filter(l=>allowedLinesForUser.includes(l.id));
  const mauRole   = isTHCK ? "#1d4ed8" : isKHO ? "#0f766e" : isKHTH ? "#7c3aed" : "#b45309";
  // 🚨 Danh sách đơn vị để chọn "gửi đến" khi báo khẩn cấp — lấy trực tiếp từ danh sách
  // tài khoản thật (users) để luôn khớp với các đơn vị đang thực sự tồn tại trong hệ thống.
  const donViOptions = Array.from(new Set(users.map(u=>u.don_vi).filter(Boolean))).sort();
  // 🔔 Số cảnh báo khẩn cấp CHƯA ĐỌC gửi đến đơn vị của tài khoản đang đăng nhập, CỘNG THÊM
  // số cảnh báo mà đơn vị mình LIÊN QUAN (đã gửi HOẶC là 1 trong các đơn vị nhận) đang có
  // phản hồi mới mà mình CHƯA XEM (phan_hoi_chua_doc) — báo cho TẤT CẢ các bên liên quan biết,
  // kể cả khi có nhiều lượt phản hồi qua lại liên tiếp (mỗi lượt đều tính là "mới" cho những
  // đơn vị chưa kịp xem lượt đó).
  const canhBaoChuaDoc = canhBaoKhan.filter(c=>{
    const laNguoiNhanChuaDoc = (c.don_vi_nhan||[]).includes(user.don_vi)&&!(c.doc_boi||[]).includes(user.don_vi);
    const laLienQuanCoPhanHoiChuaXem = ((c.don_vi_nhan||[]).includes(user.don_vi)||c.don_vi_gui===user.don_vi) && (c.phan_hoi_chua_doc||[]).includes(user.don_vi);
    return laNguoiNhanChuaDoc||laLienQuanCoPhanHoiChuaXem;
  }).length;
  // Danh sách hiển thị trong modal 🔔 — mọi cảnh báo mà đơn vị của mình LIÊN QUAN (nhận hoặc đã gửi)
  const canhBaoLienQuan = canhBaoKhan.filter(c=>(c.don_vi_nhan||[]).includes(user.don_vi)||c.don_vi_gui===user.don_vi);

  return(
    <LangCtx.Provider value={{lang,t,setLang:setLangSaved}}>
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"linear-gradient(110deg,#EAF5FF,#EFF7FF)",minHeight:"100vh",width:"100%",maxWidth:"100vw",boxSizing:"border-box"}}>

      {/* ── DESIGN TOKENS + QUY TẮC MÀN HÌNH MÁY TÍNH (theo UI_Design_Specification_Dashboard_BOM.docx) ──
          ≥1440px: sidebar 220–230px, main max-width≈1400px. 1024–1439px: giữ sidebar≈117px.
          Dưới 1024px vẫn giữ hành vi/kích thước mobile hiện có (không đụng vào). */}
      <style>{`
        html,body{ margin:0; overflow-x:hidden; }
        :root{
          --navy:#06285F; --blue:#0867D8; --blue-light:#2B8EF3; --cyan:#35B9F4;
          --green:#12A875; --green-dark:#05865F; --purple:#7540E8;
          --orange:#F3B52B; --red:#E94B55; --bg:#EEF7FF;
          --text:#0B326D; --text-secondary:#71839D;
          --radius-md:14px; --radius-lg:17px; --radius-xl:22px; --radius-pill:999px;
          --shadow-card:0 8px 25px rgba(22,83,130,.10);
        }
        @media (min-width:1024px){
          .kl-header-inner{ height:88px !important; }
          .kl-sidebar-desktop{ width:117px !important; }
          .kl-main-desktop{ max-width:1400px; margin:0 auto; padding:0 20px; box-sizing:border-box; }
          /* Khối thao tác nhanh — trên máy tính luôn giữ đúng 4 cột đều nhau, không co lại 2 cột */
          .kl-quickcards{ grid-template-columns:repeat(4,minmax(0,1fr)) !important; gap:16px !important; }
          /* Khối tổng quan (Dòng xe/Dự án + Tiến độ) — trên máy tính xếp NGANG HÀNG thành 1 dải
             thay vì xếp chồng 2 tầng như trên điện thoại, tận dụng chiều rộng màn hình */
          .kl-overview-grid{ flex-direction:row !important; align-items:stretch !important; }
          .kl-overview-grid > *{ margin-bottom:0 !important; }
          .kl-overview-grid > *:first-child{ flex:1.3 !important; }
          .kl-overview-grid > *:last-child{ flex:1 !important; }
        }
        @media (min-width:1440px){
          .kl-sidebar-desktop{ width:225px !important; }
          .kl-main-desktop{ padding:0 32px; }
          .kl-quickcards{ gap:20px !important; }
        }
        /* 🎨 Icon 3D sidebar — hiệu ứng "lung linh": glow xanh nhấp nháy nhẹ quanh icon
           đang được chọn, tạo cảm giác nổi khối/toả sáng thay vì icon phẳng tĩnh. */
        @keyframes klTabIconGlow{
          0%,100%{ box-shadow:0 0 0 2px rgba(56,189,248,.55), 0 6px 16px rgba(22,140,255,.4), 0 0 10px rgba(56,189,248,.25); }
          50%{ box-shadow:0 0 0 2px rgba(125,211,252,.85), 0 8px 22px rgba(22,140,255,.6), 0 0 22px rgba(125,211,252,.6); }
        }
        .kl-tab-icon-active{ animation:klTabIconGlow 2.4s ease-in-out infinite; }
        .kl-tab-icon-active svg{ filter:drop-shadow(0 2px 5px rgba(0,0,0,.35)); }
      `}</style>

      {/* HEADER — H≈88px (desktop), gradient navy→blue theo token Header (#06285F → #125BC0) */}
      <div style={{background:"linear-gradient(110deg,#06285F,#125BC0)",borderBottom:"1px solid #06285F"}}>
        <div className="kl-header-inner" style={{height:64,padding:"0 24px",display:"flex",alignItems:"center",gap:16,boxSizing:"border-box"}}>

          {/* Logo + tên hệ thống — logo ≈57×44px, brand title 16/700 màu trắng theo spec Typography */}
          <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0,minWidth:0}}>
            <div style={{width:57,height:44,borderRadius:10,background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0,color:mauRole,overflow:"hidden"}}>
              {isTHCK?"🏭":isKHO?"📦":isKHTH?"📋":(
                <img src={XH_BUS_ICON_B64} alt="Xe buýt điện" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/>
              )}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:16,fontWeight:700,letterSpacing:.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"#ffffff",lineHeight:1.25}}>{t("brandTitle")}</div>
              <div style={{fontSize:10.5,fontWeight:700,color:"#7fb0ff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textTransform:"uppercase",letterSpacing:.4,marginTop:2}}>
                {isTHCK?t("roleTHCK"):isKHO?t("roleKHO"):isKHTH?(user.don_vi||t("roleKHTH")):t("roleXH")}
              </div>
            </div>
          </div>

          {/* Ô tìm kiếm đã được bỏ theo yêu cầu — giữ 1 div rỗng flex:1 để giữ bố cục 3 cột
              (logo trái · khoảng trống giữa · cụm thông báo/tài khoản phải) không bị lệch. */}
          <div style={{flex:1,minWidth:0}}/>

          {/* Cụm bên phải: thông báo / tài khoản (avatar≈42px) / thao tác nhanh */}
          <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            {msg&&<span style={{fontSize:10,color:"#16a34a",background:"#eefdf3",border:"1px solid #bbf7d0",borderRadius:20,padding:"3px 8px",whiteSpace:"nowrap"}}>{msg}</span>}
            {dbErr&&<span style={{fontSize:10,color:"#991b1b",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:20,padding:"3px 8px",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={dbErr}>⚠️</span>}

            {/* 🔔 Chuông cảnh báo khẩn cấp — badge đỏ hiện số lượng chưa đọc */}
            <div onClick={()=>setShowCanhBaoList(true)} title="Cảnh báo khẩn cấp" style={{position:"relative",width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.10)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,cursor:"pointer",flexShrink:0,border:canhBaoChuaDoc>0?"1px solid #fca5a5":"1px solid rgba(255,255,255,0.16)"}}>
              🔔
              {canhBaoChuaDoc>0&&<span style={{position:"absolute",top:-3,right:-3,background:"var(--red)",color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",boxShadow:"0 1px 3px rgba(0,0,0,0.25)"}}>{canhBaoChuaDoc>9?"9+":canhBaoChuaDoc}</span>}
            </div>

            {/* Tài khoản — avatar 42px + giờ:phút + ngày, theo spec "Header & Sidebar" */}
            {(()=>{
              const _now=new Date();
              const _hh=String(_now.getHours()).padStart(2,"0");
              const _mm=String(_now.getMinutes()).padStart(2,"0");
              const _dd=String(_now.getDate()).padStart(2,"0");
              const _mo=String(_now.getMonth()+1).padStart(2,"0");
              const _yy=_now.getFullYear();
              const _thu=_now.getDay()+1;
              return(
                <div title={`${user.ten} · ${user.don_vi||""}`} style={{display:"flex",alignItems:"center",gap:9,flexShrink:0,cursor:"pointer"}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,overflow:"hidden",border:"2px solid rgba(255,255,255,.7)"}}>
                    {isImgAvatar(user.avatar)
                      ? <img src={user.avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : (user.avatar||<IconUserGear3D size={20}/>)}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#ffffff",whiteSpace:"nowrap",lineHeight:1.2}}>{_hh}:{_mm}</div>
                    <div style={{fontSize:9.5,color:"#c7dcff",whiteSpace:"nowrap",lineHeight:1.2,marginTop:1}}>Th {_thu}, {_dd}/{_mo}/{_yy}</div>
                  </div>
                  <span style={{fontSize:10,color:"#c7dcff",marginLeft:2}}>▾</span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modal chọn Dự án (được mở từ ô "DỰ ÁN" trong dashboard bên dưới) — ✅ Khi đang ở tab
          "Báo cáo" và đang xem trang con "Đã hoàn thành", danh sách CHỈ hiện các dự án đã
          hoàn thành (khớp đúng ngữ cảnh đang xem, tránh nhảy nhầm sang dự án đang làm). */}
      {projPickerOpen&&(()=>{
        const dangLocDaXong = tab==="bc" && bcSubTab==="done";
        // ⚠️ FIX: khi đang ở trang con "🚧 Đang thực hiện" của tab "Báo cáo", dropdown PHẢI
        // dùng "bcDangList" (đã loại trừ các dự án đã tính là "Đã hoàn thành" — bấm nút HOẶC
        // đã nhận đủ 100% vật tư) thay vì "projs" thô, để 1 dự án đã xong không còn bị liệt kê
        // nhầm ở đây nữa — nó CHỈ còn xuất hiện đúng 1 nơi duy nhất: danh sách "Đã hoàn thành".
        const dangLocDangLam = tab==="bc" && bcSubTab==="dang";
        const projPickerList = dangLocDaXong ? bcDoneList : (dangLocDangLam ? bcDangList : projs);
        return(
        <>
          <div onClick={()=>setProjPickerOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
          <div style={{position:"fixed",left:16,right:16,top:"18%",background:"#fff",borderRadius:12,boxShadow:"0 12px 40px rgba(0,0,0,0.25)",maxWidth:340,margin:"0 auto",zIndex:41,overflow:"hidden",maxHeight:"60vh",overflowY:"auto"}}>
            <div style={{padding:"10px 14px",fontSize:12,fontWeight:800,color:"#6b7897",borderBottom:"1px solid #f1f5f9"}}>CHỌN DỰ ÁN{dangLocDaXong?" · ✅ Đã hoàn thành":dangLocDangLam?" · 🚧 Đang thực hiện":""}</div>
            {projPickerList.length===0?(
              <div style={{padding:"20px 14px",fontSize:12,color:"#9ca3af",textAlign:"center"}}>{dangLocDaXong?"— Chưa có dự án nào đã hoàn thành —":dangLocDangLam?"— Không còn dự án nào đang thực hiện —":"— Chưa có dự án nào —"}</div>
            ):[...projPickerList].reverse().map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",background:p.id===pid?`${p.mau||"#2563eb"}14`:"#fff",borderBottom:"1px solid #f1f5f9"}}>
                <span onClick={()=>{sw(p.id);if(dangLocDaXong){bcNav.markManual(p.id);setBcDoneViewPid(p.id);}setProjPickerOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                  <span style={{fontSize:16}}>{p.icon}</span>
                  <span style={{fontSize:13,fontWeight:700,color:p.id===pid?(p.mau||"#2563eb"):"#1f2937",lineHeight:1.3}}>{p.ten}</span>
                </span>
                {p.id===pid&&<span style={{fontSize:11,color:p.mau||"#2563eb",flexShrink:0}}>●</span>}
                <span onClick={(e)=>{e.stopPropagation();editProjName(p.id,p.ten);}} title="Sửa tên dự án" style={{fontSize:13,padding:"2px 4px",flexShrink:0,opacity:.55}}>✏️</span>
                <span onClick={(e)=>{e.stopPropagation();editProjMoTa(p.id,p.mo_ta);}} title="Sửa Dòng xe" style={{fontSize:12,padding:"2px 4px",flexShrink:0,opacity:.55}}>🚌</span>
              </div>
            ))}
          </div>
        </>
        );
      })()}

      {/* Modal chọn Dòng xe (được mở từ ô "DÒNG XE" trong dashboard bên dưới) — CHỈ liệt kê
          đúng (các) dòng xe tài khoản đang đăng nhập được cấp quyền (linesPickable), không
          còn hiện cả 3 dòng cho mọi tài khoản như trước. */}
      {linePickerOpen&&(
        <>
          <div onClick={()=>setLinePickerOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
          <div style={{position:"fixed",left:16,right:16,top:"18%",background:"#fff",borderRadius:12,boxShadow:"0 12px 40px rgba(0,0,0,0.25)",maxWidth:340,margin:"0 auto",zIndex:41,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",fontSize:12,fontWeight:800,color:"#6b7897",borderBottom:"1px solid #f1f5f9"}}>CHỌN DÒNG XE</div>
            {linesPickable.map(l=>(
              <div key={l.id} onClick={()=>{setActiveLine(l.id);try{localStorage.setItem("activeLine",l.id);}catch{}setLinePickerOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",cursor:"pointer",background:l.id===activeLine?"#eaf2ff":"#fff",borderBottom:"1px solid #f1f5f9"}}>
                <VehicleIconCircle lineId={l.id} size={20}/>
                <span style={{fontSize:13,fontWeight:700,color:l.id===activeLine?"#2563eb":"#1f2937"}}>{l.title}</span>
                {l.id===activeLine&&<span style={{marginLeft:"auto",fontSize:11,color:"#2563eb"}}>●</span>}
              </div>
            ))}
            {!linesPickable.length&&(
              <div style={{padding:"14px",fontSize:12,color:"#dc2626"}}>⚠️ Đơn vị "{user.don_vi}" chưa được cấp quyền truy cập dòng xe nào. Liên hệ Quản trị viên.</div>
            )}
          </div>
        </>
      )}

      {/* ⚠️ CẢNH BÁO MẤT KẾT NỐI SERVER — hiển thị to, rõ để không nhầm tưởng "mất dữ liệu" */}
      {dbErr&&(
        <div style={{background:"#fef2f2",borderBottom:"2px solid #dc2626",padding:"10px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
          <span style={{fontSize:20,lineHeight:1}}>⚠️</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:13,color:"#991b1b"}}>Không kết nối được server — dữ liệu đang hiển thị có thể KHÔNG phải dữ liệu thật</div>
            <div style={{fontSize:12,color:"#7f1d1d",marginTop:2}}>{dbErr}</div>
            <div style={{fontSize:11,color:"#991b1b",marginTop:4,opacity:.85}}>Dữ liệu thật của bạn trên Supabase KHÔNG bị mất — thử tải lại trang (F5); nếu vẫn lỗi, kiểm tra biến môi trường trên Vercel rồi deploy lại.</div>
          </div>
          <button onClick={()=>window.location.reload()} style={{...btn,background:"#dc2626",color:"#fff",padding:"6px 14px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>🔄 Tải lại</button>
        </div>
      )}

      {/* ── LAYOUT: sidebar dọc bên TRÁI + cột nội dung chính bên phải ──
          (trước đây là thanh TABS ngang phía trên + thanh nav cố định phía dưới —
          nay gộp thành 1 sidebar dọc duy nhất, giữ nguyên toàn bộ tab/chức năng). */}
      <div style={{display:"flex",alignItems:"stretch"}}>

        {/* SIDEBAR — W≈117px, gradient navy #062C67→#031D46 phủ TOÀN BỘ chiều cao theo spec
            "Header & Sidebar". Item active = ô vuông gradient #168CFF→#0872E8 kèm glow xanh.
            ✅ FIX "thanh công cụ không hiển thị hết theo dữ liệu": nền navy giờ nằm ở khối NGOÀI
            được kéo giãn (nhờ alignItems:"stretch" ở hàng flex cha ngay phía trên) nên LUÔN tự
            chạy dài hết đúng bằng chiều cao cột nội dung/bảng chính, bất kể bảng dài bao nhiêu —
            không còn bị cắt cụt giữa chừng để lộ khoảng trắng như trước. Icon 9 tab + logo được
            bọc trong 1 lớp con position:"sticky" để vẫn luôn "dính" theo màn hình khi cuộn, đồng
            thời có maxHeight:"100vh"+overflowY:"auto" để tự cuộn nội bộ, đảm bảo KHÔNG BAO GIỜ bị
            thiếu/cắt tab nào dù màn hình thấp hay danh sách tab dài tới đâu. */}
        {(()=>{
          const TAB_ICON_CMP = {ds:IconBox3D, soan:IconClipboardCheck3D, duyet:IconShieldCheck3D, pgn:IconReceipt3D, bc:IconChartBar3D, hoanthanh:IconFlagFinish3D, bom_mau:IconFolderGear3D, users:IconUsersLock3D, cms:IconImageCms3D};
          const TAB_LABEL_XH = {ds:"Vật tư", soan:"Soạn hàng", duyet:"Kiểm tra xác nhận", bom_mau:"Tạo BOM mẫu", pgn:"Phiếu GN", bc:"Báo cáo", hoanthanh:"Dự án đã hoàn thành vật tư", users:"Phân quyền sử dụng", cms:"Quản trị CMS"};
          // ✅ Tab "🏁 Các Dự Án Đã Hoàn Thành" là 1 LỐI VÀO NHANH tới đúng nội dung "✅ Đã hoàn
          // thành" đã có sẵn bên trong tab "📈 Báo Cáo" (bcSubTab==="done") — không tạo lại UI,
          // chỉ điều hướng state hiện có (tab="bc" + bcSubTab="done") để tái dùng 100% logic cũ.
          const goToTab = (k) => {
            if(!allowedTabKeySet.has(k)){
              alert("⚠️ BẠN CHƯA ĐƯỢC QUYỀN TRUY CẬP NỘI DUNG NÀY, VUI LÒNG LIÊN HỆ QUẢN TRỊ VIÊN.");
              return;
            }
            if(k==="hoanthanh"){
              setTab("bc");
              bcNav.markManual(pid);
              setBcSubTab("done");
              setBcDoneViewPid(null);
            } else if(k==="bc"){
              setTab("bc");
              if(bcSubTab==="done"){ bcNav.markManual(pid); setBcSubTab("dang"); }
            } else {
              setTab(k);
            }
          };
          return(
            <div className="kl-sidebar-desktop" style={{flexShrink:0,width:92,
              background:"linear-gradient(180deg,#062C67 0%,#031D46 100%)",zIndex:30,boxSizing:"border-box"}}>
              {/* Lớp DÍNH bên trong — chạy tự động theo chiều cao dữ liệu: khi cột nội dung bên
                  phải ngắn, lớp này cao 100vh bình thường; khi bảng dữ liệu dài hơn 1 màn hình,
                  position:"sticky" giữ icon+logo luôn hiển thị trong khung nhìn suốt quá trình
                  cuộn, còn maxHeight+overflowY:"auto" đảm bảo nếu chính danh sách tab quá dài so
                  với 1 màn hình (màn hình thấp/ngang) thì nó tự cuộn riêng — không tab nào bị ẩn. */}
              <div style={{position:"sticky",top:0,height:"100vh",maxHeight:"100vh",overflowY:"auto",
                display:"flex",flexDirection:"column",boxSizing:"border-box"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"20px 10px 12px",flexShrink:0}}>
                  {TABS_DISPLAY.map(([k])=>{
                    const active = k==="hoanthanh" ? (tab==="bc"&&bcSubTab==="done")
                      : k==="bc" ? (tab==="bc"&&bcSubTab!=="done")
                      : tab===k;
                    const allowed = allowedTabKeySet.has(k);
                    const label=isXH?(TAB_LABEL_XH[k]||t(`tab_${k}`)):t(`tab_${k}`).replace(/^\S+\s*/,"");
                    const IconCmp = TAB_ICON_CMP[k];
                    return(
                      <button key={k} onClick={()=>goToTab(k)}
                        title={allowed?label:`${label} — 🔒 Chưa được cấp quyền`}
                        style={{border:"none",cursor:allowed?"pointer":"not-allowed",fontFamily:"inherit",
                        width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                        padding:"6px 2px",background:"transparent",textAlign:"center",opacity:allowed?1:.45,flexShrink:0}}>
                        <span className={active?"kl-tab-icon-active":""} style={{width:46,height:46,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",
                          background:active?"rgba(56,189,248,0.16)":"rgba(255,255,255,0.05)",
                          position:"relative",
                          boxShadow:active?"0 0 0 2px rgba(56,189,248,0.55), 0 6px 16px rgba(22,140,255,0.4)":"none",
                          transition:"background .15s,box-shadow .15s"}}>
                          <span style={{display:"flex",filter:allowed?"none":"grayscale(.9) brightness(.7)"}}>
                            {IconCmp?<IconCmp size={30}/>:<span style={{fontSize:19,color:"#a9c3ec"}}>•</span>}
                          </span>
                          {!allowed&&<span style={{position:"absolute",bottom:-2,right:-2,fontSize:11,background:"#0B326D",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>🔒</span>}
                        </span>
                        <span style={{fontSize:10.5,fontWeight:active?800:600,color:active?"#ffffff":"#a9c3ec",lineHeight:1.15,whiteSpace:"normal",textTransform:"uppercase"}}>{label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Chân trang sidebar — logo Kim Long Motor gắn cố định phía dưới cùng */}
                <div style={{flex:1,minHeight:60,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:6,padding:"18px 8px 20px",position:"relative",overflow:"hidden",flexShrink:0}}>
                  <img src={XH_BUS_ICON_B64} alt="Kim Long Motor" style={{width:34,height:34,borderRadius:9,objectFit:"cover",flexShrink:0}}/>
                  <div style={{fontSize:9.5,fontWeight:800,color:"#ffffff",textAlign:"center",lineHeight:1.2}}>Kim Long Motor</div>
                  <div style={{fontSize:8,color:"#9db4dd",textAlign:"center",lineHeight:1.2}}>Vững bước tương lai</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* CỘT NỘI DUNG CHÍNH — bên phải sidebar */}
        <div className="kl-main-desktop" style={{flex:1,minWidth:0}}>

      {/* DASHBOARD TỔNG QUAN — hiển thị THƯỜNG TRỰC trên mọi tab NGOẠI TRỪ tab "👥 Người dùng"
          (trang quản lý tài khoản/phân quyền không liên quan tới 1 dự án/dòng xe cụ thể nào,
          nên khối "Dòng xe / Dự án / Tổng quan dự án" không có ý nghĩa và gây rối mắt ở đây). */}
      {tab!=="users" && tab!=="bom_mau" && (()=>{
        const daGiao=Math.min((ls||[]).filter(r=>r.loai==="Giao xe").reduce((s,r)=>s+(Number(r.sl)||0),0),soXe);
        const pctGiao=soXe>0?Math.round(daGiao/soXe*100):0;
        return(
          <div style={{background:"#fff",borderBottom:"1px solid #e4e9f2",padding:"0 10px 14px"}}>
            {/* ── Thao tác nhanh — Ngôn ngữ / Đổi MK / Chữ ký / Đăng xuất — đặt NGAY TRÊN khối
                "Dòng xe / Dự án" (trước đây nằm trong Header và có thể bị cắt/ẩn ở mép phải
                trên màn hình hẹp) ── */}
            {/* ── Thao tác nhanh — phiên bản "đặc sắc": 4 thẻ rộng hết chiều ngang màn hình,
                mỗi thẻ có icon 3D riêng + tiêu đề + phụ đề, giống bố cục 4 khối ở ảnh mẫu desktop.
                Dùng CSS grid auto-fit để tự co giãn: 4 cột trên màn rộng, 2 cột trên điện thoại hẹp. ── */}
            <div style={{padding:"10px 0 12px"}}>
              <div className="kl-quickcards" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(132px,1fr))",gap:10}}>
                {[
                  {icon:<IconGlobe3D size={30}/>, title:lang==="vi"?"Ngôn ngữ":"语言", sub:lang==="vi"?"Việt · Trung":"越南语 · 中文", bg:"linear-gradient(135deg,#eff6ff,#dbeafe)", accent:"#2563eb", onClick:()=>setLangSaved(lang==="vi"?"zh":"vi")},
                  {icon:<IconKey3D size={30}/>, title:"Đổi mật khẩu", sub:"Bảo mật tài khoản", bg:"linear-gradient(135deg,#fff7ed,#ffedd5)", accent:"#ea580c", onClick:()=>setShowChangePw(true)},
                  {icon:<IconPenSign3D size={30}/>, title:user.chu_ky?"Sửa chữ ký":"Tạo chữ ký", sub:"Chữ ký điện tử", bg:"linear-gradient(135deg,#f5f3ff,#ede9fe)", accent:"#7c3aed", onClick:()=>setShowSignPad(true)},
                  {icon:<IconUserGear3D size={30}/>, title:"Tài khoản", sub:user.ten||"Đăng xuất", bg:"linear-gradient(135deg,#fdf2f8,#fce7f3)", accent:"#db2777", onClick:()=>{if(window.confirm("Đăng xuất?")){try{localStorage.removeItem("loggedInUser");localStorage.removeItem("screenMode");}catch{}setUser(null);setShowTongQuan(false);setShowKhoiTao(false);setShowDaThucHien(false);}}},
                ].map((it,i)=>(
                  <div key={i} onClick={it.onClick} title={it.title}
                    style={{cursor:"pointer",background:it.bg,border:`1px solid ${it.accent}22`,borderRadius:16,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 2px 6px rgba(0,0,0,0.06)",transition:"transform .12s, box-shadow .12s",userSelect:"none"}}
                    onMouseDown={e=>{e.currentTarget.style.transform="scale(0.96)";}}
                    onMouseUp={e=>{e.currentTarget.style.transform="scale(1)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
                  >
                    <div style={{width:42,height:42,borderRadius:12,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.12)"}}>
                      {it.icon}
                    </div>
                    <div style={{minWidth:0,flex:1}}>
                      <div style={{fontSize:12.5,fontWeight:800,color:"#1f2937",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.title}</div>
                      <div style={{fontSize:10,color:it.accent,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>{it.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bộ chuyển 2 trang con của tab "Báo cáo" (Đang thực hiện / Đã hoàn thành) ĐÃ
                BỊ BỎ theo yêu cầu — giờ đây "Báo Cáo" (sidebar) CHỈ hiện "🚧 Đang thực hiện",
                còn "🏁 Các Dự Án Đã Hoàn Thành" (sidebar) CHỈ hiện "✅ Đã hoàn thành". Việc tự
                động ép bcSubTab theo đúng trạng thái dự án (effect phía trên, dựa vào
                trang_thai/duAll) vẫn hoạt động bình thường — chỉ bỏ 2 nút bấm tay thủ công. */}

            {/* ── Trên điện thoại: 2 khối này xếp chồng (Dòng xe/Dự án ở trên, Tiến độ ở dưới).
                Trên máy tính (≥1024px, xem CSS .kl-overview-grid ở trên): xếp NGANG HÀNG thành
                1 dải để tận dụng chiều rộng màn hình, không còn bị dồn hẹp như trên di động. ── */}
            <div className="kl-overview-grid" style={{display:"flex",flexDirection:"column",gap:0}}>
            {/* ╔════ Dòng xe / Dự án — ngang hàng với hình ảnh ════╗
                ✅ ẨN HẲN khi đang ở tab "🖼️ Quản Trị CMS" theo yêu cầu — CMS quản lý nội dung
                chung của toàn hệ thống, không gắn với 1 dòng xe/dự án cụ thể nào, nên 2 ô chọn
                này không có ý nghĩa và dễ gây hiểu nhầm khi hiển thị ở màn CMS. */}
            {tab!=="cms"&&(
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              {/* DÒNG XE */}
              <div onClick={()=>{if(linesPickable.length>1) setLinePickerOpen(true);}} style={{flex:1,minWidth:0,background:"#fff",border:"1px solid #e5e7eb",borderLeft:"3px solid #ec4899",borderRadius:12,padding:"12px",cursor:linesPickable.length>1?"pointer":"default",boxShadow:"0 1px 3px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"#fce7f3",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>{activeLine==="citybus"?"🚌":activeLine==="12m"?"🚍":"🚐"}</div>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontSize:9.5,fontWeight:900,color:"#ec4899",letterSpacing:.7,textTransform:"uppercase"}}>Dòng Xe</div>
                  <div style={{fontSize:15,fontWeight:900,color:"#1f2937",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.2}}>
                    {KL_LINES.find(l=>l.id===activeLine)?.title||"Mini Bus"}
                    {linesPickable.length>1&&<span style={{marginLeft:4,color:"#d1d5db",fontWeight:700}}>▾</span>}
                  </div>
                </div>
              </div>
              
              {/* DỰ ÁN — nổi bật hơn với hình xe */}
              <div onClick={()=>setProjPickerOpen(true)} style={{flex:1,minWidth:0,background:"#f0fdf4",border:"1px solid #e5e7eb",borderLeft:"3px solid #10b981",borderRadius:12,padding:"12px",cursor:"pointer",position:"relative",overflow:"hidden",boxShadow:"0 2px 8px rgba(16,185,129,0.1)",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18,position:"relative",zIndex:2}}>📁</div>
                <div style={{minWidth:0,flex:1,position:"relative",zIndex:2}}>
                  <div style={{fontSize:9.5,fontWeight:900,color:"#10b981",letterSpacing:.7,textTransform:"uppercase"}}>Dự Án</div>
                  <div style={{fontSize:14,fontWeight:900,color:"#059669",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.2}}>
                    {proj.ten} <span style={{fontWeight:700}}>▾</span>
                  </div>
                </div>
                {/* Hình xe buýt vô hình ở phía sau */}
                <div style={{position:"absolute",right:-10,bottom:-15,fontSize:80,opacity:0.06,pointerEvents:"none",transform:"scaleX(-1)"}}>🚌</div>
              </div>
            </div>
            )}

            {/* ╔════ Tiến độ dự án — 1 khối duy nhất: icon lá + tiêu đề + vòng tròn % (giống mẫu) ════╗
                ✅ Cũng bỏ hẳn khi ở tab "🖼️ Quản Trị CMS" theo yêu cầu — không chỉ ẩn mà loại
                khỏi cây hiển thị luôn, vì CMS không liên quan tới tiến độ giao xe của dự án. */}
            {tab!=="cms"&&(
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12,background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
              {/* Icon dòng xe — hiển thị đúng ảnh/icon theo dòng xe đang chọn (12M / City Bus / Mini Bus) */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:54,height:54,borderRadius:14,overflow:"hidden",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.12)",background:(activeLine==="minibus"||activeLine==="12m")?"transparent":(nhanDongXe(activeLine).nen||"#f3f4f6")}}>
                {activeLine==="minibus"?(
                  <img src="data:image/png;base64,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" alt="Mini Bus" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                ):activeLine==="12m"?(
                  <img src="data:image/png;base64,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" alt="Xe 12M" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                ):(
                  <span style={{fontSize:28}}>{nhanDongXe(activeLine).icon}</span>
                )}
              </div>
              {/* Nhãn + tên dự án */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10.5,fontWeight:900,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.6,marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11}}>📶</span>Tiến Độ Giao Xe
                </div>
                <div style={{fontSize:14.5,fontWeight:800,color:"#0f172a",lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {proj.ten}
                </div>
                <div style={{fontSize:12.5,fontWeight:700,color:"#9ca3af",lineHeight:1.3,marginTop:2}}>
                  {fmt(daGiao)}/{fmt(soXe)} xe cập nhật
                </div>
              </div>
              {/* Vòng tròn phần trăm (donut) + nhãn Tiến Độ */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                <div style={{position:"relative",width:58,height:58}}>
                  <svg width="58" height="58" viewBox="0 0 58 58" style={{transform:"rotate(-90deg)"}}>
                    <circle cx="29" cy="29" r="24" fill="none" stroke="#e5f7ee" strokeWidth="5.5"/>
                    <circle cx="29" cy="29" r="24" fill="none" stroke="#10b981" strokeWidth="5.5"
                      strokeDasharray={`${2*Math.PI*24}`}
                      strokeDashoffset={`${2*Math.PI*24*(1-pctGiao/100)}`}
                      strokeLinecap="round"/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13.5,fontWeight:900,color:"#16a34a"}}>{pctGiao}%</div>
                </div>
                <div style={{fontSize:8.5,fontWeight:900,color:"#9ca3af",letterSpacing:.5,textTransform:"uppercase"}}>Tiến Độ</div>
              </div>
            </div>
            )}
            </div>{/* đóng .kl-overview-grid */}

            {/* ✅ Đã bỏ hoàn toàn nút "＋ Thêm xe mới" và nút "🗑️ Xoá dự án" theo yêu cầu. */}

            {/* Tổng quan dự án — đã bỏ theo yêu cầu (4 ô Xe/Mã vật tư/Phiếu/Giao dịch) */}
          </div>
        );
      })()}

      <div style={{padding:"12px 10px",boxSizing:"border-box",width:"100%",paddingBottom:16}}>

        {/* ── DANH SÁCH BOM ── */}
        {tab==="ds"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
              <input placeholder="🔍 STT, mã, tên, vị trí..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,flex:"1 1 200px",minWidth:150}}/>
              <select value={fdm} onChange={e=>setFdm(e.target.value)} style={{...inp,flex:"1 1 140px",minWidth:120}}>
                <option>Tất cả</option>{DMS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
              <div style={{gridColumn:"1 / -1",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
                <ExportBar
                  shareTitle={`📦 Danh sách vật tư — ${proj.ten}`}
                  shareText={`BOM ${proj.ten}: ${filtered.length} mã vật tư, ${soXe} xe`}
                  onExcel={()=>xuatExcel(
                    filtered.map(v=>({
                      "STT":v.stt,"Mã số":v.ma,"Tên vật tư":v.ten,"ĐVT":v.dv,
                      "ĐM/1XE":v.dm,[`Cần(×${soXe}xe)`]:v.dm*soXe,
                      "Nguồn gốc":v.ng,"Vị trí":v.vt,"JIG":v.jig,"Ghi chú":v.gc,
                      // ✅ Cột riêng XE 12M — chỉ thêm khi activeLine==="12m"
                      ...(activeLine==="12m" ? {
                        "Check GH29Y":v.ckgh==="rieng"?"RIÊNG GH29Y":"DÙNG CHUNG",
                        "Phân xưởng":v.px||"","Dài(mm)":v.dai||"","Rộng(mm)":v.rong||"","Dày(mm)":v.day_kt||"",
                        "Trạm/Xí":v.tram||"","Trách nhiệm XH":v.tnxh||"",
                      } : {}),
                    })),
                    `VatTu_${proj.ten.replace(/\s/g,"_")}`,
                    `Danh sách vật tư — ${proj.ten}`
                  )}
                  onPDF={()=>{
                    const is12m=activeLine==="12m";
                    const rows=filtered.map((v,i)=>`<tr>
                      <td>${v.stt}</td><td><b>${v.ma}</b></td><td class="l">${v.ten}</td>
                      <td style="text-align:center">${v.dv}</td>
                      <td style="text-align:center">${fmt(v.dm)}</td>
                      <td style="text-align:center;font-weight:700;color:#065f46">${fmt(v.dm*soXe)}</td>
                      <td>${v.ng}</td><td class="l">${v.vt||""}</td><td>${v.jig||""}</td><td>${v.gc||""}</td>
                      ${is12m?`<td>${v.ckgh==="rieng"?"RIÊNG GH29Y":"DÙNG CHUNG"}</td><td>${v.px||""}</td><td>${v.dai||""}×${v.rong||""}×${v.day_kt||""}</td><td>${v.tram||""}</td><td>${v.tnxh||""}</td>`:""}
                    </tr>`).join("");
                    xuatPDF(`<h2>${t("rpDs")}</h2>
                      <p class="sub">${proj.icon} ${proj.ten} · ${filtered.length}/${bom.length} mã · ${soXe} xe</p>
                      <table><thead><tr><th>${t("thSTT")}</th><th>${t("thMa")}</th><th>${t("thTen")}</th><th>${t("thDVT")}</th><th>${t("thDM")}</th><th>${t("thCan")}×${soXe}</th><th>${t("thNguonGoc")}</th><th>${t("lbVT")}</th><th>JIG</th><th>${t("thGhiChu")}</th>${is12m?`<th>Check GH29Y</th><th>Phân xưởng</th><th>DxRxD(mm)</th><th>Trạm/Xí</th><th>Trách nhiệm XH</th>`:""}</tr></thead><tbody>${rows}</tbody></table>`,
                      `VatTu_${proj.ten}`);
                  }}
                />
                {isXH&&(
                  <button onClick={xoaToanBoBom} title="Xoá toàn bộ vật tư của dự án này"
                    style={{border:"1px solid #fecaca",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,padding:"6px 13px",display:"flex",alignItems:"center",gap:5,background:"#fef2f2",color:"#dc2626"}}>
                    <span>🗑️</span> Xoá Bom
                  </button>
                )}
              </div>
              {!isKHTH&&<button onClick={()=>{importPidRef.current=pid;setShowXlsImport(true);}} style={{...btn,background:"#f0fdf4",color:"#065f46",padding:"7px 10px",fontSize:13,border:"1px solid #bbf7d0",width:"100%",justifyContent:"center"}}>📊 Import Excel</button>}
              {!isKHTH&&<button onClick={()=>setShowImport(true)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"7px 10px",fontSize:13,border:"1px solid #bfdbfe",width:"100%",justifyContent:"center"}}>➕ Thêm vật tư</button>}
              {isXH&&<button onClick={()=>{setCur({...E0,ng:DMS[0]||""});setModal("add");}} style={{...btn,background:mauP,color:"#fff",padding:"7px 10px",fontSize:13,width:"100%",justifyContent:"center",gridColumn:"1 / -1"}}>+ Thêm mới</button>}
            </div>

            {/* ── Chọn trang vật tư — 5 trang cố định theo nhóm Vị trí, đặt ngay dưới nút "Thêm mới" ── */}
            <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
              {TRANG_VT.map((tr,i)=>{
                const active=trangVT===i;
                return(
                  <button key={i} onClick={()=>setTrangVT(i)} title={tr.mo} style={{
                    flex:"1 0 auto",minWidth:64,border:active?"1.5px solid "+mauP:"1.5px solid #e5e7eb",
                    borderRadius:10,cursor:"pointer",fontFamily:"inherit",padding:"7px 10px",textAlign:"center",
                    background:active?mauP:"#fff",color:active?"#fff":"#374151",
                    boxShadow:active?"0 3px 10px -3px "+mauP+"aa":"none"
                  }}>
                    <div style={{fontSize:9.5,fontWeight:900,opacity:.85}}>Trang {i+1}</div>
                    <div style={{fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}>{tr.ten}</div>
                  </button>
                );
              })}
            </div>

            {/* ── Danh sách vật tư dạng BẢNG (cột) — mỗi cột tương ứng đúng tên cột dùng khi
                nhập/import Excel (STT, Mã số, Tên vật tư, Nguồn gốc, Vị trí, JIG, ĐVT, ĐM,
                Cần nhận, Ghi chú...). Tiêu đề đổ nền XANH + chữ TRẮNG, dữ liệu chữ ĐEN bình
                thường (bỏ hiển thị dạng thẻ/badge màu như trước).
                ✅ "Linh động" khi không đủ kích thước: bọc trong khung cuộn NGANG (overflowX:
                auto) + minWidth cố định cho lưới cột — trên màn hình hẹp người dùng cuộn ngang
                để xem đủ cột thay vì bị bóp cột/vỡ chữ. ── */}
            <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:"1px solid #f1f5f9",overflow:"hidden"}}>
              {filtered.length===0?(
                <div style={{textAlign:"center",padding:"40px 20px",color:"#9ca3af",fontSize:13}}>
                  Không tìm thấy vật tư nào
                </div>
              ):(()=>{
                const is12m=activeLine==="12m";
                const vtCols=`44px 100px minmax(200px,1fr) 100px 90px 70px 60px 70px 90px 110px 60px${is12m?" 110px 80px 120px 80px 90px":""}${!isKHTH?" 80px":""}`;
                const vtMinWidth=994+(is12m?480:0)+(!isKHTH?90:0);
                const vtHeaders=[t("thSTT"),t("thMa"),t("thTen"),t("thNguonGoc"),t("lbVT"),"JIG",t("thDVT"),t("thDM"),t("thCanNhan"),t("thGhiChu"),"Ảnh",
                  ...(is12m?["Check GH29Y","Phân xưởng","DxRxD(mm)","Trạm/Xí","TN XH"]:[]),
                  ...(!isKHTH?["Thao tác"]:[])];
                return(
                <div style={{overflowX:"auto"}}>
                <div style={{minWidth:vtMinWidth}}>
                  <div style={{display:"grid",gridTemplateColumns:vtCols,background:"#1d4ed8",color:"#fff",fontSize:10.5,fontWeight:800,textTransform:"uppercase"}}>
                    {vtHeaders.map((h,hi)=>(
                      <div key={hi} style={{padding:"8px 8px",textAlign:(hi===2||hi===9)?"left":"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h}</div>
                    ))}
                  </div>
                  {filtered.map((v,i)=>(
                    <div key={v.ma+i} style={{display:"grid",gridTemplateColumns:vtCols,background:i%2?"#f9fafb":"#fff",borderTop:"1px solid #f1f5f9",alignItems:"center",fontSize:12,color:"#111827"}}>
                      <div style={{padding:"8px 8px",textAlign:"center"}}>{v.stt}</div>
                      <div style={{padding:"8px 8px",textAlign:"center",fontWeight:700,wordBreak:"break-word"}}>{v.ma}</div>
                      <div style={{padding:"8px 8px",textAlign:"left",wordBreak:"break-word"}}>{v.ten}</div>
                      <div style={{padding:"8px 8px",textAlign:"center",wordBreak:"break-word"}}>{v.ng||"—"}</div>
                      <div style={{padding:"8px 8px",textAlign:"center",wordBreak:"break-word"}}>{v.vt||"—"}</div>
                      <div style={{padding:"8px 8px",textAlign:"center",wordBreak:"break-word"}}>{v.jig||"—"}</div>
                      <div style={{padding:"8px 8px",textAlign:"center"}}>{v.dv}</div>
                      <div style={{padding:"8px 8px",textAlign:"center"}}>{fmt(v.dm)}</div>
                      <div style={{padding:"8px 8px",textAlign:"center",fontWeight:700}}>{fmt(v.dm*soXe)}</div>
                      <div style={{padding:"8px 8px",textAlign:"left",wordBreak:"break-word"}}>{v.gc||"—"}</div>
                      <div style={{padding:"6px 8px",textAlign:"center"}}>
                        {v.anh
                          ? <img src={v.anh} alt="" onClick={()=>setAnhPv(v.anh)} style={{width:28,height:28,objectFit:"cover",borderRadius:5,cursor:"zoom-in",border:"1px solid #e5e7eb"}}/>
                          : <span style={{color:"#d1d5db",fontSize:15}}>🖼</span>}
                      </div>
                      {is12m&&(
                        <>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.ckgh==="rieng"?"RIÊNG GH29Y":"DÙNG CHUNG"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.px||"—"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.dai||"-"}×{v.rong||"-"}×{v.day_kt||"-"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.tram||"—"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.tnxh||"—"}</div>
                        </>
                      )}
                      {!isKHTH&&(
                        <div style={{padding:"6px 6px",display:"flex",gap:4,justifyContent:"center"}}>
                          <button onClick={()=>{setCur({...E0,...v});setModal("edit");}} style={{...btn,background:"#fef3c7",color:"#92400e",padding:"4px 7px",fontSize:11}}>✏️</button>
                          <button onClick={()=>del(v)} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"4px 7px",fontSize:11}}>🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                </div>
                );
              })()}
              <div style={{padding:"10px 10px",fontSize:11,color:"#9ca3af",display:"flex",justifyContent:"space-between",borderTop:"1px solid #f1f5f9",flexWrap:"wrap",gap:6}}>
                <span>{filtered.length}/{bom.filter(v=>dmPriority(v.vt)===trangVT).length} mã · Trang {trangVT+1}: {TRANG_VT[trangVT].ten}</span>
                <span style={{display:"flex",gap:16}}>
                  <span>ĐM tổng: <b>{fmt(filtered.reduce((s,v)=>s+v.dm,0))}</b></span>
                  <span style={{color:"#065f46"}}>{t("thCanNhan")} ({soXe} xe): <b>{fmt(filtered.reduce((s,v)=>s+v.dm*soXe,0))}</b></span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── SOẠN HÀNG ── */}
        {/* ── SOẠN HÀNG ── */}
        {tab==="soan"&&(()=>{
          // ✅ Giới hạn theo tài khoản: "Kho vật tư" chỉ thấy vật tư Nguồn gốc = CKD,
          // "NHÀ MÁY THCK" chỉ thấy vật tư Nguồn gốc = THCK. Vai trò khác (VD Xưởng Hàn) xem đầy đủ.
          // Chỉ áp dụng RIÊNG trong tab Soạn Hàng — không ảnh hưởng các tab/màn hình khác.
          const bom = isKHO ? bomFull.filter(v=>(v.ng||"").trim().toUpperCase()==="CKD")
                    : isTHCK ? bomFull.filter(v=>(v.ng||"").trim().toUpperCase()==="THCK")
                    : bomFull;
          const th = isKHO ? thFull.filter(v=>(v.ng||"").trim().toUpperCase()==="CKD")
                   : isTHCK ? thFull.filter(v=>(v.ng||"").trim().toUpperCase()==="THCK")
                   : thFull;
          const thByMa={};th.forEach(v=>{thByMa[v.ma]=v;});
          // Tính mã đã duyệt đủ (done=true trong th) - dùng để lọc khỏi danh sách soạn
          const daDuyetDuSet=new Set(th.filter(v=>v.done).map(v=>v.ma));
          // Vật tư thiếu SL = đã có trong phiếu nhưng SL nhận < SL cần
          const thieuSlSet=new Set(th.filter(v=>v.giaoThieu).map(v=>v.ma));
          // ✅ Mã "nhận thiếu SL" = ĐÃ từng giao MỘT PHẦN (đã giao XH duyệt > 0) nhưng dnXN vẫn < cần.
          // Loại trừ mã "chưa soạn" (chưa có phiếu) VÀ mã "đã giao XH duyệt = 0" (chưa nhận gì).
          const soanThieuSet=new Set(th.filter(v=>v.giaoThieu&&v.dnXN>0).map(v=>v.ma));
          // Chỉ giữ lại: chưa được soạn HOẶC đã soạn nhưng thiếu SL (loại bỏ đã duyệt đủ)
          const bomHienThiGoc=bom.filter(v=>!daDuyetDuSet.has(v.ma)||thieuSlSet.has(v.ma)||soanThieuSet.has(v.ma));
          // ✅ FIX: trước đây "Chưa soạn"/"Đã soạn" tính theo SỐ MÃ DUY NHẤT (hoanThanhSet là
          // Set các mã), trong khi danh sách hiển thị thực tế (bomHienThiGoc) tính theo SỐ
          // DÒNG BOM (1 mã có thể lặp lại ở nhiều dòng nếu cần lắp ở nhiều vị trí khác nhau
          // trong cùng dự án). Khi 1 mã "đã duyệt đủ" bị ẩn, TẤT CẢ các dòng khác cùng mã đó
          // cũng bị ẩn theo — khiến số dòng còn hiển thị ít hơn hẳn con số "Chưa soạn" (tính
          // theo mã duy nhất). Nay tính lại "Chưa soạn" TRỰC TIẾP từ bomHienThiGoc (đúng những
          // dòng sẽ hiện ra khi bấm vào ô này) để 2 con số luôn khớp nhau.
          const bomHienThiGocIds=new Set(bomHienThiGoc.map(v=>v.id));
          const soMaChuaSoanTong=bomHienThiGoc.filter(v=>!soan[v.ma]?.on).length;
          const soMaHoanThanh=bom.length-soMaChuaSoanTong;
          const pct=bom.length?Math.round(soMaHoanThanh/bom.length*100):0;
          const xong=pct===100&&bom.length>0;
          // ✅ Bộ lọc nhanh: Tất cả / Chưa soạn / Đã soạn / Thiếu SL.
          // "Thiếu SL" hiển thị TOÀN BỘ mã thuộc soanThieuSet (không ẩn mã nào, kể cả đã duyệt đủ).
          // "Đã soạn" = phần bù chính xác của "Chưa soạn" trong TOÀN BỘ bom (gồm cả các dòng đã
          // duyệt đủ bị ẩn khỏi bomHienThiGoc) — khớp đúng số soMaHoanThanh ở trên.
          const bomHienThi = soanFilter==="thieu" ? bom.filter(v=>soanThieuSet.has(v.ma))
                            : soanFilter==="da"    ? bom.filter(v=>!bomHienThiGocIds.has(v.id)||soan[v.ma]?.on)
                            : soanFilter==="chua"  ? bomHienThiGoc.filter(v=>!soan[v.ma]?.on)
                            : bomHienThiGoc;
          // ✅ FIX: số mã dùng cho popup xác nhận "Gửi X mã đã soạn?" và điều kiện khoá nút Gửi —
          // PHẢI loại các mã đã "duyệt đủ" (daDuyetDuSet), khớp đúng với những gì guiDon() thực
          // sự gửi đi (guiDon cũng đã loại các mã này). Trước đây dùng biến `soaned` đếm TOÀN BỘ
          // mã có cờ `on:true` kể cả mã đã ẩn khỏi danh sách vì đã duyệt đủ (cờ `on` không được
          // dọn khi XƯỞNG HÀN duyệt qua đường khác) → popup hiện số mã NHIỀU HƠN số mã tick đang
          // thấy trên màn hình (VD tick 1 mã hiển thị nhưng popup báo "Gửi 3 mã").
          const soanedThucGui = bom.filter(v=>soan[v.ma]?.on&&!daDuyetDuSet.has(v.ma)).length;
          const soanFilterLabel = soanFilter==="da"?"Đã soạn":soanFilter==="chua"?"Chưa soạn":soanFilter==="thieu"?"Thiếu SL":"Tất cả";
          const soanFilterSlug = soanFilter==="da"?"DaSoan":soanFilter==="chua"?"ChuaSoan":soanFilter==="thieu"?"ThieuSL":"TatCa";
          const soMaDaDuyet=daDuyetDuSet.size;
          const nhom={};bomHienThi.forEach(v=>{const k=v.vt||"(Chưa có vị trí)";if(!nhom[k])nhom[k]=[];nhom[k].push(v);});
          const nhomKeys=Object.keys(nhom);
          const toggleGrp=(k)=>setSoanCollapsed(s=>({...s,[k]:!s[k]}));
          return(
            <div>
              {/* ── Banner tiêu đề xanh ── */}
              <div style={{background:"linear-gradient(135deg,#1e3a8a,#1d4ed8)",borderRadius:16,padding:"18px 20px",marginBottom:14,boxShadow:"0 4px 16px rgba(29,78,216,0.28)",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.14)",border:"2px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📋</div>
                <div style={{fontWeight:800,fontSize:16,color:"#fff",lineHeight:1.35}}>{t("titleSoan")} — {proj.icon} {proj.ten}</div>
              </div>

              {/* ── Thẻ số xe + đã duyệt đủ — thiết kế lại giống ảnh mẫu ── */}
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                <div style={{flex:1,minWidth:0,background:"#fff",borderRadius:16,padding:"18px 16px",boxShadow:"0 2px 10px rgba(15,23,42,0.10)",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:30,lineHeight:1,flexShrink:0}}>🚐</span>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,minWidth:0}}>
                    <span style={{fontWeight:900,fontSize:28,color:"#1d4ed8",lineHeight:1}}>{soXe}</span>
                    <span style={{fontSize:15,color:"#6b7280",fontWeight:700}}>xe</span>
                  </div>
                </div>
                {soMaDaDuyet>0&&(
                  <div style={{flex:1,minWidth:0,background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 10px rgba(16,185,129,0.10)",display:"flex",alignItems:"center",gap:12}}>
                    <span style={{width:34,height:34,borderRadius:"50%",background:"radial-gradient(circle at 32% 28%, #4ade80, #16a34a 65%, #15803d)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:900,flexShrink:0,boxShadow:"0 2px 5px rgba(21,128,61,0.45), inset 0 1px 1px rgba(255,255,255,0.5)"}}>✓</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:10.5,color:"#15803d",fontWeight:900,letterSpacing:.4,textTransform:"uppercase",lineHeight:1.3}}>Đã duyệt đủ:</div>
                      <div style={{fontSize:16,color:"#166534",fontWeight:900,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{soMaDaDuyet} mã (ẩn)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Card tiến độ soạn hàng ── */}
              <div style={{background:"#fff",borderRadius:14,padding:"16px 18px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                <div style={{fontWeight:800,fontSize:12,color:"#374151",letterSpacing:.4,marginBottom:12}}>TIẾN ĐỘ SOẠN HÀNG</div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <Prog p={pct} done={xong} h={10}/>
                  <span style={{fontWeight:700,fontSize:13,color:xong?"#16a34a":"#92400e",minWidth:80,textAlign:"right",flexShrink:0}}>{soMaHoanThanh}/{bom.length} ({pct}%)</span>
                </div>
                {/* ── Thẻ thống kê nhanh (1 hàng, 4 cột) — bấm vào thẻ = áp dụng bộ lọc tương ứng ── */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
                  {[
                    ["📄","Tổng mã",bom.length,"#1d4ed8","#eff6ff","all"],
                    ["✅","Đã soạn",soMaHoanThanh,"#16a34a","#f0fdf4","da"],
                    ["⏳","Chưa soạn",soMaChuaSoanTong,"#dc2626","#fef2f2","chua"],
                    ["⚠️","Thiếu SL",soanThieuSet.size,"#b45309","#fffbeb","thieu"],
                  ].map(([ic,l,v,c,bg,fk])=>(
                    <div key={l} onClick={()=>setSoanFilter(fk)}
                      style={{background:bg,borderRadius:12,padding:"10px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,textAlign:"center",cursor:"pointer",
                        border:soanFilter===fk?`2px solid ${c}`:"2px solid transparent",boxSizing:"border-box"}}>
                      <span style={{width:26,height:26,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,0.12)"}}>{ic}</span>
                      <div style={{fontWeight:800,fontSize:16,color:c,lineHeight:1.1}}>{v}</div>
                      <div style={{fontSize:9,color:c,fontWeight:600,opacity:.85}}>{l}</div>
                    </div>
                  ))}
                </div>
                {bomHienThi.length<bom.length&&(
                  <div style={{marginTop:12,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"9px 12px",fontSize:11,color:"#1e40af",display:"flex",gap:6,alignItems:"center"}}>
                    <span>ℹ️</span>
                    <span>Đang hiển thị {bomHienThi.length}/{bom.length} mã{soanFilter==="all"?` — ẩn ${bom.length-bomHienThi.length} mã đã duyệt đủ`:""}</span>
                  </div>
                )}
                {soanThieuSet.size>0&&(
                  <button onClick={()=>{
                      const items=bom.filter(v=>soanThieuSet.has(v.ma)).map(v=>{
                        const thV=thByMa[v.ma];const slCN=v.dm*soXe;
                        const canNhan=thV?.cn??slCN;const daGiaoXHDuyet=thV?.dnXN||0;
                        return {ma:v.ma,ten:v.ten,dv:v.dv,can:canNhan,daGiao:daGiaoXHDuyet,conThieu:Math.max(0,canNhan-daGiaoXHDuyet)};
                      });
                      setKhanCapModal({items});
                    }}
                    style={{marginTop:12,width:"100%",border:"1.5px solid #fecaca",background:"#fef2f2",color:"#b91c1c",borderRadius:12,padding:"11px 0",fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    🚨 Báo khẩn cấp hàng loạt ({soanThieuSet.size} mã thiếu SL)
                  </button>
                )}
                {/* ── Hàng nút hành động — cả 3 nút cùng 1 hàng, chia đều vừa màn hình ── */}
                <div style={{display:"flex",gap:6,marginTop:16}}>
                  <ExportBar
                    fluid
                    compact
                    shareTitle={`${t("titleSoan")} — ${proj.ten}`}
                    shareText={`Soạn hàng ${proj.ten} — ${soanFilterLabel}: ${bomHienThi.length} mã`}
                    onExcel={()=>{
                      const rows=bomHienThi.map(v=>{
                        const ok=!bomHienThiGocIds.has(v.id)||soan[v.ma]?.on;
                        return {
                          "STT":v.stt,"Mã số":v.ma,"Tên vật tư":v.ten,"ĐVT":v.dv,
                          "ĐM/1XE":v.dm,[`Cần(×${soXe})`]:v.dm*soXe,
                          "SL thực soạn":ok?(soan[v.ma]?.sl??v.dm*soXe):0,
                          "Trạng thái":ok?"✓ Đã soạn":"⏳ Chưa soạn","Nguồn gốc":v.ng,"Vị trí":v.vt,"JIG":v.jig
                        };
                      });
                      xuatExcel(rows,`SoanHang_${proj.ten.replace(/\s/g,"_")}_${soanFilterSlug}`,`Soạn hàng — ${proj.ten} (${soanFilterLabel})`);
                    }}
                    onPDF={()=>{
                      const mkRow=v=>{
                        const ok=!bomHienThiGocIds.has(v.id)||soan[v.ma]?.on;
                        return `<tr>
                        <td>${v.stt}</td><td><b>${v.ma}</b></td><td class="l">${v.ten}</td>
                        <td style="text-align:center">${v.dv}</td>
                        <td style="text-align:center">${fmt(v.dm*soXe)}</td>
                        <td style="text-align:center;font-weight:700">${ok?fmt(soan[v.ma]?.sl??v.dm*soXe):"—"}</td>
                        <td>${v.ng}</td>
                        <td>${v.jig||""}</td>
                        <td><span class="badge ${ok?"ok":"warn"}">${ok?"✓ Đã soạn":"⏳ Chưa soạn"}</span></td>
                      </tr>`;
                      };
                      xuatPDF(`<h2>${t("rpSoan")}</h2>
                        <p class="sub">${proj.icon} ${proj.ten} · ${soanFilterLabel}: ${bomHienThi.length} mã · ${soXe} xe</p>
                        <table><thead><tr><th>${t("thSTT")}</th><th>${t("thMa")}</th><th>${t("thTen")}</th><th>${t("thDVT")}</th><th>${t("thCan")}×${soXe}</th><th>${t("thSoSoan")}</th><th>${t("thNguonGoc")}</th><th>JIG</th><th>${t("thTrangThai")}</th></tr></thead><tbody>
                        ${bomHienThi.map(mkRow).join("")}
                        </tbody></table>`,`SoanHang_${proj.ten}_${soanFilterSlug}`);
                    }}
                  />
                  <button onClick={()=>{if(!window.confirm(`Gửi ${soanedThucGui} mã đã soạn đến XƯỞNG HÀN?`))return;guiDon();}} disabled={soanedThucGui===0}
                    style={{border:"none",cursor:"pointer",fontFamily:"inherit",flex:1,minWidth:0,background:xong?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",padding:"11px 6px",fontSize:11.5,fontWeight:800,opacity:bom.length===0?.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,borderRadius:12,boxShadow:xong?"0 3px 10px rgba(22,163,74,0.35)":"0 3px 10px rgba(217,119,6,0.35)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    <span>{xong?"✅":"📤"}</span>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{xong?"Gửi XH":`Gửi (${soMaHoanThanh}/${bom.length})`}</span>
                  </button>
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:10,padding:"10px 16px",marginBottom:nhomKeys.length>1?8:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:15,color:"#9ca3af",flexShrink:0}}>🔍</span>
                <input
                  value={soanSearch}
                  onChange={e=>setSoanSearch(e.target.value)}
                  placeholder="Nhập mã VT"
                  style={{...inp,border:"none",outline:"none",padding:"2px 0",fontSize:13,background:"transparent",flex:1,minWidth:120}}
                />
                {soanSearch&&<button onClick={()=>setSoanSearch("")} style={{border:"none",background:"none",cursor:"pointer",color:"#9ca3af",fontSize:16,padding:"0 2px",lineHeight:1}}>✕</button>}
              </div>
              {nhomKeys.length>1&&(
                <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12}}>
                  <button onClick={()=>setSoanCollapsed(Object.fromEntries(nhomKeys.map(k=>[k,true])))}
                    style={{...btn,background:"#1e3a8a",color:"#fff",fontWeight:800,padding:"7px 16px",fontSize:12}}>⬆ Thu gọn tất cả</button>
                  <button onClick={()=>setSoanCollapsed({})}
                    style={{...btn,background:"#1e3a8a",color:"#fff",fontWeight:800,padding:"7px 16px",fontSize:12}}>⬇ Mở rộng tất cả</button>
                </div>
              )}
              {Object.entries(nhom).sort(([a],[b])=>sapXepDM(a,b)).map(([dm,items])=>{
                const filteredItems=soanSearch.trim()
                  ?items.filter(v=>v.ma.toLowerCase().includes(soanSearch.toLowerCase())||v.ten.toLowerCase().includes(soanSearch.toLowerCase()))
                  :items;
                if(filteredItems.length===0)return null;
                const dG=filteredItems.filter(v=>soan[v.ma]?.on).length;
                const aD=dG===filteredItems.length;
                const aC=filteredItems.every(v=>soan[v.ma]?.on);
                const isCollapsed=!!soanCollapsed[dm];
                return(
                  <div key={dm} style={{background:"#fff",borderRadius:10,marginBottom:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:`1px solid ${aD?"#bbf7d0":"#e5e7eb"}`}}>
                    <div onClick={()=>toggleGrp(dm)} style={{padding:"7px 12px",background:aD?"#f0fdf4":"#f8fafc",borderBottom:isCollapsed?"none":"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                      <span style={{fontSize:11,color:"#9ca3af",transform:isCollapsed?"rotate(-90deg)":"none",transition:"transform .15s",display:"inline-block",width:12}}>▼</span>
                      <Tag bg={aD?"#16a34a":"#1d4ed8"} c="#fff" ch={dm}/>
                      <span style={{fontSize:12,color:"#6b7280"}}>{dG}/{filteredItems.length}</span>
                      {aD&&<span>✅</span>}
                      <button onClick={e=>{e.stopPropagation();togGrp(filteredItems,aC);}} style={{...btn,marginLeft:"auto",background:"#eff6ff",color:"#1d4ed8",padding:"4px 12px",fontSize:11}}>
                        {aC?"Bỏ chọn":"Chọn cả nhóm"}
                      </button>
                    </div>
                    {!isCollapsed&&filteredItems.map((v,i)=>{
                      const on=soan[v.ma]?.on||false;
                      const slCN=v.dm*soXe;
                      // ⭐ CÔNG THỨC DUY NHẤT tính "Còn thiếu": Cần nhận − Đã giao cho Xưởng Hàn và ĐÃ ĐƯỢC DUYỆT
                      // (lấy trực tiếp từ th/thByMa — dữ liệu gốc từ phiếu đã duyệt, không phụ thuộc vào
                      // trạng thái nhập tay ở Soạn Hàng nên không còn bị đảo ngược/nhầm lẫn như trước).
                      const thV=thByMa[v.ma];
                      const canNhan=thV?.cn??slCN;
                      const daGiaoXHDuyet=thV?.dnXN||0;
                      const conThieu=Math.max(0,canNhan-daGiaoXHDuyet);
                      // ⚠️ Chỉ cảnh báo khi mã ĐÃ TỪNG GIAO một phần (đã giao XH duyệt > 0) nhưng vẫn thiếu SL.
                      // Mã "chưa soạn" (chưa có phiếu) HOẶC "đã giao XH duyệt = 0" đều KHÔNG hiện badge này.
                      const canhBao=!!thV?.giaoThieu&&conThieu>0&&daGiaoXHDuyet>0;
                      // ✅ FIX: Ô "SL THỰC" mặc định (khi người dùng CHƯA từng nhập tay — không có
                      // trong soanDB) = SL CÒN THIẾU (conThieu) nếu mã đã giao một phần (canhBao),
                      // để người soạn chỉ cần soạn nốt phần thiếu thay vì phải tự sửa từ SL cần (75)
                      // xuống SL thiếu (2) mỗi lần. Nếu mã chưa giao gì hoặc đã nhập tay trước đó thì
                      // vẫn giữ nguyên hành vi cũ (mặc định SL cần / giá trị đã lưu).
                      const slV=soan[v.ma]?.sl??(canhBao?conThieu:slCN); // SL THỰC người dùng nhập/chuẩn bị gửi — chỉ dùng cho ô nhập, KHÔNG dùng để tính "còn thiếu"
                      return(
                        <div key={v.ma} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderBottom:i<filteredItems.length-1?"1px solid #f1f5f9":"none",background:canhBao?"#fffbeb":on?"#f0fdf4":"transparent",borderLeft:canhBao?"3px solid #fcd34d":"3px solid transparent"}}>
                          <div onClick={()=>togSoan(v.ma,slCN,slV)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${on?"#16a34a":canhBao?"#f59e0b":"#d1d5db"}`,background:on?"#16a34a":canhBao?"#fef3c7":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                            {on&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}
                            {!on&&canhBao&&<span style={{color:"#f59e0b",fontSize:12,fontWeight:700}}>…</span>}
                          </div>
                          {v.anh?<img src={v.anh} alt="" onClick={()=>setAnhPv(v.anh)} style={{width:28,height:28,objectFit:"cover",borderRadius:6,border:"1px solid #e5e7eb",cursor:"zoom-in",flexShrink:0}}/>
                            :<div style={{width:28,height:28,borderRadius:6,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:"#d1d5db",flexShrink:0,fontSize:12}}>🖼</div>}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"baseline",gap:8,whiteSpace:"nowrap",overflow:"hidden"}}>
                              <span style={{fontWeight:700,fontSize:12,color:mauP,fontFamily:"monospace",flexShrink:0}}>{v.ma}</span>
                              <span style={{fontSize:11,color:on?"#9ca3af":"#374151",textDecoration:on?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ten}</span>
                            </div>
                            <div style={{fontSize:10,color:"#6b7280",marginTop:1,display:"flex",gap:8,flexWrap:"nowrap",overflow:"hidden",whiteSpace:"nowrap"}}>
                              <span style={{flexShrink:0}}>VT: <b>{v.vt||"—"}</b></span>
                              <span style={{color:"#065f46",fontWeight:700,flexShrink:0}}>Cần: {fmt(slCN)} {v.dv}</span>
                              {canhBao&&<span style={{color:"#b45309",fontWeight:700,background:"#fef3c7",borderRadius:4,padding:"0 5px",flexShrink:1,overflow:"hidden",textOverflow:"ellipsis"}}>⚠️ Đã giao: {fmt(daGiaoXHDuyet)} {v.dv} (thiếu {fmt(conThieu)})</span>}
                            </div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,flexShrink:0}}>
                            <label style={{fontSize:8,color:"#9ca3af",fontWeight:700}}>SL THỰC</label>
                            <SlStepper value={slV} warn={canhBao||slV!==slCN} onChange={n=>setSlSoan(v.ma,n,slCN)}/>
                            {canhBao&&<span style={{fontSize:8,color:"#7cb342",fontWeight:800,textAlign:"center"}}>thiếu {fmt(conThieu)}</span>}
                            {!canhBao&&slV!==slCN&&<span style={{fontSize:8,color:"#f59e0b"}}>≠ KH</span>}
                          </div>
                          <div style={{width:20,height:20,borderRadius:"50%",background:on?"#d1fae5":"#f1f5f9",color:on?"#065f46":"#9ca3af",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0}}>{v.stt}</div>
                          {canhBao&&(
                            <button onClick={()=>{
                                const allThieu=bom.filter(x=>soanThieuSet.has(x.ma)).map(x=>{
                                  const thX=thByMa[x.ma];const slCNx=x.dm*soXe;
                                  const canNhanX=thX?.cn??slCNx;const daGiaoX=thX?.dnXN||0;
                                  return {ma:x.ma,ten:x.ten,dv:x.dv,can:canNhanX,daGiao:daGiaoX,conThieu:Math.max(0,canNhanX-daGiaoX)};
                                });
                                setKhanCapModal({items:allThieu.length?allThieu:[{ma:v.ma,ten:v.ten,dv:v.dv,can:slCN,daGiao:daGiaoXHDuyet,conThieu}], preSelectMa:v.ma});
                              }}
                              title="Báo khẩn cấp mã này (có thể chọn thêm mã khác)" style={{border:"none",background:"#fee2e2",color:"#dc2626",borderRadius:8,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",flexShrink:0}}>
                              🚨
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {bom.length===0&&<div style={{background:"#fff",borderRadius:10,padding:60,textAlign:"center",color:"#9ca3af",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                <div style={{fontSize:48,marginBottom:12}}>🚐</div><div style={{fontSize:14,fontWeight:600}}>Dự án chưa có vật tư</div>
              </div>}
              {bom.length>0&&(isTHCK||isKHO)&&(
                <div style={{position:"sticky",bottom:12,margin:"14px 0 0",background:xong?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#1e3a5f,#1d4ed8)",borderRadius:12,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",flexWrap:"wrap"}}>
                  <div>
                    <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{xong?"✅ Đã soạn xong!":` ${soMaHoanThanh}/${bom.length} mã đã soạn`}</div>
                    <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,marginTop:2}}>
                      {xong?"Nhấn Gửi XƯỞNG HÀN để hoàn tất":`Còn ${bomHienThi.length} mã cần soạn${soMaDaDuyet>0?` · ${soMaDaDuyet} mã đã duyệt đủ`:""}`}
                    </div>
                  </div>
                  <button onClick={()=>{if(!window.confirm(`Gửi ${soanedThucGui} mã đã soạn?`))return;guiDon();}}
                    style={{...btn,background:"#fff",color:xong?"#16a34a":"#1d4ed8",padding:"10px 24px",fontSize:14,fontWeight:700,borderRadius:10}}>
                    📤 {xong?"Gửi XƯỞNG HÀN":"Gửi đơn ngay"}
                  </button>
                </div>
              )}
            </div>
          );
        })()}


        {/* ── DUYỆT ĐƠN HÀNG (XH) ── */}
        {tab==="duyet"&&isXH&&(()=>{
          // Chỉ lấy phiếu của dự án đang chọn (pid) — mỗi dự án chỉ thấy phiếu duyệt của dự án đó
          const allPh=(phDB[pid]||[]).map(ph=>({...ph,projId:pid}));
          const choXN=allPh.filter(ph=>ph.tt==="Chờ xác nhận");
          const daXNAll=allPh.filter(ph=>ph.tt==="Đã xác nhận").sort((a,b)=>(b.id||"").localeCompare(a.id||""));
          const daXN=xhDaXNShowAll?daXNAll:daXNAll.slice(0,8);
          return(
            <div>
              <div style={{background:"linear-gradient(135deg,#431407,#b45309)",borderRadius:12,padding:"16px 20px",marginBottom:14,color:"#fff",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{t("titleDuyet")}</div>
                <div style={{fontSize:12,opacity:.8}}>{proj.icon} {proj.ten} · Đơn từ NHÀ MÁY THCK gửi · {choXN.length} chờ duyệt · {daXNAll.length} đã duyệt</div>
                <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
                  {[["Chờ duyệt",choXN.length,"#fca5a5"],["Đã duyệt",daXNAll.length,"#6ee7b7"],["Tổng đơn",allPh.length,"#fff"]].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 14px"}}>
                      <div style={{fontWeight:700,fontSize:18,color:c}}>{v}</div>
                      <div style={{fontSize:10,opacity:.8}}>{l}</div>
                    </div>
                  ))}
                  <div style={{marginLeft:"auto"}}>
                    <ExportBar
                      shareTitle={`${t("titleDuyet")} (${proj.ten})`}
                      shareText={`Dự án ${proj.ten}: ${allPh.length} phiếu, ${choXN.length} chờ duyệt, ${daXNAll.length} đã duyệt`}
                      onExcel={()=>xuatExcel(
                        allPh.map(ph=>({
                          "Số phiếu":ph.sp,"Dự án":proj.ten,
                          "Ngày":ph.ngay,"Tổng mã":ph.tong,
                          "Trạng thái":ph.tt,"Ghi chú":ph.gc||""
                        })),
                        `DuyetDon_${proj.ten}`,"Danh sách đơn hàng"
                      )}
                      onPDF={()=>{
                        const rows=allPh.map(ph=>{
                          return`<tr>
                            <td><b>${ph.sp}</b></td><td>${proj.ten}</td><td>${ph.ngay}</td>
                            <td style="text-align:center">${ph.tong}</td>
                            <td><span class="badge ${ph.tt==="Đã xác nhận"?"ok":"warn"}">${ph.tt}</span></td>
                            <td>${ph.gc||""}</td>
                          </tr>`;
                        }).join("");
                        xuatPDF(`<h2>${t("rpDuyet")}</h2>
                          <p class="sub">Dự án ${proj.ten} · ${allPh.length} phiếu · ${choXN.length} chờ duyệt · ${daXNAll.length} đã duyệt</p>
                          <table><thead><tr><th>Số phiếu</th><th>Dự án</th><th>Ngày</th><th>Tổng mã</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead><tbody>${rows}</tbody></table>`,
                          `DuyetDon_${proj.ten}`);
                      }}
                    />
                  </div>
                </div>
              </div>

              {choXN.length===0&&daXN.length===0&&(
                <div style={{background:"#fff",borderRadius:10,padding:60,textAlign:"center",color:"#9ca3af",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                  <div style={{fontSize:48,marginBottom:12}}>📭</div>
                  <div style={{fontSize:14,fontWeight:600}}>Chưa có đơn hàng nào</div>
                  <div style={{fontSize:12,marginTop:4}}>Đơn hàng sẽ hiện ở đây khi NHÀ MÁY THCK gửi</div>
                </div>
              )}

              {choXN.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#dc2626",marginBottom:8}}>⏳ Chờ duyệt ({choXN.length})</div>
                  {[...choXN].reverse().slice(0,showChoXN).map(ph=>{
                    const projName=projs.find(p=>p.id===ph.projId)?.ten||ph.projId;
                    const projBg = getProjectBgColor(ph.projId, projs);
                    const projMau = projs.find(p=>p.id===ph.projId)?.mau || "#6b7280";
                    const daSoanItems=(ph.ct||[]).filter(c=>c.sl>0);
                    return(
                      <div key={ph.id} style={{background:projBg,borderRadius:10,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:`1px solid ${projMau}`,overflow:"hidden"}}>
                        <div style={{padding:"12px 16px",background:projBg,borderBottom:`1px solid ${projMau}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:14}}>📄 {ph.sp}</div>
                            <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>
                              🏭 {projName} · 📅 {ph.ngay} · 📦 {daSoanItems.length}/{ph.tong} mã đã soạn
                            </div>
                            {ph.gc&&<div style={{fontSize:11,color:"#92400e",marginTop:2}}>💬 {ph.gc}</div>}
                          </div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <button onClick={()=>huyDuyet(ph.id,ph.projId)} style={{...btn,background:"#fff",color:"#dc2626",border:"1.5px solid #dc2626",padding:"8px 14px",fontSize:13,fontWeight:700}}>
                              ✕ Hủy duyệt đơn
                            </button>
                            <button onClick={()=>xacNhan(ph.id,ph.projId)} style={{...btn,background:"#16a34a",color:"#fff",padding:"8px 18px",fontSize:13,fontWeight:700}}>
                              ✓ Xác nhận duyệt
                            </button>
                          </div>
                        </div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                            <thead>
                              <tr style={{background:"#1d4ed8"}}>
                                {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSoSoan"),t("thSLThucNhan"),t("thTrangThai"),t("thDuyet")].map(h=>(
                                  <th key={h} style={{padding:"7px 10px",textAlign:[t("thSoSoan"),t("thSLThucNhan")].includes(h)?"center":"left",fontWeight:800,color:"#fff",fontSize:11}}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(ph.ct||[]).map((c,i)=>{
                                const slThucVal=slThucEdit[c.id]!==undefined?slThucEdit[c.id]:(c.sl_thuc_nhan??c.sl);
                                const slThieu=Math.max(0,(c.sl||0)-slThucVal);
                                return(
                                <tr key={c.id} style={{borderBottom:"1px solid #f1f5f9",background:c.ok?(c.sl_thieu>0?"#fffbeb":"#f0fdf4"):(c.sl>0?(i%2===0?"#fff":"#f9fafb"):(i%2===0?"#fff":"#fafafa"))}}>
                                  <td style={{padding:"7px 10px",color:"#9ca3af",fontSize:11}}>{c.stt}</td>
                                  <td style={{padding:"7px 10px",fontWeight:700,color:"#b45309",fontFamily:"monospace",fontSize:11}}>{c.ma}</td>
                                  <td style={{padding:"7px 10px",fontSize:12,maxWidth:180,textAlign:"left"}}>{c.ten}</td>
                                  <td style={{padding:"7px 10px",color:"#6b7280",textAlign:"center"}}>{c.dv}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:c.sl>0?"#065f46":"#9ca3af"}}>{c.sl>0?fmt(c.sl):"—"}</td>
                                  <td style={{padding:"7px 10px",textAlign:"center"}}>
                                    {c.ok
                                      ?<span style={{fontWeight:700,color:c.sl_thieu>0?"#f59e0b":"#1d4ed8"}}>{fmt(c.sl_thuc_nhan??c.sl)}</span>
                                      :<input type="number" min={0} max={c.sl}
                                          value={slThucVal}
                                          onChange={e=>setSlThucEdit(s=>({...s,[c.id]:parseInt(e.target.value)||0}))}
                                          style={{width:60,padding:"3px 6px",border:`1.5px solid ${slThieu>0?"#f59e0b":"#c7d2fe"}`,borderRadius:5,fontSize:12,textAlign:"center",background:slThieu>0?"#fffbeb":"#f0f4ff"}}/>
                                    }
                                  </td>
                                  <td style={{padding:"7px 10px"}}>
                                    {c.ok
                                      ?(c.sl_thieu>0
                                        ?<span style={{background:"#fef3c7",color:"#92400e",borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:700}}>⚠️ Thiếu {fmt(c.sl_thieu)} → Soạn lại</span>
                                        :<span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:700}}>✅ Đã nhận đủ</span>)
                                      :(slThieu>0
                                        ?<span style={{background:"#fef3c7",color:"#92400e",borderRadius:10,padding:"2px 8px",fontSize:10}}>⚠️ Sẽ thiếu {fmt(slThieu)}</span>
                                        :<span style={{background:"#f1f5f9",color:"#6b7280",borderRadius:10,padding:"2px 8px",fontSize:10}}>Chờ duyệt</span>)
                                    }
                                  </td>
                                  <td style={{padding:"7px 10px",textAlign:"center"}}>
                                    {c.ok
                                      ?(c.sl_thieu>0
                                        ?<span style={{fontSize:13}}>⚠️</span>
                                        :<span style={{fontSize:13}}>✅</span>)
                                      :<button onClick={()=>{
                                          duyetCt(ph.id,c.id,slThucVal,ph.projId);
                                          setSlThucEdit(s=>{const n={...s};delete n[c.id];return n;});
                                        }} style={{...btn,background:"#2563eb",color:"#fff",padding:"3px 10px",fontSize:11}}>Duyệt</button>
                                    }
                                  </td>
                                </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                  {showChoXN < choXN.length && (
                    <button onClick={()=>setShowChoXN(showChoXN+8)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"8px 16px",fontSize:12,fontWeight:600,width:"100%",marginTop:10}}>
                      📋 Xem thêm ({choXN.length - showChoXN} phiếu còn lại)
                    </button>
                  )}
                </div>
              )}

              {daXNAll.length>0&&(
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#16a34a",marginBottom:8}}>✅ Đã duyệt ({daXNAll.length}){!xhDaXNShowAll&&daXNAll.length>8&&<span style={{fontWeight:400,color:"#9ca3af"}}> · đang hiện 8 gần nhất</span>}</div>
                  {daXN.map(ph=>{
                    const projName=projs.find(p=>p.id===ph.projId)?.ten||ph.projId;
                    return(
                      <div key={ph.id} style={{background:"#fff",borderRadius:10,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:"1px solid #bbf7d0",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:13}}>📄 {ph.sp} <span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"1px 8px",fontSize:10,fontWeight:700,marginLeft:6}}>✅ Đã duyệt</span></div>
                          <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>🏭 {projName} · 📅 {ph.ngay} · 📦 {ph.tong} mã</div>
                        </div>
                        <button onClick={()=>setViewPh(ph)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"5px 12px",fontSize:11}}>Xem chi tiết</button>
                      </div>
                    );
                  })}
                  {daXNAll.length>8&&(
                    <button onClick={()=>setXhDaXNShowAll(v=>!v)} style={{...btn,background:"#f3f4f6",color:"#374151",width:"100%",justifyContent:"center",marginTop:4}}>
                      {xhDaXNShowAll?"▲ Thu gọn":`▼ Xem tất cả (${daXNAll.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── PHIẾU GN ── */}
        {tab==="pgn"&&(()=>{
          // ✅ Đồng bộ với Soạn Hàng: "Kho vật tư" chỉ quản mã Nguồn gốc = CKD,
          // "NHÀ MÁY THCK" chỉ quản mã Nguồn gốc = THCK. Xưởng Hàn xem đầy đủ (để xác nhận).
          // Trước đây tab này dùng bom/th KHÔNG lọc theo vai trò — số "Còn thiếu" tổng/scoped
          // bị lệch với danh sách phiếu GN (đã lọc theo nguoi_soan ở dưới), gây hiểu nhầm.
          const bom = isKHO ? bomFull.filter(v=>(v.ng||"").trim().toUpperCase()==="CKD")
                    : isTHCK ? bomFull.filter(v=>(v.ng||"").trim().toUpperCase()==="THCK")
                    : bomFull;
          const th = isKHO ? thFull.filter(v=>(v.ng||"").trim().toUpperCase()==="CKD")
                   : isTHCK ? thFull.filter(v=>(v.ng||"").trim().toUpperCase()==="THCK")
                   : thFull;
          const maDone=th.filter(v=>v.done).length;
          const totCN=th.reduce((s,v)=>s+v.cn,0);
          const totDN=th.reduce((s,v)=>s+v.dn,0);
          const totCT=th.reduce((s,v)=>s+v.ct,0);
          const pctT=bom.length>0?Math.round(maDone/bom.length*100):0;
          const duAll=maDone===bom.length&&bom.length>0;
          const DMP=["Tất cả",...[...new Set(bom.map(v=>v.vt).filter(Boolean))].sort(sapXepDM)];
          const f2=th.filter(v=>{
            if(pgnDm!=="Tất cả"&&v.vt!==pgnDm)return false;
            if(pgnSO==="thieu"&&v.done)return false;
            if(pgnSO==="du"&&!v.done)return false;
            if(pgnSr){const q=pgnSr.toLowerCase();if(!v.ma.toLowerCase().includes(q)&&!v.ten.toLowerCase().includes(q))return false;}
            return true;
          });
          return(
            <div>
              <div style={{background:duAll?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#1e3a5f,#1d4ed8)",borderRadius:12,padding:"18px 22px",marginBottom:14,color:"#fff",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:12}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:700}}>{duAll?t("progTitleDone"):t("progTitle")}</div>
                    <div style={{fontSize:12,opacity:.8,marginTop:3}}>{proj.icon} {proj.ten} · 🚌 {soXe} xe · {phList.length} phiếu</div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {[[`${t("progDaNhanNhan")} ✅`,maDone,"#6ee7b7"],[`${t("progThieuNhan")} ⚠️`,bom.length-maDone,"#fca5a5"],[t("progTongNhan"),bom.length,"#fff"]].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 14px"}}>
                        <div style={{fontWeight:700,fontSize:18,color:c}}>{v}</div>
                        <div style={{fontSize:10,opacity:.8}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Prog p={pctT} done={duAll} h={12}/>
                  <span style={{fontWeight:700,fontSize:14,minWidth:50,textAlign:"right"}}>{pctT}%</span>
                </div>
                <div style={{display:"flex",gap:20,marginTop:8,fontSize:12,opacity:.85,flexWrap:"wrap"}}>
                  <span>{t("progCan")}: <b>{fmt(totCN)}</b></span>
                  <span>{t("progDaNhan")}: <b style={{color:"#6ee7b7"}}>{fmt(totDN)}</b></span>
                  <span>{t("progConThieu")}: <b style={{color:"#fca5a5"}}>{fmt(totCT)}</b></span>
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:10,padding:"14px 16px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
                  <div style={{flex:1}}>
                    <input placeholder={t("searchPlaceholderMaPGN")} value={searchMa} onChange={e=>setSearchMa(e.target.value.toUpperCase())} style={{...inp,width:"100%"}}/>
                  </div>
                  {searchMa&&<button onClick={()=>setSearchMa("")} style={{...btn,background:"#fee2e2",color:"#dc2626",padding:"6px 12px",fontSize:12}}>{t("btnXoaTim")}</button>}
                </div>
                {searchMa&&(()=>{
                  const q=searchMa.toUpperCase();
                  const dsTimThay=th.filter(v=>v.ma.toUpperCase().includes(q)||v.ten.toUpperCase().includes(q)).slice(0,15);
                  if(dsTimThay.length===0)return <div style={{color:"#9ca3af",fontSize:12}}>{t("khongTimThayVT")} "{searchMa}"</div>;
                  return(
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
                      {dsTimThay.map(found=>{
                        const phChiTiet=(found.phs||[]).map((item,i)=>({...item,idx:i}));
                        return(
                        <div key={found.ma} style={{background:"#f9fafb",borderRadius:8,padding:"12px"}}>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:10,fontSize:12,fontWeight:700,color:"#374151",paddingBottom:8,borderBottom:"1px solid #e5e7eb"}}>
                            <div>{t("thMaTk")}</div>
                            <div style={{textAlign:"center"}}>{t("progCan")}</div>
                            <div style={{textAlign:"center"}}>{t("progDaNhan")}</div>
                            <div style={{textAlign:"center"}}>{t("thTienDo")}</div>
                            <div style={{textAlign:"center"}}>{t("thTrangThai")}</div>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,fontSize:13,fontWeight:700,marginBottom:12,padding:"10px",background:"#fff",borderRadius:6}}>
                            <div>{found.ma}<div style={{fontSize:10,fontWeight:400,color:"#9ca3af"}}>{found.ten}</div></div>
                            <div style={{textAlign:"center"}}>{fmt(found.cn)}</div>
                            <div style={{textAlign:"center",color:"#16a34a"}}>{fmt(found.dn)}</div>
                            <div style={{textAlign:"center",color:"#1d4ed8"}}>{found.p}%</div>
                            <div style={{textAlign:"center",color:found.done?"#16a34a":"#dc2626"}}>{found.done?t("trangThaiDu"):t("trangThaiThieu")}</div>
                          </div>
                          {phChiTiet.length>0?(
                            <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #e5e7eb"}}>
                              <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8}}>📋 Vật tư này nằm trong {phChiTiet.length} phiếu GN — bấm để xem:</div>
                              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                                {phChiTiet.map(item=>{
                                  const phDayDu=phList.find(p=>p.id===item.id);
                                  return(
                                  <button key={item.idx} onClick={()=>phDayDu&&setViewPh(phDayDu)} disabled={!phDayDu}
                                    style={{background:"#fff",padding:"8px 10px",borderRadius:6,fontSize:12,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid #7c3aed`,border:"1px solid #e5e7eb",cursor:phDayDu?"pointer":"default",fontFamily:"inherit",width:"100%",textAlign:"left"}}>
                                    <span><b>📄 {item.sp}</b> <span style={{color:"#9ca3af"}}>({item.ngay})</span></span>
                                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                                      <span style={{color:"#16a34a",fontWeight:700}}>📦 {item.sl}</span>
                                      {phDayDu&&<span style={{color:"#1d4ed8",fontWeight:700}}>Xem ›</span>}
                                    </span>
                                  </button>
                                  );
                                })}
                              </div>
                            </div>
                          ):(
                            <div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>Vật tư này chưa nằm trong phiếu GN nào.</div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              {(()=>{
                // KHO / THCK chỉ thấy phiếu GN do chính mình tạo. XƯỞNG HÀN vẫn thấy tất cả để xác nhận.
                const phListHienThi = (isKHO||isTHCK) ? phList.filter(ph=>ph.nguoi_soan===user.ten) : phList;
                return(
              <>
              <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>{t("titlePgnSent")} ({phListHienThi.length})</div>
              {phListHienThi.length===0?(
                <div style={{background:"#fff",borderRadius:10,padding:40,textAlign:"center",color:"#9ca3af",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                  <div style={{fontSize:36,marginBottom:8}}>📋</div><div>Chưa có phiếu nào</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                  {[...phListHienThi].sort((a,b)=>(b.ts||b.ngay||"").localeCompare(a.ts||a.ngay||"")).slice(0,showPhList).map(ph=>{
                    const projBg = getProjectBgColor(ph.pid, projs);
                    const projMau = projs.find(p=>p.id===ph.pid)?.mau || "#6b7280";
                    return(
                    <div key={ph.id} style={{background:ph.tt==="Đã xác nhận"?"#fff":projBg,borderRadius:10,padding:"12px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:`1px solid ${ph.tt==="Đã xác nhận"?"#bbf7d0":projMau}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <span style={{fontWeight:700,fontSize:14}}>📄 {ph.sp}</span>
                          <Tag bg={ph.tt==="Đã xác nhận"?"#d1fae5":"#fef3c7"} c={ph.tt==="Đã xác nhận"?"#065f46":"#92400e"} ch={ph.tt}/>
                          <span style={{fontSize:11,color:"#9ca3af"}}>📅 {ph.ngay}</span>
                          <span style={{fontSize:11,color:"#6b7280"}}>📦 {ph.tong} mã</span>
                          {ph.nguoi_soan&&<span style={{fontSize:11,color:"#7c3aed",fontWeight:600}}>👤 {ph.nguoi_soan}</span>}
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>setViewPh(ph)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"4px 11px",fontSize:11}}>Xem</button>
                          {isXH&&ph.tt!=="Đã xác nhận"&&<button onClick={()=>xacNhan(ph.id,pid)} style={{...btn,background:"#d1fae5",color:"#065f46",padding:"4px 11px",fontSize:11}}>✓ Xác nhận</button>}
                        </div>
                      </div>
                      {ph.gc&&<div style={{fontSize:11,color:"#6b7280",marginTop:4}}>💬 {ph.gc}</div>}
                    </div>
                    );
                  })}
                  {showPhList < phListHienThi.length && (
                    <button onClick={()=>setShowPhList(phListHienThi.length)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"8px 16px",fontSize:12,fontWeight:600,width:"100%",marginTop:10}}>
                      📋 Xem thêm ({phListHienThi.length - showPhList} phiếu còn lại)
                    </button>
                  )}
                  {showPhList >= phListHienThi.length && phListHienThi.length>5 && (
                    <button onClick={()=>setShowPhList(5)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:12,fontWeight:600,width:"100%",marginTop:10}}>
                      🔼 Ẩn phiếu
                    </button>
                  )}
                </div>
              )}
              </>
                );
              })()}
              <div style={{background:"#fff",borderRadius:10,padding:"12px 16px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <input placeholder="🔍 Mã, tên..." value={pgnSr} onChange={e=>setPgnSr(e.target.value)} style={{...inp,width:180,flex:"0 0 auto"}}/>
                <select value={pgnDm} onChange={e=>setPgnDm(e.target.value)} style={{...inp,width:180,flex:"0 0 auto"}}>
                  {DMP.map(d=><option key={d}>{d}</option>)}
                </select>
                <div style={{display:"flex",gap:4}}>
                  {[["all","Tất cả","#6b7280"],["thieu",`⚠️ Còn thiếu (${bom.length-maDone})`,"#dc2626"],["du",`✅ Đã nhận (${maDone})`,"#16a34a"]].map(([v,l,c])=>(
                    <button key={v} onClick={()=>setPgnSO(v)} style={{...btn,background:pgnSO===v?c:"#f3f4f6",color:pgnSO===v?"#fff":"#374151",padding:"5px 12px",fontSize:11}}>{l}</button>
                  ))}
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <ExportBar
                    shareTitle={`📄 Phiếu GN — ${proj.ten}`}
                    shareText={`Tiến độ nhận vật tư ${proj.ten}: ${maDone}/${bom.length} mã đủ (${pctT}%)`}
                    onExcel={()=>xuatExcel(
                      f2.map(v=>({
                        "STT":v.stt,"Mã số":v.ma,"Tên vật tư":v.ten,"ĐVT":v.dv,
                        "ĐM/1XE":v.dm,[`Cần(×${soXe})`]:v.cn,
                        "Đã nhận":v.dn,"Còn thiếu":v.ct,"Vượt KH":v.vuot||0,
                        "Tiến độ":v.p,"Nguồn gốc":v.ng,
                        "Trạng thái":v.done?"Đã nhận":v.chuaSoan?"Chưa soạn":"Thiếu"
                      })),
                      `PhieuGN_${proj.ten.replace(/\s/g,"_")}`,
                      `Phiếu GN tích lũy — ${proj.ten}`
                    )}
                    onPDF={()=>{
                      const rows=f2.map(v=>`<tr>
                        <td>${v.stt}</td><td><b>${v.ma}</b></td><td class="l">${v.ten}</td>
                        <td style="text-align:center">${v.dv}</td>
                        <td style="text-align:center">${fmt(v.cn)}</td>
                        <td style="text-align:center;color:#065f46;font-weight:700">${fmt(v.dn)}</td>
                        <td style="text-align:center;color:${v.done?"#16a34a":"#dc2626"};font-weight:700">${v.done?"✅":fmt(v.ct)}</td>
                        <td style="text-align:center">${v.p}%</td>
                        <td>${v.ng||""}</td>
                        <td><span class="badge ${v.done?"ok":v.chuaSoan?"":"warn"}">${v.done?"✅ Đã nhận":v.chuaSoan?"📭 Chưa soạn":"⚠️ Thiếu"}</span></td>
                      </tr>`).join("");
                      xuatPDF(`<h2>${t("rpPgn")}</h2>
                        <p class="sub">${proj.icon} ${proj.ten} · ${soXe} xe · ${phList.length} phiếu · ${f2.length} mã</p>
                        <table><thead><tr><th>${t("thSTT")}</th><th>${t("thMa")}</th><th>${t("thTen")}</th><th>${t("thDVT")}</th><th>${t("thCan")}×${soXe}</th><th>${t("thDaNhan")}</th><th>${t("thConThieu")}</th><th>%</th><th>${t("thNguonGoc")}</th><th>${t("thTrangThai")}</th></tr></thead><tbody>${rows}</tbody>
                        <tfoot><tr style="background:#f8fafc;font-weight:700"><td colspan="4">Tổng (${f2.length} mã)</td><td style="text-align:center">${fmt(f2.reduce((s,v)=>s+v.cn,0))}</td><td style="text-align:center;color:#065f46">${fmt(f2.reduce((s,v)=>s+v.dn,0))}</td><td style="text-align:center;color:#dc2626">${fmt(f2.reduce((s,v)=>s+v.ct,0))}</td><td colspan="3"></td></tr></tfoot>
                        </table>`,`PhieuGN_${proj.ten}`);
                    }}
                  />
                  {(isTHCK||isKHO)&&<button onClick={openPh} style={{...btn,background:mauP,color:"#fff",padding:"7px 14px",fontSize:12}}>+ Tạo phiếu</button>}
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:16}}>
                <div style={{padding:"10px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:700,fontSize:13,display:"flex",justifyContent:"space-between"}}>
                  <span>📊 Bảng Tích Lũy ({f2.length} mã)</span>
                  <span style={{fontSize:11,color:"#6b7280",fontWeight:400}}>Cộng dồn {phList.length} phiếu</span>
                </div>
                {/* ── Danh sách dạng BẢNG (cột) — tiêu đề nền xanh/chữ trắng, dữ liệu chữ đen,
                    cuộn ngang khi màn hình không đủ rộng (linh động). ── */}
                {f2.length===0?(
                  <div style={{textAlign:"center",padding:40,color:"#9ca3af",fontSize:13}}>Không có dữ liệu</div>
                ):(()=>{
                  const tlCols="44px 100px minmax(180px,1fr) 90px 60px 80px 80px 70px 140px 70px";
                  const tlHeaders=[t("thSTT"),t("thMa"),t("thTen"),t("thNguonGoc"),t("thDVT"),t("thCan"),t("thDaNhan"),"Vượt","Trạng thái","Tiến độ"];
                  return(
                  <div style={{overflowX:"auto"}}>
                  <div style={{minWidth:914}}>
                    <div style={{display:"grid",gridTemplateColumns:tlCols,background:"#1d4ed8",color:"#fff",fontSize:10.5,fontWeight:800,textTransform:"uppercase"}}>
                      {tlHeaders.map((h,hi)=>(
                        <div key={hi} style={{padding:"8px 8px",textAlign:hi===2?"left":"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h}</div>
                      ))}
                    </div>
                    {f2.map((v,i)=>{
                      const isSel=selMa===v.ma;
                      return(
                        <div key={v.ma} onClick={()=>setSelMa(s=>s===v.ma?null:v.ma)}
                          style={{display:"grid",gridTemplateColumns:tlCols,background:isSel?"#fff7ed":v.done?"#f0fdf4":(i%2?"#f9fafb":"#fff"),borderTop:"1px solid #f1f5f9",alignItems:"center",fontSize:12,color:"#111827",cursor:"pointer"}}>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.stt}</div>
                          <div style={{padding:"8px 8px",textAlign:"center",fontWeight:700,wordBreak:"break-word"}}>{v.ma}</div>
                          <div style={{padding:"8px 8px",textAlign:"left",wordBreak:"break-word"}} title={v.ten}>{v.ten}</div>
                          <div style={{padding:"8px 8px",textAlign:"center",wordBreak:"break-word"}}>{v.ng||"—"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.dv}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{fmt(v.cn)}</div>
                          <div style={{padding:"8px 8px",textAlign:"center",fontWeight:700}}>{fmt(v.dn)}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{v.vuot>0?`+${fmt(v.vuot)}`:"—"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center",fontWeight:700,color:v.done?"#16a34a":v.choDuyet?"#0369a1":"#dc2626"}}>
                            {v.done?"✅ Đủ":v.choDuyet?"🕓 Chờ duyệt":`${t("thConThieu")}: ${fmt(v.ct)}`}
                          </div>
                          <div style={{padding:"6px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                            <Prog p={v.p} done={v.done}/>
                            <span style={{fontSize:10,fontWeight:700,color:v.done?"#16a34a":"#6b7280"}}>{v.p}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                  );
                })()}
                <div style={{padding:10}}>
                  {f2.length>0&&(
                    <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:"1px solid #e5e7eb",
                      display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                      <span style={{fontWeight:700,fontSize:12,color:"#374151"}}>Tổng ({f2.length} mã)</span>
                      <span style={{display:"flex",gap:16,fontSize:11,flexWrap:"wrap"}}>
                        <span>{t("progCan")}: <b>{fmt(f2.reduce((s,v)=>s+v.cn,0))}</b></span>
                        <span style={{color:"#065f46"}}>{t("thDaNhan")}: <b>{fmt(f2.reduce((s,v)=>s+v.dn,0))}</b></span>
                        <span style={{color:"#dc2626"}}>{t("thConThieu")}: <b>{fmt(f2.reduce((s,v)=>s+v.ct,0))}</b></span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── BÁO CÁO ── */}
        {tab==="bc"&&(()=>{
          const togDm=dm=>setBcDmO(s=>({...s,[dm]:!s[dm]}));
          // ✅ bcDoneList giờ được tính ở phạm vi component (xem gần projFullyReceived) và bộ
          // nút chuyển trang con "Đang thực hiện / Đã hoàn thành" đã dời lên phía TRÊN khối
          // "Dòng xe / Dự án" (ngay dưới thanh TABS) theo yêu cầu — không còn render lại ở đây.
          // ⚠️ FIX "bấm vào dự án Đã hoàn thành không hiện gì": trước đây bcSubTab==="done" CHỈ
          // render DANH SÁCH — không có nhánh nào hiển thị chi tiết báo cáo (banner+thống kê)
          // cho 1 dự án đã hoàn thành cụ thể. Nay tách riêng: "showingDoneList" quyết định hiện
          // danh sách hay chi tiết, dựa trên "bcDoneViewPid" (id dự án vừa được bấm chọn từ danh
          // sách) — so khớp với "pid" hiện tại để tự rơi về danh sách nếu dự án đổi bằng cách
          // khác. Nút "✅ Đã hoàn thành" bấm trực tiếp luôn quay về danh sách (xem chỗ khai báo
          // nút, đã reset bcDoneViewPid=null ở đó).
          const showingDoneList = bcSubTab==="done" && bcDoneViewPid!==pid;
          // ⚠️ CHỐT AN TOÀN: trường hợp bấm nút "🚧 Đang thực hiện" nhưng KHÔNG CÒN dự án nào
          // khác đang thực hiện (bcDangList rỗng) — dự án đang chọn (pid) vẫn là dự án ĐÃ hoàn
          // thành (đã bấm nút HOẶC đã nhận đủ 100% vật tư). Lúc này bcSubTab="dang" nhưng KHÔNG
          // được phép hiện chi tiết dự án đã xong ở đây (dù effect tự-đồng-bộ sẽ sớm ép lại
          // "done" ở lần re-render kế, để chắc chắn không "loé" nhầm nội dung 1 khắc, chặn luôn
          // tại đây bằng thông báo trống).
          const khongConDuAnDangLam = bcSubTab==="dang" && !!proj && (proj.trang_thai==="hoan_thanh"||duAll);
          return(
            <>
            {showingDoneList?(
              bcDoneList.length===0?(
                <div style={{textAlign:"center",padding:"40px 16px",color:"#9ca3af",background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
                  — Chưa có dự án nào hoàn thành cho dòng xe này —
                </div>
              ):(
                // ✅ Bảng danh sách dự án ĐÃ HOÀN THÀNH (theo yêu cầu) — thay cho danh sách dạng
                // thẻ cũ. Cột "NGÀY HOÀN THÀNH VẬT TƯ" lấy từ "ngay_du_vt" (ngày dự án đạt đủ
                // 100% vật tư lần đầu — xem effect tự-ghi-nhận gần "projFullyReceived"); nếu dự
                // án được đánh dấu hoàn thành thủ công mà chưa kịp có "ngay_du_vt" (hiếm, do vừa
                // mới bấm) thì dự phòng lấy "ngay_hoan_thanh". Bấm nút "👁️ Xem chi tiết" ở cột
                // cuối để mở đúng màn hình báo cáo chi tiết (banner+thống kê+biểu đồ) như cũ.
                <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",overflow:"hidden"}}>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:720}}>
                      <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                        {["STT","Tên dự án","Dòng xe","Loại xe","SL xe","Ngày khởi tạo","Ngày hoàn thành vật tư",""].map((h,hi)=>(
                          <th key={hi} style={{padding:"9px 10px",textAlign:hi===1?"left":"center",fontWeight:700,color:"#6b7280",fontSize:10.5,whiteSpace:"nowrap",
                            position:hi===0?"sticky":undefined,left:hi===0?0:undefined,zIndex:hi===0?2:undefined,background:"#f8fafc",
                            boxShadow:hi===0?"2px 0 4px -2px rgba(0,0,0,0.18)":undefined}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {bcDoneList.map((p,idx)=>{
                          const rowBg=p.id===pid?"#f0fdf4":(idx%2===0?"#fff":"#f9fafb");
                          return(
                          <tr key={p.id} style={{borderBottom:"1px solid #f1f5f9",background:rowBg}}>
                            <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700,color:"#6b7280",position:"sticky",left:0,zIndex:1,background:rowBg,boxShadow:"2px 0 4px -2px rgba(0,0,0,0.18)"}}>{idx+1}</td>
                            <td style={{padding:"8px 10px",fontWeight:800,color:"#1f2937",whiteSpace:"nowrap"}}>{p.icon?`${p.icon} `:""}{p.ten}</td>
                            <td style={{padding:"8px 10px",textAlign:"center",whiteSpace:"nowrap"}}>{KL_LINES.find(l=>l.id===activeLine)?.title||"Mini Bus"}</td>
                            <td style={{padding:"8px 10px",textAlign:"center",whiteSpace:"nowrap"}}>{p.mo_ta||p.ten}</td>
                            <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700}}>{p.so_xe||1}</td>
                            <td style={{padding:"8px 10px",textAlign:"center",whiteSpace:"nowrap"}}>{p.ngay_khoi_tao||"—"}</td>
                            <td style={{padding:"8px 10px",textAlign:"center",whiteSpace:"nowrap",fontWeight:700,color:"#0f766e"}}>{p.ngay_du_vt||p.ngay_hoan_thanh||"—"}</td>
                            <td style={{padding:"8px 10px",textAlign:"center"}}>
                              {/* ✅ Bấm "Xem chi tiết" → chọn dự án đó (sw) + đặt "bcDoneViewPid" để
                                  chuyển sang xem CHI TIẾT báo cáo (banner+thống kê+biểu đồ) của
                                  đúng dự án đó, KHÔNG đổi bcSubTab. */}
                              <button onClick={()=>{bcNav.markManual(p.id);sw(p.id);setBcDoneViewPid(p.id);}}
                                style={{border:"none",cursor:"pointer",fontFamily:"inherit",background:"#0f766e",color:"#fff",fontWeight:700,fontSize:11,
                                  borderRadius:8,padding:"6px 12px",whiteSpace:"nowrap"}}>👁️ Xem chi tiết</button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ):khongConDuAnDangLam?(
              <div style={{textAlign:"center",padding:"40px 16px",color:"#9ca3af",background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
                — Không còn dự án nào đang thực hiện. Mọi dự án của dòng xe này đã hoàn thành, xem ở mục "✅ Đã hoàn thành" —
              </div>
            ):(
            <div>
              {/* ✅ Chỉ hiện khi đang xem CHI TIẾT 1 dự án đã hoàn thành (từ danh sách bấm vào) —
                  cho phép quay lại danh sách mà không cần đổi tab hay nút toggle. */}
              {bcSubTab==="done"&&(
                <button onClick={()=>setBcDoneViewPid(null)}
                  style={{border:"none",cursor:"pointer",fontFamily:"inherit",background:"#dc2626",color:"#fff",fontWeight:800,fontSize:12.5,
                    borderRadius:10,padding:"9px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:6,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                  ← Quay lại danh sách Đã hoàn thành
                </button>
              )}
              {/* ── Toàn bộ thẻ Báo Cáo (banner + thống kê + donut + biểu đồ + bảng) — bọc trong bcCardRef để chụp thành ảnh khi bấm "Xuất báo cáo" ── */}
              <div ref={bcCardRef}>
              {/* ── Header banner (giống ảnh 2) ── */}
              <div style={{background:duAll?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#312e81,#4338ca)",borderRadius:16,padding:"18px 18px 20px",marginBottom:14,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{fontSize:16,fontWeight:800,lineHeight:1.25}}>{duAll?t("titleBcDone"):t("titleBc")}</div>
                </div>
                <div style={{fontSize:12,opacity:.85,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  <span>{proj.icon} {proj.ten}</span><span style={{opacity:.45}}>|</span><span>🚌 {soXe} xe</span><span style={{opacity:.45}}>·</span><span>{phList.length} phiếu</span>
                </div>
                {(proj.ngay_khoi_tao||proj.ngay_hoan_thanh)&&(
                  <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.14)",border:"1px solid rgba(255,255,255,0.28)",borderRadius:9,padding:"6px 12px",fontSize:11.5,fontWeight:700}}>
                    📅 {proj.ngay_khoi_tao||"—"} → {proj.ngay_hoan_thanh||"Đang thực hiện"}
                  </div>
                )}
              </div>

              {/* ── 4 thẻ thống kê — 1 hàng, bo viền, đổ màu nổi bật, vừa màn hình mobile ── */}
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {[
                  {l:"Tổng mã vật tư",v:bom.length,p:100,icon:"📦",bg:"#2563eb",bgLight:"#eff6ff",border:"#bfdbfe"},
                  {l:"Đã nhận",v:maDone,p:bom.length?Math.round(maDone/bom.length*10000)/100:0,icon:"✅",bg:"#16a34a",bgLight:"#f0fdf4",border:"#bbf7d0"},
                  {l:"Giao thiếu",v:maGiaoThieu,p:bom.length?Math.round(maGiaoThieu/bom.length*10000)/100:0,icon:"🚚",bg:"#ea580c",bgLight:"#fff7ed",border:"#fed7aa"},
                  {l:"Chưa nhận",v:maChuaSoan,p:bom.length?Math.round(maChuaSoan/bom.length*10000)/100:0,icon:"⏰",bg:"#dc2626",bgLight:"#fef2f2",border:"#fecaca"},
                ].map(s=>(
                  <div key={s.l} style={{flex:"1 1 0",minWidth:0,background:s.bgLight,border:`1.5px solid ${s.border}`,borderRadius:12,padding:"9px 4px",textAlign:"center"}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:s.bg,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,margin:"0 auto 5px",boxShadow:`0 2px 6px ${s.bg}55`}}>{s.icon}</div>
                    <div style={{fontSize:8.5,color:"#6b7280",fontWeight:700,marginBottom:2,lineHeight:1.15,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.l}</div>
                    <div style={{fontSize:16,fontWeight:900,color:s.bg}}>{s.v}</div>
                    <div style={{fontSize:8.5,color:"#9ca3af",marginTop:0}}>{s.p}%</div>
                  </div>
                ))}
              </div>

              {/* ── Hàng: Tiến độ nhận vật tư (donut) + Biểu đồ tiến độ theo phiếu — chia đôi đều nhau, tối ưu cho màn hình mobile hẹp ── */}
              <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"stretch"}}>
                {/* ── Donut Tiến độ nhận vật tư (giống ảnh 2) ── */}
                <div style={{flex:"1 1 0",minWidth:0,background:"#fff",borderRadius:12,padding:"10px 8px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:9.5,fontWeight:900,color:"#374151",letterSpacing:.2,marginBottom:10,textTransform:"uppercase",lineHeight:1.25}}>Tiến Độ Nhận Vật Tư</div>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                    <div style={{position:"relative",width:84,height:84}}>
                      <svg width="84" height="84" viewBox="0 0 160 160" style={{transform:"rotate(-90deg)"}}>
                        <circle cx="80" cy="80" r="66" stroke="#eef0fb" strokeWidth="18" fill="none"/>
                        <circle cx="80" cy="80" r="66" stroke="#4f46e5" strokeWidth="18" fill="none"
                          strokeDasharray={`${2*Math.PI*66}`}
                          strokeDashoffset={`${2*Math.PI*66*(1-pctT/100)}`}
                          strokeLinecap="round"/>
                      </svg>
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                        <div style={{fontSize:14,fontWeight:900,color:"#4338ca"}}>{pctT}%</div>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {[["Đã nhận","#22c55e",maDone],["Giao thiếu","#f59e0b",maGiaoThieu],["Chưa nhận","#ef4444",maChuaSoan]].map(([l,c,v])=>(
                      <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:9.5,gap:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,minWidth:0}}><span style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0}}/><span style={{color:"#374151",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l}</span></div>
                        <span style={{fontWeight:800,color:"#1f2937",flexShrink:0}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"6px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                    <span style={{fontSize:8.5,fontWeight:900,color:"#fff",background:"#dc2626",borderRadius:999,padding:"3px 10px",textAlign:"center",lineHeight:1.2,display:"inline-block"}}>ĐỒNG BỘ</span>
                    {(()=>{
                      // ✅ Số xe ĐỒNG BỘ = số xe đã được trang bị ĐỦ TRỌN BỘ vật tư.
                      // Với mỗi mã: số xe mà mã đó đủ để trang bị = floor(đã nhận / định mức).
                      // Số xe đồng bộ = giá trị NHỎ NHẤT (bottleneck) trong tất cả các mã —
                      // vì 1 xe chỉ đồng bộ khi TẤT CẢ các mã đều đủ cho nó.
                      let xeDongBo=soXe;
                      if(!soXe||bom.length===0){xeDongBo=0;}
                      else{
                        for(const v of th){
                          const dmV=numOr0(v.dm);
                          if(dmV<=0)continue; // bỏ qua mã không có định mức hợp lệ
                          const xeDu=Math.floor((numOr0(v.dn)+EPS)/dmV);
                          if(xeDu<xeDongBo)xeDongBo=xeDu;
                        }
                        xeDongBo=Math.max(0,Math.min(soXe,xeDongBo));
                      }
                      return <span style={{fontSize:13,fontWeight:900,color:"#15803d"}}>{xeDongBo} XE</span>;
                    })()}
                  </div>
                </div>

                {/* ── Biểu đồ tiến độ theo phiếu (giống ảnh 2, dùng dữ liệu phiếu thực tế) ── */}
                {phList.filter(p=>p.ngay).length>1&&(()=>{
                  const sorted=[...phList].filter(p=>p.ngay).sort((a,b)=>new Date(a.ngay)-new Date(b.ngay));
                  const n=sorted.length;
                  const w=200,h=170,padL=22,padB=16,padT=10,padR=6;
                  const xScale=i=>padL+(n<=1?0:(i/(n-1))*(w-padL-padR));
                  const yScale=v=>padT+(1-v/100)*(h-padT-padB);
                  // ✅ FIX: trước đây trục % chỉ đếm THỨ TỰ phiếu (phiếu cuối luôn = 100%,
                  // không phản ánh vật tư thực nhận — gây hiểu lầm so với ô "Tiến Độ Nhận Vật
                  // Tư"). Giờ tính % TÍCH LŨY THỰC TẾ: tại mỗi phiếu, cộng dồn SL đã được xác
                  // nhận (c.ok) cho từng mã, rồi đếm bao nhiêu mã đã ĐỦ (dn≥cn) tính đến thời
                  // điểm đó / tổng số mã (bom.length) — cùng công thức với pctT ở trên, chỉ
                  // khác là tính theo từng mốc thời gian thay vì chỉ ở hiện tại.
                  const cnMap={};bom.forEach(v=>{cnMap[v.ma]=numOr0(v.dm)*numOr0(soXe);});
                  const dnCum={};
                  const pts=sorted.map((p,i)=>{
                    for(const c of(p.ct||[])){
                      if(c.ok)dnCum[c.ma]=(dnCum[c.ma]||0)+numOr0(c.sl_thuc_nhan??c.sl);
                    }
                    const doneCount=bom.filter(v=>(dnCum[v.ma]||0)+EPS>=cnMap[v.ma]).length;
                    const pct=bom.length>0?Math.round(doneCount/bom.length*100):0;
                    return{x:i,y:pct};
                  });
                  const path=pts.map((p,i)=>`${i===0?"M":"L"} ${xScale(p.x).toFixed(1)} ${yScale(p.y).toFixed(1)}`).join(" ");
                  const last=pts[pts.length-1];
                  return(
                    <div style={{flex:"1 1 0",minWidth:0,background:"#fff",borderRadius:12,padding:"10px 8px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                      <div style={{fontSize:9.5,fontWeight:900,color:"#374151",letterSpacing:.2,marginBottom:6,textTransform:"uppercase",lineHeight:1.25}}>Biểu Đồ Tiến Độ</div>
                      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}>
                        {[0,25,50,75,100].map(g=>(
                          <g key={g}>
                            <line x1={padL} x2={w-padR} y1={yScale(g)} y2={yScale(g)} stroke="#f1f5f9" strokeWidth="1"/>
                            <text x={0} y={yScale(g)+3} fontSize="7.5" fill="#9ca3af">{g}%</text>
                          </g>
                        ))}
                        <path d={path} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        {last&&<circle cx={xScale(last.x)} cy={yScale(last.y)} r="3.5" fill="#4f46e5"/>}
                      </svg>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#9ca3af",marginTop:2}}>
                        <span>{sorted[0]?.ngay}</span><span>{sorted[n-1]?.ngay}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ── Chi tiết theo trạng thái (giống ảnh 2) ── */}
              <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:11.5,fontWeight:900,color:"#374151",letterSpacing:.4,marginBottom:8,textTransform:"uppercase"}}>Chi Tiết Theo Trạng Thái</div>
                {[
                  {l:"Đã nhận",icon:"✅",c:"#16a34a",v:maDone,mota:"Vật tư đã được nhận đủ"},
                  {l:"Giao thiếu",icon:"🚚",c:"#ea580c",v:maGiaoThieu,mota:"Vật tư đang giao thiếu đến trạm"},
                  {l:"Chưa nhận",icon:"⏰",c:"#dc2626",v:maChuaSoan,mota:"Chưa nhận vật tư"},
                ].map(r=>{
                  const pct=bom.length?Math.round(r.v/bom.length*10000)/100:0;
                  return(
                    <div key={r.l} style={{padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,flexWrap:"wrap",gap:4}}>
                        <span style={{fontSize:12.5,fontWeight:700,color:"#1f2937",display:"flex",alignItems:"center",gap:6}}>{r.icon} {r.l}</span>
                        <span style={{fontSize:12.5,fontWeight:800,color:r.c}}>{r.v} mã · {pct}%</span>
                      </div>
                      <div style={{fontSize:10.5,color:"#9ca3af",marginBottom:5}}>{r.mota}</div>
                      <div style={{height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:r.c,borderRadius:4}}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontSize:12.5,fontWeight:900,color:"#4338ca"}}>
                  <span>TỔNG CỘNG</span><span>{bom.length} mã · 100%</span>
                </div>
              </div>
              </div>
              {/* Nút xuất ảnh — đặt NGOÀI vùng bcCardRef để không bị lọt vào chính tấm ảnh xuất ra */}
              <button onClick={()=>chiaSePhieuAnh(bcCardRef.current,{sp:proj.ten})}
                style={{width:"100%",background:"linear-gradient(135deg,#312e81,#4338ca)",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:13,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",fontFamily:"inherit",marginBottom:14,boxShadow:"0 4px 14px rgba(49,46,129,0.25)"}}>
                ⬆️ Xuất báo cáo (ảnh)
              </button>
              <div style={{background:"#fff",borderRadius:10,padding:"14px 18px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Tiến độ theo Vị trí</div>
                <button onClick={()=>setBcViTriChiTiet(x=>!x)}
                  style={{...btn,background:"#dc2626",color:"#fff",padding:"7px 16px",fontSize:12,fontWeight:700,marginBottom:bcViTriChiTiet?14:0}}>
                  {bcViTriChiTiet?"▲ Ẩn chi tiết":"▼ Xem chi tiết"}
                </button>
                {bcViTriChiTiet&&(
                <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                  {[["THCK","🏭","#b45309"],["CKD","📦","#0369a1"]].map(([nguon,icon,mau])=>(
                    <div key={nguon} style={{flex:"1 1 300px",minWidth:260}}>
                      <div style={{fontWeight:700,fontSize:12,marginBottom:10,color:mau}}>{icon} {nguon}</div>
                      {(()=>{
                        return Object.entries(nhomDM).sort(([a],[b])=>sapXepDM(a,b)).map(([dm,items])=>{
                        const itemsNg=items.filter(v=>(v.ng||"").trim().toUpperCase()===nguon);
                        const dC=itemsNg.reduce((s,v)=>s+v.cn,0),dD=itemsNg.reduce((s,v)=>s+v.dn,0);
                        const dDn=itemsNg.length>0&&itemsNg.every(v=>v.done);
                        const soMaDaNhan=itemsNg.filter(v=>v.done).length;
                        // Trạm chỉ có 1 mã: % = SL thực nhận / Tổng SL cần nhận (thay vì nhị phân đã/chưa đủ)
                        const dP=itemsNg.length===1
                          ? (dC>0?Math.min(100,Math.round(dD/dC*100)):0)
                          : (itemsNg.length>0?Math.round(soMaDaNhan/itemsNg.length*100):0);
                        return(
                          <div key={dm} style={{marginBottom:8}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                              <span style={{fontSize:11,fontWeight:700,minWidth:78}}>{dm}</span>
                              {itemsNg.length>0?(<>
                                <Prog p={dP} done={dDn}/>
                                <span style={{fontSize:11,fontWeight:700,minWidth:36,textAlign:"right",color:dDn?"#16a34a":"#374151"}}>{dP}%</span>
                                <span style={{fontSize:10,color:"#6b7280",minWidth:78,textAlign:"right"}}>{fmt(dD)}/{fmt(dC)}</span>
                                <span style={{fontSize:11,minWidth:18}}>{dDn?"✅":"⏳"}</span>
                              </>):(
                                <span style={{fontSize:10,color:"#d1d5db",flex:1}}>— không có mã —</span>
                              )}
                            </div>
                          </div>
                        );
                      })})()}
                    </div>
                  ))}
                </div>
                )}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>📋 Chi tiết vật tư theo nguồn</span>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:14}}>
                {[["THCK","🏭","#b45309","#fffbeb","#fde68a"],["CKD","📦","#0369a1","#eff6ff","#bae6fd"]].map(([nguon,icon,mau,bgLight,bd])=>{
                  const itemsNg=th.filter(v=>(v.ng||"").trim().toUpperCase()===nguon);
                  const tongMa=itemsNg.length;
                  const maDaNhanNg=itemsNg.filter(v=>v.done).length;
                  const maConThieuNg=tongMa-maDaNhanNg;
                  const filterMode=bcBlockOpen[nguon]||""; // ""(đóng) · "done"(Đã nhận) · "thieu"(Còn thiếu)
                  const itemsFiltered=filterMode==="done"?itemsNg.filter(v=>v.done):filterMode==="thieu"?itemsNg.filter(v=>!v.done):[];
                  const nhomNg={};itemsFiltered.forEach(v=>{const k=v.vt||"(Chưa có vị trí)";if(!nhomNg[k])nhomNg[k]=[];nhomNg[k].push(v);});
                  const chonLoc=mode=>setBcBlockOpen(s=>({...s,[nguon]:s[nguon]===mode?"":mode}));
                  return(
                    <div key={nguon} style={{flex:"1 1 320px",minWidth:280,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:`1.5px solid ${bd}`}}>
                      <div style={{padding:"14px 16px",background:bgLight,display:"flex",flexDirection:"column",gap:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:18}}>{icon}</span>
                          <span style={{fontWeight:800,fontSize:14,color:mau}}>{nguon}</span>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <div style={{flex:1,textAlign:"center",background:"#fff",borderRadius:8,padding:"8px 6px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                            <div style={{fontWeight:800,fontSize:18,color:"#374151"}}>{tongMa}</div>
                            <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Tổng số mã</div>
                          </div>
                          <div onClick={()=>chonLoc("done")} style={{flex:1,textAlign:"center",background:filterMode==="done"?"#dcfce7":"#fff",borderRadius:8,padding:"8px 6px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",cursor:"pointer",userSelect:"none",border:filterMode==="done"?"1.5px solid #16a34a":"1.5px solid transparent"}}>
                            <div style={{fontWeight:800,fontSize:18,color:"#16a34a"}}>{maDaNhanNg}</div>
                            <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Đã nhận</div>
                            <div style={{fontSize:9,fontWeight:700,color:"#16a34a",marginTop:2}}>{filterMode==="done"?"▲ Thu gọn":"▼ Xem chi tiết"}</div>
                          </div>
                          <div onClick={()=>chonLoc("thieu")} style={{flex:1,textAlign:"center",background:filterMode==="thieu"?"#fee2e2":"#fff",borderRadius:8,padding:"8px 6px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",cursor:"pointer",userSelect:"none",border:filterMode==="thieu"?"1.5px solid #dc2626":"1.5px solid transparent"}}>
                            <div style={{fontWeight:800,fontSize:18,color:maConThieuNg>0?"#dc2626":"#16a34a"}}>{maConThieuNg}</div>
                            <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Còn thiếu</div>
                            <div style={{fontSize:9,fontWeight:700,color:"#dc2626",marginTop:2}}>{filterMode==="thieu"?"▲ Thu gọn":"▼ Xem chi tiết"}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                          {(()=>{
                            // Khi đã chọn ô (Đã nhận / Còn thiếu) thì chỉ xuất đúng danh sách đang hiển thị (itemsFiltered).
                            // Khi chưa chọn ô nào (đóng) thì xuất toàn bộ nguồn (itemsNg) như trước.
                            const dataXuat=filterMode?itemsFiltered:itemsNg;
                            const nhanXuat=filterMode==="done"?`Đã nhận (${dataXuat.length} mã)`:filterMode==="thieu"?`Còn thiếu (${dataXuat.length} mã)`:`Toàn bộ (${dataXuat.length} mã)`;
                            return(
                          <ExportBar
                            shareTitle={`📋 Chi tiết vật tư ${nguon} — ${proj.ten} — ${nhanXuat}`}
                            shareText={`${nguon} — ${nhanXuat}: đã nhận ${maDaNhanNg}, còn thiếu ${maConThieuNg}`}
                            onExcel={()=>xuatExcel(
                              dataXuat.map(v=>({
                                "STT":v.stt,"Mã số":v.ma,"Tên vật tư":v.ten,"ĐVT":v.dv,
                                "Vị trí":v.vt||"","Nguồn gốc":nguon,
                                "Cần":v.cn,"Đã nhận":v.dn,"Còn thiếu":v.ct,
                                "Trạng thái":v.done?"Đã đủ":v.choDuyet?"Chờ duyệt":v.chuaSoan?"Chưa soạn":"Thiếu"
                              })),
                              `ChiTietVatTu_${nguon}_${filterMode||"TatCa"}_${proj.ten.replace(/\s/g,"_")}`,
                              `Chi tiết vật tư ${nguon} — ${proj.ten} — ${nhanXuat}`
                            )}
                            onPDF={()=>{
                              const rowsHtml=dataXuat.map(v=>`<tr>
                                <td>${v.stt}</td><td><b>${v.ma}</b></td><td class="l">${v.ten}</td>
                                <td>${v.dv||""}</td>
                                <td class="l">${v.vt||""}</td>
                                <td>${fmt(v.cn)}</td>
                                <td style="color:#065f46;font-weight:700">${fmt(v.dn)}</td>
                                <td style="color:${v.ct>0?"#dc2626":"#16a34a"}">${fmt(v.ct)}</td>
                              </tr>`).join("");
                              xuatPDF(`<h2>📋 Chi tiết vật tư ${nguon} — ${nhanXuat}</h2>
                                <p class="sub">${proj.icon} ${proj.ten} · ${tongMa} mã · Đã nhận ${maDaNhanNg} · Còn thiếu ${maConThieuNg}</p>
                                <table><thead><tr><th>STT</th><th>Mã số</th><th>Tên vật tư</th><th>ĐVT</th><th>Vị trí</th><th>Cần</th><th>Đã nhận</th><th>Còn thiếu</th></tr></thead><tbody>${rowsHtml}</tbody></table>`,
                                `ChiTietVatTu_${nguon}_${filterMode||"TatCa"}_${proj.ten}`);
                            }}
                          />
                            );
                          })()}
                        </div>
                      </div>
                      {filterMode&&(
                        <div style={{padding:10,display:"flex",flexDirection:"column",gap:8}}>
                          <div style={{fontSize:11,fontWeight:700,color:filterMode==="done"?"#16a34a":"#dc2626",padding:"2px 4px"}}>
                            {filterMode==="done"?`✅ Danh sách Đã nhận (${itemsFiltered.length} mã)`:`📉 Danh sách Còn thiếu (${itemsFiltered.length} mã)`}
                          </div>
                          {itemsFiltered.length===0?(
                            <div style={{textAlign:"center",padding:20,color:"#9ca3af",fontSize:12}}>— Không có mã nào —</div>
                          ):Object.entries(nhomNg).sort(([a],[b])=>sapXepDM(a,b)).map(([dm,items])=>{
                            const isO=bcDmO[nguon+"__"+dm]!==false;
                            const dC=items.reduce((s,v)=>s+v.cn,0),dD=items.reduce((s,v)=>s+v.dn,0),dT=items.reduce((s,v)=>s+v.ct,0);
                            const dDn=items.every(v=>v.done);
                            return(
                              <div key={dm} style={{border:`1px solid ${dDn?"#bbf7d0":"#e5e7eb"}`,borderRadius:8,overflow:"hidden"}}>
                                <div onClick={()=>togDm(nguon+"__"+dm)} style={{padding:"8px 12px",background:dDn?"#f0fdf4":"#f8fafc",borderBottom:isO?"1px solid #e5e7eb":"none",display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none",flexWrap:"wrap"}}>
                                  <span>{isO?"▾":"▸"}</span>
                                  <span style={{fontWeight:700,fontSize:12,color:dDn?"#065f46":"#1f2937"}}>{dm}</span>
                                  {dDn&&<span>✅</span>}
                                  <span style={{fontSize:10,color:"#6b7280"}}>{items.length} mã</span>
                                  <div style={{flex:1}}/>
                                  <span style={{fontSize:10,color:"#6b7280"}}>Cần: <b>{fmt(dC)}</b></span>
                                  <span style={{fontSize:10,color:"#065f46"}}>Nhận: <b>{fmt(dD)}</b></span>
                                  <span style={{fontSize:10,color:dDn?"#16a34a":"#dc2626"}}>Thiếu: <b>{fmt(dT)}</b></span>
                                </div>
                                {isO&&(()=>{
                                  const gCols="34px 90px minmax(140px,1fr) 70px 70px 120px 60px";
                                  const gHeaders=[t("thSTT"),t("thMa"),t("thTen"),t("thCan"),t("thDaNhan"),"Trạng thái","%"];
                                  return(
                                  <div style={{overflowX:"auto"}}>
                                  <div style={{minWidth:574}}>
                                    <div style={{display:"grid",gridTemplateColumns:gCols,background:"#1d4ed8",color:"#fff",fontSize:9,fontWeight:800,textTransform:"uppercase"}}>
                                      {gHeaders.map((h,hi)=>(
                                        <div key={hi} style={{padding:"6px 6px",textAlign:hi===2?"left":"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h}</div>
                                      ))}
                                    </div>
                                    {items.map((v,vi)=>(
                                      <div key={v.ma} style={{display:"grid",gridTemplateColumns:gCols,background:v.done?"#f0fdf4":(vi%2?"#f9fafb":"#fff"),borderTop:"1px solid #f1f5f9",alignItems:"center",fontSize:11,color:"#111827"}}>
                                        <div style={{padding:"6px 6px",textAlign:"center"}}>{v.stt}</div>
                                        <div style={{padding:"6px 6px",textAlign:"center",fontWeight:700,wordBreak:"break-word"}}>{v.ma}</div>
                                        <div style={{padding:"6px 6px",textAlign:"left",wordBreak:"break-word"}} title={v.ten}>{v.ten}</div>
                                        <div style={{padding:"6px 6px",textAlign:"center"}}>{fmt(v.cn)}</div>
                                        <div style={{padding:"6px 6px",textAlign:"center",fontWeight:700}}>{fmt(v.dn)}</div>
                                        <div style={{padding:"6px 6px",textAlign:"center",fontWeight:700,color:v.done?"#16a34a":v.choDuyet?"#0369a1":v.chuaSoan?"#6b7280":"#ea580c"}}>
                                          {v.done?"✅ Đủ":v.choDuyet?"🕓 Chờ duyệt":v.chuaSoan?"📭 Chưa soạn":`📉 Thiếu ${fmt(v.ct)}`}
                                        </div>
                                        <div style={{padding:"4px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                                          <Prog p={v.p} done={v.done}/>
                                          <span style={{fontSize:8,fontWeight:700,color:v.done?"#16a34a":"#6b7280"}}>{v.p}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}
            </>
          );
        })()}

        {/* ── NGƯỜI DÙNG — chỉ Xưởng Hàn ── */}
        {tab==="bom_mau"&&isXH&&(()=>{
          const activeLoai = bomMauLoaiList.find(l=>l.id===bmTab) || bomMauLoaiList[0] || {id:bmTab,ten:bmTab,icon:"🗂️",mau:"#4338ca"};
          const activeBom = getBomMauRows(bmTab);
          const setActiveBom = updater=>setBomMauRows(bmTab, updater);
          const filtered = bmSearch.trim()
            ? activeBom.filter(r=>
                r.id?.toLowerCase().includes(bmSearch.toLowerCase())||
                r.ten?.toLowerCase().includes(bmSearch.toLowerCase())||
                r.ng?.toLowerCase().includes(bmSearch.toLowerCase()))
            : activeBom;
          const dmucList=[...new Set(activeBom.map(r=>r.ng).filter(Boolean))];

          const openAdd=()=>{
            setBmCur({id:"",ten:"",dv:"Cái",dm:1,ng:dmucList[0]||"",vt:"",jig:"",gc:""});
            setBmModal("add");
          };
          const openEdit=(r,idx)=>{
            setBmCur({...r});
            setBmEditIdx(idx);
            setBmModal("edit");
          };
          const saveAdd=()=>{
            if(!bmCur.id.trim()||!bmCur.ten.trim()){alert("Vui lòng nhập Mã số và Tên vật tư!");return;}
            if(activeBom.find(r=>r.id===bmCur.id.trim())){alert("Mã số đã tồn tại trong BOM này!");return;}
            const nextStt = activeBom.length ? Math.max(...activeBom.map(r=>r.stt||0))+1 : 1;
            const newRow = {...bmCur, id:bmCur.id.trim(), ten:bmCur.ten.trim(), stt:nextStt, _id:Date.now()};
            const next=[...activeBom, newRow];
            setActiveBom(next);
            setBmModal(null);
            // ✅ Chỉ upsert đúng dòng vừa thêm — không đụng tới các mã khác trên server.
            dbUpsertBomMauRows(bmTab, [newRow]).catch(e=>alert("⚠️ Lưu lên Supabase thất bại: "+e.message));
          };
          const saveEdit=()=>{
            if(!bmCur.ten.trim()){alert("Tên vật tư không được để trống!");return;}
            let savedRow=null;
            const next=activeBom.map((r,i)=>i===bmEditIdx?(savedRow={...r,...bmCur,id:r.id}):r);
            setActiveBom(next);
            setBmModal(null);
            // ✅ Chỉ upsert đúng dòng vừa sửa — không đụng tới các mã khác trên server.
            if(savedRow) dbUpsertBomMauRows(bmTab, [savedRow]).catch(e=>alert("⚠️ Lưu lên Supabase thất bại: "+e.message));
          };
          const doDelete=(idx)=>{
            const removedId=activeBom[idx]?.id;
            const next=activeBom.filter((_,i)=>i!==idx).map((r,i)=>({...r,stt:i+1}));
            setActiveBom(next);
            setBmConfirm(null);
            // ✅ Xóa đúng dòng bị xóa (theo id) + upsert lại STT của các dòng còn lại (chỉ
            // STT đổi, không dòng nào bị xóa thêm) — không dùng cách xóa-theo-khác-biệt cả
            // mảng để tránh xóa nhầm mã người khác vừa thêm.
            (async()=>{
              try{
                if(removedId) await dbDeleteBomMauRows(bmTab, [removedId]);
                if(next.length) await dbUpsertBomMauRows(bmTab, next);
              }catch(e){alert("⚠️ Lưu lên Supabase thất bại: "+e.message);}
            })();
          };

          const inpSt={width:"100%",padding:"7px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f0f4ff"};
          const btnSt={border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 11px"};

          return (
            <div style={{padding:"0 0 80px"}}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#1e1b4b,#4338ca)",borderRadius:14,padding:"18px 18px 14px",marginBottom:14,color:"#fff"}}>
                <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>🗂️ Quản lý BOM Mẫu</div>
                <div style={{fontSize:12,opacity:.7}}>Thêm · Sửa · Xóa mã vật tư trong BOM mẫu gốc</div>
              </div>

              {/* ✅ Tab DÒNG XE — lọc danh sách loại BOM mẫu bên dưới: loại tạo cho dòng xe nào
                  thì CHỈ hiện ra khi đang chọn đúng tab dòng xe đó. */}
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {[{id:"12m",lb:"12M"},{id:"citybus",lb:"CITYBUS"},{id:"minibus",lb:"MINIBUS"}].map(dx=>(
                  <button key={dx.id} onClick={()=>setBmDongXeFilter(dx.id)}
                    style={{flex:1,padding:"8px 4px",borderRadius:8,border:`2px solid ${bmDongXeFilter===dx.id?"#4338ca":"#e5e7eb"}`,
                      background:bmDongXeFilter===dx.id?"#4338ca":"#fff",color:bmDongXeFilter===dx.id?"#fff":"#6b7280",
                      fontWeight:800,fontSize:12,cursor:"pointer",transition:"all .15s"}}>
                    {dx.lb}
                  </button>
                ))}
              </div>

              {/* Switch loại BOM Mẫu — danh sách ĐỘNG, tự thêm được, đã lọc theo dòng xe */}
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                {bomMauLoaiList.filter(l=>(l.dong_xe||activeLine||"minibus")===bmDongXeFilter).map(l=>(
                  <div key={l.id} style={{position:"relative",flex:"1 1 120px",minWidth:120}}>
                    <button onClick={()=>{setBmTab(l.id);setBmSearch("");}}
                      style={{width:"100%",padding:"10px 8px",borderRadius:10,border:`2px solid ${bmTab===l.id?l.mau:"#e5e7eb"}`,
                        background:bmTab===l.id?l.mau:"#fff",color:bmTab===l.id?"#fff":"#374151",
                        fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .15s"}}>
                      {l.icon} {l.ten}
                      <span style={{display:"block",fontSize:11,fontWeight:400,marginTop:2,opacity:.85}}>{getBomMauRows(l.id).length} mã</span>
                    </button>
                    {bomMauLoaiList.length>1&&(
                      <button title="Xóa loại BOM mẫu này" onClick={()=>setBmLoaiDelConfirm(l.id)}
                        style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",
                          border:"none",background:"#dc2626",color:"#fff",fontSize:11,lineHeight:"20px",
                          cursor:"pointer",padding:0}}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={()=>{setBmLoaiForm({ten:"",icon:"🚐",mau:"#7c3aed",dongXe:bmDongXeFilter});setBmLoaiFilePreview([]);setBmLoaiFileErr("");setBmLoaiFileName("");setBmLoaiModal(true);}}
                  style={{flex:"1 1 120px",minWidth:120,padding:"10px 8px",borderRadius:10,
                    border:"2px dashed #a5b4fc",background:"#f5f3ff",color:"#4338ca",
                    fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  ➕ Thêm loại BOM mẫu mới
                </button>
              </div>

              {/* Search + Add */}
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <input value={bmSearch} onChange={e=>setBmSearch(e.target.value)}
                  placeholder="🔍 Tìm mã, tên, nguồn gốc..."
                  style={{...inpSt,flex:1}}/>
                <button onClick={openAdd}
                  style={{...btnSt,background:"#16a34a",color:"#fff",padding:"8px 14px",fontSize:13,whiteSpace:"nowrap",borderRadius:8}}>
                  + Thêm mã
                </button>
                <button onClick={()=>setBmShowImport(true)}
                  style={{...btnSt,background:"#7c3aed",color:"#fff",padding:"8px 14px",fontSize:13,whiteSpace:"nowrap",borderRadius:8}}>
                  📂 Import BOM Mẫu
                </button>
              </div>

              {/* Stats */}
              <div style={{fontSize:12,color:"#6b7280",marginBottom:8,paddingLeft:2}}>
                Hiển thị <b>{filtered.length}</b> / {activeBom.length} mã
                {bmSearch&&<span style={{color:"#7c3aed"}}> · kết quả tìm "<b>{bmSearch}</b>"</span>}
              </div>

              {/* List */}
              {/* ── Danh sách BOM Mẫu dạng BẢNG (cột) — cùng kiểu bảng với danh sách vật tư
                  chính: tiêu đề nền xanh/chữ trắng, dữ liệu chữ đen, cuộn ngang khi hẹp. ── */}
              <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:"1px solid #f1f5f9",overflow:"hidden"}}>
                {filtered.length===0?(
                  <div style={{textAlign:"center",padding:"40px 20px",color:"#9ca3af",fontSize:13}}>
                    {bmSearch?"Không tìm thấy kết quả phù hợp":"Chưa có mã nào trong BOM này"}
                  </div>
                ):(()=>{
                  const bmCols="44px 110px minmax(200px,1fr) 100px 70px 60px 60px 110px 80px";
                  const bmHeaders=[t("thSTT"),t("thMa"),t("thTen"),t("thNguonGoc"),"JIG",t("thDVT"),t("thDM"),t("thGhiChu"),"Thao tác"];
                  return(
                  <div style={{overflowX:"auto"}}>
                  <div style={{minWidth:824}}>
                    <div style={{display:"grid",gridTemplateColumns:bmCols,background:"#1d4ed8",color:"#fff",fontSize:10.5,fontWeight:800,textTransform:"uppercase"}}>
                      {bmHeaders.map((h,hi)=>(
                        <div key={hi} style={{padding:"8px 8px",textAlign:hi===2?"left":"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h}</div>
                      ))}
                    </div>
                    {filtered.map((r,fi)=>{
                      const realIdx = activeBom.findIndex(x=>x===r);
                      return (
                        <div key={r._id||fi} style={{display:"grid",gridTemplateColumns:bmCols,background:fi%2?"#f9fafb":"#fff",borderTop:"1px solid #f1f5f9",alignItems:"center",fontSize:12,color:"#111827"}}>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{r.stt}</div>
                          <div style={{padding:"8px 8px",textAlign:"center",fontWeight:700,wordBreak:"break-word"}}>{r.id}</div>
                          <div style={{padding:"8px 8px",textAlign:"left",wordBreak:"break-word"}}>{r.ten}</div>
                          <div style={{padding:"8px 8px",textAlign:"center",wordBreak:"break-word"}}>{r.ng||"—"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center",wordBreak:"break-word"}}>{r.jig||"—"}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{r.dv}</div>
                          <div style={{padding:"8px 8px",textAlign:"center"}}>{r.dm}</div>
                          <div style={{padding:"8px 8px",textAlign:"left",wordBreak:"break-word"}}>{r.gc||"—"}</div>
                          <div style={{padding:"6px 6px",display:"flex",gap:4,justifyContent:"center"}}>
                            <button onClick={()=>openEdit(r,realIdx)}
                              style={{...btnSt,background:"#dbeafe",color:"#1d4ed8",padding:"5px 10px"}}>✏️</button>
                            <button onClick={()=>setBmConfirm(realIdx)}
                              style={{...btnSt,background:"#fee2e2",color:"#dc2626",padding:"5px 10px"}}>🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                  );
                })()}
              </div>

              {/* ── Modal Thêm / Sửa ── */}
              {bmModal&&(
                <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",
                  alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}}>
                  <div style={{background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:420,
                    boxShadow:"0 20px 60px rgba(0,0,0,0.25)",maxHeight:"90vh",overflowY:"auto"}}>
                    <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>
                      {bmModal==="add"?"➕ Thêm mã mới":"✏️ Sửa mã vật tư"}
                      <span style={{fontSize:12,fontWeight:400,color:"#6b7280",marginLeft:8}}>
                        {activeLoai.icon} {activeLoai.ten}
                      </span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {[
                        {lb:t("lbMaReq"),k:"id",tp:"text",dis:bmModal==="edit",col:"1/3"},
                        {lb:t("lbTenReq"),k:"ten",tp:"text",dis:false,col:"1/3"},
                        {lb:t("lbDV"),k:"dv",tp:"text",dis:false,col:"auto"},
                        {lb:t("lbDM1XE"),k:"dm",tp:"number",dis:false,col:"auto"},
                        {lb:t("thNguonGoc"),k:"ng",tp:"text",dis:false,col:"1/3"},
                        {lb:t("lbVT"),k:"vt",tp:"text",dis:false,col:"1/3"},
                        {lb:"JIG",k:"jig",tp:"text",dis:false,col:"1/3"},
                        {lb:t("thGhiChu"),k:"gc",tp:"text",dis:false,col:"1/3"},
                      ].map(({lb,k,tp,dis,col})=>(
                        <div key={k} style={{gridColumn:col}}>
                          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>{lb}</label>
                          {k==="ng"?(
                            <>
                              <input value={bmCur[k]||""} onChange={e=>setBmCur(c=>({...c,[k]:e.target.value}))}
                                list="bm-ngl" style={inpSt} placeholder="Nhập hoặc chọn..."/>
                              <datalist id="bm-ngl">{dmucList.map(d=><option key={d} value={d}/>)}</datalist>
                            </>
                          ):(
                            <input type={tp} value={bmCur[k]||""} disabled={dis}
                              onChange={e=>setBmCur(c=>({...c,[k]:tp==="number"?Number(e.target.value):e.target.value}))}
                              style={{...inpSt,background:dis?"#f1f5f9":"#f0f4ff",color:dis?"#9ca3af":"inherit"}}/>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
                      <button onClick={()=>setBmModal(null)}
                        style={{...btnSt,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:13}}>Hủy</button>
                      <button onClick={bmModal==="add"?saveAdd:saveEdit}
                        style={{...btnSt,background:"#4338ca",color:"#fff",padding:"8px 20px",fontSize:13,fontWeight:700}}>
                        {bmModal==="add"?"✅ Thêm":"💾 Lưu thay đổi"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Confirm Xóa ── */}
              {bmConfirm!==null&&(()=>{
                const r=activeBom[bmConfirm];
                return (
                  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",
                    alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}}>
                    <div style={{background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:360,
                      boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
                      <div style={{fontWeight:800,fontSize:15,marginBottom:8,color:"#dc2626"}}>🗑️ Xác nhận xóa</div>
                      <div style={{fontSize:13,color:"#374151",marginBottom:6}}>Bạn muốn xóa mã:</div>
                      <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 12px",marginBottom:16}}>
                        <div style={{fontWeight:700,color:"#1e40af"}}>{r?.id}</div>
                        <div style={{fontSize:12,color:"#374151",marginTop:2}}>{r?.ten}</div>
                      </div>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                        <button onClick={()=>setBmConfirm(null)}
                          style={{...btnSt,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:13}}>Hủy</button>
                        <button onClick={()=>doDelete(bmConfirm)}
                          style={{...btnSt,background:"#dc2626",color:"#fff",padding:"8px 20px",fontSize:13,fontWeight:700}}>Xóa</button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Modal Thêm loại BOM mẫu mới ── */}
              {bmLoaiModal&&(
                <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",
                  alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}}
                  onClick={e=>{if(e.target===e.currentTarget)setBmLoaiModal(false);}}>
                  <div style={{background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:380,
                    boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
                    <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>➕ Thêm loại BOM mẫu mới</div>
                    <div style={{display:"grid",gap:10}}>
                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Tên loại xe / loại BOM *</label>
                        <input value={bmLoaiForm.ten} onChange={e=>setBmLoaiForm(f=>({...f,ten:e.target.value}))}
                          style={inpSt} placeholder="VD: XE BUS X10..." autoFocus/>
                      </div>
                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Dòng xe *</label>
                        <div style={{display:"flex",gap:6}}>
                          {[{id:"12m",lb:"12M"},{id:"citybus",lb:"CITYBUS"},{id:"minibus",lb:"MINIBUS"}].map(dx=>(
                            <button key={dx.id} type="button" onClick={()=>setBmLoaiForm(f=>({...f,dongXe:dx.id}))}
                              style={{flex:1,padding:"7px 4px",borderRadius:8,border:`2px solid ${bmLoaiForm.dongXe===dx.id?"#4338ca":"#e5e7eb"}`,
                                background:bmLoaiForm.dongXe===dx.id?"#4338ca":"#fff",color:bmLoaiForm.dongXe===dx.id?"#fff":"#6b7280",
                                fontWeight:800,fontSize:12,cursor:"pointer",transition:"all .15s"}}>
                              {dx.lb}
                            </button>
                          ))}
                        </div>
                        <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>Loại BOM mẫu này sẽ chỉ hiển thị cho đúng dòng xe được chọn.</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div>
                          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Icon</label>
                          <input value={bmLoaiForm.icon} onChange={e=>setBmLoaiForm(f=>({...f,icon:e.target.value}))}
                            style={inpSt} placeholder="🚐"/>
                        </div>
                        <div>
                          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Màu sắc</label>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:6}}>
                            {["#1d4ed8","#16a34a","#dc2626","#b45309","#7c3aed","#0891b2","#1f2937"].map(c=>(
                              <div key={c} onClick={()=>setBmLoaiForm(f=>({...f,mau:c}))}
                                style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",
                                  border:bmLoaiForm.mau===c?"3px solid #000":"3px solid transparent"}}/>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>
                        Mã loại (id) sẽ được tự tạo từ tên: <b>{slugifyLoaiId(bmLoaiForm.ten)||"…"}</b>
                      </div>
                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>File tạo BOM mẫu (tùy chọn)</label>
                        <input ref={bmLoaiFileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleBmLoaiFile}/>
                        <button type="button" onClick={()=>bmLoaiFileRef.current.click()}
                          style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1.5px dashed #a5b4fc",
                            background:"#f5f3ff",color:"#4338ca",fontWeight:700,fontSize:12,cursor:"pointer",textAlign:"left"}}>
                          📎 {bmLoaiFileName?bmLoaiFileName:"Chọn file Excel/CSV để nạp sẵn mã vật tư..."}
                        </button>
                        {bmLoaiFileErr&&<div style={{fontSize:11,color:"#dc2626",marginTop:4}}>⚠️ {bmLoaiFileErr}</div>}
                        {!!bmLoaiFilePreview.length&&<div style={{fontSize:11,color:"#16a34a",marginTop:4}}>✓ Đọc được {bmLoaiFilePreview.length} mã vật tư — sẽ nạp ngay sau khi tạo</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
                      <button onClick={()=>setBmLoaiModal(false)}
                        style={{...btnSt,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:13}}>Hủy</button>
                      <button onClick={addBomMauLoai}
                        style={{...btnSt,background:"#4338ca",color:"#fff",padding:"8px 20px",fontSize:13,fontWeight:700}}>
                        ✅ Tạo loại BOM mẫu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Confirm Xóa loại BOM mẫu ── */}
              {bmLoaiDelConfirm&&(()=>{
                const l=bomMauLoaiList.find(x=>x.id===bmLoaiDelConfirm);
                const soMa=getBomMauRows(bmLoaiDelConfirm).length;
                return (
                  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",
                    alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}}>
                    <div style={{background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:380,
                      boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
                      <div style={{fontWeight:800,fontSize:15,marginBottom:8,color:"#dc2626"}}>🗑️ Xóa loại BOM mẫu</div>
                      <div style={{fontSize:13,color:"#374151",marginBottom:12}}>
                        Xóa loại <b>{l?.icon} {l?.ten}</b> sẽ xóa toàn bộ <b>{soMa}</b> mã vật tư thuộc loại này. Hành động này không thể hoàn tác.
                      </div>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                        <button onClick={()=>setBmLoaiDelConfirm(null)}
                          style={{...btnSt,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:13}}>Hủy</button>
                        <button onClick={()=>deleteBomMauLoai(bmLoaiDelConfirm)}
                          style={{...btnSt,background:"#dc2626",color:"#fff",padding:"8px 20px",fontSize:13,fontWeight:700}}>Xóa loại này</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {tab==="users"&&isAdminAccount(user)&&(
          <UsersPanel currentUser={user} users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser} dbDeleteUser={dbDeleteUser} lockOtherXH={lockOtherXH} lineQuyen={lineQuyen} setLineQuyen={setLineQuyen} dbUpsertQuyenDongXe={dbUpsertQuyenDongXe} tabQuyen={tabQuyen} setTabQuyen={setTabQuyen} dbUpsertQuyenChucNang={dbUpsertQuyenChucNang}/>
        )}

        {tab==="cms"&&isAdminAccount(user)&&(
          <CmsPanel items={cmsItems} setItems={setCmsItems} dbUpsertCms={dbUpsertCms} dbDeleteCms={dbDeleteCms} users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser}/>
        )}

      </div>

        </div>{/* /CỘT NỘI DUNG CHÍNH */}
      </div>{/* /LAYOUT sidebar + nội dung */}

      {/* ── MODALS ── */}
      {(modal||newP)&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget){setModal(null);setNewP(false);setNewProjXlsPreview([]);setNewProjXlsErr("");}}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:520,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>

            {(modal==="add"||modal==="edit")&&(
              <div>
                <h3 style={{margin:"0 0 16px",fontSize:15}}>{modal==="add"?t("modalAdd"):t("modalUpdate")} — {proj.icon} {proj.ten}</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[[t("lbMaReq"),"ma","text",modal==="edit"],[t("lbTenReq"),"ten","text",false],[t("lbDV"),"dv","text",false],[t("lbVT"),"vt","text",false],["JIG","jig","text",false],[t("lbDM1XE"),"dm","number",false]].map(([lb,k,tp,dis])=>(
                    <div key={k} style={{gridColumn:(k==="ten"||k==="dm")?"1/3":"auto"}}>
                      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>{lb}</label>
                      <input type={tp} value={cur[k]||""} disabled={dis} onChange={e=>setCur(c=>({...c,[k]:tp==="number"?Number(e.target.value):e.target.value}))}
                        style={{...inp,background:dis?"#f1f5f9":"#f0f4ff",color:dis?"#9ca3af":"inherit"}}/>
                    </div>
                  ))}
                  <div style={{gridColumn:"1/3"}}>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Nguồn gốc</label>
                    <input value={cur.ng||""} onChange={e=>setCur(c=>({...c,ng:e.target.value}))} list="dml" style={inp} placeholder="Nhập hoặc chọn..."/>
                    <datalist id="dml">{DMS.map(d=><option key={d} value={d}/>)}</datalist>
                  </div>
                  <div style={{gridColumn:"1/3"}}>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ghi chú</label>
                    <input value={cur.gc||""} onChange={e=>setCur(c=>({...c,gc:e.target.value}))} style={inp}/>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════
                      ✅ SỬA 4 — 7 TRƯỜNG MỚI — CHỈ HIỆN KHI DÒNG XE = 12M
                      (theo yêu cầu "CHỈ ÁP DỤNG CHO DÒNG XE 12M")
                      ═══════════════════════════════════════════════════════════ */}
                  {activeLine==="12m"&&(
                    <>
                      <div style={{gridColumn:"1/3",borderTop:"1px dashed #d1d5db",paddingTop:10,marginTop:2,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:14}}>🚌</span>
                        <span style={{fontSize:11,fontWeight:800,color:"#0f766e",letterSpacing:.3}}>THÔNG TIN RIÊNG XE 12M</span>
                      </div>

                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Check GH29Y</label>
                        <select value={cur.ckgh||"dung_chung"} onChange={e=>setCur(c=>({...c,ckgh:e.target.value}))} style={inp}>
                          <option value="dung_chung">DÙNG CHUNG</option>
                          <option value="rieng">RIÊNG GH29Y</option>
                        </select>
                      </div>

                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Phân xưởng</label>
                        <input value={cur.px||""} onChange={e=>setCur(c=>({...c,px:e.target.value}))} list="pxl12m" style={inp} placeholder="X. Hàn..."/>
                        <datalist id="pxl12m">
                          <option value="X. Hàn"/><option value="X. Gia Công"/><option value="X. Lắp Ráp"/><option value="X. Sơn"/><option value="X. Điện"/>
                        </datalist>
                      </div>

                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Dài (mm)</label>
                        <input type="number" value={cur.dai||""} onChange={e=>setCur(c=>({...c,dai:e.target.value}))} style={inp} placeholder="0.0"/>
                      </div>
                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Rộng (mm)</label>
                        <input type="number" value={cur.rong||""} onChange={e=>setCur(c=>({...c,rong:e.target.value}))} style={inp} placeholder="0.0"/>
                      </div>
                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Dày (mm)</label>
                        <input type="number" value={cur.day_kt||""} onChange={e=>setCur(c=>({...c,day_kt:e.target.value}))} style={inp} placeholder="0.0"/>
                      </div>

                      <div>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Trạm/Xí</label>
                        <input value={cur.tram||""} onChange={e=>setCur(c=>({...c,tram:e.target.value}))} list="traml12m" style={inp} placeholder="SUB 4, H3..."/>
                        <datalist id="traml12m">
                          <option value="SUB 1"/><option value="SUB 2"/><option value="SUB 3"/><option value="SUB 4"/><option value="H3"/><option value="H7"/>
                        </datalist>
                      </div>

                      <div style={{gridColumn:"1/3"}}>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Trách nhiệm XH</label>
                        <input value={cur.tnxh||""} onChange={e=>setCur(c=>({...c,tnxh:e.target.value}))} style={inp} placeholder="HẢI, ĐOÀN, PHIÊN..."/>
                      </div>
                    </>
                  )}

                  <div style={{gridColumn:"1/3"}}>
                    <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6}}>Ảnh vật tư</label>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      {cur.anh
                        ?<img src={cur.anh} alt="" onClick={()=>setAnhPv(cur.anh)} style={{width:68,height:68,objectFit:"cover",borderRadius:8,border:"1px solid #e5e7eb",cursor:"zoom-in"}}/>
                        :<div style={{width:68,height:68,borderRadius:8,border:"2px dashed #d1d5db",display:"flex",alignItems:"center",justifyContent:"center",color:"#d1d5db",fontSize:26}}>🖼</div>}
                      <div>
                        <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={hdAnh}/>
                        <button onClick={()=>fRef.current.click()} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"6px 14px"}}>{cur.anh?"🔄 Đổi":"📷 Chọn ảnh"}</button>
                        {cur.anh&&<button onClick={()=>setCur(c=>({...c,anh:""}))} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"6px 10px",marginLeft:6}}>Xóa</button>}
                        <div style={{fontSize:10,color:"#9ca3af",marginTop:4}}>JPG, PNG · Max 5MB</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
                  <button onClick={save} style={{...btn,background:mauP,color:"#fff",padding:"7px 16px"}}>{modal==="add"?"Thêm":"Lưu"}</button>
                </div>
              </div>
            )}

            {(modal==="nhap"||modal==="xuat")&&(
              <div>
                <h3 style={{margin:"0 0 6px"}}>{modal==="nhap"?t("modalNhap"):t("modalXuat")}</h3>
                <p style={{margin:"0 0 12px",color:"#6b7280",fontSize:11,fontFamily:"monospace"}}>{cur.stt}. {cur.ma} — {cur.ten}</p>
                <div style={{background:"#f8fafc",borderRadius:8,padding:"9px 13px",marginBottom:12,fontSize:12}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>ĐM/1XE:</span><b>{fmt(cur.dm)} {cur.dv}</b></div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Số lượng</label>
                  <input type="number" min={1} value={slXT} onChange={e=>setSlXT(e.target.value)} style={inp}/>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ghi chú</label>
                  <input value={gcXT} onChange={e=>setGcXT(e.target.value)} style={inp}/>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button onClick={()=>setModal(null)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
                  <button onClick={doIO} style={{...btn,background:modal==="nhap"?"#16a34a":"#dc2626",color:"#fff",padding:"7px 16px"}}>{modal==="nhap"?"Xác nhận nhập":"Xác nhận xuất"}</button>
                </div>
              </div>
            )}

            {newP&&(
              <div>
                <h3 style={{margin:"0 0 16px",fontSize:15}}>{t("modalNewProj")}</h3>
                {newProjFormFields}
                <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}>
                  <button onClick={()=>{setNewP(false);setNewProjXlsPreview([]);setNewProjXlsErr("");}} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
                  <button onClick={mkProj} style={{...btn,background:nPF.mau,color:"#fff",padding:"7px 16px"}}>Tạo dự án</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TẠO PHIẾU MODAL ── */}
      {showPh&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget)setShowPh(false);}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:600,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 16px",fontSize:15}}>{t("modalTaoPGN")}</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Số phiếu</label>
                <input value={phF.sp} onChange={e=>setPhF(f=>({...f,sp:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ngày</label>
                <input type="date" value={phF.ngay} onChange={e=>setPhF(f=>({...f,ngay:e.target.value}))} style={inp}/>
              </div>
              <div style={{gridColumn:"1/3"}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ghi chú</label>
                <input value={phF.gc} onChange={e=>setPhF(f=>({...f,gc:e.target.value}))} style={inp}/>
              </div>
            </div>
            <div style={{background:"#f8fafc",borderRadius:8,padding:14,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>Thêm vật tư vào phiếu</div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3}}>Mã vật tư</label>
                  <select value={addIt.ma} onChange={e=>setAddIt(a=>({...a,ma:e.target.value}))} style={inp}>
                    <option value="">-- Chọn mã --</option>
                    {bom.map(v=><option key={v.ma} value={v.ma}>{v.ma} — {v.ten.slice(0,40)}</option>)}
                  </select>
                </div>
                <div style={{width:80}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3}}>Số lượng</label>
                  <input type="number" min={1} value={addIt.sl} onChange={e=>setAddIt(a=>({...a,sl:parseInt(e.target.value)||1}))} style={inp}/>
                </div>
                <button onClick={addPhIt} style={{...btn,background:"#2563eb",color:"#fff",padding:"7px 14px"}}>+ Thêm</button>
              </div>
            </div>
            {phIt.length>0&&(
              <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",marginBottom:16}}>
                <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:480}}>
                  <thead><tr style={{background:"#1d4ed8"}}>
                    {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSL"),""].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:800,color:"#fff"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {phIt.map((it,i)=>(
                      <tr key={i} style={{borderTop:"1px solid #f1f5f9"}}>
                        <td style={{padding:"6px 10px",color:"#9ca3af"}}>{i+1}</td>
                        <td style={{padding:"6px 10px",fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:11}}>{it.ma}</td>
                        <td style={{padding:"6px 10px"}}>{it.ten}</td>
                        <td style={{padding:"6px 10px",color:"#6b7280"}}>{it.dv}</td>
                        <td style={{padding:"6px 10px",fontWeight:700,color:"#16a34a"}}>{fmt(it.sl)}</td>
                        <td style={{padding:"6px 10px"}}>
                          <button onClick={()=>setPhIt(ps=>ps.filter((_,j)=>j!==i))} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"2px 8px",fontSize:11}}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowPh(false)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 16px"}}>Hủy</button>
              <button onClick={submitPh} disabled={!phF.sp||phIt.length===0}
                style={{...btn,background:mauP,color:"#fff",padding:"7px 16px",opacity:(!phF.sp||phIt.length===0)?.5:1}}>
                Tạo phiếu ({phIt.length} mã)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── XEM / SỬA PHIẾU MODAL ── */}
      {freshVP&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget){setViewPh(null);setEditPh(null);setSlThucEdit({});}}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:720,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>
          <div ref={phieuRef} style={{background:"#fff"}}>
            {/* Header */}
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:14}}>{editPh?"✏️ CHỈNH SỬA PHIẾU GIAO NHẬN VẬT TƯ":"PHIẾU GIAO NHẬN VẬT TƯ"}</div>
              {!editPh&&<div style={{fontSize:12,color:"#6b7280"}}>Số phiếu: <b style={{color:"#1d4ed8"}}>{freshVP.sp}</b> · Ngày: <b>{freshVP.ngay}</b></div>}
            </div>

            {/* Info row - view or edit */}
            {editPh?(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Số phiếu</label>
                  <input value={editPh.sp} onChange={e=>setEditPh(p=>({...p,sp:e.target.value}))} style={{...inp}}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ngày</label>
                  <input type="date" value={editPh.ngay} onChange={e=>setEditPh(p=>({...p,ngay:e.target.value}))} style={{...inp}}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ghi chú</label>
                  <input value={editPh.gc} onChange={e=>setEditPh(p=>({...p,gc:e.target.value}))} style={{...inp}} placeholder="Ghi chú..."/>
                </div>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14,background:"#f8fafc",borderRadius:8,padding:"12px 16px",fontSize:12}}>
                <div><span style={{color:"#6b7280"}}>Bên giao:</span> <b style={{color:"#dc2626"}}>{freshVP.bg}</b></div>
                <div><span style={{color:"#6b7280"}}>Bên nhận:</span> <b style={{color:"#1d4ed8"}}>{freshVP.bn}</b></div>
                <div><span style={{color:"#6b7280"}}>Trạng thái:</span> <Tag bg={freshVP.tt==="Đã xác nhận"?"#d1fae5":"#fef3c7"} c={freshVP.tt==="Đã xác nhận"?"#065f46":"#92400e"} ch={freshVP.tt}/></div>
                {freshVP.gc&&<div><span style={{color:"#6b7280"}}>Ghi chú:</span> {freshVP.gc}</div>}
                {freshVP.nguoi_soan&&<div><span style={{color:"#6b7280"}}>Người soạn:</span> <b style={{color:"#7c3aed"}}>👤 {freshVP.nguoi_soan}</b>{freshVP.don_vi_soan&&<span style={{color:"#9ca3af",fontSize:11}}> · {freshVP.don_vi_soan}</span>}</div>}
              </div>
            )}

            {/* Table */}
            <div style={{overflowX:"auto",marginBottom:14}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#1d4ed8"}}>
                  {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSoLuong"),editPh?"":isXH?t("thSLThucNhan"):"",editPh?"":t("thSLThieu"),editPh?t("thXoa"):t("thDuyet"),editPh?null:t("thNguoiDuyet")].filter(h=>h!==null&&h!=="").map(h=><th key={h} style={{padding:"8px 10px",textAlign:[t("thSoLuong"),t("thSLThucNhan"),t("thSLThieu")].includes(h)?"right":"left",fontWeight:800,color:"#fff",whiteSpace:"nowrap"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {(editPh?editPh.ct:freshVP.ct||[]).map((c,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f9fafb"}}>
                      <td style={{padding:"7px 10px",color:"#9ca3af"}}>{i+1}</td>
                      <td style={{padding:"7px 10px",fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:11}}>{c.ma}</td>
                      <td style={{padding:"7px 10px"}}>{c.ten}</td>
                      <td style={{padding:"7px 10px",color:"#6b7280"}}>{c.dv}</td>
                      <td style={{padding:"7px 10px",fontWeight:700,color:"#16a34a",textAlign:"right"}}>
                        {editPh
                          ?<input type="number" min={1} value={c.sl} onChange={e=>setEditPh(p=>({...p,ct:p.ct.map((x,j)=>j===i?{...x,sl:parseInt(e.target.value)||1}:x)}))}
                              style={{width:70,padding:"3px 6px",border:"1px solid #d1d5db",borderRadius:5,fontSize:12,textAlign:"right"}}/>
                          :fmt(c.sl)}
                      </td>
                      {/* SL Thực nhận — chỉ hiện khi xem (không editPh) */}
                      {!editPh&&isXH&&(
                        <td style={{padding:"7px 10px",textAlign:"right"}}>
                          {c.ok
                            ?<span style={{fontWeight:700,color:"#1d4ed8"}}>{fmt(c.sl_thuc_nhan??c.sl)}</span>
                            :<input type="number" min={0} max={c.sl}
                                value={slThucEdit[c.id]!==undefined?slThucEdit[c.id]:(c.sl_thuc_nhan??c.sl)}
                                onChange={e=>setSlThucEdit(s=>({...s,[c.id]:parseInt(e.target.value)||0}))}
                                style={{width:65,padding:"3px 6px",border:"1.5px solid #c7d2fe",borderRadius:5,fontSize:12,textAlign:"right",background:"#f0f4ff"}}/>
                          }
                        </td>
                      )}
                      {/* SL thiếu */}
                      {!editPh&&(
                        <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#dc2626"}}>
                          {(()=>{
                            const slThuc=c.ok?(c.sl_thuc_nhan??c.sl):(slThucEdit[c.id]!==undefined?slThucEdit[c.id]:(c.sl_thuc_nhan??c.sl));
                            const thieu=Math.max(0,(c.sl||0)-slThuc);
                            return thieu>0?<span>⚠️ {fmt(thieu)}</span>:<span style={{color:"#9ca3af"}}>—</span>;
                          })()}
                        </td>
                      )}
                      <td style={{padding:"7px 10px",textAlign:"center"}}>
                        {editPh
                          ?<button onClick={()=>setEditPh(p=>({...p,ct:p.ct.filter((_,j)=>j!==i)}))} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"3px 9px",fontSize:11}}>✕</button>
                          :c.ok
                            ?(c.sl_thieu>0
                              ?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                                  <span style={{color:"#f59e0b",fontSize:13}}>⚠️</span>
                                  <span style={{background:"#fef3c7",color:"#92400e",borderRadius:6,padding:"2px 6px",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>Thiếu {fmt(c.sl_thieu)} → Soạn lại</span>
                                </div>
                              :<span style={{color:"#16a34a",fontSize:16}}>✅</span>)
                            :isXH?<button onClick={()=>{
                                const slThuc=slThucEdit[c.id]!==undefined?slThucEdit[c.id]:(c.sl_thuc_nhan??c.sl);
                                duyetCt(freshVP.id,c.id,slThuc,freshVP.pid||freshVP.projId);
                                setSlThucEdit(s=>{const n={...s};delete n[c.id];return n;});
                              }} style={{...btn,background:"#2563eb",color:"#fff",padding:"4px 12px",fontSize:11}}>Duyệt</button>
                            :<span style={{color:"#9ca3af",fontSize:11}}>Chờ XH</span>}
                      </td>
                      {!editPh&&<td style={{padding:"7px 10px",fontSize:11,color:"#7c3aed",fontWeight:600}}>{c.ok&&c.nguoi_duyet?<span>👤 {c.nguoi_duyet}</span>:<span style={{color:"#d1d5db"}}>—</span>}</td>}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:"#f8fafc",borderTop:"2px solid #e5e7eb"}}>
                    <td colSpan={editPh?3:4} style={{padding:"8px 10px",fontWeight:700}}>Tổng cộng</td>
                    <td style={{padding:"8px 10px",fontWeight:700,textAlign:"center"}}>{editPh?editPh.ct.length:freshVP.tong} chủng loại</td>
                    <td style={{padding:"8px 10px",fontWeight:700,color:"#16a34a",textAlign:"right"}}>{fmt((editPh?editPh.ct:freshVP.ct||[]).reduce((s,c)=>s+c.sl,0))}</td>
                    {!editPh&&isXH&&<td style={{padding:"8px 10px",fontWeight:700,color:"#1d4ed8",textAlign:"right"}}>{fmt((freshVP.ct||[]).reduce((s,c)=>s+(c.sl_thuc_nhan??c.sl),0))}</td>}
                    {!editPh&&<td style={{padding:"8px 10px",fontWeight:700,color:"#dc2626",textAlign:"right"}}>{(()=>{const t=(freshVP.ct||[]).reduce((s,c)=>s+Math.max(0,(c.sl||0)-(c.sl_thuc_nhan??c.sl)),0);return t>0?`⚠️ ${fmt(t)}`:"—";})()}</td>}
                    <td style={{padding:"8px 10px",textAlign:"center",fontSize:11,color:"#6b7280"}}>{editPh?"":((freshVP.ct||[]).filter(c=>c.ok).length+"/"+(freshVP.ct||[]).length+" duyệt")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Thêm dòng mới khi đang sửa */}
            {editPh&&(
              <div style={{display:"flex",gap:8,alignItems:"flex-end",marginBottom:14,background:"#f0f9ff",borderRadius:8,padding:"10px 12px"}}>
                <div style={{flex:1}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:2}}>Mã vật tư</label>
                  <select onChange={e=>{const vt=bom.find(v=>v.ma===e.target.value);if(!vt)return;setEditPh(p=>{const ex=p.ct.find(c=>c.ma===vt.ma);if(ex)return{...p,ct:p.ct.map(c=>c.ma===vt.ma?{...c,sl:c.sl+1}:c)};return{...p,ct:[...p.ct,{id:uid(),phid:p.id,stt:p.ct.length+1,ma:vt.ma,ten:vt.ten,dv:vt.dv,sl:1,ok:false}]};});e.target.value="";}}
                    style={{...inp}} defaultValue="">
                    <option value="">-- Chọn mã để thêm --</option>
                    {bom.filter(v=>!editPh.ct.find(c=>c.ma===v.ma)).map(v=><option key={v.ma} value={v.ma}>{v.ma} – {v.ten}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Duyệt banner (chỉ khi xem) */}
            {!editPh&&(()=>{
              const ct=freshVP.ct||[];
              const dd=ct.filter(c=>c.ok).length;
              const all=ct.length>0&&dd===ct.length;
              return(
                <div style={{background:all?"#f0fdf4":"#fffbeb",border:`2px solid ${all?"#16a34a":"#f59e0b"}`,borderRadius:10,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:all?"#065f46":"#92400e"}}>{all?"✅ XƯỞNG HÀN đã duyệt toàn bộ":`⏳ Còn ${ct.length-dd} mã chưa duyệt`}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>Bên nhận: <b style={{color:"#1d4ed8"}}>XƯỞNG HÀN</b> · {dd}/{ct.length} đã duyệt</div>
                  </div>
                  {!all&&ct.length>0&&isXH&&<button onClick={()=>duyetAll(freshVP.id,freshVP.pid||freshVP.projId)} style={{...btn,background:"#1d4ed8",color:"#fff",padding:"10px 22px",fontSize:13,fontWeight:700}}>✓ Duyệt tất cả</button>}
                  {all&&<div style={{background:"#16a34a",color:"#fff",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:700}}>✅ Hoàn tất giao nhận</div>}
                </div>
              );
            })()}

            {/* Ký tên (chỉ khi xem) */}
            {!editPh&&(()=>{
              // Người soạn (bên giao) lấy từ phiếu; người duyệt (bên nhận) lấy dòng duyệt gần nhất trong chi tiết phiếu
              const ctOk=(freshVP.ct||[]).filter(c=>c.ok&&c.nguoi_duyet);
              const tenGiao=freshVP.nguoi_soan||"";
              const tenNhan=ctOk.length?ctOk[ctOk.length-1].nguoi_duyet:"";
              const uGiao=users.find(u=>u.ten===tenGiao);
              const uNhan=tenNhan?users.find(u=>u.ten===tenNhan):null;
              const cols=[
                {lb:"Đại diện bên giao",org:freshVP.bg,ten:tenGiao,chuKy:uGiao?.chu_ky,mine:tenGiao&&tenGiao===user.ten},
                {lb:"Đại diện bên nhận",org:freshVP.bn,ten:tenNhan,chuKy:uNhan?.chu_ky,mine:tenNhan&&tenNhan===user.ten},
              ];
              return (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:16}}>
                  {cols.map((c,i)=>(
                    <div key={i} style={{textAlign:"center"}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:4}}>{c.lb}</div>
                      <div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>{c.org}</div>
                      <div style={{height:56,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                        {c.chuKy
                          ?<img src={c.chuKy} alt="Chữ ký" style={{maxHeight:52,maxWidth:"85%",objectFit:"contain"}}/>
                          :(c.mine
                            ?<button onClick={()=>setShowSignPad(true)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"4px 12px",fontSize:11,fontWeight:700,marginBottom:4}}>✍️ Ký ngay</button>
                            :null)}
                      </div>
                      <div style={{borderTop:"1px solid #d1d5db",paddingTop:6,fontSize:12,fontWeight:700,color:c.ten?"#111827":"#d1d5db"}}>{c.ten||"—"}</div>
                      <div style={{fontSize:10,color:"#9ca3af"}}>(Ký, ghi rõ họ tên)</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

            {/* Actions */}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
              {editPh?(
                <>
                  <button onClick={()=>setEditPh(null)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:13}}>Hủy</button>
                  <button onClick={saveEditPh} disabled={editPh.ct.length===0} style={{...btn,background:"#16a34a",color:"#fff",padding:"8px 20px",fontSize:13,fontWeight:700,opacity:editPh.ct.length===0?.5:1}}>💾 Lưu thay đổi</button>
                </>
              ):(
                <>
                  <button onClick={()=>window.print()} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"8px 16px",fontSize:13}}>🖨 In phiếu</button>
                  <button disabled={dangChiaSe} onClick={async()=>{
                    setDangChiaSe(true);
                    try{ await chiaSePhieuAnh(phieuRef.current, freshVP); }
                    finally{ setDangChiaSe(false); }
                  }} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"8px 16px",fontSize:13,fontWeight:700,opacity:dangChiaSe?0.6:1,cursor:dangChiaSe?"not-allowed":"pointer"}}>
                    {dangChiaSe?"⏳ Đang tạo ảnh...":"📤 Chia sẻ"}
                  </button>
                  {(isTHCK||isKHO)&&freshVP.tt!=="Đã xác nhận"&&<button onClick={()=>setEditPh({...freshVP,ct:[...(freshVP.ct||[])]})} style={{...btn,background:"#f59e0b",color:"#fff",padding:"8px 16px",fontSize:13}}>✏️ Sửa phiếu</button>}
                  {isXH&&freshVP.tt!=="Đã xác nhận"&&<button onClick={()=>{xacNhan(freshVP.id);setViewPh(null);}} style={{...btn,background:"#16a34a",color:"#fff",padding:"8px 16px",fontSize:13}}>✓ Xác nhận</button>}
                  <button onClick={()=>{setViewPh(null);setEditPh(null);setSlThucEdit({});}} style={{...btn,background:"#2563eb",color:"#fff",padding:"8px 16px",fontSize:13}}>Đóng</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── IMPORT BOM MODAL ── */}
      {showXlsImport&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget){setShowXlsImport(false);setXlsPreview([]);setXlsErr("");importPidRef.current=null;}}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:560,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 6px",fontSize:15}}>{t("modalImportExcel")}</h3>
            <p style={{margin:"0 0 14px",color:"#6b7280",fontSize:12}}>File Excel cần có các cột: <b>Mã số, Tên vật tư, ĐVT, ĐM/1XE, Nguồn gốc, Vị trí, Ghi chú</b></p>
            <div style={{background:"#f8fafc",borderRadius:8,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#374151"}}>
              <div style={{fontWeight:700,marginBottom:6}}>Tên cột hợp lệ:</div>
              <div>STT · <b>Mã số</b> · <b>Tên vật tư</b> · ĐVT · ĐM/1XE · Nguồn gốc · Vị trí · Ghi chú</div>
            </div>
            <input ref={xlsRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleXlsFile}/>
            <button onClick={()=>xlsRef.current.click()} style={{...btn,background:"#065f46",color:"#fff",padding:"9px 18px",fontSize:13,marginBottom:12,width:"100%"}}>
              📂 Chọn file Excel (.xlsx / .xls / .csv)
            </button>
            {xlsErr&&<div style={{background:"#fee2e2",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#991b1b",marginBottom:12}}>⚠️ {xlsErr}</div>}
            {xlsPreview.length>0&&(
              <div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#065f46"}}>✓ Đọc được {xlsPreview.length} mã vật tư</div>
                <div style={{overflowX:"auto",maxHeight:220,overflowY:"auto",border:"1px solid #e5e7eb",borderRadius:8,marginBottom:14}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr style={{background:"#1d4ed8",position:"sticky",top:0}}>
                      {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thDM"),t("thNguonGoc")].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:800,color:"#fff"}}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {xlsPreview.slice(0,10).map((v,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"5px 8px",color:"#9ca3af"}}>{v.stt}</td>
                          <td style={{padding:"5px 8px",fontWeight:700,color:mauP,fontFamily:"monospace"}}>{v.ma}</td>
                          <td style={{padding:"5px 8px",maxWidth:160,textAlign:"left"}}>{v.ten}</td>
                          <td style={{padding:"5px 8px",color:"#6b7280"}}>{v.dv}</td>
                          <td style={{padding:"5px 8px",textAlign:"center"}}>{v.dm}</td>
                          <td style={{padding:"5px 8px",color:"#6b7280"}}>{v.ng}</td>
                        </tr>
                      ))}
                      {xlsPreview.length>10&&<tr><td colSpan={6} style={{padding:"6px 8px",color:"#9ca3af",textAlign:"center"}}>...và {xlsPreview.length-10} mã nữa</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button onClick={()=>{setShowXlsImport(false);setXlsPreview([]);setXlsErr("");importPidRef.current=null;}} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px"}}>Hủy</button>
                  <button onClick={()=>{if(window.confirm(`Thêm ${xlsPreview.length} mã vào BOM hiện tại?`))doXlsImport("them");}} style={{...btn,background:"#16a34a",color:"#fff",padding:"7px 16px"}}>➕ Thêm vào</button>
                  <button onClick={()=>{
                    const soMaCu=bom.length;
                    const canhBao=soMaCu>0
                      ? `⚠️ THAY THẾ sẽ XÓA VĨNH VIỄN ${soMaCu} mã đang có và thay bằng ${xlsPreview.length} mã từ Excel.\n\nCác mã KHÔNG có trong file Excel này sẽ MẤT HẲN (kể cả trạng thái đã nhận, ảnh...).\n\nBạn có chắc chắn muốn tiếp tục?`
                      : `Thay thế toàn bộ BOM bằng ${xlsPreview.length} mã từ Excel?`;
                    if(window.confirm(canhBao))doXlsImport("thay");
                  }} style={{...btn,background:"#dc2626",color:"#fff",padding:"7px 16px"}}>🔄 Thay thế</button>
                </div>
              </div>
            )}
            {!xlsPreview.length&&!xlsErr&&(
              <div style={{textAlign:"right",marginTop:8}}>
                <button onClick={()=>{setShowXlsImport(false);setXlsErr("");importPidRef.current=null;}} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px"}}>Đóng</button>
              </div>
            )}
          </div>
        </div>
      )}
      {bmShowImport&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3100,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget){setBmShowImport(false);setBmXlsPreview([]);setBmXlsErr("");}}}>
          <div style={{background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:560,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",maxHeight:"92vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 6px",fontSize:15}}>📂 Import BOM Mẫu — {bmTab==="xh"?"🚗 KIM MAI 9":"🚐 MINIBUS X9"}</h3>
            <p style={{margin:"0 0 14px",color:"#6b7280",fontSize:12}}>File Excel cần có các cột: <b>Mã số, Tên vật tư, ĐVT, ĐM/1XE, Nguồn gốc, Vị trí, Ghi chú</b></p>
            <input ref={bmXlsRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleBmXlsFile}/>
            <button onClick={()=>bmXlsRef.current.click()} style={{border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,background:"#7c3aed",color:"#fff",padding:"9px 18px",fontSize:13,marginBottom:12,width:"100%"}}>
              📂 Chọn file Excel (.xlsx / .xls / .csv)
            </button>
            {bmXlsErr&&<div style={{background:"#fee2e2",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#991b1b",marginBottom:12}}>⚠️ {bmXlsErr}</div>}
            {bmXlsPreview.length>0&&(
              <div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#065f46"}}>✓ Đọc được {bmXlsPreview.length} mã vật tư</div>
                <div style={{overflowX:"auto",maxHeight:220,overflowY:"auto",border:"1px solid #e5e7eb",borderRadius:8,marginBottom:14}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr style={{background:"#1d4ed8",position:"sticky",top:0}}>
                      {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thDM"),t("thNguonGoc")].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:800,color:"#fff"}}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {bmXlsPreview.slice(0,10).map((v,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"5px 8px",color:"#9ca3af"}}>{v.stt}</td>
                          <td style={{padding:"5px 8px",fontWeight:700,color:"#7c3aed",fontFamily:"monospace"}}>{v.ma}</td>
                          <td style={{padding:"5px 8px",maxWidth:160,textAlign:"left"}}>{v.ten}</td>
                          <td style={{padding:"5px 8px",color:"#6b7280"}}>{v.dv}</td>
                          <td style={{padding:"5px 8px",textAlign:"center"}}>{v.dm}</td>
                          <td style={{padding:"5px 8px",color:"#6b7280"}}>{v.ng}</td>
                        </tr>
                      ))}
                      {bmXlsPreview.length>10&&<tr><td colSpan={6} style={{padding:"6px 8px",color:"#9ca3af",textAlign:"center"}}>...và {bmXlsPreview.length-10} mã nữa</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                  <button onClick={()=>{setBmShowImport(false);setBmXlsPreview([]);setBmXlsErr("");}} style={{border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,background:"#f3f4f6",color:"#374151",padding:"7px 14px",fontSize:13}}>Hủy</button>
                  <button onClick={()=>{if(window.confirm(`Thêm ${bmXlsPreview.length} mã mới vào BOM Mẫu hiện tại? (mã trùng sẽ tự bỏ qua)`))doBmImport("them");}} style={{border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,background:"#16a34a",color:"#fff",padding:"7px 16px",fontSize:13}}>➕ Thêm vào</button>
                  <button onClick={()=>{if(window.confirm(`Thay thế TOÀN BỘ BOM Mẫu (${bmTab==="xh"?"KIM MAI 9":"MINIBUS X9"}) bằng ${bmXlsPreview.length} mã từ Excel?`))doBmImport("thay");}} style={{border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,background:"#dc2626",color:"#fff",padding:"7px 16px",fontSize:13}}>🔄 Thay thế</button>
                </div>
              </div>
            )}
            {!bmXlsPreview.length&&!bmXlsErr&&(
              <div style={{textAlign:"right",marginTop:8}}>
                <button onClick={()=>{setBmShowImport(false);setBmXlsErr("");}} style={{border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,background:"#f3f4f6",color:"#374151",padding:"7px 14px",fontSize:13}}>Đóng</button>
              </div>
            )}
          </div>
        </div>
      )}
      {showImport&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}}
          onClick={e=>{if(e.target===e.currentTarget)setShowImport(false);}}>
          <div style={{background:"#fff",borderRadius:12,padding:24,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <h3 style={{margin:"0 0 6px",fontSize:15}}>{t("modalImportProj")}</h3>
            <p style={{margin:"0 0 18px",fontSize:12,color:"#6b7280"}}>Dự án hiện tại: <b>{proj.icon} {proj.ten}</b> ({bom.length} mã đang có)</p>

            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8}}>Chọn BOM nguồn</label>
              {bomMauLoaiList.map(l=>({v:l.id,l:`${l.icon} BOM ${l.ten}`,d:`${getBomMauRows(l.id).length} mã vật tư`,c:l.mau})).map(o=>(
                <div key={o.v} onClick={()=>setImportSrc(o.v)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,border:`2px solid ${importSrc===o.v?o.c:"#e5e7eb"}`,background:importSrc===o.v?"#f8fafc":"#fff",cursor:"pointer",marginBottom:8}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${o.c}`,background:importSrc===o.v?o.c:"transparent",flexShrink:0}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:importSrc===o.v?o.c:"#374151"}}>{o.l}</div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{o.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8}}>Cách import</label>
              {[{v:"them",l:"➕ Thêm vào (bỏ qua mã đã có)",c:"#16a34a"},{v:"thay",l:"🔄 Thay thế toàn bộ danh sách",c:"#dc2626"}].map(o=>(
                <div key={o.v} onClick={()=>setImportMode(o.v)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,border:`2px solid ${importMode===o.v?o.c:"#e5e7eb"}`,background:importMode===o.v?"#f8fafc":"#fff",cursor:"pointer",marginBottom:8}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${o.c}`,background:importMode===o.v?o.c:"transparent",flexShrink:0}}/>
                  <div style={{fontWeight:700,fontSize:13,color:importMode===o.v?o.c:"#374151"}}>{o.l}</div>
                </div>
              ))}
              {importMode==="thay"&&bom.length>0&&(
                <div style={{background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#92400e"}}>
                  ⚠️ Sẽ xóa toàn bộ {bom.length} mã hiện có và thay bằng BOM mới
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowImport(false)} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"8px 18px",fontSize:13}}>Hủy</button>
              <button onClick={()=>{
                if(importMode==="thay"&&bom.length>0&&!window.confirm(`⚠️ THAY THẾ sẽ XÓA VĨNH VIỄN ${bom.length} mã đang có trong dự án này.\n\nCác mã không có trong BOM Mẫu vừa chọn sẽ MẤT HẲN (kể cả trạng thái đã nhận, ảnh...).\n\nBạn có chắc chắn muốn tiếp tục?`))return;
                doImport();
              }} style={{...btn,background:importMode==="thay"?"#dc2626":"#16a34a",color:"#fff",padding:"8px 18px",fontSize:13,fontWeight:700}}>
                {importMode==="them"?"➕ Thêm vào dự án":"🔄 Thay thế"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnhModal src={anhPv} onClose={()=>setAnhPv(null)}/>

      {/* 🚨 Modal soạn & gửi báo khẩn cấp (mở từ nút 🚨 trong tab Kiểm tra/Soạn Hàng) */}
      {khanCapModal&&(
        <KhanCapModal
          items={khanCapModal.items}
          proj={proj}
          donViOptions={donViOptions.filter(dv=>dv!==user.don_vi)}
          onClose={()=>setKhanCapModal(null)}
          onSubmit={guiCanhBaoKhan}
          preSelectMa={khanCapModal.preSelectMa}
          activeLine={activeLine}
        />
      )}

      {/* 🔔 Modal danh sách cảnh báo khẩn cấp đã nhận/đã gửi (mở từ chuông ở header) */}
      {showCanhBaoList&&(
        <CanhBaoListModal
          list={canhBaoLienQuan}
          user={user}
          onClose={()=>setShowCanhBaoList(false)}
          onMarkRead={dbDanhDauDocCanhBao}
          onReply={dbPhanHoiCanhBao}
          onMarkReplySeen={dbDanhDauDaXemPhanHoi}
        />
      )}

      {/* ── ĐỔI MẬT KHẨU MODAL ── */}
      {/* ── MODAL CẬP NHẬT NGUỒN GỐC ── */}
      {showUpdateNg&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}
          onClick={e=>{if(e.target===e.currentTarget){setShowUpdateNg(false);setUpdateNgFile(null);setUpdateNgMsg("");setUpdateNgErr("");}}}>
          <div style={{background:"#fff",borderRadius:14,padding:28,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>🔄 Cập nhật Nguồn gốc / JIG theo Mã số</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Chọn file Excel/CSV có cột <b>Mã số</b> và ít nhất 1 trong 2 cột <b>Nguồn gốc</b> / <b>JIG</b></div>
            
            <div style={{marginBottom:16,padding:16,border:"2px dashed #d1d5db",borderRadius:8,textAlign:"center",background:"#f9fafb",cursor:"pointer",transition:"all .2s"}}
              onClick={()=>updateNgFileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="#1d4ed8";e.currentTarget.style.background="#eff6ff";}}
              onDragLeave={e=>{e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.background="#f9fafb";}}
              onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.background="#f9fafb";const f=e.dataTransfer.files[0];if(f){handleUpdateNgFile({target:{files:[f]},currentTarget:{value:""}});}}}
            >
              <div style={{fontSize:24,marginBottom:8}}>📁</div>
              <div style={{fontWeight:600,color:"#1f2937",marginBottom:4}}>
                {updateNgFile?updateNgFile.name:"Chọn hoặc kéo file vào đây"}
              </div>
              <div style={{fontSize:11,color:"#6b7280"}}>Excel (.xlsx, .xls) hoặc CSV</div>
            </div>

            <input ref={updateNgFileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleUpdateNgFile}/>

            {updateNgErr&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#991b1b",marginBottom:12}}>⚠️ {updateNgErr}</div>}
            {updateNgMsg&&<div style={{background:updateNgMsg.includes("✓")?"#d1fae5":"#dbeafe",border:`1px solid ${updateNgMsg.includes("✓")?"#6ee7b7":"#93c5fd"}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:updateNgMsg.includes("✓")?"#065f46":"#1e40af",marginBottom:12}}>
              {updateNgMsg.includes("✓")?"✅":"ℹ️"} {updateNgMsg}
            </div>}

            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowUpdateNg(false);setUpdateNgFile(null);setUpdateNgMsg("");setUpdateNgErr("");}}
                style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,padding:"8px 16px",background:"#f3f4f6",color:"#374151",transition:"all .2s",opacity:updateNgLoading?0.5:1,pointerEvents:updateNgLoading?"none":"auto"}}>Hủy</button>
              <button onClick={updateNgFromFile}
                disabled={!updateNgFile||updateNgLoading}
                style={{border:"none",borderRadius:8,cursor:!updateNgFile||updateNgLoading?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"8px 20px",background:updateNgLoading?"#cbd5e1":"#1d4ed8",color:"#fff",transition:"all .2s",opacity:!updateNgFile||updateNgLoading?0.6:1}}>
                {updateNgLoading?"⏳ Đang xử lý...":"✓ Cập nhật ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePw&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}
          onClick={e=>{if(e.target===e.currentTarget){setShowChangePw(false);setCpwForm({cur:"",next:"",confirm:""});setCpwErr("");setCpwOk("");}}}>
          <div style={{background:"#fff",borderRadius:14,padding:28,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>🔑 Đổi mật khẩu</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:20}}>Tài khoản: <b>{isImgAvatar(user.avatar)?"🧑":user.avatar} {user.ten}</b> ({user.id})</div>
            {[
              {label:"MẬT KHẨU HIỆN TẠI",key:"cur",placeholder:"NHẬP MK HIỆN TẠI"},
              {label:"MẬT KHẨU MỚI",key:"next",placeholder:"TỐI THIỂU 4 KÝ TỰ"},
              {label:"XÁC NHẬN MẬT KHẨU MỚI",key:"confirm",placeholder:"NHẬP LẠI MK MỚI"},
            ].map(({label,key,placeholder})=>(
              <div key={key} style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4}}>{label}</label>
                <input type="password" value={cpwForm[key]} onChange={e=>setCpwForm(f=>({...f,[key]:e.target.value}))}
                  placeholder={placeholder}
                  style={{width:"100%",padding:"9px 12px",border:"1.5px solid #c7d2fe",borderRadius:8,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f0f4ff"}}/>
              </div>
            ))}
            {cpwErr&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#991b1b",marginBottom:12}}>⚠️ {cpwErr}</div>}
            {cpwOk&&<div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#065f46",marginBottom:12}}>✅ {cpwOk}</div>}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowChangePw(false);setCpwForm({cur:"",next:"",confirm:""});setCpwErr("");setCpwOk("");}}
                style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,padding:"8px 16px",background:"#f3f4f6",color:"#374151"}}>Hủy</button>
              <button onClick={()=>{
                setCpwErr("");setCpwOk("");
                if(!cpwForm.cur||!cpwForm.next||!cpwForm.confirm){setCpwErr("Vui lòng điền đầy đủ!");return;}
                if(cpwForm.cur!==user.pw){setCpwErr("Mật khẩu hiện tại không đúng!");return;}
                if(cpwForm.next.length<4){setCpwErr("Mật khẩu mới tối thiểu 4 ký tự!");return;}
                if(cpwForm.next!==cpwForm.confirm){setCpwErr("Mật khẩu mới không khớp!");return;}
                // Cập nhật state user + danh sách users
                const updated={...user,pw:cpwForm.next};
                setUser(updated);
                setUsers(us=>us.map(u=>u.id===user.id?{...u,pw:cpwForm.next}:u));
                dbUpsertUser&&dbUpsertUser({...user,pw:cpwForm.next});
                setCpwOk("Đổi mật khẩu thành công!");
                setCpwForm({cur:"",next:"",confirm:""});
                setTimeout(()=>{setShowChangePw(false);setCpwOk("");},1500);
              }} style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"8px 20px",background:"#1d4ed8",color:"#fff"}}>
                Xác nhận đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignPad&&(
        <SignaturePad
          initial={user.chu_ky}
          onClose={()=>setShowSignPad(false)}
          onSave={(dataUrl)=>{
            const updated={...user,chu_ky:dataUrl};
            setUser(updated);
            setUsers(us=>us.map(u=>u.id===user.id?{...u,chu_ky:dataUrl}:u));
            dbUpsertUser&&dbUpsertUser({...user,chu_ky:dataUrl});
            setShowSignPad(false);
            flash("✅ Đã lưu chữ ký điện tử! Chữ ký sẽ tự hiện trên các phiếu bạn soạn/duyệt.");
          }}
        />
      )}
    </div>
    </LangCtx.Provider>
  );
}
