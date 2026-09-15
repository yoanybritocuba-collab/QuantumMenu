'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles, X } from 'lucide-react'

type MascotLang = 'en' | 'ca' | 'es'

export function MascotAssistant({ lang = 'es' }: { lang?: MascotLang }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [farewell, setFarewell] = useState('')
  const [isTypingFarewell, setIsTypingFarewell] = useState(false)
  const [hasVisited, setHasVisited] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [typedGreeting, setTypedGreeting] = useState('')

  // 🔽 Referencia al final del chat para auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    const greetings = {
      es: hour < 12 ? 'Buenos días. ¿Qué web quieres crear? Si necesitas saber más, puedes preguntarme.' : hour < 20 ? 'Buenas tardes. ¿Qué necesitas para tu negocio? Si necesitas saber más, puedes preguntarme.' : 'Buenas noches. ¿En qué puedo ayudarte? Si necesitas saber más, puedes preguntarme.',
      ca: hour < 12 ? 'Bon dia. Quina web vols crear? Si necessites saber més, pregunta\'m.' : hour < 20 ? 'Bona tarda. Què necessites per al teu negoci? Si necessites saber més, pregunta\'m.' : 'Bona nit. Com et puc ajudar? Si necessites saber més, pregunta\'m.',
      en: hour < 12 ? 'Good morning. What would you like to build? If you need to know more, ask me.' : hour < 20 ? 'Good afternoon. What does your business need? If you need to know more, ask me.' : 'Good evening. How can I help? If you need to know more, ask me.',
    }
    const nextGreeting = greetings[lang]
    setGreeting(nextGreeting)
    setTypedGreeting('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedGreeting(nextGreeting.slice(0, index))
      if (index >= nextGreeting.length) window.clearInterval(timer)
    }, 34)
    return () => window.clearInterval(timer)
  }, [lang])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { language: lang } }),
  })

  useEffect(() => {
    setMessages([])
    setHasVisited(false)
    setTypedGreeting('')
    setFarewell('')
    setIsTypingFarewell(false)
  }, [lang, setMessages])

  // 🔽 AUTO-SCROLL: baja al final cuando llega un mensaje nuevo o Nova está pensando
  useEffect(() => {
    if (!open) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status, open])

  useEffect(() => {
    if (!isTypingFarewell) return
    let index = 0
    const message = lang === 'es' ? 'Si deseas algo más, puedes preguntarme.' : lang === 'ca' ? 'Si necessites res més, pregunta\'m.' : 'If you need anything else, ask me.'
    const timer = window.setInterval(() => {
      index += 1
      setFarewell(message.slice(0, index))
      if (index >= message.length) {
        window.clearInterval(timer)
        setIsTypingFarewell(false)
      }
    }, 42)
    return () => window.clearInterval(timer)
  }, [isTypingFarewell, lang])

  const closeChat = () => {
    setMessages([])
    setInput('')
    setOpen(false)
    setHasVisited(true)
    setFarewell('')
    setIsTypingFarewell(true)
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!input.trim() || status !== 'ready') return
    sendMessage({ text: input.trim() })
    setInput('')
  }

  return (
    <div className={`mascot-assistant ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="mascot-panel" aria-label={lang === 'es' ? 'Asistente de Nova' : lang === 'ca' ? 'Assistent de Nova' : 'Nova AI assistant'}>
          <div className="mascot-panel-header">
            <div className="mascot-heading">
              <div><strong>Nova</strong><span>{lang === 'es' ? 'Asistente de QuantumMenu' : lang === 'ca' ? 'Assistent de QuantumMenu' : 'QuantumMenu assistant'}</span></div>
            </div>
            <div className="mascot-header-actions"><button className="mascot-clear" type="button" onClick={closeChat} aria-label={lang === 'es' ? 'Limpiar chat' : lang === 'ca' ? 'Netejar xat' : 'Clear chat'}>{lang === 'es' ? 'Limpiar' : lang === 'ca' ? 'Netejar' : 'Clear'}</button><button className="mascot-close" type="button" onClick={closeChat} aria-label={lang === 'es' ? 'Cerrar asistente' : lang === 'ca' ? 'Tancar assistent' : 'Close assistant'}><X size={16} /></button></div>
          </div>
          <div className="mascot-messages" aria-live="polite">
            {messages.length === 0 && !hasVisited && <div className="mascot-welcome"><Sparkles size={18} /><p>{greeting}<br /><span>{lang === 'es' ? 'Cuéntame tu idea, aunque escribas rápido o con errores: te entenderé.' : lang === 'ca' ? 'Explica\'m la teva idea, encara que escriguis ràpid o amb errors: t\'entendré.' : 'Tell me your idea, even with typos: I will understand.'}</span></p></div>}
            {messages.map((message) => <div className={`mascot-message ${message.role === 'user' ? 'from-user' : 'from-nova'}`} key={message.id}>{message.parts.map((part, index) => part.type === 'text' ? <span key={`${message.id}-${index}`}>{part.text}</span> : null)}</div>)}
            {status === 'submitted' && <div className="mascot-message from-nova is-thinking">{lang === 'es' ? 'Nova está pensando' : lang === 'ca' ? 'Nova està pensant' : 'Nova is thinking'}<span>...</span></div>}
            {/* 🔽 Ancla invisible al final para el auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
          <form className="mascot-form" onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={lang === 'es' ? 'Pregúntale algo a Nova...' : lang === 'ca' ? 'Pregunta-li alguna cosa a Nova...' : 'Ask Nova anything...'} aria-label={lang === 'es' ? 'Mensaje para Nova' : lang === 'ca' ? 'Missatge per a Nova' : 'Message Nova'} disabled={status !== 'ready'} />
            <button type="submit" aria-label={lang === 'es' ? 'Enviar mensaje' : lang === 'ca' ? 'Enviar missatge' : 'Send message'} disabled={!input.trim() || status !== 'ready'}><Send size={16} /></button>
          </form>
        </section>
      )}
      {!open && <div className="mascot-speech" aria-live="polite">{farewell || (!hasVisited && typedGreeting)}{!farewell && !hasVisited && typedGreeting.length < greeting.length && <span className="typing-caret" aria-hidden="true">▋</span>}</div>}
      <button className="mascot-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? (lang === 'es' ? 'Cerrar asistente de Nova' : lang === 'ca' ? 'Tancar assistent de Nova' : 'Close Nova assistant') : (lang === 'es' ? 'Abrir asistente de Nova' : lang === 'ca' ? 'Obrir assistent de Nova' : 'Open Nova assistant')}>
        <span className="mascot-avatar" role="img" aria-label="Nova, asistente robot futurista"><span className="live-robot" aria-hidden="true"><span className="robot-antenna" /><span className="robot-ear left" /><span className="robot-ear right" /><span className="robot-head"><span className="robot-eye left" /><span className="robot-eye right" /><span className="robot-mouth" /></span><span className="robot-body"><span className="robot-core" /><span className="robot-arm left" /><span className="robot-arm right" /></span><span className="robot-shadow" /></span></span>

      </button>
    </div>
  )
}