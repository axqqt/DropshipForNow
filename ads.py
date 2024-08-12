from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ads.db'
db = SQLAlchemy(app)

class Ad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    platform = db.Column(db.String(50), nullable=False)
    campaign_name = db.Column(db.String(100), nullable=False)
    budget = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)

@app.route('/ads', methods=['GET', 'POST'])
def manage_ads():
    if request.method == 'POST':
        data = request.json
        new_ad = Ad(platform=data['platform'], campaign_name=data['campaign_name'], 
                    budget=data['budget'], status=data['status'])
        db.session.add(new_ad)
        db.session.commit()
        return jsonify({"message": "Ad created successfully"}), 201
    
    ads = Ad.query.all()
    return jsonify([{
        "id": ad.id,
        "platform": ad.platform,
        "campaign_name": ad.campaign_name,
        "budget": ad.budget,
        "status": ad.status
    } for ad in ads])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
