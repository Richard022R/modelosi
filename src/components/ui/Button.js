import React from 'react';

export const Button = ({ onClick, children, disabled, enviando }) => (
  <>
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-blue-500 text-white p-2 rounded"
    >
      {children}
    </button>

  </>
);
