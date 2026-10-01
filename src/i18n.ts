import { createContext, useContext } from "react";

// Từ điển đa ngữ Việt/Trung và bộ máy dịch DOM — tách nguyên văn từ App.tsx.

export const APP_I18N = {
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
  tab_gopy:      {vi:"💬 Góp Ý Kiến - Cải Tiến PM", zh:"💬 反馈-改进建议"},
  tab_huongdan:  {vi:"📖 Hướng Dẫn Sử Dụng PM", zh:"📖 使用指南"},
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

  // ── Bổ sung: nút / hành động chung dùng ở nhiều nơi ──────────────
  actHuy:        {vi:"Hủy",              zh:"取消"},
  actDong:       {vi:"Đóng",             zh:"关闭"},
  actLuu:        {vi:"Lưu",              zh:"保存"},
  actLuuThayDoi: {vi:"💾 Lưu thay đổi",  zh:"💾 保存更改"},
  actXacNhan:    {vi:"Xác nhận",         zh:"确认"},
  actXacNhanDoi: {vi:"Xác nhận đổi",     zh:"确认修改"},
  actTimKiem:    {vi:"Tìm kiếm",         zh:"搜索"},
  actChonFile:   {vi:"Chọn file",        zh:"选择文件"},
  actKeoThaFile: {vi:"Chọn hoặc kéo file vào đây", zh:"点击选择或拖拽文件到此处"},
  actDangXuLy:   {vi:"Đang xử lý...",    zh:"处理中..."},
  actThanhCong:  {vi:"Thành công",       zh:"成功"},
  actThatBai:    {vi:"Thất bại",         zh:"失败"},
  actLoi:        {vi:"Lỗi",              zh:"错误"},
  actCanhBao:    {vi:"Cảnh báo",         zh:"警告"},
  actVuiLong:    {vi:"Vui lòng",         zh:"请"},
  actTroVe:      {vi:"← Trở về",         zh:"← 返回"},
  actQuayLai:    {vi:"← Quay lại",       zh:"← 返回"},
  actThemMoiDau: {vi:"＋ Thêm",          zh:"＋ 添加"},
  actChiaSe:     {vi:"Chia sẻ",          zh:"分享"},
  actXuatBaoCao: {vi:"Xuất báo cáo",     zh:"导出报表"},
  actXuatChiaSe2:{vi:"Xuất & chia sẻ",   zh:"导出并分享"},
  actThayThe:    {vi:"Thay thế",         zh:"替换"},
  actThayTheToanBo:{vi:"Thay thế toàn bộ", zh:"全部替换"},
  actXemChiTietMuiTen: {vi:"▼ Xem chi tiết", zh:"▼ 查看详情"},
  actThuGon:     {vi:"▲ Thu gọn",        zh:"▲ 收起"},
  actXoaDauCheck:{vi:"✓ Đã xóa",         zh:"✓ 已删除"},
  actDaLuuCheck: {vi:"✓ Đã lưu",         zh:"✓ 已保存"},
  actHayThuLai:  {vi:"— hãy thử lại!",   zh:"— 请重试！"},

  // ── Trạng thái / màn hình dự án ──────────────────────────────────
  screenKhoiTao:   {vi:"Khởi tạo Dự án",   zh:"创建项目"},
  screenTongQuan:  {vi:"Tổng quan",        zh:"总览"},
  screenTongQuanU: {vi:"TỔNG QUAN",        zh:"总览"},
  screenTongQuan2: {vi:"Tổng Quan",        zh:"总览"},
  screenDangTH:    {vi:"Đang thực hiện",   zh:"进行中"},
  screenDangTHico: {vi:"🚧 Đang thực hiện",zh:"🚧 进行中"},
  screenDaTH:      {vi:"Đã thực hiện",     zh:"已完成执行"},
  screenHeThongChinh:{vi:"Hệ thống chính", zh:"主系统"},
  chonTrangThaiDA: {vi:"Chọn trạng thái dự án", zh:"选择项目状态"},
  hoanThanh:       {vi:"Hoàn thành",       zh:"完成"},
  daHoanThanh:     {vi:"Đã hoàn thành",    zh:"已完成"},
  daHoanThanhCheck:{vi:"✅ Đã hoàn thành", zh:"✅ 已完成"},
  daSoan:          {vi:"Đã soạn",          zh:"已备料"},
  duAnDaHoanThanh: {vi:"Dự án đã hoàn thành", zh:"已完成项目"},
  thieuTHCK_CKD:   {vi:"Thiếu THCK/CKD",   zh:"THCK/CKD缺料"},
  thieuSL:         {vi:"Thiếu SL",         zh:"数量不足"},
  thieuPlain:      {vi:"Thiếu",            zh:"缺"},
  chuaCoViTri:     {vi:"(Chưa có vị trí)", zh:"（暂无位置）"},
  dungChung:       {vi:"DÙNG CHUNG",       zh:"通用"},

  // ── Nhãn vai trò / đơn vị bổ sung ─────────────────────────────────
  roleKT:      {vi:"PHÒNG KT",       zh:"技术科"},
  roleKTLow:   {vi:"Phòng KT",       zh:"技术科"},
  roleBanLDNM: {vi:"BAN LĐNM",       zh:"厂领导班子"},
  roleBanLDNM2:{vi:"Ban LĐNM",       zh:"厂领导班子"},
  dongXe:      {vi:"Dòng xe",        zh:"车型"},
  dongXeU:     {vi:"DÒNG XE",        zh:"车型"},
  chonDongXe:  {vi:"Chọn dòng xe",   zh:"选择车型"},
  phanQuyenDongXe: {vi:"Phân quyền dòng xe", zh:"车型权限分配"},
  phanXuong:   {vi:"Phân xưởng",     zh:"车间"},
  phanXuongU:  {vi:"PHÂN XƯỞNG",    zh:"车间"},
  tramU:       {vi:"TRẠM",           zh:"站点"},
  dinhMucXe:   {vi:"ĐỊNH MỨC/ XE",   zh:"定额/每车"},
  rieng29Y:    {vi:"RIÊNG GH29Y",    zh:"GH29Y专用"},
  phanQuyenTheoDV: {vi:"Phân quyền chức năng theo đơn vị", zh:"按单位分配功能权限"},

  // ── Tài khoản / đăng nhập-đăng xuất ────────────────────────────────
  taiKhoan:        {vi:"Tài khoản",              zh:"账户"},
  dangXuat:        {vi:"Đăng xuất",               zh:"退出登录"},
  dangXuatHoi:     {vi:"Đăng xuất?",              zh:"退出登录？"},
  themTaiKhoanMoi: {vi:"Thêm tài khoản mới",      zh:"添加新账户"},
  daThemTaiKhoan:  {vi:"✓ Đã thêm tài khoản",     zh:"✓ 已添加账户"},
  chuaCoQuyen:     {vi:"Bạn chưa được quyền truy cập", zh:"您暂无访问权限"},
  anhDaiDienTK:    {vi:"📸 Ảnh đại diện Tài khoản", zh:"📸 账户头像"},
  khongDocDuocAnh: {vi:"⚠️ Không đọc được ảnh:",  zh:"⚠️ 无法读取图片："},
  doiMKThanhCong:  {vi:"Đổi mật khẩu thành công!",zh:"密码修改成功！"},

  // ── Dự án / thao tác dự án ─────────────────────────────────────────
  duAn:            {vi:"Dự án",              zh:"项目"},
  themDuAn:        {vi:"Thêm dự án",         zh:"新增项目"},
  taoDuAnMoi:      {vi:"Tạo dự án mới",      zh:"创建新项目"},
  themXeMoi:       {vi:"＋ Thêm xe mới",     zh:"＋ 新增车辆"},
  xoaDuAn:         {vi:"🗑️ Xoá dự án",      zh:"🗑️ 删除项目"},
  ngayHoanThanhVT: {vi:"NGÀY HOÀN THÀNH VẬT TƯ", zh:"物料完成日期"},
  chiTietGiaoXe:   {vi:"chi tiết giao xe",   zh:"交车详情"},
  slXeDaGiao:      {vi:"SL xe đã giao",      zh:"已交付车辆数"},
  slDaNhanBS:      {vi:"SL đã nhận",         zh:"已收数量"},
  slThucBS:        {vi:"SL THỰC",            zh:"实际数量"},
  themLoaiBomMau:  {vi:"➕ Thêm loại BOM mẫu mới", zh:"➕ 添加新BOM模板类型"},

  // ── Thông báo lỗi / cảnh báo hay gặp ────────────────────────────────
  luuThatBai:      {vi:"⚠️ Lưu thất bại:",   zh:"⚠️ 保存失败："},
  luuSupabaseFail: {vi:"⚠️ Lưu lên Supabase thất bại:", zh:"⚠️ 保存到Supabase失败："},
  xoaThatBai:      {vi:"⚠️ Xóa thất bại:",   zh:"⚠️ 删除失败："},
  loiXoaDLCu:      {vi:"Lỗi xóa dữ liệu cũ:", zh:"删除旧数据出错："},
  loiLuuCTPhieu:   {vi:"Lỗi lưu chi tiết phiếu:", zh:"保存单据明细出错："},
  fileCSVTrong:    {vi:"File CSV trống!",    zh:"CSV文件为空！"},
  loiKhongXacDinh: {vi:"lỗi không xác định", zh:"未知错误"},

  // ── Đơn vị đo / từ chung ─────────────────────────────────────────────
  donViCai:        {vi:"Cái",  zh:"个"},
  vatTuChung:      {vi:"vật tư", zh:"物料"},
  moTaChung:       {vi:"(đóng)", zh:"（关闭）"},
  daNhanNgoac:     {vi:"(Đã nhận)", zh:"（已收）"},
  vietTrungLabel:  {vi:"Việt · Trung", zh:"越 · 中"},
  nhanHang:        {vi:"✅ Nhận Hàng", zh:"✅ 收货"},
  baoKhanCap:      {vi:"Báo khẩn cấp", zh:"紧急报告"},
  baoKhanCapIcon:  {vi:"🚨 Báo khẩn cấp", zh:"🚨 紧急报告"},
  canhBaoKhanCap:  {vi:"Cảnh báo khẩn cấp", zh:"紧急警报"},
};
export const LangCtx = createContext({lang:"vi", t:(k)=>APP_I18N[k]?.vi||k, setLang:()=>{}});
export const useLang = ()=>useContext(LangCtx);

export const LOGIN_I18N = {
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
// ═══════════════════════════════════════════════════════════════
// 🌐 BỘ DỊCH TOÀN CỤC (DOM overlay) — đảm bảo SONG NGỮ TRIỆT ĐỂ trên
// TOÀN BỘ phần mềm, kể cả những màn hình/tab/modal mà code chưa kịp bọc
// từng chữ qua hàm t() riêng lẻ.
//
// Cách hoạt động: khi người dùng chọn "zh", ta quét TOÀN BỘ text đã render
// trong <body> (kể cả nội dung sinh ra sau này bởi mọi tab/modal, nhờ
// MutationObserver theo dõi liên tục), rồi thay các cụm tiếng Việt khớp với
// từ điển APP_I18N + LOGIN_I18N bằng bản tiếng Trung tương ứng — thực hiện
// NGAY trên DOM đã render, KHÔNG đụng vào state/dữ liệu gốc của app. Khi
// chuyển lại "vi", chữ gốc tiếng Việt được khôi phục đúng như ban đầu.
// Nhờ vậy: chỉ cần thêm 1 dòng vào từ điển là cụm đó tự động được dịch ở
// MỌI nơi nó xuất hiện trong toàn bộ ứng dụng, không cần sửa từng dòng JSX.
// ═══════════════════════════════════════════════════════════════
export function buildPhraseList(){
  const seen=new Map();
  const add=(vi,zh)=>{
    if(!vi||!zh) return;
    const key=String(vi).trim();
    if(key.length<2) return; // bỏ cụm quá ngắn để tránh khớp nhầm lung tung
    if(!seen.has(key)) seen.set(key,zh);
  };
  Object.values(APP_I18N).forEach(o=>add(o&&o.vi,o&&o.zh));
  if(typeof LOGIN_I18N==="object" && LOGIN_I18N && LOGIN_I18N.vi && LOGIN_I18N.zh){
    Object.keys(LOGIN_I18N.vi).forEach(k=>add(LOGIN_I18N.vi[k],LOGIN_I18N.zh[k]));
  }
  // Cụm DÀI hơn được ưu tiên khớp trước để không dịch nhầm 1 phần của cụm dài hơn
  return Array.from(seen.entries()).sort((a,b)=>b[0].length-a[0].length);
}
let _phraseListCache=null, _phraseMapCache=null, _phraseRegexCache=null;
export function _escapeRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
export function getPhraseEngine(){
  if(!_phraseListCache){
    _phraseListCache=buildPhraseList();
    _phraseMapCache=new Map(_phraseListCache);
    const pattern=_phraseListCache.map(([vi])=>_escapeRe(vi)).join("|");
    _phraseRegexCache=pattern?new RegExp(pattern,"g"):null;
  }
  return {map:_phraseMapCache, re:_phraseRegexCache};
}
export function translateVN2ZH(str){
  if(typeof str!=="string"||!str) return str;
  const {map,re}=getPhraseEngine();
  if(!re) return str;
  re.lastIndex=0;
  return str.replace(re, m=>map.get(m)||m);
}
export const RE_HAS_VN_DIACRITIC=/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
export const I18N_SKIP_TAGS=new Set(["SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT"]);
export const _i18nOrigText=new WeakMap();   // Text node → chữ gốc tiếng Việt
export const _i18nOrigAttr=new WeakMap();   // Element → {placeholder,title,'aria-label': chữ gốc}
export const I18N_ATTRS=["placeholder","title","aria-label"];
export function _translateAttrs(el, toZh){
  if(!el.hasAttribute) return;
  for(const attr of I18N_ATTRS){
    if(!el.hasAttribute(attr)) continue;
    let store=_i18nOrigAttr.get(el);
    if(!store){ store={}; _i18nOrigAttr.set(el,store); }
    if(store[attr]===undefined) store[attr]=el.getAttribute(attr);
    const orig=store[attr];
    if(orig==null||!RE_HAS_VN_DIACRITIC.test(orig)) continue;
    const next=toZh?translateVN2ZH(orig):orig;
    if(el.getAttribute(attr)!==next) el.setAttribute(attr,next);
  }
}
export function _translateTextNode(tn, toZh){
  const p=tn.parentNode;
  if(!p||p.nodeType!==Node.ELEMENT_NODE||I18N_SKIP_TAGS.has(p.tagName)) return;
  let orig=_i18nOrigText.get(tn);
  if(orig===undefined){ orig=tn.nodeValue; _i18nOrigText.set(tn,orig); }
  if(orig==null||!RE_HAS_VN_DIACRITIC.test(orig)) return; // không có dấu tiếng Việt → khỏi đụng vào (số, ký hiệu, tiếng Anh...)
  const next=toZh?translateVN2ZH(orig):orig;
  if(tn.nodeValue!==next) tn.nodeValue=next;
}
export function walkAndTranslateDOM(root, toZh){
  if(!root) return;
  if(root.nodeType===Node.TEXT_NODE){ _translateTextNode(root,toZh); return; }
  if(root.nodeType!==Node.ELEMENT_NODE) return;
  if(I18N_SKIP_TAGS.has(root.tagName)) return;
  _translateAttrs(root,toZh);
  const walker=document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
    acceptNode:n=>(n.nodeType===Node.ELEMENT_NODE&&I18N_SKIP_TAGS.has(n.tagName))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT
  });
  let n;
  while((n=walker.nextNode())){
    if(n.nodeType===Node.TEXT_NODE) _translateTextNode(n,toZh);
    else if(n.nodeType===Node.ELEMENT_NODE) _translateAttrs(n,toZh);
  }
}
