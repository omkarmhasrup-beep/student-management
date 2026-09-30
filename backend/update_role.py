import sqlite3
conn = sqlite3.connect('app.db')
conn.execute("UPDATE users SET role='admin'")
conn.commit()
conn.close()
print("Role updated!")
