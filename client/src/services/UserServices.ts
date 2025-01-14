import { CreateLoginByThisUserDto } from "../dtos/request/UserDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class UserService {
  public async Login(
    body: {
      username: string,
      password: string,
      multi_login_token?: string
    }
  ) {
    return await apiClient.post("login", body);
  };
  public async LoginByThisUser(
    { body }: { body: CreateLoginByThisUserDto }
  ) {
    return await apiClient.post("loginbythisuser", body);
  };
  public async Signup(body: FormData) {
    return await apiClient.post("signup", body);
  };
  public async NewUser(body: FormData) {
    return await apiClient.post("users", body);
  };
  public async NewCustomer(body: FormData) {
    return await apiClient.post("customers", body);
  };
  public async UpdateUser({ id, body }: { id: string, body: FormData }) {
    return await apiClient.put(`users/${id}`, body);
  };
  public async Logout() {
    return await apiClient.post("logout");
  };
  public async GetUsersForDropdown({ hidden, permission, show_assigned_only }: { hidden?: boolean, show_assigned_only?: boolean, permission?: string }) {
    return await apiClient.get(`users/dropdown/?permission=${permission}&hidden=${hidden}&show_assigned_only=${show_assigned_only}`)
  }
  public async GetUsersForAssignment() {
    return await apiClient.get(`users/assignment`)
  }
  public async GetUsers({ hidden }: { hidden?: boolean }) {
    return await apiClient.get(`users/?hidden=${hidden}`)
  }
  public async GetPermissions() {
    return await apiClient.get(`permissions`)
  }
  public async BlockUser(id: string) {
    return await apiClient.patch(`block/user/${id}`)
  }
  public async ToogleSHowVisitingCard(id: string) {
    return await apiClient.patch(`tooglevisitingcardleads/user/${id}`)
  }
  public async ResetMultiLogin(id: string) {
    return await apiClient.patch(`allow/multi_login/${id}`)
  }
  public async BlockMultiLogin(id: string) {
    return await apiClient.patch(`block/multi_login/${id}`)
  }
  public async UnBlockUser(id: string) {
    return await apiClient.patch(`unblock/user/${id}`)
  }
  public async MakeAdmin(id: string) {
    return await apiClient.patch(`make-admin/user/${id}`)
  }
  public async RemoveAdmin(id: string) {
    return await apiClient.patch(`remove-admin/user/${id}`)
  }
  public async GetProfile() {
    return await apiClient.get("profile");
  };
  public async UpdateProfile(body: FormData) {
    return await apiClient.put("profile", body);
  };
  public async UpdatePassword(body: { oldPassword: string, newPassword: string, confirmPassword: string }) {
    return await apiClient.patch("password/update", body)
  };
  public async UpdateUserPassword({ id, body }: { id: string, body: { newPassword: string, confirmPassword: string } }) {
    return await apiClient.patch(`password/reset/${id}`, body)
  };
  public async ResetPassword({ token, body }:
    {
      token: string,
      body: { newPassword: string, confirmPassword: string }
    }) {
    return await apiClient.patch(`password/reset/${token}`, body)
  };
  public async ResetPasswordSendMail({ email }:
    {
      email: string
    }) {
    return await apiClient.post(`password/reset`, { email: email })
  };
  public async VerifyEmail(token: string) {
    return await apiClient.patch(`email/verify/${token}`)
  };
  public async SendVerifyEmail({ email }:
    {
      email: string
    }) {
    return await apiClient.post(`email/verify`, { email: email })
  };
  public async AssignUsers({ id, body }: { id: string, body: { ids: string[] } }) {
    return await apiClient.patch(`assign/users/${id}`, body)
  }
  public async AssignPermissionsToOneUser({ body }: {
    body: {
      user_id: string,
      permissions: string[]
    }
  }) {
    return await apiClient.post(`permissions/one`, body)
  }
  public async AssignPermissionsToUsers({ body }: {
    body: {
      user_ids: string[],
      permissions: string[],
      flag: number
    }
  }) {
    return await apiClient.post(`permissions`, body)
  }
}




