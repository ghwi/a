import React, { useState } from 'react';
import axios from 'axios';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
  const [form, setForm] = useState({ username: '', password: '', name: '', age: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { username, password, name, age } = form;

    // 유효성 검사
    if (!username || !password || !name || !age) {
      setError('모든 항목을 입력해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await axios.post(`${API}/signup`, form);
      alert('회원가입 성공!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || '서버 오류';
      setError(msg);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2>회원가입</h2>
      <input
        style={styles.input}
        name="username"
        placeholder="아이디"
        value={form.username}
        onChange={handleChange}
      />
      <input
        style={styles.input}
        name="password"
        type="password"
        placeholder="비밀번호"
        value={form.password}
        onChange={handleChange}
      />
      <input
        style={styles.input}
        name="name"
        placeholder="이름"
        value={form.name}
        onChange={handleChange}
      />
      <input
        style={styles.input}
        name="age"
        type="number"
        placeholder="나이"
        value={form.age}
        onChange={handleChange}
      />
      <button style={styles.button} onClick={handleSubmit}>회원가입</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
