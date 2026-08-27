import pb from '@/lib/pocketbase/client'
import type { ForumTopic, ForumComment } from '@/types'

export const getForumTopics = async (params?: {
  category?: string
  search?: string
  sort?: 'recent' | 'popular' | 'pinned'
}): Promise<ForumTopic[]> => {
  const filters: string[] = ['hidden = false']

  if (params?.category && params.category !== 'all') {
    filters.push(`category = "${params.category}"`)
  }
  if (params?.search) {
    filters.push(`(title ~ "${params.search}" || content ~ "${params.search}")`)
  }

  let sortStr = '-created'
  if (params?.sort === 'popular') {
    sortStr = '-reply_count,-views,-created'
  } else if (params?.sort === 'pinned') {
    sortStr = '-pinned,-created'
  }

  try {
    const records = await pb.collection('forum_topics').getFullList<ForumTopic>({
      filter: filters.join(' && '),
      sort: sortStr,
      expand: 'author_id',
    })
    return records
  } catch (err) {
    console.warn('Error fetching forum topics:', err)
    return []
  }
}

export const getForumTopicById = async (id: string): Promise<ForumTopic | null> => {
  try {
    const topic = await pb.collection('forum_topics').getOne<ForumTopic>(id, {
      expand: 'author_id',
    })

    // Increment views defensively
    try {
      await pb.collection('forum_topics').update(id, {
        views: (topic.views || 0) + 1,
      })
    } catch {
      // ignore
    }

    return topic
  } catch (err) {
    console.warn('Error fetching topic:', err)
    return null
  }
}

export const createForumTopic = async (data: {
  title: string
  content: string
  category: string
}): Promise<ForumTopic> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) throw new Error('Não autenticado')

  return await pb.collection('forum_topics').create<ForumTopic>({
    title: data.title,
    content: data.content,
    category: data.category,
    author_id: currentUserId,
    reply_count: 0,
    views: 1,
    hidden: false,
    pinned: false,
  })
}

export const getForumComments = async (topicId: string): Promise<ForumComment[]> => {
  try {
    const records = await pb.collection('forum_comments').getFullList<ForumComment>({
      filter: `topic_id = "${topicId}" && hidden = false`,
      sort: 'created',
      expand: 'author_id',
    })
    return records
  } catch (err) {
    console.warn('Error fetching comments:', err)
    return []
  }
}

export const addForumComment = async (topicId: string, content: string): Promise<ForumComment> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) throw new Error('Não autenticado')

  const comment = await pb.collection('forum_comments').create<ForumComment>({
    topic_id: topicId,
    author_id: currentUserId,
    content,
    hidden: false,
  })

  // Increment reply count
  try {
    const topic = await pb.collection('forum_topics').getOne<ForumTopic>(topicId)
    await pb.collection('forum_topics').update(topicId, {
      reply_count: (topic.reply_count || 0) + 1,
    })
  } catch {
    // ignore
  }

  return comment
}

export const togglePinTopic = async (topicId: string, pinned: boolean): Promise<void> => {
  await pb.collection('forum_topics').update(topicId, { pinned })
}

export const hideTopic = async (topicId: string, hidden: boolean = true): Promise<void> => {
  await pb.collection('forum_topics').update(topicId, { hidden })
}

export const hideComment = async (commentId: string, hidden: boolean = true): Promise<void> => {
  await pb.collection('forum_comments').update(commentId, { hidden })
}
