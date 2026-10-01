// Chuỗi CSS cho màn hình đăng nhập — tách nguyên văn từ App.tsx.

export const KL_LOGIN_CSS = `
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
