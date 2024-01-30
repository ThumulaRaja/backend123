const express = require('express');
const router = express.Router();
const cors = require('cors');

const pool = require('./index'); // Assuming you have a proper MySQL connection pool module

router.use(cors());

const util = require('util');

// Promisify the pool.query method
pool.query = util.promisify(pool.query);

router.post('/getItemDetails' , async (req, res) => {
    // console.log('Get Item Details request received:', req.body);
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT * FROM items WHERE IS_ACTIVE=1 AND ITEM_ID_AI=?', req.body.id);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult[0];
            // console.log(data);

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

router.post('/getItemDetailsUsingCode' , async (req, res) => {
    // console.log('Get Item Details request received:', req.body);
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT * FROM items WHERE IS_ACTIVE=1 AND CODE=?', req.body.code);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult[0];
            // console.log(data);

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


// Now you can use pool.query with async/await
router.post('/getAllRough', async (req, res) => {
    //console.log('Get all Rough request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Rough"');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(items => ({ ...items }));

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

router.post('/getAllLots', async (req, res) => {
    //console.log('Get all Lots request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Lots"');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(items => ({ ...items }));

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

router.post('/getAllSortedLots', async (req, res) => {
    //console.log('Get all Sorted Lots request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Sorted Lots"');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(items => ({ ...items }));

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

router.post('/getAllCP', async (req, res) => {
    //console.log('Get all CP request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Cut and Polished"');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(items => ({ ...items }));

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

router.post('/searchRough', async (req, res) => {
    //console.log('Search Rough request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`STATUS = '${status}'`);
        }
        if (itemId !== null && itemId !== undefined) {
            whereClause.push(`ITEM_ID LIKE '%${itemId}%'`);
        }

        // Query to search for items based on the search criteria
        const queryString = `SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Rough" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}`;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                //console.log('No items found matching the search criteria');
                return res.status(200).json({ success: true, message: 'No items found matching the search criteria' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(item => ({ ...item }));

            return res.status(200).json({ success: true, result: data, message: 'Items found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/searchLots', async (req, res) => {
    //console.log('Search Lots request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`STATUS = '${status}'`);
        }
        if (itemId !== null && itemId !== undefined) {
            whereClause.push(`ITEM_ID LIKE '%${itemId}%'`);
        }

        // Query to search for items based on the search criteria
        const queryString = `SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Lots" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}`;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                //console.log('No items found matching the search criteria');
                return res.status(200).json({ success: true, message: 'No items found matching the search criteria' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(item => ({ ...item }));

            return res.status(200).json({ success: true, result: data, message: 'Items found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/searchSortedLots', async (req, res) => {
    //console.log('Search Sorted Lots request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`STATUS = '${status}'`);
        }
        if (itemId !== null && itemId !== undefined) {
            whereClause.push(`ITEM_ID LIKE '%${itemId}%'`);
        }

        // Query to search for items based on the search criteria
        const queryString = `SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Sorted Lots" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}`;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                //console.log('No items found matching the search criteria');
                return res.status(200).json({ success: true, message: 'No items found matching the search criteria' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(item => ({ ...item }));

            return res.status(200).json({ success: true, result: data, message: 'Items found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/searchCP', async (req, res) => {
    //console.log('Search CP request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const { code, status, itemId } = req.body;

        // Construct the WHERE clause based on the search criteria
        const whereClause = [];
        if (code) {
            whereClause.push(`CODE LIKE '%${code}%'`);
        }
        if (status) {
            whereClause.push(`STATUS = '${status}'`);
        }
        if (itemId !== null && itemId !== undefined) {
            whereClause.push(`ITEM_ID LIKE '%${itemId}%'`);
        }

        // Query to search for items based on the search criteria
        const queryString = `SELECT * FROM items WHERE IS_ACTIVE=1 AND TYPE="Cut and Polished" ${whereClause.length > 0 ? 'AND ' + whereClause.join(' AND ') : ''}`;

        const queryResult = await pool.query(queryString);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                //console.log('No items found matching the search criteria');
                return res.status(200).json({ success: true, message: 'No items found matching the search criteria' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(item => ({ ...item }));

            return res.status(200).json({ success: true, result: data, message: 'Items found matching the search criteria' });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/addItem', async (req, res) => {
    console.log('Add items request received:', req.body);

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

        // Insert the new items data into the database
        const insertResult = await pool.query('INSERT INTO items SET ?', req.body);



        if (insertResult.affectedRows > 0) {
            //console.log('Item added successfully');
            // Generate CODE based on insert ID and TYPE
            const insertId = insertResult.insertId;
            const type = req.body.TYPE;
            const roughtype = req.body.ROUGH_TYPE;
            const lottype = req.body.LOT_TYPE;
            const sortedlottype = req.body.SORTED_LOT_TYPE;
            const cptype = req.body.CP_TYPE;

            const code = generateCode(insertId, type, roughtype, lottype, sortedlottype, cptype);
            //console.log('Generated code:', code);

            // Update the CODE column with the generated code
            await pool.query('UPDATE items SET CODE = ? WHERE ITEM_ID_AI = ?', [code, insertId]);

            if(req.body.IS_HEAT_TREATED === true) {
                if (req.body.HT_ID) {
                    const selectResult = await pool.query('SELECT REFERENCE FROM heat_treatment WHERE HT_ID = ?', req.body.HT_ID);
                    const reference = selectResult[0].REFERENCE;
                    const newReference = reference + ',' + insertId;
                    await pool.query('UPDATE heat_treatment SET REFERENCE = ? WHERE HT_ID = ?', [newReference, req.body.HT_ID]);
                }
            }

            if(req.body.IS_TRANSACTION === true){
                const re = {
                    TYPE: 'Buying',
                    METHOD: req.body.PAYMENT_METHOD,
                    STATUS: req.body.STATUS,
                    DATE: req.body.DATE,
                    REFERENCE: insertId,
                    CUSTOMER: req.body.SELLER,
                    AMOUNT: req.body.COST,
                    PAYMENT_AMOUNT: req.body.GIVEN_AMOUNT,
                    AMOUNT_SETTLED: req.body.GIVEN_AMOUNT,
                    DUE_AMOUNT: req.body.COST - req.body.GIVEN_AMOUNT,
                    SHARE_HOLDERS: req.body.SHARE_HOLDERS ? req.body.SHARE_HOLDERS : null,
                    SHARE_PERCENTAGE: req.body.SHARE_PERCENTAGE ? req.body.SHARE_PERCENTAGE : null,
                    SHARE_VALUE: req.body.COST && req.body.SHARE_PERCENTAGE ? req.body.COST * req.body.SHARE_PERCENTAGE / 100 : null,
                    OTHER_SHARES: req.body.OTHER_SHARES,
                    COMMENTS: req.body.COMMENTS,
                    CREATED_BY: req.body.CREATED_BY,
                }
                const insertResult1 = await pool.query('INSERT INTO transactions SET ?', re);
                if (insertResult1.affectedRows > 0) {
                    const insertId1 = insertResult1.insertId;

                    const code1 = generateCode1(insertId1);
                    //console.log('Generated code:', code1);

                    await pool.query('UPDATE transactions SET CODE = ? WHERE TRANSACTION_ID = ?', [code1, insertId1]);
                }
            }

            return res.status(200).json({ success: true, message: 'Item added successfully' });
        } else {
            console.error('Error: Failed to add items:', insertResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error adding items:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Function to generate CODE based on TYPE and additional fields
function generateCode(insertId, type, roughType, lotType, sortedLotType, cpType) {
    //console.log('Generating code for type:', type);
    let code = '';

    if (type === 'Rough') {
        switch (roughType) {
            case 'Blue Sapphire Natural':
                code = 'BSN' + padWithZeros(insertId);
                break;
            case 'Blue Sapphire Geuda':
                code = 'BSG' + padWithZeros(insertId);
                break;
            case 'Yellow Sapphire':
                code = 'YSN' + padWithZeros(insertId);
                break;
            case 'Pink Sapphire Natural':
                code = 'PISN' + padWithZeros(insertId);
                break;
            case 'Purple Sapphire Natural':
                code = 'PSN' + padWithZeros(insertId);
                break;
            case 'Violet Sapphire':
                code = 'VSN' + padWithZeros(insertId);
                break;
            case 'Padparadscha Sapphire':
                code = 'PDSN' + padWithZeros(insertId);
                break;
            case 'Mix':
                code = 'MS' + padWithZeros(insertId);
                break;
            case 'Fancy':
                code = 'FS' + padWithZeros(insertId);
                break;
            default:
                break;
        }
    } else if (type === 'Lots') {
        switch (lotType) {
            case 'Lots Buying':
                code = 'SL' + padWithZeros(insertId);
                break;
            case 'Lots Mines':
                code = '67L' + padWithZeros(insertId);
                break;
            case 'Lots Selling':
                code = 'LSELL' + padWithZeros(insertId);
                break;
            default:
                break;
        }
    } else if (type === 'Sorted Lots') {
        switch (sortedLotType) {
            case 'Lots Blue':
                code = 'BSL' + padWithZeros(insertId);
                break;
            case 'Lots Geuda':
                code = 'GSL' + padWithZeros(insertId);
                break;
            case 'Lots Yellow':
                code = 'YSL' + padWithZeros(insertId);
                break;
            case 'Lots Mix':
                code = 'MSL' + padWithZeros(insertId);
                break;
            default:
                break;
        }
    } else if (type === 'Cut and Polished') {
        switch (cpType) {
            case 'Blue Sapphire Natural':
                code = 'BSN' + padWithZeros(insertId) + 'CP';
                break;
            case 'Blue Sapphire Heated':
                code = 'BSHCP' + padWithZeros(insertId);
                break;
            case 'Yellow Sapphire':
                code = 'YSN' + padWithZeros(insertId) + 'CP';
                break;
            case 'Pink Sapphire Natural':
                code = 'PISNCP' + padWithZeros(insertId);
                break;
            case 'Pink Sapphire Treated':
                code = 'PISHCP' + padWithZeros(insertId);
                break;
            case 'Purple Sapphire Natural':
                code = 'PSNCP' + padWithZeros(insertId);
                break;
            case 'Violet Sapphire Natural':
                code = 'VSN' + padWithZeros(insertId) + 'CP';
                break;
            case 'Blue Sapphire Treated Lots':
                code = 'BSHLCP' + padWithZeros(insertId);
                break;
            case 'Padparadscha Sapphire Natural':
                code = 'PDSN' + padWithZeros(insertId) + 'CP';
                break;
            default:
                break;
        }
    }

    return code;
}

function generateCode1(insertId1) {
    return 'B' + padWithZeros(insertId1);
}

// Helper function to pad the insertId with zeros
function padWithZeros(insertId) {
    //console.log('Insert ID:', insertId);
    const zeros = '0000';
    const paddedId = zeros + insertId;
    return paddedId.slice(-4);
}



router.post('/updateItem', async (req, res) => {
    //console.log('Update items request received:', req.body);

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

        // Extract the items ID from the request body
        const { ITEM_ID_AI, ...updatedCustomerData } = req.body;

        // Update the items data in the database
        const updateResult = await pool.query('UPDATE items SET ? WHERE ITEM_ID_AI = ?', [
            updatedCustomerData,
            ITEM_ID_AI,
        ]);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Customer updated successfully' });
        } else {
            console.error('Error: Failed to update items:', updateResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error updating items:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/deactivateItem', async (req, res) => {
    //console.log('Deactivate items request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Extract the items ID from the request body
        const { ITEM_ID_AI } = req.body;

        // Update the IS_ACTIVE column to 0 to deactivate the items
        const updateResult = await pool.query('UPDATE items SET IS_ACTIVE = 0 WHERE ITEM_ID_AI = ?', [
            ITEM_ID_AI,
        ]);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Customer deactivated successfully' });
        } else {
            console.error('Error: Failed to deactivate items:', updateResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error deactivating items:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getItemsForReference', async (req, res) => {
    //console.log('Get all HT request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT ITEM_ID_AI,CODE FROM items WHERE IS_ACTIVE=1');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(items => ({ ...items }));

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

router.post('/getItemsDetailsForTransaction', async (req, res) => {
    //console.log('Get Items Details request received:', req.body);
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active items
        const queryResult = await pool.query('SELECT COMMENTS,SHARE_HOLDERS,SHARE_PERCENTAGE,OTHER_SHARES,PAYMENT_ETA_START,PAYMENT_ETA_END,DATE_FINISHED,SOLD_AMOUNT,AMOUNT_RECEIVED,DUE_AMOUNT,SELLER,BEARER,BUYER,COST,GIVEN_AMOUNT,PAYMENT_METHOD,IS_TRANSACTION FROM items WHERE IS_ACTIVE=1 AND ITEM_ID_AI=?', [req.body.ITEM_ID_AI]);

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any items are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active items found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(items => ({ ...items }));

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
