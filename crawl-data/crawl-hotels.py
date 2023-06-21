from playwright.sync_api import sync_playwright
import pandas as pd
import json


def crawl_hotel_general_info(url):
    hotels = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url, timeout=60000)

        hotel_htmls = page.locator('//div[@data-testid="property-card"]').all()

        for i in range(len(hotel_htmls)):
            hotel = {}

            hotel["title"] = (
                hotel_htmls[i].locator('//div[@data-testid="title"]').inner_html()
            )

            hotel["price"] = int(
                str(
                    hotel_htmls[i]
                    .locator('//span[@data-testid="price-and-discounted-price"]')
                    .inner_html()
                )
                .replace("VND&nbsp;", "")
                .replace(",", "")
            )

            hotel["image"] = hotel_htmls[i].locator("//img").get_attribute("src")

            hotel["page_url"] = str(
                hotel_htmls[i]
                .locator('//a[@data-testid="title-link"]')
                .get_attribute("href")
            )[33:].split(".")[0]

            hotel["displayLocation"] = (
                hotel_htmls[i].locator('//span[@data-testid="address"]').inner_html()
            )

            ratting_stars = len(
                hotel_htmls[i]
                .locator('//div[@data-testid="rating-stars"]')
                .locator("//span")
                .all()
            )
            hotel["ratting_stars"] = int(ratting_stars) if ratting_stars != 0 else None

            hotels.append(hotel)

        browser.close()

    return hotels


def crawl_hotel_details(hotel):
    with sync_playwright() as p:
        url = f"https://www.booking.com/hotel/vn/{hotel['page_url']}.en-gb.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaPQBiAEBmAEJuAEYyAEM2AEB6AEB-AEMiAIBqAIEuALQ0ZWkBsACAdICJDI4NDUwNmVlLTYyNDItNDUyMi05NDFhLTNhYzZhMzJhYTQ0M9gCBuACAQ&sid=c08282235c890c9471db9034d7c43e07&all_sr_blocks=290430219_356939608_2_0_0;checkin=2023-06-20;checkout=2023-06-23;dest_id=-3712045;dest_type=city;dist=0;group_adults=2;group_children=0;hapos=1;highlighted_blocks=290430219_356939608_2_0_0;hpos=1;matching_block_id=290430219_356939608_2_0_0;no_rooms=1;req_adults=2;req_children=0;room1=A%2CA;sb_price_type=total;sr_order=popularity;sr_pri_blocks=290430219_356939608_2_0_0__108075000;srepoch=1686464740;srpvid=f9c42d31508901e2;type=total;ucfs=1"
        browser = p.chromium.launch(headless=False)

        page = browser.new_page()
        page.goto(url + "&#hotelTmpl", timeout=60000)

        hotel["description"] = page.locator(
            '//div[@id="property_description_content"]'
        ).inner_text()

        hotel["facility"] = (
            page.locator('//div[@data-testid="facility-list-most-popular-facilities"]')
            .first.inner_text()
            .split("\n")
        )
        page.close()

        # Get image links
        page = browser.new_page()
        page.goto(url + "&activeTab=photosGallery", timeout=60000)
        img_elements = (
            page.locator(
                '//div[@class="bh-photo-modal-thumbs-grid js-bh-photo-modal-layout js-no-close"]'
            )
            .locator("//img")
            .all()
        )
        hotel["thumbnail"] = img_elements[0].get_attribute("src")
        hotel["images"] = []
        for img_element in img_elements:
            image = img_element.get_attribute("src")
            if image is not None:
                hotel["images"].append(image)
        page.close()

        browser.close()


def get_hotels_data():
    checkin_date = "2023-06-13"
    checkout_date = "2023-06-16"
    urls = {
        "da-nang": f"https://www.booking.com/searchresults.en-gb.html?ss=Da+Nang&ssne=Da+Nang&ssne_untouched=Da+Nang&label=gen173nr-1BCAEoggI46AdIM1gEaPQBiAEBmAEJuAEZyAEM2AEB6AEBiAIBqAIDuALCsfajBsACAdICJDU3NjQzMTI5LTZlYzctNDBkYS04Yjk3LTQ0ZDEwNzA2OTJhZNgCBeACAQ&sid=c08282235c890c9471db9034d7c43e07&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=index&dest_id=-3712125&dest_type=city&checkin={checkin_date}&checkout={checkout_date}&group_adults=2&no_rooms=1&group_children=0&sb_travel_purpose=leisure",
        "da-lat": f"https://www.booking.com/searchresults.en-gb.html?ss=Da+Lat%2C+Lam+Dong%2C+Vietnam&ssne=Da+Nang&ssne_untouched=Da+Nang&label=gen173nr-1BCAEoggI46AdIM1gEaPQBiAEBmAEJuAEZyAEM2AEB6AEBiAIBqAIDuALCsfajBsACAdICJDU3NjQzMTI5LTZlYzctNDBkYS04Yjk3LTQ0ZDEwNzA2OTJhZNgCBeACAQ&sid=c08282235c890c9471db9034d7c43e07&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=searchresults&dest_id=-3712045&dest_type=city&ac_position=0&ac_click_type=b&ac_langcode=en&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=b3f13a57acb80091&ac_meta=GhBiM2YxM2E1N2FjYjgwMDkxIAAoATICZW46BmRhIGxhdEAASgBQAA%3D%3D&checkin={checkin_date}&checkout={checkout_date}&group_adults=2&no_rooms=1&group_children=0",
        "ha-noi": f"https://www.booking.com/searchresults.en-gb.html?ss=Hanoi%2C+Ha+Noi+Municipality%2C+Vietnam&ssne=Da+Lat&ssne_untouched=Da+Lat&label=gen173nr-1BCAEoggI46AdIM1gEaPQBiAEBmAEJuAEZyAEM2AEB6AEBiAIBqAIDuALCsfajBsACAdICJDU3NjQzMTI5LTZlYzctNDBkYS04Yjk3LTQ0ZDEwNzA2OTJhZNgCBeACAQ&sid=c08282235c890c9471db9034d7c43e07&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=searchresults&dest_id=-3714993&dest_type=city&ac_position=0&ac_click_type=b&ac_langcode=en&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=92553a66628806c2&ac_meta=GhA5MjU1M2E2NjYyODgwNmMyIAAoATICZW46BkhhIG5vaUAASgBQAA%3D%3D&checkin={checkin_date}&checkout={checkout_date}&group_adults=2&no_rooms=1&group_children=0",
        "binh-thuan": f"https://www.booking.com/searchresults.en-gb.html?ss=Binh+Thuan%2C+Vietnam&ssne=Hanoi&ssne_untouched=Hanoi&label=gen173nr-1BCAEoggI46AdIM1gEaPQBiAEBmAEJuAEZyAEM2AEB6AEBiAIBqAIDuALCsfajBsACAdICJDU3NjQzMTI5LTZlYzctNDBkYS04Yjk3LTQ0ZDEwNzA2OTJhZNgCBeACAQ&sid=c08282235c890c9471db9034d7c43e07&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=searchresults&dest_id=5391&dest_type=region&ac_position=0&ac_click_type=b&ac_langcode=en&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=59613a7d926d0644&ac_meta=GhA1OTYxM2E3ZDkyNmQwNjQ0IAAoATICZW46CmJpbmggdGh1YW5AAEoAUAA%3D&checkin={checkin_date}&checkout={checkout_date}&group_adults=2&no_rooms=1&group_children=0",
        "ho-chi-minh": f"https://www.booking.com/searchresults.en-gb.html?ss=ho+chi+minh&ssne=Binh+Thuan&ssne_untouched=Binh+Thuan&label=gen173nr-1BCAEoggI46AdIM1gEaPQBiAEBmAEJuAEZyAEM2AEB6AEBiAIBqAIDuALCsfajBsACAdICJDU3NjQzMTI5LTZlYzctNDBkYS04Yjk3LTQ0ZDEwNzA2OTJhZNgCBeACAQ&sid=c08282235c890c9471db9034d7c43e07&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=searchresults&checkin={checkin_date}&checkout={checkout_date}&group_adults=2&no_rooms=1&group_children=0",
    }

    for key, url in urls.items():
        # Get 25 hotels from url
        hotels = crawl_hotel_general_info(url)

        # For each hotel, get its detail
        for hotel in hotels:
            crawl_hotel_details(hotel)

        with open(f"{key}-hotels.json", "w") as fp:
            json.dump(hotels, fp, ensure_ascii=False)


def main():
    get_hotels_data()


if __name__ == "__main__":
    get_hotels_data()
