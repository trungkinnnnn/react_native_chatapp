

import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { getDoc, updateDoc,doc,collection } from "firebase/firestore";

export default function Signin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onHandleSignin = async() => {
    if (email !== "" && password !== "") {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(collection(database, "users"), email);
        const userDoc = await getDoc(userRef);
    
        if (userDoc.exists()) {
          const isFirstLogin = userDoc.data().firstLogin;
          if (isFirstLogin) {
            await updateDoc(userRef, { firstLogin: false });
            console.log("Login success");
            navigation.navigate("EditProfile", { userEmail: email });
            setEmail("");setPassword("");
          } else {
            console.log("Login success");
            navigation.navigate("home", { userEmail: email });
            setEmail("");setPassword("");
          }
        }else{
         
        }
      } catch (error) {
        Alert.alert("Thông báo", "Sai tài khoản hoặc mật khẩu");
      }
    }else{
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ tài khoản mật khẩu");
    }
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>Đăng nhập</Text>
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

      <TouchableOpacity style={style.button} onPress={onHandleSignin}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>Đăng nhập</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
        <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>Bạn chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("signup")}>
          <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}>Đăng ký</Text>
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

