import sqlite3
import os

path = os.path.join(os.getcwd(), 'data', 'urmis-prisma.db')
conn = sqlite3.connect(path)
cur = conn.cursor()

cur.execute("PRAGMA table_info('User')")
cols = {row[1] for row in cur.fetchall()}
for name, definition in [
    ('isSuspended', 'BOOLEAN NOT NULL DEFAULT 0'),
    ('isLocked', 'BOOLEAN NOT NULL DEFAULT 0'),
    ('mustChangePassword', 'BOOLEAN NOT NULL DEFAULT 0'),
    ('lockedAt', 'DATETIME'),
    ('suspendedAt', 'DATETIME'),
    ('lastPasswordChange', 'DATETIME'),
    ('updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'),
]:
    if name not in cols:
        cur.execute(f"ALTER TABLE User ADD COLUMN {name} {definition}")

cur.execute("CREATE TABLE IF NOT EXISTS RolePermission (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, permission TEXT NOT NULL, granted BOOLEAN NOT NULL DEFAULT true, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)")
cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS RolePermission_role_permission_key ON RolePermission(role, permission)")
conn.commit()
conn.close()
print('RBAC schema update complete')
