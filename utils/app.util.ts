import { CronJob } from "cron";
import { Maintenance } from "../models/features/maintainence.model";
import { MaintenanceItem } from "../models/features/maintainence.item.model";
import { IState } from "../models/dropdown/state.model";
import { IPartyTargetReport } from "../models/features/partytarget.model";
import { User } from "../models/features/user.model";
import { utils, writeFileXLSX } from "xlsx";
import { bucket, bucketName } from "../app";
import { Asset } from "../models/features/user.model";
import nodemailer from "nodemailer";



export async function ActivateMaintenanceWork() {

    // daily trigger
    new CronJob("00 00 1/1 * *", async () => {
        let works = await Maintenance.find({ active: false, frequency: 'daily' }).populate('items');
        for (let i = 0; i < works.length; i++) {
            let work = works[i]
            await Maintenance.findByIdAndUpdate(work._id, { active: true })
            let items = work.items;
            items.forEach(async (item) => {
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'pending' })
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
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'pending' })
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
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'pending' })
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
                await MaintenanceItem.findByIdAndUpdate(item._id, { stage: 'pending' })
            });
        }
    }).start()
    console.log('started maintainence jobs')
}


export async function HandleCRMCitiesAssignment(user_ids: string[],
    city_ids: string[],
    flag: number) {
    let owners = user_ids

    if (flag == 0) {
        for (let i = 0; i < owners.length; i++) {
            let owner = await User.findById(owners[i]).populate('assigned_crm_cities');
            if (owner) {
                let oldcitiesids = owner.assigned_crm_cities.map((item) => { return item._id.valueOf() });
                oldcitiesids = oldcitiesids.filter((item) => { return !city_ids.includes(item) });

                await User.findByIdAndUpdate(owner._id, {
                    assigned_crm_cities: oldcitiesids
                })
            }
        }
    }
    else {
        for (let k = 0; k < owners.length; k++) {

            let owner = await User.findById(owners[k]).populate('assigned_crm_cities');
            if (owner) {
                let oldcitiesids = owner.assigned_crm_cities.map((item) => { return item._id.valueOf() });
                for (let i = 0; i < city_ids.length; i++) {
                    if (!oldcitiesids.includes(city_ids[i]))
                        oldcitiesids.push(city_ids[i]);
                }

                await User.findByIdAndUpdate(owner._id, {
                    assigned_crm_cities: oldcitiesids
                })
            }
        }
    }
}

export function decimalToTime(decimal: any) {
    // Convert decimal to total hours
    const totalHours = decimal * 24;

    // Get whole hours
    const hours = Math.floor(totalHours);

    // Get minutes from the remaining fraction
    const minutes = Math.round((totalHours - hours) * 60);

    // Format hours and minutes to "HH:MM"
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return formattedTime;
}

export const destroyFile = async (id: string) => {
    try {
        let bucketFile = bucket.file(id)
        await bucketFile.delete()
    } catch (error) {
        console.log("could not file may be not available in server", error);
    }
}



export function GetMonthlyachievementBystate(reports: IPartyTargetReport[], mont: number) {
    let result = 0;
    if (mont == 0)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Jan) }, 0).toFixed())
    else if (mont == 1)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Feb) }, 0).toFixed())
    else if (mont == 2)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Mar) }, 0).toFixed())
    else if (mont == 3)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Apr) }, 0).toFixed())
    else if (mont == 4)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_May) }, 0).toFixed())
    else if (mont == 5)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Jun) }, 0).toFixed())
    else if (mont == 6)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Jul) }, 0).toFixed())
    else if (mont == 7)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Aug) }, 0).toFixed())
    else if (mont == 8)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Sep) }, 0).toFixed())
    else if (mont == 9)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Oct) }, 0).toFixed())
    else if (mont == 10)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Nov) }, 0).toFixed())
    else if (mont == 11)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Dec) }, 0).toFixed())

    return result
}

export function GetMonthlytargetBystate(state: IState, mont: number) {
    let result = 0;
    if (mont == 0)
        result = state.jan
    else if (mont == 1)
        result = state.feb
    else if (mont == 2)
        result = state.mar
    else if (mont == 3)
        result = state.apr
    else if (mont == 4)
        result = state.may
    else if (mont == 5)
        result = state.jun
    else if (mont == 6)
        result = state.jul
    else if (mont == 7)
        result = state.aug
    else if (mont == 8)
        result = state.sep
    else if (mont == 9)
        result = state.oct
    else if (mont == 10)
        result = state.nov
    else if (mont == 11)
        result = state.dec

    return result
}

export function GetYearlyachievementBystate(reports: IPartyTargetReport[]) {
    let result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Apr) + Number(b.Cur_May) + Number(b.Cur_Jun) + Number(b.Cur_Jul) + Number(b.Cur_Aug) + Number(b.Cur_Sep) + Number(b.Cur_Oct) + Number(b.Cur_Nov) + Number(b.Cur_Dec) + Number(b.Cur_Jan) + Number(b.Cur_Feb) + Number(b.Cur_Mar) }, 0).toFixed())
    return result
}

export function GetLastYearlyachievementBystate(reports: IPartyTargetReport[]) {
    let result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Last_Apr) + Number(b.Last_May) + Number(b.Last_Jun) + Number(b.Last_Jul) + Number(b.Last_Aug) + Number(b.Last_Sep) + Number(b.Last_Oct) + Number(b.Last_Nov) + Number(b.Last_Dec) + Number(b.Last_Jan) + Number(b.Last_Feb) + Number(b.Last_Mar) }, 0).toFixed())
    return result
}



export default function SaveExcelTemplateToDisk(data: any[], guide?: any[]) {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);
    utils.book_append_sheet(wb, ws, "Template");
    if (guide && guide.length > 0) {
        let nn = utils.json_to_sheet(guide)
        utils.book_append_sheet(wb, nn, `Guide`);
    }
    writeFileXLSX(wb, `file`);

}

export function isvalidDate(d: any) {
    if (Object.prototype.toString.call(d) === "[object Date]") {
        // it is a date
        if (isNaN(d)) { // d.getTime() or d.valueOf() will also work
            return false
        } else {
            return true
        }
    } else {
        return false
    }
}



export const uploadFileToCloud = async (file: string | Buffer, storageFolder: string, filename: string) => {
    let document: Asset | undefined = undefined
    try {
        let tmpName = `${storageFolder}/${Number(new Date())}/${filename}`
        console.log(tmpName)
        let bucketFile = bucket.file(tmpName)
        await bucketFile.save(file)
        if (bucketFile) {
            document = {
                _id: tmpName,
                filename: filename,
                public_url: bucketFile.publicUrl() || "",
                content_type: bucketFile.metadata.contentType || "",
                size: String(bucketFile.metadata.size) || "0",
                bucket: bucketName,
                created_at: new Date()
            }
            return document;
        }
    }
    catch (err) {
        console.log("file uploading server error", err);
        return undefined;
    }
}

export async function imageUrlToBase64(url: string) {
    try {
        const response = await fetch(url);

        const blob = await response.arrayBuffer();

        const contentType = "image/jpeg"

        const base64String = `data:${contentType};base64,${Buffer.from(
            blob,
        ).toString('base64')}`;

        return base64String;
    } catch (err) {
        console.log(err);
    }
}



export const sendEmail = async (options: {
    to: string,
    subject: string,
    message: string
}) => {
    let host = String(process.env.EMAIL_HOST)
    let port = Number(process.env.EMAIL_PORT)
    let service = String(process.env.EMAIL_SERVICE)
    let app_email = String(process.env.APP_EMAIL)
    let pass = String(process.env.APP_EMAIL_PASSWORD)
    try {

        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            service: service,
            auth: {
                user: app_email,
                pass: pass
            },
        });

        const mailOptions = {
            from: app_email,
            to: options.to,
            subject: options.subject,
            text: options.message,
        };
        await transporter.sendMail(mailOptions)
        return true
    }
    catch (err) {
        console.log("error", err);
        return false
    }
}

