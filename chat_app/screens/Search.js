import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, FlatList, Image, TextInput,ScrollView } from 'react-native';
import { useNavigation,useFocusEffect  } from '@react-navigation/native';
import { collection, getDocs,query,where,orderBy,doc, setDoc,limit,updateDoc  } from 'firebase/firestore';
import { database } from '../config/firebase';
import createOrGetChatRoom from './CreateOrGetChatRoom';
import { auth } from '../config/firebase';
import { StyleSheet } from 'react-native';




export default function Search({ route }) {
   
  const userEmail = route.params?.userEmail || '';
  console.log(userEmail);
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequestStatus, setFriendRequestStatus] = useState({});
  const [latestMessages, setLatestMessages] = useState({});
  const [chatRoomIDs, setChatRoomIDs] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);




  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(database, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const usersData = [];

        usersSnapshot.forEach((doc) => {
          const { email, avatar,hoten } = doc.data();
          usersData.push({ email, avatar ,hoten});
        });

        setUsers(usersData);

      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      }
    };
    fetchUsers();
   
  }, [userEmail]);

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

  const handleSearch = async () => {
    try {
      const usersCollection = collection(database, 'users');
      const q = query(usersCollection, where('hoten', '==', searchKeyword));
  
      const searchResultsSnapshot = await getDocs(q);
      const searchResultsData = [];
  
      searchResultsSnapshot.forEach((doc) => {
        const { email, avatar ,hoten} = doc.data();
        searchResultsData.push({ email, avatar,hoten });
      });
      if(searchKeyword === "")
      {
        setSearchResults([]);
        return;
      }else{
        setSearchResults(searchResultsData);
      }
      
    } catch (error) {
      console.error('Lỗi khi thực hiện tìm kiếm:', error);
    }
  };
 

  
  useEffect(() => {
    handleSearch();
  }, [searchKeyword]);

  const sendFriendRequest = async (senderEmail) => {
    try {
      const members = [senderEmail, userEmail].sort();

      const ID_requests = members.join('_');
      // nguowif nhan
      const friendRequests_receiver = doc(collection(database, 'friendRequests'), senderEmail);
      const requestsCollectionRef_receiver = collection(friendRequests_receiver, 'requests');
   
      const friendRequests_receiverData = {
        createdAt: new Date(),
        email_send: userEmail,
        email_receiver: senderEmail,
        status:'pending',
        type:'receiver'
      }
      const friendRequestsDocumentRef_send = doc(requestsCollectionRef_receiver, ID_requests);
      await setDoc(friendRequestsDocumentRef_send,friendRequests_receiverData);

      // nguoi gui
      const friendRequests_Send = doc(collection(database, 'friendRequests'), userEmail);
      const requestsCollectionRef_Send = collection(friendRequests_Send, 'requests');

      const friendRequests_sendData = {
        createdAt: new Date(),
        email_send: userEmail,
        email_receiver: senderEmail,
        status:'pending',
        type:'sender'
      }
      const friendRequestsDocumentRef_receiver= doc(requestsCollectionRef_Send,ID_requests);
      await setDoc(friendRequestsDocumentRef_receiver,friendRequests_sendData);
      
    
      console.log('Lời mời kết bạn đã được gửi thành công.');
    } catch (error) {
      console.error('Lỗi khi gửi lời mời kết bạn:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const friendRequestsRef = collection(database, 'friendRequests', userEmail, 'requests');
      const friendRequestsSnapshot = await getDocs(friendRequestsRef);
  
      const friendRequestsData = [];
      friendRequestsSnapshot.forEach((doc) => {
        const { email_send, email_receiver, status, type } = doc.data();
         friendRequestsData.push({ email_send, email_receiver, status, type });
      });
  
      setFriendRequests(friendRequestsData);
    
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu lời mời kết bạn:', error);
    }
  };

  const handleSendFriendRequest = async (senderEmail) => {
    await sendFriendRequest(senderEmail);
    // Sau khi gửi lời mời kết bạn, cập nhật lại danh sách lời mời
    fetchFriendRequests(); 
  };
  
  // Gọi hàm để lấy dữ liệu khi component được render
  useEffect(() => {
    fetchFriendRequests();
  }, [latestMessages]);


  
  const handleAcceptFriendRequest = async (email_send, email_receiver) => {
    try {
      console.log(email_send, email_receiver);

      const friendsCollection = collection(database, 'friends');

      const friendDocReceiver = doc(friendsCollection, email_receiver);
      const friendCollectionReceiver = collection(friendDocReceiver, 'friend');
      await setDoc(doc(friendCollectionReceiver, email_send), {email:email_send});
    
      // Tương tự, thực hiện cho người gửi
      const friendDocSend = doc(friendsCollection, email_send);
      const friendCollectionSend = collection(friendDocSend, 'friend');
      await setDoc(doc(friendCollectionSend, email_receiver), {email:email_receiver});

      const members = [email_receiver,email_send].sort();
      const ID_requests = members.join('_');
     
      const friendRequestsSend = doc(collection(database, 'friendRequests'), email_send);
      const requestsCollectionSend = collection(friendRequestsSend, 'requests');
      const friendRequestsDocSend = doc(requestsCollectionSend,ID_requests);

      await updateDoc(friendRequestsDocSend, { status: 'accepted' });

    // Cập nhật trạng thái trong FriendRequests cho người nhận
    const friendRequestsReceiver = doc(collection(database, 'friendRequests'), email_receiver);
    const requestsCollectionReceiver = collection(friendRequestsReceiver, 'requests');
    const friendRequestsDocReceiver = doc(requestsCollectionReceiver,ID_requests);

    await updateDoc(friendRequestsDocReceiver, { status: 'accepted' });

    console.log('Xác nhận lời mời kết bạn thành công');
    fetchFriendRequests();
    } catch (error) {
      console.error('Lỗi khi xác nhận lời mời kết bạn:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header_null}>
            <Text>noting</Text>
      </View>
      <View style={styles.header}>
        
            <TouchableOpacity
                style={styles.postButton}
                onPress={() => navigation.navigate("home",{userEmail:userEmail})}
                >
                <Image
                    style={styles.icon}
                    source={require('../assets/arrow-left.png')}
                />
            </TouchableOpacity>
            <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm..."
                value={searchKeyword}
                autoFocus={true}
                onChangeText={(text) => setSearchKeyword(text)}
                onBlur={handleSearch}
            />
      
      </View>
      <FlatList style={styles.listContainer}
        data={searchKeyword ? searchResults : users}
        keyExtractor={(item, index) => (item && item.email ? item.email : index.toString())}
        renderItem={({ item }) => {
        
          if (item.email !== userEmail) {
            const members = [item.email, userEmail].sort();
            const chatRoomID = members.join('_');
            const isFriendRequest = friendRequests.find(
              request =>
                (request.email_send === userEmail && request.email_receiver === item.email) ||
                (request.email_send === item.email && request.email_receiver === userEmail)
            );

            console.log(isFriendRequest);
            let buttonText = '';
            let color_text = '';
            let onPressAction = () => {};
            if (isFriendRequest) {
              if (isFriendRequest.status === 'pending' && isFriendRequest.type === 'sender') {
                buttonText = 'Chờ xác nhận';
                color_text = '#bfbfbf';
              } else if (isFriendRequest.status === 'pending' && isFriendRequest.type === 'receiver') {
                buttonText = 'Xác nhận';
                color_text = '#f54574';
                console.log(item.email+ userEmail);
                onPressAction = () => handleAcceptFriendRequest(item.email,userEmail);
              }else if (isFriendRequest.status === 'accepted'){
                buttonText = 'Bạn bè';
                color_text = '#10ebeb';
              }
            } else {
              buttonText = 'Kết Bạn';
              color_text = '#445ac7';
              onPressAction = () => handleSendFriendRequest(item.email);
            }

            return (
              <View style={styles.container_item}>
                <View style={{width:"95%"}}>
                  {buttonText === "Bạn bè" ? 
                  ( 
                  <TouchableOpacity key={item.email} onPress={() => handleChatPress(item)}>
                      <View style={styles.list}>
                        {item.avatar ? (
                          <Image style={styles.img} source={{ uri: item.avatar }} />
                        ) : (
                          <Image style={styles.img}
                                source={require("../assets/profile.png")}
                            />
                        )}
                        <View style={styles.name_message}>
                          <Text style={styles.text}>{item.hoten}</Text>
                        </View>
                    </View>
                  </TouchableOpacity>
                  ):(   
                    <TouchableOpacity key={item.email}  onPress={() => navigation.navigate("Profile", { userEmail: item.email , selectedUser_email:userEmail })}>
                    <View style={styles.list}>
                      {item.avatar ? (
                        <Image style={styles.img} source={{ uri: item.avatar }} />
                      ) : (
                        <Image style={styles.img}
                              source={require("../assets/profile.png")}
                          />
                      )}
                      <View style={styles.name_message}>
                        <Text style={styles.text}>{item.hoten}</Text>
                      </View>
                  </View>
                </TouchableOpacity>
                    )
                  }
                 
                </View>

                <View>
                  {buttonText && (
                    <TouchableOpacity onPress={onPressAction}>
                        <View style={[styles.button_friend,,{borderRadius:10,backgroundColor:color_text,}]}>
                                <Text style={styles.sendRequestText}>{buttonText}</Text>
                        </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          } else {
            return null;
          }
        }}
      />
    <View style={styles.footer}>

    </View>
    
    </View>
  );


}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position:'relative',
  
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
   marginTop:40,
   //backgroundColor:"#cccccc",
   alignItems:'center',
   width:"100%",
  
   marginBottom:15,
  },

 
  icon:{
    marginLeft:15,
    width:25,
    height:25,
  },
searchInput: {
  width:300,
  height: 40,
  borderColor: 'gray',
  borderRadius: 5,
  paddingLeft: 10,  
  paddingRight: 10, 
  marginBottom: 10, 
  marginTop: 10,   
  marginLeft:15,
  fontSize:18,


},
  listContainer:{
    width: "100%",
    
  },

  container_item:{
    flexDirection:"row",
    width:"100%",
   alignItems:"center",
   marginBottom:7,
   borderBottomWidth: 1,
   borderBottomColor: "gray",
 
   justifyContent:"space-around",
  },

  button_friend:{
  width:100,
  backgroundColor:"#10ebeb",
  alignItems:'center',
  justifyContent:'center',
  borderRadius:10,
  height:40,
  marginRight:"10%",
  
  },
  sendRequestText:{
    width:70,
    lineHeight:15,
    textAlign:'center',
    color:"#2e2e2e",
  },

  list:{ 
    flexDirection: 'row', 
    alignItems: 'center',
    width: "80%",
    marginLeft:"10%",
    height:70,
  },
  img:{
    width: 40,
    height: 40,
    borderRadius: 30,
    marginLeft: 10
  },

  message_todate:{
    flexDirection:"row",
    justifyContent:"space-between",
  },
  text:{
    fontSize:19,
    marginLeft:15,
    color: "black"
  },
  message:{
    fontSize:16,
    marginLeft:15,
    color: "#d1d1d1"
  },

    userItem: {
      marginRight: 10,
  
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    userPhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    userName: {
      marginTop: 5,
      textAlign: 'center',
    },
    selectedUserName: {
      marginTop: 5,
      textAlign: 'center',
      fontWeight: 'bold',
      color:'#DC143C'
    },
    statusIndicator: {
      marginTop: 5,
      textAlign: 'center',
      fontSize: 12,
      color: 'gray',
    },
    statusContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    // statusPhoto: {
    //   width: windowWidth,
    //   height: windowHeight - 300,
    // },
    statusDescription: {
      fontSize:18,
      marginTop: 10,
      textAlign: 'center',
    },
  
})


