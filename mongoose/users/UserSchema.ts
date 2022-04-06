/**
 * @file Implements mongoose schema for users
 */
import mongoose from "mongoose";
import AccountType from "../../models/users/AccountType";
import MaritalStatus from "../../models/users/MaritalStatus";
import LocationSchema from "./LocationSchema";
import User from "../../models/users/User";
import Role from "../../models/users/Role";

/**
 * @typedef UserSchema Represent users
 * @property {string} username User's username
 * @property {string} password User's password
 * @property {string} firstName User's first name
 * @property {string} lastName User's last name
 * @property {string} email User's email
 * @property {string} profilePhoto User's profile photo
 * @property {string} headerImage User's headerImage
 * @property {string} accountType User's account type where AccountType is an enumeration
 * @property {string} maritalStatus User's marital status where MaritalStatus is an enumeration
 * @property {string} biography User's biography
 * @property {Date} dateOfBirth User's date of birth
 * @property {Date} joined User's joined date
 * @property {LocationSchema} location User's location
 */
const UserSchema = new mongoose.Schema<User>({
    username: {type: String, required: true},
    password: {type: String, required: true},
    firstName: String,
    lastName: String,
    email: {type: String, required: true},
    profilePhoto: String,
    headerImage: String,
    maritalStatus: {type: String, default: MaritalStatus.Single, enum: MaritalStatus},
    biography: String,
    dateOfBirth: Date,
    joined: {type: Date, default: Date.now},
    location: LocationSchema,
    role: {type: String, default: Role.General, enum: Role}
}, {collection: 'users'});

export default UserSchema;
