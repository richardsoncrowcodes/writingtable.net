document.addEventListener('DOMContentLoaded', function() {
    const modalElement = document.getElementById('welcomeModal');
    if (modalElement) {
        const welcomeModal = new bootstrap.Modal(modalElement);
        const modalDismissTime = 'welcomeModalDismissTime';
        const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
        
        const lastDismissed = localStorage.getItem(modalDismissTime);
        const now = new Date().getTime();
        
        if (!lastDismissed || (now - parseInt(lastDismissed)) > fiveDaysInMs) {
            setTimeout(() => {
                welcomeModal.show();
            }, 2000);
        }
        modalElement.addEventListener('hidden.bs.modal', function() {
            localStorage.setItem(modalDismissTime, new Date().getTime().toString());
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                const offsetTop = target.offsetTop - 70; 
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});