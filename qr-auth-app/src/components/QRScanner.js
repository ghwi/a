import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import API from '../api';

const urlList = [
  { name: '네이버', url: 'https://www.naver.com' },
  { name: '구글', url: 'https://www.google.com' },
  { name: '다음', url: 'https://www.daum.net' },
  { name: '유튜브', url: 'https://www.youtube.com' },
];

function QRScanner() {
  const [qrSuccess, setQrSuccess] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);

    scanner.render(
      async (decodedText) => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${API}/verify-pr-code`,
            { pr_code: decodedText },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data.message === 'PR Code verified successfully!') {
            alert('✅ 잠금 해제 완료!');
            setQrSuccess(true);
          } else {
            alert('❌ 인증 실패: 올바르지 않은 코드입니다.');
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
  }, []);

  const handleUrlClick = async (url) => {
    try {
      await axios.post(`${API}/log-url-click`, { url });
      window.open(url, '_blank');
    } catch (err) {
      alert('❌ URL 클릭 기록 실패');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📷 QR 코드를 카메라에 보여주세요</h2>
      <div id="reader" style={styles.qrBox}></div>

      {qrSuccess && (
        <div style={styles.urlContainer}>
          <h3 style={styles.subtitle}>🔗 이동할 사이트를 선택하세요</h3>
          <div style={styles.buttonGroup}>
            {urlList.map((site) => (
              <button
                key={site.url}
                onClick={() => handleUrlClick(site.url)}
                style={styles.urlButton}
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '30px',
    fontFamily: 'sans-serif',
    background: '#f8f9fa',
    minHeight: '100vh',
  },
  title: {
    marginBottom: '20px',
    color: '#343a40',
    fontSize: '24px',
  },
  qrBox: {
    width: '300px',
    margin: 'auto',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  urlContainer: {
    marginTop: '30px',
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#495057',
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '15px',
  },
  urlButton: {
    background: '#4dabf7',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.3s',
  },
};

export default QRScanner;
