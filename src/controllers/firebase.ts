// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a root reference
const storage = getStorage(app);


export const uploadFileToFirebase = async (
    file: any, fileName: string,
    userId: string, userEmail: string,
    title: string, level: string, studyType: string, amount: string,
) => {
    try {
        // Create a root reference
        // const storage = getStorage();
        
        // Create a reference to 'mountains.jpg'
        const storageRef = ref(storage, `files/prep/${title}-${fileName}`);
        
        // Upload the file
        // 'file' comes from the Blob or File API
        const snapshot = await uploadBytes( storageRef, file,
            {
                customMetadata: {
                    userId, userEmail,
                    title, level, studyType, amount,
                }
            }
        );

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
            status: true,
            fileUrl: downloadURL
        }
    } catch (error) {
        return {
            status: false,
            // fileUrl: downloadURL
        }
    }
}



