import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import API from '../api';
import io from 'socket.io-client';

const socket = io(API); // API는 http://서버주소:포트 로 설정되어 있어야 함

function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);

    scanner.render(
      async (decodedText) => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(`${API}/verify-pr-code`, { pr_code: decodedText }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.message === 'PR Code verified successfully!') {
            alert('✅ 잠금 해제 완료!');
          } else {
            alert('❌ 인증 실패');
          }
        } catch (error) {
          alert('❌ 서버 오류');
        }
        scanner.clear();
      },
      (error) => {
        console.warn('QR Code scan error:', error);
      }
    );

    socket.on('url_selected', (data) => {
      window.open(data.url, '_blank');
    });
  }, []);

  return (
    <div>
      <h2>QR 코드를 스캔하세요</h2>
      <div id="reader" style={{ width: '300px', margin: 'auto' }}></div>
    </div>
  );
}

export default QRScanner;
