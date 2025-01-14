import { IssueOrAddExpenseItemDto } from "../dtos/request/ExpenseDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class ExpenseService {
    public async IssueExpenseItem({ body, id }: { body: IssueOrAddExpenseItemDto, id?: string }) {
        return await apiClient.patch(`issue-expense-items/${id}`, body);
      };
      public async AddExpenseItem({ body, id }: { body: IssueOrAddExpenseItemDto, id?: string }) {
        return await apiClient.patch(`add-expense-items/${id}`, body);
    
      };
    
    
      public async GetExpenseStore() {
        return await apiClient.get('expense-store')
      }
      public async GetAllExpenseTransactions({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`expense-transactions/?start_date=${start_date}&end_date=${end_date}`)
      }
    }

