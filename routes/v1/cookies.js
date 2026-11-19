const express = require("express");
const router = express.Router();

router.get("/set", (req, res) => {
    res.cookie("token", "token1234");
    res.status(200).json({message: "Cookie set successfully"})
});
router.get("/get",  (req, res) => {
    console.log(req.cookies);
    res.status(200).json({message: "Cookie got successfully"})
});

module.exports = router;