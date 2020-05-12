import json
import pymongo
import os

inc_path = '/Users/JLow/Desktop/Files/Incidents/incidents_tf.json'
obs_path = '/Users/JLow/Desktop/Files/Observations/observations_tf.json'

def import_json(file_path):
    with open(file_path, 'r') as f:
        return json.loads(f.read())

# Import Files
incidents = import_json(inc_path)
observations = import_json(obs_path)

# Connect to DB
password = os.environ["MONGODB_PASS"]
myclient = pymongo.MongoClient(f"mongodb+srv://admin:{password}@cluster0-p6cjk.mongodb.net/test?retryWrites=true&w=majority")

# Load Data
sac_dash = myclient['sac-dashboard']
inc_col = sac_dash['incidents']
inc_col.drop()
obs_col = sac_dash['observations']
obs_col.drop()
obs_col = sac_dash['observations']
obs_col.insert_many(incidents)
obs_col.insert_many(observations)
print(myclient.list_database_names())

print(inc_col.find_one())
print(obs_col.find_one())