
from database import get_db_connection


# Get database connection
def get_connection():
    connection = get_db_connection()

    if connection is None:
        raise RuntimeError("Unable to connect to MySQL database.")

    return connection


# Get all employees
def get_all_employees():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id, name, email, phone
            FROM employees
            ORDER BY id DESC
        """)

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()


# Get employee by ID
def get_employee_by_id(employee_id):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id, name, email, phone
            FROM employees
            WHERE id = %s
        """, (employee_id,))

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


# Check duplicate email
def check_duplicate_email(email, exclude_id=None):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
            SELECT id FROM employees
            WHERE LOWER(TRIM(email)) = %s
        """

        values = [email.strip().lower()]

        if exclude_id is not None:
            query += " AND id != %s"
            values.append(exclude_id)

        cursor.execute(query, tuple(values))

        return cursor.fetchone() is not None

    finally:
        cursor.close()
        connection.close()


# Normalize phone number for duplicate checking
def normalize_phone(phone):
    return "".join(phone.split())


# Check duplicate phone
def check_duplicate_phone(phone, exclude_id=None):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
            SELECT id FROM employees
            WHERE REPLACE(TRIM(phone), ' ', '') = %s
        """

        values = [normalize_phone(phone)]

        if exclude_id is not None:
            query += " AND id != %s"
            values.append(exclude_id)

        cursor.execute(query, tuple(values))

        return cursor.fetchone() is not None

    finally:
        cursor.close()
        connection.close()


# Add employee
def add_employee(name, email, phone):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            INSERT INTO employees (name, email, phone)
            VALUES (%s, %s, %s)
        """, (name, email, phone))

        connection.commit()

        return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# Update employee
def update_employee(employee_id, name, email, phone):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            UPDATE employees
            SET name = %s,
                email = %s,
                phone = %s
            WHERE id = %s
        """, (name, email, phone, employee_id))

        connection.commit()

        return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# Delete employee
def delete_employee(employee_id):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            DELETE FROM employees
            WHERE id = %s
        """, (employee_id,))

        connection.commit()

        return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()
