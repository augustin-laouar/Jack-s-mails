# Jack's Mails

## todo
- Ajouter sur chrome
- Enregistrement automatique de mots de passes lorsque l'on s'inscrit sur un site
- ajouter petit bouton copier à côter du nom de l'email
- Nouveau CSS 
- changer logs/passwords par credentials / connectionDuration par sessionValidity
- Dans local storage : utiliser des _ et pas ecriture java
- bouton pour afficher le mot de passe lors de l'édition
- logout lors de fermeture du navigateur 
- backgroundScripts => background
- utiliser chemin absolu a la place de relatif
- si possible petite pastille verte qui indique si l'on est connecté ou non
- Réflechir à une manière de sécurisé l'envoi de messages entre scripts
# Bugs 
- API error quand on ouvre un mail
- le mail reste en non lu
- Lors de la recherche de credentials, lorsque l'on change la méthode de recherche ça ne refresh pas
- Error api lorsque l'on delete + il faut supprimer le contenu du mail a droite
- Empecher le formulaire de login d'afficher le password dans l'url
## Tache actuel
Ajouter le nom des boutons au survol
- Password page OK
- 
Rajouter la possibilité de clic droit pour utiliser une email directement
- Page par défaut : login. Script sur la page login qui vérifie si s'est le first login, si oui redirection. Vérifie également si on est déjà log, si oui redirection sur emails
- Simplifié check login : seul fonctionnalité : vérifier si le timeout a expiré, si oui on déco
- Déconnection à la fermeture du navigateur etc
- BUG CHECKLOGIN TJR REDIRIGE SUR LOGIN.HTML
## Terminé
- Stocker logs via des ids et non url 
- Modification du password 
- Code refactoring 
- Lors de création d'email, inutile de spécifier le password du compte.
- Ajouter la possibilitée de filtrer avec le username
- Ajouter barre des tâches dans password.html
- Icons
- email page design
- import/export 
- Style settings page
- faire un bouton de reset account
- style css button
- choix du nom de domaine => On peut voir une liste de domaines à côté du nom que l'on choisit pour l'addresse mail.
- Ajouter du sel dans le hash du psw
- Champ description et titre pour les passwords
- Add/edit password avec fake popup
- sort psw by title
- style tableau password
- génération de mdp aléatoire pour credentials
