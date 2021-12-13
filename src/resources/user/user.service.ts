import UserRepository from "./user.repository"


class UserService {

    public userRepo: UserRepository
    public logContext: string = 'UserService'

    constructor(
        userRepo: UserRepository
    ){
        this.userRepo = userRepo
    }

}

export default UserService