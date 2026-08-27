import pb from '@/lib/pocketbase/client'
import type { Certificate, AchievementItem, NotificationItem } from '@/types'

export const getUserCertificates = async (): Promise<Certificate[]> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) return []

  try {
    return await pb.collection('certificates').getFullList<Certificate>({
      filter: `user_id = "${currentUserId}"`,
      sort: '-issued_at',
      expand: 'course_id',
    })
  } catch (err) {
    console.warn('Error fetching certificates:', err)
    return []
  }
}

export const getUserAchievements = async (): Promise<AchievementItem[]> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) return []

  try {
    return await pb.collection('achievements').getFullList<AchievementItem>({
      filter: `user_id = "${currentUserId}"`,
      sort: '-earned_at',
    })
  } catch (err) {
    console.warn('Error fetching achievements:', err)
    return []
  }
}

export const getUserNotifications = async (): Promise<NotificationItem[]> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) return []

  try {
    return await pb.collection('notifications').getFullList<NotificationItem>({
      filter: `user_id = "${currentUserId}"`,
      sort: '-created',
    })
  } catch (err) {
    console.warn('Error fetching notifications:', err)
    return []
  }
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    await pb.collection('notifications').update(id, { read: true })
  } catch (err) {
    console.warn('Error updating notification:', err)
  }
}

export const markAllNotificationsAsRead = async (
  notifications: NotificationItem[],
): Promise<void> => {
  const unread = notifications.filter((n) => !n.read)
  await Promise.all(
    unread.map((n) =>
      pb
        .collection('notifications')
        .update(n.id, { read: true })
        .catch(() => {}),
    ),
  )
}
