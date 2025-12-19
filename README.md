# Google Calendar MCP Server

A Model Context Protocol (MCP) server for comprehensive Google Calendar integration, allowing AI agents to manage calendars, events, and permissions.

## Features

This server provides a wide range of tools to interact with the Google Calendar API:

*   **Events**: List, create, update, delete, move, import, and watch events. Support for recurring event instances and quick add.
*   **Calendars**: Manage secondary calendars (create, delete, update metadata) and clear primary calendars.
*   **CalendarList**: Manage the user's list of subscribed calendars.
*   **ACL (Access Control List)**: Manage permissions (add, remove, update rules) for calendars.
*   **Freebusy**: Query availability for a set of calendars.
*   **Settings**: Retrieve and watch user settings.
*   **Channels**: Stop notification channels.
*   **Colors**: key Retrieve calendar color definitions.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Credentials**:
    Ensure you have a `credentials.json` file in the root directory with your Google Cloud OAuth 2.0 Client credentials.

3.  **Authentication**:
    The server handles OAuth 2.0 flow. On the first request that requires auth, it will prompt you to visit a URL to authorize the application. Tokens are stored securely in `token.json` (encrypted).

## Running the Server

To run the server manually (for testing or dev):
```bash
node src/index.js
```

## Claude Desktop Configuration

Add the following to your Claude Desktop configuration file (usually found at `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "node",
      "args": [
        "c:\\Users\\HP\\Desktop\\server\\src\\index.js"
      ]
    }
  }
}
```
