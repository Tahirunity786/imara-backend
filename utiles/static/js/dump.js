const updateUserProfile = document.getElementById('updateuser-profile');
if (updateUserProfile) {
    updateUserProfile.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission
        const form = event.target;
        const formData = new FormData(form);
        // Get session data
        let user_data = localStorage.getItem("user");
        // Check if user_data is not null
        if (user_data) {
            let user = JSON.parse(user_data);
            try {
                const response = await fetch(`/account/user/update-profile/${user.class}/`, {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        "Authorization": `Bearer ${user.token.access}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    // Handle success (e.g., redirect, show a message)
                    butterup.toast({
                        title: 'Profile Update Success',
                        message: 'Your profile has been successfully updated!',
                        type: 'success',
                    });

                    // Update sessionStorage data
                    let updatedUser = {
                        ...user,
                        ...result.user,
                        class: user.class,  // Keep the original class
                        token: user.token   // Keep the original token
                    };
                    localStorage.setItem("user", JSON.stringify(updatedUser));

                } else {
                    // Handle errors
                    const errorData = await response.json();
                    console.log(errorData);
                    if (errorData.Error && Array.isArray(errorData.Error)) {
                        errorData.Error.forEach(error => {
                            butterup.toast({
                                title: 'Profile Update Error',
                                message: error,
                                type: 'error',
                            });
                        });
                    } else {
                        butterup.toast({
                            title: 'Profile Update Error',
                            message: 'An unknown error occurred. Please try again.',
                            type: 'error',
                        });
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                butterup.toast({
                    title: 'Profile Update Error',
                    message: 'An error occurred while submitting the form.',
                    type: 'error',
                });
            }
        } else {
            console.error("No user data found in session storage.");
        }
    });
}
const chngPass = document.getElementById('chng-pass');
if (chngPass) {
    chngPass.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const form = event.target;
        const formData = new FormData(form);

        // Get session data
        let user_data = sessionStorage.getItem("user");

        // Check if user_data is not null
        if (user_data) {
            let user = JSON.parse(user_data);

            try {
                const response = await fetch('/account/user/update-profile/change-password/', {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${user.token.access}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    butterup.toast({
                        title: 'Password Change Success',
                        message: 'Your password has been successfully updated!',
                        type: 'success',
                    });

                    // No need to update user data in sessionStorage for password change
                    // Just show a success message

                } else {
                    // Handle errors
                    const errorData = await response.json();
                    if (errorData.Error && Array.isArray(errorData.Error)) {
                        errorData.Error.forEach(error => {
                            butterup.toast({
                                title: 'Password Change Error',
                                message: error,
                                type: 'error',
                            });
                        });
                    } else {
                        butterup.toast({
                            title: 'Password Change Error',
                            message: 'An unknown error occurred. Please try again.',
                            type: 'error',
                        });
                    }
                }
            } catch (error) {
                butterup.toast({
                    title: 'Password Change Error',
                    message: 'An error occurred while submitting the form.',
                    type: 'error',
                });
            }
        } else {
            console.error("No user data found in session storage.");
        }
    });
}