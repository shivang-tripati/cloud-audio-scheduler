// hash.js
const bcrypt = require('bcrypt');

(async () => {
    try {
        const password = "admin@#$123";   // replace with the password you want to hash
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        console.log("Generated hash:", hash);
    } catch (err) {
        console.error("Error hashing password:", err);
    }
})();
