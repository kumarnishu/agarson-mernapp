import { CreateOrEditLeaveBalanceDto } from "../dtos/leave.dto";
import { apiClient } from "./utils/AxiosInterceptor";

export class AttendanceService {


  // public async CreateOrEditLeaveBalance({ body, id }: { body: CreateOrEditLeaveDto, id?: string }) {
  //   if (id)
  //     return await apiClient.put(`leaves-balance/${id}`, body);
  //   return await apiClient.post(`leaves-balance`, body);
  // };

  // public async DeleteLeaveBalance(id: string) {
  //   return await apiClient.delete(`leaves-balance/${id}`);
  // };

  public async GetLeaves(status: string) {
    return await apiClient.get(`leaves/?status=${status}`);
  };
  public async CreateOrEditLeaveBalance({ body, id }: { body: CreateOrEditLeaveBalanceDto, id?: string }) {
    if (id)
      return await apiClient.put(`leaves-balance/${id}`, body);
    return await apiClient.post(`leaves-balance`, body);
  };

  public async DeleteLeaveBalance(id: string) {
    return await apiClient.delete(`leaves-balance/${id}`);
  };

  public async GetLeaveBalances() {
    return await apiClient.get(`leaves-balance/`);
  };
}

