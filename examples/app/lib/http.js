"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@ijstech/node");
const config_js_1 = __importDefault(require("../data/config.js"));
async function main() {
    const Options = {
        http: {
            port: 8088,
            router: {
                routes: [
                    {
                        baseUrl: '/app',
                        isolated: false,
                        methods: ['GET', 'POST'],
                        form: config_js_1.default.form,
                        params: {}
                    },
                    {
                        baseUrl: '/demo1',
                        isolated: false,
                        methods: ['GET'],
                        github: {
                            org: 'yc-wong',
                            repo: 'demo1',
                            token: ''
                        },
                        params: {}
                    },
                    {
                        baseUrl: '/hello',
                        methods: ['GET'],
                        scriptPath: './plugins/hello/index.js',
                        isolated: false,
                        params: {
                            isolated: 'false, running in node.js'
                        },
                        plugins: {
                            cache: {},
                            db: {
                                "db1": {
                                    mysql: config_js_1.default.mysql
                                }
                            },
                            queue: {
                                queues: ['job_queue_1'],
                                connection: {
                                    redis: config_js_1.default.redis
                                }
                            },
                            message: {
                                connection: {
                                    redis: config_js_1.default.redis
                                },
                                publish: ['msg_channel1']
                            }
                        },
                        dependencies: {
                            "@pack/demo": "file:../demoPack"
                        }
                    },
                    {
                        baseUrl: '/vm/hello',
                        methods: ['GET'],
                        scriptPath: './plugins/hello/index.js',
                        isolated: true,
                        params: {
                            isolated: 'true, running inside vm'
                        },
                        plugins: {
                            cache: {},
                            db: {
                                "db1": {
                                    mysql: config_js_1.default.mysql
                                }
                            },
                            queue: {
                                queues: ['job_queue_1'],
                                connection: {
                                    redis: config_js_1.default.redis
                                }
                            },
                            message: {
                                connection: {
                                    redis: config_js_1.default.redis
                                },
                                publish: ['msg_channel1']
                            }
                        },
                        dependencies: {
                            "@pack/demo": "file:../demoPack"
                        }
                    }
                ]
            }
        },
        queue: {
            workers: [
                {
                    connection: {
                        redis: config_js_1.default.redis
                    },
                    jobQueue: 'job_queue_1',
                    isolated: true,
                    scriptPath: './plugins/worker/index.js',
                    plugins: {
                        message: {
                            connection: {
                                redis: config_js_1.default.redis
                            },
                            subscribe: ['msg_channel1']
                        }
                    },
                    dependencies: {
                        "@pack/demo": "file:../demoPack"
                    }
                }
            ]
        }
    };
    let app = new node_1.AppServer(Options);
    app.start();
}
;
main();