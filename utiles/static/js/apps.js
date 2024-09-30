document.addEventListener('DOMContentLoaded', function () {
    // Handle the signup form
    const signupForm = document.getElementById('signupForm');
    const message = document.getElementById('msg');
    if (signupForm) {
        signupForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent the default form submission

            const email = document.getElementById('stremail').value;

            if (email) {
                try {
                    const response = await fetch('/account-control/user/email-checker', {
                        method: 'POST',
                        body: JSON.stringify({ email: email }),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        }
                    });

                    const result = await response.json();

                    if (response.ok) {
                        // Email check was successful, proceed with form submission or next steps
                        sessionStorage.setItem('ntempEmail', email); // Store the email in session storage
                        window.location.href = '/register-process'; // Redirect to the next page
                    } else {
                        // Handle errors returned from the server
                        message.style.color = "red";
                        message.innerText = result.message;

                    }
                } catch (e) {
                    butterup.toast({
                        title: 'Unknown Error',
                        message: 'An error occurred while processing request',
                        type: 'error',
                    });
                }
            } else {
                alert('Please enter an email.');
            }
        });
    }

    const signupContinueForm = document.getElementById('signup-continue');
    if (signupContinueForm) {
        signupContinueForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent the default form submission
            const email = sessionStorage.getItem('ntempEmail');
            const form = event.target;
            const formData = new FormData(form);
            formData.append('email', email);

            // Password confirmation validation
            if (formData.get('password') !== formData.get('confirm_password')) {
                butterup.toast({
                    title: 'Registration Error',
                    message: 'Passwords do not match!',
                    type: 'error',
                });
                return;
            }

            try {
                const response = await fetch('/account-control/user/create', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        // No need for 'Content-Type': 'multipart/form-data' when using FormData
                    }
                });

                if (response.ok) {
                    const result = await response.json();

                    localStorage.setItem('exn-u-cookie', JSON.stringify(result.user))
                    window.location.href = '/';
                } else {
                    // Handle errors
                    const errorData = await response.json();
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorData.errors.forEach(error => {
                            butterup.toast({
                                title: 'Registration Error',
                                message: error,
                                type: 'error',
                            });
                        });
                    } else {
                        butterup.toast({
                            title: 'Registration Error',
                            message: 'An unknown error occurred. Please try again.',
                            type: 'error',
                        });
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                butterup.toast({
                    title: 'Registration Error',
                    message: 'An error occurred while submitting the form.',
                    type: 'error',
                });
            }
        });
    }


    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent the default form submission

            const form = event.target;
            const formData = new FormData(form);


            try {
                const response = await fetch('/account-control/user/login ', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',

                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const lastUrl = sessionStorage.getItem('currenturl')
                    // Handle success (e.g., redirect, show a message)
                    if (lastUrl) {

                        window.location.href = lastUrl;
                    }
                    else {
                        window.location.href = '/';
                    }

                    localStorage.setItem('exn-u-cookie', JSON.stringify(result.user));

                } else {
                    // Handle errors
                    const errorData = await response.json();
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorData.errors.forEach(error => {
                            butterup.toast({
                                title: 'Login Error',
                                message: error,
                                type: 'error',
                            });
                        });
                    } else {
                        butterup.toast({
                            title: 'Login Error',
                            message: 'An unknown error occurred. Please try again.',
                            type: 'error',
                        });
                    }
                }
            } catch (error) {
                butterup.toast({
                    title: 'Login Error',
                    message: 'An error occurred while submitting the form.',
                    type: 'error',
                });
            }
        });
    }

    let studentDetails = document.getElementById("student-details");

    if (studentDetails) {
        let user_data = localStorage.getItem('exn-u-cookie');
        let user = JSON.parse(user_data);

        (async () => {
            try {
                const response = await fetch('/account-control/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token.access}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();

                    // Clear any existing data
                    patientsData.innerHTML = '';

                    // Initialize an incremental counter
                    let counter = 1;

                    // Iterate over the result and create HTML elements for each patient
                    result.forEach(patient => {


                        // Create the patient item element
                        let patientItem = document.createElement('div');
                        patientItem.className = 'nak-item';
                        patientItem.id = `nak-item-${counter}`;
                        patientItem.dataset.id = patient._id;
                        patientItem.textContent = `${patient.first_name} ${patient.last_name}`;

                        // Create the line separator element
                        let lineSeparator = document.createElement('div');
                        lineSeparator.className = 'line';

                        // Append the patient item and line separator to the patientsData container
                        patientsData.appendChild(patientItem);
                        patientsData.appendChild(lineSeparator);

                        // Increment the counter for the next patient
                        counter++;
                    });

                    // Success message

                } else {
                    const errorData = await response.json();

                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorData.errors.forEach(error => {
                            butterup.toast({
                                title: 'Error',
                                message: error,
                                type: 'error',
                            });
                        });
                    } else if (errorData.message) {
                        butterup.toast({
                            title: 'Error',
                            message: errorData.message,
                            type: 'error',
                        });
                    } else {
                        butterup.toast({
                            title: 'Error',
                            message: 'An unknown error occurred. Please try again.',
                            type: 'error',
                        });
                    }
                }
            } catch (error) {
                console.error('Fetch error:', error); // Log the error to the console for debugging
                butterup.toast({
                    title: 'Error',
                    message: 'An error occurred while fetching patient data. Please check your network connection and try again.',
                    type: 'error',
                });
            }
        })();
    }

    const utiles = document.getElementById('utiles');
    const user = localStorage.getItem('exn-u-cookie');

    const languageDropdown = `
            <button type="button" class="btn btn-light rounded-pill d-flex justify-content-center align-items-center p-0 ms-4"
          style="height: 40px; width: 40px; border: 1px solid rgb(218, 218, 218);" data-bs-toggle="modal" data-bs-target="#languageop">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe"
            viewBox="0 0 16 16">
            <path
              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
          </svg>
        </button>`;

    const notificationDropdown = `
            <div class="dropdown">
          <button class="btn btn-light rounded-pill d-flex justify-content-center align-items-center p-0 ms-4"
            role="button" data-bs-toggle="dropdown" aria-expanded="false"
            style="height: 40px; width: 40px; border: 1px solid rgb(218, 218, 218);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-bell-fill"
              viewBox="0 0 16 16">
              <path
                d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
            </svg>
          </button>
          <ul class="dropdown-menu">
            <li class="m-1"><a class="dropdown-item" href="#">no notification yet</a></li>
           
          </ul>
        </div>`;

    const userDropdown = `
            <div class="dropdown">
            <button class="btn btn-light rounded-pill d-flex justify-content-center align-items-center p-0 ms-4 "
                role="button" data-bs-toggle="dropdown" aria-expanded="false"
                style="height: 40px; width: 40px; border: 1px solid rgb(218, 218, 218);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person"
                    viewBox="0 0 16 16">
                        <path
                        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
            </button>

                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/nakiese/accounts/settings">Manage Account</a></li>
                    <li><a class="dropdown-item" href="#">Reviews</a></li>
                    <li><a class="dropdown-item" href="#">Saved</a></li>
                    <li><a class="dropdown-item" id="logout" href="#">Logout</a></li>
                </ul>
            </div>`;

    if (user) {
        utiles.innerHTML = `
                ${languageDropdown}
                ${notificationDropdown}
                ${userDropdown}
            `;
        attachLogoutListener(); // Attach the logout event listener
    } else {
        const loginButton = `
                <div>
                    <a href="/login" class="btn btn-primary ms-3 rounded-pill text-light text-center">Login</a>
                </div>`;

        const signUpButton = `
                <div>
                    <a href="/register" class="btn btn-primary ms-3 rounded-pill text-light text-center">Sign Up</a>
                </div>`;

        utiles.innerHTML = `
                ${languageDropdown}
                ${loginButton}
                ${signUpButton}
            `;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const logout = document.getElementById("logout");
    const logoutSettings = document.getElementById("setSignout");

    if (logout) {
        logout.addEventListener('click', function (event) {
            // event.preventDefault(); // Prevent default link behaviorn
            localStorage.removeItem('exn-u-cookie');
            window.location.reload();
        });
    }
    if (logoutSettings) {
        logoutSettings.addEventListener('click', function (event) {
            // event.preventDefault(); // Prevent default link behaviorn
            localStorage.removeItem('exn-u-cookie');
            window.location.reload()
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const ids = ['account-personal', 'account-security', 'account-notification', 'account-payment', 'account-preferences'];
    const links = {
        'account-personal': "/nakiese/accounts/settings/persoanl-details",
        'account-security': "/nakiese/accounts/settings/security",
        'account-notification': "/nakiese/accounts/settings/email-notification",
        'account-payment': "/nakiese/accounts/settings/payment-handle",
        'account-preferences': "/nakiese/accounts/settings/preferences"
    };

    ids.forEach(function (id) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', function (event) {

                const link = links[id];
                if (link) {
                    window.location.href = link; // Navigate to the specified URL
                } else {
                    console.error(`No link found for id: ${id}`);
                }
            });
        } else {
            console.error(`Element with id ${id} not found`);
        }
    });


});

document.addEventListener('DOMContentLoaded', async function () {
    let user = localStorage.getItem('exn-u-cookie');
    let Personald = document.getElementById('Personal-d');

    if (user && Personald) {
        try {
            // Parse the user object if it's stored as a JSON string
            user = JSON.parse(user);

            const response = await fetch('/account-control/user/profile', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token.access}`  // Make sure the token is correct
                }
            });

            if (response.ok) {
                const result = await response.json();

                // Populate the HTML elements with data
                const nameElement = document.getElementById('fullname');
                const emailElement = document.getElementById('email');
                const phnoElement = document.getElementById('phno');
                const dobElement = document.getElementById('dob');
                const nationalityElement = document.getElementById('nationality');
                const genderElement = document.getElementById('gender');
                const addressElement = document.getElementById('address');

                if (nameElement) nameElement.textContent = `${result.first_name || 'Add name'} ${result.last_name || 'Add name'}`;
                if (emailElement) emailElement.textContent = result.email || 'Add email';
                if (phnoElement) phnoElement.textContent = result.phone_no || 'Add phone number';
                if (dobElement) dobElement.textContent = result.date_of_bith ? result.date_of_bith : 'Add date of birth';
                if (nationalityElement) nationalityElement.textContent = result.nationality || 'Add nationality';
                if (genderElement) genderElement.textContent = result.gender || 'Add gender';
                if (addressElement) addressElement.textContent = result.address || 'Add address';

            } else {
                const errorResult = await response.json();
                console.error('Error:', errorResult.message || 'An error occurred');
                // Optional: Display error to the user
                alert('An error occurred: ' + (errorResult.message || 'Unknown error'));
            }
        } catch (e) {
            // Error handling
            console.error('Request failed', e);
            butterup.toast({
                title: 'Error',
                message: "Please click " + " " + `<b><a href="/login">Login</a></b>` + " " + " to continue",
                type: 'error',
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {



    let fName = document.getElementById('firstName');
    let lName = document.getElementById('lastName');
    let saveButton = document.getElementById('name');

    if (fName && lName && saveButton) {

        saveButton.addEventListener('click', async function () {
            let user = localStorage.getItem('exn-u-cookie');
            let token;
            user = JSON.parse(user);
            if (user) {
                try {
                    // Parse the user object if it's stored as a JSON string
                    token = user.token ? user.token.access : null;  // Safely check for the token



                    const requestData = {
                        first_name: fName.value,
                        last_name: lName.value
                    };

                    const response = await fetch('/account-control/user/profile/update', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`  // Ensure the token is correct
                        },
                        body: JSON.stringify(requestData)  // Sending the data in JSON format
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        butterup.toast({
                            title: 'Updation Error',
                            message: "Error while updating name, please try again",
                            type: 'error',
                        });
                    }
                } catch (error) {
                    console.error("Unknown error:", error);
                    butterup.toast({
                        title: 'Authentication Error',
                        message: "Please click " + " " + `<b><a href="/login">Login</a></b>` + " " + " to continue",
                        type: 'error',
                    });
                }
            } else {
                console.log("Error")
                butterup.toast({
                    title: 'Authentication Error',
                    message: "Please click " + " " + `<b><a href="/login">Login</a></b>` + " " + "  to continue",
                    type: 'error',
                });
            }
        });
    }

    let emailId = document.getElementById('emailId');
    let savemail = document.getElementById('savemeil');
    if (emailId && savemail) {
        savemail.addEventListener('click', async function () {
            let user = localStorage.getItem('exn-u-cookie');

            user = JSON.parse(user);
            if (user) {
                try {
                    // Parse the user object if it's stored as a JSON string

                    const requestData = {
                        email: emailId.value,

                    };

                    const response = await fetch('/account-control/user/profile/update', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                        },
                        body: JSON.stringify(requestData)  // Sending the data in JSON format
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        butterup.toast({
                            title: 'Updation Error',
                            message: "Error while updating email, please try again",
                            type: 'error',
                        });
                    }
                } catch (error) {
                    butterup.toast({
                        title: 'Unknown Error',
                        message: "An Unknown error has been occured.",
                        type: 'error',
                    });
                }
            } else {
                butterup.toast({
                    title: 'Authentication Error',
                    message: "Please click" + " " + `<b><a href="/login">Login</a></b>` + " " + "  to continue",
                    type: 'error',
                });
            }
        });
    }

    let dob = document.getElementById('dob2');
    let savedob = document.getElementById('savedob');
    if (dob && savedob) {
        savedob.addEventListener('click', async function () {
            let user = localStorage.getItem('exn-u-cookie');

            user = JSON.parse(user);
            if (user) {
                try {
                    // Parse the user object if it's stored as a JSON string
                    user = JSON.parse(user);

                    const requestData = {
                        date_of_bith: dob.value,

                    };

                    const response = await fetch('/account-control/user/profile/update', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                        },
                        body: JSON.stringify(requestData)  // Sending the data in JSON format
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        butterup.toast({
                            title: 'Unknown Error',
                            message: "An Unknown error has been occured.",
                            type: 'error',
                        });
                    }
                } catch (error) {
                    butterup.toast({
                        title: 'Authentication Error',
                        message: "Please click " + " " + `<b><a href="/login">Login</a></b>` + " " + "  to continue",
                        type: 'error',
                    });
                }
            } else {
                butterup.toast({
                    title: 'Authentication Error',
                    message: "Please click" + " " + `<b><a href="/login">Login</a></b>` + " " + " to continue",
                    type: 'error',
                });
            }
        });
    }
    let nat = document.getElementById('nat');
    let savnat = document.getElementById('savnat');
    if (dob && savedob) {
        savnat.addEventListener('click', async function () {
            try {
                // Parse the user object if it's stored as a JSON string
                user = JSON.parse(user);

                const requestData = {
                    nationality: nat.value,

                };

                const response = await fetch('/account-control/user/profile/update', {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                    },
                    body: JSON.stringify(requestData)  // Sending the data in JSON format
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    butterup.toast({
                        title: 'Updation Error',
                        message: "Error while updating Nationality, please try again",
                        type: 'error',
                    });
                }
            } catch (error) {
                butterup.toast({
                    title: 'Unknown Error',
                    message: "An Unknown error has been occured.",
                    type: 'error',
                });
            }
        });
    }
    let genderInput = document.getElementById('genderInput');
    let savgender = document.getElementById('savgender');
    if (dob && savedob) {
        savgender.addEventListener('click', async function () {
            try {
                // Parse the user object if it's stored as a JSON string
                user = JSON.parse(user);

                const requestData = {
                    gender: genderInput.value,

                };

                const response = await fetch('/account-control/user/profile/update', {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                    },
                    body: JSON.stringify(requestData)  // Sending the data in JSON format
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    butterup.toast({
                        title: 'Updation Error',
                        message: "Error while updating gender, please try again",
                        type: 'error',
                    });
                }
            } catch (error) {
                butterup.toast({
                    title: 'Unknown Error',
                    message: "An Unknown error has been occured.",
                    type: 'error',
                });
            }
        });
    }
    let addressInput = document.getElementById('addressInput');
    let savaddress = document.getElementById('savaddress');
    if (dob && savedob) {
        savaddress.addEventListener('click', async function () {
            try {
                // Parse the user object if it's stored as a JSON string
                user = JSON.parse(user);

                const requestData = {
                    address: addressInput.value,

                };

                const response = await fetch('/account-control/user/profile/update', {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                    },
                    body: JSON.stringify(requestData)  // Sending the data in JSON format
                });

                if (response.ok) {

                    window.location.reload();
                } else {
                    butterup.toast({
                        title: 'Updation Error',
                        message: "Error while updating address, please try again",
                        type: 'error',
                    });
                }
            } catch (error) {
                butterup.toast({
                    title: 'Unknown Error',
                    message: "An Unknown error has been occured.",
                    type: 'error',
                });
            }
        });
    }

});

document.addEventListener('DOMContentLoaded', function () {
    let phId = document.getElementById('phno2');
    let savePh = document.getElementById('saveph');

    // Check if the elements are available
    if (phId && savePh) {
        // Retrieve and parse user data from localStorage
        let user = localStorage.getItem('exn-u-cookie');
        user = JSON.parse(user);
        if (user) {
            try {

                // Add click event listener for save button
                savePh.addEventListener('click', async function () {
                    try {
                        // Validate phone number input
                        const phoneNumber = phId.value ? phId.value.trim() : '';
                        if (!phoneNumber) {
                            console.error("Phone number cannot be empty.");
                            return;
                        }

                        // Construct request data
                        const requestData = { phone_no: phoneNumber };


                        // Make the fetch request
                        const response = await fetch('/account-control/user/profile/update', {
                            method: 'PUT',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                            },
                            body: JSON.stringify(requestData)  // Sending the data in JSON format
                        });

                        // Handle the response
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            const error = await response.text();
                            butterup.toast({
                                title: 'Error Occured',
                                message: error,
                                type: 'error',
                            });
                        }
                    } catch (error) {
                        butterup.toast({
                            title: 'Unknown error Occured',
                            message: error,
                            type: 'error',
                        });
                    }
                });
            } catch (error) {
                butterup.toast({
                    title: 'Authentication Error',
                    message: "Please click" + " " + `<a  href="/login">Login </a>` + " " + "to continue",
                    type: 'error',
                });
            }
        } else {
            butterup.toast({
                title: 'Authentication Error',
                message: "Please click" + " " + `<a  href="/login">Login </a>` + " " + "to continue",
                type: 'error',
            });
        }
    } else {
        console.error("Required elements not found.");
    }

    // Attach logout listener (ensure this function is defined somewhere)
    if (typeof attachLogoutListener === 'function') {
        attachLogoutListener();
    } else {
        console.error("attachLogoutListener function is not defined.");
    }
});


document.addEventListener("DOMContentLoaded", () => {

    // Get elements
    const openModalLink = document.querySelector('.custom-open-modal-link');
    const openModalDelLink = document.querySelector('.custom-open-modal-del-link');
    const closeModalBtns = document.querySelectorAll('.custom-close-modal-btn');
    const closeModalBtns2 = document.querySelectorAll('.custom-close-modal-btn2');
    const modalOverlay = document.getElementById('customModalOverlay');
    const modalOverlay2 = document.getElementById('customModalOverlay2');



    // Open Modal
    if (openModalLink) {


        openModalLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior

            modalOverlay.style.display = 'flex';
        });
    }
    if (openModalDelLink) {
        openModalDelLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior

            modalOverlay2.style.display = 'flex';
        });
    }

    // Close Modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
    });
    closeModalBtns2.forEach(btn => {
        btn.addEventListener('click', () => {
            modalOverlay2.style.display = 'none';
        });
    });

    // Prevent Modal Close on Outside Click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });



    let submitReset = document.getElementById("send-reset");

    const oldpass = document.getElementById('custom-old-password');
    const newPass = document.getElementById('custom-new-password');
    const condirPass = document.getElementById('custom-confirm-password');

    let user = localStorage.getItem('exn-u-cookie');
    user = JSON.parse(user);

    if (submitReset) {
        submitReset.addEventListener('click', async function () {
            try {
                if (!user && !user.token.access) {
                    console.error("User not found");
                    return
                }
                const requestData = {
                    'old_password': oldpass.value,
                    'new_password': newPass.value,
                    'confirm_password': condirPass.value
                };
                try {
                    const response = await fetch('/account-control/user/change-password', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                        },
                        body: JSON.stringify(requestData)  // Sending the data in JSON format
                    });
                    if (response.ok) {
                        const result = await response.json();
                        butterup.toast({
                            title: 'Password Successfully Changed',
                            message: result.detail,
                            type: 'success',
                        });
                        modalOverlay.style.display = 'none';
                    }
                    else {
                        butterup.toast({
                            title: 'Unknown error Occured',
                            message: error,
                            type: 'error',
                        });
                    }
                } catch (error) {
                    butterup.toast({
                        title: 'Unknown error Occured',
                        message: error,
                        type: 'error',
                    });
                }
            } catch (error) {
                butterup.toast({
                    title: 'Unknown error Occured',
                    message: error,
                    type: 'error',
                });
            }
        });
    }
    let delacc = document.getElementById("delacc");
    if (delacc) {
        delacc.addEventListener('click', async function () {
            try {
                if (!user && !user.token.access) {
                    console.error("User not found");
                    return
                }

                try {
                    const response = await fetch('/account-control/user/del', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${user.token.access}`  // Ensure the token is correct
                        },

                    });
                    if (response.ok) {
                        const result = await response.json();
                        butterup.toast({
                            title: 'Delete Account',
                            message: result.detail,
                            type: 'success',
                        });
                        modalOverlay.style.display = 'none';
                        localStorage.removeItem("exn-u-cookie");
                        window.location.href = "/register";
                    }
                    else {
                        butterup.toast({
                            title: 'Unknown error Occured',
                            message: error,
                            type: 'error',
                        });
                    }
                } catch (error) {
                    butterup.toast({
                        title: 'Unknown error Occured',
                        message: error,
                        type: 'error',
                    });
                }
            } catch (error) {
                butterup.toast({
                    title: 'Unknown error Occured',
                    message: error,
                    type: 'error',
                });
            }
        });
    }



});


document.addEventListener("DOMContentLoaded", () => {
    const hotelGrid = document.getElementById("hotel__grid");
    const tableGrid = document.getElementById("table__grid");
    const cityArea = document.getElementById("cities__area");
    let user = localStorage.getItem('exn-u-cookie');
    user = JSON.parse(user);

    if (hotelGrid) {
        async function HotelDataPupolator() {
            try {
                const response = await fetch('/posts/h-post/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    let count = 0;
                    if (result?.hotel_data) {
                        result.hotel_data.forEach(ex => {
                            const colItem = document.createElement('div');
                            colItem.classList.add('col', 'd-flex', 'flex-column');
                            const image = document.createElement('img');
                            image.classList.add('img-fluid', 'custom-image');
                            image.alt = ex.hotel.name;
                            image.src = ex.image;
                            image.style.borderRadius = '10px';

                            const cardBody = document.createElement('div');
                            cardBody.classList.add('card-body', 'p-0');

                            const cardTitle = document.createElement('a');
                            cardTitle.id = `nak-${count}`;
                            cardTitle.style.fontSize = '1.6rem';
                            cardTitle.style.marginTop = '10px';
                            cardTitle.style.cursor = 'pointer';
                            cardTitle.classList.add('nav-link');
                            cardTitle.dataset.targetnak = ex.room_id; // Set data-targetnak
                            cardTitle.textContent = ex.hotel.name;

                            const locationText = document.createElement('p');
                            locationText.classList.add('card-text');
                            const locationIcon = document.createElement('i');
                            locationIcon.classList.add('fi', 'fi-rr-marker');
                            locationText.appendChild(locationIcon);
                            locationText.textContent += ` ${ex.hotel.city}, ${ex.hotel.country}`;

                            const bedText = document.createElement('p');
                            bedText.classList.add('card-text');
                            const bedIcon = document.createElement('i');
                            bedIcon.classList.add('fi', 'fi-rr-bed-alt');
                            bedText.appendChild(bedIcon);
                            bedText.textContent += ` ${ex.room_type}`;

                            const priceRatingText = document.createElement('p');
                            priceRatingText.classList.add('card-text');
                            priceRatingText.innerHTML = `<strong>$${ex.price}</strong>/nuit ★${ex.rating || '4.9'}`;

                            cardBody.appendChild(cardTitle);
                            cardBody.appendChild(locationText);
                            cardBody.appendChild(bedText);
                            cardBody.appendChild(priceRatingText);
                            colItem.appendChild(image);
                            colItem.appendChild(cardBody);

                            hotelGrid.appendChild(colItem);

                            // Add click event listener to the cardTitle for redirection
                            cardTitle.addEventListener('click', () => {
                                const targetId = cardTitle.dataset.targetnak; // Get data-targetnak value
                                const url = `/nakiese/hotel/bed-detail/${targetId}`; // Append targetId to URL
                                window.location.href = url; // Redirect to the detailed page
                            });

                            count++;
                        });
                    }


                    const carousel = document.querySelector('.carousel');  // Select the carousel container
                    if (result?.cities && carousel) {

                        // Clear previous cities (if needed)
                        carousel.innerHTML = '';

                        result.cities.forEach(city => {


                            const cityElement = `
                                <div style="position: relative; display: inline-block;">
                                    <div style="position: absolute; top:20px; left: 40px;">
                                        <p class="text-dark">${city.establishment}</p>
                                        <h4>${city.name}</h4>  <!-- Assuming 'name' contains the city name -->
                                    </div>
                                    <button class="btn btn-light rounded-pill" style="position: absolute; bottom: 40px; left: 40px;">
                                        Explore
                                    </button>
                                    <img src="${city.image}" alt="${city.name}" class="rounded-3" draggable="false" style="width: 90%;">
                                </div>
                            `;

                            // Append the newly created city item to the carousel
                            carousel.insertAdjacentHTML('beforeend', cityElement);
                        });
                    }

                } else {
                    butterup.toast({
                        title: 'Something went wrong',
                        message: "please ",
                        type: 'error',
                    });
                }
            } catch (error) {
                butterup.toast({
                    title: 'Unknown error Occured',
                    message: error,
                    type: 'error',
                });
            }
        }

        HotelDataPupolator();
    }

    if (document.getElementById("nak-grid-2")) {
        async function BedDetailPopulator() {
            try {
                const currentUrl = window.location.pathname;
                const postId = currentUrl.split("/").pop();
                const a1 = document.getElementById("a__1");
                const a2 = document.getElementById("a__2");
                const gridItem = document.getElementById("grid__items2");

                if (postId) {
                    const apiUrl = `/posts/sp-h-post/${postId}/`;

                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                    });

                    if (!response.ok) throw new Error('Failed to fetch hotel details');

                    const data = await response.json();

                    const container = document.getElementById('image-container');
                    const reviewGridinn1 = document.getElementById('review__grid_inn_1');
                    const reviewGridinn2 = document.getElementById('review__grid_inn_2');
                    const reviewGrid2 = document.getElementById('review__grid_2');
                    const bedDescription = document.getElementById('bed_description');
                    container.innerHTML = ''; // Clear previous content
                    reviewGridinn1.innerHTML = ''; // Clear previous content
                    reviewGridinn2.innerHTML = ''; // Clear previous content
                    reviewGrid2.innerHTML = ''; // Clear previous content

                    // Process hotel images
                    if (data.specific_bed?.hotel?.images && Array.isArray(data.specific_bed.hotel.images)) {
                        const images = data.specific_bed.hotel.images;
                        container.innerHTML = generateImageGrid(images);
                    } else {
                        console.error("Hotel data or images array is missing");
                    }

                    // Append hotel address details
                    if (data.specific_bed?.hotel?.city && data.specific_bed.hotel.country && data.specific_bed.hotel.address) {
                        a1.innerText = `${data.specific_bed.hotel.city.name}, ${data.specific_bed.hotel.country}`;
                        a2.innerText = data.specific_bed.hotel.address;
                    } else {
                        console.error("Missing hotel address details");
                    }
                    // Append hotel Description
                    if (data.specific_bed?.description) {
                        bedDescription.innerText = '';
                        bedDescription.innerText = data.specific_bed.description;
                    } else {
                        console.error("Missing hotel address details");
                    }

                    let reviews = data.specific_bed.reviews; // Assuming this is populated with your data
                    let reviewsPerPage = 3; // Number of reviews to show initially

                    // Function to display a limited number of reviews
                    function displayReviews(limit) {
                        reviewGrid2.innerHTML = ''; // Clear the review grid
                        for (let i = 0; i < Math.min(limit, reviews.length); i++) {
                            let review = reviews[i];
                            let reviewBed = createReviewElement(review);
                            reviewGrid2.appendChild(reviewBed);
                        }
                    }

                    // Function to create a review element
                    function createReviewElement(review) {
                        let reviewBed = document.createElement('div');
                        reviewBed.classList.add('mb-3');

                        let flexContainer = document.createElement('div');
                        flexContainer.classList.add('d-flex', 'justify-content-start', 'align-items-center');

                        let imageContainer = document.createElement('div');
                        let image = document.createElement('img');
                        image.src = "https://dummyimage.com/50x50/000/fff";
                        image.classList.add('rounded-pill');
                        image.alt = "image";
                        imageContainer.appendChild(image);

                        let textContainer = document.createElement('div');
                        textContainer.classList.add('ms-3');

                        let reviewerName = document.createElement('p');
                        reviewerName.classList.add('mb-1');
                        reviewerName.innerText = `${review.user.first_name} ${review.user.last_name}` || "Anonymous";
                        textContainer.appendChild(reviewerName);

                        let reviewDate = document.createElement('p');
                        reviewDate.classList.add('mb-1');
                        reviewDate.innerText = new Date(review.date_of_notice).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                        });
                        textContainer.appendChild(reviewDate);

                        flexContainer.appendChild(imageContainer);
                        flexContainer.appendChild(textContainer);

                        let commentParagraph = document.createElement('p');
                        commentParagraph.style.marginTop = '10px';
                        commentParagraph.style.marginLeft = '65px';
                        commentParagraph.innerText = review.comment || "No comment available.";

                        reviewBed.appendChild(flexContainer);
                        reviewBed.appendChild(commentParagraph);

                        return reviewBed;
                    }

                    // Function to create the Load More button
                    function createLoadMoreButton() {
                        let loadMoreBtn = document.createElement('button');
                        loadMoreBtn.id = 'loadMoreBtn';
                        loadMoreBtn.classList.add('btn', 'btn-outline-dark', 'mt-3', 'mb-4');
                        loadMoreBtn.innerText = 'Load More Reviews';
                        loadMoreBtn.addEventListener('click', showAllReviews);
                        return loadMoreBtn;
                    }

                    // Function to create the Close Reviews button
                    function createCloseButton() {
                        let closeBtn = document.createElement('button');
                        closeBtn.id = 'closeBtn';
                        closeBtn.classList.add('btn', 'btn-outline-dark', 'mt-3', 'mb-4');
                        closeBtn.innerText = 'Close Reviews';
                        closeBtn.addEventListener('click', function () {
                            displayReviews(reviewsPerPage);
                            if (reviews.length > reviewsPerPage) {
                                reviewGrid2.appendChild(createLoadMoreButton()); // Show the Load More button again
                            }
                            closeBtn.remove(); // Remove the Close button
                        });
                        return closeBtn;
                    }

                    // Function to show all reviews
                    function showAllReviews() {
                        displayReviews(reviews.length); // Show all reviews
                        let closeButton = createCloseButton();
                        reviewGrid2.appendChild(closeButton); // Add the Close Reviews button
                        document.getElementById('loadMoreBtn').remove(); // Remove the Load More button
                    }

                    // Initial load: Show first 3 reviews and possibly the Load More button
                    displayReviews(reviewsPerPage);
                    if (reviews.length > reviewsPerPage) {
                        reviewGrid2.appendChild(createLoadMoreButton());
                    }

                    if (data.specific_bed?.reviews && data.specific_bed.reviews.length > 0) {
                        let ratingSums = {};
                        let ratingCounts = {};

                        // Loop through each review and accumulate ratings for each review type
                        data.specific_bed.reviews.forEach(review => {
                            review.rating.forEach(rating => {
                                if (!ratingSums[rating.name]) {
                                    ratingSums[rating.name] = 0;  // Initialize sum for each review type
                                    ratingCounts[rating.name] = 0;  // Initialize count for each review type
                                }
                                ratingSums[rating.name] += parseFloat(rating.rate);  // Add the rating
                                ratingCounts[rating.name] += 1;  // Count the occurrence
                            });
                        });

                        let sumOfAverage = 0;
                        for (let type in ratingSums) {
                            let averageRating = (ratingSums[type] / ratingCounts[type]).toFixed(1);  // Calculate average and fix to 1 decimal place
                            sumOfAverage += parseFloat(averageRating);  // Convert the averageRating back to a number and add it to sumOfAverage

                            // Create a new div for the review type name
                            let nameDiv = document.createElement('div');
                            let nameParagraph = document.createElement('p');
                            nameParagraph.classList.add('mb-1');
                            nameParagraph.textContent = type;  // The review type (e.g., Cleanliness)
                            nameDiv.appendChild(nameParagraph);

                            // Create a new div for the average rating
                            let valueDiv = document.createElement('div');
                            let valueParagraph = document.createElement('p');
                            valueParagraph.classList.add('mb-1');
                            valueParagraph.textContent = averageRating;  // The average rating (rounded to 1 decimal place)
                            valueDiv.appendChild(valueParagraph);

                            // Append both divs to the reviewGrid
                            reviewGridinn1.appendChild(nameDiv);
                            reviewGridinn2.appendChild(valueDiv);
                        }
                        document.getElementById("av_rating").innerText = (sumOfAverage / 5).toFixed(1)

                    } else {
                        let reviewContainer = document.getElementById("review__container");
                        reviewContainer.innerHTML = "";
                        reviewContainer.style.marginBottom = "50px";
                        let H6 = document.createElement('h6');
                        H6.innerText = "No reviews available";
                        H6.style.width = "100%";
                        reviewContainer.append(H6);
                        document.getElementById("av_rating").innerText = "0";
                    }

                    // Grid Items Creation
                    if (gridItem && data.all_beds && Array.isArray(data.all_beds) && data.all_beds.length > 0) {
                        gridItem.innerHTML = generateGridItems(data.all_beds);
                    } else {
                        if (gridItem) {
                            gridItem.style.width = "100%";
                            let H6 = document.createElement('h6');
                            H6.innerText = "No beds available at the moment. Please check back later.";
                            H6.style.width = "100%";
                            gridItem.innerHTML = ''; // Clear any existing content
                            gridItem.appendChild(H6); // Append the new H3 element
                        }
                    }



                } else {
                    console.error('No postId found in the URL');
                }
            } catch (error) {
                console.log(error)
            }
        }

        BedDetailPopulator();

        // Helper functions

        function generateGridItems(beds) {
            let gridHTML = '';
            beds.forEach((ex, index) => {
                gridHTML += `
                    <div class="col d-flex flex-column">
                        <img src="${ex.image}" alt="${ex.hotel.name}" class="img-fluid custom-image" style="border-radius: 10px;">
                        <div class="card-body p-0">
                            <a id="nak-${index}" style="font-size: 1.6rem; margin-top: 10px; cursor: pointer;" class="nav-link" data-targetnak="${ex.room_id}">
                                ${ex.hotel.name}
                            </a>
                            <p class="card-text"><i class="fi fi-rr-marker"></i> ${ex.hotel.city}, ${ex.hotel.country}</p>
                            <p class="card-text"><i class="fi fi-rr-bed-alt"></i> ${ex.room_type}</p>
                            <p class="card-text"><strong>$${ex.price}</strong>/nuit ★${ex.rating || '4.9'}</p>
                        </div>
                    </div>`;
            });

            return gridHTML;
        }

        // Event delegation for clicks on card titles
        document.addEventListener('click', function (e) {
            if (e.target.matches('[id^="nak-"]')) {
                const targetId = e.target.dataset.targetnak;
                window.location.href = `/nakiese/hotel/bed-detail/${targetId}`;
            }
        });
    }

});

// Universal grid creater
function generateImageGrid(images) {
    if (images.length === 1) {
        return `
            <div class="col-lg-12">
                <img src="${images[0].image}" alt="image" class="img-fluid w-100 h-auto rounded-4">
            </div>`;
    } else {
        return `
            <div class="col-lg-6">
                <img src="${images[0].image}" alt="image" class="img-fluid w-100 h-100 rounded-4">
            </div>
            <div class="col-lg-6">
                <div class="row mb-3">
                    <div class="col-lg-6">
                        <img src="${images[1]?.image}" alt="image" class="img-fluid w-100 h-100 rounded-4">
                    </div>
                    <div class="col-lg-6">
                        <img src="${images[2]?.image}" alt="image" class="img-fluid w-100 h-100 rounded-4">
                    </div>
                </div>
                <div class="row pt-1">
                    <div class="col-lg-6">
                        <img src="${images[3]?.image}" alt="image" class="img-fluid w-100 h-100 rounded-4">
                    </div>
                    <div class="col-lg-6">
                        ${images[4] ? `<img src="${images[4].image}" alt="image" class="img-fluid w-100 h-100 rounded-4">` : ''}
                    </div>
                </div>
            </div>`;
    }
}
// Ending


document.addEventListener("DOMContentLoaded", () => {
    const tableGrid = document.getElementById("table__grid");

    let user = localStorage.getItem('exn-u-cookie');
    user = JSON.parse(user);

    if (tableGrid) {
        async function hotelDataPopulator() {
            try {
                const response = await fetch('/posts/t-post/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.error('Fetch failed with status:', response.status);
                    return;
                }

                const result = await response.json();

                if (!result?.table_data) return;

                let fragment = document.createDocumentFragment(); // Use a document fragment for batch DOM updates
                let count = 0;
                result.table_data.forEach(ex => {
                    if (!ex || !ex.restaurant) {
                        console.warn(`Missing data for entry:`, ex);
                        return;
                    }

                    // Create elements
                    const colItem = document.createElement('div');
                    colItem.classList.add('col', 'd-flex', 'flex-column');

                    const image = document.createElement('img');
                    image.classList.add('img-fluid', 'rounded-2', 'mb-2');
                    image.alt = ex.restaurant.name || 'Unknown Restaurant';
                    image.src = ex.images || '/static/images/default-hotel.jpg';

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body', 'p-0');

                    const titleContainer = document.createElement('div');
                    titleContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center');

                    const cardTitle = document.createElement('a');
                    cardTitle.textContent = ex.restaurant.name || 'Unknown Restaurant';
                    cardTitle.id = `nak-${count}`;
                    const ratingText = document.createElement('h5');
                    ratingText.textContent = `★${ex.rating || '4.9'}`;
                    ratingText.style.marginTop = '10px';
                    cardTitle.style.fontSize = '1.6rem';
                    cardTitle.style.marginTop = '10px';
                    cardTitle.style.cursor = 'pointer';
                    cardTitle.classList.add('nav-link', 'mt-0');
                    cardTitle.dataset.targetnak = ex.table_id;

                    const locationText = document.createElement('p');
                    locationText.classList.add('card-text', 'mb-0');
                    locationText.innerHTML = `<i class="fi fi-rr-marker"></i> ${ex.restaurant.city.name || 'Unknown City'}, ${ex.restaurant.country || 'Unknown Country'}`;

                    const bedText = document.createElement('p');
                    bedText.classList.add('card-text', 'mb-1');
                    bedText.innerHTML = `<i class="fi fi-rr-bed-alt"></i> ${ex.capacity || 'Unknown Capacity'}`;

                    const priceText = document.createElement('p');
                    priceText.classList.add('card-text', 'mb-1');
                    priceText.innerHTML = `<strong>$${ex.price || '0'}</strong>/table`;

                    // Append elements to card body and colItem
                    titleContainer.appendChild(cardTitle);
                    titleContainer.appendChild(ratingText);
                    cardBody.appendChild(titleContainer);
                    cardBody.appendChild(locationText);
                    cardBody.appendChild(bedText);
                    cardBody.appendChild(priceText);
                    colItem.appendChild(image);
                    colItem.appendChild(cardBody);

                    // Append colItem to fragment (not directly to the DOM)
                    fragment.appendChild(colItem);

                    // Redirect user on cardTitle click
                    cardTitle.addEventListener('click', () => {
                        const targetId = ex.table_id;
                        if (targetId) {
                            window.location.href = `/nakiese/resturant/table/${targetId}`;
                        } else {
                            console.warn('Missing room_id for entry:', ex);
                        }
                    });
                    count++;
                });

                // Append fragment to tableGrid in one operation
                tableGrid.appendChild(fragment);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        // Debounce the population function to avoid rapid firing
        const debouncedHotelDataPopulator = debounce(hotelDataPopulator, 300);
        debouncedHotelDataPopulator();
    }

    // Debounce utility function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }



    if (document.getElementById('nak-grid-3')) {

        async function BedDetailPopulator() {
            try {
                const currentUrl = window.location.pathname;
                const postId = currentUrl.split("/").pop();
                const a1 = document.getElementById("t__1");
                const a2 = document.getElementById("t__2");
                const gridItem = document.getElementById("grid__items2");

                if (postId) {
                    const apiUrl = `/posts/sp-t-post/${postId}/`;

                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',

                        },
                    });

                    if (!response.ok) throw new Error('Failed to fetch hotel details');


                    const data = await response.json();

                    console.log(data);

                    const container = document.getElementById('image-container');
                    const reviewGridinn1 = document.getElementById('review__grid_inn_1');
                    const reviewGridinn2 = document.getElementById('review__grid_inn_2');
                    const reviewGrid2 = document.getElementById('review__grid_2');
                    const bedDescription = document.getElementById('table_description');
                    const menuGrid = document.getElementById('menu__grid');
                    container.innerHTML = ''; // Clear previous content
                    reviewGridinn1.innerHTML = ''; // Clear previous content
                    reviewGridinn2.innerHTML = ''; // Clear previous content
                    reviewGrid2.innerHTML = ''; // Clear previous content
                    menuGrid.innerHTML = ''; // Clear previous content

                    // Process hotel images
                    if (data.specific_table?.restaurant?.images && Array.isArray(data.specific_table.restaurant.images)) {
                        const images = data.specific_table.restaurant.images;
                        container.innerHTML = generateImageGrid(images);
                    } else {
                        console.error("Hotel data or images array is missing");
                    }

                    // Append hotel address details
                    if (data.specific_table?.restaurant?.city && data.specific_table?.restaurant.country) {
                        a1.innerText = `${data.specific_table.restaurant.city.name}, ${data.specific_table.restaurant.country}`;
                        a2.innerText = data.specific_table.restaurant.address;
                    } else {
                        console.error("Missing hotel address details");
                    }
                    // Append hotel Description
                    if (data.specific_table?.restaurant?.description) {
                        bedDescription.innerText = '';
                        bedDescription.innerText = data.specific_table.restaurant.description;
                    } else {
                        console.error("Missing hotel address details");
                    }
                    // All Relation Menu
                    if (data?.menu) {
                        menuGrid.innerHTML = generateGridItem_a(data.menu)
                    } else {
                        console.error("Missing hotel address details");
                    }

                    let reviews = data.specific_table.review; // Assuming this is populated with your data
                    let reviewsPerPage = 3; // Number of reviews to show initially

                    // Function to display a limited number of reviews
                    function displayReviews(limit) {
                        reviewGrid2.innerHTML = ''; // Clear the review grid
                        for (let i = 0; i < Math.min(limit, reviews.length); i++) {
                            let review = reviews[i];
                            let reviewBed = createReviewElement(review);
                            reviewGrid2.appendChild(reviewBed);
                        }
                    }

                    // Function to create a review element
                    function createReviewElement(review) {


                        let reviewBed = document.createElement('div');
                        reviewBed.classList.add('mb-3');

                        let flexContainer = document.createElement('div');
                        flexContainer.classList.add('d-flex', 'justify-content-start', 'align-items-center');

                        let imageContainer = document.createElement('div');
                        let image = document.createElement('img');
                        image.src = "https://dummyimage.com/50x50/000/fff";
                        image.classList.add('rounded-pill');
                        image.alt = "image";
                        imageContainer.appendChild(image);

                        let textContainer = document.createElement('div');
                        textContainer.classList.add('ms-3');

                        let reviewerName = document.createElement('p');
                        reviewerName.classList.add('mb-1');
                        reviewerName.innerText = review.reviewer_name || "Anonymous";
                        textContainer.appendChild(reviewerName);

                        let reviewDate = document.createElement('p');
                        reviewDate.classList.add('mb-1');
                        reviewDate.innerText = new Date(review.date_of_notice).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                        });
                        textContainer.appendChild(reviewDate);

                        flexContainer.appendChild(imageContainer);
                        flexContainer.appendChild(textContainer);

                        let commentParagraph = document.createElement('p');
                        commentParagraph.style.marginTop = '10px';
                        commentParagraph.style.marginLeft = '65px';
                        commentParagraph.innerText = review.comment || "No comment available.";

                        reviewBed.appendChild(flexContainer);
                        reviewBed.appendChild(commentParagraph);

                        return reviewBed;
                    }

                    // Function to create the Load More button
                    function createLoadMoreButton() {
                        let loadMoreBtn = document.createElement('button');
                        loadMoreBtn.id = 'loadMoreBtn';
                        loadMoreBtn.classList.add('btn', 'btn-outline-dark', 'mt-3', 'mb-4');
                        loadMoreBtn.innerText = 'Load More Reviews';
                        loadMoreBtn.addEventListener('click', showAllReviews);
                        return loadMoreBtn;
                    }

                    // Function to create the Close Reviews button
                    function createCloseButton() {
                        let closeBtn = document.createElement('button');
                        closeBtn.id = 'closeBtn';
                        closeBtn.classList.add('btn', 'btn-outline-dark', 'mt-3', 'mb-4');
                        closeBtn.innerText = 'Close Reviews';
                        closeBtn.addEventListener('click', function () {
                            displayReviews(reviewsPerPage);
                            if (reviews.length > reviewsPerPage) {
                                reviewGrid2.appendChild(createLoadMoreButton()); // Show the Load More button again
                            }
                            closeBtn.remove(); // Remove the Close button
                        });
                        return closeBtn;
                    }

                    // Function to show all reviews
                    function showAllReviews() {
                        displayReviews(reviews.length); // Show all reviews
                        let closeButton = createCloseButton();
                        reviewGrid2.appendChild(closeButton); // Add the Close Reviews button
                        document.getElementById('loadMoreBtn').remove(); // Remove the Load More button
                    }

                    // Initial load: Show first 3 reviews and possibly the Load More button
                    displayReviews(reviewsPerPage);
                    if (reviews.length > reviewsPerPage) {
                        reviewGrid2.appendChild(createLoadMoreButton());
                    }

                    if (data.specific_table?.review) {
                        let ratingSums = {};
                        let ratingCounts = {};

                        // Loop through each review and accumulate ratings for each review type
                        data.specific_table.review.forEach(review => {
                            review.rating.forEach(rating => {
                                if (!ratingSums[rating.name]) {
                                    ratingSums[rating.name] = 0;  // Initialize sum for each review type
                                    ratingCounts[rating.name] = 0;  // Initialize count for each review type
                                }
                                ratingSums[rating.name] += parseFloat(rating.rate);  // Add the rating
                                ratingCounts[rating.name] += 1;  // Count the occurrence
                            });
                        });

                        let sumOfAverage = 0;
                        for (let type in ratingSums) {
                            let averageRating = (ratingSums[type] / ratingCounts[type]).toFixed(1);  // Calculate average and fix to 1 decimal place
                            sumOfAverage += parseFloat(averageRating);  // Convert the averageRating back to a number and add it to sumOfAverage

                            // Create a new div for the review type name
                            let nameDiv = document.createElement('div');
                            let nameParagraph = document.createElement('p');
                            nameParagraph.classList.add('mb-1');
                            nameParagraph.textContent = type;  // The review type (e.g., Cleanliness)
                            nameDiv.appendChild(nameParagraph);

                            // Create a new div for the average rating
                            let valueDiv = document.createElement('div');
                            let valueParagraph = document.createElement('p');
                            valueParagraph.classList.add('mb-1');
                            valueParagraph.textContent = averageRating;  // The average rating (rounded to 1 decimal place)
                            valueDiv.appendChild(valueParagraph);

                            // Append both divs to the reviewGrid
                            reviewGridinn1.appendChild(nameDiv);
                            reviewGridinn2.appendChild(valueDiv);
                        }
                        document.getElementById("av_rating").innerText = (sumOfAverage / 5).toFixed(1);
                        document.getElementById("av_rating_b").innerHTML = `${(sumOfAverage / 5).toFixed(1)} 
                        <span class="ms-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-star-fill" viewBox="0 0 16 16">
                                <path
                                    d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                        </span>
                        `;

                    } else {
                        console.error("Missing hotel reviews details");
                    }

                    // Grid Items Creation

                } else {
                    console.error('No postId found in the URL');
                }
            } catch (error) {
                console.log(error)
            }
        }

        BedDetailPopulator();

        function generateGridItem_a(tables) {
            let gridHTML = '';
            tables.forEach((ex, index) => {
                gridHTML += `
                <div class="mb-3">
                    <div class="card mb-3" style="max-width: 540px;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src=${ex.image} class="img-fluid rounded-start" alt="${ex.name}">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body p-4">
                                <p class="card-text mb-0">${ex.category}</p>
                                <h5 class="card-title mb-4">${ex.name}</h5>
                                <p class="card-text" style="font-weight:bold;">
                                    $${(Number(ex.price) || 0).toFixed(0)}
                                </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            });

            return gridHTML;
        }

      
    }

    // Detail handle
});




// Search optimization
function searchHotelRooms() {
    const cityName = document.getElementById('cityInput').value;
    const availabilityFromInput = document.getElementById('dateInputg').value; // e.g., "29-09-2024"
    const availabilityTillInput = document.getElementById('dateInputa').value; // e.g., "30-09-2024"
    const capacity = document.getElementById('capacityInput').value;

    // Validate city name (required field)
    if (!cityName) {
        alert('City is required for search.');
        return;
    }

    // Check and validate dates
    if (!availabilityFromInput || !availabilityTillInput) {
        alert('Both availability dates are required.');
        return;
    }

    // Function to parse date in "d-m-Y" format
    // Function to parse date in "d-m-Y" format
    function manualParseDateDMY(dateString) {
        const [day, month, year] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-based in JavaScript Date

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format. Please use a valid date.');
        }

        // Manually adjust to prevent timezone issues
        date.setHours(12); // Set time to noon to avoid timezone shifts

        // Return formatted date in YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }

    // Try to create date objects and format them to YYYY-MM-DD
    let formattedAvailabilityFrom, formattedAvailabilityTill;
    try {
        formattedAvailabilityFrom = manualParseDateDMY(availabilityFromInput);
        formattedAvailabilityTill = manualParseDateDMY(availabilityTillInput);
    } catch (error) {
        alert(error.message); // Show error to user
        return;
    }

    // Prepare the URL with query parameters
    const queryParams = new URLSearchParams({
        hotel_city_name: cityName,
        availability_from: formattedAvailabilityFrom,
        availability_till: formattedAvailabilityTill,
        capacity: capacity || ''
    });

    // Redirect to search results page with query parameters
    window.location.href = `/nakiese/search-h?${queryParams.toString()}`;
}

// Event listener for the search button
document.getElementById('searchButton').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form submission
    searchHotelRooms(); // Redirect to search results page
});
