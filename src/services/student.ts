import pb from '@/lib/pocketbase/client'
import type { Task, TaskSubmission, CourseQuestion } from '@/types'

// ---------------------------------------------------------------------------
// TAREFAS DO ALUNO
// ---------------------------------------------------------------------------

export interface StudentTaskItem {
  task: Task
  submission: TaskSubmission | null
  /** status consolidado da tarefa para o aluno */
  status: 'pending' | 'submitted' | 'graded'
}

export const getTaskStatus = (item: StudentTaskItem): StudentTaskItem['status'] => {
  if (item.submission && item.submission.grade !== undefined && item.submission.grade !== null) {
    return 'graded'
  }
  if (item.submission) return 'submitted'
  return 'pending'
}

/**
 * Busca TODAS as tarefas das aulas dos cursos em que o aluno está inscrito,
 * junto com a sua entrega (quando houver). Tarefas pendentes (sem entrega)
 * também são retornadas — não apenas as já entregues.
 */
export const getStudentTasks = async (): Promise<StudentTaskItem[]> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) return []

  try {
    const enrollments = await pb.collection('enrollments').getFullList<{
      id: string
      course_id: string
    }>({
      filter: `user_id = "${currentUserId}"`,
    })

    const courseIds = [...new Set(enrollments.map((e) => e.course_id))]
    if (courseIds.length === 0) return []

    const tasksFilter = courseIds.map((id) => `course = "${id}"`).join(' || ')
    const tasks = await pb.collection('tasks').getFullList<Task>({
      filter: `(${tasksFilter})`,
      sort: 'due_date,-created',
      expand: 'course',
    })
    if (tasks.length === 0) return []

    const tasksIds = tasks.map((t) => t.id)
    const subsFilter = tasksIds.map((id) => `task = "${id}"`).join(' || ')
    const submissions = await pb
      .collection('task_submissions')
      .getFullList<TaskSubmission>({
        filter: `student = "${currentUserId}" && (${subsFilter})`,
        expand: 'task,graded_by',
      })
      .catch(() => [] as TaskSubmission[])

    const subsByTask = new Map<string, TaskSubmission>()
    for (const sub of submissions) {
      // mantém a entrega mais recente por tarefa (sort -created)
      if (!subsByTask.has(sub.task)) subsByTask.set(sub.task, sub)
    }

    return tasks.map((task) => {
      const item: StudentTaskItem = {
        task,
        submission: subsByTask.get(task.id) || null,
        status: 'pending',
      }
      item.status = getTaskStatus(item)
      return item
    })
  } catch (err) {
    console.warn('Error fetching student tasks:', err)
    return []
  }
}

/** Envia (ou reenvia) a entrega de uma tarefa do aluno. */
export const submitStudentTask = async (params: {
  task: string
  content?: string
  attachment_url?: string
}): Promise<TaskSubmission> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) throw new Error('Você precisa estar logado para entregar a tarefa.')

  const existing = await pb
    .collection('task_submissions')
    .getList<TaskSubmission>(1, 1, {
      filter: `task = "${params.task}" && student = "${currentUserId}"`,
    })
    .catch(() => null)

  if (existing && existing.items.length > 0) {
    return await pb.collection('task_submissions').update<TaskSubmission>(existing.items[0].id, {
      content: params.content || '',
      attachment_url: params.attachment_url || '',
      submitted_at: new Date().toISOString(),
    })
  }

  return await pb.collection('task_submissions').create<TaskSubmission>({
    task: params.task,
    student: currentUserId,
    content: params.content || '',
    attachment_url: params.attachment_url || '',
    submitted_at: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// PERGUNTAS DO ALUNO
// ---------------------------------------------------------------------------

/** Busca TODAS as perguntas já feitas pelo aluno logado, com a resposta do professor quando houver. */
export const getStudentQuestions = async (): Promise<CourseQuestion[]> => {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) return []

  try {
    return await pb.collection('course_questions').getFullList<CourseQuestion>({
      filter: `student = "${currentUserId}"`,
      sort: '-created',
      expand: 'course,answered_by',
    })
  } catch (err) {
    console.warn('Error fetching student questions:', err)
    return []
  }
}
