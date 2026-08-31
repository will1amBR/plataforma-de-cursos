import pb from '@/lib/pocketbase/client'
import type { Course, Category, Lesson, Enrollment, Review } from '@/types'

export const getCourses = async (params?: {
  categoryId?: string
  level?: string
  search?: string
  sort?: string
  featured?: boolean
  limit?: number
}): Promise<Course[]> => {
  const filters: string[] = ['published = true']

  if (params?.categoryId && params.categoryId !== 'all') {
    filters.push(`category_id = "${params.categoryId}"`)
  }
  if (params?.level && params.level !== 'all') {
    filters.push(`level = "${params.level}"`)
  }
  if (params?.search) {
    filters.push(`(title ~ "${params.search}" || description ~ "${params.search}")`)
  }
  if (params?.featured) {
    filters.push('featured = true')
  }

  const sortOption = params?.sort || '-created'

  const records = await pb.collection('courses').getList<Course>(1, params?.limit || 50, {
    filter: filters.join(' && '),
    sort: sortOption,
    expand: 'category_id,instructor_id',
  })

  return records.items
}

export const getCourseBySlugOrId = async (slugOrId: string): Promise<Course | null> => {
  try {
    try {
      return await pb.collection('courses').getOne<Course>(slugOrId, {
        expand: 'category_id,instructor_id',
      })
    } catch {
      return await pb.collection('courses').getFirstListItem<Course>(`slug = "${slugOrId}"`, {
        expand: 'category_id,instructor_id',
      })
    }
  } catch (err) {
    console.warn('Error fetching course:', err)
    return null
  }
}

export const getCourseLessons = async (courseId: string): Promise<Lesson[]> => {
  try {
    const records = await pb.collection('lessons').getFullList<Lesson>({
      filter: `course_id = "${courseId}"`,
      sort: 'order',
    })
    return records
  } catch (err) {
    console.warn('Error fetching lessons:', err)
    return []
  }
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const records = await pb.collection('categories').getFullList<Category>({
      sort: 'name',
    })
    return records
  } catch (err) {
    console.warn('Error fetching categories:', err)
    return []
  }
}

export const getCourseReviews = async (courseId: string): Promise<Review[]> => {
  try {
    const records = await pb.collection('reviews').getFullList<Review>({
      filter: `course_id = "${courseId}" && status = "visible"`,
      sort: '-created',
      expand: 'user_id',
    })
    return records
  } catch (err) {
    console.warn('Error fetching reviews:', err)
    return []
  }
}

export const addReview = async (
  courseId: string,
  rating: number,
  comment: string,
): Promise<Review> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) throw new Error('Não autenticado')

  return await pb.collection('reviews').create<Review>({
    course_id: courseId,
    user_id: currentUserId,
    rating,
    comment,
    status: 'visible',
  })
}

export const getUserEnrollment = async (courseId: string): Promise<Enrollment | null> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) return null

  try {
    const rec = await pb
      .collection('enrollments')
      .getFirstListItem<Enrollment>(`user_id = "${currentUserId}" && course_id = "${courseId}"`)
    return rec
  } catch {
    return null
  }
}

export const enrollInCourse = async (courseId: string): Promise<Enrollment> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) throw new Error('Faça login para se matricular')

  const existing = await getUserEnrollment(courseId)
  if (existing) return existing

  const newEnrollment = await pb.collection('enrollments').create<Enrollment>({
    user_id: currentUserId,
    course_id: courseId,
    status: 'active',
    progress: 0,
    completed_lessons: [],
  })

  // Increment enrollment count if course allows update
  try {
    const course = await pb.collection('courses').getOne<Course>(courseId)
    await pb.collection('courses').update(courseId, {
      enrollment_count: (course.enrollment_count || 0) + 1,
    })
  } catch {
    // Non-admin might not have permission to update course directly, fine
  }

  return newEnrollment
}

export const updateLessonProgress = async (
  enrollmentId: string,
  lessonId: string,
  totalLessons: number,
): Promise<Enrollment> => {
  const current = await pb.collection('enrollments').getOne<Enrollment>(enrollmentId)
  const completedList: string[] = Array.isArray(current.completed_lessons)
    ? [...current.completed_lessons]
    : []

  if (!completedList.includes(lessonId)) {
    completedList.push(lessonId)
  }

  const calculatedProgress =
    totalLessons > 0 ? Math.round((completedList.length / totalLessons) * 100) : 100
  const isCompleted = calculatedProgress >= 100

  const updateData: Partial<Enrollment> = {
    completed_lessons: completedList,
    progress: Math.min(100, calculatedProgress),
    status: isCompleted ? 'completed' : 'active',
    ...(isCompleted && !current.completed_at ? { completed_at: new Date().toISOString() } : {}),
  }

  const updated = await pb.collection('enrollments').update<Enrollment>(enrollmentId, updateData)

  // If newly completed, request certificate (status: pending) if not exists
  if (isCompleted && current.status !== 'completed') {
    try {
      // Check if already requested or exists
      const existingCerts = await pb.collection('certificates').getList(1, 1, {
        filter: `user_id = "${current.user_id}" && course_id = "${current.course_id}"`,
      })

      if (existingCerts.totalItems === 0) {
        const code = `IRM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        await pb.collection('certificates').create({
          user_id: current.user_id,
          course_id: current.course_id,
          code,
          status: 'pending',
          requested_at: new Date().toISOString(),
        })

        // Also add achievement for completing lessons
        await pb.collection('achievements').create({
          user_id: current.user_id,
          title: 'Curso Concluído com Sucesso!',
          description:
            'Você finalizou todas as aulas deste curso. Certificado aguardando aprovação do Instituto.',
          icon: 'Award',
          earned_at: new Date().toISOString(),
        })

        // Notification for certificate pending
        await pb.collection('notifications').create({
          user_id: current.user_id,
          type: 'certificate',
          title: 'Certificado Solicitado!',
          content:
            'Você concluiu todas as aulas. Seu certificado foi enviado para aprovação do Instituto Ronald McDonald.',
          read: false,
          link: '/profile?tab=certificates',
        })
      }
    } catch (err) {
      console.warn('Certificate auto-generate error:', err)
    }
  }

  return updated
}

export const getUserEnrollments = async (): Promise<Enrollment[]> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) return []

  try {
    const list = await pb.collection('enrollments').getFullList<Enrollment>({
      filter: `user_id = "${currentUserId}"`,
      sort: '-updated',
      expand: 'course_id,course_id.category_id',
    })
    return list
  } catch (err) {
    console.warn('Error fetching user enrollments:', err)
    return []
  }
}
