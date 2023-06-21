from playwright.sync_api import sync_playwright
import pandas as pd
import json

question_answer = [
    {
        "question": "Is there an elevator for guests?",
        "answer": "Yes, we have an elevator which go from basement to the top floor of the building.",
    },
    {
        "question": "Do you have a room with three single beds? Is there elevator?",
        "answer": 'Our "Standard Triple Room" has 3 beds (1,2m). And yes we have elevator.',
    },
    {
        "question": "Hi, do you have cooking facilities for group of 20?",
        "answer": "Hello, we don't have a place to cook for many people",
    },
    {
        "question": "Does the Double Room have air conditioning?",
        "answer": "No, our room temperature always from 20-23 degree whole year so we don't need AC. Only the rooftop room (Deluxe Studio) have AC system because it hot up there. ",
    },
    {
        "question": "Do you have secure car parking available?",
        "answer": "I'm sorry. We only have parking for motorbikes",
    },
    {
        "question": "We intend to book a superior studio for 2 of us and 2 kids, age 1 and 4.\nDo you provide a portable heater or can you help us rent a portable heater for our room.",
        "answer": "Hello, we can rent a portable heater for you or there are another option that the smaller room: Deluxe Studio with King-size bed, which have an AC system so you don't need a heater if you choose this room.",
    },
    {
        "question": "do you have washing facilities or is there a laundry close by? Thank you",
        "answer": "There is a laundry shop near by, just 5 minutes of walking. We also have washing facilities but it will more expensive.",
    },
    {
        "question": "Hello, for the Quadruple room, there is a total of 4 beds, right? Since there is 2 bunk beds",
        "answer": "As you can see in the photo of the room, the quadruple room have only 2 double beds for 4 peoples. (1,6m lower bed and 1,4m upper bed)",
    },
    {
        "question": "How is the payment handled? Through Booking.com or direct to the host?",
        "answer": "Hello, our guests will pay at the property, not through Booking.com, and not prepaid. ",
    },
    {
        "question": "Is there air conditioning in Superior Studio? (60 sq.metre room)",
        "answer": "Sorry, we don't have air conditioning in Superior Studio. Only the Deluxe King Studio has an AC.",
    },
]


def get_facility_details():
    url = "https://www.booking.com/hotel/vn/dalat-feliz-home.en-gb.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaPQBiAEBmAEJuAEYyAEM2AEB6AEB-AEMiAIBqAIEuALQ0ZWkBsACAdICJDI4NDUwNmVlLTYyNDItNDUyMi05NDFhLTNhYzZhMzJhYTQ0M9gCBuACAQ&sid=c08282235c890c9471db9034d7c43e07&all_sr_blocks=290430219_356939608_2_0_0;checkin=2023-06-20;checkout=2023-06-23;dest_id=-3712045;dest_type=city;dist=0;group_adults=2;group_children=0;hapos=1;highlighted_blocks=290430219_356939608_2_0_0;hpos=1;matching_block_id=290430219_356939608_2_0_0;no_rooms=1;req_adults=2;req_children=0;room1=A%2CA;sb_price_type=total;sr_order=popularity;sr_pri_blocks=290430219_356939608_2_0_0__108075000;srepoch=1686464740;srpvid=f9c42d31508901e2;type=total;ucfs=1&#hotelTmpl"
    hotels = []
    facility_details = set()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url, timeout=60000)
        elements = page.locator('//span[@class="hprt-facilities-facility"]').all()
        for element in elements:
            facility_details.add(element.text_content()[1:-1])

        browser.close()


if __name__ == "__main__":
    get_facility_details()
