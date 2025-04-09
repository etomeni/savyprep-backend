// // Import the functions you need from the SDKs you need
// import { initializeApp, cert } from 'firebase-admin/app';
// import { getStorage } from 'firebase-admin/storage';

// // import { initializeApp } from "firebase/app";
// import { ref, uploadBytes } from "firebase/storage";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries


// // Initialize Firebase Admin SDK
// import serviceAccount from '@/util/texu.json'; // assert { type: 'json' };
// // import serviceAccount from '../firebaseServiceAccountKey.json' assert { type: 'json' };


// // // Your web app's Firebase configuration
// // const firebaseConfig = {
// //     apiKey: process.env.FIREBASE_API_KEY,
// //     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
// //     projectId: process.env.FIREBASE_PROJECT_ID,
// //     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
// //     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
// //     appId: process.env.FIREBASE_APP_ID
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // // Create a root reference
// // const storage = getStorage(app);

// import * as path from 'path';


// initializeApp({
//     credential: cert(serviceAccount as any),
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // <-- Replace with your actual bucket
// });
  
// const bucket = getStorage().bucket();



// export const uploadFileToFirebase = async (
//     filePath: any, fileName: string,
//     userId: string, userEmail: string,
//     title: string, level: string, studyType: string, amount: string,
// ) => {
//     try {
//         console.log(filePath);
        
//         // Create a reference to file
//         const destination = `files/prep/${title}-${fileName}`;
//         const file = bucket.file(destination);

        
//         // Upload to Firebase Storage
//         const sdsa = await bucket.upload(filePath, {destination: file});
//         console.log(sdsa);
        

//         // const file = bucket.file(destination);
//         await file.makePublic();

//         const url = file.publicUrl();
//         console.log("url: ", url);

//         // const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
//         // console.log("publicUrl: ", publicUrl);


//         return {
//             status: true,
//             fileUrl: url
//         }
//     } catch (error) {
//         console.log(error);
        
//         return {
//             status: false,
//             // fileUrl: downloadURL
//         }
//     }
// }

// // export const uploadFileToFirebase_old = async (
// //     file: any, fileName: string,
// //     userId: string, userEmail: string,
// //     title: string, level: string, studyType: string, amount: string,
// // ) => {
// //     try {
// //         // Create a root reference
// //         // const storage = getStorage();
        
// //         // Create a reference to 'mountains.jpg'
// //         const storageRef = ref(storage, `files/prep/${title}-${fileName}`);
        
// //         // Upload the file
// //         // 'file' comes from the Blob or File API
// //         const snapshot = await uploadBytes( storageRef, file,
// //             {
// //                 customMetadata: {
// //                     userId, userEmail,
// //                     title, level, studyType, amount,
// //                 }
// //             }
// //         );
// //         console.log(snapshot);

// //         // Get download URL
// //         const downloadURL = await getDownloadURL(snapshot.ref);
// //         console.log(downloadURL);

// //         return {
// //             status: true,
// //             fileUrl: downloadURL
// //         }
// //     } catch (error) {
// //         console.log(error);
        
// //         return {
// //             status: false,
// //             // fileUrl: downloadURL
// //         }
// //     }
// // }



