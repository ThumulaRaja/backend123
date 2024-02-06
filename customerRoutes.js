const express = require('express');
const router = express.Router();
const cors = require('cors');

const pool = require('./index'); // Assuming you have a proper MySQL connection pool module

router.use(cors());

const util = require('util');

// Promisify the pool.query method
pool.query = util.promisify(pool.query);

// Now you can use pool.query with async/await
router.post('/getAllCustomers', async (req, res) => {
    //console.log('Get all customers request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active customers
        const queryResult = await pool.query('SELECT * FROM customers WHERE IS_ACTIVE=1');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any customers are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active customers found' });
            }

            // Convert the query result to a new array without circular references
            const customers = queryResult.map(customer => ({ ...customer }));

            return res.status(200).json({ success: true, result: customers });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getDueCustomers', async (req, res) => {
    //console.log('Get all customers request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active customers
        const queryResult = await pool.query('SELECT DISTINCT c.*  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE c.IS_ACTIVE = 1 AND t.IS_ACTIVE = 1 AND t.DUE_AMOUNT > 0 AND t.PAYMENT_ETA_END < NOW()');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any customers are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active customers found' });
            }

            // Convert the query result to a new array without circular references
            const customers = queryResult.map(customer => ({ ...customer }));

            return res.status(200).json({ success: true, result: customers });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/getCustomerDetails', async (req, res) => {
    // console.log('Get customer details request received:', req.body);
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active customers
        const queryResult = await pool.query('SELECT * FROM customers WHERE IS_ACTIVE=1 AND CUSTOMER_ID = ?', [req.body.CUSTOMER_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any customers are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active customers found' });
            }

            // Convert the query result to a new array without circular references
            const customers = queryResult[0];

            return res.status(200).json({ success: true, result: customers });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/addCustomer', async (req, res) => {
    //console.log('Add customer request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Insert the new customer data into the database
        const insertResult = await pool.query('INSERT INTO customers SET ?', req.body);

        if (insertResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Customer added successfully' });
        } else {
            console.error('Error: Failed to add customer:', insertResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error adding customer:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/updateCustomer', async (req, res) => {
    //console.log('Update customer request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Extract the customer ID from the request body
        const { CUSTOMER_ID, ...updatedCustomerData } = req.body;

        // Update the customer data in the database
        const updateResult = await pool.query('UPDATE customers SET ? WHERE CUSTOMER_ID = ?', [
            updatedCustomerData,
            CUSTOMER_ID,
        ]);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Customer updated successfully' });
        } else {
            console.error('Error: Failed to update customer:', updateResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error updating customer:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/deactivateCustomer', async (req, res) => {
    //console.log('Deactivate customer request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Extract the customer ID from the request body
        const { CUSTOMER_ID } = req.body;

        // Update the IS_ACTIVE column to 0 to deactivate the customer
        const updateResult = await pool.query('UPDATE customers SET IS_ACTIVE = 0 WHERE CUSTOMER_ID = ?', [
            CUSTOMER_ID,
        ]);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Customer deactivated successfully' });
        } else {
            console.error('Error: Failed to deactivate customer:', updateResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error deactivating customer:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getCustomerTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.CUSTOMER = ? AND t.IS_ACTIVE = 1 AND (t.TYPE = "Selling" OR t.TYPE = "Buying")', [req.body.CUSTOMER_ID]);


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

router.post('/getCustomerBuyerTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.CUSTOMER = ? AND t.IS_ACTIVE = 1 AND t.TYPE = "Selling"', [req.body.CUSTOMER_ID]);


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

router.post('/getCustomerSellerTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT t.*,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.CUSTOMER = ? AND t.IS_ACTIVE = 1 AND t.TYPE = "Buying"', [req.body.CUSTOMER_ID]);


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

router.post('/getCustomerPartnerTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        // const queryResult = await pool.query('SELECT i.SHARE_HOLDERS,i.SHARE_PERCENTAGE,i.OTHER_SHARES,i.ITEM_ID_AI, i.CODE as ITEM_CODE, c.NAME as C_NAME,c.PHONE_NUMBER,c.COMPANY,c.CUSTOMER_ID  FROM transactions t JOIN items i ON t.REFERENCE = i.ITEM_ID_AI LEFT JOIN customers c ON t.CUSTOMER = c.CUSTOMER_ID WHERE t.CUSTOMER = ? AND t.IS_ACTIVE = 1 AND t.TYPE = "Buying"', [req.body.CUSTOMER_ID]);

        const queryResult = await pool.query('SELECT SHARE_HOLDERS,SHARE_PERCENTAGE,OTHER_SHARES,ITEM_ID_AI, CODE as ITEM_CODE FROM items WHERE IS_ACTIVE=1 AND FIND_IN_SET(?, SHARE_HOLDERS) > 0', [req.body.CUSTOMER_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // console.log('queryResult:', queryResult);

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

router.post('/getCustomerSalesPersonTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query(`
    SELECT i.ITEM_ID_AI, i.CODE AS ITEM_CODE, c.NAME AS C_NAME, 
           c.PHONE_NUMBER, c.COMPANY, c.CUSTOMER_ID 
    FROM items i 
    LEFT JOIN customers c ON i.BUYER = c.CUSTOMER_ID 
    WHERE i.STATUS = 'With Sales Person' AND i.IS_ACTIVE = 1 AND i.BEARER = ?
`, [req.body.CUSTOMER_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // console.log('queryResult:', queryResult);

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

router.post('/getCustomerPreformerTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT ITEM_ID_AI,CODE FROM items WHERE STATUS="With Preformer" AND IS_ACTIVE=1 AND PERFORMER = ?', [req.body.CUSTOMER_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // console.log('queryResult:', queryResult);

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

router.post('/getCustomerCPTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT ITEM_ID_AI,CODE FROM items WHERE STATUS="With C&P" AND IS_ACTIVE=1 AND CP_BY = ?', [req.body.CUSTOMER_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // console.log('queryResult:', queryResult);

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

router.post('/getCustomerElectricTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT ITEM_ID_AI,CODE FROM items WHERE STATUS="With Electric T" AND IS_ACTIVE=1 AND ET_BY = ?', [req.body.CUSTOMER_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // console.log('queryResult:', queryResult);

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

router.post('/getCustomerHeatTTransactions', async (req, res) => {
    // console.log('Get all Customer Transaction HT request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active transactions
        const queryResult = await pool.query('SELECT ITEM_ID_AI,CODE FROM items WHERE STATUS="With Heat T" AND IS_ACTIVE=1 AND HT_BY = ?', [req.body.CUSTOMER_ID]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // console.log('queryResult:', queryResult);

            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active transactions found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(transactions => ({ ...transactions }));
            // console.log('data:', data);
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
