import { CronJob } from "cron";
import { Checklist } from "../models/checklist";


export async function activateChecklist() {

    // daily trigger
    new CronJob("15 8 1/1 * *", async () => {
        let works = await Checklist.find({ active: false, frequency: 'daily' });
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Checklist.findByIdAndUpdate(work._id, { active: true})
        }
        
        await Checklist.updateMany({frequency:"daily"},{lastcheckedbox: undefined })
    }).start()

    //weekly
    new CronJob("15 8 * * 1", async () => {
        let works = await Checklist.find({ active: false, frequency: 'weekly' })
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Checklist.findByIdAndUpdate(work._id, { active: true})
        }
        await Checklist.updateMany({ frequency:"weekly"},{lastcheckedbox: undefined })
    }).start()

    //monthly
    new CronJob("15 8 1 * *", async () => {
        let works = await Checklist.find({ active: false, frequency: 'monthly' })
        for (let i = 0; i < works.length; i++) {
             let work = works[i];
            await Checklist.findByIdAndUpdate(work._id, { active: true})
        }
        await Checklist.updateMany({ frequency:"monthly"},{lastcheckedbox: undefined })
    }).start()

    //yearly
    new CronJob("15 8 1 1 *", async () => {
        let works = await Checklist.find({ active: false, frequency: 'yearly' })
        for (let i = 0; i < works.length; i++) {
             let work = works[i];
            await Checklist.findByIdAndUpdate(work._id, { active: true })
        }
        await Checklist.updateMany({ frequency: "yearly" }, { lastcheckedbox: undefined })
    }).start()
}