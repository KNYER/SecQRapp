<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
  $file = $_FILES['image'];

  // Specify the destination directory where you want to save the uploaded file
  $uploadDirectory = 'upload/';

  // Generate a unique filename for the uploaded file
  $filename = $file['name'];

  $allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $fileMimeType = finfo_file($finfo, $file['tmp_name']);
  finfo_close($finfo);

  if (!in_array($fileMimeType, $allowedMimeTypes)) {
    echo 'Only PNG, JPG, and JPEG files are allowed.';
    exit; // Exit the script if the file type is not allowed
  }

  // Move the uploaded file to the destination directory
  $targetPath = $uploadDirectory . $filename;
  if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // File uploaded successfully

}
}
?>