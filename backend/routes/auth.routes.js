import express from "express";
import { signIn, logOut, signUp } from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/signup",signUp);
authRouter.post("/signin",signIn);
authRouter.post("/logOut",logOut);


export default authRouter