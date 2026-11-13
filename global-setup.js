const fs = require('fs');
const path = require('path');

// The Allure reporter appends to allure-results, so old runs would show up again in the report.
module.exports = () => {
   fs.rmSync(path.join(__dirname, 'allure-results'), { recursive: true, force: true });
};
