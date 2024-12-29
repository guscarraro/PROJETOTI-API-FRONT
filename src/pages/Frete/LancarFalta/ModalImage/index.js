import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "reactstrap";
import { FaImage, FaFileAlt } from "react-icons/fa";
import Cropper from "react-easy-crop";
import getCroppedImg from "./CropImage"; // Função utilitária para obter a imagem cortada

const ModalImage = ({ isOpen, toggle, onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null); // Arquivo selecionado
  const [preview, setPreview] = useState(null); // Prévia da imagem
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = validateFileType(file);
      if (isValid) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file)); // Gera a prévia da imagem
      } else {
        alert("Somente arquivos PNG, JPEG ou JSON são permitidos.");
      }
    }
  };

  const validateFileType = (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    return validTypes.includes(file.type);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (selectedFile && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(preview, croppedAreaPixels);
      onImageUpload(croppedImage); // Envia a imagem cortada
      toggle(); // Fecha o modal
    } else {
      alert("Selecione uma área válida para a imagem.");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        <FaImage /> Upload de Imagem com Ajuste
      </ModalHeader>
      <ModalBody>
        <Input
          type="file"
          accept=".png, .jpg, .jpeg"
          onChange={handleFileChange}
        />
        {preview && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "300px",
              marginTop: "10px",
            }}
          >
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={180 / 300} // Mantém a proporção 180x300
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={false}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <div style={{ width: "100%" }}>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <Button color="primary" onClick={handleUpload}>
          <FaFileAlt /> Enviar
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalImage;
