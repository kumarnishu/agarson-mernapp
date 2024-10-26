import { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserContext } from './contexts/userContext'
import LoginPage from './pages/LoginPage.tsx'
import UsersPage from './pages/features/UsersPage.tsx'
import EmailVerifyPage from './pages/EmailVerifyPage.tsx'
import ResetPasswordDialog from './components/dialogs/users/ResetPasswordDialog.tsx'
import ReportDashboard from './dashboards/ReportsDashboard.tsx'
import DropDownDashboard from './dashboards/DropDownDashboard.tsx'
import MainDashBoardPage from './dashboards/MainDashBoardPage.tsx'
import RemindersPage from './pages/features/CrmRemindersPage.tsx'
import CitiesPage from './pages/dropdowns/CitiesPage.tsx'
import CrmStatesPage from './pages/dropdowns/CrmStatesPage.tsx'
import RefersPage from './pages/features/RefersPage.tsx'
import CrmLeadSourcesPage from './pages/dropdowns/CrmSourcePage.tsx'
import CrmStagesPage from './pages/dropdowns/CrmStagesPage.tsx'
import CrmTypesPage from './pages/dropdowns/CrmleadTypesPage.tsx'
import CrmActivitiesPage from './pages/reports/CrmActivitiesReportPage.tsx'
import PartyTargetReportsPage from './pages/reports/PartyTargetReportPage.tsx'
import SaleAnalysisReport from './pages/reports/SaleAnalysisReport.tsx'
import ShoeWeightPage from './pages/features/ShoeWeightPage.tsx'
import MachineCategoriesPage from './pages/dropdowns/MachineCategoriesPage.tsx'
import ProductionPage from './pages/features/ProductionPage.tsx'
import DyePage from './pages/dropdowns/DyesPage.tsx'
import ArticlePage from './pages/dropdowns/ArticlesPage.tsx'
import ErpStatesPage from './pages/dropdowns/ErpStatesPage.tsx'
import PendingOrdersReport from './pages/reports/PendingOrdersReport.tsx'
import ClientSaleReportsPage from './pages/reports/ClientSaleReportsPage.tsx'
import ClientSaleLastYearReportsPage from './pages/reports/ClientSaleReportsPageLastyear.tsx'
import BillsAgingReportPage from './pages/reports/BillsAgingReportPage.tsx'
import LeadsPage from './pages/features/LeadsPage.tsx'
import MachinePage from './pages/dropdowns/MachinesPage.tsx'
import AssignedReferReportPage from './pages/reports/AssignedReferReportPage.tsx'
import NewReferReportPage from './pages/reports/NewReferReportPage.tsx'
import ShowWeightDifferenceReportPage from './pages/reports/ShowWeightDifferenceReportPage.tsx'
import MachineWiseProductionReportPage from './pages/reports/MachineWiseProductionReportPage.tsx'
import CategoryWiseProductionReportPage from './pages/reports/CategoryWiseProductionReportPage.tsx'
import ThekedarWiseProductionReportPage from './pages/reports/ThekedarWiseProductionReportPage.tsx'
import DyeStatusReportPage from './pages/reports/DyeStatusReportPage.tsx'
import ChecklistCategoriesPage from './pages/dropdowns/CategoriesPage.tsx'
import CheckListPage from './pages/features/CheckListPage.tsx'
import SpareDyesPage from './pages/features/SpareDyesPage.tsx'
import SoleThicknessPage from './pages/features/SoleThicknessPage.tsx'
import DyeLocationPage from './pages/dropdowns/DyeLocationPage.tsx'
import FeatureDashboard from './dashboards/FeatureDashboard.tsx'
import ErpEmployeesPage from './pages/reports/ErpEmployeesPage.tsx'
import VisitReportPage from './pages/reports/VisitReportPage.tsx'
import MaintenancePage from './pages/features/MaintenancePage.tsx'
import MaintenanceCategoriesPage from './pages/dropdowns/MaintenanceCategoriesPage.tsx'


function AppRoutes() {
  const { user } = useContext(UserContext)

  return (
    <Routes >
      {
        !user && <Route path="/Login" element={<LoginPage />} />}


      {
        user && <Route path="/"
          element={
            <MainDashBoardPage />
          }>

          {user?.is_admin &&
            < Route path="Users">
              <Route index
                element={
                  <UsersPage />
                }
              />
            </Route>}

          {user && user?.assigned_permissions.includes('feature_menu') &&
            < Route path="Features">
              <Route index
                element={
                  <FeatureDashboard />
                }
              />
              {user?.is_admin &&
                < Route path="Users" element={
                  <UsersPage />
                }>
                </Route>}
              {user?.assigned_permissions.includes('production_view') && <Route
                path="ProductionPage" element={
                  <ProductionPage />
                }
              />}
              {user?.assigned_permissions.includes('shoe_weight_view') &&<Route
                path="ShoeWeightPage" element={
                  <ShoeWeightPage />
                }
              />}
              {user?.assigned_permissions.includes('spare_dye_view') &&<Route
                path="SpareDyesPage" element={
                  <SpareDyesPage />
                }
              />}
               {user?.assigned_permissions.includes('leads_view') &&<Route path="LeadsPage" element={
                <LeadsPage />
              }
              />}
              {user?.assigned_permissions.includes('refer_view') &&<Route path="RefersPage" element={
                <RefersPage />
              }
              />}
              {user?.assigned_permissions.includes('reminders_view') &&<Route path="RemindersPage" element={
                < RemindersPage />
              }
              />}
              {user?.assigned_permissions.includes('checklist_view') &&<Route path="CheckListPage" element={
                < CheckListPage />
              }
              />}
              {user?.assigned_permissions.includes('checklist_view') && <Route path="CheckListPage" element={
                < CheckListPage />
              }
              />}
              {user?.assigned_permissions.includes('sole_thickness_view') &&<Route
                path="SoleThicknessPage" element={
                  <SoleThicknessPage />
                }
              />}
              {user?.is_admin && <Route path="MaintenancePage" element={
                <MaintenancePage />
              }
              />}
            </Route>}

          {user && user?.assigned_permissions.includes('report_menu') &&
            < Route path="Reports">
              <Route index
                element={
                  <ReportDashboard />
                }
              />

              
              {user?.assigned_permissions.includes('visit_report_view') && <Route
                path="VisitReportPage" element={
                  <VisitReportPage />
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
              {user?.assigned_permissions.includes('activities_view') && <Route path="CrmActivitiesPage" element={
                <CrmActivitiesPage />
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
              {user?.assigned_permissions.includes('pending_orders_view') && <Route path="PendingOrdersReport" element={

                < PendingOrdersReport />

              }
              />} {user?.assigned_permissions.includes('client_sale_report_view') && <Route path="ClientSaleReportsPage" element={

                < ClientSaleReportsPage />


              }
              />}
              {user?.assigned_permissions.includes('last_year_client_sale_report_view') && <Route path="ClientSaleLastYearReportsPage" element={

                < ClientSaleLastYearReportsPage />


              }
              />}
              {user?.assigned_permissions.includes('bills_ageing_view') && <Route path="BillsAgingReportPage" element={

                < BillsAgingReportPage />


              }
              />}
              {user?.assigned_permissions.includes('party_target_view') && <Route path="PartyTargetReportsPage" element={

                < PartyTargetReportsPage />


              }
              />}
              {user?.assigned_permissions.includes('sale_analysis_view') && <Route path="SaleAnalysisReport" element={
                < SaleAnalysisReport />
              }
              />}
              {user?.assigned_permissions.includes('maintenance_view') && <Route path="MaintenancePage" element={
                < MaintenancePage />
              }
              />}
            </Route>}


          {user && user?.assigned_permissions.includes('dropdown_menu') &&
            < Route path="DropDown" >
              <Route index element={
                <DropDownDashboard />
              }
              />

              {user?.assigned_permissions.includes('machine_category_view') &&<Route
                path="MachineCategoriesPage" element={
                  <MachineCategoriesPage />
                }
              />}

              {user?.assigned_permissions.includes('maintenance_category_view') && <Route
                path="MaintenanceCategoriesPage" element={
                  <MaintenanceCategoriesPage />
                }
              />}

              {user?.assigned_permissions.includes('dye_location_view') &&<Route
                path="DyeLocationsPage" element={
                  <DyeLocationPage />
                }
              />}
              {user?.assigned_permissions.includes('machine_view') &&<Route
                path="MachinePage" element={
                  <MachinePage />
                }
              />}
              {user?.assigned_permissions.includes('dye_view') &&<Route
                path="DyePage" element={
                  <DyePage />
                }
              />}
              {user?.assigned_permissions.includes('article_view') &&<Route
                path="ArticlePage" element={
                  <ArticlePage />
                }
              />}
              {user?.assigned_permissions.includes('city_view') &&<Route path="CitiesPage" element={
                <CitiesPage />
              }
              />}
              {user?.assigned_permissions.includes('lead_source_view') &&<Route path="LeadSourcesPage" element={
                <CrmLeadSourcesPage />
              }
              />}
              {user?.assigned_permissions.includes('leadstage_view') &&<Route path="StagesPage" element={
                <CrmStagesPage />
              }
              />}
              {user?.assigned_permissions.includes('states_view') &&<Route path='CrmStatesPage' element={
                <CrmStatesPage />
              }
              />}
              {user?.assigned_permissions.includes('leadtype_view') &&<Route path='LeadTypesPage' element={
                <CrmTypesPage />
              }
              />}
              {user?.assigned_permissions.includes('erp_state_view') &&<Route
                path="ErpStatesPage" element={
                  <ErpStatesPage />
                }
              />}
              {user?.assigned_permissions.includes('erp_employee_view') && <Route
                path="ErpEmployeesPage" element={
                  <ErpEmployeesPage />
                }
              />}
              {user?.assigned_permissions.includes('checklist_category_view') &&<Route
                path="ChecklistCategoriesPage" element={
                  <ChecklistCategoriesPage />
                }
              />}
            </Route>}
        </Route>
      }

      <Route path="/ResetPassword/:token" element={<ResetPasswordDialog />} />
      <Route path="/VerifyEmail/:token" element={<EmailVerifyPage />} />
      {user && <Route path="*" element={<Navigate to="/" />} />}
      <Route path="*" element={<Navigate to="/Login" />} />

    </Routes >

  )
}

export default AppRoutes




