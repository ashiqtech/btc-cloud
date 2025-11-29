import { User, VipPlan, Transaction } from '../types';
import { VIP_PLANS, FREE_BTC_DAILY_RATE } from '../constants';

const STORAGE_KEY = 'cryptominer_users';
const TRANSACTIONS_KEY = 'cryptominer_transactions';
const CURRENT_USER_KEY = 'cryptominer_current_session';

// --- Helpers ---
const getUsers = (): Record<string, User> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error parsing users", e);
    return {};
  }
};

const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveTransactions = (txs: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
};

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateSimpleUid = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `uid${randomNum}`;
};

// --- Auth Simulation ---

export const loginUser = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Robust normalization
  const cleanEmail = email.toLowerCase().trim();
  
  const users = getUsers();
  
  // Robust lookup: Check all stored users and compare emails case-insensitively
  // This handles cases where a user might have been saved with Capitals previously
  const user = Object.values(users).find(u => u.email.toLowerCase().trim() === cleanEmail);
  
  if (user) {
    // @ts-ignore
    if (user.password && user.password !== password) {
       throw new Error("Incorrect password");
    }

    if (user.isBlocked) {
        throw new Error("ACCOUNT BLOCKED: Contact Support.");
    }

    // Backwards compatibility fixes
    let updated = false;
    if (typeof user.btcBalance === 'undefined') { user.btcBalance = 0; updated = true; }
    if (!user.referralCode) { user.referralCode = generateReferralCode(); updated = true; }
    
    // Ensure Admin UID is consistent if email matches, even if stored differently
    if (user.email.toLowerCase() === 'cryptodrop077@gmail.com' && user.uid !== 'uid3026') {
        // Migration fix for admin if UID was wrong
        const oldUid = user.uid;
        user.uid = 'uid3026';
        delete users[oldUid];
        users['uid3026'] = user;
        updated = true;
    }
    
    if (updated) {
        users[user.uid] = user;
        saveUsers(users);
    }

    localStorage.setItem(CURRENT_USER_KEY, user.uid);
    return user;
  } else {
    throw new Error('User not found. Please sign up.');
  }
};

export const registerUser = async (email: string, password: string, referralCode?: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const cleanEmail = email.toLowerCase().trim();
  const users = getUsers();
  
  if (Object.values(users).some(u => u.email.toLowerCase().trim() === cleanEmail)) {
    throw new Error('Email already in use.');
  }

  // Handle Referral
  let referredByUid = undefined;
  if (referralCode) {
    const referrer = Object.values(users).find(u => u.referralCode === referralCode);
    if (referrer) {
      referredByUid = referrer.uid;
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      users[referrer.uid] = referrer; // Mark for save
    }
  }

  // UID Generation Logic
  let newUid = generateSimpleUid();
  
  // SPECIAL ADMIN LOGIC: If email is cryptodrop077@gmail.com, force uid3026
  if (cleanEmail === 'cryptodrop077@gmail.com') {
      newUid = 'uid3026';
  }

  // Ensure uniqueness
  while (users[newUid] && newUid !== 'uid3026') { 
    newUid = generateSimpleUid();
  }
  
  // Force overwrite for admin ID if registering with admin email
  if (newUid === 'uid3026') {
      // If someone else somehow has this ID (unlikely), they will be overwritten or we assume it's the admin re-registering
  } else if (users[newUid]) {
      // Collision for normal user
      newUid = generateSimpleUid();
  }

  const newUser: any = {
    uid: newUid,
    email: cleanEmail, // Store lowercase
    password, 
    usdtBalance: 0,
    btcBalance: 0,
    vipLevel: 0,
    lastMiningTime: 0,
    totalEarned: 0,
    referralCode: generateReferralCode(),
    referredBy: referredByUid,
    referralCount: 0,
    referralEarnings: 0,
    isBlocked: false
  };

  users[newUser.uid] = newUser;
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, newUser.uid);
  return newUser;
};

export const logoutUser = async () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const uid = localStorage.getItem(CURRENT_USER_KEY);
  if (!uid) return null;
  const users = getUsers();
  const user = users[uid];
  if (!user) return null;
  
  if (user.isBlocked) {
      logoutUser();
      return null;
  }
  return user;
};

// --- Password Management ---

export const changePassword = async (uid: string, oldPass: string, newPass: string) => {
    const users = getUsers();
    const user: any = users[uid];
    if (!user) throw new Error("User not found");
    
    if (user.password && user.password !== oldPass) {
        throw new Error("Old password is incorrect");
    }
    
    user.password = newPass;
    saveUsers(users);
};

export const resetPassword = async (email: string, newPass: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const users = getUsers();
    const user: any = Object.values(users).find(u => u.email.toLowerCase().trim() === cleanEmail);
    if (!user) throw new Error("Email not found");
    
    user.password = newPass;
    saveUsers(users);
};

// --- Transaction System (New) ---

export const getUserTransactions = (uid: string): Transaction[] => {
  const allTxs = getTransactions();
  return allTxs.filter(tx => tx.uid === uid).sort((a,b) => b.date - a.date);
};

export const getAllTransactionsAdmin = (): Transaction[] => {
  const allTxs = getTransactions();
  return allTxs.sort((a,b) => b.date - a.date);
};

export const createTransaction = async (
  uid: string, 
  type: 'deposit' | 'withdraw', 
  amount: number, 
  network: string, 
  details: string
): Promise<Transaction> => {
  const users = getUsers();
  const user = users[uid];
  if (!user) throw new Error('User not found');

  if (type === 'withdraw') {
    if (user.usdtBalance < amount) throw new Error('Insufficient balance');
    // Deduct immediately for withdrawal request (escrow)
    user.usdtBalance -= amount;
    saveUsers(users);
  }

  const newTx: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    uid,
    userEmail: user.email,
    type,
    amount,
    status: 'pending',
    date: Date.now(),
    network,
    details
  };

  const txs = getTransactions();
  txs.push(newTx);
  saveTransactions(txs);
  
  return newTx;
};

export const processTransaction = async (adminUid: string, txId: string, action: 'approve' | 'reject'): Promise<void> => {
  // Security Check
  if (adminUid !== 'uid3026') throw new Error('Access Denied: Super Admin Only');

  const txs = getTransactions();
  const txIndex = txs.findIndex(t => t.id === txId);
  if (txIndex === -1) throw new Error('Transaction not found');
  
  const tx = txs[txIndex];
  
  // NOTE: We allow re-processing if needed (debugging), but typically only pending
  // if (tx.status !== 'pending') throw new Error('Transaction already processed');

  const users = getUsers();
  const user = users[tx.uid];
  
  if (action === 'approve') {
    if (tx.status === 'approved') return; // Already done

    // If it was rejected previously (for some reason), we might need to deduct again? 
    // For simplicity, we assume we only move from pending -> approved/rejected.
    
    tx.status = 'approved';
    
    if (tx.type === 'deposit' && user) {
       // Credit funds
       user.usdtBalance += tx.amount;
       
       // Referral Commission Logic (5%)
       if (user.referredBy && users[user.referredBy]) {
          const referrer = users[user.referredBy];
          const commission = tx.amount * 0.05;
          referrer.usdtBalance += commission;
          referrer.referralEarnings = (referrer.referralEarnings || 0) + commission;
       }
    }
    // For withdraw approve: funds already deducted, just mark approved
    
  } else {
    // REJECT
    if (tx.status === 'rejected') return; // Already done

    tx.status = 'rejected';
    
    if (tx.type === 'withdraw' && user) {
      // Refund user funds if rejected
      user.usdtBalance += tx.amount;
    }
  }

  // Update Array explicitly
  txs[txIndex] = tx;
  saveTransactions(txs);
  
  // Save users if modified
  if (user) {
      users[tx.uid] = user;
      saveUsers(users);
  }
};

// --- Other Operations ---

export const upgradeUserVip = async (uid: string, newLevel: number): Promise<User> => {
  const users = getUsers();
  const user = users[uid];
  if (!user) throw new Error('User not found');

  const plan = VIP_PLANS.find(p => p.level === newLevel);
  if (!plan) throw new Error('Invalid plan');

  // ALLOW JUMP: Removed sequential check. Users can buy any plan higher than current.
  if (user.vipLevel >= newLevel) throw new Error('You already have this level or higher.');
  
  if (user.usdtBalance < plan.cost) throw new Error(`Insufficient USDT. Need ${plan.cost}.`);

  user.usdtBalance -= plan.cost;
  user.vipLevel = newLevel;
  
  // RESET MINING TIMER: Enforce 24-hour wait after purchasing a plan
  user.lastMiningTime = Date.now();
  
  saveUsers(users);
  return user;
};

export const collectMiningEarnings = async (uid: string): Promise<{user: User, earnedMsg: string}> => {
  const users = getUsers();
  const user = users[uid];
  if (!user) throw new Error('User not found');

  const now = Date.now();
  const timeDiff = now - user.lastMiningTime;
  const cooldown = 24 * 60 * 60 * 1000;
  
  if (timeDiff < cooldown) {
    const hoursLeft = Math.ceil((cooldown - timeDiff) / (1000 * 60 * 60));
    throw new Error(`Mining cooling down. Try again in ${hoursLeft} hours.`);
  }

  let earnedMsg = "";

  if (user.vipLevel === 0) {
      user.btcBalance = (user.btcBalance || 0) + FREE_BTC_DAILY_RATE;
      earnedMsg = `${FREE_BTC_DAILY_RATE.toFixed(10)} BTC`;
  } else {
      const currentPlan = VIP_PLANS.find(p => p.level === user.vipLevel);
      if (!currentPlan) throw new Error('Invalid VIP level');

      const earnings = currentPlan.cost * (currentPlan.dailyReturnPercent / 100);

      user.usdtBalance += earnings;
      user.totalEarned += earnings;
      earnedMsg = `${earnings.toFixed(2)} USDT`;
  }

  user.lastMiningTime = now;
  saveUsers(users);
  return { user, earnedMsg };
};

export const swapBtcToUsdt = async (uid: string, btcAmount: number, btcPrice: number): Promise<User> => {
    const users = getUsers();
    const user = users[uid];
    if (!user) throw new Error('User not found');
    
    if (btcAmount <= 0) throw new Error("Invalid amount");
    if ((user.btcBalance || 0) < btcAmount) throw new Error("Insufficient BTC Balance");
    
    const usdtValue = btcAmount * btcPrice;
    
    user.btcBalance -= btcAmount;
    user.usdtBalance += usdtValue;
    
    saveUsers(users);
    return user;
};

// --- SUPER ADMIN FUNCTIONS ---

export const adminToggleBlockUser = async (targetUid: string) => {
    const users = getUsers();
    const user = users[targetUid];
    if (!user) throw new Error("User not found");
    if (targetUid === 'uid3026' || user.email === 'cryptodrop077@gmail.com') throw new Error("Cannot block Admin");
    
    user.isBlocked = !user.isBlocked;
    saveUsers(users);
    return user;
};

export const adminUpdateFunds = async (targetUid: string, type: 'USDT' | 'BTC', amount: number) => {
    const users = getUsers();
    const user = users[targetUid];
    if (!user) throw new Error("User not found");
    
    if (type === 'USDT') {
        user.usdtBalance += amount;
        if (user.usdtBalance < 0) user.usdtBalance = 0;
    } else {
        user.btcBalance += amount;
        if (user.btcBalance < 0) user.btcBalance = 0;
    }
    
    saveUsers(users);
    return user;
};

export const adminSetPlan = async (targetUid: string, level: number) => {
    const users = getUsers();
    const user = users[targetUid];
    if (!user) throw new Error("User not found");
    
    user.vipLevel = level;
    // RESET MINING TIMER: Enforce 24-hour wait if Admin upgrades the plan
    user.lastMiningTime = Date.now();

    saveUsers(users);
    return user;
};

export const adminResetUserBalance = async (targetUid: string) => {
    const users = getUsers();
    const user = users[targetUid];
    if (!user) throw new Error("User not found");
    
    user.usdtBalance = 0;
    user.btcBalance = 0;
    user.totalEarned = 0;
    user.referralEarnings = 0;
    
    saveUsers(users);
    return user;
}

export const adminDeleteUser = async (targetUid: string) => {
    const users = getUsers();
    if (!users[targetUid]) throw new Error("User not found");
    if (targetUid === 'uid3026') throw new Error("Cannot delete Admin account");

    delete users[targetUid];
    saveUsers(users);
}

export const getAllUsersAdmin = () => getUsers();