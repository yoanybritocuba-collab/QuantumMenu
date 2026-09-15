'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowUpRight,
  BarChart3,
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
} from 'lucide-react'

type Project = { id: number; title: string; type: string; status: 'Published' | 'Draft'; updated: string; tags: string }
type MediaItem = { id: number; name: string; src: string; source: 'Upload' | 'Link' }
type Promotion = { id: number; title: string; placement: string; status: 'Active' | 'Scheduled' }

const menu = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Projects', icon: FileText },
  { label: 'Promotions', icon: Sparkles },
  { label: 'Media library', icon: ImagePlus },
  { label: 'Site settings', icon: Settings2 },
]

const initialProjects: Project[] = [
  { id: 1, title: 'Aether Finance', type: 'Fintech / Product design', status: 'Published', updated: 'Today, 09:42', tags: 'Strategy, Next.js, WebGL' },
  { id: 2, title: 'Mori Objects', type: 'E-commerce / Digital craft', status: 'Published', updated: 'Yesterday', tags: 'Commerce, CMS' },
  { id: 3, title: 'Arc / Climate OS', type: 'Data platform / Engineering', status: 'Draft', updated: '3 days ago', tags: 'Systems, React, Data viz' },
]

export default function AdminPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [active, setActive] = useState('Overview')
  const [projects, setProjects] = useState(initialProjects)
  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 1, title: 'Hero statement', placement: 'Homepage / Hero', status: 'Active' },
    { id: 2, title: 'Availability banner', placement: 'Global / Header', status: 'Scheduled' },
  ])
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [settings, setSettings] = useState({
    name: 'Yoany Brito',
    email: 'yoanybritocuba@gmail.com',
    location: 'Barcelona, Spain',
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

  const signOut = async () => {
    await createClient().auth.signOut()
    router.replace('/admin/login')
  }

  const addMediaUrl = () => {
    const value = mediaUrl.trim()
    if (!value) return
    setMedia((current) => [...current, { id: Date.now(), name: value.split('/').pop() || 'remote-image', src: value, source: 'Link' }])
    setMediaUrl('')
    flashSaved()
  }
  const removeMedia = (id: number) => {
    setMedia((current) => current.filter((item) => item.id !== id))
    flashSaved()
  }

  const filteredProjects = useMemo(
    () => projects.filter((project) => `${project.title} ${project.type} ${project.tags}`.toLowerCase().includes(query.toLowerCase())),
    [projects, query]
  )
  const flashSaved = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  const openNewProject = () => {
    setEditingProject({ id: Date.now(), title: '', type: '', status: 'Draft', updated: 'Just now', tags: '' })
    setShowProjectForm(true)
  }
  const saveProject = () => {
    if (!editingProject?.title.trim() || !editingProject.type.trim()) return
    setProjects((current) =>
      current.some((project) => project.id === editingProject.id)
        ? current.map((project) => (project.id === editingProject.id ? editingProject : project))
        : [editingProject, ...current]
    )
    setShowProjectForm(false)
    setEditingProject(null)
    flashSaved()
  }
  const deleteProject = (id: number) => {
    setProjects((current) => current.filter((project) => project.id !== id))
    flashSaved()
  }
  const addPromotion = () => {
    setPromotions((current) => [...current, { id: Date.now(), title: 'New promotion', placement: 'Homepage / Section', status: 'Scheduled' }])
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
        <div className="admin-label">Workspace</div>
        <nav aria-label="Admin sections">
          {menu.map(({ label, icon: Icon }) => (
            <button key={label} className={active === label ? 'selected' : ''} onClick={() => setActive(label)}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/">
            View live site <ArrowUpRight size={13} />
          </a>
          <button onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">
              Control center / {String(menu.findIndex((item) => item.label === active) + 1).padStart(2, '0')}
            </p>
            <h1>{active}</h1>
          </div>
          <div className="admin-user">
            <span className="admin-avatar">YB</span>
            <span>
              {settings.name}
              <br />
              <small>Administrator</small>
            </span>
          </div>
        </header>

        {saved && (
          <div className="save-toast">
            <Check size={15} /> Changes saved
          </div>
        )}

        {active === 'Overview' && (
          <>
            <div className="admin-stats">
              <div>
                <span>Published projects</span>
                <strong>{String(projects.filter((project) => project.status === 'Published').length).padStart(2, '0')}</strong>
                <small>+1 this month</small>
              </div>
              <div>
                <span>Active promotions</span>
                <strong>{String(promotions.filter((promotion) => promotion.status === 'Active').length).padStart(2, '0')}</strong>
                <small>All systems nominal</small>
              </div>
              <div>
                <span>Messages</span>
                <strong>08</strong>
                <small>3 unread</small>
              </div>
            </div>
            <div className="admin-grid">
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <p className="admin-kicker">Content pulse</p>
                    <h2>Recent activity</h2>
                  </div>
                  <button className="icon-button" aria-label="View analytics">
                    <BarChart3 size={16} />
                  </button>
                </div>
                {['Aether Finance project updated', 'New message from martin@arc.co', 'Mori Objects promotion published', 'Hero image replaced'].map((item, i) => (
                  <div className="activity-row" key={item}>
                    <span className="activity-dot" />
                    <div>
                      <strong>{item}</strong>
                      <small>{i + 1} day{i ? 's' : ''} ago</small>
                    </div>
                    <ArrowUpRight size={15} />
                  </div>
                ))}
              </div>
              <div className="admin-panel quick-panel">
                <p className="admin-kicker">Quick actions</p>
                <h2>Keep the signal clear.</h2>
                <button onClick={openNewProject} className="admin-action">
                  <Plus size={16} /> New project
                </button>
                <button onClick={() => setActive('Media library')} className="admin-action">
                  <Upload size={16} /> Upload media
                </button>
                <button onClick={() => setActive('Site settings')} className="admin-action">
                  <Settings2 size={16} /> Edit site settings
                </button>
              </div>
            </div>
          </>
        )}

        {active === 'Projects' && (
          <div className="admin-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Portfolio content</p>
                <h2>Project library</h2>
              </div>
              <button className="button button-primary admin-button" onClick={openNewProject}>
                <Plus size={16} /> New project
              </button>
            </div>
            <div className="admin-search">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." />
            </div>
            <div className="project-table">
              {filteredProjects.map((project) => (
                <div className="project-row" key={project.id}>
                  <div className="project-thumb">
                    <span>{project.title.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="row-main">
                    <strong>{project.title}</strong>
                    <small>{project.type}</small>
                  </div>
                  <span className={`status-badge ${project.status.toLowerCase()}`}>{project.status}</span>
                  <small className="row-date">{project.updated}</small>
                  <div className="row-actions">
                    <button
                      aria-label={`Edit ${project.title}`}
                      onClick={() => {
                        setEditingProject(project)
                        setShowProjectForm(true)
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button aria-label={`Delete ${project.title}`} onClick={() => deleteProject(project.id)}>
                      <Trash2 size={15} />
                    </button>
                    <button aria-label="More actions">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'Promotions' && (
          <div className="admin-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Visibility controls</p>
                <h2>Promotions</h2>
              </div>
              <button className="button button-primary admin-button" onClick={addPromotion}>
                <Plus size={16} /> Add promotion
              </button>
            </div>
            <div className="promotion-grid">
              {promotions.map((promotion) => (
                <article className="promotion-card" key={promotion.id}>
                  <div className="promotion-icon">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <span className={`status-badge ${promotion.status.toLowerCase()}`}>{promotion.status}</span>
                    <h3>{promotion.title}</h3>
                    <p>{promotion.placement}</p>
                  </div>
                  <button aria-label={`Delete ${promotion.title}`} onClick={() => removePromotion(promotion.id)}>
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {active === 'Media library' && (
          <div className="admin-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Visual assets</p>
                <h2>Media library</h2>
              </div>
              <label className="button button-primary admin-button upload-button">
                <Upload size={16} /> Upload image
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
              <input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="Paste an image URL..." aria-label="Image URL" />
              <button className="button" onClick={addMediaUrl}>
                <Plus size={15} /> Add link
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
                      <small>{item.source} / image asset</small>
                    </div>
                    <button aria-label={`Delete ${item.name}`} onClick={() => removeMedia(item.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'Site settings' && (
          <div className="admin-view settings-view">
            <div className="view-toolbar">
              <div>
                <p className="admin-kicker">Public profile</p>
                <h2>Site settings</h2>
              </div>
              <button className="button button-primary admin-button" onClick={flashSaved}>
                <Check size={16} /> Save changes
              </button>
            </div>
            <div className="settings-form">
              <label>
                Display name
                <input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
              </label>
              <label>
                Contact email
                <input type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} />
              </label>
              <label>
                Location
                <input value={settings.location} onChange={(event) => setSettings({ ...settings, location: event.target.value })} />
              </label>
              <label>
                Availability message
                <input value={settings.availability} onChange={(event) => setSettings({ ...settings, availability: event.target.value })} />
              </label>
              <label>
                Short bio
                <textarea rows={5} defaultValue="Independent web engineer building sharp, high-performance experiences for ambitious teams." />
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
                <p className="admin-kicker">Project editor</p>
                <h2 id="project-dialog-title">
                  {projects.some((project) => project.id === editingProject.id) ? 'Edit project' : 'New project'}
                </h2>
              </div>
              <button onClick={() => setShowProjectForm(false)} aria-label="Close dialog">
                <X size={18} />
              </button>
            </div>
            <label>
              Project name
              <input autoFocus value={editingProject.title} onChange={(event) => setEditingProject({ ...editingProject, title: event.target.value })} />
            </label>
            <label>
              Project type
              <input value={editingProject.type} onChange={(event) => setEditingProject({ ...editingProject, type: event.target.value })} />
            </label>
            <label>
              Tags
              <input value={editingProject.tags} onChange={(event) => setEditingProject({ ...editingProject, tags: event.target.value })} />
            </label>
            <label>
              Status
              <select value={editingProject.status} onChange={(event) => setEditingProject({ ...editingProject, status: event.target.value as Project['status'] })}>
                <option>Draft</option>
                <option>Published</option>
              </select>
            </label>
            <div className="modal-actions">
              <button className="text-button" onClick={() => setShowProjectForm(false)}>
                Cancel
              </button>
              <button className="button button-primary admin-button" onClick={saveProject}>
                <Check size={15} /> Save project
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}