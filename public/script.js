// Get references to HTML elements
const topNav = document.getElementById("myTopnav", toggleNav);
const closeSpans = document.getElementsByClassName("close");
const modals = document.getElementsByClassName("modal");
const topNavCenter = document.querySelector(".topnav-center");
const navLinks = topNavCenter.querySelectorAll("a");

const signUpDiv = document.getElementById("signup-form-div");
const signUpBtn = document.getElementById("signUp-btn");
const signUpSubmitBtn = document.getElementById("signUp-Submit-Btn");
const signUpForm = document.getElementById("signup-form");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");

const forgotPasswordBtn = document.getElementById('forgotPasswordbtn');
const forgotPasswordDiv = document.getElementById("forgotPassword-div");
const forgotPasswordForm = document.getElementById("forgotPasword-form");
const forgotPasswordEmail = document.getElementById("reset-email");
const resetBtn = document.getElementById("reset-btn");

const loginDiv = document.getElementById("login-form-div");
const loginBtn = document.getElementById("login-btn");
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById("login-password");


const leaderBoardDiv = document.getElementById("leaderBoard-div");

signUpBtn.addEventListener("click", () => {
    signUpDiv.style.display = "block";
}); 

loginBtn.addEventListener("click", ()=> {
    loginDiv.style.display = "block";
});

forgotPasswordBtn.addEventListener("click", ()=> {
    loginDiv.style.display = "none";
    forgotPasswordDiv.style.display = "block";
});

window.onclick = function(event) {
    for (let i = 0; i < modals.length; i++) {
        if (event.target === modals[i]) {
            signUpDiv.style.display = "none";
            loginDiv.style.display = "none";
            expenseFormDiv.style.display = "none";
            expenseForm.style.display="none";
            forgotPasswordDiv.style.display='none';
        }
    }
};

function toggleNav() {
    if (topNav.classList.contains("responsive")) {
        topNav.classList.remove("responsive");
    } else {
        topNav.classList.add("responsive");
    }
}

function signUpFormValidation() {
    if ( newPassword.value.trim() != '' && confirmPassword.value.trim() != '' && newPassword.value === confirmPassword.value ) {
        signUpSubmitBtn.disabled = false;
    } else {
        signUpSubmitBtn.disabled = true;
    }
}

newPassword.addEventListener("input", signUpFormValidation);
confirmPassword.addEventListener("input", signUpFormValidation);

signUpForm.addEventListener("submit" , (e)=> {
    e.preventDefault();
    const user = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: newPassword.value
    }
    registerUser(user);
});

loginForm.addEventListener("submit", (e)=> {
    e.preventDefault();
    const user = {
        email : loginEmail.value,
        password: loginPassword.value
    };
    loginUser(user);
});

async function registerUser(user)  {
    try {
        const response = await fetch(`/user/register`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( {
                firstName : user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
            }),
        });

        if(response.status == 201) {
            console.log("New User Added");
            signUpDiv.style.display = "none";
            loginDiv.style.display = "block";
        } else if (response.status == 200){
            console.log("user Already exits");
            alert("User with same email id already Exits !!!");
        }
    } catch (error) {
        console.log(error);
    }
}

const logOutBtn = document.createElement("button");
logOutBtn.textContent = "Logout";
logOutBtn.classList.add("log");

const buyPremiumBtn = document.createElement("button");
buyPremiumBtn.textContent = "Buy Premium";
buyPremiumBtn.classList.add("reg");

const addExpensesBtn = document.createElement("button");
addExpensesBtn.textContent = "Add Expenses";
addExpensesBtn.classList.add("log");

async function loginUser(user) {
    try {
        const response = await fetch(`/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                password: user.password,
            }),
        });

        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('isLoggedIn', true);
            location.reload();
            localStorage.setItem('isPremiumUser', data.isPremiumUser);
            toggleUI();

        } else if (response.status === 401) {
            const error = await response.json();
            console.log(error);
            alert("Incorrect Password");
        } else if (response.status === 404) {
            const error = await response.json();
            console.log(error);
            alert("No user Found");
        }
        
    } catch (error) {
        console.log(error);
    }
}

forgotPasswordForm.addEventListener("submit", (e)=> {
    e.preventDefault();
    const user = {email: forgotPasswordEmail.value };
    forgotPasswordFunction(user);

});

async function forgotPasswordFunction(user) {
    console.log(user);
    try {
        const response = await fetch('/user/forgotPassword', {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify ( {
                email:user.email
            } )
        });

        if(response.status === 200) {
            const data = await response.json();
            console.log(data);
        }
    } catch (error) {
        console.log(error);
    }
};


function toggleUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isPremiumUser = localStorage.getItem('isPremiumUser') === 'true';
    if(isLoggedIn) {
        loginDiv.style.display="none";
        loginBtn.style.display = "none";
        signUpBtn.style.display = "none";
        const topNavRight = document.querySelector(".topnav-right");
        topNavRight.appendChild(buyPremiumBtn);
        topNavRight.appendChild(logOutBtn);
        navLinks.forEach(link => {
            link.style.display = "none";
        });
        topNavCenter.appendChild(addExpensesBtn);
        displayExpensesDiv.style.display="block";
        
        logOutBtn.addEventListener("click", ()=> {
            localStorage.removeItem('token');
            localStorage.setItem('isLoggedIn', false);
            
            console.log("log Out sucessfully");
            logOutBtn.remove();
            buyPremiumBtn.remove();
            addExpensesBtn.remove();
            expenseFormDiv.style.display = "none";
            expenseForm.style.display="none";
            displayExpensesDiv.style.display ="none";
            reportTableDiv.style.display= "none";
            datePickerDiv.style.display = "none";
            if(isPremiumUser) {
                textNode.remove();
                leaderBoardDiv.style.display="none"
            }
            navLinks.forEach(link => {
                link.style.display = "block";
            });
            loginBtn.style.display = "block";
            signUpBtn.style.display = "block";
            
        });

        buyPremiumBtn.addEventListener("click", ()=> {
            buyPremiumFunction();
        });

        addExpensesBtn.addEventListener("click", ()=> {
            loginDiv.style.display = "none";
            expenseFormDiv.style.display = "block";
            expenseForm.style.display = "block";
        });

        const textNode = document.createElement('p');
        textNode.innerHTML="You Are now Pro User";
        textNode.style.color ="white";
        textNode.classList.add("topnav.responsive");

        if(isPremiumUser) {
            topNavCenter.appendChild(textNode);
            buyPremiumBtn.remove();
            leaderBoardDiv.style.display = "block";
            datePickerDiv.style.display = "block";
            reportTableDiv.style.display= "block";
            datePickerDiv.style.display = "block";
            fetchReports();
        };
    }
}

window.addEventListener("load", ()=> toggleUI());