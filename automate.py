from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import time
import random
import requests
from bs4 import BeautifulSoup
import csv
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

ALIEXPRESS_SEARCH_URL = "https://www.aliexpress.com/w/wholesale-fitness-products.html?spm=a2g0o.productlist.search.0"

def configure_headers():
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

def ai_analyze_prompt(prompt):
    # Placeholder for actual AI model integration
    return prompt.split()

def search_aliexpress(key_terms):
    headers = configure_headers()
    search_url = f"{ALIEXPRESS_SEARCH_URL}?SearchText={'+'.join(key_terms)}"
    try:
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        links = [
            f"https://www.aliexpress.com{item['href']}"
            for item in soup.find_all('a', href=True)
            if '/item/' in item['href']
        ]
        return links[:10]  # Limit to 10 results
    except Exception as e:
        print(f"Error searching AliExpress: {e}")
        return []

def extract_product_data(url):
    headers = configure_headers()
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title = soup.find('h1', class_='product-title-text')
        price = soup.find('span', class_='product-price-value')
        description = soup.find('div', class_='product-description')
        image = soup.find('img', class_='magnifier-image')
        
        if not all([title, price, description, image]):
            return None
        
        return {
            "Handle": f"product-{random.randint(1000, 9999)}",
            "Title": title.text.strip(),
            "Body (HTML)": f"<p>{description.text.strip()}</p>",
            "Vendor": "AliExpress",
            "Type": "",
            "Tags": "",
            "Published": "TRUE",
            "Option1 Name": "Size",
            "Option1 Value": "One Size",
            "Option2 Name": "Color",
            "Option2 Value": "Default",
            "Variant SKU": f"SKU-{random.randint(1000, 9999)}",
            "Variant Price": price.text.strip(),
            "Variant Inventory Qty": str(random.randint(10, 100)),
            "Image Src": image['src'],
        }
    except Exception as e:
        print(f"Error extracting product data: {e}")
        return None
    
@app.route('/api/search', methods=['POST'])
def search_products():
    prompt = request.json.get('prompt')
    if not isinstance(prompt, str) or not prompt:
        return jsonify({"error": "Invalid or missing prompt"}), 400
    
    key_terms = ai_analyze_prompt(prompt)
    product_links = search_aliexpress(key_terms)
    
    data = []
    for link in product_links:
        product_data = extract_product_data(link)
        if product_data:
            data.append(product_data)
            time.sleep(random.uniform(2, 5))  # Polite scraping
    
    if not data:
        return jsonify({"error": "No products found"}), 404

    # Convert data to CSV format
    csv_fields = [
      "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
      "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value",
      "Variant SKU", "Variant Price", "Variant Inventory Qty", "Image Src"
    ]
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=csv_fields)
    writer.writeheader()
    for row in data:
        writer.writerow(row)

    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=products.csv'
    return response

if __name__ == "__main__":
    app.run(debug=True)
