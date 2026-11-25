
from flask import Blueprint, request, jsonify
from database import get_db_connection
import bcrypt

auth = Blueprint("auth", __name__)


# ADMIN REGISTRATION
@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not email or not password or not confirm_password:
        return jsonify({
            "message": "All fields are required"
        }), 400

    if password != confirm_password:
        return jsonify({
            "message": "Passwords do not match"
        }), 400

    if len(password) < 8:
        return jsonify({
            "message": "Password must contain at least 8 characters"
        }), 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO admins (email, password_hash) VALUES (%s, %s)",
            (email, hashed_password)
        )

        connection.commit()

        return jsonify({
            "message": "Admin registered successfully"
        }), 201

    except Exception as error:
        connection.rollback()
        print("Registration error:", error)

        if "1062" in str(error):
            return jsonify({
                "message": "Email already registered"
            }), 409

        return jsonify({
            "message": "Registration failed"
        }), 500

    finally:
        cursor.close()
        connection.close()


# ADMIN LOGIN
@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor()

    try:
        cursor.execute(
            "SELECT id, email, password_hash FROM admins WHERE email = %s",
            (email,)
        )

        admin = cursor.fetchone()

        if admin is None:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        admin_id, admin_email, stored_password = admin

        password_valid = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

        if not password_valid:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful",
            "admin": {
                "id": admin_id,
                "email": admin_email
            }
        }), 200

    except Exception as error:
        print("Login error:", error)

        return jsonify({
            "success": False,
            "message": "Something went wrong during login"
        }), 500

    finally:
        cursor.close()
        connection.close()
