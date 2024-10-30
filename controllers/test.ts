import { NextFunction, Request, Response } from 'express';

export const test = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date(String(req.query.dt1));
    let dt2 = new Date(String(req.query.dt2))
    let frequency = "daily"

    let result: {
        dt1: string,
        dt2: string,
        checked: boolean
    }[] = []


    if (frequency == "daily") {
        let current_date = new Date(dt1)

        while (current_date <= new Date(dt2)) {
            result.push({
                dt1: current_date.toString(),
                dt2: new Date(new Date().setDate(new Date(current_date).getDate() + 1)).toString(),
                checked: true
            })
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (frequency == "weekly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(dt2)) {
            result.push({
                dt1: current_date.toString(),
                dt2: new Date().setDate(new Date(current_date).getDate() + 6).toString(),
                checked: true
            })
            current_date.setDate(new Date(current_date).getDate() + 6)
        }
    }
    // if (frequency === "monthly") {
    //     let current_date = new Date(dt1); // Start from the first date of the range
    //     current_date.setDate(1); // Set to the first day of the month

    //     // Iterate while current_date is less than or equal to dt2
    //     while (current_date <= new Date(dt2)) {
    //         // Calculate the next month's date
    //         let nextMonthDate = new Date(current_date);
    //         nextMonthDate.setMonth(current_date.getMonth() + 1);

    //         // Check if the current month is within the specified date range
    //         if (current_date >= dt1 && current_date < dt2) {
    //             let remark = await Remark.findOne({
    //                 maintainable_item: item._id,
    //                 created_at: { $gte: current_date, $lt: nextMonthDate }
    //             });

    //             result.push({
    //                 dt1: current_date.toString(),
    //                 dt2: nextMonthDate.toString(),
    //                 checked: remark && item.stage === 'done' ? true : false
    //             });
    //         }

    //         // Move to the next month
    //         current_date.setMonth(current_date.getMonth() + 1);
    //     }
    // }

    // if (frequency === "yearly") {
    //     let current_date = new Date(dt1); // Start from the first date of the range
    //     current_date.setMonth(0); // Set to January (month 0)
    //     current_date.setDate(1); // Set to the first day of the month

    //     // Iterate while current_date is less than or equal to dt2
    //     while (current_date <= new Date(dt2)) {
    //         // Calculate the next year's date
    //         let nextYearDate = new Date(current_date);
    //         nextYearDate.setFullYear(current_date.getFullYear() + 1);

    //         // Check if the current year is within the specified date range
    //         if (current_date >= dt1 && current_date < dt2) {
    //             let remark = await Remark.findOne({
    //                 maintainable_item: item._id,
    //                 created_at: { $gte: current_date, $lt: nextYearDate }
    //             });

    //             result.push({
    //                 dt1: current_date.toString(),
    //                 dt2: nextYearDate.toString(),
    //                 checked: remark && item.stage === 'done' ? true : false
    //             });
    //         }

    //         // Move to the next year
    //         current_date.setFullYear(current_date.getFullYear() + 1);
    //     }
    // }

    return res.status(200).json(result);
}