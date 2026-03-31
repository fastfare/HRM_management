const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read JSON file and return array
 * @param {string} filename - Name of JSON file (e.g., 'employees.json')
 * @returns {Array} Array of objects
 */
function readJSON(filename) {
    try {
        const filepath = path.join(DATA_DIR, filename);

        // Create empty file if doesn't exist
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, '[]', 'utf8');
            return [];
        }

        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error.message);
        return [];
    }
}

/**
 * Write array to JSON file
 * @param {string} filename - Name of JSON file
 * @param {Array} data - Array of objects to write
 * @returns {boolean} Success status
 */
function writeJSON(filename, data) {
    try {
        const filepath = path.join(DATA_DIR, filename);
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filepath, jsonData, 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error.message);
        return false;
    }
}

/**
 * Find item by ID
 * @param {string} filename - JSON file name
 * @param {string} id - Item ID to find
 * @returns {Object|null} Found item or null
 */
function findById(filename, id) {
    const data = readJSON(filename);
    return data.find(item => item.id === id) || null;
}

/**
 * Add new item to file
 * @param {string} filename - JSON file name
 * @param {Object} item - Item to add
 * @returns {boolean} Success status
 */
function addItem(filename, item) {
    const data = readJSON(filename);
    data.push(item);
    return writeJSON(filename, data);
}

/**
 * Update item by ID
 * @param {string} filename - JSON file name
 * @param {string} id - Item ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} Success status
 */
function updateItem(filename, id, updates) {
    const data = readJSON(filename);
    const index = data.findIndex(item => item.id === id);

    if (index !== -1) {
        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        return writeJSON(filename, data);
    }

    return false;
}

/**
 * Soft delete item (set status to inactive)
 * @param {string} filename - JSON file name
 * @param {string} id - Item ID
 * @returns {boolean} Success status
 */
function deleteItem(filename, id) {
    return updateItem(filename, id, { status: 'inactive' });
}

/**
 * Filter items by criteria
 * @param {string} filename - JSON file name
 * @param {Function} predicate - Filter function
 * @returns {Array} Filtered items
 */
function filterItems(filename, predicate) {
    const data = readJSON(filename);
    return data.filter(predicate);
}

module.exports = {
    readJSON,
    writeJSON,
    findById,
    addItem,
    updateItem,
    deleteItem,
    filterItems
};
