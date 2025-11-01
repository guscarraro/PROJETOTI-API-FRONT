import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Field, TextArea, SmallMuted } from "../style";
import { STATUS_PEDIDO } from "../constants";

/**
 * Aceita CSV/TSV com colunas:
 * Cliente, nr_pedido, destino, cod_prod, qtde, um_med, transportador?, separador?
 */
export default function UploadCsvModal({ isOpen, onClose, onImported }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const parse = (raw) => {
    const lines = String(raw || "").trim().split(/\r?\n/);
    if (!lines.length) return [];
    const sep = lines[0].includes("\t")
      ? "\t"
      : lines[0].includes(";")
      ? ";"
      : ",";

    const header = lines[0].split(sep).map((s) => s.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep);
      if (cols.length < 5) continue;
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        const key = header[j];
        obj[key] = (cols[j] || "").trim();
      }
      rows.push(obj);
    }
    return rows;
  };

  const groupPedidos = (rows) => {
    const map = new Map();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const id = String(r.nr_pedido);
      if (!map.has(id)) {
        map.set(id, {
          nr_pedido: id,
          cliente: r.Cliente || r.cliente || r["Cliente"] || "",
          destino: r.destino || r.Destino || r["destino"] || "",
          transportador:
            r.transportador || r["Transportador"] || r["transportador"] || "",
          separador: r.separador || r["Separador"] || r["separador"] || "",
          itens: [],
          status: STATUS_PEDIDO.PENDENTE,
          logs: [],
          created_at: new Date().toISOString(),
        });
      }
      const ped = map.get(id);
      ped.cliente = ped.cliente || r.Cliente || r.cliente || r["Cliente"] || "";
      ped.destino = ped.destino || r.destino || r.Destino || r["destino"] || "";
      if (!ped.transportador && (r.transportador || r["Transportador"]))
        ped.transportador = r.transportador || r["Transportador"];
      if (!ped.separador && (r.separador || r["Separador"]))
        ped.separador = r.separador || r["Separador"];

      const item = {
        cod_prod: r.cod_prod || r["cod_prod"] || r["Código"] || "",
        qtde: Number(r.qtde || r["qtde"] || r["Quantidade"] || 0),
        um_med: r.um_med || r["um_med"] || r["UM"] || "",
      };
      ped.itens.push(item);
    }
    return Array.from(map.values());
  };

  const readFile = (f) =>
    new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result || ""));
      fr.onerror = (e) => rej(e);
      fr.readAsText(f, "utf-8");
    });

  const handleImport = async () => {
    try {
      let raw = text;
      if (!raw && file) raw = await readFile(file);
      if (!raw) return;

      const rows = parse(raw);
      const pedidos = groupPedidos(rows);
      onImported(pedidos);
      setText("");
      setFile(null);
    } catch {
      /* opcional: toast de erro */
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="project-modal">
      <ModalHeader toggle={onClose}>Importar pedidos via CSV/TSV</ModalHeader>
      <ModalBody>
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <SmallMuted>Arquivo (.csv/.tsv)</SmallMuted>
            <Field
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <SmallMuted>Ou cole o conteúdo:</SmallMuted>
            <TextArea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Cliente\tnr_pedido\tdestino\tcod_prod\tqtde\tum_med\ttransportador\tseparador\nFERSA\t11321\tCONDOR\t321\t5\tcx\tTRANSLOVATO\tLucas Lima`}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleImport}>
          Importar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
