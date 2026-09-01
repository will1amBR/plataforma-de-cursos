migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('support_tickets')

    // Permitir criação pública para formulário de contato ou por usuário logado
    col.createRule = ''

    // Atualizar campo user_id para não ser estritamente obrigatório (visitantes não logados)
    const userIdField = col.fields.getByName('user_id')
    if (userIdField) {
      userIdField.required = false
    }

    // Adicionar campos de nome e email se não existirem
    if (!col.fields.getByName('name')) {
      col.fields.add(
        new TextField({
          name: 'name',
          required: false,
        }),
      )
    }

    if (!col.fields.getByName('email')) {
      col.fields.add(
        new EmailField({
          name: 'email',
          required: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('support_tickets')
    col.createRule = "@request.auth.id != ''"
    const userIdField = col.fields.getByName('user_id')
    if (userIdField) {
      userIdField.required = true
    }
    const nameField = col.fields.getByName('name')
    if (nameField) col.fields.removeByName('name')
    const emailField = col.fields.getByName('email')
    if (emailField) col.fields.removeByName('email')
    app.save(col)
  },
)
