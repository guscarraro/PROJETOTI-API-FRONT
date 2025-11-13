// Gera e imprime etiquetas 100mm x 70mm (Argox) usando um iframe invisível.
// opts: { caixas: [{ tipo, peso }], conferente }
export function printPedidoLabels(pedido, opts = {}) {
  if (!pedido) return;

  const caixas = Array.isArray(opts.caixas) ? opts.caixas : [];
  if (caixas.length === 0) return;

  const conferente = String(opts.conferente || "-");
  const impressaoAt = new Date();

  const cut = (s, max) => {
    const v = String(s ?? "");
    return v.length > max ? v.slice(0, max - 1) + "…" : v;
  };

  const nf = pedido.nota ? String(pedido.nota) : "—";
  const cliente = cut(pedido.cliente || "—", 34);
  const destinatario = cut(pedido.destino || "—", 38);
  const endereco = String(pedido.endereco || "—"); // endereço completo
  const transportadora = cut(pedido.transportador || "—", 32);
  const pedidoNr = pedido.nr_pedido;

  const title = `Etiquetas - Pedido ${pedidoNr}`;
  const formatDate = (d) => (d ? d.toLocaleString("pt-BR") : "—");

  const html = `
<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  :root { --ink:#111; --muted:#555; --line:#111; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  @page { size: 100mm 70mm; margin: 0; }
  body {
    width: 100mm; height: 70mm; margin: 0; padding: 0;
    color: var(--ink);
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    font-size: 6pt; /* tudo base 6pt */
  }
  .label {
    width: 100mm; height: 70mm; padding: 5.5mm 5.5mm 4.5mm 5.5mm;
    display: grid;
    grid-template-rows: 12mm 34mm 14mm;
    gap: 2mm;
    page-break-after: always;
    overflow: hidden;
  }
  @media screen { .label { border: 1px dashed var(--line); border-radius: 3mm; } }

  .header {
    display: flex; align-items: center; justify-content: space-between; gap: 3mm;
    min-height: 12mm; max-height: 12mm; overflow: hidden;
  }
  .pill {
    display: inline-block; padding: 1mm 4mm; border: 0.3mm solid #000; border-radius: 12mm;
    font-weight: 900; font-size: 6pt; line-height: 1; white-space: nowrap; max-width: 46mm;
    overflow: hidden; text-overflow: ellipsis;
  }
  .headRight { display: flex; flex-direction: column; align-items: flex-end; gap: 1mm; }
  .timestamp { font-size: 6pt; color: var(--muted); line-height: 1; white-space: nowrap; }
  .pedidoNo { font-size: 6pt; font-weight: 800; white-space: nowrap; }
  .ovLine { font-size: 6pt; color: var(--muted); line-height: 1; white-space: nowrap; }

  .fields {
    display: grid;
    grid-template-rows: repeat(6, 1fr); /* mais uma linha por causa do End: */
    gap: 1mm;
    min-height: 34mm; max-height: 34mm; overflow: hidden;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 2mm;
    white-space: nowrap;
  }
  .rowAddr {
    align-items: flex-start;
    white-space: normal; /* permite quebra no endereço */
  }

  .hr  { height: 0.3mm; background: #000; opacity: .18; }

  .k {
    width: 24mm;
    flex: 0 0 24mm;
    color: var(--muted);
    font-size: 6pt;
  }
  .vwrap {
    flex: 1 1 auto;
    min-width: 0;
  }

  .big  { font-size: 6pt; font-weight: 700; letter-spacing: 0; }
  .mid  { font-size: 6pt; font-weight: 700; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; font-size: 6pt; }

  .big, .mid, .mono, .v {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .muted { color: var(--muted); font-size: 6pt; }

  .addr {
    font-size: 6pt;
    color: var(--muted);
    line-height: 1.1;
    white-space: normal;      /* quebra se precisar */
    word-break: break-word;   /* quebra palavra grande */
    display: block;
  }

  .chips {
    display: flex; align-items: center; gap: 2mm;
    white-space: nowrap; overflow: hidden;
    min-height: 14mm; max-height: 14mm;
  }
  .chip {
    display: inline-flex; gap: 1.2mm; align-items: center;
    padding: 0.8mm 2.6mm; border: 0.3mm solid #000; border-radius: 2.5mm;
    font-size: 6pt; font-weight: 700; max-width: 32mm; overflow: hidden; text-overflow: ellipsis;
  }
  .chip .mono { max-width: 20mm; }
  .confName { font-size: 6pt; max-width: 26mm; overflow: hidden; text-overflow: ellipsis; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  ${(() => {
    let out = "";
    const total = caixas.length;
    for (let i = 0; i < total; i++) {
      const seq = i + 1;
      const tipo = String(caixas[i]?.tipo || "-").toUpperCase();
      const pesoN = Number(caixas[i]?.peso || 0);
      const pesoFmt = isNaN(pesoN) ? "-" : pesoN.toFixed(2) + " kg";
      out += `
      <section class="label">
        <div class="header">
          <div class="pill">EMBALAGEM ${seq}/${total}</div>
          <div class="headRight">
            <div class="timestamp mono">${formatDate(impressaoAt)}</div>
            <div class="pedidoNo">Remessa #${pedidoNr}</div>
            <div class="ovLine">OV: ${pedido.ov || "—"}</div>
          </div>
        </div>
        <div class="fields">
          <!-- linha 1: Destinatário -->
          <div class="row">
            <span class="k">Destinatário:</span>
            <span class="vwrap"><span class="big">${destinatario}</span></span>
          </div>
          <!-- linha 2: End: logo abaixo de Destinatário: -->
          <div class="row rowAddr">
            <span class="k">Endereço:</span>
            <span class="vwrap"><span class="addr">${endereco}</span></span>
          </div>
          <!-- linha 3: Transportadora -->
          <div class="row">
            <span class="k">Transportadora:</span>
            <span class="vwrap"><span class="mid">${transportadora}</span></span>
          </div>
          <div class="hr"></div>
          <!-- linha 4: NF -->
          <div class="row">
            <span class="k">Nota Fiscal:</span>
            <span class="vwrap"><span class="mono">${nf}</span></span>
          </div>
          <!-- linha 5: Cliente -->
          <div class="row">
            <span class="k">Cliente:</span>
            <span class="vwrap"><span class="mid">${cliente}</span></span>
          </div>
        </div>
        <div class="chips">
          <div class="chip"><span class="muted">Tipo</span><span class="mono">${tipo}</span></div>
          <div class="chip"><span class="muted">Peso</span><span class="mono">${pesoFmt}</span></div>
          <div class="chip"><span class="muted">Conf.</span><span class="confName" title="${conferente}">${conferente}</span></div>
        </div>
      </section>`;
    }
    return out;
  })()}
</body>
</html>
`.trim();

  const OLD_ID = "__print_iframe_labels__";
  const old = document.getElementById(OLD_ID);
  if (old && old.parentNode) old.parentNode.removeChild(old);

  const iframe = document.createElement("iframe");
  iframe.id = OLD_ID;
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  document.body.appendChild(iframe);

  const cleanup = () => {
    try {
      const cw = iframe.contentWindow;
      if (cw) cw.onafterprint = null;
    } catch {}
    setTimeout(() => {
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 300);
  };

  iframe.onload = () => {
    try {
      const cw = iframe.contentWindow;
      if (!cw) return cleanup();
      cw.focus();
      setTimeout(() => {
        try {
          cw.onafterprint = cleanup;
          cw.print();
        } catch {
          cleanup();
        }
      }, 50);
    } catch {
      cleanup();
    }
  };

  try {
    iframe.srcdoc = html;
  } catch {
    const doc = iframe.contentWindow || iframe.contentDocument;
    const ddoc = doc.document || doc;
    ddoc.open();
    ddoc.write(html);
    ddoc.close();
  }

  setTimeout(cleanup, 10000);
}
