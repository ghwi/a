import React, { useState } from 'react';
import axios from 'axios';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
  const [form, setForm] = useState({ username: '', password: '', name: '', age: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/signup`, form);
      alert('회원가입 성공!');
      navigate('/'); // 가입 후 로그인 페이지로 이동
    } catch (err) {
      alert('회원가입 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  return (
    <div style={styles.container}>
      <h2>회원가입</h2>
      <input
        style={styles.input}
        name="username"
        placeholder="아이디"
        onChange={handleChange}
      />
      <input
        style={styles.input}
        name="password"
        type="password"
        placeholder="비밀번호"
        onChange={handleChange}
      />
      <input
        style={styles.input}
        name="name"
        placeholder="이름"
        onChange={handleChange}
      />
      <input
        style={styles.input}
        name="age"
        type="number"
        placeholder="나이"
        onChange={handleChange}
      />
      <button style={styles.button} onClick={handleSubmit}>회원가입</button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '80px'
  },
  input: {
    display: 'block',
    margin: '10px auto',
    padding: '10px',
    width: '250px',
    fontSize: '16px'
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default SignUpPage;
