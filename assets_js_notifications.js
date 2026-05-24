const INVESTORS = [
    { name: "James W.", amount: "$1.2M", asset: "Vault Alpha Fund" },
    { name: "Sophia R.", amount: "$450k", asset: "Sovereign BTC" },
    { name: "Institutional Node 09", amount: "$5.8M", asset: "Liquidity Hub" },
    { name: "Marco V.", amount: "$820k", asset: "Yield Delta" },
    { name: "Chen L.", amount: "$2.1M", asset: "Institutional ETH" },
    { name: "Elena S.", amount: "$120k", asset: "RWA Prime" },
    { name: "David K.", amount: "$3.4M", asset: "Vault Alpha Fund" },
    { name: "Sarah J.", amount: "$900k", asset: "Sovereign BTC" }
];

function createToast() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const investor = INVESTORS[Math.floor(Math.random() * INVESTORS.length)];
    
    const toast = document.createElement('div');
    toast.className = 'investment-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-dot"></div>
            <div>
                <span class="toast-name">${investor.name}</span>
                <span style="color: var(--muted); opacity: 0.6; margin: 0 4px;">•</span>
                <span class="toast-amount">${investor.amount}</span>
                <div class="toast-asset" style="font-size: 10px; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em;">${investor.asset}</div>
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('visible'), 100);

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 600);
    }, 5000);
}

// Start sequence
let toastsShown = 0;
const MAX_TOASTS = 3;

setTimeout(() => {
    if (toastsShown < MAX_TOASTS) {
        createToast();
        toastsShown++;
        
        const interval = setInterval(() => {
            if (toastsShown < MAX_TOASTS) {
                createToast();
                toastsShown++;
            } else {
                clearInterval(interval);
            }
        }, 15000);
    }
}, 10000);
