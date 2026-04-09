import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    console.log('\n========== MONGODB CONNECTION TEST ==========');
    console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
    console.log(`MONGO_URI is empty: ${!process.env.MONGO_URI}`);

    if (!process.env.MONGO_URI) {
        console.error('❌ CRITICAL: MONGO_URI is not set in .env file!');
        process.exit(1);
    }

    try {
        console.log('\n📡 Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');

        const dbName = mongoose.connection.db.name;
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📊 Database: ${dbName}`);
        console.log(`Collections: ${collections.map(c => c.name).join(', ')}`);

        // Check if users have tokens
        const User = mongoose.model('User', new mongoose.Schema({ expoPushToken: String }, { strict: false }));
        try {
            const usersWithTokens = await User.find({ expoPushToken: { $exists: true, $ne: null } }).countDocuments();
            console.log(`\n🔔 Users with registered push tokens: ${usersWithTokens}`);
        } catch (e) {
            console.log('\n(Could not query users for tokens)');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('\nPossible issues:');
        console.error('1. MONGO_URI is incorrect');
        console.error('2. MongoDB is not running on Hostinger');
        console.error('3. Network/firewall blocking connection');
        process.exit(1);
    }
}

testConnection();
