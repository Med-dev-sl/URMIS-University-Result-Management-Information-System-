import sqlite3
import os
import shutil

path = os.path.join(os.getcwd(), 'data', 'urmis-prisma.db')
backup = path + '.bak'
if os.path.exists(backup):
    os.remove(backup)
shutil.copy2(path, backup)

conn = sqlite3.connect(path)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='User'")
if cur.fetchone() is None:
    raise SystemExit('User table missing')

cur.execute("ALTER TABLE User RENAME TO User_old")
cur.execute("""
CREATE TABLE User (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  institutionId INTEGER,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  refresh_token TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  isSuspended BOOLEAN NOT NULL DEFAULT 0,
  isLocked BOOLEAN NOT NULL DEFAULT 0,
  mustChangePassword BOOLEAN NOT NULL DEFAULT 0,
  lockedAt DATETIME,
  suspendedAt DATETIME,
  lastPasswordChange DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  institution INTEGER
)
""")
cur.execute("""
INSERT INTO User (id, institutionId, full_name, email, password_hash, refresh_token, role, isSuspended, isLocked, mustChangePassword, lockedAt, suspendedAt, lastPasswordChange, created_at, updated_at, institution)
SELECT id, institutionId, full_name, email, password_hash, refresh_token, role, 0, 0, 0, NULL, NULL, NULL, created_at, CURRENT_TIMESTAMP, institutionId
FROM User_old
""")
cur.execute("DROP TABLE User_old")
cur.execute("CREATE TABLE IF NOT EXISTS RolePermission (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, permission TEXT NOT NULL, granted BOOLEAN NOT NULL DEFAULT true, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)")
cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS RolePermission_role_permission_key ON RolePermission(role, permission)")
conn.commit()
conn.close()
print('User table rebuilt for RBAC')
