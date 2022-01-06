'use strict';

const fs = require("fs/promises");
const sqlite = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const run = (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

const get = (db, sql) => {
    return new Promise((resolve, reject) => {
        db.get(sql, (err, row) => {
            if (err) reject(err);
            resolve(row);
        })
    });
}


const createDatabase = async () => {
    const db = new sqlite.Database(`tmp.sqlite`);

    await run(db,
        `
        CREATE TABLE IF NOT EXISTS test (
          column1 TEXT PRIMARY KEY NOT NULL,
          sqlite_version TEXT NOT NULL,
          column3 TEXT NOT NULL,
          column4 TEXT NOT NULL,
          column5 TEXT NOT NULL
        );
    `);

    await run(db,
        `
        CREATE INDEX IF NOT EXISTS index1 ON test (
            column3
        );
    `);

    return db;
}

const selectDatabaseVersion = async (db) => {
    const object = await get(db, `SELECT sqlite_version() as version;`);
    return object.version
}

const insertData = async (db, dataCounts, version) => {
    const sqlite_version = version;
    const column4 = `${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}`;
    const column5 = `${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}`;
    const getRow = () => {
        return `("${uuidv4()}","${sqlite_version}","${uuidv4()}","${column4}","${column5}")`
    }

    let count = dataCounts;
    let loopCount = 0;
    while (0 < count) {
        let values = '';
        for (let i = 0; i < 10000 && 0 < count; i++, count--) {

            if (0 < i) { values += ',';}
            values += getRow();

            loopCount++;
            console.log(`${loopCount} / ${dataCounts}`);
        }
        values += ';'

        await run(
            db,
            `INSERT INTO test VALUES ${values}`
        );
    }
}

const close = async (db) => {
    await run(db, `vacuum;`);

    return new Promise((resolve, reject) => {
        db.close(err => {
            if (err) reject(err);
            resolve();
        });
    });

}

const main = async () => {
    const dataCounts = parseInt(process.argv[2], 10);
    if (isNaN(dataCounts) || dataCounts < 1 || 10000000 < dataCounts) {
        console.warn('データ件数の引数値は、1以上、10000000以下で入力してください')
        process.exit(1)
    }

    try {
        const db = await createDatabase();
        const version = await selectDatabaseVersion(db);
        await insertData(db, dataCounts, version);
        await close(db)
        await fs.rename('tmp.sqlite', `${version}-${dataCounts}.sqlite`);
    } catch (e) {
        console.error(e);
    } finally {
    }

}

main();
