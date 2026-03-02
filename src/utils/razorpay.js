import { DEMO_CONFIG } from '../config/demo.config';

export const RAZORPAY_KEY = DEMO_CONFIG.RAZORPAY_KEY;

// Flagged accounts database (mirrors your mock account data)
const FLAGGED_ACCOUNTS = {
    "ACC-4821": {
        name: "James K.",
        email: "james.k@email.com",
        phone: "9876543210",
        reason: "Confirmed money mule — linked to phishing ring OP-CRIMSON",
        riskScore: 95
    },
    "ACC-7743": {
        name: "Maria S.",
        email: "maria.s@email.com",
        phone: "9123456789",
        reason: "Account takeover detected — credentials compromised",
        riskScore: 88
    },
    "MULE-001": {
        name: "Unknown Mule",
        email: "mule001@proton.me",
        phone: "9000000001",
        reason: "Mule recruiter identified via kill chain analysis",
        riskScore: 85
    }
};

export function isAccountFlagged(accountId) {
    return !!FLAGGED_ACCOUNTS[accountId];
}

export function getFlagDetails(accountId) {
    return FLAGGED_ACCOUNTS[accountId] || null;
}

// Open Razorpay checkout — will be intercepted if flagged
export function initiatePayment({
    accountId,
    amount,         // in paise (multiply INR by 100)
    description,
    onSuccess,
    onBlock,
    onDismiss
}) {
    const flagDetails = getFlagDetails(accountId);

    const options = {
        key: RAZORPAY_KEY,
        amount: amount,
        currency: "INR",
        name: "CyberFusion Bank",
        description: description || "Fund Transfer",
        image: "/logo192.png",
        prefill: {
            name: flagDetails?.name || "Account Holder",
            email: flagDetails?.email || "user@email.com",
            contact: flagDetails?.phone || "9000000000"
        },
        theme: {
            color: "#00ff88",
            backdrop_color: "rgba(2,5,9,0.9)"
        },
        modal: {
            ondismiss: () => {
                if (onDismiss) onDismiss();
            },
            animation: true,
            backdropclose: false
        },
        handler: function (response) {
            // Payment "succeeded" in Razorpay — but we intercept here
            if (flagDetails) {
                // CyberFusion catches it post-auth, pre-settlement
                if (onBlock) onBlock({
                    accountId,
                    flagDetails,
                    paymentId: response.razorpay_payment_id,
                    amount: amount / 100,
                    interceptedAt: new Date().toLocaleTimeString()
                });
            } else {
                if (onSuccess) onSuccess({
                    paymentId: response.razorpay_payment_id,
                    amount: amount / 100
                });
            }
        }
    };

    if (!window.Razorpay) {
        alert("Razorpay script not loaded. Please check your internet connection and try again.");
        return null;
    }

    const rzp = new window.Razorpay(options);

    // If flagged: let checkout open for dramatic effect,
    // then auto-close after 3 seconds to simulate interception
    if (flagDetails) {
        rzp.on('payment.failed', function (response) {
            if (onBlock) onBlock({ accountId, flagDetails, error: response.error });
        });

        // Open the checkout (judges see the real UPI/card form)
        rzp.open();

        // After 4 seconds, close it and show block screen
        // This simulates real-time interception
        setTimeout(() => {
            rzp.close();
            if (onBlock) onBlock({
                accountId,
                flagDetails,
                amount: amount / 100,
                interceptedAt: new Date().toLocaleTimeString(),
                simulatedPaymentId: 'pay_' + Math.random().toString(36).substr(2, 14).toUpperCase()
            });
        }, 4000);
    } else {
        rzp.open();
    }

    return rzp;
}
