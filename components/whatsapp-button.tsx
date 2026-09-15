'use client'

import { useEffect, useState } from 'react'

export function WhatsAppButton({
  phone,
  message = 'Hola, me gustaría información sobre una web para mi negocio.',
  position = 'left',
}: {
  phone: string
  message?: string
  position?: 'left' | 'right'
}) {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 800)
    return () => window.clearTimeout(timer)
  }, [])

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-button whatsapp-${position} ${visible ? 'is-visible' : ''}`}
      aria-label="Contactar por WhatsApp"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="whatsapp-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="26" height="26" fill="#ffffff">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.26-.79 2.605-1.53.143-.31.258-.645.258-.99 0-.258-.144-.402-.402-.53-.486-.244-1.36-.703-1.85-.96-.147-.087-.314-.13-.474-.13zM16.005 4C9.376 4 4 9.376 4 16.006c0 2.115.558 4.098 1.52 5.827L4 28l6.343-1.489a11.94 11.94 0 0 0 5.662 1.436c6.63 0 12.005-5.376 12.005-12.006S22.635 4 16.005 4zm0 21.788c-1.73 0-3.428-.516-4.84-1.475l-.36-.227-3.6.845.96-3.502-.236-.376a9.744 9.744 0 0 1-1.475-5.174c0-5.405 4.4-9.805 9.805-9.805s9.805 4.4 9.805 9.805-4.4 9.81-9.805 9.81z" />
        </svg>
      </span>
      <span className={`whatsapp-tooltip ${showTooltip ? 'is-showing' : ''}`}>¿Hablamos por WhatsApp?</span>
    </a>
  )
}