-- Добавление администратора CRM
INSERT INTO admin_users (username, password_hash, display_name, role)
VALUES ('slava', '$2b$10$O7kPGuApMCh43.60QpwMQeT0MOZN0qXF5C3JCPL7jzQQflFLYmiuW', 'Слава', 'owner')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;