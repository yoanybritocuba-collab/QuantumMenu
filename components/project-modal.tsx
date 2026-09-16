'use client'

import { useEffect } from 'react'
import { X, Check, Clock, Euro, MessageCircle, Mail } from 'lucide-react'

type Lang = 'es' | 'ca' | 'en'

type ProjectModalData = {
  id?: number
  number: string
  title: string
  type: string
  description?: string
  image: string
  accent: string
  symbol: string
  tags: string[]
  includes: string[]
  excludes: string[]
  price?: number
  deliveryTime?: string
}

export function ProjectModal({
  project,
  lang = 'es',
  onClose,
}: {
  project: ProjectModalData | null
  lang?: Lang
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (project) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [project, onClose])

  if (!project) return null

  const t = {
    es: {
      includes: 'Qué incluye',
      excludes: 'No incluye',
      price: 'Desde',
      delivery: 'Entrega',
      whatsapp: 'Contratar por WhatsApp',
      email: 'Solicitar por email',
      close: 'Cerrar',
      defaultExcludes: ['Dominio propio (a cargo del cliente)', 'Correos empresariales (a cargo del cliente)'],
      waMessage: 'Hola, me interesa el proyecto',
    },
    ca: {
      includes: 'Què inclou',
      excludes: 'No inclou',
      price: 'Des de',
      delivery: 'Lliurament',
      whatsapp: 'Contractar per WhatsApp',
      email: 'Sol·licitar per correu',
      close: 'Tancar',
      defaultExcludes: ['Domini propi (a càrrec del client)', 'Correus empresarials (a càrrec del client)'],
      waMessage: 'Hola, m\'interessa el projecte',
    },
    en: {
      includes: 'What\'s included',
      excludes: 'Not included',
      price: 'From',
      delivery: 'Delivery',
      whatsapp: 'Order via WhatsApp',
      email: 'Request by email',
      close: 'Close',
      defaultExcludes: ['Custom domain (client\'s responsibility)', 'Business emails (client\'s responsibility)'],
      waMessage: 'Hi, I\'m interested in the project',
    },
  }

  const labels = t[lang]
  const includes = project.includes && project.includes.length > 0 ? project.includes : project.tags
  const excludes = project.excludes && project.excludes.length > 0 ? project.excludes : labels.defaultExcludes

  const waUrl = `https://wa.me/34624497851?text=${encodeURIComponent(`${labels.waMessage}: ${project.title}`)}`
  const mailUrl = `mailto:yoanybritocuba@gmail.com?subject=${encodeURIComponent(project.title)}`

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <button className="project-modal-close" onClick={onClose} aria-label={labels.close}>
          <X size={18} />
        </button>

        <div className="project-modal-image" style={{ backgroundImage: `url(${project.image})` }}>
          <span className="project-modal-number">{project.number}</span>
        </div>

        <div className="project-modal-body">
          <header className="project-modal-header">
            <h2>{project.title}</h2>
            <p>{project.type}</p>
          </header>

          {project.description && (
            <p className="project-modal-description">{project.description}</p>
          )}

          {(project.price || project.deliveryTime) && (
            <div className="project-modal-meta">
              {project.price ? (
                <span className="project-modal-meta-item">
                  <Euro size={15} />
                  {labels.price} {project.price}€
                </span>
              ) : null}
              {project.deliveryTime ? (
                <span className="project-modal-meta-item">
                  <Clock size={15} />
                  {labels.delivery}: {project.deliveryTime}
                </span>
              ) : null}
            </div>
          )}

          {includes.length > 0 && (
            <div className="project-modal-section">
              <h3>{labels.includes}</h3>
              <ul>
                {includes.map((item) => (
                  <li key={item}><Check size={14} /> {item}</li>
                ))}
              </ul>
            </div>
          )}

          {excludes.length > 0 && (
            <div className="project-modal-section project-modal-not-included">
              <h3>{labels.excludes}</h3>
              <ul>
                {excludes.map((item) => (
                  <li key={item}><X size={14} /> {item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="project-modal-actions">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="button button-primary project-modal-cta">
              <MessageCircle size={16} />
              {labels.whatsapp}
            </a>
            <a href={mailUrl} className="project-modal-cta-secondary">
              <Mail size={14} />
              {labels.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}