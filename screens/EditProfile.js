import React, { useState ,useEffect} from 'react';
import { View, Text, TextInput, Button, SafeAreaView,Image ,TouchableOpacity} from 'react-native';
import { doc, updateDoc, collection, setDoc,getDoc } from 'firebase/firestore';
import { database,storage } from '../config/firebase';
import { getStorage, ref, uploadBytes ,getDownloadURL} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { set } from 'lodash';
import { useNavigation  } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

const EditProfile = ({ route }) => {
  const userEmail = route.params?.userEmail || '';
  //const userEmail = "hoa@gmail.com";
  const navigation = useNavigation();
    const [email,setemail] = useState("");
  const [hoten, sethoten] = useState("");
  const [gioitinh, setgioitinh] = useState("");
  const [ngaysinh, setngaysinh] = useState("");
  const [sdt, setsdt] = useState("");
  const [diachi, setdiachi] = useState("");
  const [nameError, setNameError] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedImageUriBackground, setSelectedImageUriBackground] = useState(null);

    useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(collection(database, "users"), userEmail);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();

        if (userData) {
          setemail(userData.email || "");
          sethoten(userData.hoten || "");
          setgioitinh(userData.gioitinh || "");
          setngaysinh(userData.ngaysinh || "");
          setsdt(userData.sdt || "");
          setdiachi(userData.diachi || "");
          setSelectedImageUri(userData.avatar || null);
          setSelectedImageUriBackground(userData.img_background || null);
          console.log("luc lay tu database : " + selectedImageUriBackground)
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng: ", error);
      }
    };

    fetchUserData();
  }, []);


  

  let userProfile = {}; 

  const uploadImageAvatar = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `avatars/${userEmail}.jpg`);
      await uploadBytes(storageRef, blob);
      const linkUrl = await getDownloadURL(storageRef);
      return linkUrl;
    } catch (error) {
        console.log("loi upload img" + error);
    }
  };

  const uploadImageBackground = async (uri) => {
    try {
      console.log("duong dan truoc khi luu " + uri);
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `avatar_backgrounds/${userEmail}.jpg`);
      await uploadBytes(storageRef, blob);
      const linkUrl = await getDownloadURL(storageRef);
     return linkUrl;
    } catch (error) {
      console.log("loi upload img" + error);
    }
  };

  const pickImageAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (status !== 'granted') {
      alert('Cho phép truy cập ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const pickImageAvatar_background = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (status !== 'granted') {
      alert('Cho phép truy cập ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setSelectedImageUriBackground(result.assets[0].uri);
    }
  };

  console.log("khi chon"+selectedImageUriBackground)
  const onSave = async () => {
    // Kiểm tra xem trường "Tên" có được nhập hay không
    if (hoten.trim() === "") {
      setNameError("Vui lòng nhập tên của bạn");
      return;
    } else {
      // Nếu tên được nhập, reset lỗi
      setNameError("");
    }
   
    try {
      const avatarUrl = "";
      const backgroundUrl = "";
      if(selectedImageUri)
      {
        avatarUrl = await uploadImageAvatar(selectedImageUri);
      }
      if(selectedImageUriBackground)
      {
        backgroundUrl= await uploadImageBackground(selectedImageUriBackground);
      }
      

      userProfile.email = email;
      userProfile.hoten = hoten;
      userProfile.ngaysinh = ngaysinh;
      userProfile.gioitinh = gioitinh;
      userProfile.diachi = diachi;
      userProfile.sdt = sdt;
      userProfile.avatar =  avatarUrl;
      userProfile.img_background =  backgroundUrl;
      // Cập nhật thông tin vào Firestore
      const userRef = doc(collection(database, "users"), userEmail);
      await setDoc(userRef, userProfile);

      console.log("update sucsset");
      navigation.navigate("Profile", { userEmail: userEmail, selectedUser_email:userEmail});
     
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin trong Firestore: ", error);
      // Xử lý lỗi (hiển thị thông báo lỗi, v.v.)
    }
  };
    return(
        <SafeAreaView>
            <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => navigation.navigate("Profile", { userEmail: userEmail , selectedUser_email:userEmail })}
            >
                <Image
                    style={styles.icon_message}
                    source={require('../assets/arrow-left.png')}
                />
            </TouchableOpacity>
           <TouchableOpacity
                onPress={pickImageAvatar_background}
              >
              {selectedImageUriBackground && (
                <Image
                  source={{ uri: selectedImageUriBackground }}
                  style={styles.banner}
                />
              )}
              {!selectedImageUriBackground && (
                <Image
                  source={require("../assets/profile.png")}
                  style={styles.banner}
                />
              )}
            </TouchableOpacity>
           
              
           
                <View style={styles.avatarContainer}>
                  <TouchableOpacity
                    onPress={pickImageAvatar}
                  >
                    {selectedImageUri && (
                      <Image
                        source={{ uri: selectedImageUri }}
                        style={styles.avatar}
                      />
                    )}

                    {!selectedImageUri && (
                      <Image
                        source={require("../assets/profile.png")}
                        style={styles.avatar}
                      />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.name}>{hoten}</Text>
                </View>
                <View style={{marginTop: 36, marginHorizontal: 20 }}>
                    <Text style={{fontSize: 18, fontWeight: "bold"}}>Thông tin cá nhân</Text>
                    
                    
                    <View style={styles.edit}>
                      <View style={styles.title}>
                        <Text style={styles.title_item} >Họ Tên</Text>
                      </View>
                      <TextInput
                        value={hoten}
                        onChangeText={(text) => sethoten(text)}
                        style={styles.input_text}
                      />
                      <Text style={{ color: "red" }}>{nameError}</Text>
                    </View>
                    <View style={styles.edit}>
                    <View style={styles.title}>
                        <Text style={styles.title_item}>Giới tính</Text>
                      </View>
                          <TextInput
                            placeholder="Giới tính"
                            value={gioitinh}
                            onChangeText={(text) => setgioitinh(text)}
                            style={styles.input_text}
                          />
                    </View>
                    <View style={styles.edit}>
                    <View style={styles.title}>
                        <Text style={styles.title_item}>Ngày sinh</Text>
                      </View>
                        <TextInput
                          placeholder="Ngày sinh"
                          value={ngaysinh}
                          onChangeText={(text) => setngaysinh(text)}
                          style={styles.input_text}
                        />
                    </View>
                    <View style={styles.edit}>
                    <View style={styles.title}>
                        <Text style={styles.title_item}>Địa chỉ</Text>
                      </View>
                        <TextInput
                          placeholder="Địa chỉ"
                          value={diachi}
                          onChangeText={(text) => setdiachi(text)}
                          style={styles.input_text}
                        />
                    </View>
                    <View style={styles.edit}>
                    <View style={styles.title}>
                        <Text style={styles.title_item}>Số điện thoại</Text>
                      </View>
                        <TextInput
                          placeholder="Số điện thoại"
                          value={sdt}
                          onChangeText={(text) => setsdt(text)}
                          style={styles.input_text}
                        />
                    </View>
                   
                </View>
                <TouchableOpacity onPress={onSave} style={styles.button_save}>
                    <Text style={styles.text_save}>Cập nhật</Text>
                </TouchableOpacity>
        </SafeAreaView>
    )
} 

const styles = StyleSheet.create({
    banner:{
        width: '100%',
        height: 240,
        resizeMode: "cover",
    },
    avatarContainer:{
        flexDirection: "row",
        alignItems: "center",
        marginTop: -100,
        
    },
    avatar:{
        width: 80,
        height: 80,
        borderRadius: 75,
        borderWidth: 1,
        borderColor: "white",
        marginLeft: 10,
        
    },
    name:{
        fontSize: 28,
        fontWeight: "bold",
        color: "#757575",
        marginLeft: 20
    },
    edit:{
        height: 52,
      
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#d6dbe1"
    },
    title:{
        width: 115,
    },
    button_save:{
      width:100,
      height:40,
      backgroundColor:"#9cffff",
      justifyContent:'center',
      alignItems:'center',
      borderRadius:15,
      marginTop:10,
      marginLeft:"70%",
    },
    text_save:{
      fontSize:16,
      color:"#383838",
    },
    signOutButton:{
      width:50,
      height:50,
      borderRadius:20,
      backgroundColor:"#dbdbdb",
      justifyContent:'center',
      alignItems:'center',
      position:"absolute",
      top:60,
      left:10,
      zIndex:1,
    },
    icon_message:{
      width:35,
      height:35,
    },
  input_text:{
    width:"70%",
    fontSize:16,
  },
  title_item:{
    fontSize:16,
  }
})
 export default EditProfile;


