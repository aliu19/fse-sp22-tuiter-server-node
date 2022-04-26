/**
 * @file Declares Controller RESTful Web service API for bookmarks resource
 */
import {Request, Response} from "express";

export default interface BookmarkControllerI {
    findAllTuitsBookmarkedByUser(req: Request, res: Response): void;
    findAllUsersThatBookmarkedTuit(req: Request, res: Response): void;
    findAllBookmark(req: Request, res: Response): void;
    userTogglesTuitBookmarks(req: Request, res: Response): void;
}
