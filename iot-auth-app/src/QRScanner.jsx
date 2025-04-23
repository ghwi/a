import React, { useState } from 'react';
import QRReader from 'react-qr-reader'; // react-qr-reader로 변경

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');

  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <h2>Scan a QR Code</h2>
      <QRReader
        delay={300}
        style={{ width: '100%', height: '500px' }} // 비디오 크기 설정
        onScan={handleScan}
        onError={handleError}
      />
      <p>Scanned Result: {scanResult}</p>
    </div>
  );
};

export default QRScanner;
