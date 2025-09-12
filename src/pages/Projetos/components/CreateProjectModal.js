import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { FaPlus } from "react-icons/fa";
import { STATUS, formatDate } from "../utils";


export default function CreateProjectModal({ isOpen, toggle, onSave }) {
    const [nome, setNome] = useState("");
    const [inicio, setInicio] = useState(formatDate(new Date()));
    const [fim, setFim] = useState(formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)));
    const [status, setStatus] = useState(STATUS.ANDAMENTO);

    const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";
    const TI_UUID = "d2c5a1b8-4f23-4f93-b1e5-3d9f9b8a9a3f";
    const FRETE_UUID = "Frete";
    const SAC_UUID = "43350e26-12f4-4094-8cfb-2a66f250838d";
    const OPER_UUID = "442ec24d-4c7d-4b7e-b1dd-8261c9376d0f";
    const DIRET_UUID = "9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4";
    const [setores, setSetores] = useState([]);
    const SECTORS = [
        { id: SAC_UUID, label: "SAC" },
        { id: OPER_UUID, label: "Operação" },
        { id: FRETE_UUID, label: "Frete" },
        { id: DIRET_UUID, label: "Diretoria" },
        { id: TI_UUID, label: "TI" },
        { id: ADMIN_UUID, label: "Admin" },
    ];

    const handleSubmit = () => {
        if (!nome) return alert("Informe o nome do projeto");
        if (new Date(fim) < new Date(inicio)) return alert("A data de término deve ser após a data de início");
        onSave({ nome, inicio, fim, status, setores  });
    };


    return (
        <Modal isOpen={isOpen} toggle={toggle} size="md">
            <ModalHeader toggle={toggle}>Novo Projeto</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label>Nome do projeto</Label>
                        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Implantação ERP" />
                    </FormGroup>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <FormGroup style={{ flex: 1 }}>
                            <Label>Início</Label>
                            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                        </FormGroup>
                        <FormGroup style={{ flex: 1 }}>
                            <Label>Previsão de término</Label>
                            <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
                        </FormGroup>
                    </div>
                    <FormGroup>
                        <Label>Status</Label>
                        <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option>{STATUS.ANDAMENTO}</option>
                            <option>{STATUS.STANDBY}</option>
                            <option>{STATUS.CANCELADO}</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
  <Label>Setores envolvidos</Label>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: 8,
    }}
  >
    {SECTORS.map((s) => (
      <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={setores.includes(s.id)}
          onChange={(e) => {
            setSetores((prev) =>
              e.target.checked ? [...prev, s.id] : prev.filter((x) => x !== s.id)
            );
          }}
        />
        <span>{s.label}</span>
      </label>
    ))}
  </div>
</FormGroup>

                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Cancelar</Button>
                <Button color="primary" onClick={handleSubmit}><FaPlus style={{ marginRight: 6 }} />Criar</Button>
            </ModalFooter>
        </Modal>
    );
}