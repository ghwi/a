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
    console.log("입력한 정보:", { username, password }); // 디버깅용 로그

    try {
      const response = await axios.post(`${API}/login`, {
        username,
        password,
      });

      console.log("서버 응답:", response.data); // 디버깅용 로그

      localStorage.setItem('token', response.data.token); 
      alert("로그인 성공! 이동합니다"); 
      navigate('/dashboard'); 
      
    } catch (err) {
      console.log("로그인 실패:", err.response?.data || err.message); // 디버깅용 로그
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h2>로그인</h2>
      <input
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br /><br />
      <input
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={() => navigate('/signup')}>회원가입</button>
      {error && <p style={{ color: 'red' }}>잘못된 정보입니다</p>}
    </div>
  );
}

export default LoginPage;
