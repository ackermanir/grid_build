// Import version from package.json
const packageJson = require('../package.json');

export const version = packageJson.version;
export const lastUpdated = new Date().toLocaleString(); 