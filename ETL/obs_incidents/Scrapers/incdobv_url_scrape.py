'''
Sierra Avalanche Center Scraper
Author: Josh Lowy
Copyright 2020

Scrapes incident and obsveration report urls from
'sierraavalanchecenter.org'.  Exports urls to csv which 
can then be fed to the incdobv_scrape.py
'''

from splinter import Browser
from splinter.exceptions import ElementDoesNotExist
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup as bs
import datetime
import time
import pandas as pd


# Initialize browser with chromedriver
chrome_options = Options()
chrome_options.add_argument("--log-level=3")
chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
executable_path = {'executable_path': '/usr/local/bin/chromedriver'}
browser = Browser('chrome', **executable_path, options=chrome_options, headless=False, incognito=True)
time.sleep(2)

def url_scrape():
    
    # Sierra Avalanche Incidents Page
    sierra = "https://www.sierraavalanchecenter.org" 
    incidents = "/incidents-archive"
    observations = "/observations-archive"

    #--------------------------------------
    # Scrape URLs

    for i in [0,1]:
        if i == 0:
            url = sierra + incidents
            url_type = 'incident'
        elif i == 1:
            url = sierra + observations
            url_type = 'observation'
        
        url_list = []
        
        
        browser.visit(url)
        html = browser.html
        soup = bs(html, 'lxml')

        # Grab page count (as int)
        pages = int(soup.find_all("li",class_ = "pager-item")[-1].findChild().text)

        scrape_counter = 0
        page_count = 0

        while page_count < pages:
            # Reset soup for 'new' page
            html = browser.html
            soup = bs(html, 'lxml')
            
            # Grab individual incidents/observations
            results = soup.find_all("tr")
            for result in results:
                try:
                    url_list.append(sierra + result.find("a")['href'])
                    scrape_counter += 1
                except:
                    continue
            
            time.sleep(2)
            # All results for this page have been gathered, go to next page
            page_count += 1
            try:
                browser.find_by_css('li.pager-next').click()
            except:
                print("Switching scrape type...")
            
            print(f"URLs Scraped: {len(url_list)} for {page_count} of {pages} pages...\r",end='')

        # Export to csv
        export_urls(url_list, url_type)

        print('')
    browser.quit()
    
    print("Finished Scrape!")

def export_urls(url_list, url_type):
    df = pd.DataFrame(url_list)
    print(f"Listings in DF: {df.count()}")
    input("Press 'ENTER' to export to .csv")
    df.to_csv(f'{url_type}_urls_{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}.csv', index=False)


url_scrape()