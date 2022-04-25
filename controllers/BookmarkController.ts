/**
 * @file Controller RESTful Web service API for bookmarks resource
 */
import {Express, Request, Response} from "express";
import BookmarkControllerI from "../interfaces/BookmarkControllerI";
import BookmarkDao from "../daos/BookmarkDao";
import Bookmark from "../models/bookmarks/Bookmark";
import TuitDao from "../daos/TuitDao";

/**
 * @class BookmarkController Implements RESTful Web service API for bookmarks resource
 * Defines the following HTTP endpoints:
 * <ul>
 *     <li>GET /api/user/:uid/bookmarks to retrieve all tuits bookmarked by a user </li>
 *     <li>GET /api/user/:tid/bookmarks to retrieve all users that bookmarked a tuit </li>
 *     <li>GET /api/bookmarks to retrieve all the bookmark documents for testing purpose </li>
 *     <li>POST /api/users/:uid/bookmarks/:tid to record that a user bookmarks a tuit </li>
 *     <li>DELETE /api/users/:uid/unbookmarks/:tid to record that a user no longer
 *     bookmarks a tuit </li>
 * </ul>
 * @property {BookmarkDao} bookmarkDao Singleton DAO implementing like CRUD operations
 * @property {BookmarkController} bookmarkController Singleton controller implementing
 * RESTful Web service API
 */
export default class BookmarkController implements BookmarkControllerI {
    private static bookmarkDao: BookmarkDao = BookmarkDao.getInstance();
    private static bookmarkController: BookmarkController | null = null;
    private static tuitDao: TuitDao = TuitDao.getInstance();

    /**
     * Creates singleton controller instance
     * @param {Express} app Express instance to declare the RESTful Web service API
     * @returns BookmarkController
     */
    public static getInstance = (app: Express): BookmarkController => {
        if (BookmarkController.bookmarkController === null) {
            BookmarkController.bookmarkController = new BookmarkController();
            app.get('/api/users/:uid/bookmarks', BookmarkController.bookmarkController.findAllTuitsBookmarkedByUser);
            app.get('/api/tuits/:tid/bookmarks', BookmarkController.bookmarkController.findAllUsersThatBookmarkedTuit);
            app.get('/api/bookmarks', BookmarkController.bookmarkController.findAllBookmark);
            app.put('/api/users/:uid/bookmarks/:tid', BookmarkController.bookmarkController.userTogglesTuitBookmarks);
        }
        return BookmarkController.bookmarkController;
    }

    /**
     * Retrieves all tuits that bookmarked by a user from the database
     * @param {Request} req Represents request from client, including the path
     * parameter uid representing the user liked the tuit
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the tuit objects that were bookmarked
     */
    findAllTuitsBookmarkedByUser = (req: Request, res: Response) =>
        BookmarkController.bookmarkDao.findAllTuitsBookmarkedByUser(req.params.uid)
            .then((bookmarks: Bookmark[]) => res.json(bookmarks));

    /**
     * Retrieves all users that bookmarked a tuit from the database
     * @param {Request} req Represents request from client, including path
     * parameter tid representing the bookmarked tuit
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the user objects
     */
    findAllUsersThatBookmarkedTuit = (req: Request, res: Response) =>
        BookmarkController.bookmarkDao.findAllUsersThatBookmarkedTuit(req.params.tid)
            .then((bookmarks: Bookmark[]) => res.json(bookmarks));

    /**
     * Creates a new bookmark instance to record that a user bookmarks a tuit or
     * removes a bookmark instane to record that user no longer bookmarks the tuit
     * @param {Request} req Represents request from client, including path
     * parameter uid and tid representing the user that is un/bookmarking the tuit
     * and the tuit being un/bookmarked
     * @param {Response} res Represents response from client, including status
     * on whether tuit is successfully bookmarked or bookmark is removed if tuit
     * is already bookmarked before.
     */
    userTogglesTuitBookmarks = async (req: Request, res: Response) => {
        const bookmarkDao = BookmarkController.bookmarkDao;
        const tuitDao = BookmarkController.tuitDao;

        const uid = req.params.uid;
        const tid = req.params.tid;

        // @ts-ignore
        const profile = req.session['profile'];
        const userId = uid === 'me' && profile ? profile._id : uid;

        try {
            const userAlreadyBookmarkedTuit = await bookmarkDao.findUserBookmarksTuit(userId, tid);

            if (userAlreadyBookmarkedTuit) {
                await bookmarkDao.userUnbookmarksTuit(userId, tid);
            } else {
                await bookmarkDao.userBookmarksTuit(userId,tid);
            }

            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(404);
        }
    }

    /**
     * Retrieves all bookmarks from the database and returns an array of bookmarks (including
     * all tuits being bookmarked and users bookmarking the tuit)
     * @param {Request} req Represents request from client
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the bookmark objects (including all
     * tuits being bookmarked and users bookmarking the tuit)
     */
    findAllBookmark = (req: Request, res: Response) =>
        BookmarkController.bookmarkDao.findAllBookmark()
            .then((bookmarks: Bookmark[]) => res.json(bookmarks));
}
