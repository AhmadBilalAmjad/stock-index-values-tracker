# Stock Index Values Tracker

A web application for tracking stock index values and setting up price alerts.

## Features

- View real-time stock quotes for popular indices
- Set up price alerts for stocks
- Receive email notifications when price thresholds are crossed

## Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your API keys and SMTP settings:
   - Finnhub API key for stock data
   - Firebase credentials for authentication
   - SMTP settings for email alerts

5. Start the server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

## Email Alerts

The application includes a cron job that checks stock prices every 5 minutes and sends email alerts when price thresholds are crossed.

### SMTP Configuration

To enable email alerts, configure the following SMTP settings in your `.env` file:

```
# EMAIL CONFIG
GMAIL=abc@gmail.com
GPASS=pass
```

You can use services like Gmail, SendGrid, or any other SMTP provider.

## API Endpoints

### Stocks

- `GET /api/stocks/indices` - Get list of stock indices with current prices
- `GET /api/stocks/quote/:symbol` - Get current quote for a specific symbol
- `GET /api/stocks/stats` - Get API usage statistics

### Alerts

- `GET /api/alerts` - Get all alerts for a user
- `POST /api/alerts` - Create a new alert
- `DELETE /api/alerts/:id` - Delete an alert
- `PATCH /api/alerts/:id/toggle` - Toggle alert status (active/inactive)

## License

ISC 