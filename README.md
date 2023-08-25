# Bitroot-backend
Assignment of Contact-list manager app using node js

Created  partial project funtionality implementation in node js

code is running but unable to connect mysql db gives below error - 

PS F:\BitRoot\contactlist> node index.js
Server is running on port 3000
Database connection error: Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client
    at Sequence._packetToError (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\sequences\Sequence.js:47:14)
    at Handshake.ErrorPacket (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\sequences\Handshake.js:123:18)
    at Protocol._parsePacket (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\Protocol.js:291:23)
    at Parser._parsePacket (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\Parser.js:433:10)
    at Parser.write (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\Parser.js:43:10)
    at Protocol.write (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\Protocol.js:38:16)
    at Socket.<anonymous> (F:\BitRoot\contactlist\node_modules\mysql\lib\Connection.js:88:28)
    at Socket.<anonymous> (F:\BitRoot\contactlist\node_modules\mysql\lib\Connection.js:526:10)
    at Socket.emit (node:events:514:28)
    at addChunk (node:internal/streams/readable:343:12)
    --------------------
    at Protocol._enqueue (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\Protocol.js:144:48)
    at Protocol.handshake (F:\BitRoot\contactlist\node_modules\mysql\lib\protocol\Protocol.js:51:23)
    at Connection.connect (F:\BitRoot\contactlist\node_modules\mysql\lib\Connection.js:116:18)
    at Object.<anonymous> (F:\BitRoot\contactlist\index.js:17:4)
    at Module._compile (node:internal/modules/cjs/loader:1233:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1287:10)
    at Module.load (node:internal/modules/cjs/loader:1091:32)
    at Module._load (node:internal/modules/cjs/loader:938:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:83:12)
    at node:internal/main/run_main_module:23:47 {
  code: 'ER_NOT_SUPPORTED_AUTH_MODE',
  errno: 1251,
  sqlMessage: 'Client does not support authentication protocol requested by server; consider upgrading MySQL client',
  sqlState: '08004',
  fatal: true
}
