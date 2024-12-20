import { NextFunction, Request, Response, Router } from 'express';
import express from 'express'
import isEmail from "validator/lib/isEmail";
import isMongoId from "validator/lib/isMongoId";
import moment from 'moment';
import { UpdateProfileDto, AssignUsersDto, LoginDto, UpdatePasswordDto, ResetPasswordDto, AssignPermissionForOneUserDto, AssignPermissionForMultipleUserDto, GetLoginByThisUserDto, VerifyEmailDto } from '../dtos/auth.dto';
import { GetUserDto, createOrEditUserDto } from '../dtos/user.dto';
import { deleteToken, deleteTokenOnly, isAuthenticatedUser, isProfileAuthenticated, sendUserToken } from '../middlewares/auth.middleware';
import { User, Asset, IUser } from '../models/user.model';
import { destroyCloudFile } from '../services/destroyCloudFile';
import { uploadFileToCloud } from '../services/uploadFileToCloud';
import { DropDownDto } from '../dtos/dropdown.dto';
import { IMenu } from '../dtos/permission.dto';
import { FetchAllPermissions } from '../utils/fillAllPermissions';
import { sendEmail } from '../utils/sendEmail';
import { UseMiddleware } from '../middlewares';

export class UserController {
    public router: Router
    constructor() {
        this.router = express.Router();
        this.generateRoutes(); // Automatically generate routes
    }
    public async SignUp(req: Request, res: Response, next: NextFunction) {
        let result: GetUserDto | null = null;
        let users = await User.find()
        if (users.length > 0)
            return res.status(400).json({ message: "not allowed" })

        let { username, email, password, mobile, alias1, alias2 } = req.body as createOrEditUserDto
        // validations
        if (!username || !email || !password || !mobile)
            return res.status(400).json({ message: "fill all the required fields" });
        if (!isEmail(email))
            return res.status(400).json({ message: "please provide valid email" });
        if (await User.findOne({ username: username.toLowerCase().trim() }))
            return res.status(403).json({ message: `${username} already exists` });
        if (await User.findOne({ email: email.toLowerCase().trim() }))
            return res.status(403).json({ message: `${email} already exists` });
        if (await User.findOne({ mobile: mobile }))
            return res.status(403).json({ message: `${mobile} already exists` });

        let dp: Asset = undefined
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `users/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                dp = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }


        let owner = new User({
            username,
            password,
            alias1, alias2,
            email,
            mobile,
            is_admin: true,
            dp,
            client_id: username.split(" ")[0] + `${Number(new Date())}`,
            client_data_path: username.split(" ")[0] + `${Number(new Date())}`

        })

        owner.updated_by = owner
        owner.created_by = owner
        owner.created_at = new Date()
        owner.updated_at = new Date()
        sendUserToken(res, owner.getAccessToken())
        await owner.save()
        owner = await User.findById(owner._id).populate('impersonated_user').populate("created_by").populate('assigned_users').populate("updated_by") || owner
        let token = owner.getAccessToken()
        result = {
            _id: owner._id,
            username: owner.username,
            alias1: owner.alias1,
            alias2: owner.alias2,
            email: owner.email,
            mobile: owner.mobile,
            dp: owner.dp?.public_url || "",
            orginal_password: owner.orginal_password,
            impersonated_user: owner.impersonated_user && { _id: owner.impersonated_user._id, username: owner.impersonated_user.username, is_admin: Boolean(owner.impersonated_user.is_admin) },
            is_admin: owner.is_admin,
            email_verified: owner.email_verified,
            mobile_verified: owner.mobile_verified,
            is_active: owner.is_active,
            last_login: moment(owner.last_login).calendar(),
            is_multi_login: owner.is_multi_login,
            assigned_users: owner.assigned_users.map((u) => {
                return {
                    id: owner._id, label: owner.username, value: owner.username
                }
            }),
            assigned_crm_states: owner.assigned_crm_states.length || 0,
            assigned_crm_cities: owner.assigned_crm_cities.length || 0,
            assigned_permissions: owner.assigned_permissions,
            created_at: moment(owner.created_at).format("DD/MM/YYYY"),
            updated_at: moment(owner.updated_at).format("DD/MM/YYYY"),
            created_by: { id: owner.created_by._id, label: owner.created_by.username },
            updated_by: { id: owner.updated_by._id, label: owner.updated_by.username },
        }
        res.status(201).json({ user: result, token: token })
    }
    public async NewUser(req: Request, res: Response, next: NextFunction) {
        let { username, email, password, mobile, alias1, alias2 } = req.body as createOrEditUserDto;
        // validations
        if (!username || !email || !password || !mobile)
            return res.status(400).json({ message: "fill all the required fields" });
        if (!isEmail(email))
            return res.status(400).json({ message: "please provide valid email" });
        if (await User.findOne({ username: username.toLowerCase().trim() }))
            return res.status(403).json({ message: `${username} already exists` });
        if (await User.findOne({ email: email.toLowerCase().trim() }))
            return res.status(403).json({ message: `${email} already exists` });
        if (await User.findOne({ mobile: mobile }))
            return res.status(403).json({ message: `${mobile} already exists` });

        let dp: Asset = undefined
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `users/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                dp = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }


        let user = new User({
            username,
            password,
            email, alias1, alias2,
            mobile,
            is_admin: false,
            dp,
            client_id: username.split(" ")[0] + `${Number(new Date())}`,
            client_data_path: username.split(" ")[0] + `${Number(new Date())}`

        })
        if (req.user) {
            user.created_by = req.user
            user.updated_by = req.user

        }
        user.created_at = new Date()
        user.updated_at = new Date()

        await user.save()
        res.status(201).json({ message: "success" })
    }
    public async UpdateUser(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id).populate('created_by')
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        let { email, username, mobile, alias1, alias2 } = req.body as createOrEditUserDto;
        if (!username || !email || !mobile)
            return res.status(400).json({ message: "fill all the required fields" });
        //check username
        if (username !== user.username) {
            if (await User.findOne({ username: String(username).toLowerCase().trim() }))
                return res.status(403).json({ message: `${username} already exists` });
        }
        // check mobile
        if (mobile != user.mobile) {
            if (await User.findOne({ mobile: mobile }))
                return res.status(403).json({ message: `${mobile} already exists` });
        }
        //check email
        if (email !== user.email) {
            if (await User.findOne({ email: String(email).toLowerCase().trim() }))
                return res.status(403).json({ message: `${email} already exists` });
        }

        //handle dp
        let dp = user.dp;
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `users/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })

            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc) {
                if (user.dp?._id)
                    await destroyCloudFile(user.dp._id)
                dp = doc
            }
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        let mobileverified = user.mobile_verified
        let emaileverified = user.email_verified
        if (email !== user.email)
            emaileverified = false
        if (mobile !== user.mobile)
            mobileverified = false
        await User.findByIdAndUpdate(user.id, {
            username, alias1, alias2,
            email,
            mobile,
            email_verified: emaileverified,
            mobile_verified: mobileverified,
            dp,
            updated_at: new Date(),
            updated_by: user
        })
        return res.status(200).json({ message: "user updated" })
    }
    public async UpdateProfile(req: Request, res: Response, next: NextFunction) {
        let user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        let { email, mobile } = req.body as UpdateProfileDto
        if (!email || !mobile) {
            return res.status(400).json({ message: "please fill required fields" })
        }

        if (mobile != user.mobile) {
            if (await User.findOne({ mobile: mobile }))
                return res.status(403).json({ message: `${mobile} already exists` });
        }
        //check email
        if (email !== user.email) {
            if (await User.findOne({ email: String(email).toLowerCase().trim() }))
                return res.status(403).json({ message: `${email} already exists` });
        }

        //handle dp
        let dp = user.dp;
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `users/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })

            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc) {
                if (user.dp?._id)
                    await destroyCloudFile(user.dp?._id)
                dp = doc
            }
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        let mobileverified = user.mobile_verified
        let emaileverified = user.email_verified
        if (email !== user.email)
            emaileverified = false
        if (mobile !== user.mobile)
            mobileverified = false
        await User.findByIdAndUpdate(user.id, {
            email,
            mobile,
            email_verified: emaileverified,
            mobile_verified: mobileverified,
            dp,
            updated_at: new Date(),
            updated_by: user
        })
        return res.status(200).json({ message: "profile updated" })
    }

    public async AssignUsers(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        const { ids } = req.body as AssignUsersDto
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        let users: IUser[] = []
        for (let i = 0; i < ids.length; i++) {
            let user = await User.findById(ids[i])
            if (user)
                users.push(user)
        }

        user.assigned_users = users
        if (req.user) {
            user.updated_by = user
        }
        await user.save();
        res.status(200).json({ message: "assigned users successfully" });
    }
    public async GetUsers(req: Request, res: Response, next: NextFunction) {
        let showhidden = req.query.hidden
        let result: GetUserDto[] = []
        let users: IUser[] = await User.find({ is_active: showhidden == 'false' }).populate("created_by").populate("updated_by").populate('assigned_users').sort('username')

        result = users.map((u) => {
            return {
                _id: u._id,
                username: u.username,
                alias1: u.alias1,
                alias2: u.alias2,
                email: u.email,
                mobile: u.mobile,
                dp: u.dp?.public_url || "",
                orginal_password: u.orginal_password,
                assigned_erpEmployees: 0,
                is_admin: u.is_admin,
                email_verified: u.email_verified,
                mobile_verified: u.mobile_verified,
                is_active: u.is_active,
                last_login: moment(u.last_login).format("lll"),
                is_multi_login: u.is_multi_login,
                assigned_users: u.assigned_users.map((u) => {
                    return {
                        id: u._id, label: u.username, value: u.username
                    }
                }),

                assigned_crm_states: u.assigned_crm_states.length || 0,
                assigned_crm_cities: u.assigned_crm_cities.length || 0,
                assigned_permissions: u.assigned_permissions,
                created_at: moment(u.created_at).format("DD/MM/YYYY"),
                updated_at: moment(u.updated_at).format("DD/MM/YYYY"),
                created_by: { id: u.created_by._id, label: u.created_by.username, value: u.created_by.username },
                updated_by: { id: u.updated_by._id, label: u.updated_by.username, value: u.updated_by.username },
            }
        })
        return res.status(200).json(result)
    }

    public async GetUsersForDropdown(req: Request, res: Response, next: NextFunction) {
        let showhidden = req.query.hidden
        let perm = req.query.permission
        let show_assigned_only = req.query.show_assigned_only
        let result: DropDownDto[] = []
        let users: IUser[] = [];

        if (show_assigned_only == 'true') {
            let ids: string[] = []
            ids = req.user?.assigned_users.map((id: { _id: string }) => { return id._id })
            users = await User.find({ is_active: true, _id: { $in: ids } }).sort('username')
        }
        else {
            users = await User.find({ is_active: showhidden == 'false' }).sort('username')
        }
        if (perm != 'undefined') {
            users = users.filter((u) => { return u.assigned_permissions.includes(String(perm)) })
        }
        result = users.map((u) => {
            return {
                id: u._id,
                label: u.username,
            }
        })
        return res.status(200).json(result)
    }
    public async GetUsersForAssignmentPage(req: Request, res: Response, next: NextFunction) {
        let result: GetUserDto[] = []
        let users = await User.find({ is_admin: false }).populate("created_by").populate("updated_by").populate('assigned_users').sort('username')

        result = users.map((u) => {
            return {
                _id: u._id,
                username: u.username,
                alias1: u.alias1,
                alias2: u.alias2,
                email: u.email,
                mobile: u.mobile,
                dp: u.dp?.public_url || "",
                orginal_password: u.orginal_password,
                assigned_erpEmployees: 0,
                is_admin: u.is_admin,
                email_verified: u.email_verified,
                mobile_verified: u.mobile_verified,
                is_active: u.is_active,
                last_login: moment(u.last_login).format("lll"),
                is_multi_login: u.is_multi_login,
                assigned_users: u.assigned_users.map((u) => {
                    return {
                        id: u._id, label: u.username, value: u.username
                    }
                }),
                impersonated_user: u.impersonated_user && { _id: u.impersonated_user._id, username: u.impersonated_user.username, is_admin: Boolean(u.impersonated_user.is_admin) },
                assigned_crm_states: u.assigned_crm_states.length || 0,
                assigned_crm_cities: u.assigned_crm_cities.length || 0,
                assigned_permissions: u.assigned_permissions,
                created_at: moment(u.created_at).format("DD/MM/YYYY"),
                updated_at: moment(u.updated_at).format("DD/MM/YYYY"),
                created_by: { id: u.created_by._id, label: u.created_by.username, value: u.created_by.username },
                updated_by: { id: u.updated_by._id, label: u.updated_by.username, value: u.updated_by.username },
            }
        })
        return res.status(200).json(result)
    }

    
    public async getProfile(req: Request, res: Response, next: NextFunction) {
        let result: GetUserDto | null = null;
        const user = await User.findById(req.user?._id).populate('impersonated_user').populate("created_by").populate("updated_by").populate('assigned_users')
        if (user && !user?.is_active)
            return res.status(403).json({ message: "login again" })
        if (user)
            result = {
                _id: user._id,
                username: user.username,
                alias1: user.alias1,
                alias2: user.alias2,
                email: user.email,
                mobile: user.mobile,
                dp: user.dp?.public_url || "",
                impersonated_user: user.impersonated_user && { _id: user.impersonated_user._id, username: user.impersonated_user.username, is_admin: Boolean(user.impersonated_user.is_admin) }, orginal_password: user.orginal_password,
                is_admin: user.is_admin,
                email_verified: user.email_verified,
                mobile_verified: user.mobile_verified,
                is_active: user.is_active,
                last_login: moment(user.last_login).calendar(),
                is_multi_login: user.is_multi_login,
                assigned_users: user.assigned_users.map((u) => {
                    return {
                        id: user._id, label: user.username, value: user.username
                    }
                }),
                assigned_crm_states: user.assigned_crm_states.length || 0,
                assigned_crm_cities: user.assigned_crm_cities.length || 0,
                assigned_permissions: user.assigned_permissions,
                created_at: moment(user.created_at).format("DD/MM/YYYY"),
                updated_at: moment(user.updated_at).format("DD/MM/YYYY"),
                created_by: { id: user.created_by._id, label: user.created_by.username },
                updated_by: { id: user.updated_by._id, label: user.updated_by.username },
            }
        res.status(200).json({ user: result, token: req.cookies.accessToken })
    }


    public async Login(req: Request, res: Response, next: NextFunction) {
        const { username, password, multi_login_token } = req.body as LoginDto
        if (!username)
            return res.status(400).json({ message: "please enter username or email" })
        if (!password)
            return res.status(400).json({ message: "please enter password" })

        let user = await User.findOne({
            username: String(username).toLowerCase().trim(),
        }).select("+password").populate('impersonated_user').populate("created_by").populate('assigned_users').populate("updated_by")

        if (!user) {
            user = await User.findOne({
                mobile: String(username).toLowerCase().trim(),
            }).select("+password").populate('impersonated_user').populate("created_by").populate('assigned_users').populate("updated_by")

        }
        if (!user) {
            user = await User.findOne({
                email: String(username).toLowerCase().trim(),
            }).select("+password").populate('impersonated_user').populate("created_by").populate('assigned_users').populate("updated_by")
            if (user)
                if (!user.email_verified)
                    return res.status(403).json({ message: "please verify email id before login" })
        }
        if (!user)
            return res.status(403).json({ message: "Invalid username or password" })
        if (!user.is_active)
            return res.status(401).json({ message: "you are blocked, contact admin" })
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched)
            return res.status(403).json({ message: "Invalid username or password" })
        if (user.created_by._id !== user._id) {
            if (!user.is_multi_login && user.multi_login_token && user.multi_login_token !== multi_login_token)
                return res.status(403).json({ message: "Sorry ! You are already logged in on an another device,contact administrator" })
            if (!user.is_multi_login && !user.multi_login_token)
                user.multi_login_token = multi_login_token
        }

        sendUserToken(res, user.getAccessToken())
        user.last_login = new Date()
        let token = user.getAccessToken()
        user.orginal_password = password;
        user.access_token = token;
        await user.save();
        let result: GetUserDto | null = {
            _id: user._id,
            username: user.username,
            alias1: user.alias1,
            alias2: user.alias2,
            email: user.email,
            mobile: user.mobile,
            dp: user.dp?.public_url || "",
            orginal_password: user.orginal_password,
            is_admin: user.is_admin,
            email_verified: user.email_verified,
            mobile_verified: user.mobile_verified,
            is_active: user.is_active,
            impersonated_user: user.impersonated_user && { _id: user.impersonated_user._id, username: user.impersonated_user.username, is_admin: Boolean(user.impersonated_user.is_admin) },
            last_login: moment(user.last_login).calendar(),
            is_multi_login: user.is_multi_login,
            assigned_users: user.assigned_users.map((u) => {
                return {
                    id: u._id, label: u.username, value: u.username
                }
            }),
            assigned_crm_states: user.assigned_crm_states.length || 0,
            assigned_crm_cities: user.assigned_crm_cities.length || 0,
            assigned_permissions: user.assigned_permissions,
            created_at: moment(user.created_at).format("DD/MM/YYYY"),
            updated_at: moment(user.updated_at).format("DD/MM/YYYY"),
            created_by: { id: user.created_by._id, label: user.created_by.username },
            updated_by: { id: user.updated_by._id, label: user.updated_by.username },
        }
        res.status(200).json({ user: result, token: token })
    }
    public async Logout(req: Request, res: Response, next: NextFunction) {
        let coToken = req.cookies.accessToken
        let AuthToken = req.headers.authorization && req.headers.authorization.split(" ")[1]
        if (coToken)
            await deleteToken(res, coToken);
        if (AuthToken)
            await deleteToken(res, AuthToken);
        res.status(200).json({ message: "logged out" })
    }
    public async updatePassword(req: Request, res: Response, next: NextFunction) {
        const { oldPassword, newPassword, confirmPassword } = req.body as UpdatePasswordDto
        if (!oldPassword || !newPassword || !confirmPassword)
            return res.status(400).json({ message: "please fill required fields" })
        if (confirmPassword == oldPassword)
            return res.status(403).json({ message: "new password should not be same to the old password" })
        if (newPassword !== confirmPassword)
            return res.status(403).json({ message: "new password and confirm password not matched" })
        let user = await User.findById(req.user?._id).select("+password")
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        const isPasswordMatched = await user.comparePassword(oldPassword);
        if (!isPasswordMatched)
            return res.status(401).json({ message: "Old password is incorrect" })
        user.password = newPassword;
        user.updated_by = user
        await user.save();
        res.status(200).json({ message: "password updated" });
    }
    public async resetUserPassword(req: Request, res: Response, next: NextFunction) {
        const { newPassword, confirmPassword } = req.body as ResetPasswordDto
        if (!newPassword || !confirmPassword)
            return res.status(400).json({ message: "please fill required fields" })
        if (newPassword !== confirmPassword)
            return res.status(403).json({ message: "new password and confirm password not matched" })
        let id = req.params.id
        if (!isMongoId(id)) {
            return res.status(404).json({ message: "user id not valid" })
        }
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        user.password = newPassword;
        user.updated_by = user
        await user.save();
        res.status(200).json({ message: "password updated" });
    }
    public async MakeAdmin(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if (user.is_admin)
            return res.status(404).json({ message: "already a admin" })
        user.is_admin = true
        if (req.user) {
            user.updated_by = user
        }
        await user.save();
        res.status(200).json({ message: "admin role provided successfully" });
    }

    public async AllowMultiLogin(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        user.is_multi_login = true
        user.multi_login_token = null
        if (req.user)
            user.updated_by = req.user
        await user.save();
        res.status(200).json({ message: "multi login allowed " });
    }
    public async BlockMultiLogin(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        user.is_multi_login = false
        user.multi_login_token = null
        if (req.user)
            user.updated_by = req.user
        await user.save();
        res.status(200).json({ message: "multi login blocked " });
    }
    public async BlockUser(req: Request, res: Response, next: NextFunction) {
        //update role of user
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id).populate('created_by')
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if (!user.is_active)
            return res.status(404).json({ message: "user already blocked" })

        if (String(user.created_by._id) === String(user._id))
            return res.status(403).json({ message: "not allowed contact crm administrator" })
        if (String(user._id) === String(req.user?._id))
            return res.status(403).json({ message: "not allowed this operation here, because you may block yourself" })
        user.is_active = false
        deleteTokenOnly(user.access_token)
        if (req.user) {
            user.updated_by = user
        }
        await user.save();
        res.status(200).json({ message: "user blocked successfully" });
    }
    public async UnBlockUser(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if (user.is_active)
            return res.status(404).json({ message: "user is already active" })
        user.is_active = true
        if (req.user) {
            user.updated_by = user
        }
        await user.save();
        res.status(200).json({ message: "user unblocked successfully" });
    }
    public async RemoveAdmin(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
        let user = await User.findById(id).populate('created_by')
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if (String(user.created_by._id) === String(user._id))
            return res.status(403).json({ message: "not allowed contact administrator" })
        if (String(user._id) === String(req.user?._id))
            return res.status(403).json({ message: "not allowed this operation here, because you may harm yourself" })
        user = await User.findById(id)
        if (!user?.is_admin)
            res.status(400).json({ message: "you are not an admin" });
        await User.findByIdAndUpdate(id, {
            is_admin: false,
            updated_by_username: req.user?.username,
            updated_by: req.user
        })
        res.status(200).json({ message: "admin role removed successfully" });
    }

    public async ResetPassword(req: Request, res: Response, next: NextFunction) {
        let resetPasswordToken = req.params.token;
        const { newPassword, confirmPassword } = req.body as ResetPasswordDto;
        if (!newPassword || !confirmPassword)
            return res.status(400).json({ message: "Please fill all required fields " })
        if (newPassword !== confirmPassword)
            return res.status(400).json({ message: "passwords do not matched" })
        let user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user)
            return res.status(403).json({ message: "Reset Password Token is invalid or has been expired" })

        user.password = req.body.newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();
        res.status(200).json({ message: "password updated" });
    }

    public async VerifyEmail(req: Request, res: Response, next: NextFunction) {
        const emailVerifyToken = req.params.token;
        let user = await User.findOne({
            emailVerifyToken,
            emailVerifyExpire: { $gt: Date.now() },
        });
        if (!user)
            return res.status(403).json({ message: "Email verification Link  is invalid or has been expired" })
        user.email_verified = true;
        user.emailVerifyToken = null;
        user.emailVerifyExpire = null;
        await user.save();
        res.status(200).json({
            message: `congrats ${user.email} verification successful`
        });
    }
    public async AssignPermissionsToOneUser(req: Request, res: Response, next: NextFunction) {
        const { permissions, user_id } = req.body as AssignPermissionForOneUserDto

        if (permissions && permissions.length === 0)
            return res.status(400).json({ message: "please select one permission " })
        if (!user_id)
            return res.status(400).json({ message: "please select  user" })

        let user = await User.findById(user_id)
        if (user) {
            user.assigned_permissions = permissions
            await user.save();
        }

        return res.status(200).json({ message: "successfull" })
    }
    public async AssignPermissionsToUsers(req: Request, res: Response, next: NextFunction) {
        const { permissions, user_ids, flag } = req.body as AssignPermissionForMultipleUserDto

        if (permissions && permissions.length === 0)
            return res.status(400).json({ message: "please select one permission " })
        if (user_ids && user_ids.length === 0)
            return res.status(400).json({ message: "please select one user" })
        if (flag == 0) {
            user_ids.forEach(async (i) => {
                let user = await User.findById(i)
                if (user) {
                    let old_permissions = user.assigned_permissions.filter((per) => { return !permissions.includes(per) })
                    user.assigned_permissions = old_permissions
                    await user.save();
                }
            })
        }
        else {
            user_ids.forEach(async (i) => {
                let user = await User.findById(i)
                if (user) {
                    let old_permissions = user.assigned_permissions;
                    permissions.forEach((p) => {
                        if (!old_permissions.includes(p))
                            old_permissions.push(p)
                    })
                    user.assigned_permissions = old_permissions
                    await user.save();
                }
            })
        }


        return res.status(200).json({ message: "successfull" })
    }
    public async GetAllPermissions(req: Request, res: Response, next: NextFunction) {
        let permissions: IMenu[] = [];
        permissions = FetchAllPermissions();
        return res.status(200).json(permissions)
    }

    public async LoginByThisUser(req: Request, res: Response, next: NextFunction) {
        const { user_id, impersnate_id } = req.body as GetLoginByThisUserDto
        if (!user_id)
            return res.status(400).json({ message: "please select user" })
        if (!impersnate_id || !req.user)
            return res.status(400).json({ message: "please login" })

        let user1 = await User.findById(user_id)
        if (!user1)
            return res.status(404).json({ message: "user not exists" })

        let user2 = await User.findById(impersnate_id)
        if (!user2)
            return res.status(404).json({ message: "Impersnated user not exists" })
        console.log(user1.username, user2.username)
        //logout user2
        deleteToken(res, user2.access_token)
        await User.findByIdAndUpdate(user2._id, { access_token: undefined, impersonated_user: undefined })

        //login user1
        let token1 = user1.getAccessToken();
        sendUserToken(res, token1)
        await User.findByIdAndUpdate(user1._id, { access_token: token1, impersonated_user: impersnate_id })

        res.status(200).json({ message: "success" })
    }

    // public async BackToMyAccount  (req: Request, res: Response, next: NextFunction)  {
    //     const { user_id, impersnate_id } = req.body as GetLoginByThisUserDto
    //     if (!user_id)
    //         return res.status(400).json({ message: "please select user" })
    //     if (!impersnate_id || !req.user)
    //         return res.status(400).json({ message: "please login" })

    //     let user1 = await User.findById(user_id)
    //     if (!user1)
    //         return res.status(404).json({ message: "user not exists" })

    //     let user2 = await User.findById(impersnate_id)
    //     if (!user2)
    //         return res.status(404).json({ message: "Impersnated user not exists" })
    //     console.log(user1.username, user2.username)
    //     //logout user1
    //     deleteToken(res, user1.access_token)
    //     await User.findByIdAndUpdate(user1._id, { access_token: undefined, impersonated_user: undefined })
    //     //login user2
    //     let token1 = user2.getAccessToken();
    //     sendUserToken(res, token1)
    //     await User.findByIdAndUpdate(impersnate_id, { access_token: token1, impersonated_user: undefined })

    //     res.status(200).json({ message: "success" })
    // }
    public async SendPasswordResetMail(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body as VerifyEmailDto
        if (!email) return res.status(400).json({ message: "please provide email id" })
        const userEmail = String(email).toLowerCase().trim();
        if (!isEmail(userEmail))
            return res.status(400).json({ message: "provide a valid email" })
        let user = await User.findOne({ email: userEmail }).populate('created_by')

        if (user) {
            if (String(user._id) !== String(user.created_by._id))
                return res.status(403).json({ message: "not allowed this service" })
        }
        if (!user)
            return res.status(404).json({ message: "you have no account with this email id" })
        const resetToken = await user.getResetPasswordToken();
        await user.save();
        const resetPasswordUrl = `${process.env.HOST}/password/reset/${resetToken}`;
        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n valid for 15 minutes only \n\n\n\nIf you have not requested this email then, please ignore it.`;
        const options = {
            to: user.email,
            subject: `Bo Agarson Password Recovery`,
            message: message,
        };
        let response = await sendEmail(options);
        if (response) {
            return res.status(200).json({
                message: `Email sent to ${user.email} successfully`,
            })
        }
        else {
            user.resetPasswordToken = null;
            user.resetPasswordExpire = null;
            await user.save();
            return res.status(500).json({ message: "email could not be sent, something went wrong" })
        }
    }
    public async SendVerifyEmail(req: Request, res: Response, next: NextFunction) {
        const { email } = req.body as VerifyEmailDto
        if (!email)
            return res.status(400).json({ message: "please provide your email id" })
        const userEmail = String(email).toLowerCase().trim();
        if (!isEmail(userEmail))
            return res.status(400).json({ message: "provide a valid email" })
        const user = await User.findOne({ email: userEmail })
        if (!user)
            return res.status(404).json({ message: "you have no account with this email id" })
        const verifyToken = await user.getEmailVerifyToken();
        await user.save();
        const emailVerficationUrl = `${process.env.HOST}/email/verify/${verifyToken}`


        const message = `Your email verification link is :- \n\n ${emailVerficationUrl} \n\n valid for 15 minutes only \n\nIf you have not requested this email then, please ignore it.`;
        const options = {
            to: user.email,
            subject: `Bo Agarson Email Verification`,
            message,
        };

        let response = await sendEmail(options);
        if (response) {
            return res.status(200).json({
                message: `Email sent to ${user.email} successfully`,
            })
        }
        else {
            user.emailVerifyToken = null;
            user.emailVerifyExpire = null;
            await user.save();
            return res.status(500).json({ message: "email could not be sent, something went wrong" })
        }
    }

    private generateRoutes(): void {
        const methodPrefix = ['get', 'post', 'put', 'patch', 'delete']; // Allowed HTTP methods

        Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter((methodName) => methodName !== 'constructor' && typeof (this as any)[methodName] === 'function')
            .forEach((methodName) => {
                const match = methodName.match(new RegExp(`^(${methodPrefix.join('|')})([A-Z].*)$`));
                if (match) {
                    const [, httpMethod, routeName] = match;
                    const routePath =
                        '/' +
                        routeName
                            .replace(/([A-Z])/g, '-$1')
                            .toLowerCase()
                            .substring(1); // Convert "CamelCase" to "kebab-case"
                    //@ts-ignore
                    this.router[httpMethod](routePath, (this as any)[methodName].bind(this));
                }
            });
    }
}

