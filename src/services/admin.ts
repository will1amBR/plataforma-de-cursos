import pb from '@/lib/pocketbase/client'
import type { Course, Lesson, ForumTopic, ForumComment, Category, Certificate } from '@/types'
import type { UserRecord } from '@/contexts/AuthContext'

export interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalCertificates: number
  pendingCertificates: number
  approvedCertificates: number
  totalForumTopics: number
  popularCourses: Course[]
  recentEnrollments: any[]
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const [
      usersCount,
      coursesList,
      enrollmentsList,
      certificatesList,
      pendingCertsList,
      approvedCertsList,
      topicsList,
    ] = await Promise.all([
      pb.collection('users').getList(1, 1),
      pb
        .collection('courses')
        .getFullList<Course>({ sort: '-enrollment_count', expand: 'category_id' }),
      pb
        .collection('enrollments')
        .getList(1, 10, { sort: '-created', expand: 'user_id,course_id' }),
      pb.collection('certificates').getList(1, 1),
      pb.collection('certificates').getList(1, 1, { filter: 'status = "pending"' }),
      pb.collection('certificates').getList(1, 1, { filter: 'status = "approved" || status = ""' }),
      pb.collection('forum_topics').getList(1, 1),
    ])

    return {
      totalUsers: usersCount.totalItems || 0,
      totalCourses: coursesList.length,
      totalEnrollments: enrollmentsList.totalItems || 0,
      totalCertificates: certificatesList.totalItems || 0,
      pendingCertificates: pendingCertsList.totalItems || 0,
      approvedCertificates: approvedCertsList.totalItems || 0,
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
      pendingCertificates: 0,
      approvedCertificates: 0,
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
  role: 'admin' | 'moderator' | 'instructor' | 'student' | 'aluno',
  status?: string,
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

// CERTIFICATES MANAGEMENT
export const getAllCertificatesAdmin = async (statusFilter?: string): Promise<Certificate[]> => {
  const filter = statusFilter && statusFilter !== 'all' ? `status = "${statusFilter}"` : ''
  return await pb.collection('certificates').getFullList<Certificate>({
    filter,
    sort: '-created',
    expand: 'user_id,course_id,approved_by',
  })
}

export const approveCertificateAdmin = async (
  certificateId: string,
  userId: string,
  courseTitle?: string,
): Promise<Certificate> => {
  const currentUserId = pb.authStore.record?.id
  const now = new Date().toISOString()

  const updated = await pb.collection('certificates').update<Certificate>(certificateId, {
    status: 'approved',
    issued_at: now,
    approved_at: now,
    approved_by: currentUserId || null,
    rejection_reason: '',
  })

  // Send notification to the student
  try {
    await pb.collection('notifications').create({
      user_id: userId,
      type: 'certificate',
      title: '🎉 Certificado Aprovado pelo Instituto!',
      content: courseTitle
        ? `Seu certificado do curso "${courseTitle}" foi aprovado pelo Instituto Ronald McDonald e já está disponível para visualização e download.`
        : 'Seu certificado foi aprovado pelo Instituto Ronald McDonald e já está liberado no seu perfil.',
      read: false,
      link: '/profile?tab=certificates',
    })
  } catch (err) {
    console.warn('Error creating approval notification:', err)
  }

  return updated
}

export const rejectCertificateAdmin = async (
  certificateId: string,
  userId: string,
  reason: string,
  courseTitle?: string,
): Promise<Certificate> => {
  const currentUserId = pb.authStore.record?.id

  const updated = await pb.collection('certificates').update<Certificate>(certificateId, {
    status: 'rejected',
    rejection_reason: reason.trim(),
    approved_by: currentUserId || null,
  })

  // Send notification to the student explaining why
  try {
    await pb.collection('notifications').create({
      user_id: userId,
      type: 'certificate',
      title: 'Atualização sobre seu Certificado',
      content: courseTitle
        ? `A emissão do certificado para "${courseTitle}" requer atenção: ${reason.trim()}`
        : `A emissão do seu certificado foi recusada ou precisa de revisão: ${reason.trim()}`,
      read: false,
      link: '/profile?tab=certificates',
    })
  } catch (err) {
    console.warn('Error creating rejection notification:', err)
  }

  return updated
}
