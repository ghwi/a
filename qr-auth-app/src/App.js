import React, { useState } from 'react';
import LoginPage from './LoginPage';
import QrScannerPage from './QrScannerPage';

const App = () => {
  const [token, setToken] = useState(null);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  return (
    <div>
      {!token ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <QrScannerPage />
      )}
    </div>
  );
};

export default App;
