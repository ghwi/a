import os
from flask import Flask, request, jsonify, render_template
import jwt
import datetime
import random
import string
import qrcode
import io
import base64
import pymysql
from flask_cors import CORS
from dotenv import load_dotenv
import bcrypt  # ✅ 추가

load_dotenv()

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.getenv("SECRET_KEY", "your_fallback_secret_key")

def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        db=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306)),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def create_token(username):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    token = jwt.encode({'username': username, 'exp': expiration}, SECRET_KEY, algorithm='HS256')
    return token

# ✅ 회원가입 API - 비밀번호 암호화 추가
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    age = data.get('age')

    if not all([username, password, name, age]):
        return jsonify({'message': 'All fields are required'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user WHERE id=%s", (username,))
            if cursor.fetchone():
                return jsonify({'message': 'Username already exists'}), 400

            # 비밀번호 암호화
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            sql = "INSERT INTO user (id, pass, name, age) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (username, hashed_password, name, age))
            conn.commit()
    finally:
        conn.close()

    return jsonify({'message': 'User created successfully'}), 201

# ✅ 로그인 API - 암호화된 비밀번호 검증
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user WHERE id=%s", (username,))
            user = cursor.fetchone()
    finally:
        conn.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user['pass'].encode('utf-8')):
        token = create_token(username)
        return jsonify({'token': token})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# PR 코드 생성
@app.route('/generate-pr-code', methods=['GET'])
def generate_pr_code():
    pr_code = ''.join(random.choices(string.digits, k=6))
    qr_img = qrcode.make(pr_code)
    img_byte_array = io.BytesIO()
    qr_img.save(img_byte_array)
    img_byte_array = img_byte_array.getvalue()
    qr_code_base64 = base64.b64encode(img_byte_array).decode('utf-8')
    return render_template('index.html', pr_code=pr_code, qr_code=qr_code_base64)

# PR 코드 검증
@app.route('/verify-pr-code', methods=['POST'])
def verify_pr_code():
    pr_code = request.json.get('pr_code')
    if pr_code == "123456":
        return jsonify({'message': 'PR Code verified successfully!'})
    return jsonify({'message': 'Invalid PR Code'}), 400

@app.route('/')
def home():
    return '✅ Flask + MySQL + bcrypt 연동 완료!'

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
