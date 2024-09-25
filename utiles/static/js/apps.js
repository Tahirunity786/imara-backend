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
            <button class="btn btn-light rounded-pill d-flex justify-content-center align-items-center p-0 ms-4"
          style="height: 40px; width: 40px; border: 1px solid rgb(218, 218, 218);">
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
    openModalLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default anchor behavior

        modalOverlay.style.display = 'flex';
    });
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

// Hotel Home page
document.addEventListener("DOMContentLoaded", () => {
    const hotelGrid = document.getElementById("hotel__grid");
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

                    result.forEach(ex => {
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
                            'Authorization': `Bearer ${user.token.access}`
                        },
                    });

                    if (!response.ok) throw new Error('Failed to fetch hotel details');

                    const data = await response.json();
                    console.log(data);


                    const container = document.getElementById('image-container');
                    const reviewGridinn1 = document.getElementById('review__grid_inn_1');
                    const reviewGridinn2 = document.getElementById('review__grid_inn_2');
                    const reviewGrid2 = document.getElementById('review__grid_2');
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

                    // A review Grid creation
                    // A review Grid creation
                    if (data.specific_bed?.reviews) {
                        data.specific_bed.reviews.forEach(review => {
                            // Create the outer div for the review
                            let reviewBed = document.createElement('div');
                            reviewBed.classList.add('mb-5');

                            // Create the inner flex container
                            let flexContainer = document.createElement('div');
                            flexContainer.classList.add('d-flex', 'justify-content-start', 'align-item-center');

                            // Create the image container
                            let imageContainer = document.createElement('div');
                            let image = document.createElement('img');
                            image.src = "https://dummyimage.com/50x50/000/fff"; // Dummy image
                            image.classList.add('rounded-pill');
                            image.alt = "image";
                            imageContainer.appendChild(image);

                            // Create the text container
                            let textContainer = document.createElement('div');
                            textContainer.classList.add('ms-3');

                            // Reviewer name
                            let reviewerName = document.createElement('p');
                            reviewerName.classList.add('mb-1');
                            reviewerName.innerText = "Marie Nzala"; // Replace with actual reviewer name if available
                            textContainer.appendChild(reviewerName);

                            // Review date
                            let reviewDate = document.createElement('p');
                            reviewDate.classList.add('mb-1');
                            reviewDate.innerText = new Date(review.date_of_notice).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                            }); // Format the date from the review object
                            textContainer.appendChild(reviewDate);

                            // Append the image and text containers to the flex container
                            flexContainer.appendChild(imageContainer);
                            flexContainer.appendChild(textContainer);

                            // Create the review comment paragraph
                            let commentParagraph = document.createElement('p');
                            commentParagraph.style.marginTop = '10px';
                            commentParagraph.style.marginLeft = '65px';
                            commentParagraph.innerText = review.comment || "No comment available."; // Review comment text

                            // Append everything to the main reviewBed div
                            reviewBed.appendChild(flexContainer);
                            reviewBed.appendChild(commentParagraph);

                            // Finally, append reviewBed to the parent element (e.g., #review__grid)
                            reviewGrid2.appendChild(reviewBed);
                        });
                    } else {
                        console.error("Missing hotel reviews details");
                    }
                    if (data.specific_bed?.reviews) {
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
                        document.getElementById("av_rating").innerText= (sumOfAverage/5).toFixed(1)

                    } else {
                        console.error("Missing hotel reviews details");
                    }

                    // Grid Items Creation
                    if (gridItem && data.all_beds && Array.isArray(data.all_beds)) {
                        gridItem.innerHTML = generateGridItems(data.all_beds);
                    } else {
                        console.error("No beds found or data.all_beds is not an array");
                    }
                } else {
                    console.error('No postId found in the URL');
                }
            } catch (error) {
                butterup.toast({
                    title: 'Unknown error occurred',
                    message: error.message || error,
                    type: 'error',
                });
            }
        }

        BedDetailPopulator();

        // Helper functions
        function generateImageGrid(images) {
            if (images.length === 1) {
                return `
                    <div class="col-lg-12">
                        <img src="${images[0].image}" alt="image" class="img-fluid w-100 h-auto rounded-4">
                    </div>`;
            } else {
                return `
                    <div class="col-lg-6">
                        <img src="${images[0].image}" alt="image" class="img-fluid w-100 h-auto rounded-4">
                    </div>
                    <div class="col-lg-6">
                        <div class="row mb-3">
                            <div class="col-lg-6">
                                <img src="${images[1]?.image}" alt="image" class="img-fluid w-100 h-auto rounded-4">
                            </div>
                            <div class="col-lg-6">
                                <img src="${images[2]?.image}" alt="image" class="img-fluid w-100 h-auto rounded-4">
                            </div>
                        </div>
                        <div class="row pt-1">
                            <div class="col-lg-6">
                                <img src="${images[3]?.image}" alt="image" class="img-fluid w-100 h-auto rounded-4">
                            </div>
                            <div class="col-lg-6">
                                ${images[4] ? `<img src="${images[4].image}" alt="image" class="img-fluid w-100 h-auto rounded-4">` : ''}
                            </div>
                        </div>
                    </div>`;
            }
        }

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
        function reviewGrid(review) {

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
