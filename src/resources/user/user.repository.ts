import { logError, logInfo } from "@/utils/logger/logger";
import pgPromise, { IMain } from "pg-promise";
import { Investment } from "./user.interface";


class UserRepository {
    pgp: IMain
    db: any;
    PQ: any;
    logContext: string = 'UserRepository'

    constructor() {
        this.pgp = pgPromise();
    }

    async initialize() {
        try {
            this.db = this.pgp({
                host: process.env.DB_HOST,
                port: 5432,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD

            });
        } catch (error) {
            logError('There was an error connecting to database', this.logContext, error)
            throw error;
        }
    }

    async createUser(
        requestBody: any
    ): Promise<any> {
        try {
            let userInsert = `insert into coinbase.user(first_name, last_name, user_name, email, selected_currency, password)
                         values(($1), ($2), ($3), ($4), ($5), ($6))
                         returning 
                         user_id as "userId",
                         first_name as "firstName",
                         last_name as "lastName",
                         user_name as "userName",
                         email as "email",
                         selected_currency as "selectedCurrency",
                         password as "password"`

            let queryResult = await this.db.any(
                userInsert,
                [
                    requestBody.firstName,
                    requestBody.lastName,
                    requestBody.userName,
                    requestBody.email,
                    requestBody.selectedCurrency,
                    requestBody.password
                ]
            );
            logInfo('queryResult[0] from createUser()', this.logContext, queryResult[0])
            return queryResult[0]
        } catch (error) {
            logError('There was an error in createUser()', this.logContext, error)

        }
    }

    async getUser(
        email: string
    ): Promise<any | undefined> {
        try {
            let userInsert = `select jsonb_agg(
                                jsonb_build_object(
                                    'userId', user_id,
                                    'firstName', first_name,
                                    'lastName', last_name,
                                    'userName', user_name,
                                    'email', email,
                                    'selectedCurrency', selected_currency,
                                    'initialInvestment', init_investment,
                                    'totalProfit', total_profit,
                                    'password', password
                                )  
                            ) as "user"
                            from coinbase.user u
                            where u.email = $1`

            let queryResult = await this.db.any(userInsert, email);
            return queryResult[0].user[0]

        } catch (error) {
            logError('There was an error in loginUser()', this.logContext, error)

        }
    }

    async getUserById(
        userId: number
    ): Promise<any | undefined> {
        try {
            let userInsert = `select jsonb_agg(
                                jsonb_build_object(
                                    'userId', user_id,
                                    'firstName', first_name,
                                    'lastName', last_name,
                                    'userName', user_name,
                                    'email', email,
                                    'selectedCurrency', selected_currency,
                                    'initialInvestment', init_investment,
                                    'totalProfit', total_profit,
                                    'password', password
                                )  
                            ) as "user"
                            from coinbase.user u
                            where u.user_id = $1`

            let queryResult = await this.db.any(userInsert, userId);
            logInfo('returning user from getUserId', this.logContext, queryResult[0].user[0])
            return queryResult[0].user[0]

        } catch (error) {
            logError('There was an error in loginUser()', this.logContext, error)

        }
    }

    async updateInitInvestments(
        userId: number,
        investments: Investment[],
        totalInvestment: number
    ): Promise<any> {
        try {
            let queryResult1 = await this.db.tx('update-user-investments', async t => {
                let queryResult2 = await t.any(
                    `select init_investment from coinbase.user 
                     where user_id = $1`,
                    userId
                )

                const queries = investments.map((investment: any) => {
                    return t.one(
                        `insert into coinbase.user_initial_inv_info(initial_pps, total_shares, ticker_symbol, user_id, total_investment)
                         values(($1), ($2), ($3), ($4), ($5))
                         returning 
                         initial_pps as "initialPPS",
                         total_shares as "totalShares",
                         ticker_symbol as "tickerSymbol",
                         user_id as "userId",
                         total_investment as "totalInvestment"`,
                        [
                            investment.initialPPS,
                            investment.totalShares,
                            investment.tickerSymbol,
                            investment.userId,
                            investment.totalInvestment
                        ],
                        (a: any) => a.id
                    )
                });

                await t.batch(queries);

                return await t.any(
                    `update coinbase.user u
                    set init_investment = ($1)
                    where user_id = ($2)
                    returning init_investment as "initialInvestment"`,
                    [queryResult2[0].init_investment + totalInvestment, userId]
                )
            });

            logInfo('queryResult1[0] from updateInitInvestment()', this.logContext, queryResult1[0])
            return queryResult1[0].initialInvestment
        } catch (error) {
            logError('There was an error in updateInitInvestment()', this.logContext, error)
        }
    }

    async resetInitInvestments(
        userId: number,
        investments: Investment[],
        totalInvestment: number
    ): Promise<any> {
        try {
            let queryResult = await this.db.tx('reset-user-investments', async t => {
                await t.any(
                    `delete from coinbase.user_initial_inv_info
                     where user_id = $1`,
                    userId
                )

                const queries = investments.map((investment: any) => {
                    return t.one(
                        `insert into coinbase.user_initial_inv_info(initial_pps, total_shares, ticker_symbol, user_id, total_investment)
                         values(($1), ($2), ($3), ($4), ($5))
                         returning initial_pps as "initialPPS",
                         total_shares as "totalShares",
                         ticker_symbol as "tickerSymbol",
                         user_id as "userId",
                         total_investment as "totalInvestment"`,
                        [
                            investment.initialPPS,
                            investment.totalShares,
                            investment.tickerSymbol,
                            investment.userId,
                            investment.totalInvestment
                        ],
                        (a: any) => a.id
                    )
                });

                await t.batch(queries);

                return await t.any(
                    `update coinbase.user u
                    set init_investment = ($1)
                    where user_id = ($2)
                    returning init_investment as "initialInvestment"`,
                    [totalInvestment, userId]
                )
            });

            logInfo('queryResult[0] from resetInitInvestment()', this.logContext, queryResult[0])
            return queryResult[0].initialInvestment
        } catch (error) {
            logError('There was an error in resetInitInvestment()', this.logContext, error)
        }
    }

    async getAllInvestments(
        userId: number
    ): Promise<any> {
        try {
            let query =
                `select jsonb_agg(
                jsonb_build_object(
                    'userId', user_id,
                    'initialPPS', initial_pps,
                    'totalShares', total_shares,
                    'tickerSymbol', ticker_symbol,
                    'totalInvestment', total_investment
                )
            ) as "investments"
            from coinbase.user_initial_inv_info uiii where user_id = ($1)`

            let queryResult = await this.db.any(query, [userId])
            logInfo('queryResult[0] from getAllInvestments()', this.logContext, queryResult[0])
            return queryResult[0];
        } catch (error) {
            logError('There was an error in getAllInvestments()', this.logContext, error)
        }
    }

    async getInitInvestment(
        userId: number
    ): Promise<any | undefined> {
        try {
            let query = `select init_investment from coinbase.user u
                                where u.user_id = ($1)`

            let queryResult = await this.db.any(query, [userId]);
            logInfo('queryResult[0] from getInitInvestment()', this.logContext, queryResult[0])
            return queryResult[0].init_investment
        } catch (error) {
            logError('There was an error in getInitInvestment()', this.logContext, error)
        }
    }

    async getTotalShares(
        userId: number
    ): Promise<any | undefined> {
        try {
            let query = `select ticker_symbol , sum(total_shares) from coinbase.user_initial_inv_info uiii 
                        where user_id = $1
                        group by ticker_symbol`

            let queryResult = await this.db.any(query, userId);
            logInfo('queryResult from getTotalShares()', this.logContext, queryResult)
            return queryResult
        } catch (error) {
            logError('There was an error in getTotalShares()', this.logContext, error)
        }
    }

    async saveProfit(userId: number, totalProfit: number): Promise<any> {
        try {
            let query = `update coinbase.user
                         set total_profit = ($1)
                         where user_id = ($2)
                         returning total_profit as "totalProfit"`
            
            let queryResult = await this.db.any(query, [totalProfit, userId])
            logInfo('queryResult[0] from saveProfit()', this.logContext, queryResult[0])
            return queryResult[0].totalProfit
        } catch (error) {
            
        }
    }

    async getStockSymbols(userId: number): Promise<any> {
        try {
            let query = `select ticker_symbol from coinbase.user_initial_inv_info
                         where user_id = $1
                         group by ticker_symbol`
            
            let queryResult = await this.db.any(query, userId);
            return queryResult
        } catch (error) {
            logError('Error from getStockSymbol()', this.logContext, error)
        }
    }

    //if returning more than 1 row use queryResult else use queryResult[0]
    // async getStockSymbols(): Promise<any> {
    //     try {
                // let query = ``
                // let queryResult = await this.db
                //return queryResult
            
    //     } catch (error) {
                //logError('Error from getStockSymbol()', this.logContext, error)
            
    //     }
    // }

}

export default UserRepository