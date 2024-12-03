document.addEventListener("DOMContentLoaded", () => {


    const tableSpread = document.getElementById('table__spreader');
    const localData = localStorage.getItem('nk-pmt-data');

    const LanguageManager = (function () {
        const DEFAULT_LANGUAGE = 'en';

        function getLanguage() {
            return localStorage.getItem('lang') || DEFAULT_LANGUAGE;
        }

        function setLanguage(lang) {
            localStorage.setItem('lang', lang);
        }

        return {
            getLanguage,
            setLanguage
        };
    })();
    // Function to generate table HTML for rooms and tables
    function generateTableContent(data) {
        // Clear previous content
        tableSpread.innerHTML = "";

        // Check if room data is present and generate the room table
        if (data.rooms && data.rooms.details.length > 0) {
            const roomTable = document.createElement('table');
            roomTable.classList.add('table', 'table-bordered');
            roomTable.innerHTML = `
            <tbody>
                <tr>
                    <td colspan="2">No of Rooms</td>
                    <td>${data.rooms.details.length}</td>
                </tr>
                <tr>
                    <td colspan="2">Price</td>
                    <td>${data.rooms.total_price || 0}$</td>
                </tr>
            </tbody>
        `;
            tableSpread.appendChild(roomTable);
        }

        // Check if table data is present and generate the table table
        if (data.tables && data.tables.details.length > 0) {
            const tablesTable = document.createElement('table');
            tablesTable.classList.add('table', 'table-bordered');
            tablesTable.innerHTML = `
            <tbody>
                <tr>
                    <td colspan="2">No of Tables</td>
                    <td>${data.tables.details.length}</td>
                </tr>
                <tr>
                    <td colspan="2">Price</td>
                    <td>${data.tables.total_price || 0}$</td>
                </tr>
            </tbody>
        `;
            tableSpread.appendChild(tablesTable);
        }

        // Always show the total price table
        const totalPriceTable = document.createElement('table');
        totalPriceTable.classList.add('table', 'table-bordered');
        totalPriceTable.innerHTML = `
        <tbody>
            <tr>
                <td colspan="2">Tax & Fee</td>
                <td>-</td>
            </tr>
            <tr>
                <td colspan="2">Booking Fee</td>
                <td>-</td>
            </tr>
            <tr>
                <td colspan="2" style="background-color: #4B75A5; color: white;">Amount</td>
                <td style="background-color: #4B75A5; color: white;">${data.grand_total_price || 0}$</td>
            </tr>
        </tbody>
    `;
        tableSpread.appendChild(totalPriceTable);
    }
    function createCarousel(data) {
        const carouselContainer = document.getElementById('for__booking');
        carouselContainer.innerHTML = ''; // Clear any previous carousel items

        // Check if there's room or table data to display
        if (data.rooms && data.rooms.length > 0) {
            data.rooms.forEach((room, index) => {
                const isActive = index === 0 ? 'active' : ''; // Set first item as active
                const avgRating = room.avg_rating || 0;
                const fullStars = Math.floor(avgRating);  // Number of full stars
                const hasHalfStar = avgRating % 1 >= 0.5; // Check if there’s a half star

                // Generate stars based on avg_rating
                let starsHtml = '';
                for (let i = 0; i < fullStars; i++) {
                    starsHtml += `<img src="/static/images/Star 1.svg" style="height: 20px;" alt="">`;
                }
                if (hasHalfStar) {
                    starsHtml += `<img src="/static/images/Star_half.svg" style="height: 20px;" alt="">`;
                }

                const roomItem = `
                    <div class="carousel-item ${isActive} pe-2">
                        <div class="d-flex justify-content-between mb-3">
                            <div class="p-x13">
                                <img class="rounded-4" src="${room.image || './assets/images/default-room.jpg'}" style="height: 100%; width:100%" alt="Room Image">
                            </div>
                            <div class="p-x14">
                                <div class="d-flex w-100">
                                    <div class="d-flex justify-content-between align-items-center p-x15" style="font-size: 1rem !important;">
                                        ${starsHtml} <span class="ms-3">(${avgRating})</span> 
                                    </div>
                                </div>
                                <h3 class="p-x17">${room.hotel.name || 'Room Name'}</h3>
                                <h3 class="p-x17">${room.price || 'Price'}$</h3>
                                <h3 class="p-x17">Room</h3>
                            </div>
                        </div>
                        <div class="mb-4">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="bg-p p-3">
                                        <h4 class="mb-3">Check In</h4>
                                        <h5> ${room.dateFrom || 'Not Available'}</h5>
                                       
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="bg-p p-3">
                                        <h4 class="mb-3">Check Out</h4>
                                        <h5>${room.dateTill || 'Not Available'}</h5>
                                       
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 1rem !important;">
                            <h5><b>You Selected</b></h5>
                            <p><b>Room Type:</b> ${room.room_type}</p>
                        </div>
                    </div>
                `;
                carouselContainer.innerHTML += roomItem;
            });

        }

        if (data.tables && data.tables.length > 0) {
            data.tables.forEach((table, index) => {
                const isActive = data.rooms.length === 0 && index === 0 ? 'active' : ''; // Set first table active if no rooms
                const avgRating = table.avg_rating || 0;
                const fullStars = Math.floor(avgRating);  // Number of full stars
                const hasHalfStar = avgRating % 1 >= 0.5; // Check if there’s a half star

                // Generate stars based on avg_rating
                let starsHtml = '';
                for (let i = 0; i < fullStars; i++) {
                    starsHtml += `<img src="/static/images/Star 1.svg" style="height: 20px;" alt="">`;
                }
                if (hasHalfStar) {
                    starsHtml += `<img src="/static/images/Star_half.svg" style="height: 20px;" alt="">`;
                }
                const tableItem = `
                    <div class="carousel-item ${isActive} pe-2">
                        <div class="d-flex justify-content-between mb-3">
                            <div class="p-x13">
                                <img src="${table.images}" style="height: 100%; width:100%;"c class="rounded-4" alt="Table Image">
                            </div>
                            <div class="p-x14">
                                <div class="d-flex w-100">
                                    <div class="d-flex justify-content-between align-items-center p-x15" style="font-size: 1rem !important;">
                                        ${starsHtml} <span class="ms-3">(${avgRating})</span> 
                                    </div>
                                  
                                </div>
                                <h3 class="p-x17">${table.restaurant.name || 'Restaurant'}</h3>
                                <h3 class="p-x17">${table.price}$</h3>
                                <h3 class="p-x17">Table</h3>
                            </div>
                        </div>
                        <div class="row" style="font-size: 1rem !important;">
                            <div class="col-lg-6">
                                <div class="bg-p p-3" style="font-size: 1rem;">
                                    <h4 class="mb-3">Booking Date</h4>
                                    <h5>${table.date}</h5>
                                </div>
                            </div>
                            
                        </div>
                        
                    </div>
                `;
                carouselContainer.innerHTML += tableItem;
            });
        }
    }

    async function bookingSpreader() {
        try {
            const response = await fetch(`/posts/cart/serialize?source=${localData}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                generateTableContent(data);
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }


    async function DetailsCartSpreader() {
        try {
            const response = await fetch(`/posts/detail-cart/serialize?source=${localData}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                createCarousel(data);
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    // Function to generate table HTML for rooms and tables
    function generateTableSingleContent(data) {
        tableSpread.innerHTML = ""; // Clear previous content

        // Generate table for room data if type is "bed"
        if (data.type === "bed") {
            const roomTable = document.createElement("table");
            roomTable.classList.add("table", "table-bordered");
            roomTable.innerHTML = `
        <tbody>
            <tr>
                <td colspan="2">No of Rooms</td>
                <td>${data.rooms?.details?.length || 1}</td>
            </tr>
            <tr>
                <td colspan="2">Price</td>
                <td>${data.total_price || 0}$</td>
            </tr>
        </tbody>
    `;
            tableSpread.appendChild(roomTable);
        }

        // Generate table for table data if type is "table"
        if (data.type === "table") {
            const tablesTable = document.createElement("table");
            tablesTable.classList.add("table", "table-bordered");
            tablesTable.innerHTML = `
        <tbody>
            <tr>
                <td colspan="2">No of Tables</td>
                <td>1</td>
            </tr>
            <tr>
                <td colspan="2">Price</td>
                <td>${data.price || 0}$</td>
            </tr>
        </tbody>
    `;
            tableSpread.appendChild(tablesTable);
        }

        // Always show the total price table
        const totalPriceTable = document.createElement("table");
        totalPriceTable.classList.add("table", "table-bordered");
        totalPriceTable.innerHTML = `
    <tbody>
        <tr>
            <td colspan="2">Tax & Fee</td>
            <td>-</td>
        </tr>
        <tr>
            <td colspan="2">Booking Fee</td>
            <td>-</td>
        </tr>
        <tr>
            <td colspan="2" style="background-color: #4B75A5; color: white;">Amount</td>
            <td style="background-color: #4B75A5; color: white;">${data.total_price || data.price || 0}$</td>
        </tr>
    </tbody>
`;
        tableSpread.appendChild(totalPriceTable);
    }

    // Function to fetch and display booking details
    async function singleBookingSpreader(key, type, dateFrom, dateTill) {
        try {
            const response = await fetch(`/posts/cart/serialize?key=${key}&type=${type}&dateFrom=${dateFrom}&dateTill=${dateTill}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                const data = await response.json();
                generateTableSingleContent(data);
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    function createComponent(data) {
        const itemContainer = document.getElementById('ex__item');
        itemContainer.innerHTML = ''; // Clear any previous items
        // Display room data if the type is "bed"
        if (data.type === "bed") {
            const avgRating = data.avg_rating || 0;
            const fullStars = Math.floor(avgRating);  // Number of full stars
            const hasHalfStar = avgRating % 1 >= 0.5; // Check if there's a half star

            // Generate stars based on avg_rating
            let starsHtml = '';
            for (let i = 0; i < fullStars; i++) {
                starsHtml += `<img src="/static/images/Star 1.svg" style="height: 20px;" alt="Full Star">`;
            }
            if (hasHalfStar) {
                starsHtml += `<img src="/static/images/Star_half.svg" style="height: 20px;" alt="Half Star">`;
            }

            const roomContent = `
        <div class="mb-2">
            <div class="d-flex justify-content-between mb-3">
                <div class="p-x13">
                    <img class="rounded-4" src="${data.image}" style="height: 100%; width:100%" alt="Room Image">
                </div>
                <div class="p-x14">
                    <div class="d-flex w-100">
                        <div class="d-flex justify-content-between align-items-center p-x15" style="font-size: 1rem !important;">
                            ${starsHtml} <span class="ms-3">(${avgRating})</span> 
                        </div>
                    </div>
                    <h3 class="p-x17">${data.hotel.name}</h3>
                    <h3 class="p-x17">${data.price}$</h3>
                    <h3 class="p-x17">Room</h3>
                </div>
            </div>
            <div class="mb-4 booking-dates">
                <div class="row">
                    <div class="col-lg-6">
                        <div class="bg-p p-3">
                            <h4 class="mb-3">Check In</h4>
                            <h5>${data.dateFrom || 'Not Available'}</h5>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="bg-p p-3">
                            <h4 class="mb-3">Check Out</h4>
                            <h5>${data.dateTill || 'Not Available'}</h5>
                        </div>
                    </div>
                </div>
            </div>
            <div class="selection-details">
                <h5><b>You Selected</b></h5>
                <p><b>Room Type:</b> ${data.room_type || 'Room Type'}</p>
            </div>
        </div>
    `;
            itemContainer.innerHTML += roomContent;
        }

        // Display table data if the type is "table"
        if (data.type === "table") {
            const avgRating = data.avg_rating || 0;
            const fullStars = Math.floor(avgRating);  // Number of full stars
            const hasHalfStar = avgRating % 1 >= 0.5; // Check if there's a half star

            // Generate stars based on avg_rating
            let starsHtml = '';
            for (let i = 0; i < fullStars; i++) {
                starsHtml += `<img src="{% static 'images/Star 1.svg' %}" style="height: 20px;" alt="Full Star">`;
            }
            if (hasHalfStar) {
                starsHtml += `<img src="{% static 'images/Star_half.svg' %}" style="height: 20px;" alt="Half Star">`;
            }

            const tableContent = `
        <div class="content-item pe-2">
            <div class="d-flex justify-content-between mb-3">
                <div class="p-x13">
                    <img class="rounded-4" src="${data.images}" style="height: 100%; width:100%" alt="Table Image">
                </div>
                <div class="p-x14">
                    <div class="d-flex w-100">
                        <div class="d-flex justify-content-between align-items-center p-x15" style="font-size: 1rem !important;">
                            ${starsHtml} <span class="ms-3">(${avgRating})</span> 
                        </div>
                    </div>
                    <h3 class="p-x17">${data.restaurant.name}</h3>
                    <h3 class="p-x17">${data.price}$</h3>
                    <h3 class="p-x17">Table</h3>
                </div>
            </div>
            <div class="row booking-date">
                <div class="col-lg-6">
                    <div class="bg-p p-3">
                        <h6>Booking Date</h6>
                    </div>
                </div>
            </div>
        </div>
    `;
            itemContainer.innerHTML += tableContent;
        }
    }

    async function DetailsSingleCartSpreader(key, type, dateFrom, dateTill) {
        try {
            const response = await fetch(`/posts/detail-cart/serialize?key=${key}&type=${type}&dateFrom=${dateFrom}&dateTill=${dateTill}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                createComponent(data);
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Check if 'source' is in the URL parameters
    const params = new URLSearchParams(window.location.search);

    if (params.has('source')) {
        bookingSpreader();
        DetailsCartSpreader();
    } else if (params.has('key') && params.has('type') && params.has('dateFrom') && params.has('dateTill') && params.has('nights')) {
        const key = params.get('key');
        const type = params.get('type');
        const dateFrom = params.get('dateFrom');
        const dateTill = params.get('dateTill');
        singleBookingSpreader(key, type, dateFrom, dateTill);
        DetailsSingleCartSpreader(key, type, dateFrom, dateTill);
    } else {
        console.log("Data not received");
    }

});

async function setupStripeElements() {
    function encodeBase64(data) {
        return btoa(JSON.stringify(data));
    }
    const stripe = Stripe('pk_test_51QGyWdFJdJFkrSKsL8o17pE7c567ZJ47VrtW9bCYAyX7cll5k28K5Eny1qiUaKqJaFpH9RAa0BwlYNhyPNyglopA00vlZLdic8');

    let nkPmtData = "";
    const params = new URLSearchParams(window.location.search);
    if (
        params.has('key') &&
        params.has('type') &&
        params.has('dateFrom') &&
        params.has('dateTill') &&
        params.has('nights')
    ) {
        const key = params.get('key');
        const type = params.get('type');
        const dateFrom = params.get('dateFrom');
        const dateTill = params.get('dateTill');
        const totalNights = params.get('nights');

        const response_data = {
            key,
            type,
            dateFrom,
            dateTill,
            nights: totalNights,
        };

        nkPmtData = encodeBase64(response_data); // Encode the object to Base64
    } else if (params.has('source')) {
        nkPmtData = localStorage.getItem('nk-pmt-data') || ""; // Fallback to an empty string if null
    } else {
        console.error("Nothing Parsed");
    }

    const response = await fetch('/payment/create-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data_token: nkPmtData }),
    });

    const data = await response.json();
    if (!data.client_secret) {
        console.log("Error: Missing client_secret");
        return;
    }

    const elements = stripe.elements({ clientSecret: data.client_secret });

    // Configure and create Payment Element
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

    // Form submit handler
    const form = document.getElementById('payment-form');
    let submitted = false;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (submitted) return;
        submitted = true;
        form.querySelector('button').disabled = true;

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                
            },
            redirect: "if_required", // Prevents auto-redirects unless required
        });

        if (stripeError) {
            console.error("Stripe error:", stripeError.message);
            submitted = false;
            form.querySelector('button').disabled = false;
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log("Payment successful!");

            try {
                const backendResponse = await fetch('/payment/success', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ data_token: nkPmtData }),
                });

                if (!backendResponse.ok) {
                    throw new Error(`API call failed: ${backendResponse.statusText}`);
                }

                const result = await backendResponse.json();
                console.log("Backend response:", result);

                // Manually redirect after API call succeeds
                window.location.href = `${window.location.origin}/nakiese/${LanguageManager.getLanguage()}/confirmation`;
            } catch (apiError) {
                console.error("API call error:", apiError);
                alert("Payment successful, but failed to update the server. Please contact support.");
            }
        } else {
            console.error("Payment failed. PaymentIntent status:", paymentIntent.status);
        }
    });
}


document.addEventListener("DOMContentLoaded", setupStripeElements);