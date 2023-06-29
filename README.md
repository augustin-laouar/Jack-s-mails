# locker

Author : LAOUAR Augustin & Thinhinane ZEDDAM

## Login page 
To get access to the application, you need to enter your "master password". We store the sha256 encryption of this password into the local storage of the browser.
We use crypto API : window.crypto.subtle.digest('SHA-256', data); .
We also store the last login date. On every other pages than login.html, we check how much time there is since the last login. If last login date is older than x minutes (actually x = 1), we redirect to login.html. It the last login date data does not exist, we redirect to login.html.
Scripts used are in login.js, tools.js and verify auth.js .


## Structure
### background.js
A script run permanently in background, even if the extension is not open.

### tools.js
Every js function that could be usfull in other scripts, for example "isLogged()".

### content-script.js
Not used now.

## TODO

### Augustin 
- Fonctionnalité générer un email aléatoire. OK
- Gestion des pièces jointes dans un email (sera surement à faire au moment du dev de l'interface).
- Interface pour les mails (bouton de suppression, marquer non lu etc...)
- stockage encryptés des données de connexion aux mails.
- Fonctionnalité permettant de visualisé son MDP enregistré pour un email.
- Voir les messages d'erreur dans l'interface. (Email deja pris par exemple)
- Page de configuration pour configurer le mot de passe mère (et d'autres paramètres à definir plus tard).
- Bouton de déconnexion.


### Thihinane
- Gérer le stockage sécurisé des mots de passes en utilisant une encryption AES, faisable avec l'API window.crypto
- Stocké la clé AES dans un fichier sécurisé, voir window.crypto.subtle.exportKey et window.crypto.subtle.importKey
- Les mots de passes doivent etre stocké sous la forme : "username;mdp;url", on pourrait les concaténés puis les encryptés tous ensemble par exemple. Dans tous 
les cas on doit avoir les 3 données de dispo : username (un email, un num de tel, un nom d'utilisateur...), un mot de passe et l'url du site associé. L'url pourrait etre de la forme www.example.com/* , pour que le mot de passe soit associé à tout les url du nom de domaine example.com.

