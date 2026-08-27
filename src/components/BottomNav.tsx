import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, MessageSquare, User, Home, ShieldAlert } from 'lucide-react'

export const BottomNav: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth()

  const navItems = [
    { label: 'Início', path: '/', icon: Home },
    { label: 'Cursos', path: '/courses', icon: BookOpen },
    { label: 'Fórum', path: '/forum', icon: MessageSquare },
    {
      label: isAuthenticated ? 'Perfil' : 'Entrar',
      path: isAuthenticated ? '/profile' : '/auth',
      icon: User,
    },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: ShieldAlert }] : []),
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border/80 px-2 py-1.5 shadow-lg safe-bottom">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-medium transition-all ${
                  isActive
                    ? 'text-primary font-bold scale-105'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
