const form = document.getElementById("orderForm");

const checkboxes = document.querySelectorAll(
    'input[name="items"]'
);

const displayTotal = document.getElementById("displayTotal");
const displayPrice = document.getElementById("displayPrice");
const totalInput = document.getElementById("total");

const prices = {
    "CAFFE LATTE": 120,
    "ICED CARAMEL LATTE": 150,
    "CAFFE MOCHA": 140,
    "ESPRESSO MACCHIATO": 100,
    "WHITE CHOCOLATE MOCHA": 160,
    "CARAMEL MACCHIATO": 150,
    "CAFFE AMERICANO": 110,
    "ICED SMOKED LATTE": 160,
    "CAPPUCCINO": 120,
    "ICED CAFFE MOCHA": 150,
    "VANILLA LATTE": 130,
    "ICED GINGERBREAD LATTE": 160
};

function calculateTotal() {
    let totalQuantity = 0;
    let totalPrice = 0;

    checkboxes.forEach(function (checkbox) {
        const row = checkbox.closest(".item");

        if (!row) return;

        const quantityInput = row.querySelector(
            'input[type="number"]'
        );

        if (!quantityInput) return;

        quantityInput.disabled = !checkbox.checked;

        if (checkbox.checked) {
            const quantity = Math.max(
                1,
                parseInt(quantityInput.value, 10) || 1
            );

            quantityInput.value = quantity;

            const price = prices[checkbox.value] || 0;

            totalQuantity += quantity;
            totalPrice += price * quantity;
        }
    });

    displayTotal.textContent = totalQuantity;
    displayPrice.textContent = "₹" + totalPrice;
    totalInput.value = totalPrice;
}

checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", calculateTotal);
});

document.querySelectorAll('input[type="number"]').forEach(function (input) {
    input.addEventListener("input", calculateTotal);
    input.addEventListener("change", calculateTotal);
});

form.addEventListener("submit", function (event) {
    calculateTotal();

    if (
        document.querySelectorAll(
            'input[name="items"]:checked'
        ).length === 0
    ) {
        event.preventDefault();
        alert("Please select a coffee.");
    }
});

calculateTotal();