import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { database, auth } from '../config/firebase';

const createOrGetChatRoom = async (userEmail, selectedUser_email) => {
  try {
    console.log('userEmail:', userEmail);
    console.log('selectedUser_email:', selectedUser_email);

    // Tạo một mảng chứa cả hai email và sắp xếp để đảm bảo thứ tự không thay đổi
    const members = [userEmail, selectedUser_email].sort();

    const chatRoomID = members.join('_'); // Tạo ID từ các thành viên

    const userDocumentID = doc(collection(database, 'users'), userEmail);
    const userChatsCollectionRef = collection(userDocumentID, 'userChats');

    // Tìm kiếm trong userChats xem có phòng chat nào chứa cả hai thành viên không
    const existingChatQuery = query(
      userChatsCollectionRef,
      where('chatRoomID', '==', chatRoomID)
    );

    const existingChatSnapshot = await getDocs(existingChatQuery);

    // Nếu đã tồn tại phòng chat, lấy ID
    if (existingChatSnapshot.size > 0) {
      return chatRoomID;
    } else {
      // Nếu chưa tồn tại, tạo mới
      await setDoc(doc(userChatsCollectionRef, chatRoomID), {
      
        chatRoomID,
      });

      return chatRoomID;
    }
  } catch (error) {
    console.error('Error in createOrGetChatRoom:', error);
    throw error;
  }
};

export default createOrGetChatRoom;



