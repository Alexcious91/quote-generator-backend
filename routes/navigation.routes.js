const express = require("express")
const router = express.Router();
const { database, auth, firebaseConfig } = require("../firebase-config");
const { collection, addDoc, getDocs, query, where } = require("firebase/firestore");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require("firebase/auth");

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
         displayName: username,
         email: email,
         password: password,
         createdAt: new Date()
      })

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

   try {
      const quotesCollection = collection(database, "quotes");
      await addDoc(quotesCollection, {
         author: author,
         quote: quote,
         createdAt: new Date()
      })
      res.status(201).send("Quote added successfully")
   } catch (error) {
      console.error(`Error adding qoute: ${error}`)
      res.status(500).send("Internal Server Error")
   }
})

router.get("/user/details", async (req, res) => {
   try {
      const user = auth.currentUser;
      console.log(user)
      if (user) {
         res.status(200).json(user)
      } else {
         return res.status(401).send("Unauthorized: no user logged in")
      }

   } catch (error) {
      console.error(`Error fetching user: ${error}`)
      res.status(401).send("Unauthorized: no user logged in")
   }
})

router.get("firebase-config", (req, res) => {
   const config = firebaseConfig
   console.log(config)
})

module.exports = router