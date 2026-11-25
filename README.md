# PlantDOC

PlantDOC is a static, zero-cost starter website based on the supplied original project. It runs in a modern browser and does not require a build step, account, database or paid service.

## Files
- `index.html` — page structure and content
- `style.css` — responsive visual design
- `script.js` — plant collection, browser storage, symptom guidance, photo preview, import/export
- `README.md` — setup, limitations and launch notes

## Run locally
Open `index.html` in a modern browser, or use VS Code Live Server. The Google Fonts import is optional; the site falls back to system fonts if offline.

## Included in this version
- Responsive mobile and desktop layout
- Add/remove plants, search and filter
- Soil-check reminder dates (a prompt to check soil, not an automatic watering prescription)
- Local browser storage
- JSON backup export and import
- Symptom-based educational guidance for seven common observations
- Photo upload, preview and structured visual-inspection checklist
- Garden essentials section with general shopping-search links
- Premium teaser with no payment collection

## Important: photo AI is not connected yet
The photo feature currently previews the selected image and provides a checklist. It does **not** identify plant diseases from image pixels. A real AI diagnosis requires an external inference service and a secure server-side integration. Do not put a private API key in `script.js` or any browser code. A free static host cannot safely conceal a secret key. Before enabling this feature, choose a provider, review its free-tier limits and data terms, and implement a serverless proxy with the key stored as a server-side secret. Diagnosis should remain probabilistic and should not prescribe pesticides without confirmation.

## Monetisation status
- The garden shop currently uses ordinary Amazon India search links, not affiliate tracking links. They do not earn commission as configured.
- To monetise, join an affiliate programme whose terms permit your traffic and content, create approved tracking links, replace the ordinary URLs, and show a clear affiliate disclosure near the links.
- Premium is only a coming-soon section. No payment gateway, subscription, account system or paid feature is implemented.
- Ad revenue requires approval by an advertising provider and compliance with its policies. Do not add ads until the site has useful original content and a privacy policy.

## Before public launch
1. Replace or configure the domain and hosting.
2. Add a privacy policy describing local storage, analytics, affiliate links and any future image processing.
3. Add contact details and terms of use.
4. Test on Android, iOS and desktop browsers.
5. Verify all shopping destinations and affiliate programme requirements.
6. Add real AI only through a server-side integration; test with expert-reviewed examples.
7. Add accessible image alt text and test keyboard navigation.

## Data and privacy
Plant collection data is stored in the visitor's browser using `localStorage`. Clearing browser site data may delete it. The JSON export feature lets visitors keep a backup. Uploaded photos are previewed locally and are not sent to a server by this version.
