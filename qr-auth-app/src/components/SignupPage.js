import React, { useState } from 'react';
import axios from 'axios';
import API from './api';

function SignUpPage() {
  const [form, setForm] = useState({ username: '', password: '', name: '', age: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/signup`, form); // res 제거
      alert('회원가입 성공!');
    } catch (err) {
      alert('회원가입 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <input name="username" placeholder="ID" onChange={handleChange} />
      <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
      <input name="name" placeholder="이름" onChange={handleChange} />
      <input name="age" type="number" placeholder="나이" onChange={handleChange} />
      <button onClick={handleSubmit}>회원가입</button>
    </div>
  );
}

export default SignUpPage;
