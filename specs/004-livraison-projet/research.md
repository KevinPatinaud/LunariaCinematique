# Recherche

- Quatre chemins de GameEditor répètent préparation, sauvegarde puis appel. Le prop onBeforePublish ne fait que blur/true ; ProjectSession.run valide déjà le champ.
- saveCurrent conserve les modifications arrivées pendant IO en dirty ; lire session.project après cette attente pouvait livrer un état non enregistré.
- L’abonnement Android permanent modifie le message global sans requête active. Une identité de transport est nécessaire pour distinguer un ancien événement pendant une nouvelle opération.
- Le catch de saveCurrent lisait le token courant et pouvait appliquer un conflit après changement d’époque. Capturer le token et contrôler l’époque de part et d’autre de l’inspection.
- Alternatives écartées : verrou dupliqué, save() imbriqué dans run(), déplacement cosmétique des callbacks, suppression du suivi ou réintroduction d’un ancien format.
