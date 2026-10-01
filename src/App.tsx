import { useState, useMemo, useRef, useCallback, Fragment, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
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
import { supabase, SUPABASE_URL, SUPABASE_KEY } from "./supabaseClient";
import {
  Prog, SlStepper, readAppLayout, HuongDanView, LoginScreen, ScreenTopBar, VehicleIconCircle, nhanDongXe, ExportBar, LINE_IDS, readGateIntro, uploadAvatarToStorage, E0, KhanCapModal, KL_LINES,
  CanhBaoListModal, getDirectEntry, dmPriority, useManualOverride, SignaturePad, CmsPanel, getTabKeysForDonVi, TAB_QUYEN_DEFAULT, GopYForm, TAB_META, sapXepDM, AnhModal, UsersPanel, LINE_QUYEN_DEFAULT, CMS_LOAI, AppLayoutManager, TRANG_VT,
  xuatExcel, xuatPDF, chiaSePhieuAnh
} from "./panels";


// Nhận diện avatar là ẢNH THẬT (data URL đã upload / URL http) hay chỉ là 1 EMOJI mặc định
// (🏭📦👤...) — dùng ở mọi nơi hiển thị avatar (header, bảng Phân quyền, CMS...) để quyết
// định render <img> hay render text emoji.

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

// ─── Từ điển đa ngôn ngữ TOÀN APP (dùng qua LangCtx) ────────────────


// ═══════════════════════════════════════════════════════════════
// 🎨 BỘ ICON VECTOR (SVG line-art) — thay thế emoji cho khu vực header
// đăng nhập (Production System / Xin chào / 4 icon Bảo mật-Hiệu quả-
// Chính xác-Kết nối), phong cách nét mảnh đồng nhất giống ảnh mẫu.
// ═══════════════════════════════════════════════════════════════
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
  // 🏷️ Nhãn do admin đổi qua CMS (bảng "app_labels") — {key:{vi,zh}}. Rỗng nếu admin
  // chưa đổi gì hoặc bảng chưa tạo → t() tự rơi về APP_I18N mặc định, không ảnh hưởng gì.
  // Cấu trúc: {dong_xe: {key: {vi,zh}}} — MỖI DÒNG XE có bộ nhãn RIÊNG (vd nhãn "ĐM/1XE"
  // có thể đổi thành "ĐỊNH MỨC" chỉ ở dòng xe 12m, còn Mini Bus/City Bus giữ nguyên).
  const [labelOverrides, setLabelOverrides] = useState({});
  const t = k => (labelOverrides[activeLine]?.[k]?.[lang]) || (APP_I18N[k]&&APP_I18N[k][lang]) || APP_I18N[k]?.vi || k;
  // 📥 Dùng cho Import Excel/CSV: trả về TOÀN BỘ tên cột khả dĩ cho 1 field kỹ thuật —
  // gồm nhãn admin ĐANG hiển thị (đã đổi qua CMS CHO DÒNG XE ĐANG XEM, cả vi lẫn zh),
  // nhãn GỐC mặc định (để file Excel cũ theo mẫu cũ vẫn luôn import được), cộng thêm
  // danh sách viết cứng truyền vào (các biến thể tên cột hay gặp, viết hoa/thường...).
  const getImportAliases = (fieldKey, hardcodedAliases=[]) => {
    const labelKeys = IMPORT_FIELD_LABEL_KEYS[fieldKey] || [];
    const dynamic = labelKeys.flatMap(k => [
      labelOverrides[activeLine]?.[k]?.vi, labelOverrides[activeLine]?.[k]?.zh,
      APP_I18N[k]?.vi, APP_I18N[k]?.zh,
    ].filter(Boolean));
    return [...new Set([...dynamic, ...hardcodedAliases])];
  };
  // 🧩 GIAI ĐOẠN 2 — cấu hình 5 "cột dự phòng" (o1..o5), RIÊNG theo từng dòng xe.
  // Cấu trúc: {dong_xe: {slot: {nhan_vi,nhan_zh,kieu,an_hien,thu_tu}}}
  const [customFieldDefs, setCustomFieldDefs] = useState({});
  // 💬 GÓP Ý KIẾN - CẢI TIẾN PM — mọi tài khoản gửi được, admin xem trong CMS (📬 Góp ý
  // người dùng) kèm số lượng CHƯA XEM để làm thông báo. Xem SQL cạnh dbInsertGopY.
  const [gopYList, setGopYList] = useState([]);
  // Trả về danh sách slot ĐANG BẬT cho dòng xe hiện tại, đã sắp theo thứ tự hiển thị,
  // kèm nhãn đúng ngôn ngữ đang chọn — dùng cho Modal Thêm/Sửa, bảng danh sách, Export.
  const getEnabledCustomFields = (dongXe = activeLine) => {
    const defs = customFieldDefs[dongXe] || {};
    return SPARE_FIELD_SLOTS
      .map(slot => ({slot, ...(defs[slot]||{})}))
      .filter(f => f.an_hien && (f.nhan_vi||"").trim())
      .sort((a,b)=>(a.thu_tu||0)-(b.thu_tu||0))
      .map(f => ({slot:f.slot, kieu:f.kieu||"text", label:(lang==="zh"&&f.nhan_zh)?f.nhan_zh:f.nhan_vi}));
  };

  // ═══ Kích hoạt bộ dịch toàn cục theo `lang` ═══
  // Đảm bảo TOÀN BỘ chữ trên MỌI tab/màn hình/modal/thông báo (kể cả những
  // chỗ code cũ chưa kịp bọc qua t()) đều tự động chuyển tiếng Trung khi
  // lang==="zh", và tự khôi phục đúng chữ tiếng Việt gốc khi lang==="vi".
  // Đây là mảnh ghép biến việc song ngữ trở nên TRIỆT ĐỂ cho toàn phần mềm.
  useEffect(()=>{
    const toZh = lang==="zh";
    let scheduled=false;
    const runPass=()=>{ scheduled=false; walkAndTranslateDOM(document.body, toZh); };
    runPass();
    const obs=new MutationObserver(()=>{
      if(scheduled) return;
      scheduled=true;
      requestAnimationFrame(runPass);
    });
    obs.observe(document.body,{childList:true,subtree:true,characterData:true});
    // Tự dịch luôn nội dung của window.confirm()/alert() (các hộp thoại xác
    // nhận/thông báo dùng API gốc trình duyệt, không đi qua React/DOM nên
    // cần chặn riêng ở đây) khi đang ở chế độ tiếng Trung.
    const _confirm=window.confirm, _alert=window.alert;
    window.confirm=(msg)=>_confirm(toZh?translateVN2ZH(String(msg)):msg);
    window.alert=(msg)=>_alert(toZh?translateVN2ZH(String(msg)):msg);
    return ()=>{ obs.disconnect(); window.confirm=_confirm; window.alert=_alert; };
  },[lang]);
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
  // ✅ Ảnh đại diện — TỰ UPLOAD ngay tại avatar trên thanh header (KHÔNG cần admin thao tác
  // hộ qua CMS nữa). avatarUploading: đang nén/tải ảnh lên cho CHÍNH tài khoản đang đăng
  // nhập. Ảnh vẫn lưu vào ĐÚNG field "avatar" của user (bảng "users" trên Supabase) — nên
  // hiện ra ở CẢ 2 nơi: avatar header của chính họ, VÀ mục "📸 Ảnh đại diện Tài khoản" bên
  // Quản Trị CMS (admin xem/soát lại ảnh mọi tài khoản đã tự đổi).
  const [avatarUploading, setAvatarUploading] = useState(false);

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
  // 📖 Hướng Dẫn Sử Dụng PM — nội dung do admin soạn trong CMS, MỌI tài khoản xem được ở
  // tab "huongdan" (xem HuongDanView). Lưu ở bảng RIÊNG "huong_dan_pm" (không chung với
  // cms_content) để tách biệt hẳn với banner/avatar/nội dung khác. Chạy SQL sau trên
  // Supabase (SQL Editor) trước khi dùng — nếu chưa tạo, tab CMS liên quan vẫn hoạt động
  // bình thường để soạn nhưng sẽ báo lỗi khi bấm Lưu:
  //   create table huong_dan_pm (
  //     id text primary key, loai text not null default 'huong_dan',
  //     tieu_de text, mo_ta text, anh text, lien_ket text,
  //     thu_tu integer default 0, an_hien boolean default true,
  //     updated_at timestamptz default now()
  //   );
  const [huongDanList, setHuongDanList] = useState([]);
  // ✅ Banner đầu trang chọn dòng xe (đăng nhập) — lấy từ CMS (loai:"banner_header", đang áp
  // dụng, "Thứ tự hiển thị" nhỏ nhất). Rỗng ("") nếu admin chưa cấu hình → LoginScreen sẽ tự
  // hiện placeholder gradient nhẹ (không còn ảnh mặc định nhúng cứng trong code). Nhờ vậy đổi
  // banner chỉ cần vào tab CMS chọn ảnh mới, KHÔNG cần sửa code.
  const headerBannerUrl = cmsItems
    .filter(it=>it.loai==="banner_header" && it.an_hien && it.anh)
    .sort((a,b)=>(a.thu_tu||0)-(b.thu_tu||0))[0]?.anh || "";
  // 🚪 Khối "Chọn dòng xe" (5 dòng chữ + màu riêng + ảnh nền) — xem GATE_INTRO_* / readGateIntro
  // gần khai báo CMS_LOAI. Tính lại mỗi khi cmsItems đổi (admin vừa lưu ở tab CMS).
  const gateIntro = useMemo(()=>readGateIntro(cmsItems),[cmsItems]);
  // 🧭 Kích thước Sidebar/Header + ảnh nền Header + thứ tự tab — lấy từ CMS (loai:"app_layout",
  // xem AppLayoutManager / readAppLayout gần khai báo CMS_LOAI). Trả về mặc định gốc nếu
  // admin chưa cấu hình/đang tắt, nên KHÔNG ảnh hưởng giao diện khi chưa dùng tính năng này.
  const appLayout = useMemo(()=>readAppLayout(cmsItems),[cmsItems]);
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
        const [r1,r2,r3,r4,r5,r6,r7,r8,r10,r11,r12,r13,r14,r15,r16,r17]=await Promise.all([
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
          // 🏷️ GIAI ĐOẠN 1 — nhãn do admin đổi qua CMS (xem IMPORT_FIELD_LABEL_KEYS ở trên)
          supabase.from("app_labels").select("*").range(0, 9999),
          // 🧩 GIAI ĐOẠN 2 — cấu hình 5 "cột dự phòng" theo từng dòng xe
          supabase.from("bom_custom_fields").select("*").range(0, 9999),
          // 💬 Góp ý người dùng — mới nhất trước
          supabase.from("gop_y_kien").select("*").order("thoi_gian",{ascending:false}).range(0, 9999),
          // 📖 Hướng Dẫn Sử Dụng PM — bảng riêng "huong_dan_pm" (xem SQL cạnh khai báo state huongDanList)
          supabase.from("huong_dan_pm").select("*").order("thu_tu").range(0, 9999),
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
          // ⚠️ FIX LỖI "TỰ NHẢY DỰ ÁN": load() còn được gọi lại NGẦM mỗi 10 giây (xem
          // pollTimer/setInterval bên dưới) để đồng bộ dữ liệu mới — trước đây MỖI LẦN poll
          // đều ép setPid(...) lại từ localStorage/projsData[0], kể cả khi người dùng VỪA
          // MỚI tự chọn 1 dự án khác (VD trong modal "CHỌN DỰ ÁN" ở tab Phiếu GN) ngay trước
          // đó — khiến màn hình bị "nhảy ngược" về 1 dự án khác (thường là dự án đầu danh
          // sách) chỉ vài giây sau khi chọn đúng. Nay CHỈ tính lại pid từ localStorage khi
          // pid hiện tại KHÔNG còn hợp lệ (chưa từng chọn, hoặc dự án đang chọn đã bị xoá) —
          // nếu pid hiện tại vẫn tồn tại trong danh sách dự án mới tải về thì GIỮ NGUYÊN,
          // không ghi đè lựa chọn của người dùng.
          if(projsData?.length){
            setPid(prevPid=>{
              if(prevPid&&projsData.some(p=>p.id===prevPid))return prevPid; // vẫn hợp lệ — giữ nguyên
              const savedPid=localStorage.getItem("lastPid");
              const validPid=savedPid&&projsData.find(p=>p.id===savedPid)?savedPid:projsData[0].id;
              try{localStorage.setItem("lastPid",validPid);}catch{}
              return validPid;
            });
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
        // 🏷️ GIAI ĐOẠN 1 — nếu bảng "app_labels" chưa tạo, im lặng bỏ qua (t() tự rơi về
        // nhãn mặc định trong APP_I18N, không ảnh hưởng gì đến phần còn lại của app).
        if(r14.error){
          console.warn("Chưa đọc được bảng app_labels (có thể chưa tạo bảng):",r14.error.message);
        } else {
          // Cấu trúc lồng: {dong_xe: {key: {vi,zh}}} — mỗi dòng xe có bộ nhãn riêng.
          // Dòng nào chưa có cột dong_xe (dữ liệu cũ trước khi tách theo dòng xe) mặc định
          // coi là "minibus" để không mất dữ liệu đã đổi trước đó.
          const m={};
          (r14.data||[]).forEach(row=>{
            const dx=row.dong_xe||"minibus";
            if(!m[dx]) m[dx]={};
            m[dx][row.key]={vi:row.vi,zh:row.zh};
          });
          setLabelOverrides(m);
        }
        // 🧩 GIAI ĐOẠN 2 — nếu bảng "bom_custom_fields" chưa tạo, im lặng bỏ qua (không
        // có ô tùy biến nào hiện ra, không ảnh hưởng gì đến phần còn lại của app).
        if(r15.error){
          console.warn("Chưa đọc được bảng bom_custom_fields (có thể chưa tạo bảng):",r15.error.message);
        } else {
          const cf={};
          (r15.data||[]).forEach(row=>{
            if(!cf[row.dong_xe]) cf[row.dong_xe]={};
            cf[row.dong_xe][row.slot]={nhan_vi:row.nhan_vi,nhan_zh:row.nhan_zh,kieu:row.kieu,an_hien:row.an_hien,thu_tu:row.thu_tu};
          });
          setCustomFieldDefs(cf);
        }
        // 💬 GÓP Ý KIẾN — nếu bảng "gop_y_kien" chưa tạo, im lặng bỏ qua (tab vẫn hoạt
        // động bình thường để gõ, chỉ là admin sẽ không thấy danh sách cho đến khi tạo bảng).
        if(r16.error){
          console.warn("Chưa đọc được bảng gop_y_kien (có thể chưa tạo bảng):",r16.error.message);
        } else {
          setGopYList(r16.data||[]);
        }
        // 📖 Hướng Dẫn Sử Dụng PM — nếu bảng "huong_dan_pm" chưa tạo, im lặng bỏ qua (tab
        // vẫn hiển thị bình thường với thông báo "chưa có nội dung", không ảnh hưởng phần còn lại).
        if(r17.error){
          console.warn("Chưa đọc được bảng huong_dan_pm (có thể chưa tạo bảng):",r17.error.message);
        } else {
          setHuongDanList(r17.data||[]);
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
    // ✅ FIX EGRESS: trước đây 10 giây/lần — mỗi lần tải lại TOÀN BỘ ~15 bảng (users,
    // projects, bom_items, phieu, phieu_ct, lich_su, bom_mau...) cho MỌI người dùng đang
    // mở app, kể cả khi không ai sửa gì. Với nhiều người dùng mở app cùng lúc, việc này
    // gây ra lượng egress rất lớn (Supabase tính phí/giới hạn theo GB dữ liệu tải ra).
    // Giãn lên 60 giây để giảm ~6 lần số lượt tải lại mà vẫn đủ "gần thời gian thực" cho
    // nhu cầu thực tế của app (đồng bộ dữ liệu giữa các trạm/nhân viên).
    const pollTimer=setInterval(load,60000);
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
    // ✅ FIX EGRESS: giãn 20s → 30s, giảm bớt số lượt request lặp lại không cần thiết
    // (payload mỗi lần rất nhỏ nên không phải nguồn egress chính, nhưng vẫn nên giãn ra
    // cùng đợt tối ưu để giảm tổng số request/tháng).
    const iv=setInterval(beat,30000);
    return ()=>clearInterval(iv);
  },[user?.id]);

  // Polling: mỗi 30s, lấy last_active của toàn bộ user để suy ra ai đang online
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
    // ✅ FIX EGRESS: giãn 15s → 30s (chỉ lấy 2 cột id/last_active nên payload đã nhỏ sẵn,
    // giãn thêm để giảm tổng số request/tháng, cùng đợt tối ưu egress với pollTimer chính).
    const iv=setInterval(poll,30000);
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
      // Ghi mã mới bằng ĐÚNG hàm dbUpsertBomRows (dùng chung với "Thêm vào" + lúc Tạo
      // dự án mới) — đã có sẵn: chia lô, kiểm tra RLS chặn âm thầm, báo lỗi rõ theo từng lô.
      const res=await dbUpsertBomRows(pid,rows);
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
      // 🧩 GIAI ĐOẠN 2 — 5 ô "cột dự phòng" (o1..o5), gửi CHUNG cho MỌI dòng xe (khác với
      // 7 cột riêng 12m bên dưới) vì cột "tuy_bien" đã được thêm trên MỌI bảng bom_items*.
      tuy_bien:(r.tuy_bien && typeof r.tuy_bien==="object") ? r.tuy_bien : {},
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
      // ✅ FIX MỚI: nếu ghi "phieu_ct" thất bại (dù có error rõ ràng hay bị RLS chặn âm
      // thầm), TỰ ĐỘNG XÓA LUÔN dòng "phieu" vừa ghi ở trên (rollback thủ công, vì 2 lệnh
      // upsert này không nằm trong 1 transaction). Nếu không rollback, dòng "phieu" mồ côi
      // (có tong nhưng KHÔNG có phieu_ct) vẫn còn trên Supabase — lần tải dữ liệu kế tiếp
      // (chuyển tab, mở lại app...) sẽ tự động "hồi sinh" lại y hệt phiếu lỗi cũ (0 mã,
      // 0/0 duyệt) dù người dùng đã thấy báo lỗi và tưởng phiếu đã bị huỷ.
      if(ctErr||( (ctRes?.length||0)<ct.length )){
        try{ await supabase.from(T("phieu")).delete().eq("id",phData.id); }
        catch(e){ console.error("dbSavePhieu: rollback xoá phieu mồ côi thất bại:",e); }
      }
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
  // ✅ TỰ ĐỔI ảnh đại diện — dùng ngay cho MỌI tài khoản đăng nhập (không cần quyền admin),
  // bấm thẳng vào avatar ở thanh header. Nén ảnh ở MỨC THẤP NHẤT trước khi lưu (avatar chỉ
  // hiển thị ở vòng tròn nhỏ ~42px trên header nên không cần ảnh nặng/nét cao): giới hạn
  // kích thước còn tối đa 240px mỗi chiều, dung lượng mục tiêu chỉ ~35KB, chất lượng JPEG
  // có thể giảm sâu tới 30% nếu cần — nhẹ nhất có thể trong khi vẫn còn nhận diện được mặt.
  const onSelfUploadAvatar=async(file)=>{
    if(!file) return;
    setAvatarUploading(true);
    try{
      // ✅ TỐI ƯU EGRESS: upload lên Supabase Storage (bucket "avatars"), lưu URL vào
      // cột "avatar" thay vì lưu base64 trực tiếp — xem giải thích chi tiết tại khai báo
      // hàm uploadAvatarToStorage ở trên.
      const url=await uploadAvatarToStorage(file,user.id,{maxDim:240,maxBytes:35*1024,minQuality:0.3});
      if(!url){ setAvatarUploading(false); return; }
      const updated={...user,avatar:url};
      const ok=await dbUpsertUser(updated);
      if(ok){
        setUser(updated); // ✅ cập nhật avatar header của CHÍNH mình ngay lập tức
        // ✅ Đồng bộ luôn vào danh sách "users" — để mục "📸 Ảnh đại diện Tài khoản" ở
        // Quản Trị CMS (admin) hiển thị ĐÚNG ảnh mới nhất mà không cần tải lại trang.
        setUsers(list=>list.map(x=>x.id===user.id?updated:x));
        flash("✓ Đã cập nhật ảnh đại diện");
      }
    }catch(err){
      alert("⚠️ Không tải được ảnh lên: "+(err.message||"lỗi không xác định"));
    }
    setAvatarUploading(false);
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
  // 📖 Lưu/xóa 1 mục "Hướng Dẫn Sử Dụng PM" — bảng RIÊNG "huong_dan_pm" (xem SQL ở comment
  // cạnh khai báo state huongDanList).
  const dbUpsertHuongDan=async(item)=>{
    try{
      const {error}=await supabase.from("huong_dan_pm").upsert(item,{onConflict:"id"});
      if(error){
        console.error("dbUpsertHuongDan:",error);
        alert("⚠️ Lưu thất bại: "+error.message+"\n(Có thể bảng huong_dan_pm chưa được tạo trên Supabase — xem hướng dẫn SQL ở comment gần khai báo state huongDanList trong code.)");
        return false;
      }
      return true;
    }catch(e){
      console.error("dbUpsertHuongDan:",e);
      alert("⚠️ Lưu thất bại: "+(e.message||"lỗi không xác định"));
      return false;
    }
  };
  const dbDeleteHuongDan=async(id)=>{
    try{
      const {error}=await supabase.from("huong_dan_pm").delete().eq("id",id);
      if(error){
        console.error("dbDeleteHuongDan:",error);
        alert("⚠️ Xóa thất bại: "+error.message);
        return false;
      }
      return true;
    }catch(e){
      console.error("dbDeleteHuongDan:",e);
      return false;
    }
  };
  // 🏷️ GIAI ĐOẠN 1 — Lưu/xóa 1 nhãn tùy chỉnh trong bảng "app_labels", RIÊNG theo dòng
  // xe (cột dong_xe). key phải trùng đúng key trong APP_I18N (vd 'lbDM1XE') để t() và
  // getImportAliases() nhận diện được. Khóa duy nhất trên Supabase là (key, dong_xe).
  const dbUpsertLabel=async(row)=>{
    try{
      const {error}=await supabase.from("app_labels").upsert(row,{onConflict:"key,dong_xe"});
      if(error){
        console.error("dbUpsertLabel:",error);
        alert("⚠️ Lưu nhãn thất bại: "+error.message+"\n(Có thể bảng app_labels chưa được tạo/chưa có cột dong_xe trên Supabase — xem SQL ở comment cạnh IMPORT_FIELD_LABEL_KEYS trong code.)");
        return false;
      }
      return true;
    }catch(e){
      console.error("dbUpsertLabel:",e);
      alert("⚠️ Lưu nhãn thất bại: "+(e.message||"lỗi không xác định"));
      return false;
    }
  };
  const dbDeleteLabel=async(key,dongXe)=>{
    try{
      const {error}=await supabase.from("app_labels").delete().eq("key",key).eq("dong_xe",dongXe);
      if(error){
        console.error("dbDeleteLabel:",error);
        alert("⚠️ Khôi phục nhãn gốc thất bại: "+error.message);
        return false;
      }
      return true;
    }catch(e){
      console.error("dbDeleteLabel:",e);
      return false;
    }
  };
  // 🧩 GIAI ĐOẠN 2 — Lưu cấu hình 1 "ô tùy biến" (slot o1..o5) cho 1 dòng xe cụ thể vào
  // bảng "bom_custom_fields". Khóa duy nhất trên Supabase là (dong_xe, slot).
  const dbUpsertCustomField=async(row)=>{
    try{
      const {error}=await supabase.from("bom_custom_fields").upsert(row,{onConflict:"dong_xe,slot"});
      if(error){
        console.error("dbUpsertCustomField:",error);
        alert("⚠️ Lưu cột tùy biến thất bại: "+error.message+"\n(Có thể bảng bom_custom_fields chưa được tạo trên Supabase — xem SQL ở comment cạnh SPARE_FIELD_SLOTS trong code.)");
        return false;
      }
      return true;
    }catch(e){
      console.error("dbUpsertCustomField:",e);
      alert("⚠️ Lưu cột tùy biến thất bại: "+(e.message||"lỗi không xác định"));
      return false;
    }
  };
  // 💬 GÓP Ý KIẾN - CẢI TIẾN PM — bất kỳ tài khoản nào cũng gửi được (không cần quyền
  // admin), lưu vào bảng "gop_y_kien":
  //   create table gop_y_kien (
  //     id text primary key, noi_dung text not null,
  //     nguoi_gui text, don_vi text, dong_xe text,
  //     thoi_gian timestamptz default now(), da_xem boolean not null default false
  //   );
  const dbInsertGopY=async(row)=>{
    try{
      const {error}=await supabase.from("gop_y_kien").insert(row);
      if(error){
        console.error("dbInsertGopY:",error);
        alert("⚠️ Gửi ý kiến thất bại: "+error.message+"\n(Có thể bảng gop_y_kien chưa được tạo trên Supabase.)");
        return false;
      }
      return true;
    }catch(e){
      console.error("dbInsertGopY:",e);
      alert("⚠️ Gửi ý kiến thất bại: "+(e.message||"lỗi không xác định"));
      return false;
    }
  };
  // Đánh dấu ĐÃ XEM 1 loạt góp ý (dùng khi admin mở tab 📬 Góp ý người dùng trong CMS) —
  // để tính số lượng CHƯA XEM hiển thị như thông báo (badge) cạnh icon sidebar 🖼️ CMS.
  const dbMarkGopYRead=async(ids)=>{
    if(!ids.length) return true;
    try{
      const {error}=await supabase.from("gop_y_kien").update({da_xem:true}).in("id",ids);
      if(error){ console.error("dbMarkGopYRead:",error); return false; }
      return true;
    }catch(e){ console.error("dbMarkGopYRead:",e); return false; }
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

  // ✅ "XÓA DA" (xóa dự án) ở màn "Tổng quan" (Giai đoạn 2 — Đang thực hiện).
  // CHỈ tài khoản thuộc đúng đơn vị "PHÒNG KH-TH" mới được thao tác thật sự (xóa vĩnh viễn,
  // có XÁC NHẬN 2 LẦN). Mọi đơn vị/phòng ban khác (kể cả các đơn vị dùng chung role "khth"
  // như Phòng KT, Ban CN, Ban LĐNM...) chỉ thấy nút ở dạng CHÌM (mờ) — bấm vào chỉ hiện
  // thông báo không có quyền, KHÔNG xóa được gì.
  const coQuyenXoaDA = user?.don_vi==="PHÒNG KH-TH";
  const xoaDuAnGiaiDoan2=(p)=>{
    if(!coQuyenXoaDA){
      alert("Bạn không được quyền thực hiện chức năng này.");
      return;
    }
    if(!window.confirm(`⚠️ XÓA DỰ ÁN "${p.ten}"?\n\nToàn bộ dữ liệu (BOM, lịch sử giao/nhận vật tư, phiếu soạn hàng...) của dự án này sẽ bị xóa và KHÔNG THỂ khôi phục.\n\nBấm OK để tiếp tục.`)) return;
    if(!window.confirm(`XÁC NHẬN LẦN CUỐI: Xóa VĨNH VIỄN dự án "${p.ten}"?\n\nBấm OK để xóa ngay.`)) return;
    setProjs(ps=>ps.filter(x=>x.id!==p.id));
    dbDeleteProj(p.id);
    // ✅ Ghi Nhật ký xóa dự án (lưu vào "Quản trị CMS" → "🗑️ Nhật ký xóa dự án"):
    // người xóa, đơn vị, thời gian xóa, tên dự án, dòng xe, SL xe, ngày khởi tạo, ngày hoàn thành.
    const logId="xoa_du_an_log_"+Date.now();
    const logRow={
      id:logId, loai:"xoa_du_an_log",
      tieu_de:`Xóa dự án: ${p.ten}`,
      mo_ta:JSON.stringify({
        nguoi_xoa:user?.ten||user?.id||"—",
        don_vi_xoa:user?.don_vi||"—",
        thoi_gian_xoa:new Date().toISOString(),
        ten_du_an:p.ten||"—",
        dong_xe:nhanDongXe(activeLine).text||activeLine||"—",
        sl_xe:p.so_xe??"—",
        ngay_khoi_tao:p.ngay_khoi_tao||"—",
        ngay_hoan_thanh:p.ngay_hoan_thanh||"—",
      }),
      anh:"", lien_ket:"", thu_tu:0, an_hien:true,
      updated_at:new Date().toISOString(),
    };
    dbUpsertCms(logRow);
    setCmsItems(list=>[...list, logRow]);
    flash(`✓ Đã xóa dự án "${p.ten}"`);
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
          // 🏷️ helper: lấy giá trị đầu tiên khớp trong r0{} (dữ liệu 1 dòng) theo danh sách
          // alias (đã gồm cả nhãn admin đang hiển thị trên CMS + nhãn gốc + tên viết cứng
          // dự phòng). Nhận r0 làm tham số để dùng đúng dữ liệu của TỪNG dòng trong .map().
          const pick=(r0,fieldKey,hardcoded)=>{
            for(const k of getImportAliases(fieldKey,hardcoded)){
              const v=String(r0[k]||"").trim();
              if(v) return v;
            }
            return "";
          };
          const mapped=lines.slice(1).map((line,i)=>{
            const cols=line.split(",").map(c=>c.replace(/"/g,"").trim());
            const r0={};
            headers.forEach((h,j)=>{r0[h]=cols[j]||"";});
            return{
              stt:r0["STT"]||r0["stt"]||i+1,
              ma:pick(r0,"ma",["Mã số","ma","MA","id"]),
              ten:pick(r0,"ten",["Tên Vật Tư","Tên vật tư","ten","TEN","name"]),
              dv:pick(r0,"dv",["Đơn vị","ĐVT","dv"])||"Cái",
              dm:Number(pick(r0,"dm",["Định Mức","ĐM/1XE","ĐM","dm"])||1),
              ng:pick(r0,"ng",["Nguồn gốc","dmuc","Trạm"]),
              vt:pick(r0,"vt",["Vị trí","vt","Trạm"]),
              jig:String(r0["JIG"]||r0["Jig"]||r0["jig"]||"").trim(),
              gc:pick(r0,"gc",["Ghi chú","gc"]),
              // ✅ 7 cột MỚI — chỉ có ý nghĩa khi import vào dòng xe 12m (nếu file không
              // có các cột này thì để rỗng, không ảnh hưởng các dòng xe khác)
              ckgh:(()=>{const s=String(r0["Check GH29Y"]||r0["CHECK GH29Y"]||r0["ckgh"]||"").trim().toLowerCase();
                return (s.includes("riêng")||s.includes("rieng"))?"rieng":"dung_chung";})(),
              px:pick(r0,"px",["Phân xưởng","PHÂN XƯỞNG","Phan xuong","px"]),
              dai:String(r0["Dài"]||r0["DÀI"]||r0["Dai"]||r0["dai"]||"").trim(),
              rong:String(r0["Rộng"]||r0["RỘNG"]||r0["Rong"]||r0["rong"]||"").trim(),
              day_kt:String(r0["Dày"]||r0["DÀY"]||r0["Day"]||r0["day_kt"]||"").trim(),
              tram:String(r0["Trạm/Xí"]||r0["Trạm Xí"]||r0["[STT Trạm XH]"]||r0["STT Trạm XH"]||r0["Trạm XH"]||r0["tram"]||"").trim(),
              tnxh:String(r0["Trách nhiệm XH"]||r0["TRÁCH NHIỆM XH"]||r0["Trach nhiem XH"]||r0["tnxh"]||"").trim(),
              // 🧩 GIAI ĐOẠN 2 — cột tùy biến: khớp theo ĐÚNG nhãn admin đang đặt trong CMS
              // cho dòng xe hiện tại (vd cột Excel tên "Trọng lượng" → khớp slot o1 nếu
              // admin đã đặt nhãn "Trọng lượng" cho o1). Không khớp gì thì để trống.
              tuy_bien:Object.fromEntries(getEnabledCustomFields().map(f=>[f.slot, r0[f.label]||""])),
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
            // 🏷️ gg(fieldKey, ...hardcoded): như g(), nhưng ưu tiên thử TRƯỚC các tên cột
            // theo nhãn admin đang hiển thị trên CMS (kể cả sau khi đã đổi qua CMS), rồi
            // mới đến danh sách viết cứng dự phòng — nhờ vậy import không "gãy" dù nhãn
            // BOM có đổi tên hay thêm cột mới sau này.
            const gg=(fieldKey,...hardcoded)=>g(...getImportAliases(fieldKey,hardcoded));
            // Hỗ trợ cả tên cột tiếng Anh (PART NO, PART NAME) và tiếng Việt
            const ma=gg("ma","Mã số","Mã Số","MÃ VẬT TƯ","PART NO","MÃ SỐ","ma","MA","id");
            const ten=gg("ten","Tên Vật Tư","TÊN VẬT TƯ TIẾNG VIỆT","PART NAME VIETNAM","Tên vật tư","TEN VẬT TƯ","ten","TEN","name");
            return{
              stt:Number(r["STT"]||r["stt"]||r["NO."])||i+1,
              ma,ten,
              dv:gg("dv","Đơn vị","ĐVT","dv")||"Cái",
              dm:Number(gg("dm","Định Mức","ĐM/1XE","ĐỊNH MỨC/ XE","ĐM","dm")||1)||1,
              ng:gg("ng","Nguồn gốc","Danh Mục","TRẠM","Trạm","dmuc"),
              vt:gg("vt","Vị Trí","Vị trí","TRẠM","Trạm","vt"),
              jig:g("JIG","Jig","jig"),
              gc:gg("gc","Ghi chú","Ghi Chú","GHI CHÚ","gc"),
              // ✅ 7 cột MỚI — chỉ có ý nghĩa khi import vào dòng xe 12m (nếu file không
              // có các cột này thì để rỗng, không ảnh hưởng các dòng xe khác)
              ckgh:(()=>{const s=g("Check GH29Y","CHECK GH29Y","ckgh").toLowerCase();
                return (s.includes("riêng")||s.includes("rieng"))?"rieng":"dung_chung";})(),
              px:gg("px","Phân xưởng","PHÂN XƯỞNG","Phan xuong","px"),
              dai:g("Dài","DÀI","Dai","dai"),
              rong:g("Rộng","RỘNG","Rong","rong"),
              day_kt:g("Dày","DÀY","Day","day_kt"),
              tram:g("Trạm/Xí","Trạm Xí","[STT Trạm XH]","STT Trạm XH","Trạm XH","tram"),
              tnxh:g("Trách nhiệm XH","TRÁCH NHIỆM XH","Trach nhiem XH","tnxh"),
              // 🧩 GIAI ĐOẠN 2 — cột tùy biến: khớp theo ĐÚNG nhãn admin đang đặt trong CMS
              // cho dòng xe hiện tại. Không khớp gì thì để trống.
              tuy_bien:Object.fromEntries(getEnabledCustomFields().map(f=>[f.slot, g(f.label)])),
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
      alert("❌ GỬI ĐƠN THẤT BẠI — phiếu KHÔNG được lưu lên hệ thống:\n\n"+e.message+"\n\nVui lòng chụp lại màn hình này rồi gửi cho người quản trị Supabase để kiểm tra.");
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
    
    // Lưu vào state local
    setPhDB(s=>({...s,[pid]:[ph,...(s[pid]||[])]}));
    dbSavePhieu(ph).catch(e=>{
      console.error("dbSavePhieu:",e);
      alert("❌ LƯU PHIẾU THẤT BẠI — phiếu KHÔNG được lưu lên hệ thống:\n\n"+e.message+"\n\nVui lòng chụp lại màn hình này rồi gửi cho người quản trị Supabase để kiểm tra.");
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
  //
  // ⚠️ FIX "TỰ ĐỘNG NHẢY TRANG": trước đây dependency array dùng NGUYÊN mảng "projs" — mảng
  // này được GÁN LẠI (tham chiếu MỚI) mỗi lần "load()" chạy nền (poll mỗi 10s, xem effect gần
  // "pollTimer"), NGAY CẢ KHI nội dung dữ liệu không đổi. Do useEffect so sánh theo tham chiếu,
  // mỗi lần poll effect này CHẠY LẠI TOÀN BỘ dù không có gì thay đổi cho dự án đang xem — nếu
  // đúng lúc đó dữ liệu nền (bomDB/phDB) đang tải dở dang khiến "duAll" tạm thời tính SAI (VD
  // bom.length tạm thời =0 giữa 2 lần cập nhật), trang con "Báo cáo" sẽ bị NHÁY/NHẢY qua lại
  // giữa "🚧 Đang thực hiện" và "✅ Đã hoàn thành" dù người dùng không hề bấm gì. Nay đổi sang
  // chỉ phụ thuộc "trang_thai" (chuỗi nguyên thuỷ) của ĐÚNG dự án đang xem — effect CHỈ chạy
  // lại khi trạng thái THẬT SỰ đổi cho dự án đó, không còn bị kích hoạt bởi tham chiếu mới của
  // "projs" mỗi lần poll nền.
  const pidTrangThai = proj?.id===pid ? proj.trang_thai : undefined;
  useEffect(()=>{
    if(!pid) return;
    if(proj?.id!==pid) return; // dữ liệu dự án chưa khớp đúng pid đang chọn (đang tải dở) — chờ lần render kế
    const daHoanThanh = pidTrangThai==="hoan_thanh"||duAll;
    if(daHoanThanh){ setBcSubTab("done"); return; }
    if(bcNav.isManual(pid)) return; // dự án CHƯA hoàn thành: vẫn tôn trọng lựa chọn tay của người dùng
    setBcSubTab("dang");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pid,duAll,pidTrangThai]);

  // ✅ Danh sách dự án ĐÃ HOÀN THÀNH của dòng xe hiện tại (dùng cho tab "Báo cáo" · trang con
  // "done") — gồm dự án đã bấm "Hoàn thành" thủ công (trang_thai==="hoan_thanh") HOẶC đã nhận
  // đủ 100% vật tư. Với dự án ĐANG ĐƯỢC CHỌN (p.id===pid) dùng thẳng biến "duAll" ở trên (đúng
  // với banner "Đã nhận đủ vật tư toàn bộ!" đang hiển thị); các dự án khác tự tính qua
  // projFullyReceived(p).
  // ✅ Sắp xếp: dự án nào HOÀN THÀNH SAU (mới nhất) luôn lên ĐẦU danh sách. "Hoàn thành" ở
  // đây tính theo mốc thời gian THẬT SỰ gần nhất giữa 2 khả năng — (a) bấm tay nút "Hoàn
  // thành" (hoan_thanh_ts) hoặc (b) tự động đủ 100% vật tư (du_vt_ts, đúng với cột "Ngày
  // hoàn thành vật tư" đang hiển thị trong bảng) — lấy mốc nào MUỘN HƠN làm giờ hoàn thành
  // thật của dự án đó. Trước đây chỉ ưu tiên hoan_thanh_ts/ngay_hoan_thanh nên các dự án
  // CHỈ đủ vật tư (chưa từng bấm tay) đều có key rỗng như nhau → bị xếp lộn xộn theo ID
  // thay vì theo đúng ngày hoàn thành vật tư thực tế. Nay luôn lấy mốc mới nhất còn lại.
  const bcDoneList=useMemo(()=>[...projs].filter(p=>p.trang_thai==="hoan_thanh"||(p.id===pid?duAll:projFullyReceived(p))).sort((a,b)=>{
    const tsA=[a.hoan_thanh_ts,a.du_vt_ts,a.ngay_hoan_thanh,a.ngay_du_vt].filter(Boolean).sort().pop()||"";
    const tsB=[b.hoan_thanh_ts,b.du_vt_ts,b.ngay_hoan_thanh,b.ngay_du_vt].filter(Boolean).sort().pop()||"";
    if(tsA!==tsB) return String(tsB).localeCompare(String(tsA));
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
        gateIntro={gateIntro}
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
                  <button onClick={(e)=>{e.stopPropagation();xoaDuAnGiaiDoan2(p);}}
                    title={coQuyenXoaDA?"Xóa vĩnh viễn dự án này":""}
                    style={{flexShrink:0,border:"none",borderRadius:8,fontWeight:800,fontSize:11,
                      padding:"7px 12px",cursor:"pointer",whiteSpace:"nowrap",
                      background:coQuyenXoaDA?"#dc2626":"#e5e7eb",
                      color:coQuyenXoaDA?"#fff":"#9ca3af",
                      opacity:coQuyenXoaDA?1:0.55,
                      boxShadow:coQuyenXoaDA?"0 2px 0 rgba(0,0,0,0.18)":"none"}}>
                    🗑️ XÓA DA
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
                  // ✅ FIX: tách riêng "Giao thiếu" (ĐÃ từng giao một phần, XH đã duyệt >0, nhưng
                  // vẫn còn thiếu — v.giaoThieu) khỏi "Chưa nhận" (CHƯA từng giao gì — v.chuaSoan
                  // hoặc đã gửi nhưng XH chưa duyệt). Trước đây "SL thiếu" = tongMa-maDaNhanNg gộp
                  // chung cả 2 nhóm, khiến mã "chưa giao" bị hiện nhầm vào mục "Thiếu SL".
                  const maGiaoThieuNg=itemsNg.filter(v=>v.giaoThieu).length;
                  const maChuaNhanNg=tongMa-maDaNhanNg-maGiaoThieuNg;
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
                          <span style={{color:"#6b7280"}}>SL thiếu</span><b style={{color:maGiaoThieuNg>0?"#dc2626":"#16a34a",textDecoration:"underline"}}>{fmt(maGiaoThieuNg)}</b>
                        </div>
                        <div onClick={()=>setTqVtOpen(s=>s.nguon===nguon&&s.field==="chuanhan"?{nguon:"",field:""}:{nguon,field:"chuanhan"})}
                          style={{display:"flex",justifyContent:"space-between",fontSize:11,cursor:"pointer",padding:"3px 4px",borderRadius:6,background:tqVtOpen.nguon===nguon&&tqVtOpen.field==="chuanhan"?"#fef2f2":"transparent"}}>
                          <span style={{color:"#6b7280"}}>SL chưa nhận</span><b style={{color:maChuaNhanNg>0?"#dc2626":"#16a34a",textDecoration:"underline"}}>{fmt(maChuaNhanNg)}</b>
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
                // ✅ FIX: "thieu" = ĐÃ từng giao một phần nhưng còn thiếu (v.giaoThieu — không
                // gồm mã chưa từng giao gì); "chuanhan" = phần còn lại chưa nhận đủ nhưng
                // KHÔNG thuộc giaoThieu (chưa soạn/gửi hoặc đang chờ duyệt).
                const rows=tqVtOpen.field==="done"?itemsNg.filter(v=>v.done)
                  :tqVtOpen.field==="thieu"?itemsNg.filter(v=>v.giaoThieu)
                  :itemsNg.filter(v=>!v.done&&!v.giaoThieu);
                const tieuDeNhan=tqVtOpen.field==="done"?"Đã nhận":tqVtOpen.field==="thieu"?"Giao thiếu":"Chưa nhận";
                const tieuDe=`${tqVtOpen.nguon} · ${tieuDeNhan} (${rows.length})`;
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
                          {tqVtOpen.field==="done"?(
                            <span style={{fontSize:10,fontWeight:800,color:"#16a34a",background:"#dcfce7",borderRadius:8,padding:"2px 6px",whiteSpace:"nowrap",textAlign:"center"}}>{fmt(v.dn)}</span>
                          ):(
                            <span style={{fontSize:10,fontWeight:800,color:"#dc2626",background:"#fee2e2",borderRadius:8,padding:"2px 6px",whiteSpace:"nowrap",textAlign:"center"}}>{fmt(v.ct)}</span>
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
                        const giaoThieuNgPdf=itemsNg.filter(v=>v.giaoThieu).length;
                        const chuaNhanNgPdf=itemsNg.length-daNhanNg-giaoThieuNgPdf;
                        await xuatPDF(`<h2>📋 Chi tiết vật tư ${tqVtOpen.nguon} — ${tieuDeNhan} (${rows.length} mã)</h2>
                          <p class="sub">🚌 ${proj.icon||""} ${proj.ten} · ${itemsNg.length} mã · Đã nhận ${daNhanNg} · Giao thiếu ${giaoThieuNgPdf} · Chưa nhận ${chuaNhanNgPdf}</p>
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
                          [tqVtOpen.field==="done"?"SL đã nhận":"SL thiếu"]: tqVtOpen.field==="done"?(v.dn||0):(v.ct||0)
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
          // ⚠️ Màn hình ĐỘC LẬP này CHỈ xét trang_thai==="hoan_thanh" (đã bấm tay nút "Hoàn
          // thành"), KHÔNG tự động gồm cả dự án đã nhận đủ 100% vật tư nhưng chưa bấm nút —
          // khác với "bcDoneList" trong tab Báo Cáo ở hệ thống chính (nơi ĐÓ mới tự động
          // chuyển "Đang thực hiện" → "Đã hoàn thành" ngay khi Xưởng Hàn duyệt đủ vật tư).
          // Theo đúng yêu cầu: việc tự chuyển trạng thái theo vật tư CHỈ áp dụng trong hệ
          // thống chính; màn "GIAI ĐOẠN 03 — ĐÃ THỰC HIỆN" giữ nguyên hành vi ban đầu.
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

            {/* ── Bảng chi tiết "SL xe" / "Đã giao" — vẫn hiện dạng thẻ gắn liền bên dưới bảng như cũ ── */}
            {dt&&dtProj&&dt.kind!=="nhan"&&(()=>{
              const tieuDe=dt.kind==="xe"
                ?`🚌 Chi tiết giao xe — ${dtProj.ten}`
                :`📦 Chi tiết đã giao ${dt.nguon} — ${dtProj.ten}`;
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
                  const items=vatTuItems(dtProj).filter(v=>(v.ng||"").trim().toUpperCase()===dt.nguon&&v.doneGui);
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
                            <span style={{fontSize:10,fontWeight:800,color:"#16a34a",background:"#dcfce7",borderRadius:8,padding:"2px 6px",whiteSpace:"nowrap",textAlign:"center"}}>{fmt(v.dnGui)}</span>
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

            {/* ── "Chi tiết đã nhận" — mở RIÊNG thành màn hình/modal toàn màn hình (kiểu hộp văn bản),
                hiện đầy đủ nội dung, không bị giới hạn chiều cao 296px như bảng gắn liền phía trên ── */}
            {dt&&dtProj&&dt.kind==="nhan"&&(()=>{
              const items=vatTuItems(dtProj).filter(v=>(v.ng||"").trim().toUpperCase()===dt.nguon&&v.done);
              const closeIt=()=>setDtOpenDaTH(null);
              return(
              <div
                style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:16}}
                onClick={e=>{if(e.target===e.currentTarget) closeIt();}}
              >
                <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:520,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",overflow:"hidden"}}>
                  <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#0f172a,#1e293b)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexShrink:0}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>📦 Chi tiết đã nhận {dt.nguon}</div>
                      <div style={{fontSize:11,color:"#93c5fd",marginTop:2}}>{dtProj.ten} · {items.length} mã</div>
                    </div>
                    <button onClick={closeIt} style={{border:"none",background:"rgba(255,255,255,0.12)",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",lineHeight:1,padding:"6px 10px",borderRadius:8,flexShrink:0}}>✕</button>
                  </div>
                  <div style={{padding:"14px 16px",overflowY:"auto",flex:1,background:"#f8fafc"}}>
                    {items.length===0?(
                      <div style={{padding:24,textAlign:"center",fontSize:12,color:"#9ca3af"}}>— Không có mã nào —</div>
                    ):(
                      <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden"}}>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",minWidth:460}}>
                            <thead>
                              <tr>
                                <th style={{background:"#1d4ed8",color:"#fff",fontSize:10,fontWeight:800,textTransform:"uppercase",padding:"8px 6px",textAlign:"center",whiteSpace:"nowrap"}}>STT</th>
                                <th style={{background:"#1d4ed8",color:"#fff",fontSize:10,fontWeight:800,textTransform:"uppercase",padding:"8px 8px",textAlign:"left",whiteSpace:"nowrap"}}>Mã số</th>
                                <th style={{background:"#1d4ed8",color:"#fff",fontSize:10,fontWeight:800,textTransform:"uppercase",padding:"8px 8px",textAlign:"left"}}>Tên vật tư</th>
                                <th style={{background:"#1d4ed8",color:"#fff",fontSize:10,fontWeight:800,textTransform:"uppercase",padding:"8px 8px",textAlign:"center",whiteSpace:"nowrap"}}>Nguồn gốc</th>
                                <th style={{background:"#1d4ed8",color:"#fff",fontSize:10,fontWeight:800,textTransform:"uppercase",padding:"8px 8px",textAlign:"center",whiteSpace:"nowrap"}}>ĐVT</th>
                                <th style={{background:"#1d4ed8",color:"#fff",fontSize:10,fontWeight:800,textTransform:"uppercase",padding:"8px 8px",textAlign:"center",whiteSpace:"nowrap"}}>SL đã nhận</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((v,i)=>(
                                <tr key={v.id||v.ma} style={{background:i%2?"#f9fafb":"#fff"}}>
                                  <td style={{fontSize:11,color:"#374151",padding:"7px 6px",borderTop:"1px solid #f1f5f9",textAlign:"center"}}>{i+1}</td>
                                  <td style={{fontSize:10.5,fontWeight:700,color:"#374151",padding:"7px 8px",borderTop:"1px solid #f1f5f9",wordBreak:"break-word"}}>{v.ma}</td>
                                  <td style={{fontSize:12,color:"#1f2937",fontWeight:600,padding:"7px 8px",borderTop:"1px solid #f1f5f9",wordBreak:"break-word"}}>{v.ten}</td>
                                  <td style={{fontSize:11,color:"#374151",padding:"7px 8px",borderTop:"1px solid #f1f5f9",textAlign:"center",wordBreak:"break-word"}}>{v.ng||"—"}</td>
                                  <td style={{fontSize:11,color:"#374151",padding:"7px 8px",borderTop:"1px solid #f1f5f9",textAlign:"center",whiteSpace:"nowrap"}}>{v.dv||"—"}</td>
                                  <td style={{padding:"7px 8px",borderTop:"1px solid #f1f5f9",textAlign:"center"}}>
                                    <span style={{fontSize:11,fontWeight:800,color:"#16a34a",background:"#dcfce7",borderRadius:8,padding:"2px 8px",whiteSpace:"nowrap"}}>{fmt(v.dnXN)}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{padding:"10px 16px",borderTop:"1px solid #e2e8f0",background:"#fff",flexShrink:0,textAlign:"right"}}>
                    <button onClick={closeIt} style={{border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,padding:"8px 18px",background:"#1d4ed8",color:"#fff"}}>Đóng</button>
                  </div>
                </div>
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
  const isKHTH    = role==="khth";       // Nhóm PHÒNG KH-TH/Phòng KT/Ban CN/Ban LĐNM/XH tổng thể — ĐÃ được cấp quyền Thêm/Sửa/Xoá vật tư (chỉ còn dùng để hiển thị màu/nhãn riêng, KHÔNG còn chặn thao tác)
  // ✅ Nhóm role "khth" giờ cũng được thao tác trong tab "✅ Kiểm Tra Xác Nhận" (duyệt/xác
  // nhận phiếu) và "🗂️ Tạo BOM Mẫu" — dùng biến RIÊNG này thay vì đổi thẳng isXH, để KHÔNG
  // ảnh hưởng tới các quyền vẫn còn giữ nguyên chỉ dành cho "xuonghan" (nút "+ Thêm mới"
  // nhanh và "🗑️ Xoá Bom" trong tab 📦 Vật tư).
  const canApprove = isXH || isKHTH;
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
    // ✅ "💬 Góp Ý Kiến - Cải Tiến PM" và "📖 Hướng Dẫn Sử Dụng PM" — LUÔN cấp quyền cho
    // MỌI tài khoản không phân biệt đơn vị/vai trò, KHÔNG đi qua bảng "Phân quyền chức
    // năng theo đơn vị" (admin không thể lỡ ẩn 2 tab này khi cấu hình quyền cho đơn vị).
    if(!tabs.some(([k])=>k==="gopy")) tabs = [...tabs, ["gopy", "💬 Góp Ý Kiến - Cải Tiến PM"]];
    if(!tabs.some(([k])=>k==="huongdan")) tabs = [...tabs, ["huongdan", "📖 Hướng Dẫn Sử Dụng PM"]];
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
    if(!tabs.some(([k])=>k==="gopy")) tabs = [...tabs, ["gopy", "💬 Góp Ý Kiến - Cải Tiến PM"]];
    if(!tabs.some(([k])=>k==="huongdan")) tabs = [...tabs, ["huongdan", "📖 Hướng Dẫn Sử Dụng PM"]];
    if(!tabs.some(([k])=>k==="cms")) tabs = [...tabs, ["cms", "🖼️ Quản Trị CMS"]];
    // 🧭 Sắp xếp lại theo thứ tự admin đã tuỳ chỉnh trong CMS → "Giao diện Sidebar & Header"
    // (nếu có, xem AppLayoutManager) — tab nào không nằm trong danh sách tuỳ chỉnh (VD tab
    // mới thêm sau này) sẽ tự động xếp cuối, không bị rơi mất/ẩn mất.
    if(appLayout.tabOrder && appLayout.tabOrder.length){
      const byKey = Object.fromEntries(tabs);
      const seen = new Set();
      const ordered = appLayout.tabOrder
        .filter(k=>byKey[k]!==undefined && !seen.has(k) && seen.add(k))
        .map(k=>[k, byKey[k]]);
      const rest = tabs.filter(([k])=>!seen.has(k));
      tabs = [...ordered, ...rest];
    }
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
          ≥1440px: sidebar 220–230px, main max-width≈1400px. 900–1439px: giữ sidebar≈117px.
          Dưới 900px vẫn giữ hành vi/kích thước mobile hiện có (không đụng vào). */}
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
        @media (min-width:900px){
          .kl-header-inner{ height:${appLayout.headerHeightDesktop}px !important; }
          .kl-sidebar-desktop{ width:${appLayout.sidebarWidthDesktop}px !important; }
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
          .kl-sidebar-desktop{ width:${appLayout.sidebarWidthWide}px !important; }
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

      {/* HEADER — H≈88px (desktop), gradient navy→blue theo token Header (#06285F → #125BC0).
          ✅ Nếu admin đã chọn ảnh nền Header trong CMS → "🧭 Giao diện Sidebar & Header",
          hiển thị THẲNG ảnh đó (không phủ gradient) — có banner thì dùng banner, không có
          banner thì mới dùng gradient mặc định. */}
      <div style={{
        background: appLayout.headerBg
          ? `url("${appLayout.headerBg}")`
          : "linear-gradient(110deg,#06285F,#125BC0)",
        backgroundSize:"cover", backgroundPosition:"center",
        borderBottom:"1px solid #06285F"}}>
        <div className="kl-header-inner" style={{height:appLayout.headerHeightMobile,padding:"0 24px",display:"flex",alignItems:"center",gap:16,boxSizing:"border-box"}}>

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
                  {/* ✅ Avatar giờ là 1 <label> bọc input file ẩn — MỌI tài khoản đăng nhập đều
                      tự bấm vào đây để đổi ảnh đại diện của CHÍNH MÌNH, không cần nhờ admin
                      thao tác hộ qua CMS nữa (mục CMS cũ vẫn giữ nguyên, dùng khi admin muốn
                      chỉnh hộ/soát lại ảnh của người khác). Badge 📷 nhỏ góc dưới phải để báo
                      hiệu đây là nút bấm được, không phải avatar tĩnh. */}
                  <label title="Bấm để đổi ảnh đại diện" style={{width:42,height:42,borderRadius:"50%",background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,overflow:"hidden",border:"2px solid rgba(255,255,255,.7)",position:"relative",cursor:avatarUploading?"wait":"pointer"}}>
                    {avatarUploading
                      ? <span style={{fontSize:8,color:"#4338ca",fontWeight:800}}>...</span>
                      : (isImgAvatar(user.avatar)
                          ? <img src={user.avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : (user.avatar||<IconUserGear3D size={20}/>))}
                    {!avatarUploading&&(
                      <span style={{position:"absolute",bottom:-1,right:-1,width:15,height:15,borderRadius:"50%",background:"#1d4ed8",border:"1.5px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,lineHeight:1}}>📷</span>
                    )}
                    <input type="file" accept="image/*" disabled={avatarUploading} style={{display:"none"}}
                      onChange={e=>{const f=e.target.files?.[0];onSelfUploadAvatar(f);e.target.value="";}}/>
                  </label>
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
        // ✅ Mặc định (mọi tab khác, và cả trang con "🚧 Đang thực hiện" của Báo Cáo) đều
        // dùng danh sách "Đang thực hiện" — chỉ trang con "✅ Đã hoàn thành" của Báo Cáo mới
        // hiện ngược lại danh sách đã hoàn thành.
        const dangLocDangLam = !dangLocDaXong;
        // ✅ Theo yêu cầu: DỰ ÁN ĐÃ GIAO ĐỦ VẬT TƯ (100%) hoặc đã bấm "Hoàn thành" KHÔNG còn
        // hiện trong "CHỌN DỰ ÁN" ở BẤT KỲ tab nào (Vật Tư/Soạn Hàng/Kiểm Tra Xác Nhận/Phiếu
        // GN/...) — áp dụng cho TOÀN HỆ THỐNG, không chỉ riêng tab "Báo Cáo". Dùng CHUNG
        // "bcDangList" (đã loại trừ đúng các dự án thuộc bcDoneList) làm danh sách mặc định;
        // CHỈ khi đang xem trang con "✅ Đã hoàn thành" của tab Báo Cáo mới hiện ngược lại
        // đúng danh sách đã hoàn thành (bcDoneList) để người dùng vẫn tra cứu lại được.
        const projPickerList = dangLocDaXong ? bcDoneList : bcDangList;
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
          const TAB_ICON_CMP = {ds:IconBox3D, soan:IconClipboardCheck3D, duyet:IconShieldCheck3D, pgn:IconReceipt3D, bc:IconChartBar3D, hoanthanh:IconFlagFinish3D, bom_mau:IconFolderGear3D, users:IconUsersLock3D, cms:IconImageCms3D, gopy:IconChatHeart3D, huongdan:IconBookGuide3D};
          // 🏷️ GIAI ĐOẠN 1 — nhãn sidebar (cả vai trò Xưởng Hàn lẫn các vai trò khác) giờ
          // ĐỀU lấy từ CÙNG 1 nguồn duy nhất: key "tab_ds","tab_soan"... trong APP_I18N —
          // đúng những key admin sửa được trong CMS → 🏷️ Nhãn / Tên cột → mục "🧭 Nhãn Menu
          // / Sidebar". Đổi 1 lần, áp dụng cho MỌI vai trò đăng nhập, không cần sửa code.
          // (Trước đây vai trò Xưởng Hàn dùng 1 bộ chữ viết cứng riêng TAB_LABEL_XH — đã bỏ
          // để tránh 2 nguồn nhãn lệch nhau khi đổi qua CMS.)
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
            <div className="kl-sidebar-desktop" style={{flexShrink:0,width:appLayout.sidebarWidthMobile,
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
                    const label=t(`tab_${k}`).replace(/^\S+\s*/,"");
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
                          {/* 🔔 Thông báo góp ý CHƯA XEM — chỉ tài khoản admin thấy, ngay trên icon 🖼️ Quản Trị CMS */}
                          {k==="cms"&&isAdminAccount(user)&&gopYList.filter(g=>!g.da_xem).length>0&&(
                            <span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:8,background:"#dc2626",color:"#fff",
                              fontSize:9.5,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",boxShadow:"0 1px 4px rgba(0,0,0,.35)"}}>
                              {gopYList.filter(g=>!g.da_xem).length>99?"99+":gopYList.filter(g=>!g.da_xem).length}
                            </span>
                          )}
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
        // ✅ Đang ở tab "🏁 Dự Án Đã Hoàn Thành Vật Tư" (tab "bc", trang con "done") — ở CẢ 2
        // chế độ xem của tab này (danh sách nhiều dự án LẪN xem chi tiết 1 dự án qua "👁️ Xem
        // chi tiết") đều ẩn 3 khối "Dòng Xe" / "Dự Án" / "Tiến Độ Giao Xe" theo yêu cầu.
        const dangXemDsHoanThanhVatTu = tab==="bc" && bcSubTab==="done";
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
                ✅ ẨN HẲN khi đang ở tab "🖼️ Quản Trị CMS", "💬 Góp Ý Kiến - Cải Tiến PM" hoặc
                "📖 Hướng Dẫn Sử Dụng PM" theo yêu cầu — các tab này không gắn với 1 dòng xe/dự
                án cụ thể nào, nên 2 ô chọn này không có ý nghĩa và dễ gây hiểu nhầm khi hiển thị. */}
            {tab!=="cms"&&tab!=="gopy"&&tab!=="huongdan"&&!dangXemDsHoanThanhVatTu&&(
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
                ✅ Cũng bỏ hẳn khi ở tab "🖼️ Quản Trị CMS", "💬 Góp Ý Kiến - Cải Tiến PM" hoặc
                "📖 Hướng Dẫn Sử Dụng PM" theo yêu cầu — không chỉ ẩn mà loại khỏi cây hiển thị
                luôn, vì các tab này không liên quan tới tiến độ giao xe của dự án. */}
            {tab!=="cms"&&tab!=="gopy"&&tab!=="huongdan"&&!dangXemDsHoanThanhVatTu&&(
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12,background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
              {/* Icon dòng xe — hiển thị đúng ảnh/icon theo dòng xe đang chọn (12M / City Bus / Mini Bus) */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:54,height:54,borderRadius:14,overflow:"hidden",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.12)",background:(activeLine==="minibus"||activeLine==="12m")?"transparent":(nhanDongXe(activeLine).nen||"#f3f4f6")}}>
                {activeLine==="minibus"?(
                  <img src={DONG_XE_ICON_MINIBUS_PNG} alt="Mini Bus" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                ):activeLine==="12m"?(
                  <img src={DONG_XE_ICON_12M_PNG} alt="Xe 12M" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
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
                      // 🧩 GIAI ĐOẠN 2 — cột tùy biến đang bật cho dòng xe hiện tại
                      ...Object.fromEntries(getEnabledCustomFields().map(f=>[f.label, v.tuy_bien?.[f.slot]||""])),
                    })),
                    `VatTu_${proj.ten.replace(/\s/g,"_")}`,
                    `Danh sách vật tư — ${proj.ten}`
                  )}
                  onPDF={()=>{
                    const is12m=activeLine==="12m";
                    const cfList=getEnabledCustomFields();
                    const rows=filtered.map((v,i)=>`<tr>
                      <td>${v.stt}</td><td><b>${v.ma}</b></td><td class="l">${v.ten}</td>
                      <td style="text-align:center">${v.dv}</td>
                      <td style="text-align:center">${fmt(v.dm)}</td>
                      <td style="text-align:center;font-weight:700;color:#065f46">${fmt(v.dm*soXe)}</td>
                      <td>${v.ng}</td><td class="l">${v.vt||""}</td><td>${v.jig||""}</td><td>${v.gc||""}</td>
                      ${is12m?`<td>${v.ckgh==="rieng"?"RIÊNG GH29Y":"DÙNG CHUNG"}</td><td>${v.px||""}</td><td>${v.dai||""}×${v.rong||""}×${v.day_kt||""}</td><td>${v.tram||""}</td><td>${v.tnxh||""}</td>`:""}
                      ${cfList.map(f=>`<td>${v.tuy_bien?.[f.slot]||""}</td>`).join("")}
                    </tr>`).join("");
                    xuatPDF(`<h2>${t("rpDs")}</h2>
                      <p class="sub">${proj.icon} ${proj.ten} · ${filtered.length}/${bom.length} mã · ${soXe} xe</p>
                      <table><thead><tr><th>${t("thSTT")}</th><th>${t("thMa")}</th><th>${t("thTen")}</th><th>${t("thDVT")}</th><th>${t("thDM")}</th><th>${t("thCan")}×${soXe}</th><th>${t("thNguonGoc")}</th><th>${t("lbVT")}</th><th>JIG</th><th>${t("thGhiChu")}</th>${is12m?`<th>Check GH29Y</th><th>Phân xưởng</th><th>DxRxD(mm)</th><th>Trạm/Xí</th><th>Trách nhiệm XH</th>`:""}${cfList.map(f=>`<th>${f.label}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`,
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
              {/* ✅ Nâng cấp: nhóm vai trò "khth" (PHÒNG KH-TH, Phòng KT, Ban CN, Ban LĐNM, XH
                  theo dõi tổng thể) trước đây CHỈ XEM — nay được cấp quyền Thêm/Sửa/Xoá/Import
                  giống các vai trò khác, nên bỏ điều kiện !isKHTH từng chặn 2 nút dưới đây. */}
              <button onClick={()=>{importPidRef.current=pid;setShowXlsImport(true);}} style={{...btn,background:"#f0fdf4",color:"#065f46",padding:"7px 10px",fontSize:13,border:"1px solid #bbf7d0",width:"100%",justifyContent:"center"}}>📊 Import Excel</button>
              <button onClick={()=>setShowImport(true)} style={{...btn,background:"#eff6ff",color:"#1d4ed8",padding:"7px 10px",fontSize:13,border:"1px solid #bfdbfe",width:"100%",justifyContent:"center"}}>➕ Thêm vật tư</button>
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
                const cfList=getEnabledCustomFields();
                const cfColsPx=cfList.map(()=>" 90px").join("");
                const vtCols=`44px 100px minmax(200px,1fr) 100px 90px 70px 60px 70px 90px 110px 60px${is12m?" 110px 80px 120px 80px 90px":""}${cfColsPx} 80px`;
                const vtMinWidth=994+(is12m?480:0)+cfList.length*90+90;
                const vtHeaders=[t("thSTT"),t("thMa"),t("thTen"),t("thNguonGoc"),t("lbVT"),"JIG",t("thDVT"),t("thDM"),t("thCanNhan"),t("thGhiChu"),"Ảnh",
                  ...(is12m?["Check GH29Y","Phân xưởng","DxRxD(mm)","Trạm/Xí","TN XH"]:[]),
                  ...cfList.map(f=>f.label),
                  ...["Thao tác"]];
                return(
                // ✅ Bảng cuộn CẢ 4 HƯỚNG (lên/xuống/trái/phải) thay vì hiện hết toàn bộ mã ra
                // dài vô hạn: khung ngoài (overflowX) cho cuộn NGANG khi nhiều cột, khung trong
                // (maxHeight+overflowY) cho cuộn DỌC khi nhiều dòng — tiêu đề cột "dính"
                // (position:sticky, top:0) để luôn thấy tên cột dù cuộn xuống bao xa.
                <div style={{overflowX:"auto"}}>
                <div style={{minWidth:vtMinWidth}}>
                <div style={{maxHeight:"62vh",overflowY:"auto"}}>
                  <div style={{display:"grid",gridTemplateColumns:vtCols,background:"#1d4ed8",color:"#fff",fontSize:10.5,fontWeight:800,textTransform:"uppercase",position:"sticky",top:0,zIndex:2}}>
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
                      {cfList.map(f=>(
                        <div key={f.slot} style={{padding:"8px 8px",textAlign:"center",wordBreak:"break-word"}}>{v.tuy_bien?.[f.slot]||"—"}</div>
                      ))}
                      <div style={{padding:"6px 6px",display:"flex",gap:4,justifyContent:"center"}}>
                        <button onClick={()=>{setCur({...E0,...v});setModal("edit");}} style={{...btn,background:"#fef3c7",color:"#92400e",padding:"4px 7px",fontSize:11}}>✏️</button>
                        <button onClick={()=>del(v)} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"4px 7px",fontSize:11}}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
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
        {tab==="duyet"&&canApprove&&(()=>{
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
                          <div style={{maxHeight:"62vh",overflowY:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                            <thead>
                              <tr style={{background:"#1d4ed8"}}>
                                {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSoSoan"),t("thSLThucNhan"),t("thTrangThai"),t("thDuyet")].map(h=>(
                                  <th key={h} style={{padding:"7px 10px",textAlign:[t("thSoSoan"),t("thSLThucNhan")].includes(h)?"center":"left",fontWeight:800,color:"#fff",fontSize:11,position:"sticky",top:0,zIndex:2,background:"#1d4ed8"}}>{h}</th>
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
                          {canApprove&&ph.tt!=="Đã xác nhận"&&<button onClick={()=>xacNhan(ph.id,pid)} style={{...btn,background:"#d1fae5",color:"#065f46",padding:"4px 11px",fontSize:11}}>✓ Xác nhận</button>}
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
                  <div style={{maxHeight:"62vh",overflowY:"auto"}}>
                    <div style={{display:"grid",gridTemplateColumns:tlCols,background:"#1d4ed8",color:"#fff",fontSize:10.5,fontWeight:800,textTransform:"uppercase",position:"sticky",top:0,zIndex:2}}>
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
                  <div style={{maxHeight:"62vh",overflowY:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:720}}>
                      <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                        {["STT","Tên dự án","Dòng xe","Loại xe","SL xe","Ngày khởi tạo","Ngày hoàn thành vật tư",""].map((h,hi)=>(
                          <th key={hi} style={{padding:"9px 10px",textAlign:hi===1?"left":"center",fontWeight:700,color:"#6b7280",fontSize:10.5,whiteSpace:"nowrap",
                            position:"sticky",top:0,left:hi===0?0:undefined,zIndex:hi===0?3:2,background:"#f8fafc",
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
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>📋 Chi tiết vật tư theo nguồn</span>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:14}}>
                {[["THCK","🏭","#b45309","#fffbeb","#fde68a"],["CKD","📦","#0369a1","#eff6ff","#bae6fd"]].map(([nguon,icon,mau,bgLight,bd])=>{
                  const itemsNg=th.filter(v=>(v.ng||"").trim().toUpperCase()===nguon);
                  const tongMa=itemsNg.length;
                  const maDaNhanNg=itemsNg.filter(v=>v.done).length;
                  // ✅ FIX: tách riêng "Giao thiếu" (ĐÃ giao một phần, XH duyệt >0, còn thiếu —
                  // v.giaoThieu) khỏi "Chưa nhận" (CHƯA từng giao gì / đang chờ duyệt). Trước đây
                  // "Còn thiếu" = tongMa-maDaNhanNg gộp chung 2 nhóm, khiến mã "chưa giao" (chưa
                  // soạn lần nào) cũng bị hiện nhầm vào thẻ "Còn thiếu" (SL thiếu).
                  const maGiaoThieuNg=itemsNg.filter(v=>v.giaoThieu).length;
                  const maChuaNhanNg=tongMa-maDaNhanNg-maGiaoThieuNg;
                  const filterMode=bcBlockOpen[nguon]||""; // ""(đóng) · "done"(Đã nhận) · "thieu"(Giao thiếu) · "chuanhan"(Chưa nhận)
                  const itemsFiltered=filterMode==="done"?itemsNg.filter(v=>v.done)
                    :filterMode==="thieu"?itemsNg.filter(v=>v.giaoThieu)
                    :filterMode==="chuanhan"?itemsNg.filter(v=>!v.done&&!v.giaoThieu)
                    :[];
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
                          <div onClick={()=>chonLoc("thieu")} style={{flex:1,textAlign:"center",background:filterMode==="thieu"?"#fef3c7":"#fff",borderRadius:8,padding:"8px 6px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",cursor:"pointer",userSelect:"none",border:filterMode==="thieu"?"1.5px solid #b45309":"1.5px solid transparent"}}>
                            <div style={{fontWeight:800,fontSize:18,color:maGiaoThieuNg>0?"#b45309":"#16a34a"}}>{maGiaoThieuNg}</div>
                            <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Giao thiếu</div>
                            <div style={{fontSize:9,fontWeight:700,color:"#b45309",marginTop:2}}>{filterMode==="thieu"?"▲ Thu gọn":"▼ Xem chi tiết"}</div>
                          </div>
                          <div onClick={()=>chonLoc("chuanhan")} style={{flex:1,textAlign:"center",background:filterMode==="chuanhan"?"#fee2e2":"#fff",borderRadius:8,padding:"8px 6px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",cursor:"pointer",userSelect:"none",border:filterMode==="chuanhan"?"1.5px solid #dc2626":"1.5px solid transparent"}}>
                            <div style={{fontWeight:800,fontSize:18,color:maChuaNhanNg>0?"#dc2626":"#16a34a"}}>{maChuaNhanNg}</div>
                            <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Chưa nhận</div>
                            <div style={{fontSize:9,fontWeight:700,color:"#dc2626",marginTop:2}}>{filterMode==="chuanhan"?"▲ Thu gọn":"▼ Xem chi tiết"}</div>
                          </div>
                        </div>
                        {/* 🚨 Gửi cảnh báo khẩn cấp riêng cho từng nhóm — "Giao thiếu" (đã giao 1 phần
                            nhưng chưa đủ) và "Chưa nhận" (chưa soạn/gửi hoặc đang chờ duyệt). Tách
                            riêng 2 nút vì đây là 2 tình trạng khác nhau, cần nội dung cảnh báo khác nhau. */}
                        {(maGiaoThieuNg>0||maChuaNhanNg>0)&&(
                          <div style={{display:"flex",gap:8}}>
                            {maGiaoThieuNg>0&&(
                              <button onClick={()=>{
                                  const itemsCanhBao=itemsNg.filter(v=>v.giaoThieu).map(v=>({ma:v.ma,ten:v.ten,dv:v.dv,can:v.cn,daGiao:v.dn,conThieu:v.ct}));
                                  setKhanCapModal({items:itemsCanhBao});
                                }}
                                style={{flex:1,border:"1.5px solid #fde68a",background:"#fffbeb",color:"#b45309",borderRadius:10,padding:"9px 4px",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontFamily:"inherit"}}>
                                🚨 Báo Giao thiếu ({maGiaoThieuNg})
                              </button>
                            )}
                            {maChuaNhanNg>0&&(
                              <button onClick={()=>{
                                  const itemsCanhBao=itemsNg.filter(v=>!v.done&&!v.giaoThieu).map(v=>({ma:v.ma,ten:v.ten,dv:v.dv,can:v.cn,daGiao:v.dn,conThieu:v.ct}));
                                  setKhanCapModal({items:itemsCanhBao});
                                }}
                                style={{flex:1,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#b91c1c",borderRadius:10,padding:"9px 4px",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontFamily:"inherit"}}>
                                🚨 Báo Chưa nhận ({maChuaNhanNg})
                              </button>
                            )}
                          </div>
                        )}
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                          {(()=>{
                            // Khi đã chọn ô (Đã nhận / Còn thiếu) thì chỉ xuất đúng danh sách đang hiển thị (itemsFiltered).
                            // Khi chưa chọn ô nào (đóng) thì xuất toàn bộ nguồn (itemsNg) như trước.
                            const dataXuat=filterMode?itemsFiltered:itemsNg;
                            const nhanXuat=filterMode==="done"?`Đã nhận (${dataXuat.length} mã)`:filterMode==="thieu"?`Giao thiếu (${dataXuat.length} mã)`:filterMode==="chuanhan"?`Chưa nhận (${dataXuat.length} mã)`:`Toàn bộ (${dataXuat.length} mã)`;
                            return(
                          <ExportBar
                            shareTitle={`📋 Chi tiết vật tư ${nguon} — ${proj.ten} — ${nhanXuat}`}
                            shareText={`${nguon} — ${nhanXuat}: đã nhận ${maDaNhanNg}, giao thiếu ${maGiaoThieuNg}, chưa nhận ${maChuaNhanNg}`}
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
                                <p class="sub">${proj.icon} ${proj.ten} · ${tongMa} mã · Đã nhận ${maDaNhanNg} · Giao thiếu ${maGiaoThieuNg} · Chưa nhận ${maChuaNhanNg}</p>
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
                          <div style={{fontSize:11,fontWeight:700,color:filterMode==="done"?"#16a34a":filterMode==="thieu"?"#b45309":"#dc2626",padding:"2px 4px"}}>
                            {filterMode==="done"?`✅ Danh sách Đã nhận (${itemsFiltered.length} mã)`:filterMode==="thieu"?`🚚 Danh sách Giao thiếu (${itemsFiltered.length} mã)`:`⏰ Danh sách Chưa nhận (${itemsFiltered.length} mã)`}
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
                                  <div style={{maxHeight:"40vh",overflowY:"auto"}}>
                                    <div style={{display:"grid",gridTemplateColumns:gCols,background:"#1d4ed8",color:"#fff",fontSize:9,fontWeight:800,textTransform:"uppercase",position:"sticky",top:0,zIndex:2}}>
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
            </div>
            )}
            </>
          );
        })()}

        {/* ── NGƯỜI DÙNG — chỉ Xưởng Hàn ── */}
        {tab==="bom_mau"&&canApprove&&(()=>{
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
                  <div style={{maxHeight:"62vh",overflowY:"auto"}}>
                    <div style={{display:"grid",gridTemplateColumns:bmCols,background:"#1d4ed8",color:"#fff",fontSize:10.5,fontWeight:800,textTransform:"uppercase",position:"sticky",top:0,zIndex:2}}>
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
          <CmsPanel items={cmsItems} setItems={setCmsItems} dbUpsertCms={dbUpsertCms} dbDeleteCms={dbDeleteCms} users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser}
            labelOverrides={labelOverrides} setLabelOverrides={setLabelOverrides} dbUpsertLabel={dbUpsertLabel} dbDeleteLabel={dbDeleteLabel} activeLine={activeLine}
            customFieldDefs={customFieldDefs} setCustomFieldDefs={setCustomFieldDefs} dbUpsertCustomField={dbUpsertCustomField}
            gopYList={gopYList} setGopYList={setGopYList} dbMarkGopYRead={dbMarkGopYRead}
            huongDanList={huongDanList} setHuongDanList={setHuongDanList} dbUpsertHuongDan={dbUpsertHuongDan} dbDeleteHuongDan={dbDeleteHuongDan}/>
        )}

        {/* 💬 GÓP Ý KIẾN - CẢI TIẾN PM — MỌI tài khoản đều thấy & gửi được */}
        {tab==="gopy"&&(
          <GopYForm user={user} activeLine={activeLine} dbInsertGopY={dbInsertGopY} setGopYList={setGopYList}/>
        )}

        {/* 📖 HƯỚNG DẪN SỬ DỤNG PM — MỌI tài khoản đều xem được. Nội dung do admin soạn
            sẵn trong CMS → 📖 Hướng Dẫn Sử Dụng PM (bảng riêng "huong_dan_pm" trên
            Supabase) — tái dùng 100% form/danh sách CMS đã có, KHÔNG cần thêm màn soạn
            thảo riêng. */}
        {tab==="huongdan"&&(
          <HuongDanView huongDanList={huongDanList}/>
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

                  {/* ═══════════════════════════════════════════════════════════
                      🧩 GIAI ĐOẠN 2 — CÁC Ô TÙY BIẾN (o1..o5) — hiện ra tự động nếu
                      admin đã BẬT + đặt tên cho ô nào trong CMS (🧩 Cột tùy biến),
                      RIÊNG theo dòng xe đang chọn. Không cần sửa code khi thêm cột mới,
                      chỉ cần bật + đặt tên trong CMS (tối đa 5 ô).
                      ═══════════════════════════════════════════════════════════ */}
                  {getEnabledCustomFields().length>0 && (
                    <>
                      <div style={{gridColumn:"1/3",borderTop:"1px dashed #d1d5db",paddingTop:10,marginTop:2,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:14}}>🧩</span>
                        <span style={{fontSize:11,fontWeight:800,color:"#7c3aed",letterSpacing:.3}}>THÔNG TIN TÙY BIẾN</span>
                      </div>
                      {getEnabledCustomFields().map(f=>(
                        <div key={f.slot}>
                          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>{f.label}</label>
                          <input type={f.kieu==="number"?"number":"text"} value={cur.tuy_bien?.[f.slot]||""}
                            onChange={e=>setCur(c=>({...c,tuy_bien:{...(c.tuy_bien||{}),[f.slot]:f.kieu==="number"?Number(e.target.value):e.target.value}}))}
                            style={inp}/>
                        </div>
                      ))}
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
                  {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSoLuong"),editPh?"":canApprove?t("thSLThucNhan"):"",editPh?"":t("thSLThieu"),editPh?t("thXoa"):t("thDuyet"),editPh?null:t("thNguoiDuyet")].filter(h=>h!==null&&h!=="").map(h=><th key={h} style={{padding:"8px 10px",textAlign:[t("thSoLuong"),t("thSLThucNhan"),t("thSLThieu")].includes(h)?"right":"left",fontWeight:800,color:"#fff",whiteSpace:"nowrap"}}>{h}</th>)}
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
                      {!editPh&&canApprove&&(
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
                            :canApprove?<button onClick={()=>{
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
                    {!editPh&&canApprove&&<td style={{padding:"8px 10px",fontWeight:700,color:"#1d4ed8",textAlign:"right"}}>{fmt((freshVP.ct||[]).reduce((s,c)=>s+(c.sl_thuc_nhan??c.sl),0))}</td>}
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
                  {!all&&ct.length>0&&canApprove&&<button onClick={()=>duyetAll(freshVP.id,freshVP.pid||freshVP.projId)} style={{...btn,background:"#1d4ed8",color:"#fff",padding:"10px 22px",fontSize:13,fontWeight:700}}>✓ Duyệt tất cả</button>}
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
                  {canApprove&&freshVP.tt!=="Đã xác nhận"&&<button onClick={()=>{xacNhan(freshVP.id);setViewPh(null);}} style={{...btn,background:"#16a34a",color:"#fff",padding:"8px 16px",fontSize:13}}>✓ Xác nhận</button>}
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
              <button onClick={async()=>{
                setCpwErr("");setCpwOk("");
                if(!cpwForm.cur||!cpwForm.next||!cpwForm.confirm){setCpwErr("Vui lòng điền đầy đủ!");return;}
                if(cpwForm.next.length<4){setCpwErr("Mật khẩu mới tối thiểu 4 ký tự!");return;}
                if(cpwForm.next!==cpwForm.confirm){setCpwErr("Mật khẩu mới không khớp!");return;}
                // ✅ BẢO MẬT: xác thực mật khẩu cũ + băm mật khẩu mới đều thực hiện trong RPC
                // "change_password" trên Supabase (bcrypt), không còn so sánh/lưu plaintext.
                const {data:ok,error:cpErr}=await supabase.rpc("change_password",{p_id:user.id,p_old_pw:cpwForm.cur,p_new_pw:cpwForm.next});
                if(cpErr){console.error("change_password RPC error:",cpErr);setCpwErr("Lỗi hệ thống, vui lòng thử lại!");return;}
                if(!ok){setCpwErr("Mật khẩu hiện tại không đúng!");return;}
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
