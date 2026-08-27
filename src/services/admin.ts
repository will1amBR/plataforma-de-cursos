import pb from '@/lib/pocketbase/client'
import type { Course, Lesson, ForumTopic, ForumComment, Category } from '@/types'
import type { UserRecord } from '@/contexts/AuthContext'

export interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalCertificates: number
  totalForumTopics: number
  popularCourses: Course[]
  recentEnrollments: any[]
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const [usersCount, coursesList, enrollmentsList, certificatesList, topicsList] =
      await Promise.all([
        pb.collection('users').getList(1, 1),
        pb
          .collection('courses')
          .getFullList<Course>({ sort: '-enrollment_count', expand: 'category_id' }),
        pb
          .collection('enrollments')
          .getList(1, 10, { sort: '-created', expand: 'user_id,course_id' }),
        pb.collection('certificates').getList(1, 1),
        pb.collection('forum_topics').getList(1, 1),
      ])

    return {
      totalUsers: usersCount.totalItems || 0,
      totalCourses: coursesList.length,
      totalEnrollments: enrollmentsList.totalItems || 0,
      totalCertificates: certificatesList.totalItems || 0,
      totalForumTopics: topicsList.totalItems || 0,
      popularCourses: coursesList.slice(0, 5),
      recentEnrollments: enrollmentsList.items,
    }
  } catch (err) {
    console.warn('Error fetching admin stats:', err)
    return {
      totalUsers: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      totalCertificates: 0,
      totalForumTopics: 0,
      popularCourses: [],
      recentEnrollments: [],
    }
  }
}

export const getAllCoursesAdmin = async (): Promise<Course[]> => {
  return await pb.collection('courses').getFullList<Course>({
    sort: '-created',
    expand: 'category_id,instructor_id',
  })
}

export const createCourseAdmin = async (data: Partial<Course>): Promise<Course> => {
  return await pb.collection('courses').create<Course>(data)
}

export const updateCourseAdmin = async (id: string, data: Partial<Course>): Promise<Course> => {
  return await pb.collection('courses').update<Course>(id, data)
}

export const deleteCourseAdmin = async (id: string): Promise<void> => {
  await pb.collection('courses').delete(id)
}

export const getAllLessonsAdmin = async (courseId?: string): Promise<Lesson[]> => {
  const filter = courseId ? `course_id = "${courseId}"` : ''
  return await pb.collection('lessons').getFullList<Lesson>({
    filter,
    sort: 'order',
  })
}

export const createLessonAdmin = async (data: Partial<Lesson>): Promise<Lesson> => {
  return await pb.collection('lessons').create<Lesson>(data)
}

export const updateLessonAdmin = async (id: string, data: Partial<Lesson>): Promise<Lesson> => {
  return await pb.collection('lessons').update<Lesson>(id, data)
}

export const deleteLessonAdmin = async (id: string): Promise<void> => {
  await pb.collection('lessons').delete(id)
}

export const getAllUsersAdmin = async (): Promise<UserRecord[]> => {
  return await pb.collection('users').getFullList<UserRecord>({
    sort: '-created',
  })
}

export const updateUserRoleAdmin = async (
  userId: string,
  role: 'admin' | 'moderator' | 'aluno',
  status?: 'active' | 'blocked',
): Promise<UserRecord> => {
  const data: any = { role }
  if (status) data.status = status
  return await pb.collection('users').update<UserRecord>(userId, data)
}

export const getAllForumTopicsAdmin = async (): Promise<ForumTopic[]> => {
  return await pb.collection('forum_topics').getFullList<ForumTopic>({
    sort: '-created',
    expand: 'author_id',
  })
}

export const getAllForumCommentsAdmin = async (): Promise<ForumComment[]> => {
  return await pb.collection('forum_comments').getFullList<ForumComment>({
    sort: '-created',
    expand: 'author_id,topic_id',
  })
}

export const deleteForumTopicAdmin = async (id: string): Promise<void> => {
  await pb.collection('forum_topics').delete(id)
}

export const deleteForumCommentAdmin = async (id: string): Promise<void> => {
  await pb.collection('forum_comments').delete(id)
}

export const createCategoryAdmin = async (data: Partial<Category>): Promise<Category> => {
  return await pb.collection('categories').create<Category>(data)
}
