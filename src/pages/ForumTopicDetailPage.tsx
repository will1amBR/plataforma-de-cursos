import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  getForumTopicById,
  getForumComments,
  addForumComment,
  hideComment,
  hideTopic,
  togglePinTopic,
} from '@/services/forum'
import type { ForumTopic, ForumComment } from '@/types'
import {
  MessageSquare,
  ArrowLeft,
  Pin,
  Trash2,
  Send,
  Eye,
  MessageCircle,
  Clock,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'

export const ForumTopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated, isModerator } = useAuth()
  const navigate = useNavigate()

  const [topic, setTopic] = useState<ForumTopic | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [loading, setLoading] = useState(true)

  // New Reply State
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadTopic = async () => {
      setLoading(true)
      try {
        const [topicData, commentsData] = await Promise.all([
          getForumTopicById(id),
          getForumComments(id),
        ])
        if (topicData) {
          setTopic(topicData)
          setComments(commentsData)
        } else {
          navigate('/forum')
        }
      } catch (err) {
        console.error('Error loading forum topic detail:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTopic()
  }, [id, navigate])

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }
    if (!replyContent.trim() || !topic) return

    setSubmittingReply(true)
    try {
      const created = await addForumComment(topic.id, replyContent.trim())
      setComments((prev) => [
        ...prev,
        {
          ...created,
          expand: {
            author_id: {
              id: user?.id || '',
              name: user?.name || 'Você',
              avatar: user?.avatar,
              role: user?.role || 'aluno',
            },
          },
        },
      ])
      setReplyContent('')
      toast({
        title: 'Resposta publicada!',
        description: 'Obrigado por colaborar com a discussão.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao responder',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Excluir esta resposta?')) return
    try {
      await hideComment(commentId, true)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast({ title: 'Resposta removida' })
    } catch (err) {
      toast({ title: 'Erro ao remover resposta', variant: 'destructive' })
    }
  }

  const handleTogglePin = async () => {
    if (!topic) return
    try {
      await togglePinTopic(topic.id, !topic.pinned)
      setTopic((prev) => (prev ? { ...prev, pinned: !prev.pinned } : null))
      toast({
        title: topic.pinned ? 'Tópico desfixado' : 'Tópico fixado no topo!',
      })
    } catch (err) {
      toast({ title: 'Erro ao alterar fixação', variant: 'destructive' })
    }
  }

  const handleDeleteTopic = async () => {
    if (!topic || !confirm('Excluir este tópico permanentemente?')) return
    try {
      await hideTopic(topic.id, true)
      toast({ title: 'Tópico excluído' })
      navigate('/forum')
    } catch (err) {
      toast({ title: 'Erro ao excluir tópico', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Carregando discussão...</p>
      </div>
    )
  }

  if (!topic) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6 flex-1">
      {/* Navigation Top */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link to="/forum">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o Fórum
          </Link>
        </Button>

        {isModerator && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTogglePin} className="text-xs h-8">
              <Pin className="w-3.5 h-3.5 mr-1" />
              {topic.pinned ? 'Desfixar' : 'Fixar no Topo'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteTopic}
              className="text-xs h-8"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Excluir
            </Button>
          </div>
        )}
      </div>

      {/* Main Topic Question Card */}
      <Card className="border-border/80 shadow-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/medium?seed=${topic.author_id}`}
                />
                <AvatarFallback>{topic.expand?.author_id?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm text-foreground">
                  {topic.expand?.author_id?.name || 'Membro da Comunidade'}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Publicado em {new Date(topic.created).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {topic.pinned && (
                <Badge className="bg-primary text-white text-[10px] gap-1">
                  <Pin className="w-3 h-3" /> Fixado
                </Badge>
              )}
              {topic.category && (
                <Badge variant="secondary" className="text-xs">
                  {topic.category}
                </Badge>
              )}
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-foreground">{topic.title}</h1>

          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
            {topic.content}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-primary" />
              {comments.length} respostas
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {topic.views || 0} visualizações
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reply Submission Box */}
      <Card className="border shadow-sm bg-muted/20">
        <CardContent className="p-5">
          {isAuthenticated ? (
            <form onSubmit={handlePostReply} className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/medium?seed=${user?.id || '1'}`}
                  />
                  <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-foreground">
                  Responder como {user?.name || 'Aluno'}
                </span>
              </div>

              <Textarea
                placeholder="Escreva sua contribuição ou esclarecimento..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="text-xs min-h-[90px] bg-background"
                required
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingReply}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-5 rounded-xl"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {submittingReply ? 'Enviando...' : 'Postar Resposta'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                Você precisa estar logado para responder a este tópico.
              </p>
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white text-xs"
              >
                <Link to="/auth?mode=login">Fazer Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments / Responses List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Respostas ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="p-8 border rounded-2xl bg-card text-center text-xs text-muted-foreground">
            Ainda não há respostas nesta discussão. Seja o primeiro a responder!
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="border-border/70 shadow-sm bg-card">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={`https://img.usecurling.com/ppl/medium?seed=${comment.author_id}`}
                        />
                        <AvatarFallback>
                          {comment.expand?.author_id?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {comment.expand?.author_id?.name || 'Membro da Comunidade'}
                          </span>
                          {comment.expand?.author_id?.role === 'admin' && (
                            <Badge className="bg-red-600 text-[9px] h-4 text-white">Admin</Badge>
                          )}
                          {comment.expand?.author_id?.role === 'moderator' && (
                            <Badge className="bg-amber-600 text-[9px] h-4 text-white">
                              Moderador
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.created).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(comment.created).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {isModerator && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Excluir resposta"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed pl-10 whitespace-pre-line">
                    {comment.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
