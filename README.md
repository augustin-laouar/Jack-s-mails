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
- Page de configuration pour configurer le mot de passe mère + possibilite d'export le compte(et d'autres paramètres à definir plus tard).
- Gestion de la premiere connexion : si pas de mdp enregistre -> première conn donc rediriger vers page + suppr tout les mdps / emails par securite. Par la suite peut etre faire un moyen de recup donnée corompus.
- rename verify auth et fix bug
- Une seule variable pour les adresses mails/mdp (list format json) -> a voir plus tard
- Une seule clé (la clé générer avc le mdp)


### Thinhinane 
- Gérer le stockage sécurisé des mots de passes en utilisant une encryption AES, fesable avec l'API window.crypto
- Stocker la clé AES dans un fichier sécurisé, voir window.crypto.subtle.exportKey et window.crypto.subtle.importKey
- Les mots de passes doivent etre stocké sous la forme : "username;mdp;url", on pourrait les concaténés puis les encryptés tous ensemble par exemple. Dans tous les cas on doit avoir les 3 données de dispo : username (un email, un num de tel, un nom d'utilisateur...), un mot de passe et l'url du site associé. L'url pourrait etre de la forme www.example.com/* , pour que le mot de passe soit associé à tout les url du nom de domaine example.com.

