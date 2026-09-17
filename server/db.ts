import mariadb from 'mariadb';

const required = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
};

const port = Number(process.env.DB_PORT ?? '3306');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('DB_PORT must be a valid TCP port');

export const db = mariadb.createPool({
    host: required('DB_HOST'),
    port,
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    connectionLimit: 5,
    connectTimeout: 5000,
});