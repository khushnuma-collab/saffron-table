import sqlite3

conn = sqlite3.connect("database.db")

conn.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Unread'
    )
""")

conn.commit()
conn.close()

print("Messages table created successfully!")