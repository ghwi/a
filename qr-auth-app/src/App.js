// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginpage';
import SignupPage from './pages/signuppage';
import Dashboard from './pages/dashboard';
import QRScanner from './pages/qrscanner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
