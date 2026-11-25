
import mysql.connector

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="admin",
            database="reminder_management"
        )

        if connection.is_connected():
            print("MySQL Database Connected Successfully!")
            return connection

    except mysql.connector.Error as error:
        print("Database Connection Failed:", error)
        return None
