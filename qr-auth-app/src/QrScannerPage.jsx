import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QrScannerPage = () => {
  const [scannedCode, setScannedCode] = useState('');
  const videoRef = useRef(null);

  const handleScan = useCallback((result) => {
    if (result) {
      setScannedCode(result.getText());
      verifyPrCode(result.getText());
    }
  }, []); // 의존성 배열을 빈 배열로 설정하여, handleScan이 한 번만 정의되도록

  const handleError = (err) => {
    console.error(err);
  };

  const verifyPrCode = async (prCode) => {
    const response = await fetch('https://a-9yf4.onrender.com/verify-pr-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pr_code: prCode })
    });
    const data = await response.json();
    if (data.message === 'PR Code verified successfully!') {
      alert('Security Unlocked!');
    } else {
      alert('Invalid PR Code');
    }
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
      if (result) {
        handleScan(result);
      }
      if (error) {
        handleError(error);
      }
    });

    return () => {
      codeReader.reset();
    };
  }, [handleScan]); // handleScan을 의존성 배열에 추가

  return (
    <div>
      <h2>Scan QR Code</h2>
      <video ref={videoRef} style={{ width: '100%' }} />
      {scannedCode && <p>Scanned PR Code: {scannedCode}</p>}
    </div>
  );
};

export default QrScannerPage;
