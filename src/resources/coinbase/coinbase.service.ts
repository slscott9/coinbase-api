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

}

export default CoinbaseService