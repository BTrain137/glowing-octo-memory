var express = require('express');
var router = express.Router();
const db = require("./../db.js");

/* GET home page. */
router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Registration' });
});

router.post("/register", (req, res, next) => {
  req.checkBody("username", "Username field cannot be empty.").notEmpty();
  const validateErrors = req.validationErrors();

  if(validateErrors){
    console.log("Validate Errors", validateErrors);

    res.render("index", { title: "Registration Validation Errors" });
  }
  
  const { body: { username, email, password  } } = req;  
  const queryString = "INSERT INTO users SET ?;";
  const mode = { username, email, password };

  db.query(queryString, mode, (err, data, fields) => {
    if (err) {
      console.log("Error Code", err.code);
      console.log("Sql Message", err.sqlMessage);
      res.render("register", { title: "Registration Error"});
    }

  res.render("register", { title: "Registration Complete"})

  });
})

module.exports = router;
