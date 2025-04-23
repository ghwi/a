import os  # os 모듈 추가
from flask import Flask, render_template, request, jsonify
import jwt
import datetime
import random
import string
import qrcode
import io
import base64

app = Flask(__name__)
SECRET_KEY = 'your_secret_key'

# 임시 사용자 데이터 (DB는 나중에 추가)
users = {'test': {'password': '1234'}}  # 아이디와 비밀번호를 1234로 설정

# JWT 토큰 생성 함수
def create_token(username):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    token = jwt.encode({'username': username, 'exp': expiration}, SECRET_KEY, algorithm='HS256')
    return token

# 로그인 API
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # 사용자 이름과 비밀번호 확인
    if username in users and users[username]['password'] == password:
        token = create_token(username)  # JWT 토큰 생성
        return jsonify({'token': token})  # 로그인 성공 시 토큰 반환
    return jsonify({'message': 'Invalid credentials'}), 401  # 로그인 실패 시 오류 메시지 반환

# 회원가입 API
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    print("현재 users:", users)  

    if username in users:
        return jsonify({'message': 'Username already exists'}), 400

    users[username] = {'password': password}
    return jsonify({'message': 'User created successfully'}), 201

# PR 코드 생성 API
@app.route('/generate-pr-code', methods=['GET'])
def generate_pr_code():
    # 임시로 PR 코드를 생성
    pr_code = ''.join(random.choices(string.digits, k=6))
    
    # QR 코드 생성
    qr_img = qrcode.make(pr_code)
    img_byte_array = io.BytesIO()
    qr_img.save(img_byte_array)
    img_byte_array = img_byte_array.getvalue()
    qr_code_base64 = base64.b64encode(img_byte_array).decode('utf-8')
    
    # HTML 렌더링 시 PR 코드와 QR 코드 전달
    return render_template('index.html', pr_code=pr_code, qr_code=qr_code_base64)

# PR 코드 확인 API
@app.route('/verify-pr-code', methods=['POST'])
def verify_pr_code():
    pr_code = request.json.get('pr_code')
    # 여기에 PR 코드 확인 로직을 추가
    if pr_code == "123456":  # 임시 코드
        return jsonify({'message': 'PR Code verified successfully!'})
    return jsonify({'message': 'Invalid PR Code'}), 400

# 루트 경로 추가
@app.route('/')
def home():
    return 'Welcome to the PR Code Generator!'

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000))) # Flask 서버 실행
