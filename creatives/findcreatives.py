import requests
import json
import os
import subprocess
import shutil
from rarfile import RarFile


accessToken = ""

def search_tiktok_videos(product_name, max_results=15):
    # Note: TikTok does not provide an official API for search
    # This is a placeholder URL, you need to use a proper TikTok API or scraping method
    api_url = "https://api.tiktok.com/v1/search/video"
    headers = {
        "Authorization": f"Bearer {accessToken} "
    }
    params = {
        "keyword": product_name,
        "count": max_results
    }

    response = requests.get(api_url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json().get('data', [])
    else:
        print(f"Error: {response.status_code}")
        return []

def display_results(videos):
    for i, video in enumerate(videos, 1):
        print(f"{i}. {video['title']} - {video['video_url']}")

def export_urls_to_file(videos, filename):
    with open(filename, 'w') as f:
        for video in videos:
            f.write(f"{video['video_url']}\n")
    print(f"URLs exported to {filename}")

def download_videos(video_urls, download_path):
    if not os.path.exists(download_path):
        os.makedirs(download_path)
    
    for i, url in enumerate(video_urls, 1):
        output_path = os.path.join(download_path, f"video_{i}.mp4")
        # Download video using yt-dlp
        try:
            subprocess.run(['yt-dlp', '-f', 'mp4', url, '-o', output_path], check=True)
            print(f"Downloaded: {output_path}")
        except subprocess.CalledProcessError as e:
            print(f"Error downloading video {url}: {e}")

def create_rar_from_directory(directory, rar_filename):
    with RarFile(rar_filename, 'w') as rar:
        for root, dirs, files in os.walk(directory):
            for file in files:
                file_path = os.path.join(root, file)
                rar.write(file_path, os.path.relpath(file_path, directory))
    print(f"RAR file created: {rar_filename}")

def main():
    product_name = input("Enter a product name: ")
    videos = search_tiktok_videos(product_name)
    
    if videos:
        display_results(videos)
        export_urls_to_file(videos, f"{product_name}_tiktok_urls.txt")
        
        video_urls = [video['video_url'] for video in videos]
        download_path = os.path.join(os.getcwd(), 'downloads')
        download_videos(video_urls, download_path)
        
        rar_filename = f"{product_name}_tiktok_videos.rar"
        create_rar_from_directory(download_path, rar_filename)
    else:
        print("No videos found.")

if __name__ == "__main__":
    main()
