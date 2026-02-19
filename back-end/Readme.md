index.js => checks db is connected then starts server

/db/index.js => connects database via mongoose

/routes/user.routes.js => provides routes and calls each controller function that handles logic
------------------------------------------------------------

/controllers  => handles the logic of program

--------------------------------------------------------------
utils

asyncHandler => It's a wrapper function for Express routes to automatically catch errors in async       functions and pass them to Express's error handler (next(err)), instead of you having to write try/catch in every route.

ApiError => extends parent error class and formats errors in human readable format

ApiResponse => structures response

cloudinary => uploads file on cloudinary and deletes after upload
----------------------------------------------------------------
In HTTP status codes:

Status Code Range	Meaning
100–199	Informational
200–299	✅ Success
300–399	Redirection (still OK)
400–499	❌ Client errors (bad request, not found, etc.)
500–599	❌ Server errors
--------------------------------------------------------------

middleware

auth.middleware.js => access , verify jwt token and add user to req.user

multer.middleware.js => Set up a safe, filtered way to upload image files. Store them temporarily on the server in ./public/temp.
------------------------------------------------------------------------




genAccessAndRefreshToken   userId ->  access , ref token
resisterUser  fullname, email, username, password, avatar, coverImage -> userCreated          					 router.route('/register').post()
loginUser  username, email, password ->  cookie (accessToken refreshToken) ,loggedInUser, accessToken, refreshToken		router.route("/login").post(loginUser);
logoutUser user._id -> clear cookie and refreshToken null									router.route("/logout").post(verifyJWT, logoutUser);																		
refreshAccessToken refToken(cookie) -> new accessToken + refToken								router.route("/refresh-token").post(refreshAccessToken);
changePassword   oldPassword, newPassword -> password changed								router.route("/change-password").post(verifyJWT, changePassword);
updateAccuntDetails   fullname, email -> update									router.route("/update-details").patch(verifyJWT, updateAccuntDetails);
updateUserAvatar filepath -> update 
getUserChannelProfile username ->  channel[0]
searchChannels username & fullname (query) -> channels										router.get("/search", searchChannels);
getWatchHistory user._id -> watchHistory

-----------------------------------------------------------------------------------------------------

toggleLikeDislike userId, videoId, type -> reaction (liked)
getLikesDislikesCount    videoId,type -> count

------------------------------------------------------------------------------------------------------

uploadVideo title, description, file, thumbnail, user._id -> video 				router.post("/upload",upload.fields([{ name: "video", maxCount: 1 },{ name: "thumbnail", 						 				maxCount: 1 }]),uploadVideo);

getAllVideos page, limit -> result												router.get("/", getAllVideos);
getVideoById videoId -> video													router.get("/:videoId", getVideoById);
getChannelVideos userId -> videos												router.get("/channel/:userId", getChannelVideos);

------------------------------------------------------------------------------------------------------

subscribeChannel channelId, user._id -> subscription								router.route("/subscriptions/:channelId").post(verifyJWT, subscribeChannel)
getSubscriberCount channelId ->  channelId, count								router.route("/subscriptions/count/:channelId").get(getSubscriberCount);




