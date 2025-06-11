import React, { useState } from 'react';
import axios from 'axios';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await axios.post(`${API}/signup`, {
        id: username,
        password,
        name,
        age: parseInt(age),
      });

      if (response.status === 201) {
        alert('가입 성공!');
        navigate('/');
      }
    } catch (err) {
      alert('이미 존재하는 아이디입니다.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h2>회원가입</h2>
      <input placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} /><br /><br />
      <input placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br /><br />
      <input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
      <input placeholder="나이" type="number" value={age} onChange={(e) => setAge(e.target.value)} /><br /><br />
      <button onClick={handleSignup}>가입하기</button>
    </div>
  );
}

export default SignupPage;
