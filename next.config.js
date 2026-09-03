/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Redimensionamento delegado à Cloudinary via loader customizado.
    // O otimizador da Vercel (/_next/image) deixa de ser usado: ele respondia 402
    // ao estourar a cota do plano e as capas das notícias novas ficavam em branco.
    // Ver src/lib/cloudinaryLoader.ts.
    loader: 'custom',
    loaderFile: './src/lib/cloudinaryLoader.ts',
    // Mantido como referência dos hosts remotos usados. Só volta a ter efeito
    // se o loader customizado for removido.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
