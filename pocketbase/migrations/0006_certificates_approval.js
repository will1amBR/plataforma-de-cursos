migrate(
  (app) => {
    const certCol = app.findCollectionByNameOrId('certificates')

    if (!certCol.fields.getByName('status')) {
      certCol.fields.add(
        new SelectField({
          name: 'status',
          values: ['pending', 'approved', 'rejected'],
          maxSelect: 1,
        }),
      )
    }

    if (!certCol.fields.getByName('requested_at')) {
      certCol.fields.add(
        new DateField({
          name: 'requested_at',
        }),
      )
    }

    if (!certCol.fields.getByName('approved_at')) {
      certCol.fields.add(
        new DateField({
          name: 'approved_at',
        }),
      )
    }

    if (!certCol.fields.getByName('approved_by')) {
      certCol.fields.add(
        new RelationField({
          name: 'approved_by',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        }),
      )
    }

    if (!certCol.fields.getByName('rejection_reason')) {
      certCol.fields.add(
        new TextField({
          name: 'rejection_reason',
        }),
      )
    }

    // Set default status='approved' for existing certificates that had no status
    app.save(certCol)

    app
      .db()
      .newQuery("UPDATE certificates SET status = 'approved' WHERE status IS NULL OR status = ''")
      .execute()
  },
  (app) => {
    const certCol = app.findCollectionByNameOrId('certificates')
    const fieldsToRemove = [
      'status',
      'requested_at',
      'approved_at',
      'approved_by',
      'rejection_reason',
    ]
    for (const f of fieldsToRemove) {
      try {
        certCol.fields.removeByName(f)
      } catch (_) {}
    }
    app.save(certCol)
  },
)
