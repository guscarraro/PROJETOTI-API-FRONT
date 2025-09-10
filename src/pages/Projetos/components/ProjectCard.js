import React from "react";
import { Card, Badge, Muted, FlexRow } from "../style";
import { FaCalendarAlt } from "react-icons/fa";
import { STATUS } from "../utils";


export default function ProjectCard({ project, onOpen }) {
    const variant = project.status === STATUS.ANDAMENTO ? 'andamento' : project.status === STATUS.STANDBY ? 'standby' : 'cancelado';
    return (
        <Card onClick={onOpen}>
            <FlexRow>
                <h3 style={{ margin: 0 }}>{project.nome}</h3>
                <Badge $variant={variant}>{project.status}</Badge>
            </FlexRow>
            <div style={{ marginTop: 8 }}>
                <Muted><FaCalendarAlt style={{ marginRight: 6 }} />Início: {project.inicio}</Muted><br />
                <Muted><FaCalendarAlt style={{ marginRight: 6 }} />Previsão: {project.fim}</Muted>
            </div>
        </Card>
    );
}