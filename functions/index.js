const functions = require("firebase-functions");

const app = require("express")();
const FBAuth =require("./util/fbAuth");
const cors = require('cors');
app.use(cors({origin: true}));
const {getAllScreams, postOneScream, getScream, commentOnScream, deleteScream, likeScream, unlikeScream} = require("./handlers/screams");
const { signup, login, uploadImage, addUserDetails,  getAuthenticatedUser, SendFollowRequest, acceptFollowRequest, getAllAmis } = require("./handlers/users");
const {postGroup, getGroup, putGroup, deleteGroup, postPublication, getAllPublications,getPublication,
    commentOnPublication,likePublication, unlikePublication, deletePublication} = require('./clubs/club');
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
app.post('/followreq',  SendFollowRequest);
app.post('/follow',  acceptFollowRequest);
app.get('/follow', getAllAmis);

//create clubs
app.post('/createClubs' ,FBAuth, postGroup);
app.get('/readClubs/:GroupId' ,FBAuth, getGroup);
app.post('/modClubs/:GroupId' ,FBAuth, putGroup);
app.delete('/delClubs/:GroupId' ,FBAuth, deleteGroup);
app.post('/readClubs/:GroupId/publier' ,FBAuth,postPublication);
app.get('/readClubs/:GroupId/publier' ,FBAuth,getAllPublications);
app.get('/readClubs/:GroupId/publier/:publicationId' ,FBAuth,getPublication);
app.post('/readClubs/:GroupId/publier/:publicationId/comment' ,FBAuth,commentOnPublication);
app.post('/readClubs/:GroupId/publier/:publicationId/like' ,FBAuth,likePublication);
app.post('/readClubs/:GroupId/publier/:publicationId/unlike' ,FBAuth, unlikePublication);
app.delete('/readClubs/:GroupId/publier/:publicationId' ,FBAuth, deletePublication);


//following
//app.post('/addfollow/:userId' ,FBAuth, addFollowing);





exports.api = functions.https.onRequest(app);
