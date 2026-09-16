'use client'

import { useEffect } from 'react'
import { X, MessageCircle, Mail, Check, Clock, Euro } from 'lucide-react'

type Lang = 'es' | 'ca' | 'en'

type Project = {
  id?: number
  number: string
  title_es: string
  title_ca: string
  title_en: string
  type_es: string
  type_ca: string
  type_en: string
  description_es?: string
  description_ca?: string
  description_en?: string
  image: string
  accent: string
  tags?: string[]
  tags_es?: string[]
  tags_ca?: string[]
  tags_en?: string[]
  price?: number
  delivery_time_es?: string
  delivery_time_ca?: string
  delivery_time_en?: string
  published?: boolean
}

type Props = {
  project: Project | null
  lang: Lang
  onClose: () => void
}

const WHATSAPP_NUMBER = '34624497851'
const EMAIL = 'yoanybritocuba@gmail.com'

export function ProjectModal({ project, lang, onClose }: Props) {
  useEffect(() => {
    if (!project) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [project, onClose])

  if (!project) return null

  const getTitle = () =>
    lang === 'ca' ? project.title_ca || project.title_es : lang === 'en' ? project.title_en || project.title_es : project.title_es
  const getType = () =>
    lang === 'ca' ? project.type_ca || project.type_es : lang === 'en' ? project.type_en || project.type_es : project.type_es
  const getDescription = () =>
    lang === 'ca' ? project.description_ca || project.description_es : lang === 'en' ? project.description_en || project.description_es : project.description_es
  const getDelivery = () =>
    lang === 'ca' ? project.delivery_time_ca || project.delivery_time_es : lang === 'en' ? project.delivery_time_en || project.delivery_time_es : project.delivery_time_es

  // Tags según idioma
  const getTags = (): string[] => {
    if (lang === 'ca') return project.tags_ca?.length ? project.tags_ca : (project.tags || [])
    if (lang === 'en') return project.tags_en?.length ? project.tags_en : (project.tags || [])
    return project.tags_es?.length ? project.tags_es : (project.tags || [])
  }

  const tags = getTags()

  const t = {
    from: lang === 'es' ? 'Desde' : lang === 'ca' ? 'Des de' : 'From',
    delivery: lang === 'es' ? 'Plazo de entrega' : lang === 'ca' ? 'Termini de lliurament' : 'Delivery time',
    whatIncludes: lang === 'es' ? 'Qué incluye' : lang === 'ca' ? 'Què inclou' : 'What includes',
    whatNotIncludes: lang === 'es' ? 'No incluye' : lang === 'ca' ? 'No inclou' : 'Does not include',
    notIncluded1: lang === 'es' ? 'Dominio propio (a cargo del cliente)' : lang === 'ca' ? 'Domini propi (a càrrec del client)' : 'Own domain (paid by client)',
    notIncluded2: lang === 'es' ? 'Correos empresariales (a cargo del cliente)' : lang === 'ca' ? 'Correus empresarials (a càrrec del client)' : 'Business emails (paid by client)',
    hireWhatsapp: lang === 'es' ? 'Contratar por WhatsApp' : lang === 'ca' ? 'Contractar per WhatsApp' : 'Hire via WhatsApp',
    askEmail: lang === 'es' ? 'Solicitar por email' : lang === 'ca' ? 'Sol·licitar per email' : 'Request by email',
    close: lang === 'es' ? 'Cerrar' : lang === 'ca' ? 'Tancar' : 'Close',
  }

  const whatsappMsg = encodeURIComponent(
    lang === 'es'
      ? `Hola, me interesa el servicio "${getTitle()}". ¿Podemos hablar?`
      : lang === 'ca'
      ? `Hola, m'interessa el servei "${getTitle()}". Podem parlar?`
      : `Hi, I'm interested in "${getTitle()}". Can we talk?`
  )

  const emailSubject = encodeURIComponent(`Presupuesto: ${getTitle()}`)
  const emailBody = encodeURIComponent(
    lang === 'es'
      ? `Hola, me interesa el servicio "${getTitle()}". ¿Me puedes dar más información?`
      : lang === 'ca'
      ? `Hola, m'interessa el servei "${getTitle()}". Em pots donar més informació?`
      : `Hi, I'm interested in "${getTitle()}". Can you give me more info?`
  )

  return (
    <div className="project-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="project-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={getTitle()}
      >
        <button className="project-modal-close" onClick={onClose} aria-label={t.close}>
          <X size={20} />
        </button>

        <div
          className="project-modal-image"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%), url(${project.image})`,
          }}
        >
          <span className="project-modal-number">{project.number}</span>
        </div>

        <div className="project-modal-body">
          <div className="project-modal-header">
            <h2>{getTitle()}</h2>
            <p>{getType()}</p>
          </div>

          {tags.length > 0 && (
            <div className="project-modal-tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          {getDescription() && <p className="project-modal-description">{getDescription()}</p>}

          <div className="project-modal-meta">
            {project.price && project.price > 0 && (
              <div className="project-modal-meta-item">
                <Euro size={16} />
                <span>
                  <strong>{t.from} {project.price}€</strong>
                </span>
              </div>
            )}
            {getDelivery() && (
              <div className="project-modal-meta-item">
                <Clock size={16} />
                <span>
                  <strong>{getDelivery()}</strong>
                </span>
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="project-modal-section">
              <h3>{t.whatIncludes}</h3>
              <ul>
                {tags.map((tag) => (
                  <li key={tag}>
                    <Check size={14} /> {tag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="project-modal-section project-modal-not-included">
            <h3>{t.whatNotIncludes}</h3>
            <ul>
              <li>✕ {t.notIncluded1}</li>
              <li>✕ {t.notIncluded2}</li>
            </ul>
          </div>

          <div className="project-modal-actions">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-primary project-modal-cta"
            >
              <MessageCircle size={17} /> {t.hireWhatsapp}
            </a>
            <a
              href={`mailto:${EMAIL}?subject=${emailSubject}&body=${emailBody}`}
              className="button project-modal-cta-secondary"
            >
              <Mail size={17} /> {t.askEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}