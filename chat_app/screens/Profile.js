
import React, { useState ,useEffect} from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, TouchableOpacity, TouchableHighlight  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, collection,getDoc } from 'firebase/firestore';
import { database } from '../config/firebase';
import { useNavigation} from '@react-navigation/native';
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import  Icon from '@expo/vector-icons/FontAwesome'

export default Profile = ({route}) =>{
    const userEmail = route.params?.userEmail || '';
    const selectedUser = route.params?.selectedUser_email || '';
    const navigation = useNavigation();
    const [hoten, sethoten] = useState("");
    const [gioitinh, setgioitinh] = useState("");
    const [ngaysinh, setngaysinh] = useState("");
    const [sdt, setsdt] = useState("");
    const [diachi, setdiachi] = useState("");
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [selectedImageUriBackground, setSelectedImageUriBackground] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const userRef = doc(collection(database, "users"), userEmail);
            const userSnapshot = await getDoc(userRef);
      
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
      
              sethoten(userData.hoten || "");
              setgioitinh(userData.gioitinh || "");
              setngaysinh(userData.ngaysinh || "");
              setsdt(userData.sdt || "");
              setdiachi(userData.diachi || "");
              setSelectedImageUri(userData.avatar || null);
              setSelectedImageUriBackground(userData.img_background || null);
            } else {
              console.log("Người dùng không tồn tại trong database.");
              // Xử lý tùy thuộc vào yêu cầu của bạn, có thể chuyển hướng hoặc hiển thị thông báo.
            }
          } catch (error) {
            console.error("Lỗi khi tải thông tin người dùng: ", error);
          }
        };
      
        fetchUserData();
      }, [route.params]);
      

    return(
        
            <View style={styles.container}>
                {selectedImageUriBackground && (
                    <Image style={styles.banner}
                    source={{uri:selectedImageUriBackground}}
                />
                )}
                {!selectedImageUriBackground && (
                    <Image style={styles.banner}
                        source={require("../assets/profile.png")}
                    />
                )}
                <View style={styles.avatarContainer}>

                    {selectedImageUri && (
                        <Image style={styles.avatar}
                            source={{ uri: selectedImageUri }}
                        />
                    )}

                    {!selectedImageUri && (
                        <Image style={styles.avatar}
                            source={require("../assets/profile.png")}

                        />
                    )}

                    <Text style={styles.name}>{hoten}</Text>
                  
                    
                </View>
                
              
            
                <View >
                    <ScrollView  contentContainerStyle={{flexDirection:"column"}}>
                        <View>
                            <Text style={styles.txt_about}>Email: {userEmail}</Text>
                        </View>
                        <View>
                            <Text style={styles.txt_about}>Họ tên: {hoten}</Text>
                        </View>
                        <View>
                            <Text style={styles.txt_about}>Giới tính: {gioitinh}</Text>
                        </View>

                        <View>
                            <Text style={styles.txt_about}>Ngày sinh: {ngaysinh}</Text>
                        </View>
                        <View>
                            <Text style={styles.txt_about}>Địa chỉ: {diachi}</Text>
                        </View>
                        <View>
                            <Text style={styles.txt_about}>Số điện thoại: {sdt}</Text>
                        </View>  
                    </ScrollView>
            
                </View>
                {userEmail === selectedUser ? (
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={() => navigation.navigate("signin")}
                    >
                        <Image
                            style={styles.icon_message}
                            source={require('../assets/log-out.png')}
                        />
                    </TouchableOpacity>
                      ):(
                        <TouchableOpacity
                            style={styles.signOutButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Image
                                style={styles.icon_message}
                                source={require('../assets/arrow-left.png')}
                            />
                        </TouchableOpacity>
                        )}
                    {userEmail === selectedUser ? (
                        <TouchableOpacity  
                            style={styles.editOutButton}
                            onPress={() =>navigation.navigate("EditProfile", { userEmail: userEmail })}>
                            <Image style={styles.icon_message}
                                source={require("../assets/pencil.png")}
                            />
                        </TouchableOpacity>
                    ):(
                    <View></View>
                    )}
            {userEmail === selectedUser ? (
                <View style={styles.footer}>
                    <View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => navigation.navigate("Profile", { userEmail: userEmail, selectedUser_email: userEmail })}
                        >
                            <Image
                                style={styles.icon_profile}
                                source={require('../assets/user.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("home", { userEmail: userEmail })}
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

            ) : (
                <View></View>
            )}

            {userEmail === selectedUser ? (
                <View style={styles.footer_null}></View>
            ) : (
                <View></View>
            )}
        </View>
     
    )
}

const styles = StyleSheet.create({
    container:{
        width: '100%',
        alignItems: "center",
        // backgroundColor: "black",
        position:"relative", 
        height:"100%",
       
    },
    banner:{
        width: '100%',
        height: 240,
        resizeMode: "cover",
    },
    avatarContainer:{
        alignItems: "center",
        marginTop: -75,
    },
    avatar:{
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 5,
        borderColor: "white",
    },
    name:{
        fontSize: 40,
        fontWeight: "bold",
        // color: "white"
    },
    setting:{
        fontSize: 16,
        color: "#0144f8"
    },
    contentsContainer:{
        height:50,
     
       
    },
    contents:{
        flexDirection: "row",
        borderBlockColor: "gray",
        borderRadius: 15,
        borderWidth: 1,
        justifyContent: "space-around",
        height: 48,
        padding: 12,
        alignItems: "center",
        marginLeft: 10,
        backgroundColor: "red",
        
    },
    about:{
        marginTop: 10
    },
    txt_about:{
        margin: 5,
        fontSize: 20,
        fontWeight: "bold",
        color: "gray",

    },
    button:{
        alignItems: 'center',
        justifyContent: "center",
        backgroundColor: "#0A6ABB",
        width: 300,
        height: 56,
        borderColor: "",
        borderWidth: 2,
        borderRadius: 15,
        marginTop: 50
    },
    txt_button:{
        fontSize: 16,
        fontWeight: "bold",
        color: "white"
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
      editOutButton:{
        width:50,
        height:50,
        borderRadius:20,
        backgroundColor:"#dbdbdb",
        justifyContent:'center',
        alignItems:'center',
        position:"absolute",
        bottom:150,
        right:10,
        zIndex:1,
      },
      footer:{
        margin:"auto",
        width:"100%",
        height:60,
        alignItems:'center',
        flexDirection:"row",
        justifyContent:"space-around",
        position:"absolute",
        bottom:0,
        left:0,
        zIndex:1,
     
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
      profileButton:{
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
      footer_null:{
        width:500,
        height:110,
        position:"absolute",
        bottom:0,
        left:-60,
        elevation:5,
        backgroundColor:"white",
      },
        icon_search:{
    width:20,
    height:20,
    marginRight:20,
    marginLeft:20,
  },
  icon_message:{
    width:35,
    height:35,
  },
  icon_post:{
    width:35,
    height:35,
  },
  icon_profile:{
    width:40,
    height:40,
  },
  icon_bell:{
    width:35,
    height:35,
  },
})

