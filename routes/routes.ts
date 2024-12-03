import multer from "multer";
import express from "express";
const router = express.Router()
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 50 } })
import { GetArticles, CreateArticle, UpdateArticle, ToogleArticle, BulkUploadArticle } from "../controllers/articles";
import { CreateSalesAttendance, DeleteSalesAttendance, GetSalesAttendances, GetSalesManKpi, UpdateSalesAttendance } from "../controllers/sale-attendance";
import { isAdmin, isAuthenticatedUser, isProfileAuthenticated } from "../middlewares/auth.middleware";
import { MakeAdmin, AllowMultiLogin, BlockMultiLogin, BlockUser, UnBlockUser, RemoveAdmin, Login, Logout, updatePassword, resetUserPassword, ResetPassword, VerifyEmail, GetAllPermissions, AssignPermissionsToUsers, AssignPermissionsToOneUser } from "../controllers/auth";
import { GetAllChecklistCategory, CreateChecklistCategory, UpdateChecklistCategory, DeleteChecklistCategory } from "../controllers/checklist-category";
import { GetChecklists, CreateChecklist, EditChecklist, DeleteChecklist, CreateChecklistFromExcel, DownloadExcelTemplateForCreatechecklists, ChangeNextDate, AssignChecklistToUsers, GetMobileChecklists, GetChecklistsReport, BulkDeleteChecklists, GetChecklistTopBarDetails } from "../controllers/checklist";
import { CreateBill, UpdateBill, DeleteBill, GetLeadPartyBillsHistory, GetReferPartyBillsHistory } from "../controllers/crm-bills";
import { GetAllCRMCities, CreateCRMCity, UpdateCRMCity, DeleteCRMCity, BulkCreateAndUpdateCRMCityFromExcel, AssignCRMCitiesToUsers, FindUnknownCrmCities, GetAllCRMCitiesForDropDown } from "../controllers/crm-city";
import { GetRemarkHistory, GetReferRemarkHistory, GetActivities, NewRemark, UpdateRemark, DeleteRemark, GetActivitiesTopBarDetails } from "../controllers/crm-remarks";
import { GetAllCRMStates, CreateCRMState, UpdateCRMState, DeleteCRMState, BulkCreateAndUpdateCRMStatesFromExcel, AssignCRMStatesToUsers, FindUnknownCrmSates } from "../controllers/crm-states";
import { GetAssignedRefers, GetNewRefers, GetMyReminders } from "../controllers/crm.reports";
import { GetAllDyeLocations, CreateDyeLocation, UpdateDyeLocation, ToogleDyeLocation } from "../controllers/dye-location";
import { GetDyeStatusReport } from "../controllers/dye-status-report";
import { SendPasswordResetMail, SendVerifyEmail } from "../controllers/email";
import { AssignUsers, GetProfile, GetUsers, GetUsersForAssignmentPage, NewUser, SignUp, UpdateProfile, UpdateUser } from "../controllers/user";
import { NewChecklistRemark, GetChecklistBoxRemarkHistory, GetChecklistRemarkHistory, UpdateChecklistRemark, DeleteChecklistRemark } from "../controllers/checklist-remark";
import { GetDyes, CreateDye, UpdateDye, GetDyeById, ToogleDye, BulkUploadDye } from "../controllers/dye";
import { GetExcelDbReport, CreateExcelDBFromExcel } from "../controllers/excel-db";
import { NewExcelDBRemark, GetExcelDBRemarkHistory, UpdateExcelDBRemark, DeleteExcelDBRemark } from "../controllers/exceldb-remark";
import { AssignKeyCategoriesToUsers, GetAllKeyCategoryForDropDown, GetAllKeyCategory, CreateKeyCategory, GetKeyCategoryById, UpdateKeyCategory, DeleteKeyCategory } from "../controllers/key-category";
import { GetAllKey, CreateKey, UpdateKey, DeleteKey, AssignKeysToUsers, CreateKeysFromExcel, DownloadExcelTemplateForCreateKeys } from "../controllers/keys";
import { GetLeads, CreateLead, UpdateLead, DeleteLead, BulkLeadUpdateFromExcel, FuzzySearchLeads, ConvertLeadToRefer, BulkDeleteUselessLeads, GetAssignedReferrals, ReferLead, RemoveLeadReferral, MergeTwoLeads } from "../controllers/lead";
import { GetAllCRMLeadSources, CreateCRMLeadSource, UpdateCRMLeadSource, DeleteCRMLeadSource } from "../controllers/lead-source";
import { GetAllCRMLeadStages, CreateCRMLeadStages, UpdateCRMLeadStages, DeleteCRMLeadStage, FindUnknownCrmStages } from "../controllers/lead-stage";
import { GetAllCRMLeadTypes, CreateCRMLeadTypes, UpdateCRMLeadTypes, DeleteCRMLeadType } from "../controllers/lead-types";
import { GetMachines, CreateMachine, UpdateMachine, ToogleMachine, BulkUploadMachine } from "../controllers/machine";
import { GetMachineCategories, CreateMachineCategory, UpdateMachineCategory, DeleteMachineCategory } from "../controllers/machine-categories";
import { GetPayments, CreatePayment, GetMobilePayments, EditPayment, DeletePayment, ChangeDueDate, CreatePaymentFromExcel, DownloadExcelTemplateForCreatePayments, AssignPaymentsToUsers, BulkDeletePayments, GetPaymentsTopBarDetails } from "../controllers/payment";
import { GetAllPaymentCategory, CreatePaymentCategory, UpdatePaymentCategory, DeletePaymentCategory } from "../controllers/payment-category";
import { GetMyTodayProductions, GetProductions, CreateProduction, UpdateProduction, DeleteProduction } from "../controllers/production";
import { GetCategoryWiseProductionReports, GetMachineWiseProductionReports, GetThekedarWiseProductionReports } from "../controllers/production-report";
import { GetRefers, GetPaginatedRefers, FuzzySearchRefers, CreateReferParty, UpdateReferParty, DeleteReferParty, BulkReferUpdateFromExcel, MergeTwoRefers, ToogleReferPartyConversion } from "../controllers/refer";
import { GetSalesmanLeavesReport, CreateSalesmanLeavesFromExcel, DownloadExcelTemplateForCreateSalesmanLeavesReport } from "../controllers/salesman-leaves";
import { GetSalesManVisitReport } from "../controllers/salesman-visit";
import { GetMyTodayShoeWeights, GetShoeWeights, CreateShoeWeight, UpdateShoeWeight1, DeleteShoeWeight, UpdateShoeWeight2, UpdateShoeWeight3, ValidateShoeWeight, ValidateSpareDye } from "../controllers/shoe-weight";
import { GetShoeWeightDifferenceReports } from "../controllers/shoe-weight-report";
import { GetSoleThickness, CreateSoleThickness, GetMyTodaySoleThickness, DeleteSoleThickness, UpdateSoleThickness } from "../controllers/sole-thickness";
import { GetMyTodaySpareDye, GetSpareDyes, CreateSpareDye, UpdateSpareDye, DeleteSpareDye } from "../controllers/spare-dye";
import { test } from "../controllers/test";
import { NewVisitRemark, UpdateVisitRemark, DeleteVisitRemark, GetVisitSummaryReportRemarkHistory } from "../controllers/visit-remark";
import { GetVisitReports, GetSalesAttendancesAutoReport } from "../controllers/visit-report";






//articles

router.route("/articles").get(isAuthenticatedUser, GetArticles)
    .post(isAuthenticatedUser, CreateArticle)
router.put("/articles/:id", isAuthenticatedUser, UpdateArticle)
router.patch("/articles/toogle/:id", isAuthenticatedUser, ToogleArticle)
router.put("/articles/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadArticle)


//auth
router.patch("/make-admin/user/:id", isAuthenticatedUser, isAdmin, MakeAdmin)
router.patch("/allow/multi_login/:id", isAuthenticatedUser, isAdmin, AllowMultiLogin)
router.patch("/block/multi_login/:id", isAuthenticatedUser, isAdmin, BlockMultiLogin)
router.patch("/block/user/:id", isAuthenticatedUser, isAdmin, BlockUser)
router.patch("/unblock/user/:id", isAuthenticatedUser, isAdmin, UnBlockUser)
router.patch("/remove-admin/user/:id", isAuthenticatedUser, isAdmin, RemoveAdmin)
router.post("/login", Login)
router.post("/logout", Logout)
router.route("/password/update").patch(isAuthenticatedUser, updatePassword)
router.route("/password/reset/:id").patch(isAuthenticatedUser, resetUserPassword)
router.patch("/password/reset/:token", ResetPassword)
router.patch("/email/verify/:token", VerifyEmail)
router.route("/permissions").get(isAuthenticatedUser, GetAllPermissions).post(isAuthenticatedUser, AssignPermissionsToUsers)
router.route("/permissions/one").post(isAuthenticatedUser, AssignPermissionsToOneUser)
router.post("/email/verify", isAuthenticatedUser, SendVerifyEmail)
router.post("/password/reset", SendPasswordResetMail)
router.post("/signup", upload.single("dp"), SignUp)
router.route("/users").get(isAuthenticatedUser, GetUsers)
    .post(isAuthenticatedUser, upload.single("dp"), NewUser)
router.route("/users/assignment").get(isAuthenticatedUser, GetUsersForAssignmentPage)

router.route("/users/:id")
    .put(isAuthenticatedUser, upload.single("dp"), UpdateUser)
router.patch("/assign/users/:id", isAuthenticatedUser, AssignUsers)
router.route("/profile")
    .get(isProfileAuthenticated, GetProfile)
    .put(isAuthenticatedUser, upload.single("dp"), UpdateProfile)


//checklists
router.route("/checklists/categories").get(isAuthenticatedUser, GetAllChecklistCategory).post(isAuthenticatedUser, CreateChecklistCategory)
router.route("/checklists/categories/:id").put(isAuthenticatedUser, UpdateChecklistCategory).delete(isAuthenticatedUser, DeleteChecklistCategory)
router.route("/checklists").get(isAuthenticatedUser, GetChecklists).post(isAuthenticatedUser, upload.single('photo'), CreateChecklist)
router.route("/checklists/report").get(isAuthenticatedUser, GetChecklistsReport)
router.route("/checklists/me").get(isAuthenticatedUser, GetMobileChecklists)
router.route("/checklists/:id").put(isAuthenticatedUser, upload.single('photo'), EditChecklist)
router.route("/checklists/:id").delete(isAuthenticatedUser, DeleteChecklist)
router.route("/checklists/nextdate/:id").patch(isAuthenticatedUser, ChangeNextDate)
router.route("/create-from-excel/checklists")
    .put(isAuthenticatedUser, upload.single("excel"), CreateChecklistFromExcel)
router.get("/download/template/checklists", isAuthenticatedUser, DownloadExcelTemplateForCreatechecklists)
router.route("/assign/checklists/").post(isAuthenticatedUser, AssignChecklistToUsers)
router.route("/bulk/delete/checklists").post(isAuthenticatedUser, BulkDeleteChecklists)
router.route("/checklists/topbar-details").get(isAuthenticatedUser, GetChecklistTopBarDetails)
router.route("/checklist/remarks").post(isAuthenticatedUser, NewChecklistRemark)
router.route("/checklist/remarks/box/:id").get(isAuthenticatedUser, GetChecklistBoxRemarkHistory)
router.route("/checklist/remarks/:id").get(isAuthenticatedUser, GetChecklistRemarkHistory)
router.route("/checklist/remarks/:id").put(isAuthenticatedUser, UpdateChecklistRemark)
router.route("/checklist/remarks/:id").delete(isAuthenticatedUser, DeleteChecklistRemark)

//crm
router.route("/bills").post(isAuthenticatedUser, upload.single('billphoto'), CreateBill)
router.route("/bills/:id").put(isAuthenticatedUser, upload.single('billphoto'), UpdateBill).delete(isAuthenticatedUser, DeleteBill)
router.route("/bills/history/leads/:id").get(isAuthenticatedUser, GetLeadPartyBillsHistory)
router.route("/bills/history/refers/:id").get(isAuthenticatedUser, GetReferPartyBillsHistory)
router.route("/remarks/:id").get(isAuthenticatedUser, GetRemarkHistory)
router.route("/remarks/refers/:id").get(isAuthenticatedUser, GetReferRemarkHistory)
router.route("/activities").get(isAuthenticatedUser, GetActivities)
router.route("/remarks/:id").post(isAuthenticatedUser, NewRemark)
router.route("/remarks/:id").put(isAuthenticatedUser, UpdateRemark)
router.route("/remarks/:id").delete(isAuthenticatedUser, DeleteRemark)
router.route("/assigned/refers/report").get(isAuthenticatedUser, GetAssignedRefers)
router.route("/new/refers/report").get(isAuthenticatedUser, GetNewRefers)
router.get("/activities/topbar", isAuthenticatedUser, GetActivitiesTopBarDetails)
router.route("/reminders").get(isAuthenticatedUser, GetMyReminders)
router.route("/crm/sources").get(isAuthenticatedUser, GetAllCRMLeadSources).post(isAuthenticatedUser, CreateCRMLeadSource),
    router.route("/crm/sources/:id").put(isAuthenticatedUser, UpdateCRMLeadSource).delete(isAuthenticatedUser, DeleteCRMLeadSource)
router.route("/crm/leadtypes").get(isAuthenticatedUser, GetAllCRMLeadTypes).post(isAuthenticatedUser, CreateCRMLeadTypes),
    router.route("/crm/leadtypes/:id").put(isAuthenticatedUser, UpdateCRMLeadTypes).delete(isAuthenticatedUser, DeleteCRMLeadType)
router.route("/crm/stages").get(isAuthenticatedUser, GetAllCRMLeadStages).post(isAuthenticatedUser, CreateCRMLeadStages),
    router.route("/crm/stages/:id").put(isAuthenticatedUser, UpdateCRMLeadStages).delete(isAuthenticatedUser, DeleteCRMLeadStage)
router.route("/find/crm/stages/unknown").post(isAuthenticatedUser, FindUnknownCrmStages);
router.route("/leads").get(isAuthenticatedUser, GetLeads).post(isAuthenticatedUser, upload.single('visiting_card'), CreateLead)
router.route("/leads/:id").put(isAuthenticatedUser, upload.single('visiting_card'), UpdateLead).delete(isAuthenticatedUser, DeleteLead)

router.route("/update/leads/bulk").put(isAuthenticatedUser, upload.single('file'), BulkLeadUpdateFromExcel)
router.route("/search/leads").get(isAuthenticatedUser, FuzzySearchLeads)

router.patch("/leads/torefer/:id", isAuthenticatedUser, ConvertLeadToRefer)
router.post("/bulk/leads/delete/useless", isAuthenticatedUser, BulkDeleteUselessLeads)
router.get("/assigned/referrals/:id", isAuthenticatedUser, GetAssignedReferrals)
router.route("/refers/leads/:id").post(isAuthenticatedUser, ReferLead)
router.route("/refers/leads/:id").patch(isAuthenticatedUser, RemoveLeadReferral)
router.route("/merge/leads/:id").put(isAuthenticatedUser, MergeTwoLeads)
router.route("/refers").get(isAuthenticatedUser, GetRefers)
router.route("/refers/paginated").get(isAuthenticatedUser, GetPaginatedRefers)
router.route("/search/refers").get(isAuthenticatedUser, FuzzySearchRefers)
router.route("/refers").post(isAuthenticatedUser, upload.none(), CreateReferParty)
router.route("/refers/:id").put(isAuthenticatedUser, upload.none(), UpdateReferParty)
router.route("/refers/:id").delete(isAuthenticatedUser, DeleteReferParty)
router.route("/update/refers/bulk").put(isAuthenticatedUser, upload.single('file'), BulkReferUpdateFromExcel)
router.route("/merge/refers/:id").put(isAuthenticatedUser, MergeTwoRefers)
router.route("/toogle-convert/refers/:id").patch(isAuthenticatedUser, ToogleReferPartyConversion)


//city
router.route("/crm/cities").get(isAuthenticatedUser, GetAllCRMCities).post(isAuthenticatedUser, CreateCRMCity)
router.route("/crm/cities/:id").put(isAuthenticatedUser, UpdateCRMCity).delete(isAuthenticatedUser, DeleteCRMCity),
    router.route("/crm/cities/excel/createorupdate/:state").put(isAuthenticatedUser, upload.single('file'), BulkCreateAndUpdateCRMCityFromExcel)
router.patch("/crm/cities/assign", isAuthenticatedUser, AssignCRMCitiesToUsers)
router.route("/find/crm/cities/unknown").post(isAuthenticatedUser, FindUnknownCrmCities);
router.get("/dropdown/cities", isAuthenticatedUser, GetAllCRMCitiesForDropDown)

//states
router.route("/crm/states").get(isAuthenticatedUser, GetAllCRMStates).post(isAuthenticatedUser, CreateCRMState),
    router.route("/crm/states/:id").put(isAuthenticatedUser, UpdateCRMState).delete(isAuthenticatedUser, DeleteCRMState),
    router.route("/crm/states/excel/createorupdate").put(isAuthenticatedUser, upload.single('file'), BulkCreateAndUpdateCRMStatesFromExcel)
router.patch("/crm/states/assign", isAuthenticatedUser, AssignCRMStatesToUsers)
router.route("/find/crm/states/unknown").post(isAuthenticatedUser, FindUnknownCrmSates);


//dye
router.route("/dye/locations").get(isAuthenticatedUser, GetAllDyeLocations).post(isAuthenticatedUser, CreateDyeLocation),
    router.route("/dye/locations/:id").put(isAuthenticatedUser, UpdateDyeLocation).patch(isAuthenticatedUser, ToogleDyeLocation)
router.route("/dyestatus/report").get(isAuthenticatedUser, GetDyeStatusReport)
router.route("/dyes").get(isAuthenticatedUser, GetDyes)
    .post(isAuthenticatedUser, CreateDye)
router.put("/dyes/:id", isAuthenticatedUser, UpdateDye)
router.get("/dyes/:id", isAuthenticatedUser, GetDyeById)
router.patch("/dyes/toogle/:id", isAuthenticatedUser, ToogleDye)
router.put("/dyes/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadDye)

//production
router.route("/machine/categories").get(isAuthenticatedUser, GetMachineCategories).post(isAuthenticatedUser, CreateMachineCategory)
router.route("/machine/categories/:id").put(isAuthenticatedUser, UpdateMachineCategory).delete(isAuthenticatedUser, DeleteMachineCategory)
router.route("/machines").get(isAuthenticatedUser, GetMachines)
    .post(isAuthenticatedUser, CreateMachine)
router.put("/machines/:id", isAuthenticatedUser, UpdateMachine)
router.patch("/machines/toogle/:id", isAuthenticatedUser, ToogleMachine)
router.put("/machines/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadMachine)

router.route("/production/categorywise").get(isAuthenticatedUser, GetCategoryWiseProductionReports)
router.route("/production/machinewise").get(isAuthenticatedUser, GetMachineWiseProductionReports)
router.route("/production/thekedarwise").get(isAuthenticatedUser, GetThekedarWiseProductionReports)
router.route("/productions/me").get(isAuthenticatedUser, GetMyTodayProductions)
router.route("/productions").get(isAuthenticatedUser, GetProductions)
    .post(isAuthenticatedUser, CreateProduction)
router.route("/productions/:id").put(isAuthenticatedUser, UpdateProduction)
    .delete(isAuthenticatedUser, DeleteProduction)
router.route("/shoeweight/diffreports").get(isAuthenticatedUser, GetShoeWeightDifferenceReports)
router.route("/solethickness").get(isAuthenticatedUser, GetSoleThickness).post(isAuthenticatedUser, CreateSoleThickness)
router.route("/solethickness/me").get(isAuthenticatedUser, GetMyTodaySoleThickness)
router.route("/solethickness/:id").get(isAuthenticatedUser, DeleteSoleThickness).put(isAuthenticatedUser, UpdateSoleThickness).delete(isAuthenticatedUser, DeleteSoleThickness)
router.route("/weights/me").get(isAuthenticatedUser, GetMyTodayShoeWeights),
    router.route("/weights").get(isAuthenticatedUser, GetShoeWeights)
        .post(isAuthenticatedUser, upload.single('media'), CreateShoeWeight)
router.route("/weights/:id").put(isAuthenticatedUser, upload.single('media'), UpdateShoeWeight1).delete(isAuthenticatedUser, DeleteShoeWeight),
    router.put("/weights2/:id", isAuthenticatedUser, upload.single('media'), UpdateShoeWeight2),
    router.put("/weights3/:id", isAuthenticatedUser, upload.single('media'), UpdateShoeWeight3),
    router.patch("/weights/validate/:id", isAuthenticatedUser, ValidateShoeWeight)


router.patch("/sparedyes/validate/:id", isAuthenticatedUser, ValidateSpareDye)
router.route("/sparedyes/me").get(isAuthenticatedUser, GetMyTodaySpareDye),
    router.route("/sparedyes").get(isAuthenticatedUser, GetSpareDyes).post(isAuthenticatedUser, upload.single('media'), CreateSpareDye)
router.route("/sparedyes/:id").put(isAuthenticatedUser, upload.single('media'), UpdateSpareDye).delete(isAuthenticatedUser, DeleteSpareDye)


//test
router.post("/test", upload.single("excel"), isAuthenticatedUser, test)
router.route("/test").get(isAuthenticatedUser, GetVisitReports)


//sales
router.route("/salesman-leaves/report").get(isAuthenticatedUser, GetSalesmanLeavesReport)
router.route("/create-salesman-leaves-from-excel").post(isAuthenticatedUser, upload.single('excel'), CreateSalesmanLeavesFromExcel)
router.get("/download/template/salesmanleaves", isAuthenticatedUser, DownloadExcelTemplateForCreateSalesmanLeavesReport)
router.route("/salesman-visit").get(isAuthenticatedUser, GetSalesManVisitReport)
router.route("/visit-reports").get(isAuthenticatedUser, GetVisitReports)
router.route("/visit/auto-reports").get(isAuthenticatedUser, GetSalesAttendancesAutoReport)
router.route("/visit/remarks").post(isAuthenticatedUser, NewVisitRemark)
router.route("/visit/remarks/:id")
    .put(isAuthenticatedUser, UpdateVisitRemark)
    .delete(isAuthenticatedUser, DeleteVisitRemark)
router.route("/visit/remarks").get(isAuthenticatedUser, GetVisitSummaryReportRemarkHistory)
router.route("/salesman/kpi").get(isAuthenticatedUser, GetSalesManKpi)
router.route("/attendances").get(isAuthenticatedUser, GetSalesAttendances)
    .post(isAuthenticatedUser, CreateSalesAttendance)
router.route("/attendances/:id").put(isAuthenticatedUser, UpdateSalesAttendance)
    .delete(isAuthenticatedUser, DeleteSalesAttendance)



//payments
router.route("/payments/categories").get(isAuthenticatedUser, GetAllPaymentCategory).post(isAuthenticatedUser, CreatePaymentCategory)
router.route("/payments/categories/:id").put(isAuthenticatedUser, UpdatePaymentCategory).delete(isAuthenticatedUser, DeletePaymentCategory)
router.route("/payments").get(isAuthenticatedUser, GetPayments).post(isAuthenticatedUser, upload.single('photo'), CreatePayment)
router.route("/payments/me").get(isAuthenticatedUser, GetMobilePayments)
router.route("/payments/:id").put(isAuthenticatedUser, EditPayment)
router.route("/payments/:id").delete(isAuthenticatedUser, DeletePayment)
router.route("/payments/nextdate/:id").patch(isAuthenticatedUser, ChangeNextDate)
router.route("/payments/duedate/:id").patch(isAuthenticatedUser, ChangeDueDate)
router.route("/create-from-excel/payments")
    .put(isAuthenticatedUser, upload.single("excel"), CreatePaymentFromExcel)
router.get("/download/template/payments", isAuthenticatedUser, DownloadExcelTemplateForCreatePayments)
router.route("/assign/payments/").post(isAuthenticatedUser, AssignPaymentsToUsers)
router.route("/bulk/delete/payments").post(isAuthenticatedUser, BulkDeletePayments)
router.route("/payments/topbar-details").get(isAuthenticatedUser, GetPaymentsTopBarDetails)


//exceldb
router.route("/keys").get(isAuthenticatedUser, GetAllKey).post(isAuthenticatedUser, CreateKey)
router.route("/keys/:id").put(isAuthenticatedUser, UpdateKey).delete(isAuthenticatedUser, DeleteKey)
router.patch("/keys/assign", isAuthenticatedUser, AssignKeysToUsers)
router.route("/create-from-excel/keys")
    .put(isAuthenticatedUser, upload.single("excel"), CreateKeysFromExcel)
router.get("/download/template/keys", isAuthenticatedUser, DownloadExcelTemplateForCreateKeys)
router.patch("/key-category/assign", isAuthenticatedUser, AssignKeyCategoriesToUsers)
router.route("/key-category/dropdown").get(isAuthenticatedUser, GetAllKeyCategoryForDropDown)
router.route("/key-category").get(isAuthenticatedUser, GetAllKeyCategory).post(isAuthenticatedUser, CreateKeyCategory)
router.route("/key-category/:id").get(isAuthenticatedUser, GetKeyCategoryById)
    .put(isAuthenticatedUser, UpdateKeyCategory).delete(isAuthenticatedUser, DeleteKeyCategory)

router.route("/excel-db").get(isAuthenticatedUser, GetExcelDbReport)
router.route("/excel-db").post(isAuthenticatedUser, upload.single('excel'), CreateExcelDBFromExcel)
router.route("/excel-db/remarks").post(isAuthenticatedUser, NewExcelDBRemark)
router.route("/excel-db/remarks/:id").get(isAuthenticatedUser, GetExcelDBRemarkHistory)
router.route("/excel-db/remarks/:id").put(isAuthenticatedUser, UpdateExcelDBRemark)
router.route("/excel-db/remarks/:id").delete(isAuthenticatedUser, DeleteExcelDBRemark)



export default router;

