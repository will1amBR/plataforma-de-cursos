import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { RMHCLogo } from '@/components/RMHCLogo'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/user'
import type { NotificationItem } from '@/types'
import {
  BookOpen,
  MessageSquare,
  User,
  Shield,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  GraduationCap,
  Menu,
  CheckCircle2,
  Award,
  Home,
  Info,
  Mail,
  ChevronRight,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isInstructor, logout, getUserAvatarUrl } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getUserNotifications().then((list) => {
        setNotifications(list)
        setUnreadCount(list.filter((n) => !n.read).length)
      })
    }
  }, [isAuthenticated, user?.id, location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`)
      setSheetOpen(false)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(notifications)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id)
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))
    }
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navLinks = [
    { label: 'Início', path: '/', icon: Home, description: 'Página inicial e destaques' },
    {
      label: 'Cursos',
      path: '/courses',
      icon: BookOpen,
      description: 'Catálogo de formações gratuitas',
    },
    {
      label: 'Fórum',
      path: '/forum',
      icon: MessageSquare,
      description: 'Tire dúvidas e interaja com a comunidade',
    },
    {
      label: 'Sobre',
      path: '/sobre',
      icon: Info,
      description: 'Conheça o Instituto Ronald McDonald',
    },
    {
      label: 'Contato',
      path: '/contato',
      icon: Mail,
      description: 'Fale com nossa equipe de suporte',
    },
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
    setSheetOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center group focus:outline-none shrink-0"
          aria-label="Página Inicial - Instituto Ronald McDonald"
        >
          <RMHCLogo variant="horizontal" size="md" subtext="Educação a Distância" />
        </Link>

        {/* Right Section: Theme Toggle, Notifications, Auth CTA Buttons and Hamburger Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Alternar Tema Claro/Escuro"
            aria-label="Alternar Tema Claro/Escuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications (if authenticated) */}
          {isAuthenticated && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full relative text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Notificações"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#DA291C] rounded-full ring-2 ring-background animate-pulse" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 shadow-lg">
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                  <span className="font-semibold text-sm">Notificações</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 text-sm cursor-pointer hover:bg-muted/50 transition-colors flex gap-2.5 ${
                          !n.read ? 'bg-primary/5 font-medium' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'certificate' ? (
                            <Award className="w-4 h-4 text-amber-500" />
                          ) : n.type === 'course' ? (
                            <GraduationCap className="w-4 h-4 text-blue-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">
                            {n.title || 'Notificação'}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* User Status / Login & Register buttons */}
          {isAuthenticated ? (
            <button
              onClick={() => handleNavigate('/profile')}
              className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-[#DA291C]/20 hover:ring-[#DA291C] transition-all focus:outline-none"
              title="Ir para Meu Perfil"
              aria-label="Perfil do Usuário"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={getUserAvatarUrl(user)} alt={user?.name || 'Usuário'} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || 'RM'}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth?mode=login')}
                className="text-xs sm:text-sm font-medium h-9 px-3 text-foreground hover:bg-muted"
              >
                Entrar
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-[#DA291C] hover:bg-[#b81d12] text-white font-semibold text-xs sm:text-sm h-9 px-3.5 sm:px-4 rounded-xl shadow-sm transition-all"
              >
                Cadastrar
              </Button>
            </div>
          )}

          {/* Unified Hamburger Menu Trigger (clean header for both desktop and mobile) */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-border/80 hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-colors shrink-0"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
              {/* Sheet Header */}
              <SheetHeader className="p-5 border-b text-left bg-muted/20">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-base font-bold font-raleway flex items-center gap-2">
                    <RMHCLogo variant="mark-only" size="sm" />
                    <span>Navegação RMHC</span>
                  </SheetTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Plataforma de Educação a Distância do Instituto Ronald McDonald
                </p>
              </SheetHeader>

              {/* Sheet Body with Search and Navigation Links */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Search within Drawer */}
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar formações e aulas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 h-10 text-sm rounded-xl bg-muted/50 border-border focus-visible:ring-primary"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Buscar"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {/* User quick card inside drawer (if authenticated) */}
                {isAuthenticated && user && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                        <AvatarImage src={getUserAvatarUrl(user)} alt={user.name || 'Usuário'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {user.name?.slice(0, 2).toUpperCase() || 'RM'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {user.role && (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] font-bold uppercase border-primary/30 text-primary"
                        >
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Navigation Links */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                    Menu Principal
                  </p>
                  {navLinks.map((link) => {
                    const active = isActive(link.path)
                    const IconComponent = link.icon
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setSheetOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                          active
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-foreground hover:bg-muted font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              active
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm block">{link.label}</span>
                            <span className="text-[11px] text-muted-foreground block line-clamp-1 font-normal">
                              {link.description}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                            active ? 'text-primary' : 'text-muted-foreground/60'
                          }`}
                        />
                      </Link>
                    )
                  })}
                </div>

                {/* Authenticated user specific links */}
                {isAuthenticated && (
                  <div className="space-y-1 pt-2">
                    <Separator className="my-2" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                      Sua Área de Aprendizado
                    </p>
                    <Link
                      to="/profile"
                      onClick={() => setSheetOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                        isActive('/profile')
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground hover:bg-muted font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm block">Meu Perfil & Certificados</span>
                          <span className="text-[11px] text-muted-foreground block font-normal">
                            Acompanhe cursos, conquistas e certificados
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}

                {/* Conditional Roles: Professor & Admin */}
                {(isInstructor || isAdmin) && (
                  <div className="space-y-1 pt-2">
                    <Separator className="my-2" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                      Gestão & Ensino
                    </p>

                    <Link
                      to="/professor"
                      onClick={() => setSheetOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                        isActive('/professor')
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground hover:bg-muted font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm block font-semibold flex items-center gap-1.5">
                            Área do Professor
                            <Badge className="bg-[#FFC72C] hover:bg-[#FFC72C] text-neutral-950 font-bold text-[9px] px-1.5 py-0">
                              Docente
                            </Badge>
                          </span>
                          <span className="text-[11px] text-muted-foreground block font-normal">
                            Tarefas, correções e dúvidas de alunos
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setSheetOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                          isActive('/admin')
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-foreground hover:bg-muted font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#DA291C] text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm block font-semibold text-primary flex items-center gap-1.5">
                              Painel Admin
                              <Badge className="bg-[#DA291C] text-white font-bold text-[9px] px-1.5 py-0">
                                Total
                              </Badge>
                            </span>
                            <span className="text-[11px] text-muted-foreground block font-normal">
                              Cursos, usuários, relatórios e métricas
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Sheet Footer with Login/Logout CTA */}
              <div className="p-4 border-t bg-muted/10">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout()
                      setSheetOpen(false)
                    }}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 justify-center h-10 rounded-xl font-semibold text-xs sm:text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleNavigate('/auth?mode=login')}
                      className="w-full rounded-xl text-xs sm:text-sm font-semibold"
                    >
                      <LogIn className="w-3.5 h-3.5 mr-1.5" />
                      Entrar
                    </Button>
                    <Button
                      onClick={() => handleNavigate('/auth?mode=signup')}
                      className="w-full bg-[#DA291C] hover:bg-[#b81d12] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Cadastrar
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
