/**
 * renderUtils.js - Centralized HTML rendering utilities
 * Consolidates repetitive HTML rendering logic with template-based approaches
 */

/**
 * Create an HTML element from a template string
 * @param {string} tagName - tag name for the element
 * @param {Object} attributes - object with attribute key-value pairs
 * @param {string|Array} content - HTML content or array of child elements
 * @returns {HTMLElement} created element
 */
function createElement(tagName, attributes = {}, content = "") {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "className" || key === "class") {
      element.className = value;
    } else if (key === "dataset") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith("on") && typeof value === "function") {
      // Event listener
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Set content
  if (Array.isArray(content)) {
    content.forEach(child => {
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else {
        element.appendChild(document.createTextNode(String(child)));
      }
    });
  } else if (content && typeof content === "string") {
    // Only use innerHTML if explicitly marked as safe
    // For user content, use textContent or sanitize first
    element.innerHTML = content;
  } else if (content) {
    element.textContent = String(content);
  }
  
  return element;
}

/**
 * Create a button element with common attributes
 * @param {Object} options - button options { text, className, type, onClick, disabled }
 * @returns {HTMLElement} button element
 */
function createButton(options = {}) {
  const {
    text = "",
    className = "btn",
    type = "button",
    onClick = null,
    disabled = false,
    ...otherAttrs
  } = options;
  
  const attrs = {
    type,
    className,
    ...otherAttrs
  };
  
  if (disabled) attrs.disabled = true;
  if (onClick) attrs.onClick = onClick;
  
  const button = createElement("button", attrs);
  button.textContent = text;
  
  return button;
}

/**
 * Create a pill badge element
 * @param {string} text - badge text
 * @param {string} className - additional class name
 * @returns {HTMLElement} badge element
 */
function createPill(text, className = "") {
  const span = document.createElement("span");
  span.className = `pill ${className}`.trim();
  span.textContent = text;  // Use textContent instead of innerHTML for security
  return span;
}

/**
 * Render a list of items with a template function
 * @param {HTMLElement} container - container element to render into
 * @param {Array} items - array of items to render
 * @param {Function} itemRenderer - function that takes an item and returns an HTMLElement
 * @param {string} emptyMessage - message to display when no items
 */
function renderList(container, items, itemRenderer, emptyMessage = "Nema stavki.") {
  if (!container) return;
  
  container.innerHTML = "";
  
  if (!items || items.length === 0) {
    const empty = createElement("div", {
      className: "smallText"
    }, `<span class="badge">${escapeHTML(emptyMessage)}</span>`);
    container.appendChild(empty);
    return;
  }
  
  items.forEach(item => {
    const element = itemRenderer(item);
    if (element) {
      container.appendChild(element);
    }
  });
}

/**
 * Create a dropdown option element
 * @param {string} value - option value
 * @param {string} text - option display text
 * @param {boolean} selected - whether option is selected
 * @returns {HTMLElement} option element
 */
function createOption(value, text, selected = false) {
  const option = createElement("option", { value });
  option.textContent = text;
  if (selected) option.selected = true;
  return option;
}

/**
 * Render options in a select element
 * @param {HTMLElement} select - select element
 * @param {Array} options - array of {value, text} objects or strings
 * @param {string} placeholder - placeholder option text
 * @param {string} selectedValue - value to select
 */
function renderSelectOptions(select, options, placeholder = null, selectedValue = "") {
  if (!select) return;
  
  select.innerHTML = "";
  
  if (placeholder) {
    const opt = createOption("", placeholder);
    select.appendChild(opt);
  }
  
  options.forEach(option => {
    const value = typeof option === "string" ? option : option.value;
    const text = typeof option === "string" ? option : option.text;
    const opt = createOption(value, text, value === selectedValue);
    select.appendChild(opt);
  });
}

/**
 * Create a search result item element
 * @param {Object} item - search result item { page, sid, text, sub }
 * @param {Function} tagForPage - function to get tag label for page
 * @returns {HTMLElement} search result element
 */
function createSearchResultItem(item, tagForPage) {
  const srTag = createElement("div", {
    className: "srTag"
  }, tagForPage(item.page));
  
  const subHtml = item.sub ? `<div class="srSub">${escapeHTML(item.sub)}</div>` : "";
  const srText = createElement("div", {
    className: "srText"
  }, `${escapeHTML(item.text)}${subHtml}`);
  
  return createElement("div", {
    className: "srItem",
    dataset: { page: item.page, sid: item.sid }
  }, [srTag, srText]);
}

/**
 * Create a metadata pill container with multiple pills
 * @param {Array} pills - array of {text, className} objects
 * @returns {HTMLElement} container with pills
 */
function createMetaPills(pills) {
  const container = createElement("div", {
    className: "itemMeta"
  });
  
  pills.forEach(pill => {
    if (pill.text) {
      container.appendChild(createPill(pill.text, pill.className || ""));
    }
  });
  
  return container;
}

/**
 * Create an action button group
 * @param {Array} buttons - array of button option objects
 * @returns {HTMLElement} container with buttons
 */
function createActionButtons(buttons) {
  const container = createElement("div", {
    className: "finRowActions",
    style: "display: flex; gap: 8px;"
  });
  
  buttons.forEach(btnOpts => {
    const btn = createButton(btnOpts);
    container.appendChild(btn);
  });
  
  return container;
}

/**
 * Render search dropdown with grouped results
 * @param {HTMLElement} container - container element
 * @param {string} query - search query
 * @param {Array} hits - search hits array
 * @param {Function} tagForPage - function to get tag for page
 * @param {Array} pageOrder - order of pages to display
 */
function renderSearchDropdown(container, query, hits, tagForPage, pageOrder = []) {
  if (!container) return;
  
  const qq = query ? String(query).trim().toUpperCase() : "";
  
  if (!qq) {
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }
  
  if (!hits || hits.length === 0) {
    container.innerHTML = `
      <div class="srHead">Rezultati</div>
      <div class="srItem" style="cursor:default;">
        <div class="srText">Nema rezultata za "${escapeHTML(query)}".
          <div class="srSub">Probaj drugi pojam (npr. "krov", "lift", "193").</div>
        </div>
      </div>
    `;
    container.style.display = "block";
    return;
  }
  
  // Group hits by page
  const grouped = new Map();
  for (const h of hits) {
    const key = h.page;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(h);
  }
  
  // Build HTML
  const fragment = document.createDocumentFragment();
  
  const header = createElement("div", {
    className: "srHead"
  }, `Rezultati za "${escapeHTML(query)}"`);
  fragment.appendChild(header);
  
  for (const page of pageOrder) {
    const arr = grouped.get(page);
    if (!arr || !arr.length) continue;
    
    const slice = arr.slice(0, 3);
    slice.forEach(item => {
      fragment.appendChild(createSearchResultItem(item, tagForPage));
    });
  }
  
  container.innerHTML = "";
  container.appendChild(fragment);
  container.style.display = "block";
}

/**
 * Create a form field wrapper with label
 * @param {string} label - field label
 * @param {HTMLElement} input - input element
 * @param {string} hint - optional hint text
 * @returns {HTMLElement} field wrapper
 */
function createFormField(label, input, hint = "") {
  const field = createElement("div", {
    className: "field"
  });
  
  const labelEl = createElement("label", {}, label);
  field.appendChild(labelEl);
  field.appendChild(input);
  
  if (hint) {
    const hintEl = createElement("div", {
      className: "miniHint"
    }, hint);
    field.appendChild(hintEl);
  }
  
  return field;
}

/**
 * Toggle button classes for tab switching
 * @param {HTMLElement} button - button element to toggle
 * @param {boolean} isActive - whether button should be active
 */
function toggleButtonActive(button, isActive) {
  if (!button) return;
  
  if (isActive) {
    button.classList.add("btnPrimary");
    button.classList.remove("btnGhost");
  } else {
    button.classList.add("btnGhost");
    button.classList.remove("btnPrimary");
  }
}

/**
 * Create a card/list item template
 * @param {Object} options - card options { className, header, body, footer, dataset }
 * @returns {HTMLElement} card element
 */
function createCard(options = {}) {
  const {
    className = "finCard",
    header = null,
    body = null,
    footer = null,
    dataset = {}
  } = options;
  
  const card = createElement("div", {
    className,
    dataset
  });
  
  if (header) {
    const headerEl = typeof header === "string" 
      ? createElement("div", { className: "cardHeader" }, header)
      : header;
    card.appendChild(headerEl);
  }
  
  if (body) {
    const bodyEl = typeof body === "string"
      ? createElement("div", { className: "cardBody" }, body)
      : body;
    card.appendChild(bodyEl);
  }
  
  if (footer) {
    const footerEl = typeof footer === "string"
      ? createElement("div", { className: "cardFooter" }, footer)
      : footer;
    card.appendChild(footerEl);
  }
  
  return card;
}
