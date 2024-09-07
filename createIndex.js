const { MongoClient } = require('mongodb');

async function createIndex() {
    const uri = 'mongodb+srv://urban_synapse:urban_synapse6@sih1724.b1xy1.mongodb.net/interdepartmental-platform?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('interdepartmental-platform'); // Replace with your database name
        const collection = database.collection('users');

        await collection.createIndex({ email: 1 }, { unique: true });
        console.log('Unique index created on email field.');
    } catch (error) {
        console.error('Error creating index:', error);
    } finally {
        await client.close();
    }
}
createIndex();
