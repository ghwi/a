import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import API from '../api';
import io from 'socket.io-client';

const socket = io(API);

function QRScanner() {
  const [verified, setVerified] = useState(false);
  const [urlClicked, setUrlClicked] = useState(false);

  const urls = [
    { label: '네이버', link: 'https://www.naver.com' },
    { label: '구글', link: 'https://www.google.com' },
    { label: '다음', link: 'https://www.daum.net' },
    { label: '유튜브', link: 'https://www.youtube.com' },
  ];

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
            alert('✅ 인증 성공!');
            setVerified(true);
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
      // 서버에서 URL 선택 신호 오면 열기
      if (!urlClicked) {
        window.open(data.url, '_blank');
        setUrlClicked(true); // 중복 방지
      }
    });
  }, [urlClicked]);

  const handleClickUrl = async (url) => {
    try {
      await axios.post(`${API}/log-url-click`, { url });
    } catch (err) {
      alert('URL 전송 실패');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>QR 코드를 스캔하세요</h2>
      {!verified && <div id="reader" style={{ width: '300px', margin: 'auto' }}></div>}
      {verified && (
        <div>
          <h3>✅ 인증 성공! 이동할 사이트를 선택하세요:</h3>
          {urls.map((item) => (
            <button
              key={item.link}
              style={{ display: 'block', margin: '10px auto' }}
              onClick={() => handleClickUrl(item.link)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QRScanner;
  