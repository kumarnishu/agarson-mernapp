import { NextFunction, Request, Response, Router } from 'express';
import express from 'express'
import { KeyCategory } from '../models/key-category.model';
import { ExcelDBRemark } from '../models/excel-db-remark.model';
import { Reference } from '../models/references.model';

export class TestController {
 public router: Router
    constructor() {
        this.router = express.Router();
        this.generateRoutes(); // Automatically generate routes
    }
    public async test(req: Request, res: Response, next: NextFunction) {

        // const category = req.query.category
        // let dt1 = new Date()
        // dt1.setHours(0, 0, 0, 0)
        // let dt2 = new Date()

        // dt2.setDate(dt1.getDate() + 1)
        // dt2.setHours(0)
        // dt2.setMinutes(0)
        // let cat = await KeyCategory.findOne({ category: category })
        // let remarks = await ExcelDBRemark.find({
        //     created_at: { $gte: dt1, $lt: dt2 },
        //     category: cat
        // })
        //     .populate({
        //         path: 'created_by',
        //         select: 'username' // Specify the fields to fetch from the populated model
        //     })
        //     .select('remark obj created_at');

        // return res.status(200).json({
        //     total: await ExcelDBRemark.find({ category: cat }).count(),
        //     today: remarks.length,
        //     remarks: remarks
        // });
        let items = await Reference.findOne({ amount: 20000 })
        return res.status(200).json(items)

    }
    private generateRoutes(): void {
        const methodPrefix = ['get', 'post', 'put', 'patch', 'delete']; // Allowed HTTP methods

        Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter((methodName) => methodName !== 'constructor' && typeof (this as any)[methodName] === 'function')
            .forEach((methodName) => {
                const match = methodName.match(new RegExp(`^(${methodPrefix.join('|')})([A-Z].*)$`));
                if (match) {
                    const [, httpMethod, routeName] = match;
                    const routePath =
                        '/' +
                        routeName
                            .replace(/([A-Z])/g, '-$1')
                            .toLowerCase()
                            .substring(1); // Convert "CamelCase" to "kebab-case"
                    //@ts-ignore
                    this.router[httpMethod](routePath, (this as any)[methodName].bind(this));
                }
            });
    }
}