const lcdEndpoint = 'https://terra-classic-lcd.publicnode.com';  // Replace with your LCD endpoint
const chainId = "columbus-5";
const contractAddress = "terra10000000000000000000000000000000000000000000000000000001"; // Replace with correct contract address
const contractAddressAlt = "terra10000000000000000000000000000000000000000000000000000000002"; // Replace with correct contract address

let returnedAddress = "";
let basePrice = 0.00;
let vestingPercent = 0.00
const TotalVestingDistrobution = 1000000000.00

// Function to query the vesting information. This is legacy
async function getVestingInfo(contractAddress, lcdEndpoint) {
    const queryMsg = { "Info": {} }; // This is the query message to get vesting info

    try {
        const response = await fetch(`${lcdEndpoint}/wasm/contracts/${contractAddress}/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query_msg: queryMsg })
        });

        // Check if the response is okay
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        // Parse and return the response
        const data = await response.json();
        console.log('Vesting Information:', data);
        return data;
    } catch (error) {
        console.error('Error fetching vesting info:', error);
    }
}

// Function to query the vested percentage. This is Legacy
async function getVestedPercentage(contract, lcdEndpoint, timestamp = null) {
    const currentTime = timestamp || Math.floor(Date.now() / 1000);
    const queryMsg = { "Vested": { "t": currentTime } }; // Query for the vested percentage at the specified time

    try {
        const response = await fetch(`${lcdEndpoint}/wasm/contracts/${contract}/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query_msg: queryMsg })
        });

        // Check if the response is okay
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        // Parse and return the response
        const data = await response.json();
        console.log('Vested Percentage:', data);
        return data;
    } catch (error) {
        console.error('Error fetching vested percentage:', error);
    }
}

// Function to distribute vested tokens
async function distribute(contractAddress, amount) {
    try {
        const executeMsg = { "Distribute": { "amount": amount } }; // Specify the amount to distribute

        const result = await fetch(`${lcdEndpoint}/wasm/contracts/${contractAddress}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender: returnedAddress,  // Use the connected wallet address
                execute_msg: executeMsg,  // Execute message with the amount
                coins: []  // Specify the token (e.g., uluna), empty if no additional coins
            })
        });

        const data = await result.json();
        console.log("Distribution transaction result:", data);
        alert("Distribution successful!");
    } catch (error) {
        console.error("Error distributing tokens:", error);
        alert("Error distributing tokens.");
    }
}

// Function to distribute to vester
async function distributeToVester() {
    try {
        //we no longer need to get the vesting percentage and amount from the contracts. this is provided from the juris API.
		//assume for both contracts this is the same as we only have one set of data.
		let totalDistribution = parseFloat(TotalVestingDistrobution * (vestingPercent / 100)).toFixed(8);

        // Check the returned address before distributing
        if (!returnedAddress) {
            alert("Please connect your Keplr wallet first.");
            return;
        }

        if (!vestingInfo1 || !vestingInfo2) {
            throw new Error("There was no valid vesting information for this address.");
        }

        await distribute(contractAddress, totalDistribution);
        await distribute(contractAddressAlt, totalDistribution);

        console.log("Tokens distributed successfully!");
        alert(`Tokens distributed to ${returnedAddress} successfully`);
    } catch (error) {
        console.error("Error in distribution process:", error);
        alert("Error in distribution process.");
    }
}

// Function to connect to Keplr
async function connectKeplr() {
    if (window.keplr) {
        try {
            await window.keplr.enable(chainId);

            const offlineSigner = window.keplr.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            returnedAddress = accounts[0].address;
            console.log("Connected to address:", returnedAddress);

            // Query vested percentage for the connected address
            //const unix = Math.round(Date.now() / 1000);
            //await getVestedPercentage(contractAddress, lcdEndpoint, unix);
        } catch (err) {
            console.error('Failed to connect to Keplr:', err);
        }
    } else {
        console.warn('Keplr wallet is not installed');
    }
}

// Function to check for Enter key press and fetch data from API

async function populateVestingTable(address){
	// Fetch JSON data from the API endpoint
	try {
		const response = await fetch('https://24.143.179.94:443/php/validator.php'); // Replace with your API endpoint
		const jsonData = await response.json();
		
		const priceResponse = await fetch('https://24.143.179.94:443/php/price.php');
		const priceJsonData = await priceResponse.json();
		
		basePrice = parseFloat(priceJsonData);
		console.log(basePrice);

		// Check if the entered address matches the address in the JSON data
		const match = jsonData.find(item => item.delegator === address);

		if (match) {
			// If a match is found, generate the table
			generateTable(match);
		} else {
			alert("Address not found.");
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		alert("There was an error fetching data from the API.");
	}
}

async function checkEnterKey(event) {
    if (event.key === "Enter") {
        const inputValue = event.target.value;
		populateVestingTable(inputValue);
	}
}

// Function to generate the table
function generateTable(data) {
    const tableBody = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear any existing rows

    const row1 = tableBody.insertRow();
    const cell1_1 = row1.insertCell(0);
    const cell1_2 = row1.insertCell(1);
    cell1_1.textContent = "Delegator";
    cell1_2.textContent = data.delegator;

    const row2 = tableBody.insertRow();
    const cell2_1 = row2.insertCell(0);
    const cell2_2 = row2.insertCell(1);
    cell2_1.textContent = "Delegated Amount";
    cell2_2.textContent = data.amount;
	
	const row3 = tableBody.insertRow();
    const cell3_1 = row3.insertCell(0);
    const cell3_2 = row3.insertCell(1);
    cell3_1.textContent = "Eligibility Percentage";
    cell3_2.textContent = data.percentage;
	vestingPercent = parseFloat(data.percentage.replace(/,/g, ''));
	
	const amount = TotalVestingDistrobution * (vestingPercent / 100);
	
	const row4 = tableBody.insertRow();
    const cell4_1 = row4.insertCell(0);
    const cell4_2 = row4.insertCell(1);
    cell4_1.textContent = "Total Distrobution";
    cell4_2.textContent = amount.toLocaleString() + " JURIS";
	vestingPercent = data.percentage
	
    const row5 = tableBody.insertRow();
    const cell5_1 = row5.insertCell(0);
    const cell5_2 = row5.insertCell(1);
    cell5_1.textContent = "Value (USD)";
	console.log(parseFloat(amount));
	const valueInUSD = Math.floor((amount * basePrice) * 100) / 100;
    
    // Format the value with commas
    cell5_2.textContent = "$" + valueInUSD.toLocaleString(); // This adds commas to the number
	
	// Create "Receive Vesting" button
    const buttonContainer = document.getElementById('buttonContainer'); // Assuming there's a container for the button
    buttonContainer.innerHTML = ''; // Clear any existing buttons

    const receiveButton = document.createElement('button');
    receiveButton.textContent = "Receive Vesting";
    receiveButton.classList.add('vesting-button');  // You can style this with CSS if needed

    // Add event listener to trigger vesting distribution when button is clicked
    receiveButton.addEventListener('click', async () => {
        console.log("Receive vesting button clicked");
        await distributeToVester();  // Call the function that handles the vesting distribution
    });

    // Append the button to the container below the table
    buttonContainer.appendChild(receiveButton);
}

// Call connectKeplr when the page loads
document.addEventListener('DOMContentLoaded', function () {
    connectKeplr();
	const inputElement = document.querySelector('.input-box'); // Selects the first element with class 'input-box'
    if (inputElement) {
        inputElement.addEventListener('keypress', checkEnterKey);
    } else {
        console.error('Input element with class "input-box" not found.');
    }
	populateVestingTable(returnedAddress)
});
