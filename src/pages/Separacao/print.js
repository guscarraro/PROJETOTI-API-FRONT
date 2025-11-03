// Gera e imprime etiquetas usando um iframe invisível.
// opts: { caixas: [{ tipo, peso }], conferente }
export function printPedidoLabels(pedido, opts = {}) {
  if (!pedido) return;

  const caixas = Array.isArray(opts.caixas) ? opts.caixas : [];
  if (caixas.length === 0) return;

  const conferente = String(opts.conferente || "-");
  const impressaoAt = new Date();

  const nf = pedido.nota ? String(pedido.nota) : "—";
  const cliente = pedido.cliente || "—";
  const destinatario = pedido.destino || "—";
  const transportadora = pedido.transportador || "—";
  const pedidoNr = pedido.nr_pedido;

  const title = `Etiquetas - Pedido ${pedidoNr}`;
  const formatDate = (d) => (d ? d.toLocaleString("pt-BR") : "—");

  // HTML PB moderno (destinatário/transportadora/pedido/embalagem em evidência)
  const html = `
<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  :root{ --ink:#111; --muted:#555; --line:#111; }
  * { box-sizing: border-box; }
  body {
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    margin: 0; padding: 10mm; color: var(--ink);
  }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; }
  .label {
    border: 1px dashed var(--line);
    border-radius: 4mm;
    padding: 6mm;
    display: grid;
    grid-auto-rows: min-content;
    gap: 3mm;
    page-break-inside: avoid;
  }
  .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .muted { color: var(--muted); font-size: 9pt; }
  .big { font-size: 16pt; font-weight: 900; letter-spacing: .2px; }
  .mid { font-size: 12pt; font-weight: 800; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  .pill {
    display: inline-block; padding: 2px 12px; border-radius: 999px;
    border: 1px solid #000; font-weight: 900; font-size: 10pt;
  }
  .header { display:flex; justify-content: space-between; align-items:center; }
  .hr { height: 1px; background: #000; opacity: .15; }
  .k { min-width: 120px; color: var(--muted); }
  .kv { display:flex; gap:8px; }
  .kv .v { font-weight:700; }
  .chips { display:flex; gap:10px; flex-wrap:wrap; }
  .chip {
    display:inline-flex; gap:6px; align-items:center; padding:2px 8px;
    border:1px solid #000; border-radius:8px; font-size:10pt; font-weight:700;
  }
  @media print {
    @page { size: A4; margin: 8mm; }
    body { padding: 0; }
  }
</style>
</head>
<body>
  <div class="grid">
    ${(() => {
      let out = "";
      const total = caixas.length;
      for (let i = 0; i < total; i++) {
        const seq = i + 1;
        const tipo = String(caixas[i]?.tipo || "-").toUpperCase();
        const pesoN = Number(caixas[i]?.peso || 0);
        const pesoFmt = isNaN(pesoN) ? "-" : `${pesoN.toFixed(2)} kg`;

        out += `
        <div class="label">
          <div class="header">
            <div class="pill">EMBALAGEM ${seq}/${total}</div>
            <div class="mid">Pedido #${pedidoNr}</div>
          </div>

          <div class="row"><span class="k">Destinatário:</span> <span class="big">${destinatario}</span></div>
          <div class="row"><span class="k">Transportadora:</span> <span class="mid">${transportadora}</span></div>

          <div class="hr"></div>

          <div class="row kv"><span class="k">Nota Fiscal:</span> <span class="v mono">${nf}</span></div>
          <div class="row kv"><span class="k">Cliente:</span> <span class="v">${cliente}</span></div>

          <div class="hr"></div>

          <div class="chips">
            <div class="chip"><span class="muted">Tipo</span><span class="mono">${tipo}</span></div>
            <div class="chip"><span class="muted">Peso</span><span class="mono">${pesoFmt}</span></div>
            <div class="chip"><span class="muted">Conferente</span><span>${conferente}</span></div>
            <div class="chip"><span class="muted">Impresso em</span><span class="mono">${formatDate(impressaoAt)}</span></div>
          </div>
        </div>`;
      }
      return out;
    })()}
  </div>

  <script>
    window.onload = () => setTimeout(() => { window.focus(); window.print(); }, 150);
  </script>
</body>
</html>
  `.trim();

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

  const cleanup = () => {
    setTimeout(() => {
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 400);
  };
  if (doc.addEventListener) doc.addEventListener("afterprint", cleanup);
  setTimeout(cleanup, 3000);
}
