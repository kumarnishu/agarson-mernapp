import { apiClient } from "./utils/AxiosInterceptor";


// login
export const Login = async (
  body: {
    username: string,
    password: string,
    multi_login_token?: string
  }
) => {
  return await apiClient.post("login", body);
};

// signup new organization and owner
export const Signup = async (body: FormData) => {
  return await apiClient.post("signup", body);
};
// new user
export const NewUser = async (body: FormData) => {
  return await apiClient.post("user_dropdowns", body);
};
export const NewCustomer = async (body: FormData) => {
  return await apiClient.post("customers", body);
};
// update user
export const UpdateUser = async ({ id, body }: { id: string, body: FormData }) => {
  return await apiClient.put(`users/${id}`, body);
};

// logout
export const Logout = async () => {
  return await apiClient.post("logout");
};
// get users


export const GetUsersForDropdown = async ({ hidden, permission, show_assigned_only }: { hidden?: boolean, show_assigned_only?: boolean, permission?: string }) => {
  return await apiClient.get(`users/dropdown/?permission=${permission}&hidden=${hidden}&show_assigned_only=${show_assigned_only}`)
}


export const GetUsersForAssignment = async () => {
  return await apiClient.get(`users/assignment`)
}

export const GetUsers = async ({ hidden }: { hidden?: boolean }) => {
  return await apiClient.get(`users/?hidden=${hidden}`)
}

export const GetPermissions = async () => {
  return await apiClient.get(`permissions`)
}


// block user
export const BlockUser = async (id: string) => {
  return await apiClient.patch(`block/user/${id}`)
}
export const ToogleSHowVisitingCard = async (id: string) => {
  return await apiClient.patch(`tooglevisitingcardleads/user/${id}`)
}


export const ResetMultiLogin = async (id: string) => {
  return await apiClient.patch(`allow/multi_login/${id}`)
}
export const BlockMultiLogin = async (id: string) => {
  return await apiClient.patch(`block/multi_login/${id}`)
}
// unblock user
export const UnBlockUser = async (id: string) => {
  return await apiClient.patch(`unblock/user/${id}`)
}



// make admin
export const MakeAdmin = async (id: string) => {
  return await apiClient.patch(`make-admin/user/${id}`)
}
// revoke permissions of a admin 
export const RemoveAdmin = async (id: string) => {
  return await apiClient.patch(`remove-admin/user/${id}`)
}
// get profile
export const GetProfile = async () => {
  return await apiClient.get("profile");
};
// update profile
export const UpdateProfile = async (body: FormData) => {
  return await apiClient.put("profile", body);
};

// //update password
export const UpdatePassword = async (body: { oldPassword: string, newPassword: string, confirmPassword: string }) => {
  return await apiClient.patch("password/update", body)
};
export const UpdateUserPassword = async ({ id, body }: { id: string, body: { newPassword: string, confirmPassword: string } }) => {
  return await apiClient.patch(`password/reset/${id}`, body)
};
// //update password
export const ResetPassword = async ({ token, body }:
  {
    token: string,
    body: { newPassword: string, confirmPassword: string }
  }) => {
  return await apiClient.patch(`password/reset/${token}`, body)
};

// send reset password
export const ResetPasswordSendMail = async ({ email }:
  {
    email: string
  }) => {
  return await apiClient.post(`password/reset`, { email: email })
};

// verify email
export const VerifyEmail = async (token: string) => {
  return await apiClient.patch(`email/verify/${token}`)
};

// send verification main
export const SendVerifyEmail = async ({ email }:
  {
    email: string
  }) => {
  return await apiClient.post(`email/verify`, { email: email })
};

export const AssignUsers = async ({ id, body }: { id: string, body: { ids: string[] } }) => {
  return await apiClient.patch(`assign/users/${id}`, body)
}

export const AssignPermissionsToOneUser = async ({ body }: {
  body: {
    user_id: string,
    permissions: string[]
  }
}) => {
  return await apiClient.post(`permissions/one`, body)
}



export const AssignPermissionsToUsers = async ({ body }: {
  body: {
    user_ids: string[],
    permissions: string[],
    flag: number
  }
}) => {
  return await apiClient.post(`permissions`, body)
}


