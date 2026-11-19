import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

/**
 * Mensageria assíncrona (estilo inbox) entre aluno e professor.
 * Alinhado ao schema live da coleção `messages`:
 * sender_id (relation users), recipient_id (relation users), content (text), read (bool)
 */

export interface MessageRecord extends RecordModel {
  sender_id: string
  recipient_id: string
  content: string
  read?: boolean
  expand?: {
    sender_id?: { id: string; name?: string; avatar?: string; role?: string }
    recipient_id?: { id: string; name?: string; avatar?: string; role?: string }
  }
}

export interface ConversationSummary {
  otherUser: { id: string; name?: string; avatar?: string }
  lastMessage: MessageRecord
  unreadCount: number
}

const INSTRUCTOR_ROLES = ['instructor', 'admin', 'moderator']

const isInstructorRecord = (role?: string) => INSTRUCTOR_ROLES.includes(role || '')

/** Cria a notificação in-app para o destinatário da mensagem. */
const notifyRecipient = async (message: MessageRecord, senderName: string) => {
  try {
    const recipient = await pb.collection('users').getOne(message.recipient_id)
    const snippet =
      message.content.length > 90 ? `${message.content.slice(0, 90)}…` : message.content
    const link = isInstructorRecord(recipient.role)
      ? '/professor?tab=mensagens'
      : '/perfil?tab=mensagens'
    await pb.collection('notifications').create({
      user_id: message.recipient_id,
      type: 'message',
      title: `Nova mensagem de ${senderName}`,
      content: snippet,
      link,
    })
  } catch (err) {
    // Notificação é best-effort: não deve falhar o envio da mensagem.
    console.warn('Falha ao criar notificação de mensagem:', err)
  }
}

export const sendMessage = async (
  recipientId: string,
  content: string,
  senderName?: string,
): Promise<MessageRecord> => {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('A mensagem não pode estar vazia.')

  const created = await pb.collection('messages').create<MessageRecord>({
    sender_id: pb.authStore.record?.id,
    recipient_id: recipientId,
    content: trimmed,
  })

  const withExpand: MessageRecord = {
    ...created,
    expand: {
      sender_id: {
        id: pb.authStore.record?.id || '',
        name: senderName || 'Usuário',
      },
    },
  }

  await notifyRecipient(withExpand, senderName || 'Um usuário')
  return withExpand
}

/** Lista de conversas do usuário logado (estilo inbox), mais recente primeiro. */
export const getConversations = async (): Promise<ConversationSummary[]> => {
  const me = pb.authStore.record?.id
  if (!me) return []

  const msgs = await pb.collection('messages').getFullList<MessageRecord>({
    filter: `sender_id = "${me}" || recipient_id = "${me}"`,
    sort: '-created',
    expand: 'sender_id,recipient_id',
  })

  const map = new Map<string, ConversationSummary>()
  for (const m of msgs) {
    const otherId = m.sender_id === me ? m.recipient_id : m.sender_id
    const otherExpand =
      m.expand?.sender_id?.id === otherId ? m.expand?.sender_id : m.expand?.recipient_id
    if (!map.has(otherId)) {
      map.set(otherId, {
        otherUser: otherExpand
          ? { id: otherExpand.id, name: otherExpand.name, avatar: otherExpand.avatar }
          : { id: otherId },
        lastMessage: m,
        unreadCount: 0,
      })
    }
    if (m.recipient_id === me && !m.read) {
      const conv = map.get(otherId)!
      conv.unreadCount += 1
    }
  }

  return Array.from(map.values())
}

/** Histórico da conversa com um usuário; marca como lidas as recebidas não lidas. */
export const getThread = async (otherUserId: string): Promise<MessageRecord[]> => {
  const me = pb.authStore.record?.id
  if (!me || !otherUserId) return []

  const msgs = await pb.collection('messages').getFullList<MessageRecord>({
    filter: `(sender_id = "${me}" && recipient_id = "${otherUserId}") || (sender_id = "${otherUserId}" && recipient_id = "${me}")`,
    sort: 'created',
    expand: 'sender_id,recipient_id',
  })

  const unread = msgs.filter((m) => m.recipient_id === me && !m.read)
  if (unread.length > 0) {
    await Promise.all(
      unread.map((m) =>
        pb
          .collection('messages')
          .update(m.id, { read: true })
          .catch(() => {}),
      ),
    )
  }

  return msgs
}

/** Total de mensagens não lidas (usado no sininho/badge). */
export const getUnreadMessagesCount = async (): Promise<number> => {
  const me = pb.authStore.record?.id
  if (!me) return 0
  try {
    const result = await pb.collection('messages').getList<MessageRecord>(1, 1, {
      filter: `recipient_id = "${me}" && read = false`,
    })
    return result.totalItems
  } catch (err) {
    console.warn('Erro ao contar mensagens não lidas:', err)
    return 0
  }
}
