from flask import Flask, request, jsonify, render_template, send_from_directory
import math

app = Flask(__name__)

# 1️⃣ Simulation de prêt (mensualité + tableau d'amortissement)
def calculer_mensualite(montant, taux_annuel, duree_annees):
    taux_mensuel = taux_annuel / 12 / 100
    nombre_mois = duree_annees * 12
    if taux_mensuel == 0:
        mensualite = montant / nombre_mois
    else:
        mensualite = (montant * taux_mensuel) / (1 - (1 + taux_mensuel) ** -nombre_mois)
    return mensualite

def generer_tableau_amortissement(montant, taux_annuel, duree_annees):
    mensualite = calculer_mensualite(montant, taux_annuel, duree_annees)
    tableau = []
    capital_restant = montant
    taux_mensuel = taux_annuel / 12 / 100
    
    for mois in range(1, duree_annees * 12 + 1):
        interet = capital_restant * taux_mensuel
        capital_rembourse = mensualite - interet
        capital_restant -= capital_rembourse
        tableau.append({"mois": mois, "mensualite": round(mensualite,2), "interet": round(interet,2), "capital": round(capital_rembourse,2), "reste": round(capital_restant,2)})
    
    return tableau

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/google7eb007a178cf48e6.html')
def google_verification():
    return send_from_directory('static', 'google7eb007a178cf48e6.html')


@app.route("/simulate-loan", methods=["POST"])
def simulate_loan():
    data = request.json
    montant = data["montant"]
    taux_annuel = data["taux_annuel"]
    duree_annees = data["duree_annees"]
    
    mensualite = calculer_mensualite(montant, taux_annuel, duree_annees)
    tableau = generer_tableau_amortissement(montant, taux_annuel, duree_annees)
    total_interets = sum(row["interet"] for row in tableau)
    
    return jsonify({
        "somme_emprunte" : round(montant,2),
        "mensualite": round(mensualite,2),
        "total_interets": round(total_interets,2),
        "cout_emprunt" : round(montant+total_interets,2), 
        "tableau_amortissement": tableau
    })


# @app.route('/simulate-savings', methods=['POST'])
# def simulate_savings():
#     data = request.json
#     montant = data['montant']
#     duree_annees = data['duree_annees']
#     taux = data['taux'] / 100  # Convertir en décimal

#     nb_mois = duree_annees * 12

#     # Calcul de l’épargne mensuelle sans rendement
#     epargne_mensuelle = montant / nb_mois

#     # Calcul de l’investissement avec rendement
#     taux_mensuel = taux / 12
#     invest_mensuel = montant * taux_mensuel / (math.pow(1 + taux_mensuel, nb_mois) - 1)

#     return jsonify({
#         "epargne_mensuelle": epargne_mensuelle,
#         "invest_mensuel": invest_mensuel
#     })





# # 2️⃣ Simulation d'épargne (sans rendement)
# def calculer_epargne_mensuelle(objectif, duree_annees):
#     return objectif / (duree_annees * 12)

# @app.route("/simulate-savings", methods=["POST"])
# def simulate_savings():
#     data = request.json
#     objectif = data["objectif"]
#     duree_annees = data["duree_annees"]
    
#     montant_mensuel = calculer_epargne_mensuelle(objectif, duree_annees)
    
#     return jsonify({"montant_mensuel": montant_mensuel})

# # 3️⃣ Simulation d'investissement (avec rendement)
# def calculer_investissement_mensuel(objectif, taux_annuel, duree_annees):
#     taux_mensuel = taux_annuel / 12 / 100
#     nombre_mois = duree_annees * 12
    
#     if taux_mensuel == 0:
#         return objectif / nombre_mois
    
#     facteur = (1 + taux_mensuel) ** nombre_mois - 1
#     montant_mensuel = objectif * taux_mensuel / facteur
    
#     return montant_mensuel

# @app.route("/simulate-investment", methods=["POST"])
# def simulate_investment():
#     data = request.json
#     objectif = data["objectif"]
#     taux_annuel = data["taux_annuel"]
#     duree_annees = data["duree_annees"]
    
#     montant_mensuel = calculer_investissement_mensuel(objectif, taux_annuel, duree_annees)
    
#     return jsonify({"montant_mensuel": montant_mensuel})




# Exécution de l'application
if __name__ == "__main__":
    app.run(debug=True)
