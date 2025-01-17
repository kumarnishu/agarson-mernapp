import { useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserContext } from './contexts/userContext'
import LoginPage from './pages/LoginPage.tsx'
import UsersPage from './pages/user/UsersPage.tsx'
import ResetPasswordDialog from './components/dialogs/users/ResetPasswordDialog.tsx'
import RemindersPage from './pages/crm/CrmRemindersPage.tsx'
import CitiesPage from './pages/authorization/CitiesPage.tsx'
import CrmStatesPage from './pages/authorization/CrmStatesPage.tsx'
import RefersPage from './pages/crm/RefersPage.tsx'
import CrmLeadSourcesPage from './pages/dropdowns/CrmSourcePage.tsx'
import CrmStagesPage from './pages/dropdowns/CrmStagesPage.tsx'
import CrmTypesPage from './pages/dropdowns/CrmleadTypesPage.tsx'
import CrmActivitiesPage from './pages/crm/CrmActivitiesReportPage.tsx'
import ShoeWeightPage from './pages/production/ShoeWeightPage.tsx'
import MachineCategoriesPage from './pages/dropdowns/MachineCategoriesPage.tsx'
import ProductionPage from './pages/production/ProductionPage.tsx'
import DyePage from './pages/dropdowns/DyesPage.tsx'
import ArticlePage from './pages/dropdowns/ArticlesPage.tsx'
import LeadsPage from './pages/crm/LeadsPage.tsx'
import MachinePage from './pages/dropdowns/MachinesPage.tsx'
import AssignedReferReportPage from './pages/crm/AssignedReferReportPage.tsx'
import NewReferReportPage from './pages/crm/NewReferReportPage.tsx'
import ShowWeightDifferenceReportPage from './pages/production/ShowWeightDifferenceReportPage.tsx'
import MachineWiseProductionReportPage from './pages/production/MachineWiseProductionReportPage.tsx'
import CategoryWiseProductionReportPage from './pages/production/CategoryWiseProductionReportPage.tsx'
import ThekedarWiseProductionReportPage from './pages/production/ThekedarWiseProductionReportPage.tsx'
import DyeStatusReportPage from './pages/production/DyeStatusReportPage.tsx'
import ChecklistCategoriesPage from './pages/dropdowns/ChecklistCategoriesPage.tsx'
import CheckListPage from './pages/checklist/CheckListPage.tsx'
import SpareDyesPage from './pages/production/SpareDyesPage.tsx'
import SoleThicknessPage from './pages/production/SoleThicknessPage.tsx'
import DyeLocationPage from './pages/dropdowns/DyeLocationPage.tsx'
import CheckListAdminPage from './pages/checklist/CheckListAdminPage.tsx'
import PaymentsPage from './pages/payments/PaymentsPage.tsx'
import PaymentCategoriesPage from './pages/dropdowns/PaymentCategoriesPage.tsx'
import KeysCategoriesPage from './pages/authorization/KeysCategoriesPage.tsx'
import KeysPage from './pages/authorization/KeysPage.tsx'
import ExcelDBPage from './pages/excel reports/ExcelDBPage.tsx'
import SalesmanLeavesReportPage from './pages/sales/SalesmanLeavesReportPage.tsx'
import UserAssignementPage from './pages/authorization/UserAssignementPage.tsx'
import SalesmanVisitPage from './pages/sales/SalesmanVisitPage.tsx'
import SalesmanAttendancePage from './pages/sales/SalesmanAttendancePage.tsx'
import SalesmanKpiPage from './pages/sales/SalesmanKpiPage.tsx'
import SalesmanAttendancePageAuto from './pages/sales/SalesmanVisitPageAuto.tsx'
import ItemUnitPage from './pages/dropdowns/ItemUnitPage.tsx'
import MainNavbar from './components/navbar/MainNavbar.tsx'
import AuthorizationNavbar from './components/navbar/AuthorizationNavbar.tsx'
import DropDownNavbar from './components/navbar/DropDownNavbar.tsx'
import ExcelDBNavbar from './components/navbar/ExcelDBNavbar.tsx'
import SalesNavbar from './components/navbar/SalesNavbar.tsx'
import MainDashBoard from './components/dashboards/MainDashBoard.tsx'
import AuthorizationDashboard from './components/dashboards/AuthorizationDashboard.tsx'
import DropDownDashboard from './components/dashboards/DropDownDashboard.tsx'
import ExcelDBDashboard from './components/dashboards/ExcelDBDashboard.tsx'
import SalesDashboard from './components/dashboards/SalesDashboard.tsx'
import UsersNavbar from './components/navbar/UsersNavbar.tsx'
import ReferencesReportPage from './pages/sales/ReferencesReportPage.tsx'
import ExpenseCategoriesPage from './pages/dropdowns/ExpenseCategoryPage.tsx'
import ExpenseLocationPage from './pages/dropdowns/ExpenseLocationPage.tsx'
import ExpenseItemsPage from './pages/dropdowns/ExpenseItemsPage.tsx'
import ExpenseStorePage from './pages/expense/ExpenseStorePage.tsx'
import ExpenseTransactionReports from './pages/expense/ExpenseTransactionReports.tsx'
import DriverAppSystemPage from './pages/driverapp/DriverAppSystemPage.tsx'
import ReferenceReportPageSalesman from './pages/sales/ReferenceReportPageSalesman.tsx'
import ProductionDashboard from './components/dashboards/ProductionDashboard.tsx'
import DriverAppDashboard from './components/dashboards/DriverAppDashboard.tsx'
import DriverAppNavbar from './components/navbar/DriverAppNavbar.tsx'
import ChecklistDashboard from './components/dashboards/ChecklistDashboard.tsx'
import ChecklistNavbar from './components/navbar/ChecklistNavbar.tsx'
import PaymentsNavbar from './components/navbar/PaymentsNavbar.tsx'
import ExpenseDashboard from './components/dashboards/ExpenseDashboard.tsx'
import CRMDashboard from './components/dashboards/CRMDashboard.tsx'
import CrmNavbar from './components/navbar/CrmNavbar.tsx'
import ProductionNavbar from './components/navbar/ProductionNavbar.tsx'
import PaymentsDashboard from './components/dashboards/PaymentsDashboard.tsx'
import ExpenseNavbar from './components/navbar/ExpenseNavbar.tsx'
import AttendanceNavbar from './components/navbar/AttendanceNavbar.tsx'
import AttendanceDashboard from './components/dashboards/AttendanceDashboard.tsx'
import LeavebalancePage from './pages/attendance/LeavebalancePage.tsx'
import SalesAttendanceReportPage from './pages/attendance/SalesAttendanceReportPage.tsx'
import EmailVerifyPage from './pages/EmailVerifyPage.tsx'
import LeavesPage from './pages/attendance/LeavesPage.tsx'
import ArticleStockPage from './pages/article stock/ArticleStockPage.tsx'
import ArticleConsumedStockpage from './pages/article stock/ArticleConsumedStockpage.tsx'
import ArticleStockSchmeNavbar from './components/navbar/ArticleStockSchmeNavbar.tsx'
import StockSchemeDashboard from './components/dashboards/StockSchemeDashboard.tsx'
import SalesReportPage from './pages/sales/SalesReportPage.tsx'
import CollectionReportPage from './pages/sales/CollectionReportPage.tsx'
import AgeingPage from './pages/sales/AgeingPage.tsx'
import SharedAgeingpage from './pages/excel reports/SharedAgeingpage.tsx'


function AppRoutes() {
  const { user } = useContext(UserContext)
  const [dialog, setDialog] = useState<string | undefined>()
  return (
    <Routes >
      {
        !user && <Route path="/Login" element={<LoginPage />} />}
      {
        user &&
        <Route>
          < Route path="/" element={<MainNavbar />
          }>
            <Route
              index
              element={
                <MainDashBoard />
              }
            />
          </Route>
          {user.role == "admin" && < Route path="/Users" element={
            <UsersNavbar />
          } >
            <Route index element={<UsersPage />} />
          </Route>}


          {user && user?.assigned_permissions.includes('attendnace_menu') &&
            < Route path="/Attendance" element={<AttendanceNavbar />} >
              <Route index element={
                <AttendanceDashboard />
              }
              />

              {user && <Route path="LeavebalancePage" element={
                <LeavebalancePage />
              }
              />}
              {user && <Route path="LeavesPage" element={
                <LeavesPage />
              }
              />}

              {user && <Route path="SalesAttendanceReportPage" element={
                <SalesAttendanceReportPage />
              }
              />}


            </Route>}
          {user && user?.assigned_permissions.includes('authorization_menu') &&
            < Route path="/Authorization" element={<AuthorizationNavbar />} >
              <Route index element={
                <AuthorizationDashboard />
              }
              />

              {user && <Route path="UserAssignementPage" element={
                <UserAssignementPage />
              }
              />}



              {user?.assigned_permissions.includes('city_view') && <Route path="CitiesPage" element={
                <CitiesPage />
              }
              />}

              {user?.assigned_permissions.includes('states_view') && <Route path='CrmStatesPage' element={
                <CrmStatesPage />
              }
              />}

              {user?.assigned_permissions.includes('key_category_view') && <Route
                path="KeysCategoriesPage" element={
                  <KeysCategoriesPage />
                }
              />}
              {user?.assigned_permissions.includes('key_view') && <Route
                path="KeysPage" element={
                  <KeysPage />
                }
              />}
            </Route>}

          {user && user?.assigned_permissions.includes('production_menu') &&
            < Route path="/Production" element={<ProductionNavbar />}>
              <Route index
                element={
                  <ProductionDashboard />
                }
              />
              {user?.assigned_permissions.includes('production_view') && <Route
                path="ProductionPage" element={
                  <ProductionPage />
                }
              />}
              {user?.assigned_permissions.includes('shoe_weight_view') && <Route
                path="ShoeWeightPage" element={
                  <ShoeWeightPage />
                }
              />}
              {user?.assigned_permissions.includes('spare_dye_view') && <Route
                path="SpareDyesPage" element={
                  <SpareDyesPage />
                }
              />}
              {user?.assigned_permissions.includes('sole_thickness_view') && <Route
                path="SoleThicknessPage" element={
                  <SoleThicknessPage />
                }
              />}
              {user?.assigned_permissions.includes('thekedar_wise_production_report_view') && <Route
                path="ThekedarWiseProductionReportPage" element={
                  <ThekedarWiseProductionReportPage />
                }
              />}
              {user?.assigned_permissions.includes('machine_category_wise_production_report_view') && <Route
                path="CategoryWiseProductionReportPage" element={
                  <CategoryWiseProductionReportPage />
                }
              />}
              {user?.assigned_permissions.includes('machine_wise_production_report_view') && <Route
                path="MachineWiseProductionReportPage" element={
                  <MachineWiseProductionReportPage />
                }
              />}
              {user?.assigned_permissions.includes('shoe_weight_report_view') && <Route
                path="ShowWeightDifferenceReportPage" element={
                  <ShowWeightDifferenceReportPage />
                }
              />}
              {user?.assigned_permissions.includes('dye_status_report_view') && <Route
                path="DyeStatusReportPage" element={
                  <DyeStatusReportPage />
                }
              />}
            </Route>}
          {user && user?.assigned_permissions.includes('crm_menu') &&
            < Route path="/CRM" element={<CrmNavbar />}>
              <Route index
                element={
                  <CRMDashboard />
                }
              />

              {user?.assigned_permissions.includes('leads_view') && <Route path="LeadsPage" element={
                <LeadsPage />
              }
              />}
              {user?.assigned_permissions.includes('refer_view') && <Route path="RefersPage" element={
                <RefersPage />
              }
              />}
              {user?.assigned_permissions.includes('reminders_view') && <Route path="RemindersPage" element={
                < RemindersPage />
              }
              />}
              {user?.assigned_permissions.includes('assignedrefer_view') && <Route path="AssignedReferReportPage" element={
                <AssignedReferReportPage />
              }
              />}
              {user?.assigned_permissions.includes('newrefer_view') && <Route path="NewReferReportPage" element={
                <NewReferReportPage />
              }
              />}
              {user?.assigned_permissions.includes('activities_view') && <Route path="CrmActivitiesPage" element={
                <CrmActivitiesPage />
              }
              />}
            </Route>}
          {user && user?.assigned_permissions.includes('expense_menu') &&
            < Route path="/Expense" element={<ExpenseNavbar />}>
              <Route index
                element={
                  <ExpenseDashboard />
                }
              />

              {user?.assigned_permissions.includes('expense_store_view') && <Route
                path="ExpenseStorePage" element={
                  <ExpenseStorePage />
                }
              />}

              {user?.assigned_permissions.includes('expense-transaction_report_view') && <Route path="ExpenseTransactionReports" element={
                <ExpenseTransactionReports />
              }
              />}

            </Route>}
          {user && user?.assigned_permissions.includes('payment_menu') &&
            < Route path="/Payments" element={<PaymentsNavbar />}>
              <Route index
                element={
                  <PaymentsDashboard />
                }
              />

              {user?.assigned_permissions.includes('payments_view') && <Route path="PaymentsPage" element={
                < PaymentsPage />
              }
              />}


            </Route>}
          {user && user?.assigned_permissions.includes('checklist_menu') &&
            < Route path="/Checklists" element={<ChecklistNavbar />}>
              <Route index
                element={
                  <ChecklistDashboard />
                }
              />
              {user?.assigned_permissions.includes('checklist_view') && <Route path="CheckListPage" element={
                < CheckListPage />
              }
              />}
              {user?.assigned_permissions.includes('checklist_admin_view') && <Route path="CheckListAdminPage" element={
                < CheckListAdminPage />
              }
              />}
            </Route>}
          {user && user?.assigned_permissions.includes('driver_app_menu') &&
            < Route path="/DriverApp" element={<DriverAppNavbar />}>
              <Route index
                element={
                  <DriverAppDashboard />
                }
              />
              {user?.assigned_permissions.includes('driver_system_view') && <Route
                path="DriverAppSystemPage" element={
                  <DriverAppSystemPage />
                }
              />}
            </Route>}

          {user && user?.assigned_permissions.includes('dropdown_menu') &&
            < Route path="/DropDown" element={<DropDownNavbar />}>
              <Route index element={
                <DropDownDashboard />
              }
              />

              {user?.assigned_permissions.includes('machine_category_view') && <Route
                path="MachineCategoriesPage" element={
                  <MachineCategoriesPage />
                }
              />}
              {user?.assigned_permissions.includes('dye_location_view') && <Route
                path="DyeLocationsPage" element={
                  <DyeLocationPage />
                }
              />}
              {user?.assigned_permissions.includes('machine_view') && <Route
                path="MachinePage" element={
                  <MachinePage />
                }
              />}
              {user?.assigned_permissions.includes('dye_view') && <Route
                path="DyePage" element={
                  <DyePage />
                }
              />}
              {user?.assigned_permissions.includes('article_view') && <Route
                path="ArticlePage" element={
                  <ArticlePage />
                }
              />}

              {user?.assigned_permissions.includes('lead_source_view') && <Route path="LeadSourcesPage" element={
                <CrmLeadSourcesPage />
              }
              />}
              {user?.assigned_permissions.includes('leadstage_view') && <Route path="StagesPage" element={
                <CrmStagesPage />
              }
              />}

              {user?.assigned_permissions.includes('leadtype_view') && <Route path='LeadTypesPage' element={
                <CrmTypesPage />
              }
              />}


              {user?.assigned_permissions.includes('checklist_category_view') && <Route
                path="ChecklistCategoriesPage" element={
                  <ChecklistCategoriesPage />
                }
              />}
              {user?.assigned_permissions.includes('payment_category_view') && <Route
                path="PaymentCategoriesPage" element={
                  <PaymentCategoriesPage />
                }
              />}
              {user?.assigned_permissions.includes('expense_category_view') && <Route
                path="ExpenseCategoriesPage" element={
                  <ExpenseCategoriesPage />
                }
              />}
              {user?.assigned_permissions.includes('item_unit_view') && <Route
                path="ItemUnitPage" element={
                  <ItemUnitPage />
                }
              />}
              {user?.assigned_permissions.includes('expense_location_view') && <Route
                path="ExpenseLocationPage" element={
                  <ExpenseLocationPage />
                }
              />}

              {user?.assigned_permissions.includes('expense_item_view') && <Route
                path="ExpenseItemsPage" element={
                  <ExpenseItemsPage />
                }
              />}
            </Route>}

          {user && user?.assigned_permissions.includes('excel_db_menu') &&
            < Route path="/ExcelDB" element={<ExcelDBNavbar />}>
              <Route index
                element={
                  <ExcelDBDashboard />
                }
              />

              {user?.assigned_permissions.includes('grp_excel_view') && <Route
                path="ExcelDbReports/:id" element={
                  <ExcelDBPage />
                }
              />}


            </Route>}


          {user && user?.assigned_permissions.includes('article_stock_scheme_view') &&
            < Route path="/ArticleStockScheme" element={<ArticleStockSchmeNavbar />}>
              <Route index
                element={
                  <StockSchemeDashboard />
                }
              />

              {user?.assigned_permissions.includes('consumed_stock_view') && <Route
                path="ArticleStockPage" element={
                  <ArticleStockPage />
                }
              />}

              {user?.assigned_permissions.includes('consumed_stock_view') && <Route
                path="ArticleConsumedStockpage" element={
                  <ArticleConsumedStockpage />
                }
              />}


            </Route>}


          {user && user?.assigned_permissions.includes('sales_menu') &&
            < Route path="/Sales" element={<SalesNavbar />}>
              <Route index
                element={
                  <SalesDashboard />
                }
              />
              
              {user?.assigned_permissions.includes('salesman_visit_view') && <Route
                path="SalesmanVisit" element={
                  <SalesmanVisitPage />
                }
              />}

              {user?.assigned_permissions.includes('salesman_attendance_view') && <Route
                path="SalesmanAttendance" element={
                  <SalesmanAttendancePage />
                }
              />}

              {user?.assigned_permissions.includes('salesman_attendance_auto_view') && <Route
                path="SalesmanAttendanceAuto" element={
                  <SalesmanAttendancePageAuto />
                }
              />}

              {user?.assigned_permissions.includes('salesman_kpi_view') && <Route
                path="SalesmanKPI" element={
                  <SalesmanKpiPage />
                }
              />}
              {user?.assigned_permissions.includes('salesman_leaves_report_view') && <Route
                path="SalesmanLeavesReportPage" element={
                  <SalesmanLeavesReportPage />
                }
              />}
              {user?.assigned_permissions.includes('references_report_view') && <Route
                path="ReferencesReportPage" element={
                  <ReferencesReportPage />
                }
              />}
              {user?.assigned_permissions.includes('salesman_references_report_view') && <Route
                path="ReferenceReportPageSalesman" element={
                  <ReferenceReportPageSalesman />
                }
              />}
              {user?.assigned_permissions.includes('sales_view') && <Route
                path="SalesReportPage" element={
                  <SalesReportPage />
                }
              />}
              {user?.assigned_permissions.includes('collections_view') && <Route
                path="CollectionReportPage" element={
                  <CollectionReportPage />
                }
              />}
              {user?.assigned_permissions.includes('ageing_view') && <Route
                path="AgeingPage" element={
                  <AgeingPage />
                }
              />}
              {user?.assigned_permissions.includes('ageing_view') && <Route
                path="SharedAgeingpage" element={
                  <SharedAgeingpage />
                }
              />}

            </Route>}

        </Route>
      }

      <Route path="/ResetPassword/:token" element={<ResetPasswordDialog dialog={dialog} setDialog={setDialog} />} />
      <Route path="/VerifyEmail/:token" element={<EmailVerifyPage />} />
      {user && <Route path="*" element={<Navigate to="/" />} />}
      <Route path="*" element={<Navigate to="/Login" />} />

    </Routes >

  )
}

export default AppRoutes




