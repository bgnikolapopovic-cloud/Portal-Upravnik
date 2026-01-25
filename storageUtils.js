/**
 * storageUtils.js - Centralized localStorage operations
 * Consolidates repetitive localStorage read/write operations with standardized error handling
 */

/**
 * Generic function to load data from localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} defaultValue - default value if key doesn't exist or parsing fails
 * @param {*} seedValue - optional seed value to initialize if key doesn't exist
 * @returns {*} parsed data or default value
 */
function loadFromStorage(key, defaultValue = [], seedValue = null) {
  try {
    const raw = localStorage.getItem(key);
    
    if (!raw) {
      // If seed value provided, initialize storage with it
      if (seedValue !== null) {
        localStorage.setItem(key, JSON.stringify(seedValue));
        return seedValue;
      }
      return defaultValue;
    }
    
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * Generic function to save data to localStorage
 * @param {string} key - localStorage key
 * @param {*} value - value to save (will be JSON stringified)
 * @returns {boolean} true if successful, false otherwise
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Load buildings database
 * @returns {Array} array of building objects
 */
function loadBuildingsDB() {
  const KEY_BUILDINGS_DB = "pu_buildings_db_v1";
  return loadFromStorage(KEY_BUILDINGS_DB, []);
}

/**
 * Save buildings database
 * @param {Array} rows - array of building objects
 * @returns {boolean} success status
 */
function saveBuildingsDB(rows) {
  const KEY_BUILDINGS_DB = "pu_buildings_db_v1";
  return saveToStorage(KEY_BUILDINGS_DB, rows);
}

/**
 * Load users database
 * @returns {Array} array of user objects
 */
function loadUsersDB() {
  const KEY_USERS_DB = "PORTAL_USERS_DB";
  return loadFromStorage(KEY_USERS_DB, []);
}

/**
 * Save users database
 * @param {Array} rows - array of user objects
 * @returns {boolean} success status
 */
function saveUsersDB(rows) {
  const KEY_USERS_DB = "PORTAL_USERS_DB";
  return saveToStorage(KEY_USERS_DB, rows || []);
}

/**
 * Generate storage key for dues
 * @param {string} bid - building ID
 * @returns {string} storage key
 */
function kDues(bid) {
  return "pu_dues_v1__" + bid;
}

/**
 * Load dues data for a building
 * @param {string} bid - building ID
 * @returns {Object} dues object with monthlyFee, startMonth, paymentsByUser
 */
function loadDues(bid) {
  const now = new Date();
  const startMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const defaultSeed = { monthlyFee: 2000, startMonth, paymentsByUser: {} };
  
  const data = loadFromStorage(kDues(bid), null, defaultSeed);
  
  // If loadFromStorage returns null (error case), use defaultSeed
  if (!data) return defaultSeed;
  
  // Normalize data structure
  data.monthlyFee = Number(data.monthlyFee ?? 2000);
  data.startMonth = String(data.startMonth || startMonth);
  data.paymentsByUser = data.paymentsByUser || {};
  
  return data;
}

/**
 * Save dues data for a building
 * @param {string} bid - building ID
 * @param {Object} obj - dues object
 * @returns {boolean} success status
 */
function saveDues(bid, obj) {
  return saveToStorage(kDues(bid), obj);
}

/**
 * Generate storage key for finance items
 * @param {string} bid - building ID
 * @returns {string} storage key
 */
function kFinanceItems(bid) {
  return "pu_finance_items_v3__" + bid;
}

/**
 * Load finance items for a building
 * Note: Seed data should be provided by the main application
 * @param {string} bid - building ID
 * @param {Array} seedData - optional seed data to initialize storage
 * @returns {Array} array of finance item objects
 */
function loadItems(bid, seedData = null) {
  return loadFromStorage(kFinanceItems(bid), [], seedData);
}

/**
 * Save finance items for a building
 * @param {string} bid - building ID
 * @param {Array} items - array of finance items
 * @returns {boolean} success status
 */
function saveItems(bid, items) {
  return saveToStorage(kFinanceItems(bid), items);
}

/**
 * Generate storage key for firms
 * @param {string} bid - building ID
 * @returns {string} storage key
 */
function kFirms(bid) {
  return "pu_finance_firms_v3__" + bid;
}

/**
 * Load firms for a building
 * @param {string} bid - building ID
 * @param {Array} seedData - optional seed data to initialize storage
 * @returns {Array} array of firm names
 */
function loadFirms(bid, seedData = null) {
  return loadFromStorage(kFirms(bid), [], seedData);
}

/**
 * Save firms for a building
 * @param {string} bid - building ID
 * @param {Array} firms - array of firm names
 * @returns {boolean} success status
 */
function saveFirms(bid, firms) {
  return saveToStorage(kFirms(bid), firms);
}

/**
 * Generate storage key for board posts
 * @param {string} bid - building ID
 * @returns {string} storage key
 */
function kBoard(bid) {
  return "pu_board_posts_v2__" + bid;
}

/**
 * Load board posts for a building
 * Note: Seed data should be provided by the main application
 * @param {string} bid - building ID
 * @param {Array} seedData - optional seed data to initialize storage
 * @returns {Array} array of board post objects
 */
function loadBoardPosts(bid, seedData = null) {
  return loadFromStorage(kBoard(bid), [], seedData);
}

/**
 * Save board posts for a building
 * @param {string} bid - building ID
 * @param {Array} items - array of board posts
 * @returns {boolean} success status
 */
function saveBoardPosts(bid, items) {
  return saveToStorage(kBoard(bid), items);
}

/**
 * Generate storage key for forum proposals
 * @param {string} bid - building ID
 * @returns {string} storage key
 */
function kForum(bid) {
  return "pu_forum_proposals_v2__" + bid;
}

/**
 * Load forum proposals for a building
 * Note: Seed data should be provided by the main application
 * @param {string} bid - building ID
 * @param {Array} seedData - optional seed data to initialize storage
 * @returns {Array} array of proposal objects
 */
function loadProposals(bid, seedData = null) {
  return loadFromStorage(kForum(bid), [], seedData);
}

/**
 * Save forum proposals for a building
 * @param {string} bid - building ID
 * @param {Array} items - array of proposals
 * @returns {boolean} success status
 */
function saveProposals(bid, items) {
  return saveToStorage(kForum(bid), items);
}

/**
 * Generate storage key for opening balance
 * @param {string} bid - building ID
 * @returns {string} storage key
 */
function kOpeningBalance(bid) {
  return "pu_opening_balance__" + bid;
}

/**
 * Load opening balance for a building
 * @param {string} bid - building ID
 * @returns {number} opening balance
 */
function loadOpeningBalance(bid) {
  const raw = localStorage.getItem(kOpeningBalance(bid));
  if (!raw) {
    const seed = 0;
    localStorage.setItem(kOpeningBalance(bid), String(seed));
    return seed;
  }
  return Number(raw) || 0;
}

/**
 * Save opening balance for a building
 * @param {string} bid - building ID
 * @param {number} val - balance value
 * @returns {boolean} success status
 */
function saveOpeningBalance(bid, val) {
  try {
    localStorage.setItem(kOpeningBalance(bid), String(Number(val || 0)));
    return true;
  } catch (error) {
    console.error(`Error saving opening balance:`, error);
    return false;
  }
}

/**
 * Generate storage key for read tracking
 * @param {string} bid - building ID
 * @param {string} kind - type of content (e.g., 'board', 'forum')
 * @returns {string} storage key
 */
function kRead(bid, kind) {
  return `pu_read_${kind}__${bid}`;
}

/**
 * Load read tracking map for a building and content type
 * @param {string} bid - building ID
 * @param {string} kind - content type
 * @returns {Object} map of item IDs to read timestamps
 */
function loadReadMap(bid, kind) {
  return loadFromStorage(kRead(bid, kind), {});
}

/**
 * Save read tracking map for a building and content type
 * @param {string} bid - building ID
 * @param {string} kind - content type
 * @param {Object} map - map of item IDs to read timestamps
 * @returns {boolean} success status
 */
function saveReadMap(bid, kind, map) {
  return saveToStorage(kRead(bid, kind), map);
}
