import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api';

function Dashboard() {
  const [prCode, setPrCode] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const verifyPrCode = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API}/verify-pr-code`,
        { pr_code: prCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data.message);
    } catch (err) {
      setResult('PR 코드 인증 실패');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <h2>잠금 해제</h2>
      <button onClick={() => navigate('/scan')}>QR 스캔</button><br /><br />
      <input
        placeholder="PR 코드 입력"
        value={prCode}
        onChange={(e) => setPrCode(e.target.value)}
      />
      <button onClick={verifyPrCode}>코드로 잠금 해제</button>
      {result && <p>{result}</p>}
    </div>
  );
}

export default Dashboard;
