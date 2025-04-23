// src/screens/QRCodeScreen.js
import React from 'react';
import { View, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';

const QRCodeScreen = () => {
  // QR 코드가 스캔되었을 때 실행되는 함수
  const handleScan = (e) => {
    const scannedCode = e.data;  // QR 코드 데이터(예: PR 코드)
    Alert.alert('Scanned QR Code', `PR Code: ${scannedCode}`);
    verifyPRCode(scannedCode);  // PR 코드 검증 함수 호출
  };

  // PR 코드 서버에서 검증하는 함수
  const verifyPRCode = async (prCode) => {
    try {
      const response = await axios.post('http://localhost:5001/verify-pr-code', {
        pr_code: prCode,
      });
      if (response.data.message === 'PR Code verified successfully!') {
        Alert.alert('Verification Successful', 'The PR Code is valid!');
      } else {
        Alert.alert('Verification Failed', 'The PR Code is invalid.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to verify PR code.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* QR 코드 스캔을 위한 화면 */}
      <QRCodeScanner onRead={handleScan} />
    </View>
  );
};

export default QRCodeScreen;
