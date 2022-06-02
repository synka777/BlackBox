# ⬛ Blackbox BACKEND

## ⚠ Les prérequis
Avant de commencer, il faut s'assurer d'avoir les prérequis suivants:
- Node.js installé en version stable ou en dernière version
- Docker installé et lancé, avec la ligne de commandes activée
- Le fichier .env doit être à la racine du dossier backend/

## 🚀 Quickstart

Pour pouvoir commencer à l'utiliser, trois étapes:

#### 1. Préparation de l'environnement.

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

#### 2. Lancement du backend
Une fois que l'étape précédente est validée, on lance le projet:
```
npm run start
```
Notez, la commande échouera si:
- Le conteneur docker ne tourne pas
- Le fichier .env est manquant

#### 3. Création de données d'exemple pour faire fonctionner le projet
A défaut de pouvoir importer des données d'exemples, pour le moment il faudra importer la collection de requêtes dans postman et utiliser les endpoints de création d'articles et autres resources. (il n'y a que des articles pour le moment)

## ⚠ Remarques
Les données que vous créerez ne seront pas perdues tant que:
- vous ne supprimez pas docker de votre machine
- vous ne supprimez pas le conteneur bigchaindb
