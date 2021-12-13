import authenticatedMiddleware from "@/middleware/auth.middleware";
import HttpException from "@/utils/exceptions/http.exception";
import Controller from "@/utils/interface/controller.interface";
import { logInfo, logError } from "@/utils/logger/logger";
import { NextFunction, Router, Request, Response } from "express";
import { Investment } from "./user.interface";
import UserRepository from "./user.repository";
import UserService from "./user.service";


class UserController implements Controller {

    public path = '/user';
    public router = Router();
    public userService: UserService
    public logContext: string = 'UserController'

    constructor(userRepo: UserRepository) {
        this.initRoutes();
        this.userService = new UserService(userRepo)
    }

    private initRoutes() {
        this.router.post(
            `${this.path}/register`,
            this.register
        )
        this.router.post(
            `${this.path}/login`,
            this.loginUser
        )
        
        this.router.post(
            `${this.path}/investment`,
            authenticatedMiddleware,
            this.getUserInitInvestment
        )
        this.router.post(
            `${this.path}/investment/all`,
            authenticatedMiddleware,
            this.getAllInvestments
        )
        this.router.post(
            `${this.path}/investment/calculate`,
            authenticatedMiddleware,
            this.calculateInitInvestment
        )
        this.router.post(
            `${this.path}/profit`,
            authenticatedMiddleware,
            this.saveTotalProfit
        )

        this.router.get(`${this.path}`, authenticatedMiddleware, this.getUser);
    }

    private register = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let userResponse: any = await this.userService.register(req.body);
            res.status(200).send(userResponse)
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    }

    private loginUser = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let response = await this.userService.loginUser(req.body.email, req.body.password);
            res.status(200).send(response)
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    }

    private getUserInitInvestment = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let initialInvestment = await this.userService.getUserInitInvestment(req.body.userId);
            res.status(200).send({initialInvestment: initialInvestment})
        } catch (error) {
        }
    }

    private getAllInvestments = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let investments: Investment[] = await this.userService.getAllInvestments(req.body.userId);
            logInfo('Response from getAllInvestments()', this.logContext, JSON.stringify(investments))
            res.status(200).send(investments)
        } catch (error) {
            logInfo('Error from getAllInvestments', this.logContext, error)
        }
    }

    private calculateInitInvestment = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let initialInvestment: number = 0;
            logInfo('Incoming request in calcluateInitInvestment()', this.logContext, JSON.stringify(req.body))
            if(req.body.isUpdate){
                initialInvestment = await this.userService.updateInitInvestment(req.body.userId, req.body.investments);
            }else{
                initialInvestment = await this.userService.resetInvestment(req.body.userId, req.body.investments)
            }

            logInfo('Returning request from calculateInitInvestment()', this.logContext, {initialInvestment: initialInvestment})
            res.status(200).send({initialInvestment: initialInvestment})
        } catch (error) {
            logError('Error from calculateInitInvestment()', this.logContext, error)
        }
    }

    private saveTotalProfit = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let totalProfit = await this.userService.saveTotalProfit(req.body.userId, req.body.totalProfit)
            logInfo('Returning request from saveTotalProfit()', this.logContext, {totalProfit: totalProfit})
            res.status(200).send({totalProfit: totalProfit})
        } catch (error) {
            logError('Error from saveTotalProfit()', this.logContext, error)
        }
    }


    private getUser = (
        req: Request,
        res: Response,
        next: NextFunction
    ): Response | void => {
        if (!req.body.user) {
            return next(new HttpException(404, 'No logged in user'));
        }

        res.status(200).send({ data: req.body.user });
    };

}

export default UserController