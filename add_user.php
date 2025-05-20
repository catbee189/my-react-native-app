<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

// Connect to database
$host = "localhost";
$dbname = "myapp_db";  // Replace with your DB name
$username = "root";      // Replace with your DB username
$password = "";  // Replace with your DB password

$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

$name = $conn->real_escape_string($data['name'] ?? '');
$role = $conn->real_escape_string($data['role'] ?? '');
$email = $conn->real_escape_string($data['email'] ?? '');
$phone = $conn->real_escape_string($data['phone'] ?? '');
$address = $conn->real_escape_string($data['address'] ?? '');
$password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT); // secure password

// Validate
if (empty($name) || empty($role) || empty($email) || empty($phone) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Insert
$sql = "INSERT INTO users (name, role, email, phone, address, password) 
        VALUES ('$name', '$role', '$email', '$phone', '$address', '$password')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true, 'message' => 'User added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $conn->error]);
}

$conn->close();
?>
