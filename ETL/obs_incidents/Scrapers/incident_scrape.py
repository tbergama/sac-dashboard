import pandas as pd
from splinter import Browser
from splinter.exceptions import ElementDoesNotExist
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup as bs
import datetime
import time
import json


def import_urls():
    # Assume the user will enter a valid csv
    valid_csv = True
    while valid_csv:
        try:
            url_csv_path = input("Please enter the full filepath to the urls csv you would like to use: ")
            url_df = pd.read_csv(url_csv_path)
            valid_csv = False
        # Otherwise loop back
        except:
            print("Invalid csv, please try again.")
    print(f"{len(url_df.index)} urls imported!")

    return url_df



def incident_scrape(url_df):
    
    # Initialize browser with chromedriver
    chrome_options = Options()
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    executable_path = {'executable_path': '/usr/local/bin/chromedriver'}
    browser = Browser('chrome', **executable_path, options=chrome_options, headless=False, incognito=True)
    time.sleep(2)
    
    #-----------------------------------
    # Scrape Info from Incidents

    start_index = input("Starting index?: ")
    total_incidents = len(url_df.index) - int(start_index)
    incident_data = []
    counter = 0


    # Desired Info
    # URL, Title, Location, Region, DateTime
    # Coords, 
    #
    #

    for index, url in url_df[int(start_index):].iterrows():
        # print(url)
        incident = {"type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": []
            },
            "properties": {}
        }
        incident['properties']['url'] = url[0]
        browser.visit(url[0])
        #time.sleep(0.3)
        
        html = browser.html
        soup = bs(html, 'lxml')

        missing = 0
        
        try:
            # Title
            try:
                incident['properties']['title'] = soup.find('h1', {'id': 'page-title-observation'}).text
            except:
                incident['properties']['title'] = soup.find('h1', {'id': 'page-title-avyobs'}).text
            
            # Small Info Table
            info_table = soup.find('table', class_='obs-pages')
            # Location
            try:
                incident['properties']['location'] = info_table.find('div', class_ = 'field-name-field-ob-loc-name').findChildren()[-1].text
            except Exception as e:
                print(f"Location Error: {e} on {url}")
            # Region
            try:
                incident['properties']['region'] = info_table.find('div', class_ = 'field-name-field-region').findChildren()[-1].text
            except Exception as e:
                print(f"Region Error: {e} on {url}")            
            # DateTime
            try:
                incident['properties']['datetime'] = info_table.find('span', class_ = 'date-display-single').text
            except Exception as e:
                print(f"Datetime Error: {e} on {url}") 
            
            # Coords
            try:
                coords = []
                coords.append(info_table.find('abbr', class_ = 'longitude')['title'])
                coords.append(info_table.find('abbr', class_ = 'latitude')['title'])
                incident['geometry']['coordinates'] = coords
            except Exception as e:
                # If no coordinate data, skip
                print(f"Coordinates missing at {url}, skipping...")
                continue            
                
            # Av Type
            try:
                incident['properties']['av_type'] = soup.find('div', class_='field-name-field-avalanche-type').findChildren()[-1].text
            except:
                try: 
                    incident['properties']['av_type'] = soup.find('div', class_='field-name-field-ob-avy-type').findChildren()[-1].text
                except:
                    incident['properties']['av_type'] = None
                    missing += 1
            # Weak Layer
            try:
                incident['properties']['weak_layer'] = soup.find('div', class_='field-name-field-ob-weak-layer').findChildren()[-1].text
            except:
                incident['properties']['weak_layer'] = None
                missing += 1
            # Trigger
            try:
                incident['properties']['trigger'] = soup.find('div', class_='field-name-field-trigger').findChildren()[-1].text
            except:
                try:
                    incident['properties']['trigger'] = soup.find('div', class_='field-name-field-ob-trigger').findChildren()[-1].text
                except:
                    incident['properties']['trigger'] = None
                    missing += 1
            # Trigger Modifier
            try:
                incident['properties']['trigger_mod'] = soup.find('div', class_='field-name-field-trigger-modifier').findChildren()[-1].text
            except:
                incident['properties']['trigger_mod'] = None
                missing += 1
            # Aspect
            try:
                incident['properties']['aspect'] = soup.find('div', class_='field-name-field-ob-aspect').findChildren()[-1].text
            except:
                incident['properties']['aspect'] = None
                missing += 1
            # Starting Elevation
            try:
                incident['properties']['start_elev'] = soup.find('div', class_='field-name-field-starting-elevation').findChildren()[-1].text
            except:
                try:
                    incident['properties']['start_elev'] = soup.find('div', class_='field-name-field-elevation').findChildren()[-1].text
                except:
                    incident['properties']['start_elev'] = None
                    missing += 1
            # Destructive Size
            try:
                incident['properties']['dest_size'] = soup.find('div', class_='field-name-field-destructive-size').findChildren()[-1].text
            except:
                incident['properties']['dest_size'] = None
                missing += 1
            # Relative Size
            try:
                incident['properties']['rel_size'] = soup.find('div', class_='field-name-field-relative-size').findChildren()[-1].text
            except:
                incident['properties']['rel_size'] = None
                missing += 1
            # Crown Height
            try:
                incident['properties']['crown_h'] = soup.find('div', class_='field-name-field-crown-height').findChildren()[-1].text
            except:
                incident['properties']['crown_h'] = None
                missing += 1
            # Av Width
            try:
                incident['properties']['av_width'] = soup.find('div', class_='field-name-field-avalanche-width').findChildren()[-1].text
            except:
                incident['properties']['av_width'] = None
                missing += 1
            # Av Length
            try:
                incident['properties']['av_length'] = soup.find('div', class_='field-name-field-avalanche-length').findChildren()[-1].text
            except:
                incident['properties']['av_length'] = None
                missing += 1
            # People Caught
            try:
                incident['properties']['people_caught'] = soup.find('div', class_='field-name-field-number-of-people-caught-2').findChildren()[-1].text
            except:
                try:
                    incident['properties']['people_caught'] = soup.find('div', class_='field-name-field-number-of-people-caught').findChildren()[-1].text
                except:
                    incident['properties']['people_caught'] = None
                    missing += 1
            # Partial Burials
            try:
                incident['properties']['partial_burials'] = soup.find('div', class_='field-name-field-number-of-partial-burials').findChildren()[-1].text
            except:
                incident['properties']['partial_burials'] = None
                missing += 1

            

            incident_data.append(incident)
            counter += 1
            print(f"Scraped {counter} (M:{missing}) of {total_incidents}...\r",end='')

        except Exception as e:
            
            print(f"Error at {url[0]}: {e}")
            # User response required to continue, selections based on error.
            user_response = input("Press 'ENTER' to continue, 'skip' to skip the current entry, or 'BREAK' to end process: ")
            user_response = user_response.lower()
            if user_response == '':
                url_df = url_df.append(url)
            elif user_response == 'break':
                break
            else:
                continue
    
    browser.quit()
    print('')
    print("Scrape Complete!")
    return incident_data


def export_incidents(data_dict):
    print(f"Incidents in list: {len(data_dict)}")

    output_path = f'incidents_{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}.json'
    
    input("Press 'ENTER' to export to .json")

    with open(output_path, 'w') as export:
        json.dump(data_dict, export)


#--------------------------------------

# Scrape listings of imported urls
data_dict = incident_scrape(import_urls())
# Export committed listings
export_incidents(data_dict)