import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
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
  ShieldAlert,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  GraduationCap,
  Menu,
  X,
  CheckCircle2,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isModerator, logout, getUserAvatarUrl } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      setMobileMenuOpen(false)
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

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Cursos', path: '/courses' },
    { label: 'Fórum', path: '/forum' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DA291C] to-[#b81d12] flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            {/* Ronald Emblem M */}
            <span className="text-[#FFC72C] font-black text-2xl leading-none select-none drop-shadow">
              M
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
              Instituto Ronald McDonald
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Plataforma EAD
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          {isAuthenticated && (
            <Link
              to="/profile"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/profile'
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Meus Cursos
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/admin')
                  ? 'text-white bg-primary font-semibold shadow-sm'
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Painel Admin</span>
            </Link>
          )}
        </nav>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center relative max-w-xs w-full"
        >
          <Input
            type="search"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 h-9 text-sm rounded-full bg-muted/60 border-muted-foreground/20 focus-visible:ring-primary"
          />
          <button
            type="submit"
            className="absolute right-2.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Actions & User Menu */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            title="Alternar Tema Claro/Escuro"
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
                  className="h-9 w-9 rounded-full relative text-muted-foreground hover:text-foreground"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-background animate-pulse" />
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

          {/* User Avatar Dropdown or Login Button */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-primary/20 hover:ring-primary transition-all focus:outline-none">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getUserAvatarUrl(user)} alt={user?.name || 'Usuário'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() || 'RM'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user?.name || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    {user?.role && (
                      <Badge
                        variant="outline"
                        className="w-fit text-[10px] mt-1 capitalize border-primary/30 text-primary"
                      >
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile?tab=courses')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Meus Cursos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/forum')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Fórum da Comunidade
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate('/admin')}
                      className="text-primary font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Painel Administrativo
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth?mode=login')}
                className="text-xs md:text-sm"
              >
                Entrar
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-primary hover:bg-primary/90 text-white font-medium text-xs md:text-sm shadow-sm"
              >
                Cadastrar
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3 animate-slide-down">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <Input
              type="search"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 h-9 text-sm"
            />
            <button type="submit" className="absolute right-2.5 text-muted-foreground">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
              >
                Meu Perfil & Certificados
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10"
              >
                Painel Administrativo
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
