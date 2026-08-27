import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  isDark: false,
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light'
  })

  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let resolvedIsDark = false
    if (theme === 'system') {
      resolvedIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      resolvedIsDark = theme === 'dark'
    }

    if (resolvedIsDark) {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
    setIsDark(resolvedIsDark)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
