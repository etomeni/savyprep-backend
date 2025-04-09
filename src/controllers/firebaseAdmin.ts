// Import the functions you need from the SDKs you need
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';


initializeApp({
    // credential: cert(serviceAccount as any),
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_SA_PROJECT_ID,
        clientEmail: process.env.FIREBASE_SA_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_SA_PRIVATE_KEY,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
  
const bucket = getStorage().bucket();


export const uploadFileToFirebase_admin = async (
    fileData: any, fileName: string,
    userId: string, userEmail: string,
    title: string, level: string, studyType: string, amount: string,
) => {
    try {
        const filePath = fileData.path;
        // Create a reference to file
        const destination = `files/prep/${title}-${fileName}`;
        const file = bucket.file(destination);

        // Upload to Firebase Storage
        await bucket.upload(filePath, {destination: file});

        // const file = bucket.file(destination);
        await file.makePublic();

        const url = file.publicUrl();
        console.log("url: ", url);

        // const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
        // console.log("publicUrl: ", publicUrl);

        return {
            status: true,
            fileUrl: url
        }
    } catch (error) {
        console.log(error);
        
        return {
            status: false,
            // fileUrl: downloadURL
        }
    }
}