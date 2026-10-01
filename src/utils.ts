// Hằng số dữ liệu mặc định và hàm tiện ích thuần — tách nguyên văn từ App.tsx.

export function isImgAvatar(a){
  return typeof a==="string" && (a.startsWith("data:image")||a.startsWith("http"));
}

export const BOM_MAU_LOAI_DEFAULT = [
  {id:"xh",  ten:"XE KIM MAI 9",   icon:"🚗", mau:"#1d4ed8", thu_tu:1},
  {id:"mb2", ten:"XE MINIBUS X9",  icon:"🚐", mau:"#b45309", thu_tu:2},
];
// (Đã bỏ BOM_MAU_SEED — không còn seed mặc định cho BOM mẫu; xem bomMauByLoai bên dưới.)
// Chuyển tên loại BOM mẫu → id (slug) khi tạo loại mới, đảm bảo không trùng.
export const slugifyLoaiId = (ten) => {
  const base = String(ten||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/đ/gi,"d")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  return base || "loai";
};

// (Đã bỏ SEED — dự án khởi tạo với BOM rỗng, dữ liệu thật chỉ đến từ Supabase.)
export const PROJS_DEF = [
  {id:"proj_xh", ten:"XE KIM MAI 9", mo_ta:"BOM XE KIM MAI 9 ( BẢN MỚI ) · NHÀ MÁY BUS", mau:"#1d4ed8", icon:"🚐", so_xe:1},
  {id:"proj_mb2",ten:"XE MINIBUS X9",  mo_ta:"BOM XE MINIBUS X9 ( BẢN MỚI ) · NHÀ MÁY BUS",  mau:"#b45309", icon:"🚐", so_xe:1},
];
export const uid=()=>`id${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
// ✅ Hàm định dạng số (thêm dấu chấm phân cách hàng nghìn theo chuẩn VN) — dùng ở khắp nơi
// trong app để hiển thị số lượng/tồn kho/thống kê. Nhận null/undefined/chuỗi số/NaN đều an toàn.
export const fmt=(n)=>{
  const num=Number(n);
  if(n==null||n===""||Number.isNaN(num))return "0";
  return num.toLocaleString("vi-VN");
};

// ✅ Hàm lấy màu nền nhạt theo dự án
export const getProjectBgColor = (projId, projs) => {
  const proj = projs.find(p => p.id === projId);
  if (!proj) return "#f9fafb"; // Default màu xám nhạt
  
  // Map màu chủ sang màu nền nhạt
  const colorMap = {
    "#1d4ed8": "#eff6ff", // Xanh đậm → Xanh nhạt (Kim Mai)
    "#b45309": "#fef3c7", // Cam đậm → Cam nhạt (MINI Bus)
  };
  return colorMap[proj.mau] || "#f9fafb";
};

export const mkBom=(pid,arr)=>arr.map(v=>({id:uid(),pid,stt:v.stt,ma:v.id,ten:v.ten,dv:v.dv,dm:v.dm,ng:v.ng,vt:v.vt,gc:v.gc,anh:""}));
export const initBom={};
PROJS_DEF.forEach(p=>{initBom[p.id]=[];}); // Không seed — chờ dữ liệu thật từ Supabase

// ═══════════════════════════════════════════════════════════════
//  USERS & AUTH
// ═══════════════════════════════════════════════════════════════
export const USERS_DEF = [
  {id:"admin",  ten:"QUẢN TRỊ VIÊN", role:"thck",     don_vi:"NHÀ MÁY THCK", avatar:"🏭", mau:"#1d4ed8"},
  {id:"thck01", ten:"NGUYỄN VĂN AN", role:"thck",     don_vi:"NHÀ MÁY THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"thck02", ten:"TRẦN THỊ BÍCH", role:"thck",     don_vi:"NHÀ MÁY THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"xh01",   ten:"LÊ VĂN CƯỜNG",  role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"xh02",   ten:"PHẠM THỊ DUNG", role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"xh03",   ten:"HOÀNG VĂN EM",  role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"kho",    ten:"QUẢN LÝ KHO",   role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"📦", mau:"#0f766e"},
  {id:"kho01",  ten:"TRẦN VĂN HÙNG", role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho02",  ten:"NGUYỄN THỊ LAN",role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho03",  ten:"LÊ VĂN MINH",   role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho04",  ten:"PHẠM THỊ NGA",  role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"khth",   ten:"PHÒNG KH-TH",  role:"khth",     don_vi:"PHÒNG KH-TH",  avatar:"📋", mau:"#7c3aed"},
  // ✅ Các đơn vị "theo dõi tổng thể" — chỉ xem (Vật tư · Phiếu GN · Báo Cáo), không
  // soạn hàng/nhận hàng/quản lý BOM/người dùng. Vai trò suy ra từ donViBaseRole (mặc định "khth").
  {id:"phongkt01", ten:"NV PHÒNG KT",   role:"khth", don_vi:"PHÒNG KT",   avatar:"📋", mau:"#7c3aed"},
  {id:"bancn01",   ten:"NV BAN CN",     role:"khth", don_vi:"BAN CN",     avatar:"📋", mau:"#7c3aed"},
  {id:"banldnm01", ten:"NV BAN LĐNM",   role:"khth", don_vi:"BAN LĐNM",   avatar:"📋", mau:"#7c3aed"},
  // ✅ Các đơn vị chuyên trách riêng từng dòng xe — mỗi đơn vị chỉ Soạn Hàng/Nhận Hàng
  // đúng dòng xe được cấp quyền (xem LINE_QUYEN_DEFAULT). Vai trò suy ra từ quy ước tên
  // (donViBaseRole): "KHO ..." → kho (Soạn Hàng), "XH_..." → xuonghan (Duyệt/Nhận Hàng).
  {id:"kho_citybus01", ten:"NV KHO CITYBUS",  role:"kho",      don_vi:"KHO CITYBUS", avatar:"📦", mau:"#0fe0a4"},
  {id:"kho_12m01",     ten:"NV KHO 12M",      role:"kho",      don_vi:"KHO 12M",     avatar:"📦", mau:"#2f8fff"},
  {id:"xh_minibus01",  ten:"NV XƯỞNG MINIBUS",role:"xuonghan", don_vi:"XH_MINIBUS",  avatar:"🚐", mau:"#ff9a1f"},
  {id:"xh_citybus01",  ten:"NV XƯỞNG CITYBUS",role:"xuonghan", don_vi:"XH_CITYBUS",  avatar:"🚌", mau:"#0fe0a4"},
  {id:"xh_12_01",      ten:"NV XƯỞNG 12M",    role:"xuonghan", don_vi:"XH_12",       avatar:"🚍", mau:"#2f8fff"},
];

// ✅ Tài khoản có quyền QUẢN TRỊ TOÀN HỆ THỐNG (toàn quyền cả 3 dòng xe, thấy tab CMS,
// bỏ qua bảng phân quyền dòng xe...). Gồm "admin" (mặc định) và "xh04" (được nâng cấp
// ngang quyền admin theo yêu cầu — vẫn giữ nguyên đơn vị/role gốc là Xưởng Hàn để không
// ảnh hưởng các luồng nghiệp vụ khác, chỉ được CỘNG THÊM quyền quản trị).
export const isAdminAccount = (u) => !!u && (u.id === "admin" || u.id === "xh04" || u.is_admin === true);


// Cả 2 role đều thấy đủ tabs — chỉ khác quyền hành động
// THCK  → Soạn hàng, tạo phiếu, gửi đơn (KHÔNG xác nhận/duyệt)
// XH    → Xem phiếu, xác nhận, duyệt, quản lý BOM, người dùng
// KHTH  → Vai trò MỚI, chỉ xem — không soạn hàng, không duyệt, không quản lý BOM/người dùng
export const TABS_ALL = [
  ["ds",        "📦 Vật tư"],
  ["soan",      "📋 Soạn Hàng"],
  ["duyet",     "✅ Kiểm Tra Xác Nhận"],
  ["pgn",       "📄 Phiếu GN"],
  ["bc",        "📈 Báo Cáo"],
  ["hoanthanh", "🏁 Dự Án Đã Hoàn Thành Vật Tư"],
  ["bom_mau",   "🗂️ Tạo BOM Mẫu"],
  ["users",     "👥 Phân Quyền Sử Dụng"],
];
export const TABS_THCK     = TABS_ALL.filter(([k])=>!["users","duyet","bom_mau"].includes(k));
export const TABS_XUONGHAN = TABS_ALL.filter(([k])=>!["users"].includes(k));
export const TABS_KHO      = TABS_ALL.filter(([k])=>!["duyet","bom_mau","users"].includes(k));
// ✅ [Cập nhật] KHTH: trước đây "chỉ xem" (bỏ hẳn Soạn Hàng/Duyệt/BOM Mẫu) — nay đã được
// NÂNG QUYỀN ngang với "XƯỞNG HÀN" tổng thể: thấy đủ mọi tab nghiệp vụ, chỉ vẫn ẩn
// "👥 Người dùng" (quản lý tài khoản vẫn chỉ dành riêng cho admin/is_admin).
export const TABS_KHTH     = TABS_ALL.filter(([k])=>!["users"].includes(k));

// ✅ Danh sách khoá (key) của các bộ tab theo từng VAI TRÒ — dùng làm "mặc định" cho
// bảng "Phân quyền chức năng theo đơn vị" (xem TAB_QUYEN_DEFAULT bên dưới) khi 1 đơn vị
// chưa được admin cấu hình riêng.
export const TABS_THCK_KEYS     = TABS_THCK.map(([k])=>k);
export const TABS_XUONGHAN_KEYS = TABS_XUONGHAN.map(([k])=>k);
export const TABS_KHO_KEYS      = TABS_KHO.map(([k])=>k);
export const TABS_KHTH_KEYS     = TABS_KHTH.map(([k])=>k);
// Bộ khoá mặc định theo vai trò — dùng khi 1 đơn vị (kể cả đơn vị tự thêm sau này) chưa
// có dòng riêng trong bảng "quyen_chuc_nang" trên Supabase.
export const TAB_KEYS_BY_ROLE = {thck:TABS_THCK_KEYS, xuonghan:TABS_XUONGHAN_KEYS, kho:TABS_KHO_KEYS, khth:TABS_KHTH_KEYS};

// ═══════════════════════════════════════════════════════════════
//  🏷️ GIAI ĐOẠN 1 — Đổi nhãn qua CMS (bảng "app_labels" trên Supabase)
//  Admin sửa chữ hiển thị của bất kỳ key nào trong APP_I18N mà KHÔNG cần
//  sửa code. Xem SQL tạo bảng ở comment cạnh khai báo state cmsItems.
//
//  IMPORT_FIELD_LABEL_KEYS: ánh xạ "field kỹ thuật" (cột trong bom_items,
//  vd 'dm') → các key nhãn trong APP_I18N liên quan (vd 'lbDM1XE'). Dùng
//  bởi hàm Import Excel/CSV để tự nhận diện tên cột theo ĐÚNG nhãn admin
//  đang hiển thị hiện tại (kể cả sau khi đã đổi qua CMS), KHÔNG cần sửa
//  code mỗi lần đổi nhãn. Field nào chưa có trong danh sách này (jig,
//  ckgh, px, dai, rong, day_kt, tram, tnxh...) vẫn dùng danh sách tên cột
//  viết cứng như cũ — muốn linh hoạt luôn thì thêm key nhãn cho nó vào
//  APP_I18N rồi khai báo thêm 1 dòng ở đây.
// ═══════════════════════════════════════════════════════════════
export const IMPORT_FIELD_LABEL_KEYS = {
  ma:  ["lbMa","lbMaReq"],
  ten: ["lbTen","lbTenReq"],
  dv:  ["lbDV"],
  dm:  ["lbDM1XE"],
  vt:  ["lbVT"],
  gc:  ["thGhiChu"],
  ng:  ["thNguonGoc"],
  px:  ["phanXuong"],
};

// ═══════════════════════════════════════════════════════════════
//  🧩 GIAI ĐOẠN 2 — "Cột dự phòng" (spare fields) cho bảng vật tư (bom_items)
//  Thay vì mỗi lần thêm cột mới phải sửa code + sửa Supabase (như 7 trường riêng
//  của dòng xe 12m: ckgh, px, dai, rong, day_kt, tram, tnxh), ta cấp sẵn 5 "ô trống"
//  dùng chung tên kỹ thuật o1..o5, lưu chung trong 1 cột jsonb "tuy_bien". Admin vào
//  CMS đặt tên (nhãn)/kiểu/ẩn-hiện cho từng ô — theo TỪNG DÒNG XE — mà không cần đụng
//  code hay chạy SQL. Hết 5 ô mới cần cân nhắc thêm ô hoặc nâng cấp lên field-builder
//  đầy đủ (Giai đoạn 3).
// ═══════════════════════════════════════════════════════════════
export const SPARE_FIELD_SLOTS = ["o1","o2","o3","o4","o5"];

// 🧭 Nhãn menu sidebar (Vật tư, Soạn hàng, Kiểm tra xác nhận, Phiếu GN, Báo cáo,
// Dự án đã hoàn thành vật tư, Tạo BOM mẫu, Phân quyền sử dụng, Quản trị CMS) — CHỈ ảnh
// hưởng ĐÚNG chữ hiển thị trên nút sidebar (xem dòng dùng "tab_${k}" trong sidebar),
// KHÔNG ảnh hưởng tiêu đề/nội dung bên trong từng trang. Áp dụng cho MỌI vai trò đăng
// nhập (Xưởng Hàn, Kho, KHTH...) vì đều đọc chung 1 nguồn nhãn này qua t(). Cũng như
// mọi nhãn khác, được lưu RIÊNG theo từng dòng xe (xem LabelManager).
export const SIDEBAR_LABEL_KEYS = ["tab_ds","tab_soan","tab_duyet","tab_pgn","tab_bc","tab_hoanthanh","tab_bom_mau","tab_users","tab_cms","tab_gopy","tab_huongdan"];
