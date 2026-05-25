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
            hindiEls.forEach(el => el.style.display = ''); 
        } else {
            toggleBtn.textContent = 'Switch to Hindi';
            hindiEls.forEach(el => el.style.display = 'none');
            englishEls.forEach(el => el.style.display = '');
        }
    }

    applyLanguage(); 

    toggleBtn.addEventListener('click', () => {
        isHindi = !isHindi;
        applyLanguage();
    });
});
