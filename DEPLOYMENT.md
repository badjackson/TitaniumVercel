# Déploiement Vercel - Titanium Tunisia Open

## Configuration Firebase pour Vercel

### Variables d'environnement requises

Dans Vercel Dashboard → Settings → Environment Variables, ajoutez :

```bash
# Configuration Firebase (OBLIGATOIRE)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Configuration alternative (fallback)
NEXT_PUBLIC_FB_API_KEY=your_api_key_here
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
NEXT_PUBLIC_FB_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FB_MSG_SENDER_ID=123456789
NEXT_PUBLIC_FB_APP_ID=1:123456789:web:abcdef123456
```

### Étapes de déploiement

1. **Préparer Firebase**
   ```bash
   # Dans Firebase Console
   - Créer le projet Firebase
   - Activer Authentication (Email/Password)
   - Activer Firestore Database
   - Configurer les règles de sécurité (voir RULES_DEV.md ou RULES_PROD.md)
   ```

2. **Configurer Vercel**
   ```bash
   # Connecter le repo GitHub à Vercel
   # Ajouter les variables d'environnement Firebase
   # Déployer automatiquement
   ```

3. **Initialiser les données**
   ```bash
   # Après déploiement, aller sur :
   https://your-app.vercel.app/admin/tools/seed-judges
   
   # Suivre les instructions pour :
   - Créer les comptes Firebase Auth
   - Initialiser la collection judges
   - Attacher les UIDs
   ```

## Fonctionnalités préservées

✅ **Admin Dashboard**
- Gestion complète des compétiteurs
- Saisie des prises (H1-H7)
- Gestion des grosses prises
- Calculs en temps réel
- Exports CSV/PDF
- Gestion des juges

✅ **Judge Dashboard**
- Saisie sectorielle des prises
- Saisie des grosses prises
- Mode hors ligne avec synchronisation
- Interface optimisée mobile

✅ **Public Pages**
- Classements en temps réel
- Carte interactive des secteurs
- Diffusion live
- Sponsors dynamiques
- Responsive design

✅ **Fonctionnalités techniques**
- Authentification Firebase
- Base de données Firestore
- Synchronisation temps réel
- Mode hors ligne
- Protection du contenu
- Thème sombre/clair
- PWA ready

## Vérification post-déploiement

1. **Santé de l'application**
   ```
   GET https://your-app.vercel.app/api/health
   ```

2. **Configuration Firebase**
   ```
   GET https://your-app.vercel.app/api/firebase-config
   ```

3. **Test des fonctionnalités**
   - [ ] Page d'accueil charge correctement
   - [ ] Connexion admin/juge fonctionne
   - [ ] Classements s'affichent en temps réel
   - [ ] Saisie des données fonctionne
   - [ ] Exports PDF/CSV fonctionnent
   - [ ] Mode hors ligne fonctionne

## Optimisations Vercel

- **SSR désactivé** pour les composants avec état client
- **Dynamic imports** pour réduire le bundle initial
- **Lazy loading** des composants lourds
- **Error boundaries** pour la robustesse
- **Memory leaks** prévenus avec cleanup
- **Bundle splitting** automatique
- **Edge functions** ready

## Sécurité

- Headers de sécurité configurés
- Protection CSRF
- Validation côté client et serveur
- Règles Firestore strictes
- Variables d'environnement sécurisées

## Performance

- Images optimisées avec Next.js Image
- Fonts optimisés
- CSS optimisé avec Tailwind
- JavaScript tree-shaking
- Compression automatique Vercel

## Support

En cas de problème :
1. Vérifier les logs Vercel
2. Tester l'API health
3. Vérifier la configuration Firebase
4. Consulter la console Firebase pour les erreurs