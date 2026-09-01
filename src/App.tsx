/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Layout from '@/components/Layout'
import NotFound from '@/pages/NotFound'

import { DashboardPage } from '@/pages/DashboardPage'
import { AuthPage } from '@/pages/AuthPage'
import { CoursesPage } from '@/pages/CoursesPage'
import { CourseDetailsPage } from '@/pages/CourseDetailsPage'
import { CoursePlayerPage } from '@/pages/CoursePlayerPage'
import { ForumPage } from '@/pages/ForumPage'
import { ForumTopicDetailPage } from '@/pages/ForumTopicDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { TeacherPage } from '@/pages/TeacherPage'
import { AdminPage } from '@/pages/AdminPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:slugOrId" element={<CourseDetailsPage />} />
              <Route path="/courses/:slugOrId/learn" element={<CoursePlayerPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/:id" element={<ForumTopicDetailPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/professor" element={<TeacherPage />} />
              <Route path="/instrutor" element={<TeacherPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
)

export default App
