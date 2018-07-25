const mongoose = require('mongoose')
    , isproduction = process.env.NODE_ENV === "production"

//NoSQL mongo database
mongoose.promise = global.promise;
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/passport", { useNewUrlParser: true });
if (!isproduction) mongoose.set('debug', true);

const db = mongoose.connection;
db.on("error", error => console.log("Database Error:", error));
db.once("open", () => console.log("Mongoose connection successful."));