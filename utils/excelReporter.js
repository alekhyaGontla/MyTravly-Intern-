const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelReporter {
  constructor(options) {
    this.results = new Map();
    this.filePath = path.join(__dirname, '..', 'test-data', 'QA_Test_Cases.xlsx');
    this.outPath = path.join(__dirname, '..', 'test-data', 'QA_Test_Cases_Results.xlsx');
  }

  onTestEnd(test, result) {
    // Extract Test Case ID from the test title (e.g., "MTW-TC-11: Search results...")
    const match = test.title.match(/(MTW-TC-\d+|TC_\d+\.\d+|TC\d+|PAY-SCN-\d+|H_09\.\d+|FA_10\.1|BG_12\.\d+|BLOG-SCN-\d+)/);
    if (match) {
      const testId = match[1];
      this.results.set(testId, {
        status: result.status, // "passed", "failed", "timedOut", "skipped"
        error: result.error ? result.error.message.split('\n')[0].substring(0, 500) : ''
      });
    }
  }

  async onEnd(result) {
    console.log(`Excel Reporter: Saving results to ${this.outPath}...`);
    try {
      const workbook = new ExcelJS.Workbook();
      const readPath = fs.existsSync(this.outPath) ? this.outPath : this.filePath;
      await workbook.xlsx.readFile(readPath);
      const worksheet = workbook.worksheets[0];

      // Headers are on Row 10. Data starts at Row 11.
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 10) {
          const scnIdCell = row.getCell(1);
          const testIdCell = row.getCell(4);
          const scnId = scnIdCell.value ? scnIdCell.value.toString().trim() : '';
          const testId = testIdCell.value ? testIdCell.value.toString().trim() : '';
          
          const matchedId = (testId && this.results.has(testId)) ? testId : ((scnId && this.results.has(scnId)) ? scnId : null);

          if (matchedId) {
            const testResult = this.results.get(matchedId);
            const statusCell = row.getCell(9); // Column I is Status
            const actualResultCell = row.getCell(8); // Column H is Actual Result

            // Update Status and ensure 'Skipped' is available in the dropdown list
            statusCell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: ['"Pass,Fail,Skipped,Not Executed,Blocked"']
            };

            if (testResult.status === 'passed') {
              statusCell.value = 'Pass';
              statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            } else if (testResult.status === 'failed' || testResult.status === 'timedOut') {
              statusCell.value = 'Fail';
              statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
            } else if (testResult.status === 'skipped') {
              statusCell.value = 'Skipped';
              statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
            }

            // Update Actual Result if there's an error
            if (testResult.error) {
              actualResultCell.value = testResult.error;
            } else if (testResult.status === 'passed') {
              actualResultCell.value = 'Executed via Automation: Passed successfully.';
            } else if (testResult.status === 'skipped') {
              actualResultCell.value = 'Skipped via Automation: Test execution skipped per user instructions.';
            }
            
            row.commit();
          }
        }
      });

      await workbook.xlsx.writeFile(this.outPath);
      console.log('Excel Reporter: Successfully updated spreadsheet!');
    } catch (err) {
      console.error('Excel Reporter Error:', err);
    }
  }
}

module.exports = ExcelReporter;
