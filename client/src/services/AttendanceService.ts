import { ApplyLeaveDtoFromAdmin, CreateOrEditLeaveBalanceDto } from "../dtos/request/AttendanceDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class AttendanceService {


  public async GetAttendanceReport(
    { yearmonth }: { yearmonth: number }
  ) {
    return await apiClient.get(`attendance-report/?yearmonth=${yearmonth}`);
  };

  public async GetLeaves(status: string) {
    return await apiClient.get(`leaves/?status=${status}`);
  };
  public async GetPendingLeaves() {
    return await apiClient.get(`leaves/pending`);
  };
  public async ApplyLeaveFromAdmin({ body }: { body: ApplyLeaveDtoFromAdmin }) {
    return await apiClient.post(`apply-leave/admin`, body);
  };
  public async ApplyLeave({ body }: { body: FormData }) {
    return await apiClient.post(`apply-leave`, body);
  };

  public async ApproveOrRejectLeave({ body, id }: { body: { status: string }, id: string }) {
    return await apiClient.post(`approve-reject-leave/${id}`, body);
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

