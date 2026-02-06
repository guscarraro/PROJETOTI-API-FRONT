function onlyDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

function safeText(node) {
  if (!node) return "";
  return String(node.textContent || "").trim();
}

function getFirst(doc, tags) {
  for (let i = 0; i < tags.length; i++) {
    const n = doc.getElementsByTagName(tags[i])[0];
    if (n) return n;
  }
  return null;
}

function getVal(doc, tags) {
  const n = getFirst(doc, tags);
  return safeText(n);
}

function parseParty(blockEl) {
  if (!blockEl) return null;

  const nome = safeText(getFirst(blockEl, ["xNome", "xFant"]));
  const cnpj = onlyDigits(safeText(getFirst(blockEl, ["CNPJ"])));
  const cpf = onlyDigits(safeText(getFirst(blockEl, ["CPF"])));

  const endEl = getFirst(blockEl, ["enderEmit", "enderDest", "enderReme", "enderToma", "enderExped"]);
  const end = endEl
    ? {
        logradouro: safeText(getFirst(endEl, ["xLgr"])),
        numero: safeText(getFirst(endEl, ["nro"])),
        bairro: safeText(getFirst(endEl, ["xBairro"])),
        municipio: safeText(getFirst(endEl, ["xMun"])),
        uf: safeText(getFirst(endEl, ["UF"])),
        cep: onlyDigits(safeText(getFirst(endEl, ["CEP"]))),
      }
    : null;

  return {
    nome,
    cnpj: cnpj || "",
    cpf: cpf || "",
    endereco: end,
  };
}

function sumVolumesPesoFromNFe(xmlDoc) {
  let volumes = 0;
  let pesoB = 0;
  let pesoL = 0;

  const vols = xmlDoc.getElementsByTagName("vol");
  for (let i = 0; i < vols.length; i++) {
    const vol = vols[i];
    const qVol = safeText(vol.getElementsByTagName("qVol")[0]);
    const pB = safeText(vol.getElementsByTagName("pesoB")[0]);
    const pL = safeText(vol.getElementsByTagName("pesoL")[0]);

    if (qVol) volumes += Number(qVol) || 0;
    if (pB) pesoB += Number(pB) || 0;
    if (pL) pesoL += Number(pL) || 0;
  }

  const pesoKg = pesoB > 0 ? pesoB : pesoL;
  return { volumes, pesoKg };
}

// CT-e varia muito por layout, então aqui a gente pega peso/vol se existir, senão 0 (manual cobre)
function sumVolumesPesoFromCTe(xmlDoc) {
  let volumes = 0;
  let pesoKg = 0;

  // tenta tags comuns
  const qCarga = getVal(xmlDoc, ["qCarga", "qVol"]);
  const pCarga = getVal(xmlDoc, ["vCarga", "peso", "pesoB", "pesoL"]);

  if (qCarga) volumes = Number(qCarga) || 0;
  if (pCarga) pesoKg = Number(pCarga) || 0;

  return { volumes, pesoKg };
}

export function parseXmlTextToDoc(xmlText, docKind) {
  const text = String(xmlText || "").trim();
  if (!text) return null;

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "application/xml");

  // erro de parse
  const err = xmlDoc.getElementsByTagName("parsererror")[0];
  if (err) return null;

  const id = crypto?.randomUUID ? crypto.randomUUID() : `x-${Date.now()}-${Math.random()}`;

  if (docKind === "NFE") {
    // chave costuma estar em infNFe Id="NFe3519..."
    const inf = xmlDoc.getElementsByTagName("infNFe")[0];
    const idAttr = inf?.getAttribute("Id") || "";
    const chave = onlyDigits(idAttr).slice(-44);

    const emit = parseParty(xmlDoc.getElementsByTagName("emit")[0]);
    const dest = parseParty(xmlDoc.getElementsByTagName("dest")[0]);
    const { volumes, pesoKg } = sumVolumesPesoFromNFe(xmlDoc);

    // cliente = remetente (emitente na maioria dos casos)
    const cliente = emit ? { nome: emit.nome, cnpj: emit.cnpj || emit.cpf } : null;

    return {
      id,
      docKind: "NFE",
      source: "xml",
      chave,
      numero: getVal(xmlDoc, ["nNF"]),
      serie: getVal(xmlDoc, ["serie"]),
      cliente,
      remetente: emit,
      destinatario: dest,
      tomador: null,
      endDest: dest?.endereco || null,
      volumes: volumes || 0,
      pallets: 0,
      pesoKg: pesoKg || 0,
      importedAt: new Date().toISOString(),
      xmlText: text,
    };
  }

  if (docKind === "CTE") {
    // CT-e: tenta achar chave no Id
    const inf = xmlDoc.getElementsByTagName("infCte")[0];
    const idAttr = inf?.getAttribute("Id") || "";
    const chave = onlyDigits(idAttr).slice(-44);
    if (!chave || chave.length !== 44) return null;
    // tomador pode estar em toma3/toma4 (depende do layout)
    const toma = parseParty(xmlDoc.getElementsByTagName("toma3")[0]) || parseParty(xmlDoc.getElementsByTagName("toma4")[0]);

    // remetente/destinatário também existem no CT-e
    const rem = parseParty(xmlDoc.getElementsByTagName("rem")[0]);
    const dest = parseParty(xmlDoc.getElementsByTagName("dest")[0]);

    const { volumes, pesoKg } = sumVolumesPesoFromCTe(xmlDoc);

    // cliente = tomador
    const cliente = toma ? { nome: toma.nome, cnpj: toma.cnpj || toma.cpf } : null;

    return {
      id,
      docKind: "CTE",
      source: "xml",
      chave,
      numero: getVal(xmlDoc, ["nCT"]),
      serie: getVal(xmlDoc, ["serie"]),
      cliente,
      remetente: rem,
      destinatario: dest,
      tomador: toma,
      endDest: dest?.endereco || null,
      volumes: volumes || 0,
      pallets: 0,
      pesoKg: pesoKg || 0,
      importedAt: new Date().toISOString(),
      xmlText: text,
    };
  }

  return null;
}

// ZIP -> lista de textos XML
export async function readZipToXmlTexts(zipFile) {
  // precisa ter jszip instalado
  // npm i jszip
  let JSZip;
  try {
    JSZip = (await import("jszip")).default;
  } catch (e) {
    throw new Error("Para importar .zip, instale: npm i jszip");
  }

  const zip = await JSZip.loadAsync(zipFile);
  const xmlTexts = [];

  const names = Object.keys(zip.files || {});
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const f = zip.files[name];
    if (!f || f.dir) continue;

    const lower = String(name).toLowerCase();
    if (!lower.endsWith(".xml")) continue;

    const txt = await f.async("text");
    if (String(txt || "").trim()) xmlTexts.push(txt);
  }

  return xmlTexts;
}
