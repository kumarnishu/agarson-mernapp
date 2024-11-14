import React, { useReducer } from "react"


type UserChoices = "signup" | "reset_password_mail" | "close_user" | "new_user" | "update_user" | "update_profile" | "view_profile" | "update_password" | "reset_password" | "verify_email" | "control_access" | "delete_user" | "toogle_flow_status" | "create_or_edit_erpstate" | "update_state" | "delete_erp_state" |
  "block_user" | "unblock_user" | "make_admin" | "remove_admin" | "refresh_whatsapp" | "update_user_password" | "block_multi_login" | "reset_multi_login" | "assign_users" | "bulk_assign_erp_states" | "toogle_show_visitingcard" | "assign_permissions" | "bulk_assign_permissions" | "delete_role" | "bulk_assign_erp_employees" | "create_or_edit_erpemployee" | "delete_erp_employee"



type CheckListChoices = "create_or_edit_checklist" | "create_or_edit_checklist_category" | "delete_checklist" | "close_checklist" | "bulk_delete_checklist" | "view_ checklist_box_remarks" | "create_or_edit_checklist_remark" | "view_checklist_remarks" | "delete_checklist_remark" | "assign_checklist_to_users"


type KeyChoices = "create_or_edit_key" | "create_or_edit_key_category" | "delete_key" | "close_key" | "bulk_delete_key" | "delete_key_category"


type PaymentChoices = "create_or_edit_payment" | "create_or_edit_payment_category" | "delete_payment" | "close_payment" | "bulk_delete_payment" | "delete_payment_category" | "create_or_edit_payment_remark" | "view_payment_remarks" | "delete_payment_remark" | "assign_payment_to_users"


type LeadChoices = "create_or_edit_refer" | "create_or_edit_leadtype" | "create_or_edit_source" | "delete_crm_item" | "view_remarks" | "close_lead" | "create_or_edit_city" | "bulk_assign_crm_cities" | "find_unknown_stages" | "create_or_edit_bill" | "convert_lead_to_refer" | "bulk_delete_useless_leads" | "view_referrals" | "delete_crm_state" | "find_unknown_cities" |
  "refer_lead" | "remove_referral" | "assign_refer" | "bulk_assign_leads" | "bulk_assign_refers" | "delete_remark" | "create_or_edt_remark" | "create_or_edit_lead" | "create_or_edit_state" | "create_or_edit_stage" | "bulk_assign_crm_states" | "find_unknown_states" | "merge_leads" | "view_refer_remarks" | "delete_bill" | "view_bills" | "merge_refers" | "view_bills_photo"


type ProductionChoices = "create_or_edit_machine" | "close_production" | "create_or_edit_spareDye" | "create_or_edit_article" | "create_or_edit_thickness" | "create_or_edit_dye" | "update_dye" | "validate_weight" | "toogle_machine" | "toogle_article" | "toogle_dye" | "view_shoe_photo" | "view_shoe_photo2" | "view_shoe_photo3" | "create_or_edit_shoe_weight" | "validate_spareDye" | "view_spare_dye_photo" | "create_or_edit_production" | "update_production" | "delete_production_item" | "create_or_edit_location" | "toogle_dye_location" | "update_shoe_weight2" | "update_shoe_weight3" | "create_or_edit_machine_category"


type ChoiceState = UserChoices | PaymentChoices | LeadChoices | CheckListChoices | ProductionChoices | KeyChoices

const initialState: ChoiceState | null = null


export enum ProductionChoiceActions {
  validate_weight = "validate_weight",
  delete_production_item = "delete_production_item",
  create_or_edit_machine_category = "create_or_edit_machine_category",
  create_or_edit_location = "create_or_edit_location",
  toogle_dye_location = "toogle_dye_location",
  create_or_edit_machine = "create_or_edit_machine",
  view_shoe_photo = "view_shoe_photo",
  view_shoe_photo2 = "view_shoe_photo2",
  view_shoe_photo3 = "view_shoe_photo3",
  create_or_edit_spareDye = "create_or_edit_spareDye",
  create_or_edit_article = "create_or_edit_article",
  create_or_edit_thickness = "create_or_edit_thickness",
  create_or_edit_dye = "create_or_edit_dye",
  update_dye = "update_dye",
  toogle_machine = "toogle_machine",
  toogle_article = "toogle_article",
  toogle_dye = "toogle_dye",
  close_production = "close_production",
  create_or_edit_shoe_weight = "create_or_edit_shoe_weight",
  view_spare_dye_photo = "view_spare_dye_photo",
  update_shoe_weight2 = "update_shoe_weight2",
  update_shoe_weight3 = "update_shoe_weight3",
  create_or_edit_production = "create_or_edit_production",
  validate_spareDye = "validate_spareDye",
  update_production = "update_production"
}

export enum KeyChoiceActions {
  create_or_edit_key = "create_or_edit_key",
  create_or_edit_key_category = "create_or_edit_key_category",
  delete_key = "delete_key",
  close_key = "close_key",
  bulk_delete_key = "bulk_delete_key",
  delete_key_category = "delete_key_category"
}
export enum CheckListChoiceActions {
  create_or_edit_checklist = "create_or_edit_checklist",
  create_or_edit_checklist_category = "create_or_edit_checklist_category",
  delete_checklist = "delete_checklist",
  close_checklist = "close_checklist",
  bulk_delete_checklist = "bulk_delete_checklist",
  view_checklist_box_remarks = "view_ checklist_box_remarks",
  delete_checklist_remark = "delete_checklist_remark",
  create_or_edit_checklist_remark = "create_or_edit_checklist_remark",
  view_checklist_remarks = "view_checklist_remarks",
  assign_checklist_to_users = "assign_checklist_to_users"
}

export enum PaymentsChoiceActions {
  create_or_edit_payment = "create_or_edit_payment",
  create_or_edit_payment_category = "create_or_edit_payment_category",
  delete_payment = "delete_payment",
  close_payment = "close_payment",
  bulk_delete_payment = "bulk_delete_payment",
  delete_payment_category = "delete_payment_category",
  delete_payment_remark = "delete_payment_remark",
  create_or_edit_payment_remark = "create_or_edit_payment_remark",
  view_payment_remarks = "view_payment_remarks",
  assign_payment_to_users = "assign_payment_to_users"
}

export enum LeadChoiceActions {
  create_or_edit_lead = "create_or_edit_lead",
  view_bills_photo = "view_bills_photo",
  view_bills = "view_bills",
  merge_refers = "merge_refers",
  create_or_edit_state = "create_or_edit_state",
  delete_crm_state = "delete_crm_state",
  create_or_edit_stage = "create_or_edit_stage",
  create_or_edit_refer = "create_or_edit_refer",
  create_or_edit_source = "create_or_edit_source",
  bulk_assign_crm_cities = "bulk_assign_crm_cities",
  delete_remark = "delete_remark",
  create_or_edt_remark = "create_or_edt_remark",
  view_remarks = "view_remarks",
  close_lead = "close_lead",
  create_or_edit_city = "create_or_edit_city",
  delete_crm_item = "delete_crm_item",
  find_unknown_stages = "find_unknown_stages",
  find_unknown_cities = "find_unknown_cities",
  create_or_edit_bill = "create_or_edit_bill",
  create_or_edit_leadtype = "create_or_edit_leadtype",
  convert_lead_to_refer = "convert_lead_to_refer",
  bulk_delete_useless_leads = "bulk_delete_useless_leads",
  view_referrals = "view_referrals",
  refer_lead = "refer_lead",
  remove_referral = "remove_referral",
  assign_refer = "assign_refer",
  bulk_assign_leads = "bulk_assign_leads",
  bulk_assign_refers = "bulk_assign_refers",
  bulk_assign_crm_states = "bulk_assign_crm_states",
  find_unknown_states = "find_unknown_states",
  merge_leads = "merge_leads",
  view_refer_remarks = "view_refer_remarks",
  delete_bill = "delete_bill"
}

export enum UserChoiceActions {
  bulk_assign_erp_states = "bulk_assign_erp_states",
  create_or_edit_erpemployee = "create_or_edit_erpemployee",
  delete_erp_employee = "delete_erp_employee",
  bulk_assign_erp_employees = "bulk_assign_erp_employees",
  assign_users = "assign_users",
  assign_permissions = "assign_permissions",
  bulk_assign_permissions = "bulk_assign_permissions",
  delete_role = "delete_role",
  signup = "signup",
  toogle_show_visitingcard = "toogle_show_visitingcard",
  reset_password_mail = "reset_password_mail",
  close_user = "close_user",
  new_user = "new_user",
  update_user = "update_user",
  update_profile = "update_profile",
  view_profile = "view_profile",
  reset_password = "reset_password",
  update_password = "update_password",
  verify_email = "verify_email",
  block_user = "block_user",
  unblock_user = "unblock_user",
  make_admin = "make_admin",
  remove_admin = "remove_admin",
  delete_user = "delete_user",
  control_access = "control_access",
  refresh_whatsapp = "refresh_whatsapp",
  update_user_password = "update_user_password",
  block_multi_login = "block_multi_login",
  reset_multi_login = "reset_multi_login",
  create_or_edit_erpstate = "create_or_edit_erpstate",
  update_state = "update_state",
  delete_erp_state = "delete_erp_state"

}

type Action = {
  type: UserChoiceActions |
  LeadChoiceActions | CheckListChoiceActions | ProductionChoiceActions | PaymentsChoiceActions | KeyChoiceActions
}

// reducer
function reducer(state: ChoiceState | null, action: Action) {
  let type = action.type
  switch (type) {
    // user dialogs choices
    case UserChoiceActions.signup: return type
    case UserChoiceActions.reset_password_mail: return type
    case UserChoiceActions.new_user: return type
    case UserChoiceActions.update_user: return type
    case UserChoiceActions.update_profile: return type
    case UserChoiceActions.view_profile: return type
    case UserChoiceActions.update_password: return type
    case UserChoiceActions.reset_password: return type
    case UserChoiceActions.verify_email: return type
    case UserChoiceActions.block_user: return type
    case UserChoiceActions.unblock_user: return type
    case UserChoiceActions.refresh_whatsapp: return type
    case UserChoiceActions.make_admin: return type
    case UserChoiceActions.control_access: return type
    case UserChoiceActions.remove_admin: return type
    case UserChoiceActions.delete_user: return type
    case UserChoiceActions.close_user: return type
    case UserChoiceActions.update_user_password: return type
    case UserChoiceActions.reset_multi_login: return type
    case UserChoiceActions.assign_users: return type
    case UserChoiceActions.block_multi_login: return type
    case UserChoiceActions.create_or_edit_erpstate: return type
    case UserChoiceActions.update_state: return type
    case UserChoiceActions.delete_erp_state: return type
    case UserChoiceActions.bulk_assign_erp_states: return type
    case UserChoiceActions.toogle_show_visitingcard: return type
    case UserChoiceActions.bulk_assign_permissions: return type
    case UserChoiceActions.assign_permissions: return type
    case UserChoiceActions.delete_role: return type
    case UserChoiceActions.bulk_assign_erp_employees: return type
    case UserChoiceActions.create_or_edit_erpemployee: return type
    case UserChoiceActions.delete_erp_employee: return type

    // lead dialog choices
    case LeadChoiceActions.create_or_edit_refer: return type
    case LeadChoiceActions.create_or_edit_source: return type
    case LeadChoiceActions.view_remarks: return type
    case LeadChoiceActions.delete_crm_item: return type
    case LeadChoiceActions.create_or_edit_city: return type
    case LeadChoiceActions.bulk_assign_crm_cities: return type
    case LeadChoiceActions.find_unknown_stages: return type
    case LeadChoiceActions.close_lead: return type
    case LeadChoiceActions.create_or_edit_bill: return type
    case LeadChoiceActions.find_unknown_cities: return type
    case LeadChoiceActions.convert_lead_to_refer: return type
    case LeadChoiceActions.bulk_delete_useless_leads: return type
    case LeadChoiceActions.create_or_edit_leadtype: return type
    case LeadChoiceActions.merge_refers: return type
    case LeadChoiceActions.view_referrals: return type
    case LeadChoiceActions.view_bills: return type
    case LeadChoiceActions.refer_lead: return type
    case LeadChoiceActions.remove_referral: return type
    case LeadChoiceActions.assign_refer: return type
    case LeadChoiceActions.delete_remark: return type
    case LeadChoiceActions.create_or_edt_remark: return type
    case LeadChoiceActions.bulk_assign_leads: return type
    case LeadChoiceActions.bulk_assign_refers: return type
    case LeadChoiceActions.create_or_edit_lead: return type
    case LeadChoiceActions.create_or_edit_state: return type
    case LeadChoiceActions.delete_bill: return type
    case LeadChoiceActions.create_or_edit_stage: return type
    case LeadChoiceActions.bulk_assign_crm_states: return type
    case LeadChoiceActions.find_unknown_states: return type
    case LeadChoiceActions.delete_crm_state: return type
    case LeadChoiceActions.merge_leads: return type
    case LeadChoiceActions.view_bills_photo: return type
    case LeadChoiceActions.view_refer_remarks: return type

    //production choice actios
    case ProductionChoiceActions.create_or_edit_machine: return type
    case ProductionChoiceActions.create_or_edit_spareDye: return type
    case ProductionChoiceActions.create_or_edit_article: return type
    case ProductionChoiceActions.create_or_edit_thickness: return type
    case ProductionChoiceActions.create_or_edit_dye: return type
    case ProductionChoiceActions.update_dye: return type
    case ProductionChoiceActions.toogle_article: return type
    case ProductionChoiceActions.toogle_dye: return type
    case ProductionChoiceActions.toogle_machine: return type
    case ProductionChoiceActions.close_production: return type
    case ProductionChoiceActions.validate_weight: return type
    case ProductionChoiceActions.view_shoe_photo: return type
    case ProductionChoiceActions.create_or_edit_machine_category: return type
    case ProductionChoiceActions.view_shoe_photo2: return type
    case ProductionChoiceActions.view_shoe_photo3: return type
    case ProductionChoiceActions.create_or_edit_production: return type
    case ProductionChoiceActions.update_production: return type
    case ProductionChoiceActions.create_or_edit_shoe_weight: return type
    case ProductionChoiceActions.view_spare_dye_photo: return type
    case ProductionChoiceActions.update_shoe_weight2: return type
    case ProductionChoiceActions.update_shoe_weight3: return type
    case ProductionChoiceActions.validate_spareDye: return type
    case ProductionChoiceActions.delete_production_item: return type
    case ProductionChoiceActions.create_or_edit_location: return type
    case ProductionChoiceActions.toogle_dye_location: return type


    // checklist actions
    case CheckListChoiceActions.create_or_edit_checklist: return type
    case CheckListChoiceActions.create_or_edit_checklist_category: return type
    case CheckListChoiceActions.delete_checklist: return type
    case CheckListChoiceActions.close_checklist: return type
    case CheckListChoiceActions.bulk_delete_checklist: return type
    case CheckListChoiceActions.view_checklist_box_remarks: return type
    case CheckListChoiceActions.delete_checklist_remark: return type
    case CheckListChoiceActions.view_checklist_remarks: return type
    case CheckListChoiceActions.create_or_edit_checklist_remark: return type
    case CheckListChoiceActions.assign_checklist_to_users: return type


    case KeyChoiceActions.create_or_edit_key: return type
    case KeyChoiceActions.create_or_edit_key_category: return type
    case KeyChoiceActions.delete_key: return type
    case KeyChoiceActions.close_key: return type
    case KeyChoiceActions.bulk_delete_key: return type
    case KeyChoiceActions.delete_key_category: return type
   

    case PaymentsChoiceActions.create_or_edit_payment: return type
    case PaymentsChoiceActions.create_or_edit_payment_category: return type
    case PaymentsChoiceActions.delete_payment: return type
    case PaymentsChoiceActions.close_payment: return type
    case PaymentsChoiceActions.bulk_delete_payment: return type
    case PaymentsChoiceActions.delete_payment_category: return type
    case PaymentsChoiceActions.delete_payment_remark: return type
    case PaymentsChoiceActions.view_payment_remarks: return type
    case PaymentsChoiceActions.create_or_edit_payment_remark: return type
    case PaymentsChoiceActions.assign_payment_to_users: return type

    default: return state
  }
}
// context
type Context = {
  choice: ChoiceState | null,
  setChoice: React.Dispatch<Action>
}
export const ChoiceContext = React.createContext<Context>(
  {
    choice: null,
    setChoice: () => null
  }
)
// provider
export function ChoiceProvider(props: { children: JSX.Element }) {
  const [choice, setChoice] = useReducer(reducer, initialState)
  return (
    <ChoiceContext.Provider value={{ choice, setChoice }}>
      {props.children}
    </ChoiceContext.Provider>
  )

}