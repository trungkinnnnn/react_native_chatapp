import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, Keyboard,Image ,TouchableOpacity,TouchableWithoutFeedback} from 'react-native';
import { doc, updateDoc, collection, setDoc,getDoc,addDoc } from 'firebase/firestore';
import { database,storage } from '../config/firebase';
import { getStorage, ref, uploadBytes ,getDownloadURL} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

import { useNavigation  } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

const UpdatePost = ({ route }) => {
 // const userEmail = "hoa@gmail.com";
  const userEmail = route.params?.userEmail || '';
  const timeStamp = route.params?.item.id || '';
  console.log("id phòng " + timeStamp);
   const navigation = useNavigation();
   const [hoten, sethoten] = useState("");
   const [selectedAvatar, setSelectedAvatar] = useState(null);
   const [postText, setPostText] = useState('');  
   const [postImage, setPostImage] = useState(null);

   useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(collection(database, "users"), userEmail);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          sethoten(userData.hoten || "");
          setSelectedAvatar(userData.avatar || null);
        } else {
          console.log("Người dùng không tồn tại trong database.");
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng: ", error);
      }
    };
    fetchUserData();
  }, [route.params]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
          setPostText(route.params?.item.content || '');
          setPostImage(route.params?.item.image || "");
          // Bạn có thể sử dụng content và image theo nhu cầu của bạn
          console.log('Nội dung bài post:', postText);
          console.log('Đường dẫn hình ảnh:', postImage);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bài post:', error);
      }
    };
    fetchPostData();
  }, [route.params]);




  const handlePressOutside = () => {
      Keyboard.dismiss();
    };

  const uploadImage = async (uri,times_str) => {
    try {
      console.log("duong dan truoc khi luu " + uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `Posts/${userEmail}/${times_str}`);
      await uploadBytes(storageRef, blob);
      const linkUrl = await getDownloadURL(storageRef);
      console.log("anh sau khi chon : " + linkUrl)
     return linkUrl;
    } catch (error) {
      console.log("loi upload img" + error);
    }
  };


  const pickImagePost = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (status !== 'granted') {
      alert('Cho phép truy cập ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setPostImage(result.assets[0].uri);
    }
  };


    const pickImagePost_camera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync(); 
  
    if (status !== 'granted') {
      alert('Cho phép truy cập ảnh');
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      setPostImage(result.assets[0].uri);
    }
  };

  console.log("khi chon"+postImage);


  const handlePost = async(userEmail)=>{
    try{
    if (!postText || postText.trim() === "") {
      alert("Hãy viết điều bạn muốn đăng");
      return;
    }
 
    let img_post;
    if(postImage)
    {
       img_post = await uploadImage(postImage,timeStamp);
    }else{
      img_post = ""
    }

    if (!img_post) {
      img_post = "";
    }
 
    const postUserCollection = collection(database, 'posts', userEmail, 'user_posts');
    const postDocRef = doc(postUserCollection, timeStamp);
    
    try {
      await updateDoc(postDocRef, {
        content: postText,
        image: img_post,
      });
    
      console.log('Sửa bài post thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm bài post:', error);
    }
    

    navigation.navigate("PostListScreen",{userEmail:userEmail});
    }catch(ex)
    {
      console.log("lỗi " + ex);
    }
};


 
    return(
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <View style={styles.conten}>
          <View style={styles.header_null}></View>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.OutButton}
              onPress={() => navigation.navigate("PostListScreen",{userEmail:userEmail})}
            >
              <Image
                style={styles.icon_message}
                source={require('../assets/arrow-left.png')}
              />
            </TouchableOpacity>
                {selectedAvatar && (
                        <Image style={styles.avatar}
                            source={{ uri: selectedAvatar }}
                        />
                    )}

                    {!selectedAvatar && (
                        <Image style={styles.avatar}
                            source={require("../assets/profile.png")}

                        />
                    )}
            <Text style={styles.headerText}>{userEmail}</Text>
            <TouchableOpacity 
                  style={styles.button_save}
                  onPress={() => handlePost(userEmail)}
                >
                <Text style={styles.text_save}>Sửa bài</Text>
              </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <TextInput
              style={styles.postInput}
              multiline
              placeholder="Bạn đang nghĩ gì?"
              value={postText}
              onChangeText={(text) => setPostText(text)}
              textAlignVertical="top"
              borderWidth={0}
            />
          </View> 
        
          <View style={styles.view_img}>
            {postImage && (
                <Image
                  source={{ uri: postImage }}
                  style={styles.banner}
                />
              )}
              {!postImage && (
                <Image
                  source={require("../assets/upload.png")}
                  style={styles.banner}
                />
              )}
          </View>
          <View style={styles.footer}>  
             
                <TouchableOpacity
                  style={styles.button_pic_img}
                  onPress={pickImagePost}
                  >
                  <Image
                      source={require("../assets/choose-image.png")}
                      style={styles.icon_choose_img}
                    />
                </TouchableOpacity>
              

             
                <TouchableOpacity
                  style={styles.button_pic_img}
                    onPress={pickImagePost_camera}
                    >
                    <Image
                        source={require("../assets/camera.png")}
                        style={styles.icon_choose_img}
                    />
                  </TouchableOpacity>
            </View>
          <View style={styles.footer_null}></View>
        </View>

      </TouchableWithoutFeedback>
    )
} 

const styles = StyleSheet.create({
    conten:{
    flex :1,
    position:'relative',
    height:500,
  },
      header_null:{
    position:"absolute",
    top:0,
    left:0,
    backgroundColor:"white",
    width:500,
    height:120,
    elevation:5,
  

  },
  header:{
    width:"100%",
    height:40,
    marginTop:55,
    marginBottom:15,
    flexDirection:"row",
    alignItems:'center',
    zIndex:1,
    position:"absolute",
    top:0,
    left:0,
  },
  content:{
    marginTop:"35%",
   
    height:"20%",
    width:"90%",
    marginLeft:"auto",
    marginRight:"auto",
  },
  postInput:{
    fontSize:22,
    marginTop:5,
    marginLeft:5,
  },
  view_img:{
    marginTop:"3%",
  },  
    banner:{
        width: '100%',
        height:300,
        resizeMode: "cover",
       
    },
  
    avatarContainer:{
        flexDirection: "row",
        alignItems: "center",
        marginTop: -100,
        
    },
    avatar:{
        width: 50,
        height: 50,
        borderRadius: 75,
        borderWidth: 1,
        borderColor: "white",
        marginLeft: 20,
        marginRight:15,
    },
    button_save:{
      width:100,
      height:40,
      backgroundColor:"#9cffff",
      justifyContent:'center',
      alignItems:'center',
      borderRadius:15,
     marginLeft:"5%",
     
      elevation:5,
    },

    text_save:{
      fontSize:16,
      color:"#383838",
    },

    icon_message:{
      width:35,
      height:35,
      marginLeft:10,
    },
  input_text:{
    width:"70%",
    fontSize:16,
  },
  button_pic_img:{
   
    width:70,
    height:70,
    backgroundColor:"#9cffff",
    justifyContent:'center',
    alignItems:'center',
    borderRadius:35,
    elevation:3,
  },
  icon_choose_img:{
    width:35,
    height:35,
    
  },
  footer:{
        width:"100%",
        flexDirection:"row",
        justifyContent:"space-around",
        alignItems:'center',
        position:"absolute",
        bottom:25,
        left:0,
        zIndex:1,
        height:50,
      
      },
      footer_null:{
        width:500,
        height:100,
        position:"absolute",
        bottom:0,
        left:-60,
        elevation:1,
        backgroundColor:"rgba(250, 250, 250,0.5)",
     
      }

})
 export default UpdatePost;


