import Image from 'next/image'

export function IwLogo({
  className = '',
  height = 28,
}: {
  className?: string
  height?: number
}) {
  const width = Math.round(height * 4.2)

  return (
    <Image
      src="/IW-logo-q2.png"
      alt="IntraWeb."
      height={height}
      width={width}
      className={className}
      priority
      style={{ height, width: 'auto', maxWidth: 'min(100%, 240px)', objectFit: 'contain' }}
    />
  )
}
