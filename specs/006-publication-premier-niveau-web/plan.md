# Plan de publication du premier niveau

1. Réutiliser ProjectDelivery et le preload pour enregistrer le projet et lancer l’action. Le processus Electron sélectionne le premier niveau de la campagne et réutilise la publication Studio vers une copie de Godot.
2. LunariaWebsite possède l’export Godot Web et vérifie le nouveau paquet avant son installation locale. Le joueur voit les paramètres de cet export. Le contrat de campagne Studio → Godot reste inchangé.
3. La confirmation intervient après construction. Le script du site peut activer une release composée de la vitrine déjà en ligne et du nouveau paquet. Il utilise le verrou SSH existant, vérifie les empreintes et remet l’ancien lien si le contrôle HTTP échoue.
4. Vérifier le choix du niveau, le pont Electron, la production d’un export réel dans un dossier isolé et l’activation dans un environnement de test sans publication publique.
