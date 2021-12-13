import Controller from "@/utils/interface/controller.interface";
import { Router } from "express";
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

    }

}

export default UserController