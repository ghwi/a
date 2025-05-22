import React, { useState } from 'react';
import axios from 'axios';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      setTimeout(() => setError(false), 3000);
      return;
    }

    try {
      const response = await axios.post(`${API}/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      alert("로그인 성공! 이동합니다");
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || '서버 오류';
      console.error("로그인 실패:", msg);
      setError(msg);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2>로그인</h2>
      <input
        style={styles.input}
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        style={styles.input}
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button style={styles.button} onClick={handleLogin}>로그인</button>
      <button style={styles.button} onClick={() => navigate('/signup')}>회원가입</button>
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
    margin: '10px 5px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default LoginPage;
