'use strict';

const Realm = require('realm');
const { v4: uuidv4 } = require('uuid');

const createDatabase = () => {
    const db = new Realm({
        path: `tmp.realm`,
        schema: [
            {
                name: 'test',
                primaryKey: 'column1',
                properties: {
                    column1: {type: 'string'},
                    column2: {type: 'string'},
                    column3: {type: 'string', indexed: true},
                    column4: {type: 'string'},
                    column5: {type: 'string'}
                }
            }
        ],
        schemaVersion: 1
    });

    return db;
}

const insertData = async (db, dataCounts) => {
    const column4 = `${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}`;
    const column5 = `${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}`;
    await db.write(() => {
        for (let i = 0; i < dataCounts; i++) {
            console.log(`${i + 1} / ${dataCounts}`)
            db.create('test',{
                column1: uuidv4(),
                column2: '0.0.0',
                column3: uuidv4(),
                column4: column4,
                column5:column5
            });
        }
    });
}

const close = (db) => {
    db.close();
}

const main = async () => {
    const dataCounts = parseInt(process.argv[2], 10);
    if (isNaN(dataCounts) || dataCounts < 1 || 10000000 < dataCounts) {
        console.warn('データ件数の引数値は、1以上、10000000以下で入力してください')
        process.exit(1)
    }

    try {
        const db = createDatabase();
        await insertData(db, dataCounts);
        db.writeCopyTo(`optimization-${dataCounts}.realm`)
        console.log('end');
        close(db)
    } catch (e) {
        console.error(e);
    } finally {
    }

}

main();
