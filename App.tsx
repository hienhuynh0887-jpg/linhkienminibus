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
//     thu_tu integer default 0
//   );
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
  {id:"proj_xh", ten:"XE KIM MAI 9", mo_ta:"BOM XE KIM MAI 9 ( Bản mới ) · Nhà Máy Bus", mau:"#1d4ed8", icon:"🚐", so_xe:1},
  {id:"proj_mb2",ten:"XE MINIBUS X9",  mo_ta:"BOM XE MINIBUS X9 ( Bản mới ) · Nhà Máy Bus",  mau:"#b45309", icon:"🚐", so_xe:1},
];
const uid=()=>`id${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;

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
  {id:"admin",  ten:"Quản trị viên", pw:"thck2024", role:"thck",     don_vi:"Nhà máy THCK", avatar:"🏭", mau:"#1d4ed8"},
  {id:"thck01", ten:"Nguyễn Văn An", pw:"thck01",   role:"thck",     don_vi:"Nhà máy THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"thck02", ten:"Trần Thị Bích", pw:"thck02",   role:"thck",     don_vi:"Nhà máy THCK", avatar:"👤", mau:"#1d4ed8"},
  {id:"xh01",   ten:"Lê Văn Cường",  pw:"xh01",     role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"xh02",   ten:"Phạm Thị Dung", pw:"xh02",     role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"xh03",   ten:"Hoàng Văn Em",  pw:"xh03",     role:"khth", don_vi:"XƯỞNG HÀN",    avatar:"📋", mau:"#b45309"},
  {id:"kho",    ten:"Quản lý Kho",   pw:"kho2024",  role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"📦", mau:"#0f766e"},
  {id:"kho01",  ten:"Trần Văn Hùng", pw:"kho01",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho02",  ten:"Nguyễn Thị Lan",pw:"kho02",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho03",  ten:"Lê Văn Minh",   pw:"kho03",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"kho04",  ten:"Phạm Thị Nga",  pw:"kho04",    role:"kho",      don_vi:"KHO VẬT TƯ",   avatar:"🏪", mau:"#0f766e"},
  {id:"khth",   ten:"Phòng KH-TH",  pw:"khth2024", role:"khth",     don_vi:"Phòng KH-TH",  avatar:"📋", mau:"#7c3aed"},
  // ✅ Các đơn vị "theo dõi tổng thể" — chỉ xem (Vật tư · Phiếu GN · Báo Cáo), không
  // soạn hàng/nhận hàng/quản lý BOM/người dùng. Vai trò suy ra từ donViBaseRole (mặc định "khth").
  {id:"phongkt01", ten:"NV Phòng KT",   pw:"phongkt01", role:"khth", don_vi:"Phòng KT",   avatar:"📋", mau:"#7c3aed"},
  {id:"bancn01",   ten:"NV Ban CN",     pw:"bancn01",   role:"khth", don_vi:"Ban CN",     avatar:"📋", mau:"#7c3aed"},
  {id:"banldnm01", ten:"NV Ban LĐNM",   pw:"banldnm01", role:"khth", don_vi:"Ban LĐNM",   avatar:"📋", mau:"#7c3aed"},
  // ✅ Các đơn vị chuyên trách riêng từng dòng xe — mỗi đơn vị chỉ Soạn Hàng/Nhận Hàng
  // đúng dòng xe được cấp quyền (xem LINE_QUYEN_DEFAULT). Vai trò suy ra từ quy ước tên
  // (donViBaseRole): "KHO ..." → kho (Soạn Hàng), "XH_..." → xuonghan (Duyệt/Nhận Hàng).
  {id:"kho_citybus01", ten:"NV Kho CityBus",  pw:"citybus01", role:"kho",      don_vi:"KHO CITYBUS", avatar:"📦", mau:"#0fe0a4"},
  {id:"kho_12m01",     ten:"NV Kho 12M",      pw:"kho12m01",  role:"kho",      don_vi:"KHO 12M",     avatar:"📦", mau:"#2f8fff"},
  {id:"xh_minibus01",  ten:"NV Xưởng Minibus",pw:"xhmini01",  role:"xuonghan", don_vi:"XH_MINIBUS",  avatar:"🚐", mau:"#ff9a1f"},
  {id:"xh_citybus01",  ten:"NV Xưởng CityBus",pw:"xhcity01",  role:"xuonghan", don_vi:"XH_CITYBUS",  avatar:"🚌", mau:"#0fe0a4"},
  {id:"xh_12_01",      ten:"NV Xưởng 12M",    pw:"xh12m01",   role:"xuonghan", don_vi:"XH_12",       avatar:"🚍", mau:"#2f8fff"},
];

// Cả 2 role đều thấy đủ tabs — chỉ khác quyền hành động
// THCK  → Soạn hàng, tạo phiếu, gửi đơn (KHÔNG xác nhận/duyệt)
// XH    → Xem phiếu, xác nhận, duyệt, quản lý BOM, người dùng
// KHTH  → Vai trò MỚI, chỉ xem — không soạn hàng, không duyệt, không quản lý BOM/người dùng
const TABS_ALL = [
  ["ds",      "📦 Vật tư"],
  ["soan",    "📋 Soạn Hàng"],
  ["duyet",   "✅ Nhận Hàng"],
  ["pgn",     "📄 Phiếu GN"],
  ["bc",      "📈 Báo Cáo"],
  ["bom_mau", "🗂️ BOM Mẫu"],
  ["users",   "👥 Người dùng"],
];
const TABS_THCK     = TABS_ALL.filter(([k])=>!["users","duyet","bom_mau"].includes(k));
const TABS_XUONGHAN = TABS_ALL.filter(([k])=>!["users"].includes(k));
const TABS_KHO      = TABS_ALL.filter(([k])=>!["duyet","bom_mau","users"].includes(k));
// KHTH: chỉ xem — bỏ hẳn các tab thao tác (Soạn Hàng, Duyệt Đơn, BOM Mẫu, Người dùng)
const TABS_KHTH     = TABS_ALL.filter(([k])=>!["soan","duyet","bom_mau","users"].includes(k));

// ─── Từ điển đa ngôn ngữ TOÀN APP (dùng qua LangCtx) ────────────────
const APP_I18N = {
  // Tabs
  tab_ds:      {vi:"📦 Vật tư",        zh:"📦 物料"},
  tab_soan:    {vi:"📋 Soạn Hàng",     zh:"📋 备料"},
  tab_duyet:   {vi:"✅ Nhận Hàng",     zh:"✅ 收货"},
  tab_pgn:     {vi:"📄 Phiếu GN",      zh:"📄 收发单"},
  tab_bc:      {vi:"📈 Báo Cáo",       zh:"📈 报表"},
  tab_bom_mau: {vi:"🗂️ BOM Mẫu",      zh:"🗂️ BOM模板"},
  tab_users:   {vi:"👥 Người dùng",    zh:"👥 用户"},
  // Header brand / role
  brandTitle:  {vi:"Quản Lý Vật Tư BOM", zh:"BOM 物料管理系统"},
  roleTHCK:    {vi:"Nhà máy THCK",     zh:"THCK 工厂"},
  roleKHO:     {vi:"KHO VẬT TƯ",       zh:"物料仓库"},
  roleXH:      {vi:"XƯỞNG HÀN",        zh:"焊接车间"},
  roleKHTH:    {vi:"Phòng KH-TH",      zh:"计划综合科"},
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
    brand: "Quản Lý Vật Tư BOM",
    brandSub: "Xưởng hàn xe buýt",
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
.kl-select-login .brand{display:flex; align-items:center; gap:14px; cursor:pointer; transition:opacity .2s ease;}
.kl-select-login .brand:hover{opacity:.8;}
.kl-select-login .brand-mark{height:44px; width:auto; flex-shrink:0; object-fit:contain;}
.kl-select-login .brand-text .eyebrow{
  font-family:'JetBrains Mono', monospace;
  font-size:11px;
  letter-spacing:.18em;
  color:var(--muted);
  text-transform:uppercase;
}
.kl-select-login .brand-text h1{
  font-family:'Oswald', sans-serif;
  font-size:22px;
  font-weight:600;
  letter-spacing:.04em;
  text-transform:uppercase;
  color:var(--text);
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
.kl-select-login .hero .eyebrow{
  font-family:'Oswald', sans-serif;
  font-size:clamp(22px, 3vw, 32px);
  font-weight:700;
  letter-spacing:.08em;
  color:var(--steel);
  text-transform:uppercase;
  margin-bottom:10px;
}
.kl-select-login .hero h2{
  font-family:'Oswald', sans-serif;
  font-weight:500;
  font-size:clamp(18px, 2.2vw, 24px);
  text-transform:uppercase;
  letter-spacing:.01em;
  line-height:1.2;
  color:var(--muted);
}
.kl-select-login .hero p{margin-top:12px; color:var(--muted); font-size:15px; max-width:520px;}
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
  background:rgba(249,115,22,0.08); border:1.5px solid #f97316; border-radius:999px; color:#f97316;
  font-family:'JetBrains Mono', monospace;
  font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
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
// Mỗi đơn vị (Nhà máy THCK / XƯỞNG HÀN / KHO VẬT TƯ / Phòng KH-TH / các phòng ban tự thêm)
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

// ═══════════════════════════════════════════════════════════════
//  ĐƠN VỊ "CHUYÊN TRÁCH" — LUÔN VÀO THẲNG ĐÚNG TAB, KHÔNG BAO GIỜ RA "TỔNG QUAN"
// ═══════════════════════════════════════════════════════════════
// ✅ Các đơn vị dưới đây (Nhà máy THCK, Kho Vật Tư, Kho CityBus, Kho 12M, XH_Minibus,
// XH_CityBus, XH_12) PHẢI vào THẲNG đúng tab nghiệp vụ của mình ngay sau khi đăng nhập:
//   - Nhóm "kho/soạn hàng" (Nhà máy THCK, KHO VẬT TƯ, KHO CITYBUS, KHO 12M) → tab "soan" (📋 Soạn Hàng)
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
// trách — VD "Nhà máy THCK" từng bị lưu luôn cả "12M"/"CityBus" khiến allerd[0] trả về
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
  const baseBtn={border:"none",borderRadius:999,cursor:"pointer",fontFamily:"inherit",padding:"7px 16px",fontSize:12};
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10}}>
      <button onClick={onBack}
        style={{...baseBtn,background:"rgba(249,115,22,0.12)",color:"#fdba74",fontWeight:700,border:"1.5px solid #f97316",flexShrink:0}}>
        ← Trở về
      </button>
      {/* Wrapper co giãn để CĂN GIỮA, nhưng viền cam chỉ ôm sát đúng nội dung "Dòng xe: ..." */}
      <div style={{flex:1,display:"flex",justifyContent:"center",minWidth:0}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"4px 10px",border:`2px solid ${badgeBorderColor}`,maxWidth:"100%"}}>
          <VehicleIconCircle lineId={activeLine} size={20}/>
          <span style={{fontSize:10,opacity:.75,whiteSpace:"nowrap"}}>Dòng xe:</span>
          <span style={{fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{KL_LINES.find(l=>l.id===activeLine)?.title||"Mini Bus"}</span>
        </div>
      </div>
      <button onClick={onLogout}
        style={{...baseBtn,background:"rgba(0,0,0,0.45)",color:"#fff",fontWeight:800,border:"1.5px solid #f97316",flexShrink:0}}>
        Đăng xuất
      </button>
    </div>
  );
}
const LINE_QUYEN_DEFAULT = {
  "Nhà máy THCK": ["minibus"],
  "XƯỞNG HÀN":    ["minibus","citybus","12m"],
  "KHO VẬT TƯ":   ["minibus"],
  "Phòng KH-TH":  ["minibus","citybus","12m"],
  // ✅ Các đơn vị chuyên trách riêng từng dòng xe (soạn hàng / nhận hàng tách biệt):
  "KHO CITYBUS":  ["citybus"],
  "KHO 12M":      ["12m"],
  "XH_MINIBUS":   ["minibus"],
  "XH_CITYBUS":   ["citybus"],
  "XH_12":        ["12m"],
  // ✅ Các đơn vị "theo dõi tổng thể" — xem toàn bộ 3 dòng xe (không thao tác soạn/nhận):
  "Phòng KT":     ["minibus","citybus","12m"],
  "Ban CN":       ["minibus","citybus","12m"],
  "Ban LĐNM":     ["minibus","citybus","12m"],
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
function LoginScreen({onLogin, resume, onLogout}){
  // "gate" (đăng nhập tài khoản) → "select" (chọn dòng xe) → "project" (chọn trạng thái dự án)
  const [step, setStep]   = useState(resume ? "project" : "gate");
  const [activeLine, setActiveLine] = useState(resume?.activeLine || null);
  const [uid2, setUid2]   = useState("");
  const [pw, setPw]       = useState("");
  const [err, setErr]     = useState("");
  const [userList,setUserList]=useState(resume?.userList || USERS_DEF);
  const [authedUser,setAuthedUser]=useState(resume?.authedUser || null);
  const [lineQuyen,setLineQuyen]=useState(LINE_QUYEN_DEFAULT); // phân quyền dòng xe theo đơn vị
  const {lang} = useLang();
  const t = LOGIN_I18N[lang];

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
    if(u.id==="admin") return LINE_IDS;
    return lineQuyen[u.don_vi] || [];
  };

  // ── Bước 1: Đăng nhập tài khoản (cổng vào chung) ──
  // ✅ QUY ƯỚC ĐIỀU HƯỚNG THEO ĐƠN VỊ:
  //   - Đơn vị chỉ được cấp ĐÚNG 1 dòng xe (VD: XH_MINIBUS, KHO CITYBUS, KHO 12M, XH_CITYBUS,
  //     XH_12, Nhà máy THCK, KHO VẬT TƯ...) → bỏ qua màn "Chọn dòng xe" (ảnh 2), vào THẲNG
  //     "Hệ thống chính" (ảnh 1) với dòng xe duy nhất đó, y hệt bấm "Đang thực hiện".
  //   - Đơn vị được cấp NHIỀU dòng xe (VD: Xưởng Hàn, Phòng KH-TH, Phòng KT, Ban CN, Ban LĐNM
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
      // ✅ Đơn vị chuyên trách (Nhà máy THCK/KHO VẬT TƯ/KHO CITYBUS/KHO 12M/XH_MINIBUS/
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
    setStep("select");
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
    setStep("project");
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

  const backToSelect=()=>{ setErr(""); setStep("select"); };

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
                    {userList.filter(u=>!u.an).map(u=>(
                      <option key={u.id} value={u.id}>{`${u.avatar} ${u.ten} (${u.don_vi})`}</option>
                    ))}
                  </datalist>
                </div>
                <div className="field field-icon">
                  <label>Mật khẩu</label>
                  <div className="input-wrap">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    <input type="password" value={pw}
                      onChange={e=>{setPw(e.target.value);setErr("");}}
                      placeholder="Nhập mật khẩu" required/>
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

      <header>
        <div className="brand" onClick={backToSelect} title="Về trang chọn dòng xe">
          <img className="brand-mark" src={KL_LOGO_B64} alt="Kim Long Motor"/>
          <div className="brand-text">
            <div className="eyebrow">Production System</div>
            <h1>Kim Long Motor</h1>
          </div>
        </div>
        {/* ✅ Thay "● ONLINE" bằng nút Đăng xuất — viền cam, nền đen nhạt, chữ trắng in đậm */}
        <button onClick={()=>{setAuthedUser(null);setErr("");setStep("gate");onLogout&&onLogout();}} title="Đăng xuất"
          style={{border:"1.5px solid #f97316",borderRadius:999,background:"rgba(0,0,0,0.45)",color:"#fff",fontWeight:800,fontSize:12,padding:"7px 16px",cursor:"pointer",fontFamily:"inherit"}}>
          Đăng xuất
        </button>
      </header>

      {step==="select" && (
        <div id="select-view">
          <div className="hero">
            <div className="eyebrow">Hệ thống quản lý vật tư</div>
            <h2>Bạn muốn chọn dòng xe nào?</h2>
            <p>Chọn dòng sản phẩm để tiếp tục vào hệ thống quản lý sản xuất tương ứng.</p>
          </div>
          <main>
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
const DEFAULT_CUSTOM_DEPTS = ["KHO CITYBUS","KHO 12M","XH_MINIBUS","XH_CITYBUS","XH_12","Phòng KT","Ban CN","Ban LĐNM"];

function UsersPanel({currentUser, users, setUsers, dbUpsertUser, dbDeleteUser, lockOtherXH, lineQuyen, setLineQuyen, dbUpsertQuyenDongXe}){
  const {t} = useLang();
  const [form, setForm]   = useState({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧"});
  const [editing,setEdit] = useState(null);
  const [flash2, setFlash2]= useState("");
  // ✅ Danh sách phòng/ban tùy chỉnh do người dùng tự thêm (hoạt động như "Phòng KH-TH" — chỉ xem, không thao tác)
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
      if(s){
        const saved=JSON.parse(s);
        // Đảm bảo các đơn vị mặc định mới luôn có mặt, kể cả với máy đã từng lưu customDepts trước đó
        return Array.from(new Set([...saved,...DEFAULT_CUSTOM_DEPTS]));
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
        const missingOnServer=local.filter(d=>!remoteList.includes(d));
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
  //   còn lại      → "khth" (chỉ xem, như Phòng KH-TH) — VD: "Phòng KT", "Ban CN"
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

  // ✅ Đổi tên 1 đơn vị tùy chỉnh — cập nhật đồng bộ: danh sách đơn vị, phân quyền dòng xe,
  // và toàn bộ tài khoản đang thuộc đơn vị đó (đổi sang tên mới), cả trên Supabase.
  const renameCustomDept=async(oldName)=>{
    const name=window.prompt(`Đổi tên đơn vị "${oldName}" thành:`,oldName);
    if(!name||!name.trim()||name.trim()===oldName)return;
    const newName=name.trim();
    if(customDepts.includes(newName)||BASE_DON_VI.includes(newName)){alert(`⚠️ Tên đơn vị "${newName}" đã tồn tại!`);return;}
    setCustomDepts(l=>{
      const updated=l.map(d=>d===oldName?newName:d);
      try{localStorage.setItem("customDepts",JSON.stringify(updated));}catch{}
      return updated;
    });
    const oldLines=lineQuyen[oldName]||[];
    setLineQuyen(q=>{const {[oldName]:_,...rest}=q;return {...rest,[newName]:oldLines};});
    dbUpsertQuyenDongXe&&dbUpsertQuyenDongXe(newName,oldLines);
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

  // ✅ Xoá 1 đơn vị tùy chỉnh — chặn xoá nếu còn tài khoản đang thuộc đơn vị đó.
  const deleteCustomDept=async(name)=>{
    const affected=users.filter(u=>u.don_vi===name);
    if(affected.length>0){
      alert(`⚠️ Không thể xoá "${name}" vì còn ${affected.length} tài khoản đang thuộc đơn vị này.\nVui lòng đổi đơn vị cho các tài khoản đó trước khi xoá.`);
      return;
    }
    if(!window.confirm(`Xoá đơn vị "${name}"? Hành động này không thể hoàn tác.`))return;
    setCustomDepts(l=>{
      const updated=l.filter(d=>d!==name);
      try{localStorage.setItem("customDepts",JSON.stringify(updated));}catch{}
      return updated;
    });
    setLineQuyen(q=>{const {[name]:_,...rest}=q;return rest;});
    try{ await supabase.from("custom_depts").delete().eq("ten",name); }
    catch(e){console.error("Xoá đơn vị thất bại:",e.message);}
  };
  const inp={width:"100%",padding:"8px 10px",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#f0f4ff",boxShadow:"0 1px 4px rgba(99,102,241,0.08)"};
  const btn={border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"5px 11px"};
  const fl=m=>{setFlash2(m);setTimeout(()=>setFlash2(""),2500);};

  const save=()=>{
    if(!form.id.trim()||!form.ten.trim()||!form.pw.trim()){fl("⚠️ Điền đủ thông tin!");return;}
    if(editing){
      setUsers(l=>l.map(u=>u.id===editing?{...u,...form}:u));
      dbUpsertUser&&dbUpsertUser({...form});
      fl("✓ Đã cập nhật");
    } else {
      if(users.find(u=>u.id===form.id)){fl("⚠️ ID đã tồn tại!");return;}
      setUsers(l=>[...l,{...form}]);
      dbUpsertUser&&dbUpsertUser({...form});
      fl("✓ Đã thêm tài khoản");
    }
    setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧"});setEdit(null);
  };
  const del=id=>{
    if(id===currentUser.id){fl("⚠️ Không thể xóa tài khoản đang dùng!");return;}
    if(!window.confirm("Xóa tài khoản này?"))return;
    setUsers(l=>l.filter(u=>u.id!==id));
    dbDeleteUser&&dbDeleteUser(id);
    fl("✓ Đã xóa");
  };
  const anTaiKhoan=async id=>{
    const u=users.find(x=>x.id===id);
    if(!u){fl("⚠️ Không tìm thấy tài khoản!");return;}
    if(id===currentUser.id){fl("⚠️ Không thể ẩn tài khoản đang dùng!");return;}
    const newAn=!u.an;
    const msg=newAn
      ?`Ẩn tài khoản "${u.ten}"?\nTài khoản này sẽ không xuất hiện ở màn hình đăng nhập.`
      :`Hiện tài khoản "${u.ten}"?\nTài khoản này sẽ xuất hiện lại ở màn hình đăng nhập.`;
    if(!window.confirm(msg))return;
    const ok=await dbUpsertUser({...u,an:newAn});
    if(!ok)return;
    setUsers(l=>l.map(x=>x.id===id?{...x,an:newAn}:x));
    fl(newAn?"✓ Đã ẩn tài khoản":"✓ Đã hiện tài khoản");
  };
  const startEdit=u=>{setForm({...u});setEdit(u.id);};
  const resetForm=()=>{setForm({id:"",ten:"",pw:"",role:"xuonghan",don_vi:"XƯỞNG HÀN",avatar:"🔧"});setEdit(null);};

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
  const ALL_LINES_META=[{id:"12m",label:"Xe 12M"},{id:"citybus",label:"City Bus"},{id:"minibus",label:"Mini Bus"}];
  const BASE_DON_VI=["Nhà máy THCK","XƯỞNG HÀN","KHO VẬT TƯ","Phòng KH-TH"];
  const allDonViGroups=[...BASE_DON_VI, ...customDepts.filter(d=>!BASE_DON_VI.includes(d))];
  const toggleLineQuyen=(donVi,lineId)=>{
    const cur=lineQuyen[donVi]||[];
    const next=cur.includes(lineId)?cur.filter(x=>x!==lineId):[...cur,lineId];
    setLineQuyen(q=>({...q,[donVi]:next}));
    dbUpsertQuyenDongXe&&dbUpsertQuyenDongXe(donVi,next);
  };

  return(
    <div>
      <div style={{background:"#fff",borderRadius:10,padding:"16px 18px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:4,color:"#1f2937"}}>🚌 Phân quyền dòng xe theo đơn vị</div>
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
                        <button onClick={()=>deleteCustomDept(dv)} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"4px 9px",fontSize:11}}>Xoá</button>
                      </div>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button onClick={()=>addCustomDept(false)} style={{...btn,background:"#eef2ff",color:"#4338ca",fontWeight:700,padding:"7px 14px",marginTop:12}}>➕ Thêm đơn vị</button>
      </div>

      <div style={{background:"#fff",borderRadius:10,padding:"16px 18px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:14,color:"#1f2937"}}>{editing?"✏️ Cập nhật tài khoản":"➕ Thêm tài khoản mới"}</div>
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
                const r=v;setForm(f=>({...f,role:r,don_vi:r==="thck"?"Nhà máy THCK":r==="kho"?"KHO VẬT TƯ":r==="khth"?"Phòng KH-TH":"XƯỞNG HÀN",avatar:r==="thck"?"🏭":r==="kho"?"📦":r==="khth"?"📋":"🚗"}));
              }} style={inp}>
              <option value="thck">🏭 Nhà máy THCK</option>
              <option value="xuonghan">🚗 XƯỞNG HÀN</option>
              <option value="kho">📦 KHO VẬT TƯ</option>
              <option value="khth">📋 Phòng KH-TH (chỉ xem)</option>
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
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:flash2.startsWith("⚠️")?"#dc2626":"#16a34a",minWidth:160}}>{flash2}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {editing&&<button onClick={resetForm} style={{...btn,background:"#f3f4f6",color:"#374151",padding:"7px 14px"}}>Hủy</button>}
            {currentUser.id==="xh04"&&<button onClick={lockOtherXH} style={{...btn,background:"#dc2626",color:"#fff",padding:"7px 14px"}}>🔒 Khóa XH khác</button>}
            <button onClick={save} style={{...btn,background:"#1d4ed8",color:"#fff",padding:"7px 18px",fontSize:13}}>{editing?"Lưu cập nhật":"Thêm tài khoản"}</button>
          </div>
        </div>
      </div>

      {(()=>{
        // ✅ TRƯỚC ĐÂY: chỉ gom tài khoản theo 4 VAI TRÒ (thck/xuonghan/kho/khth) — nghĩa là
        // MỌI đơn vị cùng vai trò "kho" (KHO VẬT TƯ, KHO CITYBUS, KHO 12M...) bị dồn chung
        // vào MỘT bảng "📦 KHO VẬT TƯ" duy nhất, và mọi đơn vị "khth" (Phòng KH-TH, Phòng KT,
        // Ban CN, BAN LĐNM...) bị dồn chung vào bảng "📋 Phòng KH-TH" — không tách riêng
        // được từng đơn vị như mong muốn.
        // NAY: mỗi ĐƠN VỊ (don_vi) có bảng tài khoản RIÊNG của mình — giống hệt cách 3 đơn vị
        // gốc (Nhà máy THCK / XƯỞNG HÀN / KHO VẬT TƯ) đang hiển thị — áp dụng chung cho MỌI
        // đơn vị tùy chỉnh (Phòng KT, Ban CN, KHO CITYBUS, KHO 12M, XH_MINIBUS, XH_CITYBUS,
        // XH_12M, BAN LĐNM...), kể cả các đơn vị thêm sau này, không cần sửa code thêm nữa.
        const roleMeta={thck:{icon:"🏭",mau:"#1d4ed8"},xuonghan:{icon:"🚗",mau:"#b45309"},kho:{icon:"📦",mau:"#0f766e"},khth:{icon:"📋",mau:"#7c3aed"}};
        const baseRoleOf=dv=>dv==="Nhà máy THCK"?"thck":dv==="XƯỞNG HÀN"?"xuonghan":dv==="KHO VẬT TƯ"?"kho":dv==="Phòng KH-TH"?"khth":donViBaseRole(dv);
        // Đề phòng tài khoản nào đó có don_vi không khớp bất kỳ đơn vị nào đang biết (đơn vị
        // đã bị xoá/đổi tên...) — vẫn gom vào 1 nhóm riêng theo đúng tên đó để KHÔNG có tài
        // khoản nào bị "mất tích" khỏi danh sách.
        const knownDv=new Set(allDonViGroups);
        const extraDv=Array.from(new Set(users.filter(u=>!knownDv.has(u.don_vi)).map(u=>u.don_vi)));
        const allGroupDv=[...allDonViGroups,...extraDv];
        return allGroupDv.map(dv=>{
          const grpList=users.filter(u=>u.don_vi===dv);
          const role=grpList[0]?.role||baseRoleOf(dv);
          const meta=roleMeta[role]||roleMeta.khth;
          const grpOnline=grpList.filter(isOnline).length;
          const grpMau=meta.mau, grpLabel=`${meta.icon} ${dv}`;
          return(
            <div key={dv} style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",marginBottom:12}}>
              <div style={{padding:"10px 16px",borderBottom:"1px solid #e5e7eb",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:10,background:"#f8fafc"}}>
                <span>{grpLabel}</span>
                <span style={{background:grpMau,color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:11}}>{grpList.length} tài khoản</span>
                {grpOnline>0&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#dcfce7",color:"#15803d",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}><span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>{grpOnline} online</span>}
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                    {["","ID",t("thHoTen"),t("lbDV"),t("thTrangThai"),t("thMatKhau"),"","",""].map((h,i)=><th key={i} style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:"#6b7280",fontSize:11}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {grpList.map((u,i)=>(
                      <tr key={u.id} style={{borderBottom:"1px solid #f1f5f9",background:u.id===currentUser.id?"#eff6ff":i%2===0?"#fff":"#f9fafb"}}>
                        <td style={{padding:"8px 12px",fontSize:20,width:40}}>{u.avatar}</td>
                        <td style={{padding:"8px 12px",fontWeight:700,color:grpMau,fontFamily:"monospace"}}>{u.id}</td>
                        <td style={{padding:"8px 12px",fontWeight:600}}>{u.ten}{u.id===currentUser.id&&<span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"1px 8px",fontSize:10,marginLeft:6,fontWeight:700}}>Đang dùng</span>}</td>
                        <td style={{padding:"8px 12px",color:"#6b7280"}}>{u.don_vi}</td>
                        <td style={{padding:"8px 12px"}}>
                          {isOnline(u)
                            ?<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#dcfce7",color:"#15803d",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}><span style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>Online</span>
                            :<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f3f4f6",color:"#9ca3af",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}><span style={{width:7,height:7,borderRadius:"50%",background:"#cbd5e1",display:"inline-block"}}/>Offline</span>}
                        </td>
                        <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{"•".repeat(Math.min(u.pw.length,8))}</td>
                        <td style={{padding:"8px 12px"}}><button onClick={()=>startEdit(u)} style={{...btn,background:"#fef3c7",color:"#92400e"}}>Sửa</button></td>
                        <td style={{padding:"8px 12px"}}><button onClick={()=>anTaiKhoan(u.id)} disabled={u.id===currentUser.id} style={{...btn,background:u.id===currentUser.id?"#f3f4f6":u.an?"#dbeafe":"#fef3c7",color:u.id===currentUser.id?"#9ca3af":u.an?"#1d4ed8":"#92400e",fontWeight:700}}>{u.an?"Hiện tk":"Ẩn tk"}</button></td>
                        <td style={{padding:"8px 12px"}}><button onClick={()=>del(u.id)} disabled={u.id===currentUser.id} style={{...btn,background:u.id===currentUser.id?"#f3f4f6":"#fee2e2",color:u.id===currentUser.id?"#9ca3af":"#991b1b"}}>Xóa</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        });
      })()}
    </div>
  );
}

const fmt=n=>(n||0).toLocaleString("vi-VN");
const E0={stt:0,ma:"",ten:"",dv:"Cái",dm:1,ng:"",vt:"",jig:"",gc:"",anh:""};

// ── Thứ tự chuẩn Nguồn gốc: SUB MINI 1 → SUB MINI 2 → UB → MB → FT ──
const DM_ORDER=["SUB MINI 1","SUB MINI 2","UB","MB","FT"];
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
async function xuatExcel(rows, tenFile="BaoCao", tieuDe="Báo cáo vật tư"){
  const {utils, writeFile} = await import("xlsx");
  const ws = utils.json_to_sheet(rows);
  // Tô đậm header
  const range = utils.decode_range(ws["!ref"]||"A1");
  for(let C=range.s.c;C<=range.e.c;C++){
    const addr=utils.encode_cell({r:0,c:C});
    if(ws[addr]){ws[addr].s={font:{bold:true},fill:{fgColor:{rgb:"1D4ED8"}}};}
  }
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, tieuDe.slice(0,31));
  writeFile(wb, `${tenFile}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// HTML/CSS dùng chung cho bản in & bản render ảnh/PDF
const BAO_CAO_STYLE=`
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:16px;background:#fff;}
  h2{font-size:15px;font-weight:700;margin-bottom:4px;color:#1d4ed8;}
  p.sub{font-size:10px;color:#6b7280;margin-bottom:12px;}
  table{width:100%;border-collapse:collapse;font-size:10px;}
  thead tr{background:#1d4ed8;color:#fff;}
  th{padding:5px 7px;text-align:left;font-weight:700;white-space:nowrap;}
  td{padding:4px 7px;border-bottom:1px solid #e5e7eb;}
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
function ExportBar({onExcel, onPDF, shareTitle="", shareText="", label=""}){
  const [busy, setBusy] = useState(false);
  const {t} = useLang();
  const s={border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,padding:"6px 13px",display:"flex",alignItems:"center",gap:5};

  const handleClick = async () => {
    setBusy(true);
    try { await onPDF(); } finally { setBusy(false); }
  };

  return(
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      {label&&<span style={{fontSize:11,color:"#6b7280",fontWeight:600}}>{label}</span>}
      <button onClick={onExcel} style={{...s,background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0"}}>
        <span>📊</span> {t("btnExcel")}
      </button>
      <button onClick={handleClick} disabled={busy} style={{...s,background:busy?"#ede9fe":"#fff7ed",color:busy?"#6d28d9":"#c2410c",border:`1px solid ${busy?"#c4b5fd":"#fed7aa"}`,transition:"all .2s",opacity:busy?0.75:1}}>
        <span>{busy?"⏳":"🖼️🔗"}</span> {busy?"Đang tạo ảnh...":t("btnPdfShare")}
      </button>
    </div>
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

export default function App(){
  const I=S=>S.inp; // shorthand for style
  const B=S=>S.btn;

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
  const [backToGate, setBackToGate] = useState(false);
  // ✅ Màn "Tổng quan": mở/đóng bảng chi tiết vật tư khi bấm "SL đã nhận" / "SL thiếu"
  // trong khối THCK/CKD. nguon: "THCK"|"CKD"|"" (đóng). field: "done"|"thieu".
  const [tqVtOpen, setTqVtOpen] = useState({nguon:"", field:""});
  const tqVtRef = useRef(null); // vùng chi tiết vật tư đang mở, dùng để chụp ảnh "Xuất & chia sẻ"
  const [tqDangChiaSe, setTqDangChiaSe] = useState(false);
  const [users,    setUsers]    = useState(USERS_DEF);
  const [lineQuyen,setLineQuyen]= useState(LINE_QUYEN_DEFAULT); // phân quyền dòng xe theo đơn vị
  const [dbErr,    setDbErr]    = useState("");
  const [projs,    setProjs]    = useState([]);
  const [projPickerOpen, setProjPickerOpen] = useState(false);
  const [bomDB,    setBomDB]    = useState(initBom);
  const [lsDB,     setLsDB]     = useState({});
  const [phDB,     setPhDB]     = useState({});
  const [soanDB,   setSoanDB]   = useState(()=>{try{const s=localStorage.getItem("soanDB");return s?JSON.parse(s):{};}catch{return{};}});
  const [pid,      setPid]      = useState("");
  // ✅ Nhớ tab đang xem qua localStorage — sau khi tạo dự án xong (hoặc bất kỳ lúc nào)
  // reload/refresh trang, người dùng ở lại ĐÚNG tab đang xem, không bị nhảy về tab mặc định.
  const [tab,      setTab]      = useState(()=>{try{return localStorage.getItem("lastTab")||"ds";}catch{return "ds";}});
  const [xhDaXNShowAll, setXhDaXNShowAll] = useState(false);
  const [search,   setSearch]   = useState("");
  const [fdm,      setFdm]      = useState("Tất cả");
  const [sCol,     setSCol]     = useState("stt");
  const [sAsc,     setSAsc]     = useState(true);
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
  const [dangChiaSe, setDangChiaSe] = useState(false);
  const [slThucEdit, setSlThucEdit] = useState<Record<string,number>>({}); // ctid -> sl thực nhận đang sửa
  const [editPh,   setEditPh]   = useState(null);  // phiếu đang chỉnh sửa {id, sp, ngay, gc, ct:[]}
  const [phF,      setPhF]      = useState({sp:"",ngay:new Date().toISOString().slice(0,10),gc:""});
  const [phIt,     setPhIt]     = useState([]);
  const [addIt,    setAddIt]    = useState({ma:"",sl:1});
  const [bcFlt,    setBcFlt]    = useState("all");
  const [bcExp,    setBcExp]    = useState({});
  const [bcDmO,    setBcDmO]    = useState({});
  const [bcViTriChiTiet, setBcViTriChiTiet] = useState(false); // ẩn/hiện 2 bảng THCK · CKD trong "Tiến độ theo Vị trí"
  const [bcBlockOpen, setBcBlockOpen] = useState({THCK:"", CKD:""}); // lọc theo nguồn: ""(đóng) · "done"(Đã nhận) · "thieu"(Còn thiếu)
  const [pgnSr,    setPgnSr]    = useState("");
  const [pgnDm,    setPgnDm]    = useState("Tất cả");
  const [pgnSO,    setPgnSO]    = useState("all");
  const [searchMa, setSearchMa] = useState("");
  const [showChoXN, setShowChoXN] = useState(8); // ✅ Số phiếu "Chờ duyệt" hiển thị (mặc định 8)
  const [showPhList, setShowPhList] = useState(5); // ✅ Số phiếu "Phiếu đã gửi" hiển thị (mặc định 5)
  const [soanSearch, setSoanSearch] = useState("");
  const [soanFilter, setSoanFilter] = useState("all"); // "all" | "chua" | "da" | "thieu" — bộ lọc nhanh tab Soạn Hàng
  const [soanCollapsed, setSoanCollapsed] = useState({}); // {[viTri]: true} — nhóm vị trí nào đang thu gọn
  const [showThemMa, setShowThemMa] = useState(false);
  const [themMaForm, setThemMaForm] = useState({ma:"",ten:"",dv:"Cái",dm:1,ng:"",vt:""});
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
  const [bmLoaiForm,  setBmLoaiForm]  = useState({ten:"",icon:"🚐",mau:"#7c3aed"});
  const [bmLoaiDelConfirm, setBmLoaiDelConfirm] = useState(null); // id loại đang chờ xác nhận xóa

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
        const [r1,r2,r3,r4,r5,r6,r7,r8,r10]=await Promise.all([
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
    try{
      const {ct,...phData}=ph;
      await supabase.from(T("phieu")).upsert(phData);
      if(ct?.length) await supabase.from(T("phieu_ct")).upsert(ct);
    }catch(e){console.error("dbSavePhieu:",e);}
  };
  // ⚠️ Đã bỏ ghi lịch sử giao dịch lên Supabase (bảng "lich_su") để không phát sinh
  // thêm dữ liệu — lsDB vẫn được cập nhật cục bộ (addLS) trong phiên làm việc hiện tại.
  const dbAddLS=async(row)=>{};
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

  // ── Derived ──
  const bom   = bomDB[pid]  || [];
  const bomFull = bom; // alias giữ tham chiếu gốc — dùng khi cần lọc riêng theo role (VD tab Soạn Hàng) mà không ảnh hưởng chỗ khác
  const ls    = lsDB[pid]   || [];
  const phList= phDB[pid]   || [];
  const soan  = soanDB[pid] || {};
  const proj  = projs.find(p=>p.id===pid) || projs[0] || {mau:"#1d4ed8",icon:"🚐",ten:"",so_xe:1};
  const soXe  = proj.so_xe||1;
  const DMS   = [...new Set(bom.map(v=>v.ng).filter(Boolean))].sort(sapXepDM);
  const soaned= Object.values(soan).filter(x=>x.on).length;

  // ── Helpers ──
  const flash=m=>{setMsg(m);setTimeout(()=>setMsg(""),2500);};

  const addLS=(p2,r)=>setLsDB(s=>({...s,[p2]:[{id:uid(),ts:new Date().toISOString(),...r},...(s[p2]||[])].slice(0,200)}));
  const sw=useCallback(id=>{setPid(id);setSearch("");setFdm("Tất cả");setTab("ds");localStorage.setItem("lastPid",id);},[]);

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
      else localStorage.setItem("screenMode","main");
    }catch{}
  },[showKhoiTao,showTongQuan,showDaThucHien]);

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
  // ✅ "SL xe đã giao" — nhập tay thủ công (giống editSoXe), dùng cho khối "Tiến Trình Giao Xe"
  // ở tab Tổng quan. Giá trị được kẹp trong khoảng [0, so_xe] để không bao giờ vượt tổng số xe.
  const editSoXeGiao=(projId)=>{
    const p2=projs.find(p=>p.id===projId); if(!p2) return;
    const v=prompt("SL xe đã giao:",p2.da_giao||0);
    if(v!==null&&!isNaN(v)&&Number(v)>=0){
      setProjs(ps=>{
        const next=ps.map(p=>p.id===projId?{...p,da_giao:Math.min(Math.round(Number(v)),p.so_xe||1)}:p);
        const updated=next.find(p=>p.id===projId);
        if(updated)dbUpsertProj(updated).catch(e=>{
          console.error("editSoXeGiao: lỗi lưu:",e);
          flash(`⚠️ Lỗi lưu SL xe đã giao: ${e.message}`);
        });
        return next;
      });
    }
  };

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
    const newLoai={id,ten,icon:bmLoaiForm.icon.trim()||"🚐",mau:bmLoaiForm.mau||"#7c3aed",thu_tu:bomMauLoaiList.length+1};
    setBomMauLoaiList(l=>[...l,newLoai]);
    setBomMauByLoai(m=>({...m,[id]:[]}));
    setBmTab(id);
    setBmLoaiModal(false);
    setBmLoaiForm({ten:"",icon:"🚐",mau:"#7c3aed"});
    try{
      await dbUpsertBomMauLoai(newLoai);
      flash(`✓ Đã thêm loại BOM mẫu "${ten}"`);
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

  const togSoan=(ma,slCN)=>setSoanDB(s=>{
    const c=(s[pid]||{})[ma];
    const curSl=c?.sl??slCN;
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
  const rstSoan=()=>{if(!window.confirm("Reset checklist soạn hàng? Dữ liệu đã tick sẽ bị xóa."))return;setSoanDB(s=>{const n={...s,[pid]:{}};try{localStorage.setItem("soanDB",JSON.stringify(n));}catch{}return n;});flash("✓ Reset");};
  const togGrp=(items,all)=>setSoanDB(s=>{
    const c=s[pid]||{};const p={};
    items.forEach(v=>{p[v.ma]={on:!all,sl:c[v.ma]?.sl??(v.dm*soXe)};});
    return{...s,[pid]:{...c,...p}};
  });

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
    // Chỉ gửi các mã đã soạn (có tick ✓)
    const daSoan=bomRole.filter(v=>soan[v.ma]?.on);
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
    dbSavePhieu(ph);
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
        if(conLai>0) next[v.ma]={on:false,sl:conLai,chuaDu:true,tuPhieuThieu:true};
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
    dbSavePhieu(ph);
    
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
  const sortBy=col=>{if(sCol===col)setSAsc(a=>!a);else{setSCol(col);setSAsc(true);}};
  const Arr=({col})=><span style={{opacity:sCol===col?1:.2,marginLeft:2,fontSize:9}}>{sCol===col&&!sAsc?"▼":"▲"}</span>;
  const filtered=useMemo(()=>{
    let d=fdm!=="Tất cả"?bom.filter(v=>v.ng===fdm):bom;
    if(search){const q=search.toLowerCase();d=d.filter(v=>String(v.stt).includes(q)||v.ma.toLowerCase().includes(q)||v.ten.toLowerCase().includes(q)||(v.vt||"").toLowerCase().includes(q));}
    const km={stt:"stt",ma:"ma",ten:"ten",ng:"",vt:"vt",jig:"jig",dv:"dv",dm:"dm",gc:"gc"};
    return[...d].sort((a,b)=>{const k=km[sCol]||sCol;let va=a[k],vb=b[k];if(typeof va==="string"){va=va.toLowerCase();vb=vb.toLowerCase();}return sAsc?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0);});
  },[bom,search,fdm,sCol,sAsc]);

  const statDM=useMemo(()=>{
    const m={};bom.forEach(v=>{const k=v.vt||"(Chưa có vị trí)";if(!m[k])m[k]={n:0,t:0};m[k].n++;m[k].t+=v.dm;});
    return Object.entries(m).sort((a,b)=>sapXepDM(a[0],b[0]));
  },[bom]);

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
  // ── Thiếu THCK / CKD — đọc thẳng từ field đã tính sẵn trong th (nguồn duy nhất) ──
  const maThieuTHCK=th.filter(v=>v.thieuTHCK).length;
  const maThieuCKD =th.filter(v=>v.thieuCKD).length;
  const totCN=th.reduce((s,v)=>s+v.cn,0);
  const totDN=th.reduce((s,v)=>s+v.dn,0);
  const totCT=th.reduce((s,v)=>s+v.ct,0);
  const totVT=th.reduce((s,v)=>s+v.vuot,0);
  const pctT=bom.length>0?Math.round(maDone/bom.length*100):0;
  const duAll=maDone===bom.length&&bom.length>0;

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
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Mô tả</label>
        <input value={nPF.moTa} onChange={e=>setNPF(f=>({...f,moTa:e.target.value}))} style={inp} placeholder="Mô tả..."/>
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
          <label style={{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:3}}>Ngày khởi tạo</label>
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
        <input type="number" min={1} value={nPF.so_xe} onChange={e=>setNPF(f=>({...f,so_xe:parseInt(e.target.value)||1}))}
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
          <ScreenTopBar onBack={()=>{setBackToGate(true);setShowKhoiTao(false);}} badgeBorderColor="#3b82f6" activeLine={activeLine} onLogout={handleLogoutScreenDocLap}/>
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
        const daGiao=Math.min(proj.da_giao||0,soXe);
        const conLai=Math.max(0,soXe-daGiao);
        const pctGiao=soXe>0?Math.round(daGiao/soXe*100):0;
        return(
        <div style={{minHeight:"100vh",background:"#f1f5f9",padding:"14px 14px 40px"}}>
          <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:12,padding:"16px 18px",marginBottom:14,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
            <ScreenTopBar onBack={()=>{setBackToGate(true);setShowTongQuan(false);}} badgeBorderColor="#f59e0b" activeLine={activeLine} onLogout={handleLogoutScreenDocLap}/>
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
            return(
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {projsSorted.map((p,idx)=>(
                <div key={p.id}
                  style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",padding:"10px 12px",borderRadius:12,fontSize:12,fontWeight:700,
                    background:p.id===pid?(p.mau||"#2563eb"):"#fff",color:p.id===pid?"#fff":"#374151",
                    border:`1.5px solid ${p.id===pid?(p.mau||"#2563eb"):"#e5e7eb"}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div onClick={()=>{setPid(p.id);try{localStorage.setItem("lastPid",p.id);}catch{}}}
                    style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",flex:1,cursor:"pointer",minWidth:0}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:sttMau[idx%sttMau.length],color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0}}>{idx+1}</div>
                    <span>{p.ten}</span>
                    {(p.lenh_sx||p.lo_sx)&&(
                      <span style={{background:"#000",color:"#fff",fontSize:10,fontWeight:700,borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>
                        {p.lenh_sx}{p.lenh_sx&&p.lo_sx&&" / "}{p.lo_sx}
                      </span>
                    )}
                    {p.ngay_khoi_tao&&(
                      <span style={{background:"#000",color:"#fff",fontSize:10,fontWeight:700,borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>
                        KT: {p.ngay_khoi_tao}
                      </span>
                    )}
                    {p.ngay_hoan_thanh&&(
                      <span style={{background:"#000",color:"#fff",fontSize:10,fontWeight:700,borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>
                        HT: {p.ngay_hoan_thanh}
                      </span>
                    )}
                  </div>
                  <button onClick={(e)=>{e.stopPropagation();markProjectDone(p);}}
                    style={{flexShrink:0,border:"none",borderRadius:8,background:"#dc2626",color:"#fff",fontWeight:800,fontSize:11,
                      padding:"7px 12px",cursor:"pointer",boxShadow:"0 2px 0 rgba(0,0,0,0.18)",whiteSpace:"nowrap"}}>
                    ✅ Hoàn thành
                  </button>
                </div>
              ))}
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
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {/* ── Khối 1: Tiến Trình Giao Xe ── */}
            <div style={{flex:"1 1 300px",minWidth:280,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:"1.5px solid #fde68a",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"14px 16px",background:"#fffbeb",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>🚌</span>
                <span style={{fontWeight:800,fontSize:14,color:"#b45309"}}>TIẾN ĐỘ GIAO XE</span>
              </div>
              <div style={{padding:16,display:"flex",flexDirection:"column",flex:1}}>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <div onClick={()=>editSoXeGiao(pid)} style={{flex:1,textAlign:"center",background:"#fffbeb",borderRadius:8,padding:"10px 6px",cursor:"pointer",border:"1px solid #fde68a"}}>
                    <div style={{fontWeight:800,fontSize:22,color:"#16a34a"}}>{fmt(daGiao)}</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#b45309",background:"#fffbeb",borderRadius:6,padding:"3px 6px",marginTop:4}}>SL xe đã giao</div>
                    <div style={{fontSize:9,fontWeight:700,color:"#16a34a",marginTop:2}}>✎ Bấm để sửa</div>
                  </div>
                  <div style={{flex:1,textAlign:"center",background:"#fffbeb",borderRadius:8,padding:"10px 6px",border:"1px solid #fde68a"}}>
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
              </div>
            </div>
            {/* ── Khối 2: Tiến độ nhận vật tư (THCK / CKD) ── */}
            <div style={{flex:"1 1 420px",minWidth:320,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:"1.5px solid #bae6fd",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"14px 16px",background:"#eff6ff",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>📦</span>
                <span style={{fontWeight:800,fontSize:14,color:"#0369a1"}}>TIẾN ĐỘ NHẬN VẬT TƯ</span>
              </div>
              <div style={{padding:"16px 16px 4px",display:"flex",flexDirection:"column",flex:1}}>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {[["THCK","🏭","#b45309","#eff6ff","#fde68a"],["CKD","📦","#0369a1","#eff6ff","#bae6fd"]].map(([nguon,icon,mau,bgLight,bd])=>{
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
                      <div style={{padding:"10px",display:"flex",flexDirection:"column",gap:6}}>
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
                return(
                <div style={{margin:"0 16px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
                  <div ref={tqVtRef} style={{background:"#fff"}}>
                    <div style={{padding:"8px 10px",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                      <b style={{fontSize:12,color:"#374151"}}>{tieuDe}</b>
                    </div>
                    <div style={{maxHeight:tqDangChiaSe?"none":320,overflowY:tqDangChiaSe?"visible":"auto",padding:10,display:"flex",flexDirection:"column",gap:8}}>
                      {rows.length===0?(
                        <div style={{padding:14,textAlign:"center",fontSize:11,color:"#9ca3af"}}>— Không có mã nào —</div>
                      ):rows.map(v=>(
                        <div key={v.id||v.ma} style={{background:"#f8fafc",border:"1px solid #e5e7eb",borderRadius:8,padding:"9px 11px",display:"flex",flexDirection:"column",gap:3}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                            <span style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:.3}}>{v.ma}</span>
                            {tqVtOpen.field==="thieu"?(
                              <span style={{fontSize:10,fontWeight:800,color:"#dc2626",background:"#fee2e2",borderRadius:8,padding:"1px 7px",whiteSpace:"nowrap"}}>Thiếu {fmt(v.ct)}</span>
                            ):(
                              <span style={{fontSize:10,fontWeight:800,color:"#16a34a",background:"#dcfce7",borderRadius:8,padding:"1px 7px",whiteSpace:"nowrap"}}>Đã nhận {fmt(v.dn)}</span>
                            )}
                          </div>
                          <span style={{fontSize:12.5,color:"#1f2937",fontWeight:600,lineHeight:1.4,wordBreak:"break-word"}}>{v.ten}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button disabled={tqDangChiaSe} onClick={async()=>{
                      setTqDangChiaSe(true);
                      // ✅ FIX: đợi React render lại với danh sách MỞ HẾT (bỏ maxHeight/overflow) trước khi
                      // chụp ảnh — nếu không, html2canvas sẽ cắt theo khung cuộn 320px như cũ, chỉ chụp
                      // được phần đang hiển thị chứ không phải TOÀN BỘ vật tư (giống lỗi trong ảnh chụp màn hình).
                      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
                      try{ await chiaSePhieuAnh(tqVtRef.current, {sp:`VatTu_${tqVtOpen.nguon}_${tqVtOpen.field}`}); }
                      finally{ setTqDangChiaSe(false); }
                    }}
                    style={{width:"100%",border:"none",borderTop:"1px solid #e5e7eb",background:"#eff6ff",color:"#1d4ed8",fontWeight:700,fontSize:12,padding:"9px 0",cursor:tqDangChiaSe?"not-allowed":"pointer",opacity:tqDangChiaSe?0.6:1}}>
                    {tqDangChiaSe?"⏳ Đang tạo ảnh...":"📤 Xuất & chia sẻ"}
                  </button>
                </div>
                );
              })()}
            </div>
          </div>
          )}
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
          <ScreenTopBar onBack={()=>{setBackToGate(true);setShowDaThucHien(false);}} badgeBorderColor="#14b8a6" activeLine={activeLine} onLogout={handleLogoutScreenDocLap}/>
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
          const sttMau=["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#84cc16"];
          if(doneList.length===0) return (
            <div style={{textAlign:"center",padding:"40px 16px",color:"#9ca3af",background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
              — Chưa có dự án nào hoàn thành cho dòng xe này —
            </div>
          );
          return(
          <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden",border:"1.5px solid #99f6e4"}}>
            {/* Tiêu đề cột — chỉ hiện trên màn rộng, trên mobile mỗi thẻ tự hiện nhãn từng cột */}
            <div style={{display:"none",gridTemplateColumns:"40px 2fr 1fr 1fr 1fr 1fr 70px",gap:8,padding:"10px 14px",background:"#f0fdfa",fontSize:11,fontWeight:800,color:"#0f766e"}}>
              <span>STT</span><span>Tên dự án</span><span>Lệnh SX</span><span>Lô SX</span><span>Ngày khởi tạo</span><span>Ngày hoàn thành</span><span>SL xe</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,padding:12}}>
              {doneList.map((p,idx)=>(
                <div key={p.id} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 14px",borderRadius:10,background:"#f8fafc",border:"1.5px solid #e5e7eb"}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:sttMau[idx%sttMau.length],color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0}}>{idx+1}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,flex:1,minWidth:0}}>
                    <div style={{gridColumn:"1/-1"}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#9ca3af",textTransform:"uppercase"}}>Tên dự án</div>
                      <div style={{fontSize:13,fontWeight:800,color:"#1f2937"}}>{p.ten}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,fontWeight:700,color:"#9ca3af",textTransform:"uppercase"}}>Lệnh SX</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{p.lenh_sx||"—"}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,fontWeight:700,color:"#9ca3af",textTransform:"uppercase"}}>Lô SX</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{p.lo_sx||"—"}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,fontWeight:700,color:"#9ca3af",textTransform:"uppercase"}}>Ngày khởi tạo</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{p.ngay_khoi_tao||"—"}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,fontWeight:700,color:"#9ca3af",textTransform:"uppercase"}}>Ngày hoàn thành</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#0f766e"}}>{p.ngay_hoan_thanh||"—"}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,fontWeight:700,color:"#9ca3af",textTransform:"uppercase"}}>SL xe</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#374151"}}>{p.so_xe||1}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
  const TABS_NOW  = isTHCK ? TABS_THCK : isKHO ? TABS_KHO : isKHTH ? TABS_KHTH : (()=>{
    const tabs = TABS_XUONGHAN;
    if(isXH && user.id === "xh04") {
      // Thêm "users" tab cho xh04
      return [...tabs, ["users", "👥 Người dùng"]];
    }
    return tabs;
  })();
  const mauRole   = isTHCK ? "#1d4ed8" : isKHO ? "#0f766e" : isKHTH ? "#7c3aed" : "#b45309";

  return(
    <LangCtx.Provider value={{lang,t,setLang:setLangSaved}}>
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#f0f4f8",minHeight:"100vh",width:"100%",maxWidth:"100vw",overflowX:"hidden",boxSizing:"border-box"}}>

      {/* HEADER */}
      <div style={{backgroundImage:`url(data:image/jpeg;base64,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)`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",position:"relative",color:"#fff"}}>
        {/* Overlay */}
        <div style={{position:"absolute",inset:0,background:isTHCK?"linear-gradient(135deg,rgba(15,36,71,0.82),rgba(29,78,216,0.78))":isKHO?"linear-gradient(135deg,rgba(2,44,40,0.82),rgba(15,118,110,0.78))":isKHTH?"linear-gradient(135deg,rgba(46,16,101,0.85),rgba(124,58,237,0.72))":"linear-gradient(135deg,rgba(3,16,84,0.85),rgba(8,145,178,0.72))",zIndex:0}}/>
        <div style={{position:"relative",zIndex:1}}>
        {/* Top bar */}
        <div style={{padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          {/* Logo + title */}
          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flexShrink:1}}>
            <div style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
              {isTHCK?"🏭":isKHO?"📦":isKHTH?"📋":"🚗"}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t("brandTitle")}</div>
              <div style={{fontSize:8,opacity:.6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{isTHCK?t("roleTHCK"):isKHO?t("roleKHO"):isKHTH?(user.don_vi||t("roleKHTH")):t("roleXH")}</div>
            </div>
          </div>
          {/* User + logout */}
          <div className="soan-noscroll" style={{display:"flex",alignItems:"flex-start",gap:5,flexWrap:"nowrap",justifyContent:"flex-end",overflowX:"auto",scrollbarWidth:"none",msOverflowStyle:"none",maxWidth:"100%"}}>
            <style>{`.soan-noscroll::-webkit-scrollbar{display:none}`}</style>
            {msg&&<span style={{fontSize:10,color:"#6ee7b7",background:"rgba(0,0,0,0.2)",borderRadius:20,padding:"3px 8px",alignSelf:"center",flexShrink:0,whiteSpace:"nowrap"}}>{msg}</span>}
            {dbErr&&<span style={{fontSize:10,color:"#fee2e2",background:"rgba(220,38,38,0.3)",borderRadius:20,padding:"3px 8px",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",alignSelf:"center",flexShrink:0}} title={dbErr}>⚠️ {dbErr}</span>}
            {/* ✅ 4 nút tròn kích thước bằng nhau, mỗi nút 1 màu nền riêng — Ngôn ngữ / Đổi MK / Tạo chữ ký / Tài khoản. Thu nhỏ để KHÔNG bị xuống dòng, cùng nằm 1 hàng. */}
            <div onClick={()=>setLangSaved(lang==="vi"?"zh":"vi")} title="Đổi ngôn ngữ Việt / Trung" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",width:40,flexShrink:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"#0ea5e9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:"0 2px 6px rgba(0,0,0,0.2)",flexShrink:0}}>🌐</div>
              <div style={{fontSize:8,fontWeight:700,textAlign:"center",lineHeight:1.15,whiteSpace:"nowrap"}}>
                <span style={{color:lang==="vi"?"#fff":"rgba(255,255,255,0.5)"}}>VI</span>
                <span style={{color:"rgba(255,255,255,0.5)"}}>/</span>
                <span style={{color:lang==="zh"?"#fff":"rgba(255,255,255,0.5)"}}>中</span>
              </div>
            </div>
            <div onClick={()=>setShowChangePw(true)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",width:40,flexShrink:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"#8b5cf6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 2px 6px rgba(0,0,0,0.2)",flexShrink:0}}>🔑</div>
              <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.9)",textAlign:"center",lineHeight:1.15,whiteSpace:"nowrap"}}>Đổi MK</div>
            </div>
            <div onClick={()=>setShowSignPad(true)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",width:40,flexShrink:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"#f59e0b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 2px 6px rgba(0,0,0,0.2)",flexShrink:0}}>✍️</div>
              <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.9)",textAlign:"center",lineHeight:1.15,whiteSpace:"nowrap"}}>{user.chu_ky?"Sửa ký":"Tạo ký"}</div>
            </div>
            <div onClick={()=>{if(window.confirm("Đăng xuất?")){try{localStorage.removeItem("loggedInUser");localStorage.removeItem("screenMode");}catch{}setUser(null);setShowTongQuan(false);setShowKhoiTao(false);setShowDaThucHien(false);}}}
              title="Đăng xuất" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",width:44,flexShrink:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"#ec4899",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 2px 6px rgba(0,0,0,0.2)",flexShrink:0}}>{user.avatar}</div>
              <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.9)",textAlign:"center",lineHeight:1.15,maxWidth:44,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.ten}</div>
            </div>
          </div>
        </div>

        {/* Project bar */}
        <div style={{padding:"8px 16px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {/* Dòng xe đang hoạt động — giúp phân biệt rõ đang ở City Bus hay Mini Bus (dữ liệu độc lập) */}
          <div title="Dòng xe đang hoạt động" style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"4px 8px",flex:"0 0 auto"}}>
            <span style={{fontSize:10,opacity:.75,whiteSpace:"nowrap"}}>Dòng xe:</span>
            <span style={{fontSize:12,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>{KL_LINES.find(l=>l.id===activeLine)?.title||"Mini Bus"}</span>
          </div>
          {/* Project select */}
          <div style={{position:"relative",flex:"0 0 auto"}}>
            <div onClick={()=>setProjPickerOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,background:"#7c3aed",borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
              <span style={{fontSize:11,opacity:.7,whiteSpace:"nowrap"}}>Dự án:</span>
              <span style={{fontSize:13}}>{proj.icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:"#fff",maxWidth:110,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{proj.ten}</span>
              <span style={{fontSize:10,opacity:.7}}>▾</span>
            </div>
            {projPickerOpen&&(
              <>
                <div onClick={()=>setProjPickerOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
                <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,background:"#fff",borderRadius:10,boxShadow:"0 4px 16px rgba(0,0,0,0.18)",minWidth:200,maxWidth:260,zIndex:41,overflow:"hidden"}}>
                  {[...projs].reverse().map(p=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",cursor:"pointer",background:p.id===pid?`${p.mau||"#2563eb"}14`:"#fff",borderBottom:"1px solid #f1f5f9"}}>
                      <span onClick={()=>{sw(p.id);setProjPickerOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                        <span style={{fontSize:15}}>{p.icon}</span>
                        <span style={{fontSize:12,fontWeight:600,color:p.id===pid?(p.mau||"#2563eb"):"#1f2937",lineHeight:1.3}}>{p.ten}</span>
                      </span>
                      {p.id===pid&&<span style={{fontSize:11,color:p.mau||"#2563eb",flexShrink:0}}>●</span>}
                      <span onClick={(e)=>{e.stopPropagation();editProjName(p.id,p.ten);}} style={{fontSize:13,padding:"2px 4px",flexShrink:0,opacity:.55}}>✏️</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Actions */}
          <button onClick={()=>setNewP(true)} style={{...btn,background:"#7c3aed",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",padding:"5px 11px",fontSize:12}}>＋ Thêm</button>
          {projs.length>1&&<button onClick={()=>delProj(pid)} style={{...btn,background:"rgba(220,38,38,0.3)",color:"#fca5a5",border:"1px solid rgba(220,38,38,0.4)",padding:"5px 10px",fontSize:11}}>🗑</button>}
          {/* Stats — 4 ô đồng bộ: 15 xe / Mã VT / Phiếu / GD */}
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            {[[fmt(soXe),"xe",true],[fmt(bom.length),"Mã VT",false],[fmt(phList.length),"Phiếu",false],[fmt(ls.length),"GD",false]].map(([v,l,isXe])=>(
              <div key={l} onClick={isXe?editSoXe:undefined} style={{textAlign:"center",background:"#ea580c",padding:"4px 10px",borderRadius:8,minWidth:44,cursor:isXe?"pointer":"default"}}>
                <div style={{fontWeight:800,fontSize:13,color:"#fff",lineHeight:1}}>{isXe?`🚌 ${v}`:v}</div>
                <div style={{opacity:.9,fontSize:9,marginTop:2,color:"#fff"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role strip */}
        <div style={{padding:"5px 16px 8px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{background:isTHCK?"rgba(29,78,216,0.5)":isKHO?"rgba(15,118,110,0.5)":isKHTH?"rgba(124,58,237,0.5)":"rgba(180,83,9,0.5)",border:`1px solid rgba(255,255,255,0.2)`,borderRadius:20,padding:"2px 12px",fontSize:10,fontWeight:700,color:isTHCK?"#bfdbfe":isKHO?"#5eead4":isKHTH?"#ddd6fe":"#fed7aa",letterSpacing:.3}}>
            {isTHCK?`🏭 ${t("roleTHCK")}`:isKHO?`📦 ${t("roleKHO")}`:isKHTH?`📋 ${user.don_vi||t("roleKHTH")}`:`🚗 ${t("roleXH")}`}
          </span>
          <span style={{fontSize:10,opacity:.5}}>{isTHCK||isKHO?t("subTHCK_KHO"):isKHTH?t("subKHTH"):t("subXH")}</span>
        </div>
        </div>{/* /zIndex:1 wrapper */}
      </div>

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

      {/* TABS */}
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 18px",display:"flex",gap:2,overflowX:"auto"}}>
        {TABS_NOW.map(([k])=>{
          const active=tab===k;
          const c=k==="soan"?mauRole:k==="bc"?"#7c3aed":k==="users"?"#6b7280":mauRole;
          const label=t(`tab_${k}`);
          return(
            <button key={k} onClick={()=>setTab(k)} style={{...btn,background:"none",borderRadius:0,fontWeight:active?700:400,
              color:active?c:"#6b7280",borderBottom:active?`2px solid ${c}`:"2px solid transparent",
              padding:"10px 13px",fontSize:13,whiteSpace:"nowrap"}}>
              {k==="soan"&&soaned>0?`${label} (${soaned}/${bom.length})`:label}
            </button>
          );
        })}
      </div>

      <div style={{padding:"12px 10px",boxSizing:"border-box",width:"100%"}}>

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
                      "Nguồn gốc":v.ng,"Vị trí":v.vt,"JIG":v.jig,"Ghi chú":v.gc
                    })),
                    `VatTu_${proj.ten.replace(/\s/g,"_")}`,
                    `Danh sách vật tư — ${proj.ten}`
                  )}
                  onPDF={()=>{
                    const rows=filtered.map((v,i)=>`<tr>
                      <td>${v.stt}</td><td><b>${v.ma}</b></td><td>${v.ten}</td>
                      <td style="text-align:center">${v.dv}</td>
                      <td style="text-align:center">${fmt(v.dm)}</td>
                      <td style="text-align:center;font-weight:700;color:#065f46">${fmt(v.dm*soXe)}</td>
                      <td>${v.ng}</td><td>${v.vt||""}</td><td>${v.jig||""}</td><td>${v.gc||""}</td>
                    </tr>`).join("");
                    xuatPDF(`<h2>${t("rpDs")}</h2>
                      <p class="sub">${proj.icon} ${proj.ten} · ${filtered.length}/${bom.length} mã · ${soXe} xe</p>
                      <table><thead><tr><th>${t("thSTT")}</th><th>${t("thMa")}</th><th>${t("thTen")}</th><th>${t("thDVT")}</th><th>${t("thDM")}</th><th>${t("thCan")}×${soXe}</th><th>${t("thNguonGoc")}</th><th>${t("lbVT")}</th><th>JIG</th><th>${t("thGhiChu")}</th></tr></thead><tbody>${rows}</tbody></table>`,
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
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {filtered.length===0&&(
                <div style={{textAlign:"center",padding:"40px 20px",color:"#9ca3af",fontSize:13,background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
                  Không tìm thấy vật tư nào
                </div>
              )}
              {filtered.map((v,i)=>(
                <div key={v.ma+i} style={{background:"#fff",borderRadius:10,padding:"10px 12px",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:"1px solid #f1f5f9",
                  display:"flex",alignItems:"center",gap:10}}>
                  <div style={{minWidth:28,height:28,borderRadius:7,background:"#f0f4ff",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:800,color:"#6366f1",flexShrink:0}}>
                    {v.stt}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:mauP,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.ma}</div>
                    <div style={{fontSize:12,color:"#374151",marginTop:1,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.ten}</div>
                    <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                      {v.ng&&<span style={{background:"#ede9fe",color:"#6d28d9",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600}}>{v.ng}</span>}
                      {v.vt&&<span style={{background:"#e0f2fe",color:"#0369a1",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600}}>{v.vt}</span>}
                      {v.jig&&<span style={{background:"#f1f5f9",color:"#475569",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600}}>JIG: {v.jig}</span>}
                      <span style={{background:"#f0fdf4",color:"#166534",borderRadius:4,padding:"1px 6px",fontSize:10}}>{t("thDVT")}: {v.dv} · {t("lbDM1XE")}: {fmt(v.dm)}</span>
                      <span style={{background:"#dcfce7",color:"#065f46",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{t("thCanNhan")}: {fmt(v.dm*soXe)}</span>
                      {v.gc&&<span style={{background:"#fef9c3",color:"#713f12",borderRadius:4,padding:"1px 6px",fontSize:10}}>{v.gc}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flexShrink:0}}>
                    {v.anh
                      ? <img src={v.anh} alt="" onClick={()=>setAnhPv(v.anh)} style={{width:30,height:30,objectFit:"cover",borderRadius:5,cursor:"zoom-in",border:"1px solid #e5e7eb"}}/>
                      : <span style={{color:"#d1d5db",fontSize:16}}>🖼</span>}
                    {!isKHTH&&(
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={()=>{setCur({...E0,...v});setModal("edit");}} style={{...btn,background:"#fef3c7",color:"#92400e",padding:"5px 9px",fontSize:12}}>✏️</button>
                      <button onClick={()=>del(v)} style={{...btn,background:"#fee2e2",color:"#991b1b",padding:"5px 9px",fontSize:12}}>🗑️</button>
                    </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{padding:"10px 4px 4px",fontSize:11,color:"#9ca3af",display:"flex",justifyContent:"space-between"}}>
                <span>{filtered.length}/{bom.length} mã</span>
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
          // "Nhà máy THCK" chỉ thấy vật tư Nguồn gốc = THCK. Vai trò khác (VD Xưởng Hàn) xem đầy đủ.
          // Chỉ áp dụng RIÊNG trong tab Soạn Hàng — không ảnh hưởng các tab/màn hình khác.
          const bom = isKHO ? bomFull.filter(v=>(v.ng||"").trim().toUpperCase()==="CKD")
                    : isTHCK ? bomFull.filter(v=>(v.ng||"").trim().toUpperCase()==="THCK")
                    : bomFull;
          const th = isKHO ? thFull.filter(v=>(v.ng||"").trim().toUpperCase()==="CKD")
                   : isTHCK ? thFull.filter(v=>(v.ng||"").trim().toUpperCase()==="THCK")
                   : thFull;
          const thByMa={};th.forEach(v=>{thByMa[v.ma]=v;});
          const daSoan=bom.filter(v=>{const slCN=v.dm*soXe;const sl=soan[v.ma]?.sl??slCN;return soan[v.ma]?.on&&sl>=slCN;});
          const chuaSoan=bom.filter(v=>{const slCN=v.dm*soXe;const sl=soan[v.ma]?.sl??slCN;const chuaDuSl=soan[v.ma]?.on&&sl<slCN;return !soan[v.ma]?.on||chuaDuSl;});
          const pct=bom.length?Math.round(daSoan.length/bom.length*100):0;
          const xong=pct===100&&bom.length>0;
          // Tính mã đã duyệt đủ (done=true trong th) - dùng để lọc khỏi danh sách soạn
          const daDuyetDuSet=new Set(th.filter(v=>v.done).map(v=>v.ma));
          // Vật tư thiếu SL = đã có trong phiếu nhưng SL nhận < SL cần
          const thieuSlSet=new Set(th.filter(v=>v.giaoThieu).map(v=>v.ma));
          // ✅ Mã "nhận thiếu SL" = ĐÃ từng giao MỘT PHẦN (đã giao XH duyệt > 0) nhưng dnXN vẫn < cần.
          // Loại trừ mã "chưa soạn" (chưa có phiếu) VÀ mã "đã giao XH duyệt = 0" (chưa nhận gì).
          const soanThieuSet=new Set(th.filter(v=>v.giaoThieu&&v.dnXN>0).map(v=>v.ma));
          // Chỉ giữ lại: chưa được soạn HOẶC đã soạn nhưng thiếu SL (loại bỏ đã duyệt đủ)
          const bomHienThiGoc=bom.filter(v=>!daDuyetDuSet.has(v.ma)||thieuSlSet.has(v.ma)||soanThieuSet.has(v.ma));
          // ✅ Bộ lọc nhanh: Tất cả / Chưa soạn / Đã soạn / Thiếu SL.
          // "Thiếu SL" hiển thị TOÀN BỘ mã thuộc soanThieuSet (không ẩn mã nào, kể cả đã duyệt đủ).
          const bomHienThi = soanFilter==="thieu" ? bom.filter(v=>soanThieuSet.has(v.ma))
                            : soanFilter==="da"    ? bomHienThiGoc.filter(v=>soan[v.ma]?.on)
                            : soanFilter==="chua"  ? bomHienThiGoc.filter(v=>!soan[v.ma]?.on)
                            : bomHienThiGoc;
          const daSoanHienGoc=bomHienThiGoc.filter(v=>soan[v.ma]?.on).length;
          const soMaDaDuyet=daDuyetDuSet.size;
          const nhom={};bomHienThi.forEach(v=>{const k=v.vt||"(Chưa có vị trí)";if(!nhom[k])nhom[k]=[];nhom[k].push(v);});
          const nhomKeys=Object.keys(nhom);
          const toggleGrp=(k)=>setSoanCollapsed(s=>({...s,[k]:!s[k]}));
          return(
            <div>
              <div style={{background:"#fff",borderRadius:12,padding:"16px 20px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:15}}>{t("titleSoan")} — {proj.icon} {proj.ten}</span>
                      <span style={{background:"#fef3c7",color:"#92400e",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>🚌 {soXe} xe</span>
                      {soMaDaDuyet>0&&<span style={{background:"#d1fae5",color:"#065f46",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>✅ Đã duyệt đủ: {soMaDaDuyet} mã (ẩn)</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Prog p={pct} done={xong} h={10}/>
                      <span style={{fontWeight:700,fontSize:13,color:xong?"#16a34a":"#92400e",minWidth:60}}>{daSoan.length}/{bom.length} ({pct}%)</span>
                    </div>
                    {/* ── Thẻ thống kê nhanh ── */}
                    <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                      {[
                        ["Tổng mã",bom.length,"#1d4ed8","#eff6ff"],
                        ["✅ Đã soạn",daSoan.length,"#16a34a","#f0fdf4"],
                        ["⏳ Chưa soạn",chuaSoan.length,"#dc2626","#fef2f2"],
                        ["⚠️ Thiếu SL",soanThieuSet.size,"#b45309","#fffbeb"],
                      ].map(([l,v,c,bg])=>(
                        <div key={l} style={{background:bg,borderRadius:8,padding:"6px 12px",minWidth:76,textAlign:"center"}}>
                          <div style={{fontWeight:800,fontSize:16,color:c}}>{v}</div>
                          <div style={{fontSize:9,color:c,fontWeight:600,opacity:.85}}>{l}</div>
                        </div>
                      ))}
                    </div>
                    {/* ── Bộ lọc nhanh ── */}
                    <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                      {[
                        ["all",`Tất cả (${bomHienThiGoc.length})`],
                        ["chua",`⏳ Chưa soạn (${bomHienThiGoc.length-daSoanHienGoc})`],
                        ["da",`✅ Đã soạn (${daSoanHienGoc})`],
                        ...(soanThieuSet.size>0?[["thieu",`⚠️ Thiếu SL (${soanThieuSet.size})`]]:[]),
                      ].map(([k,l])=>(
                        <button key={k} onClick={()=>setSoanFilter(k)}
                          style={{border:`1.5px solid ${soanFilter===k?(k==="thieu"?"#f59e0b":"#1d4ed8"):"#e5e7eb"}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",
                            padding:"4px 12px",fontSize:11,fontWeight:700,
                            background:soanFilter===k?(k==="thieu"?"#f59e0b":"#1d4ed8"):"#f9fafb",
                            color:soanFilter===k?"#fff":"#374151"}}>
                          {l}
                        </button>
                      ))}
                    </div>
                    {bomHienThi.length<bom.length&&<div style={{fontSize:11,color:"#6b7280",marginTop:6,fontStyle:"italic"}}>Đang hiển thị {bomHienThi.length}/{bom.length} mã{soanFilter==="all"?` — ẩn ${bom.length-bomHienThi.length} mã đã duyệt đủ`:""}</div>}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <ExportBar
                      shareTitle={`${t("titleSoan")} — ${proj.ten}`}
                      shareText={`Soạn hàng ${proj.ten}: ${daSoan.length}/${bom.length} mã đã soạn (${pct}%)`}
                      onExcel={()=>{
                        const daSoan2=bom.filter(v=>soan[v.ma]?.on);
                        const chuaSoan2=bom.filter(v=>!soan[v.ma]?.on);
                        xuatExcel([
                          ...daSoan2.map(v=>({
                            "STT":v.stt,"Mã số":v.ma,"Tên vật tư":v.ten,"ĐVT":v.dv,
                            "ĐM/1XE":v.dm,[`Cần(×${soXe})`]:v.dm*soXe,
                            "SL thực soạn":soan[v.ma]?.sl??v.dm*soXe,
                            "Trạng thái":"✓ Đã soạn","Nguồn gốc":v.ng,"Vị trí":v.vt,"JIG":v.jig
                          })),
                          ...chuaSoan2.map(v=>({
                            "STT":v.stt,"Mã số":v.ma,"Tên vật tư":v.ten,"ĐVT":v.dv,
                            "ĐM/1XE":v.dm,[`Cần(×${soXe})`]:v.dm*soXe,
                            "SL thực soạn":0,"Trạng thái":"⏳ Chưa soạn",
                            "Nguồn gốc":v.ng,"Vị trí":v.vt,"JIG":v.jig
                          }))
                        ],`SoanHang_${proj.ten.replace(/\s/g,"_")}`,`Soạn hàng — ${proj.ten}`);
                      }}
                      onPDF={()=>{
                        const daSoan2=bom.filter(v=>soan[v.ma]?.on);
                        const chuaSoan2=bom.filter(v=>!soan[v.ma]?.on);
                        const mkRow=(v,ok)=>`<tr>
                          <td>${v.stt}</td><td><b>${v.ma}</b></td><td>${v.ten}</td>
                          <td style="text-align:center">${v.dv}</td>
                          <td style="text-align:center">${fmt(v.dm*soXe)}</td>
                          <td style="text-align:center;font-weight:700">${ok?fmt(soan[v.ma]?.sl??v.dm*soXe):"—"}</td>
                          <td>${v.ng}</td>
                          <td>${v.jig||""}</td>
                          <td><span class="badge ${ok?"ok":"warn"}">${ok?"✓ Đã soạn":"⏳ Chưa soạn"}</span></td>
                        </tr>`;
                        xuatPDF(`<h2>${t("rpSoan")}</h2>
                          <p class="sub">${proj.icon} ${proj.ten} · ${daSoan2.length}/${bom.length} mã đã soạn · ${soXe} xe</p>
                          <table><thead><tr><th>${t("thSTT")}</th><th>${t("thMa")}</th><th>${t("thTen")}</th><th>${t("thDVT")}</th><th>${t("thCan")}×${soXe}</th><th>${t("thSoSoan")}</th><th>${t("thNguonGoc")}</th><th>JIG</th><th>${t("thTrangThai")}</th></tr></thead><tbody>
                          ${[...daSoan2.map(v=>mkRow(v,true)),...chuaSoan2.map(v=>mkRow(v,false))].join("")}
                          </tbody></table>`,`SoanHang_${proj.ten}`);
                      }}
                    />
                    
                    <button onClick={()=>{if(!window.confirm(`Gửi ${soaned} mã đã soạn đến XƯỞNG HÀN?`))return;guiDon();}} disabled={soaned===0}
                      style={{...btn,background:xong?"#16a34a":"#f59e0b",color:"#fff",padding:"7px 18px",fontSize:13,fontWeight:700,opacity:bom.length===0?.5:1}}>
                      {xong?"✅ Gửi XƯỞNG HÀN":`📤 Gửi đơn (${daSoan.length}/${bom.length})`}
                    </button>
                  </div>
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
                      const slV=soan[v.ma]?.sl??slCN; // SL THỰC người dùng nhập/chuẩn bị gửi — chỉ dùng cho ô nhập, KHÔNG dùng để tính "còn thiếu"
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
                      return(
                        <div key={v.ma} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderBottom:i<filteredItems.length-1?"1px solid #f1f5f9":"none",background:canhBao?"#fffbeb":on?"#f0fdf4":"transparent",borderLeft:canhBao?"3px solid #fcd34d":"3px solid transparent"}}>
                          <div onClick={()=>togSoan(v.ma,slCN)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${on?"#16a34a":canhBao?"#f59e0b":"#d1d5db"}`,background:on?"#16a34a":canhBao?"#fef3c7":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
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
                    <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{xong?"✅ Đã soạn xong!":` ${daSoan.length}/${bom.length} mã đã soạn`}</div>
                    <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,marginTop:2}}>
                      {xong?"Nhấn Gửi XƯỞNG HÀN để hoàn tất":`Còn ${bomHienThi.length} mã cần soạn${soMaDaDuyet>0?` · ${soMaDaDuyet} mã đã duyệt đủ`:""}`}
                    </div>
                  </div>
                  <button onClick={()=>{if(!window.confirm(`Gửi ${soaned} mã đã soạn?`))return;guiDon();}}
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
                <div style={{fontSize:12,opacity:.8}}>{proj.icon} {proj.ten} · Đơn từ Nhà máy THCK gửi · {choXN.length} chờ duyệt · {daXNAll.length} đã duyệt</div>
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
                  <div style={{fontSize:12,marginTop:4}}>Đơn hàng sẽ hiện ở đây khi Nhà máy THCK gửi</div>
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
                              <tr style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}>
                                {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSoSoan"),t("thSLThucNhan"),t("thTrangThai"),t("thDuyet")].map(h=>(
                                  <th key={h} style={{padding:"7px 10px",textAlign:[t("thSoSoan"),t("thSLThucNhan")].includes(h)?"center":"left",fontWeight:700,color:h===t("thSLThucNhan")?"#1d4ed8":"#374151",fontSize:11}}>{h}</th>
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
          // "Nhà máy THCK" chỉ quản mã Nguồn gốc = THCK. Xưởng Hàn xem đầy đủ (để xác nhận).
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
                        <td>${v.stt}</td><td><b>${v.ma}</b></td><td>${v.ten}</td>
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
                <div style={{padding:10,display:"flex",flexDirection:"column",gap:6}}>
                  {f2.length===0&&(
                    <div style={{textAlign:"center",padding:40,color:"#9ca3af",fontSize:13}}>Không có dữ liệu</div>
                  )}
                  {f2.map((v,i)=>{
                    const isSel=selMa===v.ma;
                    return(
                      <div key={v.ma} onClick={()=>setSelMa(s=>s===v.ma?null:v.ma)}
                        style={{background:isSel?"#fff7ed":v.done?"#f0fdf4":"#fff",borderRadius:10,padding:"10px 12px",
                          boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:`1px solid ${isSel?"#fdba74":v.done?"#bbf7d0":"#f1f5f9"}`,
                          display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"background .15s"}}>
                        <div style={{minWidth:28,height:28,borderRadius:7,background:"#f0f4ff",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:11,fontWeight:800,color:"#6366f1",flexShrink:0}}>
                          {v.stt}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,color:mauP,fontFamily:"monospace",
                            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.ma}</div>
                          <div style={{fontSize:12,color:"#374151",marginTop:1,
                            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={v.ten}>{v.ten}</div>
                          <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
                            {v.ng&&<Tag ch={v.ng}/>}
                            <span style={{background:"#eff6ff",color:"#1d4ed8",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{t("thDVT")}: {v.dv}</span>
                            <span style={{background:"#f1f5f9",color:"#374151",borderRadius:4,padding:"1px 6px",fontSize:10}}>{t("thCan")}: {fmt(v.cn)}</span>
                            <span style={{background:v.dn>0?"#d1fae5":"#f1f5f9",color:v.dn>0?"#065f46":"#9ca3af",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{t("thDaNhan")}: {fmt(v.dn)}</span>
                            {v.vuot>0&&<span style={{background:"#fef3c7",color:"#b45309",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>+{fmt(v.vuot)} vượt</span>}
                            <span style={{background:v.done?"#dcfce7":v.choDuyet?"#e0f2fe":"#fff7ed",color:v.done?"#16a34a":v.choDuyet?"#0369a1":"#ea580c",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{v.done?"✅ Đủ":v.choDuyet?"🕓 Đã giao đủ — chờ duyệt":`${t("thConThieu")}: ${fmt(v.ct)}`}</span>
                          </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0,minWidth:52}}>
                          <Prog p={v.p} done={v.done}/>
                          <span style={{fontSize:10,fontWeight:700,color:v.done?"#16a34a":"#6b7280"}}>{v.p}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {f2.length>0&&(
                    <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:"1px solid #e5e7eb",
                      display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginTop:4}}>
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
          const togExp=ma=>setBcExp(s=>({...s,[ma]:!s[ma]}));
          return(
            <div>
              <div style={{background:duAll?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#312e81,#4f46e5)",borderRadius:12,padding:"20px 22px",marginBottom:14,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:14}}>
                  <div>
                    <div style={{fontSize:17,fontWeight:700}}>{duAll?t("titleBcDone"):t("titleBc")}</div>
                    <div style={{fontSize:12,opacity:.8,marginTop:3}}>{proj.icon} {proj.ten} · 🚌 {soXe} xe · {phList.length} phiếu</div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {[["Tổng mã",bom.length,"#c7d2fe"],["Đã nhận ✅",maDone,"#6ee7b7"],["Chưa nhận 📭",maChuaSoan,"#e2e8f0"],["Giao thiếu 📉",maGiaoThieu,"#fde68a"],["Phiếu",phList.length,"#a5f3fc"]].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 16px",minWidth:70}}>
                        <div style={{fontWeight:700,fontSize:22,color:c}}>{v}</div>
                        <div style={{fontSize:10,opacity:.8,marginTop:1}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,opacity:.8,marginBottom:4}}>
                    <span>{t("progTienDoTichLuy")}</span>
                    <span style={{fontWeight:700,fontSize:13}}>{pctT}%</span>
                  </div>
                  <Prog p={pctT} done={duAll} h={14}/>
                </div>
              </div>
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
                                <td>${v.stt}</td><td><b>${v.ma}</b></td><td>${v.ten}</td>
                                <td style="text-align:center">${v.dv||""}</td>
                                <td>${v.vt||""}</td>
                                <td style="text-align:right">${fmt(v.cn)}</td>
                                <td style="text-align:right;color:#065f46;font-weight:700">${fmt(v.dn)}</td>
                                <td style="text-align:right;color:${v.ct>0?"#dc2626":"#16a34a"}">${fmt(v.ct)}</td>
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
                                {isO&&(
                                  <div style={{padding:8,display:"flex",flexDirection:"column",gap:5}}>
                                    {items.map(v=>(
                                      <div key={v.ma} style={{background:v.done?"#f0fdf4":"#fff",borderRadius:8,border:`1px solid ${v.done?"#bbf7d0":"#f1f5f9"}`,padding:"8px 10px",display:"flex",alignItems:"center",gap:8}}>
                                        <div style={{minWidth:24,height:24,borderRadius:6,background:"#f0f4ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#6366f1",flexShrink:0}}>{v.stt}</div>
                                        <div style={{flex:1,minWidth:0}}>
                                          <div style={{fontWeight:800,fontSize:12,color:mauP,fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.ma}</div>
                                          <div style={{fontSize:11,color:"#374151",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={v.ten}>{v.ten}</div>
                                          <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
                                            <span style={{background:"#f1f5f9",color:"#374151",borderRadius:4,padding:"1px 6px",fontSize:9}}>{t("thCan")}: {fmt(v.cn)}</span>
                                            <span style={{background:v.dn>0?"#d1fae5":"#f1f5f9",color:v.dn>0?"#065f46":"#9ca3af",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>{t("thDaNhan")}: {fmt(v.dn)}</span>
                                            {v.done
                                              ?<span style={{background:"#dcfce7",color:"#16a34a",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>✅ Đủ</span>
                                              :v.choDuyet
                                                ?<span style={{background:"#e0f2fe",color:"#0369a1",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>🕓 Chờ duyệt</span>
                                              :v.chuaSoan
                                                ?<span style={{background:"#f1f5f9",color:"#6b7280",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>📭 Chưa soạn</span>
                                                :<span style={{background:"#fff7ed",color:"#ea580c",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700}}>📉 Thiếu {fmt(v.ct)}</span>}
                                          </div>
                                        </div>
                                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,minWidth:44}}>
                                          <Prog p={v.p} done={v.done}/>
                                          <span style={{fontSize:9,fontWeight:700,color:v.done?"#16a34a":"#6b7280"}}>{v.p}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
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

              {/* Switch loại BOM Mẫu — danh sách ĐỘNG, tự thêm được */}
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                {bomMauLoaiList.map(l=>(
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
                <button onClick={()=>{setBmLoaiForm({ten:"",icon:"🚐",mau:"#7c3aed"});setBmLoaiModal(true);}}
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
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {filtered.map((r,fi)=>{
                  const realIdx = activeBom.findIndex(x=>x===r);
                  return (
                    <div key={r._id||fi} style={{background:"#fff",borderRadius:10,padding:"10px 12px",
                      boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:"1px solid #f1f5f9",
                      display:"flex",alignItems:"center",gap:10}}>
                      <div style={{minWidth:28,height:28,borderRadius:7,background:"#f0f4ff",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:11,fontWeight:800,color:"#6366f1",flexShrink:0}}>
                        {r.stt}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#1e40af",
                          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.id}</div>
                        <div style={{fontSize:12,color:"#374151",marginTop:1,
                          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.ten}</div>
                        <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                          {r.ng&&<span style={{background:"#ede9fe",color:"#6d28d9",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600}}>{r.ng}</span>}
                          {r.jig&&<span style={{background:"#e0f2fe",color:"#0369a1",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600}}>JIG: {r.jig}</span>}
                          <span style={{background:"#f0fdf4",color:"#166534",borderRadius:4,padding:"1px 6px",fontSize:10}}>ĐM: {r.dm} {r.dv}</span>
                          {r.gc&&<span style={{background:"#fef9c3",color:"#713f12",borderRadius:4,padding:"1px 6px",fontSize:10}}>{r.gc}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:5,flexShrink:0}}>
                        <button onClick={()=>openEdit(r,realIdx)}
                          style={{...btnSt,background:"#dbeafe",color:"#1d4ed8",padding:"5px 10px"}}>✏️</button>
                        <button onClick={()=>setBmConfirm(realIdx)}
                          style={{...btnSt,background:"#fee2e2",color:"#dc2626",padding:"5px 10px"}}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
                {filtered.length===0&&(
                  <div style={{textAlign:"center",padding:"40px 20px",color:"#9ca3af",fontSize:13}}>
                    {bmSearch?"Không tìm thấy kết quả phù hợp":"Chưa có mã nào trong BOM này"}
                  </div>
                )}
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

        {tab==="users"&&user.id==="xh04"&&(
          <UsersPanel currentUser={user} users={users} setUsers={setUsers} dbUpsertUser={dbUpsertUser} dbDeleteUser={dbDeleteUser} lockOtherXH={lockOtherXH} lineQuyen={lineQuyen} setLineQuyen={setLineQuyen} dbUpsertQuyenDongXe={dbUpsertQuyenDongXe}/>
        )}

      </div>


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
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSL"),""].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:700,color:"#6b7280"}}>{h}</th>)}
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
                <thead><tr style={{background:"#f8fafc",borderBottom:"2px solid #e5e7eb"}}>
                  {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thSoLuong"),editPh?"":isXH?t("thSLThucNhan"):"",editPh?"":t("thSLThieu"),editPh?t("thXoa"):t("thDuyet"),editPh?null:t("thNguoiDuyet")].filter(h=>h!==null&&h!=="").map(h=><th key={h} style={{padding:"8px 10px",textAlign:[t("thSoLuong"),t("thSLThucNhan"),t("thSLThieu")].includes(h)?"right":"left",fontWeight:700,color:h===t("thSLThucNhan")?"#1d4ed8":h===t("thSLThieu")?"#dc2626":"#374151",whiteSpace:"nowrap"}}>{h}</th>)}
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
                    <thead><tr style={{background:"#f8fafc",position:"sticky",top:0}}>
                      {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thDM"),t("thNguonGoc")].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:"#374151",borderBottom:"1px solid #e5e7eb"}}>{h}</th>)}
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
                    <thead><tr style={{background:"#f8fafc",position:"sticky",top:0}}>
                      {[t("thSTT"),t("thMa"),t("thTen"),t("thDVT"),t("thDM"),t("thNguonGoc")].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:"#374151",borderBottom:"1px solid #e5e7eb"}}>{h}</th>)}
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
            <div style={{fontSize:12,color:"#6b7280",marginBottom:20}}>Tài khoản: <b>{user.avatar} {user.ten}</b> ({user.id})</div>
            {[
              {label:"Mật khẩu hiện tại",key:"cur",placeholder:"Nhập MK hiện tại"},
              {label:"Mật khẩu mới",key:"next",placeholder:"Tối thiểu 4 ký tự"},
              {label:"Xác nhận mật khẩu mới",key:"confirm",placeholder:"Nhập lại MK mới"},
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
