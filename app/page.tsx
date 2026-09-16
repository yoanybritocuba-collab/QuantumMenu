'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Utensils, ShoppingBag, CalendarDays, BriefcaseBusiness, Smartphone, Newspaper, ExternalLink, Globe, ChevronDown, Lock, MessageCircle, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { QuoteBuilder } from '@/components/quote-builder'
import { ProjectModal } from '@/components/project-modal'
import { ServiceModal, type ServiceData } from '@/components/service-modal'
import { MascotAssistant } from '@/components/mascot-assistant'

type Lang = 'es' | 'ca' | 'en'

type SupabaseProject = {
  id: number
  number: string
  title_es: string | null
  title_ca: string | null
  title_en: string | null
  type_es: string | null
  type_ca: string | null
  type_en: string | null
  description_es: string | null
  description_ca: string | null
  description_en: string | null
  image: string | null
  accent: string | null
  tags_es: string[] | null
  tags_ca: string[] | null
  tags_en: string[] | null
  includes_es: string[] | null
  includes_ca: string[] | null
  includes_en: string[] | null
  excludes_es: string[] | null
  excludes_ca: string[] | null
  excludes_en: string[] | null
  price: number | null
  delivery_time_es: string | null
  delivery_time_ca: string | null
  delivery_time_en: string | null
  published: boolean
}

const copy = {
  es: {
    navWork: 'Proyectos',
    navServices: 'Servicios',
    navAbout: 'Sobre mí',
    navQuote: 'Presupuesto',
    available: 'Disponible para proyectos seleccionados',
    heroTitle1: 'Diseño web',
    heroTitle2: 'que convierte.',
    heroIntro: 'Construyo experiencias digitales rápidas, cuidadas y orientadas a resultados para negocios que quieren crecer.',
    heroCta: 'Ver proyectos',
    heroWhatsapp: 'Escribir por WhatsApp',
    aboutKicker: '01 / Sobre mí',
    aboutTitle: 'Un socio técnico\npara ideas valientes.',
    aboutCopy: 'Soy diseñador y desarrollador web. Me obsesiona la velocidad, el detalle visual y los resultados medibles.',
    stack: 'Trabajando actualmente con',
    projectKicker: '02 / Proyectos',
    projectTitle: 'Señales recientes',
    servicesKicker: '03 / Servicios',
    servicesTitle: 'Qué ofrezco',
    footerTagline: 'Diseño y desarrollo web profesional para negocios que quieren crecer.',
    footerNav: 'Navegación',
    footerContact: 'Contacto',
    footerRights: 'Todos los derechos reservados',
    footerLocation: 'Barcelona, España',
    heroCaptionLeft: 'IMAGEN SELECCIONADA',
    heroCaptionRight: 'SISTEMAS VISUALES PARA LA WEB',
    workNote: 'Trabajo seleccionado / 2024—26',
    adminButton: 'Panel',
    menuLabel: 'Menú',
    serviceReadMore: 'Ver detalles',
  },
  ca: {
    navWork: 'Projectes',
    navServices: 'Serveis',
    navAbout: 'Sobre mi',
    navQuote: 'Pressupost',
    available: 'Disponible per a projectes seleccionats',
    heroTitle1: 'Disseny web',
    heroTitle2: 'que converteix.',
    heroIntro: 'Construeixo experiències digitals ràpides, cuidades i orientades a resultats per a negocis que volen créixer.',
    heroCta: 'Veure projectes',
    heroWhatsapp: 'Escriure per WhatsApp',
    aboutKicker: '01 / Sobre mi',
    aboutTitle: 'Un soci tècnic\nper a idees valentes.',
    aboutCopy: 'Sóc dissenyador i desenvolupador web. M\'obsessiona la velocitat, el detall visual i els resultats mesurables.',
    stack: 'Treballant actualment amb',
    projectKicker: '02 / Projectes',
    projectTitle: 'Senyals recents',
    servicesKicker: '03 / Serveis',
    servicesTitle: 'Què ofereixo',
    footerTagline: 'Disseny i desenvolupament web professional per a negocis que volen créixer.',
    footerNav: 'Navegació',
    footerContact: 'Contacte',
    footerRights: 'Tots els drets reservats',
    footerLocation: 'Barcelona, Espanya',
    heroCaptionLeft: 'IMATGE SELECCIONADA',
    heroCaptionRight: 'SISTEMES VISUALS PER A LA WEB',
    workNote: 'Treball seleccionat / 2024—26',
    adminButton: 'Panell',
    menuLabel: 'Menú',
    serviceReadMore: 'Veure detalls',
  },
  en: {
    navWork: 'Work',
    navServices: 'Services',
    navAbout: 'About',
    navQuote: 'Quote',
    available: 'Available for selected projects',
    heroTitle1: 'Web design',
    heroTitle2: 'that converts.',
    heroIntro: 'I build fast, crafted, results-driven digital experiences for businesses that want to grow.',
    heroCta: 'View work',
    heroWhatsapp: 'Message on WhatsApp',
    aboutKicker: '01 / About',
    aboutTitle: 'A technical partner\nfor bold ideas.',
    aboutCopy: 'I\'m a designer and web developer. I\'m obsessed with speed, visual detail and measurable results.',
    stack: 'Currently working with',
    projectKicker: '02 / Selected work',
    projectTitle: 'Recent signals',
    servicesKicker: '03 / Services',
    servicesTitle: 'What I offer',
    footerTagline: 'Professional web design and development for growing businesses.',
    footerNav: 'Navigation',
    footerContact: 'Contact',
    footerRights: 'All rights reserved',
    footerLocation: 'Barcelona, Spain',
    heroCaptionLeft: 'SELECTED IMAGE',
    heroCaptionRight: 'VISUAL SYSTEMS FOR THE WEB',
    workNote: 'Selected work / 2024—26',
    adminButton: 'Panel',
    menuLabel: 'Menu',
    serviceReadMore: 'View details',
  },
}

const langLabels: Record<Lang, { code: string; full: string }> = {
  es: { code: 'ES', full: 'Español' },
  ca: { code: 'CA', full: 'Català' },
  en: { code: 'EN', full: 'English' },
}

const BRAND = 'QuantumMenu'
const WHATSAPP_URL = 'https://wa.me/34624497851'
const EMAIL = 'yoanybritocuba@gmail.com'
const PHONE = '+34682139325'
const PHONE_DISPLAY = '+34 682 139 325'

const projectIcons: Record<string, any> = {
  '01': Utensils,
  '02': ShoppingBag,
  '03': CalendarDays,
  '04': ShoppingBag,
  '05': BriefcaseBusiness,
  '06': Smartphone,
  '07': Utensils,
  '08': Newspaper,
}

const projectSymbols: Record<string, { es: string; ca: string; en: string }> = {
  '01': { es: 'CARTA', ca: 'CARTA', en: 'MENU' },
  '02': { es: 'CATÁLOGO', ca: 'CATÀLEG', en: 'CATALOGUE' },
  '03': { es: 'RESERVAS', ca: 'RESERVES', en: 'BOOKING' },
  '04': { es: 'TIENDA', ca: 'BOTIGA', en: 'SHOP' },
  '05': { es: 'PORTFOLIO', ca: 'PORTFOLI', en: 'PROFILE' },
  '06': { es: 'LANDING', ca: 'LANDING', en: 'LANDING' },
  '07': { es: 'RESTAURANTE', ca: 'RESTAURANT', en: 'RESTAURANT' },
  '08': { es: 'REVISTA', ca: 'REVISTA', en: 'EDITORIAL' },
}

// ===== SERVICIOS con información completa =====
const services: (ServiceData & { iconComp: any })[] = [
  {
    index: '01',
    icon: 'utensils',
    iconComp: Utensils,
    accent: '#39ff9a',
    image: '/hero-dev-01.png',
    price: '300€',
    title: {
      es: 'Menús digitales QR',
      ca: 'Menús digitals QR',
      en: 'QR digital menus',
    },
    short: {
      es: 'Carta digital accesible desde el móvil con un solo escaneo.',
      ca: 'Carta digital accessible des del mòbil amb un sol escaneig.',
      en: 'Digital menu accessible from a phone with a single scan.',
    },
    long: {
      es: 'Una carta digital que tus clientes ven escaneando un código QR desde la mesa, sin apps y sin esperas. Puedes actualizar precios, platos o alérgenos en segundos desde tu móvil, sin depender de nadie. Ideal para restaurantes, bares, cafeterías y cualquier negocio con carta.',
      ca: 'Una carta digital que els teus clients veuen escanejant un codi QR des de la taula, sense apps i sense esperes. Pots actualitzar preus, plats o al·lèrgens en segons des del teu mòbil, sense dependre de ningú. Ideal per a restaurants, bars, cafeteries i qualsevol negoci amb carta.',
      en: 'A digital menu your customers see by scanning a QR code at the table — no app, no waiting. Update prices, dishes or allergens in seconds from your phone, without depending on anyone. Ideal for restaurants, bars, cafés and any business with a menu.',
    },
    includes: {
      es: ['Diseño personalizado de la carta', 'Códigos QR físicos para las mesas', 'Editable por ti en segundos', 'Multilenguaje (ES / CA / EN)', 'Alérgenos y categorías', 'Hosting y soporte incluido'],
      ca: ['Disseny personalitzat de la carta', 'Codis QR físics per a les taules', 'Editable per tu en segons', 'Multillenguatge (ES / CA / EN)', 'Al·lèrgens i categories', 'Hosting i suport inclòs'],
      en: ['Custom menu design', 'Physical QR codes for tables', 'Editable by you in seconds', 'Multilanguage (ES / CA / EN)', 'Allergens and categories', 'Hosting and support included'],
    },
    delivery: { es: '5-7 días', ca: '5-7 dies', en: '5-7 days' },
  },
  {
    index: '02',
    icon: 'shopping-bag',
    iconComp: ShoppingBag,
    accent: '#e8bd72',
    image: '/dev-workspace-04.png',
    price: '450€',
    title: {
      es: 'Catálogos y tiendas',
      ca: 'Catàlegs i botigues',
      en: 'Catalogues & stores',
    },
    short: {
      es: 'Muestra tus productos con un catálogo online o una tienda completa.',
      ca: 'Mostra els teus productes amb un catàleg online o una botiga completa.',
      en: 'Showcase your products with an online catalogue or full shop.',
    },
    long: {
      es: 'Desde un catálogo visual con tus productos hasta una tienda online completa con carrito y pagos. Perfecto para tiendas locales, artesanos, distribuidores o cualquier negocio que quiera vender o mostrar productos por internet. Podrás gestionar productos, precios y fotos tú mismo.',
      ca: 'Des d\'un catàleg visual amb els teus productes fins a una botiga online completa amb carret i pagaments. Perfecte per a botigues locals, artesans, distribuïdors o qualsevol negoci que vulgui vendre o mostrar productes per internet. Podràs gestionar productes, preus i fotos tu mateix.',
      en: 'From a visual catalogue with your products to a complete online shop with cart and payments. Perfect for local stores, artisans, distributors or any business that wants to sell or showcase products online. Manage products, prices and photos yourself.',
    },
    includes: {
      es: ['Catálogo visual o tienda completa', 'Fichas de producto editables', 'Carrito y pagos online', 'Gestión desde el panel admin', 'SEO básico incluido', 'Formación de uso'],
      ca: ['Catàleg visual o botiga completa', 'Fitxes de producte editables', 'Carret i pagaments online', 'Gestió des del panell admin', 'SEO bàsic inclòs', 'Formació d\'ús'],
      en: ['Visual catalogue or full shop', 'Editable product pages', 'Cart and online payments', 'Admin panel management', 'Basic SEO included', 'Usage training'],
    },
    delivery: { es: '7-10 días', ca: '7-10 dies', en: '7-10 days' },
  },
  {
    index: '03',
    icon: 'calendar',
    iconComp: CalendarDays,
    accent: '#7ee0ff',
    image: '/hero-dev-03.png',
    price: '350€',
    title: {
      es: 'Reservas y citas',
      ca: 'Reserves i cites',
      en: 'Bookings & appointments',
    },
    short: {
      es: 'Sistema de reservas online para que tus clientes se agenden solos.',
      ca: 'Sistema de reserves online perquè els teus clients s\'agendin sols.',
      en: 'Online booking system so your clients schedule themselves.',
    },
    long: {
      es: 'Tus clientes reservan o piden cita desde tu web sin llamarte. Tú decides horarios, servicios y duración. Recibes avisos automáticos por email o WhatsApp. Ideal para peluquerías, clínicas, entrenadores, restaurantes, talleres y cualquier negocio con cita previa.',
      ca: 'Els teus clients reserven o demanen cita des de la teva web sense trucar-te. Tu decideixes horaris, serveis i durada. Reps avisos automàtics per correu o WhatsApp. Ideal per a perruqueries, clíniques, entrenadors, restaurants, tallers i qualsevol negoci amb cita prèvia.',
      en: 'Your clients book or schedule appointments from your site without calling. You set schedules, services and duration. Get automatic notifications by email or WhatsApp. Ideal for hair salons, clinics, trainers, restaurants, workshops and any business with bookings.',
    },
    includes: {
      es: ['Calendario online personalizado', 'Configuración de horarios y servicios', 'Avisos automáticos por email', 'Recordatorios por WhatsApp', 'Panel de gestión de citas', 'Cancelaciones y reprogramaciones'],
      ca: ['Calendari online personalitzat', 'Configuració d\'horaris i serveis', 'Avisos automàtics per correu', 'Recordatoris per WhatsApp', 'Panell de gestió de cites', 'Cancel·lacions i reprogramacions'],
      en: ['Custom online calendar', 'Schedule and services setup', 'Automatic email notifications', 'WhatsApp reminders', 'Appointments management panel', 'Cancellations and rescheduling'],
    },
    delivery: { es: '6-8 días', ca: '6-8 dies', en: '6-8 days' },
  },
  {
    index: '04',
    icon: 'briefcase',
    iconComp: BriefcaseBusiness,
    accent: '#ff8ad4',
    image: '/dev-workspace-05.png',
    price: '550€',
    title: {
      es: 'Web corporativa',
      ca: 'Web corporativa',
      en: 'Business website',
    },
    short: {
      es: 'Presencia profesional completa para tu empresa o marca personal.',
      ca: 'Presència professional completa per a la teva empresa o marca personal.',
      en: 'Complete professional presence for your company or personal brand.',
    },
    long: {
      es: 'Una web completa que presenta quién eres, qué haces y cómo contactarte. Diseño moderno, rápido y adaptado a móvil. Incluye secciones personalizadas, formulario de contacto, blog, integración con redes y SEO básico. Perfecto para empresas, profesionales, freelancers y autónomos que quieren dar imagen de marca.',
      ca: 'Una web completa que presenta qui ets, què fas i com contactar-te. Disseny modern, ràpid i adaptat a mòbil. Inclou seccions personalitzades, formulari de contacte, blog, integració amb xarxes i SEO bàsic. Perfecte per a empreses, professionals, freelancers i autònoms que volen donar imatge de marca.',
      en: 'A complete website presenting who you are, what you do and how to reach you. Modern, fast and mobile-ready design. Includes custom sections, contact form, blog, social integration and basic SEO. Perfect for companies, professionals, freelancers and self-employed people building a brand.',
    },
    includes: {
      es: ['Diseño personalizado a medida', 'Todas las secciones que necesites', 'Formulario de contacto', 'Blog o noticias', 'SEO básico en Google', 'Adaptado a móvil', 'Hosting y dominio (opcional)'],
      ca: ['Disseny personalitzat a mida', 'Totes les seccions que necessitis', 'Formulari de contacte', 'Blog o notícies', 'SEO bàsic a Google', 'Adaptat a mòbil', 'Hosting i domini (opcional)'],
      en: ['Custom tailored design', 'All sections you need', 'Contact form', 'Blog or news', 'Basic SEO on Google', 'Mobile-adapted', 'Hosting and domain (optional)'],
    },
    delivery: { es: '10-15 días', ca: '10-15 dies', en: '10-15 days' },
  },
]

function mapProject(p: SupabaseProject, lang: Lang) {
  const number = p.number || '01'
  const Icon = projectIcons[number] || Utensils
  const symbol = projectSymbols[number] || { es: 'PROYECTO', ca: 'PROJECTE', en: 'PROJECT' }
  const title = lang === 'es' ? p.title_es : lang === 'ca' ? p.title_ca : p.title_en
  const type = lang === 'es' ? p.type_es : lang === 'ca' ? p.type_ca : p.type_en
  const description = lang === 'es' ? p.description_es : lang === 'ca' ? p.description_ca : p.description_en
  const tags = (lang === 'es' ? p.tags_es : lang === 'ca' ? p.tags_ca : p.tags_en) || []
  const includes = (lang === 'es' ? p.includes_es : lang === 'ca' ? p.includes_ca : p.includes_en) || []
  const excludes = (lang === 'es' ? p.excludes_es : lang === 'ca' ? p.excludes_ca : p.excludes_en) || []
  const deliveryTime = lang === 'es' ? p.delivery_time_es : lang === 'ca' ? p.delivery_time_ca : p.delivery_time_en

  return {
    id: p.id,
    number,
    title: title || '',
    type: type || '',
    description: description || '',
    image: p.image || '/placeholder.svg',
    accent: p.accent || '#16b77f',
    icon: Icon,
    symbol: symbol[lang],
    tags,
    includes,
    excludes,
    price: p.price || 0,
    deliveryTime: deliveryTime || '',
  }
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('es')
  const [activeSlide, setActiveSlide] = useState(0)
  const [projects, setProjects] = useState<SupabaseProject[]>([])
  const [projectsLoaded, setProjectsLoaded] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const t = copy[lang]

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('number', { ascending: true })
      if (!error && data) setProjects(data as SupabaseProject[])
      setProjectsLoaded(true)
    }
    load()
  }, [])

  const mappedProjects = useMemo(() => projects.map((p) => mapProject(p, lang)), [projects, lang])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const changeLang = (l: Lang) => { setLang(l); setLangOpen(false) }
  const closeMenu = () => setMenuOpen(false)

  const goToWork = () => {
    const el = document.getElementById('work')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <a href="/" className="brand">
          <img src="/logo.png" alt={BRAND} className="brand-logo" />
          <span className="brand-name">{BRAND}</span>
        </a>
        <nav className="main-nav">
          <a href="#work">{t.navWork}</a>
          <a href="#services">{t.navServices}</a>
          <a href="#about">{t.navAbout}</a>
          <a href="#presupuesto">{t.navQuote}</a>
        </nav>
        <div className="header-actions">
          <div className="lang-dropdown" ref={langRef}>
            <button className="lang-trigger" onClick={() => setLangOpen(!langOpen)} aria-label="Cambiar idioma">
              <Globe size={16} />
              <span>{langLabels[lang].code}</span>
              <ChevronDown size={14} className={`lang-chevron ${langOpen ? 'open' : ''}`} />
            </button>
            {langOpen && (
              <div className="lang-menu" role="menu">
                {(Object.keys(langLabels) as Lang[]).map((code) => (
                  <button key={code} className={`lang-option ${lang === code ? 'active' : ''}`} onClick={() => changeLang(code)} role="menuitem">
                    <span className="lang-option-code">{langLabels[code].code}</span>
                    <span className="lang-option-full">{langLabels[code].full}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <a href="/admin" className="header-admin">
            <Lock size={14} />
            <span>{t.adminButton}</span>
          </a>
          <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label={t.menuLabel} aria-expanded={menuOpen}>
            <span className="menu-toggle-bars"><span /><span /><span /></span>
          </button>
        </div>
      </header>

      <div className={`mobile-menu-fullscreen ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-inner">
          <nav className="mobile-menu-nav">
            <a href="#work" onClick={closeMenu} style={{ animationDelay: '.1s' }}>{t.navWork}</a>
            <a href="#services" onClick={closeMenu} style={{ animationDelay: '.18s' }}>{t.navServices}</a>
            <a href="#about" onClick={closeMenu} style={{ animationDelay: '.26s' }}>{t.navAbout}</a>
            <a href="#presupuesto" onClick={closeMenu} style={{ animationDelay: '.34s' }}>{t.navQuote}</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mobile-menu-whatsapp" onClick={closeMenu} style={{ animationDelay: '.42s' }}>
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a href="/admin" className="mobile-menu-admin" onClick={closeMenu} style={{ animationDelay: '.5s' }}>
              <Lock size={16} /> {t.adminButton}
            </a>
          </nav>
        </div>
      </div>

      <section className="hero">
        <div className="hero-visual" aria-label="Featured work carousel">
          {['/hero-dev-01.png', '/hero-dev-02.png', '/hero-dev-03.png', '/dev-workspace-01.png', '/dev-workspace-02.png', '/dev-workspace-03.png'].map((image, index) => (
            <div key={image} className={`hero-slide ${activeSlide === index ? 'active' : ''}`} style={{ backgroundImage: `url(${image})` }} onAnimationEnd={() => setActiveSlide((activeSlide + 1) % 6)} />
          ))}
          <div className="hero-visual-overlay" />
          <div className="hero-caption">{t.heroCaptionLeft} / 0{activeSlide + 1}<br /><strong>{t.heroCaptionRight}</strong></div>
        </div>
        <div className="section-wrap hero-copy">
          <span className="availability"><span className="status-dot" />{t.available}</span>
          <h1><span>{t.heroTitle1}</span><br /><span>{t.heroTitle2}</span></h1>
          <p className="hero-intro">{t.heroIntro}</p>
          <div className="hero-actions">
            <a href="#work" className="button button-primary">{t.heroCta} <ExternalLink size={14} /></a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-link"><MessageCircle size={14} /> {t.heroWhatsapp}</a>
          </div>
        </div>
      </section>

      <section id="about" className="section-wrap about-section">
        <div className="section-label"><span>{t.aboutKicker}</span><span>01 / 01</span></div>
        <div className="about-layout">
          <h2>{t.aboutTitle.split('\n').map((line, i) => (<span key={i}>{line}{i === 0 && <br />}</span>))}</h2>
          <div>
            <p className="large-copy">{t.aboutCopy}</p>
            <div className="stack-block">
              <span className="mini-label">{t.stack}</span>
              <div className="stack-list"><span>Next.js</span><span>React</span><span>TypeScript</span><span>Tailwind</span><span>Supabase</span><span>Vercel</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="section-wrap work-section">
        <div className="section-label"><span>{t.projectKicker}</span><span>03 / 03</span></div>
        <div className="section-heading"><h2>{t.projectTitle}</h2><span className="section-note">{t.workNote}</span></div>
        <div className="project-grid">
          {!projectsLoaded && <p style={{ color: 'var(--green)', opacity: .6 }}>{lang === 'es' ? 'Cargando proyectos...' : lang === 'ca' ? 'Carregant projectes...' : 'Loading projects...'}</p>}
          {projectsLoaded && mappedProjects.length === 0 && <p style={{ color: 'var(--green)', opacity: .6 }}>{lang === 'es' ? 'No hay proyectos publicados.' : lang === 'ca' ? 'No hi ha projectes publicats.' : 'No published projects.'}</p>}
          {mappedProjects.map((project) => {
            const ProjectIcon = project.icon
            return (
              <article className="project-card" key={project.id} onClick={() => setSelectedProject(project)} style={{ cursor: 'pointer' }}>
                <div className="project-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.72)), url(${project.image})` }}>
                  <div className="image-grid" />
                  <div className="project-number">{project.number}</div>
                  <div className="project-icon-badge"><ProjectIcon size={28} strokeWidth={1.4} /></div>
                  <div className="project-symbol" style={{ color: project.accent, borderColor: project.accent }}>
                    <ProjectIcon size={52} strokeWidth={1.2} />
                    <span>{project.symbol}</span>
                  </div>
                  <div className="project-orbit" style={{ borderColor: project.accent }} />
                  <ExternalLink className="project-arrow" size={20} />
                </div>
                <div className="project-info">
                  <div><h3>{project.title}</h3><p>{project.type}</p></div>
                  <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section id="services" className="section-wrap services-section">
        <div className="section-label"><span>{t.servicesKicker}</span><span>03 / 03</span></div>
        <div className="section-heading"><h2>{t.servicesTitle}</h2></div>
        <div className="service-list">
          {services.map((service) => {
            const ServiceIcon = service.iconComp
            return (
              <button
                type="button"
                className="service-row"
                key={service.index}
                onClick={() => setSelectedService(service)}
              >
                <span className="service-index">{service.index}</span>
                <ServiceIcon size={26} strokeWidth={1.2} />
                <div>
                  <h3>{service.title[lang]}</h3>
                  <p>{service.short[lang]}</p>
                </div>
                <span className="service-arrow">
                  <ExternalLink size={16} />
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <QuoteBuilder lang={lang} />

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-col footer-col-brand">
            <a href="/" className="footer-brand">
              <img src="/logo.png" alt={BRAND} className="footer-logo" />
              <span className="footer-brand-name">{BRAND}</span>
            </a>
            <p className="footer-tagline">{t.footerTagline}</p>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">{t.footerNav}</h4>
            <ul className="footer-links">
              <li><a href="#work">{t.navWork}</a></li>
              <li><a href="#services">{t.navServices}</a></li>
              <li><a href="#about">{t.navAbout}</a></li>
              <li><a href="#presupuesto">{t.navQuote}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">{t.footerContact}</h4>
            <ul className="footer-contact-list">
              <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="footer-contact-item footer-contact-whatsapp"><MessageCircle size={16} /><span>WhatsApp</span></a></li>
              <li><a href={`mailto:${EMAIL}`} className="footer-contact-item"><Mail size={16} /><span>{EMAIL}</span></a></li>
              <li><a href={`tel:${PHONE}`} className="footer-contact-item"><Phone size={16} /><span>{PHONE_DISPLAY}</span></a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {BRAND} — {t.footerRights}</span>
          <span>{t.footerLocation}</span>
        </div>
      </footer>

      <ProjectModal project={selectedProject} lang={lang} onClose={() => setSelectedProject(null)} />
      <ServiceModal
        service={selectedService}
        lang={lang}
        onClose={() => setSelectedService(null)}
        onGoToWork={() => { setSelectedService(null); setTimeout(goToWork, 200) }}
      />
      <MascotAssistant lang={lang} />
    </main>
  )
}