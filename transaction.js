




// // Create collections:
// db.getSiblingDB("mydb1").foo.insertOne(
//     { abc: 0 },
//     { writeConcern: { w: "majority", wtimeout: 2000 } }
// )
// db.getSiblingDB("mydb2").bar.insertOne(
//     { xyz: 0 },
//     { writeConcern: { w: "majority", wtimeout: 2000 } }
// )
// // Start a session.
// session = db.getMongo().startSession({ readPreference: { mode: "primary" } });
// coll1 = session.getDatabase("mydb1").foo;
// coll2 = session.getDatabase("mydb2").bar;
// // Start a transaction
// session.startTransaction({ readConcern: { level: "local" }, writeConcern: { w: "majority" } });
// // Operations inside the transaction
// try {
//     coll1.insertOne({ abc: 1 });
//     coll2.insertOne({ xyz: 999 });
// } catch (error) {
//     // Abort transaction on error
//     session.abortTransaction();
//     throw error;
// }
// // Commit the transaction using write concern set at transaction start
// session.commitTransaction();
// session.endSession();



const { MongoClient } = require('mongodb');

async function performTransaction() {
    const uri = 'mongodb+srv://raselsumon51:enPAmPa3oRxTsOCW@cluster0.nngte0p.mongodb.net/?retryWrites=true&w=majority';

    // For a replica set, include the replica set name and a seedlist of the members in the URI string; e.g.
    // const uri = 'mongodb://mongodb0.example.com:27017,mongodb1.example.com:27017/?replicaSet=myRepl'
    // For a sharded cluster, connect to the mongos instances; e.g.
    // const uri = 'mongodb://mongos0.example.com:27017,mongos1.example.com:27017/'

    const client = new MongoClient(uri);
    await client.connect();

    // Prereq: Create collections.

    await client
        .db('mydb1')
        .collection('foo')
        .insertOne({ abc: 880 }, { writeConcern: { w: 'majority' } });

    await client
        .db('mydb2')
        .collection('bar')
        .insertOne({ xyz: 383830 }, { writeConcern: { w: 'majority' } });

    // Step 1: Start a Client Session
    const session = client.startSession();

    // Step 2: Optional. Define options to use for the transaction
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
    // Note: The callback for withTransaction MUST be async and/or return a Promise.
    try {
        await session.withTransaction(async () => {
            const coll1 = client.db('mydb1').collection('foo');
            const coll2 = client.db('mydb2').collection('bar');

            // Important:: You must pass the session to the operations

            await coll1.insertOne({ abc: 1 }, { session });
            await coll2.insertOne({ xyz: 999 }, { session });
            // session.abortTransaction();
        }, transactionOptions);
    } finally {
        await session.endSession();
        await client.close();
    }
}

performTransaction().catch(console.error);


// 2

// const { MongoClient } = require('mongodb');

// async function performTransaction() {
//     const uri = 'mongodb://localhost:27017';
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//     let session; // Declare the session variable outside the try block

//     try {
//         await client.connect();
//         console.log('Connected to MongoDB');

//         session = client.startSession();
//         session.startTransaction();

//         const db = client.db('mydb');
//         const collection = db.collection('mycollection');

//         // Perform operations within the transaction
//         await collection.insertOne({ name: 'John', age: 30 });
//         await collection.updateOne({ name: 'Alice' }, { $set: { age: 25 } });

//         // Commit the transaction
//         await session.commitTransaction();
//         console.log('Transaction committed');

//     } catch (error) {
//         console.error('Error in transaction:', error);
//         // Abort the transaction if an error occurred
//         if (session) {
//             session.abortTransaction();
//         }
//     } finally {
//         if (session) {
//             session.endSession();
//         }
//         await client.close();
//         console.log('Connection closed');
//     }
// }

// performTransaction().catch(console.error);
