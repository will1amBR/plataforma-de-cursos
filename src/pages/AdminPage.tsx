import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, type UserRecord } from '@/contexts/AuthContext'
import {
  getAdminStats,
  getAllCoursesAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
  getAllLessonsAdmin,
  createLessonAdmin,
  updateLessonAdmin,
  deleteLessonAdmin,
  getAllUsersAdmin,
  updateUserRoleAdmin,
  getAllForumTopicsAdmin,
  getAllForumCommentsAdmin,
  deleteForumTopicAdmin,
  deleteForumCommentAdmin,
  type AdminStats,
} from '@/services/admin'
import { getCategories } from '@/services/courses'
import type { Course, Lesson, Category, ForumTopic, ForumComment } from '@/types'
import {
  ShieldAlert,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  Search,
  Filter,
  Layers,
  FileText,
  BarChart3,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'

export const AdminPage: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Selected course for lesson filter
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<string>('all')

  // Course Modal Form
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    long_description: '',
    category_id: '',
    level: 'iniciante',
    duration: 10,
    price: 0,
    intro_video_url: '',
    published: true,
    featured: false,
  })

  // Lesson Modal Form
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState({
    course_id: '',
    title: '',
    description: '',
    video_url: '',
    module: 'Módulo 1',
    order: 1,
    duration: 15,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }
    if (!isAdmin) {
      toast({
        title: 'Acesso Restrito',
        description: 'Você precisa de privilégios de administrador.',
        variant: 'destructive',
      })
      navigate('/')
      return
    }

    loadAllAdminData()
  }, [isAuthenticated, isAdmin, navigate])

  const loadAllAdminData = async () => {
    setLoading(true)
    try {
      const [statsData, coursesData, lessonsData, usersData, topicsData, catsData] =
        await Promise.all([
          getAdminStats(),
          getAllCoursesAdmin(),
          getAllLessonsAdmin(),
          getAllUsersAdmin(),
          getAllForumTopicsAdmin(),
          getCategories(),
        ])
      setStats(statsData)
      setCourses(coursesData)
      setLessons(lessonsData)
      setUsers(usersData)
      setForumTopics(topicsData)
      setCategories(catsData)
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  // COURSE ACTIONS
  const handleOpenCourseDialog = (courseToEdit?: Course) => {
    if (courseToEdit) {
      setEditingCourseId(courseToEdit.id)
      setCourseForm({
        title: courseToEdit.title,
        slug: courseToEdit.slug,
        description: courseToEdit.description || '',
        long_description: courseToEdit.long_description || '',
        category_id: courseToEdit.category_id || '',
        level: courseToEdit.level || 'iniciante',
        duration: courseToEdit.duration || 10,
        price: courseToEdit.price || 0,
        intro_video_url: courseToEdit.intro_video_url || '',
        published: !!courseToEdit.published,
        featured: !!courseToEdit.featured,
      })
    } else {
      setEditingCourseId(null)
      setCourseForm({
        title: '',
        slug: '',
        description: '',
        long_description: '',
        category_id: categories[0]?.id || '',
        level: 'iniciante',
        duration: 10,
        price: 0,
        intro_video_url: '',
        published: true,
        featured: false,
      })
    }
    setIsCourseDialogOpen(true)
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = {
        ...courseForm,
        slug: courseForm.slug.trim() || courseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        instructor_id: user?.id,
      }

      if (editingCourseId) {
        await updateCourseAdmin(editingCourseId, payload)
        toast({ title: 'Curso atualizado com sucesso!' })
      } else {
        await createCourseAdmin(payload)
        toast({ title: 'Curso criado com sucesso!' })
      }
      setIsCourseDialogOpen(false)
      loadAllAdminData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar curso',
        description: err?.message || 'Verifique os campos.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso e seus dados?')) return
    try {
      await deleteCourseAdmin(courseId)
      toast({ title: 'Curso excluído!' })
      loadAllAdminData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir curso', variant: 'destructive' })
    }
  }

  // LESSON ACTIONS
  const handleOpenLessonDialog = (lessonToEdit?: Lesson) => {
    if (lessonToEdit) {
      setEditingLessonId(lessonToEdit.id)
      setLessonForm({
        course_id: lessonToEdit.course_id,
        title: lessonToEdit.title,
        description: lessonToEdit.description || '',
        video_url: lessonToEdit.video_url || '',
        module: lessonToEdit.module || 'Módulo 1',
        order: lessonToEdit.order || 1,
        duration: lessonToEdit.duration || 15,
      })
    } else {
      setEditingLessonId(null)
      setLessonForm({
        course_id:
          selectedCourseForLessons !== 'all' ? selectedCourseForLessons : courses[0]?.id || '',
        title: '',
        description: '',
        video_url: '',
        module: 'Módulo 1',
        order: lessons.length + 1,
        duration: 15,
      })
    }
    setIsLessonDialogOpen(true)
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingLessonId) {
        await updateLessonAdmin(editingLessonId, lessonForm)
        toast({ title: 'Lição atualizada com sucesso!' })
      } else {
        await createLessonAdmin(lessonForm)
        toast({ title: 'Lição adicionada com sucesso!' })
      }
      setIsLessonDialogOpen(false)
      loadAllAdminData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar lição',
        description: err?.message || 'Verifique o link do vídeo e campos obrigatórios.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Excluir esta lição permanentemente?')) return
    try {
      await deleteLessonAdmin(lessonId)
      toast({ title: 'Lição excluída!' })
      loadAllAdminData()
    } catch (err) {
      toast({ title: 'Erro ao excluir lição', variant: 'destructive' })
    }
  }

  // USER MANAGEMENT
  const handleUpdateUserRole = async (
    targetUserId: string,
    newRole: 'admin' | 'moderator' | 'aluno',
  ) => {
    try {
      await updateUserRoleAdmin(targetUserId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u)))
      toast({ title: 'Permissão atualizada!' })
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar permissão', variant: 'destructive' })
    }
  }

  const handleToggleUserStatus = async (targetUserId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked'
    try {
      await updateUserRoleAdmin(
        targetUserId,
        users.find((u) => u.id === targetUserId)?.role || 'aluno',
        newStatus,
      )
      setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, status: newStatus } : u)))
      toast({ title: `Usuário ${newStatus === 'blocked' ? 'bloqueado' : 'ativado'}` })
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  // FORUM MODERATION
  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Excluir tópico do fórum?')) return
    try {
      await deleteForumTopicAdmin(topicId)
      setForumTopics((prev) => prev.filter((t) => t.id !== topicId))
      toast({ title: 'Tópico moderado e removido' })
    } catch (err) {
      toast({ title: 'Erro ao remover tópico', variant: 'destructive' })
    }
  }

  const filteredLessons =
    selectedCourseForLessons === 'all'
      ? lessons
      : lessons.filter((l) => l.course_id === selectedCourseForLessons)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Carregando painel administrativo...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 flex-1">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Gestão & Controle Geral</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Painel Administrativo EAD
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Gerencie cursos, lições em vídeo, alunos, permissões e moderação da plataforma Ronald
            McDonald.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-11 p-1 bg-muted/80 rounded-2xl">
          <TabsTrigger value="overview" className="text-xs font-semibold gap-1.5 rounded-xl">
            <BarChart3 className="w-3.5 h-3.5" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="courses" className="text-xs font-semibold gap-1.5 rounded-xl">
            <BookOpen className="w-3.5 h-3.5" />
            Cursos ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="lessons" className="text-xs font-semibold gap-1.5 rounded-xl">
            <Layers className="w-3.5 h-3.5" />
            Lições ({lessons.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs font-semibold gap-1.5 rounded-xl">
            <Users className="w-3.5 h-3.5" />
            Usuários ({users.length})
          </TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs font-semibold gap-1.5 rounded-xl">
            <MessageSquare className="w-3.5 h-3.5" />
            Moderação ({forumTopics.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW / STATS */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total de Alunos</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-foreground">{stats?.totalUsers || 0}</p>
              <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Comunidade ativa
              </p>
            </Card>

            <Card className="border shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total de Cursos</span>
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-black text-foreground">{stats?.totalCourses || 0}</p>
              <p className="text-[11px] text-muted-foreground">Publicados e rascunhos</p>
            </Card>

            <Card className="border shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Matrículas Realizadas</span>
                <GraduationCap className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-foreground">{stats?.totalEnrollments || 0}</p>
              <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold">
                Engajamento contínuo
              </p>
            </Card>

            <Card className="border shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Certificados Emitidos</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-foreground">{stats?.totalCertificates || 0}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                Conclusões validadas
              </p>
            </Card>
          </div>

          {/* Popular Courses & Engagement Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Cursos Mais Populares</CardTitle>
                <CardDescription className="text-xs">
                  Ranking por número de matrículas de alunos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.popularCourses?.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary w-4">{i + 1}.</span>
                      <span className="font-semibold text-foreground line-clamp-1">{c.title}</span>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                      {c.enrollment_count || 0} alunos
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Atividades e Engajamento</CardTitle>
                <CardDescription className="text-xs">
                  Resumo das interações na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between">
                  <span>Tópicos criados no Fórum</span>
                  <span className="font-bold">{stats?.totalForumTopics || 0}</span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between">
                  <span>Média de Avaliação Geral</span>
                  <span className="font-bold text-amber-500">4.8 / 5.0 ⭐</span>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between">
                  <span>Aulas cadastradas em vídeo</span>
                  <span className="font-bold">{lessons.length} aulas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: MANAGE COURSES */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Listagem de Cursos</h3>
            <Button
              onClick={() => handleOpenCourseDialog()}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Novo Curso
            </Button>
          </div>

          <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3.5">Título</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5">Nível</th>
                    <th className="p-3.5">Duração</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-bold text-foreground max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {c.expand?.category_id?.name || 'Geral'}
                      </td>
                      <td className="p-3.5 capitalize">{c.level || 'iniciante'}</td>
                      <td className="p-3.5">{c.duration || 10}h</td>
                      <td className="p-3.5">
                        <Badge
                          variant={c.published ? 'default' : 'secondary'}
                          className={`text-[10px] ${c.published ? 'bg-green-600 text-white' : ''}`}
                        >
                          {c.published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenCourseDialog(c)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => handleDeleteCourse(c.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: MANAGE LESSONS */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Label className="text-xs font-semibold">Filtrar por Curso:</Label>
              <Select value={selectedCourseForLessons} onValueChange={setSelectedCourseForLessons}>
                <SelectTrigger className="text-xs w-60 rounded-xl">
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => handleOpenLessonDialog()}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Adicionar Lição
            </Button>
          </div>

          <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3.5">Ordem</th>
                    <th className="p-3.5">Título da Lição</th>
                    <th className="p-3.5">Módulo</th>
                    <th className="p-3.5">Vídeo (Google Drive / URL)</th>
                    <th className="p-3.5">Duração</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLessons.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-bold">{l.order || 1}</td>
                      <td className="p-3.5 font-semibold text-foreground max-w-xs truncate">
                        {l.title}
                      </td>
                      <td className="p-3.5 text-muted-foreground">{l.module || 'Módulo 1'}</td>
                      <td className="p-3.5 max-w-xs truncate font-mono text-[11px] text-muted-foreground">
                        {l.video_url}
                      </td>
                      <td className="p-3.5">{l.duration || 15} min</td>
                      <td className="p-3.5 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenLessonDialog(l)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => handleDeleteLesson(l.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: MANAGE USERS */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Usuários Cadastrados</h3>
          </div>

          <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3.5">Nome / E-mail</th>
                    <th className="p-3.5">Papel (Permissão)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Criado em</th>
                    <th className="p-3.5 text-right">Alterar Papel</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-foreground">{u.name || 'Sem nome'}</p>
                        <p className="text-muted-foreground text-[11px]">{u.email}</p>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          className={`text-[10px] uppercase font-bold ${
                            u.role === 'admin'
                              ? 'bg-red-600 text-white'
                              : u.role === 'moderator'
                                ? 'bg-amber-600 text-white'
                                : 'bg-muted text-foreground'
                          }`}
                        >
                          {u.role || 'aluno'}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={u.status === 'blocked' ? 'destructive' : 'outline'}
                          className="text-[10px]"
                        >
                          {u.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(u.created).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Select
                          value={u.role || 'aluno'}
                          onValueChange={(val: any) => handleUpdateUserRole(u.id, val)}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs inline-flex">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aluno">Aluno</SelectItem>
                            <SelectItem value="moderator">Moderador</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleToggleUserStatus(u.id, u.status || 'active')}
                        >
                          {u.status === 'blocked' ? 'Ativar' : 'Bloquear'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: MODERATION */}
        <TabsContent value="moderation" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Moderação de Tópicos do Fórum</h3>
          </div>

          <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground uppercase font-semibold border-b">
                  <tr>
                    <th className="p-3.5">Título do Tópico</th>
                    <th className="p-3.5">Autor</th>
                    <th className="p-3.5">Respostas</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {forumTopics.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-foreground">{t.title}</p>
                        <p className="text-muted-foreground text-[11px] line-clamp-1">
                          {t.content}
                        </p>
                      </td>
                      <td className="p-3.5">{t.expand?.author_id?.name || 'Aluno'}</td>
                      <td className="p-3.5">{t.reply_count || 0}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={t.hidden ? 'destructive' : 'outline'}
                          className="text-[10px]"
                        >
                          {t.hidden ? 'Oculto' : 'Visível'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                          onClick={() => handleDeleteTopic(t.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: CREATE / EDIT COURSE */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveCourse}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {editingCourseId ? 'Editar Curso' : 'Criar Novo Curso'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Título do Curso</Label>
                <Input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Categoria</Label>
                  <Select
                    value={courseForm.category_id}
                    onValueChange={(val) => setCourseForm({ ...courseForm, category_id: val })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Selecione categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nível</Label>
                  <Select
                    value={courseForm.level}
                    onValueChange={(val) => setCourseForm({ ...courseForm, level: val })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Breve Descrição</Label>
                <Textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="text-xs min-h-[60px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Descrição Detalhada / Conteúdo Programático
                </Label>
                <Textarea
                  value={courseForm.long_description}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, long_description: e.target.value })
                  }
                  className="text-xs min-h-[100px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Link do Vídeo Introdutório (Google Drive ou YouTube)
                </Label>
                <Input
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={courseForm.intro_video_url}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, intro_video_url: e.target.value })
                  }
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={courseForm.published}
                    onCheckedChange={(checked) =>
                      setCourseForm({ ...courseForm, published: checked })
                    }
                  />
                  <Label className="text-xs font-semibold">Publicado (Visível aos alunos)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={courseForm.featured}
                    onCheckedChange={(checked) =>
                      setCourseForm({ ...courseForm, featured: checked })
                    }
                  />
                  <Label className="text-xs font-semibold">Destaque na Página Inicial</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCourseDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Salvar Curso
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: CREATE / EDIT LESSON */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveLesson}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {editingLessonId ? 'Editar Lição' : 'Adicionar Nova Lição'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Curso</Label>
                <Select
                  value={lessonForm.course_id}
                  onValueChange={(val) => setLessonForm({ ...lessonForm, course_id: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Título da Lição</Label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Módulo</Label>
                  <Input
                    value={lessonForm.module}
                    onChange={(e) => setLessonForm({ ...lessonForm, module: e.target.value })}
                    placeholder="Módulo 1"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Ordem Sequencial</Label>
                  <Input
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, order: Number(e.target.value) })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Link do Vídeo (Google Drive / YouTube)
                </Label>
                <Input
                  placeholder="https://drive.google.com/file/d/1a2b3c4d5e/view"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  required
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Suporta links diretos do Google Drive ou YouTube (serão transformados em embed
                  automaticamente).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Descrição / Observações da Aula</Label>
                <Textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="text-xs min-h-[70px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLessonDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Salvar Lição
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
