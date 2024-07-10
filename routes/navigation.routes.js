const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")
const { database, auth } = require("../firebase-config");
const { collection, addDoc, getDocs, doc, getDoc, updateDoc, setDoc } = require("firebase/firestore");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, fetchSignInMethodsForEmail } = require("firebase/auth");
const { default: getUserDetails } = require("../helper/getUserDetails");
const { firestore } = require("firebase-admin");

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

router.get("/user/quotes", async (req, res) => {
   try {
      const user = auth.currentUser;

      const userDocRef = doc(database, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
         console.log(userDoc.data())
         res.status(200).json(userDoc.data())
      } else {
         res.status(404).json({ message: "No such document" });
      }
   } catch (error) {
      console.log(`[ERROR]: ${error}`)
   }
})

router.post("/user/register", async (req, res) => {
   const { username, email, password } = req.body

   try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;

      const userCollection = collection(database, "users");

      const hashedPassword = await bcrypt.hash(password, 10)

      await addDoc(userCollection, {
         uid: user.uid,
         username: username,
         email: email,
         password: hashedPassword,
         myQuotes: [],
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
      const idToken = await user.getIdToken();

      console.log("logged in succesfully", user.displayName)
      res.status(200).json({ message: "User logged in successfully: ", idToken })
   } catch (error) {
      console.error(`Error signing user in: ${error}`)
      res.status(401).send("Unauthorized")
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
      auth.onAuthStateChanged(async (user) => {
         if (user) {
            return res.status(200).json(user)
         } else {
            return new Error("Unauthorization: no user logged in")
         }
      })
   } catch (error) {
      console.error(`[ERROR]: ${error.message}`)
      res.status(500).send("Internal Server Error")
   }
});


router.get("/user/logout", async (req, res) => {
   try {
      await signOut(auth)

      res.status(200).send("Successfully logged out")
   } catch (error) {
      res.status(500).send("Couldn't sign user out, try again.")
   }
})

router.post("/new/quote", async (req, res) => {
   const { postedBy, quote } = req.body;
   const user = auth.currentUser

   try {
      const quotesCollection = collection(database, "quotes");
      const newQuote = {
         id: uuidv4(),
         postedBy: postedBy,
         quote: quote,
         creator: {
            uid: user.uid,
            displayName: user.displayName
         }, // send user object
         createdAt: new Date()
      }

      await addDoc(quotesCollection, newQuote)

      // get user document
      const userDocRef = doc(database, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
         const userData = userDoc.data() // get user data
         const updatedQuotes = [ ...userData.myQuotes, newQuote ] // retrive myQuotes from user doc & update

         await updateDoc(userDocRef, {
            myQuotes: updatedQuotes // update myQuotes prop
         })
      }
      res.status(201).send("Quote added successfully")
   } catch (error) {
      console.error(`Error adding qoute: ${error}`)
      res.status(500).send("Internal Server Error")
   }
})

module.exports = router