import React from 'react';
import { MdOutlineScreenshotMonitor } from 'react-icons/md';
import { Col, Button } from 'reactstrap';

const DashboardActions = ({ exportarDetalhado, exportarParaExcel, navigate, handleFullScreen }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const setorBloqueado = 'b1122334-56ab-78cd-90ef-123456789abc';

  return (
    <Col md="12" style={{ marginTop: '5px' }}>
      <Button color="success" onClick={exportarParaExcel}>Exportar Excel</Button>

      {/* Só exibe se o setor não for o bloqueado */}
      {user?.setor !== setorBloqueado && (
        <Button onClick={() => navigate("/Frete")} style={{ marginLeft: 10 }}>
          Ir para Ocorrências
        </Button>
      )}

      <div style={{ float: 'right' }}>
        <button onClick={handleFullScreen} style={{ background: '#f1f1f1', border: 'none', borderRadius: '5px' }}>
          <MdOutlineScreenshotMonitor size={20} /> Tela Cheia
        </button>
      </div>
    </Col>
  );
};

export default DashboardActions;
