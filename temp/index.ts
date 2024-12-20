import { Request, Response } from 'express';

class UserService {
  public getAllUsers() {
    return [{ id: 1, name: 'John Doe' }];
  }

  public createUser(newUser: any) {
    return { id: 2, ...newUser };
  }

  public getUserById(id: string) {
    return { id, name: 'Jane Doe' };
  }
}



class UserController {
  private userService: UserService;

  // Injecting UserService via constructor
  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Method to handle GET /users
  public getAllUsers(req: Request, res: Response): void {
    const users = this.userService.getAllUsers();
    res.json(users);
  }

  // Method to handle POST /users
  public createUser(req: Request, res: Response): void {
    const newUser = req.body;
    const createdUser = this.userService.createUser(newUser);
    res.status(201).json(createdUser);
  }

  // Method to handle GET /users/:id
  public getUserById(req: Request, res: Response): void {
    const userId = req.params.id;
    const user = this.userService.getUserById(userId);
    res.json(user);
  }
}


const userService = new UserService();
const userController = new UserController(userService);



export default UserController;
