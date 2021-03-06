"use strict"

const db = require("../db");
const bcrypt = require("bcrypt");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR  } = require("../config.js");

/** Functions for users. */

class User {
/** authenticate user with username, password.
*
* Returns { username, bandName, email, isAdmin }
*
* Throws UnauthorizedError is user not found or wrong password.
**/

  static async authenticate(username, password) {
      // try to find the user first
      const result = await db.query(
          `SELECT username,
                password,
                band_name as "bandName",
                email,
                is_admin AS "isAdmin"
         FROM users
         WHERE username = $1`,
          [username],
      );
      const user = result.rows[0];
      if (user) {
          // compare hashed password to a new hash from password
          const isValid = await bcrypt.compare(password, user.password);
          if (isValid === true) {
              delete user.password;
              return user;
          }
      }
      throw new UnauthorizedError("Invalid username/password");
  }

    /** Register user with data.
     *
     * Returns { username, email, isAdmin, bandName }
     *
     * Throws BadRequestError on duplicates.
     **/

  static async register(
      { username, password, email, isAdmin, bandName }) {
      const duplicateCheck = await db.query(
          `SELECT username
         FROM users
         WHERE username = $1`,
          [username],
      );  
      if (duplicateCheck.rows[0]) {
          throw new BadRequestError(`Sorry, that username is already taken.`);
      }  
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);  
      const result = await db.query(
          `INSERT INTO users
         (username,
          password,
          email,
          is_admin,
          band_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING username, email, is_admin AS "isAdmin", band_name AS "bandName"`,
          [
              username,
              hashedPassword,
              email,
              isAdmin,
              bandName
          ],
      );  
      const user = result.rows[0];  
      
      return user;
  }

    /** Given a username, return data about user.
     *
     * Returns { username, band_name, is_admin}
     *
     * Throws NotFoundError if user not found.
     **/

    static async get(username) {
        const userRes = await db.query(
            `SELECT username,
                  band_name AS "bandName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
            [username],
        );

        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        return user;
    }

    /** Given the username return all songs the user has in their data */
    static async getAllSongs(username){
        const validUser = await db.query(`
        SELECT username 
        FROM users 
        WHERE username = $1`, [username]);

        const user = validUser.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        const songRes = await db.query(
            `SELECT title FROM distrokid WHERE username = $1
            UNION
            SELECT title FROM bandcamp_all_time WHERE username = $1
            UNION
            SELECT title FROM bandcamp_running WHERE username = $1
            UNION
            SELECT title FROM spotify_all_time WHERE username = $1
            UNION
            SELECT title FROM spotify_running WHERE username = $1`, [username]
        );

        if(!songRes.rows.length) return [];

        return Object.values(songRes.rows).map(d => d);
    }
}

module.exports = User;