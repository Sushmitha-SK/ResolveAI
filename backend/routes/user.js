import express from 'express'
import {  getPrivilegedUsers, getUser, login, logout, signup, updateUser } from '../controllers/user.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router();
router.put("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUser);
router.get("/users/privileged", authenticate, getPrivilegedUsers)

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;