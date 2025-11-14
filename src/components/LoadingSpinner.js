import React from 'react';

export default function LoadingSpinner({ size = 40 }) {
  const style = { width: size, height: size };
  return <div className="spinner" style={style} aria-hidden="true" />;
}
