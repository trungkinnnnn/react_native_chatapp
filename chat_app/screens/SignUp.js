
import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection ,doc ,setDoc} from "firebase/firestore";
import { auth, database } from "../config/firebase";

export default function Signup({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onHandleSignup = async () => {
    if (email !== "" && password !== "") {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const userDocRef = doc(collection(database, "users"), userCredential.user.email);
      
        // Thêm thông tin người dùng vào document
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          avatar: "", 
          img_background: "",
          hoten:"",
          ngaysinh: "", 
          gioitinh: "", 
          address: "",   
          sdt: "", 
          firstLogin: true,
        });

         console.log("User created with ID: ",  userCredential.user.email);

        Alert.alert("Thông báo","Đăng ký thành công");
        setTimeout(() => {
          navigation.navigate("signin");
          setEmail("");setPassword("");
        }, 1000);
      } catch (error) {
        Alert.alert("Thông báo","Tài khoản đã tồn tại");
      }
    }else{
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ tài khoản mật khẩu");
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>Đăng ký</Text>
      <TextInput
        style={style.input}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoFocus={true}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={style.input}
        placeholder="Enter password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TouchableOpacity style={style.button} onPress={onHandleSignup}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>Đăng ký</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
        <TouchableOpacity onPress={() => navigation.navigate("signin")}>
          <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}>Đã có tài khoản? Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "orange",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#e8e8e8",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    width: "100%",
  },
  button: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    width: "100%",
  },
});
