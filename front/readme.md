
## For non-https execution:
This is needed to bypass the chrome camera security measure that disables the webcam for non-https websites, or just https your website

on Linux:
google-chrome --user-data-dir=/tmp --unsafely-treat-insecure-origin-as-secure="http://<DOMAIN>" http://<DOMAIN>

chromium-browser --user-data-dir=/tmp --unsafely-treat-insecure-origin-as-secure="http://<DOMAIN>" http://<DOMAIN>

On Microsoft Windows:
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir=C:\ChromeTempFiles --unsafely-treat-insecure-origin-as-secure=http://<DOMAIN>  https://harvarddecisionlab.org/comprehension-for-credit-instructions
