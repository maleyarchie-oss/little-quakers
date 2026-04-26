import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 60, md: 100, lg: 160 }

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const px = sizes[size]
  return (
    <Image
      src="/logo.png"
      alt="Philadelphia Little Quakers"
      width={px}
      height={px}
      className={className}
      priority
    />
  )
}
