import React from 'react';

export const Input = ({ value, onChange, placeholder, readOnly, className }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    readOnly={readOnly}
    className={`p-2 border rounded ${className}`}
  />
);
