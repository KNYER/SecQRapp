/**
 * Section: Uploading Images
 */
let fileName;
var imageLoader = document.getElementById("imageLoader");
imageLoader.addEventListener("change", function(event) {
  var file = event.target.files[0];
  var allowedExtensions = ['png', 'jpg', 'jpeg'];

  // Check if the file extension is allowed
  var fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
            
            var message = "Please select a PNG, JPG, or JPEG file.";
  
            var openButton = document.getElementById('openPopup');
            var popup = document.getElementById('popup');
            var closeButton = document.getElementById('closePopup');
            var messageElement = document.getElementById('message');
  
            popup.style.display = 'block';
            messageElement.innerHTML = message;
            closeButton.style.backgroundColor = 'red';
  
            closeButton.addEventListener('click', function() {
              popup.style.display = 'none';
              openButton.disabled = false; // Enable the button after closing the popup
            });
    event.target.value = ''; // Clear the file input to allow reselection
    return;
  }

  handleImage(event);
}, false);
var uploadCanvas = document.getElementById("imageCanvas");
var uploadContext = uploadCanvas.getContext("2d");

uploadCanvas.width = 200;
uploadCanvas.height = 200;


img = false;

function handleImage(e) {
  var reader = new FileReader();
  reader.onload = function (event) {
    img = new Image();
    img.onload = function () {
      uploadContext.drawImage(img, 0, 0, 200, 200);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

/**
 * Section: Initialize qrcode and canvas
 */

var canvas = false;

var qrcode = new QRCode("qrcode", {
  width: 256,
  height: 256,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.L,
});

/**
 * Section: Code to handle inputs (e.g., sliders)
 */

// Size of QR Code squares
var sizeSlider = document.getElementById("radiusSize");
var sizeOutput = document.getElementById("printSize");

// Display the default slider value and grab it
sizeOutput.innerHTML = sizeSlider.value;
var radiusRatio = sizeSlider.value / 200;

// Update the current slider value
sizeSlider.oninput = function () {
  sizeOutput.innerHTML = this.value;
  radiusRatio = this.value / 200;
};

// Level of error correction (low, medium, high) (excluding quartile)
var correctionSlider = document.getElementById("errorCorrection");
var correctionOutput = document.getElementById("printCorrection");

// Display the default slider value and grab it
correctionOutput.innerHTML = correctionSlider.value;
var correctionLevel = correctionSlider.value;
if (correctionLevel === "1") {
  qrcode._htOption.correctLevel = QRCode.CorrectLevel.L;
} else if (correctionLevel === "2") {
  qrcode._htOption.correctLevel = QRCode.CorrectLevel.M;
} else if (correctionLevel === "3") {
  qrcode._htOption.correctLevel = QRCode.CorrectLevel.H;
}

// Update the current slider value
correctionSlider.oninput = function () {
  correctionOutput.innerHTML = this.value;
  correctionLevel = correctionSlider.value;
  if (correctionLevel === "1") {
    qrcode._htOption.correctLevel = QRCode.CorrectLevel.L;
  } else if (correctionLevel === "2") {
    qrcode._htOption.correctLevel = QRCode.CorrectLevel.M;
  } else if (correctionLevel === "3") {
    qrcode._htOption.correctLevel = QRCode.CorrectLevel.H;
  }
};

// Size of white border (quiet zone)
var borderSlider = document.getElementById("borderSize");
var borderOutput = document.getElementById("printBorderSize");
borderOutput.innerHTML = borderSlider.value; // Display the default slider value
var borderSizeValue = Number(borderSlider.value);

// Update the current slider value (each time you drag the slider handle)
borderSlider.oninput = function () {
  borderOutput.innerHTML = this.value;
  borderSizeValue = Number(this.value);
};

/**
 * Section: Helper functions for visualizing QR code
 */

/**
 * Check whether bit at current position should be full sized.
 * In particular, make the position bits (corners) full sized.
 *
 * @param {i} The current bit's row.
 * @param {j} The current bit's column.
 * @param {QRLength} The length of the QR code.
 * @return {isPosition} Whether or not the current bit is safe to modify.
 */
function isSafeBit(i, j, QRLength) {
  // Currently hard coding position bits
  lowerLimit = 7 + borderSizeValue;
  upperLimit = QRLength - 8 + borderSizeValue;
  if (i < lowerLimit && j < lowerLimit) {
    return false;
  } else if (i > upperLimit && j < lowerLimit) {
    return false;
  } else if (i < lowerLimit && j > upperLimit) {
    return false;
  }

  return true;
}

/**
 * Draw basic shape representing each bit of the QR code.
 *
 * @param {ctx} Context of associated canvas.
 * @param {i} The current bit's row.
 * @param {j} The current bit's column.
 * @param {bitLength} The maximum length of each bit.
 * @param {radiusRatio} The radius should be this ratio times the bitLength.
 *  The ratio should be between 0 and 0.5.
 * @param {QRLength} The length of the QR code.
 */
function drawShape(ctx, i, j, bitLength, radiusRatio, QRLength) {
  // Draw centered
  xCenter = bitLength * (i + 0.5);
  yCenter = bitLength * (j + 0.5);

  if (!isSafeBit(i, j, QRLength)) {
    radiusRatio = 0.5;
  }
  radius = bitLength * radiusRatio;

  ctx.fillRect(xCenter - radius, yCenter - radius, 2 * radius, 2 * radius);
}

/**
 * Download the QR code as a PNG
 */
function download() {
  
  canvas.toBlob(function(blob) {

    // Create a FormData object and append the Blob object to it
    var formData = new FormData();
    formData.append("image", blob, fileName);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "dbwrite.php", true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // PHP script executed successfully
      }
    };
    xhr.send(formData);
  }, "image/png");

  // Download image
  if (!canvas) {
    alert("Error: no QR code to download");
    return;
  }
  var link = document.getElementById("link");
  link.setAttribute("download", "qr_image_new.png");
  link.setAttribute(
    "href",
    "upload/"+fileName
  );
  link.click();
}

/**
 * Make the QR code
 */
function makeCode() {

  
  // Grab url input
  elementText = document.getElementById("text");
  url = elementText.value;

  // Check for non-empty url
  if (!url) {
    alert("Error: empty input");
    elementText.focus();
    return;
  }

    // Generate a timestamp down to microseconds
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");

    // Modify the file name to include the timestamp
    fileName = `qrcode_${timestamp}.png`;

    
  

  // // Pad URL since we want more density
  // maxLength = 40;
  // if (url.length < maxLength) {
  //   url += "?/" + "0".repeat(maxLength - url.length);
  // }

  // Generate URL bits
  qrcode.makeCode(url);

  // Manually draw canvas
  QRMatrix = qrcode._oQRCode.modules;
  QRLength = QRMatrix.length;

  
  // Form canvas
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");

  // QR code sizing
  bitLength = 10;
  canvasLength = bitLength * (QRLength + borderSizeValue * 2);
  canvas.width = canvasLength;
  canvas.height = canvasLength;

  // Set background of canvas
  
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasLength, canvasLength);
  

  // Set image of code
  if (img) {
    ctx.drawImage(
      img,
      bitLength * borderSizeValue,
      bitLength * borderSizeValue,
      bitLength * QRLength,
      bitLength * QRLength
    );
  }

  // Colors of true and false bits
  black = "#000000";
  white = "#FFFFFF";

  // Populate canvas with bits
  for (let i = 0; i < QRLength; i++) {
    for (let j = 0; j < QRLength; j++) {
      if (QRMatrix[i][j]) {
        ctx.fillStyle = black;
      } else {
        ctx.fillStyle = white;
      }
      drawShape(
        ctx,
        i + borderSizeValue,
        j + borderSizeValue,
        bitLength,
        radiusRatio,
        QRLength
      );
    }
  }
 // Convert the canvas to a Blob object
canvas.toBlob(function(blob) {

  // Create a FormData object and append the Blob object to it
  var formData = new FormData();
  formData.append("image", blob, fileName);

  // Send the FormData to the server using an AJAX request
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "upload.php", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      
      console.log("QR code exported to the server successfully!");
      if (xhr.responseText == "Only PNG, JPG, and JPEG files are allowed."){}
          console.log("Only PNG, JPG, and JPEG files are allowed.")
      
    }
  };
  xhr.send(formData);
}, "image/png");
}
  //Scan and verify a QR code of the users choosing
function ScanQr() {
  var urlres = document.getElementById('URLres');
  var imageLoader = document.getElementById('imageLoader');

  // Generate a timestamp down to microseconds
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");

  // Modify the file name to include the timestamp
  const fileName = `qrcode_${timestamp}.png`;

  var file = imageLoader.files[0];
  var newFileName = fileName;
  var formData = new FormData();
  formData.append("image", file, newFileName);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "ScanUp.php", true);
  xhr.send(formData);

 
  var xhr1 = new XMLHttpRequest();
  xhr1.open("POST", "pyexec.php", true);
  xhr1.onreadystatechange = function () {
    if (xhr1.readyState === 4 && xhr1.status === 200) {
          try {
            
            var response = JSON.parse(xhr1.responseText);
            // Process the JSON data here
            // Rest of your code to handle the JSON data
            var urldec = response.urldec;
            var idExists = response.idExists;
            var date = response.date;
            var colorY = "green";
            var colorN = "red";
            var messageY = "<h1 style = 'color:" + colorY + "'>" + idExists + "</h1>" + "<br>" + "URL Decoded: " + "<br>" + "<a href='" + urldec + "'>" + urldec + "</a>" + "<br>" + "CREATED AT: " + "<br>" + date + "<br>" ;
            var messageN = "<h1 style = 'color:" + colorN + "'>" + idExists + "</h1>" + "<br>" + "URL Decoded: " + "<br>" + "<a href='" + urldec + "'>" + urldec + "</a>" + "<br>";
            var messageX = "<h1 style = 'color:" + colorN + "'>" + "ERROR: QR CODE NOT FOUND!" + "</h1>" ;
            var openButton = document.getElementById('openPopup');
            var popup = document.getElementById('popup');
            var closeButton = document.getElementById('closePopup');
            var messageElement = document.getElementById('message');
  
            openButton.disabled = true; // Disable the button after the first click
            if (urldec === "No_QR_code_found"){
              messageElement.innerHTML = messageX;
            }else if(idExists === "QR CODE NOT SECURE!" ){
              messageElement.innerHTML = messageN;
            } else {
              messageElement.innerHTML = messageY;
            }
            popup.style.display = 'block';
            
            urlres.href = urldec;
            urlres.textContent = urldec;
            closeButton.style.backgroundColor = 'gray';
            closeButton.addEventListener('click', function() {
              popup.style.display = 'none';
              openButton.disabled = false; // Enable the button after closing the popup
              uploadContext.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
              imageLoader.value = '';
              img = false;
            });
          } catch (error) {
            console.error("Error parsing JSON:", error);
        
        }
    
    }
  };
  xhr1.send(formData); // Sending the POST request
  
} 

let menu = document.querySelector ('#menu-icon');
let navlist = document.querySelector('.navlist');

menu.onclick = () =>{
    menu.classList.toggle('bx-x');
    navlist.classList.toggle('open');
}

const sr = ScrollReveal({
    distance: '65px',
    duration: 2600,
    delay: 450,
    reset: true
});

sr.reveal('.hero-text', {delay:200, origin: 'top'});
sr.reveal('.hero-img', {delay:450, origin: 'top'});
sr.reveal('.icons', {delay:450, origin: 'left'});
sr.reveal('.scroll-down', {delay:450, origin: 'right'});
