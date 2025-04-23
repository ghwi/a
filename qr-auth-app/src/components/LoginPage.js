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
    try {
      const response = await axios.post(`${API}/login`, {
        username,
        password,
      });

      localStorage.setItem('token', response.data.token); // 토큰 저장
      navigate('/dashboard');
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h2>로그인</h2>
      <input placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} /><br /><br />
      <input placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={() => navigate('/signup')}>회원가입</button>
      {error && <p style={{ color: 'red' }}>잘못된 정보입니다</p>}
    </div>
  );
}

export default LoginPage;
