# DIB-APP-V1.003


## Configuration

Create a `.env` file in the project root based on `.env.example` and provide your API keys:

```bash
cp .env.example .env
```

Edit `.env` and replace the placeholders with your actual keys. These values are consumed only by the Express server and never exposed to the browser. `REACT_APP_GEMINI_API_KEY` powers Google Gemini requests and `REACT_APP_OPENAI_API_KEY` is used for ChatGPT.
`REACT_APP_API_BASE_URL` should point to the Express server URL (default `https://localhost:7103`). You may override the default AI endpoints using `REACT_APP_OPENAI_URL` and `REACT_APP_GEMINI_URL` if needed.

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
The React development server started with `npm start` now runs in HTTPS mode on port `7102`.
If you run the backend on a different port (e.g. 7103), update `REACT_APP_API_BASE_URL` in your `.env` to match:

```bash
REACT_APP_API_BASE_URL=https://localhost:7103
```

The Express backend tries to start both an HTTP server on `PORT` (default
`7003`) and an HTTPS server on `HTTPS_PORT` (default `7103`). Certificate and
key files are read from `src/ssl/cert.pem` and `src/ssl/key.pem` or from the
`SSL_CERT_PATH` and `SSL_KEY_PATH` environment variables. If the HTTPS server
fails to start the application continues running on HTTP only and a warning is
written to the console and log file.

The ChatGPT provider relies on a working internet connection. If requests fail with
"Failed to fetch", ensure that your environment allows outbound HTTPS requests to
`api.openai.com` and that your API key is valid.

### Testing the database connection

The server exposes an endpoint `/api/test-db` which performs a simple database query. On the language selection page a "Test DB Connection" button calls this endpoint and shows whether the connection succeeds.

## Logs

All errors and ChatGPT responses are written to daily log files under the `logs/`
directory. Each AI reply is also stored in files prefixed `ai_respo_` followed by
the date (e.g. `logs/ai_respo_2024-05-30.log`). These files are created
automatically when the server runs. In addition to file logs, activities are
inserted into an `activity_log` table and errors into an `error_log` table in the
database.


