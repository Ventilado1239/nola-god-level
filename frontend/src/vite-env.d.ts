// frontend/src/vite-env.d.ts
// (ARQUIVO NOVO)

/// <reference types="vite/client" />

// Opcional, mas boa prática: ensina o TS sobre outros assets
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}