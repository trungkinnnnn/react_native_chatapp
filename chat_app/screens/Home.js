import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, FlatList, Image, TextInput,ScrollView } from 'react-native';
import { useNavigation,useFocusEffect  } from '@react-navigation/native';
import { collection, getDocs,query,where,orderBy,doc, setDoc,limit,updateDoc  } from 'firebase/firestore';
import { database } from '../config/firebase';
import createOrGetChatRoom from './CreateOrGetChatRoom';
import { auth } from '../config/firebase';
import { StyleSheet } from 'react-native';

export default function Home({ route }) {
  //const userEmail = "hoa@gmail.com";
  const userEmail = route.params?.userEmail || '';
  console.log(userEmail);
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequestStatus, setFriendRequestStatus] = useState({});
  const [latestMessages, setLatestMessages] = useState({});




  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(database, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const frends = doc(database,"friends",userEmail);
        const doc_user = collection(frends, 'friend');
        const email_friend = await getDocs(doc_user);
        const email_friends = email_friend.docs.map((doc) => doc.data().email);

        const usersData = [];

        usersSnapshot.forEach((doc) => {
          const { email, avatar,hoten } = doc.data();
          for (const email_f of email_friends) {
            if(email_f === email){
              usersData.push({ email, avatar ,hoten});
            }
          }
        });

        setUsers(usersData);

      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      }
    };
    fetchUsers();
   
  }, [route.params]);
  console.log("danh sach ban be : "+ users);
  const handleChatPress = async (selectedUser) => {
    try {
      // Tạo hoặc lấy ID phòng chat
      const chatRoomID = await createOrGetChatRoom(userEmail, selectedUser.email);

      // Chuyển đến màn hình Chat và truyền dữ liệu người dùng đã chọn và ID phòng chat
      navigation.navigate('chat', { selectedUser, chatRoomID,userEmail });
    } catch (error) {
      console.error('Lỗi khi tạo hoặc lấy ID phòng chat:', error);
    }
  };
  
  const getLatestMessages = async () => {
    try {
      const userDocRef = doc(database, 'users', userEmail);
      const userChatsCollection = collection(userDocRef, 'userChats');
      const chatsSnapshot = await getDocs(userChatsCollection);
      const latestMessages = [];

      const messagesPromises = chatsSnapshot.docs.map(async (doc) => {
        const { chatRoomID } = doc.data();
        const messagesCollection = collection(database, 'chats', chatRoomID, 'messages');
        const q = query(messagesCollection, orderBy('createdAt', 'desc'), limit(1));
        const messagesSnapshot = await getDocs(q);
        if (!messagesSnapshot.empty) {
          // Nếu có tin nhắn, lấy tin nhắn cuối cùng
          const latestMessageData = messagesSnapshot.docs[0].data();
          const latestMessage = {
            chatRoomID,
            content: latestMessageData.text,
            senderID: latestMessageData.user,
            timestamp: latestMessageData.createdAt.toDate().toLocaleDateString(),
          };
          latestMessages.push(latestMessage);
        } else {
          const latestMessage = {
            chatRoomID,
            content: "Hãy bắt đầu cuộc trò chuyện nào",
            senderID: "",
            timestamp: null,
          };
          latestMessages.push(latestMessage);
        }
       
      });

        await Promise.all(messagesPromises)
        setLatestMessages(latestMessages);
        console.log("hien thi cac phong : ", latestMessages);
      
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn cuối cùng:', error);
    }
  
  };
  
  useFocusEffect(
    React.useCallback(() => {
      getLatestMessages();
    }, [userEmail])
  );



  return (
    <View style={styles.container}>
      <View style={styles.header_null}></View>
      <View style={styles.header}>
        <Text style={styles.title_message}>Đoạn chat</Text>
        <TouchableOpacity
            style={styles.bellButton}
           // onPress={() => navigation.navigate("signin")}
          >
          
            <Image
              style={styles.icon_bell}
              source={require('../assets/bell.png')}
            />
          </TouchableOpacity>
      </View>
      <View >
           <TouchableOpacity
              style={styles.search}
               onPress={() => navigation.navigate("Search", { userEmail: userEmail })}
           >
           <Image
              style={styles.icon_search}
              source={require('../assets/search.png')}
            />
            <Text style={styles.text_search}>
              Tìm kiếm
            </Text>
           </TouchableOpacity>
      </View>
      <FlatList style={styles.listContainer}
        data={searchKeyword ? searchResults : users}
        keyExtractor={(item, index) => (item && item.email ? item.email : index.toString())}
        renderItem={({ item }) => {
        
          if (item.email !== userEmail) {
            const members = [item.email, userEmail].sort();
            const chatRoomID = members.join('_');

            let lastMessageSenderId = '';
            let lastMessageText = '';
            let lastMessageTimestamp = '';

            // Kiểm tra xem latestMessages có phải là mảng không
            if (Array.isArray(latestMessages) && latestMessages.length > 0) {
              const islastMessage = latestMessages.find((message) => message.chatRoomID === chatRoomID);
            
             
              if (islastMessage) {
                lastMessageSenderId = islastMessage.senderID;

                const maxMessageLength = 33;
                lastMessageText = islastMessage.content.length > maxMessageLength
                  ? islastMessage.content.slice(0, maxMessageLength) + '...'  // Nếu vượt quá giới hạn, thêm dấu chấm cuối
                  : islastMessage.content;

                lastMessageTimestamp = islastMessage.timestamp;
              } else {
                lastMessageSenderId = "";
                lastMessageText = "Hãy bắt đầu cuộc trò chuyện nào !!!";
                lastMessageTimestamp = "";
              }
            } else {
              // Xử lý trường hợp latestMessages không phải là mảng hoặc là mảng rỗng
              lastMessageSenderId = "";
              lastMessageText = "Hãy bắt đầu cuộc trò chuyện nào !!!";
              lastMessageTimestamp = "";
            }
            
            // Sử dụng lastMessageSenderId, lastMessageText, lastMessageTimestamp trong FlatList
          
            return (
              <View style={styles.container_item}>
                <View style={{width:"95%"}}>
                  <TouchableOpacity key={item.email} onPress={() => handleChatPress(item)}>
                    <View>
                      <View style={styles.list}>
                        {item.avatar ? (
                          <Image style={styles.img} source={{ uri: item.avatar }} />
                        ) : (
                          <Image style={styles.img}
                                source={require("../assets/profile.png")}
                            />
                        )}
                        <View style={styles.name_message}>
                          <View style={styles.message_todate}>
                            <Text style={styles.text}>{item.hoten}</Text>
                            <Text style={styles.message}>{lastMessageTimestamp}</Text>
                          </View>
                        
                            {lastMessageSenderId !== userEmail ? (
                              <View style={styles.message_todate}>
                                <Text style={styles.message}>{lastMessageText}</Text>
                              </View>
                            ) : (
                              <View  style={styles.message_todate}>
                                <Text style={styles.message}>bạn : {lastMessageText}</Text>
                              </View>
                            )}
                          
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          } else {
            return null;
          }
        }}
      />
    <View style={styles.footer}>
     <View>
        <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile", { userEmail: userEmail , selectedUser_email:userEmail })}
          >
            <Image
              style={styles.icon_profile}
              source={require('../assets/user.png')}
            />
          </TouchableOpacity>
     </View>
     <View>
      <TouchableOpacity
          style={styles.messageButton}
        >
          <Image
            style={styles.icon_message}
            source={require('../assets/bubble-chat.png')}
          />
        </TouchableOpacity>
     </View>
     <View>
        <TouchableOpacity
            style={styles.postButton}
            onPress={() => navigation.navigate("PostListScreen", { userEmail: userEmail })}
          >
            <Image
              style={styles.icon_post}
              source={require('../assets/post.png')}
            />
          </TouchableOpacity>
     </View>
    </View>
    <View style={styles.footer_null}></View>
  </View>

  );


}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    position:'relative',
  },
  header_null:{
    position:"absolute",
    top:0,
    left:0,
    backgroundColor:"white",
    width:500,
    height:90,
    elevation:5,

  },
  header:{
    width:"100%",
    height:40,
    marginTop:40,
    marginBottom:15,
    flexDirection:"row",
    alignItems:'center',
    justifyContent:"space-between",
    zIndex:1,
    position:"absolute",
    top:0,
    left:0,
  },
  title_message:{
    fontSize:30,
    fontWeight: '400',
    marginLeft:25,
    zIndex:1,
  },
  search:{
    flexDirection:"row",
    marginTop:"30%",
    alignItems:'center',
    marginLeft:"auto",
    marginRight:"auto",
    backgroundColor:"#e8e8e8",
    width:340,
    height:44,
    borderRadius:50,
  },
  text_search:{
    fontSize:20,
  },
  icon_search:{
    width:20,
    height:20,
    marginRight:20,
    marginLeft:20,
  },
  icon_message:{
    width:40,
    height:40,
  },
  icon_post:{
    width:30,
    height:30,
  },
  icon_profile:{
    width:30,
    height:30,
  },
  icon_bell:{
    width:30,
    height:30,
  },
  listContainer:{
    width: "100%",
    marginTop:20,
  },

  container_item:{
    flexDirection:"row",
    width:"100%",
   alignItems:"center",
   marginBottom:15,
  },

  button_friend:{
  width:50,
  backgroundColor:"red",
  alignItems:'center',
  justifyContent:'center',
  borderRadius:10,
  height:70,
  
  },
  sendRequestText:{
    width:40,
    lineHeight:15,
    textAlign:'center',
  },

  list:{ 
    flexDirection: 'row', 
    alignItems: 'center',
    width: "100%",
    marginLeft:5,
    height:70,
    
  },
  img:{
    width: 65,
    height: 65,
    borderRadius: 30,
    marginLeft: 10
  },
  name_message:{
    height:65,
    width:330,
    alignItems:'center',
    marginLeft:15,
   
  },
  message_todate:{
    flexDirection:"row",
    justifyContent:"space-between",
    width:"100%",
  
  },
  text:{
    marginTop:3,
    fontSize:19,
    marginBottom:3,
    color: "black"
  },
  message:{
    fontSize:16,
    color: "#5e5e5e",
    marginRight:"25%",

  },
   
  
    bellButton:{
      backgroundColor: '#ebebeb',
      padding: 10,
      borderRadius: 15,
      elevation: 5, // Độ nổi của button
      width:47,
      height:47,
      justifyContent:'center',
      alignItems:'center',
      marginTop:3,
      marginRight:15
    },
    messageButton:{
      backgroundColor: '#94f7f7',
      padding: 10,
      borderRadius: 30,
      elevation: 10, // Độ nổi của button
      width:70,
      height:70,
      justifyContent:'center',
      alignItems:'center',
      marginBottom:50,
    },
    footer:{
      margin:"auto",
      width:"100%",
      height:60,
      alignItems:'center',
      flexDirection:"row",
      justifyContent:"space-around",
      position:"absolute",
      bottom:8,
      left:0,
      zIndex:1,
   
    },
    footer_null:{
      width:500,
      height:110,
      position:"absolute",
      bottom:0,
      left:-60,
      elevation:5,
      backgroundColor:"white",
    }
})


