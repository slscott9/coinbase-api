import App from "app";
import CoinbaseController from "./resources/coinbase/coinbase.controller";
import UserController from "./resources/user/user.controller";
import UserRepository from "./resources/user/user.repository";
import validateEnv from "./utils/validateEnv";

 

 validateEnv();

 const userRepo: UserRepository = new UserRepository();
 userRepo.initialize();
 const app = new App(
     [ new CoinbaseController(userRepo), new UserController(userRepo)],
     Number(process.env.PORT)
 );
 
 app.listen();