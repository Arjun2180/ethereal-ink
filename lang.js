// ─────────────────────────────────────────────
//  Ethereal Ink – Language Toggle (lang.js)
// ─────────────────────────────────────────────
//
// HOW IT WORKS:
//
// 1. SETUP
//    We grab the toggle button and collect ALL elements that carry either the
//    class "en" (English text) or "hi" (Hindi text). querySelectorAll returns
//    a NodeList (similar to an array) of every matching element on the page.
//
// 2. INITIAL STATE
//    The page loads in English by default – Hindi elements start with
//    display:none set in CSS via the .hi { display:none } rule, so we don't
//    flash the wrong language before JS runs.
//
// 3. TOGGLE
//    Each click flips `isHindi` between true and false. Then we either:
//    • hide .en + show .hi  (when switching to Hindi)
//    • show .en + hide .hi  (when switching back to English)
//    We also update the button label so users always see what they'll switch TO.
//
// 4. IMPROVEMENT OVER ORIGINAL
//    The original set element.style.display = 'block' for every element, which
//    overrides the browser's natural display value. For inline elements like
//    <span> this is wrong (makes them block). We now set display to '' (empty)
//    to restore the element's default CSS display type instead of forcing 'block'.

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn      = document.getElementById('toggleLang');
    const englishEls     = document.querySelectorAll('.en');
    const hindiEls       = document.querySelectorAll('.hi');

    if (!toggleBtn) return; // Page might not have the toggle; bail safely

    let isHindi = false;

    function applyLanguage() {
        if (isHindi) {
            toggleBtn.textContent = 'Switch to English';
            englishEls.forEach(el => el.style.display = 'none');
            hindiEls.forEach(el => el.style.display = ''); // restore natural display
        } else {
            toggleBtn.textContent = 'Switch to Hindi';
            hindiEls.forEach(el => el.style.display = 'none');
            englishEls.forEach(el => el.style.display = '');
        }
    }

    applyLanguage(); // run once on load to set the correct initial state

    toggleBtn.addEventListener('click', () => {
        isHindi = !isHindi;
        applyLanguage();
    });
});
