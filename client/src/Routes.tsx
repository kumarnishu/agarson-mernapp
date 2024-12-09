import { useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserContext } from './contexts/userContext'
import LoginPage from './pages/LoginPage.tsx'
import UsersPage from './pages/authorization/UsersPage.tsx'
import EmailVerifyPage from './pages/EmailVerifyPage.tsx'
import ResetPasswordDialog from './components/dialogs/users/ResetPasswordDialog.tsx'
import RemindersPage from './pages/features/CrmRemindersPage.tsx'
import CitiesPage from './pages/authorization/CitiesPage.tsx'
import CrmStatesPage from './pages/authorization/CrmStatesPage.tsx'
import RefersPage from './pages/features/RefersPage.tsx'
import CrmLeadSourcesPage from './pages/dropdowns/CrmSourcePage.tsx'
import CrmStagesPage from './pages/dropdowns/CrmStagesPage.tsx'
import CrmTypesPage from './pages/dropdowns/CrmleadTypesPage.tsx'
import CrmActivitiesPage from './pages/feature reports/CrmActivitiesReportPage.tsx'
import ShoeWeightPage from './pages/features/ShoeWeightPage.tsx'
import MachineCategoriesPage from './pages/dropdowns/MachineCategoriesPage.tsx'
import ProductionPage from './pages/features/ProductionPage.tsx'
import DyePage from './pages/dropdowns/DyesPage.tsx'
import ArticlePage from './pages/dropdowns/ArticlesPage.tsx'
import LeadsPage from './pages/features/LeadsPage.tsx'
import MachinePage from './pages/dropdowns/MachinesPage.tsx'
import AssignedReferReportPage from './pages/feature reports/AssignedReferReportPage.tsx'
import NewReferReportPage from './pages/feature reports/NewReferReportPage.tsx'
import ShowWeightDifferenceReportPage from './pages/feature reports/ShowWeightDifferenceReportPage.tsx'
import MachineWiseProductionReportPage from './pages/feature reports/MachineWiseProductionReportPage.tsx'
import CategoryWiseProductionReportPage from './pages/feature reports/CategoryWiseProductionReportPage.tsx'
import ThekedarWiseProductionReportPage from './pages/feature reports/ThekedarWiseProductionReportPage.tsx'
import DyeStatusReportPage from './pages/feature reports/DyeStatusReportPage.tsx'
import ChecklistCategoriesPage from './pages/dropdowns/ChecklistCategoriesPage.tsx'
import CheckListPage from './pages/features/CheckListPage.tsx'
import SpareDyesPage from './pages/features/SpareDyesPage.tsx'
import SoleThicknessPage from './pages/features/SoleThicknessPage.tsx'
import DyeLocationPage from './pages/dropdowns/DyeLocationPage.tsx'
import CheckListAdminPage from './pages/features/CheckListAdminPage.tsx'
import PaymentsPage from './pages/features/PaymentsPage.tsx'
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
import FeatureNavbar from './components/navbar/FeatureNavbar.tsx'
import FeatureReportsNavbar from './components/navbar/FeatureReportsNavbar.tsx'
import DropDownNavbar from './components/navbar/DropDownNavbar.tsx'
import ExcelDBNavbar from './components/navbar/ExcelDBNavbar.tsx'
import SalesNavbar from './components/navbar/SalesNavbar.tsx'
import MainDashBoard from './components/dashboards/MainDashBoard.tsx'
import AuthorizationDashboard from './components/dashboards/AuthorizationDashboard.tsx'
import DropDownDashboard from './components/dashboards/DropDownDashboard.tsx'
import ExcelDBDashboard from './components/dashboards/ExcelDBDashboard.tsx'
import FeatureDashboard from './components/dashboards/FeatureDashboard.tsx'
import SalesDashboard from './components/dashboards/SalesDashboard.tsx'
import FeatureReportsDashboard from './components/dashboards/FeatureReportsDashboard.tsx'
import UsersNavbar from './components/navbar/UsersNavbar.tsx'
import ReferencesReportPage from './pages/sales/ReferencesReportPage.tsx'
import ExpenseCategoriesPage from './pages/dropdowns/ExpenseCategoryPage.tsx'
import ExpenseLocationPage from './pages/dropdowns/ExpenseLocationPage.tsx'


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
          < Route path="/Users" element={
            <UsersNavbar />
          } >
            <Route index element={<UsersPage />} />
          </Route>

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

          {user && user?.assigned_permissions.includes('feature_menu') &&
            < Route path="/Features" element={<FeatureNavbar />}>
              <Route index
                element={
                  <FeatureDashboard />
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

              {user?.assigned_permissions.includes('checklist_view') && <Route path="CheckListPage" element={
                < CheckListPage />
              }
              />}
              {user?.assigned_permissions.includes('checklist_view') && <Route path="CheckListPage" element={
                < CheckListPage />
              }
              />}
              {user?.assigned_permissions.includes('checklist_admin_view') && <Route path="CheckListAdminPage" element={
                < CheckListAdminPage />
              }
              />}
              {user?.assigned_permissions.includes('payments_view') && <Route path="PaymentsPage" element={
                < PaymentsPage />
              }
              />}
              {user?.assigned_permissions.includes('excel_db_view') && <Route path="ExcelDBPage" element={
                < ExcelDBPage />
              }
              />}


              {user?.assigned_permissions.includes('sole_thickness_view') && <Route
                path="SoleThicknessPage" element={
                  <SoleThicknessPage />
                }
              />}
            </Route>}

          {user && user?.assigned_permissions.includes('report_menu') &&
            < Route path="/FeatureReports" element={<FeatureReportsNavbar />}>
              <Route index
                element={
                  <FeatureReportsDashboard />
                }
              />
              {user?.assigned_permissions.includes('activities_view') && <Route path="CrmActivitiesPage" element={
                <CrmActivitiesPage />
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

              {user?.assigned_permissions.includes('assignedrefer_view') && <Route path="AssignedReferReportPage" element={
                <AssignedReferReportPage />
              }
              />}
              {user?.assigned_permissions.includes('newrefer_view') && <Route path="NewReferReportPage" element={
                <NewReferReportPage />
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




