import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function PhotoScreen() {
  const [uri, setUri] = useState<string | null>(null); // đường dẫn ảnh đang hiển thị

  // Chọn một ảnh có sẵn trong thư viện ảnh
  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // cho phép cắt ảnh trước khi chọn
      quality: 0.8,
    });
    if (!result.canceled) setUri(result.assets[0].uri);
  }

  // Chụp ảnh mới: phải xin quyền dùng camera trước
  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Chưa có quyền camera', 'Vào Cài đặt → Expo Go và bật Camera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setUri(result.assets[0].uri);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Ảnh' }} />

      {uri ? (
        <Image source={{ uri }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.placeholder]}>
          <Text style={styles.placeholderText}>Chưa có ảnh</Text>
        </View>
      )}

      <Pressable style={styles.button} onPress={pickFromLibrary}>
        <Text style={styles.buttonText}>Chọn từ thư viện</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Chụp ảnh mới</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7', padding: 16, gap: 12 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  placeholder: { backgroundColor: '#e5e5ea', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#8e8e93' },
  button: { backgroundColor: '#007aff', borderRadius: 10, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
