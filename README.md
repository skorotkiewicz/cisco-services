# Cisco Phone Services

A simple server providing services for Cisco phones, including weather forecasts and a phone directory.

## Features

- Display weather forecast on Cisco phones
- Search contacts in the phone directory
- Simple API with XML formatting

## Requirements

- Node.js
- npm or bun

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/skorotkiewicz/cisco-services.git
   cd cisco
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   bun install
   ```

3. **Important:** Create the phone directory configuration file:
   ```
   cp phone_book.example.js phone_book.js
   ```
   
   Then customize the contacts in the `phone_book.js` file according to your needs.

## Running the Server

```
npm start
```
or
```
bun start
```

The server will run on the configured port (default is port 8080).

## Configuration

Server settings can be found in the `config.js` file.

## License

MIT