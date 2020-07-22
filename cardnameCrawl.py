import requests
import json
from bs4 import BeautifulSoup

# Params
DB_URL = 'https://www.db.yugioh-card.com'
PACK_LIST_URL = 'https://www.db.yugioh-card.com/yugiohdb/card_list.action?'
LOCALE_PARAM = 'request_locale='

# Load data
with open('cards.json', 'r', encoding='utf-8') as card_json:
    crawled_cards = json.load(card_json)
with open('packs.json', 'r', encoding='utf-8') as pack_json:
    crawled_packs = json.load(pack_json)

# Functions
def get_pack_links(lang):
    url = PACK_LIST_URL + LOCALE_PARAM + lang
    pack_list_html = requests.get(url).text
    soup = BeautifulSoup(pack_list_html, 'html.parser')
    pack_link_divs = soup.find_all('div', {'class': 'pack_' + lang})

    pack_links = list()
    for pack_link_div in pack_link_divs:
        pack_link_value = pack_link_div.find('input')['value']
        pack_link = DB_URL + pack_link_value + '&' + LOCALE_PARAM + lang
        pack_links.append(pack_link)

    for pack_link in pack_links:
        get_card_info(lang, pack_link)

def get_card_info(lang, pack_link):

    # Skip crawled packs
    if pack_link in crawled_packs:
        return

    pack_html = requests.get(pack_link).text
    soup = BeautifulSoup(pack_html, 'html.parser')
    cards = soup.find('ul', {'class': 'box_list'}).find_all('li')

    for card in cards:
        card_name = card.find('span', {'class': 'card_status'}).strong.string
        card_url = DB_URL + card.find('input')['value'] + '&' + LOCALE_PARAM + lang
        print(card_name, card_url)

        if lang not in crawled_cards:
            crawled_cards[lang] = list()

        if not any(card_name == card_data['N'] for card_data in crawled_cards[lang]):
            crawled_cards[lang].append({
                'N': card_name,
                'U': card_url
            })


    with open('cards.json', 'w', encoding='utf-8') as card_json:
        json.dump(crawled_cards, card_json, ensure_ascii=False)

    crawled_packs.append(pack_link)
    with open('packs.json', 'w', encoding='utf-8') as pack_json:
        json.dump(crawled_packs, pack_json, ensure_ascii=False)


# Main
for lang in ['ko','ja','en']:
    get_pack_links(lang)