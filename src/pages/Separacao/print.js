// Gera e imprime etiquetas do pedido usando um iframe invisível (sem abrir nova aba)
export function printPedidoLabels(pedido) {
  if (!pedido) return;

  const total = Array.isArray(pedido.itens)
    ? pedido.itens.reduce((acc, it) => acc + (Number(it?.qtde || 0) || 0), 0)
    : 0;

  const codes = (pedido.itens || [])
    .map((it) => String(it.cod_prod || "").trim())
    .filter(Boolean);

  const uniqueCodes = Array.from(new Set(codes)).join(", ");

  const title = `Etiquetas - Pedido ${pedido.nr_pedido}`;
  const nota = pedido.nota ? String(pedido.nota) : "—";

  const html = `
<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  :root{ --border: #222; }
  * { box-sizing: border-box; }
  body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 10mm; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; }
  .label {
    border: 1px dashed var(--border);
    border-radius: 4mm;
    padding: 6mm;
    display: grid;
    grid-auto-rows: min-content;
    gap: 2mm;
    page-break-inside: avoid;
  }
  .muted { opacity: .75; font-size: 9pt; }
  .row { display: flex; align-items: center; gap: 6px; }
  .big { font-size: 13pt; font-weight: 700; }
  .pill {
    display: inline-block; padding: 2px 8px; border-radius: 999px;
    border: 1px solid rgba(0,0,0,.2);
    font-size: 10pt; font-weight: 800;
  }
  @media print {
    @page { size: A4; margin: 8mm; }
    body { padding: 0; }
  }
</style>
</head>
<body>
  <div class="grid">
    ${Array.from({ length: total }, (_, i) => {
      const seq = i + 1;
      return `
      <div class="label">
        <div class="row" style="justify-content: space-between;">
          <div class="pill">EMBALAGEM ${seq}/${total}</div>
          <div class="muted">Pedido #${pedido.nr_pedido}</div>
        </div>
        <div class="row"><span class="muted">Cliente:</span> <span class="big">${pedido.cliente || "—"}</span></div>
        <div class="row"><span class="muted">Destino:</span> <span class="big">${pedido.destino || "—"}</span></div>
        <div class="row"><span class="muted">Transportadora:</span> <span>${pedido.transportador || "—"}</span></div>
        <div class="row"><span class="muted">Cód. Produto(s):</span> <span>${uniqueCodes || "—"}</span></div>
        <div class="row"><span class="muted">Nota (NF):</span> <span>${nota}</span></div>
      </div>
      `;
    }).join("")}
  </div>
  <script>
    // garante que a página carregue CSS antes de imprimir
    window.onload = () => setTimeout(() => { window.focus(); window.print(); }, 150);
  </script>
</body>
</html>
  `.trim();

  // cria iframe oculto para impressão
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  // escreve o conteúdo e imprime
  const doc = iframe.contentWindow || iframe.contentDocument;
  const ddoc = doc.document || doc;
  ddoc.open();
  ddoc.write(html);
  ddoc.close();

  // remove o iframe após a impressão (com fallback)
  const cleanup = () => {
    setTimeout(() => {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 400);
  };

  // melhor esforço: alguns navegadores disparam 'afterprint'
  if (doc.addEventListener) {
    doc.addEventListener("afterprint", cleanup);
  }
  // fallback agressivo
  setTimeout(cleanup, 3000);
}
