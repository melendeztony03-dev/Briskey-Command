# Brisket Command
Big Rigs & BBQ: Anthony's tasting station, with Google Sheets responses and email notifications.

## Update an existing Apps Script deployment
1. Open the existing Brisket Command Apps Script project.
2. Replace Code.gs with apps-script/Code.gs and Form.html with apps-script/Form.html from this repository.
3. Save both files. Existing Script Properties and the notification trigger remain in place; setup does not need to run again.
4. Deploy > Manage deployments > select the existing web app > Edit (pencil) > Version: New version > Deploy.
5. This retains the /exec URL used by the website and QR code.
6. Reload the website and submit a test including Brisket, Texas Twinkies, and Armadillo Eggs. Verify three linked rows in Responses and one notification email containing all three reviews.

## Reviews
Guests enter name and batch once and add up to ten food reviews. Foods include Brisket, Pork shoulder, Ribs, Picanha, Meatloaf, Texas Twinkies, Armadillo Eggs, and Other. Each food gets its own ratings and eat-again verdict. Brisket and rib questions appear only for those foods. Fat-render ratings are hidden for the two stuffed snacks. Favorite food and shared comments are saved in Notes.

Existing response columns and old submissions are preserved. Each food occupies one row with a shared report ID. A batch is written under one lock; duplicate retries do not add rows. The backend still accepts the old single-food form during rollout.

## Validation
JavaScript syntax checked. Mocked Apps Script tests passed for three-food saves, shared IDs, retries, invalid-item rejection before writes, formula escaping, rating validation, and legacy single-food submissions. The updated Google web app requires the manual deployment step above before live multi-food testing.
