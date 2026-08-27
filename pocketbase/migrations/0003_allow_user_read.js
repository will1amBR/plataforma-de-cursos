migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    // Allow authenticated users to view users (for displaying topic author name, instructor name, etc.)
    // and admins/moderators to manage
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    app.save(users)
  },
)
