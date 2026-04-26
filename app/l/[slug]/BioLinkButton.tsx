'use client'

interface BioLinkButtonProps {
  linkId: string
  userId: string
  href: string
  title: string
  style: React.CSSProperties
}

export default function BioLinkButton({ linkId, userId, href, title, style }: BioLinkButtonProps) {
  const handleClick = () => {
    // Fire-and-forget — never block navigation
    fetch('/api/bio/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link_id: linkId, user_id: userId }),
    }).catch(() => {/* ignore */})
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={style}
    >
      {title}
    </a>
  )
}
