'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Mail,
  MessageCircle,
  Sparkles,
  Globe,
  Layout,
  Languages,
  Bot,
  Palette,
  Wrench,
  Zap,
  Gift,
} from 'lucide-react'

type Lang = 'es' | 'ca' | 'en'

type QuoteBlock = {
  id: number
  key: string
  title_es: string
  title_ca: string
  title_en: string
  description_es: string
  description_ca: string
  description_en: string
  type: 'single-choice' | 'multi-choice'
  required: boolean
  order_index: number
}

type QuoteOption = {
  id: number
  block_key: string
  label_es: string
  label_ca: string
  label_en: string
  description_es: string
  description_ca: string
  description_en: string
  price: number
  unit: string
  features: string[]
  image?: string
  order_index: number
}

const blockIcons: Record<string, any> = {
  base: Globe,
  sections: Layout,
  languages: Languages,
  ai: Bot,
  extras: Gift,
  design: Palette,
  support: Wrench,
  urgency: Zap,
}

const blockAccents: Record<string, string> = {
  base: '#39ff9a',
  sections: '#e8bd72',
  languages: '#7ee0ff',
  ai: '#b494ff',
  extras: '#ffb070',
  design: '#ff8ad4',
  support: '#79b8ff',
  urgency: '#ff6b6b',
}

export function QuoteBuilder({ lang = 'es' }: { lang?: Lang }) {
  const [blocks, setBlocks] = useState<QuoteBlock[]>([])
  const [options, setOptions] = useState<QuoteOption[]>([])
  const [selected, setSelected] = useState<Record<string, number[]>>({})
  const [showFeatures, setShowFeatures] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const blockRefs = useRef<(HTMLElement | null)[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('quote_blocks').select('*').eq('active', true).order('order_index'),
      supabase.from('quote_options').select('*').eq('active', true).order('order_index'),
    ]).then(([blocksRes, optionsRes]) => {
      if (blocksRes.data) setBlocks(blocksRes.data as unknown as QuoteBlock[])
      if (optionsRes.data) setOptions(optionsRes.data as unknown as QuoteOption[])
      setLoading(false)
    })
  }, [])

  const total = useMemo(() => {
    let sum = 0
    Object.values(selected).forEach((ids) => {
      ids.forEach((id) => {
        const opt = options.find((o) => o.id === id)
        if (opt && opt.unit === '€') sum += opt.price
      })
    })
    return sum
  }, [selected, options])

  const monthly = useMemo(() => {
    let sum = 0
    Object.values(selected).forEach((ids) => {
      ids.forEach((id) => {
        const opt = options.find((o) => o.id === id)
        if (opt && opt.unit === '€/mes') sum += opt.price
      })
    })
    return sum
  }, [selected, options])

  const toggleOption = (blockKey: string, optionId: number, blockType: 'single-choice' | 'multi-choice') => {
    setSelected((prev) => {
      const current = prev[blockKey] || []
      if (blockType === 'single-choice') return { ...prev, [blockKey]: [optionId] }
      const exists = current.includes(optionId)
      return { ...prev, [blockKey]: exists ? current.filter((id) => id !== optionId) : [...current, optionId] }
    })
  }

  const goToBlock = (index: number) => {
    if (index < 0 || index >= blocks.length) return
    setCurrentIndex(index)
    const el = blockRefs.current[index]
    if (el && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
    }
  }

  const nextBlock = () => goToBlock(currentIndex + 1)
  const prevBlock = () => goToBlock(currentIndex - 1)

  const selectedSummary = useMemo(() => {
    const list: { label: string; price: number; unit: string }[] = []
    Object.values(selected).forEach((ids) => {
      ids.forEach((id) => {
        const opt = options.find((o) => o.id === id)
        if (opt) {
          const label = lang === 'es' ? opt.label_es : lang === 'ca' ? opt.label_ca : opt.label_en
          list.push({ label, price: opt.price, unit: opt.unit })
        }
      })
    })
    return list
  }, [selected, options, lang])

  const buildMessage = () => {
    let msg = lang === 'es' ? 'Hola, me interesa este presupuesto:\n\n' : lang === 'ca' ? 'Hola, m\'interessa aquest pressupost:\n\n' : 'Hi, I\'m interested in this quote:\n\n'
    selectedSummary.forEach((item) => { msg += `• ${item.label}: ${item.price}${item.unit}\n` })
    msg += `\nTotal: ${total}€`
    if (monthly > 0) msg += ` + ${monthly}€/mes`
    return msg
  }

  const whatsappLink = `https://wa.me/34624497851?text=${encodeURIComponent(buildMessage())}`
  const emailLink = `mailto:yoanybritocuba@gmail.com?subject=${encodeURIComponent(lang === 'es' ? 'Presupuesto' : lang === 'ca' ? 'Pressupost' : 'Quote')}&body=${encodeURIComponent(buildMessage())}`

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const containerTop = scrollContainerRef.current.scrollTop
    let closest = 0
    let minDist = Infinity
    blockRefs.current.forEach((el, i) => {
      if (!el) return
      const dist = Math.abs(el.offsetTop - containerTop - 40)
      if (dist < minDist) { minDist = dist; closest = i }
    })
    setCurrentIndex(closest)
  }

  if (loading) return (
    <section className="quote-section section-wrap">
      <p>{lang === 'es' ? 'Cargando...' : lang === 'ca' ? 'Carregant...' : 'Loading...'}</p>
    </section>
  )

  return (
    <section id="presupuesto" className="quote-section section-wrap">
      <div className="quote-header">
        <h2>
          <Calculator size={38} />
          {lang === 'es' ? 'Configura tu presupuesto' : lang === 'ca' ? 'Configura el teu pressupost' : 'Build your quote'}
        </h2>
        <p>
          {lang === 'es'
            ? 'Marca las opciones y avanza por cada área. Verás el total a la derecha en tiempo real.'
            : lang === 'ca'
              ? 'Marca les opcions i avança per cada àrea. Veuràs el total a la dreta en temps real.'
              : 'Select options and move through each section. See the total update live on the right.'}
        </p>
      </div>

      <div className="quote-layout">
        {/* IZQUIERDA: metro + contenido */}
        <div className="quote-left-desktop">
          {/* Metro vertical */}
          <nav className="quote-metro" aria-label="Áreas del presupuesto">
            <div className="quote-metro-line">
              <div
                className="quote-metro-line-fill"
                style={{ height: `${blocks.length > 1 ? (currentIndex / (blocks.length - 1)) * 100 : 0}%` }}
              />
            </div>
            {blocks.map((block, index) => {
              const Icon = blockIcons[block.key] || Sparkles
              const accent = blockAccents[block.key] || '#16b77f'
              const title = lang === 'es' ? block.title_es : lang === 'ca' ? block.title_ca : block.title_en
              const selectedCount = (selected[block.key] || []).length
              const isPassed = index < currentIndex
              const isActive = index === currentIndex
              const isCompleted = selectedCount > 0
              return (
                <button
                  key={block.key}
                  type="button"
                  className={`quote-metro-stop ${isActive ? 'is-active' : ''} ${isPassed ? 'is-passed' : ''} ${isCompleted ? 'is-completed' : ''}`}
                  style={{ '--stop-accent': accent } as React.CSSProperties}
                  onClick={() => goToBlock(index)}
                  aria-label={title}
                >
                  <span className="quote-metro-dot">
                    {isPassed || isCompleted ? <Check size={14} strokeWidth={3} /> : <Icon size={14} strokeWidth={2.2} />}
                  </span>
                  <span className="quote-metro-label">{title}</span>
                </button>
              )
            })}
          </nav>

          {/* Scroll con áreas */}
          <div className="quote-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            {blocks.map((block, index) => {
              const Icon = blockIcons[block.key] || Sparkles
              const accent = blockAccents[block.key] || '#16b77f'
              const blockOptions = options.filter((o) => o.block_key === block.key)
              const selectedCount = (selected[block.key] || []).length
              const title = lang === 'es' ? block.title_es : lang === 'ca' ? block.title_ca : block.title_en
              const desc = lang === 'es' ? block.description_es : lang === 'ca' ? block.description_ca : block.description_en
              const isCompleted = selectedCount > 0

              return (
                <article
                  key={block.key}
                  ref={(el) => { blockRefs.current[index] = el }}
                  className={`quote-area ${isCompleted ? 'is-completed' : ''}`}
                  style={{ '--block-accent': accent } as React.CSSProperties}
                >
                  <div className="quote-area-inner">
                    <header className="quote-area-header">
                      <span className="quote-area-icon">
                        <Icon size={26} strokeWidth={2} />
                      </span>
                      <div>
                        <p className="quote-area-kicker">
                          {lang === 'es' ? 'Área' : lang === 'ca' ? 'Àrea' : 'Section'} {String(index + 1).padStart(2, '0')} / {String(blocks.length).padStart(2, '0')}
                        </p>
                        <h3>{title}</h3>
                        {desc && <p className="quote-area-desc">{desc}</p>}
                      </div>
                      {selectedCount > 0 && <span className="quote-area-badge">{selectedCount}</span>}
                    </header>

                    <div className="quote-area-options">
                      {blockOptions.length === 0 && (
                        <p className="quote-empty">
                          {lang === 'es' ? 'Sin opciones disponibles' : lang === 'ca' ? 'Sense opcions disponibles' : 'No options available'}
                        </p>
                      )}
                      {blockOptions.map((opt) => {
                        const isSelected = (selected[block.key] || []).includes(opt.id)
                        const label = lang === 'es' ? opt.label_es : lang === 'ca' ? opt.label_ca : opt.label_en
                        const description = lang === 'es' ? opt.description_es : lang === 'ca' ? opt.description_ca : opt.description_en
                        const features = opt.features || []
                        const featuresOpen = showFeatures[opt.id]

                        return (
                          <div key={opt.id} className={`quote-option ${isSelected ? 'is-selected' : ''}`}>
                            <label className="quote-option-main">
                              <input
                                type={block.type === 'single-choice' ? 'radio' : 'checkbox'}
                                name={block.key}
                                checked={isSelected}
                                onChange={() => toggleOption(block.key, opt.id, block.type)}
                              />
                              <div className="quote-option-info">
                                <div className="quote-option-title">
                                  <strong>{label}</strong>
                                  <span className="quote-option-price">
                                    {opt.price === 0
                                      ? (lang === 'es' ? 'Gratis' : lang === 'ca' ? 'Gratuït' : 'Free')
                                      : `+${opt.price}${opt.unit}`}
                                  </span>
                                </div>
                                {description && <p className="quote-option-desc">{description}</p>}
                                {features.length > 0 && (
                                  <button
                                    className="quote-option-toggle-features"
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setShowFeatures((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }))
                                    }}
                                  >
                                    <Info size={11} />
                                    {featuresOpen
                                      ? (lang === 'es' ? 'Ocultar' : lang === 'ca' ? 'Amagar' : 'Hide')
                                      : (lang === 'es' ? 'Ver detalles' : lang === 'ca' ? 'Veure detalls' : 'View details')}
                                  </button>
                                )}
                                {featuresOpen && (
                                  <ul className="quote-option-features">
                                    {features.map((f) => (<li key={f}><Check size={12} /> {f}</li>))}
                                  </ul>
                                )}
                              </div>
                            </label>
                          </div>
                        )
                      })}
                    </div>

                    <footer className="quote-area-nav">
                      <button
                        className="quote-nav-btn quote-nav-prev"
                        type="button"
                        onClick={prevBlock}
                        disabled={index === 0}
                      >
                        <ChevronLeft size={16} />
                        {lang === 'es' ? 'Anterior' : lang === 'ca' ? 'Anterior' : 'Previous'}
                      </button>
                      {index < blocks.length - 1 ? (
                        <button
                          className="button button-primary quote-nav-next"
                          type="button"
                          onClick={nextBlock}
                        >
                          {lang === 'es' ? 'Siguiente' : lang === 'ca' ? 'Següent' : 'Next'}
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button-primary quote-nav-next"
                        >
                          {lang === 'es' ? 'Finalizar' : lang === 'ca' ? 'Finalitzar' : 'Finish'}
                          <Check size={16} />
                        </a>
                      )}
                    </footer>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* DERECHA: panel presupuesto */}
        <aside className="quote-summary">
          <div className="quote-summary-card">
            <p className="quote-kicker">
              <Sparkles size={13} />
              {lang === 'es' ? 'Tu presupuesto' : lang === 'ca' ? 'El teu pressupost' : 'Your quote'}
            </p>
            <h3>{lang === 'es' ? 'Total estimado' : lang === 'ca' ? 'Total estimat' : 'Estimated total'}</h3>
            <p className="quote-total" key={total}>{total}€</p>
            {monthly > 0 && <p className="quote-monthly">+ {monthly}€/mes</p>}

            {selectedSummary.length > 0 ? (
              <ul className="quote-summary-list">
                {selectedSummary.map((item, i) => (
                  <li key={`${item.label}-${i}`}>
                    <span>{item.label}</span>
                    <span>{item.price === 0 ? '—' : `+${item.price}${item.unit}`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="quote-empty-summary">
                {lang === 'es' ? 'Aún no has seleccionado nada' : lang === 'ca' ? 'Encara no has seleccionat res' : 'Nothing selected yet'}
              </p>
            )}

            <div className="quote-not-included">
              <strong>{lang === 'es' ? 'No incluye' : lang === 'ca' ? 'No inclou' : 'Not included'}</strong>
              <p>
                {lang === 'es' ? 'Dominio propio y correos empresariales (a cargo del cliente).'
                  : lang === 'ca' ? 'Domini propi i correus empresarials (a càrrec del client).'
                  : 'Custom domain and business emails (client\'s responsibility).'}
              </p>
            </div>

            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="button button-primary quote-cta">
              <MessageCircle size={16} />
              {lang === 'es' ? 'Contratar por WhatsApp' : lang === 'ca' ? 'Contractar per WhatsApp' : 'Contact via WhatsApp'}
            </a>
            <a href={emailLink} className="quote-cta-secondary">
              <Mail size={14} />
              {lang === 'es' ? 'Solicitar por email' : lang === 'ca' ? 'Sol·licitar per correu' : 'Request by email'}
            </a>
          </div>
        </aside>
      </div>
    </section>
  )
}