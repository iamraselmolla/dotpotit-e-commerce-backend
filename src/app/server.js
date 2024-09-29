import mongoose from "mongoose";
import configs from "../configs/index.js";
import app from "./index.js";

process.on("uncaughtException", (err) => {
    console.log(err);
    process.exit(1);
});
let server;
async function boostrap() {
    try {
        await mongoose.connect(configs.databaseUrl);
        // loggerAction.logger.info(`🛢   Database is connected successfully`)
        console.log(`🛢   Database is connected successfully`);

        server = app.listen(configs.port, () => {
            // loggerAction.logger.info(`Application  listening on port ${config.port}`)
            console.log(`Application  listening on port ${configs.port}`);
        });
    } catch (err) {
        // loggerAction.Errorlogger.error('Failed to connect database', err)
        console.log("Failed to connect database", err);
    }
}
process.on("unhandledRejection", (error) => {
    console.log("Unhandle Error hoiche");
    if (server) {
        server.close(() => {
            // loggerAction.Errorlogger.error(error);
            console.log(error);
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});
boostrap();

process.on("SIGTERM", (err) => {
    // loggerAction.logger.info('SIGTERM is received')
    console.log("SIGTERM is received");
    if (server) {
        server.close();
    }
});

// create new branch for s-m-zubayer