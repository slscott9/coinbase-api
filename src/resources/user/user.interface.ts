

export interface User {
    userId: number,
    firstName: string,
    lastName: string,
    userName: string,
    email: string,
    selectedCurrency: string,
    initialInvestment: number,
    totalProfit: number,
    password: string
}

export interface Investment {
    initialPPS: number,
    totalShares: number,
    tickerSymbol: string,
    userId: number,
    totalSharePrices: number,
    totalInvestment: number
}

export interface UserStockResponse {
    stocks: Investment[],
    initialInvestment: number
}


