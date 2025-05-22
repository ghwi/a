import os
from flask import Flask, request, jsonify
import jwt
import datetime
import pymysql
from flask_cors import CORS
from functools import wraps
import random
import string
import qrcode
import io
import base64
from dotenv import load_dotenv

# .env 환경변수 로드
load_dotenv()

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# JWT 시크릿 키 (환경변수에서 불러오기, 기본값은 fallback)
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback_secret_key')

# MySQL 연결 (Railway 기준)
conn = pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    db=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT")),
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

# ✅ 루트 경로 라우터 추가
@app.route('/')
def index():
    return '✅ Flask API 서버가 정상 작동 중입니다!'

# JWT 토큰 생성 함수
def create_token(username):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    token = jwt.encode({'username': username, 'exp': expiration}, SECRET_KEY, algorithm='HS256')
    return token

# JWT 토큰 검증 데코레이터
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = data['username']
        except Exception:
            return jsonify({'message': 'Token is invalid or expired!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# 로그인 API
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    with conn.cursor() as cursor:
        sql = "SELECT * FROM user WHERE id=%s AND pass=%s"
        cursor.execute(sql, (username, password))
        user = cursor.fetchone()

    if user:
        token = create_token(username)
        return jsonify({'token': token})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# 회원가입 API
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    age = data.get('age')

    if not all([username, password, name, age]):
        return jsonify({'message': 'All fields are required'}), 400

    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM user WHERE id=%s", (username,))
        if cursor.fetchone():
            return jsonify({'message': 'Username already exists'}), 400

        sql = "INSERT INTO user (id, pass, name, age) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (username, password, name, age))
        conn.commit()

    return jsonify({'message': 'User created successfully'}), 201

# PR 코드 임시 저장소
valid_pr_codes = {}  # {pr_code: expiration_datetime}

# PR 코드 생성 API
@app.route('/generate-pr-code', methods=['GET'])
@token_required
def generate_pr_code(current_user):
    pr_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    expiration = datetime.datetime.utcnow() + datetime.timedelta(minutes=3)
    valid_pr_codes[pr_code] = expiration

    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(pr_code)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({'pr_code': pr_code, 'qr_code': img_str})

# PR 코드 검증 API
@app.route('/verify-pr-code', methods=['POST'])
@token_required
def verify_pr_code(current_user):
    data = request.get_json()
    pr_code = data.get('pr_code')

    expiration = valid_pr_codes.get(pr_code)
    if expiration and datetime.datetime.utcnow() <= expiration:
        del valid_pr_codes[pr_code]
        return jsonify({'message': 'PR Code verified successfully!'})
    else:
        return jsonify({'message': 'PR Code expired or invalid'}), 400

# 서버 실행
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
