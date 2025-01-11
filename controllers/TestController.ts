import { NextFunction, Request, Response } from 'express';


export class TestController {

    public async test(req: Request, res: Response, next: NextFunction) {
      
        return res.status(200).json({ message: "success" })

    }

}
