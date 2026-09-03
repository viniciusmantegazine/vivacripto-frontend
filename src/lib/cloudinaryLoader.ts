import type { ImageLoaderProps } from 'next/image'

/**
 * Loader global do next/image que delega o redimensionamento à Cloudinary.
 *
 * Motivo: o otimizador da Vercel (/_next/image) passou a responder 402
 * (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) ao estourar a cota de
 * transformações do plano, deixando as capas das notícias novas em branco.
 * Como a Cloudinary já é o CDN das imagens, ela mesma entrega a variante
 * redimensionada e no melhor formato (f_auto → AVIF/WebP conforme o browser),
 * zerando o consumo de otimização na Vercel.
 *
 * Qualquer src fora da Cloudinary (logos em /public, ícones da CoinGecko)
 * é devolvido intacto: é servido no tamanho original, sem passar pela Vercel.
 */
const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/'
const CLOUDINARY_HOST = 'res.cloudinary.com'

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.includes(CLOUDINARY_HOST)) return src

  const idx = src.indexOf(CLOUDINARY_UPLOAD_SEGMENT)
  if (idx === -1) return src

  const prefix = src.slice(0, idx + CLOUDINARY_UPLOAD_SEGMENT.length)
  const rest = src.slice(idx + CLOUDINARY_UPLOAD_SEGMENT.length)

  // Se a URL já carrega uma transformação (segmento com "," antes do "/vNNN" ou do
  // public_id), não empilha outra: respeita o que foi gravado no backend.
  const firstSegment = rest.split('/')[0]
  if (firstSegment.includes(',')) return src

  const q = quality ? `q_${quality}` : 'q_auto'
  // c_limit: redimensiona só pra baixo; larguras acima da origem (1200px) devolvem o original.
  return `${prefix}f_auto,c_limit,${q},w_${width}/${rest}`
}
