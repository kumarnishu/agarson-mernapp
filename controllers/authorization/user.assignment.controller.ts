import { NextFunction, Request, Response } from 'express';
import { AssignPermissionForMultipleUserDto, AssignPermissionForOneUserDto, GetUserDto, IMenu } from "../../dtos";
import { User } from "../../models/user";
import moment from 'moment';
import { FetchAllPermissions } from '../../utils/fillAllPermissions';

export const GetUsersForAssignmentPage = async (req: Request, res: Response, next: NextFunction) => {
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
