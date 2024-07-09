const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")
const { database, auth } = require("../firebase-config");
const { collection, addDoc, getDocs, query, where, doc, getDoc } = require("firebase/firestore");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } = require("firebase/auth");
const { default: getUserDetails } = require("../helper/getUserDetails");

router.get("/quotes", async (req, res) => {
   try {
      const quotesCollection = collection(database, "quotes");
      const quotesSnapshot = await getDocs(quotesCollection);
      const quotesList = quotesSnapshot.docs.map(doc => doc.data());

      res.status(200).json(quotesList)
   } catch (error) {
      console.log(`Error fetching qoutes document: ${error}`);
      res.status(500).send("Internal Server Error")
   }
})

router.post("/user/register", async (req, res) => {
   const { username, email, password } = req.body

   try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;

      const userCollection = collection(database, "users");


      await addDoc(userCollection, {
         uid: user.uid,
         username: username,
         email: email,
         password: password,
         createdAt: new Date()
      })
      await updateProfile(user, { displayName: username })

      res.status(201).send("User created successfully")
   } catch (error) {
      res.status(500).send(`Internal Server Error \n ${error}`)
      console.log(error.message)
   }
});

router.post("/user/login", async (req, res) => {
   const { email, password } = req.body;

   try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      res.status(200).json({ message: "User logged in successfully", uid: user.uid })
   } catch (error) {
      console.error(`Error signing user in: ${error}`)
      res.status(401).send("Unauthorized")
   }
})

router.post("/new/quote", async (req, res) => {
   const { author, quote } = req.body;
   const { userEmail, userSnapshot } = getUserDetails()

   try {
      const quotesCollection = collection(database, "quotes");
      await addDoc(quotesCollection, {
         author: userEmail,
         quote: quote,
         createdAt: new Date()
      })
      res.status(201).send("Quote added successfully")
   } catch (error) {
      console.error(`Error adding qoute: ${error}`)
      res.status(500).send("Internal Server Error")
   }
})

router.post("/user/edit-profile", async (req, res) => {
   const { username } = req.body;
   const user = auth.currentUser
   try {
      await updateProfile(user, {
         displayName: username
      })

      await collection("users").doc(user.uid).update({
         username: username
      })
      res.status(200).send("Profile update successfully")
   } catch (error) {
      console.error(error)
      res.status(500).send("Internal Server Error")
   }
})

router.get("/user/details", async (req, res) => {
   try {
      const user = auth.currentUser;
      if (user) {
         res.status(501).send("Unauthorized: no user logged in")
      }

      const userDocRef = doc(database, "users", auth.currentUser.uid)
      const userSnapshot = await getDoc(userDocRef)

      if (userSnapshot.exists()) {
         const userData = userSnapshot.data();
         res.status(200).json(userData)
      } else {
         res.status("404").send("User not found")
      }
   } catch (error) {
      res.status(500).send("Internal Server Error")
   }
})

router.get("/user/logout", async (req, res) => {
   try {
      const response = await signOut(auth)

      console.log(response)
      res.status(200).send("Successfully logged out")
   } catch (error) {
      res.status(500).send("Couldn't sign user out, try again.")
   }
})

module.exports = router