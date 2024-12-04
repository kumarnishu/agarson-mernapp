import { CronJob } from "cron";
import { Checklist } from "../models/checklist.model";
import { ChecklistBox } from "../models/checklist-box.model";
import { getNextMonday, getPrevMonday, nextMonth, nextYear, previousMonth, previousYear } from "../utils/datesHelper";


export async function activateChecklist() {

    // daily trigger
    new CronJob("0 0 1/1 * *", async () => {
        let dt1 = new Date()
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date()

        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let works = await Checklist.find({frequency: 'daily' });
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: dt1, $lt: dt2 } })
            if (box) {
                let boxes = work.last_10_boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true})
        }
        await Checklist.updateMany({frequency:"daily"},{lastcheckedbox: undefined })
    }).start()

    //weekly
    new CronJob("0 0 * * 1", async () => {
        let works = await Checklist.find({ frequency: 'weekly' })
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: getPrevMonday(), $lt: getNextMonday() } })
            if (box) {
                let boxes = work.last_10_boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true})
        }
        await Checklist.updateMany({ frequency:"weekly"},{lastcheckedbox: undefined })
    }).start()

    //monthly
    new CronJob("0 0 1 * *", async () => {
        let works = await Checklist.find({  frequency: 'monthly' })
        for (let i = 0; i < works.length; i++) {
             let work = works[i];
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: previousMonth, $lt: nextMonth } })
            if (box) {
                let boxes = work.last_10_boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true})
        }
        await Checklist.updateMany({ frequency:"monthly"},{lastcheckedbox: undefined })
    }).start()

    //yearly
    new CronJob("0 0 1 1 *", async () => {
        let works = await Checklist.find({  frequency: 'yearly' })
        for (let i = 0; i < works.length; i++) {
             let work = works[i];
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: previousYear, $lt: nextYear } })
            if (box) {
                let boxes = work.last_10_boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
        await Checklist.updateMany({ frequency: "yearly" }, { lastcheckedbox: undefined })
    }).start()
}