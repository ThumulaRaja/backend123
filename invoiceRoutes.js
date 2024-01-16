const express = require('express');
const router = express.Router();
const cors = require('cors');
const util = require('util');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf'); // Install this library: npm install html-pdf


const pool = require('./index');
router.use(cors());
pool.query = util.promisify(pool.query);

router.post('/generateInvoice', async (req, res) => {
    try {
        const { data } = req.body;
        const { CODE, TYPE, C_NAME,ITEM_CODE, DATE, METHOD, AMOUNT_SETTLED,AMOUNT,PAYMENT_AMOUNT,DUE_AMOUNT,PHONE_NUMBER } = data;

            const templatePath = path.join(__dirname, 'invoice-template.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const renderedHtml = htmlTemplate.replace('{{code}}', CODE).replace('{{type}}', TYPE).replace('{{c_name}}', C_NAME).replace('{{item_code}}', ITEM_CODE).replace('{{date}}', DATE.split('T')[0]).replace('{{method}}', METHOD).replace('{{amount_settled}}', AMOUNT_SETTLED).replace('{{amount}}', AMOUNT).replace('{{payment_amount}}', PAYMENT_AMOUNT).replace('{{due_amount}}', DUE_AMOUNT).replace('{{phone_number}}', PHONE_NUMBER);

        pdf.create(renderedHtml).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error generating PDF:', err);
                res.json({ success: false, message: err.message });
            } else {
                console.log('PDF generated successfully!');
                res.json({ success: true, data: buffer.toString('base64') });
            }
        });
    } catch (error) {
        console.error('Error generating PDF:', error.message);
        res.json({ success: false, message: error.message });
    }
});

module.exports = router;
