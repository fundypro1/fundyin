<template>
    <div class="referrals-page">
      <div class="container">
        <!-- Header -->
        <div class="header-section">
          <h1>Referral Program</h1>
          <p class="subtitle">Earn commissions by inviting friends to join FundyApp</p>
        </div>
  
        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">Total Referrals</p>
                <p class="stat-value yellow">{{ referralStats.totalReferrals }}</p>
              </div>
              <div class="stat-icon">👥</div>
            </div>
            <div class="stat-change">
              <span class="positive">+3 this month</span>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">Active Referrals</p>
                <p class="stat-value green">{{ referralStats.activeReferrals }}</p>
              </div>
              <div class="stat-icon">📈</div>
            </div>
            <div class="stat-change">
              <span class="positive">75% active rate</span>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">Total Commission</p>
                <p class="stat-value blue">GHS {{ formatAmount(referralStats.totalCommission) }}</p>
              </div>
              <div class="stat-icon">💰</div>
            </div>
            <div class="stat-change">
              <span class="positive">+12.5% this month</span>
            </div>
          </div>
  
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">Monthly Commission</p>
                <p class="stat-value purple">GHS {{ formatAmount(referralStats.monthlyCommission) }}</p>
              </div>
              <div class="stat-icon">🎁</div>
            </div>
            <div class="stat-change">
              <span class="positive">This month</span>
            </div>
          </div>
        </div>
  
        <!-- Referral Link Section -->
        <div class="referral-link-card">
          <h2 class="section-title">
            <span class="title-icon">🔗</span>
            Your Referral Link
          </h2>
          
          <div class="link-section">
            <!-- Referral Code -->
            <div class="input-group">
              <label class="input-label">Referral Code</label>
              <div class="input-with-button">
                <input
                  type="text"
                  :value="referralStats.referralCode"
                  readonly
                  class="referral-input"
                />
                <button
                  @click="copyToClipboard(referralStats.referralCode)"
                  class="copy-btn yellow"
                >
                  <span class="btn-icon">📋</span>
                  <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
            </div>
  
            <!-- Referral Link -->
            <div class="input-group">
              <label class="input-label">Referral Link</label>
              <div class="input-with-button">
                <input
                  type="text"
                  :value="referralStats.referralLink"
                  readonly
                  class="referral-input small-text"
                />
                <button
                  @click="copyToClipboard(referralStats.referralLink)"
                  class="copy-btn blue"
                >
                  <span class="btn-icon">📋</span>
                  <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
            </div>
  
            <!-- Share Buttons -->
            <div class="share-buttons">
              <button class="share-btn whatsapp">
                <span class="share-icon">📱</span>
                <span>WhatsApp</span>
              </button>
              <button class="share-btn twitter">
                <span class="share-icon">🐦</span>
                <span>Twitter</span>
              </button>
              <button class="share-btn facebook">
                <span class="share-icon">📘</span>
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>
  
        <!-- Commission Structure -->
        <div class="commission-structure">
          <h2 class="section-title">
            <span class="title-icon">🏆</span>
            Commission Structure
          </h2>
          
          <div class="tiers-grid">
            <div 
              v-for="tier in referralTiers" 
              :key="tier.level"
              class="tier-card"
              :class="tier.color"
            >
              <div class="tier-content">
                <div class="tier-level">Level {{ tier.level }}</div>
                <div class="tier-percentage">{{ tier.commission }}</div>
                <div class="tier-description">{{ tier.description }}</div>
              </div>
            </div>
          </div>
  
          <div class="how-it-works">
            <h3>How it Works:</h3>
            <ul>
              <li>• Level 1: Earn 10% commission from direct referrals' investments</li>
              <li>• Level 2: Earn 5% commission from your referrals' referrals</li>
              <li>• Level 3: Earn 2% commission from third-level referrals</li>
              <li>• Commissions are paid instantly when referrals make investments</li>
              <li>• Minimum payout: GHS 10.00</li>
            </ul>
          </div>
        </div>
  
        <!-- Tabs Section -->
        <div class="tabs-container">
          <div class="tab-buttons">
            <button
              @click="activeTab = 'overview'"
              :class="{ active: activeTab === 'overview' }"
              class="tab-btn"
            >
              Recent Referrals
            </button>
            <button
              @click="activeTab = 'commissions'"
              :class="{ active: activeTab === 'commissions' }"
              class="tab-btn"
            >
              Commission History
            </button>
          </div>
  
          <div class="tab-content">
            <!-- Recent Referrals Tab -->
            <div v-if="activeTab === 'overview'" class="tab-panel">
              <h3 class="panel-title">Recent Referrals</h3>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Commission</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="referral in recentReferrals" 
                      :key="referral.id"
                      class="table-row"
                    >
                      <td class="user-cell">
                        <div class="user-info">
                          <div class="user-avatar">
                            {{ referral.username.charAt(1).toUpperCase() }}
                          </div>
                          <span>{{ referral.username }}</span>
                        </div>
                      </td>
                      <td class="date-cell">{{ referral.joinDate }}</td>
                      <td class="status-cell">
                        <span 
                          class="status-badge"
                          :class="{ 
                            active: referral.status === 'Active',
                            pending: referral.status === 'Pending'
                          }"
                        >
                          {{ referral.status }}
                        </span>
                      </td>
                      <td class="commission-cell">
                        GHS {{ formatAmount(referral.commission) }}
                      </td>
                      <td class="level-cell">
                        <span class="level-badge">Level {{ referral.level }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  
            <!-- Commission History Tab -->
            <div v-if="activeTab === 'commissions'" class="tab-panel">
              <h3 class="panel-title">Commission History</h3>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Referral</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="commission in commissionHistory" 
                      :key="commission.id"
                      class="table-row"
                    >
                      <td class="date-cell">{{ commission.date }}</td>
                      <td>{{ commission.referral }}</td>
                      <td class="amount-cell">
                        +GHS {{ formatAmount(commission.amount) }}
                      </td>
                      <td class="type-cell">
                        <span 
                          class="type-badge"
                          :class="{
                            direct: commission.type === 'Direct',
                            level2: commission.type === 'Level 2',
                            bonus: commission.type === 'Bonus'
                          }"
                        >
                          {{ commission.type }}
                        </span>
                      </td>
                      <td class="status-cell">
                        <span 
                          class="status-badge"
                          :class="{ 
                            paid: commission.status === 'Paid',
                            pending: commission.status === 'Pending'
                          }"
                        >
                          {{ commission.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ReferralsPage',
    data() {
      return {
        copied: false,
        activeTab: 'overview',
        referralStats: {
          totalReferrals: 24,
          activeReferrals: 18,
          totalCommission: 1247.50,
          monthlyCommission: 320.00,
          referralCode: 'FUND2024XYZ',
          referralLink: 'https://fundyapp.com/register?ref=FUND2024XYZ'
        },
        recentReferrals: [
          { id: 1, username: '@user****123', joinDate: '2024-01-15', status: 'Active', commission: 45.20, level: 1 },
          { id: 2, username: '@user****456', joinDate: '2024-01-14', status: 'Active', commission: 32.10, level: 1 },
          { id: 3, username: '@user****789', joinDate: '2024-01-13', status: 'Pending', commission: 0.00, level: 1 },
          { id: 4, username: '@user****012', joinDate: '2024-01-12', status: 'Active', commission: 67.85, level: 2 },
          { id: 5, username: '@user****345', joinDate: '2024-01-11', status: 'Active', commission: 23.45, level: 1 },
        ],
        commissionHistory: [
          { id: 1, date: '2024-01-15', referral: '@user****123', amount: 45.20, type: 'Direct', status: 'Paid' },
          { id: 2, date: '2024-01-14', referral: '@user****456', amount: 32.10, type: 'Direct', status: 'Paid' },
          { id: 3, date: '2024-01-13', referral: '@user****012', amount: 67.85, type: 'Level 2', status: 'Paid' },
          { id: 4, date: '2024-01-12', referral: '@user****789', amount: 12.50, type: 'Bonus', status: 'Pending' },
        ],
        referralTiers: [
          { level: 1, commission: '10%', description: 'Direct referrals', color: 'green' },
          { level: 2, commission: '5%', description: 'Second level referrals', color: 'blue' },
          { level: 3, commission: '2%', description: 'Third level referrals', color: 'purple' },
        ]
      }
    },
    methods: {
      async copyToClipboard(text) {
        try {
          await navigator.clipboard.writeText(text);
          this.copied = true;
          setTimeout(() => {
            this.copied = false;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      },
      formatAmount(amount) {
        return parseFloat(amount || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    }
  }
  </script>
  
  <style scoped>
  .referrals-page {
    min-height: 100vh;
    background: #0b0e11;
    color: #ffffff;
    padding: 24px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Header */
  .header-section {
    margin-bottom: 32px;
  }
  
  .header-section h1 {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #f0b90b, #f8d12f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  
  .subtitle {
    color: #848e9c;
    font-size: 16px;
  }
  
  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }
  
  .stat-card {
    background: linear-gradient(135deg, #1e2329, #2b3139);
    border: 1px solid #474d57;
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    border-color: #f0b90b;
    transform: translateY(-2px);
  }
  
  .stat-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-label {
    color: #848e9c;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }
  
  .stat-value.yellow { color: #f0b90b; }
  .stat-value.green { color: #03a66d; }
  .stat-value.blue { color: #4da3e0; }
  .stat-value.purple { color: #8b5cf6; }
  
  .stat-icon {
    font-size: 32px;
    opacity: 0.8;
  }
  
  .stat-change .positive {
    color: #03a66d;
    font-size: 14px;
  }
  
  /* Referral Link Card */
  .referral-link-card {
    background: linear-gradient(135deg, #1e2329, #2b3139);
    border: 2px solid #f0b90b;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }
  
  .referral-link-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #f0b90b, #f8d12f, #f0b90b);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .section-title {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    color: #ffffff;
  }
  
  .title-icon {
    margin-right: 12px;
    font-size: 24px;
  }
  
  .link-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .input-label {
    color: #848e9c;
    font-size: 14px;
    font-weight: 500;
  }
  
  .input-with-button {
    display: flex;
    gap: 12px;
  }
  
  .referral-input {
    flex: 1;
    background: #0b0e11;
    border: 2px solid #474d57;
    border-radius: 12px;
    padding: 16px;
    color: #ffffff;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  
  .referral-input:focus {
    outline: none;
    border-color: #f0b90b;
  }
  
  .referral-input.small-text {
    font-size: 12px;
  }
  
  .copy-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  
  .copy-btn.yellow {
    background: #f0b90b;
    color: #000000;
  }
  
  .copy-btn.yellow:hover {
    background: #f8d12f;
  }
  
  .copy-btn.blue {
    background: #4da3e0;
    color: #ffffff;
  }
  
  .copy-btn.blue:hover {
    background: #357abd;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  /* Share Buttons */
  .share-buttons {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  
  .share-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #ffffff;
  }
  
  .share-btn.whatsapp {
    background: #25d366;
  }
  
  .share-btn.whatsapp:hover {
    background: #1eb854;
  }
  
  .share-btn.twitter {
    background: #1da1f2;
  }
  
  .share-btn.twitter:hover {
    background: #0d8bd9;
  }
  
  .share-btn.facebook {
    background: #1877f2;
  }
  
  .share-btn.facebook:hover {
    background: #0d61e5;
  }
  
  /* Commission Structure */
  .commission-structure {
    background: linear-gradient(135deg, #1e2329, #2b3139);
    border: 1px solid #474d57;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
  }
  
  .tiers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .tier-card {
    background: #0b0e11;
    border: 2px solid #474d57;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .tier-card:hover {
    transform: translateY(-4px);
  }
  
  .tier-card.green {
    border-color: #03a66d;
  }
  
  .tier-card.green:hover {
    border-color: #03a66d;
    box-shadow: 0 8px 25px rgba(3, 166, 109, 0.2);
  }
  
  .tier-card.blue {
    border-color: #4da3e0;
  }
  
  .tier-card.blue:hover {
    border-color: #4da3e0;
    box-shadow: 0 8px 25px rgba(77, 163, 224, 0.2);
  }
  
  .tier-card.purple {
    border-color: #8b5cf6;
  }
  
  .tier-card.purple:hover {
    border-color: #8b5cf6;
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
  }
  
  .tier-level {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .tier-card.green .tier-level {
    color: #03a66d;
  }
  
  .tier-card.blue .tier-level {
    color: #4da3e0;
  }
  
  .tier-card.purple .tier-level {
    color: #8b5cf6;
  }
  
  .tier-percentage {
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
  }
  
  .tier-description {
    color: #848e9c;
    font-size: 14px;
  }
  
  .how-it-works {
    background: #0b0e11;
    border: 1px solid rgba(240, 185, 11, 0.3);
    border-radius: 12px;
    padding: 20px;
  }
  
  .how-it-works h3 {
    color: #f0b90b;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .how-it-works ul {
    list-style: none;
    padding: 0;
    margin: 0;
    color: #d1d5db;
  }
  
  .how-it-works li {
    font-size: 14px;
    margin-bottom: 4px;
    line-height: 1.5;
  }
  
  /* Tabs */
  .tabs-container {
    background: linear-gradient(135deg, #1e2329, #2b3139);
    border: 1px solid #474d57;
    border-radius: 16px;
    overflow: hidden;
  }
  
  .tab-buttons {
    display: flex;
    border-bottom: 1px solid #474d57;
  }
  
  .tab-btn {
    flex: 1;
    padding: 20px 24px;
    background: transparent;
    border: none;
    color: #848e9c;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .tab-btn:hover {
    color: #ffffff;
    background: rgba(240, 185, 11, 0.1);
  }
  
  .tab-btn.active {
    background: #f0b90b;
    color: #000000;
    font-weight: 600;
  }
  
  .tab-content {
    padding: 32px;
  }
  
  .panel-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 24px;
    color: #ffffff;
  }
  
  /* Tables */
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th {
    text-align: left;
    padding: 16px;
    color: #848e9c;
    font-weight: 500;
    font-size: 14px;
    border-bottom: 1px solid #474d57;
  }
  
  .data-table td {
    padding: 16px;
    border-bottom: 1px solid #2b3139;
  }
  
  .table-row {
    transition: background-color 0.2s ease;
  }
  
  .table-row:hover {
    background: rgba(240, 185, 11, 0.05);
  }
  
  .user-cell {
    padding: 16px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    background: #f0b90b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000000;
    font-weight: 600;
    font-size: 14px;
  }
  
  .date-cell {
    color: #d1d5db;
    font-size: 14px;
  }
  
  .status-badge, .type-badge, .level-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-badge.active, .status-badge.paid {
    background: rgba(3, 166, 109, 0.2);
    color: #03a66d;
  }
  
  .status-badge.pending {
    background: rgba(240, 185, 11, 0.2);
    color: #f0b90b;
  }
  
  .type-badge.direct {
    background: rgba(3, 166, 109, 0.2);
    color: #03a66d;
  }
  
  .type-badge.level2 {
    background: rgba(77, 163, 224, 0.2);
    color: #4da3e0;
  }
  
  .type-badge.bonus {
    background: rgba(139, 92, 246, 0.2);
    color: #8b5cf6;
  }
  
  .level-badge {
    background: rgba(77, 163, 224, 0.2);
    color: #4da3e0;
  }
  
  .commission-cell, .amount-cell {
    color: #03a66d;
    font-weight: 600;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .referrals-page {
      padding: 16px;
    }
  
    .header-section h1 {
      font-size: 24px;
    }
  
    .stats-grid {
      grid-template-columns: 1fr;
    }
  
    .referral-link-card {
      padding: 20px;
    }
  
    .input-with-button {
      flex-direction: column;
    }
  
    .share-buttons {
      justify-content: center;
    }
  
    .tiers-grid {
      grid-template-columns: 1fr;
    }
  
    .tab-content {
      padding: 20px;
    }
  
    .data-table {
      font-size: 14px;
    }
  
    .data-table th,
    .data-table td {
      padding: 12px 8px;
    }
  }
  
  @media (max-width: 480px) {
    .referrals-page {
      padding: 12px;
    }
  
    .header-section h1 {
      font-size: 20px;
    }
  
    .stat-card {
      padding: 16px;
    }
  
    .stat-value {
      font-size: 24px;
    }
  
    .referral-link-card {
      padding: 16px;
    }
  
    .section-title {
      font-size: 18px;
    }
  
    .tier-percentage {
      font-size: 28px;
    }
  
    .tab-btn {
      padding: 16px;
      font-size: 14px;
    }
  
    .tab-content {
      padding: 16px;
    }
  }
  </style>