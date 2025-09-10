import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from "reactstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import { currencyBRL, formatDate } from "../utils";


export default function AddCostModal({ isOpen, toggle, onSave }) {
    const [items, setItems] = useState([
        { id: 1, descricao: "", valorTotal: "", parcelas: 1, primeiraParcela: formatDate(new Date()), intervaloDias: 30 }
    ]);


    const addItem = () => setItems(prev => [...prev, { id: Date.now(), descricao: "", valorTotal: "", parcelas: 1, primeiraParcela: formatDate(new Date()), intervaloDias: 30 }]);
    const rmItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
    const up = (id, patch) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));


    const handleSave = () => {
        for (const i of items) {
            if (!i.descricao) return alert("Informe o descritivo do custo");
            if (!i.valorTotal) return alert("Informe o valor total");
            if (Number(i.parcelas) < 1) return alert("Parcelas deve ser >= 1");
        }
        onSave(items);
        toggle();
    };


    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Adicionar custo</ModalHeader>
            <ModalBody>
                {items.map((i) => (
                    <div key={i.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <FormGroup style={{ flex: 2 }}>
                                <Label>Descritivo</Label>
                                <Input value={i.descricao} onChange={(e) => up(i.id, { descricao: e.target.value })} placeholder="Ex.: Licenças, consultoria, hospedagem..." />
                            </FormGroup>
                            <FormGroup style={{ flex: 1 }}>
                                <Label>Valor total</Label>
                                <Input type="number" min={0} value={i.valorTotal} onChange={(e) => up(i.id, { valorTotal: e.target.value })} />
                            </FormGroup>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <FormGroup style={{ flex: 1 }}>
                                <Label>Parcelas</Label>
                                <Input type="number" min={1} value={i.parcelas} onChange={(e) => up(i.id, { parcelas: Number(e.target.value) })} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1 }}>
                                <Label>Primeira parcela</Label>
                                <Input type="date" value={i.primeiraParcela} onChange={(e) => up(i.id, { primeiraParcela: e.target.value })} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1 }}>
                                <Label>Intervalo (dias) entre parcelas</Label>
                                <Input type="number" min={1} value={i.intervaloDias} onChange={(e) => up(i.id, { intervaloDias: Number(e.target.value) })} />
                            </FormGroup>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <small>{i.parcelas}x de {currencyBRL(i.valorTotal && (Number(i.valorTotal) / Number(i.parcelas || 1)))} (total {currencyBRL(i.valorTotal)})</small>
                            {items.length > 1 && (
                                <Button color="danger" size="sm" onClick={() => rmItem(i.id)}><FaTrash style={{ marginRight: 6 }} /> Remover</Button>
                            )}
                        </div>
                    </div>
                ))}


                <Button color="secondary" outline onClick={addItem}><FaPlus style={{ marginRight: 6 }} /> Adicionar outro custo</Button>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Cancelar</Button>
                <Button color="primary" onClick={handleSave}><FaPlus style={{ marginRight: 6 }} /> Salvar custos</Button>
            </ModalFooter>
        </Modal>
    );
}