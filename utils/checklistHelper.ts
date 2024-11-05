import { IChecklist } from "../models/checklist";
import { IChecklistBox } from "../models/checklist-box";
import { hundredDaysAgo, nextMonth, nextYear, previousMonth, previousYear } from "./datesHelper";

export function getBoxes(checklist: IChecklist, checklist_boxes: IChecklistBox[]) {
    if (checklist.frequency == "daily")
        return getDailyboxes(checklist, checklist_boxes)
    if (checklist.frequency == "weekly")
        return getWeeklyboxes(checklist, checklist_boxes)
    if (checklist.frequency == "monthly")
        return getMonthlyboxes(checklist, checklist_boxes)
    else
        return getYearlyBoxes(checklist, checklist_boxes)
}

function getDailyboxes(checklist: IChecklist, checklist_boxes: IChecklistBox[]) {
    let dt1 = new Date()
    dt1.setDate(dt1.getDate() - 6)
    let dt2 = new Date()
    dt2.setDate(dt2.getDate() + 4)
    dt1.setHours(0, 0, 0, 0)
    dt2.setHours(0, 0, 0, 0)
    let result = checklist_boxes.filter((b) => {
        return b.date >= dt1 && b.date < dt2
    }).map((bo) => {
        return {
            _id: bo._id,
            stage: bo.stage,
            checklist: { id: checklist._id, label: checklist.work_title, value: checklist.work_title },
            date: bo.date.toString()
        }
    })
    return result
}
function getWeeklyboxes(checklist: IChecklist, checklist_boxes: IChecklistBox[]) {
    let dt1 = new Date(previousMonth)
    let dt2 = new Date(nextMonth)

    let result = checklist_boxes.filter((b) => {
        return b.date >= dt1 && b.date < dt2
    }).map((bo) => {
        return {
            _id: bo._id,
            stage: bo.stage,
            checklist: { id: checklist._id, label: checklist.work_title, value: checklist.work_title },
            date: bo.date.toString()
        }
    })
    return result
}
function getMonthlyboxes(checklist: IChecklist, checklist_boxes: IChecklistBox[]) {
    let dt1 = new Date(hundredDaysAgo)
    let dt2 = new Date(nextMonth)
    let result = checklist_boxes.filter((b) => {
        return b.date >= dt1 && b.date < dt2
    }).map((bo) => {
        return {
            _id: bo._id,
            stage: bo.stage,
            checklist: { id: checklist._id, label: checklist.work_title, value: checklist.work_title },
            date: bo.date.toString()
        }
    })
    return result
}
function getYearlyBoxes(checklist: IChecklist, checklist_boxes: IChecklistBox[]) {
    let dt1 = new Date(previousYear)
    let dt2 = new Date(nextYear)
  
    let result = checklist_boxes.filter((b) => {
        return b.date >= dt1 && b.date < dt2
    }).map((bo) => {
        return {
            _id: bo._id,
            stage: bo.stage,
            checklist: { id: checklist._id, label: checklist.work_title, value: checklist.work_title },
            date: bo.date.toString()
        }
    })
    return result
}