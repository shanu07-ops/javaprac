# CodeNest Java Lab (Basic Version, practical file design)

Core Java practice website - HTML + CSS + plain JavaScript.

## Run
`index.html` ko browser me open karo. Kisi server ki zarurat nahi.

## Files
- index.html, topics.html, questions.html, solution.html - 4 pages
- style.css - saari styling (light paper theme + dark mode)
- script.js - saari logic (topics, search, solution page, progress)
- js/data.js - topics ki list
- js/topics/*.js - har topic ke questions
- assets/ - output screenshots

## Naya question add karna
Kisi bhi `js/topics/<topic>.js` file me array ke end me ek naya object add karo
(id us topic me unique honi chahiye).
