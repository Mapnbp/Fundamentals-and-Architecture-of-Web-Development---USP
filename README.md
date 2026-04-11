# Fundamentals and Architecture of Web Development - USP

<details>
<summary>🇺🇸 <strong>Click here to expand the course description</strong></summary>
<br>
History of Web applications development, terminology and problems. Infrastructure used in Web application development: HTTP requests, communications, markup languages (HTML, CSS, etc), client side processing (Javascript, DOM, etc.), server side processing (web frameworks and languages), databases used in Web development (SQL e NoSQL).
</details>

---

# Virtual Soda Machine

<details>
<summary>🇺🇸 <strong>Click here to expand the English Version (About, Features & How to Run)</strong></summary>
<br>

### About the Project
An interactive web application that simulates a virtual soda vending machine. This project was developed as Activity 1 for the Fundamentals and Architecture of Web Development course at ICMC - USP.

The main goal of the site is to offer a playful experience with a lot of kittys and retro SFX where the user manages a "wallet" of virtual coins, inserts them into the machine, and purchases drinks, practically demonstrating fundamental concepts of web development, API consumption, and complex DOM manipulation in the browser.

### Live Demo
You don't need to download or install the repository to see the project in action! The application is live and can be accessed directly via the link below:
👉 **[Access the Virtual Soda Machine](https://Mapnbp.github.io/Fundamentals-and-Architecture-of-Web-Development---USP/Virtual%20Soda%20Machine%20-%20activity%201/)**

### Features
* **Drag and Drop Coins:** Realistic interaction where the user drags coins (R$0.25, R$0.50, R$1.00) from the wallet to the machine's coin slot.
* **Procedural Audio (Web Audio API):** All sound effects (coin SFX, clicks, errors) and the *Chip-Tune* (8-bit) background music are mathematically generated via code, without using external audio files.
* **API Consumption (AJAX):** The list of sodas and their prices is dynamically loaded from an external JSON API.
* **Smart Change Calculation:** The machine calculates the purchase change and returns it to the user's wallet, prioritizing higher value coins (greedy algorithm).
* **Animations and Dynamic Interface:** Animated background kittens using emojis and CSS animations for the soda can delivery.

### Technologies Used
* HTML5 & CSS3 (Animations and Layout)
* Vanilla JavaScript (ES6+)
* Fetch API (AJAX)
* Drag and Drop API
* Web Audio API

### How to run locally
1. Clone this repository: `git clone https://github.com/Mapnbp/Fundamentals-and-Architecture-of-Web-Development---USP`
2. Open the project folder.
3. Open the `index.html` file in your preferred web browser.

</details>
