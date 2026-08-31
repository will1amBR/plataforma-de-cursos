onRecordAfterUpdateSuccess((e) => {
  const progress = e.record.getInt('progress')
  if (progress < 100) return e.next()

  const status = e.record.getString('status')
  if (status === 'completed') return e.next()

  const userId = e.record.getString('user_id')
  const courseId = e.record.getString('course_id')

  // Check if certificate already exists or was requested
  try {
    $app.findFirstRecordByFilter('certificates', 'user_id = ? && course_id = ?', userId, courseId)
    return e.next()
  } catch (_) {}

  const certCol = $app.findCollectionByNameOrId('certificates')
  const cert = new Record(certCol)
  cert.set('user_id', userId)
  cert.set('course_id', courseId)
  cert.set(
    'code',
    'IRM-' + $security.randomStringWithAlphabet(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
  )
  cert.set('status', 'pending')
  cert.set('requested_at', new Date().toISOString())
  $app.save(cert)

  const enrollment = $app.findRecordById('enrollments', e.record.id)
  enrollment.set('status', 'completed')
  enrollment.set('completed_at', new Date().toISOString())
  $app.save(enrollment)

  const course = $app.findRecordById('courses', courseId)
  const courseTitle = course.getString('title')

  const achCol = $app.findCollectionByNameOrId('achievements')
  const ach = new Record(achCol)
  ach.set('user_id', userId)
  ach.set('title', 'Curso Concluído: ' + courseTitle)
  ach.set('description', 'Parabéns por concluir 100% do curso!')
  ach.set('icon', 'award')
  ach.set('earned_at', new Date().toISOString())
  $app.save(ach)

  const notifCol = $app.findCollectionByNameOrId('notifications')
  const notif = new Record(notifCol)
  notif.set('user_id', userId)
  notif.set('type', 'certificate')
  notif.set('title', 'Certificado Solicitado para Análise')
  notif.set(
    'content',
    'Você concluiu o curso ' +
      courseTitle +
      '. Seu certificado foi enviado para aprovação da equipe do Instituto Ronald McDonald.',
  )
  notif.set('read', false)
  notif.set('link', '/profile?tab=certificates')
  $app.save(notif)

  return e.next()
}, 'enrollments')
