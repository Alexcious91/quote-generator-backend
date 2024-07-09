const { database, auth } = require("../firebase-config")
const { collection, getDoc, doc } = require("firebase/firestore")


const getUserDetails = async () => {
   const userCredential = auth.currentUser // get current user logged in
   const userEmail = userCredential.email

   const userDocRef = doc(database, "users", userCredential.email) // single document of the user logged in 
   const userDoc = await getDoc(userDocRef)

   if (userDoc.exists()) {
      const userSnapshot = userDoc.data();
      console.log(userSnapshot);
      return { userEmail, userSnapshot }
   }
   return { userEmail, userSnapshot }
}

module.exports = getUserDetails;