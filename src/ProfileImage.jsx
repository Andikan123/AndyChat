import React, { useState } from 'react';
import { auth, storage } from './firebase'; // Your firebase setup
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

const ProfileImageUpload = () => {
  const [uploading, setUploading] = useState(false);

 const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);
  console.log("Starting upload for file:", file);

  try {
    const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
    console.log("Uploading to path:", storageRef.fullPath);

    await uploadBytes(storageRef, file);
    console.log("Upload complete");

    const photoURL = await getDownloadURL(storageRef);
    console.log("Got download URL:", photoURL);

    await updateProfile(auth.currentUser, { photoURL });
    console.log("Profile updated");

    alert('Profile image updated!');
  } catch (error) {
    console.error("Error uploading file:", error);
    alert('Failed to upload image: ' + error.message);
  }

  setUploading(false);
};
    console.log("File change handler completed");

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default ProfileImageUpload;
