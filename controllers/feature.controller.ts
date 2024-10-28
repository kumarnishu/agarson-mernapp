import { NextFunction, Request, Response } from 'express';
import isEmail from "validator/lib/isEmail";
import { deleteToken, isAuthenticatedUser, sendUserToken } from '../middlewares/auth.middleware';
import isMongoId from "validator/lib/isMongoId";
import moment from 'moment';
import { Types } from 'mongoose';
import xlsx from "xlsx"
import { router, upload } from '../app';
import { AssignPermissionForMultipleUserDto, AssignPermissionForOneUserDto, AssignUsersDto, CreateAndUpdatesLeadFromExcelDto, CreateOrEditBillDto, CreateOrEditChecklistDto, CreateOrEditLeadDto, CreateOrEditMergeLeadsDto, CreateOrEditMergeRefersDto, CreateOrEditProductionDto, CreateOrEditReferDto, CreateOrEditReferFromExcelDto, CreateOrEditRemarkDto, CreateOrEditShoeWeightDto, CreateOrEditSpareDyeDto, createOrEditUserDto, CreateOrRemoveReferForLeadDto, GetActivitiesOrRemindersDto, GetActivitiesTopBarDetailsDto, GetBillDto, GetChecklistDto, GetChecklistFromExcelDto, GetLeadDto, GetReferDto, GetRemarksDto, GetUserDto, IMenu, LoginDto, ResetPasswordDto, UpdatePasswordDto, UpdateProfileDto, VerifyEmailDto } from '../dtos/feature.dto';
import { Asset, IBill, IChecklist, ILead, IMaintenance, IMaintenanceItem, IProduction, IReferredParty, IRemark, IShoeWeight, ISoleThickness, ISpareDye, IUser } from '../interfaces/feature.interface';
import Lead, { Bill, BillItem, Checklist, ChecklistBox, Maintenance, MaintenanceItem, Production, ReferredParty, Remark, ShoeWeight, SoleThickness, SpareDye, User } from '../models/feature.model';
import SaveExcelTemplateToDisk, { destroyFile, isvalidDate, sendEmail, uploadFileToCloud } from '../utils/app.util';
import { FetchAllPermissions } from '../utils/permissions.util';
import { Article, Dye, DyeLocation, Machine, MaintenanceCategory, Stage } from '../models/dropdown.model';
import { CreateMaintenanceFromExcelDto, CreateOrEditMaintenanceDto, CreateOrEditSoleThicknessDto, GetMaintenanceDto, GetMaintenanceItemDto, GetMaintenanceItemRemarkDto, GetProductionDto, GetShoeWeightDto, GetSoleThicknessDto, GetSpareDyeDto } from '../dtos/dropdown.dto';

router.get("users", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    let showhidden = req.query.hidden
    let perm = req.query.permission
    let show_assigned_only = req.query.show_assigned_only
    let result: GetUserDto[] = []
    let users: IUser[] = [];

    if (show_assigned_only == 'true') {
        //@ts-ignore
        let ids = req.user?.assigned_users.map((id) => { return id._id })
        users = await User.find({ is_active: true, _id: { $in: ids } }).populate("created_by").populate("updated_by").populate('assigned_users').sort('-last_login')
    }
    else {
        users = await User.find({ is_active: showhidden == 'false' }).populate("created_by").populate("updated_by").populate('assigned_users').sort('-last_login')
    }
    if (perm) {
        users = users.filter((u) => { return u.assigned_permissions.includes(String(perm)) })
    }
    result = users.map((u) => {
        return {
            _id: u._id,
            username: u.username,
            email: u.email,
            mobile: u.mobile,
            dp: u.dp?.public_url || "",
            orginal_password: u.orginal_password,
            assigned_erpEmployees: 0,
            is_admin: u.is_admin,
            email_verified: u.email_verified,
            mobile_verified: u.mobile_verified,
            show_only_visiting_card_leads: u.show_only_visiting_card_leads,
            is_active: u.is_active,
            last_login: moment(u.last_login).format("lll"),
            is_multi_login: u.is_multi_login,
            assigned_users: u.assigned_users.map((u) => {
                return {
                    id: u._id, label: u.username, value: u.username
                }
            }),
            assigned_states: u.assigned_states.length || 0,
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
})
router.get("profile", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    let result: GetUserDto | null = null;
    const user = await User.findById(req.user?._id).populate("created_by").populate("updated_by").populate('assigned_users')
    if (user)
        result = {
            _id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            dp: user.dp?.public_url || "",
            orginal_password: user.orginal_password,
            is_admin: user.is_admin, assigned_erpEmployees: 0,
            email_verified: user.email_verified,
            mobile_verified: user.mobile_verified,
            show_only_visiting_card_leads: user.show_only_visiting_card_leads,
            is_active: user.is_active,
            last_login: moment(user.last_login).calendar(),
            is_multi_login: user.is_multi_login,
            assigned_users: user.assigned_users.map((u) => {
                return {
                    id: user._id, label: user.username, value: user.username
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
    res.status(200).json({ user: result, token: req.cookies.accessToken })
})
router.post("signup", isAuthenticatedUser, upload.single("dp"), async (req: Request, res: Response, next: NextFunction) => {
    let result: GetUserDto | null = null;
    let users = await User.find()
    if (users.length > 0)
        return res.status(400).json({ message: "not allowed" })

    let { username, email, password, mobile } = req.body as createOrEditUserDto
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

    let dp: Asset | undefined = undefined
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
    owner = await User.findById(owner._id).populate("created_by").populate('assigned_users').populate("updated_by") || owner
    let token = owner.getAccessToken()
    result = {
        _id: owner._id,
        username: owner.username,
        email: owner.email,
        mobile: owner.mobile,
        dp: owner.dp?.public_url || "", assigned_erpEmployees: 0,
        orginal_password: owner.orginal_password,
        is_admin: owner.is_admin,
        email_verified: owner.email_verified,
        mobile_verified: owner.mobile_verified,
        show_only_visiting_card_leads: owner.show_only_visiting_card_leads,
        is_active: owner.is_active,
        last_login: moment(owner.last_login).calendar(),
        is_multi_login: owner.is_multi_login,
        assigned_users: owner.assigned_users.map((u) => {
            return {
                id: owner._id, label: owner.username, value: owner.username
            }
        }),
        assigned_states: owner.assigned_states.length || 0,
        assigned_crm_states: owner.assigned_crm_states.length || 0,
        assigned_crm_cities: owner.assigned_crm_cities.length || 0,
        assigned_permissions: owner.assigned_permissions,
        created_at: moment(owner.created_at).format("DD/MM/YYYY"),
        updated_at: moment(owner.updated_at).format("DD/MM/YYYY"),
        created_by: { id: owner.created_by._id, label: owner.created_by.username, value: owner.created_by.username },
        updated_by: { id: owner.updated_by._id, label: owner.updated_by.username, value: owner.updated_by.username },
    }
    res.status(201).json({ user: result, token: token })
}
)
router.post("users/new", isAuthenticatedUser, upload.single("dp"), async (req: Request, res: Response, next: NextFunction) => {
    let { username, email, password, mobile } = req.body as createOrEditUserDto;
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

    let dp: Asset | undefined = undefined
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
        email,
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
})
router.post("login", async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("logout", async (req: Request, res: Response, next: NextFunction) => {
    let coToken = req.cookies.accessToken
    let AuthToken = req.headers.authorization && req.headers.authorization.split(" ")[1]
    if (coToken)
        await deleteToken(res, coToken);
    if (AuthToken)
        await deleteToken(res, AuthToken);
    res.status(200).json({ message: "logged out" })
})
router.post("assigne/users/manager", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.put("users/:id", upload.single("dp"), isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
    let user = await User.findById(id).populate('created_by')
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    let { email, username, mobile } = req.body as createOrEditUserDto;
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
                await destroyFile(user.dp._id)
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
        username,
        email,
        mobile,
        email_verified: emaileverified,
        mobile_verified: mobileverified,
        dp,
        updated_at: new Date(),
        updated_by: user
    })
    return res.status(200).json({ message: "user updated" })
})
router.post("profile/:id", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
                await destroyFile(user.dp?._id)
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
})
router.post("passwords/update", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("passwords/reset/:id", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("toogle-admin/:id", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
    let user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    if (user.created_by._id.valueOf() === id)
        return res.status(403).json({ message: "not allowed contact developer" })
    user.is_admin = !user.is_admin
    if (req.user) {
        user.updated_by = user
    }
    await user.save();
    res.status(200).json({ message: "success" });
})
router.post("toogle-multi-device-login/:id", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
    let user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    user.is_multi_login = !user.is_multi_login
    if (user.is_multi_login)
        user.multi_login_token = null
    if (req.user)
        user.updated_by = req.user
    await user.save();
    res.status(200).json({ message: "success" });
})
router.post("toogle-block-user/:id", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    //update role of user
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "user id not valid" })
    let user = await User.findById(id).populate('created_by')
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }

    if (user.created_by._id.valueOf() === id)
        return res.status(403).json({ message: "not allowed contact developer" })
    if (String(user._id) === String(req.user?._id))
        return res.status(403).json({ message: "not allowed this operation here, because you may block yourself" })
    user.is_active = !user.is_active
    if (req.user) {
        user.updated_by = user
    }
    await user.save();
    res.status(200).json({ message: "success" });
})
router.post("toogle-leads-visiting-card-user/:id", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("send-forgot-password-link", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("reset-password/:token", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("send-email-verification-link", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("email-verify/:token", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("assign-permission-one", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.post("assign-permission-bulk", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("permissions", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    let permissions: IMenu[] = [];
    permissions = FetchAllPermissions();
    return res.status(200).json(permissions)
})
router.get("leads", isAuthenticatedUser, async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let stage = req.query.stage
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let showonlycardleads = Boolean(user?.show_only_visiting_card_leads)
    let result: GetLeadDto[] = []
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let stages = await (await Stage.find()).map((i) => { return i.stage })
    if (!req.user?.assigned_permissions.includes('show_leads_useless'))
        stages = stages.filter((stage) => { return stage !== "useless" })
    if (!req.user?.assigned_permissions.includes('show_refer_leads'))
        stages = stages.filter((stage) => { return stage !== "refer" })
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        let leads: ILead[] = []
        let count = 0
        if (stage != "all") {
            leads = await Lead.find({
                stage: stage, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                stage: stage, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }
        else if (showonlycardleads) {
            leads = await Lead.find({
                has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }
        else {
            leads = await Lead.find({
                stage: { $in: stages }, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                stage: { $in: stages }, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }

        result = leads.map((lead) => {
            return {
                _id: lead._id,
                name: lead.name,
                customer_name: lead.customer_name,
                customer_designation: lead.customer_designation,
                mobile: lead.mobile,
                gst: lead.gst,
                has_card: lead.has_card,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                uploaded_bills: lead.uploaded_bills || 0,
                country: lead.country,
                address: lead.address,
                work_description: lead.work_description,
                turnover: lead.turnover,
                alternate_mobile1: lead.alternate_mobile1,
                alternate_mobile2: lead.alternate_mobile2,
                alternate_email: lead.alternate_email,
                lead_type: lead.lead_type,
                stage: lead.stage,
                lead_source: lead.lead_source,
                visiting_card: lead.visiting_card?.public_url || "",
                referred_party_name: lead.referred_party && lead.referred_party.name,
                referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                last_remark: lead.last_remark || "",
                created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
            }
        })

        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
})
export const GetAssignedReferrals = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let party = await ReferredParty.findById(id)

    if (!party)
        return res.status(404).json({ message: "party not found" })
    let leads: ILead[]
    let result: GetLeadDto[] = []
    leads = await Lead.find({ referred_party: party._id }).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')


    result = leads.map((lead) => {
        return {
            _id: lead._id,
            name: lead.name,
            customer_name: lead.customer_name,
            uploaded_bills: lead.uploaded_bills,
            customer_designation: lead.customer_designation,
            mobile: lead.mobile,
            gst: lead.gst,
            has_card: lead.has_card,
            email: lead.email,
            city: lead.city,
            state: lead.state,
            country: lead.country,
            address: lead.address,
            work_description: lead.work_description,
            turnover: lead.turnover,
            alternate_mobile1: lead.alternate_mobile1,
            alternate_mobile2: lead.alternate_mobile2,
            alternate_email: lead.alternate_email,
            lead_type: lead.lead_type,
            stage: lead.stage,
            lead_source: lead.lead_source,
            visiting_card: lead.visiting_card?.public_url || "",
            referred_party_name: lead.referred_party && lead.referred_party.name,
            referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
            referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
            last_remark: lead?.last_remark || "",
            created_at: moment(lead.created_at).format("DD/MM/YYYY"),
            updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
            created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
            updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
        }
    })

    return res.status(200).json(result);
}

// leads apis
export const ReferLead = async (req: Request, res: Response, next: NextFunction) => {
    const { party_id, remark, remind_date } = req.body as CreateOrRemoveReferForLeadDto
    if (!party_id)
        return res.status(400).json({ message: "fill required field" })
    const id = req.params.id
    if (!isMongoId(id) || !isMongoId(party_id))
        return res.status(400).json({ message: "bad mongo id" })
    let lead = await Lead.findById(id)
    if (!lead)
        return res.status(404).json({ message: "lead not found" })
    let party = await ReferredParty.findById(party_id)
    if (!party)
        return res.status(404).json({ message: "referred party not found" })

    if (remark) {
        let new_remark = new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        })
        if (remind_date)
            new_remark.remind_date = new Date(remind_date)
        await new_remark.save()
    }

    lead.referred_party = party
    lead.stage = "refer"
    lead.last_remark = remark;
    lead.referred_date = new Date()
    lead.updated_at = new Date()
    if (req.user)
        lead.updated_by = req.user
    await lead.save()
    return res.status(200).json({ message: "party referred successfully" })
}
export const RemoveLeadReferral = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { remark } = req.body as CreateOrRemoveReferForLeadDto
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let lead = await Lead.findById(id)
    if (!lead)
        return res.status(404).json({ message: "lead not found" })
    if (remark) {
        let new_remark = new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        })
        await new_remark.save()
    }
    lead.referred_party = undefined
    lead.referred_date = undefined
    lead.stage = "open"
    lead.last_remark = remark;
    lead.updated_at = new Date()
    if (req.user)
        lead.updated_by = req.user
    await lead.save()
    return res.status(200).json({ message: "referrals removed successfully" })
}
export const ConvertLeadToRefer = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    const { remark } = req.body
    let resultParty = await ReferredParty.findOne({ mobile: lead.mobile });
    if (resultParty) {
        return res.status(400).json({ message: "already exists this mobile number in refers" })
    }

    const refer = await new ReferredParty({
        name: lead.name, customer_name: lead.customer_name, city: lead.city, state: lead.state,
        mobile: lead.mobile,
        mobile2: lead.alternate_mobile1 || undefined,
        mobile3: lead.alternate_mobile2 || undefined,
        address: lead.address,
        gst: "erertyujhtyuiop",
        convertedfromlead: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    })
    await Remark.updateMany({ lead: lead._id }, { lead: undefined, refer: refer._id });
    refer.last_remark = remark
    await refer.save()
    await Lead.findByIdAndDelete(lead._id);
    if (remark)
        await new Remark({
            remark: remark,
            refer: refer,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
    return res.status(200).json({ message: "new refer created" })
}
export const FuzzySearchLeads = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let result: GetLeadDto[] = []
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let showonlycardleads = Boolean(user?.show_only_visiting_card_leads)
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let key = String(req.query.key).split(",")
    let stage = req.query.stage
    if (!key)
        return res.status(500).json({ message: "bad request" })
    let leads: ILead[] = []
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {

        if (stage != "all") {
            if (key.length == 1 || key.length > 4) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $or: [
                        { name: { $regex: key[0], $options: 'i' } },
                        { customer_name: { $regex: key[0], $options: 'i' } },
                        { customer_designation: { $regex: key[0], $options: 'i' } },
                        { gst: { $regex: key[0], $options: 'i' } },
                        { mobile: { $regex: key[0], $options: 'i' } },
                        { email: { $regex: key[0], $options: 'i' } },
                        { country: { $regex: key[0], $options: 'i' } },
                        { address: { $regex: key[0], $options: 'i' } },
                        { work_description: { $regex: key[0], $options: 'i' } },
                        { turnover: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                        { alternate_email: { $regex: key[0], $options: 'i' } },
                        { lead_type: { $regex: key[0], $options: 'i' } },
                        { lead_source: { $regex: key[0], $options: 'i' } },
                        { last_remark: { $regex: key[0], $options: 'i' } },
                        { city: { $regex: key[0], $options: 'i' } },
                        { state: { $regex: key[0], $options: 'i' } },
                    ]

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')
            }
            if (key.length == 2) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },

                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 3) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },

                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },

                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 4) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },

                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },

                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[3], $options: 'i' } },
                                { customer_name: { $regex: key[3], $options: 'i' } },
                                { customer_designation: { $regex: key[3], $options: 'i' } },
                                { mobile: { $regex: key[3], $options: 'i' } },
                                { email: { $regex: key[3], $options: 'i' } },
                                { country: { $regex: key[3], $options: 'i' } },
                                { address: { $regex: key[3], $options: 'i' } },
                                { work_description: { $regex: key[3], $options: 'i' } },
                                { turnover: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                { alternate_email: { $regex: key[3], $options: 'i' } },
                                { lead_type: { $regex: key[3], $options: 'i' } },

                                { lead_source: { $regex: key[3], $options: 'i' } },
                                { last_remark: { $regex: key[3], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
        }
        else if (showonlycardleads) {
            if (key.length == 1 || key.length > 4) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $or: [
                        { name: { $regex: key[0], $options: 'i' } },
                        { customer_name: { $regex: key[0], $options: 'i' } },
                        { customer_designation: { $regex: key[0], $options: 'i' } },
                        { mobile: { $regex: key[0], $options: 'i' } },
                        { email: { $regex: key[0], $options: 'i' } },
                        { country: { $regex: key[0], $options: 'i' } },
                        { address: { $regex: key[0], $options: 'i' } },
                        { work_description: { $regex: key[0], $options: 'i' } },
                        { turnover: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                        { alternate_email: { $regex: key[0], $options: 'i' } },
                        { lead_type: { $regex: key[0], $options: 'i' } },
                        { lead_source: { $regex: key[0], $options: 'i' } },
                        { last_remark: { $regex: key[0], $options: 'i' } },
                        { city: { $regex: key[0], $options: 'i' } },
                        { state: { $regex: key[0], $options: 'i' } },
                    ]

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 2) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 3) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 4) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[3], $options: 'i' } },
                                { customer_name: { $regex: key[3], $options: 'i' } },
                                { customer_designation: { $regex: key[3], $options: 'i' } },
                                { mobile: { $regex: key[3], $options: 'i' } },
                                { email: { $regex: key[3], $options: 'i' } },
                                { country: { $regex: key[3], $options: 'i' } },
                                { address: { $regex: key[3], $options: 'i' } },
                                { work_description: { $regex: key[3], $options: 'i' } },
                                { turnover: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                { alternate_email: { $regex: key[3], $options: 'i' } },
                                { lead_type: { $regex: key[3], $options: 'i' } },
                                { lead_source: { $regex: key[3], $options: 'i' } },
                                { last_remark: { $regex: key[3], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
        }
        else {
            if (key.length == 1 || key.length > 4) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $or: [
                        { name: { $regex: key[0], $options: 'i' } },
                        { customer_name: { $regex: key[0], $options: 'i' } },
                        { customer_designation: { $regex: key[0], $options: 'i' } },
                        { mobile: { $regex: key[0], $options: 'i' } },
                        { email: { $regex: key[0], $options: 'i' } },
                        { country: { $regex: key[0], $options: 'i' } },
                        { address: { $regex: key[0], $options: 'i' } },
                        { work_description: { $regex: key[0], $options: 'i' } },
                        { turnover: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                        { alternate_email: { $regex: key[0], $options: 'i' } },
                        { lead_type: { $regex: key[0], $options: 'i' } },
                        { lead_source: { $regex: key[0], $options: 'i' } },
                        { last_remark: { $regex: key[0], $options: 'i' } },
                        { city: { $regex: key[0], $options: 'i' } },
                        { state: { $regex: key[0], $options: 'i' } },
                    ]

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 2) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 3) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 4) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[3], $options: 'i' } },
                                { customer_name: { $regex: key[3], $options: 'i' } },
                                { customer_designation: { $regex: key[3], $options: 'i' } },
                                { mobile: { $regex: key[3], $options: 'i' } },
                                { email: { $regex: key[3], $options: 'i' } },
                                { country: { $regex: key[3], $options: 'i' } },
                                { address: { $regex: key[3], $options: 'i' } },
                                { work_description: { $regex: key[3], $options: 'i' } },
                                { turnover: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                { alternate_email: { $regex: key[3], $options: 'i' } },
                                { lead_type: { $regex: key[3], $options: 'i' } },
                                { lead_source: { $regex: key[3], $options: 'i' } },
                                { last_remark: { $regex: key[3], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }

        }

        let count = leads.length
        leads = leads.slice((page - 1) * limit, limit * page)

        result = leads.map((lead) => {
            return {
                _id: lead._id,
                name: lead.name,
                customer_name: lead.customer_name,
                customer_designation: lead.customer_designation,
                mobile: lead.mobile,
                gst: lead.gst,
                has_card: lead.has_card,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                uploaded_bills: lead.uploaded_bills || 0,
                last_remark: lead.last_remark || "",
                country: lead.country,
                address: lead.address,
                work_description: lead.work_description,
                turnover: lead.turnover,
                alternate_mobile1: lead.alternate_mobile1,
                alternate_mobile2: lead.alternate_mobile2,
                alternate_email: lead.alternate_email,
                lead_type: lead.lead_type,
                stage: lead.stage,
                lead_source: lead.lead_source,
                visiting_card: lead.visiting_card?.public_url || "",
                referred_party_name: lead.referred_party && lead.referred_party.name,
                referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
            }
        })

        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })

}
export const CreateLead = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    let { mobile, remark, alternate_mobile1, alternate_mobile2 } = body as CreateOrEditLeadDto

    // validations
    if (!mobile)
        return res.status(400).json({ message: "provide primary mobile number" });

    if (await ReferredParty.findOne({ mobile: mobile }))
        return res.status(400).json({ message: "our refer party exists with this mobile" });
    let uniqueNumbers = []
    if (mobile)
        uniqueNumbers.push(mobile)
    if (alternate_mobile1)
        uniqueNumbers.push(alternate_mobile1)
    if (alternate_mobile2)
        uniqueNumbers.push(alternate_mobile2)

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);

    if (uniqueNumbers[0] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { alternate_mobile1: uniqueNumbers[0] }, { alternate_mobile2: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { alternate_mobile1: uniqueNumbers[1] }, { alternate_mobile2: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { alternate_mobile1: uniqueNumbers[2] }, { alternate_mobile2: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })

    let visiting_card: Asset | undefined = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `crm/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            visiting_card = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    let state = "unknown";
    if (body.state && body.state != "") state = body.state
    let city = "unknown";
    if (body.city && body.city != "") city = body.city
    let lead = new Lead({
        ...body,
        stage: 'open',
        state: state,
        last_remark: remark || "",
        city: city,
        visiting_card: visiting_card,
        mobile: uniqueNumbers[0] || null,
        alternate_mobile1: uniqueNumbers[1] || null,
        alternate_mobile2: uniqueNumbers[2] || null,
        created_by: req.user,
        updated_by: req.user,
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
    })
    if (remark) {
        let new_remark = new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        })
        await new_remark.save()
    }

    await lead.save()

    return res.status(200).json("lead created")
}
export const UpdateLead = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const { mobile, remark, alternate_mobile1, alternate_mobile2 } = body as CreateOrEditLeadDto

    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    // validations
    if (!mobile)
        return res.status(400).json({ message: "provide primary mobile number" });

    let uniqueNumbers = []
    if (mobile) {
        if (mobile === lead.mobile) {
            uniqueNumbers[0] = lead.mobile
        }
        if (mobile !== lead.mobile) {
            uniqueNumbers[0] = mobile
        }
    }
    if (alternate_mobile1) {
        if (alternate_mobile1 === lead.alternate_mobile1) {
            uniqueNumbers[1] = lead.alternate_mobile1
        }
        if (alternate_mobile1 !== lead.alternate_mobile1) {
            uniqueNumbers[1] = alternate_mobile1
        }
    }
    if (alternate_mobile2) {
        if (alternate_mobile2 === lead.alternate_mobile2) {
            uniqueNumbers[2] = lead.alternate_mobile2
        }
        if (alternate_mobile2 !== lead.alternate_mobile2) {
            uniqueNumbers[2] = alternate_mobile2
        }
    }

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);


    if (uniqueNumbers[0] && uniqueNumbers[0] !== lead.mobile && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { alternate_mobile1: uniqueNumbers[0] }, { alternate_mobile2: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && uniqueNumbers[1] !== lead.alternate_mobile1 && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { alternate_mobile1: uniqueNumbers[1] }, { alternate_mobile2: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && uniqueNumbers[2] !== lead.alternate_mobile2 && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { alternate_mobile1: uniqueNumbers[2] }, { alternate_mobile2: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })


    let visiting_card = lead?.visiting_card;
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `crm/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            if (lead.visiting_card?._id)
                await destroyFile(lead.visiting_card._id)
            visiting_card = doc
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    if (remark)
        await new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        }).save()
    let state = "unknown";
    if (body.state && body.state != "") state = body.state
    let city = "unknown";
    if (body.city && body.city != "") city = body.city
    await Lead.findByIdAndUpdate(lead._id, {
        ...body,
        last_remark: remark ? remark : lead.last_remark,
        city: city,
        state: state,
        mobile: uniqueNumbers[0] || null,
        alternate_mobile1: uniqueNumbers[1] || null,
        alternate_mobile2: uniqueNumbers[2] || null,
        visiting_card: visiting_card,
        updated_by: req.user,
        updated_at: new Date(Date.now())
    })

    return res.status(200).json({ message: "lead updated" })
}
export const DeleteLead = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    let remarks = await Remark.find({ lead: lead._id })
    remarks.map(async (remark) => {
        await remark.remove()
    })
    await lead.remove()
    if (lead.visiting_card && lead.visiting_card._id)
        await destroyFile(lead.visiting_card?._id)

    return res.status(200).json({ message: "lead and related remarks are deleted" })
}
export const BulkLeadUpdateFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateAndUpdatesLeadFromExcelDto[] = []
    let statusText: string = ""
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: CreateAndUpdatesLeadFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        let checkednumbers: string[] = []
        for (let i = 0; i < workbook_response.length; i++) {
            let lead = workbook_response[i]
            let new_: IUser[] = []
            let mobile: string | null = lead.mobile
            let stage: string | null = lead.stage
            let leadtype: string | null = lead.lead_type
            let source: string | null = lead.lead_source
            let city: string | null = lead.city
            let state: string | null = lead.state
            let alternate_mobile1: string | null = lead.alternate_mobile1
            let alternate_mobile2: string | null = lead.alternate_mobile2
            let uniqueNumbers: string[] = []
            let validated = true

            //important
            if (!mobile) {
                validated = false
                statusText = "required mobile"
            }

            if (mobile && Number.isNaN(Number(mobile))) {
                validated = false
                statusText = "invalid mobile"
            }
            if (alternate_mobile1 && Number.isNaN(Number(alternate_mobile1))) {
                validated = false
                statusText = "invalid alternate mobile 1"
            }
            if (alternate_mobile2 && Number.isNaN(Number(alternate_mobile2))) {
                validated = false
                statusText = "invalid alternate mobile 2"
            }
            if (alternate_mobile1 && String(alternate_mobile1).length !== 10)
                alternate_mobile1 = null
            if (alternate_mobile2 && String(alternate_mobile2).length !== 10)
                alternate_mobile2 = null

            if (mobile && String(mobile).length !== 10) {
                validated = false
                statusText = "invalid mobile"
            }



            //duplicate mobile checker
            if (lead._id && isMongoId(String(lead._id))) {
                let targetLead = await Lead.findById(lead._id)
                if (targetLead) {
                    if (mobile && mobile === targetLead?.mobile) {
                        uniqueNumbers.push(targetLead?.mobile)
                    }
                    if (alternate_mobile1 && alternate_mobile1 === targetLead?.alternate_mobile1) {
                        uniqueNumbers.push(targetLead?.alternate_mobile1)
                    }
                    if (alternate_mobile2 && alternate_mobile2 === targetLead?.alternate_mobile2) {
                        uniqueNumbers.push(targetLead?.alternate_mobile2)
                    }

                    if (mobile && mobile !== targetLead?.mobile) {
                        let ld = await Lead.findOne({ $or: [{ mobile: mobile }, { alternate_mobile1: mobile }, { alternate_mobile2: mobile }] })
                        if (!ld && !checkednumbers.includes(mobile)) {
                            uniqueNumbers.push(mobile)
                            checkednumbers.push(mobile)
                        }
                    }

                    if (alternate_mobile1 && alternate_mobile1 !== targetLead?.alternate_mobile1) {
                        let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile1 }, { alternate_mobile1: alternate_mobile1 }, { alternate_mobile2: alternate_mobile1 }] })
                        if (!ld && !checkednumbers.includes(alternate_mobile1)) {
                            uniqueNumbers.push(alternate_mobile1)
                            checkednumbers.push(alternate_mobile1)
                        }
                    }

                    if (alternate_mobile2 && alternate_mobile2 !== targetLead?.alternate_mobile2) {
                        let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile2 }, { alternate_mobile1: alternate_mobile2 }, { alternate_mobile2: alternate_mobile2 }] })
                        if (!ld && !checkednumbers.includes(alternate_mobile2)) {
                            uniqueNumbers.push(alternate_mobile2)
                            checkednumbers.push(alternate_mobile2)
                        }
                    }
                }
            }

            if (!lead._id || !isMongoId(String(lead._id))) {
                if (mobile) {
                    let ld = await Lead.findOne({ $or: [{ mobile: mobile }, { alternate_mobile1: mobile }, { alternate_mobile2: mobile }] })
                    if (ld) {
                        validated = false
                        statusText = "duplicate"
                    }
                    if (!ld) {
                        uniqueNumbers.push(mobile)
                    }
                }

                if (alternate_mobile1) {
                    let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile1 }, { alternate_mobile1: alternate_mobile1 }, { alternate_mobile2: alternate_mobile1 }] })
                    if (ld) {
                        validated = false
                        statusText = "duplicate"
                    }
                    if (!ld) {
                        uniqueNumbers.push(alternate_mobile1)
                    }
                }
                if (alternate_mobile2) {
                    let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile2 }, { alternate_mobile1: alternate_mobile2 }, { alternate_mobile2: alternate_mobile2 }] })
                    if (ld) {
                        validated = false
                        statusText = "duplicate"
                    }
                    if (!ld) {
                        uniqueNumbers.push(alternate_mobile2)
                    }
                }

            }

            if (validated && uniqueNumbers.length > 0) {
                //update and create new nead
                if (lead._id && isMongoId(String(lead._id))) {
                    await Lead.findByIdAndUpdate(lead._id, {
                        ...lead,
                        stage: stage ? stage : "unknown",
                        lead_type: leadtype ? leadtype : "unknown",
                        lead_source: source ? source : "unknown",
                        city: city ? city : "unknown",
                        state: state ? state : "unknown",
                        mobile: uniqueNumbers[0],
                        alternate_mobile1: uniqueNumbers[1] || null,
                        alternate_mobile2: uniqueNumbers[2] || null,
                        updated_by: req.user,
                        updated_at: new Date(Date.now())
                    })
                    statusText = "updated"
                }
                if (!lead._id || !isMongoId(String(lead._id))) {
                    let newlead = new Lead({
                        ...lead,
                        _id: new Types.ObjectId(),
                        stage: stage ? stage : "unknown",
                        state: state ? state : "unknown",
                        lead_type: leadtype ? leadtype : "unknown",
                        lead_source: source ? source : "unknown",
                        city: city ? city : "unknown",
                        mobile: uniqueNumbers[0] || null,
                        alternate_mobile1: uniqueNumbers[1] || null,
                        alternate_mobile2: uniqueNumbers[2] || null,
                        created_by: req.user,
                        updated_by: req.user,
                        updated_at: new Date(Date.now()),
                        created_at: new Date(Date.now())
                    })

                    await newlead.save()
                    statusText = "created"
                }
            }

            result.push({
                ...lead,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}
export const GetRefers = async (req: Request, res: Response, next: NextFunction) => {
    let refers: IReferredParty[] = []
    let result: GetReferDto[] = []
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    refers = await ReferredParty.find({ 'state': { $in: states }, 'city': { $in: cities } }).sort('name')

    result = refers.map((r) => {
        return {
            _id: r._id,
            name: r.name,
            last_remark: r.last_remark,
            refers: 0,
            uploaded_bills: r.uploaded_bills,
            customer_name: r.customer_name,
            mobile: r.mobile,
            mobile2: r.mobile2,
            mobile3: r.mobile3,
            address: r.address,
            gst: r.gst,
            city: r.city,
            state: r.state,
            convertedfromlead: r.convertedfromlead,
            created_at: moment(r.created_at).format("DD/MM/YYYY"),
            updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
            updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
        }
    })

    return res.status(200).json(refers);
}
export const GetPaginatedRefers = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let result: GetReferDto[] = []
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let parties: IReferredParty[] = []
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        parties = await ReferredParty.find({ state: { $in: states }, city: { $in: cities } }).populate('created_by').populate('updated_by').sort('-updated_at')
        let count = parties.length
        parties = parties.slice((page - 1) * limit, limit * page)
        result = parties.map((r) => {
            return {
                _id: r._id,
                name: r.name,
                refers: r.refers,
                last_remark: r.last_remark,
                customer_name: r.customer_name,
                mobile: r.mobile,
                mobile2: r.mobile2,
                mobile3: r.mobile3,
                uploaded_bills: r.uploaded_bills,
                address: r.address,
                gst: r.gst,
                city: r.city,
                state: r.state,
                convertedfromlead: r.convertedfromlead,
                created_at: moment(r.created_at).format("DD/MM/YYYY"),
                updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
            }
        })
        return res.status(200).json({
            result: result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else return res.status(400).json({ message: 'bad request' })

}
export const FuzzySearchRefers = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let key = String(req.query.key).split(",")
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let result: GetReferDto[] = []
    if (!key)
        return res.status(500).json({ message: "bad request" })
    let parties: IReferredParty[] = []
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (key.length == 1 || key.length > 4) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },
                $or: [
                    { name: { $regex: key[0], $options: 'i' } },
                    { gst: { $regex: key[0], $options: 'i' } },
                    { customer_name: { $regex: key[0], $options: 'i' } },
                    { mobile: { $regex: key[0], $options: 'i' } },
                    { mobile2: { $regex: key[0], $options: 'i' } },
                    { mobile3: { $regex: key[0], $options: 'i' } },
                    { city: { $regex: key[0], $options: 'i' } },
                    { state: { $regex: key[0], $options: 'i' } },
                ]
            }).populate('created_by').populate('updated_by').sort('-updated_at')

        }
        if (key.length == 2) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },

                $and: [
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    }
                ]
                ,

            }
            ).populate('created_by').populate('updated_by').sort('-updated_at')

        }

        if (key.length == 3) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },

                $and: [
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    }
                ]
                ,

            }
            ).populate('created_by').populate('updated_by').sort('-updated_at')

        }
        if (key.length == 4) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },
                $and: [
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    }
                ]
                ,

            }
            ).populate('created_by').populate('updated_by').sort('-updated_at')

        }

        let count = parties.length
        parties = parties.slice((page - 1) * limit, limit * page)
        result = parties.map((r) => {
            return {
                _id: r._id,
                name: r.name,
                refers: r.refers,
                last_remark: r?.last_remark || "",
                customer_name: r.customer_name,
                uploaded_bills: r.uploaded_bills,
                mobile: r.mobile,
                mobile2: r.mobile2,
                mobile3: r.mobile3,
                address: r.address,
                gst: r.gst,
                city: r.city,
                state: r.state,
                convertedfromlead: r.convertedfromlead,
                created_at: moment(r.created_at).format("DD/MM/YYYY"),
                updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
            }
        })
        return res.status(200).json({
            result: result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }

    else
        return res.status(400).json({ message: "bad request" })

}
export const CreateReferParty = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const { name, customer_name, city, state, gst, mobile, mobile2, mobile3 } = body as CreateOrEditReferDto
    if (!name || !city || !state || !mobile || !gst) {
        return res.status(400).json({ message: "please fill all required fields" })
    }

    let uniqueNumbers = []
    if (mobile)
        uniqueNumbers.push(mobile)
    if (mobile2)
        uniqueNumbers.push(mobile2)
    if (mobile3)
        uniqueNumbers.push(mobile3)

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);

    if (uniqueNumbers[0] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { mobile2: uniqueNumbers[0] }, { mobile3: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { mobile2: uniqueNumbers[1] }, { mobile3: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { mobile2: uniqueNumbers[2] }, { mobile3: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })


    let resultParty = await ReferredParty.findOne({ $or: [{ gst: String(gst).toLowerCase().trim() }, { mobile: String(mobile).toLowerCase().trim() }] })
    if (resultParty) {
        return res.status(400).json({ message: "already exists  gst" })
    }


    let party = await new ReferredParty({
        name, customer_name, city, state,
        mobile: uniqueNumbers[0] || null,
        mobile2: uniqueNumbers[1] || null,
        mobile3: uniqueNumbers[2] || null,
        gst,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(party)
}
export const UpdateReferParty = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let body = JSON.parse(req.body.body)
    const { name, customer_name, city, state, mobile, mobile2, mobile3, gst } = body as CreateOrEditReferDto
    if (!name || !city || !state || !mobile) {
        return res.status(400).json({ message: "please fill all required fields" })
    }
    let party = await ReferredParty.findById(id)

    if (!party)
        return res.status(404).json({ message: "party not found" })
    if (gst !== party.gst) {
        let resultParty = await ReferredParty.findOne({ gst: gst });
        if (resultParty) {
            return res.status(400).json({ message: "already exists this  gst" })
        }
    }
    let uniqueNumbers = []
    if (mobile) {
        if (mobile === party.mobile) {
            uniqueNumbers[0] = party.mobile
        }
        if (mobile !== party.mobile) {
            uniqueNumbers[0] = mobile
        }
    }
    if (mobile2) {
        if (mobile2 === party.mobile2) {
            uniqueNumbers[1] = party.mobile2
        }
        if (mobile2 !== party.mobile2) {
            uniqueNumbers[1] = mobile2
        }
    }
    if (mobile3) {
        if (mobile3 === party.mobile3) {
            uniqueNumbers[2] = party.mobile3
        }
        if (mobile3 !== party.mobile3) {
            uniqueNumbers[2] = mobile3
        }
    }

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);


    if (uniqueNumbers[0] && uniqueNumbers[0] !== party.mobile && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { mobile2: uniqueNumbers[0] }, { mobile3: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && uniqueNumbers[1] !== party.mobile2 && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { mobile2: uniqueNumbers[1] }, { mobile3: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && uniqueNumbers[2] !== party.mobile3 && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { mobile2: uniqueNumbers[2] }, { mobile3: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })

    await ReferredParty.findByIdAndUpdate(id, {
        name, customer_name, city, state,
        mobile: uniqueNumbers[0] || null,
        mobile2: uniqueNumbers[1] || null,
        mobile3: uniqueNumbers[2] || null,
        gst,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    })
    return res.status(200).json({ message: "updated" })
}
export const DeleteReferParty = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let party = await ReferredParty.findById(id)
    if (!party)
        return res.status(404).json({ message: "party not found" })
    await ReferredParty.findByIdAndDelete(id)
    return res.status(200).json({ message: "deleted" })
}
export const BulkDeleteUselessLeads = async (req: Request, res: Response, next: NextFunction) => {
    const { leads_ids } = req.body as { leads_ids: string[] }
    for (let i = 0; i <= leads_ids.length; i++) {
        let lead = await Lead.findById(leads_ids[i])
        if (lead && lead.stage == 'useless') {
            let remarks = await Remark.find({ lead: lead._id })
            remarks.map(async (remark) => {
                await remark.remove()
            })
            await lead.remove()
            if (lead.visiting_card && lead.visiting_card._id)
                await destroyFile(lead.visiting_card?._id)
        }
    }
    return res.status(200).json({ message: "lead and related remarks are deleted" })
}
export const BulkReferUpdateFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateOrEditReferFromExcelDto[] = []
    let statusText: string = ""
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: CreateOrEditReferFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        for (let i = 0; i < workbook_response.length; i++) {
            let refer = workbook_response[i]
            let name: string | null = refer.name
            let mobile: string | null = refer.mobile
            let city: string | null = refer.city
            let state: string | null = refer.state
            let gst: string | null = refer.gst

            let validated = true

            //important
            if (!mobile) {
                validated = false
                statusText = "required mobile"
            }
            if (!name) {
                validated = false
                statusText = "required name"
            }
            if (!city) {
                validated = false
                statusText = "required city"
            }
            if (!state) {
                validated = false
                statusText = "required state"
            }
            if (!gst) {
                validated = false
                statusText = "required gst"
            }
            if (gst && gst.length !== 15) {
                validated = false
                statusText = "invalid gst"
            }
            if (mobile && Number.isNaN(Number(mobile))) {
                validated = false
                statusText = "invalid mobile"
            }


            if (mobile && String(mobile).length !== 10) {
                validated = false
                statusText = "invalid mobile"
            }
            //update and create new nead
            if (validated) {
                if (refer._id && isMongoId(String(refer._id))) {
                    let targetLead = await ReferredParty.findById(refer._id)
                    if (targetLead) {
                        if (targetLead.mobile != String(mobile).toLowerCase().trim() || targetLead.gst !== String(gst).toLowerCase().trim()) {
                            let refertmp = await ReferredParty.findOne({ mobile: String(mobile).toLowerCase().trim() })
                            let refertmp2 = await ReferredParty.findOne({ gst: String(gst).toLowerCase().trim() })

                            if (refertmp) {
                                validated = false
                                statusText = "exists mobile"
                            }
                            if (refertmp2) {
                                validated = false
                                statusText = "exists  gst"
                            }
                            else {
                                await ReferredParty.findByIdAndUpdate(refer._id, {
                                    ...refer,
                                    city: city ? city : "unknown",
                                    state: state ? state : "unknown",
                                    updated_by: req.user,
                                    updated_at: new Date(Date.now())
                                })
                                statusText = "updated"
                            }
                        }
                    }
                }

                if (!refer._id || !isMongoId(String(refer._id))) {
                    let refertmp = await ReferredParty.findOne({
                        $or: [
                            { mobile: String(mobile).toLowerCase().trim() },
                            { gst: String(gst).toLowerCase().trim() }
                        ]
                    })
                    if (refertmp) {
                        validated = false
                        statusText = "duplicate mobile or gst"
                    }
                    else {
                        let referParty = new ReferredParty({
                            ...refer,
                            _id: new Types.ObjectId(),
                            city: city ? city : "unknown",
                            state: state ? state : "unknown",
                            mobile: refer.mobile,
                            created_by: req.user,
                            updated_by: req.user,
                            updated_at: new Date(Date.now()),
                            created_at: new Date(Date.now()),
                            remarks: undefined
                        })

                        await referParty.save()
                        statusText = "created"
                    }

                }
            }
            result.push({
                ...refer,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}
export const UpdateRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, remind_date } = req.body as CreateOrEditRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const user = await User.findById(req.user?._id)
    if (!user)
        return res.status(403).json({ message: "please login to access this resource" })
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let rremark = await Remark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    rremark.remark = remark
    if (remind_date)
        rremark.remind_date = new Date(remind_date)
    await rremark.save()
    await Lead.findByIdAndUpdate(rremark.lead, { last_remark: remark })
    return res.status(200).json({ message: "remark updated successfully" })
}
export const DeleteRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let rremark = await Remark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}
export const GetMyReminders = async (req: Request, res: Response, next: NextFunction) => {
    let previous_date = new Date()
    let day = previous_date.getDate() - 100
    previous_date.setDate(day)
    let remarks = await Remark.find({ created_at: { $lte: new Date(), $gte: previous_date } }).populate('created_by').populate('updated_by').populate({
        path: 'lead',
        populate: [
            {
                path: 'created_by',
                model: 'User'
            },
            {
                path: 'updated_by',
                model: 'User'
            },
            {
                path: 'referred_party',
                model: 'ReferredParty'
            }
        ]
    }).sort('-created_at')
    let result: GetActivitiesOrRemindersDto[] = []
    let ids: string[] = []
    let filteredRemarks: IRemark[] = []

    remarks.forEach((rem) => {
        if (rem && rem.lead && !ids.includes(rem.lead._id)) {
            ids.push(rem.lead._id);
            if (rem.created_by._id.valueOf() == req.user?._id && rem.remind_date && new Date(rem.remind_date).getDate() <= new Date().getDate() && new Date(rem.remind_date).getMonth() <= new Date().getMonth() && new Date(rem.remind_date).getFullYear() <= new Date().getFullYear())
                filteredRemarks.push(rem);
        }
    })
    filteredRemarks.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        //@ts-ignore
        return new Date(b.remind_date) - new Date(a.remind_date);
    });

    result = filteredRemarks.map((rem) => {
        return {
            _id: rem._id,
            remark: rem.remark,
            created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
            remind_date: rem.remind_date && moment(rem.remind_date).format("DD/MM/YYYY"),
            created_by: { id: rem.created_by._id, value: rem.created_by.username, label: rem.created_by.username },
            lead_id: rem.lead && rem.lead._id,
            name: rem.lead && rem.lead.name,
            customer_name: rem.lead && rem.lead.customer_name,
            customer_designation: rem.lead && rem.lead.customer_designation,
            mobile: rem.lead && rem.lead.mobile,
            gst: rem.lead && rem.lead.gst,
            has_card: rem.lead && rem.lead.has_card,
            email: rem.lead && rem.lead.email,
            city: rem.lead && rem.lead.city,
            state: rem.lead && rem.lead.state,
            country: rem.lead && rem.lead.country,
            address: rem.lead && rem.lead.address,
            work_description: rem.lead && rem.lead.work_description,
            turnover: rem.lead && rem.lead.turnover,
            alternate_mobile1: rem.lead && rem.lead.alternate_mobile1,
            alternate_mobile2: rem.lead && rem.lead.alternate_mobile2,
            alternate_email: rem.lead && rem.lead.alternate_email,
            lead_type: rem.lead && rem.lead.lead_type,
            stage: rem.lead && rem.lead.stage,
            lead_source: rem.lead && rem.lead.lead_source,
            visiting_card: rem.lead && rem.lead.visiting_card?.public_url || "",
            referred_party_name: rem.lead && rem.lead.referred_party?.name || "",
            referred_party_mobile: rem.lead && rem.lead.referred_party?.mobile || "",
            referred_date: rem.lead && rem.lead.referred_date && moment(rem.lead && rem.lead.referred_date).format("DD/MM/YYYY") || "",
        }
    })


    return res.status(200).json(result)
}
export const GetReferRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "refer id not valid" })
    let refer = await ReferredParty.findById(id);
    if (!refer) {
        return res.status(404).json({ message: "refer not found" })
    }
    let remarks: IRemark[] = []
    let result: GetRemarksDto[] = []
    remarks = await Remark.find({ refer: refer._id }).populate('created_by').populate('updated_by').sort('-created_at')
    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            refer_id: refer?._id,
            refer_name: refer?.name,
            refer_mobile: refer?.mobile,
            remind_date: r.remind_date && moment(r.remind_date).format("DD/MM/YYYY"),
            created_date: moment(r.created_at).format("DD/MM/YYYY"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
        }
    })
    return res.json(result)
}
export const GetRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    let remarks: IRemark[] = []
    let result: GetRemarksDto[] = []
    remarks = await Remark.find({ lead: lead._id }).populate('created_by').populate('updated_by').populate({
        path: 'lead',
        populate: [
            {
                path: 'created_by',
                model: 'User'
            },
            {
                path: 'updated_by',
                model: 'User'
            },
            {
                path: 'referred_party',
                model: 'ReferredParty'
            }
        ]
    }).sort('-created_at')
    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            lead_id: lead?._id,
            lead_name: lead?.name,
            lead_mobile: lead?.mobile,
            remind_date: r.remind_date && moment(r.remind_date).format("DD/MM/YYYY"),
            created_date: moment(r.created_at).format("lll"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
        }
    })
    return res.json(result)
}
export const GetActivitiesTopBarDetails = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetActivitiesTopBarDetailsDto[] = []
    let start_date = req.query.start_date
    let id = req.query.id
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    dt2.setHours(0)
    dt2.setMinutes(0)
    //@ts-ignore
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let stages = await Stage.find();
    let remarks: IRemark[] = []
    if (req.user?.is_admin && !id) {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('lead')

    }

    else if (ids && ids.length > 0 && !id) {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).populate('lead')
    }
    else if (!id) {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('lead')
    }
    else {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('lead')
    }
    result.push({
        stage: "Activities", value: remarks.length
    });
    for (let i = 0; i <= stages.length; i++) {
        let stage = stages[i];
        if (stage) {
            let remarkscount = remarks.filter((r) => {
                if (r.lead && r.lead.stage === stage.stage)
                    return r;
            }).length;
            result.push({
                stage: stage.stage, value: remarkscount
            });
        }
    }
    return res.status(200).json(result)

}
export const GetActivities = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let stage = req.query.stage
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let remarks: IRemark[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    dt2.setHours(0)
    dt2.setMinutes(0)
    //@ts-ignore
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetActivitiesOrRemindersDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').populate({
                    path: 'lead',
                    populate: [
                        {
                            path: 'created_by',
                            model: 'User'
                        },
                        {
                            path: 'updated_by',
                            model: 'User'
                        },
                        {
                            path: 'referred_party',
                            model: 'ReferredParty'
                        }
                    ]
                }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).populate('created_by').populate('updated_by').populate({
                    path: 'lead',
                    populate: [
                        {
                            path: 'created_by',
                            model: 'User'
                        },
                        {
                            path: 'updated_by',
                            model: 'User'
                        },
                        {
                            path: 'referred_party',
                            model: 'ReferredParty'
                        }
                    ]
                }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).countDocuments()
            }
        }
        else if (!id) {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('created_by').populate('updated_by').populate({
                path: 'lead',
                populate: [
                    {
                        path: 'created_by',
                        model: 'User'
                    },
                    {
                        path: 'updated_by',
                        model: 'User'
                    },
                    {
                        path: 'referred_party',
                        model: 'ReferredParty'
                    }
                ]
            }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
        }

        else {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('created_by').populate('updated_by').populate({
                path: 'lead',
                populate: [
                    {
                        path: 'created_by',
                        model: 'User'
                    },
                    {
                        path: 'updated_by',
                        model: 'User'
                    },
                    {
                        path: 'referred_party',
                        model: 'ReferredParty'
                    }
                ]
            }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }
        if (stage !== 'undefined') {
            remarks = remarks.filter((r) => {
                if (r.lead)
                    return r.lead.stage == stage
            })

        }
        result = remarks.map((rem) => {
            return {
                _id: rem._id,
                remark: rem.remark,
                created_at: rem.created_at && moment(rem.created_at).format("LT"),
                remind_date: rem.remind_date && moment(rem.remind_date).format("DD/MM/YYYY"),
                created_by: { id: rem.created_by._id, value: rem.created_by.username, label: rem.created_by.username },
                lead_id: rem.lead && rem.lead._id,
                name: rem.lead && rem.lead.name,
                customer_name: rem.lead && rem.lead.customer_name,
                customer_designation: rem.lead && rem.lead.customer_designation,
                mobile: rem.lead && rem.lead.mobile,
                gst: rem.lead && rem.lead.gst,
                has_card: rem.lead && rem.lead.has_card,
                email: rem.lead && rem.lead.email,
                city: rem.lead && rem.lead.city,
                state: rem.lead && rem.lead.state,
                country: rem.lead && rem.lead.country,
                address: rem.lead && rem.lead.address,
                work_description: rem.lead && rem.lead.work_description,
                turnover: rem.lead && rem.lead.turnover,
                alternate_mobile1: rem.lead && rem.lead.alternate_mobile1,
                alternate_mobile2: rem.lead && rem.lead.alternate_mobile2,
                alternate_email: rem.lead && rem.lead.alternate_email,
                lead_type: rem.lead && rem.lead.lead_type,
                stage: rem.lead && rem.lead.stage,
                lead_source: rem.lead && rem.lead.lead_source,
                visiting_card: rem.lead && rem.lead.visiting_card?.public_url || "",
                referred_party_name: rem.lead && rem.lead.referred_party?.name || "",
                referred_party_mobile: rem.lead && rem.lead.referred_party?.mobile || "",
                referred_date: rem.lead && rem.lead.referred_party && moment(rem.lead.referred_date).format("DD/MM/YYYY") || "",

            }
        })
        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}
export const NewRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, remind_date, has_card, stage } = req.body as CreateOrEditRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const user = await User.findById(req.user?._id)
    if (!user)
        return res.status(403).json({ message: "please login to access this resource" })
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })

    let lead = await Lead.findById(id)
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }

    let new_remark = new Remark({
        remark,
        lead: lead,
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    if (remind_date)
        new_remark.remind_date = new Date(remind_date)
    await new_remark.save()

    if (has_card)
        lead.has_card = true
    else
        lead.has_card = false
    lead.stage = stage
    if (req.user) {
        lead.updated_by = req.user
        lead.updated_at = new Date(Date.now())
        lead.last_remark = remark
    }
    await lead.save()
    return res.status(200).json({ message: "new remark added successfully" })
}
export const GetNewRefers = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetReferDto[] = [];
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let parties: IReferredParty[] = []

    parties = await ReferredParty.find({ created_at: { $gte: dt1, $lt: dt2 }, convertedfromlead: true }).populate('created_by').populate('updated_by').sort('-created_at');

    result = parties.map((r) => {
        return {
            _id: r._id,
            name: r.name,
            refers: r.refers,
            last_remark: r.last_remark || "",
            customer_name: r.customer_name,
            mobile: r.mobile,
            mobile2: r.mobile2,
            mobile3: r.mobile3,
            uploaded_bills: r.uploaded_bills,
            address: r.address,
            gst: r.gst,
            city: r.city,
            state: r.state,
            convertedfromlead: r.convertedfromlead,
            created_at: moment(r.created_at).format("DD/MM/YYYY"),
            updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
            updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
        }
    })
    return res.status(200).json(result)
}
export const GetAssignedRefers = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let result: GetLeadDto[] = []
    let leads: ILead[] = []

    leads = await Lead.find({ referred_date: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').populate('referred_party').sort('-referred_date')
    result = leads.map((lead) => {
        return {
            _id: lead._id,
            name: lead.name,
            customer_name: lead.customer_name,
            customer_designation: lead.customer_designation,
            mobile: lead.mobile,
            gst: lead.gst,
            uploaded_bills: lead.uploaded_bills,
            has_card: lead.has_card,
            email: lead.email,
            city: lead.city,
            state: lead.state,
            country: lead.country,
            address: lead.address,
            work_description: lead.work_description,
            turnover: lead.turnover,
            alternate_mobile1: lead.alternate_mobile1,
            alternate_mobile2: lead.alternate_mobile2,
            alternate_email: lead.alternate_email,
            lead_type: lead.lead_type,
            stage: lead.stage,
            lead_source: lead.lead_source,
            visiting_card: lead.visiting_card?.public_url || "",
            referred_party_name: lead.referred_party && lead.referred_party.name,
            referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
            referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
            last_remark: lead.last_remark || "",
            created_at: moment(lead.created_at).format("DD/MM/YYYY"),
            updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
            created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
            updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
        }
    })
    return res.status(200).json(result)
}
export const CreateBill = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const {
        items,
        lead,
        refer,
        remarks,
        bill_no,
        bill_date } = body as CreateOrEditBillDto
    console.log(body, bill_no)
    if (!bill_no || !bill_date || !items || !remarks) {
        return res.status(400).json({ message: "please fill all required fields" })
    }
    let bill;
    if (lead) {
        if (await Bill.findOne({ lead: lead, bill_no: bill_no.toLowerCase() }))
            return res.status(400).json({ message: "already exists this bill no" })
        bill = new Bill({
            bill_no, lead: lead, bill_date: new Date(bill_date), remarks,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })

    }
    else {
        if (await Bill.findOne({ refer: refer, bill_no: bill_no.toLowerCase() }))
            return res.status(400).json({ message: "already exists this bill no" })

        bill = new Bill({
            bill_no, refer: refer, bill_date: new Date(bill_date), remarks,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })
    }
    let document: Asset | undefined = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `bills/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            document = doc
            if (document)
                bill.billphoto = document;
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        await new BillItem({
            article: item.article,
            rate: item.rate,
            qty: item.qty,
            bill: bill._id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
    }
    await bill.save()
    if (lead) {
        let count = await Bill.find({ lead: lead }).countDocuments()
        await Lead.findByIdAndUpdate(lead, { uploaded_bills: count })
    }
    if (refer) {
        let count = await Bill.find({ refer: refer }).countDocuments()
        await ReferredParty.findByIdAndUpdate(refer, { uploaded_bills: count })
    }
    return res.status(201).json({ message: "success" })

}
export const UpdateBill = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let bill = await Bill.findById(id)
    if (!bill)
        return res.status(404).json({ message: "bill not found" })
    let body = JSON.parse(req.body.body)
    const { items, bill_no, bill_date, remarks } = body as CreateOrEditBillDto

    if (!bill_no || !bill_date || !items || !remarks) {
        return res.status(400).json({ message: "please fill all required fields" })
    }

    if (bill.bill_no !== bill_no.toLowerCase())
        if (await Bill.findOne({ bill_no: bill_no.toLowerCase() }))
            return res.status(400).json({ message: "already exists this bill no" })
    let document: Asset | undefined = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `bills/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            document = doc
            if (bill.billphoto)
                await destroyFile(bill.billphoto._id)
            if (document)
                bill.billphoto = document;
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }


    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let existBill = await BillItem.findById(item._id)
        if (existBill) {
            await BillItem.findByIdAndUpdate(id, {
                article: item.article,
                rate: item.rate,
                qty: item.qty,
                bill: bill._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            })
        }
        else {
            await new BillItem({
                article: item.article,
                rate: item.rate,
                qty: item.qty,
                bill: bill._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
        }

    }
    bill.bill_no = bill_no;
    bill.bill_date = new Date(bill_date);
    bill.remarks = remarks;
    bill.updated_at = new Date();
    if (req.user)
        bill.updated_by = req.user
    await bill.save()
    return res.status(200).json({ message: "updated" })

}
export const DeleteBill = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "bill id not valid" })
    let bill = await Bill.findById(id);
    if (!bill) {
        return res.status(404).json({ message: "bill not found" })
    }
    if (bill.billphoto)
        await destroyFile(bill.billphoto._id)
    await bill.remove();
    if (bill.lead) {
        let count = await Bill.find({ lead: bill.lead }).countDocuments()
        await Lead.findByIdAndUpdate(bill.lead, { uploaded_bills: count })
    }
    if (bill.refer) {
        let count = await Bill.find({ refer: bill.refer }).countDocuments()
        await ReferredParty.findByIdAndUpdate(bill.refer, { uploaded_bills: count })
    }
    return res.status(200).json({ message: "bill deleted successfully" })
}
export const GetReferPartyBillsHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let refer = await ReferredParty.findById(id);
    if (!refer) {
        return res.status(404).json({ message: "refer not found" })
    }
    let bills: IBill[] = []
    let result: GetBillDto[] = []
    bills = await Bill.find({ refer: refer._id }).populate('created_by').populate('updated_by').populate('refer').sort('-bill_date')

    for (let i = 0; i < bills.length; i++) {
        let bill = bills[i]
        let billItems = await BillItem.find({ bill: bill._id }).populate('article').sort('-bill_date')
        result.push({
            _id: bill._id,
            bill_no: bill.bill_no,
            refer: { id: refer && refer._id, value: refer && refer.name, label: refer && refer.name },
            remarks: bill.remarks,
            billphoto: bill.billphoto?.public_url || "",
            items: billItems.map((i) => {
                return {
                    _id: i._id,
                    article: i.article._id,
                    qty: i.qty,
                    rate: i.rate
                }
            }),
            bill_date: bill.bill_date && moment(bill.bill_date).format("DD/MM/YYYY"),
            created_at: bill.created_at,
            updated_at: bill.updated_at,
            created_by: { id: bill.created_by._id, value: bill.created_by.username, label: bill.created_by.username },
            updated_by: { id: bill.updated_by._id, value: bill.updated_by.username, label: bill.updated_by.username }
        })
    }
    return res.json(result)
}
export const GetLeadPartyBillsHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    let bills: IBill[] = []
    let result: GetBillDto[] = []
    bills = await Bill.find({ lead: lead._id }).populate('created_by').populate('updated_by').populate('lead').sort('-bill_date')

    for (let i = 0; i < bills.length; i++) {
        let bill = bills[i]
        let billItems = await BillItem.find({ bill: bill._id }).populate('article').sort('-bill_date')
        result.push({
            _id: bill._id,
            bill_no: bill.bill_no,
            lead: { id: lead && lead._id, value: lead && lead.name, label: lead && lead.name },
            billphoto: bill.billphoto?.public_url || "",
            remarks: bill.remarks,
            items: billItems.map((i) => {
                return {
                    _id: i._id,
                    article: i.article._id,
                    qty: i.qty,
                    rate: i.rate
                }
            }),
            bill_date: bill.bill_date && moment(bill.bill_date).format("DD/MM/YYYY"),
            created_at: bill.created_at,
            updated_at: bill.updated_at,
            created_by: { id: bill.created_by._id, value: bill.created_by.username, label: bill.created_by.username },
            updated_by: { id: bill.updated_by._id, value: bill.updated_by.username, label: bill.updated_by.username }
        })
    }
    return res.json(result)
}
export const MergeTwoLeads = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { name, mobiles, city, stage, state, email, alternate_email, address, merge_refer, merge_bills, merge_remarks, source_lead_id } = req.body as CreateOrEditMergeLeadsDto
    let lead = await Lead.findById(id);
    let sourcelead = await Lead.findById(source_lead_id);

    if (!lead || !sourcelead)
        return res.status(404).json({ message: "leads not found" })

    await Lead.findByIdAndUpdate(id, {
        name: name,
        city: city,
        state: state,
        mobile: mobiles[0] || null,
        alternate_mobile1: mobiles[1] || null,
        alternate_mobile2: mobiles[2] || null,
        stage: stage,
        email: email,
        alternate_email: alternate_email,
        address: address
    });

    if (merge_refer) {
        let refer = await ReferredParty.findById(sourcelead.referred_party);
        if (refer) {
            lead.referred_party = refer;
            lead.referred_date = sourcelead.referred_date;
            await lead.save();
        }
    }
    if (merge_remarks) {
        await Remark.updateMany({ lead: source_lead_id }, { lead: id });
    }
    if (merge_bills) {
        await Bill.updateMany({ lead: source_lead_id }, { lead: id });
    }
    await Lead.findByIdAndDelete(source_lead_id);
    return res.status(200).json({ message: "merge leads successfully" })
}
export const MergeTwoRefers = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { name, mobiles, city, state, address, merge_assigned_refers, merge_bills, merge_remarks, source_refer_id } = req.body as CreateOrEditMergeRefersDto
    let refer = await ReferredParty.findById(id);
    let sourcerefer = await ReferredParty.findById(source_refer_id);

    if (!refer || !sourcerefer)
        return res.status(404).json({ message: "refers not found" })

    await ReferredParty.findByIdAndUpdate(id, {
        name: name,
        city: city,
        state: state,
        mobile: mobiles[0] || null,
        mobile2: mobiles[1] || null,
        mobile3: mobiles[2] || null,
        address: address
    });

    if (merge_assigned_refers) {
        await Lead.updateMany({ referred_party: source_refer_id }, { referred_party: id });
    }
    if (merge_remarks) {
        await Remark.updateMany({ refer: source_refer_id }, { refer: id });
    }
    if (merge_bills) {
        await Bill.updateMany({ refer: source_refer_id }, { refer: id });
    }
    await ReferredParty.findByIdAndDelete(source_refer_id);
    return res.status(200).json({ message: "merge refers successfully" })
}

export const GetChecklists = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let checklists: IChecklist[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    //@ts-ignore
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetChecklistDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                checklists = await Checklist.find().populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find().countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                checklists = await Checklist.find({ user: { $in: ids } }).populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find({ user: { $in: ids } }).countDocuments()
            }
        }
        else if (!id) {
            checklists = await Checklist.find({ user: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: req.user?._id }).countDocuments()
        }

        else {
            checklists = await Checklist.find({ user: id }).populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: id }).countDocuments()
        }



        for (let i = 0; i < checklists.length; i++) {
            let ch = checklists[i];
            if (ch && ch.category) {
                let boxes = await ChecklistBox.find({ checklist: ch._id, date: { $gte: dt1, $lt: dt2 } }).sort('date');
                let lastcheckedbox = await ChecklistBox.findOne({ checklist: ch._id, checked: true }).sort('-date')

                let dtoboxes = boxes.map((b) => { return { _id: b._id, checked: b.checked, date: b.date.toString(), remarks: b.remarks } });
                result.push({
                    _id: ch._id,
                    work_title: ch.work_title,
                    link: ch.link,
                    end_date: ch.end_date.toString(),
                    category: { id: ch.category._id, label: ch.category.category, value: ch.category.category },
                    frequency: ch.frequency,
                    user: { id: ch.user._id, label: ch.user.username, value: ch.user.username },
                    created_at: ch.created_at.toString(),
                    updated_at: ch.updated_at.toString(),
                    boxes: dtoboxes,
                    done_date: lastcheckedbox ? moment(lastcheckedbox.date).format('DD/MM/YYYY') : "",
                    next_date: ch.next_date ? moment(ch.next_date).format('DD/MM/YYYY') : "",
                    photo: ch.photo?.public_url || "",
                    created_by: { id: ch.created_by._id, value: ch.created_by.username, label: ch.created_by.username },
                    updated_by: { id: ch.updated_by._id, value: ch.updated_by.username, label: ch.updated_by.username }
                })
            }
        }

        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}
//post/put/delete/patch
export const CreateChecklist = async (req: Request, res: Response, next: NextFunction) => {

    let body = JSON.parse(req.body.body)
    const { category,
        work_title,
        link,
        user_id,
        next_date,
        frequency,
        end_date } = body as CreateOrEditChecklistDto
    console.log(req.body)
    if (!category || !work_title || !user_id || !frequency || !end_date || !next_date)
        return res.status(400).json({ message: "please provide all required fields" })

    if (!isvalidDate(new Date(end_date)) || new Date(end_date) <= new Date())
        return res.status(400).json({
            message: "please provide valid end date"
        })
    let user = await User.findById(user_id)
    if (!user)
        return res.status(404).json({ message: 'user not exists' })


    let checklist = new Checklist({
        category: category,
        work_title: work_title,
        link: link,
        end_date: new Date(end_date),
        next_date: new Date(next_date),
        user: user._id,
        frequency: frequency,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    })

    let document: Asset | undefined = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `checklist/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            document = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    if (document)
        checklist.photo = document;
    await checklist.save();

    if (end_date && frequency == "daily") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                checked: false,
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (end_date && frequency == "weekly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                checked: false,
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setDate(new Date(current_date).getDate() + 6)
        }
    }
    return res.status(201).json({ message: `new Checklist added` });
}
export const EditChecklist = async (req: Request, res: Response, next: NextFunction) => {

    let body = JSON.parse(req.body.body)
    const {
        work_title,
        link,
        user_id, next_date } = body as CreateOrEditChecklistDto
    if (!work_title || !user_id)
        return res.status(400).json({ message: "please provide all required fields" })

    let id = req.params.id

    let checklist = await Checklist.findById(id)
    if (!checklist)
        return res.status(404).json({ message: 'checklist not exists' })

    if (user_id) {
        let user = await User.findById(user_id)
        if (user)
            checklist.user = user
    }
    checklist.work_title = work_title
    checklist.link = link
    let document: Asset | undefined = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `checklist/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            document = doc
            if (checklist.photo && checklist.photo?._id)
                await destroyFile(checklist.photo._id)
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    if (document)
        checklist.photo = document;
    if (next_date)
        checklist.next_date = new Date(next_date);
    await checklist.save()
    return res.status(200).json({ message: `Checklist updated` });
}
export const DeleteChecklist = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let checklist = await Checklist.findById(id)
    if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" })
    }
    await ChecklistBox.deleteMany({ checklist: checklist._id })
    await checklist.remove()

    if (checklist.photo && checklist.photo?._id)
        await destroyFile(checklist.photo._id)

    return res.status(200).json({ message: `Checklist deleted` });
}
export const ToogleChecklist = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { remarks } = req.body
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let checklist = await ChecklistBox.findById(id)
    if (!checklist) {
        return res.status(404).json({ message: "Checklist box not found" })
    }
    await ChecklistBox.findByIdAndUpdate(id, { checked: !checklist.checked, remarks: remarks })
    return res.status(200).json("successfully marked")
}
export const CreateChecklistFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetChecklistFromExcelDto[] = []
    let statusText: string = ""
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetChecklistFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        for (let i = 0; i < workbook_response.length; i++) {
            let checklist = workbook_response[i]
            let work_title: string | null = checklist.work_title
            let person: string | null = checklist.person
            let category: string | null = checklist.category
            let frequency: string | null = checklist.frequency
            let validated = true

            //important
            if (!work_title) {
                validated = false
                statusText = "required work title"
            }
            if (!person) {
                validated = false
                statusText = "required person"
            }
            if (!frequency) {
                validated = false
                statusText = "required frequency"
            }

            if (await Checklist.findOne({ work_title: work_title.trim().toLowerCase() })) {
                validated = false
                statusText = "checklist already exists"
            }


            if (validated) {
                await new Checklist({
                    work_title,
                    person,
                    frequency,
                    category,
                    created_by: req.user,
                    updated_by: req.user,
                    updated_at: new Date(Date.now()),
                    created_at: new Date(Date.now())
                })
                // .save()
                statusText = "success"
            }
            result.push({
                ...checklist,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}
export const DownloadExcelTemplateForCreatechecklists = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any = {
        work_title: "check the work given ",
        category: "payment",
        frequency: 'daily'
    }
    SaveExcelTemplateToDisk([checklist])
    let fileName = "CreateChecklistTemplate.xlsx"
    return res.download("./file", fileName)
}


export const CreateMaintenance = async (req: Request, res: Response, next: NextFunction) => {

    let body = JSON.parse(req.body.body)
    const {
        work,
        category,
        user,
        maintainable_item,
        frequency
    } = body as CreateOrEditMaintenanceDto
    if (!work || !category || !user || !maintainable_item || !frequency)
        return res.status(400).json({ message: "please provide all required fields" })


    let tmpUser = await User.findById(user)
    if (!tmpUser)
        return res.status(404).json({ message: 'user not exists' })


    let maintenance = new Maintenance({
        category: category,
        work: work,
        item: maintainable_item,
        user: tmpUser._id,
        frequency: frequency,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    })


    if (maintainable_item.trim().toLowerCase() == 'machine') {
        let machines = await Machine.find({ active: true })
        let items: IMaintenanceItem[] = []
        for (let i = 0; i < machines.length; i++) {
            let item = new MaintenanceItem({
                machine: machines[i],
                is_required: true,
                stage: "pending",
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            })
            items.push(item)
            await item.save()
        }
        maintenance.items = items;
    }
    else {
        let item = new MaintenanceItem({
            other: maintainable_item.trim().toLowerCase(),
            is_required: true,
            stage: "pending",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })
        maintenance.items = [item]
        await item.save()

    }
    await maintenance.save()
    return res.status(201).json({ message: `new maintenance added` });
}
export const UpdateMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const {
        work,
        category,
        user,
        frequency
    } = body as CreateOrEditMaintenanceDto
    console.log(req.body)
    if (!work || !category || !user || !frequency)
        return res.status(400).json({ message: "please provide all required fields" })

    let id = req.params.id

    let maintenance = await Maintenance.findById(id)
    if (!maintenance)
        return res.status(404).json({ message: 'maintenance not exists' })

    let tmpUser = await User.findById(user)
    if (!tmpUser)
        return res.status(404).json({ message: 'user not exists' })

    await Maintenance.findByIdAndUpdate(id, {
        work,
        category,
        user: tmpUser,
        frequency,
        updated_at: new Date(),
        updated_by: req.user
    })
    await maintenance.save()
    return res.status(200).json({ message: ` maintenance updated` });
}
export const DeleteMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let maintenance = await Maintenance.findById(id).populate('items')
    if (!maintenance) {
        return res.status(404).json({ message: "Maintenance not found" })
    }
    for (let i = 0; i < maintenance.items.length; i++) {
        let item = maintenance.items[i]
        await MaintenanceItem.findByIdAndDelete(item._id)
        await Remark.deleteMany({ maintainable_item: item._id })
    }
    await maintenance.remove()
    return res.status(200).json({ message: `Maintenance deleted` });
}
export const GetAllMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let maintenances: IMaintenance[] = []
    let count = 0
    //@ts-ignore
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetMaintenanceDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                maintenances = await Maintenance.find({ active: true }).populate('created_by').populate('updated_by').populate('category')
                    .populate({
                        path: 'items',
                        populate: [
                            {
                                path: 'machine',
                                model: 'Machine'
                            }
                        ]
                    })
                    .populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find({ active: true }).countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                maintenances = await Maintenance.find({ user: { $in: ids }, active: true }).populate('created_by').populate('updated_by').populate('category').populate({
                    path: 'items',
                    populate: [
                        {
                            path: 'machine',
                            model: 'Machine'
                        }
                    ]
                }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find({ user: { $in: ids }, active: true }).countDocuments()
            }
        }
        else if (!id) {
            maintenances = await Maintenance.find({ user: req.user?._id, active: true }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: req.user?._id, active: true }).countDocuments()
        }

        else {
            maintenances = await Maintenance.find({ user: id, active: true }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: id, active: true }).countDocuments()
        }

        result = maintenances.map((mt) => {
            return {
                _id: mt._id,
                work: mt.work,
                active: mt.active,
                category: { id: mt.category._id, label: mt.category.category, value: mt.category.category },
                item: mt.item,
                frequency: mt.frequency,
                user: { id: mt.user._id, label: mt.user.username, value: mt.user.username },
                items: mt.items.map((item) => {
                    return {
                        _id: item._id,
                        item: item.machine ? item.machine.name : item.other,
                        stage: item.stage,
                        is_required: item.is_required
                    }
                }),
                created_at: mt.created_at.toString(),
                updated_at: mt.updated_at.toString(),
                created_by: mt.created_by.username,
                updated_by: mt.updated_by.username
            }
        })


        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}
export const CreateMaintenanceFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateMaintenanceFromExcelDto[] = []
    let statusText: string = ""
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: CreateMaintenanceFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        for (let i = 0; i < workbook_response.length; i++) {
            let maintenance = workbook_response[i]
            let work: string | null = maintenance.work
            let user: string | null = maintenance.user
            let category: string | null = maintenance.category
            let maintainable_item: string | null = maintenance.maintainable_item
            let frequency: string | null = maintenance.frequency
            let validated = true

            //important
            if (!work) {
                validated = false
                statusText = "required work"
            }
            if (!user) {
                validated = false
                statusText = "required person"
            }
            if (!frequency) {
                validated = false
                statusText = "required frequency"
            }
            if (!category) {
                validated = false
                statusText = "required category"
            }
            if (!maintainable_item) {
                validated = false
                statusText = "required maintainable_item"
            }

            if (await Maintenance.findOne({ work: work.trim().toLowerCase() })) {
                validated = false
                statusText = "maintenance already exists"
            }
            let tmpCategory = await MaintenanceCategory.findOne({ category: category.trim().toLowerCase() })
            if (!tmpCategory) {
                validated = false
                statusText = "category not exists"
            }

            let tmpUser = await User.findOne({ username: user.trim().toLowerCase() })
            if (!tmpUser) {
                validated = false
                statusText = "user not exists"
            }


            if (validated) {
                let maintenance = new Maintenance({
                    category: tmpCategory,
                    work: work,
                    item: maintainable_item,
                    user: tmpUser,
                    frequency: frequency,
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user,
                    updated_by: req.user
                })


                if (maintainable_item.trim().toLowerCase() == 'machine') {
                    let machines = await Machine.find({ active: true })
                    let items: IMaintenanceItem[] = []
                    for (let i = 0; i < machines.length; i++) {
                        let item = new MaintenanceItem({
                            machine: machines[i],
                            is_required: true,
                            stage: "pending",
                            created_at: new Date(),
                            updated_at: new Date(),
                            created_by: req.user,
                            updated_by: req.user
                        })
                        items.push(item)
                        await item.save()
                    }
                    maintenance.items = items;
                }
                else {
                    let item = new MaintenanceItem({
                        other: maintainable_item.trim().toLowerCase(),
                        is_required: true,
                        stage: "pending",
                        created_at: new Date(),
                        updated_at: new Date(),
                        created_by: req.user,
                        updated_by: req.user
                    })
                    maintenance.items = [item]
                    await item.save()

                }
                await maintenance.save()
                statusText = "success"
            }
            result.push({
                ...maintenance,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}
export const DownloadExcelTemplateForMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any = {
        work: "check the work given ",
        category: "ver-1",
        frequency: 'daily',
        user: 'nishu',
        maintainable_item: 'machine'
    }
    SaveExcelTemplateToDisk([checklist])
    let fileName = "CreateMaintenanceTemplate.xlsx"
    return res.download("./file", fileName)
}
export const ToogleMaintenanceItem = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }
    await MaintenanceItem.findByIdAndUpdate(id, { is_required: !item.is_required })
    return res.status(200).json("successfully changed")
}
export const ViewMaintenanceItemRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetMaintenanceItemRemarkDto[] = []
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }
    let remarks = await Remark.find({ maintainable_item: item })
    result = remarks.map((rem) => {
        return {
            _id: rem._id,
            remark: rem.remark,
            created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
            created_by: rem.created_by.username
        }
    })
    return res.status(200).json(result)
}
export const ViewMaintenanceItemRemarkHistoryByDates = async (req: Request, res: Response, next: NextFunction) => {

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    let result: GetMaintenanceItemRemarkDto[] = []
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }
    let remarks = await Remark.find({ maintainable_item: item, created_at: { $gte: dt1, $lt: dt2 } })
    result = remarks.map((rem) => {
        return {
            _id: rem._id,
            remark: rem.remark,
            created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
            created_by: rem.created_by.username
        }
    })
    return res.status(200).json(result)
}
export const AddMaintenanceItemRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, stage } = req.body as CreateOrEditRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const user = await User.findById(req.user?._id)
    if (!user)
        return res.status(403).json({ message: "please login to access this resource" })
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }

    let new_remark = new Remark({
        remark,
        maintainable_item: item,
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    await new_remark.save()

    if (stage)
        item.stage = stage;
    if (req.user) {
        item.updated_by = req.user
        item.updated_at = new Date(Date.now())
    }
    await item.save()
    return res.status(200).json({ message: "new remark added successfully" })
}
export const GetAllMaintenanceReport = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let maintenances: IMaintenance[] = []
    let count = 0
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    //@ts-ignore
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetMaintenanceDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                maintenances = await Maintenance.find().populate('created_by').populate('updated_by').populate('category')
                    .populate({
                        path: 'items',
                        populate: [
                            {
                                path: 'machine',
                                model: 'Machine'
                            }
                        ]
                    })
                    .populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find().countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                maintenances = await Maintenance.find({ user: { $in: ids } }).populate('created_by').populate('updated_by').populate('category').populate({
                    path: 'items',
                    populate: [
                        {
                            path: 'machine',
                            model: 'Machine'
                        }
                    ]
                }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find({ user: { $in: ids } }).countDocuments()
            }
        }
        else if (!id) {
            maintenances = await Maintenance.find({ user: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: req.user?._id }).countDocuments()
        }

        else {
            maintenances = await Maintenance.find({ user: id }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: id }).countDocuments()
        }

        for (let i = 0; i < maintenances.length; i++) {
            let maintenance = maintenances[i]
            let items: GetMaintenanceItemDto[] = []
            for (let j = 0; j < maintenance.items.length; j++) {
                let item = maintenance.items[i];
                let itemboxes = await GetMaintenceItemBoxes(dt1, dt2, maintenance.frequency, item);
                items.push({
                    _id: item._id,
                    item: item.machine ? item.machine.name : item.other,
                    stage: item.stage,
                    boxes: itemboxes,
                    is_required: item.is_required
                })
            }
            result.push({
                _id: maintenance._id,
                work: maintenance.work,
                active: maintenance.active,
                category: { id: maintenance.category._id, label: maintenance.category.category, value: maintenance.category.category },
                frequency: maintenance.frequency,
                user: { id: maintenance.user._id, label: maintenance.user.username, value: maintenance.user.username },
                items: items,
                item: maintenance.item,
                created_at: maintenance.created_at.toString(),
                updated_at: maintenance.updated_at.toString(),
                created_by: maintenance.created_by.username,
                updated_by: maintenance.updated_by.username
            })

        }

        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}
export const GetMaintenceItemBoxes = async (dt1: Date, dt2: Date, frequency: string, item: IMaintenanceItem) => {
    let result: {
        dt1: string,
        dt2: string,
        checked: boolean
    }[] = []

    if (frequency == "daily") {
        let current_date = new Date(dt1)
        while (current_date <= new Date(dt2)) {
            let tmpDate = new Date(new Date().setDate(new Date(current_date).getDate() + 1)).toString()
            let remark = await Remark.findOne({ maintainable_item: item._id, created_at: { $gte: current_date, $lt: tmpDate } });
            result.push({
                dt1: current_date.toString(),
                dt2: tmpDate,
                checked: remark && item.stage == 'done' ? true : false
            })
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (frequency == "weekly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(dt2)) {
            let tmpDate = new Date(new Date().setDate(new Date(current_date).getDate() + 6)).toString()
            if (current_date >= dt1 && current_date <= dt2) {
                let remark = await Remark.findOne({ maintainable_item: item._id, created_at: { $gte: current_date, $lt: tmpDate } });
                result.push({
                    dt1: current_date.toString(),
                    dt2: tmpDate,
                    checked: remark && item.stage == 'done' ? true : false
                })
            }

            current_date.setDate(new Date(current_date).getDate() + 6)
        }
    }
    if (frequency === "monthly") {
        let current_date = new Date(dt1); // Start from the first date of the range
        current_date.setDate(1); // Set to the first day of the month

        // Iterate while current_date is less than or equal to dt2
        while (current_date <= new Date(dt2)) {
            // Calculate the next month's date
            let nextMonthDate = new Date(current_date);
            nextMonthDate.setMonth(current_date.getMonth() + 1);

            // Check if the current month is within the specified date range
            if (current_date >= dt1 && current_date < dt2) {
                let remark = await Remark.findOne({
                    maintainable_item: item._id,
                    created_at: { $gte: current_date, $lt: nextMonthDate }
                });

                result.push({
                    dt1: current_date.toString(),
                    dt2: nextMonthDate.toString(),
                    checked: remark && item.stage === 'done' ? true : false
                });
            }

            // Move to the next month
            current_date.setMonth(current_date.getMonth() + 1);
        }
    }

    if (frequency === "yearly") {
        let current_date = new Date(dt1); // Start from the first date of the range
        current_date.setMonth(0); // Set to January (month 0)
        current_date.setDate(1); // Set to the first day of the month

        // Iterate while current_date is less than or equal to dt2
        while (current_date <= new Date(dt2)) {
            // Calculate the next year's date
            let nextYearDate = new Date(current_date);
            nextYearDate.setFullYear(current_date.getFullYear() + 1);

            // Check if the current year is within the specified date range
            if (current_date >= dt1 && current_date < dt2) {
                let remark = await Remark.findOne({
                    maintainable_item: item._id,
                    created_at: { $gte: current_date, $lt: nextYearDate }
                });

                result.push({
                    dt1: current_date.toString(),
                    dt2: nextYearDate.toString(),
                    checked: remark && item.stage === 'done' ? true : false
                });
            }

            // Move to the next year
            current_date.setFullYear(current_date.getFullYear() + 1);
        }
    }

    return result;
}



export const CreateProduction = async (req: Request, res: Response, next: NextFunction) => {
    let {
        machine,
        thekedar,
        articles,
        manpower,
        production,
        big_repair,
        production_hours,
        small_repair,
        date,
        upper_damage
    } = req.body as CreateOrEditProductionDto
    let previous_date = new Date()
    let day = previous_date.getDate() - 3
    previous_date.setDate(day)
    // if (new Date(date) < previous_date || new Date(date) > new Date())
    //     return res.status(400).json({ message: "invalid date, should be within last 2 days" })

    let previous_date2 = new Date(date)
    let day2 = previous_date2.getDate() - 3
    previous_date2.setDate(day2)

    let prods = await Production.find({ created_at: { $gte: previous_date2 }, machine: machine })
    prods = prods.filter((prod) => {
        if (prod.date.getDate() === new Date(date).getDate() && prod.date.getMonth() === new Date(date).getMonth() && prod.date.getFullYear() === new Date(date).getFullYear()) {
            return prod
        }
    })
    if (prods.length === 2)
        return res.status(400).json({ message: "not allowed more than 2 productions for the same machine" })

    if (!machine || !thekedar || !articles || !manpower || !production || !date)
        return res.status(400).json({ message: "please fill all reqired fields" })


    let production_date = new Date(date)


    if (articles.length === 0) {
        return res.status(400).json({ message: "select an article" })
    }
    let m1 = await Machine.findById(machine)
    let t1 = await User.findById(thekedar)

    if (!m1 || !t1)
        return res.status(400).json({ message: "not a valid request" })
    let new_prouction = new Production({
        machine: m1,
        thekedar: t1,
        production_hours: production_hours,
        articles: articles,
        manpower: manpower,
        production: production,
        big_repair: big_repair,
        small_repair: small_repair,
        upper_damage: upper_damage
    })

    new_prouction.date = production_date
    new_prouction.created_at = new Date()
    new_prouction.updated_at = new Date()
    if (req.user) {
        new_prouction.created_by = req.user
        new_prouction.updated_by = req.user
    }
    await new_prouction.save()
    return res.status(201).json(new_prouction)
}
export const UpdateProduction = async (req: Request, res: Response, next: NextFunction) => {
    let {
        machine,
        thekedar,
        articles,
        production_hours,
        manpower,
        production,
        big_repair,
        small_repair,
        upper_damage,
        date
    } = req.body as CreateOrEditProductionDto
    let previous_date = new Date()
    let day = previous_date.getDate() - 3
    previous_date.setDate(day)

    // if (new Date(date) < previous_date || new Date(date) > new Date())
    //     return res.status(400).json({ message: "invalid date, should be within last 2 days" })
    if (!machine || !thekedar || !articles || !manpower || !production || !date)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    if (!id)
        return res.status(400).json({ message: "not a valid request" })
    let remote_production = await Production.findById(id)


    if (!remote_production)
        return res.status(404).json({ message: "producton not exists" })

    if (articles.length === 0) {
        return res.status(400).json({ message: "select an article" })
    }
    let m1 = await Machine.findById(machine)
    let t1 = await User.findById(thekedar)

    if (!m1 || !t1)
        return res.status(400).json({ message: "not a valid request" })
    await Production.findByIdAndUpdate(remote_production._id,
        {
            machine: m1,
            thekedar: t1,
            articles: articles,
            manpower: manpower,
            production: production,
            production_hours: production_hours,
            big_repair: big_repair,
            small_repair: small_repair,
            upper_damage: upper_damage,
            created_at: new Date(),
            updated_at: new Date(),
            updated_by: req.user
        })
    return res.status(200).json({ message: "production updated" })
}
export const DeleteProduction = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!id)
        return res.status(400).json({ message: "not a valid request" })
    let remote_production = await Production.findById(id)
    if (!remote_production)
        return res.status(404).json({ message: "producton not exists" })

    await Production.findByIdAndDelete(remote_production._id)
    return res.status(200).json({ message: "production removed" })
}
export const GetMyTodayShoeWeights = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date()
    dt1.setDate(new Date().getDate())
    dt1.setHours(0)
    dt1.setMinutes(0)
    let result: GetShoeWeightDto[] = []
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    let weights: IShoeWeight[] = []

    if (user_ids.length > 0) {
        weights = await ShoeWeight.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('machine').populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    else {
        weights = await ShoeWeight.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('machine').populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    result = weights.map((w) => {
        return {
            _id: w._id,
            machine: { id: w.machine._id, label: w.machine.name, value: w.machine.name },
            dye: { id: w.dye._id, label: String(w.dye.dye_number), value: String(w.dye.dye_number) },
            article: { id: w.article._id, label: w.article.name, value: w.article.name },
            is_validated: w.is_validated,
            month: w.month,
            std_weigtht: w.dye.stdshoe_weight || 0,
            size: w.dye.size || "",
            shoe_weight1: w.shoe_weight1,
            shoe_photo1: w.shoe_photo1?.public_url || "",
            weighttime1: moment(new Date(w.weighttime1)).format('LT'),
            weighttime2: moment(new Date(w.weighttime2)).format('LT'),
            weighttime3: moment(new Date(w.weighttime3)).format('LT'),
            upper_weight1: w.upper_weight1,
            upper_weight2: w.upper_weight2,
            upper_weight3: w.upper_weight3,
            shoe_weight2: w.shoe_weight2,
            shoe_photo2: w.shoe_photo2?.public_url || "",
            shoe_weight3: w.shoe_weight3,
            shoe_photo3: w.shoe_photo3?.public_url || "",
            created_at: moment(w.created_at).format("DD/MM/YYYY"),
            updated_at: moment(w.updated_at).format("DD/MM/YYYY"),
            created_by: { id: w.created_by._id, value: w.created_by.username, label: w.created_by.username },
            updated_by: { id: w.updated_by._id, value: w.updated_by.username, label: w.updated_by.username },
        }
    })
    return res.status(200).json(result)
}
export const GetShoeWeights = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let weights: IShoeWeight[] = []
    let result: GetShoeWeightDto[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    console.log(user_ids)
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (!id) {
            if (user_ids.length > 0) {
                weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await ShoeWeight.find({ created_at: { $gt: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
            }

            else {
                weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
            }
            console.log(weights.length)
        }


        if (id) {
            weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
            count = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }
        result = weights.map((w) => {
            return {
                _id: w._id,
                machine: { id: w.machine._id, label: w.machine.name, value: w.machine.name },
                dye: { id: w.dye._id, label: String(w.dye.dye_number), value: String(w.dye.dye_number) },
                article: { id: w.article._id, label: w.article.name, value: w.article.name },
                size: w.dye.size || "",
                is_validated: w.is_validated,
                month: w.month,
                std_weigtht: w.dye.stdshoe_weight || 0,
                shoe_weight1: w.shoe_weight1,
                shoe_photo1: w.shoe_photo1?.public_url || "",
                weighttime1: moment(new Date(w.weighttime1)).format('LT'),
                weighttime2: moment(new Date(w.weighttime2)).format('LT'),
                weighttime3: moment(new Date(w.weighttime3)).format('LT'),
                upper_weight1: w.upper_weight1,
                upper_weight2: w.upper_weight2,
                upper_weight3: w.upper_weight3,
                shoe_weight2: w.shoe_weight2,
                shoe_photo2: w.shoe_photo2?.public_url || "",
                shoe_weight3: w.shoe_weight3,
                shoe_photo3: w.shoe_photo3?.public_url || "",
                created_at: moment(w.created_at).format("DD/MM/YYYY"),
                updated_at: moment(w.updated_at).format("DD/MM/YYYY"),
                created_by: { id: w.created_by._id, value: w.created_by.username, label: w.created_by.username },
                updated_by: { id: w.updated_by._id, value: w.updated_by.username, label: w.updated_by.username },
            }
        })
        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(200).json({ message: "bad request" })
}
export const CreateShoeWeight = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })

    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! dye is not available" })
    }


    let shoe_weight = new ShoeWeight({
        machine: m1, dye: d1, article: art1, shoe_weight1: weight, month: month, upper_weight1: upper_weight
    })
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo1 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    shoe_weight.created_at = new Date()
    shoe_weight.updated_at = new Date()
    if (req.user)
        shoe_weight.created_by = req.user
    if (req.user)
        shoe_weight.updated_by = req.user
    shoe_weight.weighttime1 = new Date()
    await shoe_weight.save()
    return res.status(201).json(shoe_weight)
}
export const UpdateShoeWeight1 = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })

    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    //@ts-ignore

    if (shoe_weight.dye !== dye)
        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


    if (shoe_weight.shoe_photo1 && shoe_weight.shoe_photo1._id)
        await destroyFile(shoe_weight.shoe_photo1._id)
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo1 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    shoe_weight.machine = m1
    shoe_weight.dye = d1
    shoe_weight.month = month
    shoe_weight.upper_weight1 = upper_weight;
    shoe_weight.article = art1
    shoe_weight.shoe_weight1 = weight
    shoe_weight.created_at = new Date()
    shoe_weight.weighttime1 = new Date()
    shoe_weight.updated_at = new Date()
    if (req.user) {

        shoe_weight.created_by = req.user
        shoe_weight.updated_by = req.user
    }
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}
export const UpdateShoeWeight2 = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
    console.log(body)
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    //@ts-ignore
    if (shoe_weight.dye._id.valueOf() !== dye)
        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill  reqired fields" })
    if (shoe_weight.shoe_photo2 && shoe_weight.shoe_photo2._id)
        await destroyFile(shoe_weight.shoe_photo2._id)
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo2 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    shoe_weight.machine = m1
    shoe_weight.dye = d1
    shoe_weight.month = month
    shoe_weight.article = art1
    shoe_weight.upper_weight2 = upper_weight;
    shoe_weight.shoe_weight2 = weight
    shoe_weight.weighttime2 = new Date()
    shoe_weight.created_at = new Date()
    shoe_weight.updated_at = new Date()
    if (req.user) {
        shoe_weight.created_by = req.user
        shoe_weight.updated_by = req.user
    }
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}
export const UpdateShoeWeight3 = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    if (shoe_weight.dye._id.valueOf() !== dye)
        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })
    if (shoe_weight.shoe_photo3 && shoe_weight.shoe_photo3._id)
        await destroyFile(shoe_weight.shoe_photo3._id)
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo3 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    shoe_weight.machine = m1
    shoe_weight.upper_weight3 = upper_weight;
    shoe_weight.dye = d1
    shoe_weight.month = month
    shoe_weight.article = art1
    shoe_weight.shoe_weight3 = weight
    shoe_weight.created_at = new Date()
    shoe_weight.updated_at = new Date()
    shoe_weight.weighttime3 = new Date()
    if (req.user) {
        shoe_weight.created_by = req.user
        shoe_weight.updated_by = req.user
    }
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}
export const ValidateShoeWeight = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })
    shoe_weight.is_validated = true
    shoe_weight.updated_at = new Date()
    if (req.user)
        shoe_weight.updated_by = req.user
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}
export const ValidateSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let sparedye = await SpareDye.findById(id)
    if (!sparedye)
        return res.status(404).json({ message: "spare dye not found" })
    sparedye.is_validated = true
    sparedye.updated_at = new Date()
    if (req.user)
        sparedye.updated_by = req.user
    await sparedye.save()
    return res.status(200).json(sparedye)
}
export const DeleteShoeWeight = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })
    shoe_weight.is_validated = true
    shoe_weight.updated_at = new Date()
    if (req.user)
        shoe_weight.updated_by = req.user
    if (shoe_weight.shoe_photo1 && shoe_weight.shoe_photo1._id)
        await destroyFile(shoe_weight.shoe_photo1._id)
    if (shoe_weight.shoe_photo2 && shoe_weight.shoe_photo2._id)
        await destroyFile(shoe_weight.shoe_photo2._id)
    if (shoe_weight.shoe_photo3 && shoe_weight.shoe_photo3._id)
        await destroyFile(shoe_weight.shoe_photo3._id)
    await shoe_weight.remove()
    return res.status(200).json(shoe_weight)
}
export const GetProductions = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let productions: IProduction[] = []
    let result: GetProductionDto[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (!id) {
            if (user_ids.length > 0) {
                productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: { $in: user_ids } }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
                count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: { $in: user_ids } }).countDocuments()
            }

            else {
                productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: req.user?._id }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
                count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: req.user?._id }).countDocuments()
            }
        }


        if (id) {
            productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: id }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
            count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: id }).countDocuments()
        }
        result = productions.map((p) => {
            return {
                _id: p._id,
                machine: { id: p.machine._id, value: p.machine.name, label: p.machine.name },
                thekedar: { id: p.thekedar._id, value: p.thekedar.username, label: p.thekedar.username },
                articles: p.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
                manpower: p.manpower,
                production: p.production,
                big_repair: p.big_repair,
                upper_damage: p.upper_damage,
                small_repair: p.small_repair,
                date: p.date && moment(p.date).format("DD/MM/YYYY"),
                production_hours: p.production_hours,
                created_at: p.created_at && moment(p.created_at).format("DD/MM/YYYY"),
                updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
                created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
                updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
            }
        })
        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}
export const GetMyTodayProductions = async (req: Request, res: Response, next: NextFunction) => {
    let machine = req.query.machine
    let date = String(req.query.date)
    let dt1 = new Date(date)
    let dt2 = new Date(date)
    dt2.setDate(dt1.getDate() + 1)
    let productions: IProduction[] = []
    let result: GetProductionDto[] = []
    if (machine) {
        productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, machine: machine }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    if (!machine)
        productions = await Production.find({ date: { $gte: dt1, $lt: dt2 } }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('-updated_at')

    result = productions.map((p) => {
        return {
            _id: p._id,
            machine: { id: p.machine._id, value: p.machine.name, label: p.machine.name },
            thekedar: { id: p.thekedar._id, value: p.thekedar.username, label: p.thekedar.username },
            articles: p.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
            manpower: p.manpower,
            production: p.production,
            big_repair: p.big_repair,
            upper_damage: p.upper_damage,
            small_repair: p.small_repair,
            date: p.date && moment(p.date).format("DD/MM/YYYY"),
            production_hours: p.production_hours,
            created_at: p.created_at && moment(p.created_at).format("DD/MM/YYYY"),
            updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
            created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
            updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
        }
    })
    return res.status(200).json(productions)
}
export const GetMyTodaySoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    console.log("enterd")
    let dt1 = new Date()
    dt1.setDate(new Date().getDate())
    dt1.setHours(0)
    dt1.setMinutes(0)
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    let items: ISoleThickness[] = []
    let result: GetSoleThicknessDto[] = []

    if (user_ids.length > 0) {
        items = await SoleThickness.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    else {
        items = await SoleThickness.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    result = items.map((item) => {
        return {
            _id: item._id,
            dye: { id: item.dye._id, value: item.dye.dye_number.toString(), label: item.dye.dye_number.toString() },
            article: { id: item.article._id, value: item.article.name, label: item.article.name },
            size: item.size,
            left_thickness: item.left_thickness,
            right_thickness: item.right_thickness,
            created_at: item.created_at ? moment(item.created_at).format('LT') : "",
            updated_at: item.updated_at ? moment(item.updated_at).format('LT') : "",
            created_by: { id: item.created_by._id, value: item.created_by.username, label: item.created_by.username },
            updated_by: { id: item.updated_by._id, value: item.updated_by.username, label: item.updated_by.username }
        }
    })
    return res.status(200).json(result)
}
export const GetSoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let result: GetSoleThicknessDto[] = []
    let items: ISoleThickness[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (!id) {
            if (user_ids.length > 0) {
                items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
            }

            else {
                items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
            }
        }


        if (id) {
            items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
            count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }

        result = items.map((item) => {
            return {
                _id: item._id,
                dye: { id: item.dye._id, value: item.dye.dye_number.toString(), label: item.dye.dye_number.toString() },
                article: { id: item.article._id, value: item.article.name, label: item.article.name },
                size: item.size,
                left_thickness: item.left_thickness,
                right_thickness: item.right_thickness,
                created_at: item.created_at ? moment(item.created_at).format('DD/MM/YYYY') : "",
                updated_at: item.updated_at ? moment(item.updated_at).format('DD/MM/YYYY') : "",
                created_by: { id: item.created_by._id, value: item.created_by.username, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, value: item.updated_by.username, label: item.updated_by.username }
            }
        })

        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(200).json({ message: "bad request" })
}
export const CreateSoleThickness = async (req: Request, res: Response, next: NextFunction) => {

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    let { dye, article, size, left_thickness, right_thickness } = req.body as CreateOrEditSoleThicknessDto

    if (!size || !dye || !article || !left_thickness || !right_thickness)
        return res.status(400).json({ message: "please fill all reqired fields" })

    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })


    if (await SoleThickness.findOne({ dye: dye, article: article, size: size, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry !selected dye,article or size not available" })
    }
    let thickness = new SoleThickness({
        dye: d1, article: art1, size: size, left_thickness: left_thickness, right_thickness: right_thickness,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()

    return res.status(201).json(thickness)
}
export const UpdateSoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    let { dye, article, size, left_thickness, right_thickness } = req.body as CreateOrEditSoleThicknessDto

    if (!size || !dye || !article || !left_thickness || !right_thickness)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let thickness = await SoleThickness.findById(id)
    if (!thickness)
        return res.status(404).json({ message: "not found" })

    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })

    //@ts-ignore
    if (thickness.size !== size || thickness.article !== article || thickness.dye !== dye)
        if (await SoleThickness.findOne({ dye: dye, article: article, size: size, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry !selected dye,article or size not available" })
        }

    await SoleThickness.findByIdAndUpdate(id, {
        dye: d1, article: art1, size: size, left_thickness: left_thickness, right_thickness: right_thickness,
        updated_at: new Date(),
        updated_by: req.user
    })
    return res.status(200).json(thickness)
}
export const DeleteSoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let thickness = await SoleThickness.findById(id)
    if (!thickness)
        return res.status(404).json({ message: " not found" })
    await thickness.remove()
    return res.status(200).json(thickness)
}
export const GetMyTodaySpareDye = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date()
    dt1.setDate(new Date().getDate())
    dt1.setHours(0)
    dt1.setMinutes(0)
    let sparedyes: ISpareDye[] = []
    let result: GetSpareDyeDto[] = []
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    if (user_ids.length > 0) {
        sparedyes = await SpareDye.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('dye').populate('location').populate('created_by').populate('updated_by').sort('-created_at')
    }
    else {
        sparedyes = await SpareDye.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('dye').populate('location').populate('created_by').populate('updated_by').sort('-created_at')
    }
    result = sparedyes.map((dye) => {
        return {
            _id: dye._id,
            dye: { id: dye._id, value: String(dye.dye.dye_number), label: String(dye.dye.dye_number) },
            repair_required: dye.repair_required,
            is_validated: dye.is_validated,
            dye_photo: dye.dye_photo?.public_url || "",
            photo_time: dye.created_at && moment(dye.photo_time).format("LT"),
            remarks: dye.remarks || "",
            location: { id: dye.location._id, value: dye.location.name, label: dye.location.name },
            created_at: dye.created_at && moment(dye.created_at).format('LT'),
            updated_at: dye.updated_at && moment(dye.updated_at).format('LT'),
            created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
            updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
        }
    })
    return res.status(200).json(result)
}
export const GetSpareDyes = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dyes: ISpareDye[] = []
    let result: GetSpareDyeDto[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (!id) {
            if (user_ids.length > 0) {
                dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
                count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
            }

            else {
                dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
                count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
            }
        }


        if (id) {
            dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
            count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }
        result = dyes.map((dye) => {
            return {
                _id: dye._id,
                dye: { id: dye.dye._id, value: String(dye.dye.dye_number), label: String(dye.dye.dye_number) },
                repair_required: dye.repair_required,
                dye_photo: dye.dye_photo?.public_url || "",
                remarks: dye.remarks || "",
                is_validated: dye.is_validated,
                photo_time: dye.created_at && moment(dye.photo_time).format("LT"),
                location: { id: dye.location._id, value: dye.location.name, label: dye.location.name },
                created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                updated_at: dye.updated_at && moment(dye.updated_at).format("DD/MM/YYYY"),
                created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
                updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
            }
        })
        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(200).json({ message: "bad request" })
}
export const CreateSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditSpareDyeDto
    let { dye, location, repair_required, remarks } = body

    if (!location || !dye || !remarks)
        if (!dye || !location)
            return res.status(400).json({ message: "please fill all reqired fields" })

    let l1 = await DyeLocation.findById(location)
    let d1 = await Dye.findById(dye)
    if (!d1) {
        return res.status(404).json({ message: "dye not found" })
    }
    if (!l1) {
        return res.status(404).json({ message: "location not found" })
    }
    let dyeObj = new SpareDye({
        dye: d1, location: l1
    })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } }))
        return res.status(400).json({ message: "sorry ! this dye is in machine" })
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! dye is not available" })
    }


    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `dyestatus/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            dyeObj.dye_photo = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    dyeObj.created_at = new Date()
    dyeObj.updated_at = new Date()
    if (remarks)
        dyeObj.remarks = remarks;
    if (req.user)
        dyeObj.created_by = req.user
    dyeObj.repair_required = repair_required;
    if (req.user)
        dyeObj.updated_by = req.user
    dyeObj.photo_time = new Date()
    await dyeObj.save()
    return res.status(201).json(dyeObj)
}
export const UpdateSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditSpareDyeDto
    let { dye, location, repair_required, remarks } = body
    const id = req.params.id
    let dyeObj = await SpareDye.findById(id)
    if (!dyeObj)
        return res.status(404).json({ message: "dye not found" })
    if (!location || !dye || !remarks)
        if (!dye || !location)
            return res.status(400).json({ message: "please fill all reqired fields" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)

    if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } }))
        return res.status(400).json({ message: "sorry ! this dye is in machine" })

    if (dyeObj.dye._id.valueOf() !== dye)
        if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }

    let l1 = await DyeLocation.findById(location)
    let d1 = await Dye.findById(dye)
    if (!d1) {
        return res.status(404).json({ message: "dye not found" })
    }
    if (!l1) {
        return res.status(404).json({ message: "location not found" })
    }
    dyeObj.remarks = remarks;
    dyeObj.dye = d1;
    dyeObj.location = l1;
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `dyestatus/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            dyeObj.dye_photo = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    dyeObj.created_at = new Date()
    dyeObj.updated_at = new Date()
    if (req.user)
        dyeObj.created_by = req.user
    dyeObj.repair_required = repair_required;
    if (req.user)
        dyeObj.updated_by = req.user
    dyeObj.photo_time = new Date()
    await dyeObj.save()
    return res.status(201).json(dyeObj)
}
export const DeleteSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let dye = await SpareDye.findById(id)
    if (!dye)
        return res.status(404).json({ message: "spare dye not found" })
    dye.updated_at = new Date()
    if (req.user)
        dye.updated_by = req.user
    if (dye.dye_photo && dye.dye_photo._id)
        await destroyFile(dye.dye_photo._id)
    await dye.remove()
    return res.status(200).json(dye)
}

