import { IMenu } from "../dtos";

export function FetchAllPermissions() {
    let permissions: IMenu[] = [];

    let dashboardMenu: IMenu = {
        label: 'Dashboard',
        permissions: [{
            value: 'dashboard_menu',
            label: 'Dashboard Button'
        }],
        menues: [

        ]
    }
    let authorizationMenu: IMenu = {
        label: 'Authorization',
        permissions: [{
            value: 'authorization_menu',
            label: 'Authorization Button'
        }],
        menues: [

           
            {
                label: 'Cities',
                permissions: [
                    {
                        value: 'city_view',
                        label: 'view'
                    },
                    {
                        value: 'city_create',
                        label: 'create'
                    },
                    {
                        value: 'city_edit',
                        label: 'edit'
                    },
                    {
                        value: 'city_delete',
                        label: 'delete'
                    },
                    {
                        value: 'city_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'States',
                permissions: [
                    {
                        value: 'states_view',
                        label: 'view'
                    },
                    {
                        value: 'states_create',
                        label: 'create'
                    },
                    {
                        value: 'states_edit',
                        label: 'edit'
                    },
                    {
                        value: 'states_delete',
                        label: 'delete'
                    },
                    {
                        value: 'states_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Key',
                permissions: [
                    {
                        value: 'key_view',
                        label: 'view'
                    },
                    {
                        value: 'key_create',
                        label: 'create'
                    },
                    {
                        value: 'key_edit',
                        label: 'edit'
                    },
                    {
                        value: 'key_delete',
                        label: 'delete'
                    },
                    {
                        value: 'key_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Key Category',
                permissions: [
                    {
                        value: 'key_category_view',
                        label: 'view'
                    },
                    {
                        value: 'key_category_create',
                        label: 'create'
                    },
                    {
                        value: 'key_category_edit',
                        label: 'edit'
                    },
                    {
                        value: 'key_category_delete',
                        label: 'delete'
                    },
                    {
                        value: 'key_category_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'User Assignment',
                permissions: [
                    {
                        value: 'user_assignment_view',
                        label: 'view'
                    },
                    {
                        value: 'user_assignment_create',
                        label: 'create'
                    },
                    {
                        value: 'user_assignment_edit',
                        label: 'edit'
                    },
                    {
                        value: 'user_assignment_delete',
                        label: 'delete'
                    },
                    {
                        value: 'user_assignment_export',
                        label: 'export'
                    }
                ]
            },
        ]
    }
    
    let featureMenu: IMenu = {
        label: 'Feature',
        permissions: [
            {
                value: 'feature_menu',
                label: 'Feature Button'
            },
        ],
        menues: [
            {
                label: 'Production',
                permissions: [
                    {
                        value: 'production_view',
                        label: 'view'
                    },
                    {
                        value: 'production_create',
                        label: 'create'
                    },
                    {
                        value: 'production_edit',
                        label: 'edit'
                    },
                    {
                        value: 'production_delete',
                        label: 'delete'
                    },
                    {
                        value: 'production_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Sole Thickness',
                permissions: [
                    {
                        value: 'sole_thickness_view',
                        label: 'view'
                    },
                    {
                        value: 'sole_thickness_create',
                        label: 'create'
                    },
                    {
                        value: 'sole_thickness_edit',
                        label: 'edit'
                    },
                    {
                        value: 'sole_thickness_delete',
                        label: 'delete'
                    },
                    {
                        value: 'sole_thickness_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Shoe Weight',
                permissions: [
                    {
                        value: 'shoe_weight_view',
                        label: 'view'
                    },
                    {
                        value: 'shoe_weight_create',
                        label: 'create'
                    },
                    {
                        value: 'shoe_weight_edit',
                        label: 'edit'
                    },
                    {
                        value: 'shoe_weight_delete',
                        label: 'delete'
                    },
                    {
                        value: 'shoe_weight_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Spare Dye',
                permissions: [
                    {
                        value: 'spare_dye_view',
                        label: 'view'
                    },
                    {
                        value: 'spare_dye_create',
                        label: 'create'
                    },
                    {
                        value: 'spare_dye_edit',
                        label: 'edit'
                    },
                    {
                        value: 'spare_dye_delete',
                        label: 'delete'
                    },
                    {
                        value: 'spare_dye_export',
                        label: 'export'
                    }
                ]
            }, {
                label: 'Leads',
                permissions: [
                    {
                        value: 'leads_view',
                        label: 'view'
                    },
                    {
                        value: 'leads_create',
                        label: 'create'
                    },

                    {
                        value: 'leads_edit',
                        label: 'edit'
                    },
                    {
                        value: 'leads_delete',
                        label: 'delete'
                    },
                    {
                        value: 'show_leads_having_cards_only',
                        label: 'Show Only Visiting Card Leads'
                    },
                    {
                        value: 'show_leads_useless',
                        label: 'Show Useless Leads'
                    },
                    {
                        value: 'show_refer_leads',
                        label: 'Show Referred Leads'
                    },
                    {
                        value: 'leads_merge',
                        label: 'Merge Leads'
                    },
                    {
                        value: 'create_lead_bills',
                        label: 'Upload Bill'
                    },
                    {
                        value: 'edit_lead_bills',
                        label: 'Edit Bill'
                    },
                    {
                        value: 'delete_lead_bills',
                        label: 'Delete Bill'
                    },
                    {
                        value: 'view_lead_bills',
                        label: 'View Bills'
                    },
                    {
                        value: 'leads_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Customers',
                permissions: [
                    {
                        value: 'refer_view',
                        label: 'view'
                    },
                    {
                        value: 'refer_create',
                        label: 'create'
                    },
                    {
                        value: 'refer_edit',
                        label: 'edit'
                    },
                    {
                        value: 'refers_merge',
                        label: 'Merge Refers'
                    },
                    {
                        value: 'refer_delete',
                        label: 'delete'
                    },
                    {
                        value: 'refer_export',
                        label: 'export'
                    },
                    {
                        value: 'create_refer_bills',
                        label: 'Upload Bill'
                    },
                    {
                        value: 'edit_refer_bills',
                        label: 'Edit Bill'
                    },
                    {
                        value: 'delete_refer_bills',
                        label: 'Delete Bill'
                    },
                    {
                        value: 'view_refer_bills',
                        label: 'View Bills'
                    },
                    {
                        value: 'refer_conversion_manual',
                        label: 'Manual Refer Conversion'
                    },
                ]
            },
            {
                label: 'Crm Reminders',
                permissions: [
                    {
                        value: 'reminders_view',
                        label: 'view'
                    },
                    {
                        value: 'reminders_create',
                        label: 'create'
                    },
                    {
                        value: 'reminders_edit',
                        label: 'edit'
                    },
                    {
                        value: 'reminders_delete',
                        label: 'delete'
                    },
                    {
                        value: 'reminders_export',
                        label: 'export'
                    }
                ]
            },

            {
                label: 'Checklists',
                permissions: [
                    {
                        value: 'checklist_view',
                        label: 'view'
                    },
                    {
                        value: 'checklist_create',
                        label: 'create'
                    },
                    {
                        value: 'checklist_edit',
                        label: 'edit'
                    },
                    {
                        value: 'checklist_delete',
                        label: 'delete'
                    },
                    {
                        value: 'checklist_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Checklist Admin',
                permissions: [
                    {
                        value: 'checklist_admin_view',
                        label: 'view'
                    },
                    {
                        value: 'checklist_admin_create',
                        label: 'create'
                    },
                    {
                        value: 'checklist_admin_edit',
                        label: 'edit'
                    },
                    {
                        value: 'checklist_admin_delete',
                        label: 'delete'
                    },
                    {
                        value: 'checklist_admin_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Payments',
                permissions: [
                    {
                        value: 'payments_view',
                        label: 'view'
                    },
                    {
                        value: 'payments_create',
                        label: 'create'
                    },
                    {
                        value: 'payments_edit',
                        label: 'edit'
                    },
                    {
                        value: 'payments_delete',
                        label: 'delete'
                    },
                    {
                        value: 'payments_export',
                        label: 'export'
                    }
                ]
            },

        ]
    }
    

    let dropdownMenu: IMenu = {
        label: 'Dropdown',
        permissions: [{
            value: 'dropdown_menu',
            label: 'DropDown Button'
        }],
        menues: [
            {
                label: 'Article',
                permissions: [
                    {
                        value: 'article_view',
                        label: 'view'
                    },
                    {
                        value: 'article_create',
                        label: 'create'
                    },
                    {
                        value: 'article_edit',
                        label: 'edit'
                    },
                    {
                        value: 'article_delete',
                        label: 'delete'
                    },
                    {
                        value: 'article_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Machine',
                permissions: [
                    {
                        value: 'machine_view',
                        label: 'view'
                    },
                    {
                        value: 'machine_create',
                        label: 'create'
                    },
                    {
                        value: 'machine_edit',
                        label: 'edit'
                    },
                    {
                        value: 'machine_delete',
                        label: 'delete'
                    },
                    {
                        value: 'machine_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Machine Category',
                permissions: [
                    {
                        value: 'machine_category_view',
                        label: 'view'
                    },
                    {
                        value: 'machine_category_create',
                        label: 'create'
                    },
                    {
                        value: 'machine_category_edit',
                        label: 'edit'
                    },
                    {
                        value: 'machine_category_delete',
                        label: 'delete'
                    },
                    {
                        value: 'machine_category_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Dye',
                permissions: [
                    {
                        value: 'dye_view',
                        label: 'view'
                    },
                    {
                        value: 'dye_create',
                        label: 'create'
                    },
                    {
                        value: 'dye_edit',
                        label: 'edit'
                    },
                    {
                        value: 'dye_delete',
                        label: 'delete'
                    },
                    {
                        value: 'dye_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Dye Location',
                permissions: [
                    {
                        value: 'dye_location_view',
                        label: 'view'
                    },
                    {
                        value: 'dye_location_create',
                        label: 'create'
                    },
                    {
                        value: 'dye_location_edit',
                        label: 'edit'
                    },
                    {
                        value: 'dye_location_delete',
                        label: 'delete'
                    },
                    {
                        value: 'dye_location_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Lead Type',
                permissions: [
                    {
                        value: 'leadtype_view',
                        label: 'view'
                    },
                    {
                        value: 'leadtype_create',
                        label: 'create'
                    },
                    {
                        value: 'leadtype_edit',
                        label: 'edit'
                    },
                    {
                        value: 'leadtype_delete',
                        label: 'delete'
                    },
                    {
                        value: 'leadtype_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Lead Source',
                permissions: [
                    {
                        value: 'lead_source_view',
                        label: 'view'
                    },
                    {
                        value: 'lead_source_create',
                        label: 'create'
                    },
                    {
                        value: 'lead_source_edit',
                        label: 'edit'
                    },
                    {
                        value: 'lead_source_delete',
                        label: 'delete'
                    },
                    {
                        value: 'lead_source_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Lead Stage',
                permissions: [
                    {
                        value: 'leadstage_view',
                        label: 'view'
                    },
                    {
                        value: 'leadstage_create',
                        label: 'create'
                    },
                    {
                        value: 'leadstage_edit',
                        label: 'edit'
                    },
                    {
                        value: 'leadstage_delete',
                        label: 'delete'
                    },
                    {
                        value: 'leadstage_export',
                        label: 'export'
                    }
                ]
            }, 
            {
                label: 'Checklist Category',
                permissions: [
                    {
                        value: 'checklist_category_view',
                        label: 'view'
                    },
                    {
                        value: 'checklist_category_create',
                        label: 'create'
                    },
                    {
                        value: 'checklist_category_edit',
                        label: 'edit'
                    },
                    {
                        value: 'checklist_category_delete',
                        label: 'delete'
                    },
                    {
                        value: 'checklist_category_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Payment Category',
                permissions: [
                    {
                        value: 'payment_category_view',
                        label: 'view'
                    },
                    {
                        value: 'payment_category_create',
                        label: 'create'
                    },
                    {
                        value: 'payment_category_edit',
                        label: 'edit'
                    },
                    {
                        value: 'payment_category_delete',
                        label: 'delete'
                    },
                    {
                        value: 'payment_category_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Expense Location',
                permissions: [
                    {
                        value: 'expense_location_view',
                        label: 'view'
                    },
                    {
                        value: 'expense_location_create',
                        label: 'create'
                    },
                    {
                        value: 'expense_location_edit',
                        label: 'edit'
                    },
                    {
                        value: 'expense_location_delete',
                        label: 'delete'
                    },
                    {
                        value: 'expense_location_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Item Unit',
                permissions: [
                    {
                        value: 'item_unit_view',
                        label: 'view'
                    },
                    {
                        value: 'item_unit_create',
                        label: 'create'
                    },
                    {
                        value: 'item_unit_edit',
                        label: 'edit'
                    },
                    {
                        value: 'item_unit_delete',
                        label: 'delete'
                    },
                    {
                        value: 'item_unit_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Expense Category',
                permissions: [
                    {
                        value: 'expense_category_view',
                        label: 'view'
                    },
                    {
                        value: 'expense_category_create',
                        label: 'create'
                    },
                    {
                        value: 'expense_category_edit',
                        label: 'edit'
                    },
                    {
                        value: 'expense_category_delete',
                        label: 'delete'
                    },
                    {
                        value: 'expense_category_export',
                        label: 'export'
                    }
                ]
            },
            
        ]
    }
   
    let excelReportMenu: IMenu = {
        label: 'ExcelDB',
        permissions: [
            {
                value: 'excel_db_menu',
                label: 'ExcelDB Button'
            },
        ],
        menues: [
            {
                label: 'Grp Excel',
                permissions: [
                    {
                        value: 'grp_excel_view',
                        label: 'view'
                    },
                    {
                        value: 'grp_excel_create',
                        label: 'create'
                    },
                    {
                        value: 'grp_excel_edit',
                        label: 'edit'
                    },
                    {
                        value: 'grp_excel_delete',
                        label: 'delete'
                    },
                    {
                        value: 'grp_excel_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Salesman Leaves',
                permissions: [
                    {
                        value: 'salesman_leaves_report_view',
                        label: 'view'
                    },
                    {
                        value: 'salesman_leaves_report_create',
                        label: 'create'
                    },
                    {
                        value: 'salesman_leaves_report_edit',
                        label: 'edit'
                    },
                    {
                        value: 'salesman_leaves_report_delete',
                        label: 'delete'
                    },
                    {
                        value: 'salesman_leaves_report_export',
                        label: 'export'
                    }
                ]
            },
        ]
    }

    let featureReportsMenu: IMenu = {
        label: 'Reports',
        permissions: [{
            value: 'report_menu',
            label: 'Report Button'
        }], menues: [
            {
                label: 'Shoe Weight Difference',
                permissions: [
                    {
                        value: 'shoe_weight_report_view',
                        label: 'view'
                    },
                    {
                        value: 'shoe_weight_report_create',
                        label: 'create'
                    },
                    {
                        value: 'shoe_weight_report_edit',
                        label: 'edit'
                    },
                    {
                        value: 'shoe_weight_report_delete',
                        label: 'delete'
                    },
                    {
                        value: 'shoe_weight_report_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Dye Status',
                permissions: [
                    {
                        value: 'dye_status_report_view',
                        label: 'view'
                    },
                    {
                        value: 'dye_status_report_create',
                        label: 'create'
                    },
                    {
                        value: 'dye_status_report_edit',
                        label: 'edit'
                    },
                    {
                        value: 'dye_status_report_delete',
                        label: 'delete'
                    },
                    {
                        value: 'dye_status_report_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Machine Wise Production',
                permissions: [
                    {
                        value: 'machine_wise_production_report_view',
                        label: 'view'
                    },
                    {
                        value: 'machine_wise_production_report_create',
                        label: 'create'
                    },
                    {
                        value: 'machine_wise_production_report_edit',
                        label: 'edit'
                    },
                    {
                        value: 'machine_wise_production_report_delete',
                        label: 'delete'
                    },
                    {
                        value: 'machine_wise_production_report_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Thekedar Wise Production',
                permissions: [
                    {
                        value: 'thekedar_wise_production_report_view',
                        label: 'view'
                    },
                    {
                        value: 'thekedar_wise_production_report_create',
                        label: 'create'
                    },
                    {
                        value: 'thekedar_wise_production_report_edit',
                        label: 'edit'
                    },
                    {
                        value: 'thekedar_wise_production_report_delete',
                        label: 'delete'
                    },
                    {
                        value: 'thekedar_wise_production_report_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Machine-category Wise Production',
                permissions: [
                    {
                        value: 'machine_category_wise_production_report_view',
                        label: 'view'
                    },
                    {
                        value: 'machine_category_wise_production_report_create',
                        label: 'create'
                    },
                    {
                        value: 'machine_category_wise_production_report_edit',
                        label: 'edit'
                    },
                    {
                        value: 'machine_category_wise_production_report_delete',
                        label: 'delete'
                    },
                    {
                        value: 'machine_category_wise_production_report_export',
                        label: 'export'
                    }
                ]
            },

            {
                label: 'Assigned Refer',
                permissions: [
                    {
                        value: 'assignedrefer_view',
                        label: 'view'
                    },
                    {
                        value: 'assignedrefer_create',
                        label: 'create'
                    },
                    {
                        value: 'assignedrefer_edit',
                        label: 'edit'
                    },
                    {
                        value: 'assignedrefer_delete',
                        label: 'delete'
                    },
                    {
                        value: 'assignedrefer_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'New Customers',
                permissions: [
                    {
                        value: 'newrefer_view',
                        label: 'view'
                    },
                    {
                        value: 'newrefer_create',
                        label: 'create'
                    },
                    {
                        value: 'newrefer_edit',
                        label: 'edit'
                    },
                    {
                        value: 'newrefer_delete',
                        label: 'delete'
                    },
                    {
                        value: 'newrefer_export',
                        label: 'export'
                    },
                    {
                        value: 'refer_report_conversion_manual',
                        label: 'Manual Refer Conversion'
                    },
                ]
            },
            {
                label: 'Crm Activities',
                permissions: [
                    {
                        value: 'activities_view',
                        label: 'view'
                    },
                    {
                        value: 'activities_create',
                        label: 'create'
                    },
                    {
                        value: 'activities_edit',
                        label: 'edit'
                    },
                    {
                        value: 'activities_delete',
                        label: 'delete'
                    },
                    {
                        value: 'activities_export',
                        label: 'export'
                    }
                ]
            },
        ]
    }

    let salesMenu: IMenu = {
        label: 'Sales',
        permissions: [{
            value: 'sales_menu',
            label: 'Sales Button'
        }],
        menues: [


            {
                label: 'SalesMan Visit',
                permissions: [
                    {
                        value: 'salesman_visit_view',
                        label: 'view'
                    },
                    {
                        value: 'salesman_visit_create',
                        label: 'create'
                    },
                    {
                        value: 'salesman_visit_edit',
                        label: 'edit'
                    },
                    {
                        value: 'salesman_visit_delete',
                        label: 'delete'
                    },
                    {
                        value: 'salesman_visit_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Salesman Daily Visit New/old/Time - Chanchal',
                permissions: [
                    {
                        value: 'salesman_attendance_view',
                        label: 'view'
                    },
                    {
                        value: 'salesman_attendance_create',
                        label: 'create'
                    },
                    {
                        value: 'salesman_attendance_edit',
                        label: 'edit'
                    },
                    {
                        value: 'salesman_attendance_delete',
                        label: 'delete'
                    },
                    {
                        value: 'salesman_attendance_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'Salesman Daily Visit New/old/Time - Auto',
                permissions: [
                    {
                        value: 'salesman_attendance_auto_view',
                        label: 'view'
                    },
                    {
                        value: 'salesman_attendance_auto_create',
                        label: 'create'
                    },
                    {
                        value: 'salesman_attendance_auto_edit',
                        label: 'edit'
                    },
                    {
                        value: 'salesman_attendance_auto_delete',
                        label: 'delete'
                    },
                    {
                        value: 'salesman_attendance_auto_export',
                        label: 'export'
                    }
                ]
            },
            {
                label: 'SalesMan KPI',
                permissions: [
                    {
                        value: 'salesman_kpi_view',
                        label: 'view'
                    },
                    {
                        value: 'salesman_kpi_create',
                        label: 'create'
                    },
                    {
                        value: 'salesman_kpi_edit',
                        label: 'edit'
                    },
                    {
                        value: 'salesman_kpi_delete',
                        label: 'delete'
                    },
                    {
                        value: 'salesman_kpi_export',
                        label: 'export'
                    }
                ]
            }
        ]
    }

    permissions.push(dashboardMenu)
    permissions.push(authorizationMenu)
    permissions.push(featureMenu)
    permissions.push(dropdownMenu)
    permissions.push(excelReportMenu)
    permissions.push(featureReportsMenu)
    permissions.push(salesMenu)

    return permissions;
}