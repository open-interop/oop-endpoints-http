# oop-endpoints-http

This is the HTTP endpoint service for Open Interop.

This service is designed to consume rendered temprs and perform HTTP requests.

Templates for this endpoint type *must* contain the following keys:
```javascript
template: {
    headers: {"content-type": "application/json"},
    host: 'some.http.endpoint.com',
    path: "/posting/path",
    port: 3000,
    protocol: "http",
    requestMethod: 'POST',
    body: "{\"value\": 1}"
}
```

This will result in a post request to `http://some.endpoint.com:3000/posting/path` with content type `application/json` and post body `{"value": 1}`.

## Installation

- Ensure node is installed with version at least `10.16.2` LTS.
- Install `yarn` if necessary (`npm install -g yarn`).
- Run `yarn install` to install the node dependencies.
- Once everything is installed the service can be started with `yarn start`.

## Configuration

- `OOP_AMQP_ADDRESS`: The address of the AMQP messaging service.
- `OOP_EXCHANGE_NAME`: The message exchange for Open Interop.
- `OOP_ERROR_EXCHANGE_NAME`:  The exchange errors will be published to.
- `OOP_JSON_ERROR_Q`: The queue JSON decode messages will be published to.
- `OOP_ENDPOINTS_EXCHANGE_NAME`: The endpoints exchange.
- `OOP_ENDPOINT_Q`:  The basename for endpoint queues, this will be concatinated with the endpoint type to produce the final queue name. E.g. `oop.endpoints` goes to `oop.endpoints.http` for the HTTP service.
- `OOP_ENDPOINTS_HTTP_OUTPUT_Q`: The queue results will be published to.
- `OOP_REQUEST_TIMEOUT`: The timeout for HTTP requests made by this service.
- `OOP_ENDPOINTS_HTTP_MAX_RETRIES`: The max number of retries for HTTP requests made by this service.
- `OOP_CORE_RESPONSE_Q`: The core response message queue.

## Testing

`yarn test` to run the tests and generate a coverage report.

## Contributing

We welcome help from the community, please read the [Contributing guide](https://github.com/open-interop/oop-guidelines/blob/master/CONTRIBUTING.md) and [Community guidelines](https://github.com/open-interop/oop-guidelines/blob/master/CODE_OF_CONDUCT.md).

## License

Copyright (C) 2020 The Software for Health Foundation Limited <https://softwareforhealth.org/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
