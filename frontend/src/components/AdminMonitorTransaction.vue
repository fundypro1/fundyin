<template>
  <div class="admin-dashboard">
    <h1 class="text-admin">Admin Transaction Monitoring</h1>
    
    <!-- Stats Overview -->
    <div class="container">
      <div class="total-transaction">
        <h3 class="text-total">Total Transactions</h3>
        <p class="total-count">{{ transactions.length }}</p>
      </div>
      <div class="stat-card stat-purple">
        <h3 class="stat-title stat-purple-text">Total Users</h3>
        <p class="stat-value">{{ users.length }}</p>
      </div>
      <div class="stat-card stat-red">
        <h3 class="stat-title stat-red-text">Potential Fraud</h3>
        <p class="stat-value fraud-value">{{ potentialFraudCount }}</p>
      </div>
    </div>
    
    <!-- User Selection -->
    <div class="user-details-container">
      <h3 class="section-title">User Details</h3>
      <div class="user-select-container">
        
        <div v-if="userDetails" class="user-info">
          <p class="user-info-item"><strong class="info-label">Username:</strong> <span class="info-value">{{ userDetails.username }}</span></p>
          <p class="user-info-item"><strong class="info-label">Email:</strong> <span class="info-value">{{ userDetails.email }}</span></p>
          <p class="user-info-item"><strong class="info-label">Balance:</strong> <span class="info-value">${{ userDetails.balance?.toFixed(2) }}</span></p>
          <p class="user-info-item"><strong class="info-label">Account Created:</strong> <span class="info-value">{{ formatDate(userDetails.created_at) }}</span></p>
        </div>
      </div>
    </div>
    
    <!-- Transactions Table -->
    <div class="table-container">
      <table class="transactions-table">
        <thead class="table-header">
          <tr>
            <th class="table-heading">ID</th>
            <th class="table-heading">User</th>
            <th class="table-heading">To</th>
            <th class="table-heading">Type</th>
            <th class="table-heading">Amount</th>
            <th class="table-heading">Date</th>
            <th class="table-heading">Status</th>
            <th class="table-heading">Risk Score</th>
            <th class="table-heading">Risk Level</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id" 
              :class="{'fraud-row': isPotentialFraud(transaction)}"
              class="transaction-row">
            <td class="table-cell">{{ transaction.id }}</td>
            <td class="table-cell">
              <span class="username-text"> {{ transaction.source_username }}</span>
            </td>
            <td class="table-cell">
              <span v-if="transaction.desttransaction" :class="getTransactionTypeClass(transaction.type)" class="transaction-type-badge">
                {{ transaction.desttransaction.dest_username}}
              </span>
              <span v-else :class="getTransactionTypeClass(transaction.type)" class="unavailable-text">
                Not Available
              </span>
            </td>
            <td class="table-cell">
              <span :class="[
                transaction.type === 'deposit' ? 'badge-green' : 
                transaction.type === 'withdrawal' ? 'badge-orange' :
                'badge-blue',
                'transaction-badge'
              ]">
                {{ transaction.type}}
              </span>
            </td>
            <td class="table-cell amount-cell">${{ transaction.amount.toFixed(2) }}</td>
            <td class="table-cell date-cell">{{ formatDate(transaction.timestamp) }}</td>
            <td class="table-cell">
              <span :class="[
                isPotentialFraud(transaction) ? 'badge-red' : 'badge-green',
                'status-badge'
              ]">
                {{ isPotentialFraud(transaction) ? 'Suspicious' : 'Normal' }}
              </span>
            </td>
            <td class="table-cell">
              <span :class="[
                transaction.fraud_probability > 70 ? 'risk-high' :
                transaction.fraud_probability > 40 ? 'risk-medium' : 'risk-low',
                'risk-score'
              ]">
                {{ transaction.fraud_probability }}
              </span>
            </td>
            <td class="table-cell">
              <span :class="[
                transaction.fraud_probability > 70 ? 'risk-high' :
                transaction.fraud_probability > 40 ? 'risk-medium' : 'risk-low',
                'risk-score'
              ]">
                {{ transaction.fraud_risk }}
              </span>
            </td>
            
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="9" class="empty-row">No transactions found matching your filters</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div class="pagination-container">
        <div class="pagination-mobile">
          <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn mobile-prev">
            Previous
          </button>
          <button @click="currentPage++" :disabled="currentPage >= totalPages" class="pagination-btn mobile-next">
            Next
          </button>
        </div>
        <div class="pagination-desktop">
          <div class="pagination-info">
            <p class="info-text">
              Showing
              <span class="info-emphasis">{{ paginationStart }}</span>
              to
              <span class="info-emphasis">{{ paginationEnd }}</span>
              of
              <span class="info-emphasis">{{ filteredTransactions.length }}</span>
              results
            </p>
          </div>
          <div class="pagination-controls">
            <nav class="pagination-nav">
              <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn prev-btn">
                Previous
              </button>
              <button v-for="page in displayedPages" :key="page" @click="currentPage = page" 
                      :class="[currentPage === page ? 'page-active' : 'page-inactive', 'page-btn']">
                {{ page }}
              </button>
              <button @click="currentPage++" :disabled="currentPage >= totalPages" class="pagination-btn next-btn">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
  
  <script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';


const desttransaction = ref([]);
const transactions = ref([]);
const filteredTransactions = ref([]);
const users = ref([]);
const selectedUserId = ref('');
const userDetails = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const filters = ref({
  transactionType: '',
  minAmount: '',
  maxAmount: '',
  startDate: '',
  endDate: '',
  fraudFilter: ''
});
const reviewedTransactions = ref(new Set());
const flaggedTransactions = ref(new Set());

const potentialFraudCount = computed(() => {
  return filteredTransactions.value.filter(t => isPotentialFraud(t)).length;
});

const paginationStart = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredTransactions.value.length);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value);
});

const displayedPages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i);
  }
  return pages;
});

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    // Load transactions
    const response = await api.getAllTransactions();
    transactions.value = response.data;
    filteredTransactions.value = [...transactions.value];

    console.log(transactions)

    // Load users
    const usersResponse = await api.getAllUsers();
    users.value = usersResponse.data;
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function applyFilters() {
  let filtered = [...transactions.value];

  // Apply transaction type filter
  if (filters.value.transactionType) {
    filtered = filtered.filter(t => t.type === filters.value.transactionType);
  }

  // Apply amount filters
  if (filters.value.minAmount) {
    filtered = filtered.filter(t => t.amount >= parseFloat(filters.value.minAmount));
  }

  if (filters.value.maxAmount) {
    filtered = filtered.filter(t => t.amount <= parseFloat(filters.value.maxAmount));
  }

  // Apply date filters
  if (filters.value.startDate) {
    const startDate = new Date(filters.value.startDate);
    filtered = filtered.filter(t => new Date(t.created_at) >= startDate);
  }

  if (filters.value.endDate) {
    const endDate = new Date(filters.value.endDate);
    endDate.setHours(23, 59, 59); // End of day
    filtered = filtered.filter(t => new Date(t.created_at) <= endDate);
  }

  // Apply fraud filter
  if (filters.value.fraudFilter === 'potential') {
    filtered = filtered.filter(t => isPotentialFraud(t));
  } else if (filters.value.fraudFilter === 'verified') {
    filtered = filtered.filter(t => !isPotentialFraud(t));
  }

  filteredTransactions.value = filtered;
  currentPage.value = 1; // Reset to first page
}

function resetFilters() {
  filters.value = {
    transactionType: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    fraudFilter: ''
  };
  filteredTransactions.value = [...transactions.value];
  currentPage.value = 1;
}

function isPotentialFraud(transaction) {
  // Return true if transaction has been flagged
  if (flaggedTransactions.value.has(transaction.id)) {
    return true;
  }

  // Return false if transaction has been reviewed
  if (reviewedTransactions.value.has(transaction.id)) {
    return false;
  }

  // Define fraud detection rules
  const highAmountThreshold = 5000;
  const multipleTransactionsTimeWindow = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Check for high amount transactions
  if (transaction.amount >= highAmountThreshold) {
    return true;
  }

  // Check for multiple transactions in short time window
  const transactionTime = new Date(transaction.created_at).getTime();
  const multipleTransactions = transactions.value.filter(t => 
    t.user_id === transaction.user_id && 
    t.id !== transaction.id &&
    Math.abs(new Date(t.created_at).getTime() - transactionTime) <= multipleTransactionsTimeWindow
  );

  if (multipleTransactions.length >= 3) {
    return true;
  }

  // Check for unusual transfer patterns
  if (transaction.type === 'transfer') {
    // Example: Same user making transfers to multiple different recipients in short time
    const uniqueRecipients = new Set();
    transactions.value.forEach(t => {
      if (t.user_id === transaction.user_id && 
          t.type === 'transfer' &&
          Math.abs(new Date (t.created_at).getTime() - transactionTime) <= 30 * 60 * 1000) { // 30 minutes
        if (t.dest_user_id) {
          uniqueRecipients.add(t.dest_user_id);
        }
      }
    });

    if (uniqueRecipients.size >= 3) {
      return true;
    }
  }

  return false;
}

function markAsReviewed(transaction) {
  reviewedTransactions.value.add(transaction.id);
  flaggedTransactions.value.delete(transaction.id);
  // In a real application, you would also make an API call to update the transaction status
}

function flagAsFraud(transaction) {
  flaggedTransactions.value.add(transaction.id);
  reviewedTransactions.value.delete(transaction.id);
  // In a real application, you would also make an API call to update the transaction status
}

function getUserName(userId) {
  const user = users.value.find(u => u.id === userId);
  return user ? user.username : `User  ${userId}`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getTransactionTypeClass(type) {
  switch (type) {
    case 'deposit':
      return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
    case 'withdrawal':
      return 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
    case 'transfer':
      return 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800';
    default:
      return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
  }
}

function getStatusClass(transaction) {
  return isPotentialFraud(transaction)
    ? 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800'
    : 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
}

// function capitalizeFirstLetter(string) {
//   return String.charAt(0).toUpperCase() + String.slice(1);
// }
</script>


<style>
    /* General Styles */
    /* General Styles */
.admin-dashboard {
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #2C3E50;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #F7FAFC;
}

.text-admin {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #E2E8F0;
  padding-bottom: 0.75rem;
}

/* Stats Container */
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.total-transaction, .stat-card {
  flex: 1;
  min-width: 200px;
  background-color: white;
  border-radius: 0.375rem;
  padding: 1.25rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-top: 4px solid transparent;
}

.total-transaction {
  border-top-color: #1E3A8A;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.stat-purple {
  border-top-color: #1E3A8A;
}

.stat-red {
  border-top-color: #9B2C2C;
}

.text-total {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1E3A8A;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-purple-text {
  color: #1E3A8A;
}

.stat-red-text {
  color: #9B2C2C;
}

.total-count, .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2C3E50;
}

.fraud-value {
  color: #9B2C2C;
}

/* User Details Section */
.user-details-container {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #1E3A8A;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: "";
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  background-color: #1E3A8A;
  margin-right: 0.5rem;
  border-radius: 50%;
}

.user-select-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .user-select-container {
    flex-direction: row;
  }
}

.user-select {
  width: 100%;
  padding: 0.625rem;
  border-radius: 0.25rem;
  border: 1px solid #CBD5E0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  color: #2C3E50;
}

.user-select:focus {
  border-color: #1E3A8A;
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.15);
}

@media (min-width: 768px) {
  .user-select {
    width: 33.333333%;
  }
}

.user-info {
  flex: 1;
  padding: 1rem;
  background: linear-gradient(to right, #F8FAFC, #F1F5F9);
  border-radius: 0.25rem;
  border: 1px solid #E2E8F0;
}

.user-info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: baseline;
}

.info-label {
  color: #1E3A8A;
  font-weight: 600;
  width: 120px;
  flex-shrink: 0;
}

.info-value {
  color: #334155;
  font-weight: 500;
}

/* Transaction Table */
.table-container {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #E2E8F0;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: linear-gradient(to right, #1E3A8A, #2563EB);
}

.table-heading {
  padding: 0.875rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.transaction-row {
  transition: background-color 0.15s ease;
  border-bottom: 1px solid #E2E8F0;
}

.transaction-row:last-child {
  border-bottom: none;
}

.transaction-row:hover {
  background-color: #F1F5F9;
}

.fraud-row {
  background-color: #FEF2F2;
}

.fraud-row:hover {
  background-color: #FEE2E2;
}

.table-cell {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
  vertical-align: middle;
}

.username-text {
  color: #334155;
  display: block;
  font-weight: 500;
}

.unavailable-text {
  color: #64748B;
  font-style: italic;
}

.transaction-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-green {
  background-color: #DCFCE7;
  color: #166534;
}

.badge-orange {
  background-color: #FFEDD5;
  color: #9A3412;
}

.badge-blue {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.badge-red {
  background-color: #FEE2E2;
  color: #9B2C2C;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.amount-cell {
  font-weight: 600;
  color: #0F172A;
}

.date-cell {
  color: #475569;
}

.risk-score {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
  width: 2.5rem;
  text-align: center;
  font-weight: 600;
}

.risk-high {
  background-color: #FEE2E2;
  color: #9B2C2C;
}

.risk-medium {
  background-color: #FEF3C7;
  color: #B45309;
}

.risk-low {
  background-color: #DCFCE7;
  color: #166534;
}

.btn {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
  margin-right: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.btn-blue {
  background-color: #1E3A8A;
  color: white;
}

.btn-blue:hover {
  background-color: #1E40AF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-red {
  background-color: #9B2C2C;
  color: white;
}

.btn-red:hover {
  background-color: #B91C1C;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-row {
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: #64748B;
  background-color: #F8FAFC;
}

/* Pagination */
.pagination-container {
  background-color: #F8FAFC;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #E2E8F0;
}

.pagination-mobile {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.pagination-desktop {
  display: none;
  width: 100%;
}

@media (min-width: 640px) {
  .pagination-mobile {
    display: none;
  }

  .pagination-desktop {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #CBD5E0;
  border-radius: 0.25rem;
  background-color: white;
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination-btn:hover {
  background-color: #F1F5F9;
  border-color: #94A3B8;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-btn {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.next-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid #CBD5E0;
  border-left: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 2rem;
}

.page-active {
  background-color: #1E3A8A;
  border-color: #1E3A8A;
  color: white;
  position: relative;
  z-index: 1;
}

.page-inactive {
  background-color: white;
}

.page-inactive:hover {
  background-color: #F1F5F9;
}

.pagination-nav {
  display: inline-flex;
  border-radius: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.pagination-info {
  display: flex;
  align-items: center;
}

.info-text {
  font-size: 0.75rem;
  color: #64748B;
}

.info-emphasis {
  font-weight: 600;
  color: #334155;
}

.pagination-controls {
  display: flex;
  align-items: center;
}
  </style>
