import { logInfo, logError } from "@/utils/logger/logger";
import ApiRepository from "../apiRepository/api.repo";
import UserRepository from "../user/user.repository";

class CoinbaseService {

    private apiRepo: ApiRepository;
    private userRepo: UserRepository
    private logContext: string = 'CoinbaseService'
  
    constructor(userRepo: UserRepository) {
      this.userRepo = userRepo
      this.apiRepo = new ApiRepository();
    }

    public async currentPriceTotals(userId: number) {
      try {
        let userInvestments: any[] = await this.userRepo.getTotalShares(userId)
        let currentPrices: any[] = await this.getCurrentPrices(undefined, userInvestments)
        let totalCurrentPrices: number = 0
  
        for (let i = 0; i < userInvestments.length; i++) {
          if (currentPrices[i].tickerSymbol === userInvestments[i].ticker_symbol) {
            totalCurrentPrices += (+currentPrices[i].price * userInvestments[i].sum)
          }
        }
  
        logInfo('currentPriceTotals() - returing totalCurrentPrices', this.logContext, totalCurrentPrices)
        return totalCurrentPrices
      } catch (error) {
        logError('Error in currentPriceTotals()', this.logContext, error);
        throw new Error(error.message);
      }
    }
  
    public async getCurrentPrices(userId?: number, userInvestments?: any[]): Promise<any> {
      try {
        let currentPrices: any[] = [];
  
        if (userInvestments) {
          for (let investment of userInvestments) {
            let response = await this.apiRepo.apiGetRequest(`https://api.coinbase.com/v2/prices/${investment.ticker_symbol}-USD/buy`)
            currentPrices.push(
              {
                tickerSymbol: response.data.base,
                price: response.data.amount
              }
            )
          }
        } else {
          let tickerSymbols = await this.userRepo.getStockSymbols(userId);
  
          for (let symbols of tickerSymbols) {
            let response = await this.apiRepo.apiGetRequest(`https://api.coinbase.com/v2/prices/${symbols.ticker_symbol}-USD/buy`)
            currentPrices.push(
              {
                tickerSymbol: response.data.base,
                price: response.data.amount
              }
            )
          }
        }
        logInfo('getCurrentPrices() - returning currentPrices', this.logContext, currentPrices)
        return currentPrices;
      } catch (error) {
        logError('Error in getCurrentPrices()', this.logContext, error);
        throw new Error(error.message);
      }
    }
}

export default CoinbaseService