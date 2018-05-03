// const mongoose = require('mongoose')

//NoSQL mongo database
const MONGO_LOCAL_URL = 'mongodb://localhost/passport'

if (process.env.MONGODB_URI) {
  // heroku 
	mongoose.connect(process.env.MONGODB_URI)
} 
else {
  // local mongo url
	mongoose.connect(MONGO_LOCAL_URL) 
}

const db = mongoose.connection;
db.on("error", error => console.log("Database Error:", error));
db.once("open", () => console.log("Mongoose connection successful."));