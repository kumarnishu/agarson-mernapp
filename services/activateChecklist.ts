import { CronJob } from "cron";
import { getNextMonday, getPrevMonday, } from "../utils/datesHelper";
import { Checklist, ChecklistBox } from "../models/ChecklistModel";


export async function activateChecklist() {

    // daily trigger
    new CronJob("0 0 1/1 * *", async () => {
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()

        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let works = await Checklist.find({ frequency: 'daily' });
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: dt1, $lt: dt2 } })
            if (box) {
                let boxes = work.last_10_boxes
                if (boxes && boxes.length == 5)
                    boxes = boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
        await Checklist.updateMany({ frequency: "daily" }, { lastcheckedbox: undefined })
    }).start()

    //weekly
    new CronJob("0 0 * * 1", async () => {
        let works = await Checklist.find({ frequency: 'weekly' })
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: getPrevMonday(), $lt: getNextMonday() } })
           if (box) {
                let boxes = work.last_10_boxes
                if (boxes && boxes.length == 5)
                    boxes = boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
        await Checklist.updateMany({ frequency: "weekly" }, { lastcheckedbox: undefined })
    }).start()

    //monthly
    // "1/2 * * * *"
    new CronJob("0 0 1 * *", async () => {
        let works = await Checklist.find({ frequency: 'monthly' })
        let dt1 = new Date()
        dt1.setDate(1)
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()
        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0, 0, 0, 0)
        for (let i = 0; i < works.length; i++) {
            let work = works[i];
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: dt1, $lt: dt2 } })
           if (box) {
                let boxes = work.last_10_boxes
                if (boxes && boxes.length == 5)
                    boxes = boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
        await Checklist.updateMany({ frequency: "monthly" }, { lastcheckedbox: undefined })
    }).start()

    //yearly
    new CronJob("0 0 1 1 *", async () => {
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()
        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0, 0, 0, 0)

        let works = await Checklist.find({ frequency: 'yearly' })
        for (let i = 0; i < works.length; i++) {
            let work = works[i];
            let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: dt1, $lt: dt2 } })
           if (box) {
                let boxes = work.last_10_boxes
                if (boxes && boxes.length == 5)
                    boxes = boxes.slice(1)
                boxes.push(box)
                work.last_10_boxes = boxes;
                await work.save();
            }
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
        await Checklist.updateMany({ frequency: "yearly" }, { lastcheckedbox: undefined })
    }).start()
}