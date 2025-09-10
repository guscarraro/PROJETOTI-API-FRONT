import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { FaPlus } from "react-icons/fa";
import { STATUS, formatDate } from "../utils";


export default function CreateProjectModal({ isOpen, toggle, onSave }) {
    const [nome, setNome] = useState("");
    const [inicio, setInicio] = useState(formatDate(new Date()));
    const [fim, setFim] = useState(formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)));
    const [status, setStatus] = useState(STATUS.ANDAMENTO);


    const handleSubmit = () => {
        if (!nome) return alert("Informe o nome do projeto");
        if (new Date(fim) < new Date(inicio)) return alert("A data de término deve ser após a data de início");
        onSave({ nome, inicio, fim, status });
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
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Cancelar</Button>
                <Button color="primary" onClick={handleSubmit}><FaPlus style={{ marginRight: 6 }} />Criar</Button>
            </ModalFooter>
        </Modal>
    );
}