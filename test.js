Namespace {
    _events: [Object: null prototype] {
        connection: [Function]
    },
    _eventsCount: 1,
    _maxListeners: undefined,
    sockets: Map {
        'S_QN5DTu0vbVWk2RAAAB' => Socket {
            _events: [Object: null prototype],
            _eventsCount: 4,
            _maxListeners: undefined,
            nsp: [Circular],
            client: [Client],
            acks: Map {},
            fns: [],
            flags: {},
            _rooms: Set {},
            server: [Server],
            adapter: [Adapter],
            id: 'S_QN5DTu0vbVWk2RAAAB',
            connected: true,
            disconnected: false,
            handshake: [Object],
            remoteAddress: '::1',
            remotePort: 4173,
      [Symbol(kCapture)]: false
        },
        '3pcvhrzERD54r-_vAAAD' => Socket {
            _events: [Object: null prototype],
            _eventsCount: 4,
            _maxListeners: undefined,
            nsp: [Circular],
            client: [Client],
            acks: Map {},
            fns: [],
            flags: {},
            _rooms: Set {},
            server: [Server],
            adapter: [Adapter],
            id: '3pcvhrzERD54r-_vAAAD',
            connected: true,
            disconnected: false,
            handshake: [Object],
            remoteAddress: '::1',
            remotePort: 4178,
            login_id: 'test01',
      [Symbol(kCapture)]: false
        }
    },
    _fns: [],
    _rooms: Set {},
    _flags: {},
    _ids: 0,
    server: Server {
        _events: [Object: null prototype] {},
        _eventsCount: 0,
        _maxListeners: undefined,
        _nsps: Map {
            '/' => [Circular]
        },
        parentNsps: Map {},
        _path: '/socket.io',
        clientPathRegex: /^\/socket\.io\/socket\.io(\.min|\.msgpack\.min)?\.js(\.map)?$/,
        _connectTimeout: 45000,
        _serveClient: true,
        _parser: {
            protocol: 5,
            PacketType: [Object],
            Encoder: [class Encoder],
            Decoder: [class Decoder extends Emitter]
        },
        encoder: Encoder {},
        _adapter: [class Adapter extends EventEmitter],
        sockets: [Circular],
        opts: {},
        eio: Server {
            _events: [Object: null prototype],
            _eventsCount: 1,
            _maxListeners: undefined,
            clients: [Object],
            clientsCount: 2,
            opts: [Object],
            ws: [WebSocketServer],
      [Symbol(kCapture)]: false
        },
        httpServer: Server {
            insecureHTTPParser: undefined,
            _events: [Object: null prototype],
            _eventsCount: 5,
            _maxListeners: undefined,
            _connections: 5,
            _handle: [TCP],
            _usingWorkers: false,
            _workers: [],
            _unref: false,
            allowHalfOpen: true,
            pauseOnConnect: false,
            httpAllowHalfOpen: false,
            timeout: 120000,
            keepAliveTimeout: 5000,
            maxHeadersCount: null,
            headersTimeout: 60000,
            _connectionKey: '6::::3701',
      [Symbol(IncomingMessage)]: [Function: IncomingMessage],
      [Symbol(ServerResponse)]: [Function: ServerResponse],
      [Symbol(kCapture)]: false,
      [Symbol(asyncId)]: 7
        },
        engine: Server {
            _events: [Object: null prototype],
            _eventsCount: 1,
            _maxListeners: undefined,
            clients: [Object],
            clientsCount: 2,
            opts: [Object],
            ws: [WebSocketServer],
      [Symbol(kCapture)]: false
        },
    [Symbol(kCapture)]: false
    },
    name: '/',
    adapter: Adapter {
        _events: [Object: null prototype] {},
        _eventsCount: 0,
        _maxListeners: undefined,
        nsp: [Circular],
        rooms: Map {
            'S_QN5DTu0vbVWk2RAAAB' => [Set],
            '3pcvhrzERD54r-_vAAAD' => [Set],
            'meeting01' => [Set]
        },
        sids: Map {
            'S_QN5DTu0vbVWk2RAAAB' => [Set],
            '3pcvhrzERD54r-_vAAAD' => [Set]
        },
        encoder: Encoder {},
    [Symbol(kCapture)]: false
    },
  [Symbol(kCapture)]: false
}









Map {
    'fc5bNNVtGZOkM93-AAAC' => Socket {
        _events: [Object: null prototype] {
            message: [Function],
            login: [Function],
            logout: [Function],
            room: [Function]
        },
        _eventsCount: 4,
        _maxListeners: undefined,
        nsp: Namespace {
            _events: [Object: null prototype],
            _eventsCount: 1,
            _maxListeners: undefined,
            sockets: [Circular],
            _fns: [],
            _rooms: Set {},
            _flags: {},
            _ids: 0,
            server: [Server],
            name: '/',
            adapter: [Adapter],
      [Symbol(kCapture)]: false
        },
        client: Client {
            sockets: [Map],
            nsps: [Map],
            server: [Server],
            conn: [Socket],
            encoder: Encoder {},
            decoder: [Decoder],
            id: 'GXXlQpcENwrns6NfAAAA',
            onclose: [Function: bound onclose],
            ondata: [Function: bound ondata],
            onerror: [Function: bound onerror],
            ondecoded: [Function: bound ondecoded],
            connectTimeout: null
        },
        acks: Map {},
        fns: [],
        flags: {},
        _rooms: Set {},
        server: Server {
            _events: [Object: null prototype] {},
            _eventsCount: 0,
            _maxListeners: undefined,
            _nsps: [Map],
            parentNsps: Map {},
            _path: '/socket.io',
            clientPathRegex: /^\/socket\.io\/socket\.io(\.min|\.msgpack\.min)?\.js(\.map)?$/,
            _connectTimeout: 45000,
            _serveClient: true,
            _parser: [Object],
            encoder: Encoder {},
            _adapter: [class Adapter extends EventEmitter],
            sockets: [Namespace],
            opts: {},
            eio: [Server],
            httpServer: [Server],
            engine: [Server],
      [Symbol(kCapture)]: false
        },
        adapter: Adapter {
            _events: [Object: null prototype] {},
            _eventsCount: 0,
            _maxListeners: undefined,
            nsp: [Namespace],
            rooms: [Map],
            sids: [Map],
            encoder: Encoder {},
      [Symbol(kCapture)]: false
        },
        id: 'fc5bNNVtGZOkM93-AAAC',
        connected: true,
        disconnected: false,
        handshake: {
            headers: [Object],
            time: 'Thu Dec 24 2020 00:52:01 GMT+0900 (GMT+09:00)',
            address: '::ffff:127.0.0.1',
            xdomain: false,
            secure: false,
            issued: 1608738721110,
            url: '/socket.io/?EIO=4&transport=polling&t=NQGJCk7',
            query: [Object: null prototype],
            auth: {}
        },
        remoteAddress: '::ffff:127.0.0.1',
        remotePort: 4222,
        login_id: 'test01',
    [Symbol(kCapture)]: false
    },
    'RmfHSuEoiNirpSneAAAD' => Socket {
        _events: [Object: null prototype] {
            message: [Function],
            login: [Function],
            logout: [Function],
            room: [Function]
        },
        _eventsCount: 4,
        _maxListeners: undefined,
        nsp: Namespace {
            _events: [Object: null prototype],
            _eventsCount: 1,
            _maxListeners: undefined,
            sockets: [Circular],
            _fns: [],
            _rooms: Set {},
            _flags: {},
            _ids: 0,
            server: [Server],
            name: '/',
            adapter: [Adapter],
      [Symbol(kCapture)]: false
        },
        client: Client {
            sockets: [Map],
            nsps: [Map],
            server: [Server],
            conn: [Socket],
            encoder: Encoder {},
            decoder: [Decoder],
            id: '7B-yPC4AO1-qY9YIAAAB',
            onclose: [Function: bound onclose],
            ondata: [Function: bound ondata],
            onerror: [Function: bound onerror],
            ondecoded: [Function: bound ondecoded],
            connectTimeout: null
        },
        acks: Map {},
        fns: [],
        flags: {},
        _rooms: Set {},
        server: Server {
            _events: [Object: null prototype] {},
            _eventsCount: 0,
            _maxListeners: undefined,
            _nsps: [Map],
            parentNsps: Map {},
            _path: '/socket.io',
            clientPathRegex: /^\/socket\.io\/socket\.io(\.min|\.msgpack\.min)?\.js(\.map)?$/,
            _connectTimeout: 45000,
            _serveClient: true,
            _parser: [Object],
            encoder: Encoder {},
            _adapter: [class Adapter extends EventEmitter],
            sockets: [Namespace],
            opts: {},
            eio: [Server],
            httpServer: [Server],
            engine: [Server],
      [Symbol(kCapture)]: false
        },
        adapter: Adapter {
            _events: [Object: null prototype] {},
            _eventsCount: 0,
            _maxListeners: undefined,
            nsp: [Namespace],
            rooms: [Map],
            sids: [Map],
            encoder: Encoder {},
      [Symbol(kCapture)]: false
        },
        id: 'RmfHSuEoiNirpSneAAAD',
        connected: true,
        disconnected: false,
        handshake: {
            headers: [Object],
            time: 'Thu Dec 24 2020 00:52:01 GMT+0900 (GMT+09:00)',
            address: '::ffff:127.0.0.1',
            xdomain: false,
            secure: false,
            issued: 1608738721119,
            url: '/socket.io/?EIO=4&transport=polling&t=NQGJCmF',
            query: [Object: null prototype],
            auth: {}
        },
        remoteAddress: '::ffff:127.0.0.1',
        remotePort: 4222,
    [Symbol(kCapture)]: false
    }
}
