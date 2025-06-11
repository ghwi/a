from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token
from flask_socketio import SocketIO, emit
import os
import base64
import io
import qrcode

# 환경 변수 로딩
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "3306")
DB_USER = os.environ.get("DB_USER", "iotuser")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "iotpass123")
DB_NAME = os.environ.get("DB_NAME", "iotdb")
SECRET_KEY = os.environ.get("SECRET_KEY", "mysecretkey")

# Flask 초기화
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 확장 기능 초기화
db = SQLAlchemy(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# 모델 정의 (예시)
class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)

@app.route('/')
def index():
    return 'IoT PR 인증 서버가 정상 작동 중입니다.'

# 로그인 API
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(id=data['id']).first()
    if user and user.password == data['password']:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    return jsonify(msg="Invalid credentials"), 401

# 회원가입 API
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter_by(id=data['id']).first():
        return jsonify(msg="User already exists"), 409
    new_user = User(
        id=data['id'],
        password=data['password'],
        name=data['name'],
        age=data['age']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(msg="User created"), 201

# /generate-pr-code 라우트 추가
@app.route('/generate-pr-code')
def generate_pr_code():
    # 실제 PR 코드 생성 로직 넣기 (여기선 예시)
    pr_code = "PR1234567890"

    # QR 코드 이미지 생성
    qr_img = qrcode.make(pr_code)
    buffer = io.BytesIO()
    qr_img.save(buffer, format="PNG")
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

    # templates/index.HTML 템플릿 렌더링
    return render_template('index.HTML', pr_code=pr_code, qr_code=qr_code_base64)

# WebSocket 이벤트 예시
@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('message', {'data': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

if __name__ == '__main__':
    # 로컬 테스트용 실행
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
