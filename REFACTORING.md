# Code Refactoring Documentation

This document explains the refactoring changes made to improve code maintainability and reduce duplication in Portal Upravnik.

## Overview

The refactoring introduces four utility modules that consolidate repetitive code patterns:

1. **storageUtils.js** - localStorage operations
2. **dateUtils.js** - Date/time formatting
3. **validationUtils.js** - Input validation and error handling
4. **renderUtils.js** - HTML rendering functions

## 1. Storage Utilities (storageUtils.js)

### Purpose
Centralizes localStorage operations with standardized error handling and consistent patterns.

### Key Functions

#### Generic Storage Operations
```javascript
// Generic load with error handling
const data = loadFromStorage(key, defaultValue, seedValue);

// Generic save with error handling
const success = saveToStorage(key, value);
```

#### Specific Storage Operations
```javascript
// Buildings
const buildings = loadBuildingsDB();
saveBuildingsDB(buildings);

// Users
const users = loadUsersDB();
saveUsersDB(users);

// Dues (per building)
const dues = loadDues(buildingId);
saveDues(buildingId, duesObject);

// Finance items
const items = loadItems(buildingId, optionalSeedData);
saveItems(buildingId, items);

// Firms
const firms = loadFirms(buildingId, optionalSeedData);
saveFirms(buildingId, firms);

// Board posts
const posts = loadBoardPosts(buildingId, optionalSeedData);
saveBoardPosts(buildingId, posts);

// Forum proposals
const proposals = loadProposals(buildingId, optionalSeedData);
saveProposals(buildingId, proposals);

// Opening balance
const balance = loadOpeningBalance(buildingId);
saveOpeningBalance(buildingId, amount);

// Read tracking
const readMap = loadReadMap(buildingId, contentType);
saveReadMap(buildingId, contentType, map);
```

### Migration Example

**Before:**
```javascript
function loadDues(bid){
  const raw = localStorage.getItem(kDues(bid));
  if(!raw){
    const seed = { monthlyFee: 2000, startMonth, paymentsByUser: {} };
    localStorage.setItem(kDues(bid), JSON.stringify(seed));
    return seed;
  }
  try{
    return JSON.parse(raw) || {};
  }catch{
    return { monthlyFee: 2000, startMonth: "2025-01", paymentsByUser: {} };
  }
}
```

**After:**
```javascript
// Function already available in storageUtils.js
// Just use: loadDues(buildingId)
```

## 2. Date Utilities (dateUtils.js)

### Purpose
Provides consistent date/time formatting across the application.

### Key Functions

```javascript
// Format timestamp to localized date and time
const dateTime = fmtDateTime(timestamp);  // "25.1.2026. 19:41:15"

// Format timestamp to date only
const date = fmtDateOnly(timestamp);  // "25.1.2026."

// Format YYYY-MM-DD to DD.MM.YYYY.
const formatted = formatDateDMY("2026-01-25");  // "25.01.2026."

// Calculate days between timestamps
const days = daysBetween(timestamp1, timestamp2);

// Calculate days left until timestamp
const daysLeft = daysLeftUntil(futureTimestamp);

// Get current year-month
const currentYM = ymNow();  // "2026-01"

// Convert year-month to index
const index = ymToIndex("2026-01");

// Calculate months between two year-months
const months = monthsBetweenInclusive("2025-12", "2026-03");

// Get today's date in YYYY-MM-DD format
const today = getTodayYMD();  // "2026-01-25"

// Check if date is in past/future
const past = isPast(timestamp);
const future = isFuture(timestamp);
```

### Migration Example

**Before:**
```javascript
function fmtDateTime(ms){
  const d = new Date(ms);
  return d.toLocaleString("sr-RS");
}

function fmtDateOnly(ms){
  if(!ms) return "";
  return new Date(ms).toLocaleDateString("sr-RS");
}
```

**After:**
```javascript
// Functions already available in dateUtils.js
// Just use: fmtDateTime(ms) and fmtDateOnly(ms)
```

## 3. Validation Utilities (validationUtils.js)

### Purpose
Centralizes input validation and error handling with consistent error messages.

### Key Functions

#### Field Validation
```javascript
// Validate required field
const result = validateRequired(value, "Field name");
if (!result.valid) {
  alert(result.error);
}

// Validate multiple required fields
const result = validateRequiredFields([
  { value: name, name: "Name" },
  { value: email, name: "Email" }
]);

// Validate email
const result = validateEmail(email);

// Validate number with options
const result = validateNumber(value, "Amount", {
  min: 0,
  max: 1000000,
  integer: true
});

// Validate date
const result = validateDate(dateStr, "Date");

// Validate string length
const result = validateLength(value, { min: 5, max: 100 }, "Description");
```

#### File Validation
```javascript
// Validate file size and type
const result = validateFile(file, {
  maxSizeMB: 5,
  allowedTypes: ['.pdf', '.jpg', '.png', 'image/jpeg']
});

// Just validate size
const result = validateFileSize(file, 10);  // 10MB max

// Just validate type
const result = validateFileType(file, ['.pdf', '.doc']);
```

#### Error Display
```javascript
// Show error in UI element
showError(errorElement, "Error message");

// Hide error
hideError(errorElement);

// Show alert with logging
showAlert("Error occurred", optionalErrorObject);

// Validate permission with alert
if (!validatePermission(hasPermission, "Custom message")) {
  return;
}
```

#### HTML Sanitization
```javascript
// Escape HTML to prevent XSS
const safe = escapeHTML(userInput);
element.innerHTML = safe;
```

### Migration Example

**Before:**
```javascript
if (!unitCode || !ownerFullName) {
  alert("Popuni: ID stana + Ime i prezime.");
  return;
}

if (!canAdjustDues()) return alert("Nemate dozvolu.");
```

**After:**
```javascript
const validation = validateRequiredFields([
  { value: unitCode, name: "ID stana" },
  { value: ownerFullName, name: "Ime i prezime" }
]);

if (!validation.valid) {
  showAlert(validation.error);
  return;
}

if (!validatePermission(canAdjustDues(), "Nemate dozvolu.")) {
  return;
}
```

## 4. Render Utilities (renderUtils.js)

### Purpose
Provides template-based HTML generation to reduce hardcoded repetitive rendering code.

### Key Functions

#### Element Creation
```javascript
// Create generic element
const div = createElement("div", {
  className: "my-class",
  dataset: { id: "123" },
  onClick: () => console.log("clicked")
}, "Content or HTML");

// Create button
const button = createButton({
  text: "Save",
  className: "btn btnPrimary",
  onClick: handleSave,
  disabled: false
});

// Create pill badge
const pill = createPill("Prihod", "type-prihod");

// Create option
const option = createOption("value1", "Display Text", true);
```

#### List Rendering
```javascript
// Render list with template function
renderList(container, items, (item) => {
  return createElement("div", {
    className: "item"
  }, item.text);
}, "No items found");

// Render select options
renderSelectOptions(selectElement, [
  { value: "1", text: "Option 1" },
  { value: "2", text: "Option 2" }
], "Select option", "1");
```

#### Complex Components
```javascript
// Create metadata pills
const pills = createMetaPills([
  { text: "25.01.2026.", className: "" },
  { text: "Prihod", className: "type-prihod" },
  { text: "Kategorija", className: "" }
]);

// Create action buttons
const actions = createActionButtons([
  { text: "Edit", className: "btn btnGhost", onClick: handleEdit },
  { text: "Delete", className: "btn btnGhost danger", onClick: handleDelete }
]);

// Create card
const card = createCard({
  className: "finCard",
  header: headerElement,
  body: bodyElement,
  footer: footerElement,
  dataset: { id: "123" }
});

// Render search dropdown
renderSearchDropdown(
  container,
  query,
  searchHits,
  (page) => getPageTag(page),
  ["finansije", "oglasna", "forum"]
);
```

#### Button State Management
```javascript
// Toggle button active state (primary/ghost)
toggleButtonActive(button, isActive);
```

#### Form Fields
```javascript
// Create form field with label
const field = createFormField(
  "Email Address",
  inputElement,
  "Enter a valid email"
);
```

### Migration Example

**Before:**
```javascript
const button = document.createElement("button");
button.className = "btn btnGhost";
button.type = "button";
button.textContent = "Edit";
button.addEventListener("click", handleEdit);
actions.appendChild(button);
```

**After:**
```javascript
const button = createButton({
  text: "Edit",
  className: "btn btnGhost",
  onClick: handleEdit
});
actions.appendChild(button);
```

## Benefits of Refactoring

### 1. Reduced Code Duplication
- Storage operations consolidated into reusable functions
- Date formatting standardized across application
- Validation logic centralized and consistent

### 2. Improved Maintainability
- Changes to storage format only require updating one place
- Date format changes affect entire application consistently
- Validation rules can be updated globally

### 3. Better Error Handling
- All storage operations have try-catch blocks
- Validation provides consistent error messages
- Error display is standardized

### 4. Enhanced Security
- HTML sanitization prevents XSS attacks
- File validation prevents malicious uploads
- Input validation prevents invalid data

### 5. Easier Testing
- Utility functions can be tested independently
- Mocking is easier with separated concerns
- Edge cases are handled consistently

## Migration Strategy

The refactoring was designed to be backward compatible:

1. **Utility files added** - New modules provide improved versions of functions
2. **Original functions preserved** - Existing code continues to work
3. **Gradual migration** - New code uses utilities, old code still works
4. **No breaking changes** - Application functionality unchanged

### Recommended Next Steps

1. **New features** - Use utility functions from the start
2. **Bug fixes** - Migrate affected code to utilities
3. **Refactoring** - Gradually replace old patterns with new utilities
4. **Testing** - Add tests for utility functions
5. **Documentation** - Update inline docs to reference utilities

## Example: Complete Refactoring

### Before (renderFinanceList)
```javascript
const li = document.createElement("li");
li.dataset.sid = "fin:" + item.id;
li.classList.add("finCard");

const title = document.createElement("div");
title.className = "finRowTitle";
title.innerHTML = `
  <div class="itemHead">
    <span class="pill">${escapeHTML(dmy)}</span>
    <span class="pill ${typeClass}">${escapeHTML(typeLabel)}</span>
  </div>
`;

const edit = document.createElement("button");
edit.className = "finActBtn";
edit.type = "button";
edit.textContent = "Edit";
edit.addEventListener("click", handleEdit);
```

### After (using utilities)
```javascript
const pills = createMetaPills([
  { text: formatDateDMY(item.date), className: "" },
  { text: typeLabel, className: typeClass }
]);

const actions = createActionButtons([
  { text: "Izmeni", className: "finActBtn", onClick: handleEdit },
  { text: "Obriši", className: "finActBtn danger", onClick: handleDelete }
]);

const li = createCard({
  className: "finCard",
  header: pills,
  body: bodyContent,
  footer: actions,
  dataset: { sid: "fin:" + item.id }
});
```

## Conclusion

These utilities provide a foundation for cleaner, more maintainable code. They reduce duplication, improve consistency, and make the codebase easier to understand and modify. The backward-compatible approach ensures no disruption to existing functionality while enabling gradual improvement of the codebase.
