import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

// Fix Windows Node DNS SRV lookup for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in restricted environments
}

dotenv.config({ path: './.env' });

import User from '../src/models/User.js';
import Account from '../src/models/Account.js';
import Transaction from '../src/models/Transaction.js';
import Budget from '../src/models/Budget.js';
import SavingsGoal from '../src/models/SavingsGoal.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finflow';

async function seedData() {
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri.split('@')[1] ? 'cluster: ' + mongoUri.split('@')[1] : mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected successfully. Seeding FinFlow demo records...');

    const demoEmail = 'rajiv@finflow.io';

    // Remove existing demo user and related items to prevent duplicate records
    const existing = await User.findOne({ email: demoEmail });
    if (existing) {
      console.log('Cleaning up previous demo records for Rajiv Sharma...');
      await Transaction.deleteMany({ userId: existing._id });
      await Budget.deleteMany({ userId: existing._id });
      await SavingsGoal.deleteMany({ userId: existing._id });
      await Account.deleteMany({ userId: existing._id });
      await User.deleteOne({ _id: existing._id });
    }

    // 1. Create Demo User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      name: 'Rajiv Sharma',
      email: demoEmail,
      mobileNumber: '+919876543210',
      mobileVerified: true,
      passwordHash,
      preferredCurrency: 'INR',
      themePreference: 'dark',
      defaultDateRange: '30d',
      isDemoUser: true,
    });
    console.log(`Created demo user: ${demoUser.name} (${demoUser.email}, ${demoUser.mobileNumber})`);

    // 2. Create Accounts
    const checkingAccount = await Account.create({
      userId: demoUser._id,
      name: 'Primary Checking',
      type: 'bank',
      balance: 45300.12,
      currency: 'INR',
      institution: 'HDFC Wealth Reserve',
      accountNumberLast4: '8492',
      isDefault: true,
      color: '#E07A5F',
    });

    const savingsAccount = await Account.create({
      userId: demoUser._id,
      name: 'High-Yield Vault',
      type: 'savings',
      balance: 14750.00,
      currency: 'INR',
      institution: 'FinFlow High-Yield',
      accountNumberLast4: '3910',
      isDefault: false,
      color: '#C86A78',
    });

    const creditCard = await Account.create({
      userId: demoUser._id,
      name: 'Black Reserve Credit Card',
      type: 'credit',
      balance: -2100.50,
      currency: 'INR',
      institution: 'Amex Reserve',
      accountNumberLast4: '1104',
      isDefault: false,
      color: '#9F394F',
    });

    console.log('Created 3 demo accounts (Checking, Vault, Credit Card).');

    // 3. Create Sample Transactions spanning 6 months
    const now = new Date();
    const transactions = [];

    // Monthly Salary (6 months)
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      transactions.push({
        userId: demoUser._id,
        type: 'income',
        amount: 85000,
        currency: 'INR',
        title: 'Monthly Tech Leadership Salary',
        merchant: 'Stitch Labs Inc.',
        category: 'Salary',
        accountId: checkingAccount._id,
        paymentMethod: 'Wire',
        transactionDate: d,
        status: 'completed',
        notes: 'Monthly direct deposit salary',
      });
    }

    // Historical and Recent Expenses
    const sampleExpenses = [
      { title: 'Starbucks Reserve Coffee', merchant: 'Starbucks Coffee', category: 'Food & Dining', amount: 480, paymentMethod: 'UPI', daysAgo: 1 },
      { title: 'KFC Chicken & Dinner', merchant: 'KFC Express', category: 'Food & Dining', amount: 950, paymentMethod: 'Credit Card', daysAgo: 2 },
      { title: 'Electricity & High-Speed Utilities', merchant: 'Tata Power', category: 'Utilities', amount: 2450, paymentMethod: 'UPI', daysAgo: 3 },
      { title: 'Airtel Black Fiber Bill', merchant: 'Airtel Broadband', category: 'Utilities', amount: 1199, paymentMethod: 'Net Banking', daysAgo: 5 },
      { title: 'Leather Messenger Bag & T-shirt', merchant: 'Zara Men', category: 'Shopping', amount: 6499, paymentMethod: 'Credit Card', daysAgo: 6 },
      { title: 'Formal Shirts & Trousers', merchant: 'Marks & Spencer', category: 'Shopping', amount: 4200, paymentMethod: 'Credit Card', daysAgo: 8 },
      { title: 'Weekly Groceries & Organic Produce', merchant: 'Nature Basket', category: 'Food & Dining', amount: 3850, paymentMethod: 'Debit Card', daysAgo: 10 },
      { title: 'Uber Premier Office Commute', merchant: 'Uber India', category: 'Transportation', amount: 620, paymentMethod: 'UPI', daysAgo: 12 },
      { title: 'Cult.Fit Gym Membership Renewal', merchant: 'Cult Pass Pro', category: 'Healthcare', amount: 7500, paymentMethod: 'Credit Card', daysAgo: 15 },
      { title: 'Apartment Maintenance & Water', merchant: 'Prestige Sanctuary HOA', category: 'Housing & Rent', amount: 8200, paymentMethod: 'Net Banking', daysAgo: 18 },
      { title: 'Spotify & Netflix Premium', merchant: 'Digital Subscriptions', category: 'Entertainment', amount: 1149, paymentMethod: 'Credit Card', daysAgo: 20 },
      { title: 'IndiGo Flight Tickets', merchant: 'IndiGo Airlines', category: 'Travel', amount: 9400, paymentMethod: 'Credit Card', daysAgo: 24 },
      // Prior month expenses
      { title: 'Previous Month Rent Allocation', merchant: 'Landlord Transfer', category: 'Housing & Rent', amount: 28000, paymentMethod: 'Net Banking', daysAgo: 38 },
      { title: 'Apple Studio Display Installment', merchant: 'Apple Store BKC', category: 'Shopping', amount: 12000, paymentMethod: 'Credit Card', daysAgo: 45 },
      { title: 'Fine Dining at The Table', merchant: 'The Table Colaba', category: 'Food & Dining', amount: 5600, paymentMethod: 'Credit Card', daysAgo: 50 },
    ];

    for (const exp of sampleExpenses) {
      const date = new Date(now);
      date.setDate(date.getDate() - exp.daysAgo);
      transactions.push({
        userId: demoUser._id,
        type: 'expense',
        amount: exp.amount,
        currency: 'INR',
        title: exp.title,
        merchant: exp.merchant,
        category: exp.category,
        accountId: exp.paymentMethod === 'Credit Card' ? creditCard._id : checkingAccount._id,
        paymentMethod: exp.paymentMethod,
        transactionDate: date,
        status: 'completed',
        notes: `Verified expense at ${exp.merchant}`,
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`Inserted ${transactions.length} demo transactions.`);

    // 4. Create Budgets
    await Budget.create([
      {
        userId: demoUser._id,
        name: 'Food & Dining Limit',
        category: 'Food & Dining',
        limitAmount: 15000,
        currency: 'INR',
        period: 'monthly',
        alertThreshold: 80,
      },
      {
        userId: demoUser._id,
        name: 'Shopping & Apparel',
        category: 'Shopping',
        limitAmount: 18000,
        currency: 'INR',
        period: 'monthly',
        alertThreshold: 75,
      },
      {
        userId: demoUser._id,
        name: 'Monthly Utilities & Internet',
        category: 'Utilities',
        limitAmount: 6000,
        currency: 'INR',
        period: 'monthly',
        alertThreshold: 85,
      },
      {
        userId: demoUser._id,
        name: 'Entertainment & Leisure',
        category: 'Entertainment',
        limitAmount: 5000,
        currency: 'INR',
        period: 'monthly',
        alertThreshold: 80,
      },
    ]);
    console.log('Created 4 demo budget envelopes.');

    // 5. Create Savings Goals
    const targetDate1 = new Date();
    targetDate1.setMonth(targetDate1.getMonth() + 8);

    const targetDate2 = new Date();
    targetDate2.setMonth(targetDate2.getMonth() + 14);

    await SavingsGoal.create([
      {
        userId: demoUser._id,
        title: 'Emergency Reserve Vault',
        targetAmount: 250000,
        currentAmount: 162500,
        currency: 'INR',
        targetDate: targetDate1,
        category: 'Emergency',
        color: '#E07A5F',
        status: 'in_progress',
        contributions: [
          { amount: 100000, note: 'Initial allocation', date: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
          { amount: 62500, note: 'Monthly surplus contribution', date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
        ],
      },
      {
        userId: demoUser._id,
        title: 'Japan Autumn Discovery Trip',
        targetAmount: 180000,
        currentAmount: 72000,
        currency: 'INR',
        targetDate: targetDate2,
        category: 'Travel',
        color: '#C86A78',
        status: 'in_progress',
        contributions: [
          { amount: 50000, note: 'Bonus allocation', date: new Date(now.getFullYear(), now.getMonth() - 2, 20) },
          { amount: 22000, note: 'Travel envelope transfer', date: new Date(now.getFullYear(), now.getMonth() - 1, 10) },
        ],
      },
      {
        userId: demoUser._id,
        title: 'High-Performance EV Downpayment',
        targetAmount: 500000,
        currentAmount: 185000,
        currency: 'INR',
        targetDate: new Date(now.getFullYear() + 1, now.getMonth() + 6, 1),
        category: 'Vehicle',
        color: '#F39C12',
        status: 'in_progress',
        contributions: [
          { amount: 185000, note: 'Automotive fund transfer', date: new Date(now.getFullYear(), now.getMonth() - 1, 1) },
        ],
      },
    ]);
    console.log('Created 3 demo savings goals.');

    console.log('\n=============================================================');
    console.log('Demo Seeding Completed Successfully on MongoDB Cloud!');
    console.log(`Demo Credentials:`);
    console.log(`  Email:    rajiv@finflow.io`);
    console.log(`  Password: password123`);
    console.log('=============================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
}

seedData();
