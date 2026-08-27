migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const coursesCol = app.findCollectionByNameOrId('courses')
    const tasksCol = app.findCollectionByNameOrId('tasks')
    const taskSubmissionsCol = app.findCollectionByNameOrId('task_submissions')
    const courseQuestionsCol = app.findCollectionByNameOrId('course_questions')

    // Find admin/instructor user
    let adminUser = null
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
      adminUser.set(
        'bio',
        'Especialista em Saúde Infantojuvenil e Gestão Social no Instituto Ronald McDonald.',
      )
      adminUser.set(
        'specialties',
        'Nutrição Pediátrica, Gestão do Terceiro Setor, Humanização Hospitalar',
      )
      app.save(adminUser)
    } catch (_) {}

    // Find courses
    let coursesList = []
    try {
      coursesList = app.findRecordsByFilter('courses', 'published = true', 'created', 10, 0)
    } catch (_) {}

    if (coursesList.length === 0 || !adminUser) return

    const course1 = coursesList[0]
    const course2 = coursesList[1] || coursesList[0]

    // Seed sample tasks
    try {
      const existingTask = app.findFirstRecordByData(
        'tasks',
        'title',
        'Estudo de Caso: Plano Nutricional em Tratamento Oncológico',
      )
    } catch (_) {
      const task1 = new Record(tasksCol)
      task1.set('course', course1.id)
      task1.set('title', 'Estudo de Caso: Plano Nutricional em Tratamento Oncológico')
      task1.set(
        'description',
        'Desenvolva um plano alimentar adaptado para uma criança de 7 anos em fase de quimioterapia, considerando paladar e necessidades calóricas. Entregue um texto explicativo ou link para documento.',
      )
      task1.set('due_date', new Date(Date.now() + 7 * 86400000).toISOString())
      task1.set('max_grade', 10)
      task1.set('attachment_url', 'https://institutoronald.org.br')
      app.save(task1)

      // Seed a submission for this task
      const sub1 = new Record(taskSubmissionsCol)
      sub1.set('task', task1.id)
      sub1.set('student', adminUser.id)
      sub1.set(
        'content',
        'Elaborei um cardápio fracionado em 6 refeições leves com alimentos de fácil digestão, ricos em antioxidantes e calorias nutritivas, evitando alimentos ácidos ou muito condimentados.',
      )
      sub1.set('submitted_at', new Date(Date.now() - 86400000).toISOString())
      sub1.set('grade', 9.5)
      sub1.set(
        'feedback',
        'Excelente abordagem humanizada e respeito às particularidades clínicas do paciente pediátrico.',
      )
      sub1.set('graded_at', new Date().toISOString())
      sub1.set('graded_by', adminUser.id)
      app.save(sub1)
    }

    try {
      const existingTask2 = app.findFirstRecordByData(
        'tasks',
        'title',
        'Projeto Prático: Campanha de Conscientização Local',
      )
    } catch (_) {
      const task2 = new Record(tasksCol)
      task2.set('course', course2.id)
      task2.set('title', 'Projeto Prático: Campanha de Conscientização Local')
      task2.set(
        'description',
        'Crie um plano simplificado de divulgação para o diagnóstico precoce do câncer infantil em sua comunidade ou unidade de saúde.',
      )
      task2.set('due_date', new Date(Date.now() + 14 * 86400000).toISOString())
      task2.set('max_grade', 10)
      app.save(task2)
    }

    // Seed sample course questions
    try {
      const existingQ1 = app.findFirstRecordByData(
        'course_questions',
        'question',
        'Como lidar com a perda de apetite durante a alimentação complementar?',
      )
    } catch (_) {
      const q1 = new Record(courseQuestionsCol)
      q1.set('course', course1.id)
      q1.set('student', adminUser.id)
      q1.set('question', 'Como lidar com a perda de apetite durante a alimentação complementar?')
      q1.set(
        'answer',
        'Recomendamos refeições menores com maior densidade calórica e nutrientes, sem forçar a ingestão, respeitando o ritmo e conforto da criança.',
      )
      q1.set('answered_by', adminUser.id)
      q1.set('answered_at', new Date().toISOString())
      q1.set('is_public', true)
      app.save(q1)
    }

    try {
      const existingQ2 = app.findFirstRecordByData(
        'course_questions',
        'question',
        'Qual a periodicidade ideal para avaliação das metas de sustentabilidade da Casa?',
      )
    } catch (_) {
      const q2 = new Record(courseQuestionsCol)
      q2.set('course', course2.id)
      q2.set('student', adminUser.id)
      q2.set(
        'question',
        'Qual a periodicidade ideal para avaliação das metas de sustentabilidade da Casa?',
      )
      q2.set(
        'answer',
        'O ideal é fazer uma checagem mensal com o time de voluntários e um relatório consolidado trimestral.',
      )
      q2.set('answered_by', adminUser.id)
      q2.set('answered_at', new Date().toISOString())
      q2.set('is_public', true)
      app.save(q2)
    }
  },
  (app) => {},
)
