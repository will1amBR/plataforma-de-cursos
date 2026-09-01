import pb from '@/lib/pocketbase/client'
import type { SupportTicket } from '@/types'

export interface CreateContactMessageParams {
  name: string
  email: string
  subject: string
  message: string
  userId?: string
}

export const sendContactMessage = async (
  params: CreateContactMessageParams,
): Promise<SupportTicket> => {
  const data: Record<string, any> = {
    name: params.name.trim(),
    email: params.email.trim(),
    subject: params.subject.trim(),
    description: params.message.trim(),
    status: 'new',
  }

  if (params.userId) {
    data.user_id = params.userId
  } else if (pb.authStore.isValid && pb.authStore.model?.id) {
    data.user_id = pb.authStore.model.id
  }

  const record = await pb.collection('support_tickets').create<SupportTicket>(data)
  return record
}
