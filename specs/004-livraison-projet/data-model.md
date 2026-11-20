# État

GameProject, GameFile et le profil gardent leurs formats. DeliveryAction décrit publish, playLevel(levelId), build(target) ou deployAndroid. Le suivi Android reste transitoire. AndroidDeploymentEvent ajoute requestId aux phases/messages du transport ; aucune identité de requête n’est enregistrée dans le projet. ProjectSession garde la propriété des tokens et époques de fichiers.
