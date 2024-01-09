import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet , TextInput } from 'react-native';
import { collection, getDocs,getDoc,doc,query,orderBy,where,onSnapshot,limit } from 'firebase/firestore';
import { database, storage } from '../config/firebase';
import { useNavigation  } from '@react-navigation/native';
const { format } = require('date-fns');

const PostListScreen = ({route }) => {
  const navigation = useNavigation();
 const userEmail = route.params?.userEmail || '';
  //const userEmail = "hoa@gmail.com";
  const [hoten, sethoten] = useState("");
  const [selecetedAvatar, setSelectedAvatar] = useState(null);
  const [friendPosts, setFriendPosts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(collection(database, "users"), userEmail);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();

        if (userData) {
          sethoten(userData.hoten || "");
          setSelectedAvatar(userData.avatar || null);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng: ", error);
      }
    };
    fetchUserData();
  }, []);
console.log("hoten" + hoten);
console.log("avatar" + selecetedAvatar);

// Trong màn hình PostListScreen:
useEffect(() => {
  const fetchPosts = async () => {
    try {
      const collec_friends = doc(collection(database, "friends"), userEmail);
      const doc_friends = await getDocs(collection(collec_friends, 'friend'));
      const array_friend = doc_friends.docs.map((doc) => doc.id);
      array_friend.push(userEmail);
      console.log("mang fiend" + array_friend);
      const allPosts = [];
      for (const friendId of array_friend) {
        console.log("id friend : " + friendId);
        // Đoạn mã xử lý cho mỗi bạn bè
        const friendPostsCollection = collection(database, `posts/${friendId}/user_posts`);
        const friendPostsQuery = query(friendPostsCollection, orderBy('timestamp', 'desc'), limit(5));
        const friendPostsSnapshot = await getDocs(friendPostsQuery);

        const friendPostsData = friendPostsSnapshot.docs.map((postDoc) => ({
          id: postDoc.data().timestamp.toString(),
          ...postDoc.data(),
        }));

        if (friendPostsData.length > 0) {
          allPosts.push(...friendPostsData);
          console.log(`Bài post của bạn bè ${friendId}:`, friendPostsData);
        } else {
          console.log(`Bài post của bạn bè ${friendId} không có dữ liệu.`);
        }
      }

      // Sắp xếp mảng giảm dần theo timestamp
      allPosts.sort((a, b) => b.timestamp - a.timestamp);
      setFriendPosts(allPosts);
    } catch (error) {
      console.error('Lỗi khi lấy bài post:', error);
    }
  };

  const unsubscribe = onSnapshot(
    query(collection(database, `posts/${userEmail}/user_posts`), orderBy('timestamp', 'desc'), limit(5)),
    (snapshot) => {
      const updatedPosts = snapshot.docs.map((doc) => ({
        id: doc.data().timestamp.toString(),
        ...doc.data(),
      }));
     

      // Sắp xếp và cập nhật danh sách bài viết
      updatedPosts.sort((a, b) => b.timestamp - a.timestamp);
      setFriendPosts(updatedPosts);

      return () => {
        unsubscribe(); // Hủy đăng ký theo dõi khi component unmount
      };
    }
  );

 
  fetchPosts();
}, [userEmail]);

  


  return (
    <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Danh Sách bài viết</Text>
          </View>
     
      <View style={styles.cardpost}>
        <Image style={styles.avatar_user} source={{uri : selecetedAvatar}} /> 
        <TouchableOpacity
          style={styles.button_next_post}
          onPress={() => navigation.navigate("PostScreen" ,{userEmail:userEmail})}>
          <Text style={styles.input}>Hôm nay bạn thế nào?</Text>
        </TouchableOpacity> 
      </View>
    <View style={styles.content_post}>
      <FlatList
        data={friendPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                    <TouchableOpacity
                      style={styles.name_avatar}
                      onPress={() => navigation.navigate("Profile", { userEmail: userEmail , selectedUser_email: item.email })}
                    >
                        {item.avatar ? (
                        <Image style={styles.avatar} source={{ uri: item.avatar }} />
                      ) : (
                        <Image style={styles.avatar}
                              source={require("../assets/profile.png")}
                          />
                      )}
                    <Text style={styles.sender}>{item.hoten}</Text>
                    </TouchableOpacity>
                </View>
               <View>
                  <Text>{format(new Date(item.timestamp), 'dd/MM/yyyy')}</Text>
               </View>
            </View>
            <View style={styles.postContainer}> 
              <Text style={styles.postContent}>{item.content}</Text>            
              <Image source={{uri: item.image}} style={styles.postImage} />
              <View style={styles.interact}>
                  <View style={styles.comment_hear}>
                    <Image source={require("../assets/heart_false.png")} style={styles.icon} />
                    <TouchableOpacity
                    
                    >
                       <Image source={require("../assets/comment.png")} style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                  {item.email == userEmail ? (
                      <TouchableOpacity
                        onPress={() => navigation.navigate("UpdatePost",{userEmail:userEmail,item})}
                      >
                        <Image source={require("../assets/office-material.png")} style={styles.icon} />
                      </TouchableOpacity>
                    ) : (
                      <View></View>
                    )}
              
              </View>
            </View>
          </View> 
        )}
      />
    </View>  


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
          onPress={() => navigation.navigate("home", { userEmail: userEmail })}
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
};

const styles = StyleSheet.create({
  main:{
    flex:1,
    height:"100%",
    position:"relative",
    backgroundColor:"white"
  },
  header_null:{
    position:"absolute",
    top:0,
    left:0,
    backgroundColor:"red",
    width:500,
    height:90,
    elevation:5,
   
  },

  headerText:{
    fontSize:24,
    marginLeft:25,
  },
  header:{
    width:"100%",
    height:40,
    marginTop:40,
    marginBottom:15,
    flexDirection:"row",
    backgroundColor:"white",
    alignItems:'center',
    zIndex:1,
    position:"absolute",
    top:0,
    left:0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content_post:{
    height:"70%",
  },
  cardpost:{
    height:60,
    flexDirection: 'row',
    paddingLeft: 20,
    marginTop:"20%",
    alignItems:'center',
   
   
  },

  input: {
    fontSize:20,
    color: "gray"
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"space-between",
    marginBottom: 10,
    width:"90%"
  },
  name_avatar:{
    flexDirection: 'row',
    alignItems: 'center',
   
  },
  card: {
    
    marginTop:20,
    borderRadius: 10,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  avatar_user:{
    width:40,
    height:40,
    borderRadius:30,
    marginRight:10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
    marginLeft:20,
  },
  sender:{
    fontSize:20,
  },
  postImage: {
    width: '95%',
    height: 200,
    resizeMode: 'cover',
    marginLeft:"auto",
    marginRight:"auto",
   borderRadius:10,
  },
  icon_message:{
    width:30,
    height:30,
  },
  icon_post:{
    width:40,
    height:40,
  },
  icon_profile:{
    width:30,
    height:30,
  },
  postContent: {
    marginBottom: 10,
    marginLeft:15,
    fontSize:15,
  },
  interact:{
    width:"95%",
    flexDirection: 'row',
    marginLeft:10,
    justifyContent:"space-between"
  },
  comment_hear:{
    flexDirection:"row"
  },
  view_Comment:{
    
    width:200,
    height:200,
    backgroundColor:"red",
    zIndex:1,
  },  
  icon:{
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom:10,
    height:30,
    width:30,
  },
  postButton:{
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
    height:45,
    alignItems:'center',
    flexDirection:"row",
    justifyContent:"space-around",
    position:"absolute",
    bottom:8,
    left:0,
    zIndex:1,
    marginTop:"20%",
  },
  footer_null:{
    width:500,
    height:100,
    position:"absolute",
    bottom:0,
    left:-60,
    elevation:5,
    backgroundColor:"rgba(250, 250, 250,0.95)",
  }
});

export default PostListScreen;


