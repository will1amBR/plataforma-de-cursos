import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Send, Inbox, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import {
  getConversations,
  getThread,
  sendMessage,
  type ConversationSummary,
} from '@/services/messages'

interface MessagesPanelProps {
  /** rota para a qual a notificação do destinatário deve apontar */
  selfLink: string
  /** placeholder contextual */
  emptyHint?: string
}

export const MessagesPanel: React.FC<MessagesPanelProps> = ({ selfLink, emptyHint }) => {
  const { user, getUserAvatarUrl } = useAuth()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConv, setActiveConv] = useState<ConversationSummary | null>(null)
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof getThread>>>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const loadConversations = useCallback(async () => {
    try {
      const list = await getConversations()
      setConversations(list)
      setLoadError(false)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const openConversation = async (conv: ConversationSummary) => {
    setActiveConv(conv)
    setMessages([])
    const msgs = await getThread(conv.otherUser.id)
    setMessages(msgs)
    setConversations((prev) =>
      prev.map((c) => (c.otherUser.id === conv.otherUser.id ? { ...c, unreadCount: 0 } : c)),
    )
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConv || !draft.trim() || sending) return
    setSending(true)
    try {
      await sendMessage(activeConv.otherUser.id, draft, user?.name)
      setDraft('')
      const msgs = await getThread(activeConv.otherUser.id)
      setMessages(msgs)
      loadConversations()
    } catch (err: unknown) {
      const description = err instanceof Error ? err.message : 'Tente novamente.'
      toast({
        title: 'Erro ao enviar mensagem',
        description,
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const otherName = (conv: ConversationSummary) =>
    conv.otherUser.name || conv.otherUser.id.slice(0, 8)

  // --- LIST VIEW ---
  if (!activeConv) {
    return (
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : loadError ? (
          <div className="p-10 text-center border border-dashed border-destructive/40 rounded-2xl space-y-2">
            <MessageCircle className="w-10 h-10 text-destructive/50 mx-auto" />
            <h3 className="font-bold text-sm">Não foi possível carregar as mensagens</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Verifique sua conexão e tente de novo.
            </p>
            <Button size="sm" variant="outline" onClick={() => loadConversations()}>
              Tentar novamente
            </Button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-10 text-center border border-dashed rounded-2xl space-y-2">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-sm">Nenhuma mensagem ainda</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {emptyHint ||
                'Sua caixa de entrada está vazia. As conversas aparecerão aqui quando você trocar mensagens.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.otherUser.id}
                onClick={() => openConversation(conv)}
                className="w-full text-left p-4 border rounded-2xl bg-card hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center gap-3"
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={conv.otherUser.avatar || undefined} />
                  <AvatarFallback>{otherName(conv)[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-foreground truncate">{otherName(conv)}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(conv.lastMessage.created).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="bg-[#DA291C] text-white text-[10px] font-bold shrink-0">
                    {conv.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // --- THREAD VIEW ---
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setActiveConv(null)} title="Voltar">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src={activeConv.otherUser.avatar || undefined} />
          <AvatarFallback>{otherName(activeConv)[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-bold text-foreground">{otherName(activeConv)}</p>
      </div>

      <div className="border rounded-2xl bg-muted/20 p-4 space-y-3 max-h-[420px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
            Nenhuma mensagem nesta conversa ainda.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user?.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    mine ? 'bg-[#DA291C] text-white rounded-br-sm' : 'bg-card border rounded-bl-sm'
                  }`}
                >
                  <p>{m.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      mine ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {new Date(m.created).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2">
        <Textarea
          placeholder="Escreva sua mensagem..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="text-xs min-h-[44px]"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as unknown as React.FormEvent)
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || !draft.trim()}
          className="bg-[#DA291C] hover:bg-[#b81d12] text-white shrink-0"
          title="Enviar mensagem"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
