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

observations = pymongo.collection.Collection(db, 'observations')
# Sample Observation
'''{'_id': {'$oid': '5eb38382517f507e17208142'}, 
    'type': 'Feature', 
    'geometry': {
        'type': 'Point', 
        'coordinates': ['-120.000369', '38.668149']}, 
    'properties': {
        'url': 'https://www.sierraavalanchecenter.org/observation/2020/may/1/1200/round-top', 
        'title': 'Generous window for corn snow at Carson Pass', 
        'location': 'Round Top', 
        'region': 'Carson Pass Area', 
        'datetime': '05-01-2020'}
    }'''

incidents = pymongo.collection.Collection(db, 'incidents')
'''{'_id': {'$oid': '5eb38381517f507e172080d7'}, 
    'type': 'Feature', 
    'geometry': {
        'type': 'Point', 
        'coordinates': ['-119.996300', '38.715800']}, 
    'properties': {
        'url': 'https://www.sierraavalanchecenter.org/observation/2020/apr/10/1200/west-gullies-red-lake-peak', 
        'title': 'Unintentional D1 on Red Lake Peak', 
        'location': 'West gullies of Red Lake Peak ', 
        'region': 'Carson Pass Area', 
        'datetime': '04-10-2020', 
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


forecasts = pymongo.collection.Collection(db, 'forecasts')

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

weather = pymongo.collection.Collection(db, 'weather-daily')

obs_one = json.loads(dumps(observations.find_one()))
inc_one = json.loads(dumps(incidents.find_one()))

# Query data
def query_data(start, end):
    q_obs = json.loads(dumps(observations.find({'properties.datetime': {'$gte': start, '$lt': end}})))
    q_inc = json.loads(dumps(incidents.find({'properties.datetime': {'$gte': start, '$lt': end}})))
    q_forecasts = json.loads(dumps(forecasts.find({'Date': {'$gte': start, '$lt': end}})))
    q_weather = json.loads(dumps(weather.find({'date': {'$gte': start, '$lt': end}})))
    return {"incidents": q_inc,
        "observations": q_obs,
        "forecasts": q_forecasts,
        "weather": q_weather}

@app.route('/')
def index():
    data = {"incidents": inc_one,
        "observations": obs_one}

    return render_template('index.html', sac_dash=data)

@app.route('/api/v1/<start>/<end>')
def date_start_end(start,end):
    data = query_data(start, end)

    return data

@app.route('/api/v1/sample')
def all_data():
    data = query_data('2020-01-01', '2020-06-01')
    return data


# Run app
if __name__ == '__main__':
    app.run(debug=True)