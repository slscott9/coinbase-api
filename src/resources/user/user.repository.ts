import { logError } from "@/utils/logger/logger";
import pgPromise, { IMain } from "pg-promise";


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

}

export default UserRepository