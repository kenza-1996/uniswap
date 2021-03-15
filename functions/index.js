const functions = require("firebase-functions");

const app = require("express")();
const FBAuth =require("./util/fbAuth");
const cors = require('cors');
app.use(cors({origin: true}));
const {getAllScreams, postOneScream, getScream, commentOnScream, deleteScream, likeScream, unlikeScream} = require("./handlers/screams");
const { signup, login, uploadImage, addUserDetails,  getAuthenticatedUser } = require("./handlers/users");
const {postGroup, getGroup, putGroup, deleteGroup} = require('./clubs/club');
//const{ addFollowing} = require('../handlers/users');





//scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

//users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


//create clubs
app.post('/createClubs' ,FBAuth, postGroup);
app.get('/readClubs/:clubId' ,FBAuth, getGroup);
app.post('/modClubs/:clubId' ,FBAuth, putGroup);
app.post('/delClubs/:clubId' ,FBAuth, deleteGroup);

//following
//app.post('/addfollow/:userId' ,FBAuth, addFollowing);





exports.api = functions.https.onRequest(app);
