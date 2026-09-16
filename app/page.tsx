'use client'

import { useEffect, useMemo, useState } from 'react'
import { MascotAssistant } from '@/components/mascot-assistant'
import { QuoteBuilder } from '@/components/quote-builder'
import { ProjectModal } from '@/components/project-modal'
import {
  ArrowUpRight,
  Check,
  Code2,
  ExternalLink,
  Layers3,
  Mail,
  Phone,
  Menu,
  MoveRight,
  Sparkles,
  Settings2,
  X,
  Zap,
  QrCode,
  Utensils,
  ShoppingBag,
  CalendarDays,
  BriefcaseBusiness,
  Smartphone,
  Newspaper,
} from 'lucide-react'

const copy = {
  en: {
    nav: ['About', 'Work', 'Services', 'Contact'],
    available: 'Available for selected projects',
    eyebrow: 'Independent web engineer / Barcelona',
    title: 'Digital experiences\ncrafted to move.',
    intro: 'I design and build sharp, high-performance experiences for ambitious teams that want to move the web forward.',
    cta: 'Start a conversation',
    work: 'View selected work',
    aboutKicker: '01 / About',
    aboutTitle: 'A technical partner\nfor bold ideas.',
    aboutText: 'From first sketch to final deployment, I combine product thinking, expressive design and resilient engineering. No noise. Just thoughtful digital work that earns attention and keeps performing.',
    stack: 'Currently working with',
    projectKicker: '02 / Selected work',
    projectTitle: 'Recent signals',
    servicesKicker: '03 / Capabilities',
    servicesTitle: 'Small team energy.\nSenior-level craft.',
    skillsKicker: '04 / Stack',
    skillsTitle: 'Tools for making\nthings matter.',
    contactKicker: '05 / Contact',
    contactTitle: 'Have a good\nproblem to solve?',
    contactText: 'Tell me what you are building, where it hurts, and what success looks like. I will get back to you within two working days.',
    send: 'Send enquiry',
    footer: 'Built with curiosity, care and a little green light.',
    adminKicker: '06 / Control room',
    adminTitle: 'Keep every detail\nin your hands.',
    adminText: 'Update projects, images, links and site content from one protected workspace.',
    adminButton: 'Open admin panel',
  },
  ca: {
    nav: ['Sobre mi', 'Projectes', 'Serveis', 'Contacte'],
    available: 'Disponible per a projectes seleccionats',
    eyebrow: 'Enginyer web independent / Barcelona',
    title: 'Experiències digitals\nque avancen.',
    intro: 'Dissenyo i construeixo experiències ràpides i precises per a equips ambiciosos que volen fer avançar la web.',
    cta: 'Comencem a parlar',
    work: 'Veure projectes',
    aboutKicker: '01 / Sobre mi',
    aboutTitle: 'Un soci tècnic\nper a idees valentes.',
    aboutText: 'Des del primer esbós fins al desplegament final, combino pensament de producte, disseny expressiu i enginyeria resilient.',
    stack: 'Treballant actualment amb',
    projectKicker: '02 / Projectes',
    projectTitle: 'Senyals recents',
    servicesKicker: '03 / Capacitats',
    servicesTitle: 'Energia d’equip petit.\nOfici sènior.',
    skillsKicker: '04 / Stack',
    skillsTitle: 'Eines per crear\ncoses que importen.',
    contactKicker: '05 / Contacte',
    contactTitle: 'Tens un bon\nproblema per resoldre?',
    contactText: 'Explica’m què estàs construint i com és l’èxit. Et respondré en un màxim de dos dies laborables.',
    send: 'Enviar consulta',
    footer: 'Fet amb curiositat, cura i una mica de llum verda.',
    adminKicker: '06 / Sala de control',
    adminTitle: 'Cada detall\na les teves mans.',
    adminText: 'Actualitza projectes, imatges, enllaços i contingut des d’un espai protegit.',
    adminButton: 'Obrir panell admin',
  },
  es: {
    nav: ['Sobre mí', 'Proyectos', 'Servicios', 'Contacto'],
    available: 'Disponible para proyectos seleccionados',
    eyebrow: 'Ingeniero web independiente / Barcelona',
    title: 'Experiencias digitales\nque avanzan.',
    intro: 'Convertimos ideas en experiencias digitales que hacen crecer tu negocio.',
    cta: 'Empecemos a hablar',
    work: 'Ver proyectos',
    aboutKicker: '01 / Sobre mí',
    aboutTitle: 'Un socio técnico\npara ideas valientes.',
    aboutText: 'Desde el primer boceto hasta el despliegue final, combino pensamiento de producto, diseño expresivo e ingeniería resiliente. Sin ruido. Solo trabajo digital que merece atención.',
    stack: 'Trabajando actualmente con',
    projectKicker: '02 / Proyectos',
    projectTitle: 'Señales recientes',
    servicesKicker: '03 / Capacidades',
    servicesTitle: 'Energía de equipo pequeño.\nOficio senior.',
    skillsKicker: '04 / Stack',
    skillsTitle: 'Herramientas para crear\ncosas que importan.',
    contactKicker: '05 / Contacto',
    contactTitle: '¿Tienes un buen\nproblema que resolver?',
    contactText: 'Cuéntame qué estás construyendo, dónde duele y cómo se ve el éxito. Te responderé en un máximo de dos días laborables.',
    send: 'Enviar consulta',
    footer: 'Hecho con curiosidad, cuidado y un poco de luz verde.',
    adminKicker: '06 / Sala de control',
    adminTitle: 'Cada detalle\nen tus manos.',
    adminText: 'Actualiza proyectos, imágenes, enlaces y contenido desde un espacio protegido.',
    adminButton: 'Abrir panel admin',
  },
} as const

type Lang = keyof typeof copy

const projects = [
  { number: '01', title: { en: 'QR Menu', ca: 'Menú QR', es: 'Menú QR' }, type: { en: 'Digital menu for restaurants', ca: 'Menú digital per a restaurants', es: 'Carta digital para restaurantes' }, image: '/dev-workspace-03.png', accent: '#39ff9a', icon: Utensils, tags: ['QR', 'Products', 'Mobile'] },
  { number: '02', title: { en: 'Business Catalogue', ca: 'Catàleg d’empresa', es: 'Catálogo para empresas' }, type: { en: 'Products and services catalogue', ca: 'Catàleg de productes i serveis', es: 'Catálogo de productos y servicios' }, image: '/dev-workspace-04.png', accent: '#e5b96d', icon: ShoppingBag, tags: ['CMS', 'Catalogue', 'Responsive'] },
  { number: '03', title: { en: 'Booking Website', ca: 'Web de reserves', es: 'Web de reservas' }, type: { en: 'Appointments and online reservations', ca: 'Cites i reserves en línia', es: 'Citas y reservas online' }, image: '/dev-workspace-05.png', accent: '#39ff9a', icon: CalendarDays, tags: ['Bookings', 'Forms', 'Launch'] },
  { number: '04', title: { en: 'Online Store', ca: 'Botiga en línia', es: 'Tienda online' }, type: { en: 'Ecommerce experience for growing brands', ca: 'Experiència ecommerce per a marques', es: 'Experiencia ecommerce para marcas' }, image: '/dev-workspace-02.png', accent: '#39ff9a', icon: ShoppingBag, tags: ['Commerce', 'Payments', 'UX'] },
  { number: '05', title: { en: 'Professional Portfolio', ca: 'Portfoli professional', es: 'Portfolio profesional' }, type: { en: 'Personal brand and creative showcase', ca: 'Marca personal i aparador creatiu', es: 'Marca personal y escaparate creativo' }, image: '/dev-workspace-01.png', accent: '#e5b96d', icon: BriefcaseBusiness, tags: ['Brand', 'Motion', 'Case studies'] },
  { number: '06', title: { en: 'Landing Page', ca: 'Landing page', es: 'Landing page' }, type: { en: 'Focused page for campaigns and launches', ca: 'Pàgina per a campanyes i llançaments', es: 'Página para campañas y lanzamientos' }, image: '/dev-workspace-06.png', accent: '#39ff9a', icon: Smartphone, tags: ['Campaigns', 'Conversion', 'Speed'] },
  { number: '07', title: { en: 'Restaurant Website', ca: 'Web de restaurant', es: 'Web para restaurante' }, type: { en: 'Menu, story, location and reservations', ca: 'Menú, història, ubicació i reserves', es: 'Carta, historia, ubicación y reservas' }, image: '/hero-dev-01.png', accent: '#39ff9a', icon: Utensils, tags: ['Hospitality', 'QR', 'Bookings'] },
  { number: '08', title: { en: 'News & Magazine', ca: 'Notícies i revista', es: 'Noticias y revista' }, type: { en: 'Editorial content platform', ca: 'Plataforma de contingut editorial', es: 'Plataforma de contenido editorial' }, image: '/hero-dev-02.png', accent: '#e5b96d', icon: Newspaper, tags: ['Editorial', 'Content', 'SEO'] },
]

const services = [
  { icon: Utensils, title: { en: 'QR menus for restaurants', ca: 'Menús QR per a restaurants', es: 'Cartas QR para restaurantes' }, text: { en: 'Digital menus that are easy to update, scan and use from any phone.', ca: 'Menús digitals fàcils d’actualitzar, escanejar i consultar des de qualsevol mòbil.', es: 'Cartas digitales fáciles de actualizar, escanear y consultar desde cualquier móvil.' } },
  { icon: ShoppingBag, title: { en: 'Business catalogues', ca: 'Catàlegs d’empresa', es: 'Catálogos para empresas' }, text: { en: 'Clear product and service showcases that help customers decide faster.', ca: 'Aparadors clars de productes i serveis perquè els clients decideixin més ràpid.', es: 'Muestras claras de productos y servicios para que tus clientes decidan más rápido.' } },
  { icon: CalendarDays, title: { en: 'Booking websites', ca: 'Webs de reserves', es: 'Webs de reservas' }, text: { en: 'Simple booking flows for appointments, restaurants, studios and local businesses.', ca: 'Fluxos de reserva simples per a cites, restaurants, estudis i negocis locals.', es: 'Flujos de reserva simples para citas, restaurantes, estudios y negocios locales.' } },
  { icon: Code2, title: { en: 'Custom web development', ca: 'Desenvolupament web a mida', es: 'Desarrollo web a medida' }, text: { en: 'Fast, accessible websites built around the way your business actually works.', ca: 'Webs ràpides i accessibles construïdes al voltant del teu negoci real.', es: 'Webs rápidas y accesibles construidas alrededor de cómo funciona tu negocio.' } },
]

const tech = ['TypeScript', 'React / Next.js', 'Node.js', 'Postgres', 'Figma', 'AI interfaces']

const WHATSAPP_URL = 'https://wa.me/34624497851?text=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20sobre%20una%20web%20para%20mi%20negocio.'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[number] | null>(null)
  const t = useMemo(() => copy[lang], [lang])

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % 6), 4000)
    return () => window.clearInterval(timer)
  }, [])

  const navLinks = ['#about', '#work', '#services', '#contact']

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="site-header">
        <a href="#top" className="brand" aria-label="QuantumMenu home"><img src="/logo.png" alt="QuantumMenu logo" /><span>QuantumMenu</span></a>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Primary navigation">
          {t.nav.map((item, index) => <a key={item} href={navLinks[index]} onClick={() => setMenuOpen(false)}>{item}</a>)}
        </nav>
        <div className="header-actions">
          <label className="language-select" aria-label="Language selector"><span className="language-globe">◎</span><select value={lang} onChange={(event) => setLang(event.target.value as Lang)}><option value="en">English</option><option value="ca">Català</option><option value="es">Español</option></select><span className="language-chevron">⌄</span></label>
          <a className="header-admin" href="/admin"><Settings2 size={14} />{t.adminButton}</a>
          <a className="header-contact" href="#contact">{t.cta}<ArrowUpRight size={14} /></a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section id="top" className="hero section-wrap">
        <div className="hero-visual" aria-label="Featured work carousel">
          {['/hero-dev-01.png', '/hero-dev-02.png', '/hero-dev-03.png', '/dev-workspace-01.png', '/dev-workspace-02.png', '/dev-workspace-03.png'].map((image, index) => <div key={image} className={`hero-slide ${activeSlide === index ? 'active' : ''}`} style={{ backgroundImage: `url(${image})` }} />)}
          <div className="hero-visual-overlay" />
          <div className="hero-counter"><span>0{activeSlide + 1}</span><span className="counter-line" /><span>06</span></div>
          <div className="hero-caption">SELECTED IMAGE / 0{activeSlide + 1}<br /><strong>VISUAL SYSTEMS FOR THE WEB</strong></div>
        </div>
        <div className="hero-copy reveal">
          <div className="availability"><span className="status-dot" />{t.available}</div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h1>
          <p className="hero-intro">{t.intro.split(' ').map((word, index) => <span className="hero-intro-word" key={`${word}-${index}`}>{word}{index < t.intro.split(' ').length - 1 ? ' ' : ''}</span>)}</p>
          <div className="hero-actions"><a href="#contact" className="button button-primary">{t.cta}<MoveRight size={17} /></a><a href="#work" className="text-link">{t.work}<ArrowUpRight size={15} /></a></div>
        </div>
        <div className="hero-meta"><span>© 2024—2026</span><span className="scroll-note"><span className="scroll-line" />scroll to explore</span><span>BCN / ES</span></div>
      </section>

      <section id="about" className="section-wrap about-section">
        <div className="section-label"><span>{t.aboutKicker}</span><span>●</span></div>
        <div className="about-layout"><div><h2>{t.aboutTitle.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2></div><div className="about-detail"><p className="large-copy">{t.aboutText}</p><div className="stack-block"><span className="mini-label">{t.stack}</span><div className="stack-list">{['Next.js', 'TypeScript', 'Supabase', 'AI'].map((item) => <span key={item}><Check size={13} />{item}</span>)}</div></div></div></div>
      </section>

      <section id="work" className="section-wrap work-section"><div className="section-label"><span>{t.projectKicker}</span><span>03 / 03</span></div><div className="section-heading"><h2>{t.projectTitle}</h2><span className="section-note">Selected work / 2024—26</span></div><div className="project-grid">{projects.map((project) => { const ProjectIcon = project.icon; return <article className="project-card" key={project.number} onClick={() => setSelectedProject(project)} style={{ cursor: 'pointer' }}><div className="project-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.72)), url(${project.image})` }}><div className="image-grid" /><div className="project-number">{project.number}</div><div className="project-type-badge"><ProjectIcon size={18} /><span>{project.title[lang]}</span></div><div className="project-symbol" style={{ color: project.accent, borderColor: project.accent }}><ProjectIcon size={42} strokeWidth={1.2} /><span>{project.title.en === 'QR Menu' ? 'QR' : project.title.en === 'Business Catalogue' ? 'CATALOGUE' : project.title.en === 'Booking Website' ? 'BOOKING' : project.title.en === 'Online Store' ? 'SHOP' : project.title.en === 'Professional Portfolio' ? 'PROFILE' : project.title.en === 'Landing Page' ? 'LANDING' : project.title.en === 'Restaurant Website' ? 'MENU' : 'EDITORIAL'}</span></div>{project.title.en === 'QR Menu' && <div className="qr-badge"><QrCode size={46} /><span>{lang === 'es' ? 'ESCANEA / PIDE' : lang === 'ca' ? 'ESCANEJA / DEMANA' : 'SCAN / ORDER'}</span></div>}<div className="project-orbit" style={{ borderColor: project.accent }} /><ExternalLink className="project-arrow" size={20} /></div><div className="project-info"><div><h3>{project.title[lang]}</h3><p>{project.type[lang]}</p></div><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></article> })}</div></section>

      <section id="services" className="section-wrap services-section"><div className="section-label"><span>{t.servicesKicker}</span><span>What I do</span></div><div className="services-layout"><h2>{t.servicesTitle.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><div className="service-list">{services.map(({ icon: Icon, title, text }, i) => <div className="service-row" key={title.en}><span className="service-index">0{i + 1}</span><Icon size={21} /><div><h3>{title[lang]}</h3><p>{text[lang]}</p></div><ArrowUpRight className="service-arrow" size={18} /></div>)}</div></div></section>

      <section className="section-wrap skills-section"><div className="section-label"><span>{t.skillsKicker}</span><span>Tools / process</span></div><div className="skills-layout"><h2>{t.skillsTitle.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><div className="tech-cloud">{tech.map((item, i) => <span key={item} className={`tech-chip chip-${i}`}>{item}</span>)}</div></div></section>

      <QuoteBuilder lang={lang} />

      <section id="contact" className="section-wrap contact-section"><div className="section-label"><span>{t.contactKicker}</span><span>Let&apos;s talk</span></div><div className="contact-layout"><div><h2>{t.contactTitle.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p className="contact-copy">{t.contactText}</p><a className="email-link" href="mailto:yoanybritocuba@gmail.com">yoanybritocuba@gmail.com <ArrowUpRight size={16} /></a></div><form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>{sent ? <div className="form-success"><Check size={28} /><h3>Message received.</h3><p>Thanks for reaching out. I&apos;ll be in touch soon.</p></div> : <><label>Name<input required name="name" placeholder="Your name" /></label><label>Email<input required type="email" name="email" placeholder="you@company.com" /></label><label>What are we building?<textarea required name="message" rows={4} placeholder="A little about the project..." /></label><button className="button button-primary" type="submit">{t.send}<MoveRight size={17} /></button></>}</form></div></section>

      <section className="section-wrap admin-cta-section"><div className="section-label"><span>{t.adminKicker}</span><span>Protected workspace</span></div><div className="admin-cta"><div><h2>{t.adminTitle.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2><p>{t.adminText}</p></div></div></section>

      <footer className="site-footer section-wrap">
        <div className="footer-top">
          <a href="#top" className="brand">
            <img src="/logo.png" alt="QuantumMenu logo" />
            <span>QuantumMenu</span>
          </a>
          <p>{t.footer}</p>
          <div className="footer-contact">
            <a href="mailto:yoanybritocuba@gmail.com">yoanybritocuba@gmail.com</a>
            <a href="tel:+34624497851">+34 624 497 851</a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-whatsapp-link"
            >
              <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.26-.79 2.605-1.53.143-.31.258-.645.258-.99 0-.258-.144-.402-.402-.53-.486-.244-1.36-.703-1.85-.96-.147-.087-.314-.13-.474-.13zM16.005 4C9.376 4 4 9.376 4 16.006c0 2.115.558 4.098 1.52 5.827L4 28l6.343-1.489a11.94 11.94 0 0 0 5.662 1.436c6.63 0 12.005-5.376 12.005-12.006S22.635 4 16.005 4zm0 21.788c-1.73 0-3.428-.516-4.84-1.475l-.36-.227-3.6.845.96-3.502-.236-.376a9.744 9.744 0 0 1-1.475-5.174c0-5.405 4.4-9.805 9.805-9.805s9.805 4.4 9.805 9.805-4.4 9.81-9.805 9.81z" />
              </svg>
              WhatsApp
            </a>
          </div>
          <div className="socials">
            <a href="mailto:yoanybritocuba@gmail.com" aria-label="Email"><Mail size={17} /></a>
            <a href="tel:+34624497851" aria-label="Phone"><Phone size={17} /></a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 32 32" width="17" height="17" fill="currentColor">
                <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.26-.79 2.605-1.53.143-.31.258-.645.258-.99 0-.258-.144-.402-.402-.53-.486-.244-1.36-.703-1.85-.96-.147-.087-.314-.13-.474-.13zM16.005 4C9.376 4 4 9.376 4 16.006c0 2.115.558 4.098 1.52 5.827L4 28l6.343-1.489a11.94 11.94 0 0 0 5.662 1.436c6.63 0 12.005-5.376 12.005-12.006S22.635 4 16.005 4zm0 21.788c-1.73 0-3.428-.516-4.84-1.475l-.36-.227-3.6.845.96-3.502-.236-.376a9.744 9.744 0 0 1-1.475-5.174c0-5.405 4.4-9.805 9.805-9.805s9.805 4.4 9.805 9.805-4.4 9.81-9.805 9.81z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Studio / All systems nominal</span>
          <span>Barcelona, Spain</span>
          <a href="/admin">Admin access <ArrowUpRight size={13} /></a>
        </div>
      </footer>
      <MascotAssistant lang={lang} />
      <ProjectModal project={selectedProject} lang={lang} onClose={() => setSelectedProject(null)} />
    </main>
  )
}