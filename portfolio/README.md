# Maya Di Pietro — Portfolio

Site statique (HTML / CSS / JavaScript), trilingue EN / FR / IT. Typographie : Alaska (dossier `fonts/`).
Aucun outil à installer : GitHub Pages publie ces fichiers tels quels.

## Contenu du dossier

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | la page du site (doit rester à la racine) |
| `css/style.css` | le style |
| `js/main.js` | animations et interactions |
| `js/content.js` | tous les textes (EN / FR / IT) + e-mail et téléphone |
| `assets/img/` | toutes les images |
| `fonts/` | la typo Alaska (Regular + SemiBold) |
| `.nojekyll` | dit à GitHub de publier les fichiers tels quels (fichier invisible, pas grave s'il manque) |

## Publier sur GitHub (étape par étape)

1. **Dézippe** le fichier `portfolio-github.zip` sur ton ordinateur. Tu obtiens un dossier avec `index.html`, `css`, `js`, `assets`, `fonts`.
2. Sur github.com : **New repository**. Nom : par exemple `portfolio`. Choisis **Public**. Clique **Create repository**.
3. Sur la page du dépôt vide, clique **uploading an existing file**.
4. Ouvre le dossier dézippé, **sélectionne tout son contenu** (`index.html`, `css`, `js`, `assets`, `fonts`, `README.md`) et **glisse-le dans la fenêtre GitHub**.
   - ⚠️ Ne dépose pas le fichier .zip lui-même : GitHub ne le décompresse pas.
   - ⚠️ `index.html` doit être directement à la racine du dépôt, pas dans un sous-dossier.
5. Attends que tout soit envoyé (environ 80 fichiers), puis clique **Commit changes**.
6. Va dans **Settings → Pages**. Dans « Build and deployment », choisis **Source : Deploy from a branch**, puis **Branch : main** et **/ (root)**, et clique **Save**.
7. Attends 1 à 3 minutes, puis recharge la page Settings → Pages : l'adresse du site apparaît en haut (`https://ton-nom.github.io/portfolio/`).

## Si ça ne marche pas

- **Page blanche ou 404** : vérifie que `index.html` est bien visible à la racine du dépôt (dans la liste des fichiers, sans dossier devant), et que Pages est activé (étape 6). Patiente 3 minutes.
- **On voit ce README au lieu du site** : Pages n'est pas encore activé, ou `index.html` n'est pas à la racine.
- **Pas de style, pas d'images** : les dossiers `css`, `js`, `assets` n'ont pas été envoyés. Dans le dépôt, tu dois voir ces dossiers. Si un dossier manque, envoie-le avec **Add file → Upload files**.
- **Mauvaise police** : le dossier `fonts/` manque. Il doit contenir `Alaska-Regular.woff2` et `Alaska-SemiBold.woff2`.
- **Trop de fichiers d'un coup** : GitHub accepte environ 100 fichiers par envoi. Envoie d'abord `index.html`, `css`, `js` et `fonts`, puis `assets` dans un second envoi (Add file → Upload files).
- **Après une modification** : remplace le fichier concerné dans le dépôt (Add file → Upload files, même nom), puis recharge le site avec Cmd + Maj + R.

## Modifier le site

- Un texte (EN / FR / IT), ton e-mail, ton téléphone : `js/content.js`.
- Une couleur de projet : `index.html` → `data-bg` et `data-fg` de la `<section>` du projet.
- Le style en général : `css/style.css`.
