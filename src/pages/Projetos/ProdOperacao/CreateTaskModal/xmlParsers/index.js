// xmlParsers.js

function onlyDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

function safeText(node) {
  if (!node) return "";
  return String(node.textContent || "").trim();
}

// ===== Helpers básicos =====
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

// ✅ pega tag por tagName OU por localName (resolve XML com namespace/prefixo)
function getFirstAny(doc, tag) {
  const n = doc.getElementsByTagName(tag)[0];
  if (n) return n;

  const all = doc.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if ((el.localName || el.tagName) === tag) return el;
  }
  return null;
}

function hasTagAny(doc, tag) {
  if (doc.getElementsByTagName(tag)?.length) return true;

  const all = doc.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if ((el.localName || el.tagName) === tag) return true;
  }
  return false;
}

function getAllAny(doc, tag) {
  const out = [];
  const direct = doc.getElementsByTagName(tag);
  if (direct && direct.length) {
    for (let i = 0; i < direct.length; i++) out.push(direct[i]);
    return out;
  }

  const all = doc.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if ((el.localName || el.tagName) === tag) out.push(el);
  }
  return out;
}

// ✅ igual ao getFirstAny, mas procurando DENTRO de um bloco (element)
function getFirstIn(parentEl, tags) {
  if (!parentEl) return null;

  for (let i = 0; i < tags.length; i++) {
    const t = tags[i];

    // tenta por tagName direto
    const byName = parentEl.getElementsByTagName(t);
    if (byName && byName.length) return byName[0];

    // fallback por localName (namespace)
    const all = parentEl.getElementsByTagName("*");
    for (let j = 0; j < all.length; j++) {
      const el = all[j];
      if ((el.localName || el.tagName) === t) return el;
    }
  }

  return null;
}

function parseParty(blockEl) {
  if (!blockEl) return null;

  const nome = safeText(getFirstIn(blockEl, ["xNome", "xFant"]));
  const cnpj = onlyDigits(safeText(getFirstIn(blockEl, ["CNPJ"])));
  const cpf = onlyDigits(safeText(getFirstIn(blockEl, ["CPF"])));

  const endEl = getFirstIn(blockEl, [
    "enderEmit",
    "enderDest",
    "enderReme",
    "enderToma",
    "enderExped",
  ]);

  const end = endEl
    ? {
        logradouro: safeText(getFirstIn(endEl, ["xLgr"])),
        numero: safeText(getFirstIn(endEl, ["nro"])),
        bairro: safeText(getFirstIn(endEl, ["xBairro"])),
        municipio: safeText(getFirstIn(endEl, ["xMun"])),
        uf: safeText(getFirstIn(endEl, ["UF"])),
        cep: onlyDigits(safeText(getFirstIn(endEl, ["CEP"]))),
      }
    : null;

  return {
    nome,
    cnpj: cnpj || "",
    cpf: cpf || "",
    endereco: end,
  };
}

// ===== NFe =====
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

// ===== CT-e =====

// ✅ parse num (aceita "1738.2280" ou "1738,2280") e TRUNCA decimal
function parseIntTrunc(v) {
  const raw = String(v || "").trim();
  if (!raw) return 0;

  const norm = raw.replace(",", ".");
  const num = Number.parseFloat(norm);
  if (!Number.isFinite(num)) return 0;

  // pediu: ignorar o que vem depois da vírgula/ponto
  // ex: 1738.2280 -> 1738
  if (num < 0) return Math.ceil(num); // se algum dia vier negativo (vai saber)
  return Math.floor(num);
}

// CT-e: peso e volume ficam em vários <infQ>.
// - peso: tpMed "PESO REAL" (preferência) ou outro "PESO ..."
// - volume: tpMed "UNIDADE" (normalmente cUnid=03) ou algo com "VOLUME"
function sumVolumesPesoFromCTe(xmlDoc) {
  let volumes = 0;

  // peso: escolhe o MELHOR candidato (não soma, pra não duplicar)
  let bestPeso = 0;
  let bestPesoPriority = 0;

  const infQs = getAllAny(xmlDoc, "infQ");

  for (let i = 0; i < infQs.length; i++) {
    const infQ = infQs[i];

    const tpMedRaw = safeText(getFirstIn(infQ, ["tpMed"]));
    const tpMed = String(tpMedRaw || "").trim().toUpperCase();

    const qCargaRaw = safeText(getFirstIn(infQ, ["qCarga"]));
    if (!qCargaRaw) continue;

    const cUnid = safeText(getFirstIn(infQ, ["cUnid"])); // ex: 03
    const qInt = parseIntTrunc(qCargaRaw);

    // ---- volume ----
    const isUnidade = tpMed === "UNIDADE" || tpMed.includes("UNIDADE");
    const isVolume = tpMed.includes("VOLUME") || tpMed.includes("VOLUM");
    const looksLikeUnit03 = String(cUnid || "").trim() === "03";

    if ((isUnidade || isVolume || looksLikeUnit03) && qInt > 0) {
      volumes += qInt;
      continue;
    }

    // ---- peso ----
    const isPeso = tpMed.includes("PESO") || tpMed.includes("KG") || tpMed.includes("PESO REAL");
    if (isPeso && qInt > 0) {
      // prioridade: PESO REAL > PESO BRUTO > outros
      let pr = 1;
      if (tpMed === "PESO REAL") pr = 3;
      else if (tpMed.includes("BRUTO")) pr = 2;

      if (pr > bestPesoPriority) {
        bestPesoPriority = pr;
        bestPeso = qInt;
      } else if (pr === bestPesoPriority && qInt > bestPeso) {
        // se empatar, pega o maior
        bestPeso = qInt;
      }
    }
  }

  return { volumes, pesoKg: bestPeso };
}

export function parseXmlTextToDoc(xmlText, docKind) {
  const text = String(xmlText || "").trim();
  if (!text) return null;

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "application/xml");

  // erro de parse
  const err = xmlDoc.getElementsByTagName("parsererror")[0];
  if (err) return null;

  // ✅ autodetecção de tipo pelo XML
  let kind = String(docKind || "").toUpperCase().trim();
  const hasNFe = hasTagAny(xmlDoc, "infNFe");
  const hasCTe = hasTagAny(xmlDoc, "infCte");

  if (kind !== "NFE" && kind !== "CTE") {
    kind = hasCTe ? "CTE" : "NFE";
  }
  if (kind === "NFE" && !hasNFe && hasCTe) kind = "CTE";
  if (kind === "CTE" && !hasCTe && hasNFe) kind = "NFE";

  const id =
    crypto?.randomUUID ? crypto.randomUUID() : `x-${Date.now()}-${Math.random()}`;

  if (kind === "NFE") {
    const inf = getFirstAny(xmlDoc, "infNFe");
    const idAttr = inf?.getAttribute("Id") || "";
    const chave = onlyDigits(idAttr).slice(-44);
    if (!chave || chave.length !== 44) return null;

    const emit = parseParty(getFirstAny(xmlDoc, "emit"));
    const dest = parseParty(getFirstAny(xmlDoc, "dest"));
    const { volumes, pesoKg } = sumVolumesPesoFromNFe(xmlDoc);

    // cliente = emit (como você já fazia)
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

  if (kind === "CTE") {
    const inf = getFirstAny(xmlDoc, "infCte");
    const idAttr = inf?.getAttribute("Id") || "";
    const chave = onlyDigits(idAttr).slice(-44);
    if (!chave || chave.length !== 44) return null;

    // partes do CTe
    const emit = parseParty(getFirstAny(xmlDoc, "emit")); // ✅ quem emitiu o CTe (Karavaggio)
    const rem = parseParty(getFirstAny(xmlDoc, "rem"));
    const dest = parseParty(getFirstAny(xmlDoc, "dest"));

    // tomador (mantém no objeto, mas NÃO é mais o "cliente" pra você)
    const toma =
      parseParty(getFirstAny(xmlDoc, "toma3")) ||
      parseParty(getFirstAny(xmlDoc, "toma4"));

    const { volumes, pesoKg } = sumVolumesPesoFromCTe(xmlDoc);

    // ✅ regra que você pediu:
    // cliente = quem emitiu o CTe (Karavaggio)
    const cliente = emit ? { nome: emit.nome, cnpj: emit.cnpj || emit.cpf } : null;

    return {
      id,
      docKind: "CTE",
      source: "xml",
      chave,
      numero: getVal(xmlDoc, ["nCT"]),
      serie: getVal(xmlDoc, ["serie"]),
      cliente,
      remetente: rem,       // remetente do CTe (rem)
      destinatario: dest,
      tomador: toma,        // tomador (se existir)
      endDest: dest?.endereco || null,
      volumes: volumes || 0, // ✅ vem do tpMed=UNIDADE/cUnid=03
      pallets: 0,
      pesoKg: pesoKg || 0,   // ✅ vem do tpMed=PESO REAL (truncado)
      importedAt: new Date().toISOString(),
      xmlText: text,
    };
  }

  return null;
}

// ZIP -> lista de textos XML
export async function readZipToXmlTexts(zipFile) {
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
