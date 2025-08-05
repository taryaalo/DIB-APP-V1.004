# DIB-APP-V1.003


## Configuration

Create a `.env` file in the project root based on `.env.example` and provide your API keys:

```bash
cp .env.example .env
```

Edit `.env` and replace the placeholders with your actual keys. These values are consumed only by the Express server and never exposed to the browser. `REACT_APP_GEMINI_API_KEY` powers Google Gemini requests and `REACT_APP_OPENAI_API_KEY` is used for ChatGPT.
`REACT_APP_API_BASE_URL` should point to the Express server URL. By default the server listens on `http://localhost:7003`, so the value should match that URL. You may override the default AI endpoints using `REACT_APP_OPENAI_URL` and `REACT_APP_GEMINI_URL` if needed.

For OTP delivery you must also provide SMS and SMTP settings:

```
SMS_API_URL=https://10.30.0.45/ultimatesms/api/http/sms/send
SMS_API_TOKEN=<your token>
SMS_SENDER_ID=16661
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_USER=<smtp user>
SMTP_PASS=<smtp pass>
SMTP_FROM=<from address>
```

## Running the server

An Express server is included for caching uploaded files and form data. Start it alongside the React app:

```bash
npm install
node server.js
```
The React development server started with `npm start` runs on port `7102` in HTTP mode.
If you run the backend on a different port, update `REACT_APP_API_BASE_URL` in your `.env` to match the new port:

```bash
REACT_APP_API_BASE_URL=http://localhost:7003
```

The Express backend listens on `PORT` (default `7003`) using HTTP only.

The ChatGPT provider relies on a working internet connection. If requests fail with
"Failed to fetch", ensure that your environment allows outbound HTTPS requests to
`api.openai.com` and that your API key is valid.

### Testing the database connection

The server exposes an endpoint `/api/test-db` which performs a simple database query. On the language selection page a "Test DB Connection" button calls this endpoint and shows whether the connection succeeds.
If the connection fails the server logs the error message and stack trace under `logs/` and records it in the `error_log` table.

## Logs

All errors and ChatGPT responses are written to daily log files under the `logs/`
directory. Each AI reply is also stored in files prefixed `ai_respo_` followed by
the date (e.g. `logs/ai_respo_2024-05-30.log`). These files are created
automatically when the server runs. In addition to file logs, activities are
inserted into an `activity_log` table and errors into an `error_log` table in the
database.

## Customer ID API

When an application is approved on the lookup page the backend can create a
customer ID by calling an external service. Provide the credentials in `.env`:

```
CUST_API_URL=http://10.1.100.204/Account_Statment/API/createCustID.php
CUST_API_TOKEN=<api token>
```

The endpoint `POST /api/create-custid` accepts a reference number. It compiles
the required customer data from the database, calls the external API and stores
the returned `CUSTID` in a new `customer_details` table. The full API response is
also recorded in the `activity_log` table for auditing.


