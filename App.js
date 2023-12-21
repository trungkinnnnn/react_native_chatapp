import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { Header, createStackNavigator } from "@react-navigation/stack";
import {View,ActivityIndicator,TouchableOpacity,Image, StyleSheet} from 'react-native'
import {onAuthStateChanged} from "firebase/auth";

import Chat from "./screens/Chat";
import Signin from "./screens/SignIn";
import Signup from "./screens/SignUp";
import Home from "./screens/Home";
import Profile from "./screens/Profile";
import EditProfile from "./screens/EditProfile";
import PostListScreen from "./screens/PostListScreen";
import PostScreen from"./screens/PostScreen"
import Search from "./screens/Search";
import UpdatePost from "./screens/UpdatePost";
const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="signin" component={Signin} options={{ headerShown: false ,}}/>
      <Stack.Screen name="signup" component={Signup}options={{ headerShown: false ,}}/> 
    
       <Stack.Screen name="chat" component={Chat} 
        options={{
          headerTintColor: '#fff',
          headerTitleAlign: "center",
           headerShown: false ,
      }} />    
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false ,}}/>
       <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false ,}}/>
      <Stack.Screen name="Search" component={Search} options={{ headerShown: false ,}}/> 
        <Stack.Screen name="PostListScreen" component={PostListScreen} options={{ headerShown: false ,}}/>
        <Stack.Screen name="PostScreen" component={PostScreen} options={{ headerShown: false ,}}/>
         <Stack.Screen name="home" component={Home}options={{ headerShown: false }}/>  
         <Stack.Screen name="UpdatePost" component={UpdatePost} options={{ headerShown: false ,}}/>
      

    </Stack.Navigator>
  </NavigationContainer>  
  );
}

const styles = StyleSheet.create({
  container: {
   
  },
});
