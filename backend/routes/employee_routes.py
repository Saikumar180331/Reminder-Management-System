
from flask import Blueprint, request, jsonify
from mysql.connector import IntegrityError

from models.employee_model import (
    get_all_employees,
    get_employee_by_id,
    check_duplicate_email,
    check_duplicate_phone,
    add_employee,
    update_employee,
    delete_employee
)

employee_bp = Blueprint("employee", __name__)


def normalize_phone(phone):
    return "".join(phone.split())


# GET ALL EMPLOYEES
@employee_bp.route("/api/employees", methods=["GET"])
def get_employees():
    try:
        employees = get_all_employees()
        return jsonify(employees), 200

    except Exception as error:
        print("GET EMPLOYEES ERROR:", error)
        return jsonify({
            "message": "Unable to retrieve employees."
        }), 500


# ADD EMPLOYEE
@employee_bp.route("/api/employees", methods=["POST"])
def create_employee():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    phone = normalize_phone(str(data.get("phone", "")))

    if not name or not email or not phone:
        return jsonify({
            "message": "All fields are required."
        }), 400

    try:
        if check_duplicate_email(email):
            return jsonify({
                "message": "This email address is already registered."
            }), 409

        if check_duplicate_phone(phone):
            return jsonify({
                "message": "This phone number is already registered."
            }), 409

        employee_id = add_employee(name, email, phone)

        return jsonify({
            "message": "Employee added successfully.",
            "id": employee_id
        }), 201

    except IntegrityError:
        return jsonify({
            "message": "Email or phone number is already registered."
        }), 409

    except Exception as error:
        print("ADD EMPLOYEE ERROR:", error)

        return jsonify({
            "message": "Unable to add employee. Check backend logs."
        }), 500


# GET EMPLOYEE BY ID
@employee_bp.route("/api/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    try:
        employee = get_employee_by_id(employee_id)

        if not employee:
            return jsonify({
                "message": "Employee not found."
            }), 404

        return jsonify(employee), 200

    except Exception as error:
        print("GET EMPLOYEE ERROR:", error)

        return jsonify({
            "message": "Unable to retrieve employee."
        }), 500


# UPDATE EMPLOYEE
@employee_bp.route("/api/employees/<int:employee_id>", methods=["PUT"])
def edit_employee(employee_id):
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    phone = normalize_phone(str(data.get("phone", "")))

    if not name or not email or not phone:
        return jsonify({
            "message": "All fields are required."
        }), 400

    try:
        existing_employee = get_employee_by_id(employee_id)

        if not existing_employee:
            return jsonify({
                "message": "Employee not found."
            }), 404

        if check_duplicate_email(email, employee_id):
            return jsonify({
                "message": "This email address is already registered."
            }), 409

        if check_duplicate_phone(phone, employee_id):
            return jsonify({
                "message": "This phone number is already registered."
            }), 409

        update_employee(employee_id, name, email, phone)

        return jsonify({
            "message": "Employee updated successfully."
        }), 200

    except IntegrityError:
        return jsonify({
            "message": "Email or phone number is already registered."
        }), 409

    except Exception as error:
        print("UPDATE EMPLOYEE ERROR:", error)

        return jsonify({
            "message": "Unable to update employee."
        }), 500


# DELETE EMPLOYEE
@employee_bp.route("/api/employees/<int:employee_id>", methods=["DELETE"])
def remove_employee(employee_id):
    try:
        deleted = delete_employee(employee_id)

        if not deleted:
            return jsonify({
                "message": "Employee not found."
            }), 404

        return jsonify({
            "message": "Employee deleted successfully."
        }), 200

    except Exception as error:
        print("DELETE EMPLOYEE ERROR:", error)

        return jsonify({
            "message": "Unable to delete employee."
        }), 500
