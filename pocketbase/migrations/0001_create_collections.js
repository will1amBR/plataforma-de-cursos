migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({ name: 'role', values: ['admin', 'moderator', 'aluno'], maxSelect: 1 }),
      )
    }
    if (!usersCol.fields.getByName('status')) {
      usersCol.fields.add(
        new SelectField({ name: 'status', values: ['active', 'blocked'], maxSelect: 1 }),
      )
    }
    if (!usersCol.fields.getByName('blocked_users')) {
      usersCol.fields.add(
        new RelationField({
          name: 'blocked_users',
          collectionId: '_pb_users_auth_',
          maxSelect: 100,
        }),
      )
    }
    app.save(usersCol)

    const userId = '_pb_users_auth_'

    const categories = new Collection({
      name: 'categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)'],
    })
    app.save(categories)

    const catId = app.findCollectionByNameOrId('categories').id

    const courses = new Collection({
      name: 'courses',
      type: 'base',
      listRule:
        "published = true || (@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'moderator'))",
      viewRule:
        "published = true || (@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'moderator'))",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'long_description', type: 'text' },
        { name: 'category_id', type: 'relation', collectionId: catId, maxSelect: 1 },
        { name: 'instructor_id', type: 'relation', collectionId: userId, maxSelect: 1 },
        {
          name: 'level',
          type: 'select',
          values: ['iniciante', 'intermediario', 'avancado'],
          maxSelect: 1,
        },
        { name: 'duration', type: 'number' },
        { name: 'language', type: 'text' },
        { name: 'price', type: 'number' },
        {
          name: 'cover_image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'intro_video_url', type: 'text' },
        { name: 'published', type: 'bool' },
        { name: 'featured', type: 'bool' },
        { name: 'rating', type: 'number' },
        { name: 'enrollment_count', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_courses_slug ON courses (slug)',
        'CREATE INDEX idx_courses_category ON courses (category_id)',
        'CREATE INDEX idx_courses_published_featured ON courses (published, featured)',
      ],
    })
    app.save(courses)

    const courseId = app.findCollectionByNameOrId('courses').id

    const lessons = new Collection({
      name: 'lessons',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'course_id',
          type: 'relation',
          collectionId: courseId,
          maxSelect: 1,
          required: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'video_url', type: 'text', required: true },
        { name: 'module', type: 'text' },
        { name: 'order', type: 'number', onlyInt: true },
        { name: 'duration', type: 'number' },
        { name: 'transcript', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_lessons_course ON lessons (course_id)',
        'CREATE INDEX idx_lessons_order ON lessons (course_id, `order`)',
      ],
    })
    app.save(lessons)

    const enrollments = new Collection({
      name: 'enrollments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        {
          name: 'course_id',
          type: 'relation',
          collectionId: courseId,
          maxSelect: 1,
          required: true,
        },
        { name: 'status', type: 'select', values: ['active', 'completed'], maxSelect: 1 },
        { name: 'progress', type: 'number', onlyInt: true, min: 0, max: 100 },
        { name: 'completed_lessons', type: 'json' },
        { name: 'completed_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_enrollments_user ON enrollments (user_id)',
        'CREATE INDEX idx_enrollments_course ON enrollments (course_id)',
        'CREATE UNIQUE INDEX idx_enrollments_user_course ON enrollments (user_id, course_id)',
      ],
    })
    app.save(enrollments)

    const certificates = new Collection({
      name: 'certificates',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        {
          name: 'course_id',
          type: 'relation',
          collectionId: courseId,
          maxSelect: 1,
          required: true,
        },
        { name: 'code', type: 'text', required: true },
        { name: 'issued_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_certificates_code ON certificates (code)',
        'CREATE INDEX idx_certificates_user ON certificates (user_id)',
      ],
    })
    app.save(certificates)

    const forumTopics = new Collection({
      name: 'forum_topics',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (hidden = false || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      viewRule:
        "@request.auth.id != '' && (hidden = false || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (author_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'author_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        { name: 'category', type: 'text' },
        { name: 'reply_count', type: 'number', onlyInt: true },
        { name: 'views', type: 'number', onlyInt: true },
        { name: 'hidden', type: 'bool' },
        { name: 'pinned', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_forum_topics_author ON forum_topics (author_id)',
        'CREATE INDEX idx_forum_topics_created ON forum_topics (created DESC)',
      ],
    })
    app.save(forumTopics)

    const topicId = app.findCollectionByNameOrId('forum_topics').id

    const forumComments = new Collection({
      name: 'forum_comments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (hidden = false || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      viewRule:
        "@request.auth.id != '' && (hidden = false || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (author_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      fields: [
        { name: 'topic_id', type: 'relation', collectionId: topicId, maxSelect: 1, required: true },
        { name: 'author_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'hidden', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_forum_comments_topic ON forum_comments (topic_id)',
        'CREATE INDEX idx_forum_comments_author ON forum_comments (author_id)',
      ],
    })
    app.save(forumComments)

    const reviews = new Collection({
      name: 'reviews',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'course_id',
          type: 'relation',
          collectionId: courseId,
          maxSelect: 1,
          required: true,
        },
        { name: 'user_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        { name: 'rating', type: 'number', onlyInt: true, min: 1, max: 5 },
        { name: 'comment', type: 'text' },
        { name: 'instructor_response', type: 'text' },
        { name: 'status', type: 'select', values: ['visible', 'hidden'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_reviews_course ON reviews (course_id)',
        'CREATE INDEX idx_reviews_user ON reviews (user_id)',
      ],
    })
    app.save(reviews)

    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (sender_id = @request.auth.id || recipient_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (sender_id = @request.auth.id || recipient_id = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (sender_id = @request.auth.id || recipient_id = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (sender_id = @request.auth.id || recipient_id = @request.auth.id)",
      fields: [
        { name: 'sender_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        {
          name: 'recipient_id',
          type: 'relation',
          collectionId: userId,
          maxSelect: 1,
          required: true,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'read', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_messages_sender ON messages (sender_id)',
        'CREATE INDEX idx_messages_recipient ON messages (recipient_id)',
        'CREATE INDEX idx_messages_created ON messages (created DESC)',
      ],
    })
    app.save(messages)

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        {
          name: 'type',
          type: 'select',
          values: ['message', 'forum', 'course', 'certificate', 'achievement', 'system'],
          maxSelect: 1,
        },
        { name: 'title', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'read', type: 'bool' },
        { name: 'link', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_user ON notifications (user_id)',
        'CREATE INDEX idx_notifications_read ON notifications (user_id, read)',
      ],
    })
    app.save(notifications)

    const achievements = new Collection({
      name: 'achievements',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'text' },
        { name: 'earned_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_achievements_user ON achievements (user_id)'],
    })
    app.save(achievements)

    const supportTickets = new Collection({
      name: 'support_tickets',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'moderator')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: userId, maxSelect: 1, required: true },
        { name: 'subject', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        {
          name: 'attachment',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        {
          name: 'status',
          type: 'select',
          values: ['new', 'in_progress', 'resolved'],
          maxSelect: 1,
        },
        { name: 'response', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_support_user ON support_tickets (user_id)',
        'CREATE INDEX idx_support_status ON support_tickets (status)',
      ],
    })
    app.save(supportTickets)
  },
  (app) => {
    const cols = [
      'support_tickets',
      'achievements',
      'notifications',
      'messages',
      'reviews',
      'forum_comments',
      'forum_topics',
      'certificates',
      'enrollments',
      'lessons',
      'courses',
      'categories',
    ]
    for (const name of cols) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (e) {}
    }
  },
)
