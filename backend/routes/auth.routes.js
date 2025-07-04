import express from "express";
import { login, logOut, signUp } from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/signup",signUp);
authRouter.post("/login",login);
authRouter.post("/logOut",logOut);


export default authRouter