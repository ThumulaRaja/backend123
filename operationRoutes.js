const express = require('express');
const router = express.Router();
const cors = require('cors');

const pool = require('./index'); // Assuming you have a proper MySQL connection pool module

router.use(cors());

const util = require('util');

// Promisify the pool.query method
pool.query = util.promisify(pool.query);

// Now you can use pool.query with async/await

router.post('/getAllCutPolish', async (req, res) => {
    //console.log('Get all HT request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch all active cp
        const queryResult = await pool.query('SELECT cp.*, i.WEIGHT_AFTER_CP,i.CODE AS ITEM_CODE, i.CP_BY, i.CP_COLOR, i.SHAPE, i.CP_TYPE, i.TOTAL_COST, c.NAME AS CP_BY_NAME FROM cp cp INNER JOIN items i ON cp.REFERENCE = i.ITEM_ID_AI INNER JOIN customers c ON i.CP_BY = c.CUSTOMER_ID WHERE cp.IS_ACTIVE=1');

        const queryResult2 = await pool.query('SELECT cp.CP_ID,i.CODE AS REFERENCE_ITEM_CODE FROM cp cp INNER JOIN items i ON cp.OLD_REFERENCE = i.ITEM_ID_AI WHERE cp.IS_ACTIVE=1');

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            // Check if any cp are found
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active cp found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(cp => ({ ...cp }));
            const data2 = queryResult2.map(cp => ({ ...cp }));

            //combine two arrays
            for(let i=0; i<data.length; i++){
                if(data[i].CP_ID == data2[i].CP_ID){
                    data[i].REFERENCE_ITEM_CODE = data2[i].REFERENCE_ITEM_CODE;
                }
            }

            // Process each reference and perform the query for each number
            return res.status(200).json({ success: true, result: data, result2: data2 });
        } else {
            console.error('Error: queryResult is not an array:', queryResult);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getReferenceCPDetails', async (req, res) => {
    //console.log('Get all CP details request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const checkQuery = await pool.query('SELECT * FROM cp WHERE REFERENCE = ?', [req.body.ITEM_ID_AI]);
        let queryResult;

        if(checkQuery.length > 0){
            queryResult = await pool.query('SELECT cp.*,i.WEIGHT_AFTER_CP,i.CODE AS ITEM_CODE, i.CP_BY, i.CP_COLOR, i.SHAPE, i.CP_TYPE, i.TOTAL_COST FROM cp cp INNER JOIN items i ON cp.REFERENCE = i.ITEM_ID_AI WHERE cp.IS_ACTIVE=1 AND i.IS_ACTIVE=1 AND i.ITEM_ID_AI = ?', [req.body.ITEM_ID_AI]);
        }
        else{
            queryResult = await pool.query('SELECT WEIGHT_AFTER_CP,CODE AS ITEM_CODE,CP_BY,CP_COLOR,SHAPE,CP_TYPE,TOTAL_COST FROM items WHERE IS_ACTIVE=1 AND ITEM_ID_AI = ?', [req.body.ITEM_ID_AI]);
        }

        // Query to fetch all active cp_details

        // Check if queryResult is an array before trying to use .map
        if (Array.isArray(queryResult)) {
            if (queryResult.length === 0) {
                return res.status(404).json({ success: false, message: 'No active cp_details found' });
            }

            // Convert the query result to a new array without circular references
            const data = queryResult.map(cp_details => ({ ...cp_details }));

            // Process each reference and perform the query for each number
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



router.post('/addCutPolish', async (req, res) => {
    //console.log('Add cp request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const selectQuery = await pool.query('SELECT * FROM items WHERE ITEM_ID_AI = ?', [req.body.REFERENCE_ID_CP]);

        delete selectQuery[0].ITEM_ID_AI;
        delete selectQuery[0].CODE;
        delete selectQuery[0].CP_BY;
        delete selectQuery[0].CP_COLOR;
        delete selectQuery[0].SHAPE;
        delete selectQuery[0].CP_TYPE;
        delete selectQuery[0].TOTAL_COST;
        delete selectQuery[0].STATUS;
        delete selectQuery[0].WEIGHT_AFTER_CP;
        delete selectQuery[0].TYPE;
        delete selectQuery[0].REFERENCE_ID_CP;

        reInsertData = {
            ...selectQuery[0],
            CODE: req.body.CODE_AFTER_CUTTING,
            TYPE: 'Cut and Polished',
            CP_BY: req.body.CP_BY,
            CP_COLOR: req.body.CP_COLOR,
            SHAPE: req.body.SHAPE,
            CP_TYPE: req.body.CP_TYPE,
            TOTAL_COST: req.body.TOTAL_COST,
            STATUS: req.body.STATUS,
            WEIGHT_AFTER_CP: req.body.WEIGHT_AFTER_CP,
            REFERENCE_ID_CP: req.body.REFERENCE_ID_CP,
        }

        insertQuery = await pool.query('INSERT INTO items SET ?', reInsertData);

        if(req.body.IS_REFERENCE_DEACTIVATED){
            await pool.query('UPDATE items SET IS_IN_INVENTORY = 0 WHERE ITEM_ID_AI = ?', [req.body.REFERENCE_ID_CP]);
        }

        cpData = {
            OLD_REFERENCE: req.body.REFERENCE_ID_CP,
            REFERENCE: insertQuery.insertId,
            PHOTO: req.body.PHOTO,
            REMARK: req.body.REMARK,
            CREATED_BY: req.body.CREATED_BY,
        }
        // Insert the new cp data into the database
        const insertResult = await pool.query('INSERT INTO cp SET ?', cpData);

        if (insertResult.affectedRows > 0) {
            // Generate CODE based on insert ID
            const insertId = insertResult.insertId;
            const code = generateCodeCP(insertId);

            // Update the CODE column with the generated code
            await pool.query('UPDATE cp SET CODE = ? WHERE CP_ID = ?', [code, insertId]);

            return res.status(200).json({ success: true, message: 'Heat treatment added successfully' });
        } else {
            console.error('Error: Failed to add cp:', insertResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error adding cp:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Function to generate CODE based on insert ID
function generateCodeCP(insertId) {
    const paddedId = String(insertId).padStart(3, '0');
    return `CP${paddedId}`;
}


router.post('/updateCutPolish', async (req, res) => {
    //console.log('Update cp request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Extract the cp ID from the request body
        cpData = {
            PHOTO: req.body.PHOTO,
            REMARK: req.body.REMARK,
        }

        itemData = {
            WEIGHT_AFTER_CP: req.body.WEIGHT_AFTER_CP,
            CP_BY: req.body.CP_BY,
            CP_COLOR: req.body.CP_COLOR,
            SHAPE: req.body.SHAPE,
            CP_TYPE: req.body.CP_TYPE,
            TOTAL_COST: req.body.TOTAL_COST,
        }

        // Update the cp data in the database
        const updateResult1 = await pool.query('UPDATE cp SET ? WHERE CP_ID = ?', [
            cpData,
            req.body.CP_ID,
        ]);
        const updateResult2 = await pool.query('UPDATE items SET ? WHERE ITEM_ID_AI = ?', [
            itemData,
            req.body.REFERENCE,
        ]);
        if (updateResult1.affectedRows > 0 || updateResult2.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'CP updated successfully' });
        } else {
            console.error('Error: Failed to update cp:', updateResult1.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error updating cp:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



router.post('/deactivateCP', async (req, res) => {
    //console.log('Deactivate cp request received:', req.body);

    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Extract the cp ID from the request body
        const { CP_ID } = req.body;

        // Update the IS_ACTIVE column to 0 to deactivate the cp
        const updateResult = await pool.query('UPDATE cp SET IS_ACTIVE = 0 WHERE CP_ID = ?', [
            CP_ID,
        ]);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Customer deactivated successfully' });
        } else {
            console.error('Error: Failed to deactivate cp:', updateResult.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error deactivating cp:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});





module.exports = router;
