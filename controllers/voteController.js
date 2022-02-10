const utils = require('../kernel/utils')
const mongoose = require('mongoose')

/* ce fichier va inclure les fonctions Create, Read, Update et Delete des votes qui seront créées dans IPDB.
la fonction delete ne sera pas accessible par des endpoints, elle ne sera là qu'en cas de besoin
pour gérer le contenu de la DB.*/ 

// Pas de fonctions IPFS a créér car les votes ne seront pas comptabilisés sur IPFS.