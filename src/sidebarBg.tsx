import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import { readImageAsBase64, estimateBase64KB } from "./panels";

// 🎨 NỀN THANH SIDEBAR — TÁCH BIỆT HOÀN TOÀN với Header.
// Lưu 1 dòng riêng trong bảng "cms_content" (id SIDEBAR_BG_ID), KHÔNG đụng tới dòng
// "app_layout_main" của Header. Màu/kiểu nền lưu JSON ở "mo_ta", ảnh nền ở cột "anh".
const SIDEBAR_BG_ID = "app_sidebar_bg";
const DEFAULT_CSS = "linear-gradient(180deg,#062C67 0%,#031D46 100%)";
const DEFAULTS = { mode: "gradient", color1: "#062C67", color2: "#031D46" };
const EVT = "sidebar-bg-changed";

function rowToCss(row: any): string {
  if (!row || !row.an_hien) return DEFAULT_CSS;
  if (row.anh) return `url("${row.anh}") center / cover no-repeat`;
  let p: any = {};
  try { p = row.mo_ta ? JSON.parse(row.mo_ta) : {}; } catch { p = {}; }
  const m = { ...DEFAULTS, ...p };
  return m.mode === "solid" ? m.color1 : `linear-gradient(180deg,${m.color1} 0%,${m.color2} 100%)`;
}

function applyCss(row: any) {
  let el = document.getElementById("kl-sidebar-bg-style") as HTMLStyleElement | null;
  if (!el) { el = document.createElement("style"); el.id = "kl-sidebar-bg-style"; document.head.appendChild(el); }
  el.textContent = `.kl-sidebar-desktop{background:${rowToCss(row)} !important;}`;
}

async function fetchRow() {
  try {
    const { data } = await supabase.from("cms_content").select("*").eq("id", SIDEBAR_BG_ID).maybeSingle();
    return data || null;
  } catch { return null; }
}

function SidebarBgManager() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => {
    fetchRow().then((row: any) => {
      let p: any = {};
      try { p = row?.mo_ta ? JSON.parse(row.mo_ta) : {}; } catch { p = {}; }
      setForm({ ...DEFAULTS, ...p, img: row?.anh || "", an_hien: row?.an_hien ?? false });
    });
  }, []);

  if (!form) return null;

  const lbl: any = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 };
  const btn: any = { border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, padding: "8px 16px" };
  const seg = (on: boolean): any => ({ ...btn, padding: "7px 12px", background: on ? "#1d4ed8" : "#f1f5f9", color: on ? "#fff" : "#374151" });
  const preview = form.img
    ? `url("${form.img}") center / cover no-repeat`
    : form.mode === "solid" ? form.color1
    : `linear-gradient(180deg,${form.color1} 0%,${form.color2} 100%)`;

  const onPick = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const b64 = await (readImageAsBase64 as any)(file, { maxBytes: 450 * 1024 });
      setForm((f: any) => ({ ...f, img: b64 }));
    } catch (err: any) {
      alert("⚠️ Không đọc được ảnh: " + (err.message || "lỗi không xác định"));
    } finally { setBusy(false); }
  };

  const onSave = async () => {
    setSaving(true); setOk("");
    const { img, an_hien, ...rest } = form;
    const row = {
      id: SIDEBAR_BG_ID, loai: "app_layout", tieu_de: "Nền Sidebar",
      mo_ta: JSON.stringify(rest), anh: img || "", lien_ket: "", thu_tu: 0, an_hien,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("cms_content").upsert(row, { onConflict: "id" });
    setSaving(false);
    if (error) { alert("⚠️ Lưu thất bại: " + error.message); return; }
    window.dispatchEvent(new CustomEvent(EVT, { detail: row }));
    setOk("✅ Đã lưu — áp dụng ngay cho Sidebar.");
    setTimeout(() => setOk(""), 3000);
  };

  const onReset = () => {
    if (!window.confirm("Khôi phục nền Sidebar về mặc định (xanh gradient)?")) return;
    setForm({ ...DEFAULTS, img: "", an_hien: form.an_hien });
  };

  return (
    <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#0b2545", marginBottom: 4 }}>🎨 Nền thanh Sidebar</div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>
        Chọn màu hoặc tải ảnh làm nền riêng cho Sidebar (trái) — không ảnh hưởng Header.
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button style={seg(form.mode === "solid")} onClick={() => setForm((f: any) => ({ ...f, mode: "solid" }))}>Màu đơn</button>
        <button style={seg(form.mode === "gradient")} onClick={() => setForm((f: any) => ({ ...f, mode: "gradient" }))}>Chuyển màu</button>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <label style={lbl}>{form.mode === "solid" ? "Màu nền" : "Màu trên"}</label>
          <input type="color" value={form.color1} onChange={(e) => setForm((f: any) => ({ ...f, color1: e.target.value }))}
            style={{ width: 64, height: 40, border: "none", padding: 0, background: "none" }} />
        </div>
        {form.mode === "gradient" && (
          <div>
            <label style={lbl}>Màu dưới</label>
            <input type="color" value={form.color2} onChange={(e) => setForm((f: any) => ({ ...f, color2: e.target.value }))}
              style={{ width: 64, height: 40, border: "none", padding: 0, background: "none" }} />
          </div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Ảnh nền Sidebar (không bắt buộc — có ảnh sẽ ưu tiên hơn màu)</label>
        <input type="file" accept="image/*" onChange={onPick} disabled={busy} />
        {busy && <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 4 }}>⏳ Đang nén ảnh...</div>}
        {form.img && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#16a34a" }}>
            ✅ Đã nén còn ~{(estimateBase64KB as any)(form.img)}KB{" "}
            <button onClick={() => setForm((f: any) => ({ ...f, img: "" }))}
              style={{ ...btn, padding: "3px 8px", background: "#dc2626", color: "#fff", fontSize: 11 }}>✕ Xoá ảnh</button>
          </div>
        )}
      </div>
      <label style={lbl}>Xem trước Sidebar</label>
      <div style={{ width: 92, height: 180, borderRadius: 8, background: preview, marginBottom: 12, border: "1.5px solid #e5e7eb" }} />
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 12 }}>
        <input type="checkbox" checked={!!form.an_hien} onChange={(e) => setForm((f: any) => ({ ...f, an_hien: e.target.checked }))} />
        Đang áp dụng (tắt = quay về nền mặc định)
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={onSave} disabled={saving || busy} style={{ ...btn, background: "#0b2545", color: "#fff" }}>
          {saving ? "Đang lưu..." : "💾 Lưu"}
        </button>
        <button onClick={onReset} style={{ ...btn, background: "#f1f5f9", color: "#374151" }}>↺ Khôi phục mặc định</button>
        {ok && <span style={{ fontSize: 12, color: "#16a34a" }}>{ok}</span>}
      </div>
    </div>
  );
}

// Nút nổi + hộp thoại quản trị: chỉ hiện khi đang ở trang "CMS — Quản lý Nội dung".
const VIS_EVT = "kl-cms-visible";
function SidebarBgFloating() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: any) => { setVisible(!!e.detail); if (!e.detail) setOpen(false); };
    window.addEventListener(VIS_EVT, h);
    return () => window.removeEventListener(VIS_EVT, h);
  }, []);
  if (!visible) return null;
  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ position: "fixed", right: 12, bottom: 96, zIndex: 99998, border: "none", borderRadius: 24,
          padding: "12px 16px", background: "#7c3aed", color: "#fff", fontWeight: 800, fontSize: 13,
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)", cursor: "pointer", fontFamily: "inherit" }}>
        🎨 Nền Sidebar
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.55)", overflowY: "auto", padding: 12 }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <button onClick={() => setOpen(false)}
              style={{ display: "block", marginLeft: "auto", marginBottom: 8, border: "none", borderRadius: 7, padding: "8px 14px",
                background: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>✕ Đóng</button>
            <SidebarBgManager />
          </div>
        </div>
      )}
    </>
  );
}

// Cầu nối: (1) áp nền Sidebar từ DB, (2) hiện nút nổi "Nền Sidebar" khi admin mở trang CMS
// — không phải sửa App.tsx / panels.tsx.
export function initSidebarBg() {
  let loaded = false;
  const load = async () => { applyCss(await fetchRow()); loaded = true; };
  load();
  window.addEventListener(EVT, (e: any) => applyCss(e.detail));

  const host = document.createElement("div");
  host.id = "kl-sidebar-bg-host";
  document.body.appendChild(host);
  createRoot(host).render(<SidebarBgFloating />);

  let last: boolean | null = null;
  const scan = () => {
    try {
      if (document.querySelector(".kl-sidebar-desktop") && !loaded) load();
      const onCms = (document.body.textContent || "").includes("Quản lý Nội dung");
      if (onCms !== last) {
        last = onCms;
        window.dispatchEvent(new CustomEvent(VIS_EVT, { detail: onCms }));
      }
    } catch { /* bỏ qua */ }
  };

  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; scan(); }, 300);
  }).observe(document.body, { childList: true, subtree: true });
  scan();
}
