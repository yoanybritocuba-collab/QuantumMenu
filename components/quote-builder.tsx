'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Mail,
  MessageCircle,
  Sparkles,
  X,
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

export function QuoteBuilder({ lang = 'es' }: { lang?: Lang }) {
  const [blocks, setBlocks] = useState<QuoteBlock[]>([])
  const [options, setOptions] = useState<QuoteOption[]>([])
  const [selected, setSelected] = useState<Record<string, number[]>>({})
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({})
  const [showFeatures, setShowFeatures] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('quote_blocks').select('*').eq('active', true).order('order_index'),
      supabase.from('quote_options').select('*').eq('active', true).order('order_index'),
    ]).then(([blocksRes, optionsRes]) => {
      const blocksData = (blocksRes.data || []) as unknown as QuoteBlock[]
      const optionsData = (optionsRes.data || []) as unknown as QuoteOption[]

      if (blocksData.length > 0) {
        setBlocks(blocksData)
        setOpenBlocks(Object.fromEntries(blocksData.map((b) => [b.key, true])))
        const initial: Record<string, number[]> = {}
        blocksData.forEach((b) => {
          initial[b.key] = []
          if (b.required && b.type === 'single-choice') {
            const firstOpt = optionsData.find((o) => o.block_key === b.key)
            if (firstOpt) initial[b.key] = [firstOpt.id]
          }
        })
        setSelected(initial)
      }
      if (optionsData.length > 0) setOptions(optionsData)
      setLoading(false)
    })
  }, [])

  const t = useMemo(() => ({
    title: lang === 'es' ? 'Configura tu presupuesto' : lang === 'ca' ? 'Configura el teu pressupost' : 'Build your quote',
    subtitle: lang === 'es' ? 'Marca lo que necesitas y calcula el precio al instante' : lang === 'ca' ? 'Marca el que necessites i calcula el preu a l\'instant' : 'Select what you need and get an instant price',
    total: lang === 'es' ? 'Total estimado' : lang === 'ca' ? 'Total estimat' : 'Estimated total',
    monthly: lang === 'es' ? 'Mantenimiento mensual' : lang === 'ca' ? 'Manteniment mensual' : 'Monthly maintenance',
    whatsapp: lang === 'es' ? 'Contratar por WhatsApp' : lang === 'ca' ? 'Contractar per WhatsApp' : 'Order via WhatsApp',
    email: lang === 'es' ? 'Solicitar por email' : lang === 'ca' ? 'Sol·licitar per email' : 'Request by email',
    whatsIncluded: lang === 'es' ? 'Qué incluye' : lang === 'ca' ? 'Què inclou' : 'What includes',
    notIncluded: lang === 'es' ? 'No incluye:' : lang === 'ca' ? 'No inclou:' : 'Not included:',
    notIncludedText: lang === 'es'
      ? 'Dominio y correos empresariales a cargo del cliente (aprox. 12€/año + 5€/mes por correo).'
      : lang === 'ca'
      ? 'Domini i correus empresarials a càrrec del client (aprox. 12€/any + 5€/mes per correu).'
      : 'Domain and business emails paid by the client (approx. 12€/year + 5€/month per email).',
    choose: lang === 'es' ? 'Elige...' : lang === 'ca' ? 'Tria...' : 'Choose...',
  }), [lang])

  const getName = (item: QuoteBlock | QuoteOption) => {
    if (lang === 'ca') return (item as any).title_ca || (item as any).label_ca || (item as any).title_es || (item as any).label_es
    if (lang === 'en') return (item as any).title_en || (item as any).label_en || (item as any).title_es || (item as any).label_es
    return (item as any).title_es || (item as any).label_es
  }

  const getDesc = (item: QuoteBlock | QuoteOption) => {
    if (lang === 'ca') return (item as any).description_ca || (item as any).description_es
    if (lang === 'en') return (item as any).description_en || (item as any).description_es
    return (item as any).description_es
  }

  const toggleOption = (blockKey: string, optionId: number) => {
    const block = blocks.find((b) => b.key === blockKey)
    if (!block) return
    setSelected((prev) => {
      const current = prev[blockKey] || []
      if (block.type === 'single-choice') {
        return { ...prev, [blockKey]: [optionId] }
      }
      return {
        ...prev,
        [blockKey]: current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId],
      }
    })
  }

  const totals = useMemo(() => {
    const allSelectedIds = Object.values(selected).flat()
    const selectedOptions = options.filter((o) => allSelectedIds.includes(o.id))
    const oneTime = selectedOptions.filter((o) => o.unit === '€').reduce((sum, o) => sum + o.price, 0)
    const monthly = selectedOptions.filter((o) => o.unit === '€/mes').reduce((sum, o) => sum + o.price, 0)
    return { oneTime, monthly }
  }, [selected, options])

  const whatsappMessage = useMemo(() => {
    const allSelectedIds = Object.values(selected).flat()
    const selectedOptions = options.filter((o) => allSelectedIds.includes(o.id))
    let msg = lang === 'es' ? 'Hola, me interesa este presupuesto:\n\n' : lang === 'ca' ? 'Hola, m\'interessa aquest pressupost:\n\n' : 'Hi, I\'m interested in this quote:\n\n'
    blocks.forEach((b) => {
      const opts = selectedOptions.filter((o) => o.block_key === b.key)
      if (opts.length > 0) {
        msg += `${getName(b)}:\n`
        opts.forEach((o) => {
          msg += `  • ${getName(o)} (${o.price}${o.unit})\n`
        })
      }
    })
    msg += `\n${t.total}: ${totals.oneTime}€`
    if (totals.monthly > 0) msg += `\n${t.monthly}: ${totals.monthly}€/mes`
    return encodeURIComponent(msg)
  }, [selected, options, blocks, totals, lang, t])

  if (loading) return <section className="quote-section section-wrap"><p>Cargando...</p></section>

  return (
    <section id="presupuesto" className="quote-section section-wrap">
      <div className="section-label"><span>07 / Presupuesto</span><span>Configurador</span></div>

      <div className="quote-header">
        <h2><Calculator size={32} /> {t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="quote-layout">
        <div className="quote-blocks">
          {blocks.map((block) => {
            const blockOptions = options.filter((o) => o.block_key === block.key)
            if (blockOptions.length === 0) return null
            const isOpen = openBlocks[block.key]
            return (
              <div key={block.key} className={`quote-block ${isOpen ? 'is-open' : ''}`}>
                <button className="quote-block-header" onClick={() => setOpenBlocks((prev) => ({ ...prev, [block.key]: !prev[block.key] }))}>
                  <div>
                    <h3>{getName(block)}</h3>
                    <p>{getDesc(block)}</p>
                  </div>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {isOpen && (
                  <div className="quote-block-options">
                    {blockOptions.map((opt) => {
                      const isSelected = (selected[block.key] || []).includes(opt.id)
                      const showFeat = showFeatures[opt.id]
                      return (
                        <div key={opt.id} className={`quote-option ${isSelected ? 'is-selected' : ''}`}>
                          {opt.image && (
                            <div
                              className="quote-option-image"
                              style={{ backgroundImage: `url(${opt.image})` }}
                              aria-hidden="true"
                            />
                          )}
                          <label className="quote-option-main">
                            <input
                              type={block.type === 'single-choice' ? 'radio' : 'checkbox'}
                              name={block.key}
                              checked={isSelected}
                              onChange={() => toggleOption(block.key, opt.id)}
                            />
                            <div className="quote-option-info">
                              <div className="quote-option-title">
                                <strong>{getName(opt)}</strong>
                                <span className="quote-option-price">
                                  {opt.price === 0 ? 'Gratis' : `+${opt.price}${opt.unit}`}
                                </span>
                              </div>
                              {getDesc(opt) && <p className="quote-option-desc">{getDesc(opt)}</p>}
                            </div>
                          </label>
                          {opt.features && opt.features.length > 0 && (
                            <>
                              <button
                                type="button"
                                className="quote-option-toggle-features"
                                onClick={() => setShowFeatures((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }))}
                              >
                                <Info size={13} /> {t.whatsIncluded}
                              </button>
                              {showFeat && (
                                <ul className="quote-option-features">
                                  {opt.features.map((f, i) => (
                                    <li key={i}><Check size={13} /> {f}</li>
                                  ))}
                                </ul>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <aside className="quote-summary">
          <div className="quote-summary-card">
            <p className="quote-kicker">
              <Sparkles size={14} /> Tu presupuesto
            </p>
            <h3>{t.total}</h3>
            <p className="quote-total">{totals.oneTime}€</p>
            {totals.monthly > 0 && (
              <p className="quote-monthly">+ {totals.monthly}€/mes · {t.monthly}</p>
            )}

            <div className="quote-not-included">
              <p><strong>{t.notIncluded}</strong></p>
              <p>{t.notIncludedText}</p>
            </div>

            <a
              href={`https://wa.me/34624497851?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-primary quote-cta"
            >
              <MessageCircle size={17} /> {t.whatsapp}
            </a>
            <a
              href={`mailto:yoanybritocuba@gmail.com?subject=Presupuesto%20QuantumMenu&body=${whatsappMessage}`}
              className="button quote-cta-secondary"
            >
              <Mail size={17} /> {t.email}
            </a>
          </div>
        </aside>
      </div>
    </section>
  )
}