from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Secret key for login sessions
app.secret_key = os.getenv("SECRET_KEY")


# -----------------------------
# Admin Login Credentials
# -----------------------------
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


# -----------------------------
# Database connection
# -----------------------------
def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------------
# Create database
# -----------------------------
def create_database():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            guests INTEGER NOT NULL,
            special_requests TEXT,
            status TEXT NOT NULL DEFAULT 'Pending'
        )
    """)

    # Add status column if database was created earlier
    columns = conn.execute("""
        PRAGMA table_info(reservations)
    """).fetchall()

    column_names = [column["name"] for column in columns]

    if "status" not in column_names:
        conn.execute("""
            ALTER TABLE reservations
            ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'
        """)


        conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Unread'
        )
    """)

    conn.commit()
    conn.close()


# -----------------------------
# Home
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# Menu
# -----------------------------
@app.route("/menu")
def menu():
    return render_template("menu.html")


# -----------------------------
# About
# -----------------------------
@app.route("/about")
def about():
    return render_template("about.html")


# -----------------------------
# Gallery
# -----------------------------
@app.route("/gallery")
def gallery():
    return render_template("gallery.html")


# -----------------------------
# Reservation
# -----------------------------
@app.route("/reservation", methods=["GET", "POST"])
def reservation():

    if request.method == "POST":

        name = request.form["name"]
        phone = request.form["phone"]
        email = request.form["email"]
        date = request.form["date"]
        time = request.form["time"]
        guests = request.form["guests"]

        special_requests = (
            request.form.get("special_requests")
            or request.form.get("requests")
            or ""
        )

        conn = get_db_connection()

        conn.execute("""
            INSERT INTO reservations
            (name, phone, email, date, time, guests, special_requests)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            name,
            phone,
            email,
            date,
            time,
            guests,
            special_requests
        ))

        conn.commit()
        conn.close()

        return redirect(url_for("confirmation"))

    return render_template("reservation.html")


# -----------------------------
# Confirmation
# -----------------------------
@app.route("/confirmation")
def confirmation():
    return render_template("confirmation.html")


# =========================================================
# ADMIN LOGIN
# =========================================================

# -----------------------------
# Admin Login Page
# -----------------------------
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():

    # If already logged in, go directly to dashboard
    if session.get("admin_logged_in"):
        return redirect(url_for("admin"))

    if request.method == "POST":

        username = request.form["username"]
        password = request.form["password"]

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:

            session["admin_logged_in"] = True

            return redirect(url_for("admin"))

        else:

            return render_template(
                "admin_login.html",
                error="Invalid username or password."
            )

    return render_template("admin_login.html")


# -----------------------------
# Admin Dashboard
# -----------------------------
@app.route("/admin")
def admin():

    # Protect dashboard
    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))

    conn = get_db_connection()

    # Get all reservations
    reservations = conn.execute("""
        SELECT *
        FROM reservations
        ORDER BY id DESC
    """).fetchall()

    # Get all contact messages
    messages = conn.execute("""
        SELECT *
        FROM messages
        ORDER BY id DESC
    """).fetchall()

    # Dashboard statistics
    total_reservations = conn.execute("""
        SELECT COUNT(*)
        FROM reservations
    """).fetchone()[0]

    pending_reservations = conn.execute("""
        SELECT COUNT(*)
        FROM reservations
        WHERE status = 'Pending'
    """).fetchone()[0]

    confirmed_reservations = conn.execute("""
        SELECT COUNT(*)
        FROM reservations
        WHERE status = 'Confirmed'
    """).fetchone()[0]

    cancelled_reservations = conn.execute("""
        SELECT COUNT(*)
        FROM reservations
        WHERE status = 'Cancelled'
    """).fetchone()[0]

        # Message statistics
    total_messages = conn.execute("""
        SELECT COUNT(*)
        FROM messages
    """).fetchone()[0]

    unread_messages = conn.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE status = 'Unread'
    """).fetchone()[0]

    conn.close()

    return render_template(
    "admin.html",
    reservations=reservations,
    messages=messages,
    total_reservations=total_reservations,
    pending_reservations=pending_reservations,
    confirmed_reservations=confirmed_reservations,
    cancelled_reservations=cancelled_reservations,
    total_messages=total_messages,
    unread_messages=unread_messages
)


# -----------------------------
# Confirm Reservation
# -----------------------------
@app.route(
    "/admin/reservation/<int:reservation_id>/confirm",
    methods=["POST"]
)
def confirm_reservation(reservation_id):

    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))

    conn = get_db_connection()

    conn.execute("""
        UPDATE reservations
        SET status = 'Confirmed'
        WHERE id = ?
    """, (reservation_id,))

    conn.commit()
    conn.close()

    return redirect(url_for("admin"))


# -----------------------------
# Cancel Reservation
# -----------------------------
@app.route(
    "/admin/reservation/<int:reservation_id>/cancel",
    methods=["POST"]
)
def cancel_reservation(reservation_id):

    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))

    conn = get_db_connection()

    conn.execute("""
        UPDATE reservations
        SET status = 'Cancelled'
        WHERE id = ?
    """, (reservation_id,))

    conn.commit()
    conn.close()

    return redirect(url_for("admin"))


# -----------------------------
# Delete Reservation
# -----------------------------
@app.route(
    "/admin/reservation/<int:reservation_id>/delete",
    methods=["POST"]
)
def delete_reservation(reservation_id):

    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))

    conn = get_db_connection()

    conn.execute("""
        DELETE FROM reservations
        WHERE id = ?
    """, (reservation_id,))

    conn.commit()
    conn.close()

    return redirect(url_for("admin"))


# -----------------------------
# Admin Logout
# -----------------------------
@app.route("/admin/logout")
def admin_logout():

    session.pop("admin_logged_in", None)

    return redirect(url_for("admin_login"))



# -----------------------------
# Mark Message as Read
# -----------------------------
@app.route(
    "/admin/message/<int:message_id>/read",
    methods=["POST"]
)
def mark_message_read(message_id):

    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))

    conn = get_db_connection()

    conn.execute("""
        UPDATE messages
        SET status = 'Read'
        WHERE id = ?
    """, (message_id,))

    conn.commit()
    conn.close()

    return redirect(url_for("admin"))


# -----------------------------
# Delete Message
# -----------------------------
@app.route(
    "/admin/message/<int:message_id>/delete",
    methods=["POST"]
)
def delete_message(message_id):

    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))

    conn = get_db_connection()

    conn.execute("""
        DELETE FROM messages
        WHERE id = ?
    """, (message_id,))

    conn.commit()
    conn.close()

    return redirect(url_for("admin"))


# -----------------------------
# Contact
# -----------------------------
@app.route("/contact", methods=["GET", "POST"])
def contact():

    if request.method == "POST":

        name = request.form["name"].strip()
        email = request.form["email"].strip()
        phone = request.form.get("phone", "").strip()
        subject = request.form.get("subject", "").strip()
        message = request.form["message"].strip()

        conn = get_db_connection()

        conn.execute("""
            INSERT INTO messages
            (name, email, phone, subject, message)
            VALUES (?, ?, ?, ?, ?)
        """, (
            name,
            email,
            phone,
            subject,
            message
        ))

        conn.commit()
        conn.close()

        return redirect(url_for("contact", success="1"))

    success = request.args.get("success")

    return render_template(
        "contact.html",
        success=success
    )


# -----------------------------
# Run application
# -----------------------------
if __name__ == "__main__":
    create_database()
    app.run(debug=True)