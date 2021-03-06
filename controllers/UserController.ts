/**
 * @file Controller RESTful Web service API for users resource
 */
import {Request, Response, Express} from "express";
import UserDAO from "../daos/UserDao"
import UserControllerI from "../interfaces/UserControllerI";
import UserDao from "../daos/UserDao";
import User from "../models/users/User";
import TuitDao from "../daos/TuitDao";
import BookmarkDao from "../daos/BookmarkDao";
import DislikeDao from "../daos/DislikeDao";
import LikeDao from "../daos/LikeDao";
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @class UserController Implements RESTful Web service API for users resource.
 * Defines the following HTTP endpoints:
 * <ul>
 *     <li>GET /api/users to retrieve all the user instances </li>
 *     <li>GET /api/users/:uid to retrieve an individual user instance </li>
 *     <li>POST /api/users to create a new user instance </li>
 *     <li>POST /api/login to retrieve an individual user instance by their credential for
 *     logging in </li>
 *     <li>POST /api/register to create an individual user instance assuring there is
 *     no repeating username </li>
 *     <li>PUT /api/users to modify an individual user instance </li>
 *     <li>DELETE /api/users/:uid to remove a particular user instance </li>
 * </ul>
 * @property {UserDao} userDao Singleton DAO implementing user CRUD operations
 * @property {UserController} userController Singleton controller implementing
 * RESTful Web service API
 */
export default class UserController implements UserControllerI {
    private static userDao: UserDAO = UserDao.getInstance();
    private static userController: UserController | null = null;
    private static tuitDao: TuitDao = TuitDao.getInstance();
    private static bookmarkDao: BookmarkDao = BookmarkDao.getInstance();
    private static dislikeDao: DislikeDao = DislikeDao.getInstance();
    private static likeDao: LikeDao = LikeDao.getInstance();

    /**
     * Creates singleton controller instance
     * @param {Express} app Express instance to declare the RESTful Web service
     * API
     * @returns UserController
     */
    public static getInstance = (app: Express): UserController => {
        if (UserController.userController === null) {
            UserController.userController = new UserController();
            app.get('/api/users', UserController.userController.findAllUsers);
            app.get('/api/users/:uid', UserController.userController.findUserById);
            app.get('/api/admin/:username', UserController.userController.searchByUsername)
            app.post('/api/users', UserController.userController.createUser);
            app.post('/api/admin', UserController.userController.adminCreateUser);
            app.post('/api/login', UserController.userController.login);
            app.post('/api/register', UserController.userController.register)
            app.put('/api/users/:uid', UserController.userController.updateUser);
            app.delete('/api/admin/:uid', UserController.userController.adminDeleteUser);
            app.get('/api/users/username/:username/delete', UserController.userController.deleteUserByUsername);
        }
        return UserController.userController;
    }

    private constructor() {}

    /**
     * Retrieves all users from the database and returns an array of users.
     * @param {Request} req Represents request from client
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the user objects
     */
    findAllUsers = (req: Request, res: Response) =>
        UserController.userDao.findAllUsers()
            .then((users: User[]) => res.json(users));

    /**
     * Retrieves the user by their primary key
     * @param {Request} req Represents request from client, including path
     * parameter uid identifying the primary key of the user to be retrieved
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the user that matches the user ID
     */
    findUserById = (req: Request, res: Response) =>
        UserController.userDao.findUserById(req.params.uid)
            .then((user: User) => res.json(user));

    /**
     * Retrieves user(s) by their username
     * @param {Request} req Represents request from client, including path
     * parameter username identifying the username of the user(s) to be retrieved
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the user(s) that match the username
     */
    searchByUsername = (req: Request, res: Response) =>
        UserController.userDao.searchByUsername(req.params.username)
            .then(users => {
                const sortedUsers = users.sort((a: User, b: User) => a.username > b.username ? 1 : -1)
                res.json(sortedUsers)
            })

    /**
     * Creates a new user instance
     * @param {Request} req Represents request from client, including body
     * containing the JSON object for the new user to be inserted in the
     * database
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new user that was inserted in the
     * database
     */
    createUser = (req: Request, res: Response) => {
        UserController.userDao.createUser(req.body)
            .then((user: User) => res.json(user));
    }

    /**
     * Creates a new user instance
     * @param {Request} req Represents request from client, including body
     * containing the JSON object for the new user to be inserted in the
     * database
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new user that was inserted in the
     * database
     */
    adminCreateUser = async (req: Request, res: Response) => {
        const newUser = req.body;
        const password = newUser.password;
        newUser.password = await bcrypt.hash(password, saltRounds);
        const existingUser = await UserController.userDao
        .findUserByUsername(newUser.username);

        if (existingUser) {
            res.sendStatus(403);
            return
        } else {
            UserController.userDao.createUser(newUser)
                .then((user: User) => res.json(user));
        }
    }

    /**
     * Removes a user instance from the database
     * @param {Request} req Represents request from client, including path
     * parameter uid identifying the primary key of the user to be removed
     * @param {Response} res Represents response to client, including status
     * on whether deleting a user was successful or not
     */
    adminDeleteUser = async (req: Request, res: Response) => {
        const uid = req.params.uid

        // delete all info this user has created
        await UserController.tuitDao.deleteAllTuitsByUser(uid)
        await UserController.bookmarkDao.deleteAllBookmarksByUser(uid)
        await UserController.dislikeDao.deleteAllDislikesByUser(uid)
        await UserController.likeDao.deleteAllLikesByUser(uid)

        UserController.userDao.deleteUser(uid)
            .then(status => res.json(status))
    }

    /**
     * Modifies an existing user instance
     * @param {Request} req Represents request from client, including path
     * parameter uid identifying the primary key of the user to be modified
     * and body containing the JSON object for a user instance containing
     * properties and their new values
     * @param {Response} res Represents response to client, including status
     * on whether updating a user was successful or not
     */
    updateUser = async (req: Request, res: Response) => {
        const userInfo = req.body

        // to check if username is changed
        const existingUser = await UserController.userDao.findUserById(req.params.uid)
        // to check if username is taken
        const checkUser = await UserController.userDao.findUserByUsername(userInfo.username)

        // if username not changed, or not taken
        if (existingUser.username === userInfo.username || !checkUser) {
            // encrypt password if changed
            if (userInfo.password) {
                const password = userInfo.password;
                userInfo.password = await bcrypt.hash(password, saltRounds);
            }

            // update the user
            await UserController.userDao.updateUser(req.params.uid, userInfo).then(status => res.json(status))

            // update session
            const updatedUser = await UserController.userDao.findUserById(req.params.uid)
            updatedUser.password = '*****';
        } else {
            // username is taken so error
            res.sendStatus(403);
        }
    }


    /**
     * Retrieves the user by their credential for logging in
     * @param {Request} req Represents request from client, including body
     * containing the JSON object for a user's credential containing
     * username and password
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the user that matches the credential
     * or the status that there is no user matches the credential (failed to log in)
     */
    login = (req: Request, res: Response) => {
        const credentials = req.body;
        UserController.userDao.findUserByCredentials(credentials.username, credentials.password)
            .then((user: User) => {
                if (user) {
                    res.json(user);
                } else {
                    res.sendStatus(403);
                }
            })
    }

    /**
     * Creates a new user instance assuring there is no repeating username
     * @param {Request} req Represents request from client, including body
     * containing the JSON object for the new user to be inserted in the database
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new user that was inserted in the
     * database or the status that user was not inserted successfully,
     * because of repetitive username in the database
     */
    register = (req: Request, res: Response) => {
        const username = req.body.username
        // not sure where to implement this logic
        // in services?
        // do we need interface for services
        UserController.userDao.findUserByUsername(username)
            .then((user: User) => {
                if (user) {
                    res.sendStatus(403);
                } else {
                    UserController.userDao.createUser(req.body)
                        .then((newUser: User) => res.json(newUser))
                }
            })
    }

    /**
     * Removes the user instance that matches the username
     * @param {Request} req Represents request from client, including path
     * parameter username identifying the username of the user to be removed
     * @param {Response} res Represents response to client, including status
     * on whether deleting a user was successful or not
     */
    deleteUserByUsername = (req: Request, res: Response) =>
       UserController.userDao.deleteUserByUsername(req.params.username)
           .then(status => res.send(status));
}
