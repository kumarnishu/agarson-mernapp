import { Request, Response, NextFunction } from "express";

type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>

export function UseMiddleware(...middlewares: Middleware[]) {
    return function (target: any, propertyKey: string) {
        if (!target.middlewares) {
            target.middlewares = {};
        }
        if (!target.middlewares[propertyKey]) {
            target.middlewares[propertyKey] = [];
        }
        target.middlewares[propertyKey].push(...middlewares);
    };
}