// Configuração temporária para desenvolvimento
export const mercadopagoConfig = {
  // Token de teste temporário - substitua pelo seu token de teste real
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-6353883481312314-052904-0b6205b4724f88a3490ffd9193a9b707-60616899',
  publicKey: process.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'TEST-4616f62d-2f2c-48c8-909e-d66601a6c96a'
};

// Verificar se é ambiente de desenvolvimento
export const isDevelopment = process.env.NODE_ENV === 'development';

// Configuração de URLs
export const urls = {
  api: process.env.API_URL || 'http://localhost:3000',
  frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  base: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}; 