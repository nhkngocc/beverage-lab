# The Fridge Bar

A one-page website that turns 2 to 5 leftover drink ingredients into a drink recipe. You tap or type what you have, choose a style (Classic or Plot Twist), and press **Shake it**. An AI returns a recipe card, or honestly says the combination is "not on the menu" and gives no recipe.

Drinks only. No accounts, no saved history, no frameworks, no build step.

- **Course:** COMM2592 Digital Media Studio 4, A1 Initial Response (Rapid Ideation)
- **Live site:** https://the-fridge-bar.netlify.app
- **Note:** the project started with the working title "Beverage Combo Lab". The product is now called The Fridge Bar.

## How it works

1. **Pick (Step 1).** Choose from a shelf of 40 tappable ingredients in 7 groups (including a collapsed "Beer, wine & spirits" group marked for adults of legal drinking age), or type your own. Typed ingredients get a quick keyword check: obvious savoury food and seasoning (salt, garlic, chicken and so on) is blocked on the page. Anything unclear is accepted and the AI makes the final call.
2. **Style (Step 2).** Two options, built from real radio inputs:
   - **Classic:** a well-known drink made the standard way, pantry items only.
   - **Plot Twist:** first tries a real, less common drink; otherwise upgrades the classic with 2 to 3 recorded tweaks. Each style also changes the colour of the page.
3. **Shake (Step 3).** The shaker has 5 slots, a live counter, and tap-to-remove. The **Shake it** button is disabled until there are at least 2 ingredients.
4. **Result.** The page sends the ingredients and style to a serverless function, which calls the AI and returns one of four verdicts, shown as a stamp:
   - `works`: **APPROVED** (or **APPROVED WITH A TWIST** in Plot Twist)
   - `works_with_fix`: **APPROVED WITH A TWEAK** (or **TWISTED AND TWEAKED**)
   - `wont_work` and `rejected`: shown as **not on the menu**, with a plain reason and no recipe

   Recipe cards show the ingredients with amounts, steps, a flavour profile (five bars with text values), a "why it tastes so good" line, an origin note or "plot twists" list where relevant, and an alcohol safety note with a no-alcohol swap when alcohol is involved. Buttons: **Copy recipe**, **Try the other style**, **Change ingredients** (on "not on the menu" results) and **Try again** (on errors).

## Files

```
index.html                       the page structure (HTML)
style.css                        all the styling (CSS)
script.js                        all the behaviour (JavaScript)
netlify.toml                     tells Netlify where the function lives
netlify/functions/generate.mjs   the serverless function that calls OpenRouter
.gitignore                       keeps .env files and local Netlify files out of the repo
README.md                        this file
```

## Environment variables (set in Netlify, never in the code)

| Name | Required | What it is |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | The OpenRouter API key |
| `MODEL_NAME` | Yes | The exact model ID copied from OpenRouter's model list |
| `MODEL_FALLBACK` | No | A second model ID, used automatically if the first attempt fails |

If either required variable is missing, the function returns a "server is missing its API key or model setting" error. The key is never sent to the browser.

## Running and testing

- **Without the API:** keep `index.html`, `style.css` and `script.js` together in the same folder, then open `index.html` by double-clicking it, or add `?mock=1` to the live URL. Demo mode returns sample results and shows a demo bar. Adding `&verdict=fix`, `&verdict=wont` or `&verdict=rejected` shows the other three sample verdicts.
- **With the API:** the function only runs on the deployed Netlify site, not from a double-clicked file.

## Technical notes

- **Validation on both sides.** The page and the function both enforce 1 to 30 characters per ingredient, letters/numbers/spaces and `- ' ’ & .` only, no case-insensitive duplicates, 2 to 5 ingredients, and a valid style. The function re-checks everything and returns HTTP 400 without calling the AI if the request is bad.
- **Prompt design.** Ingredient names are wrapped in `<ingredient>` tags and labelled as data, not instructions. The prompt tells the AI to refuse non-drink items, to choose the more cautious verdict when unsure, and to return JSON only.
- **Structured output.** The function asks for JSON, strips code fences, parses it, checks that the verdict is one of the four allowed values, and tidies every field (for example, one emoji per ingredient icon, flavour scores clamped to 0 to 5). For `wont_work` and `rejected` it forces the recipe fields empty, so a "not on the menu" result can never show a recipe.
- **Retries and time limit.** The first attempt asks for JSON mode with the model's "thinking" switched off. If it fails, the function tries `MODEL_FALLBACK` if set, otherwise the same model with a plainer request. All attempts share a 24-second budget. The page gives up after 30 seconds.
- **Errors.** Out-of-credit (402), key problems (401/403), rate limits (429), timeouts, network failures and bad AI output each show a friendly message and a **Try again** button, and the page never stays stuck loading.
- **Safe rendering.** AI text is added with `textContent`, never `innerHTML`.
- **Accessibility.** Written in from the start (not yet formally audited): `lang="en"`, labelled input, `fieldset`/`legend` for the style radios, `aria-pressed` on ingredient tiles, `aria-live` regions for the counter, loading messages and results, focus moved to the result heading, emoji hidden from screen readers with a text label beside them, stamps and flavour bars carry text as well as colour, and `prefers-reduced-motion` turns animations off.

## Third-party material and attribution

- **No libraries, frameworks, CDNs, analytics, external fonts or images.** The front end uses the system font stack. Emoji come from the user's device.
- **Hosting:** Netlify (static site plus one serverless function).
- **AI provider:** OpenRouter (https://openrouter.ai). The site calls the model `nvidia/nemotron-3.5-super-vl:free` (a free-tier model).
- **Source code:** hosted on GitHub.

## AI-use disclosure

This project was built with the help of Claude (Anthropic) as an AI coding assistant. Claude wrote the code for the page and the serverless function from a build brief; I directed the design, tested the site, and chose the final changes. At run time, the site also uses an AI model through OpenRouter to generate the recipes.

## Known limitations

- **Only two styles.** The original brief planned three (including a "Mad Scientist" style). This version ships with Classic and Plot Twist.
- **AI judgement is not guaranteed.** Safety and flavour verdicts come from the model and a prompt. They can be wrong, so this is not a food-safety tool. Recipes should be read before being made.
- **Light ingredient filter.** The page only blocks obvious savoury food and seasoning. Everything else relies on the AI's final check.
- **Technical detail on errors.** When a request fails, the function sends a short technical note that the page shows under the error message, which helps debugging but would be removed in a public version.
- **No rate limiting.** Anyone with the link can trigger AI calls, which use the owner's OpenRouter credit.
- **English only,** no saved favourites, no accounts.
- **Accessibility is built in but not formally audited** with a screen reader or automated tool.
- **Free-tier limits.** The model is a free variant, so it can be slow or rate-limited, and Netlify's function time limit can cause occasional timeouts. The page shows a friendly error with a Try again button when that happens.

## Ideas for future improvement

Rate limiting; more tested flavour logic; saved favourites; translated language support; a third, wilder style.
