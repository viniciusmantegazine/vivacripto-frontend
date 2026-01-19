/**
 * CategoryBadge - Badge colorido por categoria
 * Cada categoria tem uma cor específica para identificação visual rápida
 */

interface CategoryBadgeProps {
  category: {
    name: string
    slug: string
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Paleta de cores por categoria
const categoryColors: Record<string, string> = {
  bitcoin: 'bg-orange-500 text-white hover:bg-orange-600',
  ethereum: 'bg-purple-500 text-white hover:bg-purple-600',
  altcoins: 'bg-blue-500 text-white hover:bg-blue-600',
  defi: 'bg-green-500 text-white hover:bg-green-600',
  regulacao: 'bg-red-500 text-white hover:bg-red-600',
  airdrop: 'bg-yellow-500 text-gray-900 hover:bg-yellow-600',
}

// Tamanhos do badge
const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export default function CategoryBadge({
  category,
  size = 'sm',
  className = ''
}: CategoryBadgeProps) {
  const colorClass = categoryColors[category.slug] || 'bg-gray-500 text-white hover:bg-gray-600'
  const sizeClass = sizeClasses[size]

  return (
    <span
      className={`
        inline-block font-semibold rounded-full
        transition-colors duration-200
        ${colorClass}
        ${sizeClass}
        ${className}
      `}
    >
      {category.name}
    </span>
  )
}
