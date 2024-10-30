import { NextFunction, Request, Response } from 'express';
import { deleteToken, sendUserToken } from '../middlewares/auth.middleware';
import isMongoId from "validator/lib/isMongoId";
import { FetchAllPermissions } from '../utils/fillAllPermissions';
import { AssignPermissionForMultipleUserDto, AssignPermissionForOneUserDto, GetUserDto,  IMenu,  LoginDto, ResetPasswordDto, UpdatePasswordDto } from '../dtos';
import { User } from '../models/user';
import moment from 'moment';



export const Login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, multi_login_token } = req.body as LoginDto
    if (!username)
        return res.status(400).json({ message: "please enter username or email" })
    if (!password)
        return res.status(400).json({ message: "please enter password" })

    let user = await User.findOne({
        username: String(username).toLowerCase().trim(),
    }).select("+password").populate("created_by").populate('assigned_users').populate("updated_by")

    if (!user) {
        user = await User.findOne({
            mobile: String(username).toLowerCase().trim(),
        }).select("+password").populate("created_by").populate('assigned_users').populate("updated_by")

    }
    if (!user) {
        user = await User.findOne({
            email: String(username).toLowerCase().trim(),
        }).select("+password").populate("created_by").populate('assigned_users').populate("updated_by")
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
    await user.save();
    let result: GetUserDto | null = {
        _id: user._id,
        username: user.username,
        email: user.email, assigned_erpEmployees: 0,
        mobile: user.mobile,
        dp: user.dp?.public_url || "",
        orginal_password: user.orginal_password,
        is_admin: user.is_admin,
        email_verified: user.email_verified,
        mobile_verified: user.mobile_verified,
        show_only_visiting_card_leads: user.show_only_visiting_card_leads,
        is_active: user.is_active,
        last_login: moment(user.last_login).calendar(),
        is_multi_login: user.is_multi_login,
        assigned_users: user.assigned_users.map((u) => {
            return {
                id: u._id, label: u.username, value: u.username
            }
        }),
        assigned_states: user.assigned_states.length || 0,
        assigned_crm_states: user.assigned_crm_states.length || 0,
        assigned_crm_cities: user.assigned_crm_cities.length || 0,
        assigned_permissions: user.assigned_permissions,
        created_at: moment(user.created_at).format("DD/MM/YYYY"),
        updated_at: moment(user.updated_at).format("DD/MM/YYYY"),
        created_by: { id: user.created_by._id, label: user.created_by.username, value: user.created_by.username },
        updated_by: { id: user.updated_by._id, label: user.updated_by.username, value: user.updated_by.username },
    }
    res.status(200).json({ user: result, token: token })
}
export const Logout = async (req: Request, res: Response, next: NextFunction) => {
    let coToken = req.cookies.accessToken
    let AuthToken = req.headers.authorization && req.headers.authorization.split(" ")[1]
    if (coToken)
        await deleteToken(res, coToken);
    if (AuthToken)
        await deleteToken(res, AuthToken);
    res.status(200).json({ message: "logged out" })
}
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
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
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
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
export const MakeAdmin = async (req: Request, res: Response, next: NextFunction) => {
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
export const ToogleShowvisitingcard = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
    let user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    user.show_only_visiting_card_leads = !user.show_only_visiting_card_leads
    if (req.user) {
        user.updated_by = user
    }
    await user.save();
    res.status(200).json({ message: "changed successfully" });
}
export const AllowMultiLogin = async (req: Request, res: Response, next: NextFunction) => {
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
export const BlockMultiLogin = async (req: Request, res: Response, next: NextFunction) => {
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
export const BlockUser = async (req: Request, res: Response, next: NextFunction) => {
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
    if (req.user) {
        user.updated_by = user
    }
    await user.save();
    res.status(200).json({ message: "user blocked successfully" });
}
export const UnBlockUser = async (req: Request, res: Response, next: NextFunction) => {
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
export const RemoveAdmin = async (req: Request, res: Response, next: NextFunction) => {
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

export const ResetPassword = async (req: Request, res: Response, next: NextFunction) => {
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

export const VerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
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
export const AssignPermissionsToOneUser = async (req: Request, res: Response, next: NextFunction) => {
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
export const AssignPermissionsToUsers = async (req: Request, res: Response, next: NextFunction) => {
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
export const GetAllPermissions = async (req: Request, res: Response, next: NextFunction) => {
    let permissions: IMenu[] = [];
    permissions = FetchAllPermissions();
    return res.status(200).json(permissions)
}

