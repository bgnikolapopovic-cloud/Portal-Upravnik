/**
 * dateUtils.js - Centralized date/time formatting utilities
 * Consolidates date/time formatting logic for consistent formatting across the application
 */

/**
 * Format milliseconds timestamp as localized date and time
 * @param {number} ms - timestamp in milliseconds
 * @returns {string} formatted date and time (e.g., "25.1.2026. 19:41:15")
 */
function fmtDateTime(ms) {
  const d = new Date(ms);
  return d.toLocaleString("sr-RS");
}

/**
 * Format milliseconds timestamp as date only
 * @param {number} ms - timestamp in milliseconds
 * @returns {string} formatted date (e.g., "25.1.2026.")
 */
function fmtDateOnly(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("sr-RS");
}

/**
 * Format date string (YYYY-MM-DD) to DMY format
 * @param {string} dateStr - date string in YYYY-MM-DD format
 * @returns {string} formatted date in DD.MM.YYYY format
 */
function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}.${month}.${year}.`;
}

/**
 * Calculate days between two timestamps
 * @param {number} ms1 - first timestamp in milliseconds
 * @param {number} ms2 - second timestamp in milliseconds
 * @returns {number} number of days between the two timestamps
 */
function daysBetween(ms1, ms2) {
  const diff = Math.abs(Number(ms1 || 0) - Number(ms2 || 0));
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days left until a timestamp
 * @param {number} ms - target timestamp in milliseconds
 * @returns {number} number of days left (0 if already passed)
 */
function daysLeftUntil(ms) {
  const diff = Number(ms || 0) - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get current year-month in YYYY-MM format
 * @returns {string} current year-month (e.g., "2026-01")
 */
function ymNow() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Convert year-month string to index (useful for month calculations)
 * @param {string} ym - year-month in YYYY-MM format
 * @returns {number} index representing the month (year * 12 + month - 1)
 */
function ymToIndex(ym) {
  const [y, m] = String(ym || "").split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return 0;
  return y * 12 + (m - 1);
}

/**
 * Calculate number of months between two year-month strings (inclusive)
 * @param {string} startYM - start year-month in YYYY-MM format
 * @param {string} endYM - end year-month in YYYY-MM format
 * @returns {number} number of months between (inclusive)
 */
function monthsBetweenInclusive(startYM, endYM) {
  return Math.max(0, ymToIndex(endYM) - ymToIndex(startYM) + 1);
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} today's date
 */
function getTodayYMD() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse date string and return Date object
 * @param {string} dateStr - date string in various formats
 * @returns {Date|null} Date object or null if invalid
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if a date is in the past
 * @param {number|string} date - timestamp or date string
 * @returns {boolean} true if date is in the past, false if invalid or future
 */
function isPast(date) {
  const timestamp = typeof date === 'string' ? parseDate(date)?.getTime() : date;
  if (!timestamp || !Number.isFinite(timestamp)) return false;
  return timestamp < Date.now();
}

/**
 * Check if a date is in the future
 * @param {number|string} date - timestamp or date string
 * @returns {boolean} true if date is in the future, false if invalid or past
 */
function isFuture(date) {
  const timestamp = typeof date === 'string' ? parseDate(date)?.getTime() : date;
  if (!timestamp || !Number.isFinite(timestamp)) return false;
  return timestamp > Date.now();
}
