const mongoose = require('mongoose')

//NoSQL mongo database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/passport")

const db = mongoose.connection;
db.on("error", error => console.log("Database Error:", error));
db.once("open", () => console.log("Mongoose connection successful."));