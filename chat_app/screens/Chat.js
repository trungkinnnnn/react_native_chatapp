import React, { useState,useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { TouchableOpacity, Text, View, Image, StyleSheet, ScrollView,TextInput ,KeyboardAvoidingView} from "react-native";
import { GiftedChat, InputToolbar, Composer, Send, Bubble,MessageText } from "react-native-gifted-chat";
import { collection, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import createOrGetChatRoom from "./CreateOrGetChatRoom";
import moment from 'moment';
import 'moment/locale/vi'; // Chọn ngôn ngữ mà bạn muốn sử dụng (ví dụ: tiếng Việt)


export default function Chat({ route }) {
 
  const userEmail = route.params?.userEmail || '';
  const selectedUser = route.params?.selectedUser || '';
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: selectedUser.email, // Sử dụng email hoặc thông tin khác tùy thuộc vào dữ liệu bạn có
      headerTitleStyle: {
        alignSelf: 'center',
        marginLeft: -30, // Adjust this value based on your preference
        color: 'white', // Set the text color
      },
      headerStyle: {
        backgroundColor: '#242526', // Set the background color
      },
    });
  }, [navigation, selectedUser]);

  useEffect(() => {
    const chatRoomID = route.params?.chatRoomID;
  
    if (!chatRoomID) {
      return;
    }
    const collectionRef = collection(database, 'chats', chatRoomID, 'messages');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: doc.data().user,
      }));
  
      setMessages(newMessages);
    });
  
    return () => unsubscribe();
  }, [route.params?.chatRoomID]);
  

  const [inputText, setInputText] = useState('');
  const onSend = () => {
    // Xử lý khi gửi tin nhắn
    const newMessage = {
      text: inputText,
      user: userEmail,
      createdAt: new Date(),
    };
  
    setMessages([newMessage,...messages]);
  
    const saveMessage = async () => {
      try {
        const chatRoomID = await createOrGetChatRoom(userEmail, selectedUser.email);
  
        await addDoc(collection(database, 'chats', chatRoomID, 'messages'), {
          createdAt: newMessage.createdAt,
          text: newMessage.text,
          user: newMessage.user,
        });
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
      }
    };
  
    saveMessage();
    setInputText('');
  };

  const scrollViewRef = useRef();

  useEffect(() => {
    const scrollView = scrollViewRef.current;
  
    // Chờ cho đến khi giao diện đã được cập nhật trước khi cuộn xuống
    requestAnimationFrame(() => {
      if (scrollView) {
        scrollView.scrollToEnd({ animated: true });
      }
    });
  }, [messages]);
  
  
  const getAvatarUrl = (user) => {
    // Trong trường hợp này, giả sử có một trường avatar trong thông tin người dùng
    return user && user.avatar ? { uri: user.avatar } : require('../assets/profile.png');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10} // Điều chỉnh giá trị này để phù hợp với trường hợp cụ thể của bạn
      style={{ flex: 1 }}
    >
      <View style={styles.header_null}></View>
      <View style={styles.header}>
        <TouchableOpacity
            style={styles.postButton}
            onPress={() => navigation.navigate("home", { userEmail: userEmail })}
            >
            <Image
                style={styles.icon}
                source={require('../assets/arrow-left.png')}
            />
        </TouchableOpacity>
        
          <Image
                  style={styles.icon_avatar}
                  source={getAvatarUrl(selectedUser)}
          />
        
        <TouchableOpacity
           style={styles.name_selectedUser}
           onPress={() => navigation.navigate("Profile", { userEmail: selectedUser.email,selectedUser_email: userEmail})}
        >
          <Text style={styles.text_name}>{selectedUser.hoten}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef}>
        {messages.slice().reverse().map((message, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: message.user !== selectedUser.email ? 'flex-end' : 'flex-start',
              padding: 10,
            }}
          >

            {message.user === selectedUser.email && (
              <Image
                source={ getAvatarUrl(selectedUser) }
                style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5 }}
              />
            )}
            <View
              style={{
                backgroundColor: message.user !== selectedUser.email ? 'lightblue' : 'lightgreen',
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'black' }}>
                {message.text}
                {'\n'}
                <Text style={{ fontSize: 10, color: 'gray' }}>
                  {moment(message.createdAt).format('DD/MM/YYYY HH:mm')}
                </Text>
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <TextInput
          style={styles.input_message}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhắn tin"
        />
        <TouchableOpacity onPress={() => inputText.trim() ? onSend() : alert("Bạn chưa nhập tin nhắn")} style={styles.button_send}>
          <Image
                style={styles.icon_send}
                source={require('../assets/paper-plane.png')}
              />
        </TouchableOpacity>
      </View>
    
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  icon:{
    marginLeft:15,
    width:25,
    height:25,
  },

  icon_avatar:{
    width:45,
    height:45,
    marginLeft:20,
    borderRadius: 30,
  },
  header_null:{
    width:700,
    height:150,
    position:"absolute",
    backgroundColor:"white",
    top:-42,
    left:-30,
    elevation: 5,
  },
  header:{
    width:"100%",
   flexDirection:"row",
   marginTop:50,
   marginLeft:13,
   alignItems:'center',
   width:"100%",
   marginBottom:50,
  },
  text_name:{
    fontSize:25,
    marginLeft:15,
  },
  input_message:{
    flex: 1, 
    borderWidth: 1, 
    marginRight: 10, 
    padding: 8,
    borderColor:"#b3b3b3",
    fontSize:18,
    borderRadius:30,
    paddingLeft:20,
  },
  icon_send:{
    width:30,
    height:30,
  },
  button_send:{
    backgroundColor:"#dedede",
    width:45,
    height:45,
    justifyContent:"center",
    alignItems:"center",
    borderRadius:10,
  }
 
});