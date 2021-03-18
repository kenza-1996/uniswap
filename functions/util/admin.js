const admin = require("firebase-admin");
const firebaseApp = admin.initializeApp();
const db = admin.firestore();
module.exports={admin,db};