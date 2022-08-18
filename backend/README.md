# ⬛ Blackbox API (BACKEND)

## ⚠️ Les prérequis
Avant de commencer, il faut s'assurer d'avoir les prérequis suivants:
- Node.js installé en version stable ou en dernière version
- Docker installé et lancé, avec la ligne de commandes activée
- Le fichier .env doit être à la racine du dossier backend/

⠀

## 🚀 Quickstart
____

## 1 - Démarrage de l'API

Pour pouvoir commencer à l'utiliser, trois étapes:

#### ETAPE 1:  Préparation de l'environnement.

Installation des packages:
```
npm install
```

Préparation du conteneur:
```
npm run setup
```
Cette commande **télécharge docker et lance le conteneur bigchaindb**, qui va répondre aux requêtes de stockage créées par le frontend (ou postman).

Dans le cas où cette commande a déjà été exécutée, elle se contentera de lancer le conteneur bigchaindb existant sur la machine.

#### ETAPE 2: Lancement du backend
Une fois que l'étape précédente est validée, on lance le projet:
```
npm run start
```
Notez, la commande échouera si:
- Le conteneur docker ne tourne pas
- Le fichier .env est manquant

#### ETAPE 3: Création de données d'exemple pour faire fonctionner le projet
A défaut de pouvoir importer des données d'exemples, pour le moment il faudra importer la collection de requêtes dans postman et utiliser les endpoints de création d'articles et autres resources. (il n'y a que des articles pour le moment)

## ⚠ Remarques
Les données que vous créerez ne seront pas perdues tant que:
- vous ne supprimez pas docker de votre machine
- vous ne supprimez pas les volumes docker qui étaient rattachés à bigchaindb

⠀
__________________________
## 2 - Interaction avec l'API

### ⚠️ Prérequis: génération de token à utiliser avec les requêtes

Avant de commencer à intéragir avec l'API il faudra générer un token en passant en body un username de type string.

Une réponse nous donne alors un token, qui est automatiquement stocké dans les cookies de postman.

Exemple:
```
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkJyYXZlIFBsYXR5cHVzIiwiaWF0IjoxNjYwODI4ODU1LCJleHAiOjE2NjA4Mzc4NTV9.Q3g3dRbpEUSgu1WrfZhAHwx6eMQ0L2ea_pemb8FuVlc; Path=/; Expires=Thu, 18 Aug 2022 15:50:55 GMT;
```

Pour réaliser les requêtes sans postman via un client de requêtes HTTP, il faudra ajouer le token dans les cookies manuellement.

| Endpoint  | localhost:9229/token/generate/  |
| ------------ | ------------ |
| Méthode  |  POST |

```
{
    "username":"Brave Platypus"
}
```
⠀
### 🔨 Création d'articles

La création d'articles se fait simplement avec le format d'objet suivant.
Remarques:
- Un champ date est ajouté automatiquement lors de l'écriture de l'article en base de données.
- Un id (tetherId) permettant de lier les données et métadonnées d'article est également ajouté.

| Endpoint  | localhost:9229/article/create/ |
| ------------ | ------------ |
| Méthode  |  POST |
```
{
    "data": {
        "title" : "Foluptate velit esse cillum",
        "content" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "author" : "Brave Platypus"
    },
    "metadata" : {
        "category": "Training",
        "nsfw" : true
    }
}
```
⠀
### 🔍 Recherche d'articles

La recherche d'articles peut se faire:
- sans aucun paramètre (= get all articles)
- avec un terme de recherche (keyword)
- par catégorie d'articles
- en incluant les résultats de recherche pouvant inclure des résultats choquants ou non (nsfw)

| Endpoint  | localhost:9229/article/search/  |
| ------------ | ------------ |
| Méthode  |  POST |

```
{
    "keyword": "evolution",
    "nsfw": false,
    "category": "lifestyle"
}
```
⠀
### ⬆️ Mise à jour du score d'articles

Pour mettre à jour un article donné, il faut connaître son tetherId.
Pour ce faire, il suffit d'effectuer une recherche pour obtenir ce tetherId ou bien le récupérer dans la réponse de la création de l'article en question.

Les actions permettent de définir si on souhaite augmenter le score d'un article ou le baisser (un peu comme le système de Reddit).
Les clés possibles dans les actions sont 'upvote' et 'downvote', et ces deux clés doivent avoir des valeurs différentes. Les valeurs de ces clés sont de type booléen.

| Endpoint  | localhost:9229/article/score/  |
| ------------ | ------------ |
| Méthode  |  POST |
```
{
    "tetherId":"jrbq8NH3i",
    "actions": {
        "upvote":true,
        "downvote":false
    }
}
```
⠀
### 🗳️ Soumission de vote pour modification de métadonnées d'article

La gestion des articles se faisant de manière communautaire sans aucun administrateur, super utilisateur ou gérant, seule la modification du score d'article peut se faire par l'action d'un utilisateur unique.

Les autres actions sont soumises à un système de votes, pour s'assurer que les modifications demandées sont bien légitimes et validées par la communauté.
Les actions en question sont:
- Changement de la catégorie d'un article, dans le cas où il aurait été mal classé à sa création
- Mise en corbeille d'un article (via le flag 'trash')
- Signalement d'un article comme contenu sensible (via le flag nsfw)

Les seuils à atteindre pour les votes sont réglables dans le fichier .env qui devra être présent à la racine du projet backend.

| Endpoint  | localhost:9229/vote/  |
| ------------ | ------------ |
| Méthode  |  POST |
```
{
    "tetherId":"jrbq8NH3i",
    "votes": {
        "category": "Innovation",
        "trash": false,
        "nsfw": false
    }
}
```