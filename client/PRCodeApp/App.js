import React, { useState } from 'react';
import { Text, TextInput, Button, View, Alert } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import QRCodeScreen from './src/screens/QRCodeScreen'; // QR 코드 스캔 화면 추가

const Stack = createStackNavigator();

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 처리
  const handleLogin = async () => {
    try {
        const response = await axios.post('http://192.168.1.10:5001/login', {
            username,
            password,
          });
      if (response.data.token) {
        setIsLoggedIn(true);
        Alert.alert('Login Successful', 'You have logged in!');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  // 회원가입 처리
  const handleSignup = async () => {
    try {
        const response = await axios.post('http://192.168.1.10:5001/login', {
            username,
            password,
          });
      if (response.data.message === 'User created successfully') {
        Alert.alert('Signup Successful', 'You can now log in!');
      } else {
        Alert.alert('Signup Failed', response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  // 로그인 성공 후 QR 코드 스캔 화면으로 이동
  if (isLoggedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="QRCodeScreen">
          <Stack.Screen name="QRCodeScreen" component={QRCodeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Login</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
        }}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
        }}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!isLoggedIn ? (
        <>
          <Button title="Login" onPress={handleLogin} />
          <Button title="Signup" onPress={handleSignup} />
        </>
      ) : (
        <Text>Logged in successfully!</Text>
      )}
    </View>
  );
};

export default App;
