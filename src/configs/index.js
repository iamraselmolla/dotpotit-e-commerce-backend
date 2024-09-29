import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DB;
const port = process.env.PORT;

const config = {
    databaseUrl,
    port
};

export default config;