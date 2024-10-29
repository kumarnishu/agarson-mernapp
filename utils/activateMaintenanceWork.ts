import { CronJob } from "cron";
import { MaintenanceItem } from "../models/maintainence/maintainence.item.model";
import { Maintenance } from "../models/maintainence/maintainence.model";

export async function ActivateMaintenanceWork() {

    // daily trigger
    new CronJob("00 00 1/1 * *", async () => {
        let works = await Maintenance.find({ active: false, frequency: 'daily' }).populate('items');
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Maintenance.findByIdAndUpdate(work._id, { active: true })
            let items = work.items;
            items.forEach(async (item) => {
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'open' })
            });
        }
    }).start()

    //weekly
    new CronJob("0 0 * * 1", async () => {
        let works = await Maintenance.find({ active: false, frequency: 'weekly' }).populate('items');
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Maintenance.findByIdAndUpdate(work._id, { active: true })
            let items = work.items;
            items.forEach(async (item) => {
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'open' })
            });
        }
    }).start()

    //monthly
    new CronJob("0 0 1 * *", async () => {
        let works = await Maintenance.find({ active: false, frequency: 'monthly' }).populate('items');
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Maintenance.findByIdAndUpdate(work._id, { active: true })
            let items = work.items;
            items.forEach(async (item) => {
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'open' })
            });
        }
    }).start()

    //yearly
    new CronJob("0 0 1 1 *", async () => {
        let works = await Maintenance.find({ active: false, frequency: 'yearly' }).populate('items');
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Maintenance.findByIdAndUpdate(work._id, { active: true })
            let items = work.items;
            items.forEach(async (item) => {
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'open' })
            });
        }
    }).start()
    console.log('started maintainence jobs')
}