# Brisket Command
BBQ tasting form with private Google Sheets responses and Apps Script email notifications.

## Website
Open repository Settings > Pages. Select Deploy from a branch, main, / (root), then Save.

## Google setup
1. Open your Brisket Command — Field Test Responses Sheet.
2. Extensions > Apps Script. Replace Code.gs with apps-script/Code.gs from this repository.
3. Add an HTML file named Form. Paste apps-script/Form.html into it.
4. Save, select setup, Run, and authorize your script. Setup stores the Sheet ID and your account email privately in Script Properties and creates a five-minute notification trigger.
5. Deploy > New deployment > Web app. Execute as Me; access Anyone. Deploy.
6. Send the /exec URL to your assistant to connect config.js and finish testing.

Reports deduplicate retries with the same ID, validate ratings, and neutralize spreadsheet formulas. Email digests run approximately every five minutes, subject to Google quotas and trigger delays. Saved responses remain available if email is delayed.

JavaScript syntax was checked. Live submissions, email delivery, mobile layout, and the final QR code still require deployment and verification.
