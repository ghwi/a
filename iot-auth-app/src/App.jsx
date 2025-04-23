import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login'; // 로그인 컴포넌트 추가
import QRScanner from './QRScanner'; // QR 스캐너 컴포넌트 추가

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

  // 로그인 성공 시 상태 업데이트
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Home</Link> | <Link to="/signup">Signup</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          {isLoggedIn && <Route path="/qrscanner" element={<QRScanner />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
