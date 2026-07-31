import sqlite3 from 'sqlite3'

const dbPath = process.env.DB_PATH || new URL('../data/urmis.db', import.meta.url).pathname

const db = new sqlite3.Database(dbPath)

export const initializeDatabase = () =>
  new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS institutions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address TEXT,
          contact_email TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }
        },
      )

      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id INTEGER,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions(id)
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }
        },
      )

      db.run(
        `CREATE TABLE IF NOT EXISTS faculties (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions(id)
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }
        },
      )

      db.run(
        `CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id INTEGER NOT NULL,
          faculty_id INTEGER,
          name TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions(id),
          FOREIGN KEY (faculty_id) REFERENCES faculties(id)
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }
        },
      )

      db.run(
        `CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id INTEGER NOT NULL,
          student_id TEXT NOT NULL,
          full_name TEXT NOT NULL,
          department_id INTEGER,
          semester TEXT,
          enrollment_year TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions(id),
          FOREIGN KEY (department_id) REFERENCES departments(id)
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }
        },
      )

      db.run(
        `CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id INTEGER NOT NULL,
          department_id INTEGER,
          course_code TEXT NOT NULL,
          course_name TEXT NOT NULL,
          credit_hours INTEGER DEFAULT 3,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions(id),
          FOREIGN KEY (department_id) REFERENCES departments(id)
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }
        },
      )

      db.run(
        `CREATE TABLE IF NOT EXISTS modules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id INTEGER NOT NULL,
          course_id INTEGER NOT NULL,
          module_code TEXT NOT NULL,
          module_name TEXT NOT NULL,
          credit_hours INTEGER DEFAULT 1,
          description TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions(id),
          FOREIGN KEY (course_id) REFERENCES courses(id)
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }
        },
      )

      db.run(
        `CREATE TABLE IF NOT EXISTS results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          institution_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          course_id INTEGER NOT NULL,
          assignment_score REAL DEFAULT 0,
          exam_score REAL DEFAULT 0,
          total_score REAL DEFAULT 0,
          percentage REAL DEFAULT 0,
          grade TEXT,
          pass_fail TEXT,
          academic_session TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institution_id) REFERENCES institutions(id),
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (course_id) REFERENCES courses(id)
        )`,
        (err) => {
          if (err) {
            reject(err)
            return
          }

          resolve()
        },
      )
    })
  })

export const runSql = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function onRun(error) {
      if (error) {
        reject(error)
        return
      }

      resolve({ id: this.lastID })
    })
  })

export const getOne = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) {
        reject(error)
        return
      }

      resolve(row)
    })
  })

export const getAll = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error)
        return
      }

      resolve(rows)
    })
  })

export default db
