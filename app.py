from flask import Flask, render_template, redirect 
from flask_pymongo import PyMongo
import os
import pymongo
from bson.json_util import dumps
import json

password = os.environ["MONGODB_PASS"]


app = Flask(__name__)

# Use pymongo to set up mongo connection
mongo = pymongo.MongoClient(f"mongodb+srv://admin:{password}@cluster0-p6cjk.mongodb.net/test?retryWrites=true&w=majority", connect=False)
db = pymongo.database.Database(mongo, 'sac-dashboard')

# Define observations collection
observations = pymongo.collection.Collection(db, 'observations')
# Sample Observation/Incident
'''{'_id': {'$oid': '5eb38382517f507e17208142'}, 
    'type': 'Feature', 
    'geometry': {
        'type': 'Point', 
        'coordinates': ['-120.000369', '38.668149']}, 
    'properties': {
        'type': 'incident',
        'url': 'https://www.sierraavalanchecenter.org/observation/2020/may/1/1200/round-top', 
        'title': 'Generous window for corn snow at Carson Pass', 
        'location': 'Round Top', 
        'region': 'Carson Pass Area', 
        'datetime': '05-01-2020',
        'av_type': 'Wind Slab', 
        'weak_layer': 'New/old snow interface', 
        'trigger': 'Snowboarder', 
        'trigger_mod': 'Accidentally Triggered', 
        'aspect': 'West', 
        'start_elev': 'above-treeline', 
        'dest_size': 'D1 Relatively harmless to people.', 
        'rel_size': 'R1 Very Small', 
        'crown_h': 0, 
        'av_width': 30, 
        'av_length': 500, 
        'people_caught': '1', 
        'partial_burials': '0'}
    }'''

# Define forecasts collection
forecasts = pymongo.collection.Collection(db, 'forecasts')
# Sample Forecast
'''{
'_id': ObjectId('5eb70199ca551c99d2348c4f'), 
'Region': 'Sierra Avalanche Center', 
'Forecast URL': 'https://www.sierraavalanchecenter.org/advisory/2020/may/2/2020-05-02-065414-avalanche-forecast', 
'Bottom Line': 'A good overnight refreeze and cooler weather...', 
'Above Treeline': '2. Moderate', 
'Near Treeline': '2. Moderate', 
'Below Treeline': '2. Moderate', 
'Avalanche Problem 1 Issue': 'Loose Wet', 
'Avalanche Problem 2 Issue': 'Cornice', 
'Avalanche Problem 3 Issue': '', 
'Date': '2020-05-02'
}'''

# define weather collection
weather = pymongo.collection.Collection(db, 'weather-daily')
# Sample weather
'''{
"_id": {
    "$oid": "5eba1326c3b37045e3001de7"}, 
"clouds_all": {
    "max": 75.0, 
    "mean": 8.833333333333334, 
    "min": 1.0}, 
"date": "2018-12-18", 
"humidity": {
    "max": 88.0, 
    "mean": 56.083333333333336, 
    "min": 31.0}, 
"lat": 38.939926, 
"loc_name": "South Lake Tahoe", 
"lon": -119.97718700000001, 
"pressure": {
    "max": 1020.0, 
    "mean": 1014.125, 
    "min": 1011.0}, 
"rain_1h": 0.0, 
"rain_3h": "NaN", 
"snow_1h": 0.0, 
"snow_3h": "NaN", 
"temp": {
    "max": 47.77, 
    "mean": 38.638749999999995, 
    "min": 32.23}, 
"wind_deg": {
    "max": 16.11, 
    "mean": 7.695, 
    "min": 2.75}, 
"wind_speed": {
    "max": 16.11, 
    "mean": 7.695, 
    "min": 2.75}
}'''


# Query data
# Provided a start and end date, queries all collections of the database and returns dictionary of data
def query_data(start, end):
    q_obs = json.loads(dumps(observations.find({'properties.datetime': {'$gte': start, '$lt': end}})))
    q_forecasts = json.loads(dumps(forecasts.find({'Date': {'$gte': start, '$lt': end}})))
    q_weather = json.loads(dumps(weather.find({'date': {'$gte': start, '$lt': end}})))
    return {
        "observations": q_obs,
        "forecasts": q_forecasts,
        "weather": q_weather}

# Home route, page js will load base data
@app.route('/')
def index():
    
    return render_template('index.html')

# API route, calls query_data and reloads visualizations
@app.route('/api/v1/<start>/<end>',methods=['GET'])
def date_start_end(start,end):
    data = query_data(start, end)

    return data

# Test/sample route
@app.route('/api/v1/sample',methods=['GET'])
def all_data():
    data = query_data('2020-03-01', '2020-06-01')
    return data


# Run app
if __name__ == '__main__':
    app.run(debug=True)