import { useState } from "react";

// 🎨 NỀN THANH SIDEBAR — TÁCH BIỆT HOÀN TOÀN với Header.
// Lưu thành 1 dòng CMS RIÊNG (id cố định SIDEBAR_BG_ID, loai:"app_layout"), KHÔNG đụng tới
// dòng "app_layout_main" của Header. Màu/kiểu nền đóng gói JSON trong "mo_ta", ảnh nền ở cột "anh".
export const SIDEBAR_BG_ID = "app_sidebar_bg";
export const SIDEBAR_BG_DEFAULT_CSS = "linear-gradient(180deg,#062C67 0%,#031D46 100%)";
const DEFAULTS = { mode: "gradient", color1: "#062C67", color2: "#031D46" };

// Trả về { css, hasImage } cho App dùng trực tiếp ở style.background của Sidebar.
export function readSidebarBg(cmsItems: any[]) {
  const it = (cmsItems || []).find((x) => x.loai === "app_layout" && x.id === SIDEBAR_BG_ID);
  if (!it || !it.an_hien) return { css: SIDEBAR_BG_DEFAULT_CSS, hasImage: false };
  if (it.anh) return { css: `url("${it.anh}") center / cover no-repeat`, hasImage: true };
  let p: any = {};
  try { p = it.mo_ta ? JSON.parse(it.mo_ta) : {}; } catch { p = {}; }
  const m = { ...DEFAULTS, ...p };
  const css = m.mode === "solid" ? m.color1 : `linear-gradient(180deg,${m.color1} 0%,${m.color2} 100%)`;
  return { css, hasImage: false };
}

export function SidebarBgManager({ items, setItems, dbUpsertCms, readImageAsBase64, estimateBase64KB }: any) {
  const existing = items.find((x: any) => x.loai === "app_layout" && x.id === SIDEBAR_BG_ID);
  const [form, setForm] = useState<any>(() => {
    let p: any = {};
    try { p = existing?.mo_ta ? JSON.parse(existing.mo_ta) : {}; } catch { p = {}; }
    return { ...DEFAULTS, ...p, img: existing?.anh || "", an_hien: existing?.an_hien ?? false };
  });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

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
      const b64 = await readImageAsBase64(file, { maxBytes: 450 * 1024 });
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
    const done = await dbUpsertCms(row);
    setSaving(false);
    if (!done) return;
    setItems((list: any[]) => list.some((x) => x.id === SIDEBAR_BG_ID)
      ? list.map((x) => (x.id === SIDEBAR_BG_ID ? row : x)) : [...list, row]);
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
            ✅ Đã nén còn ~{estimateBase64KB(form.img)}KB{" "}
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
