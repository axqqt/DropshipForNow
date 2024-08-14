from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

@app.route('/get_video', methods=['POST'])
def get_video():
    userURL = request.form['url']
    
    url = "https://tiktok-video-no-watermark2.p.rapidapi.com/"
    
    querystring = {"url": userURL, "hd": "1"}
    
    headers = {
        "x-rapidapi-key": "35d59d5501msh3a3171dd81abf0dp1a6e5ajsn50a2d7eb4519",
        "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com"
    }
    
    response = requests.get(url, headers=headers, params=querystring)
    
    if response.status_code == 200:
        output = response.json()
        hdplay_url = output.get("hdplay", "No HD play URL found")
        return jsonify({"hdplay_url": hdplay_url})
    else:
        return jsonify({"hdplay_url": "Failed to get response from API"})

if __name__ == '__main__':
    app.run(debug=True)