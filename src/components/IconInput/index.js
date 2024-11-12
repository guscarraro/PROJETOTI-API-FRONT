// IconInput.js
import React from 'react';
import { Input, FormGroup, Label } from 'reactstrap';
import './style.css';

const IconInput = ({ label, icon: Icon, type = "text", placeholder, value, onChange }) => {
  return (
    <FormGroup className="icon-input-group">
      <Label className="input-label">{label}</Label>
      <div className="icon-input-wrapper">
        <Icon className="input-icon" />
        <Input
          style={{border:'none', color:'#fff'}}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="custom-input"
        />
      </div>
    </FormGroup>
  );
};

export default IconInput;
