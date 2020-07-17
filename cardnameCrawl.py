import requests
import json
from bs4 import BeautifulSoup

DB_URL = 'https://www.db.yugioh-card.com'
LANG_KOR = 'request_locale=ko'

with open('cardnames.json', 'r') as card_json:
    card_names = json.load(card_json)
with open('crawledURL.json', 'r') as crawl_json:
    crawled_urls = json.load(crawl_json)

pack_list_url = 'https://www.db.yugioh-card.com/yugiohdb/card_list.action?request_locale=ko'

pack_list_html = requests.get(pack_list_url).text

soup = BeautifulSoup(pack_list_html, 'html.parser')

pack_link_divs = soup.find_all('div', {'class': 'pack_ko'})

pack_links = list()

for pack_link_div in pack_link_divs:
    pack_link_value = pack_link_div.find('input')['value']
    pack_link = DB_URL + pack_link_value + '&' + LANG_KOR
    pack_links.append(pack_link)

for pack_link in pack_links:
    if pack_link in crawled_urls:
        continue

    pack_html = requests.get(pack_link).text
    soup = BeautifulSoup(pack_html, 'html.parser')
    card_infos = soup.find_all('span', {'class':'card_status'})
    for card_info in card_infos:
        card_name = card_info.strong.string
        print(card_name)
        card_names.append(card_name)

    crawled_urls.append(pack_link)
    with open('crawledURL.json', 'w') as crawl_json:
        json.dump(crawled_urls, crawl_json)

    with open('cardnames.json', 'w') as card_json:
        json.dump(card_names, card_json)

