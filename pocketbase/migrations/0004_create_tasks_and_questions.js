migrate(
  (app) => {
    // 1. Update users collection with bio, specialties and updated role values
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Update role select values to include student, instructor, moderator, admin, aluno
    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['admin', 'moderator', 'instructor', 'aluno', 'student']
      roleField.maxSelect = 1
    }

    if (!users.fields.getByName('bio')) {
      users.fields.add(new TextField({ name: 'bio' }))
    }

    if (!users.fields.getByName('specialties')) {
      users.fields.add(new TextField({ name: 'specialties' }))
    }

    app.save(users)

    // 2. Create tasks collection
    const coursesCol = app.findCollectionByNameOrId('courses')
    const tasksCol = new Collection({
      name: 'tasks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'instructor' || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'instructor' || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'instructor' || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      fields: [
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: coursesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'date' },
        { name: 'attachment_url', type: 'text' },
        { name: 'max_grade', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_tasks_course ON tasks (course)'],
    })
    app.save(tasksCol)

    // 3. Create task_submissions collection
    const taskSubmissionsCol = new Collection({
      name: 'task_submissions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule:
        "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin')",
      fields: [
        {
          name: 'task',
          type: 'relation',
          required: true,
          collectionId: tasksCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'student',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'content', type: 'text' },
        { name: 'attachment_url', type: 'text' },
        { name: 'submitted_at', type: 'date' },
        { name: 'grade', type: 'number' },
        { name: 'feedback', type: 'text' },
        { name: 'graded_at', type: 'date' },
        { name: 'graded_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_task_submissions_task ON task_submissions (task)',
        'CREATE INDEX idx_task_submissions_student ON task_submissions (student)',
      ],
    })
    app.save(taskSubmissionsCol)

    // 4. Create course_questions collection
    const courseQuestionsCol = new Collection({
      name: 'course_questions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule:
        "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin')",
      fields: [
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: coursesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'student',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'text' },
        { name: 'answered_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'answered_at', type: 'date' },
        { name: 'is_public', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_course_questions_course ON course_questions (course)',
        'CREATE INDEX idx_course_questions_student ON course_questions (student)',
      ],
    })
    app.save(courseQuestionsCol)
  },
  (app) => {
    try {
      const qCol = app.findCollectionByNameOrId('course_questions')
      app.delete(qCol)
    } catch (_) {}

    try {
      const sCol = app.findCollectionByNameOrId('task_submissions')
      app.delete(sCol)
    } catch (_) {}

    try {
      const tCol = app.findCollectionByNameOrId('tasks')
      app.delete(tCol)
    } catch (_) {}
  },
)
