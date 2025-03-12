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
   cd cisco-services
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

The server will run on the configured port (default is port 3000).

## Configuration

Server settings can be found in the `config.js` file.

## Configure the Phone

To configure your Cisco IP Phone, you should refer to the guide of your model.
For convenience I add the config for the 79XX models.
You should modify the provisioning configuration and add the url into the section serviceURL.

```xml
<device>
    <!-->Other config infos <-->
    <servicesURL>http://192.168.0.124:3000/Cisco/services.xml</servicesURL>
</device>
```

Make sure that the IP Phone and the server are on the same network.

## License

MIT