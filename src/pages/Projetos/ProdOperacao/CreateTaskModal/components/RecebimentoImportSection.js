import React from "react";
import {
  Field,
  Label,
  Row,
  Pill,
  Hint,
  DropZoneTop,
  DropCounter,
  CompactTop3,
} from "../style";
import DocImportDropzone from "../DocImportDropzone";
import { Loader } from "../../style";

export default function RecebimentoImportSection({
  show,
  busy,
  docKind,
  setDocKind,
  pushLog,
  setDocs,
  setChaveInput,
  setMixedClientError,
  setClienteManual,
  setTotalPalletsOverride,
  busyKey,
  isReading,
  readingCount,
  importFiles,
}) {
  if (!show) return null;

  return (
    <>
      <CompactTop3>
        <Field>
          <Label>Documento</Label>
          <Row style={{ gap: 6 }}>
            <Pill
              type="button"
              disabled={busy}
              $active={docKind === "NFE"}
              onClick={() => {
                if (busy) return;
                setDocKind("NFE");
                pushLog("Documento selecionado: NF-e");
                setDocs([]);
                setChaveInput("");
                setMixedClientError(false);
                setClienteManual(null);
                setTotalPalletsOverride(null);
              }}
            >
              NF-e
            </Pill>
            <Pill
              type="button"
              disabled={busy}
              $active={docKind === "CTE"}
              onClick={() => {
                if (busy) return;
                setDocKind("CTE");
                pushLog("Documento selecionado: CT-e");
                setDocs([]);
                setChaveInput("");
                setMixedClientError(false);
                setClienteManual(null);
                setTotalPalletsOverride(null);
              }}
            >
              CT-e
            </Pill>
          </Row>
          <Hint>NF-e: cliente = remetente • CT-e: cliente = tomador</Hint>
        </Field>
      </CompactTop3>

      <Field style={{ gridColumn: "1 / -1" }}>
        <DropZoneTop>
          <Label>Importar XML/ZIP</Label>
          <DropCounter>
            {busyKey === "import" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Loader /> Lendo {readingCount || 0} arquivo(s)...
              </span>
            ) : isReading ? (
              `Lendo ${readingCount} arquivo(s)...`
            ) : (
              "Arraste aqui ou clique"
            )}
          </DropCounter>
        </DropZoneTop>

        <DocImportDropzone disabled={busy} onFiles={(files) => importFiles(files)} />
        <Hint>XML de cliente diferente é recusado e não entra.</Hint>
      </Field>
    </>
  );
}
