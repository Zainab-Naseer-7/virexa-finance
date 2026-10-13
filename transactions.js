/**
 * VIREXA FINANCE — Live Transaction Filtering & Search System
 * Instant category filtering, real-time query matching, and badge rendering
 */

document.addEventListener('DOMContentLoaded', () => {
  const transactionListContainer = document.getElementById('transactionRowsContainer');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('transactionSearchInput');

  // Master Transaction Dataset
  const transactions = [
    {
      id: 'tx_01',
      merchant: 'Netflix Inc.',
      category: 'Entertainment',
      type: 'expense',
      date: 'Today, 2:15 PM',
      amount: -18.99,
      status: 'completed',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`
    },
    {
      id: 'tx_02',
      merchant: 'Apple Store Regent St.',
      category: 'Hardware & Tech',
      type: 'expense',
      date: 'Yesterday, 6:40 PM',
      amount: -249.00,
      status: 'completed',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"></path><path d="M12 6v6l4 2"></path></svg>`
    },
    {
      id: 'tx_03',
      merchant: 'Corporate Salary Deposit',
      category: 'Income',
      type: 'income',
      date: 'Sep 01, 9:00 AM',
      amount: 4800.00,
      status: 'completed',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>`
    },
    {
      id: 'tx_04',
      merchant: 'Amazon Services LLC',
      category: 'Online Shopping',
      type: 'expense',
      date: 'Aug 29, 11:24 AM',
      amount: -84.20,
      status: 'completed',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`
    },
    {
      id: 'tx_05',
      merchant: 'Zurich SWIFT Transfer',
      category: 'International Transfer',
      type: 'transfer',
      date: 'Aug 27, 4:10 PM',
      amount: 1250.00,
      status: 'completed',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="3" x2="17" y2="21"></line><polyline points="10 16 17 21 24 16"></polyline><line x1="7" y1="21" x2="7" y2="3"></line><polyline points="0 8 7 3 14 8"></polyline></svg>`
    },
    {
      id: 'tx_06',
      merchant: 'Dubai FinTech Dividend',
      category: 'Investment Yield',
      type: 'income',
      date: 'Aug 25, 1:30 PM',
      amount: 620.50,
      status: 'completed',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
    },
    {
      id: 'tx_07',
      merchant: 'Tokyo Vault Wire Transfer',
      category: 'Global Transfer',
      type: 'transfer',
      date: 'Aug 22, 10:15 AM',
      amount: -450.00,
      status: 'pending',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
    }
  ];

  let currentCategory = 'all';
  let currentSearchQuery = '';

  function renderTransactions() {
    if (!transactionListContainer) return;

    const filtered = transactions.filter((tx) => {
      // Category filter check
      const matchesCategory =
        currentCategory === 'all' ||
        (currentCategory === 'income' && tx.amount > 0) ||
        (currentCategory === 'expenses' && tx.amount < 0 && tx.type !== 'transfer') ||
        (currentCategory === 'transfers' && tx.type === 'transfer');

      // Search query check
      const query = currentSearchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        tx.merchant.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query) ||
        tx.amount.toString().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      transactionListContainer.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem auto; opacity: 0.5;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p style="font-weight: 500;">No transactions found matching your criteria.</p>
        </div>
      `;
      return;
    }

    transactionListContainer.innerHTML = filtered
      .map((tx) => {
        const isPositive = tx.amount > 0;
        const formattedAmount = `${isPositive ? '+' : '-'}$${Math.abs(tx.amount).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;

        return `
          <div class="transaction-row" data-id="${tx.id}">
            <div class="merchant-info">
              <div class="merchant-icon">
                ${tx.icon}
              </div>
              <div>
                <div class="merchant-title">${tx.merchant}</div>
                <div class="merchant-category">${tx.category}</div>
              </div>
            </div>
            <div class="transaction-date">${tx.date}</div>
            <div>
              <span class="transaction-category-badge">${tx.type.toUpperCase()}</span>
            </div>
            <div class="transaction-amount ${isPositive ? 'amount-income' : 'amount-expense'}">
              ${formattedAmount}
            </div>
            <div>
              <span class="status-badge ${tx.status === 'completed' ? 'status-completed' : 'status-pending'}">
                ${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Filter Buttons Listeners
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      filterButtons.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.getAttribute('data-filter') || 'all';
      renderTransactions();
    });
  });

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      currentSearchQuery = e.target.value;
      renderTransactions();
    });
  }

  // Initial render
  renderTransactions();
});
