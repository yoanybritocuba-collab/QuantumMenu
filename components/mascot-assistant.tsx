'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles, X, RotateCcw } from 'lucide-react'

type MascotLang = 'es' | 'ca' | 'en'

export function MascotAssistant({ lang = 'es' }: { lang?: MascotLang }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [greeting, setGreeting] = useState('')

  const [bubbleText, setBubbleText] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const [phase, setPhase] = useState<
    'greeting' | 'help' | 'linger' | 'silenced' | 'farewell'
  >('greeting')

  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const [hasChatted, setHasChatted] = useState(false)
  const [introTyped, setIntroTyped] = useState('')
  const [introDone, setIntroDone] = useState(false)

  const [isStandby, setIsStandby] = useState(false)
  const [nearCursor, setNearCursor] = useState(false)

  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -1, y: -1 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const timeoutsRef = useRef<number[]>([])
  const cancelledRef = useRef(false)

  const texts = {
    es: {
      greetMorning: 'Buenos días',
      greetAfternoon: 'Buenas tardes',
      greetEvening: 'Buenas noches',
      help: '¿En qué te puedo ayudar?',
      linger: 'Me quedo por aquí si necesitas algo',
      chatIntro: 'Hola, soy Nova. ¿En qué te puedo ayudar?',
      farewell: 'Gracias por visitar QuantumMenu. Aquí estoy si necesitas algo más.',
      newChat: 'Nuevo chat',
      thinking: 'Nova está pensando',
      placeholder: 'Pregúntale algo a Nova...',
      inputLabel: 'Mensaje para Nova',
      sendLabel: 'Enviar mensaje',
      openLabel: 'Abrir asistente de Nova',
      closeLabel: 'Cerrar asistente de Nova',
      role: 'Asistente de QuantumMenu',
      avatarAlt: 'Nova, asistente robot de QuantumMenu',
    },
    ca: {
      greetMorning: 'Bon dia',
      greetAfternoon: 'Bona tarda',
      greetEvening: 'Bona nit',
      help: 'En què et puc ajudar?',
      linger: 'Em quedo per aquí si necessites res',
      chatIntro: 'Hola, sóc la Nova. En què et puc ajudar?',
      farewell: 'Gràcies per visitar QuantumMenu. Aquí estic si necessites res més.',
      newChat: 'Nou xat',
      thinking: 'Nova està pensant',
      placeholder: 'Pregunta-li alguna cosa a la Nova...',
      inputLabel: 'Missatge per a la Nova',
      sendLabel: 'Enviar missatge',
      openLabel: 'Obrir assistent de la Nova',
      closeLabel: 'Tancar assistent de la Nova',
      role: 'Assistenta de QuantumMenu',
      avatarAlt: 'Nova, assistenta robot de QuantumMenu',
    },
    en: {
      greetMorning: 'Good morning',
      greetAfternoon: 'Good afternoon',
      greetEvening: 'Good evening',
      help: 'How can I help you?',
      linger: 'I\'ll stay around if you need anything',
      chatIntro: 'Hi, I\'m Nova. How can I help you?',
      farewell: 'Thanks for visiting QuantumMenu. I\'m here if you need anything else.',
      newChat: 'New chat',
      thinking: 'Nova is thinking',
      placeholder: 'Ask Nova something...',
      inputLabel: 'Message for Nova',
      sendLabel: 'Send message',
      openLabel: 'Open Nova assistant',
      closeLabel: 'Close Nova assistant',
      role: 'QuantumMenu assistant',
      avatarAlt: 'Nova, QuantumMenu\'s robot assistant',
    },
  }

  const t = texts[lang]

  const addTimeout = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  const typeText = (text: string, onDone: () => void, speed = 25) => {
    let i = 0
    setBubbleText('')
    setShowCursor(true)
    const tick = () => {
      if (cancelledRef.current) return
      if (i >= text.length) {
        setShowCursor(false)
        onDone()
        return
      }
      setBubbleText(text.slice(0, i + 1))
      const ch = text[i]
      i++
      let d = speed + Math.random() * 15
      if (ch === ',' || ch === ';') d += 80
      else if (ch === '.' || ch === '?' || ch === '!') d += 150
      else if (ch === ' ') d += 10
      addTimeout(tick, d)
    }
    addTimeout(tick, 300)
  }

  const typeIntroInChat = (text: string, onDone: () => void, speed = 25) => {
    let i = 0
    setIntroTyped('')
    const tick = () => {
      if (cancelledRef.current) return
      if (i >= text.length) {
        onDone()
        return
      }
      setIntroTyped(text.slice(0, i + 1))
      const ch = text[i]
      i++
      let d = speed + Math.random() * 15
      if (ch === ',' || ch === ';') d += 80
      else if (ch === '.' || ch === '?' || ch === '!') d += 150
      else if (ch === ' ') d += 10
      addTimeout(tick, d)
    }
    addTimeout(tick, 200)
  }

  // ==== Secuencia de la burbuja ====
  useEffect(() => {
    cancelledRef.current = false
    clearAllTimeouts()

    const hour = new Date().getHours()
    const greetingText =
      hour < 12 ? t.greetMorning : hour < 20 ? t.greetAfternoon : t.greetEvening
    setGreeting(greetingText)

    setPhase('greeting')
    setBubbleText('')
    setShowCursor(false)

    addTimeout(() => {
      typeText(greetingText, () => {
        addTimeout(() => {
          setBubbleText('')
          typeText(t.help, () => {
            addTimeout(() => {
              setBubbleText('')
              typeText(t.linger, () => {
                setPhase('linger')
              }, 30)
            }, 2000)
          }, 25)
        }, 1500)
      }, 25)
    }, 1000)

    return () => {
      cancelledRef.current = true
      clearAllTimeouts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // ==== Standby ====
  useEffect(() => {
    if (open) {
      setNearCursor(true)
      return
    }
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      )
      setNearCursor(distance < 180)
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [open])

  useEffect(() => {
    if (open || nearCursor || isDragging) {
      setIsStandby(false)
      return
    }
    if (phase !== 'linger' && phase !== 'farewell' && phase !== 'silenced') {
      setIsStandby(false)
      return
    }
    const timer = window.setTimeout(() => setIsStandby(true), 8000)
    return () => window.clearTimeout(timer)
  }, [open, nearCursor, isDragging, phase])

  // ==== Chat ====
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  useEffect(() => {
    if (messages.length > 0 && !hasChatted) setHasChatted(true)
  }, [messages.length, hasChatted])

  useEffect(() => {
    if (!open) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, status, open, introTyped])

  // Cerrar al hacer clic fuera o Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const panel = panelRef.current
      const trigger = containerRef.current
      const target = e.target as Node
      if (panel && panel.contains(target)) return
      if (trigger && trigger.contains(target)) return
      handleCloseChat()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseChat()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasChatted])

  const handleOpenChat = () => {
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false
    setOpen(true)
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true)
      setIntroDone(false)
      setIntroTyped('')
      addTimeout(() => {
        typeIntroInChat(t.chatIntro, () => setIntroDone(true), 25)
      }, 400)
    } else {
      setIntroTyped(t.chatIntro)
      setIntroDone(true)
    }
  }

  const handleCloseChat = () => {
    setOpen(false)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false
    if (hasChatted) {
      addTimeout(() => {
        setBubbleText('')
        typeText(t.farewell, () => setPhase('farewell'), 25)
      }, 500)
    } else {
      setBubbleText(t.linger)
      setPhase('linger')
    }
  }

  const newChat = () => {
    setMessages([])
    setInput('')
    setHasChatted(false)
    setIntroDone(false)
    setIntroTyped('')
    setHasOpenedOnce(false)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false
    addTimeout(() => {
      setIntroTyped('')
      typeIntroInChat(t.chatIntro, () => setIntroDone(true), 25)
    }, 400)
  }

  // ==== Drag ====
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    dragRef.current = { startX: clientX, startY: clientY, origX: rect.left, origY: rect.top }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current || !containerRef.current) return
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      const dx = clientX - dragRef.current.startX
      const dy = clientY - dragRef.current.startY
      const w = containerRef.current.offsetWidth
      const h = containerRef.current.offsetHeight
      const newX = Math.max(10, Math.min(window.innerWidth - w - 10, dragRef.current.origX + dx))
      const newY = Math.max(10, Math.min(window.innerHeight - h - 10, dragRef.current.origY + dy))
      setPos({ x: newX, y: newY })
    }
    const end = () => {
      setIsDragging(false)
      dragRef.current = null
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', end)
    document.addEventListener('touchmove', move, { passive: false })
    document.addEventListener('touchend', end)
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', end)
      document.removeEventListener('touchmove', move)
      document.removeEventListener('touchend', end)
    }
  }, [isDragging])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!input.trim() || status !== 'ready') return

    const isFirst = messages.filter((m) => m.role === 'user').length === 0
    const hour = new Date().getHours()

    sendMessage(
      { text: input.trim() },
      {
        body: {
          language: lang,
          isFirstMessage: isFirst,
          currentHour: hour,
        },
      }
    )
    setInput('')
    if (!hasChatted) setHasChatted(true)
  }

  const silenceBubble = () => {
    setPhase('silenced')
    setBubbleText('')
    setShowCursor(false)
    cancelledRef.current = true
    clearAllTimeouts()
  }

  const containerStyle: React.CSSProperties =
    pos.x !== -1
      ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', bottom: 'auto' }
      : {}

  return (
    <>
      {open && (
        <section ref={panelRef} className="mascot-panel mascot-panel-fixed" aria-label={t.role}>
          <div className="mascot-panel-header">
            <div className="mascot-heading">
              <div>
                <strong>Nova</strong>
                <span>{t.role}</span>
              </div>
            </div>
            <div className="mascot-header-actions">
              <button className="mascot-clear" type="button" onClick={newChat} aria-label={t.newChat} title={t.newChat}>
                <RotateCcw size={12} />
                {t.newChat}
              </button>
              <button className="mascot-close" type="button" onClick={handleCloseChat} aria-label={t.closeLabel}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mascot-messages" aria-live="polite">
            {introTyped && (
              <div className="mascot-message from-nova">
                <span>{introTyped}</span>
                {!introDone && <span className="typing-caret" aria-hidden="true">▍</span>}
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === 'user'
              const fullText = message.parts
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('')
              return (
                <div className={`mascot-message ${isUser ? 'from-user' : 'from-nova'}`} key={message.id}>
                  <span>{fullText}</span>
                </div>
              )
            })}

            {status === 'submitted' && (
              <div className="mascot-message from-nova is-thinking">
                {t.thinking}<span>...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="mascot-form" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.placeholder}
              aria-label={t.inputLabel}
              disabled={status !== 'ready'}
            />
            <button type="submit" aria-label={t.sendLabel} disabled={!input.trim() || status !== 'ready'}>
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      <div
        ref={containerRef}
        className={`mascot-assistant ${open ? 'is-open' : ''} ${isDragging ? 'is-dragging' : ''} ${pos.x !== -1 ? 'is-positioned' : ''} ${isStandby ? 'is-standby' : ''}`}
        style={containerStyle}
      >
        {!open && bubbleText && phase !== 'silenced' && (
          <div
            className="mascot-speech"
            aria-live="polite"
            role="button"
            tabIndex={0}
            onClick={handleOpenChat}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenChat() }}
            title={lang === 'es' ? 'Toca para abrir el chat' : lang === 'ca' ? 'Toca per obrir el xat' : 'Tap to open chat'}
            style={{ cursor: 'pointer' }}
          >
            {bubbleText}
            {showCursor && <span className="bubble-cursor" aria-hidden="true">▍</span>}
          </div>
        )}

        <button
          className="mascot-trigger"
          type="button"
          onClick={() => (open ? handleCloseChat() : handleOpenChat())}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          aria-expanded={open}
          aria-label={open ? t.closeLabel : t.openLabel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <span className="mascot-avatar" role="img" aria-label={t.avatarAlt}>
            <span className="live-robot" aria-hidden="true">
              <span className="robot-antenna" />
              <span className="robot-ear left" />
              <span className="robot-ear right" />
              <span className="robot-head">
                <span className="robot-eye left" />
                <span className="robot-eye right" />
                <span className="robot-mouth" />
              </span>
              <span className="robot-body">
                <span className="robot-core" />
                <span className="robot-arm left" />
                <span className="robot-arm right" />
              </span>
              <span className="robot-shadow" />
            </span>
          </span>
        </button>
      </div>
    </>
  )
}