import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      search,
      category,
      type,
      accountId,
      startDate,
      endDate,
      page = 1,
      limit = 15,
      sortBy = 'transactionDate',
      sortOrder = 'desc',
    } = req.query;

    const query = { userId };

    if (type && ['income', 'expense', 'transfer'].includes(type)) {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (accountId) {
      query.accountId = accountId;
    }

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { merchant: searchRegex },
        { notes: searchRegex },
        { category: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build sort object safely
    const allowedSortFields = ['transactionDate', 'amount', 'title', 'category', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'transactionDate';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('accountId', 'name type');

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      type,
      amount,
      title,
      category,
      merchant = '',
      accountId,
      toAccountId,
      paymentMethod = 'UPI',
      transactionDate = new Date(),
      notes = '',
      tags = [],
    } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0.',
      });
    }

    if (!title || !category || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and transaction type are required.',
      });
    }

    // Resolve default account if not explicitly passed
    let primaryAccount = null;
    if (accountId) {
      primaryAccount = await Account.findOne({ _id: accountId, userId });
    }
    if (!primaryAccount && paymentMethod === 'Credit Card') {
      primaryAccount = await Account.findOne({ userId, type: 'credit' });
      if (!primaryAccount) {
        primaryAccount = await Account.create({
          userId,
          name: 'Platinum Credit Card',
          type: 'credit',
          balance: 0,
          currency: req.user.preferredCurrency || 'INR',
          institution: 'Credit Card Account',
          accountNumberLast4: '4192',
          isDefault: false,
        });
      }
    }
    if (!primaryAccount) {
      primaryAccount = await Account.findOne({ userId, isDefault: true }) || await Account.findOne({ userId });
    }

    const transaction = await Transaction.create({
      userId,
      type,
      amount: numAmount,
      currency: req.user.preferredCurrency || 'INR',
      title,
      merchant,
      category,
      accountId: primaryAccount ? primaryAccount._id : null,
      toAccountId: type === 'transfer' ? toAccountId : null,
      paymentMethod,
      transactionDate: new Date(transactionDate),
      notes,
      tags,
    });

    // Update account balances
    if (primaryAccount) {
      if (type === 'income') {
        primaryAccount.balance += numAmount;
      } else if (type === 'expense') {
        primaryAccount.balance -= numAmount;
      } else if (type === 'transfer') {
        primaryAccount.balance -= numAmount;
        if (toAccountId) {
          const destAccount = await Account.findOne({ _id: toAccountId, userId });
          if (destAccount) {
            destAccount.balance += numAmount;
            await destAccount.save();
          }
        }
      }
      await primaryAccount.save();
    }

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('accountId', 'name type');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const transaction = await Transaction.findOne({ _id: req.params.id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    const { title, merchant, category, amount, paymentMethod, transactionDate, notes, type } = req.body;

    // Revert old balance effect on account
    if (transaction.accountId && transaction.amount) {
      const oldAccount = await Account.findOne({ _id: transaction.accountId, userId });
      if (oldAccount) {
        if (transaction.type === 'income') oldAccount.balance -= transaction.amount;
        else if (transaction.type === 'expense') oldAccount.balance += transaction.amount;
        await oldAccount.save();
      }
    }

    // Apply updates
    if (title) transaction.title = title;
    if (merchant !== undefined) transaction.merchant = merchant;
    if (category) transaction.category = category;
    if (amount) transaction.amount = Number(amount);
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (transactionDate) transaction.transactionDate = new Date(transactionDate);
    if (notes !== undefined) transaction.notes = notes;
    if (type) transaction.type = type;

    await transaction.save();

    // Apply new balance effect
    if (transaction.accountId && transaction.amount) {
      const account = await Account.findOne({ _id: transaction.accountId, userId });
      if (account) {
        if (transaction.type === 'income') account.balance += transaction.amount;
        else if (transaction.type === 'expense') account.balance -= transaction.amount;
        await account.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const transaction = await Transaction.findOne({ _id: req.params.id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    // Revert account balance
    if (transaction.accountId) {
      const account = await Account.findOne({ _id: transaction.accountId, userId });
      if (account) {
        if (transaction.type === 'income') account.balance -= transaction.amount;
        else if (transaction.type === 'expense') account.balance += transaction.amount;
        await account.save();
      }
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const exportTransactionsCsv = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, type, startDate, endDate } = req.query;

    const query = { userId };
    if (type) query.type = type;
    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ transactionDate: -1 });

    // Build CSV with safe escaping
    const headers = ['Date', 'Type', 'Category', 'Merchant', 'Title', 'Amount', 'Currency', 'Payment Method', 'Notes'];
    const rows = transactions.map((t) => [
      new Date(t.transactionDate).toISOString().split('T')[0],
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      t.currency,
      t.paymentMethod || 'UPI',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="finflow-ledger-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
