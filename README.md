# Requêtes HTTP pour intéragir avec l'API

## Création de bot
Requête POST à l'URL
````url
http://localhost:8080/api/v1/workers/
````
body de la requête : 
````json
{  
    "workerName" : "Bot1"  
}
````
Le token est automatiquement attribué en fonction des bots déjà instanciés.  

## Suppression de bot
Requête DELETE à l'URL
````url
http://localhost:8080/api/v1/workers/workerName/Bot1
````
Il n'y a aucun body à cette requête

## Récupération des bots instaciés
Requête GET à l'URL
````url
http://localhost:8080/api/v1/workers/
````
Il n'y a aucun body à cette requête

## Récupération d'un bot grâce à son nom
Requête GET à l'URL
````url
http://localhost:8080/api/v1/workers/workerName/Bot1
````
Il n'y a aucun body à cette requête

## Récupération des logs d'un bot entre deux dates et heures choisies
Requête GET à l'URL
````url
http://localhost:8080/api/v1/workers/workerName/Bot1/logs
````
body de la requête
````json
{
    "startDate": "2024-05-21T09:58:00",
    "endDate": "2024-05-21T10:02:00"
}
````
Exemple de retour : 
````json
[
    {
        "timestamp": "Tue May 21 2024 10:01:42",
        "message": "setStatus to activated, current is installed "
    },
    {
        "timestamp": "Tue May 21 2024 10:01:50",
        "message": "setStatus to dnd, current is activated "
    }
]
````

## Récupération des conversations d'un bot entre deux dates et heures choisies
Requête GET à l'URL
````url
http://localhost:8080/api/v1/workers/workerName/Bot1/convs
````
body de la requête : 
````json
{
    "startDate": "2024-05-21T07:58:00",
    "endDate": "2024-05-21T16:02:00"
}
````
Exemple de retour :
````json
[
    {
        "timestamp": "Tue May 21 2024 14:59:12",
        "message": ".nagazakii : Hi"
    },
    {
        "timestamp": "Tue May 21 2024 14:59:12",
        "message": "Bot : That is interesting. Please continue."
    }
]
````

## Modification du statut d'un bot
Requête PATCH à l'URL
````url
http://localhost:8080/api/v1/workers/workerName/Bot1
````
body de la requête : 
````json
{
    "status" : "activated"
}
````
En "activated", le bot répond normalement aux messages de l'utilisateur.
````json
{
    "status" : "idle"
}
````
En "idle", le bot est absent et ne répond pas aux messages.
````json
{
    "status" : "dnd"
}
````
En "do not disturb", le bot indique qu'il n'est pas disponible quand il est taggé dans le chat.


