// src/pages/Projetos/components/AddCostModal.js
import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import { currencyBRL, formatDate } from "../utils";
import apiLocal from "../../../services/apiLocal";
import { MODAL_CLASS,GlobalModalStyles } from "../style";

export default function AddCostModal({
  isOpen,
  toggle,
  projectId, // ← ID do projeto (uuid)
  actorSectorId, // ← setor do usuário que está cadastrando (int)
  onAdded, // ← callback opcional (recebe custos/parcela criados do back)
}) {
  const [items, setItems] = useState([
    {
      id: 1,
      descricao: "",
      valorTotal: "",
      parcelas: 1,
      primeiraParcela: formatDate(new Date()),
      intervaloDias: 30,
    },
  ]);
  const [saving, setSaving] = useState(false);

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        descricao: "",
        valorTotal: "",
        parcelas: 1,
        primeiraParcela: formatDate(new Date()),
        intervaloDias: 30,
      },
    ]);
  const rmItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const up = (id, patch) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleSave = async () => {
    for (const i of items) {
      if (!i.descricao?.trim()) return alert("Informe o descritivo do custo");
      if (i.valorTotal === "" || Number.isNaN(Number(i.valorTotal)))
        return alert("Informe o valor total");
      if (Number(i.parcelas) < 1) return alert("Parcelas deve ser >= 1");
      if (!i.primeiraParcela)
        return alert("Informe a data da primeira parcela");
      if (Number(i.intervaloDias) < 1) return alert("Intervalo deve ser >= 1");
    }

    setSaving(true);
    try {
      const created = [];
      for (const i of items) {
        const body = {
          description: i.descricao.trim(),
          total_value: Number(i.valorTotal),
          parcels: Number(i.parcelas),
          first_due: i.primeiraParcela, // "YYYY-MM-DD"
          interval_days: Number(i.intervaloDias),
        };
        // endpoint cria 1 custo por chamada:
        const res = await apiLocal.addProjetoCustos(projectId, body);
        created.push(res.data?.data ?? res.data);
      }
      onAdded?.(created);
      toggle();
    } catch (err) {
      alert(
        `Erro ao salvar custos: ${err?.response?.data?.detail || err.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
  <GlobalModalStyles />
    <Modal isOpen={isOpen} toggle={saving ? undefined : toggle} size="lg" contentClassName={MODAL_CLASS}>
      <ModalHeader toggle={saving ? undefined : toggle}>
        Adicionar custo
      </ModalHeader>
      <ModalBody>
        {items.map((i) => (
          <div
            key={i.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <FormGroup style={{ flex: 2 }}>
                <Label>Descritivo</Label>
                <Input
                  disabled={saving}
                  value={i.descricao}
                  onChange={(e) => up(i.id, { descricao: e.target.value })}
                  placeholder="Ex.: Licenças, consultoria, hospedagem..."
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <Label>Valor total</Label>
                <Input
                  disabled={saving}
                  type="number"
                  min={0}
                  value={i.valorTotal}
                  onChange={(e) => up(i.id, { valorTotal: e.target.value })}
                />
              </FormGroup>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <FormGroup style={{ flex: 1 }}>
                <Label>Parcelas</Label>
                <Input
                  disabled={saving}
                  type="number"
                  min={1}
                  value={i.parcelas}
                  onChange={(e) =>
                    up(i.id, { parcelas: Number(e.target.value) })
                  }
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <Label>Primeira parcela</Label>
                <Input
                  disabled={saving}
                  type="date"
                  value={i.primeiraParcela}
                  onChange={(e) =>
                    up(i.id, { primeiraParcela: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <Label>Intervalo (dias) entre parcelas</Label>
                <Input
                  disabled={saving}
                  type="number"
                  min={1}
                  value={i.intervaloDias}
                  onChange={(e) =>
                    up(i.id, { intervaloDias: Number(e.target.value) })
                  }
                />
              </FormGroup>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <small>
                {i.parcelas}x de{" "}
                {currencyBRL(
                  i.valorTotal && Number(i.valorTotal) / Number(i.parcelas || 1)
                )}{" "}
                (total {currencyBRL(i.valorTotal)})
              </small>
              {items.length > 1 && (
                <Button
                  color="danger"
                  size="sm"
                  disabled={saving}
                  onClick={() => rmItem(i.id)}
                >
                  <FaTrash style={{ marginRight: 6 }} /> Remover
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button color="secondary" outline disabled={saving} onClick={addItem}>
          <FaPlus style={{ marginRight: 6 }} /> Adicionar outro custo
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={saving}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSave} disabled={saving}>
          <FaPlus style={{ marginRight: 6 }} />{" "}
          {saving ? "Salvando..." : "Salvar custos"}
        </Button>
      </ModalFooter>
    </Modal>
      </>
  );
}
