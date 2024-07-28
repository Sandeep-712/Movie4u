import mysql.connector

conn=mysql.connector.connect(
    host='localhost',
    user='root',
    password='123456789',
    database='users'
)

sql_comm=conn.cursor()

sql_query="""
CREATE TABLE IF NOT EXISTS users(
id INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
selected_genres TEXT,
selected_cast TEXT
)"""

sql_comm.execute(sql_query)

conn.commit()

sql_comm.close()
conn.close()

print("Table 'users' created successfully.")