import Controller from "@/utils/interface/controller.interface";
import { Router } from "express";
import UserRepository from "../user/user.repository";
import CoinbaseService from "./coinbase.service";


class CoinbaseController implements Controller {

    public path = '/prices';
    public router = Router();
    public service: CoinbaseService
    private logContext: string = 'CoinbaseController'

    //SHOULD INIT DATABASE CLASS AND PASS IT TO THE SERVICE

    constructor(
        userRepo: UserRepository
    ){
        this.initRoutes();
        this.service = new CoinbaseService(userRepo);
    }


    private initRoutes() {
        
    }

}

export default CoinbaseController