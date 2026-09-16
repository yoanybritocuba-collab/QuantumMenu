'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/useTranslation'
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  Check,
  FileText,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'

type Project = {
  id: number
  number: string
  title_es: string
  title_ca: string
  title_en: string
  type_es: string
  type_ca: string
  type_en: string
  image: string
  accent: string
  tags: string[]
  includes_es?: string[]
  includes_ca?: string[]
  includes_en?: string[]
  excludes_es?: string[]
  excludes_ca?: string[]
  excludes_en?: string[]
  published: boolean
}

type MediaItem = { id: number; name: string; src: string; source: 'Upload' | 'Link' }
type Promotion = { id: number; title: string; placement: string; status: 'Active' | 'Scheduled' }

type QuoteBlock = {
  id: number
  key: string
  title_es: string
  title_ca: string
  title_en: string
  description_es: string
  type: 'single-choice' | 'multi-choice'
  required: boolean
  order_index: number
  active: boolean
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
  active: boolean
}

const menu = [
  { label: 'Resumen', icon: LayoutDashboard },
  { label: 'Proyectos', icon: FileText },
  { label: 'Promociones', icon: Sparkles },
  { label: 'Biblioteca', icon: ImagePlus },
  { label: 'Presupuestos', icon: Calculator },
  { label: 'Ajustes', icon: Settings2 },
]

const emptyProject: Project = {
  id: 0,
  number: '',
  title_es: '',
  title_ca: '',
  title_en: '',
  type_es: '',
  type_ca: '',
  type_en: '',
  image: '',
  accent: '#39ff9a',
  tags: [],
  includes_es: [],
  includes_ca: [],
  includes_en: [],
  excludes_es: [],
  excludes_ca: [],
  excludes_en: [],
  published: true,
}

export default function AdminPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [active, setActive] = useState('Resumen')
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 1, title: 'Declaración hero', placement: 'Inicio / Hero', status: 'Active' },
    { id: 2, title: 'Banner de disponibilidad', placement: 'Global / Header', status: 'Scheduled' },
  ])
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [translating, setTranslating] = useState(false)
  const { translate } = useTranslation()
  const [settings, setSettings] = useState({
    name: 'Yoany Brito',
    email: 'yoanybritocuba@gmail.com',
    location: 'Barcelona, España',
    availability: 'Disponible para proyectos seleccionados',
  })
  const [media, setMedia] = useState<MediaItem[]>([
    { id: 1, name: 'hero-dev-01.png', src: '/hero-dev-01.png', source: 'Upload' },
    { id: 2, name: 'hero-dev-02.png', src: '/hero-dev-02.png', source: 'Upload' },
    { id: 3, name: 'hero-dev-03.png', src: '/hero-dev-03.png', source: 'Upload' },
  ])
  const [mediaUrl, setMediaUrl] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/admin/login')
      else setAuthReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace('/admin/login')
    })
    return () => listener.subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    const loadProjects = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('projects').select('*').order('number')
      if (data) setProjects(data)
      setProjectsLoading(false)
    }
    loadProjects()
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    router.replace('/admin/login')
  }

  const addMediaUrl = () => {
    const value = mediaUrl.trim()
    if (!value) return
    setMedia((current) => [...current, { id: Date.now(), name: value.split('/').pop() || 'imagen-remota', src: value, source: 'Link' }])
    setMediaUrl('')
    flashSaved()
  }
  const removeMedia = (id: number) => {
    setMedia((current) => current.filter((item) => item.id !== id))
    flashSaved()
  }

  const filteredProjects = useMemo(
    () => projects.filter((project) => `${project.title_es} ${project.type_es} ${project.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())),
    [projects, query]
  )
  const flashSaved = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  const openNewProject = () => {
    setEditingProject({ ...emptyProject, number: String(projects.length + 1).padStart(2, '0') })
    setShowProjectForm(true)
  }
  const openEditProject = (project: Project) => {
    setEditingProject(project)
    setShowProjectForm(true)
  }
  const saveProject = async () => {
    if (!editingProject?.title_es.trim()) return
    setTranslating(true)
    const supabase = createClient()

    // Traducir automáticamente los campos que falten
    const base = editingProject
    const title_ca = base.title_ca || await translate(base.title_es, 'ca')
    const title_en = base.title_en || await translate(base.title_es, 'en')
    const type_ca = base.type_ca || await translate(base.type_es, 'ca')
    const type_en = base.type_en || await translate(base.type_es, 'en')

    const includes_es = base.includes_es || []
    const includes_ca = base.includes_ca?.length ? base.includes_ca : await Promise.all(includes_es.map((i) => translate(i, 'ca')))
    const includes_en = base.includes_en?.length ? base.includes_en : await Promise.all(includes_es.map((i) => translate(i, 'en')))

    const excludes_es = base.excludes_es || []
    const excludes_ca = base.excludes_ca?.length ? base.excludes_ca : await Promise.all(excludes_es.map((i) => translate(i, 'ca')))
    const excludes_en = base.excludes_en?.length ? base.excludes_en : await Promise.all(excludes_es.map((i) => translate(i, 'en')))

    const fullProject = {
      ...base,
      title_ca,
      title_en,
      type_ca,
      type_en,
      includes_ca,
      includes_en,
      excludes_ca,
      excludes_en,
    }

    const { id, created_at, updated_at, ...rest } = fullProject as any

    if (editingProject.id === 0) {
      const { data, error } = await supabase.from('projects').insert(rest).select().single()
      if (data) setProjects((current) => [...current, data].sort((a, b) => a.number.localeCompare(b.number)))
      if (error) alert('Error: ' + error.message)
    } else {
      const { error } = await supabase.from('projects').update(rest).eq('id', editingProject.id)
      if (error) alert('Error: ' + error.message)
      else setProjects((current) => current.map((p) => (p.id === editingProject.id ? fullProject : p)))
    }

    setShowProjectForm(false)
    setEditingProject(null)
    setTranslating(false)
    flashSaved()
  }
  const deleteProject = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este proyecto?')) return
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    setProjects((current) => current.filter((project) => project.id !== id))
    flashSaved()
  }
  const togglePublished = async (project: Project) => {
    const supabase = createClient()
    await supabase.from('projects').update({ published: !project.published }).eq('id', project.id)
    setProjects((current) => current.map((p) => (p.id === project.id ? { ...p, published: !p.published } : p)))
  }
  const addPromotion = () => {
    setPromotions((current) => [...current, { id: Date.now(), title: 'Nueva promoción', placement: 'Inicio / Sección', status: 'Scheduled' }])
    flashSaved()
  }
  const removePromotion = (id: number) => {
    setPromotions((current) => current.filter((item) => item.id !== id))
    flashSaved()
  }

  if (!authReady)
    return (
      <main className="admin-shell admin-loading">
        <span className="status-dot" /> Verificando acceso…
      </main>
    )

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand" href="/">
          <span className="brand-mark">/</span>studio<span className="brand-dot">●</span>
        </a>
        <div className="admin-label">Espacio de trabajo</div>
        <nav aria-label="Secciones del admin">
          {menu.map(({ label, icon: Icon }) => (
            <button key={label} className={active === label ? 'selected' : ''} onClick={() => setActive(label)}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/">
            Ver sitio en vivo <ArrowUpRight size={13} />
          </a>
          <button onClick={signOut}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">
              Centro de control / {String(menu.findIndex((item) => item.label === active) + 1).padStart(2, '0')}
            </p>
            <h1>{active}</h1>
          </div>
          <div className="admin-user">
            <span className="admin-avatar">YB</span>
            <span>
              {settings.name}
              <br />
              <small>Administrador</small>
            </span>
          </div>
        </header>

        {saved && (
          <div className="save-toast">
            <Check size={15} /> Cambios guardados
          </div>
        )}

        {active === 'Resumen' && (
          <>
            <div className="admin-stats">
              <div>
                <span>Proyectos publicados</span>
                <strong>{String(projects.filter((p) => p.published).length).padStart(2, '0')}</strong>
                <small>+1 este mes</small>
              </div>
              <div>
                <span>Promociones activas</span>
                <strong>{String(promotions.filter((p) => p.status === 'Active').length).padStart(2, '0')}</strong>
                <small>Todo en orden</small>
              </div>
              <div>
                <span>Mensajes</span>
                <strong>08</strong>
                <small>3 sin leer</small>
              </div>
            </div>
            <div className="admin-grid">
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <p className="admin-kicker">Pulso del contenido</p>
                    <h2>Actividad reciente</h2>
                  </div>
                  <button className="icon-button" aria-label="Ver analíticas">
                    <BarChart3 size={16} />
                  </button>
                </div>
                {['Proyecto QR Menu actualizado', 'Nuevo mensaje de contacto', 'Proyecto Landing publicado', 'Imagen del hero reemplazada'].map((item, i) => (
                  <div className="activity-row" key={item}>
                    <span className="activity-dot" />
                    <div>
                      <strong>{item}</strong>
                      <small>Hace {i + 1} día{i ? 's' : ''}</small>
                    </div>
                    <ArrowUpRight size={15} />
                  </div>
                ))}
              </div>
              <div className="admin-panel quick-panel">
                <p className="admin-kicker">Acciones rápidas</p>
                <h2>Mantén todo claro.</h2>
                <button onClick={openNewProject} className="admin-action">
                  <Plus size={16} /> Nuevo proyecto
                </button>
                <button onClick={() => setActive('Biblioteca')} className="admin-action">
                  <Upload size={16} /> Subir archivo
                </button>
                <button onClick={() => setActive('Ajustes')} className="admin-action">
                  <Settings2 size={16} /> Editar ajustes
                </button>
              </div>
            </div>
          </>
        )}

        {active === 'Proyectos' && (
          <div className="admin-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Contenido del portafolio</p>
                <h2>Biblioteca de proyectos</h2>
              </div>
              <button className="button button-primary admin-button" onClick={openNewProject}>
                <Plus size={16} /> Nuevo proyecto
              </button>
            </div>

            <div className="admin-search">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proyectos..." />
            </div>

            {projectsLoading ? (
              <p>Cargando proyectos...</p>
            ) : (
              <div className="projects-admin-grid">
                {filteredProjects.map((project) => (
                  <article className={`project-admin-card ${!project.published ? 'is-draft' : ''}`} key={project.id}>
                    <div
                      className="project-admin-image"
                      style={{ backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,.65)), url(${project.image})` }}
                    >
                      <span className="project-admin-number">{project.number}</span>
                      {!project.published && <span className="project-admin-badge">BORRADOR</span>}
                    </div>
                    <div className="project-admin-info">
                      <h3>{project.title_es}</h3>
                      <p>{project.type_es}</p>
                      <div className="project-admin-tags">
                        {project.tags?.slice(0, 3).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                      <div className="project-admin-actions">
                        <button onClick={() => openEditProject(project)} aria-label="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => togglePublished(project)} aria-label="Publicar/Ocultar">
                          {project.published ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button onClick={() => deleteProject(project.id)} aria-label="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {active === 'Promociones' && (
          <div className="admin-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Controles de visibilidad</p>
                <h2>Promociones</h2>
              </div>
              <button className="button button-primary admin-button" onClick={addPromotion}>
                <Plus size={16} /> Añadir promoción
              </button>
            </div>
            <div className="promotion-grid">
              {promotions.map((promotion) => (
                <article className="promotion-card" key={promotion.id}>
                  <div className="promotion-icon">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <span className={`status-badge ${promotion.status.toLowerCase()}`}>
                      {promotion.status === 'Active' ? 'Activa' : 'Programada'}
                    </span>
                    <h3>{promotion.title}</h3>
                    <p>{promotion.placement}</p>
                  </div>
                  <button aria-label={`Eliminar ${promotion.title}`} onClick={() => removePromotion(promotion.id)}>
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {active === 'Biblioteca' && (
          <div className="admin-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Recursos visuales</p>
                <h2>Biblioteca de medios</h2>
              </div>
              <label className="button button-primary admin-button upload-button">
                <Upload size={16} /> Subir imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      setMedia((current) => [...current, { id: Date.now(), name: file.name, src: URL.createObjectURL(file), source: 'Upload' }])
                      flashSaved()
                    }
                  }}
                />
              </label>
            </div>
            <div className="media-link-form">
              <input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="Pega una URL de imagen..." aria-label="URL de imagen" />
              <button className="button" onClick={addMediaUrl}>
                <Plus size={15} /> Añadir enlace
              </button>
            </div>
            <div className="media-grid">
              {media.map((item, index) => (
                <div className="media-card" key={item.id}>
                  <div className="media-preview" style={{ backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,.65)), url(${item.src})` }}>
                    <span>0{index + 1}</span>
                  </div>
                  <div className="media-card-info">
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.source === 'Upload' ? 'Subido' : 'Enlace'} / imagen</small>
                    </div>
                    <button aria-label={`Eliminar ${item.name}`} onClick={() => removeMedia(item.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'Presupuestos' && <QuoteConfigSection />}

        {active === 'Ajustes' && (
          <div className="admin-view settings-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Perfil público</p>
                <h2>Ajustes del sitio</h2>
              </div>
              <button className="button button-primary admin-button" onClick={flashSaved}>
                <Check size={16} /> Guardar cambios
              </button>
            </div>
            <div className="settings-form">
              <label>
                Nombre visible
                <input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
              </label>
              <label>
                Email de contacto
                <input type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} />
              </label>
              <label>
                Ubicación
                <input value={settings.location} onChange={(event) => setSettings({ ...settings, location: event.target.value })} />
              </label>
              <label>
                Mensaje de disponibilidad
                <input value={settings.availability} onChange={(event) => setSettings({ ...settings, availability: event.target.value })} />
              </label>
              <label>
                Biografía corta
                <textarea rows={5} defaultValue="Ingeniero web independiente construyendo experiencias rápidas y de alto rendimiento para equipos ambiciosos." />
              </label>
            </div>
          </div>
        )}
      </section>

      {showProjectForm && editingProject && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
            <div className="modal-heading">
              <div>
                <p className="admin-kicker">Editor de proyecto</p>
                <h2 id="project-dialog-title">
                  {editingProject.id === 0 ? 'Nuevo proyecto' : 'Editar proyecto'}
                </h2>
              </div>
              <button onClick={() => setShowProjectForm(false)} aria-label="Cerrar diálogo">
                <X size={18} />
              </button>
            </div>

            <label>
              Número
              <input value={editingProject.number} onChange={(e) => setEditingProject({ ...editingProject, number: e.target.value })} placeholder="01" />
            </label>
            <label>
              Título (ES)
              <input autoFocus value={editingProject.title_es} onChange={(e) => setEditingProject({ ...editingProject, title_es: e.target.value })} placeholder="Menú QR" />
            </label>
            <label>
              Tipo (ES)
              <input value={editingProject.type_es} onChange={(e) => setEditingProject({ ...editingProject, type_es: e.target.value })} placeholder="Carta digital para restaurantes" />
            </label>
            <label>
              Imagen (ruta o URL)
              <input value={editingProject.image} onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })} placeholder="/dev-workspace-03.png" />
            </label>
            <label>
              Color acento
              <input type="text" value={editingProject.accent} onChange={(e) => setEditingProject({ ...editingProject, accent: e.target.value })} placeholder="#39ff9a" />
            </label>
            <label>
              Etiquetas cortas (separadas por coma)
              <input
                value={editingProject.tags.join(', ')}
                onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                placeholder="QR, Products, Mobile"
              />
            </label>

            <label>
              ✅ Qué incluye (una cosa por línea)
              <textarea
                rows={5}
                value={(editingProject.includes_es || []).join('\n')}
                onChange={(e) => setEditingProject({ ...editingProject, includes_es: e.target.value.split('\n').filter((l) => l.trim()) })}
                placeholder={'Menú QR (carta digital)\nQR físico para las mesas\nActualizable por ti mismo'}
              />
              <small style={{ color: 'var(--muted)', fontSize: 11 }}>
                Se traducirá automáticamente al catalán e inglés al guardar.
              </small>
            </label>

            <label>
              ❌ No incluye (una cosa por línea)
              <textarea
                rows={4}
                value={(editingProject.excludes_es || []).join('\n')}
                onChange={(e) => setEditingProject({ ...editingProject, excludes_es: e.target.value.split('\n').filter((l) => l.trim()) })}
                placeholder={'Dominio propio (a cargo del cliente)\nCorreos empresariales (a cargo del cliente)'}
              />
              <small style={{ color: 'var(--muted)', fontSize: 11 }}>
                Se traducirá automáticamente al catalán e inglés al guardar.
              </small>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
              <input type="checkbox" checked={editingProject.published} onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })} />
              Publicado (visible en la web)
            </label>

            <div className="modal-actions">
              <button className="text-button" onClick={() => setShowProjectForm(false)}>Cancelar</button>
              <button className="button button-primary admin-button" onClick={saveProject} disabled={translating}>
                <Check size={15} /> {translating ? 'Guardando y traduciendo...' : 'Guardar y traducir'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

// ============================================
// SECCIÓN DE CONFIGURACIÓN DE PRESUPUESTOS
// ============================================

function QuoteConfigSection() {
  const [blocks, setBlocks] = useState<QuoteBlock[]>([])
  const [options, setOptions] = useState<QuoteOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingOption, setEditingOption] = useState<QuoteOption | null>(null)
  const [showNewOption, setShowNewOption] = useState<string | null>(null)
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({})
  const { translate } = useTranslation()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [blocksRes, optionsRes] = await Promise.all([
        supabase.from('quote_blocks').select('*').order('order_index'),
        supabase.from('quote_options').select('*').order('order_index'),
      ])
      if (blocksRes.data) setBlocks(blocksRes.data as unknown as QuoteBlock[])
      if (optionsRes.data) setOptions(optionsRes.data as unknown as QuoteOption[])
      setLoading(false)
    }
    load()
  }, [])

  const saveOption = async (option: QuoteOption) => {
    setSaving(true)
    try {
      const label_ca = option.label_ca || await translate(option.label_es, 'ca')
      const label_en = option.label_en || await translate(option.label_es, 'en')
      const description_ca = option.description_ca || await translate(option.description_es || '', 'ca')
      const description_en = option.description_en || await translate(option.description_es || '', 'en')
      const features_ca = option.features?.length ? await Promise.all(option.features.map((f) => translate(f, 'ca'))) : []
      const features_en = option.features?.length ? await Promise.all(option.features.map((f) => translate(f, 'en'))) : []
      const fullOption = { ...option, label_ca, label_en, description_ca, description_en }
      const supabase = createClient()
      if (option.id === 0) {
        const { data, error } = await supabase.from('quote_options').insert({
          block_key: option.block_key,
          label_es: option.label_es,
          label_ca,
          label_en,
          description_es: option.description_es,
          description_ca,
          description_en,
          price: option.price,
          unit: option.unit,
          features: option.features,
          features_ca,
          features_en,
          image: option.image,
          order_index: option.order_index,
          active: option.active,
        }).select().single()
        if (data) setOptions((prev) => [...prev, data as unknown as QuoteOption])
        if (error) alert('Error: ' + error.message)
      } else {
        const { error } = await supabase.from('quote_options').update({
          label_es: option.label_es,
          label_ca,
          label_en,
          description_es: option.description_es,
          description_ca,
          description_en,
          price: option.price,
          unit: option.unit,
          features: option.features,
          features_ca,
          features_en,
          image: option.image,
          order_index: option.order_index,
          active: option.active,
        }).eq('id', option.id)
        if (error) alert('Error: ' + error.message)
        else setOptions((prev) => prev.map((o) => (o.id === option.id ? fullOption : o)))
      }
    } catch (e) {
      console.error(e)
      alert('Error guardando: ' + (e as Error).message)
    }
    setEditingOption(null)
    setShowNewOption(null)
    setSaving(false)
  }

  const deleteOption = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta opción?')) return
    const supabase = createClient()
    await supabase.from('quote_options').delete().eq('id', id)
    setOptions((prev) => prev.filter((o) => o.id !== id))
  }

  const toggleActive = async (option: QuoteOption) => {
    const supabase = createClient()
    await supabase.from('quote_options').update({ active: !option.active }).eq('id', option.id)
    setOptions((prev) => prev.map((o) => (o.id === option.id ? { ...o, active: !o.active } : o)))
  }

  if (loading) return <div className="admin-view"><p>Cargando...</p></div>

  return (
    <div className="admin-view">
      <div className="view-toolbar">
        <div>
          <p className="admin-kicker">Configurador de presupuestos</p>
          <h2>Precios y servicios</h2>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8, maxWidth: 500 }}>
            Edita los precios, los nombres y las opciones que aparecen en el configurador público. Los cambios se aplican al instante.
          </p>
        </div>
      </div>

      <div className="quote-admin-blocks">
        {blocks.map((block) => {
          const blockOptions = options.filter((o) => o.block_key === block.key)
          const isOpen = expandedBlocks[block.key] !== false
          return (
            <div key={block.key} className="quote-admin-block">
              <button
                className="quote-admin-block-header"
                onClick={() => setExpandedBlocks((prev) => ({ ...prev, [block.key]: !isOpen }))}
              >
                <div>
                  <h3>{block.title_es}</h3>
                  <small>{blockOptions.length} opciones · {block.type === 'single-choice' ? 'Solo 1' : 'Varias'}</small>
                </div>
                <span>{isOpen ? '▼' : '▶'}</span>
              </button>

              {isOpen && (
                <div className="quote-admin-options">
                  {blockOptions.map((opt) => (
                    <div key={opt.id} className={`quote-admin-option ${!opt.active ? 'is-inactive' : ''}`}>
                      {opt.image && (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            backgroundImage: `url(${opt.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid var(--line)',
                            flex: '0 0 auto',
                          }}
                        />
                      )}
                      <div className="quote-admin-option-info">
                        <strong>{opt.label_es}</strong>
                        <small>{opt.description_es}</small>
                      </div>
                      <div className="quote-admin-option-price">
                        {opt.price === 0 ? 'Gratis' : `${opt.price}${opt.unit}`}
                      </div>
                      <div className="quote-admin-option-actions">
                        <button onClick={() => setEditingOption(opt)} aria-label="Editar"><Pencil size={14} /></button>
                        <button onClick={() => toggleActive(opt)} aria-label="Activar/Desactivar">{opt.active ? '👁️' : '🚫'}</button>
                        <button onClick={() => deleteOption(opt.id)} aria-label="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <button className="admin-action" onClick={() => setShowNewOption(block.key)} style={{ marginTop: 8 }}>
                    <Plus size={14} /> Añadir opción a {block.title_es}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editingOption && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <p className="admin-kicker">Editar opción</p>
                <h2>{editingOption.label_es}</h2>
              </div>
              <button onClick={() => setEditingOption(null)} aria-label="Cerrar"><X size={18} /></button>
            </div>
            <label>Nombre (ES)<input value={editingOption.label_es} onChange={(e) => setEditingOption({ ...editingOption, label_es: e.target.value })} /></label>
            <label>Descripción (ES)<input value={editingOption.description_es || ''} onChange={(e) => setEditingOption({ ...editingOption, description_es: e.target.value })} /></label>
            <label>
              Imagen (URL)
              <input
                value={editingOption.image || ''}
                onChange={(e) => setEditingOption({ ...editingOption, image: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {editingOption.image && (
                <div
                  style={{
                    marginTop: 8,
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    backgroundImage: `url(${editingOption.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid var(--line)',
                  }}
                />
              )}
            </label>
            <label>Precio (€)<input type="number" value={editingOption.price} onChange={(e) => setEditingOption({ ...editingOption, price: Number(e.target.value) })} /></label>
            <label>
              Unidad
              <select value={editingOption.unit} onChange={(e) => setEditingOption({ ...editingOption, unit: e.target.value })}>
                <option value="€">€ (pago único)</option>
                <option value="€/mes">€/mes (suscripción)</option>
              </select>
            </label>
            <label>
              Características (una por línea)
              <textarea rows={5} value={editingOption.features.join('\n')} onChange={(e) => setEditingOption({ ...editingOption, features: e.target.value.split('\n').filter((f) => f.trim()) })} />
            </label>
            <label>Orden<input type="number" value={editingOption.order_index} onChange={(e) => setEditingOption({ ...editingOption, order_index: Number(e.target.value) })} /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
              <input type="checkbox" checked={editingOption.active} onChange={(e) => setEditingOption({ ...editingOption, active: e.target.checked })} />
              Activo (visible en la web)
            </label>
            <div className="modal-actions">
              <button className="text-button" onClick={() => setEditingOption(null)}>Cancelar</button>
              <button className="button button-primary admin-button" onClick={() => saveOption(editingOption)} disabled={saving}>
                <Check size={15} /> {saving ? 'Guardando y traduciendo...' : 'Guardar y traducir'}
              </button>
            </div>
          </section>
        </div>
      )}

      {showNewOption && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <p className="admin-kicker">Nueva opción</p>
                <h2>Bloque: {showNewOption}</h2>
              </div>
              <button onClick={() => setShowNewOption(null)} aria-label="Cerrar"><X size={18} /></button>
            </div>
            <NewOptionForm
              blockKey={showNewOption}
              existingCount={options.filter((o) => o.block_key === showNewOption).length}
              onCancel={() => setShowNewOption(null)}
              onSave={(newOpt) => saveOption(newOpt)}
              saving={saving}
            />
          </section>
        </div>
      )}
    </div>
  )
}

function NewOptionForm({
  blockKey,
  existingCount,
  onCancel,
  onSave,
  saving,
}: {
  blockKey: string
  existingCount: number
  onCancel: () => void
  onSave: (opt: QuoteOption) => void
  saving: boolean
}) {
  const [opt, setOpt] = useState<QuoteOption>({
    id: 0,
    block_key: blockKey,
    label_es: '',
    label_ca: '',
    label_en: '',
    description_es: '',
    description_ca: '',
    description_en: '',
    price: 0,
    unit: '€',
    features: [],
    image: '',
    order_index: existingCount + 1,
    active: true,
  })

  return (
    <>
      <label>Nombre (ES)<input value={opt.label_es} onChange={(e) => setOpt({ ...opt, label_es: e.target.value })} /></label>
      <label>Descripción (ES)<input value={opt.description_es || ''} onChange={(e) => setOpt({ ...opt, description_es: e.target.value })} /></label>
      <label>
        Imagen (URL)
        <input value={opt.image || ''} onChange={(e) => setOpt({ ...opt, image: e.target.value })} placeholder="https://..." />
      </label>
      <label>Precio (€)<input type="number" value={opt.price} onChange={(e) => setOpt({ ...opt, price: Number(e.target.value) })} /></label>
      <label>
        Unidad
        <select value={opt.unit} onChange={(e) => setOpt({ ...opt, unit: e.target.value })}>
          <option value="€">€ (pago único)</option>
          <option value="€/mes">€/mes (suscripción)</option>
        </select>
      </label>
      <label>Características (una por línea)<textarea rows={4} value={opt.features.join('\n')} onChange={(e) => setOpt({ ...opt, features: e.target.value.split('\n').filter((f) => f.trim()) })} /></label>
      <div className="modal-actions">
        <button className="text-button" onClick={onCancel}>Cancelar</button>
        <button className="button button-primary admin-button" onClick={() => onSave(opt)} disabled={saving || !opt.label_es}>
          <Check size={15} /> {saving ? 'Guardando y traduciendo...' : 'Añadir y traducir'}
        </button>
      </div>
    </>
  )
}