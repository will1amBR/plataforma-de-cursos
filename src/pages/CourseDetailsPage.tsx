import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  getCourseBySlugOrId,
  getCourseLessons,
  getCourseReviews,
  getUserEnrollment,
  enrollInCourse,
  addReview,
} from '@/services/courses'
import {
  getTasksByCourse,
  getQuestionsByCourse,
  askQuestion,
  submitTask,
  getSubmissionsByTask,
  answerQuestion,
} from '@/services/teacher'
import type {
  Course,
  Lesson,
  Review,
  Enrollment,
  Task,
  CourseQuestion,
  TaskSubmission,
} from '@/types'
import { getCourseThumbnailUrl, transformGoogleDriveUrlToEmbed } from '@/types'
import {
  BookOpen,
  Clock,
  Star,
  Users,
  ShieldCheck,
  Award,
  PlayCircle,
  CheckCircle2,
  Lock,
  MessageSquare,
  FileText,
  User,
  ArrowRight,
  Share2,
  ClipboardList,
  Send,
  ExternalLink,
  Calendar,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'

export const CourseDetailsPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>()
  const { user, isAuthenticated, getUserAvatarUrl } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [questions, setQuestions] = useState<CourseQuestion[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  // Active section tab
  const [activeTab, setActiveTab] = useState<'content' | 'tasks' | 'questions' | 'reviews'>(
    'content',
  )

  // Review Form
  const [userRating, setUserRating] = useState(5)
  const [userComment, setUserComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Question Form
  const [newQuestionText, setNewQuestionText] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)

  // Submit Task Modal
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState<Task | null>(null)
  const [submissionContent, setSubmissionContent] = useState('')
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submittingTask, setSubmittingTask] = useState(false)

  useEffect(() => {
    if (!slugOrId) return

    const loadData = async () => {
      setLoading(true)
      try {
        const courseData = await getCourseBySlugOrId(slugOrId)
        if (courseData) {
          setCourse(courseData)
          const [lessonsData, reviewsData, tasksData, questionsData] = await Promise.all([
            getCourseLessons(courseData.id),
            getCourseReviews(courseData.id),
            getTasksByCourse(courseData.id),
            getQuestionsByCourse(
              courseData.id,
              user?.role === 'instructor' || user?.role === 'admin',
            ),
          ])
          setLessons(lessonsData)
          setReviews(reviewsData)
          setTasks(tasksData)
          setQuestions(questionsData)

          if (isAuthenticated) {
            const userEnr = await getUserEnrollment(courseData.id)
            setEnrollment(userEnr)
          }
        }
      } catch (err) {
        console.error('Error fetching course details:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slugOrId, isAuthenticated])

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Faça login para se matricular',
        description: 'É necessário ter uma conta para acessar as aulas.',
      })
      navigate('/auth?mode=login')
      return
    }
    if (!course) return

    setEnrolling(true)
    try {
      const newEnr = await enrollInCourse(course.id)
      setEnrollment(newEnr)
      toast({
        title: 'Matrícula realizada com sucesso!',
        description: 'Bons estudos! Você já pode acessar as lições.',
      })
      navigate(`/courses/${course.slug || course.id}/learn`)
    } catch (err: any) {
      console.error('Enroll error:', err)
      toast({
        title: 'Erro na matrícula',
        description: err?.message || 'Não foi possível concluir sua matrícula.',
        variant: 'destructive',
      })
    } finally {
      setEnrolling(false)
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }
    if (!course || !newQuestionText.trim()) return

    setSubmittingQuestion(true)
    try {
      const created = await askQuestion({
        course: course.id,
        question: newQuestionText.trim(),
        is_public: true,
      })
      setQuestions((prev) => [
        {
          ...created,
          expand: {
            student: {
              id: user?.id || '',
              name: user?.name || 'Você',
            },
          },
        },
        ...prev,
      ])
      setNewQuestionText('')
      toast({
        title: 'Pergunta enviada!',
        description: 'O professor e a equipe pedagógica responderão em breve.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar pergunta',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingQuestion(false)
    }
  }

  const handleSendTaskSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTaskToSubmit || (!submissionContent.trim() && !submissionUrl.trim())) {
      toast({
        title: 'Preencha a resposta',
        description: 'Digite o texto da sua entrega ou insira o link do anexo.',
        variant: 'destructive',
      })
      return
    }

    setSubmittingTask(true)
    try {
      await submitTask({
        task: selectedTaskToSubmit.id,
        content: submissionContent.trim(),
        attachment_url: submissionUrl.trim(),
      })
      setSelectedTaskToSubmit(null)
      setSubmissionContent('')
      setSubmissionUrl('')
      toast({
        title: 'Tarefa enviada com sucesso!',
        description: 'Sua entrega foi gravada e enviada para o professor.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar tarefa',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingTask(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }
    if (!course) return

    setSubmittingReview(true)
    try {
      const newRev = await addReview(course.id, userRating, userComment)
      setReviews((prev) => [
        {
          ...newRev,
          expand: {
            user_id: {
              id: user?.id || '',
              name: user?.name || 'Você',
              avatar: user?.avatar,
            },
          },
        },
        ...prev,
      ])
      setUserComment('')
      toast({
        title: 'Avaliação enviada!',
        description: 'Obrigado por compartilhar seu feedback.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar avaliação',
        description: err?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: course?.title,
          text: course?.description,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copiado!',
        description: 'O link do curso foi copiado para a sua área de transferência.',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Carregando detalhes do curso...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Curso não encontrado</h2>
        <p className="text-sm text-muted-foreground">
          O curso que você procura não existe ou foi despublicado.
        </p>
        <Button asChild>
          <Link to="/courses">Voltar para o Catálogo</Link>
        </Button>
      </div>
    )
  }

  const introEmbedUrl = transformGoogleDriveUrlToEmbed(course.intro_video_url)

  // Group lessons by module
  const modulesMap = lessons.reduce(
    (acc, lesson) => {
      const mod = lesson.module || 'Módulo Principal'
      if (!acc[mod]) acc[mod] = []
      acc[mod].push(lesson)
      return acc
    },
    {} as Record<string, Lesson[]>,
  )

  return (
    <div className="flex-1 pb-16">
      {/* Course Hero Banner */}
      <div className="bg-gradient-to-b from-muted/60 via-muted/30 to-background border-b border-border/60 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Course Overview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold uppercase bg-background">
                  {course.expand?.category_id?.name || 'Capacitação'}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  Nível: {course.level || 'Iniciante'}
                </Badge>
                <Badge className="bg-[#DA291C] text-white text-xs font-bold uppercase">
                  {course.price === 0 || !course.price ? 'Gratuito' : `R$ ${course.price}`}
                </Badge>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {course.description || course.long_description}
              </p>

              {/* Stats & Instructor */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>{course.rating ? course.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-muted-foreground font-normal">
                    ({reviews.length} avaliações)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{course.enrollment_count || 120} alunos inscritos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{course.duration || 10} horas de conteúdo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Certificado incluso</span>
                </div>
              </div>

              {course.expand?.instructor_id?.name && (
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="w-9 h-9">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/medium?seed=${course.expand.instructor_id.id}`}
                    />
                    <AvatarFallback>{course.expand.instructor_id.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Instrutor(a)</p>
                    <p className="text-xs font-bold text-foreground">
                      {course.expand.instructor_id.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Video Preview / Enrollment CTA Card */}
            <div className="lg:col-span-1">
              <Card className="border-border/80 shadow-xl overflow-hidden sticky top-20 bg-card">
                {/* Intro Video Player or Fallback Image */}
                <div className="aspect-video relative bg-black/90 overflow-hidden">
                  {introEmbedUrl ? (
                    <iframe
                      src={introEmbedUrl}
                      title={`Vídeo introdutório - ${course.title}`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={getCourseThumbnailUrl(course)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <CardContent className="p-5 space-y-4">
                  {enrollment ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Você está matriculado neste curso</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Seu progresso</span>
                          <span className="font-bold text-primary">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress || 0} className="h-2" />
                      </div>

                      <Button
                        asChild
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-md"
                      >
                        <Link to={`/courses/${course.slug || course.id}/learn`}>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Acessar Sala de Aula
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-2xl font-black text-foreground">
                          {course.price === 0 || !course.price
                            ? 'Gratuito'
                            : `R$ ${course.price.toFixed(2)}`}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Acesso vitalício com certificado de conclusão
                        </p>
                      </div>

                      <Button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full bg-[#DA291C] hover:bg-[#b81d12] text-white font-bold h-12 rounded-xl text-sm shadow-lg shadow-red-500/20"
                      >
                        {enrolling ? 'Processando...' : 'Matricular-se Gratuitamente'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="w-full text-xs h-9 rounded-lg"
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        Compartilhar Curso
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>Certificado com código de autenticidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{lessons.length} aulas gravadas em vídeo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details with Modern Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'content'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Aulas & Ementa ({lessons.length})
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'tasks'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Tarefas & Exercícios ({tasks.length})
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'questions'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Dúvidas & Q&A ({questions.length})
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'reviews'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                Avaliações ({reviews.length})
              </button>
            </div>

            {/* TAB 1: CONTENT */}
            {activeTab === 'content' && (
              <div className="space-y-6 animate-fade-in">
                {/* Detailed Description */}
                <div className="space-y-3 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Sobre Este Curso
                  </h2>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-3 whitespace-pre-line">
                    {course.long_description ||
                      course.description ||
                      'Nenhum detalhe adicional informado.'}
                  </div>
                </div>

                {/* Course Syllabus / Lessons Modules */}
                <div className="space-y-4 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Conteúdo Programático ({lessons.length} lições)
                      </h2>
                      <p className="text-xs text-muted-foreground">Módulos e aulas sequenciais</p>
                    </div>
                  </div>

                  {lessons.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4">
                      Nenhuma aula cadastrada ainda neste curso.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(modulesMap).map(([moduleTitle, moduleLessons], modIdx) => (
                        <div
                          key={modIdx}
                          className="border border-border/70 rounded-xl overflow-hidden"
                        >
                          <div className="bg-muted/60 px-4 py-2.5 font-semibold text-xs text-foreground flex items-center justify-between">
                            <span>{moduleTitle}</span>
                            <span className="text-[11px] text-muted-foreground font-normal">
                              {moduleLessons.length} {moduleLessons.length === 1 ? 'aula' : 'aulas'}
                            </span>
                          </div>
                          <div className="divide-y divide-border/60">
                            {moduleLessons.map((l, lIdx) => (
                              <div
                                key={l.id}
                                className="p-3 px-4 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                                    {l.order || lIdx + 1}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-foreground">{l.title}</p>
                                    {l.description && (
                                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                                        {l.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  {l.duration && <span>{l.duration} min</span>}
                                  {enrollment ? (
                                    <PlayCircle className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TASKS */}
            {activeTab === 'tasks' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      Tarefas e Atividades do Curso ({tasks.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Realize as entregas para avaliação e obtenção de nota pelo professor.
                    </p>
                  </div>

                  {tasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center border rounded-xl border-dashed">
                      Nenhuma tarefa atribuída a este curso no momento.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-5 border rounded-2xl bg-muted/20 space-y-3 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="font-bold text-base text-foreground">{task.title}</h3>
                            <Badge className="bg-[#FFC72C] text-neutral-900 font-bold text-xs w-fit">
                              Nota Máx: {task.max_grade || 10}
                            </Badge>
                          </div>

                          {task.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-xs text-muted-foreground">
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {task.attachment_url && (
                              <a
                                href={task.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-semibold hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Material de Apoio
                              </a>
                            )}

                            <Button
                              size="sm"
                              onClick={() => setSelectedTaskToSubmit(task)}
                              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl ml-auto"
                            >
                              Entregar Tarefa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: QUESTIONS (Q&A) */}
            {activeTab === 'questions' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Espaço de Perguntas & Respostas
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Tire dúvidas sobre as aulas diretamente com o instrutor deste curso.
                    </p>
                  </div>

                  {/* Ask Question Form */}
                  {isAuthenticated ? (
                    <form
                      onSubmit={handleAskQuestion}
                      className="p-4 bg-muted/40 rounded-2xl border space-y-3"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        Faça uma pergunta sobre o conteúdo:
                      </p>
                      <Textarea
                        placeholder="Digite sua dúvida de forma detalhada para o professor..."
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="text-xs min-h-[80px]"
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingQuestion}
                        className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        {submittingQuestion ? 'Enviando...' : 'Enviar Pergunta'}
                      </Button>
                    </form>
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-xl text-center text-xs text-muted-foreground">
                      <Link
                        to="/auth?mode=login"
                        className="text-primary font-semibold hover:underline"
                      >
                        Faça login
                      </Link>{' '}
                      para enviar perguntas ao professor.
                    </div>
                  )}

                  {/* Questions List */}
                  {questions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center border rounded-xl border-dashed">
                      Nenhuma dúvida enviada até o momento. Seja o primeiro a perguntar!
                    </p>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {questions.map((q) => (
                        <div key={q.id} className="p-4 border rounded-2xl bg-card space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage
                                  src={`https://img.usecurling.com/ppl/thumbnail?seed=${q.expand?.student?.id || '1'}`}
                                />
                                <AvatarFallback>
                                  {q.expand?.student?.name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">
                                {q.expand?.student?.name || 'Aluno(a)'}
                              </span>
                            </div>
                            <Badge
                              className={
                                q.answer
                                  ? 'bg-green-600 text-white text-[10px]'
                                  : 'bg-amber-600 text-white text-[10px]'
                              }
                            >
                              {q.answer ? 'Respondida' : 'Aguardando'}
                            </Badge>
                          </div>

                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line pl-9">
                            {q.question}
                          </p>

                          {q.answer && (
                            <div className="ml-9 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-1">
                              <p className="font-bold text-primary flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Resposta do Professor (
                                {q.expand?.answered_by?.name || 'Instrutor'}):
                              </p>
                              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                {q.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-6 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        Avaliações dos Alunos
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Média de {course.rating ? course.rating.toFixed(1) : '5.0'} baseada em{' '}
                        {reviews.length} depoimentos
                      </p>
                    </div>
                  </div>

                  {/* Add Review Box (if logged in) */}
                  {isAuthenticated ? (
                    <form
                      onSubmit={handleReviewSubmit}
                      className="p-4 bg-muted/40 rounded-xl border space-y-3"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        Deixe sua avaliação sobre o curso:
                      </p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= userRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-semibold ml-2 text-amber-600">
                          {userRating} {userRating === 1 ? 'estrela' : 'estrelas'}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Conte como foi sua experiência com este curso..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="text-xs min-h-[70px]"
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingReview}
                        className="bg-primary hover:bg-primary/90 text-white text-xs"
                      >
                        {submittingReview ? 'Publicando...' : 'Publicar Avaliação'}
                      </Button>
                    </form>
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-xl text-center text-xs text-muted-foreground">
                      <Link
                        to="/auth?mode=login"
                        className="text-primary font-semibold hover:underline"
                      >
                        Faça login
                      </Link>{' '}
                      para avaliar este curso.
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                      Seja o primeiro a avaliar este curso!
                    </p>
                  ) : (
                    <div className="space-y-4 divide-y">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage
                                  src={`https://img.usecurling.com/ppl/medium?seed=${rev.expand?.user_id?.id || '1'}`}
                                />
                                <AvatarFallback>
                                  {rev.expand?.user_id?.name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">
                                {rev.expand?.user_id?.name || 'Aluno(a)'}
                              </span>
                            </div>
                            <div className="flex items-center text-amber-500">
                              {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: SUBMIT TASK */}
      <Dialog
        open={!!selectedTaskToSubmit}
        onOpenChange={(open) => !open && setSelectedTaskToSubmit(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSendTaskSubmission}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Entrega: {selectedTaskToSubmit?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                <span className="font-semibold text-foreground">Enunciado / Instruções:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTaskToSubmit?.description || 'Envie seu trabalho no formulário abaixo.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Texto da sua Resposta / Projeto</label>
                <Textarea
                  placeholder="Descreva suas conclusões, plano ou resposta da atividade..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="text-xs min-h-[100px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Link do Anexo / Documento (Opcional)
                </label>
                <Input
                  placeholder="https://drive.google.com/... ou https://..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTaskToSubmit(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingTask}
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                {submittingTask ? 'Enviando...' : 'Confirmar Entrega'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
