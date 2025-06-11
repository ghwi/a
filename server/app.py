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

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
SECRET_KEY = os.getenv("SECRET_KEY")

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'
    num = db.Column(db.Integer, primary_key=True)
    id = db.Column(db.String(100), unique=True, nullable=False)
    pass_field = db.Column("pass", db.String(100), nullable=False)
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)

class PRCode(db.Model):
    __tablename__ = 'pr_codes'
    code = db.Column(db.String(100), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# ---------- JWT ----------
def create_token(username):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    token = jwt.encode({'username': username, 'exp': expiration}, SECRET_KEY, algorithm='HS256')
    return token

# ---------- 라우터 ----------
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

@app.route('/generate-pr-code', methods=['GET'])
def generate_pr_code():
    pr_code = ''.join(random.choices(string.digits, k=6))
    db.session.add(PRCode(code=pr_code))
    db.session.commit()

    qr_img = qrcode.make(pr_code)
    img_byte_array = io.BytesIO()
    qr_img.save(img_byte_array)
    qr_code_base64 = base64.b64encode(img_byte_array.getvalue()).decode('utf-8')

    return render_template('index.html', pr_code=pr_code, qr_code=qr_code_base64)

@app.route('/verify-pr-code', methods=['POST'])
def verify_pr_code():
    pr_code = request.json.get('pr_code')
    code_entry = PRCode.query.filter_by(code=pr_code).first()

    if code_entry:
        return jsonify({'message': 'PR Code verified successfully!'})
    return jsonify({'message': 'Invalid PR Code'}), 400

@app.route('/log-url-click', methods=['POST'])
def log_url_click():
    data = request.get_json()
    url = data.get('url')
    print(f"[URL 클릭 기록] 사용자가 이동한 URL: {url}")
    return jsonify({'message': '클릭 기록 완료'}), 200

@app.route('/')
def home():
    return 'Welcome to the PR Code Generator!'

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
