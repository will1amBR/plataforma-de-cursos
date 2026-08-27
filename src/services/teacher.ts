import pb from '@/lib/pocketbase/client'
import type { Task, TaskSubmission, CourseQuestion, Course } from '@/types'

// ========================
// TASKS
// ========================

export const getTasksByCourse = async (courseId: string): Promise<Task[]> => {
  try {
    return await pb.collection('tasks').getFullList<Task>({
      filter: `course = '${courseId}'`,
      sort: '-created',
      expand: 'course',
    })
  } catch (err) {
    console.error('Error fetching course tasks:', err)
    return []
  }
}

export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    return await pb.collection('tasks').getOne<Task>(taskId, {
      expand: 'course',
    })
  } catch (err) {
    console.error('Error fetching task by ID:', err)
    return null
  }
}

export const createTask = async (data: {
  course: string
  title: string
  description?: string
  due_date?: string
  attachment_url?: string
  max_grade?: number
}): Promise<Task> => {
  return await pb.collection('tasks').create<Task>(data)
}

export const updateTask = async (
  taskId: string,
  data: Partial<{
    title: string
    description: string
    due_date: string
    attachment_url: string
    max_grade: number
  }>,
): Promise<Task> => {
  return await pb.collection('tasks').update<Task>(taskId, data)
}

export const deleteTask = async (taskId: string): Promise<boolean> => {
  return await pb.collection('tasks').delete(taskId)
}

// ========================
// SUBMISSIONS
// ========================

export const getSubmissionsByTask = async (taskId: string): Promise<TaskSubmission[]> => {
  try {
    return await pb.collection('task_submissions').getFullList<TaskSubmission>({
      filter: `task = '${taskId}'`,
      sort: '-created',
      expand: 'student,task,graded_by',
    })
  } catch (err) {
    console.error('Error fetching task submissions:', err)
    return []
  }
}

export const getStudentSubmissions = async (): Promise<TaskSubmission[]> => {
  try {
    if (!pb.authStore.record?.id) return []
    return await pb.collection('task_submissions').getFullList<TaskSubmission>({
      filter: `student = '${pb.authStore.record.id}'`,
      sort: '-created',
      expand: 'task,task.course,graded_by',
    })
  } catch (err) {
    console.error('Error fetching student submissions:', err)
    return []
  }
}

export const submitTask = async (data: {
  task: string
  content?: string
  attachment_url?: string
}): Promise<TaskSubmission> => {
  const studentId = pb.authStore.record?.id
  if (!studentId) throw new Error('Usuário não autenticado.')

  // Check if existing submission to update or create new
  const existing = await pb.collection('task_submissions').getList<TaskSubmission>(1, 1, {
    filter: `task = '${data.task}' && student = '${studentId}'`,
  })

  if (existing.items.length > 0) {
    return await pb.collection('task_submissions').update<TaskSubmission>(
      existing.items[0].id,
      {
        content: data.content,
        attachment_url: data.attachment_url,
        submitted_at: new Date().toISOString(),
      },
      { expand: 'task,student' },
    )
  }

  return await pb.collection('task_submissions').create<TaskSubmission>(
    {
      task: data.task,
      student: studentId,
      content: data.content,
      attachment_url: data.attachment_url,
      submitted_at: new Date().toISOString(),
    },
    { expand: 'task,student' },
  )
}

export const gradeSubmission = async (
  submissionId: string,
  grade: number,
  feedback?: string,
): Promise<TaskSubmission> => {
  const teacherId = pb.authStore.record?.id
  return await pb.collection('task_submissions').update<TaskSubmission>(
    submissionId,
    {
      grade,
      feedback: feedback || '',
      graded_at: new Date().toISOString(),
      graded_by: teacherId,
    },
    { expand: 'student,task,graded_by' },
  )
}

// ========================
// QUESTIONS (Q&A)
// ========================

export const getQuestionsByCourse = async (
  courseId: string,
  isInstructorOrAdmin: boolean = false,
): Promise<CourseQuestion[]> => {
  try {
    const currentUserId = pb.authStore.record?.id
    let filter = `course = '${courseId}'`

    if (!isInstructorOrAdmin && currentUserId) {
      // Students see public questions OR their own
      filter += ` && (is_public = true || student = '${currentUserId}')`
    } else if (!isInstructorOrAdmin && !currentUserId) {
      filter += ` && is_public = true`
    }

    return await pb.collection('course_questions').getFullList<CourseQuestion>({
      filter,
      sort: '-created',
      expand: 'student,answered_by,course',
    })
  } catch (err) {
    console.error('Error fetching course questions:', err)
    return []
  }
}

export const getStudentQuestions = async (): Promise<CourseQuestion[]> => {
  try {
    const currentUserId = pb.authStore.record?.id
    if (!currentUserId) return []
    return await pb.collection('course_questions').getFullList<CourseQuestion>({
      filter: `student = '${currentUserId}'`,
      sort: '-created',
      expand: 'course,answered_by',
    })
  } catch (err) {
    console.error('Error fetching student questions:', err)
    return []
  }
}

export const askQuestion = async (data: {
  course: string
  question: string
  is_public?: boolean
}): Promise<CourseQuestion> => {
  const studentId = pb.authStore.record?.id
  if (!studentId) throw new Error('Usuário não autenticado.')

  return await pb.collection('course_questions').create<CourseQuestion>(
    {
      course: data.course,
      student: studentId,
      question: data.question,
      is_public: data.is_public ?? true,
    },
    { expand: 'student,course' },
  )
}

export const answerQuestion = async (
  questionId: string,
  answer: string,
  isPublic: boolean = true,
): Promise<CourseQuestion> => {
  const teacherId = pb.authStore.record?.id
  return await pb.collection('course_questions').update<CourseQuestion>(
    questionId,
    {
      answer,
      answered_by: teacherId,
      answered_at: new Date().toISOString(),
      is_public: isPublic,
    },
    { expand: 'student,answered_by,course' },
  )
}

// ========================
// INSTRUCTOR DASHBOARD
// ========================

export const getInstructorCourses = async (instructorId?: string): Promise<Course[]> => {
  try {
    const targetId = instructorId || pb.authStore.record?.id
    if (!targetId) return []

    // Try finding courses where user is instructor_id OR if admin get all
    const userRole = (pb.authStore.record as any)?.role
    const filter = userRole === 'admin' ? '' : `instructor_id = '${targetId}'`

    return await pb.collection('courses').getFullList<Course>({
      filter,
      sort: '-created',
      expand: 'category_id',
    })
  } catch (err) {
    console.error('Error fetching instructor courses:', err)
    return []
  }
}

export const getInstructorAllTasks = async (courseIds: string[]): Promise<Task[]> => {
  if (courseIds.length === 0) return []
  try {
    const filter = courseIds.map((id) => `course = '${id}'`).join(' || ')
    return await pb.collection('tasks').getFullList<Task>({
      filter,
      sort: '-created',
      expand: 'course',
    })
  } catch (err) {
    console.error('Error fetching all instructor tasks:', err)
    return []
  }
}

export const getInstructorAllQuestions = async (courseIds: string[]): Promise<CourseQuestion[]> => {
  if (courseIds.length === 0) return []
  try {
    const filter = courseIds.map((id) => `course = '${id}'`).join(' || ')
    return await pb.collection('course_questions').getFullList<CourseQuestion>({
      filter,
      sort: '-created',
      expand: 'student,course,answered_by',
    })
  } catch (err) {
    console.error('Error fetching instructor questions:', err)
    return []
  }
}
