import { CronJob } from "cron";
import { Checklist } from "../models/checklist";


export async function activateChecklist() {

    // daily trigger
    new CronJob("0 0 1/1 * *", async () => {
        let works = await Checklist.find({ active: false, frequency: 'daily' });
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
    }).start()

    //weekly
    new CronJob("0 0 * * 1", async () => {
        let works = await Checklist.find({ active: false, frequency: 'weekly' })
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
    }).start()

    //monthly
    new CronJob("0 0 1 * *", async () => {
        let works = await Checklist.find({ active: false, frequency: 'monthly' })
        for (let i = 0; i < works.length; i++) {
             let work = works[i];
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
    }).start()

    //yearly
    new CronJob("0 0 1 1 *", async () => {
        let works = await Checklist.find({ active: false, frequency: 'yearly' })
        for (let i = 0; i < works.length; i++) {
             let work = works[i];
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
    }).start()
}