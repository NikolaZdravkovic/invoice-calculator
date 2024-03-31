// Types
interface InvoiceItem {
    id: number;
    invoice_item: string;
    unit_price: number;
    quantity: number;
    price: number;
}

// Fetch the JSON data from the 'api/invoice.json' route
fetch('../api/invoice.json')
    .then(response => response.json())
    .then((data: InvoiceItem[]) => {
        // Get the tbody element where we'll append the table rows
        const tbody = document.getElementById('results');
        // Get the total amount element
        const totalAmountElement = document.querySelector('.total-amount span');
        const originalPrice = document.querySelector('.original-price span');
        const discont = document.querySelector('.discount-price span');

        // Initialize total sum
        let totalSum: number = 0;
        let discountTotal: number = 0;

        // Function to update the total
        const updateTotal = () => {
            let newTotal: number;
            newTotal = totalSum - discountTotal;
            if (totalAmountElement) {
                totalAmountElement.textContent = newTotal.toFixed(2) + ' €';
            }
        };

        // Function to update the discount total
        const updateDiscountTotal = () => {
            discountTotal = 0;
            const discountAmountInputs = document.querySelectorAll('.discount-amount') as NodeListOf<HTMLInputElement>;
            discountAmountInputs.forEach(input => {
                discountTotal += parseFloat(input.value || '0');
            });
            if (discont) {
                discont.textContent = discountTotal.toFixed(2) + ' €';
            }
        };


        // Loop through each item in the data array
        data.forEach(item => {
            totalSum += item.price;
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id.toString());

            // Create table data cells and set their content
            row.innerHTML = `
                    <th scope="row">${item.id}</th>
                    <td class="item-name">${item.invoice_item}</td>
                    <td class ="unit-price">€ ${item.unit_price}</td>
                    <td>${item.quantity}</td>
                    <td class ="price">€ ${item.price}</td>
                    <td class="discount-field">
                        <div class="input-group mb-3">
                            <input type="number" value="0" class="form-control discount-percent" aria-label="Discount in %">
                            <span class="input-group-text">%</span>
                        </div>
                    </td>
                    <td class="discount-field">
                        <input type="number" value="0" disabled class="form-control discount-amount" aria-label="Discount in €">
                    </td>
                    <td class="discount-field">
                        <input type="number" value="0" class="form-control discounted-amount" aria-label="Discounted amount in €">
                    </td>
                `;

            // Append the row to the tbody
            tbody?.appendChild(row);

            // Add event listeners to Discount in %, Discount in €, and Discounted amount in € fields
            const discountPercentInput = row.querySelector('.discount-percent') as HTMLInputElement;
            const discountAmountInput = row.querySelector('.discount-amount') as HTMLInputElement;
            const discountedAmountInput = row.querySelector('.discounted-amount') as HTMLInputElement;

            discountPercentInput.addEventListener('input', () => {
                const discountPercentValue = discountPercentInput.value.trim();
                const discountPercent = discountPercentValue !== '' ? parseFloat(discountPercentValue) : 0;
                const discountAmount = (item.price * discountPercent) / 100;
                discountAmountInput.value = discountPercentValue !== '' ? discountAmount.toFixed(2) : '';
                discountedAmountInput.value = discountPercentValue !== '' ? (item.price - discountAmount).toFixed(2) : '';
                updateTotal();
                updateDiscountTotal();
            });


            discountAmountInput.addEventListener('input', () => {
                const discountAmount = parseFloat(discountAmountInput.value);
                const discountInPercentage = (discountAmount / item.price) * 100;
                discountPercentInput.value = isNaN(discountInPercentage) ? '' : discountInPercentage.toFixed(2);
                discountedAmountInput.value = isNaN(discountAmount) ? '' : (item.price - discountAmount).toFixed(2);

                updateTotal();
                updateDiscountTotal();
            });

            discountedAmountInput.addEventListener('input', () => {
                const discountedAmount = parseFloat(discountedAmountInput.value);
                const discountAmount = item.price - discountedAmount;
                const discountInPercentage = (discountAmount / item.price) * 100;
                discountAmountInput.value = isNaN(discountAmount) ? '' : discountAmount.toFixed(2);
                discountPercentInput.value = isNaN(discountInPercentage) ? '' : discountInPercentage.toFixed(2);

                updateTotal();
                updateDiscountTotal();
            });

            const inputFields = row.querySelectorAll('input[type="number"]');
            inputFields.forEach(inputField => {
                const numberInput = inputField as HTMLInputElement;
                numberInput.addEventListener('click', () => {
                    if (numberInput.value === "0") {
                        numberInput.value = "";
                    }
                });
                inputField.addEventListener('input', () => {
                    updateTotal();
                    updateDiscountTotal();
                });
            });
        });

        // Create a new row for the additional input fields
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="discount-field">
                                <div class="input-group mb-3">
                                    <input type="number" value="0" class="form-control discount-percent-all" aria-label="Discount in %">
                                    <span class="input-group-text">%</span>
                                </div>
                            </td>
                            <td class="discount-field">
                                <input type="number" value="0" class="form-control discount-amount-all" aria-label="Discount in €">
                            </td>
                            <td class="discount-field">
                                <input type="number" value="0" class="form-control discounted-amount-all" aria-label="Discounted amount in €">
                            </td>
                            
                `;
        tbody?.appendChild(newRow);


        //  Delete default value on click
        const newInputFields = newRow.querySelectorAll('input[type="number"]');
        newInputFields.forEach(newInputField => {
            newInputField.addEventListener('click', () => {
                const inputElement = newInputField as HTMLInputElement;
                inputElement.value = inputElement.value === "0" ? "" : inputElement.value
            });
        });
        // Add event listener to Discount in % field in new row
        const discountPercentAllInput = document.querySelector('.discount-percent-all') as HTMLInputElement;
        discountPercentAllInput.addEventListener('input', () => {
            const discountPercentAll = parseFloat(discountPercentAllInput.value);

            // Update Discount in % fields in all rows
            document.querySelectorAll('.discount-percent').forEach((element) => {
                const inputElement = element as HTMLInputElement;
                inputElement.value = !isNaN(discountPercentAll) ? discountPercentAll.toFixed(2) : '';
            });

            // Recalculate Discount in € and Discounted Amount in € for all items
            data.forEach(item => {
                const row = tbody?.querySelector(`[data-id="${item.id}"]`);
                const price = item.price;
                const discountAmount = (price * discountPercentAll) / 100;
                const discountedAmount = price - discountAmount;

                const discountAmountInput = row?.querySelector('.discount-amount') as HTMLInputElement;
                const discountedAmountInput = row?.querySelector('.discounted-amount') as HTMLInputElement;

                discountAmountInput.value = !isNaN(discountAmount) ? discountAmount.toFixed(2) : '';
                discountedAmountInput.value = !isNaN(discountedAmount) ? discountedAmount.toFixed(2) : '';
            });

            updateDiscountTotal();
            updateTotal();

        });

        // Add event listener to Discount in € field in new row
        const discountAmountAllInput = document.querySelector('.discount-amount-all') as HTMLInputElement;
        discountAmountAllInput.addEventListener('input', () => {
            const discountAmountAll = parseFloat(discountAmountAllInput.value);

            // Update Discount in € fields in all rows
            document.querySelectorAll('.discount-amount').forEach((element) => {
                const inputElement = element as HTMLInputElement;
                inputElement.value = !isNaN(discountAmountAll) ? discountAmountAll.toFixed(2) : '';
            });

            // Recalculate Discount in % and Discounted Amount in € for all items
            data.forEach(item => {
                const row = tbody?.querySelector(`[data-id="${item.id}"]`);
                const price = item.price;
                const discountInPercentage = (discountAmountAll / price) * 100;
                const discountedAmount = price - discountAmountAll;

                const discountPercentInput = row?.querySelector('.discount-percent') as HTMLInputElement;
                const discountedAmountInput = row?.querySelector('.discounted-amount') as HTMLInputElement;

                discountPercentInput.value = !isNaN(discountInPercentage) ? discountInPercentage.toFixed(2) : '';
                discountedAmountInput.value = !isNaN(discountedAmount) ? discountedAmount.toFixed(2) : '';
            });

            updateDiscountTotal();
            updateTotal();
        });

        // Add event listener to Discounted Amount in € field in new row
        const discountedAmountAllInput = document.querySelector('.discounted-amount-all') as HTMLInputElement;
        discountedAmountAllInput.addEventListener('input', () => {
            const discountedAmountAll = parseFloat(discountedAmountAllInput.value);

            // Update Discounted Amount in € fields in all rows
            document.querySelectorAll('.discounted-amount').forEach((element) => {
                const inputElement = element as HTMLInputElement;
                inputElement.value = !isNaN(discountedAmountAll) ? discountedAmountAll.toFixed(2) : '';
            });

            // Recalculate Discount in % and Discount in € for all items
            data.forEach(item => {
                const row = tbody?.querySelector(`[data-id="${item.id}"]`);
                const price = item.price;
                const discountInPercentage = ((price - discountedAmountAll) / price) * 100;
                const discountInEuro = price - discountedAmountAll;

                const discountPercentInput = row?.querySelector('.discount-percent') as HTMLInputElement;
                const discountAmountInput = row?.querySelector('.discount-amount') as HTMLInputElement;

                discountPercentInput.value = !isNaN(discountInPercentage) ? discountInPercentage.toFixed(2) : '';
                discountAmountInput.value = !isNaN(discountInEuro) ? discountInEuro.toFixed(2) : '';
            });

            updateDiscountTotal();
            updateTotal();
        });



        // Update total amount in HTML initially
        if (totalAmountElement) {
            totalAmountElement.textContent = totalSum.toFixed(2) + ' €';
        }
        if (originalPrice) {
            originalPrice.textContent = totalSum.toFixed(2) + ' €';
        }

    })
    .catch(error => console.error('Error fetching JSON:', error));
