# api-project

API project for Software Development Class.

Utlimately, this project allows users to register a cell phone number 
and recieve SMS messages containing weather alerts. The user can customize 
these alerts by changing their zip code, phone number, and desired 
temperature scale (Celsius or Fahrenheit). Users recieve texts at a designated 
time (currently 8 AM) that outlines the forecast for the day. 
This project uses the APIs for Weatherunderground and Twilio in order to make this possible. 

# Authors: 
  * Alvin Lin
  * David Rothblatt

# Setup:
```bash
virtualenv env                     # Create a virtual environment
pip install -r requirements.txt    # Dependencies
. ./activate                       # Used to start the Python virtual environment
```
