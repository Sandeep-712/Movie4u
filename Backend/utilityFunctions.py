from SqlQuery import *
import requests
import mysql.connector
from mysql.connector import Error  # Import Error for exception handling
from dotenv import load_dotenv
import os

load_dotenv()


# Database connection
def db_connection(db_name):
    conn=None
    try:
        conn=mysql.connector.connect (
            host=os.getenv('Host'),
            user=os.getenv('User'),
            password=os.getenv('Password'),
            database=db_name
        )
        if conn.is_connected():
            print(f"Successfully connected to the database :{db_name}")
    except Error as e:
        print(f"Error :{e}")
    return conn