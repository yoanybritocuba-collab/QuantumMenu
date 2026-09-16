'use client'

import { useEffect } from 'react'
import { X, Check, Clock, Euro, MessageCircle, ArrowRight, Sparkles } from 'lucide-react'

type Lang = 'es' | 'ca' | 'en'

export type ServiceData = {
  index: string
  icon: string
  title: { es: string; ca: string; en: string }
  short: { es: string; ca: string; en: string }
  long: { es: string; ca: string; en: string }
  includes: { es: string[]; ca: string[]; en: string[] }
  price: string
  delivery: { es: string; ca: string; en: string }
  image: string
  accent: string
}

const copy = {
  es: {
    whats: '¿Qué es?',
    includes: 'Qué incluye',
    priceLabel: 'Precio orientativo',
    deliveryLabel: 'Tiempo de entrega',
    ctaProjects: 'Ver proyectos',
    ctaWhats: 'Consultar por WhatsApp',
    close: 'Cerrar',
    waMessage: 'Hola, me gustaría saber más sobre el servicio de',
    starting: 'Desde',
  },
  ca: {
    whats: 'Què és?',
    includes: 'Què inclou',
    priceLabel: 'Preu orientatiu',
    deliveryLabel: 'Temps de lliurament',
    ctaProjects: 'Veure projectes',
    ctaWhats: 'Consultar per WhatsApp',
    close: 'Tancar',
    waMessage: 'Hola, m\'agradaria saber més sobre el servei de',
    starting: 'Des de',
  },
  en: {
    whats: 'What is it?',
    includes: 'What\'s included',
    priceLabel: 'Estimated price',
    deliveryLabel: 'Delivery time',
    ctaProjects: 'View projects',
    ctaWhats: 'Ask on WhatsApp',
    close: 'Close',
    waMessage: 'Hi, I\'d like to know more about the service of',
    starting: 'From',
  },
}

export function ServiceModal({
  service,
  lang = 'es',
  onClose,
  onGoToWork,
}: {
  service: ServiceData | null
  lang?: Lang
  onClose: () => void
  onGoToWork: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (service) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [service, onClose])

  if (!service) return null

  const labels = copy[lang]
  const title = service.title[lang]
  const shortDesc = service.short[lang]
  const longDesc = service.long[lang]
  const includes = service.includes[lang]
  const delivery = service.delivery[lang]
  const waUrl = `https://wa.me/34624497851?text=${encodeURIComponent(`${labels.waMessage}: ${title}`)}`

  return (
    <div className="service-modal-backdrop" onClick={onClose}>
      <div className="service-modal" onClick={(e) => e.stopPropagation()}>
        <button className="service-modal-close" onClick={onClose} aria-label={labels.close}>
          <X size={18} />
        </button>

        <div
          className="service-modal-image"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.85)), url(${service.image})`,
          }}
        >
          <span className="service-modal-image-badge">
            <Sparkles size={12} />
            {labels.starting} {service.price}
          </span>
        </div>

        <div className="service-modal-body">
          <header className="service-modal-header">
            <h2 style={{ color: service.accent }}>{title}</h2>
            <p>{shortDesc}</p>
          </header>

          <div className="service-modal-section">
            <h3>{labels.whats}</h3>
            <p className="service-modal-long">{longDesc}</p>
          </div>

          {includes.length > 0 && (
            <div className="service-modal-section">
              <h3>{labels.includes}</h3>
              <ul className="service-modal-list">
                {includes.map((item) => (
                  <li key={item}><Check size={14} /> {item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="service-modal-meta">
            <div className="service-modal-meta-item">
              <Euro size={15} />
              <div>
                <small>{labels.priceLabel}</small>
                <strong>{service.price}</strong>
              </div>
            </div>
            <div className="service-modal-meta-item">
              <Clock size={15} />
              <div>
                <small>{labels.deliveryLabel}</small>
                <strong>{delivery}</strong>
              </div>
            </div>
          </div>

          <div className="service-modal-actions">
            <button
              type="button"
              className="button button-primary service-modal-cta"
              onClick={() => { onClose(); onGoToWork() }}
            >
              {labels.ctaProjects}
              <ArrowRight size={15} />
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="service-modal-cta-secondary"
            >
              <MessageCircle size={15} />
              {labels.ctaWhats}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}