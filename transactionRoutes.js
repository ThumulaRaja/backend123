const express = require('express');
const router = express.Router();
const cors = require('cors');

const pool = require('./index'); // Assuming you have a proper MySQL connection pool module

router.use(cors());

const util = require('util');

// Promisify the pool.query method
pool.query = util.promisify(pool.query);

// Now you can use pool.query with async/await
router.post('/getAllCashTransactions', async (req, res) => {
    //console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.IS_ACTIVE = 1 AND t.METHOD = "Cash"');


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {

            for(let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getAllBuyingTransactions', async (req, res) => {
    //console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.IS_ACTIVE = 1 AND t.TYPE = "Buying"');


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {

            for(let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ?', [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));
            console.log('data:', data);

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getAllSellingTransactions', async (req, res) => {
    //console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.IS_ACTIVE = 1 AND t.TYPE = "Selling"');


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {

            for(let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ?', [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));
            console.log('data:', data);

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getAllTransactionsCashBook', async (req, res) => {
    //console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.IS_ACTIVE = 1');


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {

            for(let i = 0; i < queryResult.length; i++) {
                // queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                // queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ?', [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            expencesArrayToBeAdded = [];

            const expensesQuery = 'SELECT e.* , i.CODE as ITEM_CODE,i.ITEM_ID_AI FROM expenses e JOIN items i ON e.REFERENCE = i.ITEM_ID_AI WHERE e.IS_ACTIVE = 1';
            const expenses = await pool.query(expensesQuery);

            for(let i = 0; i < expenses.length; i++) {
                const expense = expenses[i];
                const expenseObj = {
                    EXPENSES_ID: expense.EXPENSES_ID,
                    DATE: expense.CREATED_DATE,
                    CODE: expense.CODE,
                    METHOD: expense.METHOD,
                    PAYMENT_AMOUNT: expense.AMOUNT,
                    TYPE: 'Expenses',
                    ITEM_ID_AI: expense.REFERENCE,
                    ITEM_CODE: expense.ITEM_CODE,
                };
                expencesArrayToBeAdded.push(expenseObj);
            }



            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));
            data.push(...expencesArrayToBeAdded);
            console.log('data:', data);

            // Sort the data array newest first
            data.sort((a, b) => new Date(b.DATE) - new Date(a.DATE));


            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/filterByShareholderCashBook', async (req, res) => {
    //console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE i.SHARE_HOLDERS LIKE ? AND t.IS_ACTIVE = 1', [req.body.shareholder]);


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {

            for(let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ?', [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            expencesArrayToBeAdded = [];

            const expensesQuery = 'SELECT e.* , i.CODE as ITEM_CODE,i.ITEM_ID_AI FROM expenses e JOIN items i ON e.REFERENCE = i.ITEM_ID_AI WHERE i.SHARE_HOLDERS LIKE ? AND e.IS_ACTIVE = 1';
            const expenses = await pool.query(expensesQuery, [req.body.shareholder]);

            for(let i = 0; i < expenses.length; i++) {
                const expense = expenses[i];
                const expenseObj = {
                    EXPENSES_ID: expense.EXPENSES_ID,
                    DATE: expense.CREATED_DATE,
                    CODE: expense.CODE,
                    METHOD: expense.METHOD,
                    AMOUNT: expense.AMOUNT,
                    TYPE: 'Expenses',
                    ITEM_ID_AI: expense.REFERENCE,
                    ITEM_CODE: expense.ITEM_CODE,
                };
                expencesArrayToBeAdded.push(expenseObj);
            }



            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));
            data.push(...expencesArrayToBeAdded);
            // console.log('data:', data);

            // Sort the data array newest first
            data.sort((a, b) => new Date(b.DATE) - new Date(a.DATE));


            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/filterByShareholderBuying', async (req, res) => {
    // console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { shareholder } = req.body;

        // Query to fetch all active transactions
        const queryResult = await pool.query(`
            SELECT t.*, i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME, c.CUSTOMER_ID
            FROM transactions t
            JOIN items i ON t.REFERENCE = i.ITEM_ID_AI
            LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID
            WHERE t.IS_ACTIVE = 1 AND t.TYPE = "Buying" AND i.SHARE_HOLDERS LIKE ? 
        `, [shareholder]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            for (let i = 0; i < queryResult.length; i++) {
                const refCodeQuery = 'SELECT CODE as REF_CODE, AMOUNT as REF_AMOUNT, PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?';
                queryResult[i].REF_CODE = await pool.query(refCodeQuery, [queryResult[i].REFERENCE_TRANSACTION]);

                const paymentsQuery = 'SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ?';
                queryResult[i].PAYMENTS = await pool.query(paymentsQuery, [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));
            console.log('data:', data);

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/filterByShareholderSelling', async (req, res) => {
    // console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { shareholder } = req.body;

        // Query to fetch all active transactions
        const queryResult = await pool.query(`
            SELECT t.*, i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME, c.CUSTOMER_ID
            FROM transactions t
            JOIN items i ON t.REFERENCE = i.ITEM_ID_AI
            LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID
            WHERE t.IS_ACTIVE = 1 AND t.TYPE = "Selling" AND i.SHARE_HOLDERS LIKE ? 
        `, [shareholder]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            for (let i = 0; i < queryResult.length; i++) {
                const refCodeQuery = 'SELECT CODE as REF_CODE, AMOUNT as REF_AMOUNT, PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?';
                queryResult[i].REF_CODE = await pool.query(refCodeQuery, [queryResult[i].REFERENCE_TRANSACTION]);

                const paymentsQuery = 'SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ?';
                queryResult[i].PAYMENTS = await pool.query(paymentsQuery, [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));
            console.log('data:', data);

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/getTodayTransactionData', async (req, res) => {
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions with today's date
        const queryResult = await pool.query(`
            SELECT t.CODE, t.PAYMENT_AMOUNT,t.TYPE, i.CODE AS ITEM_CODE, c.NAME AS C_NAME
            FROM transactions t
            JOIN items i ON t.REFERENCE = i.ITEM_ID_AI
            LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID
            WHERE t.IS_ACTIVE = 1 AND DATE(t.DATE) = CURDATE()
        `);

        if (queryResult.length !== 0) {
            return res.status(200).json({ success: true, result: queryResult });
        } else {
            return res.status(404).json({ success: false, message: 'No transactions found for today' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



router.post('/getAllBankTransactions', async (req, res) => {
    //console.log('Get all Bank Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.IS_ACTIVE = 1 AND t.METHOD = "Bank"');


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {

            for(let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getAllTransactions', async (req, res) => {
    console.log('Get all Cash Transaction request received:req.body:', req.body);
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        const { id } = req.body;

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.IS_ACTIVE = 1 AND t.REFERENCE = ? AND (t.TYPE="Buying" OR t.TYPE="Selling")', [id]);


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            //console.log('queryResult:', queryResult);

            for(let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/searchCash', async (req, res) => {
    //console.log('Search Cash request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId, startDate, endDate } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`t.CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`t.STATUS = '${status}'`);
        }
        if (startDate && endDate) {
            whereClause.push(`t.DATE BETWEEN '${startDate}' AND '${endDate}'`);
        }

        // Query to search for transactions based on the search criteria
        const queryString = `
            SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID
            FROM transactions t
            JOIN items i ON t.REFERENCE = i.ITEM_ID_AI
            JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID
            WHERE t.IS_ACTIVE = 1 AND t.METHOD = "Cash" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}
        `;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            for (let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE, AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data, message: 'Transactions found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/searchBuying', async (req, res) => {
    //console.log('Search Cash request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId, startDate, endDate } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`t.CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`t.METHOD = '${status}'`);
        }
        if (startDate && endDate) {
            whereClause.push(`t.DATE BETWEEN '${startDate}' AND '${endDate}'`);
        }

        // Query to search for transactions based on the search criteria
        const queryString = `
            SELECT t.*, i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME, c.PHONE_NUMBER, c.COMPANY, c.CUSTOMER_ID
            FROM transactions t
            JOIN items i ON t.REFERENCE = i.ITEM_ID_AI
            JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID
            WHERE t.IS_ACTIVE = 1 AND t.TYPE = "Buying" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}
        `;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            for (let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE, AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data, message: 'Transactions found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/searchSelling', async (req, res) => {
    //console.log('Search Cash request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId, startDate, endDate } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`t.CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`t.METHOD = '${status}'`);
        }
        if (startDate && endDate) {
            whereClause.push(`t.DATE BETWEEN '${startDate}' AND '${endDate}'`);
        }

        // Query to search for transactions based on the search criteria
        const queryString = `
            SELECT t.*, i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME, c.PHONE_NUMBER, c.COMPANY, c.CUSTOMER_ID
            FROM transactions t
            JOIN items i ON t.REFERENCE = i.ITEM_ID_AI
            JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID
            WHERE t.IS_ACTIVE = 1 AND t.TYPE = "Selling" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}
        `;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            for (let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE, AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);

                if (queryResult[i].DUE_AMOUNT > 0 && queryResult[i].PAYMENT_ETA_END !== null && queryResult[i].PAYMENT_ETA_END < new Date()) {
                    queryResult[i].DUE = true;
                    queryResult[i].NO_OF_LATE_DAYS = Math.floor((new Date() - queryResult[i].PAYMENT_ETA_END) / (1000 * 60 * 60 * 24));
                }
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data, message: 'Transactions found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/searchBank', async (req, res) => {
    //console.log('Search Bank request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId, startDate, endDate } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`t.CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`t.STATUS = '${status}'`);
        }
        if (startDate && endDate) {
            whereClause.push(`t.DATE BETWEEN '${startDate}' AND '${endDate}'`);
        }

        // Query to search for transactions based on the search criteria
        const queryString = `
            SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME, c.PHONE_NUMBER, c.COMPANY,c.CUSTOMER_ID
            FROM transactions t
            JOIN items i ON t.REFERENCE = i.ITEM_ID_AI
            JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID
            WHERE t.IS_ACTIVE = 1 AND t.METHOD = "Bank" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}
        `;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            for (let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE, AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data, message: 'Transactions found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});





router.post('/addTransaction', async (req, res) => {
    //console.log('Add transactions request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Replace empty strings with null in req.body
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] === '') {
                req.body[key] = null;
            }
        });

        delete req.body.IS_TRANSACTION;



        // Insert the new transactions data into the database
        const insertResult = await pool.query('INSERT INTO transactions SET ?', req.body);

        if (insertResult.affectedRows > 0) {
            //console.log('transactions added successfully');
            // Generate CODE based on insert ID and TYPE
            const insertId = insertResult.insertId;
            const type = req.body.TYPE;

            const code = generateCode(insertId, type);
            //console.log('Generated code:', code);

            // Update the CODE column with the generated code
            await pool.query('UPDATE transactions SET CODE = ? , REFERENCE_TRANSACTION = ? WHERE TRANSACTION_ID = ?', [code, insertId , insertId]);

            if(req.body.TYPE === 'Selling') {
                await pool.query('UPDATE items SET STATUS = ? ,IS_IN_INVENTORY = 0, COMMENTS = ?, SHARE_HOLDERS = ?, SHARE_PERCENTAGE = ?, OTHER_SHARES = ?, PAYMENT_ETA_START = ?, PAYMENT_ETA_END = ?, DATE_FINISHED = ?, SOLD_AMOUNT = ?, AMOUNT_RECEIVED = ?, DUE_AMOUNT = ?, SELLER = ?, BEARER = ?, DATE_SOLD = ? WHERE ITEM_ID_AI = ?', [req.body.STATUS , req.body.COMMENTS, req.body.SHARE_HOLDERS, req.body.SHARE_PERCENTAGE, req.body.OTHER_SHARES, req.body.PAYMENT_ETA_START, req.body.PAYMENT_ETA_END, req.body.DATE_FINISHED, req.body.AMOUNT, req.body.AMOUNT_SETTLED, req.body.DUE_AMOUNT, req.body.CUSTOMER, req.body.BEARER, req.body.DATE, req.body.REFERENCE]);
            }
            else if(req.body.TYPE === 'Buying') {
                await pool.query('UPDATE items SET STATUS = ? , COMMENTS = ?, SHARE_HOLDERS = ?, SHARE_PERCENTAGE = ?, OTHER_SHARES = ?, PAYMENT_ETA_START = ?, PAYMENT_ETA_END = ?, DATE_FINISHED = ?, COST = ?, GIVEN_AMOUNT = ?, BUYER = ?, IS_TRANSACTION = ? , PAYMENT_METHOD = ?  WHERE ITEM_ID_AI = ?', [req.body.STATUS , req.body.COMMENTS, req.body.SHARE_HOLDERS, req.body.SHARE_PERCENTAGE, req.body.OTHER_SHARES, req.body.PAYMENT_ETA_START, req.body.PAYMENT_ETA_END, req.body.DATE_FINISHED, req.body.AMOUNT, req.body.AMOUNT_SETTLED, req.body.CUSTOMER, 1, req.body.METHOD, req.body.REFERENCE]);
            }

            return res.status(200).json({ success: true, message: 'transactions added successfully' });
        } else {
            console.error('Error: Failed to add transactions:', insertResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error adding transactions:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Function to generate CODE based on TYPE and additional fields
function generateCode(insertId, type) {
    //console.log('Generating code for type:', type);
    let code = '';

    if (type === 'Selling') {
        code = 'S' + padWithZeros(insertId);
    } else if (type === 'Buying') {
        code = 'B' + padWithZeros(insertId);
    }
    return code;
}

// Helper function to pad the insertId with zeros
function padWithZeros(insertId) {
    //console.log('Insert ID:', insertId);
    const zeros = '0000';
    const paddedId = zeros + insertId;
    return paddedId.slice(-4);
}

router.post('/addPayment', async (req, res) => {
    //console.log('Add Payment request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Replace empty strings with null in req.body
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] === '') {
                req.body[key] = null;
            }
        });

        const re = {
            REFERENCE_TRANSACTION: req.body.TRANSACTION,
            TYPE: req.body.TYPE === 'Selling' ? 'S Payment' : 'B Payment',
            DATE: req.body.DATE,
            METHOD: req.body.METHOD,
            STATUS: req.body.STATUS,
            REFERENCE: req.body.REFERENCE,
            CUSTOMER: req.body.CUSTOMER,
            BEARER: req.body.BEARER,
            AMOUNT: req.body.AMOUNT,
            AMOUNT_SETTLED: Number(req.body.AMOUNT_SETTLED) + Number(req.body.PAYMENT_AMOUNT),
            DUE_AMOUNT: Number(req.body.DUE_AMOUNT) - Number(req.body.PAYMENT_AMOUNT),
            CREATED_BY: req.body.CREATED_BY,
            COMMENTS: req.body.COMMENTS,
            PAYMENT_AMOUNT: req.body.PAYMENT_AMOUNT,
        };

        // Insert the new transactions data into the database
        const insertResult = await pool.query('INSERT INTO transactions SET ?', re);

        if (insertResult.affectedRows > 0) {
            //console.log('payment added successfully');
            const insertId = insertResult.insertId;
            const type = req.body.TYPE;

            const code = generateCodeForPayment(insertId, type);
            //console.log('Generated code:', code);

            // Update the CODE column with the generated code
            await pool.query('UPDATE transactions SET CODE = ? WHERE TRANSACTION_ID = ?', [code, insertId]);

            await pool.query('UPDATE transactions SET AMOUNT_SETTLED = ?, DUE_AMOUNT = ? WHERE REFERENCE_TRANSACTION = ?', [re.AMOUNT_SETTLED, re.DUE_AMOUNT, req.body.TRANSACTION]);


            if (req.body.TYPE === 'Selling') {
                await pool.query('UPDATE items SET STATUS = ?, SOLD_AMOUNT = ?, AMOUNT_RECEIVED = ?, DUE_AMOUNT = ?, SELLER = ?, BEARER = ? WHERE ITEM_ID_AI = ?', [re.STATUS, re.AMOUNT, re.AMOUNT_SETTLED, re.DUE_AMOUNT, re.CUSTOMER, re.BEARER, re.REFERENCE]);
            } else if (req.body.TYPE === 'Buying') {
                await pool.query('UPDATE items SET STATUS = ?, COST = ?, GIVEN_AMOUNT = ?, BUYER = ? WHERE ITEM_ID_AI = ?', [re.STATUS, re.AMOUNT, re.AMOUNT_SETTLED, re.CUSTOMER, re.REFERENCE]);
            }
            return res.status(200).json({ success: true, message: 'Payment added successfully' });
        } else {
            console.error('Error: Failed to add payment:', insertResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error adding payment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

function generateCodeForPayment(insertId, type) {
    //console.log('Generating code for type:', type);
    let code = '';
    if (type === 'Selling') {
        code = 'SP' + padWithZeros(insertId);
    } else if (type === 'Buying') {
        code = 'BP' + padWithZeros(insertId);
    }
    return code;
}



router.post('/deactivateTransaction', async (req, res) => {
    //console.log('Deactivate transactions request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Extract the transactions ID from the request body
        const { TRANSACTION_ID,ALL } = req.body;

        let updateResult;

        // Update the IS_ACTIVE column to 0 to deactivate the transactions
        if(ALL){
            updateResult = await pool.query('UPDATE transactions SET IS_ACTIVE = 0 WHERE REFERENCE_TRANSACTION = ?', [
                TRANSACTION_ID,
            ]);
        }
        else{
            updateResult = await pool.query('UPDATE transactions SET IS_ACTIVE = 0 WHERE TRANSACTION_ID = ?', [
                TRANSACTION_ID,
            ]);
        }


        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'transactions deactivated successfully' });
        } else {
            console.error('Error: Failed to deactivate transactions:', updateResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error deactivating transactions:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/deletePayment', async (req, res) => {
    //console.log('Deactivate payment request received:', req.body);

    let newValues;
    let updateResult;
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({success: false, message: 'Internal server error'});
        }

        // Extract the payment ID from the request body
        const {TRANSACTION_ID, PAYMENT_AMOUNT, AMOUNT_SETTLED, DUE_AMOUNT,REFERENCE_TRANSACTION} = req.body;

        newValues = {
            AMOUNT_SETTLED: Number(AMOUNT_SETTLED) - Number(PAYMENT_AMOUNT),
            DUE_AMOUNT: Number(DUE_AMOUNT) + Number(PAYMENT_AMOUNT),
        }

        updateResult = await pool.query('UPDATE transactions SET AMOUNT_SETTLED = ?, DUE_AMOUNT = ? WHERE TRANSACTION_ID = ?', [newValues.AMOUNT_SETTLED, newValues.DUE_AMOUNT, REFERENCE_TRANSACTION]);

        let updateResult1 = await pool.query('UPDATE transactions SET IS_ACTIVE = 0 WHERE TRANSACTION_ID = ?', [TRANSACTION_ID]);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({success: true, message: 'payment deactivated successfully'});
        } else {
            console.error('Error: Failed to deactivate payment:', updateResult.message);
            return res.status(500).json({success: false, message: 'Internal server error'});
        }
    } catch (error) {
        console.error('Error deactivating payment:', error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
});

router.post('/getTransactionForReference', async (req, res) => {
    //console.log('Get all HT request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.TRANSACTION_ID, t.CODE, i.CODE as ITEM_CODE FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI WHERE t.IS_ACTIVE = 1 AND (t.TYPE = "Selling" OR t.TYPE = "Buying")');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any transactions are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getTransactionDetails', async (req, res) => {
    //console.log('Get transactions Details request received:', req.body);
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT * FROM transactions WHERE TRANSACTION_ID = ?', [req.body.TRANSACTION_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any transactions are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getAllDueTransactions', async (req, res) => {
    console.log('Get all Cash Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.IS_ACTIVE = 1 AND t.DUE_AMOUNT > 0 AND t.PAYMENT_ETA_END < NOW() AND (t.TYPE = "Selling" OR t.TYPE = "Buying")');


        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // console.log('queryResult:', queryResult);

            for(let i = 0; i < queryResult.length; i++) {
                queryResult[i].REF_CODE = await pool.query('SELECT CODE as REF_CODE,AMOUNT as REF_AMOUNT , PAYMENT_AMOUNT as REF_PAYMENT_AMOUNT, AMOUNT_SETTLED as REF_AMOUNT_SETTLED, DUE_AMOUNT as REF_DUE_AMOUNT FROM transactions WHERE IS_ACTIVE=1 AND TRANSACTION_ID= ?', [queryResult[i].REFERENCE_TRANSACTION]);
                queryResult[i].PAYMENTS = await pool.query('SELECT * FROM transactions WHERE IS_ACTIVE=1 AND REFERENCE_TRANSACTION= ? AND (TYPE="B Payment" OR TYPE="S Payment")', [queryResult[i].TRANSACTION_ID]);
            }

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));

            return res.status(200).json({ success: true, result: data });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



module.exports = router;
