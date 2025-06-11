from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token
from flask_socketio import SocketIO, emit
import os
import base64
import io
import qrcode
import random
import string
import bcrypt

# 환경 변수 로딩
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "3306")
DB_USER = os.environ.get("DB_USER", "iotuser")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "iotpass123")
DB_NAME = os.environ.get("DB_NAME", "iotdb")
SECRET_KEY = os.environ.get("SECRET_KEY", "mysecretkey")

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# 모델 정의
class User(db.Model):
    num = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id = db.Column(db.String(50), unique=True, nullable=False)
    pass_hash = db.Column("pass", db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)

    def set_password(self, password):
        self.pass_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.pass_hash.encode('utf-8'))

class PRCode(db.Model):
    num = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(6), unique=True, nullable=False)

def generate_random_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/')
def index():
    return 'IoT PR 인증 서버가 정상 작동 중입니다.'

@app.route("/test-db")
def test_db():
    try:
        users = User.query.all()
        return jsonify({"status": "OK", "user_count": len(users)})
    except Exception as e:
        return jsonify({"status": "DB 연결 실패", "error": str(e)})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(id=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        access_token = create_access_token(identity=user.id)
        return jsonify(token=access_token), 200
    return jsonify(msg="Invalid credentials"), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter_by(id=data.get('username')).first():
        return jsonify(msg="User already exists"), 409

    new_user = User(
        id=data.get('username'),
        name=data.get('name'),
        age=data.get('age')
    )
    new_user.set_password(data.get('password'))

    db.session.add(new_user)
    db.session.commit()
    return jsonify(msg="User created"), 201

@app.route('/generate-pr-code')
def generate_pr_code():
    pr_code = generate_random_code(6)

    qr_img = qrcode.make(pr_code)
    buffer = io.BytesIO()
    qr_img.save(buffer, format="PNG")
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

    try:
        new_pr = PRCode(code=pr_code)
        db.session.add(new_pr)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("PR 코드 저장 오류:", e)

    return render_template('index.html', pr_code=pr_code, qr_code=qr_code_base64)

@app.route('/log-url-click', methods=['POST'])
def log_url_click():
    data = request.get_json()
    url = data.get('url')
    print(f"사용자가 클릭한 URL: {url}")
    socketio.emit('url_selected', {'url': url}, broadcast=True)
    return jsonify({"msg": "URL 전송 완료"}), 200

@socketio.on('verify_pr')
def verify_pr(data):
    pr_code = data.get('code')
    if PRCode.query.filter_by(code=pr_code).first():
        db.session.query(PRCode).filter_by(code=pr_code).delete()
        db.session.commit()
        emit('pr_verified', {'msg': '인증 성공'}, broadcast=True)
    else:
        emit('pr_verified', {'msg': '인증 실패'}, broadcast=True)

@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('message', {'data': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
