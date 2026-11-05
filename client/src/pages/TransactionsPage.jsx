import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Loader2,
} from 'lucide-react';
import { transactionApi } from '../api/transactionApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import useDebounce from '../hooks/useDebounce.js';

export const TransactionsPage = () => {
  const { currency } = useAuth();
  const { refreshTrigger } = useOutletContext() || {};

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getTransactions({
        search: debouncedSearch,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sortBy,
        sortOrder,
        page,
        limit: 12,
      });

      if (res.success) {
        setTransactions(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalRecords(res.pagination?.total || 0);
      }
    } catch (err) {
      console.warn('Failed to load transactions:', err.message);
      setTransactions([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, categoryFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await transactionApi.deleteTransaction(id);
      fetchTransactions();
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.message || 'Error deleting transaction');
    }
  };

  const handleExportCsv = async () => {
    if (exporting) return;
    try {
      setExporting(true);
      const blobData = await transactionApi.exportTransactionsCsv({
        search: debouncedSearch || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });

      const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `finflow-ledger-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export transactions CSV:', err);
      let errorMsg = err.message || 'Failed to export CSV. Please try again.';
      if (err.data instanceof Blob) {
        try {
          const text = await err.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) errorMsg = parsed.message;
        } catch (_) {}
      }
      alert(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  const categories = [
    'All Categories',
    'Food & Dining',
    'Housing & Rent',
    'Transportation',
    'Shopping',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Travel',
    'Salary',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-fin-text tracking-tight">
            Financial Ledger & Transactions
          </h1>
          <p className="text-xs text-fin-text-muted mt-0.5">
            Audit, categorize, and filter your monetary activities ({totalRecords} records total)
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fin-card border border-fin-border hover:border-fin-accent text-fin-text text-xs font-semibold shadow-sm transition-all active:scale-95 self-start sm:self-auto disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 text-fin-accent animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-fin-accent" />
          )}
          <span>{exporting ? 'Exporting...' : 'Export Ledger (CSV)'}</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="fin-glass-card rounded-3xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
            <input
              type="text"
              placeholder="Search by title, merchant, or notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text placeholder-fin-text-muted focus:border-fin-accent transition-all"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-fin-card-secondary rounded-2xl border border-fin-border overflow-x-auto">
            {['all', 'expense', 'income', 'transfer'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                  typeFilter === t
                    ? 'bg-fin-accent text-white shadow-sm'
                    : 'text-fin-text-secondary hover:text-fin-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value === 'All Categories' ? 'all' : e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent cursor-pointer shrink-0"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-fin-card text-fin-text">
                {c}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3.5 py-2 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent cursor-pointer shrink-0"
          >
            <option value="transactionDate-desc" className="bg-fin-card">Date: Newest First</option>
            <option value="transactionDate-asc" className="bg-fin-card">Date: Oldest First</option>
            <option value="amount-desc" className="bg-fin-card">Amount: Highest First</option>
            <option value="amount-asc" className="bg-fin-card">Amount: Lowest First</option>
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="fin-glass-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-fin-text-muted">
            Loading ledger records...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-fin-text-muted text-xs space-y-2">
            <Receipt className="w-8 h-8 mx-auto opacity-40 text-fin-accent" />
            <p className="font-semibold text-fin-text">No matching records found</p>
            <p>Try resetting your search query or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-fin-border bg-fin-card-secondary/50 text-[11px] font-bold text-fin-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Transaction</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fin-border/40 text-xs">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-fin-card-secondary/30 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isIncome
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : isTransfer
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                : 'bg-fin-card-secondary text-fin-text-secondary border-fin-border'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : isTransfer ? (
                              <ArrowLeftRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-fin-text">{tx.title}</p>
                            <p className="text-[11px] text-fin-text-muted">
                              {tx.merchant || 'Standard Ledger Entry'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-fin-card-secondary border border-fin-border text-fin-text">
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-fin-text-secondary">
                        {formatDate(tx.transactionDate, 'medium')}
                      </td>

                      <td className="py-4 px-4 text-fin-text-muted">
                        {tx.paymentMethod || 'UPI'}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span
                          className={`font-extrabold text-sm ${
                            isIncome
                              ? 'text-emerald-400'
                              : isTransfer
                              ? 'text-blue-400'
                              : 'text-fin-text'
                          }`}
                        >
                          {isIncome ? '+' : isTransfer ? '' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setDeleteConfirmId(tx._id)}
                          className="p-1.5 rounded-lg text-fin-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-fin-border flex items-center justify-between text-xs text-fin-text-secondary">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-fin-card-secondary border border-fin-border disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-fin-card-secondary border border-fin-border disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-fin-card border border-fin-border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-fin-text">Delete Record</h3>
            <p className="text-xs text-fin-text-secondary">
              Are you sure you want to delete this transaction? This action will reverse any associated account balance change.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-fin-text-secondary hover:bg-fin-card-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
