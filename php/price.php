<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$api_url = "https://api.jurisprotocol.com/api/price/latest";

// Initialize a cURL session
$ch = curl_init();

// Set the cURL options
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Execute the request
$response = curl_exec($ch);

// Check for errors
if(curl_errno($ch)) {
    echo 'Error: ' . curl_error($ch);
} else {
    // Set the appropriate headers
    header('Content-Type: ' . curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
    echo $response;
}

// Close the cURL session
curl_close($ch);
?>