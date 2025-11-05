// src/pages/Separacao/print.js

// Gera e imprime etiquetas 100mm x 70mm (Argox) usando um iframe invisível.
// opts: { caixas: [{ tipo, peso }], conferente }
export function printPedidoLabels(pedido, opts = {}) {
  if (!pedido) return;

  const caixas = Array.isArray(opts.caixas) ? opts.caixas : [];
  if (caixas.length === 0) return;

  const conferente = String(opts.conferente || "-");
  const impressaoAt = new Date();

  // Helpers de truncagem dura (segurança extra)
  const cut = (s, max) => {
    const v = String(s ?? "");
    return v.length > max ? v.slice(0, max - 1) + "…" : v;
  };

  const nf = pedido.nota ? String(pedido.nota) : "—";
  const cliente = cut(pedido.cliente || "—", 34);
  const destinatario = cut(pedido.destino || "—", 38);
  const transportadora = cut(pedido.transportador || "—", 32);
  const pedidoNr = pedido.nr_pedido;

  const title = `Etiquetas - Pedido ${pedidoNr}`;
  const formatDate = (d) => (d ? d.toLocaleString("pt-BR") : "—");

  // HTML/CSS para 100x70mm, 1 etiqueta por página (layout anti-quebra)
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
  }

  .label {
    width: 100mm; height: 70mm; padding: 5.5mm 5.5mm 4.5mm 5.5mm;
    display: grid;
    grid-template-rows: 12mm 34mm 14mm; /* alturas fechadas */
    gap: 2mm;
    page-break-after: always;
    overflow: hidden; /* CLIPA qualquer excesso – não “empurra” a próxima etiqueta */
  }

  @media screen {
    .label { border: 1px dashed var(--line); border-radius: 3mm; }
  }

  /* ====== HEADER ====== */
  .header {
    display: flex; align-items: center; justify-content: space-between; gap: 3mm;
    min-height: 12mm; max-height: 12mm; overflow: hidden;
  }
  .pill {
    display: inline-block; padding: 1mm 4mm; border: 0.3mm solid #000; border-radius: 12mm;
    font-weight: 900; font-size: 10.5pt; line-height: 1; white-space: nowrap; max-width: 46mm;
    overflow: hidden; text-overflow: ellipsis;
  }
  .headRight { display: flex; flex-direction: column; align-items: flex-end; gap: 1mm; }
  .timestamp { font-size: 8pt; color: var(--muted); line-height: 1; white-space: nowrap; }
  .pedidoNo { font-size: 11.5pt; font-weight: 800; white-space: nowrap; }

  /* ====== BLOCO DE CAMPOS ====== */
  .fields {
    display: grid; grid-template-rows: repeat(5, 1fr); gap: 1.2mm;
    min-height: 34mm; max-height: 34mm; overflow: hidden;
  }
  .row { display: flex; align-items: center; gap: 2mm; white-space: nowrap; }
  .hr  { height: 0.3mm; background: #000; opacity: .18; }

  .k   { width: 24mm; flex: 0 0 24mm; color: var(--muted); font-size: 8.8pt; }
  .vwrap { flex: 1 1 auto; min-width: 0; }
  .big  { font-size: 14.5pt; font-weight: 900; letter-spacing: .2px; }
  .mid  { font-size: 11pt; font-weight: 800; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }

  /* truncagem segura nas values */
  .big, .mid, .mono, .v { display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .muted { color: var(--muted); font-size: 8.8pt; }

  /* ====== CHIPS ====== */
  .chips {
    display: flex; align-items: center; gap: 2mm;
    white-space: nowrap; overflow: hidden; /* uma linha só */
    min-height: 14mm; max-height: 14mm;
  }
  .chip {
    display: inline-flex; gap: 1.2mm; align-items: center;
    padding: 0.8mm 2.6mm; border: 0.3mm solid #000; border-radius: 2.5mm;
    font-size: 8.6pt; font-weight: 700; max-width: 32mm; overflow: hidden; text-overflow: ellipsis;
  }
  .chip .mono { max-width: 20mm; }
  .confName { font-size: 8pt; max-width: 26mm; overflow: hidden; text-overflow: ellipsis; }

  /* print fidelity */
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
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
      const pesoFmt = isNaN(pesoN) ? "-" : (pesoN.toFixed(2) + " kg");

      out += `
      <section class="label">
        <!-- HEADER com timestamp e pedido -->
        <div class="header">
          <div class="pill">EMBALAGEM ${seq}/${total}</div>
          <div class="headRight">
            <div class="timestamp mono">${formatDate(impressaoAt)}</div>
            <div class="pedidoNo">Pedido #${pedidoNr}</div>
          </div>
        </div>

        <!-- CAMPOS (alturas fechadas + truncagem) -->
        <div class="fields">
          <div class="row">
            <span class="k">Destinatário:</span>
            <span class="vwrap"><span class="big">${destinatario}</span></span>
          </div>

          <div class="row">
            <span class="k">Transportadora:</span>
            <span class="vwrap"><span class="mid">${transportadora}</span></span>
          </div>

          <div class="hr"></div>

          <div class="row">
            <span class="k">Nota Fiscal:</span>
            <span class="vwrap"><span class="mono">${nf}</span></span>
          </div>

          <div class="row">
            <span class="k">Cliente:</span>
            <span class="vwrap"><span class="mid">${cliente}</span></span>
          </div>
        </div>

        <!-- CHIPS em linha única -->
        <div class="chips">
          <div class="chip"><span class="muted">Tipo</span><span class="mono">${tipo}</span></div>
          <div class="chip"><span class="muted">Peso</span><span class="mono">${pesoFmt}</span></div>
          <div class="chip"><span class="muted">Conf.</span><span class="confName" title="${conferente}">${conferente}</span></div>
        </div>
      </section>`;
    }
    return out;
  })()}
  <script>window.onload = () => setTimeout(() => { window.focus(); window.print(); }, 150);</script>
</body>
</html>
  `.trim();

  // Cria iframe oculto para imprimir
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow || iframe.contentDocument;
  const ddoc = doc.document || doc;
  ddoc.open();
  ddoc.write(html);
  ddoc.close();

  // Cleanup pós-impressão
  const cleanup = () => {
    setTimeout(() => {
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 400);
  };
  if (doc.addEventListener) doc.addEventListener("afterprint", cleanup);
  setTimeout(cleanup, 3000);
}
