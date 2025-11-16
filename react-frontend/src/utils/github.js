/**
 * Extracts GitHub username from various input formats
 * @param {string} input - GitHub URL or username
 * @returns {string} - Extracted username
 */
export function extractGitHubUsername(input) {
  if (!input) return '';
  
  const trimmed = input.trim();
  
  // If it's already just a username (no slashes or dots)
  if (!trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  
  // Remove protocol if present
  let cleaned = trimmed.replace(/^https?:\/\//, '');
  
  // Remove www. if present
  cleaned = cleaned.replace(/^www\./, '');
  
  // Remove github.com if present
  cleaned = cleaned.replace(/^github\.com\/?/, '');
  
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  
  // Extract username (first part before any slash)
  const parts = cleaned.split('/');
  const username = parts[0];
  
  return username;
}

/**
 * Validates if a string looks like a valid GitHub username
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid format
 */
export function isValidGitHubUsername(username) {
  if (!username || typeof username !== 'string') return false;
  
  // GitHub usernames:
  // - Can't be longer than 39 characters
  // - Can only contain alphanumeric characters and hyphens
  // - Can't start with a hyphen
  // - Can't have consecutive hyphens
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  
  return usernameRegex.test(username);
}

