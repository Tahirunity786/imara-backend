document.addEventListener('DOMContentLoaded', () => {
    function calculateRemainingTime(checkIn, checkOut) {

        const now = new Date();
        const checkInDate = new Date(checkIn);
        const checkOutDate = checkOut ? new Date(checkOut) : null;

        if (checkInDate > now) {
            // Case 1: Future booking start date
            const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));
            return `Booking starts in ${daysUntilCheckIn} day(s)`;
        }
    
        if (checkInDate <= now && checkOutDate) {
            // Case 2: Calculate remaining time between check-in and check-out
            const timeDifference = checkOutDate - now;
    
            if (timeDifference > 0) {
                const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                return `${days} days, ${hours} hrs, ${minutes} mins`;
            }
        }
    
        if (checkInDate <= now && (!checkOutDate || checkOutDate.toDateString() === checkInDate.toDateString())) {
            // Case 3: Remaining time until midnight of the check-in day
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0); // Set to midnight of the current day
            const timeUntilMidnight = midnight - now;
    
            if (timeUntilMidnight > 0) {
                const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
                const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours} hrs, ${minutes} mins`;
            }
        }
    
        // Default case: Time expired
        return "Time expired";
    }
    
    
    function calculateTimeUntilMidnight(bookingTime) {
        const now = new Date(bookingTime);
        console.log(now)
        const midnight = new Date(bookingTime);
        midnight.setHours(24, 0, 0, 0); // Set to midnight of the current day
        const bookingDate = new Date(bookingTime);
    
        if (bookingDate <= now && now < midnight) {
            const timeDifference = midnight - now;
            const hours = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m until midnight`;
        }
        return "Time expired";
    }
    
    function gridGenerator(data) {
        let gridHTML = ''; // Declare gridHTML as a string
        // Iterate over the array of objects in the data
        data.forEach(item => {
            if (item.orders && Array.isArray(item.orders)) {
                item.orders.forEach(order => {
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(orderItem => {
                            const content = orderItem.content_object; // Access the content object
                            const typeBooking = order.type_booking; // Get the booking type
    
                            const nights = order.nights || 0; // Get number of nights
                            const pricePerNight = content.price || 0; // Get the price per night
                            const totalPrice = nights > 0 ? pricePerNight * nights : 0; // Calculate total price
    
                            const image = content.images || content.image || ""; // Image fallback
                            const name = typeBooking === "bed" 
                                ? content.hotel?.name || "Hotel Name Not Available" 
                                : content.restaurant?.name || "Restaurant Name Not Available";
                            const country = typeBooking === "bed" 
                                ? content.hotel?.country || "Country Not Available" 
                                : content.restaurant?.country || "Country Not Available";
                            const city = typeBooking === "bed" 
                                ? content.hotel?.city?.name || "City Not Available" 
                                : content.restaurant?.city?.name || "City Not Available";
                            const address = typeBooking === "bed" 
                                ? content.hotel?.city?.name || "Address Not Available" 
                                : content.restaurant?.address || "Address Not Available";
    
                            const typeSpecificText = typeBooking === "bed" ? "per night" : "/per table";
    
                            // Calculate remaining time
                            let remainingTime = '';
                            if (typeBooking === "bed") {
                                remainingTime = calculateRemainingTime(order.check_in, order.check_out);
                            } else if (typeBooking === "table") {
                                remainingTime = calculateTimeUntilMidnight(order.check_in);
                            }
    
                            gridHTML += `
                                <div class="col p-2">
                                    <div class="card" style="width: 100%; border: none;">
                                        <img src="${image}" class="card-img-top mb-3" alt="${name}" height="200">
                                        <div class="card-body p-0">
                                            <div class="mb-4">
                                                <h6>${name}</h6>
                                                </div>
                                            <p>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-alarm" viewBox="0 0 16 16">
                                                        <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9z" />
                                                        <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1zm1.038 3.018a6 6 0 0 1 .924 0 6 6 0 1 1-.924 0M0 3.5c0 .753.333 1.429.86 1.887A8.04 8.04 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5M13.5 1c-.753 0-1.429.333-1.887.86a8.04 8.04 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1" />
                                                    </svg>
                                                ${remainingTime}
                                            </p>
                                            <p class="card-text">${country}, ${city}, ${address}</p>
                                            <h6><span class="fs-bold">${pricePerNight}$</span> ${typeSpecificText}</h6>
                                            ${nights > 0 ? `<p>Total price for ${nights} nights: <strong>${totalPrice}$</strong></p>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                    };
                });
            }
        });
    
        return gridHTML;
    }
    

    async function bookingHandling() {
        let bookingGrid = document.getElementById('booking_grid');

        let response = await fetch('/posts/show-all-orders', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            let data = await response.json();
            console.log(data); // Debugging to ensure the data is as expected
            bookingGrid.innerHTML = gridGenerator(data); // Pass data to gridGenerator
        } else {
            console.error("Failed to fetch bookings");
        }
    }

    bookingHandling();
});
