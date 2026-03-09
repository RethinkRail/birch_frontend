const fs = require('fs');
const path = require('path');
require('dotenv').config();

const templatePath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.template.js');
const outputPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');

let template = fs.readFileSync(templatePath, 'utf8');

// Replace all %VARIABLE% placeholders with env values
template = template.replace(/%([^%]+)%/g, (match, varName) => {
    return process.env[varName] || match;
});

fs.writeFileSync(outputPath, template, 'utf8');
console.log('firebase-messaging-sw.js generated successfully.');