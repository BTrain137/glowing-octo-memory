const router = require('express').Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render("home", { title: "Home"})
});

module.exports = router;
