# API Project

This project allows users to register a cell phone number 
and receive SMS messages containing weather alerts. The user can customize 
these alerts by changing their zip code, phone number, and desired 
temperature scale (Celsius or Fahrenheit). Users receive texts at a designated 
time (currently 8 AM) that outlines the forecast for the day.

This project uses the WeatherUnderground and Twilio APIs.

# Authors: 
  * Alvin Lin
  * David Rothblatt

# Setup:
```bash
virtualenv env                     # Create a virtual environment
pip install -r requirements.txt    # Dependencies
. ./activate                       # Used to start the Python virtual environment
```
