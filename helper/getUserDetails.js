const { database, auth } = require("../firebase-config")
const { getDoc, doc } = require("firebase/firestore")


const getUserDetails = async () => {
   const userCredential = auth.currentUser // get current user logged in
   const userDisplayName = userCredential.displayName

   const userDocRef = doc(database, "users", userCredential.email) // single document of the user logged in 
   const userDoc = await getDoc(userDocRef)

   if (userDoc.exists()) {
      const userSnapshot = userDoc.data();
      console.log(userSnapshot);
      return { userDisplayName, userSnapshot }
   }
   return { userDisplayName, userSnapshot }
}

module.exports = getUserDetails;