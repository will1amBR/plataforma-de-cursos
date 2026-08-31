import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, MessageSquare, User, Home, ShieldAlert, GraduationCap } from 'lucide-react'

export const BottomNav: React.FC = () => {
  const { isAuthenticated, isAdmin, isInstructor } = useAuth()

  const navItems = [
    { label: 'Início', path: '/', icon: Home },
    { label: 'Cursos', path: '/courses', icon: BookOpen },
    { label: 'Fórum', path: '/forum', icon: MessageSquare },
  ]

  if (isInstructor || isAdmin) {
    navItems.push({ label: 'Professor', path: '/professor', icon: GraduationCap })
  }

  navItems.push({
    label: isAuthenticated ? 'Perfil' : 'Entrar',
    path: isAuthenticated ? '/profile' : '/auth',
    icon: User,
  })

  if (isAdmin) {
    navItems.push({ label: 'Admin', path: '/admin', icon: ShieldAlert })
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border px-2 py-2 flex items-center justify-around font-raleway">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}
