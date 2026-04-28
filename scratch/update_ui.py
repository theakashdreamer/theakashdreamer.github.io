import re

file_path = 'd:/Android Work Space/GitProject/akash_portfolio/pages/resignation/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_fonts = """  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />"""

content = re.sub(
    r'<link rel="preconnect" href="https://fonts\.googleapis\.com" />.*?rel="stylesheet" />',
    new_fonts,
    content,
    count=1,
    flags=re.DOTALL
)

new_styles = """  <style>
    :root {
      --gold: #d4af37;
      --gold-soft: #f5e7a1;
      --navy: #0f172a;
      --border: rgba(255, 255, 255, 0.08);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --input: rgba(0, 0, 0, 0.25);
      --success: #22c55e;
      --error: #ef4444;
      --font-main: 'Outfit', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0; padding: 0;
    }

    body {
      min-height: 100vh;
      font-family: var(--font-main);
      background: #060913;
      background-image: 
        radial-gradient(circle at 15% 50%, rgba(212, 175, 55, 0.08), transparent 25%),
        radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.1), transparent 25%),
        radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.08), transparent 30%);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: hidden;
      padding: 40px 20px;
    }

    .particles-background {
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .container {
      width: 100%;
      max-width: 960px;
      position: relative;
      z-index: 1;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--gold-soft);
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 24px;
      transition: 0.3s ease;
      opacity: 0.9;
    }

    .back-link:hover {
      transform: translateX(-4px);
      opacity: 1;
      text-shadow: 0 0 12px rgba(245, 231, 161, 0.4);
    }

    .resignation-card {
      background: rgba(16, 21, 36, 0.65);
      border: 1px solid var(--border);
      border-radius: 24px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      overflow: hidden;
      position: relative;
    }

    .resignation-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, #3b82f6, #d4af37, #8b5cf6, #3b82f6);
      background-size: 300% 100%;
      animation: gradientShift 6s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .header {
      padding: 36px 36px 24px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent);
    }

    .header h1 {
      margin: 0 0 12px;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .header p {
      margin: 0;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.6;
      font-weight: 400;
    }

    .content {
      padding: 36px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full {
      grid-column: 1 / -1;
    }

    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: var(--input);
      color: #fff;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 15px;
      outline: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: rgba(212, 175, 55, 0.5);
      background: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1), inset 0 2px 4px rgba(0,0,0,0.2);
      transform: translateY(-1px);
    }

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      padding-right: 48px;
    }

    .helper-text {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.6;
      margin-top: 16px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    
    .helper-text strong {
      color: var(--gold-soft);
    }

    .section-title {
      margin: 36px 0 20px;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--border), transparent);
    }

    .two-preview {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 24px;
      align-items: start;
    }

    .email-preview-box,
    .plain-preview-box {
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .email-preview-box {
      background: #ffffff;
      display: flex;
      flex-direction: column;
    }
    
    .browser-topbar {
      background: #f8fafc;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .mac-dot {
      width: 12px; height: 12px; border-radius: 50%;
    }
    
    .mac-dot.close { background: #ef4444; }
    .mac-dot.min { background: #f59e0b; }
    .mac-dot.max { background: #22c55e; }

    .email-preview-box iframe {
      width: 100%;
      min-height: 700px;
      border: 0;
      background: #fff;
    }

    .plain-preview-box {
      background: rgba(0, 0, 0, 0.4);
      padding: 24px;
      color: #cbd5e1;
      white-space: pre-wrap;
      line-height: 1.8;
      font-size: 14px;
      max-height: 755px;
      overflow-y: auto;
      font-family: var(--font-mono);
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .plain-preview-box::-webkit-scrollbar { width: 8px; }
    .plain-preview-box::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
    .plain-preview-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .btn-container {
      display: flex;
      gap: 16px;
      margin-top: 32px;
      flex-wrap: wrap;
    }

    .btn {
      flex: 1;
      min-width: 180px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: none;
      border-radius: 14px;
      padding: 16px 20px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      position: relative;
      overflow: hidden;
      letter-spacing: 0.3px;
    }
    
    .btn::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: skewX(-20deg);
      transition: 0.5s;
    }
    
    .btn:hover::after {
      left: 150%;
    }

    .btn:hover {
      transform: translateY(-3px);
    }

    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 10px 24px rgba(16, 185, 129, 0.25);
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 10px 24px rgba(59, 130, 246, 0.25);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-print {
      background: linear-gradient(135deg, #d4af37, #b8860b);
      color: white;
      box-shadow: 0 10px 24px rgba(212, 175, 55, 0.25);
    }

    .loading-spinner {
      display: none;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .status-msg {
      display: none;
      margin-top: 20px;
      padding: 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.6;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .status-success {
      display: block;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #a7f3d0;
    }

    .status-error {
      display: block;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fecaca;
    }

    @media (max-width: 860px) {
      .grid,
      .two-preview {
        grid-template-columns: 1fr;
      }
      .email-preview-box iframe {
        min-height: 600px;
      }
    }
    
    @media (max-width: 500px) {
      body {
        padding: 20px 12px;
      }
      .content {
        padding: 24px 20px;
      }
      .header {
        padding: 28px 20px 20px;
      }
      .header h1 {
        font-size: 26px;
      }
      .btn-container {
        flex-direction: column;
        gap: 12px;
      }
      .btn {
        width: 100%;
        min-width: unset;
      }
    }
  </style>"""

content = re.sub(
    r'<style>.*?</style>',
    new_styles,
    content,
    count=1,
    flags=re.DOTALL
)

new_email_preview = """<div class="email-preview-box">
            <div class="browser-topbar">
              <div class="mac-dot close"></div>
              <div class="mac-dot min"></div>
              <div class="mac-dot max"></div>
            </div>
            <iframe id="email-preview-frame" title="Corporate Email Preview"></iframe>
          </div>"""

content = re.sub(
    r'<div class="email-preview-box">\s*<iframe id="email-preview-frame" title="Corporate Email Preview"></iframe>\s*</div>',
    new_email_preview,
    content,
    flags=re.DOTALL
)

new_preview_html_template = """function buildPreviewHtml(params) {
      return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin:0; padding:32px 16px; background:#f8fafc; font-family:'Segoe UI', Arial, sans-serif; color:#334155; }
  .wrapper { max-width:700px; margin:0 auto; background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05); }
  .accent { height:6px; background:linear-gradient(90deg, #3b82f6, #d4af37); }
  .header { padding:32px; background:#0f172a; color:#f8fafc; }
  .body { padding:40px; line-height:1.7; font-size: 15px; }
  .meta { background:#f1f5f9; border:1px solid #e2e8f0; padding:20px; margin-bottom:30px; border-radius:8px; font-size:14px; }
  .meta table { width:100%; border-collapse: collapse; }
  .meta td { padding:6px 0; border-bottom: 1px solid #e2e8f0; }
  .meta tr:last-child td { border-bottom: none; }
  .label { color:#64748b; font-weight:600; width:140px; }
  .value { color:#0f172a; font-weight:700; text-align:right; }
  .subject { background:#fffbeb; border-left:4px solid #d4af37; padding:16px 20px; margin-bottom:30px; font-weight:700; font-size:16px; color:#1e293b; border-radius: 0 8px 8px 0; }
  .sig { margin-top:40px; padding-top:24px; border-top:1px solid #e2e8f0; }
  .sig strong { font-size: 16px; color: #0f172a; }
  p { margin-bottom: 16px; }
  @media print {
    body { background: #fff; padding: 0; }
    .wrapper { box-shadow: none; border: none; margin: 0; max-width: 100%; border-radius: 0; }
    .header { color: #000; background: transparent; padding: 0 0 20px 0; border-bottom: 2px solid #d4af37; margin-bottom: 20px; }
    .accent { display: none; }
    .meta { background: transparent; border: none; padding: 0; }
    .subject { background: transparent; border: none; padding: 0; margin-bottom: 20px; }
  }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="accent"></div>
    <div class="header">
      <div style="font-size:24px; font-weight:700; letter-spacing:-0.5px;">Formal Resignation Notice</div>
    </div>
    <div class="body">
      <div class="meta">
        <table>
          <tr><td class="label">Date</td><td class="value">${escapeHtml(params.resignation_date)}</td></tr>
          <tr><td class="label">Employee</td><td class="value">${escapeHtml(params.employee_name)}</td></tr>
          <tr><td class="label">Designation</td><td class="value">${escapeHtml(params.designation)}</td></tr>
        </table>
      </div>
      <div style="margin-bottom:24px;">
        <strong style="color:#0f172a; font-size:16px;">${escapeHtml(params.recipient_name)}</strong><br>
        ${escapeHtml(params.company_name)}<br>
        ${escapeHtml(params.company_city)}
      </div>
      <div class="subject">Subject: ${escapeHtml(params.subject)}</div>
      <p>Dear Sir/Madam,</p>
      <p>${escapeHtml(params.letter_body_1)}</p>
      <p>${escapeHtml(params.letter_body_2)}</p>
      <p>${escapeHtml(params.letter_body_3)}</p>
      <p>${escapeHtml(params.letter_body_4)}</p>
      <div class="sig">
        <strong>${escapeHtml(params.employee_name)}</strong><br>
        ${escapeHtml(params.designation)}<br>
        ${escapeHtml(params.company_name)}<br>
        <div style="margin-top:12px; font-size:13px; color:#64748b;">Contact: ${escapeHtml(params.phone_number)} &bull; Email: ${escapeHtml(params.sender_email)}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
    }"""

content = re.sub(
    r'function buildPreviewHtml\(params\) \{.*?\n    \}',
    new_preview_html_template,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
