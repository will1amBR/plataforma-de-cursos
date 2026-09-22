import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getCourses, getCategories, getUserEnrollments } from '@/services/courses'
import type { Course, Category, Enrollment } from '@/types'
import { getCourseThumbnailUrl } from '@/types'
import {
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  PlayCircle,
  Users,
  Award,
  ChevronRight,
  Heart,
  TrendingUp,
  Apple,
  Leaf,
  Briefcase,
  Megaphone,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'
import { getStudentSubmissions } from '@/services/teacher'
import type { TaskSubmission } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

const categoryIconMap: Record<string, React.ReactNode> = {
  Apple: <Apple className="w-5 h-5 text-red-500" />,
  Leaf: <Leaf className="w-5 h-5 text-emerald-500" />,
  Briefcase: <Briefcase className="w-5 h-5 text-blue-500" />,
  Megaphone: <Megaphone className="w-5 h-5 text-amber-500" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-purple-500" />,
}

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([])
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([])
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([])
  const [loading, setLoading] = useState(true)

  // Search auto-suggestions
  const [allCoursesForSearch, setAllCoursesForSearch] = useState<Course[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<Course[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Banner carousel state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [cats, feat, recs, all] = await Promise.all([
          getCategories(),
          getCourses({ featured: true, limit: 4 }),
          getCourses({ limit: 6 }),
          getCourses({ limit: 50 }),
        ])
        setCategories(cats)
        setFeaturedCourses(feat)
        setRecommendedCourses(recs)
        setAllCoursesForSearch(all)

        if (isAuthenticated) {
          const [enrollments, subs] = await Promise.all([
            getUserEnrollments(),
            getStudentSubmissions(),
          ])
          setMyEnrollments(enrollments)
          setSubmissions(subs)
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  // Handle banner rotation
  useEffect(() => {
    if (featuredCourses.length <= 1) return
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % featuredCourses.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [featuredCourses.length])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (val.trim().length > 1) {
      const match = allCoursesForSearch.filter(
        (c) =>
          c.title.toLowerCase().includes(val.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(val.toLowerCase())),
      )
      setFilteredSuggestions(match.slice(0, 5))
    } else {
      setFilteredSuggestions([])
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const currentBanner = featuredCourses[currentBannerIndex] || featuredCourses[0]

  return (
    <div className="flex-1 space-y-10 pb-16 w-full max-w-full overflow-x-hidden">
      {/* HERO / BANNER SECTION */}
      <section className="relative w-full max-w-full overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-8 md:pt-12 pb-6 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Capacitação & Educação Continuada</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Aprenda, Compartilhe e Transforme Vidas
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Cursos gratuitos e certificados do Instituto Ronald McDonald para profissionais,
              voluntários e famílias.
            </p>

            {/* Global Search Bar with Auto-suggestions */}
            <div className="relative max-w-xl mx-auto pt-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="search"
                  placeholder="O que você deseja aprender hoje? (Ex: Nutrição, Gestão...)"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full h-12 pl-12 pr-28 rounded-full shadow-md text-sm border-border focus-visible:ring-primary bg-background"
                />
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-full px-5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                >
                  Buscar
                </Button>
              </form>

              {/* Auto-suggestions Dropdown */}
              {isSearchFocused && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-background border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden text-left divide-y animate-slide-down">
                  {filteredSuggestions.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/courses/${course.slug || course.id}`)}
                      className="p-3 hover:bg-muted flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {course.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {course.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Course Highlight Banner */}
          {currentBanner && (
            <div className="max-w-5xl mx-auto mt-6">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950 via-neutral-900 to-red-900 text-white shadow-2xl border border-white/10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 group">
                <div className="flex-1 space-y-4 text-left z-10">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#FFC72C] hover:bg-[#FFC72C] text-neutral-900 font-bold text-xs uppercase px-2.5 py-0.5">
                      Destaque
                    </Badge>
                    <span className="text-xs text-white/80 font-medium">
                      {currentBanner.expand?.category_id?.name || 'Geral'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white line-clamp-2">
                    {currentBanner.title}
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-200 line-clamp-3 leading-relaxed">
                    {currentBanner.description || currentBanner.long_description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#FFC72C]" />
                      <span>{currentBanner.duration || 10} horas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FFC72C] fill-[#FFC72C]" />
                      <span>{currentBanner.rating ? currentBanner.rating.toFixed(1) : '5.0'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#FFC72C]" />
                      <span>{currentBanner.enrollment_count || 50}+ alunos</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      asChild
                      className="bg-[#DA291C] hover:bg-[#b81d12] text-white font-bold text-xs md:text-sm px-6 h-11 rounded-xl shadow-lg shadow-red-900/50"
                    >
                      <Link to={`/courses/${currentBanner.slug || currentBanner.id}`}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Ver Curso Completo
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="w-full md:w-5/12 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-inner relative shrink-0">
                  <img
                    src={getCourseThumbnailUrl(currentBanner)}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
                      100% Online & Gratuito
                    </span>
                  </div>
                </div>
              </div>

              {/* Carousel dots */}
              {featuredCourses.length > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  {featuredCourses.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentBannerIndex
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      }`}
                      aria-label={`Ir para banner ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* QUICK CATEGORIES */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Categorias em Destaque
            </h2>
            <p className="text-xs text-muted-foreground">Explore nossos eixos de capacitação</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-primary font-semibold">
            <Link to="/courses">Ver todas as categorias &rarr;</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses?category=${cat.id}`}
              className="group p-4 rounded-2xl border border-border/60 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-center flex flex-col items-center justify-center space-y-2 shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                {cat.icon && categoryIconMap[cat.icon] ? (
                  categoryIconMap[cat.icon]
                ) : (
                  <BookOpen className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COURSES IN PROGRESS (If logged in & has active enrollments) */}
      {isAuthenticated && myEnrollments.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Cursos em Andamento
                </h2>
                <p className="text-xs text-muted-foreground">Continue de onde você parou</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-primary font-semibold"
            >
              <Link to="/profile">Ver meu painel &rarr;</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEnrollments.slice(0, 3).map((enr) => {
              const course = enr.expand?.course_id
              if (!course) return null
              return (
                <Card
                  key={enr.id}
                  className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={getCourseThumbnailUrl(course)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-white text-[10px] font-bold">
                        {enr.status === 'completed' ? 'Concluído' : 'Em andamento'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        {course.level || 'Geral'}
                      </span>
                      <h3 className="font-bold text-sm text-foreground line-clamp-1 mt-0.5">
                        {course.title}
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progresso</span>
                        <span className="font-semibold text-primary">{enr.progress || 0}%</span>
                      </div>
                      <Progress value={enr.progress || 0} className="h-2" />
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                    >
                      <Link to={`/courses/${course.slug || course.id}/learn`}>
                        <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                        {enr.progress && enr.progress > 0 ? 'Continuar Aula' : 'Iniciar Aula'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* RECOMMENDED COURSES */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Cursos Recomendados
            </h2>
            <p className="text-xs text-muted-foreground">
              Capacitações mais acessadas pelos nossos alunos
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-primary font-semibold">
            <Link to="/courses">Ver catálogo completo &rarr;</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden border-border/60 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={getCourseThumbnailUrl(course)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <Badge
                      variant="secondary"
                      className="bg-background/90 backdrop-blur text-[10px] font-bold"
                    >
                      {course.expand?.category_id?.name || 'Geral'}
                    </Badge>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <Badge className="bg-[#DA291C] text-white text-[10px] font-bold uppercase">
                      {course.price === 0 || !course.price ? 'Gratuito' : `R$ ${course.price}`}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize font-medium text-foreground/80">
                      {course.level || 'iniciante'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.duration || 10}h
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {course.rating ? course.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || course.long_description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-white transition-colors text-xs font-semibold"
                >
                  <Link to={`/courses/${course.slug || course.id}`}>
                    Ver Detalhes do Curso
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* INSTITUTIONAL VALUE PROPOSITION BANNER */}
      <section className="container mx-auto px-4 pt-4">
        <div className="rounded-3xl bg-gradient-to-r from-red-600 to-[#DA291C] text-white p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Apoie a causa do câncer infantojuvenil
            </h3>
            <p className="text-xs md:text-sm text-red-100 leading-relaxed">
              O conhecimento compartilhado aqui fortalece redes de apoio, humaniza atendimentos e
              transforma histórias em todo o país. Conclua cursos e obtenha certificados oficiais.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#FFC72C] hover:bg-[#e6b325] text-neutral-900 font-bold text-sm px-6 rounded-xl shadow-lg"
            >
              <Link to="/courses">Explorar Todos os Cursos</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-sm font-semibold rounded-xl"
            >
              <Link to="/forum">Participar do Fórum</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
