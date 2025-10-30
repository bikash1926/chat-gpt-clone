const express = require("express")
const router = express.Router()

const authRouter = require("../controller/auth.controller")
const authMiddlerware = require("../middleware/auth.middleware")

router.post("/register", authRouter.registerController);
router.post("/login", authRouter.loginController);
router.post("/logout", authRouter.logoutController);
router.get("/me", authMiddlerware, authRouter.getMe);

module.exports = router;