from flask import Flask, render_template, redirect 
from flask_pymongo import PyMongo
import os

password = os.environ["MONGODB_PASS"]


app = Flask(__name__)

# Use flask_pymongo to set up mongo connection
app.config["MONGO_URI"] = f"mongodb+srv://admin:{password}@cluster0-p6cjk.mongodb.net/test?retryWrites=true&w=majority"
app.config['MONGO_DBNAME'] = 'sac-dashboard'
mongo = PyMongo(app)

@app.route('/')
def index():
    # sac_dashboard = mongo.db.incidents.find_one()

    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)