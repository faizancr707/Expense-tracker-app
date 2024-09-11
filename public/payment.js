async function buyPremiumFunction() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/payment/createOrder', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong');
        }

        const responseData = await response.json();
        const options = {
            key: responseData.razorPayId, 
            amount: responseData.amount,
            currency: responseData.currency,
            order_id: responseData.id,
            handler: async function (response) {
                console.log(response);
                if (response.razorpay_payment_id) {
                    // Payment successful
                    await addOrder(response, responseData.amount);
                    alert('Payment Successful !!!');
                    localStorage.setItem("isPremiumUser", true);
                    toggleUI();
                    console.log("Payment Successful !!!");
                }
            },
            theme: {
                color: '#3399cc'
            },
            retry: false
        };

        const rzp = new Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', function(response) {
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);
            console.log("Payment Failed !!!");
        });
        
    } catch (error) {
        console.error('Error in buyPremiumFunction:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        // Optionally, display a user-friendly error message
        alert('An error occurred while processing your request. Please try again later.');
    }
}

async function addOrder(response, amount) {
    const token = localStorage.getItem('token');
    try {
        const x = await fetch(`/payment/addOrder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: amount,
                response: response
            })
        });

        if (!x.ok) {
            const errorData = await x.json();
            throw new Error(errorData.message || 'Something went wrong');
        }
    } catch (error) {
        console.error('Error in addOrder:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        // Optionally, display a user-friendly error message
        alert('An error occurred while processing your order. Please try again later.');
    }
}
