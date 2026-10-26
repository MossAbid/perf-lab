# Serveur statique pour le test local et l'e2e : comme `python3 -m http.server`,
# avec une file d'attente de connexions de 128 au lieu de 5. Avec 5, Chrome qui
# charge plus de 5 scripts en parallèle se voit refuser des connexions au hasard
# (script manquant → e2e instable).
# Écoute sur 127.0.0.1 seulement : content/ (cycles privés) et .git ne sont pas
# exposés au réseau local.
# Lancer :  python3 tools/serve.py 8741   (à la racine du dépôt)
import http.server, sys
http.server.ThreadingHTTPServer.request_queue_size = 128
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8741
http.server.ThreadingHTTPServer(("127.0.0.1", port), http.server.SimpleHTTPRequestHandler).serve_forever()
