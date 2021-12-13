import { logInfo, logError } from "@/utils/logger/logger";
import token from "@/utils/token";
import { User, Investment } from "./user.interface";
import UserRepository from "./user.repository"


class UserService {

    public userRepo: UserRepository
    public logContext: string = 'UserService'

    constructor(
        userRepo: UserRepository
    ){
        this.userRepo = userRepo
    }

    public async register(requestBody: any): Promise<any> {
        try {
            let user: User  = await this.userRepo.createUser(requestBody);

            const accessToken = token.createToken(user);

            let userResponse = {
                user: user,
                token:accessToken
            }

            logInfo('register() - returning userResponse', this.logContext, userResponse)
            return userResponse;
        } catch (error) {
            logError('Error from createUser()', this.logContext, error)
            throw new Error('Error registering user.')
        }
    }

    public async loginUser(email: string, password: string ): Promise<any> {
        try {
            const user: User = await this.userRepo.getUser(email);

            if(!user){
                throw new Error('Unable to find user')
            }

            if(password == user.password){
                let loginResponse = {
                    token: token.createToken(user),
                    user: user
                }
                return loginResponse
            }else{
                throw new Error('Wrong login info')
            }

        } catch (error) {
            logError('Error from loginUser()', this.logContext, error)
            throw new Error('Unable to login user')
        }
    }

    public async getUserInitInvestment(userId: number): Promise<number> {
        try {
            let initialInvestment = await this.userRepo.getInitInvestment(userId);
            logInfo('getUserInitInvestment() - returning initialInvestment', this.logContext, initialInvestment);
            return initialInvestment;
        } catch (error) {
            logError('Error from getUserInitInvestment()', this.logContext, error)
            throw new Error(error.message);
        }
    }

    public async updateInitInvestment(userId: number, investments: any): Promise<number> {
        try {
            let totalInvestment: number = await this.calculateTotalInvestment(investments)
            let initialInvestment = await this.userRepo.updateInitInvestments(userId, investments, totalInvestment);
            logInfo('updateInitInvestment() - returning initialInvestment', this.logContext, initialInvestment);
            return initialInvestment
        } catch (error) {
            logError('Error from updateInitInvestment', this.logContext, error)
            throw new Error(error.message);
        }
    }

    public async resetInitInvestment(userId: number, investments: any): Promise<number> {
        try {
            let totalInvestment: number = await this.calculateTotalInvestment(investments)
            let initialInvestment = await this.userRepo.resetInitInvestments(userId, investments, totalInvestment);
            logInfo('resetInitInvestment() - returning initialInvestment', this.logContext, initialInvestment);
            return initialInvestment
        } catch (error) {
            logError('Error from resetInvestment()', this.logContext, error)
            throw new Error(error.message);
        }
    }

    public async calculateTotalInvestment(investments: Investment[]): Promise<any> {

        let totalInvestment: number = 0
        if(investments && investments.length !== 0){
            for(let investment of investments){
                totalInvestment += investment.totalInvestment
            }
        }
        logInfo('calculateTotalInvestment() - returing totalInvestment', this.logContext, totalInvestment)
        return totalInvestment;
    }

    public async getAllInvestments(userId: number): Promise<Investment[]> {
        try {
            let investments: Investment[] = await this.userRepo.getAllInvestments(userId);
            logInfo('getAllInvestments() - returning investments', this.logContext, investments)
            return investments
        } catch (error) {
            logError('Error from getAllInvestments()', this.logContext, error);
            throw new Error(error.message);
        }
    }

    public async saveTotalProfit(userId: number, totalProfit: number): Promise<number> {
        try {
            let totalProfitResult: number = await this.userRepo.saveProfit(userId, totalProfit);
            logInfo('saveTotalProfit() - returning totalProfitResult', this.logContext, totalProfitResult);
            return totalProfitResult
        } catch (error) {
            logError('Error from saveTotalProfit()', this.logContext, error);
            throw new Error(error.message);
        }
    }

}

export default UserService