define("index", ["require", "exports", "@pack/demo"], function (require, exports, demo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {
        constructor() {
            this.count = 0;
        }
        async process(session, data) {
            try {
                let demo = new demo_1.Demo();
                this.count++;
                console.dir('message from worker');
                return {
                    msg: demo.hello(),
                    data: data,
                    count: this.count
                };
            }
            catch (err) {
                console.dir(err.message);
            }
        }
        message(session, channel, msg) {
            console.dir('message received inside worker: ' + channel + ' ' + msg);
        }
        ;
    }
    exports.default = Worker;
});