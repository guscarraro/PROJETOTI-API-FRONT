// src/pages/Separacao/print.js

// Gera e imprime etiquetas no formato 100mm x 70mm (Argox) usando um iframe invisível.
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

  // HTML/CSS para 100x70mm, 1 etiqueta por página
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

  /* Tamanho físico da página da impressora (Argox) */
  @page {
    size: 100mm 70mm;
    margin: 0; /* sem margens: usa toda a etiqueta */
  }

  body {
    width: 100mm;
    height: 70mm;
    margin: 0;
    padding: 0;
    color: var(--ink);
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  }

  /* Uma etiqueta ocupa a página inteira; se houver várias, cada <section> quebra página */
  .label {
    width: 100mm;
    height: 70mm;
    padding: 6mm 6mm 5mm 6mm; /* respiro interno */
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 2.5mm;
    page-break-after: always;
  }

  /* Bordas só para visualização em tela; na impressão ficam “limpas” */
  @media screen {
    .label { border: 1px dashed var(--line); border-radius: 3mm; }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4mm;
  }

  .pill {
    display: inline-block;
    padding: 1mm 4mm;
    border: 0.3mm solid #000;
    border-radius: 12mm;
    font-weight: 900;
    font-size: 11pt;
    line-height: 1;
    white-space: nowrap;
  }

  .mid  { font-size: 12pt; font-weight: 800; }
  .big  { font-size: 16pt; font-weight: 900; letter-spacing: .2px; }

  .row { display: flex; align-items: center; gap: 2mm; }
  .muted { color: var(--muted); font-size: 9pt; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

  .hr { height: 0.3mm; background: #000; opacity: .18; }

  .k { min-width: 26mm; color: var(--muted); font-size: 9pt; }
  .kv { display: flex; gap: 2mm; align-items: baseline; }
  .kv .v { font-weight: 800; }

  .chips { display: flex; gap: 2.5mm; flex-wrap: wrap; }
  .chip {
    display: inline-flex; gap: 1.5mm; align-items: center;
    padding: 1mm 3mm; border: 0.3mm solid #000; border-radius: 2.5mm;
    font-size: 9pt; font-weight: 700;
  }

  /* Evita quebrar textos longos e protege layout */
  .nowrap { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Impresso: remove tudo que não seja conteúdo */
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
      // ⬇️ corrigido: evita template literal dentro de outro
      const pesoFmt = isNaN(pesoN) ? "-" : (pesoN.toFixed(2) + " kg");

      out += `
      <section class="label">
        <div class="header">
          <div class="pill">EMBALAGEM ${seq}/${total}</div>
          <div class="mid">Pedido #${pedidoNr}</div>
        </div>

        <div class="row"><span class="k">Destinatário:</span> <span class="big nowrap">${destinatario}</span></div>
        <div class="row"><span class="k">Transportadora:</span> <span class="mid nowrap">${transportadora}</span></div>

        <div class="hr"></div>

        <div class="row kv"><span class="k">Nota Fiscal:</span> <span class="v mono nowrap">${nf}</span></div>
        <div class="row kv"><span class="k">Cliente:</span> <span class="v nowrap">${cliente}</span></div>

        <div class="hr"></div>

        <div class="chips">
          <div class="chip"><span class="muted">Tipo</span><span class="mono">${tipo}</span></div>
          <div class="chip"><span class="muted">Peso</span><span class="mono">${pesoFmt}</span></div>
          <div class="chip"><span class="muted">Conf.</span><span>${conferente}</span></div>
          <div class="chip"><span class="muted">Impresso</span><span class="mono">${formatDate(impressaoAt)}</span></div>
        </div>
      </section>`;
    }
    return out;
  })()}
  <script>
    window.onload = () => setTimeout(() => { window.focus(); window.print(); }, 150);
  </script>
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
