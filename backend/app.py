
from flask import Flask
from flask_cors import CORS

from database import get_db_connection
from routes.auth import auth
from routes.employee_routes import employee_bp

app = Flask(__name__)

# CORS configuration for React
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ]
)

# Register blueprints
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(employee_bp)


@app.route("/")
def home():
    return "Reminder Management Backend is Running!"


@app.route("/test-db")
def test_database():
    connection = get_db_connection()

    if connection:
        connection.close()
        return "MySQL Connected Successfully!"

    return "MySQL Connection Failed!", 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
