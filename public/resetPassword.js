const resetPasswordDiv = document.getElementById("resetPassword-div");
const resetPasswordForm = document.getElementById("resetPassword-form");
const resetNewPassword = document.getElementById('resetnewPassword');
const resetcConfirmNewPassword = document.getElementById("resetconfirmPassword");
const resetPasswordBtn = document.getElementById("resetPassword-Btn");

resetNewPassword.addEventListener("input", resetFormValidation);
resetcConfirmNewPassword.addEventListener("input", resetFormValidation);

function resetFormValidation() {
    if ( resetNewPassword.value.trim() != '' && resetcConfirmNewPassword.value.trim() != '' &&  resetNewPassword.value === resetcConfirmNewPassword.value ) {
        resetPasswordBtn.disabled = false;
    } else {
        resetPasswordBtn.disabled = true;
    }
}

resetPasswordBtn.addEventListener("click", (e)=> {
    e.preventDefault();
    const requestId = window.location.pathname.split('/').pop();
    const resetDetails = {
        resetPassword: resetcConfirmNewPassword.value,
        uniqueId:requestId
    }
    
    window.location.href = "/homepage";
    resetPasswordFunction(resetDetails);
});

async function resetPasswordFunction(resetDetails) {
    console.log(resetDetails);
    try {
        const response = await fetch(`/resetpassword/:uniqueId`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify( resetDetails )
        })

        if (response.status === 200) {
            window.location.href = "/";
            const data =  await response.json()
            console.log(data);
        } else {
            console.log("Password reset failed"); // Handle failure or show appropriate message
        }

    } catch (error) {
        console.log(error);
    }
}