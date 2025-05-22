import os
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import jwt
import datetime
import random
import string
import qrcode
import io
import base64

# 환경변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

# 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
SECRET_KEY = os.getenv("SECRET_KEY")

db = SQLAlchemy(app)

# 사용자 모델
class User(db.Model):
    __tablename__ = 'user'
    num = db.Column(db.Integer, primary_key=True)
    id = db.Column(db.String(45), unique=True, nullable=False)
    pass_field = db.Column("pass", db.String(45), nullable=False)
    name = db.Column(db.String(45))
    age = db.Column(db.Integer)

# PR 코드 모델
class PRCode(db.Model):
    __tablename__ = 'pr_codes'
    code = db.Column(db.String(10), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# JWT 토큰 생성 함수
def create_token(username):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    token = jwt.encode({'username': username, 'exp': expiration}, SECRET_KEY, algorithm='HS256')
    return token

# 회원가입 엔드포인트
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    age = data.get('age')

    if User.query.filter_by(id=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    new_user = User(id=username, pass_field=password, name=name, age=age)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

# 로그인 엔드포인트
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(id=username, pass_field=password).first()
    if user:
        token = create_token(username)
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials'}), 401

# QR(PR) 코드 생성 엔드포인트
@app.route('/generate-pr-code', methods=['GET'])
def generate_pr_code():
    pr_code = ''.join(random.choices(string.digits, k=6))

    # DB에 저장
    db.session.add(PRCode(code=pr_code))
    db.session.commit()

    # QR 코드 이미지 생성 및 base64 인코딩
    qr_img = qrcode.make(pr_code)
    img_byte_array = io.BytesIO()
    qr_img.save(img_byte_array)
    qr_code_base64 = base64.b64encode(img_byte_array.getvalue()).decode('utf-8')

    return render_template('index.html', pr_code=pr_code, qr_code=qr_code_base64)

# PR 코드 인증 엔드포인트
@app.route('/verify-pr-code', methods=['POST'])
def verify_pr_code():
    pr_code = request.json.get('pr_code')
    code_entry = PRCode.query.filter_by(code=pr_code).first()

    if code_entry:
        return jsonify({'message': 'PR Code verified successfully!'})
    return jsonify({'message': 'Invalid PR Code'}), 400

# 기본 루트
@app.route('/')
def home():
    return 'Welcome to the PR Code Generator!'

# 앱 실행
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
