
async function validateRegisterCredentials(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const cnpassword = document.getElementById('confirmPassword').value;
    const uni_id = document.getElementById('uni_id').value;

    // All regex equeation 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!emailRegex.test(email)) {
        const error = document.getElementById('error');
        error.innerText = `email is not valid plz enter valid email`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }
    if (!passwordRegex.test(password)) {
        const error = document.getElementById('error');
        error.innerText = `password is not valid at-least should have 8 long 1 special`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }

    if (!email || !username || !password || !cnpassword) {
        const error = document.getElementById('error');
        error.innerText = ` please fill all fileds`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }

    if (password !== cnpassword) {
        const error = document.getElementById('error');
        error.innerText = `password and re-password is not match`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }

    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ email, username, password, uni_id })
    });

    const responseData = await response.json();

    console.log(responseData);

    if (responseData.error) {
        const error = document.getElementById('error');
        error.innerText = `${responseData.error}`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return false;
    }
    if (!response.ok) {
        const error = document.getElementById('error');
        error.innerText = `Something went wrong`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return false;
    } else {
        window.location.href = "/auth/register/second/" + uni_id;
        return true;
    }
    return false;
}
function isEighteen(dateString) {
    // 1. Regex to check format YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const birthday = new Date(dateString);
    const today = new Date();

    // 2. Check if it's a real date (e.g., not Feb 31st)
    if (isNaN(birthday.getTime())) return false;

    // 3. Calculate age
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();

    // Adjust if birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }

    return age >= 18;
}
async function validateLoginInfoCredentials(e, uni_id) {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const dateOfBirth = document.getElementById('dob').value;

    // All regex equeation 
    const globalPhoneRegex = /^\+[1-9]\d{1,14}$/;

    if (!globalPhoneRegex.test(phone)) {
        const error = document.getElementById('error');
        error.innerText = `phone-no is not valid plz enter valid phone-no`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }

    if (!isEighteen(dateOfBirth)) {
        const error = document.getElementById('error');
        error.innerText = `user age is not 18, you can't make account`;
        error.style.display = `flex`;

        const deleteUser = await fetch(`/auth/${uni_id}/delete`, {
            method: 'DELETE',
        });
        const result = await deleteUser.json();
        if (deleteUser !== Ok || !result.message) {
            const error = document.getElementById('error');
            error.innerText = `something went wrong`;
            error.style.display = `flex`;
            document.location.href = `/auth/login`;
            return false;
        }
        setTimeout(() => {
            error.style.display = `none`;
            document.location.href = `/auth/login`;
        }, 2500);
        return;
    }

    if (!firstName || !lastName || !phone || !dateOfBirth) {
        const error = document.getElementById('error');
        error.innerText = ` please fill all fileds`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }

    const response = await fetch('/auth/register/second/' + uni_id, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, phone, dateOfBirth, uni_id })
    });

    const responseData = await response.json();


    if (responseData.error) {
        const error = document.getElementById('error');
        error.innerText = `something went wrong`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
            document.location.href = `/auth/login`;
        }, 2500);
        return false;
    }
    if (!response.ok) {
        const error = document.getElementById('error');
        error.innerText = `something went wrong`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
            document.location.href = `/auth/login`;
        }, 2500);
        return false;
    } else {
        window.location.href = "/auth/login";
        return true;
    }
    return false;
}

async function validateLoginCredentials(e) {
    e.preventDefault();

    const captcha = document.getElementById("inpCaptcha").value;

    if (captchaString !== captcha) {
        const error = document.getElementById('captchaError');
        error.style.display = "flex";
        setTimeout(() => {
            error.style.display = "none";
        }, 2000);
        return changeNewCaptcha();
    }

    const emailOrUsername = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // All regex equeation 
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!passwordRegex.test(password)) {
        const error = document.getElementById('error');
        error.innerText = `password is not valid at-least should have 8 long 1 special`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }

    if (!emailOrUsername || !password) {
        const error = document.getElementById('error');
        error.innerText = ` please fill all fileds`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return;
    }

    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ emailOrUsername, password, rememberMe })
    });

    const responseData = await response.json();

    if (responseData.error) {
        const error = document.getElementById('error');
        error.innerText = `${responseData.error}`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return false;
    }
    if (!response.ok) {
        const error = document.getElementById('error');
        error.innerText = `something went wrong!`;
        error.style.display = `flex`;
        setTimeout(() => {
            error.style.display = `none`;
        }, 2500);
        return false;
    } else {
        window.location.href = "/home";
        return true;
    }
    return false;
}

async function checkEmailAndGetOtp(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;

    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;

    // if (!emailRegex.test(email)) {
    //     const showError = document.getElementById('error');
    //     showError.innerText = `Email is not correct Plz fill correct email`
    //     etTimeout(() => {
    //         showError.style.display = `none`;
    //     }, 2000);
    //     return;
    // }

    const isUser = await fetch('/auth/verify/' + email);
    const isvalidUser = await isUser.json();

    if (!isUser.ok || isvalidUser.error) {
        const showError = document.getElementById('error');
        showError.innerText = `You are not a user`;
        setTimeout(() => {
            showError.style.display = `none`;
        }, 2000);
        return false;
    }
    
    document.location.href = `/auth/reset/` + email;

}

async function validateNewPassword(e, user) {
    e.preventDefault();

    const captcha = document.getElementById("inpCaptcha").value;

    if (captchaString !== captcha) {
        const error = document.getElementById('captchaError');
        error.style.display = "flex";
        setTimeout(() => {
            error.style.display = "none";
        }, 2000);
        return changeNewCaptcha();
    }

    const newPass = document.getElementById("password").value;
    const reNewPass = document.getElementById("repassword").value;

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!passwordRegex.test(newPass)) {
        const error = document.getElementById('error');
        error.innerText = `password is not valid`
        error.style.display = "flex";
        setTimeout(() => {
            error.style.display = "none";
        }, 2000);
        return;
    }


    if (reNewPass != newPass) {
        const error = document.getElementById('error');
        error.innerText = `password and repassword is not match`
        error.style.display = "flex";
        setTimeout(() => {
            error.style.display = "none";
        }, 2000);
        return;
    }


    const changePass = await fetch(`/auth/reset/${user}/password`, {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ newPassword: newPass })
    })
    const result = await changePass.json();
    if (!changePass.ok || result.error) {
        const error = document.getElementById('error');
        error.innerText = result?.error || "some thing went wrong";
        error.style.display = "flex";
        setTimeout(() => {
            error.style.display = "none";
        }, 2000);
        return;
    }

    document.location.href = "/auth/login"
}


