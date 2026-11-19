const express = require("express");
const router = express.Router();

router.get("/set", (req, res) => {
    res.cookie("token", "token1234");
    res.status(200).json({message: "Cookie set successfuly"})
});
router.get("/get",  (req, res) => {
    // todo
});

module.exports = router;