mandarake-chrome-extension
==========================

Google Chrome extension for tracking item listings on ekizo.mandarake.co.jp.

Basic functionality:
- Visits Mandarake at set intervals (default is every 5 minutes) and searches the pages for listings that match your keyword list. Notifies you by updating the extension icon if any matches are found.
- The item display settings you have on the Mandarake site will determine how the extensions sees the page. So if you have "Number of items" set to 50, the extension will see 50 items when it searches Mandarake (the number of items it sees isn't that important since it will check subsequent pages as well if necessary. It just reduces the number of times it needs to visit Mandarake).

Searching:
- The word order and case of your keyword doesn't matter so 'good smile company' is equivalent to 'smiLe coMPany good'.
- You can filter a specific word or phrase using vertical bars (|). So if your searching for Saber figures but hate figmas, you can do 'saber |figma|' to exclude all figmas.
- The extension knows when to stop searching when it encounters the newest item it found on its last search. So if you closed Chrome and came back the next day, the extension will check all the new items that were added when you were offline (there's a limit on the amount of pages it will check though).


--------------------------
Manual Installation
- Download the extension zip and unzip it to your computer
- In chrome, go to settings -> tools -> extensions
- Check the developer mode box in the top right corner
- Click 'Load unpacked extension' and select the unzipped folder

Automatic Installation

Go to https://chrome.google.com/webstore/detail/mandarake-item-tracker/nfeghgkfchoemgjaioampkoelipegdmj?hl=en-US

-------------------------
How It Works

Upon launching Chrome, background.js is loaded and persistently runs in the background. Background.js fetches pages from Mandarake periodically using AJAX.
The fetched paged is parsed to retrieve the html elements containing the item listing information. The listing information is compared to the list of keywords provided by the user. If any matches are found, the extension icon is updated with a number representing the number of items found. To view found matches, the user clicks on the the extension icon which executes popup.js. Popup.js loads the items into popup.html.
In order to edit the tracking list or extension options, the user goes to options.html which executes options.js to display the appropriate content.
