/* Layout Component - A component that wraps the main content of the app
   - Use this file to add a header, footer, or other elements that should be present on every page
   - This component is used in the App.tsx file to wrap the main content of the app */

import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { BottomNav } from '@/components/BottomNav'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
