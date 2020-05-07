from splinter import Browser
from splinter.exceptions import ElementDoesNotExist
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup as bs
import datetime
import time
import pandas as pd
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



def obs_scrape(url_df):
    
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
    total_obs = len(url_df.index) - int(start_index)
    obs_data = []
    counter = 0


    # Desired Info
    # URL, Title, Location, Region, DateTime
    # Coords, 
    #
    #

    for index, url in url_df[int(start_index):].iterrows():
        # print(url)
        observation = {"type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": []
            },
            "properties": {}
        }
        observation['properties']['url'] = url[0]
        browser.visit(url[0])
        #time.sleep(0.3)
        
        html = browser.html
        soup = bs(html, 'lxml')
        
        try:
            # Title
            try:
                observation['properties']['title'] = soup.find('h1', {'id': 'page-title-observation'}).text
            except:
                observation['properties']['title'] = soup.find('h1', {'id': 'page-title-avyobs'}).text
            
            # Small Info Table
            info_table = soup.find('table', class_='obs-pages')
            # Location
            try:
                observation['properties']['location'] = info_table.find('div', class_ = 'field-name-field-ob-loc-name').findChildren()[-1].text
            except Exception as e:
                print(f"Location Error: {e} on {url}")
            # Region
            try:
                observation['properties']['region'] = info_table.find('div', class_ = 'field-name-field-region').findChildren()[-1].text
            except Exception as e:
                print(f"Region Error: {e} on {url}")            
            # DateTime
            try:
                observation['properties']['datetime'] = info_table.find('span', class_ = 'date-display-single').text
            except Exception as e:
                print(f"Datetime Error: {e} on {url}") 
            
            # Coords
            try:
                coords = []
                coords.append(info_table.find('abbr', class_ = 'longitude')['title'])
                coords.append(info_table.find('abbr', class_ = 'latitude')['title'])
                observation['geometry']['coordinates'] = coords
            except Exception as e:
                # If no coordinate data, skip
                print(f"Coordinates missing at {url}, skipping...")
                continue            
                
        
            obs_data.append(observation)
            counter += 1
            print(f"Scraped {counter} of {total_obs}...\r",end='')

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
    return obs_data


def export_obs(data_dict):
    print(f"Observations in list: {len(data_dict)}")

    output_path = f'observations_{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}.json'
    
    input("Press 'ENTER' to export to .json")

    with open(output_path, 'w') as export:
        json.dump(data_dict, export)


#--------------------------------------

# Scrape listings of imported urls
data_dict = obs_scrape(import_urls())
# Export committed listings
export_obs(data_dict)