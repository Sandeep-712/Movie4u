import mysql.connector

try:
    # Establish a connection to the MySQL database
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='123456789',
        database='users'
    )

    # Create a cursor object
    sql_comm = conn.cursor()

    # SQL query to create the 'users' table if it does not exist
    sql_query = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        selected_genres TEXT,
        selected_cast TEXT
    )
    """

    # Execute the SQL query
    sql_comm.execute(sql_query)

    # Commit the transaction
    conn.commit()

    print("Table 'users' created successfully.")

except mysql.connector.Error as err:
    print(f"Error: {err}")

finally:
    # Close the cursor and connection
    if sql_comm:
        sql_comm.close()
    if conn:
        conn.close()