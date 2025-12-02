// src/pages/Separacao/ModalImpressao/index.js
import React, { useEffect, useMemo, useState } from "react";
import { FiBox, FiSave, FiTag } from "react-icons/fi";
import { toast } from "react-toastify";
import { SmallMuted, Field, TinyBtn } from "../../style";
import { printPedidoLabels } from "../../print";
import {
  CaixasCard,
  CardWrapper,
  BlurContent,
  DisabledOverlay,
  SavingOverlay,
  HeaderRow,
  HeaderLeft,
  ResumoRow,
  CaixasBoxRow,
  CaixaSelect,
  BoxActions,
  FooterRow,
  FooterRight,
} from "./style";

export default function ModalImpressao({
  pedido, // pedido usado na etiqueta
  conferente, // nome do conferente
  caixasInicial,
  onSave,
  saving,
  isRestrictedUser: isRestrictedUserProp, // opcional, se o pai já mandar
  conferenciaConcluida,
  canPrintLabels,
  onPrint, // callback opcional pro pai
}) {
  // pega usuário do localStorage pra garantir regra do id 23
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const isUserId23 = Number(user?.id) === 23;
  // se o pai mandar isRestrictedUser true, respeita também
  const isRestrictedUser = Boolean(isRestrictedUserProp) || isUserId23;

  const [caixas, setCaixas] = useState(() => {
    if (Array.isArray(caixasInicial) && caixasInicial.length > 0) {
      const out = [];
      for (let i = 0; i < caixasInicial.length; i++) {
        const c = caixasInicial[i] || {};
        out.push({
          tipo: String(c.tipo || "CAIXA01"),
          peso: String(c.peso || ""),
        });
      }
      return out;
    }
    return [{ tipo: "CAIXA01", peso: "" }];
  });

  // Flag para saber se as caixas já foram salvas
  const [hasSavedCaixas, setHasSavedCaixas] = useState(
    Array.isArray(caixasInicial) && caixasInicial.length > 0
  );

  // sincroniza quando o pai mudar o estado inicial
  useEffect(() => {
    if (Array.isArray(caixasInicial) && caixasInicial.length > 0) {
      const out = [];
      for (let i = 0; i < caixasInicial.length; i++) {
        const c = caixasInicial[i] || {};
        out.push({
          tipo: String(c.tipo || "CAIXA01"),
          peso: String(c.peso || ""),
        });
      }
      setCaixas(out);
      setHasSavedCaixas(true); // já veio salvo do back
    } else {
      setCaixas([{ tipo: "CAIXA01", peso: "" }]);
      setHasSavedCaixas(false);
    }
  }, [caixasInicial]);

  function addCaixa() {
    if (isRestrictedUser) return; // id 23 só visualiza
    setCaixas((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      list.push({ tipo: "CAIXA01", peso: "" });
      return list;
    });
    setHasSavedCaixas(false);
  }

  function removeCaixa(idx) {
    if (isRestrictedUser) return;
    setCaixas((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      if (list.length <= 1) return list;
      const next = [];
      for (let i = 0; i < list.length; i++) {
        if (i !== idx) next.push(list[i]);
      }
      if (next.length === 0) {
        next.push({ tipo: "CAIXA01", peso: "" });
      }
      return next;
    });
    setHasSavedCaixas(false);
  }

  function updateCaixa(idx, key, value) {
    if (isRestrictedUser) return;
    setCaixas((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      if (!list[idx]) return list;
      list[idx] = { ...list[idx], [key]: value };
      return list;
    });
    setHasSavedCaixas(false);
  }

  const totalCaixas = useMemo(() => {
    if (!Array.isArray(caixas)) return 0;
    return caixas.length;
  }, [caixas]);

  const pesoTotal = useMemo(() => {
    let sum = 0;
    if (Array.isArray(caixas)) {
      for (let i = 0; i < caixas.length; i++) {
        const c = caixas[i] || {};
        const n = Number(String(c.peso || "").replace(",", "."));
        if (!isNaN(n)) sum += n;
      }
    }
    return sum;
  }, [caixas]);

  function parseCaixasForPayload() {
    const out = [];
    if (Array.isArray(caixas)) {
      for (let i = 0; i < caixas.length; i++) {
        const c = caixas[i] || {};
        const tipo = String(c.tipo || "CAIXA01").toUpperCase();
        const n = Number(String(c.peso || "").replace(",", "."));
        out.push({
          tipo,
          peso: isNaN(n) ? 0 : n,
        });
      }
    }
    return out;
  }

  function handleSave() {
    if (isRestrictedUser) return;
    if (typeof onSave !== "function") return;
    const out = parseCaixasForPayload();
    onSave(out, pesoTotal);
    setHasSavedCaixas(true);
  }

  function handlePrintClick() {
    if (isRestrictedUser) return;

    if (!conferenciaConcluida) {
      toast.error("Finalize a conferência antes de imprimir as etiquetas.");
      return;
    }

    if (!hasSavedCaixas) {
      toast.error("Salve as caixas antes de imprimir as etiquetas.");
      return;
    }

    if (!canPrintLabels) {
      toast.error("Informe a Nota Fiscal e o Separador para imprimir as etiquetas.");
      return;
    }

    if (!pedido) {
      toast.error("Pedido não encontrado para impressão.");
      return;
    }

    const parsedCaixas = parseCaixasForPayload();
    if (!Array.isArray(parsedCaixas) || parsedCaixas.length === 0) {
      toast.error("Nenhuma caixa válida para impressão.");
      return;
    }

    printPedidoLabels(pedido, {
      caixas: parsedCaixas,
      conferente: conferente || pedido?.conferente || "-",
    });

    if (typeof onPrint === "function") {
      onPrint({ caixas: parsedCaixas, pesoTotal });
    }
  }

  const disabled = !conferenciaConcluida;

  const canPrint =
    !saving && canPrintLabels && hasSavedCaixas && conferenciaConcluida;

  const printTitle = (() => {
    if (!conferenciaConcluida) {
      return "Finalize a conferência antes de imprimir as etiquetas.";
    }
    if (!hasSavedCaixas) {
      return "Salve as caixas antes de imprimir as etiquetas.";
    }
    if (!canPrintLabels) {
      return "Informe NF e Separador para imprimir etiquetas.";
    }
    return "Imprimir etiquetas usando as caixas salvas.";
  })();

  return (
    <CaixasCard>
      <CardWrapper>
        <BlurContent $disabled={disabled}>
          <HeaderRow>
            <HeaderLeft>
              <FiBox size={18} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  Resumo de caixas
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Informe aqui as caixas e pesos antes de imprimir as etiquetas.
                </div>
              </div>
            </HeaderLeft>

            <ResumoRow>
              <div>
                <SmallMuted>Total de caixas</SmallMuted>
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  {totalCaixas}
                </div>
              </div>
              <div>
                <SmallMuted>Peso total</SmallMuted>
                <div style={{ fontWeight: 800 }}>
                  {pesoTotal.toFixed(2)} kg
                </div>
              </div>
            </ResumoRow>
          </HeaderRow>

          <div style={{ display: "grid", gap: 8 }}>
            {caixas.map((cx, idx) => (
              <CaixasBoxRow key={idx}>
                <div>
                  <SmallMuted>Tipo da caixa</SmallMuted>
                  <CaixaSelect
                    value={cx.tipo}
                    onChange={(e) =>
                      updateCaixa(idx, "tipo", e.target.value)
                    }
                    disabled={isRestrictedUser}
                  >
                    <option value="CAIXA01">CAIXA 01</option>
                    <option value="CAIXA02">CAIXA 02</option>
                    <option value="CAIXA-MADEIRA">CAIXA MADEIRA</option>
                    <option value="CAIXA04">CAIXA 04</option>
                  </CaixaSelect>
                </div>

                <div>
                  <SmallMuted>Peso (kg)</SmallMuted>
                  <Field
                    value={cx.peso}
                    onChange={(e) =>
                      updateCaixa(idx, "peso", e.target.value)
                    }
                    placeholder="Ex.: 8.5"
                    readOnly={isRestrictedUser}
                    disabled={isRestrictedUser}
                  />
                </div>

                {!isRestrictedUser && (
                  <BoxActions>
                    <TinyBtn
                      onClick={() => removeCaixa(idx)}
                      disabled={caixas.length === 1}
                    >
                      Remover
                    </TinyBtn>
                  </BoxActions>
                )}
              </CaixasBoxRow>
            ))}
          </div>

          <FooterRow>
            {!isRestrictedUser && (
              <TinyBtn onClick={addCaixa}>+ Adicionar caixa</TinyBtn>
            )}

            {!isRestrictedUser && (
              <FooterRight>
                <TinyBtn onClick={handleSave} disabled={saving}>
                  <FiSave /> {saving ? "Salvando..." : "Salvar caixas"}
                </TinyBtn>
                <TinyBtn
                  onClick={handlePrintClick}
                  disabled={saving || !canPrint}
                  title={printTitle}
                >
                  <FiTag /> Imprimir
                </TinyBtn>
              </FooterRight>
            )}
          </FooterRow>
        </BlurContent>

        {saving && (
          <SavingOverlay>
            <div className="loader-box">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              />
              <span>Salvando caixas...</span>
            </div>
          </SavingOverlay>
        )}

        {disabled && (
          <DisabledOverlay>
Aguardando realizar conferência...

          </DisabledOverlay>
        )}
      </CardWrapper>
    </CaixasCard>
  );
}
