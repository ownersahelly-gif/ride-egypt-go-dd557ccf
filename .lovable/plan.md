
Implement Uber/Careem-style keyboard behavior on Dashboard.

## Behavior

- Keyboard opens → hide map entirely, search panel goes full-height under header, content scrollable.
- Keyboard closes → only restore map when both pickup AND dropoff are filled (or both are empty = initial state). If exactly one is filled, keep panel expanded so user naturally fills the other.
- Remove all `--kb-inset` padding hacks from Dashboard.

## Changes

**`src/pages/Dashboard.tsx`**
1. Add `const [keyboardOpen, setKeyboardOpen] = useState(false)`.
2. Add an effect that subscribes to Capacitor `Keyboard.keyboardWillShow` / `keyboardWillHide` (native only), with web `visualViewport` fallback so it still works in the Lovable preview.
3. Compute `const showMap = !keyboardOpen && ((pickup && dropoff) || (!pickup && !dropoff))`.
4. Layout (search step):
   - Header stays at top (unchanged).
   - Map container: rendered only when `showMap` is true. When hidden, the search panel uses `flex-1` to fill all remaining space below the header.
   - When `showMap` is true, keep current 50dvh map + search panel split.
5. Strip any `paddingBottom: var(--kb-inset...)` and `data-keyboard-scroll-container` from the search panel. Inner content gets `overflow-y-auto` so inputs/date/button remain reachable when the panel is full-screen.

**`src/components/PlacesAutocomplete.tsx`**
- Simplify focus handler: remove the manual scroll-container math. Keep a lightweight `scrollIntoView({ block: 'center' })` after