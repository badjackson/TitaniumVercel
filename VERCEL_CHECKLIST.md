# Checklist de Déploiement Vercel

## ✅ Pré-déploiement

### Configuration Firebase
- [ ] Projet Firebase créé
- [ ] Authentication activée (Email/Password)
- [ ] Firestore Database activée
- [ ] Règles de sécurité configurées
- [ ] Variables d'environnement copiées

### Variables d'environnement Vercel
```bash
# OBLIGATOIRE - Ajouter dans Vercel Dashboard
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# FALLBACK (optionnel mais recommandé)
NEXT_PUBLIC_FB_API_KEY=
NEXT_PUBLIC_FB_AUTH_DOMAIN=
NEXT_PUBLIC_FB_PROJECT_ID=
NEXT_PUBLIC_FB_STORAGE_BUCKET=
NEXT_PUBLIC_FB_MSG_SENDER_ID=
NEXT_PUBLIC_FB_APP_ID=
```

## ✅ Post-déploiement

### Tests de base
- [ ] Page d'accueil charge sans erreur
- [ ] API health répond : `/api/health`
- [ ] Config Firebase valide : `/api/firebase-config`
- [ ] Thème sombre/clair fonctionne
- [ ] Responsive design OK

### Tests d'authentification
- [ ] Page de connexion accessible
- [ ] Connexion admin fonctionne
- [ ] Connexion juge fonctionne
- [ ] Redirection après login OK
- [ ] Déconnexion fonctionne

### Tests fonctionnels Admin
- [ ] Dashboard admin charge
- [ ] Gestion compétiteurs fonctionne
- [ ] Saisie prises fonctionne
- [ ] Calculs live fonctionnent
- [ ] Exports CSV/PDF fonctionnent
- [ ] Gestion juges fonctionne

### Tests fonctionnels Juge
- [ ] Dashboard juge charge
- [ ] Saisie prises secteur fonctionne
- [ ] Saisie grosse prise fonctionne
- [ ] Mode hors ligne fonctionne
- [ ] Synchronisation fonctionne

### Tests pages publiques
- [ ] Classements en temps réel
- [ ] Carte interactive secteurs
- [ ] Statistiques live
- [ ] Sponsors s'affichent
- [ ] Stream live fonctionne

### Tests de performance
- [ ] Temps de chargement < 3s
- [ ] Images optimisées
- [ ] Bundle size raisonnable
- [ ] Pas d'erreurs console
- [ ] Pas de memory leaks

## 🚨 Problèmes courants et solutions

### Erreur "Firebase not initialized"
```bash
# Vérifier les variables d'environnement
curl https://your-app.vercel.app/api/firebase-config
```

### Erreur "Module not found"
```bash
# Vérifier les imports dynamiques
# Tous les composants avec état client sont en dynamic import
```

### Erreur "Hydration mismatch"
```bash
# Vérifier les composants SSR
# Utiliser mounted state pour les composants client-only
```

### Erreur "Memory leak"
```bash
# Vérifier les useEffect cleanup
# Tous les timers et listeners sont nettoyés
```

### Erreur "Build timeout"
```bash
# Optimiser les imports
# Utiliser dynamic imports pour les gros composants
```

## 📊 Monitoring post-déploiement

### Logs Vercel
- Surveiller les erreurs de build
- Vérifier les erreurs runtime
- Monitorer les performances

### Firebase Console
- Vérifier les connexions Auth
- Surveiller l'utilisation Firestore
- Contrôler les règles de sécurité

### Tests utilisateur
- Tester sur mobile/desktop
- Vérifier les fonctionnalités critiques
- Valider les exports/imports

## 🔧 Optimisations recommandées

### Performance
- [ ] Images WebP activées
- [ ] Compression Vercel activée
- [ ] CDN Vercel configuré
- [ ] Cache headers optimisés

### Sécurité
- [ ] Headers de sécurité configurés
- [ ] HTTPS forcé
- [ ] Variables sensibles sécurisées
- [ ] Règles Firestore strictes

### Monitoring
- [ ] Analytics configurées
- [ ] Error tracking activé
- [ ] Performance monitoring
- [ ] Uptime monitoring

---

**🎯 Objectif : 100% des fonctionnalités préservées sur Vercel**