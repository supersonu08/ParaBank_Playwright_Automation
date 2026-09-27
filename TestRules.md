### Locator strategy (STRICT priority order)

For every element interaction, choose a locator in this order. Stop at the first one that resolves uniquely:

1. `getByRole(role, { name })` with accessible name
2. `getByLabel(labelText)` for form fields
3. `getByPlaceholder(text)` when no label exists
4. `getByTestId(id)` — attribute name is `data-test-id`
5. `getByText(text)` only for genuinely static UI copy

Forbidden without an explicit code comment justifying it:
- CSS selectors
- XPath
- Chained deep selectors
- Nth-based selection when a name is available

If no locator in the priority list resolves uniquely, STOP and ask the user rather than falling back to CSS.

### Assertion rules
- Web-first assertions only (`expect(locator).toBeVisible()`, `toHaveCount()`, `toHaveText()`)
- NEVER use `page.waitForTimeout` — use auto-waiting locators
- NEVER use `waitForSelector` — use `expect(locator).toBeVisible()` instead