# Strip title
# Convert datetime to datetime
# Convert crown_h to int
# Convert av_width and av_length to int
# Convert start_elev to int

import json
import datetime as d

inc_import = '/Users/JLow/Desktop/Files/Incidents/incidents_2020-05-06 08:55:16.json'
obs_import = '/Users/JLow/Desktop/Files/Observations/observations_2020-05-09 13:17:22.json'

def import_json(file_path):
    with open(file_path, 'r') as f:
        return json.loads(f.read())


def strip_title(title):
    # Dict[properties][title]
    return title.strip(' \n')

def to_date(date):
    # Dict[properties][datetime]
    try:
        dobject = d.datetime.strptime(date, '%A, %B %d, %Y - %H:%M')
    except:
        try:
            dobject = d.datetime.strptime(date, '%a, %m/%d/%Y - %H:%M')
        except:
            dobject = d.datetime.strptime(date.replace('(All day)', '').strip(), '%a, %m/%d/%Y')
    return dobject.strftime('%m-%d-%Y')

def crown_to_int(crown_h):
    # Dict[properties][crown_h]
    if crown_h == "Less than 1 ft":
        return 0
    else:
        return int(crown_h.strip(' ft'))

def av_dim_to_int(av_dim):
    return int(av_dim.strip('ft.').replace(' ',''))

def transform(data,full_bool):
    # Observation lack properties, so run a 
    # simplified transform for obervations
    if full_bool:
        for feature in data:
            feature['properties']['type'] = 'incident'
            try:
                # Strip Title
                feature['properties']['title'] = strip_title(feature['properties']['title'])
                # Convert Date
                feature['properties']['datetime'] = to_date(feature['properties']['datetime'])
                # Convert crown_h
                if feature['properties']['crown_h']:
                    feature['properties']['crown_h'] = crown_to_int(feature['properties']['crown_h'])
                # Convert avalanche dimensions
                if feature['properties']['av_width']:
                    feature['properties']['av_width'] = av_dim_to_int(feature['properties']['av_width'])
                if feature['properties']['av_length']:
                    feature['properties']['av_length'] = av_dim_to_int(feature['properties']['av_length'])
                # Convert elevation
                if feature['properties']['start_elev']:
                    try:
                        feature['properties']['start_elev'] = av_dim_to_int(feature['properties']['start_elev'])
                    except:
                        print("Placeholder *shrug*")
            except Exception as e:
                print(feature)
                print('')
                print(e)
                quit()
    else:
        for feature in data:
            feature['properties']['type'] = 'observation'
            try:
                # Strip Title
                feature['properties']['title'] = strip_title(feature['properties']['title'])
                # Convert Date
                feature['properties']['datetime'] = to_date(feature['properties']['datetime'])
            except Exception as e:
                print(feature)
                print('')
                print(e)
                quit()

def export_json(data, dtype):
    output_path = f'{dtype}_tf.json'
    
    input(f"Press 'ENTER' to export {dtype} to .json")

    with open(output_path, 'w') as export:
        json.dump(data, export)

#-------------------------------------
# Import .json files
incidents = import_json(inc_import)
observations = import_json(obs_import)

# Transform Data
transform(incidents,True)
transform(observations, False)

# Export Data
export_json(incidents, 'incidents')
export_json(observations, 'observations')