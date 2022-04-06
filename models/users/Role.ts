/**
 * @file Declares Role data type which is
 * an enumeration to represents user's role.
 */

/**
 * @typedef Role represents user's role
 * @property {string} General "GENERAL"
 * @property {string} Admin "ADMIN"
 */
enum Role {
  General = 'GENERAL',
  Admin = 'ADMIN'
}

export default Role;
