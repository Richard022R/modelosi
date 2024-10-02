import React from 'react';

export const Card = ({ children, className }) => (
  <div className={`p-4 shadow-md rounded ${className}`}>{children}</div>
);

export const CardHeader = ({ children }) => (
  <h2 className="text-lg font-bold mb-2">{children}</h2>
);

export const CardContent = ({ children }) => (
  <div>{children}</div>
);
