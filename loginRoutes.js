// loginRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const cors = require('cors');

// Enable CORS for all routes
router.use(cors());

// Create a MySQL connection pool
const pool = require('./index');

// Route to handle login
router.post('/login', async (req, res, next) => {
    const { user, password } = req.body; // Update to 'user' for consistency

    // console.log('Login request received:', req.body);

    if (!pool) {
        console.error('Error: MySQL connection pool is not defined');
        return res.status(500).json({ message: 'Internal server error' });
    }

    pool.query('SELECT * FROM user_details WHERE USERNAME = ? AND IS_ACTIVE = 1', [user], (queryErr, user) => {
        if (queryErr) {
            console.error('Error executing MySQL query:', queryErr);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!user.length) {
            // console.log('Invalid username or password');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        bcrypt.compare(password, user[0].PASSWORD, (compareErr, passwordMatch) => {
            if (compareErr) {
                console.error('Error comparing passwords:', compareErr);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!passwordMatch) {
                // console.log('Invalid username or password');
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            return res.status(200).json({ message: 'Login successful' , user: {
                    USER_ID: user[0].USER_ID,
                    NAME: user[0].NAME,
                    EMAIL: user[0].EMAIL,
                    ROLE: user[0].ROLE,
                    PHOTO: user[0].PHOTO,
                }, });
        });
    });
});

router.post('/addUser', async (req, res) => {
    // console.log('Add user request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(req.body.PASSWORD, 10);

        // Create an object with hashed password and other user details
        const userObject = {
            ...req.body,
            PASSWORD: hashedPassword,
        };

        // Insert the new user data into the database
        const insertResult = await pool.query('INSERT INTO user_details SET ?', userObject);

        if (insertResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'User added successfully' });
        } else {
            console.error('Error: Failed to add user:', insertResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/checkEmailUsername', async (req, res) => {
    const { EMAIL, USERNAME } = req.body;

    // console.log('Check email and username request received:', req.body);

    if (!pool) {
        console.error('Error: MySQL connection pool is not defined');
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    try {
        // Check if the email is already in use
        const emailResult = await pool.query('SELECT COUNT(*) as count FROM user_details WHERE EMAIL = ? AND IS_ACTIVE=1', [EMAIL]);

        // Check if the username is already in use
        const usernameResult = await pool.query('SELECT COUNT(*) as count FROM user_details WHERE USERNAME = ? AND IS_ACTIVE=1', [USERNAME]);

        if (emailResult[0].count > 0 || usernameResult[0].count > 0) {
            // Email or username is already in use
            return res.status(200).json({ used: true });
        } else {
            // Email and username are not in use
            return res.status(200).json({ used: false });
        }
    } catch (error) {
        console.error('Error checking email and username:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/checkPassword', async (req, res) => {
    const { USER_ID, PASSWORD } = req.body;

    // console.log('Check password request received:', req.body);

    if (!pool) {
        console.error('Error: MySQL connection pool is not defined');
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    try {
        // Check if the password is correct
        const passwordResult = await pool.query('SELECT PASSWORD FROM user_details WHERE USER_ID = ? AND IS_ACTIVE=1', [USER_ID]);

        bcrypt.compare(PASSWORD, passwordResult[0].PASSWORD, (compareErr, passwordMatch) => {
            if (compareErr) {
                console.error('Error comparing passwords:', compareErr);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!passwordMatch) {
                // console.log('Invalid password');
                return res.status(200).json({ match: false });
            }

            return res.status(200).json({ match: true });
        });
    } catch (error) {
        console.error('Error checking password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/updateProfile', async (req, res) => {
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(req.body.PASSWORD, 10);

        // Create an object with hashed password and other user details
        const userObject = {
            ...req.body,
            PASSWORD: hashedPassword,
        };

        // Insert the new user data into the database
        const updateResult = await pool.query('UPDATE user_details SET ? WHERE USER_ID = ?', [userObject, req.body.USER_ID]);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'User updated successfully' });
        } else {
            console.error('Error: Failed to add user:', updateResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




module.exports = router;
