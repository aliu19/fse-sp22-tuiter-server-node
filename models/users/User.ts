/**
 * @file Declares User data type representing users.
 */
import MaritalStatus from "./MaritalStatus";
import Location from "./Location";
import Role from "./Role";

/**
 * @typedef User represent user
 * @property {string} username user's username
 * @property {string} password user's password
 * @property {string} firstName user's first name
 * @property {string} lastName user's last name
 * @property {string} email user's email
 * @property {string} profilePhoto user's profile photo
 * @property {string} headerImage user's headerImage
 * @property {AccountType} accountType user's account type where AccountType is an enumeration
 * @property {MaritalStatus} maritalStatus user's marital status where MaritalStatus is an enumeration
 * @property {string} biography user's biography
 * @property {Date} dateOfBirth user's date of birth
 * @property {Date} joined user's joined date
 * @property {Location} location user's location
 */
export default class User {
    username: string = '';
    password: string = '';
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    profilePhoto: string | null = null;
    headerImage: string | null = null;
    maritalStatus: MaritalStatus = MaritalStatus.Single;
    biography: string | null = null;
    dateOfBirth: Date | null = null;
    joined: Date = new Date();
    location: Location | null = null;
    role:  Role = Role.General;
}
