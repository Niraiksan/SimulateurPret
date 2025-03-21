document.addEventListener("DOMContentLoaded", function() {
    const amortissementTable = document.getElementById("amortissementTable").getElementsByTagName('tbody')[0];

    if(document.getElementById("tauxRendement")!= null) document.getElementById("tauxRendement").addEventListener("change", calculerEpargneInvestissement);
    if(document.getElementById("annee_invest")!= null)document.getElementById("annee_invest").addEventListener("change", calculerEpargneInvestissement);
    if(document.getElementById("annee_emprunt")!= null)document.getElementById("annee_emprunt").addEventListener("change", calculerEpargneInvestissement);


    const capitalVsInteretsChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Capital', 'Intérêts'],
            datasets: [{
                data: [50, 50], // Valeurs par défaut
                backgroundColor: ['#0d6dfd38', '#fd0d0d9b']
            }]
        }
    });

    const evolutionChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['1', '2', '3', '4', '5'], // Mois par défaut
            datasets: [
                {
                    label: 'Capital restant à rembourser',
                    data: [10000, 10000, 10000, 10000, 10000], // Valeurs par défaut
                    borderColor: '#0d6dfd38',
                    fill: false
                },
                {
                    label: 'Intérêts cumulés',
                    data: [500, 500, 500, 500, 500], // Valeurs par défaut
                    borderColor: '#fd0d0d9b',
                    fill: false
                }
            ]
        }
    });


    document.getElementById("loan-form").addEventListener("submit", function(event) {
        event.preventDefault();

        let currentPage = 12;
        let montant = document.getElementById("montant").value;
        let taux_annuel = document.getElementById("taux_annuel").value;
        let duree_annees = document.getElementById("duree_annees").value;

        document.getElementById("solutions").style.display = 'none';
    
        fetch("/simulate-loan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                montant: parseFloat(montant),
                taux_annuel: parseFloat(taux_annuel),
                duree_annees: parseInt(duree_annees)
            })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("montantEmprunte").textContent = data.somme_emprunte.toFixed(0);
            document.getElementById("mensualite").textContent = data.mensualite.toFixed(0);
            document.getElementById("totalInterets").textContent = data.total_interets.toFixed(0);
            document.getElementById("coutTotal").textContent = data.cout_emprunt.toFixed(0);        

            updateCharts(data);      

            tab_amortissement=data.tableau_amortissement;
            updateAmortissementTable(data.tableau_amortissement);

            console.log(data.tableau_amortissement)

            let downloadbtn = document.getElementById("dwnldTable");
            downloadbtn.replaceWith(downloadbtn.cloneNode(true)); 
            downloadbtn = document.getElementById("dwnldTable");

            document.getElementById("dwnldTable").addEventListener("click", function() {
                if (!tab_amortissement || tab_amortissement.length === 0) {
                    return;
                }
            
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
            
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.text("Tableau d'Amortissement", 14, 20);
            
                doc.setFontSize(10);
                const today = new Date().toLocaleDateString();
                doc.text(`Date: ${today}`, 14, 28);

                doc.text(`Somme empruntée: ${montant} €`, 14, 36);
                doc.text(`Taux d'intérêt: ${taux_annuel} %`, 14, 40);
                doc.text(`Durée de l'emprunt: ${duree_annees} ans`, 14, 44);

                doc.text(`Mensualité: ${data.mensualite} €`, 14, 54);
                doc.text(`Total des intérêts: ${data.total_interets} €`, 14, 58);
                doc.text(`Coût total de l'emprunt: ${data.cout_emprunt} €`, 14, 62);
            
                // Définir les colonnes du tableau
                const columns = ["Mois", "Mensualité (€)", "Intérêts (€)", "Capital remboursé (€)", "Capital restant (€)"];
            
                // Transformer les données en format tableau
                const rows = tab_amortissement.map(item => [
                    item.mois, 
                    item.mensualite.toFixed(2), 
                    item.interet.toFixed(2), 
                    item.capital.toFixed(2), 
                    item.reste.toFixed(2)
                ]);
            
                // Ajouter le tableau avec autoTable
                doc.autoTable({
                    startY: 70,
                    head: [columns],
                    body: rows,
                    theme: "grid",
                    styles: {
                        fontSize: 9,
                        cellPadding: 2,
                    },
                    headStyles: {
                        fillColor: [41, 128, 185], // Bleu Bootstrap
                        textColor: 255,
                        fontStyle: "bold"
                    },
                    alternateRowStyles: { fillColor: [240, 240, 240] },
                    margin: { top: 30 }
                });
            
                // Sauvegarder et télécharger le PDF
                doc.save("Tableau_Amortissement.pdf");
            });
            


            let seeMoreButton = document.getElementById("seeMoreButton");
            seeMoreButton.replaceWith(seeMoreButton.cloneNode(true)); 
            seeMoreButton = document.getElementById("seeMoreButton");

            seeMoreButton.addEventListener("click", function() {
                console.log(tab_amortissement)
                let start = currentPage;
                let end = start + 12;
                currentPage=end;
                console.log("start : "+start)
                console.log("end : "+end)
                console.log("current page : "+currentPage)
                let nextRows = tab_amortissement.slice(start, end);
        
                nextRows.forEach(row => {
                    const newRow = amortissementTable.insertRow();
                    newRow.innerHTML = `
                        <td><font size="2">${row.mois}</font></td>
                        <td><font size="2">${row.mensualite} €</font></td>
                        <td class="text-danger"><font size="2">${row.interet} €</font></td>
                        <td><font size="2">${row.capital} €</font></td>
                        <td><font size="2">${row.reste} €</font></td>
                    `;
                });   
                
                if (currentPage >= tab_amortissement.length) {
                    seeMoreButton.disabled = true;
                }
            });
        })
        .catch(error => console.error("Erreur:", error));
    });
    

    function updateAmortissementTable(tableau) {
        amortissementTable.innerHTML = ""; 
        let rowsToShow = tableau.slice(0, 12); 

        rowsToShow.forEach(row => {
            const newRow = amortissementTable.insertRow();
            newRow.innerHTML = `
                <td><font size="2">${row.mois}</font></td>
                <td><font size="2">${row.mensualite} €</font></td>
                <td class="text-danger"><font size="2">${row.interet} €</font></td>
                <td><font size="2">${row.capital} €</font></td>
                <td><font size="2">${row.reste} €</font></td>
            `;
        });
    }

    function updateCharts(data) {
        capitalVsInteretsChart.data.datasets[0].data = [data.cout_emprunt - data.total_interets, data.total_interets];
        capitalVsInteretsChart.update();

        const capitalData = data.tableau_amortissement.map(row => row.reste);
        const interestData = data.tableau_amortissement.map((row, index) => 
            data.tableau_amortissement.slice(0, index + 1).reduce((acc, r) => acc + r.interet, 0)
        );

        evolutionChart.data.labels = data.tableau_amortissement.map(row => row.mois);
        evolutionChart.data.datasets[0].data = capitalData;
        evolutionChart.data.datasets[1].data = interestData;
        evolutionChart.update();
    }


});

function calculerEpargneInvestissement() {
    document.getElementById("solutions").style.display = "block";
    let montantObjectif = parseFloat(document.getElementById("montant").value);
    let dureeAnnees_emprunt = parseInt(document.getElementById("annee_emprunt").value);
    let dureeAnnees_invest = parseInt(document.getElementById("annee_invest").value);
    let tauxRendement = parseFloat(document.getElementById("tauxRendement").value) / 100;

    let nbMois_emprunt = dureeAnnees_emprunt * 12;
    let nbMois_invest = dureeAnnees_invest * 12;

    document.getElementById("montantESP").innerText = montantObjectif;
    document.getElementById("montantESP2").innerText = montantObjectif;

    // 🔹 Épargne sans rendement
    let epargneMensuelle = montantObjectif / nbMois_emprunt;
    document.getElementById("epargneMensuelle").innerText = epargneMensuelle.toFixed(0);

    // 🔹 Investissement avec rendement
    let tauxMensuel = tauxRendement / 12;
    let investMensuel = montantObjectif * tauxMensuel / (Math.pow(1 + tauxMensuel, nbMois_invest) - 1);
    document.getElementById("investMensuel").innerText = investMensuel.toFixed(0);

    // Mise à jour du taux sélectionné
    document.getElementById("tauxSelectionne").innerText = `${tauxRendement * 100}%`;
}
