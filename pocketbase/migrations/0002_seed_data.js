migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const record = new Record(users)
      record.setEmail('william@korenambiental.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Administrador')
      record.set('role', 'admin')
      record.set('status', 'active')
      app.save(record)
    }

    const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
    const catCol = app.findCollectionByNameOrId('categories')

    const cats = [
      {
        name: 'Nutrição',
        slug: 'nutricao',
        icon: 'Apple',
        description: 'Cursos sobre nutrição e alimentação saudável',
      },
      {
        name: 'Sustentabilidade',
        slug: 'sustentabilidade',
        icon: 'Leaf',
        description: 'Cursos sobre sustentabilidade e meio ambiente',
      },
      {
        name: 'Gestão',
        slug: 'gestao',
        icon: 'Briefcase',
        description: 'Cursos de gestão e administração',
      },
      {
        name: 'Marketing',
        slug: 'marketing',
        icon: 'Megaphone',
        description: 'Cursos de marketing e comunicação',
      },
      {
        name: 'Educação',
        slug: 'educacao',
        icon: 'GraduationCap',
        description: 'Cursos de educação e pedagogia',
      },
    ]

    for (const cat of cats) {
      try {
        app.findFirstRecordByData('categories', 'slug', cat.slug)
      } catch (_) {
        const record = new Record(catCol)
        record.set('name', cat.name)
        record.set('slug', cat.slug)
        record.set('icon', cat.icon)
        record.set('description', cat.description)
        app.save(record)
      }
    }

    const nutricaoCat = app.findFirstRecordByData('categories', 'slug', 'nutricao').id
    const sustCat = app.findFirstRecordByData('categories', 'slug', 'sustentabilidade').id
    const gestaoCat = app.findFirstRecordByData('categories', 'slug', 'gestao').id

    const courseCol = app.findCollectionByNameOrId('courses')
    const courseData = [
      {
        title: 'Introdução à Nutrição Infantil',
        slug: 'introducao-nutricao-infantil',
        description: 'Aprenda os fundamentos da nutrição para crianças.',
        long_description:
          'Este curso aborda os principais conceitos de nutrição infantil, incluindo alimentação complementar, necessidades nutricionais e estratégias para uma alimentação saudável.',
        category_id: nutricaoCat,
        instructor_id: adminUser.id,
        level: 'iniciante',
        duration: 10,
        language: 'Português',
        price: 0,
        intro_video_url: 'https://drive.google.com/file/d/1a2b3c4d5e/preview',
        published: true,
        featured: true,
        rating: 4.5,
        enrollment_count: 120,
      },
      {
        title: 'Sustentabilidade na Prática',
        slug: 'sustentabilidade-na-pratica',
        description: 'Como implementar práticas sustentáveis no dia a dia.',
        long_description:
          'Aprenda a reduzir desperdícios, implementar reciclagem e adotar práticas sustentáveis em sua organização.',
        category_id: sustCat,
        instructor_id: adminUser.id,
        level: 'intermediario',
        duration: 15,
        language: 'Português',
        price: 0,
        intro_video_url: 'https://drive.google.com/file/d/2b3c4d5e6f/preview',
        published: true,
        featured: true,
        rating: 4.8,
        enrollment_count: 85,
      },
      {
        title: 'Gestão de Projetos Sociais',
        slug: 'gestao-de-projetos-sociais',
        description: 'Fundamentos da gestão de projetos no terceiro setor.',
        long_description:
          'Planejamento, execução e avaliação de projetos sociais com impacto comunitário.',
        category_id: gestaoCat,
        instructor_id: adminUser.id,
        level: 'avancado',
        duration: 20,
        language: 'Português',
        price: 0,
        intro_video_url: 'https://drive.google.com/file/d/3c4d5e6f7g/preview',
        published: true,
        featured: false,
        rating: 4.2,
        enrollment_count: 45,
      },
      {
        title: 'Marketing Digital para ONGs',
        slug: 'marketing-digital-ongs',
        description: 'Estratégias de marketing digital para organizações sociais.',
        long_description:
          'Aprenda a usar redes sociais, email marketing e conteúdo digital para ampliar o alcance da sua organização.',
        category_id: app.findFirstRecordByData('categories', 'slug', 'marketing').id,
        instructor_id: adminUser.id,
        level: 'intermediario',
        duration: 12,
        language: 'Português',
        price: 0,
        intro_video_url: 'https://drive.google.com/file/d/4d5e6f7g8h/preview',
        published: true,
        featured: false,
        rating: 4.6,
        enrollment_count: 67,
      },
    ]

    for (const c of courseData) {
      try {
        app.findFirstRecordByData('courses', 'slug', c.slug)
      } catch (_) {
        const record = new Record(courseCol)
        for (const [key, value] of Object.entries(c)) record.set(key, value)
        app.save(record)
      }
    }

    const lessonCol = app.findCollectionByNameOrId('lessons')
    const course1 = app.findFirstRecordByData('courses', 'slug', 'introducao-nutricao-infantil').id
    const course2 = app.findFirstRecordByData('courses', 'slug', 'sustentabilidade-na-pratica').id

    const lessonData = [
      {
        course_id: course1,
        title: 'Bem-vindo ao Curso',
        description: 'Apresentação do curso e objetivos.',
        video_url: 'https://drive.google.com/file/d/1a2b3c4d5e/preview',
        module: 'Módulo 1',
        order: 1,
        duration: 15,
      },
      {
        course_id: course1,
        title: 'Fundamentos da Nutrição',
        description: 'Conceitos básicos de nutrição infantil.',
        video_url: 'https://drive.google.com/file/d/1b2c3d4e5f/preview',
        module: 'Módulo 1',
        order: 2,
        duration: 30,
      },
      {
        course_id: course1,
        title: 'Alimentação Complementar',
        description: 'Introdução de novos alimentos.',
        video_url: 'https://drive.google.com/file/d/1c3d4e5f6g/preview',
        module: 'Módulo 2',
        order: 3,
        duration: 25,
      },
      {
        course_id: course1,
        title: 'Avaliação Final',
        description: 'Avaliação do aprendizado.',
        video_url: 'https://drive.google.com/file/d/1d4e5f6g7h/preview',
        module: 'Módulo 2',
        order: 4,
        duration: 10,
      },
      {
        course_id: course2,
        title: 'Introdução à Sustentabilidade',
        description: 'Conceitos e importância.',
        video_url: 'https://drive.google.com/file/d/2b3c4d5e6f/preview',
        module: 'Módulo 1',
        order: 1,
        duration: 20,
      },
      {
        course_id: course2,
        title: 'Práticas Sustentáveis',
        description: 'Implementação no dia a dia.',
        video_url: 'https://drive.google.com/file/d/2c4d5e6f7g/preview',
        module: 'Módulo 1',
        order: 2,
        duration: 35,
      },
    ]

    for (const l of lessonData) {
      try {
        app.findFirstRecordByFilter('lessons', 'course_id = ? && title = ?', l.course_id, l.title)
      } catch (_) {
        const record = new Record(lessonCol)
        for (const [key, value] of Object.entries(l)) record.set(key, value)
        app.save(record)
      }
    }

    const topicCol = app.findCollectionByNameOrId('forum_topics')
    const topics = [
      {
        title: 'Dúvidas sobre alimentação complementar',
        content:
          'Olá! Tenho dúvidas sobre quando introduzir novos alimentos na dieta do meu filho. Alguém pode ajudar?',
        author_id: adminUser.id,
        category: 'Nutrição',
        reply_count: 3,
        views: 45,
        hidden: false,
        pinned: false,
      },
      {
        title: 'Experiências com sustentabilidade',
        content:
          'Compartilhem aqui as práticas sustentáveis que implementaram em suas organizações!',
        author_id: adminUser.id,
        category: 'Sustentabilidade',
        reply_count: 5,
        views: 78,
        hidden: false,
        pinned: true,
      },
      {
        title: 'Gestão de voluntários',
        content: 'Como gerenciar efetivamente voluntários em projetos sociais?',
        author_id: adminUser.id,
        category: 'Gestão',
        reply_count: 2,
        views: 30,
        hidden: false,
        pinned: false,
      },
    ]

    for (const t of topics) {
      try {
        app.findFirstRecordByData('forum_topics', 'title', t.title)
      } catch (_) {
        const record = new Record(topicCol)
        for (const [key, value] of Object.entries(t)) record.set(key, value)
        app.save(record)
      }
    }

    const topic1 = app.findFirstRecordByData(
      'forum_topics',
      'title',
      'Dúvidas sobre alimentação complementar',
    ).id
    const commentCol = app.findCollectionByNameOrId('forum_comments')
    const comments = [
      {
        topic_id: topic1,
        author_id: adminUser.id,
        content:
          'A introdução deve ser feita a partir dos 6 meses, sempre com orientação do pediatra.',
        hidden: false,
      },
      {
        topic_id: topic1,
        author_id: adminUser.id,
        content: 'Concordo! É importante introduzir um alimento por vez.',
        hidden: false,
      },
    ]

    for (const c of comments) {
      try {
        app.findFirstRecordByFilter(
          'forum_comments',
          'topic_id = ? && content = ?',
          c.topic_id,
          c.content,
        )
      } catch (_) {
        const record = new Record(commentCol)
        for (const [key, value] of Object.entries(c)) record.set(key, value)
        app.save(record)
      }
    }
  },
  (app) => {},
)
