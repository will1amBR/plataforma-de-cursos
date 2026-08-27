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
import type { Course, Lesson, Review, Enrollment } from '@/types'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'

export const CourseDetailsPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>()
  const { user, isAuthenticated, getUserAvatarUrl } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  // Review Form
  const [userRating, setUserRating] = useState(5)
  const [userComment, setUserComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!slugOrId) return

    const loadData = async () => {
      setLoading(true)
      try {
        const courseData = await getCourseBySlugOrId(slugOrId)
        if (courseData) {
          setCourse(courseData)
          const [lessonsData, reviewsData] = await Promise.all([
            getCourseLessons(courseData.id),
            getCourseReviews(courseData.id),
          ])
          setLessons(lessonsData)
          setReviews(reviewsData)

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

      {/* Main Content Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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

            {/* REVIEWS & FEEDBACK */}
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
                            <AvatarFallback>{rev.expand?.user_id?.name?.[0] || 'U'}</AvatarFallback>
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
        </div>
      </div>
    </div>
  )
}
