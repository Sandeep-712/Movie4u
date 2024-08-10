import sqlite3

try:
    # Establish a connection to the SQLite database
    conn = sqlite3.connect('./model/users.sqlite')

    # Create a cursor object
    sql_comm = conn.cursor()

    # SQL query to create the 'users' table if it does not exist
    sql_query = """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        selected_genres TEXT,
        selected_cast TEXT
    )
    """

    # Execute the SQL query
    sql_comm.execute(sql_query)

    # Commit the transaction
    conn.commit()

    print("Table 'users' created successfully.")

except sqlite3.Error as e:
    print(f"Error: {e}")

finally:
    # Close the cursor and connection
    if sql_comm:
        sql_comm.close()
    if conn:
        conn.close()