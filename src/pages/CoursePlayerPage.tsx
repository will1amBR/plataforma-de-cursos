import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  getCourseBySlugOrId,
  getCourseLessons,
  getUserEnrollment,
  enrollInCourse,
  updateLessonProgress,
} from '@/services/courses'
import type { Course, Lesson, Enrollment } from '@/types'
import { transformGoogleDriveUrlToEmbed } from '@/types'
import {
  PlayCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react'
import { getTasksByCourse, getQuestionsByCourse, askQuestion, submitTask } from '@/services/teacher'
import type { Task, CourseQuestion } from '@/types'
import { ClipboardList, MessageSquare, Send, Calendar, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

export const CoursePlayerPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [questions, setQuestions] = useState<CourseQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Player tabs & extras
  const [playerTab, setPlayerTab] = useState<'content' | 'tasks' | 'questions'>('content')
  const [newQuestionText, setNewQuestionText] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState<Task | null>(null)
  const [submissionContent, setSubmissionContent] = useState('')
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submittingTask, setSubmittingTask] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }
    if (!slugOrId) return

    const loadPlayer = async () => {
      setLoading(true)
      try {
        const courseData = await getCourseBySlugOrId(slugOrId)
        if (!courseData) {
          navigate('/courses')
          return
        }
        setCourse(courseData)

        const [lessonsData, tasksData, questionsData] = await Promise.all([
          getCourseLessons(courseData.id),
          getTasksByCourse(courseData.id),
          getQuestionsByCourse(
            courseData.id,
            user?.role === 'instructor' || user?.role === 'admin',
          ),
        ])
        setLessons(lessonsData)
        setTasks(tasksData)
        setQuestions(questionsData)

        let enr = await getUserEnrollment(courseData.id)
        if (!enr) {
          // Auto-enroll if accessing player directly
          enr = await enrollInCourse(courseData.id)
        }
        setEnrollment(enr)

        // Find first unfinished lesson index
        if (enr && Array.isArray(enr.completed_lessons) && lessonsData.length > 0) {
          const firstUnfinished = lessonsData.findIndex(
            (l) => !enr?.completed_lessons?.includes(l.id),
          )
          if (firstUnfinished !== -1) {
            setCurrentLessonIndex(firstUnfinished)
          }
        }
      } catch (err) {
        console.error('Error loading course player:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPlayer()
  }, [slugOrId, isAuthenticated, navigate])

  const currentLesson = lessons[currentLessonIndex] || null

  const isLessonCompleted = (lessonId: string): boolean => {
    return !!enrollment?.completed_lessons?.includes(lessonId)
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
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
        description: 'O instrutor responderá sua dúvida em breve.',
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

  const handleMarkLessonComplete = async () => {
    if (!enrollment || !currentLesson) return
    setUpdating(true)
    try {
      const updated = await updateLessonProgress(enrollment.id, currentLesson.id, lessons.length)
      setEnrollment(updated)

      toast({
        title: 'Aula concluída!',
        description: 'Seu progresso foi registrado com sucesso.',
      })

      // Auto advance to next lesson if available
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex((idx) => idx + 1)
      } else if (updated.status === 'completed') {
        toast({
          title: '🎉 Parabéns! Curso Concluído!',
          description:
            'A solicitação do seu certificado foi enviada para aprovação do Instituto Ronald McDonald.',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar progresso',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Preparando sala de aula...</p>
      </div>
    )
  }

  if (!course) return null

  const videoEmbedUrl = transformGoogleDriveUrlToEmbed(currentLesson?.video_url)

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Top Classroom Bar */}
      <div className="bg-card border-b px-4 py-3 sticky top-16 z-30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
            <Link to={`/courses/${course.slug || course.id}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao Curso
            </Link>
          </Button>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <h1 className="text-sm font-bold truncate text-foreground">{course.title}</h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progresso:</span>
            <span className="text-xs font-bold text-primary">{enrollment?.progress || 0}%</span>
            <Progress value={enrollment?.progress || 0} className="w-24 h-2" />
          </div>

          {enrollment?.status === 'completed' && (
            <Badge className="bg-amber-500 text-neutral-900 text-xs font-bold gap-1 hidden sm:flex">
              <Award className="w-3.5 h-3.5" />
              Curso Concluído
            </Badge>
          )}
        </div>
      </div>

      {/* Player & Lessons Grid */}
      <div className="container mx-auto px-4 py-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video & Current Lesson Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-border">
            {currentLesson && videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center space-y-2">
                <PlayCircle className="w-12 h-12 text-primary" />
                <p className="text-sm font-semibold">Selecione uma aula na lista ao lado</p>
              </div>
            )}
          </div>

          {/* Current Lesson Header & Actions */}
          {currentLesson && (
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Aula {currentLessonIndex + 1} de {lessons.length}
                    </span>
                    {currentLesson.duration && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        • <Clock className="w-3 h-3" /> {currentLesson.duration} min
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-foreground mt-1">{currentLesson.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleMarkLessonComplete}
                    disabled={updating || isLessonCompleted(currentLesson.id)}
                    className={`text-xs font-semibold h-10 px-4 rounded-xl ${
                      isLessonCompleted(currentLesson.id)
                        ? 'bg-green-600 hover:bg-green-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    {isLessonCompleted(currentLesson.id)
                      ? 'Aula Concluída'
                      : 'Marcar como Concluída'}
                  </Button>
                </div>
              </div>

              {/* Player tabs: Content / Tasks / Questions */}
              <div className="flex items-center gap-2 border-b pb-2 pt-2">
                <button
                  onClick={() => setPlayerTab('content')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    playerTab === 'content'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Descrição da Aula
                </button>
                <button
                  onClick={() => setPlayerTab('tasks')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    playerTab === 'tasks'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Tarefas ({tasks.length})
                </button>
                <button
                  onClick={() => setPlayerTab('questions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    playerTab === 'questions'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Dúvidas ({questions.length})
                </button>
              </div>

              {playerTab === 'content' && (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {currentLesson.description ||
                      'Assista a aula e marque como concluída para registrar seu progresso na trilha.'}
                  </p>
                </div>
              )}

              {playerTab === 'tasks' && (
                <div className="space-y-3 pt-1">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 border rounded-xl border-dashed">
                      Nenhuma tarefa atribuída a este curso.
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border rounded-xl bg-muted/20 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-foreground">{task.title}</h4>
                            <Badge className="bg-[#FFC72C] text-neutral-900 text-[10px] font-bold">
                              Nota: {task.max_grade || 10}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          {task.due_date && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-primary" />
                              Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => setSelectedTaskToSubmit(task)}
                          className="bg-primary hover:bg-primary/90 text-white text-xs shrink-0 rounded-xl"
                        >
                          Entregar Tarefa
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {playerTab === 'questions' && (
                <div className="space-y-3 pt-1">
                  <form
                    onSubmit={handleAskQuestion}
                    className="p-3 bg-muted/40 rounded-xl border space-y-2"
                  >
                    <p className="text-xs font-semibold text-foreground">
                      Tire sua dúvida com o instrutor da disciplina:
                    </p>
                    <Textarea
                      placeholder="Digite sua pergunta aqui..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="text-xs min-h-[60px]"
                      required
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingQuestion}
                      className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      {submittingQuestion ? 'Enviando...' : 'Enviar Pergunta'}
                    </Button>
                  </form>

                  <div className="space-y-3 pt-2">
                    {questions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        Nenhuma dúvida registrada neste curso.
                      </p>
                    ) : (
                      questions.map((q) => (
                        <div key={q.id} className="p-3 border rounded-xl bg-card space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">
                              {q.expand?.student?.name || 'Aluno(a)'}
                            </span>
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
                          <p className="text-muted-foreground whitespace-pre-line">{q.question}</p>

                          {q.answer && (
                            <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg space-y-1">
                              <p className="font-bold text-primary flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" /> Resposta do Professor (
                                {q.expand?.answered_by?.name || 'Instrutor'}):
                              </p>
                              <p className="text-foreground/90 whitespace-pre-line leading-relaxed">
                                {q.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Navigation between lessons */}
              <div className="flex items-center justify-between pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentLessonIndex === 0}
                  onClick={() => setCurrentLessonIndex((i) => Math.max(0, i - 1))}
                  className="text-xs"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Aula Anterior
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentLessonIndex === lessons.length - 1}
                  onClick={() => setCurrentLessonIndex((i) => Math.min(lessons.length - 1, i + 1))}
                  className="text-xs"
                >
                  Próxima Aula
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Playlist of Lessons */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border shadow-sm overflow-hidden sticky top-32">
            <div className="bg-muted/60 p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Conteúdo do Curso</h3>
                <p className="text-[11px] text-muted-foreground">
                  {enrollment?.completed_lessons?.length || 0} de {lessons.length} aulas concluídas
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>

            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/60">
              {lessons.map((lesson, idx) => {
                const isSelected = idx === currentLessonIndex
                const completed = isLessonCompleted(lesson.id)

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setCurrentLessonIndex(idx)}
                    className={`p-3 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-primary font-semibold text-primary'
                        : 'hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                          completed
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {completed ? '✓' : idx + 1}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground shrink-0 text-[10px]">
                      {lesson.duration && <span>{lesson.duration}m</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL: SUBMIT TASK IN PLAYER */}
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
                <span className="font-semibold text-foreground">Instruções da Tarefa:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTaskToSubmit?.description || 'Envie seu trabalho no formulário abaixo.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Texto da sua Resposta / Projeto</label>
                <Textarea
                  placeholder="Descreva suas conclusões ou desenvolvimento da atividade..."
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
