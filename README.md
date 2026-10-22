# Playwright Automation Setup (JavaScript)

हा प्रोजेक्ट Playwright सह एंड-टू-एंड ऑटोमेशन टेस्ट्स चालवण्यासाठी तयार केला आहे.

## प्रोजेक्ट संरचना (Project Structure)

```
boardview  Automation/
├── .gitignore
├── package.json
├── playwright.config.js       # Playwright कॉन्फिगरेशन
├── tests/
│   └── example.spec.js        # सॅम्पल टेस्ट स्क्रिप्ट
└── README.md
```

## उपलब्ध कमांड्स (Available Scripts)

टर्मिनलमध्ये खालीलपैकी कोणतीही कमांड रन करू शकता:

1. **सर्व टेस्ट्स रन करणे (Headless Mode):**
   ```bash
   npm test
   ```
   किंवा फक्त Chromium वर:
   ```bash
   npx playwright test --project=chromium
   ```

2. **ब्राउझर उघडून टेस्ट बघणे (Headed Mode):**
   ```bash
   npm run test:headed
   ```

3. **Playwright चा इंटरॅक्टिव्ह UI मोड:**
   ```bash
   npm run test:ui
   ```

4. **डिबगिंग मोड (Playwright Inspector):**
   ```bash
   npm run test:debug
   ```

5. **HTML टेस्ट रिपोर्ट पाहणे:**
   ```bash
   npm run report
   ```

## नवीन टेस्ट कशी लिहावी?

`tests/` फोल्डरमध्ये नवीन `.spec.js` फाईल तयार करा, उदाहरणार्थ `tests/login.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => {
  await page.goto('https://example.com');
  // आपले ऑटोमेशन कोड येथे लिहा
});
```
