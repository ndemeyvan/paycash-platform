"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, fetchTransactions, logout, AuthError, type Transaction } from "@/lib/auth";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  SUCCESS: "Réussi",
  COMPLETED: "Complété",
  FAILED: "Échoué",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " XAF";
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async (targetPage: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchTransactions(targetPage);
      setTransactions(data.items);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace("/login");
        return;
      }
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors du chargement des transactions");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => loadTransactions(1));
  }, [loadTransactions, router]);

  function goToPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
    loadTransactions(targetPage);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cta/5 rounded-full blur-3xl -z-10" />

      <header className="sticky top-0 z-50 border-b border-border bg-[#0F172A]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              PayCash
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-error border border-border hover:border-error/30 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Transactions
            </h1>
            <p className="mt-1 text-sm text-muted">
              {total} transaction{total !== 1 ? "s" : ""} au total
            </p>
          </div>

          <button
            onClick={() => loadTransactions(page, true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={refreshing ? "animate-spin" : ""}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {refreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => loadTransactions(page)}
              className="ml-auto text-sm font-medium underline hover:no-underline cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="animate-spin h-8 w-8 text-primary mb-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-muted">Chargement des transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              Aucune transaction
            </p>
            <p className="mt-1 text-xs text-muted">
              Les transactions apparaîtront ici une fois créées.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden backdrop-blur-xl relative">
              {refreshing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm">
                  <svg
                    className="animate-spin h-8 w-8 text-primary mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <p className="text-sm text-muted">Actualisation en cours...</p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">
                        ID
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">
                        Statut
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">
                        Montant
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                        Téléphone
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                        Frais
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((trx) => (
                      <tr
                        key={trx.id}
                        className="hover:bg-white/[0.02] transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <code className="text-xs text-muted font-mono">
                            {trx.id}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-lg border ${
                              STATUS_COLORS[trx.status] ||
                              "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}
                          >
                            {STATUS_LABELS[trx.status] || trx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-foreground tabular-nums">
                            {formatAmount(trx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-foreground tabular-nums">
                            {trx.phoneNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <span className="text-sm text-muted tabular-nums">
                            {trx.fees} XAF
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-muted whitespace-nowrap">
                            {formatDate(trx.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                Page {page} sur {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      p === page
                        ? "bg-primary text-[#0F172A] shadow-sm shadow-primary/20"
                        : "bg-card border border-border text-muted hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  Suivant
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
