# PayCash Mobile (mobile_flutter)

Application Flutter de transfert d'argent (PayCash). Ecran de saisie du numero + montant, calcul des frais, resume de la transaction puis initiation du paiement.

## Architecture

```
lib/
  core/
    di/injection_container.dart       # get_it (Dio, Service, Repo, Bloc)
    theme/app_colors.dart             # Toutes les couleurs de l'app
    utils/format.dart                 # Formatage montant / taux
  features/
    payment/
      data/
        models/                       # FeeCalculation, TransactionResult
        services/payment_service.dart # Appels HTTP vers l'API NestJS
        repositories/payment_repository.dart
      presentation/
        bloc/                         # payment_bloc / _event / _state
        screens/
          payment_screen.dart         # Saisie numero + montant
          fee_summary_screen.dart     # Resume des frais + confirmation
```

Flow : `Vue` -> `Bloc` -> `Repository` -> `Service` (Dio) -> API NestJS.

## Prérequis

- Flutter (SDK `^3.11.4`)
- Le backend NestJS lancé en local sur le port **4000**
- (Optionnel) Un téléphone Android avec le debogage USB activé

## Lancer l'application

### Emulateur Android / iOS simulator / Desktop / Web

L'URL de l'API est `http://localhost:4000/api` par defaut. Sur ces cibles, `localhost` designe bien votre machine :

```bash
flutter pub get
flutter run
```

### Telephono physique Android (via cable USB)

Sur un telephone physique, `localhost:4000` pointe vers le **telephone lui-meme** et non vers votre machine. Le plus simple est d'utiliser `adb reverse` pour rediriger le port local du telephone vers votre machine **via le cable USB** :

```bash
# 1. Telephono branche en USB + debogage USB active
# 2. Rediriger le port 4000 du telephone vers votre machine
adb reverse tcp:4000 tcp:4000
# => reponse attendue : 4000 (commande reussie)

# 3. Lancer l'application
flutter run
```

Notes importantes :

- La redirection est active tant que le telephone reste branche. Il faut retaper `adb reverse tcp:4000 tcp:4000` a chaque rebranchement.
- Avec cette methode, aucune IP reseau n'est a connaitre : tout passe par le cable USB (pas besoin de WiFi ni de configuration reseau).
- Depuis VS Code, utilisez la configuration **"Mobile Flutter (physical phone)"** (F5) pour lancer sur le telephone.

### Telephono physique avec une IP reseau (alternative)

Si vous ne pouvez pas utiliser `adb reverse` (ex: iOS physique), passez l'IP locale de votre machine au lancement :

```bash
# Recuperer votre IP locale
ipconfig getifaddr en0   # macOS

# Lancer avec l'IP (telephone et machine sur le meme WiFi)
flutter run --dart-define=API_BASE_URL=http://<IP_MACHINE>:4000/api
```

## API

| Methode | URL | Role |
|---------|-----|------|
| POST | `/api/fees/fees/calculate` | Calcule les frais (base, taxe, total) |
| POST | `/api/transactions/transactions/initiate` | Initie la transaction |

L'authentification (Bearer token) et la `baseUrl` sont configurees dans `lib/core/di/injection_container.dart`.

## Tests

```bash
flutter analyze
flutter test
```
