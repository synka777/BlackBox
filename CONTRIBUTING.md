

#### QUICKSTART:
##### 1/ Cloner le projet:
git clone https://github.com/Plaquettes-G5/Plaquettes-estiam.git

##### Le projet est cloné sur ma machine, maintenant je fais quoi?

Installation des dépendances pour faire tourner le projet:
`npm i`

Ensuite, je colle le fichier .env à la racine du dossier du projet.
Ce fichier contient les variables d'environnement nécessaires à la connexion à la base de données sur laquelle tourne le projet.
`Pourquoi on ne met pas les infos de connexions directement dans le code? Parce que les informations de connexion à une base de donnée ne sont pas des infos qui doivent être commitées sur un repository, elles sont trop confidentielles pour être mises à disposition de tout le monde..`

Une fois le fichier .env placé dans le projet, je le lance:
`npm run start`

Quand le projet est lancé, il tourne sur le port 3000: localhost:3000

##### 2/ Pour développer:

Le mieux est de créer une branche pour chaque fonction majeure.
###### Avant de commencer à développer:
Création de nouvelle branche:
`git branch my-branch`
Quand ma branche est créée, je vais dessus pour développer:
`git checkout my-branch`

###### 3/ Pendant que je développe ma fonction:

Quand je suis satisfait de mon code, j'ajoute les modifs en staging:
`git add --all`
Puis je commit les changements mis en staging, avec un message de commit clair qui résume ce qui a été fait, exemple:
`git commit -m "fonction en cours de développement: authentification de base Ok"`

###### 4/ Lorsque ma fonction est terminée:

Une fois que la fonction que je développe est terminée, je merge la branche avec la branche master.
Je me place sur la branche master:
`git checkout master`
Puis je merge la branche où j'ai développé:
`git merge my-branch`

Après m'être assuré que le code tourne toujours après le merge, je push mes changements sur github:
`git push`

