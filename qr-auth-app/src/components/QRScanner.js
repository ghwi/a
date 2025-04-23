import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import API from '../api'; // .env에 있는 API 주소 불러오기

function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        console.log("QR Code scanned:", decodedText);

        try {
          const response = await axios.post(`${API}/verify-pr-code`, {
            pr_code: decodedText,
          });

          if (response.data.message === "PR Code verified successfully!") {
            alert("✅ 잠금 해제 완료!");
          } else {
            alert("❌ 인증 실패: 올바르지 않은 코드입니다.");
          }
        } catch (error) {
          console.error("Error verifying PR Code:", error);
          alert("❌ 서버 오류");
        }

        scanner.clear(); // 스캔 후 정지
      },
      (error) => {
        console.warn("QR Code scan error:", error);
      }
    );
  }, []);

  return (
    <div>
      <h2>QR 코드를 카메라에 보여주세요</h2>
      <div id="reader" style={{ width: '300px', margin: 'auto' }}></div>
    </div>
  );
}

export default QRScanner;
