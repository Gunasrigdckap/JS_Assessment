
document.addEventListener('DOMContentLoaded', async function() {
    async function fetchInventory() {
        let response = await fetch("./inventory.php");
        let data = await response.json();
        return data;
    }

    async function fetchRecipients() {
        let response = await fetch("./recipients.php");
        let data = await response.json();
        return data;
    }

    function displayHighestQuantityProducts(products) {
        let dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = '';

        products.sort((a, b) => b.quantity - a.quantity);

        let topProducts = products.slice(0, 3);

        topProducts.forEach(product => {
            let productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
                <h2>${product.product}</h2>
                <p>Quantity: ${product.quantity}</p>
            `;
            dashboard.appendChild(productDiv);
        });
    }

    function displayRecipientDetails(recipients) {
        let tableBody = document.getElementById('recipientsTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
    
        recipients.forEach(recipient => {
            let row = tableBody.insertRow();
            row.insertCell(0).textContent = recipient.product;
            row.insertCell(1).textContent = recipient.recipient;
            row.insertCell(2).textContent = recipient.quantity;
        });
    }
    
    async function updateDashboard() {
        let inventory = await fetchInventory();
        displayHighestQuantityProducts(inventory);
        createChart(inventory);
    
        let recipients = await fetchRecipients();
        displayRecipientDetails(recipients);
    }
    

    function generateColors(length) {
        let colors = [
            "red", "green", "blue", "orange", "purple", "brown", "pink", "yellow", "cyan", "magenta"
        ];
        let generatedColors = [];
        for (let i = 0; i < length; i++) {
            generatedColors.push(colors[i % colors.length]);
        }
        return generatedColors;
    }

    async function createChart(inventory) {
        let ctx = document.getElementById('myChart');
        if (ctx) {
            let chartContext = ctx.getContext('2d');
            let labels = inventory.map(item => item.product);
            let quantities = inventory.map(item => item.quantity);
            let barColors = generateColors(inventory.length);

            new Chart(chartContext, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        backgroundColor: barColors,
                        data: quantities
                    }]
                },
                options: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "Inventory Status"
                    }
                }
            });
        } else {
            console.error("Canvas element with id 'myChart' not found.");
        }
    }

    function openModal(type) {
        document.getElementById(type + 'Modal').style.display = 'flex';
    }

    function closeModal(type) {
        document.getElementById(type + 'Modal').style.display = 'none';
    }

    async function addProduct() {
        let name = document.getElementById('addProductName').value;
        let quantity = parseInt(document.getElementById('addProductQuantity').value);
    
        if (name && quantity) {
            let response = await fetch('./inventory.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product: name, quantity: quantity, type: 'add' })
            });
    
            let result = await response.json();
            alert(result.message);
    
            updateDashboard();
            closeModal('add');
    
            
            document.getElementById('addProductName').value = '';
            document.getElementById('addProductQuantity').value = '';
        } else {
            alert('Please enter a valid product name and quantity.');
        }
    }
    
    async function updateInventory() {
        let name = document.getElementById('updateProductName').value;
        let quantity = parseInt(document.getElementById('updateProductQuantity').value);
        let recipient = document.getElementById('updateRecipient').value;
    
        if (name && quantity && recipient) {
            let response = await fetch('./inventory.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product: name, quantity: quantity, type: 'update', recipient: recipient })
            });
    
            let result = await response.json();
            alert(result.message);
    
            updateDashboard();
            closeModal('update');
    
            
            document.getElementById('updateProductName').value = '';
            document.getElementById('updateProductQuantity').value = '';
            document.getElementById('updateRecipient').value = '';
        } else {
            alert('Please enter valid product name, quantity, and recipient.');
        }
    }
    

    updateDashboard();

    setInterval(updateDashboard, 60000);

    window.openModal = openModal;
    window.closeModal = closeModal;
    window.addProduct = addProduct;
    window.updateInventory = updateInventory;
});
