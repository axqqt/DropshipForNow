from pyrqs import rqs
import time
from datetime import datetime, timedelta
import json

def search_tiktok_content(search_term):
    category = 'video'
    fields = 'display_name,like_count,video_description,hashtag_names'
    limit = 100
    client = rqs.RQSClient()
    
    condition_groups = [
        {
            "operator": "and",
            "conditions": [
                {
                    "field": "video_description",
                    "operator": "LIKE",
                    "field_values": [f"%{search_term}%"]
                },
                {
                    "field": "hashtag_names",
                    "operator": "CONTAINS",
                    "field_values": ["tiktok"]
                }
            ]
        }
    ]
    
    data = client.query(category=category, condition_groups=condition_groups, fields=fields, limit=limit)
    return data

def main():
    search_term = input("Enter a search term for TikTok content: ")
    results = search_tiktok_content(search_term)
    
    print(f"Search results for '{search_term}' in TikTok content:")
    for item in results:
        print(f"Display Name: {item['display_name']}")
        print(f"Like Count: {item['like_count']}")
        print(f"Description: {item['video_description']}")
        print(f"Hashtags: {', '.join(item['hashtag_names'])}")
        print("-" * 50)

if __name__ == "__main__":
    main()