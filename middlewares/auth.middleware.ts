import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel";

let UserTokens: string[] = []//for storing access tokens in memory

//authenticate user
export const isAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
    let token = undefined
    token = req.cookies.accessToken
    if (!token) {
        token = req.headers.authorization && req.headers.authorization.split(" ")[1]
    }
    if (!token)
        return res.status(403).json({ message: "please login to access this resource" })
    // if (!UserTokens.includes(token))
    //     return res.status(403).json({ message: "login again ! session expired" })


    jwt.verify(
        token,
        process.env.JWT_ACCESS_USER_SECRET || "some random secret",
        async (err: any, decodedData: any) => {
            if (err) {
                return res.status(403).json({ message: "login again ! session expired" })
            }
            if (decodedData) {
                req.user = await User.findById(decodedData.id).populate('created_by').populate('assigned_users').populate('updated_by')
                next();
            }
        }
    );
}

//special case for profile
export const isProfileAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    let token = undefined
    token = req.cookies.accessToken
    if (!token) {
        token = req.headers.authorization && req.headers.authorization.split(" ")[1]
    }
    if (!token)
        return res.status(403).json({ message: "login again" })
    // if (!UserTokens.includes(token))
    //     return res.status(403).json({ message: "login again" })

    token = token
    jwt.verify(
        token,
        process.env.JWT_ACCESS_USER_SECRET || "some random secret",
        async (err: any, decodedData: any) => {
            if (err) {
                return res.status(403).json({ message: "login again " })
            }
            if (decodedData) {
                req.user = await User.findById(decodedData.id).populate('created_by').populate('assigned_users').populate('updated_by')
                next();
            }
        }
    );
}


//check admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.is_admin)
        return next();
    return res.status(403).json({ message: "!must be admin" });
}

// login
export const sendUserToken = (res: Response, accessToken: string) => {
    if (accessToken)
        UserTokens.push(accessToken)
    const Expiry = Number(process.env.COOKIE_EXPIRE) || 1
    res.cookie("accessToken", accessToken, {
        maxAge: Expiry * 60 * 1000,//1 minute by default
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    });
}

//logout
export const deleteToken = async (res: Response, accessToken: string) => {
    UserTokens = UserTokens.filter((token) => token !== accessToken)
    const options = {
        maxAge: 0,
        httpOnly: true
    };
    res.cookie("accessToken", null, options);
};
export const deleteTokenOnly = async (accessToken: string) => {
    UserTokens = UserTokens.filter((token) => token !== accessToken)
};