import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { exportTransactionsCsv } from '../src/controllers/transactionController.js';
import Transaction from '../src/models/Transaction.js';

describe('Transaction CSV Export Controller', () => {
  test('exportTransactionsCsv safely generates valid CSV with correct headers and escaping', async () => {
    const mockTransactions = [
      {
        transactionDate: new Date('2026-03-15T10:30:00Z'),
        type: 'expense',
        category: 'Food & Dining',
        merchant: 'Cafe "Special"',
        title: 'Lunch with team',
        amount: 450.5,
        currency: 'INR',
        paymentMethod: 'UPI',
        notes: 'Coffee and snacks\nShared with Alice',
      },
      {
        transactionDate: null, // Test null/missing date
        type: 'income',
        category: 'Salary',
        merchant: '',
        title: 'Freelance payment',
        amount: 15000,
        currency: 'INR',
        paymentMethod: 'Net Banking',
        notes: '',
      },
    ];

    // Mock Transaction.find to return our sample transactions
    const originalFind = Transaction.find;
    let capturedQuery = null;
    Transaction.find = (query) => {
      capturedQuery = query;
      return {
        sort: () => Promise.resolve(mockTransactions),
      };
    };

    try {
      let responseHeaders = {};
      let statusCode = null;
      let sentBody = null;

      const req = {
        user: { _id: 'user123' },
        query: {
          category: 'Food & Dining',
          type: 'expense',
          search: 'team',
        },
      };

      const res = {
        setHeader: (name, value) => {
          responseHeaders[name] = value;
        },
        status: (code) => {
          statusCode = code;
          return {
            send: (body) => {
              sentBody = body;
            },
          };
        },
      };

      await exportTransactionsCsv(req, res, (err) => {
        if (err) throw err;
      });

      assert.equal(statusCode, 200);
      assert.equal(responseHeaders['Content-Type'], 'text/csv; charset=utf-8');
      assert.match(responseHeaders['Content-Disposition'], /^attachment; filename="finflow-ledger-\d+\.csv"$/);

      // Verify captured query received the filters
      assert.equal(capturedQuery.userId, 'user123');
      assert.equal(capturedQuery.type, 'expense');
      assert.equal(capturedQuery.category, 'Food & Dining');
      assert.ok(capturedQuery.$or, 'Expected $or clause for search');

      // Verify CSV contents
      const lines = sentBody.split('\n');
      assert.equal(lines[0], 'Date,Type,Category,Merchant,Title,Amount,Currency,Payment Method,Notes');

      // First row: check escaped quote in merchant and cleaned newline in notes
      assert.ok(lines[1].includes('2026-03-15'));
      assert.ok(lines[1].includes('"Cafe ""Special"""'));
      assert.ok(lines[1].includes('450.5'));
      assert.ok(lines[1].includes('"Coffee and snacks Shared with Alice"'));

      // Second row: check null date handled gracefully without throwing
      assert.ok(lines[2].startsWith(',')); // Empty date followed by comma
      assert.ok(lines[2].includes('15000'));
    } finally {
      Transaction.find = originalFind;
    }
  });
});

