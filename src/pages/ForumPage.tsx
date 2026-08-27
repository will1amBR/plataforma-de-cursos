import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getForumTopics, createForumTopic, togglePinTopic, hideTopic } from '@/services/forum'
import type { ForumTopic } from '@/types'
import {
  MessageSquare,
  Search,
  PlusCircle,
  Pin,
  Eye,
  MessageCircle,
  Calendar,
  User,
  Shield,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

export const ForumPage: React.FC = () => {
  const { user, isAuthenticated, isModerator, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'pinned'>('recent')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Create Topic Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('Geral')
  const [creating, setCreating] = useState(false)

  const fetchTopics = async () => {
    setLoading(true)
    try {
      const list = await getForumTopics({
        category: selectedCategory,
        search: searchQuery,
        sort: selectedSort,
      })
      setTopics(list)
    } catch (err) {
      console.error('Error fetching forum topics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [selectedCategory, selectedSort])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTopics()
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }
    if (!newTitle.trim() || !newContent.trim()) return

    setCreating(true)
    try {
      await createForumTopic({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
      })
      toast({
        title: 'Tópico criado com sucesso!',
        description: 'Sua dúvida ou discussão já está visível para a comunidade.',
      })
      setIsDialogOpen(false)
      setNewTitle('')
      setNewContent('')
      fetchTopics()
    } catch (err: any) {
      toast({
        title: 'Erro ao criar tópico',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePin = async (topicId: string, currentPinned: boolean) => {
    try {
      await togglePinTopic(topicId, !currentPinned)
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, pinned: !currentPinned } : t)),
      )
      toast({
        title: currentPinned ? 'Tópico desfixado' : 'Tópico fixado no topo!',
      })
    } catch (err) {
      toast({ title: 'Erro ao alterar fixação', variant: 'destructive' })
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Tem certeza que deseja excluir este tópico?')) return
    try {
      await hideTopic(topicId, true)
      setTopics((prev) => prev.filter((t) => t.id !== topicId))
      toast({ title: 'Tópico removido com sucesso' })
    } catch (err) {
      toast({ title: 'Erro ao remover tópico', variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 flex-1">
      {/* Forum Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Comunidade & Interação</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Fórum de Dúvidas e Experiências
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Tire dúvidas sobre os cursos, troque experiências e conecte-se com voluntários e
            especialistas.
          </p>
        </div>

        {/* Create Topic Button with Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-xs md:text-sm h-11 px-5 shadow-md shadow-red-500/10"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault()
                  navigate('/auth?mode=login')
                }
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Criar Novo Tópico
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreateTopic}>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  Criar Novo Tópico de Discussão
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Compartilhe sua dúvida, relato ou sugestão com toda a comunidade Ronald.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="topic-title" className="text-xs font-semibold">
                    Título do Tópico
                  </Label>
                  <Input
                    id="topic-title"
                    placeholder="Ex: Dúvidas sobre alimentação complementar na infância"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="topic-cat" className="text-xs font-semibold">
                    Categoria
                  </Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Geral">Geral</SelectItem>
                      <SelectItem value="Nutrição">Nutrição</SelectItem>
                      <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
                      <SelectItem value="Gestão">Gestão</SelectItem>
                      <SelectItem value="Educação">Educação</SelectItem>
                      <SelectItem value="Voluntariado">Voluntariado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="topic-content" className="text-xs font-semibold">
                    Conteúdo / Descrição Detalhada
                  </Label>
                  <Textarea
                    id="topic-content"
                    placeholder="Explique sua dúvida com o máximo de detalhes..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
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
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {creating ? 'Publicando...' : 'Publicar Tópico'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tópicos por palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10 text-xs rounded-xl w-36">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Nutrição">Nutrição</SelectItem>
              <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
              <SelectItem value="Gestão">Gestão</SelectItem>
              <SelectItem value="Educação">Educação</SelectItem>
              <SelectItem value="Geral">Geral</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSort} onValueChange={(val: any) => setSelectedSort(val)}>
            <SelectTrigger className="h-10 text-xs rounded-xl w-40">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="popular">Mais Populares</SelectItem>
              <SelectItem value="pinned">Fixados Primeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-4 border rounded-2xl bg-card animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-3xl p-8 space-y-3 max-w-md mx-auto">
          <MessageSquare className="w-12 h-12 text-primary mx-auto opacity-80" />
          <h3 className="font-bold text-base">Nenhum tópico encontrado</h3>
          <p className="text-xs text-muted-foreground">
            Seja o primeiro a iniciar uma conversa ou tente buscar outros termos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className={`border transition-all hover:shadow-md ${
                topic.pinned
                  ? 'border-primary/40 bg-primary/[0.02] dark:bg-primary/[0.05]'
                  : 'border-border/70 hover:border-border'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar className="w-10 h-10 shrink-0 mt-0.5">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/medium?seed=${topic.author_id}`}
                    />
                    <AvatarFallback>{topic.expand?.author_id?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {topic.pinned && (
                        <Badge className="bg-primary text-white text-[10px] font-bold gap-1">
                          <Pin className="w-3 h-3" /> Fixado
                        </Badge>
                      )}
                      {topic.category && (
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {topic.category}
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        Por{' '}
                        <strong className="text-foreground font-medium">
                          {topic.expand?.author_id?.name || 'Membro da Comunidade'}
                        </strong>
                      </span>
                    </div>

                    <Link
                      to={`/forum/${topic.id}`}
                      className="text-sm md:text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {topic.title}
                    </Link>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {topic.content}
                    </p>
                  </div>
                </div>

                {/* Topic Meta & Mod Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                      {topic.reply_count || 0} respostas
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {topic.views || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isModerator && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleTogglePin(topic.id, !!topic.pinned)}
                          title={topic.pinned ? 'Desfixar tópico' : 'Fixar no topo'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => handleDeleteTopic(topic.id)}
                          title="Excluir tópico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}

                    <Button asChild size="sm" variant="outline" className="text-xs h-8 rounded-lg">
                      <Link to={`/forum/${topic.id}`}>Ver Discussão</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
