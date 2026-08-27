import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getCourses, getCategories } from '@/services/courses'
import type { Course, Category } from '@/types'
import { getCourseThumbnailUrl } from '@/types'
import {
  Search,
  BookOpen,
  Filter,
  Star,
  Clock,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const currentCategory = searchParams.get('category') || 'all'
  const currentLevel = searchParams.get('level') || 'all'
  const currentPrice = searchParams.get('price') || 'all'
  const currentSort = searchParams.get('sort') || '-created'
  const initialSearch = searchParams.get('search') || ''

  const [searchInput, setSearchInput] = useState(initialSearch)

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await getCategories()
      setCategories(cats)
    }
    fetchCats()
  }, [])

  useEffect(() => {
    const fetchFilteredCourses = async () => {
      setLoading(true)
      try {
        const queryParams: any = {
          categoryId: currentCategory !== 'all' ? currentCategory : undefined,
          level: currentLevel !== 'all' ? currentLevel : undefined,
          search: searchParams.get('search') || undefined,
          sort: currentSort,
        }
        const list = await getCourses(queryParams)
        setCourses(list)
      } catch (err) {
        console.error('Error fetching courses list:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredCourses()
  }, [searchParams, currentCategory, currentLevel, currentSort])

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all') {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    setSearchParams(newParams)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim())
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams)
  }

  const clearAllFilters = () => {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  // Filter price client-side if needed (0 = free, >0 = paid)
  const displayCourses = useMemo(() => {
    if (currentPrice === 'free') {
      return courses.filter((c) => !c.price || c.price === 0)
    }
    if (currentPrice === 'paid') {
      return courses.filter((c) => c.price && c.price > 0)
    }
    return courses
  }, [courses, currentPrice])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 flex-1">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Plataforma EAD Instituto Ronald McDonald</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Catálogo de Cursos & Capacitações
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Descubra cursos criados para aprimorar conhecimentos em oncologia pediátrica, nutrição
          infantil, voluntariado, gestão social e práticas sustentáveis.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar por título, palavra-chave ou conteúdo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-10 text-sm rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs md:text-sm px-6 rounded-xl"
          >
            Buscar
          </Button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Categoria</label>
            <Select
              value={currentCategory}
              onValueChange={(val) => handleFilterChange('category', val)}
            >
              <SelectTrigger className="h-9 text-xs rounded-lg">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Nível</label>
            <Select value={currentLevel} onValueChange={(val) => handleFilterChange('level', val)}>
              <SelectTrigger className="h-9 text-xs rounded-lg">
                <SelectValue placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Preço</label>
            <Select value={currentPrice} onValueChange={(val) => handleFilterChange('price', val)}>
              <SelectTrigger className="h-9 text-xs rounded-lg">
                <SelectValue placeholder="Todos os preços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Ordenar por</label>
            <Select value={currentSort} onValueChange={(val) => handleFilterChange('sort', val)}>
              <SelectTrigger className="h-9 text-xs rounded-lg">
                <SelectValue placeholder="Mais recentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created">Mais Recentes</SelectItem>
                <SelectItem value="-enrollment_count">Mais Populares</SelectItem>
                <SelectItem value="-rating">Melhor Avaliados</SelectItem>
                <SelectItem value="title">Ordem Alfabética (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display & Clear Button */}
        {(currentCategory !== 'all' ||
          currentLevel !== 'all' ||
          currentPrice !== 'all' ||
          searchParams.get('search')) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs">
            <span className="text-muted-foreground font-medium">Filtros ativos:</span>
            {currentCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                {categories.find((c) => c.id === currentCategory)?.name || 'Categoria'}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange('category', 'all')}
                />
              </Badge>
            )}
            {currentLevel !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-[11px] capitalize">
                Nível: {currentLevel}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange('level', 'all')}
                />
              </Badge>
            )}
            {currentPrice !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                {currentPrice === 'free' ? 'Gratuitos' : 'Pagos'}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange('price', 'all')}
                />
              </Badge>
            )}
            {searchParams.get('search') && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                Busca: "{searchParams.get('search')}"
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange('search', 'all')}
                />
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-primary hover:underline font-semibold ml-2 text-xs"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl border bg-card p-4 space-y-3 animate-pulse">
              <div className="aspect-video bg-muted rounded-xl" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-3xl p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Nenhum curso encontrado</h3>
          <p className="text-xs text-muted-foreground">
            Tente ajustar os filtros ou os termos da sua pesquisa para encontrar capacitações
            disponíveis.
          </p>
          <Button onClick={clearAllFilters} variant="outline" size="sm">
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Mostrando <strong>{displayCourses.length}</strong>{' '}
            {displayCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden border-border/60 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
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

                  <CardContent className="p-4 space-y-2.5">
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

                    {course.expand?.instructor_id?.name && (
                      <p className="text-[11px] text-muted-foreground pt-1">
                        Instrutor(a):{' '}
                        <span className="font-semibold text-foreground">
                          {course.expand.instructor_id.name}
                        </span>
                      </p>
                    )}
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
                  >
                    <Link to={`/courses/${course.slug || course.id}`}>
                      Ver Curso
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
