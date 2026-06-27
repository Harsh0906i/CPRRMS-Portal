import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceipts } from '../features/receiptSlice';
import { Search, CreditCard, ChevronLeft, ChevronRight, ExternalLink, Calendar } from 'lucide-react';

export default function Receipts() {
  const dispatch = useDispatch();
  const { receipts, total, page, pages, loading, error } = useSelector(state => state.receipts);
  
  const [search, setSearch] = useState('');

  const loadReceipts = (pageNumber = 1) => {
    dispatch(
      fetchReceipts({
        page: pageNumber,
        limit: 10,
        search: search || undefined
      })
    );
  };

  useEffect(() => {
    loadReceipts(1);
  }, [dispatch]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    loadReceipts(1);
  };

  const handlePrintReceipt = rId => {
    window.open(`/api/receipts/${rId}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Receipts</h2>
        <p className="text-sm text-muted-foreground">
          View billing histories, transaction logs, and generate PDF invoices.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex relative">
          <input
            type="text"
            placeholder="Search by receipt number (e.g. REC-2026-0001) or payment mode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-2 bg-background border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary/95"
          >
            Search
          </button>
        </form>
      </div>

      {/* Receipts Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground text-xs uppercase font-bold border-b border-border">
                <th className="px-6 py-4">Receipt No</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Amount (INR)</th>
                <th className="px-6 py-4">Payment Mode</th>
                <th className="px-6 py-4">Log Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="8" className="px-6 py-5 h-12 bg-muted/10"></td>
                  </tr>
                ))
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                    No payment receipts logged in this query.
                  </td>
                </tr>
              ) : (
                receipts.map(receipt => (
                  <tr key={receipt._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{receipt.receiptNumber}</td>
                    <td className="px-6 py-4 font-bold">{receipt.patient?.name || 'Deleted Patient'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {receipt.patient?.patientId || '--'}
                    </td>
                    <td className="px-6 py-4 font-bold text-teal-600">
                      Rs. {receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {receipt.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(receipt.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                      {receipt.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handlePrintReceipt(receipt._id)}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          title="View PDF Invoice"
                        >
                          <ExternalLink className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{pages}</span> (Total: {total} logs)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => loadReceipts(page - 1)}
                className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === pages}
                onClick={() => loadReceipts(page + 1)}
                className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
