import { useState, useMemo, useRef, useCallback, Fragment, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { DONVI_ICON_IMG, XH_BUS_ICON_B64, DONG_XE_ICON_MINIBUS_PNG, DONG_XE_ICON_12M_PNG } from "./assets";
import { IconGlobe3D, IconKey3D, IconPenSign3D, IconUserGear3D, IconBox3D, IconClipboardCheck3D, IconShieldCheck3D, IconReceipt3D, IconChartBar3D, IconFlagFinish3D, IconFolderGear3D, IconUsersLock3D, IconImageCms3D, IconChatHeart3D, IconContentStack3D, IconLayoutDash3D, IconShieldKey3D, IconPuzzleTable3D, IconNotebookBell3D, IconBookGuide3D } from "./components/icons";
import {
  BOM_MAU_LOAI_DEFAULT, slugifyLoaiId, PROJS_DEF, uid, fmt, getProjectBgColor, mkBom, initBom,
  USERS_DEF, isAdminAccount, TABS_ALL, TABS_THCK, TABS_XUONGHAN, TABS_KHO, TABS_KHTH,
  TABS_THCK_KEYS, TABS_XUONGHAN_KEYS, TABS_KHO_KEYS, TABS_KHTH_KEYS, TAB_KEYS_BY_ROLE,
  IMPORT_FIELD_LABEL_KEYS, SPARE_FIELD_SLOTS, SIDEBAR_LABEL_KEYS, isImgAvatar
} from "./utils";
import { APP_I18N, LangCtx, useLang, LOGIN_I18N, translateVN2ZH, walkAndTranslateDOM } from "./i18n";
import { KL_LOGIN_CSS } from "./styles";

export function KlIconShieldCheck({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5.5c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5V6l7-3z"/>
    <path d="M9 12l2 2 4-4.2"/>
  </svg>);
}
export function KlIconGauge({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15a8 8 0 1 1 16 0"/>
    <path d="M12 15l4-5"/>
    <path d="M12 15h.01"/>
    <path d="M4 15h1.5M18.5 15H20M6.5 8.5l1 1M17.5 8.5l-1 1"/>
  </svg>);
}
export function KlIconTrendingUp({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 14.5l5.5-6 3.5 3 6.5-7.5"/>
    <path d="M14.5 4h4.5v4.5"/>
    <path d="M4 19h16"/>
  </svg>);
}
export function KlIconGear({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.2"/>
    <path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.36 5.64l-1.7 1.7M7.34 16.66l-1.7 1.7M18.36 18.36l-1.7-1.7M7.34 7.34l-1.7-1.7"/>
  </svg>);
}
export function KlIconPower({size=20,color="#fff",strokeWidth=2}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v8"/>
    <path d="M7 6a8 8 0 1 0 10 0"/>
  </svg>);
}
export function KlIconKey({size=18,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="15" r="4"/>
    <path d="M11 12l8-8"/>
    <path d="M16 7l2.5 2.5"/>
    <path d="M13.5 9.5L16 12"/>
  </svg>);
}
export function KlIconBell({size=20,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z"/>
    <path d="M10 19a2 2 0 0 0 4 0"/>
  </svg>);
}
export function KlIconUser({size=26,color="#fff",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.6"/>
    <path d="M4.8 20c1-3.4 3.9-5.4 7.2-5.4s6.2 2 7.2 5.4"/>
  </svg>);
}
export function KlIconClock({size=13,color="#94a3b8",strokeWidth=1.8}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M12 7.5V12l3 2"/>
  </svg>);
}
export function KlIconChevronRight({size=16,color="#fff",strokeWidth=2.2}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7"/>
  </svg>);
}


export const KL_LINES = [
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
export const LINE_IDS = KL_LINES.map(l=>l.id); // ["12m","citybus","minibus"]

// 🏷️ Nhãn ngắn gọn theo dòng xe — dùng để gắn TRƯỚC tin nhắn "🚨 Báo khẩn cấp" (cả trong app
// lẫn trong nội dung chia sẻ ra Zalo/SMS) để người nhận biết ngay cảnh báo thuộc dòng xe nào,
// không cần mở app / đổi tab mới biết.
export const DONG_XE_NHAN = {
  "12m":     {text:"12M",      icon:"🚛", mau:"#334155", nen:"#e2e8f0"},
  citybus:   {text:"CITY BUS", icon:"🚌", mau:"#0f766e", nen:"#ccfbf1"},
  minibus:   {text:"MINI BUS", icon:"🚐", mau:"#b45309", nen:"#fef3c7"},
};
export const nhanDongXe = (id)=> DONG_XE_NHAN[id] || DONG_XE_NHAN.minibus;

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
export const normalizeDonViKey = (dv) => String(dv||"")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/đ/gi,"d")
  .toUpperCase()
  .replace(/[^A-Z0-9]/g,"");
// ✅ Mỗi đơn vị chuyên trách gắn CỨNG với ĐÚNG 1 tab + 1 dòng xe cố định — KHÔNG lấy dòng
// xe theo allowed[0]/thứ tự bảng "quyen_dong_xe" nữa (thứ tự đó phụ thuộc dữ liệu đã lưu
// trên Supabase, có thể lệch nếu trước đây từng cấp nhầm nhiều dòng cho 1 đơn vị chuyên
// trách — VD "NHÀ MÁY THCK" từng bị lưu luôn cả "12M"/"CityBus" khiến allerd[0] trả về
// "12m" thay vì "minibus"). Gán cứng ở đây đảm bảo LUÔN đúng bất kể dữ liệu server thế nào.
export const DIRECT_ENTRY_BY_DON_VI = {
  "NHAMAYTHCK": {tab:"soan",  line:"minibus"},
  "KHOVATTU":   {tab:"soan",  line:"minibus"},
  "KHOCITYBUS": {tab:"soan",  line:"citybus"},
  "KHO12M":     {tab:"soan",  line:"12m"},
  "XHMINIBUS":  {tab:"duyet", line:"minibus"},
  "XHCITYBUS":  {tab:"duyet", line:"citybus"},
  "XH12":       {tab:"duyet", line:"12m"},  // chấp nhận cả "XH_12" và "XH_12M" (đều normalize về "XH12"/"XH12M")
  "XH12M":      {tab:"duyet", line:"12m"},
};
export const getDirectEntry = (don_vi) => DIRECT_ENTRY_BY_DON_VI[normalizeDonViKey(don_vi)] || null;

// ✅ Nút "＋ Thêm xe mới" + biểu tượng "🗑️ Xoá dự án" trong khối "Tổng quan dự án" — theo
// yêu cầu CHỈ hiển thị cho đúng 3 đơn vị được phân công nhiệm vụ khởi tạo/xoá dự án:
// XƯỞNG HÀN, Phòng KT, PHÒNG KH-TH. Mọi đơn vị khác (kể cả NHÀ MÁY THCK, các kho/xưởng
// chuyên trách từng dòng xe, Ban CN, Ban LĐNM...) đều không thấy 2 nút này.

// ── Màu đặc trưng của từng dòng xe (dùng cho vòng tròn icon) ──
export const LINE_ICON_COLOR = {"12m":"#2f8fff", "citybus":"#0fe0a4", "minibus":"#ff9a1f"};
// ✅ Hàm dùng chung: vẽ 1 vòng tròn tô màu bao quanh icon chiếc xe — áp dụng cho MỌI
// dòng xe (12M / City Bus / Mini Bus...) và có thể tái sử dụng ở bất kỳ đâu cần hiển thị
// icon dòng xe (badge "Dòng xe:", thẻ dự án, danh sách chọn dòng xe...). Màu vòng tròn
// tự động lấy theo lineId; nếu không tìm thấy dùng màu mặc định (cam).
export function VehicleIconCircle({lineId, size=22, icon="🚌", color}){
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
export function ScreenTopBar({onBack, badgeBorderColor, activeLine, onLogout}){
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
export const LINE_QUYEN_DEFAULT = {
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
export const TAB_META = [
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
export const baseRoleOfDonViName = (dv) => {
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
export const TAB_QUYEN_DEFAULT = {
  "NHÀ MÁY THCK": TABS_THCK_KEYS,
  // ✅ [Cập nhật] Toàn bộ nhóm role "khth" (XƯỞNG HÀN tổng thể xh01/02/03, PHÒNG KH-TH,
  // Phòng KT, Ban CN, Ban LĐNM) giờ ĐÃ được xem đủ mọi tab nghiệp vụ (📦 Vật tư/📋 Soạn
  // Hàng/✅ Kiểm Tra Xác Nhận/📄 Phiếu GN/📈 Báo Cáo/🗂️ BOM Mẫu), chỉ ẩn "👥 Người dùng"
  // (quản lý tài khoản vẫn dành riêng cho admin/is_admin) — TABS_KHTH_KEYS giờ tương đương
  // TABS_XUONGHAN_KEYS. Nút Thêm/Sửa/Xoá/Import trong tab 📦 Vật tư cũng đã được mở (biến
  // isKHTH trước đây từng ẩn các nút này đã được gỡ bỏ, xem khối render tab "ds").
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
export const getTabKeysForDonVi = (tabQuyen, dv) => {
  if(tabQuyen && Array.isArray(tabQuyen[dv])) return tabQuyen[dv];
  if(Array.isArray(TAB_QUYEN_DEFAULT[dv])) return TAB_QUYEN_DEFAULT[dv];
  return TAB_KEYS_BY_ROLE[baseRoleOfDonViName(dv)] || TABS_KHTH_KEYS;
};

// ─── Trạng thái dự án — 3 thẻ thư mục sau khi chọn dòng xe ───
// ⚠️ "inprogress" (Đang thực hiện) dẫn thẳng vào hệ thống quản lý vật tư (web chính).
// "new" (Khởi tạo Dự án) cũng dẫn vào hệ thống nhưng tự động mở sẵn modal "🆕 Thêm dự án mới"
// (đúng y hệt nút "＋ Thêm" trên thanh dự án của trang chính).
// "done" (Đã thực hiện) hiển thị danh sách các dự án đã bấm "Hoàn thành".
export const KL_PROJECT_STATUSES = [
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
export function LoginScreen({onLogin, resume, onLogout, allUsers, headerBannerUrl, gateIntro}){
  // 🚪 Khối "Chọn dòng xe" — nếu admin chưa cấu hình gì trong CMS, "gateIntro" (prop, tính từ
  // readGateIntro) đã tự trả về GATE_INTRO_DEFAULTS nên màn hình vẫn hiện ĐÚNG chữ/màu gốc
  // như trước khi có CMS — không cần kiểm tra rỗng ở đây.
  const gi = gateIntro || GATE_INTRO_DEFAULTS;
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
  // ✅ MFA (xác thực 2 lớp qua email OTP) — dùng thẳng supabase.auth.signInWithOtp/verifyOtp
  // của Supabase (email OTP có sẵn, KHÔNG cần dịch vụ gửi email ngoài / API key riêng).
  // Chỉ áp dụng cho tài khoản có cờ mfa_required=true (admin + tài khoản được cấp quyền
  // thêm/sửa/xoá — xem cột "Bắt buộc MFA" trong bảng 👥 Người dùng).
  const [mfaPendingUser, setMfaPendingUser] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaErr, setMfaErr] = useState("");
  const [mfaInfo, setMfaInfo] = useState("");
  const [mfaSending, setMfaSending] = useState(false);
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
  // ✅ Tách phần "hoàn tất đăng nhập" (điều hướng theo đơn vị/quyền) ra hàm riêng để
  // dùng chung cho cả luồng đăng nhập thường VÀ luồng sau khi xác thực MFA thành công.
  const completeLogin=(u)=>{
    setAuthedUser(u);
    const allowed=getAllowedLines(u);
    const directEntry=getDirectEntry(u.don_vi);
    if(directEntry){
      setActiveLine(directEntry.line);
      onLogin(u, userList, {openNewProject:false, line:directEntry.line, directTab:directEntry.tab});
      return;
    }
    if(allowed.length===1){
      setActiveLine(allowed[0]);
      onLogin(u, userList, {openNewProject:false, line:allowed[0]});
      return;
    }
    goStep("select");
  };

  const handleGateLogin=async(e)=>{
    e.preventDefault();
    if(!uid2){setErr(t.errNoAcc);return;}
    // ✅ BẢO MẬT: không còn so sánh mật khẩu ở client. Toàn bộ việc kiểm tra mật khẩu
    // (đã băm bcrypt) diễn ra trong hàm SECURITY DEFINER "login_user" trên Supabase —
    // client chỉ nhận về user object nếu đúng mật khẩu, KHÔNG BAO GIỜ nhận hash.
    const {data:u,error:loginErr}=await supabase.rpc("login_user",{p_id:uid2,p_pw:pw});
    if(loginErr){console.error("login_user RPC error:",loginErr);setErr("Lỗi hệ thống, vui lòng thử lại!");return;}
    if(!u){setErr(t.errBadPw);return;}
    setErr("");
    // ❌ ĐÃ TẮT MFA (xác thực 2 lớp qua email OTP) theo yêu cầu — đăng nhập đúng mật khẩu
    // là vào thẳng hệ thống, không còn gửi/yêu cầu mã xác thực email nữa, bất kể cờ
    // mfa_required trong DB hay tài khoản có phải admin/xh04 hay không.
    completeLogin(u);
  };

  // Gửi lại mã OTP (khi hết hạn/chưa nhận được email)
  const resendMfaCode=async()=>{
    if(!mfaPendingUser?.email) return;
    setMfaSending(true); setMfaErr(""); setMfaInfo("");
    const {error}=await supabase.auth.signInWithOtp({email:mfaPendingUser.email, options:{shouldCreateUser:true}});
    setMfaSending(false);
    if(error){ setMfaErr("Gửi lại mã thất bại, vui lòng thử lại sau."); return; }
    setMfaInfo("Đã gửi lại mã mới về email của bạn.");
  };

  // Xác minh mã OTP vừa nhập — đúng thì hoàn tất đăng nhập như bình thường.
  const verifyMfaCode=async()=>{
    if(!mfaCode.trim()){ setMfaErr("Vui lòng nhập mã xác thực!"); return; }
    setMfaErr(""); setMfaInfo("");
    const {error}=await supabase.auth.verifyOtp({email:mfaPendingUser.email, token:mfaCode.trim(), type:"email"});
    if(error){ setMfaErr("Mã xác thực không đúng hoặc đã hết hạn!"); return; }
    // App không dùng phiên đăng nhập của Supabase Auth ở bất kỳ đâu khác — đăng xuất
    // ngay khỏi phiên này để không lẫn với cơ chế đăng nhập nội bộ (bảng users) của app.
    try{ await supabase.auth.signOut(); }catch{}
    const u=mfaPendingUser;
    setMfaPendingUser(null); setMfaCode("");
    completeLogin(u);
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

  // ════════════════ BƯỚC MFA: xác thực mã OTP gửi về email ════════════════
  if(step==="mfa"){
    return(
      <div className="kl-select-login kl-gate">
        <style>{KL_LOGIN_CSS}</style>
        <div className="gate-grid">
          <div className="gate-visual">
            <div className="gate-visual-inner">
              <div className="gate-visual-content">
                <div className="gate-visual-eyebrow">Kim Long Motor · Huế</div>
                <h2 className="gate-visual-title">Xác thực<br/>2 lớp (MFA)</h2>
                <p className="gate-visual-sub">Tài khoản của bạn có quyền quản trị/chỉnh sửa nên cần xác thực thêm để bảo vệ hệ thống.</p>
              </div>
            </div>
          </div>
          <div className="gate-form-panel">
            <div className="gate-box">
              <div className="gate-eyebrow">Bước xác thực bổ sung</div>
              <h1 className="gate-title">Nhập mã xác thực</h1>
              <p className="gate-sub">
                Mã gồm 6 số vừa được gửi tới email{" "}
                <b>{mfaPendingUser?.email}</b>. Mã có hiệu lực trong ít phút.
              </p>
              <form onSubmit={e=>{e.preventDefault();verifyMfaCode();}}>
                <div className="field field-icon">
                  <label>Mã xác thực</label>
                  <div className="input-wrap">
                    <input type="text" inputMode="numeric" maxLength={8} value={mfaCode}
                      onChange={e=>{setMfaCode(e.target.value);setMfaErr("");}}
                      placeholder="••••••" autoComplete="one-time-code" autoFocus required
                      style={{letterSpacing:4,fontWeight:700,fontSize:18}}/>
                  </div>
                </div>
                {mfaErr && <div className="gate-err">⚠️ {mfaErr}</div>}
                {mfaInfo && <div className="gate-err" style={{background:"#ecfdf5",color:"#065f46",borderColor:"#a7f3d0"}}>✓ {mfaInfo}</div>}
                <button type="submit" className="gate-submit" disabled={mfaSending}>Xác nhận →</button>
              </form>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:14,fontSize:12.5}}>
                <button type="button" onClick={resendMfaCode} disabled={mfaSending}
                  style={{background:"none",border:"none",color:"#1d4ed8",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  {mfaSending?"Đang gửi...":"Gửi lại mã"}
                </button>
                <button type="button" onClick={()=>{setMfaPendingUser(null);setMfaCode("");setMfaErr("");setMfaInfo("");setStep("gate");}}
                  style={{background:"none",border:"none",color:"#6b7280",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  ← Quay lại đăng nhập
                </button>
              </div>
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
          {/* ✅ Đã bỏ "banner mặc định" (ảnh base64 ~99KB nhúng cứng trong code, KL_BANNER_B64
              cũ) để giảm dung lượng file. Giờ nếu admin CHƯA cấu hình banner trong tab CMS
              (headerBannerUrl rỗng), hiển thị placeholder CSS thuần (gradient + tên công ty)
              thay vì ảnh — vừa nhẹ vừa không mất bố cục. Khi admin chọn ảnh trong CMS, ảnh đó
              sẽ tự hiện ra như cũ, không cần sửa code. */}
          {headerBannerUrl
            ? <img src={headerBannerUrl} alt="Kim Long Motor" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",display:"block"}}/>
            : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#0f2a6b 0%,#1d4ed8 55%,#2563eb 100%)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4}}>
                <div style={{fontWeight:900,fontSize:22,letterSpacing:2,color:"#fff",textShadow:"0 2px 6px rgba(0,0,0,0.35)"}}>KIM LONG MOTOR</div>
                <div style={{fontWeight:600,fontSize:12,letterSpacing:3,color:"#bfe0ff"}}>PRODUCTION SYSTEM</div>
              </div>}

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
          {/* 🚪 Tiêu đề/mô tả/màu chữ/ảnh nền đọc từ CMS (khối "gate_intro") — xem "gi" đầu
              component. Nếu admin chưa cấu hình gì, "gi" tự trả về đúng chữ/màu mặc định gốc. */}
          <div onClick={()=>{setActiveLine("minibus");onLogin(authedUser,userList,{openNewProject:false,line:"minibus",directTab:"duyet"});}}
            style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,width:"100%",
              background:gi.anh?`linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), url(${gi.anh}) center/cover no-repeat`:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.14)",
              borderRadius:16,padding:"14px 24px",maxWidth:420,textAlign:"center",boxSizing:"border-box"}}>
            <span style={{color:gi.bannerTitleColor,fontWeight:800,fontSize:14}}>
              {gi.bannerTitle}
            </span>
            <span style={{color:gi.bannerSubColor,fontSize:12,lineHeight:1.55,opacity:.85}}>
              {gi.bannerSub}
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
          {/* Tiêu đề + màu + ảnh nền dùng CHUNG với thẻ trên (CMS "gate_intro") — riêng dòng
              mô tả GIỮ NGUYÊN chữ khác biệt cho nhóm "khth" (không thuộc khối 5 dòng CMS,
              vì đây là nội dung RIÊNG theo vai trò, không phải nội dung chung của màn hình). */}
          <div onClick={()=>{const l=activeLine||"minibus";setActiveLine(l);onLogin(authedUser,userList,{openNewProject:false,line:l,directTab:"ds"});}}
            style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,width:"100%",
              background:gi.anh?`linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), url(${gi.anh}) center/cover no-repeat`:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.14)",
              borderRadius:16,padding:"14px 24px",maxWidth:420,textAlign:"center",boxSizing:"border-box"}}>
            <span style={{color:gi.bannerTitleColor,fontWeight:800,fontSize:14}}>
              {gi.bannerTitle}
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
                if(cpwForm2.next.length<4){setCpwErr2("Mật khẩu mới tối thiểu 4 ký tự!");return;}
                if(cpwForm2.next!==cpwForm2.confirm){setCpwErr2("Mật khẩu mới không khớp!");return;}
                // ✅ BẢO MẬT: xác thực mật khẩu cũ + băm mật khẩu mới đều thực hiện trong RPC
                // "change_password" trên Supabase (bcrypt), không còn so sánh/lưu plaintext.
                const {data:ok,error:cpErr}=await supabase.rpc("change_password",{p_id:authedUser.id,p_old_pw:cpwForm2.cur,p_new_pw:cpwForm2.next});
                if(cpErr){console.error("change_password RPC error:",cpErr);setCpwErr2("Lỗi hệ thống, vui lòng thử lại!");return;}
                if(!ok){setCpwErr2("Mật khẩu hiện tại không đúng!");return;}
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
          {/* 🚪 3 dòng chữ (nhãn nhỏ / tiêu đề lớn / mô tả) + ảnh nền — CMS khối "gate_intro"
              (biến "gi" ở đầu component). Giữ nguyên class CSS gốc ("hero"/"eyebrow") để không
              đổi bố cục/kiểu chữ — chỉ override NỘI DUNG chữ + MÀU chữ + nền qua inline style
              (inline style luôn thắng CSS class nên vẫn áp dụng đúng màu tuỳ chỉnh). */}
          <div className="hero" style={gi.anh?{
              backgroundImage:`linear-gradient(rgba(10,14,20,0.72),rgba(10,14,20,0.72)), url(${gi.anh})`,
              backgroundSize:"cover", backgroundPosition:"center", borderRadius:16,
            }:undefined}>
            {/* ✅ Đặt lại biến CSS "--steel" NGAY TRÊN element này (không phải toàn trang) —
                chấm tròn nhỏ trước chữ (CSS ::before) dùng "var(--steel)" nên tự đổi màu theo
                CHỮ, không cần thêm phần tử màu thủ công nào khác. (Viền/nền mờ của khung nhỏ
                quanh nhãn vẫn giữ tông xanh dịu mặc định cho đồng bộ khung UI, chỉ chữ+chấm đổi
                theo màu tuỳ chỉnh.) */}
            <div className="eyebrow" style={{"--steel":gi.eyebrowColor,color:gi.eyebrowColor}}>
              {gi.eyebrow}
            </div>
            <h2 style={{color:gi.headingColor}}>{gi.heading}</h2>
            <p style={{color:gi.subColor}}>{gi.sub}</p>
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
export function SignaturePad({initial, onSave, onClose}){
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
export const DEFAULT_CUSTOM_DEPTS = ["KHO CITYBUS","KHO 12M","XH_MINIBUS","XH_CITYBUS","XH_12","PHÒNG KT","BAN CN","BAN LĐNM"];

// ── Khối gấp/mở (accordion) dùng chung cho trang "Người dùng" — giúp gom các bảng lớn
// (phân quyền, form thêm tài khoản, danh sách theo đơn vị) lại gọn gàng, đỡ rối mắt. ──
export function AccordionCard({icon,title,subtitle,badge,badgeColor="#1d4ed8",open,onToggle,right,children}){
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
export const StatCard=({icon,label,value,color,compact})=>(
  <div style={{background:"#fff",borderRadius:10,padding:compact?"10px 8px":"12px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",display:"flex",flexDirection:compact?"column":"row",alignItems:compact?"flex-start":"center",gap:compact?6:10}}>
    <div style={{width:compact?28:34,height:compact?28:34,borderRadius:9,background:color+"1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:compact?14:17,flexShrink:0}}>{icon}</div>
    <div style={{minWidth:0}}>
      <div style={{fontSize:compact?14:16,fontWeight:800,color:"#1f2937",lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:compact?9.5:10.5,color:"#6b7280",whiteSpace:compact?"normal":"nowrap",lineHeight:1.2}}>{label}</div>
    </div>
  </div>
);

// ── Modal xác nhận xoá đơn vị còn tài khoản (bắt tick "Tôi hiểu" mới cho xoá — tránh bấm nhầm) ──
export function DeleteDeptModal({modal,onClose,onConfirm}){
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

export function UsersPanel({currentUser, users, setUsers, dbUpsertUser, dbDeleteUser, lockOtherXH, lineQuyen, setLineQuyen, dbUpsertQuyenDongXe, tabQuyen, setTabQuyen, dbUpsertQuyenChucNang}){
  const {t} = useLang();
  const [form, setForm]   = useState({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧",is_admin:false,email:"",mfa_required:false});
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
    // ✅ BẢO MẬT: khi SỬA tài khoản, để trống ô mật khẩu = giữ nguyên mật khẩu cũ (không
    // bắt buộc nhập lại). Khi TẠO MỚI vẫn bắt buộc có mật khẩu ban đầu.
    if(!form.id.trim()||!form.ten.trim()||(!editing&&!form.pw.trim())){fl("⚠️ Điền đủ thông tin!");return;}
    const {pw:newPw,...formNoPw}=form; // ⚠️ KHÔNG gửi trường "pw" xuống bảng "users" nữa
    if(editing){
      const updated={...(users.find(u=>u.id===editing)||{}),...formNoPw};
      const ok = dbUpsertUser ? await dbUpsertUser(updated) : true;
      if(!ok){ fl("⚠️ Lưu lên máy chủ THẤT BẠI — chưa cập nhật!"); return; }
      if(newPw&&newPw.trim()){
        // Băm mật khẩu mới qua RPC "admin_set_password" (bcrypt phía server)
        const {error:pwErr}=await supabase.rpc("admin_set_password",{p_id:editing,p_new_pw:newPw});
        if(pwErr){console.error("admin_set_password RPC error:",pwErr);fl("⚠️ Đã lưu thông tin nhưng ĐỔI MẬT KHẨU thất bại!");return;}
      }
      setUsers(l=>l.map(u=>u.id===editing?updated:u));
      fl("✓ Đã cập nhật");
    } else {
      if(users.find(u=>u.id===form.id)){fl("⚠️ ID đã tồn tại!");return;}
      const newUser={...formNoPw};
      const ok = dbUpsertUser ? await dbUpsertUser(newUser) : true;
      if(!ok){ fl("⚠️ Lưu lên máy chủ THẤT BẠI — tài khoản CHƯA được tạo, vui lòng thử lại!"); return; }
      const {error:pwErr}=await supabase.rpc("admin_set_password",{p_id:newUser.id,p_new_pw:newPw});
      if(pwErr){console.error("admin_set_password RPC error:",pwErr);fl("⚠️ Đã tạo tài khoản nhưng ĐẶT MẬT KHẨU thất bại — hãy sửa lại mật khẩu!");}
      setUsers(l=>[...l,newUser]);
      fl("✓ Đã thêm tài khoản");
    }
    setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧",is_admin:false,email:"",mfa_required:false});setEdit(null);
  };
  const del=id=>{
    if(id===currentUser.id){fl("⚠️ Không thể xóa tài khoản đang dùng!");return;}
    if(!window.confirm("Xóa tài khoản này?"))return;
    setUsers(l=>l.filter(u=>u.id!==id));
    dbDeleteUser&&dbDeleteUser(id);
    fl("✓ Đã xóa");
  };
  const startEdit=u=>{setForm({...u});setEdit(u.id);setAddOpen(true);};
  const resetForm=()=>{setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧",is_admin:false,email:"",mfa_required:false});setEdit(null);};

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
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>{editing?"Đặt lại mật khẩu (để trống nếu không đổi)":"Mật khẩu *"}</label>
            <input value={form.pw} onChange={e=>setForm(f=>({...f,pw:e.target.value}))} style={inp} placeholder={editing?"Để trống = giữ nguyên":"Mật khẩu"}/>
          </div>
          <div>
            {/* ✅ MFA: cần email để gửi mã OTP xác thực 2 lớp khi bật "Bắt buộc MFA" bên dưới. */}
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Email (dùng để gửi mã MFA)</label>
            <input type="email" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value.trim()}))} style={inp} placeholder="ten@congty.com"/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,paddingTop:18}}>
            <input id="mfa_required_chk" type="checkbox" checked={!!form.mfa_required} onChange={e=>setForm(f=>({...f,mfa_required:e.target.checked}))} style={{width:16,height:16}}/>
            <label htmlFor="mfa_required_chk" style={{fontSize:12,fontWeight:700,color:"#374151",cursor:"pointer"}}>
              🔐 Bắt buộc xác thực 2 lớp (MFA)
            </label>
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
          <input type="checkbox" checked={!!form.is_admin} onChange={e=>setForm(f=>({...f,is_admin:e.target.checked,mfa_required:e.target.checked?true:f.mfa_required}))} style={{width:16,height:16,cursor:"pointer"}}/>
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
                      {/* ✅ BẢO MẬT: mật khẩu (đã băm) không còn được tải về client nên không thể hiển
                          thị độ dài thật — chỉ hiện chuỗi chấm cố định làm placeholder trực quan. */}
                      <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>••••••••</td>
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
export const CMS_LOAI = [
  {v:"noi_dung", l:"📝 Nội dung",     mo:"Khối văn bản (tiêu đề + mô tả) hiển thị trong app.", nhom:"noidung"},
  {v:"huong_dan", l:"📖 Hướng Dẫn Sử Dụng PM", mo:"Nội dung hướng dẫn sử dụng các chức năng trong phần mềm — hiển thị cho MỌI tài khoản ở tab \"📖 Hướng Dẫn Sử Dụng PM\". Lưu riêng ở bảng \"huong_dan_pm\" trên Supabase (xem SQL ở comment cạnh khai báo state huongDanList).", nhom:"noidung"},
  {v:"banner",   l:"🖼️ Banner",       mo:"Ảnh banner kèm tiêu đề, có thể gắn liên kết.", nhom:"noidung"},
  {v:"banner_header", l:"🏭 Banner đầu trang", mo:"Ảnh banner hiển thị ở đầu trang chọn dòng xe (đăng nhập) — thay cho ảnh mặc định. Chỉ cần bật \"Đang áp dụng\" và chọn ảnh, KHÔNG cần sửa code. Nếu có nhiều mục đang áp dụng, mục có \"Thứ tự hiển thị\" nhỏ nhất sẽ được dùng.", nhom:"noidung"},
  {v:"gate_intro", l:"🚪 Khối \"Chọn dòng xe\"", mo:"Khối \"⚡ Truy cập hệ thống chính → Bạn muốn chọn dòng xe nào?\" ở màn hình chọn dòng xe (đăng nhập) — sửa TỪNG dòng chữ, đổi màu riêng từng dòng và đổi ảnh nền cho cả khối.", nhom:"noidung"},
  {v:"layout", l:"🧭 Giao diện Sidebar & Header", mo:"Điều chỉnh kích thước thanh Sidebar (trái) và Header (trên) sau khi đăng nhập, đổi ảnh nền cho Header, và sắp xếp lại thứ tự các tab hiển thị trên Sidebar — KHÔNG cần sửa code.", nhom:"giaodien"},
  {v:"avatar",   l:"👤 Ảnh đại diện (mẫu)", mo:"Kho ảnh đại diện MẪU dùng chung, chưa gắn cho tài khoản cụ thể nào.", nhom:"giaodien"},
  {v:"tai_khoan", l:"📸 Ảnh đại diện Tài khoản", mo:"Tải và gắn TRỰC TIẾP 1 ảnh đại diện thật cho từng tài khoản đăng nhập — ảnh này sẽ hiện ngay ở góc phải thanh header (cạnh chuông thông báo) khi tài khoản đó đăng nhập.", nhom:"giaodien"},
  {v:"email_mfa", l:"📧 Email & MFA", mo:"Quản lý email nhận mã xác thực (MFA) và bật/tắt bắt buộc xác thực 2 lớp cho từng tài khoản — quản lý tập trung tất cả tài khoản admin/có quyền tại 1 nơi, không cần mở từng tài khoản trong 👥 Người dùng.", nhom:"baomat"},
  {v:"nhan", l:"🏷️ Nhãn / Tên cột", mo:"Đổi chữ hiển thị (Việt/Trung) của bất kỳ nhãn nào trong app — vd tên cột BOM (\"ĐM/1XE\", \"Vị trí\"...) — mà KHÔNG cần sửa code. Import Excel cũng tự nhận diện tên cột theo nhãn mới này.", nhom:"tuybien"},
  {v:"cot_tuy_bien", l:"🧩 Cột tùy biến", mo:"Thêm TỐI ĐA 5 cột mới vào bảng vật tư (BOM) mà KHÔNG cần sửa code hay chạy SQL — chỉ cần đặt tên, chọn kiểu (chữ/số) và bật hiển thị. Áp dụng riêng theo từng dòng xe. Cột sẽ tự hiện ở Form Thêm/Sửa, bảng danh sách, Import Excel và Xuất báo cáo.", nhom:"tuybien"},
  {v:"gop_y", l:"📬 Góp ý người dùng", mo:"Xem toàn bộ góp ý/phản hồi mà người dùng đã gửi từ tab \"💬 Góp Ý Kiến - Cải Tiến PM\".", nhom:"nhatky"},
  {v:"xoa_du_an_log", l:"🗑️ Nhật ký xóa dự án", mo:"Lịch sử các dự án đã bị XÓA ở màn \"Tổng quan\" (nút \"XÓA DA\") — ghi lại người xóa, thời gian xóa, tên dự án, dòng xe, SL xe, ngày khởi tạo, ngày hoàn thành.", nhom:"nhatky"},
];
export const CMS_E0 = {id:"", loai:"noi_dung", tieu_de:"", mo_ta:"", anh:"", lien_ket:"", thu_tu:0, an_hien:true};

// 🎨 Nhóm/khối các mục CMS — mỗi khối có nhãn, mô tả và icon 3D riêng để dễ nhận biết/quản lý.
// Thứ tự trong mảng này quyết định thứ tự hiển thị các khối trên UI (xem CMS_LOAI ở trên
// để biết mục nào thuộc khối nào, qua trường "nhom").
export const CMS_NHOM = [
  {key:"noidung",  l:"Nội dung hiển thị",     mo:"Văn bản, hướng dẫn, banner và khối \"Chọn dòng xe\" hiển thị trong app.", Icon:IconContentStack3D, mau:"#0d9488", bg:"#f0fdfa", border:"#99f6e4"},
  {key:"giaodien", l:"Giao diện & Hình ảnh",  mo:"Bố cục Sidebar/Header và ảnh đại diện (mẫu + tài khoản).",              Icon:IconLayoutDash3D,   mau:"#7c3aed", bg:"#faf5ff", border:"#e9d5ff"},
  {key:"baomat",   l:"Tài khoản & Bảo mật",   mo:"Email nhận mã xác thực (MFA) và bắt buộc 2 lớp cho từng tài khoản.",   Icon:IconShieldKey3D,    mau:"#c2410c", bg:"#fff7ed", border:"#fed7aa"},
  {key:"tuybien",  l:"Tùy biến dữ liệu",      mo:"Đổi nhãn hiển thị và thêm cột tùy biến cho bảng vật tư (BOM).",        Icon:IconPuzzleTable3D,  mau:"#0284c7", bg:"#f0f9ff", border:"#bae6fd"},
  {key:"nhatky",   l:"Phản hồi & Nhật ký",    mo:"Góp ý của người dùng và lịch sử xóa dự án.",                          Icon:IconNotebookBell3D, mau:"#b45309", bg:"#fffbeb", border:"#fde68a"},
];

// ═══════════════════════════════════════════════════════════════
// 🚪 KHỐI "CHỌN DÒNG XE" (màn hình đăng nhập độc lập) — ✅ Gộp 5 dòng chữ (tiêu đề +
// mô tả của thẻ "⚡ Truy cập hệ thống chính", nhãn "Hệ thống quản lý vật tư", tiêu đề lớn
// "Bạn muốn chọn dòng xe nào?" và mô tả bên dưới) + 1 ảnh nền thành MỘT khối CMS DUY NHẤT
// (loai:"gate_intro") để admin sửa từng dòng chữ, đổi màu riêng từng dòng, và đổi ảnh nền
// cho cả khối — KHÔNG cần sửa code. Do bảng "cms_content" chỉ có sẵn cột "mo_ta" (text),
// 5 nội dung + 5 màu được đóng gói thành 1 chuỗi JSON lưu trong CHÍNH cột "mo_ta" (không
// cần ALTER TABLE thêm cột nào) — ảnh nền lưu ở cột "anh" có sẵn. Chỉ CẦN 1 dòng DUY NHẤT
// (id cố định "gate_intro_main") — bấm "💾 Lưu" ở dưới sẽ luôn cập nhật ĐÚNG dòng đó.
export const GATE_INTRO_ID = "gate_intro_main";
// Giá trị mặc định — ĐÚNG với chữ/màu đang hiển thị cứng trong code trước khi có CMS, để
// khi admin CHƯA cấu hình gì (hoặc tắt "Đang áp dụng"), màn hình vẫn hiển thị y hệt như cũ.
export const GATE_INTRO_DEFAULTS = {
  bannerTitle:  "⚡ Truy cập hệ thống chính →",
  bannerTitleColor: "#f59e0b",
  bannerSub:    "Là hệ thống vận hành giao/nhận vật tư của các xưởng liên quan",
  bannerSubColor: "#ffffff",
  eyebrow:      "Hệ thống quản lý vật tư",
  eyebrowColor: "#2f8fff",
  heading:      "Bạn muốn chọn dòng xe nào?",
  headingColor: "#f5f9fb",
  sub:          "Chọn dòng sản phẩm để tiếp tục vào hệ thống quản lý sản xuất tương ứng.",
  subColor:     "#a6b6c0",
};
// Các dòng chữ có thể sửa — dùng để sinh form nhập liệu (label + key text + key màu) và để
// đọc lại giá trị khi hiển thị, tránh lặp code 5 lần.
export const GATE_INTRO_FIELDS = [
  {key:"bannerTitle", colorKey:"bannerTitleColor", label:"Tiêu đề thẻ \"Truy cập hệ thống chính\""},
  {key:"bannerSub",   colorKey:"bannerSubColor",   label:"Mô tả thẻ \"Truy cập hệ thống chính\""},
  {key:"eyebrow",     colorKey:"eyebrowColor",     label:"Nhãn nhỏ (VD: Hệ thống quản lý vật tư)"},
  {key:"heading",     colorKey:"headingColor",     label:"Tiêu đề lớn (VD: Bạn muốn chọn dòng xe nào?)"},
  {key:"sub",         colorKey:"subColor",         label:"Mô tả dưới tiêu đề lớn"},
];
// Đọc 1 mục CMS loai:"gate_intro" (nếu có, đang áp dụng) → trả về object đầy đủ 5 dòng chữ +
// 5 màu + ảnh nền, tự điền phần thiếu bằng GATE_INTRO_DEFAULTS (phòng khi JSON cũ thiếu field
// mới thêm sau này). Trả về {...GATE_INTRO_DEFAULTS, anh:""} nếu chưa cấu hình/đang tắt.
export function readGateIntro(cmsItems){
  const it = (cmsItems||[]).filter(x=>x.loai==="gate_intro" && x.an_hien)
    .sort((a,b)=>(a.thu_tu||0)-(b.thu_tu||0))[0];
  if(!it) return {...GATE_INTRO_DEFAULTS, anh:""};
  let parsed = {};
  try{ parsed = it.mo_ta ? JSON.parse(it.mo_ta) : {}; }catch{ parsed = {}; }
  return {...GATE_INTRO_DEFAULTS, ...parsed, anh: it.anh||""};
}

// Đọc 1 file ảnh do người dùng chọn → chuỗi base64 (data URL), TỰ ĐỘNG nén/giảm kích
// thước qua canvas trước khi lưu — vì ảnh chụp thẳng từ điện thoại thường 3-8MB, base64
// hoá xong còn nặng hơn nữa, dễ gây lưu thất bại/treo trên mạng di động yếu (đây là
// nguyên nhân phổ biến nhất của lỗi "chọn ảnh xong bấm ÁP DỤNG/LƯU mà không lưu được").
// ✅ NÉN LẶP LẠI THEO DUNG LƯỢNG THẬT: không chỉ nén 1 lần ở chất lượng cố định như trước —
// giờ giảm dần chất lượng JPEG (rồi giảm tiếp kích thước nếu vẫn còn quá nặng) cho đến khi
// dung lượng base64 thực tế nằm dưới ngưỡng an toàn truyền lên Supabase (mặc định ~700KB,
// có thể tuỳ chỉnh riêng cho từng chỗ upload qua tham số opts — VD banner Header nên siết
// chặt hơn vì ảnh này tải lại ở MỌI trang, MỌI tài khoản).
// opts: {maxDim, maxBytes, minQuality} — đều có giá trị mặc định hợp lý nếu bỏ qua.
export const readImageAsBase64 = (file, opts) => new Promise((resolve, reject) => {
  if(!file) return resolve("");
  const MAX_DIM     = (opts&&opts.maxDim)      || 1600;
  const MAX_BYTES   = (opts&&opts.maxBytes)    || 700*1024; // ~700KB — đủ nhẹ để lưu ổn định
  const MIN_QUALITY = (opts&&opts.minQuality)  || 0.45;
  const readRaw = () => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  };
  // Ước lượng dung lượng byte THẬT từ độ dài chuỗi base64 (bỏ phần header "data:...;base64,")
  const estBytes = (dataUrl) => Math.ceil((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
  try{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let {width, height} = img;
      if(width>MAX_DIM || height>MAX_DIM){
        const scale = MAX_DIM/Math.max(width,height);
        width = Math.round(width*scale); height = Math.round(height*scale);
      }
      try{
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        // Bước 1 — giảm dần CHẤT LƯỢNG JPEG (85% → 45%, mỗi bước -10%) cho tới khi đạt
        // ngưỡng dung lượng mong muốn hoặc chạm mức chất lượng sàn.
        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while(estBytes(dataUrl) > MAX_BYTES && quality > MIN_QUALITY){
          quality = Math.round((quality-0.1)*100)/100;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        // Bước 2 — nếu ảnh gốc quá lớn/quá chi tiết, giảm quality sàn vẫn còn nặng, thu nhỏ
        // tiếp kích thước (còn 75%) rồi nén lại 1 lần cuối ở chất lượng vừa phải (0.6).
        if(estBytes(dataUrl) > MAX_BYTES){
          const canvas2 = document.createElement("canvas");
          canvas2.width = Math.max(1,Math.round(width*0.75));
          canvas2.height = Math.max(1,Math.round(height*0.75));
          const ctx2 = canvas2.getContext("2d");
          ctx2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
          dataUrl = canvas2.toDataURL("image/jpeg", 0.6);
        }
        resolve(dataUrl);
      }catch(e){ readRaw(); } // canvas lỗi (hiếm) → rơi về đọc ảnh gốc, không chặn người dùng
    };
    img.onerror = () => { URL.revokeObjectURL(url); readRaw(); };
    img.src = url;
  }catch(e){ readRaw(); }
});
// ═══════════════════════════════════════════════════════════════
// 🗄️ TỐI ƯU EGRESS — Avatar: upload lên Supabase STORAGE thay vì lưu base64 trực tiếp
// trong cột "avatar" của bảng "users". Lý do đổi: base64 nặng hơn ảnh gốc ~33%, và cột
// này được tải lại NGUYÊN VĂN mỗi lần poll dữ liệu users (kể cả khi ảnh không hề đổi) —
// đây là 1 nguồn chính gây vượt quota "Egress" của Supabase. Lưu URL (chỉ ~70 ký tự)
// thay vì base64 (có thể vài trăm KB) giúp giảm gần như toàn bộ egress phát sinh từ đây.
// ⚠️ YÊU CẦU 1 LẦN DUY NHẤT: phải tạo sẵn bucket Storage tên "avatars" trên Supabase
// (Dashboard → Storage → New bucket → đặt tên đúng "avatars" → bật "Public bucket").
// Nếu bucket chưa tồn tại, hàm uploadAvatarToStorage bên dưới sẽ báo lỗi rõ ràng.
// ═══════════════════════════════════════════════════════════════

// Nén ảnh qua canvas rồi trả về Blob (thay vì chuỗi base64) — dùng logic giảm dần chất
// lượng JPEG giống hệt readImageAsBase64 ở trên, chỉ khác bước cuối xuất ra Blob để upload.
export const compressImageToBlob = (file, opts) => new Promise((resolve, reject) => {
  if(!file) return resolve(null);
  const MAX_DIM     = (opts&&opts.maxDim)      || 480;
  const MAX_BYTES   = (opts&&opts.maxBytes)    || 150*1024;
  const MIN_QUALITY = (opts&&opts.minQuality)  || 0.5;
  try{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let {width, height} = img;
      if(width>MAX_DIM || height>MAX_DIM){
        const scale = MAX_DIM/Math.max(width,height);
        width = Math.round(width*scale); height = Math.round(height*scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.85;
      const step = () => {
        canvas.toBlob((blob)=>{
          if(!blob){ reject(new Error("Không nén được ảnh")); return; }
          if(blob.size > MAX_BYTES && quality > MIN_QUALITY){
            quality = Math.round((quality-0.1)*100)/100;
            step();
          } else {
            resolve(blob);
          }
        }, "image/jpeg", quality);
      };
      step();
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Không đọc được ảnh")); };
    img.src = url;
  }catch(e){ reject(e); }
});

// Nén ảnh + upload lên bucket "avatars" (upsert theo tên file = userId) rồi trả về URL
// public. isImgAvatar() ở trên đã coi mọi chuỗi bắt đầu "http" là ảnh thật, nên URL trả
// về từ đây tương thích ngay với toàn bộ UI hiển thị avatar hiện có, không cần sửa gì thêm.
export const uploadAvatarToStorage = async (file, userId, opts) => {
  const blob = await compressImageToBlob(file, opts);
  if(!blob) return "";
  // Thêm timestamp vào tên file để phá cache trình duyệt/CDN mỗi khi đổi ảnh mới — nếu
  // giữ nguyên tên cũ, ảnh mới có thể không hiển thị ngay do trình duyệt dùng lại cache cũ.
  const path = `${userId}-${Date.now()}.jpg`;
  const {error: upErr} = await supabase.storage.from("avatars").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if(upErr){
    throw new Error(
      upErr.message?.includes("Bucket not found")
        ? "Chưa tạo bucket Storage \"avatars\" trên Supabase — vào Dashboard → Storage → New bucket → đặt tên đúng \"avatars\" → bật Public bucket."
        : upErr.message
    );
  }
  const {data} = supabase.storage.from("avatars").getPublicUrl(path);
  return data?.publicUrl || "";
};

// Ước lượng dung lượng hiển thị (KB) từ 1 chuỗi base64 data URL — dùng để báo cho admin
// biết ảnh đã nén còn bao nhiêu KB sau khi chọn, ở những chỗ upload cần minh bạch dung lượng
// (VD banner Header — ảnh tải lại ở mọi trang nên cần kiểm soát kỹ).
export function estimateBase64KB(dataUrl){
  if(!dataUrl) return 0;
  const idx = dataUrl.indexOf(",");
  const raw = idx>=0 ? dataUrl.slice(idx+1) : dataUrl;
  return Math.round((raw.length*0.75)/1024);
}

// 🚪 UI quản trị khối "Chọn dòng xe" (xem GATE_INTRO_* ở trên) — dùng readImageAsBase64 (đã
// khai báo phía trên, tự nén ảnh) cho ảnh nền, form riêng 5 dòng chữ + 5 ô chọn màu, LƯU
// GỘP thành 1 dòng CMS DUY NHẤT (id cố định GATE_INTRO_ID, loai:"gate_intro").
export function GateIntroManager({items, setItems, dbUpsertCms, dbDeleteCms}){
  const existing = items.find(x=>x.loai==="gate_intro" && x.id===GATE_INTRO_ID);
  const [form, setForm] = useState(()=>{
    let parsed = {};
    try{ parsed = existing?.mo_ta ? JSON.parse(existing.mo_ta) : {}; }catch{ parsed = {}; }
    return {...GATE_INTRO_DEFAULTS, ...parsed, anh: existing?.anh||"", an_hien: existing?.an_hien ?? true};
  });
  const [saving, setSaving] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [ok, setOk] = useState("");

  const inp={width:"100%",padding:"8px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f8fafc"};
  const lbl={display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4};
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"8px 16px"};

  const onPickImage = async(e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setImgBusy(true);
    try{
      const b64 = await readImageAsBase64(file);
      setForm(f=>({...f, anh:b64}));
    }catch(err){
      alert("⚠️ Không đọc được ảnh: "+(err.message||"lỗi không xác định"));
    }finally{
      setImgBusy(false);
    }
  };

  const onSave = async()=>{
    setSaving(true); setOk("");
    const {anh, an_hien, ...texts} = form;
    const row = {
      id: GATE_INTRO_ID, loai:"gate_intro",
      tieu_de: "Khối Chọn dòng xe (màn đăng nhập)",
      mo_ta: JSON.stringify(texts),
      anh: anh||"", lien_ket:"", thu_tu:0, an_hien,
      updated_at: new Date().toISOString(),
    };
    const okSave = await dbUpsertCms(row);
    setSaving(false);
    if(!okSave) return;
    setItems(list=>{
      const exist = list.some(x=>x.id===GATE_INTRO_ID);
      return exist ? list.map(x=>x.id===GATE_INTRO_ID?row:x) : [...list, row];
    });
    setOk("✅ Đã lưu — vào lại màn đăng nhập để xem thay đổi.");
    setTimeout(()=>setOk(""),3000);
  };

  const onResetDefault = ()=>{
    if(!window.confirm("Khôi phục lại toàn bộ chữ/màu MẶC ĐỊNH ban đầu (bỏ tuỳ chỉnh hiện tại)?")) return;
    setForm({...GATE_INTRO_DEFAULTS, anh:form.anh, an_hien:form.an_hien});
  };

  return(
    <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:12,padding:16,marginBottom:20,boxShadow:"0 1px 6px rgba(15,23,42,0.05)"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#0b2545",marginBottom:4}}>🚪 Khối "Chọn dòng xe" — màn hình đăng nhập</div>
      <div style={{fontSize:11.5,color:"#9ca3af",marginBottom:14}}>
        Sửa từng dòng chữ, đổi màu riêng từng dòng và đổi ảnh nền cho cả khối "⚡ Truy cập hệ
        thống chính → Bạn muốn chọn dòng xe nào?". Chỉ 1 khối duy nhất cho toàn hệ thống.
      </div>

      {/* Ảnh nền */}
      <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px dashed #e5e7eb"}}>
        <label style={lbl}>Ảnh nền cho cả khối (không bắt buộc — để trống dùng nền tối mặc định)</label>
        <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
          <input type="file" accept="image/*" onChange={onPickImage} disabled={imgBusy}/>
          {form.anh && (
            <div style={{position:"relative"}}>
              <img src={form.anh} alt="" style={{width:140,height:78,objectFit:"cover",borderRadius:8,border:"1.5px solid #e5e7eb"}}/>
              <button onClick={()=>setForm(f=>({...f,anh:""}))}
                style={{position:"absolute",top:-8,right:-8,width:20,height:20,borderRadius:"50%",border:"none",
                  background:"#dc2626",color:"#fff",fontSize:11,cursor:"pointer",lineHeight:"20px",padding:0}}>✕</button>
            </div>
          )}
        </div>
        {imgBusy && <div style={{fontSize:11,color:"#7c3aed",marginTop:4}}>⏳ Đang xử lý ảnh (nén/giảm kích thước)...</div>}
      </div>

      {/* 5 dòng chữ + 5 màu */}
      <div style={{display:"grid",gap:12,marginBottom:14}}>
        {GATE_INTRO_FIELDS.map(fld=>(
          <div key={fld.key} style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{flex:"1 1 220px",minWidth:180}}>
              <label style={lbl}>{fld.label}</label>
              <input style={inp} value={form[fld.key]||""} onChange={e=>setForm(f=>({...f,[fld.key]:e.target.value}))}/>
            </div>
            <div style={{width:90}}>
              <label style={lbl}>Màu chữ</label>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input type="color" value={form[fld.colorKey]||"#ffffff"} onChange={e=>setForm(f=>({...f,[fld.colorKey]:e.target.value}))}
                  style={{width:34,height:30,border:"1.5px solid #c7d2fe",borderRadius:6,padding:2,cursor:"pointer",background:"#f8fafc"}}/>
                <span style={{fontSize:10.5,color:"#9ca3af",fontFamily:"monospace"}}>{form[fld.colorKey]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#374151",marginBottom:14,cursor:"pointer"}}>
        <input type="checkbox" checked={form.an_hien} onChange={e=>setForm(f=>({...f,an_hien:e.target.checked}))}/>
        Đang áp dụng (bật = dùng nội dung/màu/ảnh tuỳ chỉnh ở trên; tắt = quay về mặc định gốc)
      </label>

      {ok&&<div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#065f46",marginBottom:12}}>{ok}</div>}

      <div style={{display:"flex",gap:8}}>
        <button onClick={onSave} disabled={saving||imgBusy}
          style={{...btn,background:"#0b2545",color:"#fff",opacity:(saving||imgBusy)?0.6:1}}>
          {saving ? "Đang lưu..." : imgBusy ? "⏳ Đang xử lý ảnh..." : "💾 Lưu"}
        </button>
        <button onClick={onResetDefault} style={{...btn,background:"#f1f5f9",color:"#374151"}}>↺ Khôi phục mặc định</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🧭 KHỐI "GIAO DIỆN SIDEBAR & HEADER" — cho phép admin (qua CMS) tự chỉnh: kích thước
// thanh Sidebar (trái) + thanh Header (trên) SAU KHI ĐĂNG NHẬP, đổi ảnh nền cho Header, và
// sắp xếp lại thứ tự hiển thị các tab trên Sidebar — KHÔNG cần sửa code. Lưu GỘP thành 1
// dòng CMS DUY NHẤT (id cố định APP_LAYOUT_ID, loai:"app_layout"), giống hệt cách làm của
// "gate_intro" ở trên: các số đo + danh sách thứ tự tab được đóng gói JSON trong cột
// "mo_ta", ảnh nền Header lưu ở cột "anh" có sẵn.
export const APP_LAYOUT_ID = "app_layout_main";
export const APP_LAYOUT_DEFAULTS = {
  sidebarWidthMobile:  92,   // Bề rộng Sidebar khi màn hình < 1024px (điện thoại/máy tính bảng)
  sidebarWidthDesktop: 117,  // Bề rộng Sidebar khi màn hình 1024–1439px
  sidebarWidthWide:    225,  // Bề rộng Sidebar khi màn hình ≥ 1440px
  headerHeightMobile:  64,   // Chiều cao Header khi màn hình < 1024px
  headerHeightDesktop: 88,   // Chiều cao Header khi màn hình ≥ 1024px
  tabOrder: [],              // Thứ tự khoá tab tuỳ chỉnh trên Sidebar — rỗng = dùng thứ tự mặc định
};
// Nhãn (icon + chữ) của TẤT CẢ tab có thể xuất hiện trên Sidebar — CHỈ dùng để hiển thị
// danh sách sắp xếp thứ tự bên trong CMS, KHÔNG dùng để đổi chữ hiển thị thật trên Sidebar
// (chữ thật vẫn lấy qua t("tab_xxx") như cũ — xem mục "🏷️ Nhãn / Tên cột" nếu muốn đổi chữ).
// Thứ tự khai báo bên dưới cũng chính là THỨ TỰ MẶC ĐỊNH khi admin chưa tuỳ chỉnh gì.
export const ALL_TAB_LABELS_MAP = {
  ds:"📦 Vật tư", soan:"📋 Soạn Hàng", duyet:"✅ Kiểm Tra Xác Nhận", pgn:"📄 Phiếu GN",
  bc:"📈 Báo Cáo", hoanthanh:"🏁 Dự Án Đã Hoàn Thành Vật Tư", bom_mau:"🗂️ Tạo BOM Mẫu",
  users:"👥 Phân Quyền Sử Dụng", gopy:"💬 Góp Ý Kiến - Cải Tiến PM",
  huongdan:"📖 Hướng Dẫn Sử Dụng PM", cms:"🖼️ Quản Trị CMS",
};
export const ALL_TAB_KEYS_DEFAULT_ORDER = Object.keys(ALL_TAB_LABELS_MAP);
// Đọc 1 mục CMS loai:"app_layout" (nếu có, đang áp dụng) → trả về object đầy đủ số đo +
// thứ tự tab, tự điền phần thiếu bằng APP_LAYOUT_DEFAULTS (phòng khi JSON cũ thiếu field
// mới thêm sau này). Trả về {...APP_LAYOUT_DEFAULTS, headerBg:""} nếu admin chưa cấu
// hình/đang tắt — giao diện hiển thị y hệt như trước khi có tính năng này.
export function readAppLayout(cmsItems){
  const it = (cmsItems||[]).find(x=>x.loai==="app_layout" && x.id===APP_LAYOUT_ID);
  if(!it || !it.an_hien) return {...APP_LAYOUT_DEFAULTS, headerBg:""};
  let parsed = {};
  try{ parsed = it.mo_ta ? JSON.parse(it.mo_ta) : {}; }catch{ parsed = {}; }
  return {...APP_LAYOUT_DEFAULTS, ...parsed, headerBg: it.anh||""};
}

// 🧭 UI quản trị khối "Giao diện Sidebar & Header" — dùng readImageAsBase64 (đã khai báo
// phía trên, tự nén ảnh) cho ảnh nền Header, form nhập số đo + kéo thứ tự tab bằng nút
// ▲/▼, LƯU GỘP thành 1 dòng CMS DUY NHẤT (id cố định APP_LAYOUT_ID, loai:"app_layout").
export function AppLayoutManager({items, setItems, dbUpsertCms, dbDeleteCms}){
  const existing = items.find(x=>x.loai==="app_layout" && x.id===APP_LAYOUT_ID);
  const [form, setForm] = useState(()=>{
    let parsed = {};
    try{ parsed = existing?.mo_ta ? JSON.parse(existing.mo_ta) : {}; }catch{ parsed = {}; }
    const merged = {...APP_LAYOUT_DEFAULTS, ...parsed};
    if(!merged.tabOrder || !merged.tabOrder.length) merged.tabOrder = [...ALL_TAB_KEYS_DEFAULT_ORDER];
    return {...merged, headerBg: existing?.anh||"", an_hien: existing?.an_hien ?? false};
  });
  const [saving, setSaving] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [ok, setOk] = useState("");

  const inp={width:"100%",padding:"8px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f8fafc"};
  const lbl={display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4};
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"8px 16px"};

  const setNum = (key)=>(e)=>{
    const v = parseInt(e.target.value,10);
    setForm(f=>({...f,[key]: isNaN(v)?"":v}));
  };

  const onPickImage = async(e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setImgBusy(true);
    try{
      // ✅ Ảnh nền Header tải lại ở MỌI trang cho MỌI tài khoản → siết ngưỡng dung lượng
      // chặt hơn mặc định (còn ~450KB thay vì ~700KB) để trang tải nhanh, đỡ hao dữ liệu di
      // động, đồng thời tránh lưu thất bại do payload quá nặng lên Supabase.
      const b64 = await readImageAsBase64(file, {maxBytes:450*1024});
      setForm(f=>({...f, headerBg:b64}));
    }catch(err){
      alert("⚠️ Không đọc được ảnh: "+(err.message||"lỗi không xác định"));
    }finally{
      setImgBusy(false);
    }
  };

  const moveTab = (idx, dir)=>{
    setForm(f=>{
      const arr = [...f.tabOrder];
      const j = idx+dir;
      if(j<0 || j>=arr.length) return f;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return {...f, tabOrder:arr};
    });
  };

  const onSave = async()=>{
    setSaving(true); setOk("");
    const {headerBg, an_hien, ...rest} = form;
    // Kiểm tra hợp lệ nhẹ — nếu người dùng xoá trắng ô số, tự trả về mặc định gốc để tránh
    // lưu giá trị rỗng làm vỡ layout.
    const safe = {...rest};
    Object.keys(APP_LAYOUT_DEFAULTS).forEach(k=>{
      if(k==="tabOrder") return;
      if(!safe[k] || safe[k]<=0) safe[k]=APP_LAYOUT_DEFAULTS[k];
    });
    const row = {
      id: APP_LAYOUT_ID, loai:"app_layout",
      tieu_de: "Giao diện Sidebar & Header",
      mo_ta: JSON.stringify(safe),
      anh: headerBg||"", lien_ket:"", thu_tu:0, an_hien,
      updated_at: new Date().toISOString(),
    };
    const okSave = await dbUpsertCms(row);
    setSaving(false);
    if(!okSave) return;
    setItems(list=>{
      const exist = list.some(x=>x.id===APP_LAYOUT_ID);
      return exist ? list.map(x=>x.id===APP_LAYOUT_ID?row:x) : [...list, row];
    });
    setForm(f=>({...f, ...safe}));
    setOk("✅ Đã lưu — áp dụng ngay trên toàn hệ thống.");
    setTimeout(()=>setOk(""),3000);
  };

  const onResetDefault = ()=>{
    if(!window.confirm("Khôi phục lại toàn bộ kích thước & thứ tự tab MẶC ĐỊNH ban đầu (giữ nguyên ảnh nền Header đang chọn)?")) return;
    setForm(f=>({...APP_LAYOUT_DEFAULTS, tabOrder:[...ALL_TAB_KEYS_DEFAULT_ORDER], headerBg:f.headerBg, an_hien:f.an_hien}));
  };

  return(
    <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:12,padding:16,marginBottom:20,boxShadow:"0 1px 6px rgba(15,23,42,0.05)"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#0b2545",marginBottom:4}}>🧭 Giao diện Sidebar & Header</div>
      <div style={{fontSize:11.5,color:"#9ca3af",marginBottom:14}}>
        Điều chỉnh bề rộng thanh Sidebar (trái) và chiều cao thanh Header (trên) sau khi đăng
        nhập, đổi ảnh nền Header, và sắp xếp lại thứ tự các tab hiển thị trên Sidebar. Chỉ 1
        cấu hình duy nhất cho toàn hệ thống.
      </div>

      {/* Kích thước Sidebar */}
      <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px dashed #e5e7eb"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#0b2545",marginBottom:8}}>📐 Bề rộng thanh Sidebar (px)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
          <div>
            <label style={lbl}>Điện thoại (&lt; 1024px)</label>
            <input style={inp} type="number" min={60} max={400} value={form.sidebarWidthMobile} onChange={setNum("sidebarWidthMobile")}/>
          </div>
          <div>
            <label style={lbl}>Máy tính (1024–1439px)</label>
            <input style={inp} type="number" min={60} max={400} value={form.sidebarWidthDesktop} onChange={setNum("sidebarWidthDesktop")}/>
          </div>
          <div>
            <label style={lbl}>Màn hình rộng (≥ 1440px)</label>
            <input style={inp} type="number" min={60} max={400} value={form.sidebarWidthWide} onChange={setNum("sidebarWidthWide")}/>
          </div>
        </div>
      </div>

      {/* Kích thước Header */}
      <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px dashed #e5e7eb"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#0b2545",marginBottom:8}}>📐 Chiều cao thanh Header (px)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
          <div>
            <label style={lbl}>Điện thoại (&lt; 1024px)</label>
            <input style={inp} type="number" min={48} max={200} value={form.headerHeightMobile} onChange={setNum("headerHeightMobile")}/>
          </div>
          <div>
            <label style={lbl}>Máy tính (≥ 1024px)</label>
            <input style={inp} type="number" min={48} max={200} value={form.headerHeightDesktop} onChange={setNum("headerHeightDesktop")}/>
          </div>
        </div>
      </div>

      {/* Ảnh nền Header */}
      <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px dashed #e5e7eb"}}>
        <label style={lbl}>Ảnh nền cho thanh Header (không bắt buộc — để trống dùng nền gradient xanh mặc định)</label>
        <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
          <input type="file" accept="image/*" onChange={onPickImage} disabled={imgBusy}/>
          {form.headerBg && (
            <div style={{position:"relative"}}>
              <img src={form.headerBg} alt="" style={{width:160,height:60,objectFit:"cover",borderRadius:8,border:"1.5px solid #e5e7eb"}}/>
              <button onClick={()=>setForm(f=>({...f,headerBg:""}))}
                style={{position:"absolute",top:-8,right:-8,width:20,height:20,borderRadius:"50%",border:"none",
                  background:"#dc2626",color:"#fff",fontSize:11,cursor:"pointer",lineHeight:"20px",padding:0}}>✕</button>
              <div style={{fontSize:10,color:"#16a34a",marginTop:4,textAlign:"center"}}>✅ Đã nén còn ~{estimateBase64KB(form.headerBg)}KB</div>
            </div>
          )}
        </div>
        {imgBusy && <div style={{fontSize:11,color:"#7c3aed",marginTop:4}}>⏳ Đang nén ảnh (giảm kích thước/chất lượng)...</div>}
        {/* 🔍 Xem trước Header THẬT — dùng ĐÚNG công thức phủ gradient như Header thật đang
            render (xem đoạn "background: appLayout.headerBg ? ..." trong App) để admin thấy
            ngay ảnh sẽ hiển thị ra sao SAU KHI LƯU, không cần thoát ra kiểm tra thanh Header. */}
        <div style={{marginTop:12}}>
          <label style={lbl}>Xem trước (giống hệt thanh Header thật)</label>
          <div style={{
            height:56,borderRadius:8,overflow:"hidden",display:"flex",alignItems:"center",gap:10,padding:"0 14px",
            background: form.headerBg
              ? `url("${form.headerBg}")`
              : "linear-gradient(110deg,#06285F,#125BC0)",
            backgroundSize:"cover", backgroundPosition:"center"}}>
            <div style={{width:30,height:24,borderRadius:6,background:"#fff"}}/>
            <span style={{color:"#fff",fontWeight:700,fontSize:13}}>Quản Lý Vật Tư BOM</span>
          </div>
        </div>
      </div>

      {/* Thứ tự tab trên Sidebar */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:800,color:"#0b2545",marginBottom:4}}>🔀 Thứ tự hiển thị tab trên Sidebar</div>
        <div style={{fontSize:11,color:"#9ca3af",marginBottom:10}}>Dùng nút ▲ / ▼ để sắp xếp lại — áp dụng cho MỌI tài khoản đăng nhập (tab nào tài khoản đó chưa được cấp quyền vẫn hiện mờ theo đúng vị trí đã sắp xếp).</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {form.tabOrder.map((k,idx)=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:10,background:"#f8fafc",border:"1.5px solid #e5e7eb",borderRadius:8,padding:"8px 12px"}}>
              <span style={{fontSize:11,fontWeight:800,color:"#9ca3af",width:20}}>{idx+1}</span>
              <span style={{flex:1,fontSize:13,fontWeight:600,color:"#374151"}}>{ALL_TAB_LABELS_MAP[k]||k}</span>
              <button onClick={()=>moveTab(idx,-1)} disabled={idx===0}
                style={{...btn,padding:"4px 9px",background:"#fff",border:"1.5px solid #cbd5e1",color:"#374151",opacity:idx===0?.35:1}}>▲</button>
              <button onClick={()=>moveTab(idx,1)} disabled={idx===form.tabOrder.length-1}
                style={{...btn,padding:"4px 9px",background:"#fff",border:"1.5px solid #cbd5e1",color:"#374151",opacity:idx===form.tabOrder.length-1?.35:1}}>▼</button>
            </div>
          ))}
        </div>
      </div>

      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#374151",marginBottom:14,cursor:"pointer"}}>
        <input type="checkbox" checked={form.an_hien} onChange={e=>setForm(f=>({...f,an_hien:e.target.checked}))}/>
        Đang áp dụng (bật = dùng kích thước/ảnh nền/thứ tự tuỳ chỉnh ở trên; tắt = quay về mặc định gốc)
      </label>

      {ok&&<div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#065f46",marginBottom:12}}>{ok}</div>}

      <div style={{display:"flex",gap:8}}>
        <button onClick={onSave} disabled={saving||imgBusy}
          style={{...btn,background:"#0b2545",color:"#fff",opacity:(saving||imgBusy)?0.6:1}}>
          {saving ? "Đang lưu..." : imgBusy ? "⏳ Đang xử lý ảnh..." : "💾 Lưu"}
        </button>
        <button onClick={onResetDefault} style={{...btn,background:"#f1f5f9",color:"#374151"}}>↺ Khôi phục mặc định</button>
      </div>
    </div>
  );
}

export function AccountAvatarManager({users, setUsers, dbUpsertUser}){
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
      // ✅ TỐI ƯU EGRESS: upload lên Supabase Storage (bucket "avatars"), lưu URL vào
      // cột "avatar" thay vì lưu base64 trực tiếp — xem giải thích chi tiết tại khai báo
      // hàm uploadAvatarToStorage ở trên.
      const url = await uploadAvatarToStorage(file, u.id);
      if(!url){ setBusyId(""); return; }
      const updated = {...u, avatar:url};
      const ok = await dbUpsertUser(updated);
      if(ok) setUsers(list=>list.map(x=>x.id===u.id?updated:x));
    }catch(err){
      alert("⚠️ Không tải được ảnh lên: "+(err.message||"lỗi không xác định"));
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

// ═══════════════════════════════════════════════════════════════
//  📧 AccountEmailMfaManager — quản lý TẬP TRUNG email nhận mã MFA + bật/tắt bắt buộc
//  xác thực 2 lớp cho từng tài khoản, ngay trong "Quản Trị CMS" (thay vì phải mở từng
//  tài khoản trong 👥 Người dùng). Dùng lại nguyên field "email"/"mfa_required" đã có
//  sẵn trên bảng "users" (xem mfa_setup.sql) — không cần bảng/cột mới nào khác.
// ═══════════════════════════════════════════════════════════════
export function AccountEmailMfaManager({users, setUsers, dbUpsertUser}){
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState("");
  const [drafts, setDrafts] = useState({}); // {id:{email,mfa_required}} — thay đổi CHƯA lưu
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"7px 14px"};
  const inp={padding:"7px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:12.5,outline:"none",fontFamily:"inherit",background:"#f8fafc",width:"100%",boxSizing:"border-box"};

  const list = (users||[]).filter(u=>{
    const s=q.trim().toLowerCase();
    if(!s) return true;
    return u.ten.toLowerCase().includes(s) || u.id.toLowerCase().includes(s) || (u.don_vi||"").toLowerCase().includes(s);
  }).sort((a,b)=> (b.mfa_required?1:0)-(a.mfa_required?1:0) || a.ten.localeCompare(b.ten));

  const getDraft = (u) => drafts[u.id] || {email:u.email||"", mfa_required:!!u.mfa_required};
  const setDraft = (id, patch) => setDrafts(d=>({...d, [id]:{...getDraft({id,email:"",mfa_required:false}), ...(d[id]||{}), ...patch}}));

  const save = async(u)=>{
    const draft = getDraft(u);
    const email = (draft.email||"").trim();
    if(draft.mfa_required && !email){
      alert(`⚠️ Tài khoản "${u.ten}" cần có email trước khi bật "Bắt buộc MFA" — nếu không sẽ không đăng nhập được!`);
      return;
    }
    setBusyId(u.id);
    const updated = {...u, email, mfa_required:!!draft.mfa_required};
    const ok = await dbUpsertUser(updated);
    setBusyId("");
    if(!ok){ alert("⚠️ Lưu thất bại, vui lòng thử lại!"); return; }
    setUsers(list=>list.map(x=>x.id===u.id?updated:x));
    setDrafts(d=>{ const n={...d}; delete n[u.id]; return n; });
  };

  return(
    <div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"10px 12px"}}>
        📧 Nhập email cho từng tài khoản để hệ thống gửi mã xác thực (MFA) khi đăng nhập, và tick <b>"🔐 Bắt buộc MFA"</b> cho tài khoản cần bảo vệ thêm (admin, tài khoản có quyền thêm/sửa/xoá...). Tài khoản đã bật MFA nhưng CHƯA có email sẽ bị chặn đăng nhập kèm cảnh báo.
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔎 Tìm theo tên / ID / đơn vị..."
        style={{width:"100%",padding:"9px 12px",border:"1.5px solid #c7d2fe",borderRadius:8,fontSize:13,marginBottom:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
      <div style={{display:"grid",gap:8}}>
        {list.length===0 && <div style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:24}}>Không tìm thấy tài khoản.</div>}
        {list.map(u=>{
          const draft = getDraft(u);
          const changed = draft.email!==(u.email||"") || !!draft.mfa_required!==!!u.mfa_required;
          const missingEmail = u.mfa_required && !u.email;
          return (
            <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,background:missingEmail?"#fef2f2":"#fff",border:missingEmail?"1.5px solid #fecaca":"1.5px solid #e5e7eb",borderRadius:10,padding:10,flexWrap:"wrap"}}>
              <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:"1.5px solid #e5e7eb"}}>
                {isImgAvatar(u.avatar) ? <img src={u.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (u.avatar||"👤")}
              </div>
              <div style={{minWidth:110}}>
                <div style={{fontWeight:700,fontSize:12.5,color:"#0b2545"}}>{u.ten}{isAdminAccount(u)&&" 🛡️"}</div>
                <div style={{fontSize:10.5,color:"#9ca3af",fontFamily:"monospace"}}>{u.id} · {u.don_vi}</div>
              </div>
              <div style={{flex:1,minWidth:180}}>
                <input type="email" value={draft.email} onChange={e=>setDraft(u.id,{email:e.target.value})}
                  placeholder="ten@congty.com" style={inp}/>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",whiteSpace:"nowrap"}}>
                <input type="checkbox" checked={!!draft.mfa_required} onChange={e=>setDraft(u.id,{mfa_required:e.target.checked})} style={{width:15,height:15,cursor:"pointer"}}/>
                <span style={{fontSize:11.5,fontWeight:700,color:"#374151"}}>🔐 Bắt buộc MFA</span>
              </label>
              {missingEmail && !changed && <span style={{fontSize:11,fontWeight:700,color:"#dc2626"}}>⚠️ Thiếu email!</span>}
              {changed && (
                <button onClick={()=>save(u)} disabled={busyId===u.id} style={{...btn,background:"#0b2545",color:"#fff",opacity:busyId===u.id?.6:1}}>
                  {busyId===u.id?"Đang lưu...":"💾 Lưu"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  🏷️ LabelManager — GIAI ĐOẠN 1: admin đổi nhãn hiển thị (vi/zh) của bất kỳ key
//  nào trong APP_I18N, lưu vào bảng "app_labels", KHÔNG cần sửa code. Nhãn được lưu
//  RIÊNG theo từng dòng xe (minibus/12m/citybus...) — đổi nhãn ở dòng xe nào chỉ ảnh
//  hưởng dòng xe đó, không lan sang các dòng khác. Ưu tiên hiện sẵn danh sách các nhãn
//  liên quan trực tiếp đến CỘT BOM (IMPORT_FIELD_LABEL_KEYS) lên đầu vì đây là nhu cầu
//  hay gặp nhất; các nhãn khác gộp theo nhóm, tìm bằng ô tìm kiếm.
// ═══════════════════════════════════════════════════════════════
export function LabelManager({labelOverrides, setLabelOverrides, dbUpsertLabel, dbDeleteLabel, activeLine}){
  // Dòng xe đang SỬA nhãn trong màn CMS này — mặc định = dòng xe admin đang xem ở app,
  // nhưng admin có thể đổi sang dòng khác ngay tại đây để sửa nhãn cho dòng đó mà
  // KHÔNG cần thoát ra màn chính để chuyển dòng xe.
  const [editLine, setEditLine] = useState(activeLine || "minibus");
  const [q, setQ] = useState("");
  const [busyKey, setBusyKey] = useState(null);
  const [draft, setDraft] = useState({}); // {key:{vi,zh}} — đang gõ dở, chưa lưu, riêng theo editLine

  const inp={width:"100%",padding:"7px 9px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f8fafc"};
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"7px 14px"};

  // Đổi dòng xe đang sửa → xóa nháp cũ (tránh lưu nhầm nháp của dòng xe A sang dòng xe B)
  const onChangeEditLine = (id) => { setEditLine(id); setDraft({}); };

  const overridesOfLine = labelOverrides[editLine] || {};

  // Danh sách "cột BOM" ưu tiên hiện lên đầu — lấy trực tiếp từ IMPORT_FIELD_LABEL_KEYS
  // để LUÔN đồng bộ với danh sách field mà hàm Import Excel đang nhận diện theo nhãn.
  const bomKeys = [...new Set(Object.values(IMPORT_FIELD_LABEL_KEYS).flat())];
  // Danh sách nhãn menu sidebar — hiện ưu tiên nhóm riêng, dễ tìm hơn là gộp vào 200+
  // nhãn khác. Xem SIDEBAR_LABEL_KEYS để biết phạm vi ảnh hưởng chính xác của nhóm này.
  const sidebarKeys = SIDEBAR_LABEL_KEYS;
  const priorityKeys = [...new Set([...bomKeys, ...sidebarKeys])];
  const allKeys = Object.keys(APP_I18N);
  const otherKeys = allKeys.filter(k=>!priorityKeys.includes(k));

  const norm = s => (s||"").toLowerCase();
  const matchQ = k => {
    if(!q.trim()) return true;
    const cur = overridesOfLine[k]?.vi || APP_I18N[k]?.vi || "";
    return norm(k).includes(norm(q)) || norm(cur).includes(norm(q));
  };

  const getVal = (k, field) => draft[k]?.[field] ?? overridesOfLine[k]?.[field] ?? APP_I18N[k]?.[field] ?? "";
  const setDraftVal = (k, field, val) => setDraft(d=>({...d, [k]:{vi:getVal(k,"vi"),zh:getVal(k,"zh"), ...d[k], [field]:val}}));

  const onSave = async(k)=>{
    const vi = getVal(k,"vi"), zh = getVal(k,"zh");
    if(!vi.trim()){ alert("⚠️ Nhãn tiếng Việt không được để trống."); return; }
    setBusyKey(k);
    const ok = await dbUpsertLabel({key:k, dong_xe:editLine, vi, zh, updated_at:new Date().toISOString()});
    setBusyKey(null);
    if(!ok) return;
    setLabelOverrides(m=>({...m, [editLine]:{...(m[editLine]||{}), [k]:{vi,zh}}}));
    setDraft(d=>{const {[k]:_, ...rest}=d; return rest;});
  };

  const onReset = async(k)=>{
    if(!confirm(`Khôi phục nhãn gốc cho "${k}" (dòng xe ${nhanDongXe(editLine).text})? (Xóa nhãn tùy chỉnh đã lưu trên CMS cho riêng dòng xe này)`)) return;
    setBusyKey(k);
    const ok = await dbDeleteLabel(k, editLine);
    setBusyKey(null);
    if(!ok) return;
    setLabelOverrides(m=>{
      const cur={...(m[editLine]||{})};
      delete cur[k];
      return {...m, [editLine]:cur};
    });
    setDraft(d=>{const {[k]:_, ...rest}=d; return rest;});
  };

  const Row = (k) => {
    const isOverridden = !!overridesOfLine[k];
    const isDirty = !!draft[k];
    return (
      <div key={k} style={{display:"flex",alignItems:"flex-end",gap:8,background:"#fff",border:"1.5px solid "+(isOverridden?"#93c5fd":"#e5e7eb"),borderRadius:10,padding:10,flexWrap:"wrap",marginBottom:8}}>
        <div style={{minWidth:130,flexShrink:0}}>
          <div style={{fontSize:10,color:"#9ca3af",fontFamily:"monospace"}}>{k}</div>
          <div style={{fontSize:11,color:"#6b7280"}}>{isOverridden?"🏷️ Đã tùy chỉnh":"Mặc định gốc"}</div>
        </div>
        <div style={{flex:1,minWidth:140}}>
          <label style={{display:"block",fontSize:10,color:"#9ca3af",marginBottom:2}}>Tiếng Việt</label>
          <input style={inp} value={getVal(k,"vi")} onChange={e=>setDraftVal(k,"vi",e.target.value)}/>
        </div>
        <div style={{flex:1,minWidth:140}}>
          <label style={{display:"block",fontSize:10,color:"#9ca3af",marginBottom:2}}>Tiếng Trung</label>
          <input style={inp} value={getVal(k,"zh")} onChange={e=>setDraftVal(k,"zh",e.target.value)}/>
        </div>
        <button onClick={()=>onSave(k)} disabled={busyKey===k||!isDirty}
          style={{...btn,background:isDirty?"#1d4ed8":"#e5e7eb",color:isDirty?"#fff":"#9ca3af",opacity:busyKey===k?.6:1}}>
          {busyKey===k?"Đang lưu...":"💾 Lưu"}
        </button>
        {isOverridden && (
          <button onClick={()=>onReset(k)} disabled={busyKey===k} style={{...btn,background:"#fef2f2",color:"#dc2626",opacity:busyKey===k?.6:1}}>
            ↺ Khôi phục gốc
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>
        Đổi chữ hiển thị của bất kỳ nhãn nào trong app — <b>riêng cho từng dòng xe</b>, áp dụng ngay lập tức cho mọi màn hình, bảng, form và <b>tự động được Import Excel nhận diện theo tên cột mới</b> (với các nhãn liên quan đến cột BOM bên dưới).
      </div>

      {/* Chọn dòng xe đang sửa nhãn */}
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6}}>Sửa nhãn cho dòng xe:</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {KL_LINES.map(l=>(
            <div key={l.id} onClick={()=>onChangeEditLine(l.id)}
              style={{padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:6,
                background:editLine===l.id?nhanDongXe(l.id).mau:"#f1f5f9", color:editLine===l.id?"#fff":"#374151",
                border:editLine===l.id?`2px solid ${nhanDongXe(l.id).mau}`:"2px solid transparent"}}>
              <span>{nhanDongXe(l.id).icon}</span>{l.title}
            </div>
          ))}
        </div>
        {Object.keys(draft).length>0 && (
          <div style={{fontSize:11,color:"#d97706",marginTop:6}}>⚠️ Đang có {Object.keys(draft).length} nhãn gõ dở chưa lưu — đổi dòng xe sẽ mất phần gõ dở này.</div>
        )}
      </div>

      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔎 Tìm theo tên nhãn hoặc chữ hiển thị..."
        style={{width:"100%",padding:"9px 12px",border:"1.5px solid #c7d2fe",borderRadius:8,fontSize:13,marginBottom:16,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>

      <div style={{fontSize:13,fontWeight:800,color:"#0b2545",marginBottom:4}}>🧭 Nhãn Menu / Sidebar — dòng xe {nhanDongXe(editLine).text}</div>
      <div style={{fontSize:11,color:"#9ca3af",marginBottom:8}}>Chỉ ảnh hưởng ĐÚNG chữ hiển thị trên nút sidebar (Vật tư, Soạn hàng...) — không ảnh hưởng tiêu đề/nội dung bên trong từng trang. Áp dụng cho mọi vai trò đăng nhập.</div>
      <div style={{marginBottom:20}}>
        {sidebarKeys.filter(matchQ).map(Row)}
        {sidebarKeys.filter(matchQ).length===0 && <div style={{color:"#9ca3af",fontSize:12,padding:8}}>Không có kết quả.</div>}
      </div>

      <div style={{fontSize:13,fontWeight:800,color:"#0b2545",marginBottom:8}}>🎯 Nhãn cột BOM — dòng xe {nhanDongXe(editLine).text} (ưu tiên — Import Excel tự nhận diện theo đây)</div>
      <div style={{marginBottom:20}}>
        {bomKeys.filter(matchQ).map(Row)}
        {bomKeys.filter(matchQ).length===0 && <div style={{color:"#9ca3af",fontSize:12,padding:8}}>Không có kết quả.</div>}
      </div>

      <div style={{fontSize:13,fontWeight:800,color:"#0b2545",marginBottom:8}}>📋 Các nhãn khác trong app — dòng xe {nhanDongXe(editLine).text}</div>
      <div>
        {q.trim()
          ? otherKeys.filter(matchQ).map(Row)
          : <div style={{color:"#9ca3af",fontSize:12,padding:8}}>Gõ từ khóa vào ô tìm kiếm ở trên để tìm và sửa các nhãn khác (danh sách đầy đủ khá dài, ẩn bớt cho gọn).</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  🧩 CustomFieldManager — GIAI ĐOẠN 2: admin tự thêm tối đa 5 cột mới vào bảng vật
//  tư (o1..o5), RIÊNG theo từng dòng xe, không cần sửa code / chạy SQL. Mỗi ô gồm:
//  tên hiển thị (vi/zh), kiểu dữ liệu (chữ/số), thứ tự hiển thị, và bật/tắt hiển thị.
// ═══════════════════════════════════════════════════════════════
export function CustomFieldManager({customFieldDefs, setCustomFieldDefs, dbUpsertCustomField, activeLine}){
  const [editLine, setEditLine] = useState(activeLine || "minibus");
  const [busySlot, setBusySlot] = useState(null);
  const [draft, setDraft] = useState({}); // {slot:{...}} — đang gõ dở, chưa lưu, riêng theo editLine

  const inp={width:"100%",padding:"7px 9px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f8fafc"};
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"7px 14px"};

  const onChangeEditLine = (id) => { setEditLine(id); setDraft({}); };
  const defsOfLine = customFieldDefs[editLine] || {};

  const DEFAULT_F = {nhan_vi:"",nhan_zh:"",kieu:"text",an_hien:false,thu_tu:0};
  const getVal = (slot, field) => draft[slot]?.[field] ?? defsOfLine[slot]?.[field] ?? DEFAULT_F[field];
  const setDraftVal = (slot, field, val) => setDraft(d=>({...d, [slot]:{...DEFAULT_F, ...defsOfLine[slot], ...d[slot], [field]:val}}));

  const onSave = async(slot)=>{
    const nhan_vi = getVal(slot,"nhan_vi");
    if(getVal(slot,"an_hien") && !String(nhan_vi).trim()){
      alert("⚠️ Phải đặt tên cột (Tiếng Việt) trước khi bật hiển thị."); return;
    }
    setBusySlot(slot);
    const row = {
      dong_xe:editLine, slot,
      nhan_vi:String(nhan_vi||"").trim(), nhan_zh:String(getVal(slot,"nhan_zh")||"").trim(),
      kieu:getVal(slot,"kieu")||"text", an_hien:!!getVal(slot,"an_hien"),
      thu_tu:Number(getVal(slot,"thu_tu"))||0, updated_at:new Date().toISOString(),
    };
    const ok = await dbUpsertCustomField(row);
    setBusySlot(null);
    if(!ok) return;
    setCustomFieldDefs(m=>({...m, [editLine]:{...(m[editLine]||{}), [slot]:row}}));
    setDraft(d=>{const {[slot]:_, ...rest}=d; return rest;});
  };

  const Row = (slot, idx) => {
    const isDirty = !!draft[slot];
    const isOn = getVal(slot,"an_hien");
    return (
      <div key={slot} style={{background:"#fff",border:"1.5px solid "+(isOn?"#c4b5fd":"#e5e7eb"),borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:800,color:"#7c3aed",fontFamily:"monospace"}}>Ô {idx+1} ({slot})</span>
          <label style={{display:"flex",alignItems:"center",gap:5,marginLeft:"auto",cursor:"pointer",fontSize:12,fontWeight:700,color:isOn?"#16a34a":"#9ca3af"}}>
            <input type="checkbox" checked={isOn} onChange={e=>setDraftVal(slot,"an_hien",e.target.checked)}/>
            {isOn?"Đang hiển thị":"Đang ẩn"}
          </label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <label style={{display:"block",fontSize:10,color:"#9ca3af",marginBottom:2}}>Tên cột (Tiếng Việt)</label>
            <input style={inp} value={getVal(slot,"nhan_vi")} onChange={e=>setDraftVal(slot,"nhan_vi",e.target.value)} placeholder="VD: Trọng lượng (kg)"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:"#9ca3af",marginBottom:2}}>Tên cột (Tiếng Trung)</label>
            <input style={inp} value={getVal(slot,"nhan_zh")} onChange={e=>setDraftVal(slot,"nhan_zh",e.target.value)}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div>
            <label style={{display:"block",fontSize:10,color:"#9ca3af",marginBottom:2}}>Kiểu dữ liệu</label>
            <select style={inp} value={getVal(slot,"kieu")} onChange={e=>setDraftVal(slot,"kieu",e.target.value)}>
              <option value="text">Chữ (text)</option>
              <option value="number">Số (number)</option>
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:10,color:"#9ca3af",marginBottom:2}}>Thứ tự hiển thị</label>
            <input type="number" style={inp} value={getVal(slot,"thu_tu")} onChange={e=>setDraftVal(slot,"thu_tu",e.target.value)}/>
          </div>
        </div>
        <div style={{marginTop:10,textAlign:"right"}}>
          <button onClick={()=>onSave(slot)} disabled={busySlot===slot||!isDirty}
            style={{...btn,background:isDirty?"#7c3aed":"#e5e7eb",color:isDirty?"#fff":"#9ca3af",opacity:busySlot===slot?.6:1}}>
            {busySlot===slot?"Đang lưu...":"💾 Lưu"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>
        Thêm tối đa <b>5 cột mới</b> vào bảng vật tư (BOM) — <b>riêng cho từng dòng xe</b> — mà KHÔNG cần sửa code hay chạy SQL. Cột sẽ tự hiện ở Form Thêm/Sửa, bảng danh sách, Import Excel và Xuất báo cáo ngay khi bạn bật "Đang hiển thị" và đặt tên.
      </div>

      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6}}>Cấu hình cột tùy biến cho dòng xe:</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {KL_LINES.map(l=>(
            <div key={l.id} onClick={()=>onChangeEditLine(l.id)}
              style={{padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:6,
                background:editLine===l.id?nhanDongXe(l.id).mau:"#f1f5f9", color:editLine===l.id?"#fff":"#374151",
                border:editLine===l.id?`2px solid ${nhanDongXe(l.id).mau}`:"2px solid transparent"}}>
              <span>{nhanDongXe(l.id).icon}</span>{l.title}
            </div>
          ))}
        </div>
        {Object.keys(draft).length>0 && (
          <div style={{fontSize:11,color:"#d97706",marginTop:6}}>⚠️ Đang có {Object.keys(draft).length} ô gõ dở chưa lưu — đổi dòng xe sẽ mất phần gõ dở này.</div>
        )}
      </div>

      {SPARE_FIELD_SLOTS.map((slot,idx)=>Row(slot,idx))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  💬 GopYForm — MỌI tài khoản đều thấy & gửi được. 1 ô nhập nội dung + nút Gửi ý kiến,
//  gửi xong hiện "Xin cảm ơn vì đóng góp của bạn", nội dung lưu vào bảng "gop_y_kien"
//  để admin xem trong CMS → 📬 Góp ý người dùng.
// ═══════════════════════════════════════════════════════════════
export function GopYForm({user, activeLine, dbInsertGopY, setGopYList}){
  const [noiDung, setNoiDung] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSend = async()=>{
    if(!noiDung.trim()){ alert("⚠️ Vui lòng nhập nội dung góp ý trước khi gửi."); return; }
    setSending(true);
    const row = {
      id: "gy_"+Date.now(),
      noi_dung: noiDung.trim(),
      nguoi_gui: user?.ten || user?.id || "",
      don_vi: user?.don_vi || "",
      dong_xe: activeLine || "",
      thoi_gian: new Date().toISOString(),
      da_xem: false,
    };
    const ok = await dbInsertGopY(row);
    setSending(false);
    if(!ok) return;
    setGopYList(list=>[row, ...list]);
    setNoiDung("");
    setSent(true);
  };

  if(sent){
    return (
      <div style={{padding:"48px 16px",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:14}}>🙏</div>
        <div style={{fontSize:19,fontWeight:800,color:"#0b2545",marginBottom:8}}>Xin cảm ơn vì đóng góp của bạn!</div>
        <div style={{fontSize:13,color:"#6b7280",marginBottom:22}}>Ý kiến của bạn đã được gửi đến quản trị viên để xem xét cải tiến phần mềm.</div>
        <button onClick={()=>setSent(false)}
          style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"9px 20px",background:"#0d9488",color:"#fff"}}>
          ✍️ Gửi thêm góp ý khác
        </button>
      </div>
    );
  }

  return (
    <div style={{padding:"16px 4px",maxWidth:620}}>
      <div style={{fontSize:18,fontWeight:800,color:"#0b2545",marginBottom:4}}>💬 Góp Ý Kiến - Cải Tiến PM</div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Bạn có góp ý gì để phần mềm tốt hơn? Mọi ý kiến (lỗi gặp phải, tính năng mong muốn, điều chưa thuận tiện...) đều được quản trị viên xem xét.</div>
      <textarea value={noiDung} onChange={e=>setNoiDung(e.target.value)} rows={7}
        placeholder="Nhập nội dung góp ý của bạn tại đây..."
        style={{width:"100%",padding:"12px 14px",border:"1.5px solid #c7d2fe",borderRadius:10,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",resize:"vertical",background:"#f8fafc"}}/>
      <div style={{marginTop:12,textAlign:"right"}}>
        <button onClick={onSend} disabled={sending}
          style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"10px 22px",
            background:"#0d9488",color:"#fff",opacity:sending?0.6:1}}>
          {sending?"Đang gửi...":"📨 Gửi ý kiến"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  📖 HuongDanView — MỌI tài khoản xem được. Hiển thị các mục đang áp dụng (an_hien) từ
//  bảng riêng "huong_dan_pm" trên Supabase, sắp theo thứ tự hiển thị — admin soạn nội
//  dung ở CMS → 📖 Hướng Dẫn Sử Dụng PM (xem SQL cạnh khai báo state huongDanList).
// ═══════════════════════════════════════════════════════════════
export function HuongDanView({huongDanList}){
  const list = (huongDanList||[]).filter(it=>it.an_hien)
    .sort((a,b)=>(a.thu_tu||0)-(b.thu_tu||0));
  return (
    <div style={{padding:"16px 4px",maxWidth:720}}>
      <div style={{fontSize:18,fontWeight:800,color:"#0b2545",marginBottom:4}}>📖 Hướng Dẫn Sử Dụng PM</div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:18}}>Tổng hợp hướng dẫn sử dụng các chức năng trong phần mềm.</div>
      {list.length===0 ? (
        <div style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:32}}>Quản trị viên chưa đăng nội dung hướng dẫn nào.</div>
      ) : list.map(it=>(
        <div key={it.id} style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:800,color:"#0b2545",marginBottom:8}}>{it.tieu_de}</div>
          {it.anh && <img src={it.anh} alt="" style={{width:"100%",maxHeight:280,objectFit:"contain",borderRadius:8,marginBottom:10,background:"#f8fafc"}}/>}
          <div style={{fontSize:13.5,color:"#374151",whiteSpace:"pre-wrap",lineHeight:1.6}}>{it.mo_ta}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  📬 FeedbackManager — admin xem toàn bộ góp ý người dùng đã gửi (mới nhất trước), tự
//  đánh dấu ĐÃ XEM khi mở màn này (dùng để tính số CHƯA XEM hiển thị như thông báo cạnh
//  icon sidebar 🖼️ CMS).
// ═══════════════════════════════════════════════════════════════
export function FeedbackManager({gopYList, setGopYList, dbMarkGopYRead}){
  const marked = useRef(false);
  useEffect(()=>{
    if(marked.current) return;
    marked.current = true;
    const unreadIds = (gopYList||[]).filter(g=>!g.da_xem).map(g=>g.id);
    if(unreadIds.length){
      dbMarkGopYRead(unreadIds).then(ok=>{
        if(ok) setGopYList(list=>list.map(g=>unreadIds.includes(g.id)?{...g,da_xem:true}:g));
      });
    }
  },[]);

  const fmtTime = (iso)=>{
    try{ const d=new Date(iso); return d.toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"}); }
    catch{ return iso||""; }
  };

  return (
    <div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>
        Toàn bộ góp ý người dùng đã gửi từ tab "💬 Góp Ý Kiến - Cải Tiến PM", mới nhất hiện trước.
      </div>
      {(!gopYList || gopYList.length===0) ? (
        <div style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:32}}>Chưa có góp ý nào.</div>
      ) : gopYList.map(g=>(
        <div key={g.id} style={{background:"#fff",border:"1.5px solid "+(g.da_xem?"#e5e7eb":"#93c5fd"),borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"#0b2545"}}>
              {g.nguoi_gui||"Ẩn danh"}{g.don_vi?` · ${g.don_vi}`:""}{g.dong_xe?` · ${nhanDongXe(g.dong_xe).text}`:""}
            </div>
            <div style={{fontSize:11,color:"#9ca3af"}}>{fmtTime(g.thoi_gian)}</div>
          </div>
          <div style={{fontSize:13.5,color:"#374151",whiteSpace:"pre-wrap",lineHeight:1.6}}>{g.noi_dung}</div>
        </div>
      ))}
    </div>
  );
}

// 🗑️ Nhật ký xóa dự án — hiển thị danh sách các dự án đã bị xóa ở màn "Tổng quan"
// (nút "XÓA DA", chỉ PHÒNG KH-TH mới xóa được). Dữ liệu lưu chung bảng "cms_content"
// với loai="xoa_du_an_log" — mo_ta chứa JSON chi tiết {nguoi_xoa, don_vi_xoa, thoi_gian_xoa,
// ten_du_an, dong_xe, sl_xe, ngay_khoi_tao, ngay_hoan_thanh}.
export function XoaDuAnLogManager({items, setItems, dbDeleteCms}){
  const logs = (items||[]).filter(x=>x.loai==="xoa_du_an_log")
    .map(x=>{ let d={}; try{ d=x.mo_ta?JSON.parse(x.mo_ta):{}; }catch{ d={}; } return {...x, d}; })
    .sort((a,b)=>String(b.d.thoi_gian_xoa||b.updated_at||"").localeCompare(String(a.d.thoi_gian_xoa||a.updated_at||"")));

  const fmtTime=(iso)=>{
    try{ const dt=new Date(iso); return dt.toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"}); }
    catch{ return iso||"—"; }
  };

  const onDelLog = async(id)=>{
    if(!window.confirm("Xóa mục nhật ký này?")) return;
    const ok = await dbDeleteCms(id);
    if(!ok) return;
    setItems(list=>list.filter(x=>x.id!==id));
  };

  return(
    <div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>
        Lịch sử toàn bộ dự án đã bị <b>XÓA</b> ở màn "Tổng quan" (nút "🗑️ XÓA DA") — mới nhất hiện trước.
      </div>
      {logs.length===0?(
        <div style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:32}}>Chưa có dự án nào bị xóa.</div>
      ):(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
            <thead>
              <tr>
                {["Người xóa","Thời gian xóa","Tên dự án","Dòng xe","SL xe","Ngày khởi tạo","Ngày hoàn thành",""].map((h,i)=>(
                  <th key={i} style={{background:"#1d4ed8",color:"#fff",fontSize:10,fontWeight:800,textTransform:"uppercase",padding:"8px 8px",textAlign:i===0||i===2?"left":"center",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((g,i)=>(
                <tr key={g.id} style={{background:i%2?"#f9fafb":"#fff"}}>
                  <td style={{fontSize:11.5,fontWeight:700,color:"#0b2545",padding:"8px",borderTop:"1px solid #f1f5f9"}}>{g.d.nguoi_xoa||"—"}{g.d.don_vi_xoa?` (${g.d.don_vi_xoa})`:""}</td>
                  <td style={{fontSize:11,color:"#374151",padding:"8px",borderTop:"1px solid #f1f5f9",textAlign:"center",whiteSpace:"nowrap"}}>{fmtTime(g.d.thoi_gian_xoa)}</td>
                  <td style={{fontSize:12,fontWeight:700,color:"#1f2937",padding:"8px",borderTop:"1px solid #f1f5f9",wordBreak:"break-word"}}>{g.d.ten_du_an||"—"}</td>
                  <td style={{fontSize:11,color:"#374151",padding:"8px",borderTop:"1px solid #f1f5f9",textAlign:"center",whiteSpace:"nowrap"}}>{g.d.dong_xe||"—"}</td>
                  <td style={{fontSize:11,color:"#374151",padding:"8px",borderTop:"1px solid #f1f5f9",textAlign:"center"}}>{g.d.sl_xe??"—"}</td>
                  <td style={{fontSize:11,color:"#374151",padding:"8px",borderTop:"1px solid #f1f5f9",textAlign:"center",whiteSpace:"nowrap"}}>{g.d.ngay_khoi_tao||"—"}</td>
                  <td style={{fontSize:11,color:"#374151",padding:"8px",borderTop:"1px solid #f1f5f9",textAlign:"center",whiteSpace:"nowrap"}}>{g.d.ngay_hoan_thanh||"—"}</td>
                  <td style={{padding:"8px",borderTop:"1px solid #f1f5f9",textAlign:"center"}}>
                    <button onClick={()=>onDelLog(g.id)} title="Xóa mục nhật ký này"
                      style={{border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:10,padding:"4px 8px",background:"#fee2e2",color:"#dc2626"}}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function CmsPanel({items, setItems, dbUpsertCms, dbDeleteCms, users, setUsers, dbUpsertUser, labelOverrides, setLabelOverrides, dbUpsertLabel, dbDeleteLabel, activeLine, customFieldDefs, setCustomFieldDefs, dbUpsertCustomField, gopYList, setGopYList, dbMarkGopYRead, huongDanList, setHuongDanList, dbUpsertHuongDan, dbDeleteHuongDan}){
  const [subTab, setSubTab] = useState("noi_dung");
  // 📖 "Hướng Dẫn Sử Dụng PM" dùng RIÊNG bảng "huong_dan_pm" (không chung với cms_content)
  // để tách biệt hẳn với các loại nội dung CMS khác — dùng lại 100% UI form/danh sách bên
  // dưới (tiêu đề/mô tả/ảnh/thứ tự/ẩn-hiện) chỉ khác nguồn dữ liệu + hàm lưu/xoá.
  const isHD = subTab==="huong_dan";
  const dataArr = isHD ? (huongDanList||[]) : items;
  const setDataArr = isHD ? setHuongDanList : setItems;
  const dbUpsertRow = isHD ? dbUpsertHuongDan : dbUpsertCms;
  const dbDeleteRow = isHD ? dbDeleteHuongDan : dbDeleteCms;
  const [form, setForm] = useState(CMS_E0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // 🖼️ FIX lỗi "chọn ảnh xong bấm ÁP DỤNG mà không lưu được": trước đây không có cờ báo
  // đang xử lý ảnh — nếu người dùng bấm ÁP DỤNG ngay sau khi chọn ảnh (trước khi đọc/nén
  // xong), form.anh vẫn rỗng → bị chặn bởi kiểm tra "chưa chọn ảnh" dù CẢM GIÁC như đã
  // chọn rồi. Giờ khoá nút Lưu/Áp dụng lại trong lúc đang xử lý ảnh để tránh nhầm lẫn này.
  const [imgBusy, setImgBusy] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  const inp={width:"100%",padding:"8px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f8fafc"};
  const lbl={display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4};
  const btn={border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"8px 16px"};

  const listOfType = dataArr.filter(it=>it.loai===subTab).sort((a,b)=>(a.thu_tu||0)-(b.thu_tu||0));

  const resetForm = () => { setForm({...CMS_E0, loai:subTab}); setEditing(false); };

  const onPickImage = async(e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setImgBusy(true);
    try{
      const b64 = await readImageAsBase64(file);
      setForm(f=>({...f, anh:b64}));
    }catch(err){
      alert("⚠️ Không đọc được ảnh: "+(err.message||"lỗi không xác định"));
    }finally{
      setImgBusy(false);
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
    const ok = await dbUpsertRow(row);
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
    setDataArr(list=>{
      const exist = list.some(x=>x.id===id);
      const merged = exist ? list.map(x=>x.id===id?row:x) : [...list, row];
      return merged.filter(x=>!oldIdsToRemove.includes(x.id));
    });
    resetForm();
  };

  const onEdit = (it)=>{ setForm(it); setEditing(true); };

  const onDelete = async(id)=>{
    const ok = await dbDeleteRow(id);
    if(!ok) return;
    setDataArr(list=>list.filter(x=>x.id!==id));
    setDelConfirm(null);
    if(form.id===id) resetForm();
  };

  return (
    <div style={{padding:"16px 4px"}}>
      <div style={{fontSize:18,fontWeight:800,color:"#0b2545",marginBottom:4}}>🖼️ CMS — Quản lý Nội dung</div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Chỉ tài khoản <b>admin</b> nhìn thấy và chỉnh sửa được khu vực này.</div>

      {/* ── Chọn loại nội dung — phân theo KHỐI (mỗi khối có icon 3D + nhãn + mô tả riêng) để
          dễ nhận biết/quản lý thay vì 1 dãy nút phẳng dài như trước. ── */}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
        {CMS_NHOM.map(nh=>{
          const mucTrongNhom=CMS_LOAI.filter(o=>o.nhom===nh.key);
          if(mucTrongNhom.length===0)return null;
          const dangONhom=mucTrongNhom.some(o=>o.v===subTab);
          return(
            <div key={nh.key} style={{background:nh.bg,border:`1.5px solid ${dangONhom?nh.mau:nh.border}`,borderRadius:14,padding:"12px 12px 12px 10px",boxShadow:dangONhom?`0 0 0 1px ${nh.mau}22`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <nh.Icon size={26}/>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:12.5,color:nh.mau}}>{nh.l}</div>
                  <div style={{fontSize:10,color:"#6b7280",lineHeight:1.3}}>{nh.mo}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {mucTrongNhom.map(o=>{
                  const soChuaXem = o.v==="gop_y" ? (gopYList||[]).filter(g=>!g.da_xem).length : 0;
                  return (
                  <div key={o.v} onClick={()=>{setSubTab(o.v); setForm({...CMS_E0, loai:o.v}); setEditing(false);}}
                    style={{position:"relative",padding:"8px 14px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12.5,
                      background:subTab===o.v?nh.mau:"#fff", color:subTab===o.v?"#fff":"#374151",
                      border:subTab===o.v?`2px solid ${nh.mau}`:"1.5px solid #e5e7eb"}}>
                    {o.l}
                    {soChuaXem>0 && (
                      <span style={{position:"absolute",top:-7,right:-7,minWidth:18,height:18,borderRadius:9,background:"#dc2626",color:"#fff",
                        fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}>
                        {soChuaXem>99?"99+":soChuaXem}
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:12,color:"#9ca3af",marginBottom:16,marginTop:-8}}>
        {CMS_LOAI.find(o=>o.v===subTab)?.mo}
      </div>

      {/* Form thêm/sửa — ẨN khi đang ở mục "📸 Ảnh đại diện Tài khoản" (dùng UI riêng: danh
          sách tài khoản thật + nút tải ảnh từng dòng), "🏷️ Nhãn / Tên cột" hoặc "🧩 Cột
          tùy biến" (mỗi mục dùng UI riêng) thay vì form chung dùng cho nội dung/banner. */}
      {subTab==="gate_intro" ? (
        <GateIntroManager items={items} setItems={setItems} dbUpsertCms={dbUpsertCms} dbDeleteCms={dbDeleteCms}/>
      ) : subTab==="layout" ? (
        <AppLayoutManager items={items} setItems={setItems} dbUpsertCms={dbUpsertCms} dbDeleteCms={dbDeleteCms}/>
      ) : subTab==="tai_khoan" ? (
        <AccountAvatarManager users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser}/>
      ) : subTab==="email_mfa" ? (
        <AccountEmailMfaManager users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser}/>
      ) : subTab==="nhan" ? (
        <LabelManager labelOverrides={labelOverrides} setLabelOverrides={setLabelOverrides} dbUpsertLabel={dbUpsertLabel} dbDeleteLabel={dbDeleteLabel} activeLine={activeLine}/>
      ) : subTab==="cot_tuy_bien" ? (
        <CustomFieldManager customFieldDefs={customFieldDefs} setCustomFieldDefs={setCustomFieldDefs} dbUpsertCustomField={dbUpsertCustomField} activeLine={activeLine}/>
      ) : subTab==="gop_y" ? (
        <FeedbackManager gopYList={gopYList} setGopYList={setGopYList} dbMarkGopYRead={dbMarkGopYRead}/>
      ) : subTab==="xoa_du_an_log" ? (
        <XoaDuAnLogManager items={items} setItems={setItems} dbDeleteCms={dbDeleteCms}/>
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
            <input type="file" accept="image/*" onChange={onPickImage} disabled={imgBusy}/>
            {imgBusy && <div style={{fontSize:11,color:"#7c3aed",marginTop:4}}>⏳ Đang xử lý ảnh (nén/giảm kích thước)...</div>}
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
          <button onClick={onSave} disabled={saving||imgBusy}
            style={{...btn,
              background: (subTab==="banner_header"&&!editing) ? "#8BC34A" : "#0b2545",
              color: (subTab==="banner_header"&&!editing) ? "#1a2e05" : "#fff",
              opacity:(saving||imgBusy)?0.6:1}}>
            {saving ? "Đang lưu..." : imgBusy ? "⏳ Đang xử lý ảnh..." : (editing ? "💾 Lưu thay đổi" : (subTab==="banner_header" ? "✅ ÁP DỤNG" : "➕ Thêm mới"))}
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
export const E0={stt:0,ma:"",ten:"",dv:"Cái",dm:1,ng:"",vt:"",jig:"",gc:"",anh:"",
  // ✅ 7 trường MỚI — chỉ áp dụng/hiển thị khi activeLine==="12m" (xem Modal thêm/sửa
  // và bảng danh sách vật tư bên dưới). Với các dòng xe khác các trường này luôn rỗng
  // và không được gửi lên Supabase (xem dbUpsertBomRows).
  ckgh:"dung_chung", px:"", dai:"", rong:"", day_kt:"", tram:"", tnxh:"",
  // 🧩 GIAI ĐOẠN 2 — 5 ô "cột dự phòng" dùng CHUNG cho MỌI dòng xe, nội dung/nhãn/kiểu/
  // ẩn-hiện do admin cấu hình riêng theo dòng xe trong CMS (xem SPARE_FIELD_SLOTS,
  // customFieldDefs). Luôn gửi lên Supabase (không phân biệt dòng xe) vì cột "tuy_bien"
  // tồn tại trên MỌI bảng bom_items* — xem SQL cạnh SPARE_FIELD_SLOTS.
  tuy_bien:{}};

// ── Thứ tự chuẩn Nguồn gốc: SUB MINI 1 → SUB MINI 2 → UB → MB → FT ──
export const DM_ORDER=["SUB MINI 1","SUB MINI 2","UB","MB","FT"];
// ✅ Nhãn 5 "trang" vật tư (tab Xưởng hàn) — mỗi trang gộp đúng 1 nhóm trong DM_ORDER,
// nhãn phụ chỉ mang tính mô tả trực quan cho người dùng (dải mã tham khảo).
export const TRANG_VT=[
  {ten:"SUB MINI 1",mo:"Vị trí SUB MINI 1"},
  {ten:"SUB MINI 2",mo:"Vị trí SUB MINI 2"},
  {ten:"UB",mo:"UB10 → UB80"},
  {ten:"MB",mo:"MB10 → MB90"},
  {ten:"FT",mo:"FT01 → FT08"},
];
export const dmPriority=(dm)=>{
  const u=String(dm||"").toUpperCase();
  for(let i=0;i<DM_ORDER.length;i++){if(u.startsWith(DM_ORDER[i]))return i;}
  return DM_ORDER.length;
};
export const sapXepDM=(a,b)=>{
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
export async function xuatExcel(rows, tenFile="BaoCao", tieuDe="Báo cáo vật tư"){
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
export const BAO_CAO_STYLE=`
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
export async function taoAnhBaoCao(htmlContent, tenFile="BaoCao", soHangMoiTrang=25){
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
export async function xuatPDF(htmlContent, tenFile="BaoCao"){
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
export async function chiaSePhieuAnh(el, vp){
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
export function ExportBar({onExcel, onPDF, shareTitle="", shareText="", label="", fluid=false, compact=false}){
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
export function KhanCapModal({items, proj, donViOptions, onClose, onSubmit, preSelectMa, activeLine}){
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
export function CanhBaoListModal({list, user, onClose, onMarkRead, onReply, onMarkReplySeen}){
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
export const CANH_BAO_BANG_THEO_DONG_XE = [
  {dong_xe:"minibus", table:"canh_bao_khan"},
  {dong_xe:"citybus", table:"canh_bao_khan_citybus"},
  {dong_xe:"12m",     table:"canh_bao_khan_12m"},
];
export function GlobalCanhBaoBell({donVi, ten, style, pollMs=20000}){
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

export function AnhModal({src,onClose}){
  if(!src)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,cursor:"zoom-out"}}>
      <img src={src} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8}} onClick={e=>e.stopPropagation()}/>
      <button onClick={onClose} style={{position:"absolute",top:16,right:20,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",fontSize:22,cursor:"pointer",borderRadius:"50%",width:36,height:36}}>✕</button>
    </div>
  );
}

export function Prog({p,done,h=8}){
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
export function SlStepper({value,onChange,warn}){
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
export function useManualOverride(){
  const ref=useRef(null);
  const isManual=(key)=>ref.current===key;
  const markManual=(key)=>{ ref.current=key; };
  const clear=()=>{ ref.current=null; };
  return {isManual,markManual,clear};
}
// ════════════════════════════════════════════════════════════════════════════
