# Greenhouse autofill extension

The extension runs locally in Chrome/Edge. It has permission to run only on Greenhouse application pages and stores your profile and resume in the browser's local extension storage. It does not contact a server.

## Install

1. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
2. Choose **Load unpacked** and select this `extension` folder.
3. Open a Greenhouse application, click the extension icon, and choose **Save and fill application** or **Fill & submit application**.
4. The submit action requires a separate confirmation for that application. It is blocked when native required fields are invalid, a CAPTCHA is detected, or a submit button cannot be identified. Employer-side validation may still reject incomplete answers.

Your resume must be a PDF smaller than 5 MB. Enter your details or import a JSON object with `firstName`, `lastName`, `email`, `phone`, `linkedin`, `github`, `website`, and `location` fields. Use the popup to replace your resume or clear all saved profile data.

The extension fills common contact/profile fields and attaches a resume when a clearly labelled resume field is present. It leaves existing field values alone unless you enable overwrite and skips custom questions. **Fill & submit** is a one-application action: after your confirmation, it clicks Greenhouse's Submit Application button if the form passes native validation. Review the resulting page for the employer's confirmation; do not retry an uncertain submission.
