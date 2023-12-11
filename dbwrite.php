<?php
// Define the database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "secqr";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
  $file = $_FILES['image'];
// Specify the destination directory where you want to save the uploaded file
$uploadDirectory = 'upload/';

// Filename Generated from JS
$filename = $file['name'];

$targetPath = $uploadDirectory . $filename;
// Execute the lsbsteg scan Python script
$pythonScript = 'DataInsert.py';
$command = 'python ' . $pythonScript. ' ' . $filename;
$output = shell_exec($command);

// Separate the ID and datetime from the output
$outputArray = explode(" ", trim($output));
$id = $outputArray[0];
$datetime = $outputArray[1];

// Delete file after download
unlink($targetPath);
// Create a new connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }
  
  // Prepare and execute the SQL INSERT statement
  $stmt = $conn->prepare("INSERT INTO hidden_data (id, data_time) VALUES (?, ?)");
  $stmt->bind_param("is", $id, $datetime);
  if ($stmt->execute()) {
    // Insertion successful
    echo 'Data inserted into the database.',$id;
  } else {
    // Failed to insert into the database
    echo 'Failed to insert into the database.';
  }
  
  // Close the database connection
  $conn->close();
}

$directory = 'upload/';  // Adjust this to your directory

// Get the current timestamp in seconds
$currentTimestamp = time();

// Iterate through the files in the directory
$files = glob($directory . "/qrcode_*.png");  // Adjust the extension based on your file type

foreach ($files as $file) {
    // Extract the timestamp from the filename
    $filename = basename($file);
    preg_match('/qrcode_(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\d{3})Z\.png/', $filename, $matches);

    if (count($matches) === 8) {
        // Build the timestamp
        $fileTimestamp = gmmktime($matches[4], $matches[5], $matches[6], $matches[2], $matches[3], $matches[1]) + ($matches[7] / 1000);
        
        // Check if the file is older than 10 seconds
        if ($currentTimestamp - $fileTimestamp > 10) {
            // Delete the file
            unlink($file);
            echo "Deleted file: $file\n";  // Optional: Print a message for each deleted file
        }
    }
}
  ?>