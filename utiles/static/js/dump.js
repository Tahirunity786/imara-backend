

async function singleCartCal(selection, event) {
    if (isFetchingPrice) return;  // Prevent multiple requests at once
    isFetchingPrice = true;

    try {
        const roomId = event?.currentTarget.getAttribute('data-id');  // Safer optional chaining

        if (roomId) {
            // Fetching existing cart from localStorage
            let existingCart = localStorage.getItem('nk-pmt-data');
            existingCart = existingCart ? decodeBase64(existingCart) : [];

            const roomExists = existingCart.some(item => item.room_id === roomId);

            if (!roomExists) {
                // Fetch price if room doesn't exist in the cart
                const response = await fetch(`/posts/price?ex_room_id=${roomId}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                });

                if (!response.ok) throw new Error('Failed to fetch hotel details');

                const data = await response.json();
                const pricePerNight = data.price || 0;

                // Add room to cart
                const savedData = {
                    room_id: roomId,
                    price: pricePerNight,
                    nights: selection,
                    type: 'bed',
                };

                existingCart.push(savedData);

                // Save updated cart to localStorage
                localStorage.setItem('nk-pmt-data', encodeBase64(existingCart));
                return true
            }
        }
    } catch (error) {
        return false
    } finally {
        isFetchingPrice = false;
    }
}


addToCartButton.addEventListener('click', (event) => {
    const tempDataGet = sessionStorage.getItem('nk-cache-save');
    // console.log("here my existing: " ,tempDataGet)
    if (tempDataGet) {
        const roomData = decodeBase64(tempDataGet); // Decoding sessionStorage data


        // Retrieve existing cart data from localStorage, decode it if it exists
        let existingCart = localStorage.getItem('nk-pmt-data');
        existingCart = existingCart ? decodeBase64(existingCart) : [];

        // Find the room in the cart by room_id
        const roomIndex = existingCart.findIndex(item => item.room_id === roomData.room_id);

        if (roomIndex !== -1) {
            // Room exists, update its data (nights and price)
            existingCart[roomIndex].nights = roomData.nights;
            existingCart[roomIndex].price = roomData.price;

            // Show a toast message that the cart has been updated
            butterup.toast({
                title: 'Cart Updated Successfully',
                message: 'The selected room in your cart has been updated with new nights and price.',
                type: 'info',
            });

        } else {
            // Room does not exist, add it to the cart
            existingCart.push(roomData);

            // Show a toast message that the room has been added
            butterup.toast({
                title: 'Room Added to Cart',
                message: 'The selected room has been successfully added to your cart.',
                type: 'success',
            });
        }

        // Encode the updated cart data before saving to localStorage
        const encodedCartData = encodeBase64(existingCart);
        localStorage.setItem('nk-pmt-data', encodedCartData);

        // Secure redirect after 2 seconds
        setTimeout(() => {
            window.location.href = `/nakiese/${LanguageManager.getLanguage()}/cart`;
        }, 2000); // 2000 milliseconds = 2 seconds

    } else {
        let added = singleCartCal(selection, event);
        if (added) {
            butterup.toast({
                title: 'Room Added to Cart',
                message: 'The selected room has been successfully added to your cart.',
                type: 'success',
            });
            // Secure redirect after 2 seconds
            setTimeout(() => {
                window.location.href = `/nakiese/${LanguageManager.getLanguage()}/cart`;
            }, 2000); // 2000 milliseconds = 2 seconds
        } else {
            butterup.toast({
                title: 'Something went wrong!',
                message: 'Please try again later.',
                type: 'error',
            });
        }
    }
});

let addTReserve = document.getElementById('add-to__reserve');
addTReserve.addEventListener('click', (event) => {
    const roomId = event?.currentTarget.getAttribute('data-id');
    if (roomId) {
        setTimeout(() => {
            window.location.href = `/nakiese/${LanguageManager.getLanguage()}/payment?key=${roomId}&type=bed`;
        }, 1000);
    }
});