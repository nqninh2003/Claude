import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// Một "việc cần làm" gồm: mã riêng, nội dung, đã xong hay chưa
type Task = {
  id: string;
  title: string;
  done: boolean;
};

// Tên khoá dùng để lưu danh sách vào bộ nhớ của iPhone
const STORAGE_KEY = 'tasks';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]); // danh sách việc
  const [text, setText] = useState(''); // chữ đang gõ trong ô nhập
  const [loaded, setLoaded] = useState(false); // đã đọc xong dữ liệu cũ chưa

  // 1) Khi mở màn hình: đọc danh sách đã lưu lần trước
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) setTasks(JSON.parse(json));
      })
      .finally(() => setLoaded(true));
  }, []);

  // 2) Mỗi khi danh sách thay đổi: lưu lại vào máy
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  // Thêm một việc mới lên đầu danh sách
  function addTask() {
    const title = text.trim();
    if (!title) return; // bỏ qua nếu ô nhập trống
    setTasks((prev) => [{ id: Date.now().toString(), title, done: false }, ...prev]);
    setText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // rung báo thành công
  }

  // Chạm vào một việc: đổi trạng thái xong / chưa xong
  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    Haptics.selectionAsync(); // rung nhẹ
  }

  // Nhấn giữ một việc: hỏi lại rồi xoá
  function deleteTask(task: Task) {
    Alert.alert('Xoá việc này?', task.title, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => setTasks((prev) => prev.filter((t) => t.id !== task.id)),
      },
    ]);
  }

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <View style={styles.container}>
      {/* Tiêu đề trên thanh điều hướng */}
      <Stack.Screen
        options={{
          title: 'Việc cần làm',
          headerRight: () => (
            <Link href="/anh" style={styles.headerLink}>
              Ảnh
            </Link>
          ),
        }}
      />

      {/* Ô nhập và nút Thêm */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Thêm việc mới..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Thêm</Text>
        </Pressable>
      </View>

      <Text style={styles.counter}>Còn {remaining} việc chưa xong</Text>

      {/* Danh sách việc */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có việc nào. Hãy thêm một việc ở trên.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.task}
            onPress={() => toggleTask(item.id)}
            onLongPress={() => deleteTask(item)}
          >
            <View style={[styles.checkbox, item.done && styles.checkboxDone]} />
            <Text style={[styles.taskText, item.done && styles.taskTextDone]}>{item.title}</Text>
          </Pressable>
        )}
      />

      <Text style={styles.hint}>Chạm để đánh dấu xong · Nhấn giữ để xoá</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7', paddingHorizontal: 16 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  counter: { marginVertical: 12, color: '#6e6e73' },
  list: { gap: 8, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#8e8e93', marginTop: 32 },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
  },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#007aff' },
  checkboxDone: { backgroundColor: '#34c759', borderColor: '#34c759' },
  taskText: { flex: 1, fontSize: 16, color: '#1c1c1e' },
  taskTextDone: { textDecorationLine: 'line-through', color: '#8e8e93' },
  hint: { textAlign: 'center', color: '#8e8e93', fontSize: 12, paddingVertical: 12 },
  headerLink: { color: '#007aff', fontSize: 17 },
});
