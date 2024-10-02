import React from 'react';

export const Select = ({ value, onChange, children, className }) => (
  <select value={value} onChange={onChange} className={`p-2 border rounded ${className}`}>
    {children}
  </select>
);
