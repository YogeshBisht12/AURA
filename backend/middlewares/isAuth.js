import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Access Denied: No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.id; // assuming { id: user._id } was used while signing
        next();

    } catch (error) {
        console.error("JWT Verification Failed:", error.message);
        return res.status(401).json({ message: "Access Denied: Invalid Token" });
    }
};

export default isAuth;
