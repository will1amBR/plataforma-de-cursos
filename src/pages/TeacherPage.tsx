import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  getInstructorCourses,
  getInstructorAllTasks,
  getInstructorAllQuestions,
  createTask,
  updateTask,
  deleteTask,
  getSubmissionsByTask,
  gradeSubmission,
  answerQuestion,
} from '@/services/teacher'
import type { Course, Task, TaskSubmission, CourseQuestion } from '@/types'
import { getCourseThumbnailUrl } from '@/types'
import pb from '@/lib/pocketbase/client'
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Edit,
  Trash2,
  Send,
  Star,
  Award,
  Calendar,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  UserCheck,
  Save,
  CheckCircle,
  AlertCircle,
  Info,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { RMHCLogo } from '@/components/RMHCLogo'

export const TeacherPage: React.FC = () => {
  const { user, isInstructor, isAdmin, isAuthenticated, refreshUser, getUserAvatarUrl } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = searchParams.get('tab') || 'dashboard'

  const [courses, setCourses] = useState<Course[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [questions, setQuestions] = useState<CourseQuestion[]>([])
  const [loading, setLoading] = useState(true)

  // Submissions modal & correction
  const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState<Task | null>(null)
  const [submissionsList, setSubmissionsList] = useState<TaskSubmission[]>([])
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false)
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)
  const [gradeInput, setGradeInput] = useState<number>(10)
  const [feedbackInput, setFeedbackInput] = useState<string>('')
  const [isGrading, setIsGrading] = useState(false)

  // Create / Edit Task Modal
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState({
    course: '',
    title: '',
    description: '',
    due_date: '',
    attachment_url: '',
    max_grade: 10,
  })

  // Answer Question Modal / Inline state
  const [selectedQuestion, setSelectedQuestion] = useState<CourseQuestion | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [isAnswering, setIsAnswering] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)

  // Filter tasks & questions by course
  const [courseFilter, setCourseFilter] = useState<string>('all')

  // Teacher Profile form
  const [profName, setProfName] = useState('')
  const [profBio, setProfBio] = useState('')
  const [profSpecialties, setProfSpecialties] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }

    if (!isInstructor && !isAdmin) {
      toast({
        title: 'Acesso Restrito',
        description: 'Esta área é exclusiva para professores e instrutores.',
        variant: 'destructive',
      })
      navigate('/')
      return
    }

    if (user) {
      setProfName(user.name || '')
      setProfBio(user.bio || '')
      setProfSpecialties(user.specialties || '')
    }

    loadTeacherData()
  }, [isAuthenticated, isInstructor, isAdmin, user, navigate])

  const loadTeacherData = async () => {
    setLoading(true)
    try {
      const coursesData = await getInstructorCourses()
      setCourses(coursesData)

      const courseIds = coursesData.map((c) => c.id)
      if (courseIds.length > 0) {
        const [tasksData, questionsData] = await Promise.all([
          getInstructorAllTasks(courseIds),
          getInstructorAllQuestions(courseIds),
        ])
        setTasks(tasksData)
        setQuestions(questionsData)
      }
    } catch (err) {
      console.error('Error loading teacher data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (val: string) => {
    const p = new URLSearchParams(searchParams)
    p.set('tab', val)
    setSearchParams(p)
  }

  // TASK ACTIONS
  const handleOpenTaskDialog = (taskToEdit?: Task) => {
    if (taskToEdit) {
      setEditingTaskId(taskToEdit.id)
      setTaskForm({
        course: taskToEdit.course,
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        due_date: taskToEdit.due_date ? taskToEdit.due_date.slice(0, 10) : '',
        attachment_url: taskToEdit.attachment_url || '',
        max_grade: taskToEdit.max_grade || 10,
      })
    } else {
      setEditingTaskId(null)
      setTaskForm({
        course: courseFilter !== 'all' ? courseFilter : courses[0]?.id || '',
        title: '',
        description: '',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        attachment_url: '',
        max_grade: 10,
      })
    }
    setIsTaskDialogOpen(true)
  }

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.course || !taskForm.title.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione o curso e digite o título da tarefa.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, {
          title: taskForm.title.trim(),
          description: taskForm.description,
          due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : undefined,
          attachment_url: taskForm.attachment_url,
          max_grade: Number(taskForm.max_grade) || 10,
        })
        toast({ title: 'Tarefa atualizada com sucesso!' })
      } else {
        await createTask({
          course: taskForm.course,
          title: taskForm.title.trim(),
          description: taskForm.description,
          due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : undefined,
          attachment_url: taskForm.attachment_url,
          max_grade: Number(taskForm.max_grade) || 10,
        })
        toast({ title: 'Tarefa criada com sucesso!' })
      }

      setIsTaskDialogOpen(false)
      loadTeacherData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar tarefa',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Deseja realmente excluir esta tarefa e suas entregas?')) return
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      toast({ title: 'Tarefa removida com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir tarefa', variant: 'destructive' })
    }
  }

  // SUBMISSIONS
  const handleOpenSubmissions = async (task: Task) => {
    setSelectedTaskForSubmissions(task)
    setIsSubmissionsDialogOpen(true)
    try {
      const subs = await getSubmissionsByTask(task.id)
      setSubmissionsList(subs)
    } catch (err) {
      console.error(err)
    }
  }

  const handleStartGrading = (sub: TaskSubmission) => {
    setGradingSubmissionId(sub.id)
    setGradeInput(sub.grade ?? selectedTaskForSubmissions?.max_grade ?? 10)
    setFeedbackInput(sub.feedback || '')
  }

  const handleSaveGrade = async (submissionId: string) => {
    setIsGrading(true)
    try {
      const updated = await gradeSubmission(submissionId, gradeInput, feedbackInput)
      setSubmissionsList((prev) => prev.map((s) => (s.id === submissionId ? updated : s)))
      setGradingSubmissionId(null)
      toast({
        title: 'Nota atribuída!',
        description: 'O aluno já pode visualizar o feedback e pontuação.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao avaliar',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsGrading(false)
    }
  }

  // QUESTIONS (Q&A)
  const handleOpenAnswerModal = (q: CourseQuestion) => {
    setSelectedQuestion(q)
    setAnswerText(q.answer || '')
    setIsQuestionDialogOpen(true)
  }

  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedQuestion || !answerText.trim()) return

    setIsAnswering(true)
    try {
      const updated = await answerQuestion(selectedQuestion.id, answerText.trim(), true)
      setQuestions((prev) => prev.map((q) => (q.id === selectedQuestion.id ? updated : q)))
      setIsQuestionDialogOpen(false)
      toast({
        title: 'Resposta enviada!',
        description: 'A resposta foi publicada com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao responder',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsAnswering(false)
    }
  }

  // TEACHER PROFILE
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSavingProfile(true)
    try {
      await pb.collection('users').update(user.id, {
        name: profName.trim(),
        bio: profBio.trim(),
        specialties: profSpecialties.trim(),
      })
      await refreshUser()
      toast({
        title: 'Perfil de Professor atualizado!',
        description: 'Suas informações e especialidades foram salvas.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar perfil',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  // Filtered lists
  const filteredTasks =
    courseFilter === 'all' ? tasks : tasks.filter((t) => t.course === courseFilter)
  const filteredQuestions =
    courseFilter === 'all' ? questions : questions.filter((q) => q.course === courseFilter)

  const pendingQuestionsCount = questions.filter((q) => !q.answer).length
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrollment_count || 0), 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground font-raleway">
          Carregando portal do professor...
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 flex-1 font-raleway">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-red-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <Avatar className="w-20 h-20 ring-4 ring-[#FFC72C]/40 shadow-lg">
            <AvatarImage src={getUserAvatarUrl(user)} />
            <AvatarFallback className="bg-primary text-white text-2xl font-bold">
              {user?.name?.[0] || 'P'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user?.name || 'Professor(a)'}</h1>
              <Badge className="bg-[#FFC72C] text-neutral-900 font-bold uppercase text-[10px] tracking-wider">
                Área do Professor
              </Badge>
            </div>
            <p className="text-xs text-neutral-300">
              {user?.specialties || 'Especialista em Capacitação RMHC'}
            </p>
            <p className="text-xs text-neutral-400">
              {courses.length} {courses.length === 1 ? 'curso ministrado' : 'cursos sob tutoria'} •{' '}
              {totalStudents} alunos ativos
            </p>
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center sm:justify-end">
          <Button
            onClick={() => handleOpenTaskDialog()}
            className="bg-[#DA291C] hover:bg-[#b81d12] text-white font-bold text-xs rounded-xl shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Criar Tarefa
          </Button>
          <Button
            onClick={() => handleTabChange('questions')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs rounded-xl"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Perguntas ({pendingQuestionsCount} pendentes)
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-12 p-1 bg-muted/80 rounded-2xl">
          <TabsTrigger value="dashboard" className="text-xs font-semibold gap-1.5 rounded-xl">
            <GraduationCap className="w-3.5 h-3.5" />
            Painel Geral
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs font-semibold gap-1.5 rounded-xl">
            <ClipboardList className="w-3.5 h-3.5" />
            Gestão de Tarefas ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-xs font-semibold gap-1.5 rounded-xl">
            <MessageSquare className="w-3.5 h-3.5" />
            Perguntas dos Alunos ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs font-semibold gap-1.5 rounded-xl">
            <UserCheck className="w-3.5 h-3.5" />
            Meu Perfil de Instrutor
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DASHBOARD GERAL */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border shadow-sm p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Cursos Ministrados</span>
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-black text-foreground">{courses.length}</p>
              <p className="text-[11px] text-muted-foreground">Conteúdos ativos</p>
            </Card>

            <Card className="border shadow-sm p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total de Alunos</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-foreground">{totalStudents}</p>
              <p className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Comunidade em formação
              </p>
            </Card>

            <Card className="border shadow-sm p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Tarefas Ativas</span>
                <ClipboardList className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-foreground">{tasks.length}</p>
              <p className="text-[11px] text-muted-foreground">Exercícios e projetos</p>
            </Card>

            <Card className="border shadow-sm p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Dúvidas Pendentes</span>
                <MessageSquare className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-black text-foreground">{pendingQuestionsCount}</p>
              <p
                className={`text-[11px] font-semibold ${
                  pendingQuestionsCount > 0 ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {pendingQuestionsCount > 0 ? 'Aguardando sua resposta' : 'Todas respondidas'}
              </p>
            </Card>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Meus Cursos Sob Tutoria</h2>
                <p className="text-xs text-muted-foreground">
                  Acompanhe turmas e métricas de cada disciplina
                </p>
              </div>
            </div>

            {courses.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-xs text-muted-foreground">
                  Você ainda não possui cursos vinculados como instrutor.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const courseTasks = tasks.filter((t) => t.course === course.id)
                  const courseQuestions = questions.filter((q) => q.course === course.id)
                  const unanswered = courseQuestions.filter((q) => !q.answer).length

                  return (
                    <Card
                      key={course.id}
                      className="overflow-hidden border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img
                            src={getCourseThumbnailUrl(course)}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 right-2.5">
                            <Badge className="bg-[#DA291C] text-white text-[10px] font-bold">
                              {course.enrollment_count || 0} alunos
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-bold text-base text-foreground line-clamp-1">
                            {course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <span className="flex items-center gap-1">
                              <ClipboardList className="w-3.5 h-3.5 text-primary" />
                              {courseTasks.length} {courseTasks.length === 1 ? 'tarefa' : 'tarefas'}
                            </span>
                            <span
                              className={`flex items-center gap-1 font-medium ${
                                unanswered > 0 ? 'text-red-500' : 'text-green-600'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {unanswered} {unanswered === 1 ? 'dúvida pendente' : 'dúvidas'}
                            </span>
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCourseFilter(course.id)
                            handleTabChange('tasks')
                          }}
                          className="text-xs"
                        >
                          Ver Tarefas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCourseFilter(course.id)
                            handleTabChange('questions')
                          }}
                          className="text-xs text-primary"
                        >
                          Ver Dúvidas
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: GESTÃO DE TAREFAS */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs font-semibold">Filtrar por Curso:</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="text-xs w-60 rounded-xl">
                  <SelectValue placeholder="Selecione o curso" />
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
              onClick={() => handleOpenTaskDialog()}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Criar Nova Tarefa
            </Button>
          </div>

          {filteredTasks.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <ClipboardList className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-bold text-base">Nenhuma tarefa criada para este curso</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                Crie estudos de caso, projetos práticos ou questionários para avaliar os alunos.
              </p>
              <Button
                onClick={() => handleOpenTaskDialog()}
                className="bg-primary hover:bg-primary/90 text-white text-xs"
              >
                Criar Primeira Tarefa
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((t) => (
                <Card
                  key={t.id}
                  className="border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {t.expand?.course?.title || 'Curso'}
                      </Badge>
                      <Badge className="bg-[#FFC72C] text-neutral-900 text-[10px] font-bold">
                        Nota Máx: {t.max_grade || 10}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground mt-2 line-clamp-2">
                      {t.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-3 leading-relaxed mt-1">
                      {t.description || 'Sem descrição detalhada.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
                      {t.due_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>
                            Entrega até: {new Date(t.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {t.attachment_url && (
                        <div className="flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          <a
                            href={t.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary truncate max-w-[200px]"
                          >
                            Material de Apoio
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenSubmissions(t)}
                        className="bg-[#005A9E] hover:bg-[#004a82] text-white text-xs font-semibold rounded-lg flex-1"
                      >
                        <Users className="w-3.5 h-3.5 mr-1" />
                        Ver Entregas
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenTaskDialog(t)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="Editar Tarefa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteTask(t.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        title="Excluir Tarefa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: PERGUNTAS DOS ALUNOS */}
        <TabsContent value="questions" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs font-semibold">Filtrar por Curso:</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="text-xs w-60 rounded-xl">
                  <SelectValue placeholder="Selecione o curso" />
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
          </div>

          {filteredQuestions.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-bold text-base">Nenhuma pergunta enviada ainda</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Quando os alunos enviarem dúvidas sobre as aulas, elas aparecerão aqui para você
                responder.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => (
                <Card
                  key={q.id}
                  className={`border shadow-sm p-5 space-y-4 ${
                    !q.answer ? 'border-l-4 border-l-red-500 bg-red-500/[0.02]' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={`https://img.usecurling.com/ppl/thumbnail?seed=${
                            q.expand?.student?.id || '1'
                          }`}
                        />
                        <AvatarFallback>{q.expand?.student?.name?.[0] || 'A'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {q.expand?.student?.name || 'Aluno(a)'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(q.created).toLocaleDateString('pt-BR')} •{' '}
                          {q.expand?.course?.title || 'Curso'}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={`text-[10px] font-bold ${
                        q.answer ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {q.answer ? 'Respondida' : 'Pendente'}
                    </Badge>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-xs font-semibold text-foreground">Pergunta do Aluno:</p>
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                      {q.question}
                    </p>
                  </div>

                  {q.answer ? (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Sua Resposta:
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAnswerModal(q)}
                          className="h-6 text-[10px] text-muted-foreground hover:text-primary"
                        >
                          Editar Resposta
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                        {q.answer}
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleOpenAnswerModal(q)}
                        className="bg-[#DA291C] hover:bg-[#b81d12] text-white text-xs font-semibold rounded-xl"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Responder Pergunta
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: PERFIL DO PROFESSOR */}
        <TabsContent value="profile" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                Informações Profissionais
              </CardTitle>
              <CardDescription className="text-xs">
                Seus dados serão exibidos aos alunos na página dos cursos que você ministra.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nome Completo</Label>
                  <Input
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Especialidades & Áreas de Atuação</Label>
                  <Input
                    placeholder="Ex: Oncologia Pediátrica, Nutrição Clínica, Voluntariado"
                    value={profSpecialties}
                    onChange={(e) => setProfSpecialties(e.target.value)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Separe suas especialidades por vírgulas.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Biografia / Resumo Profissional</Label>
                  <Textarea
                    placeholder="Conte um pouco sobre sua trajetória, experiência com a causa RMHC e formação acadêmica..."
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    className="text-xs min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {savingProfile ? 'Salvando...' : 'Salvar Perfil de Instrutor'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructor Preview Card */}
          <div className="space-y-4">
            <Card className="border shadow-sm bg-muted/20">
              <CardHeader>
                <CardTitle className="text-base font-bold">Prévia do Cartão de Instrutor</CardTitle>
                <CardDescription className="text-xs">
                  Como os alunos visualizam seu perfil no detalhe do curso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-card border rounded-2xl shadow-sm flex items-start gap-4">
                  <Avatar className="w-14 h-14 ring-2 ring-primary/20 shrink-0">
                    <AvatarImage src={getUserAvatarUrl(user)} />
                    <AvatarFallback className="bg-primary text-white font-bold">
                      {profName?.[0] || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{profName || 'Seu Nome'}</h4>
                    <p className="text-xs text-primary font-semibold">
                      {profSpecialties || 'Especialidades'}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {profBio || 'Sua biografia profissional aparecerá aqui.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span>
                    Avaliação média dos seus cursos: <strong>4.9 / 5.0</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG: CREATE / EDIT TASK */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveTask}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa do Curso'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Curso Vinculado</Label>
                <Select
                  value={taskForm.course}
                  onValueChange={(val) => setTaskForm({ ...taskForm, course: val })}
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
                <Label className="text-xs font-semibold">Título da Tarefa</Label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Ex: Estudo de Caso / Plano Prático de Acolhimento"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Instruções e Enunciado</Label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Descreva o que o aluno deve pesquisar ou entregar..."
                  className="text-xs min-h-[90px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Data Limite de Entrega</Label>
                  <Input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nota Máxima</Label>
                  <Input
                    type="number"
                    value={taskForm.max_grade}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, max_grade: Number(e.target.value) })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Link de Apoio / Material Anexo (Opcional)
                </Label>
                <Input
                  placeholder="https://..."
                  value={taskForm.attachment_url}
                  onChange={(e) => setTaskForm({ ...taskForm, attachment_url: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTaskDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Salvar Tarefa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: SUBMISSIONS LIST & GRADING */}
      <Dialog open={isSubmissionsDialogOpen} onOpenChange={setIsSubmissionsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Entregas dos Alunos: {selectedTaskForSubmissions?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {submissionsList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Nenhum aluno realizou a entrega desta tarefa ainda.
              </p>
            ) : (
              <div className="space-y-4 divide-y">
                {submissionsList.map((sub) => {
                  const isGraded = sub.grade !== undefined && sub.grade !== null
                  const isBeingGraded = gradingSubmissionId === sub.id

                  return (
                    <div key={sub.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={`https://img.usecurling.com/ppl/thumbnail?seed=${
                                sub.expand?.student?.id || '1'
                              }`}
                            />
                            <AvatarFallback>{sub.expand?.student?.name?.[0] || 'A'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {sub.expand?.student?.name || 'Aluno(a)'}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Entregue em:{' '}
                              {sub.submitted_at
                                ? new Date(sub.submitted_at).toLocaleDateString('pt-BR')
                                : 'Data não registrada'}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isGraded ? (
                            <Badge className="bg-green-600 text-white text-xs font-bold">
                              Nota: {sub.grade} / {selectedTaskForSubmissions?.max_grade || 10}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-amber-600">
                              Pendente de Correção
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
                        {sub.content && (
                          <div>
                            <p className="font-semibold text-foreground">Resposta do Aluno:</p>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line mt-1">
                              {sub.content}
                            </p>
                          </div>
                        )}

                        {sub.attachment_url && (
                          <div className="pt-1">
                            <a
                              href={sub.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Ver Link Anexo Enviado
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Grading Section */}
                      {isBeingGraded ? (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                          <p className="text-xs font-bold text-primary">
                            Atribuir Nota e Feedback:
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">
                                Nota (0 a {selectedTaskForSubmissions?.max_grade || 10})
                              </Label>
                              <Input
                                type="number"
                                max={selectedTaskForSubmissions?.max_grade || 10}
                                min={0}
                                step={0.5}
                                value={gradeInput}
                                onChange={(e) => setGradeInput(Number(e.target.value))}
                                className="text-xs"
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <Label className="text-xs">Comentário / Feedback Pedagógico</Label>
                              <Input
                                placeholder="Excelente trabalho, bons pontos abordados..."
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setGradingSubmissionId(null)}
                              className="text-xs"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              disabled={isGrading}
                              onClick={() => handleSaveGrade(sub.id)}
                              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                            >
                              {isGrading ? 'Salvando...' : 'Salvar Avaliação'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          {sub.feedback && (
                            <p className="text-[11px] text-muted-foreground italic">
                              Feedback: "{sub.feedback}"
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartGrading(sub)}
                            className="text-xs text-primary ml-auto"
                          >
                            {isGraded ? 'Editar Nota' : 'Corrigir e Dar Nota'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ANSWER QUESTION */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSendAnswer}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Responder Pergunta</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                <p className="font-semibold text-foreground">
                  Dúvida de {selectedQuestion?.expand?.student?.name || 'Aluno'}:
                </p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {selectedQuestion?.question}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sua Resposta Instrutiva</Label>
                <Textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Escreva uma resposta clara e acolhedora..."
                  required
                  className="text-xs min-h-[120px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuestionDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isAnswering}
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                {isAnswering ? 'Enviando...' : 'Publicar Resposta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
