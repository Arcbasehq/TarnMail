export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    /* Nav */
    "nav.about": "About us",
    "nav.pricing": "Pricing",
    "nav.business": "Business",
    "nav.features": "Features",
    "nav.blog": "Blog",
    "nav.support": "Support",
    "nav.tryFree": "Try it for free",
    "nav.login": "Log in",
    "nav.language": "English",

    /* Hero */
    "hero.heading1": "Every inbox,",
    "hero.heading2": "kept deep and quiet",
    "hero.subtext":
      "tarnmail gathers Gmail, Outlook and Yahoo into a single encrypted client. Read, search and reply across every account at once. We can't read it, and we never sell it.",
    "hero.passwordless": "No password needed. See",
    "hero.howWeProtect": "how we protect your mail",
    "hero.cta": "Connect your inbox",

    /* Hero Visual */
    "heroVisual.inbox": "Inbox",
    "heroVisual.drafts": "Drafts",
    "heroVisual.sent": "Sent",
    "heroVisual.trash": "Trash",
    "heroVisual.spam": "Spam",
    "heroVisual.workFolder": "Work Folder",
    "heroVisual.compose": "Compose",
    "heroVisual.manageFolders": "Manage Folders",
    "heroVisual.reply": "Reply",
    "heroVisual.forward": "Forward",
    "heroVisual.from": "From: Dana Whitlock <dana@workmail.com>",
    "heroVisual.to": "To: you (across 3 connected accounts)",
    "heroVisual.encrypted": "Token encrypted at rest. We never read this",
    "heroVisual.emailGreeting": "Hi,",
    "heroVisual.emailBody":
      "Pulling the roadmap into one thread so it stops scattering across inboxes. Latest notes attached — reply from here and it still lands from your real address.",
    "heroVisual.emailThanks": "Thanks",
    "heroVisual.emailSignoff": "Dana",
    "heroVisual.attachment": "roadmap-Q3.pdf (38.2KB)",

    /* Trust Band */
    "trust.noTracking": "No ad tracking, no profiling",
    "trust.allInOne": "Gmail, Outlook and Yahoo in one place",
    "trust.oauthOnly": "OAuth only. Passwords never stored",
    "trust.encryptedTokens": "Encrypted tokens you can revoke anytime",

    /* Features */
    "features.sectionLabel": "The client",
    "features.heading": "Your mail, gathered into still water.",
    "features.unifiedInbox": "Unified inbox",
    "features.unifiedDesc":
      "Gmail, Outlook and Yahoo threaded together in one timeline or filtered per account in a click.",
    "features.replyNatively": "Reply natively",
    "features.replyDesc":
      "Compose and send through each provider's own pipeline, so your mail still lands from your real address.",
    "features.passwordFree": "Password-free connect",
    "features.passwordFreeDesc":
      "We use OAuth. You authorize at Google or Microsoft directly. tarnmail never sees your password.",
    "features.searchEverything": "Search everything",
    "features.searchDesc":
      "Full-text search across every connected account at once. One query, every inbox.",
    "features.encrypted": "Encrypted at rest",
    "features.encryptedDesc":
      "Access tokens are encrypted in storage and scoped to exactly what's needed. Revoke in one tap.",
    "features.noSurveillance": "No surveillance",
    "features.noSurveillanceDesc":
      "No ad profiling, no content mining, no selling. The product is the client.",

    /* Security */
    "security.sectionLabel": "Security model",
    "security.heading": "OAuth access, encrypted tokens, least privilege.",
    "security.desc":
      "tarnmail connects to your providers through their official OAuth flows. We store a scoped, encrypted access token. Never your password. You can revoke that link from your Google or Microsoft account at any time.",
    "security.auth": "OAuth 2.0 authorized at the provider, never on our forms",
    "security.store": "Tokens encrypted at rest, row-level isolated per user",
    "security.scope": "Least-privilege scopes: read + send only what you grant",
    "security.transport": "TLS everywhere, signed short-lived download URLs",
    "security.control": "Disconnect any account instantly. Tokens purged",

    /* Pricing */
    "pricing.sectionLabel": "Pricing",
    "pricing.heading": "Pay for software, not with your inbox.",
    "pricing.tarnName": "Tarn",
    "pricing.tarnPrice": "Free",
    "pricing.tarnNote": "for one account",
    "pricing.tarnFeat1": "1 connected account",
    "pricing.tarnFeat2": "Unified timeline",
    "pricing.tarnFeat3": "Full-text search",
    "pricing.tarnFeat4": "Encrypted tokens",
    "pricing.tarnCta": "Start free",
    "pricing.deepName": "Deep",
    "pricing.deepPrice": "$5",
    "pricing.deepNote": "per month",
    "pricing.deepFeat1": "Up to 5 accounts",
    "pricing.deepFeat2": "Cross-account search",
    "pricing.deepFeat3": "Send from any address",
    "pricing.deepFeat4": "Priority sync",
    "pricing.deepFeat5": "1 GB attachments",
    "pricing.deepCta": "Connect inbox",
    "pricing.fathomName": "Fathom",
    "pricing.fathomPrice": "$12",
    "pricing.fathomNote": "per month",
    "pricing.fathomFeat1": "Unlimited accounts",
    "pricing.fathomFeat2": "Team aliases",
    "pricing.fathomFeat3": "10 GB attachments",
    "pricing.fathomFeat4": "Audit log",
    "pricing.fathomFeat5": "Priority support",
    "pricing.fathomCta": "Go Fathom",
    "pricing.mostChosen": "Most popular",

    /* Final CTA */
    "cta.heading": "Bring every inbox to the surface.",
    "cta.subtext":
      "Connect your first account in under a minute. No password ever leaves the provider.",
    "cta.button": "Connect your inbox",

    /* Footer */
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.changelog": "Changelog",
    "footer.status": "Status",
    "footer.company": "Company",
    "footer.about": "About",
    "footer.blog": "Blog",
    "footer.contact": "Contact",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.security": "Security",

    /* Cookie banner */
    "cookies.title": "We value your privacy",
    "cookies.body":
      "We use a privacy-friendly analytics cookie to understand how the site is used. Essential cookies keep tarnmail working.",
    "cookies.learnMore": "Read our Privacy Policy",
    "cookies.acceptAll": "Accept all",
    "cookies.essential": "Reject non-essential",
    "cookies.customize": "Customize",
    "cookies.customizeTitle": "Cookie preferences",
    "cookies.customizeBody":
      "Choose which cookies tarnmail may use. You can change this anytime.",
    "cookies.cat.essential": "Strictly necessary",
    "cookies.cat.essentialDesc":
      "Required for the site to function. Cannot be turned off.",
    "cookies.cat.analytics": "Analytics",
    "cookies.cat.analyticsDesc":
      "Privacy-friendly usage stats that help us improve tarnmail.",
    "cookies.alwaysOn": "Always on",
    "cookies.cancel": "Cancel",
    "cookies.savePrefs": "Save preferences",

    "footer.tagline":
      "Private email, fast search, zero tracking.",
    "footer.madeFor": "Made for people who check email twice a day.",
    "footer.copyright": "(c) {year} tarnmail",

    /* Login */
    "login.title": "Sign in",
    "login.subtitle":
      "Connect with your mail provider. We never see your password.",
    "login.continueWith": "Continue with {provider}",
    "login.agreement":
      "By continuing you agree to the Terms and Privacy Policy. Access can be revoked at any time from your provider account.",
    "login.error.linked":
      "That email is already linked to a different sign-in.",
    "login.error.denied": "Access was denied. Please try again.",
    "login.error.config": "Auth is not fully configured yet.",
    "login.error.default": "Couldn't sign in. Please try again.",

    /* Admin */
    "admin.users.title": "Users",
    "admin.users.count": "{count} registered",
    "admin.users.email": "Email",
    "admin.users.name": "Name",
    "admin.users.linked": "Linked",
    "admin.users.joined": "Joined",

    /* Inbox */
    "inbox.title": "Inbox",
    "inbox.new": "New message",
    "inbox.more": "Less",
    "inbox.storage": "0.3 GB / 15 GB used",
    "heroVisual.starred": "Starred",
    "heroVisual.archive": "Archive",
    "heroVisual.allMail": "All mail",

    /* Settings */
    "settings.search": "Search settings",
    "settings.inbox": "Inbox",
    "settings.groupAccount": "Account",
    "settings.groupApp": "tarnmail",
    "settings.home": "Home",
    "settings.account": "Account",
    "settings.language": "Language",
    "settings.appearance": "Appearance",
    "settings.privacy": "Security and privacy",
    "settings.about": "About",
    "settings.yourAccount": "Your account",
    "settings.signedIn": "Signed in",
    "settings.signedInDesc": "The Google account connected to tarnmail.",
    "settings.connectedGoogle": "Connected via Google",
    "settings.signOut": "Sign out",
    "settings.permissions": "Permissions",
    "settings.permissionsDesc":
      "Re-authorize if you change what tarnmail can access.",
    "settings.reconnect": "Reconnect Google account",
    "settings.storage": "Storage",
    "settings.storageDesc": "Your Google quota, shared with Drive and Photos.",
    "settings.storageUnavailable": "Storage unavailable.",
    "settings.signInAgain": "Sign in again",
    "settings.grantDrive": "to grant Drive access.",
    "settings.usedOf": "{used} of {total} used",
    "settings.usedUnlimited": "{used} used \u00b7 unlimited",
    "settings.interfaceLang": "Interface language",
    "settings.interfaceLangDesc":
      "Choose the language for the tarnmail interface.",
    "settings.appearanceDesc": "Customize how tarnmail looks.",
    "settings.density": "Density",
    "settings.densityDesc": "How tightly messages are packed in the list.",
    "settings.comfortable": "Comfortable",
    "settings.compact": "Compact",
    "settings.showAvatars": "Sender avatars",
    "settings.showAvatarsDesc":
      "Show colored avatar initials in the list and messages.",
    "settings.showFavicons": "Sender site icons",
    "settings.showFaviconsDesc":
      "Show each sender's real website icon instead of initials.",
    "settings.blockImages": "Block remote images",
    "settings.blockImagesDesc":
      "Stop tracking pixels by blocking images until you load them.",
    "settings.confirmDelete": "Confirm before deleting",
    "settings.confirmDeleteDesc": "Ask before moving conversations to Trash.",
    "settings.privacyTracking": "Tracking & content",
    "settings.privacyTrackingDesc": "Control what senders can see and load.",
    "settings.stripTracking": "Strip tracking links",
    "settings.stripTrackingDesc":
      "Remove tracking parameters (utm_*, fbclid, gclid…) from links before they open.",
    "settings.hideSenderEmail": "Hide sender addresses",
    "settings.hideSenderEmailDesc":
      "Show only the sender's name, not their raw email address.",
    "settings.security": "Security",
    "settings.securityDesc": "Extra confirmations before risky actions.",
    "settings.openLinksNewTab": "Open links in a new tab",
    "settings.openLinksNewTabDesc":
      "Keep tarnmail open by opening email links in a separate tab.",
    "settings.warnLinks": "Warn before external links",
    "settings.warnLinksDesc":
      "Show the destination and confirm before opening links in messages.",
    "settings.confirmUnsub": "Confirm unsubscribe",
    "settings.confirmUnsubDesc":
      "Ask before opening a sender's unsubscribe link.",
    "settings.confirmSend": "Confirm before sending",
    "settings.confirmSendDesc":
      "Ask for confirmation before a message is sent.",
    "settings.privacyGlance": "Privacy at a glance",
    "settings.howProtect": "How tarnmail protects you",
    "settings.factOauth": "OAuth only",
    "settings.factOauthDesc":
      "You authorize at Google directly \u2014 tarnmail never sees your password.",
    "settings.factTokens": "Encrypted tokens",
    "settings.factTokensDesc":
      "Access tokens are stored encrypted and scoped to least privilege.",
    "settings.factTracker": "Tracker protection",
    "settings.factTrackerDesc":
      "Remote images in emails are blocked by default to stop tracking pixels.",
    "settings.factNoSurv": "No surveillance",
    "settings.factNoSurvDesc":
      "No ad profiling, no content mining, nothing sold.",
    "settings.groupMail": "Mail",
    "settings.messages": "Messages",
    "settings.theme": "Theme",
    "settings.themeDesc":
      "Use a light or dark interface, or follow your system.",
    "settings.themeLight": "Light",
    "settings.themeDark": "Dark",
    "settings.themeSystem": "System",
    "settings.accentColor": "Accent color",
    "settings.accentColorDesc":
      "Pick the highlight color used across tarnmail.",
    "settings.fontSize": "Font size",
    "settings.fontSizeDesc": "Adjust the overall text size.",
    "settings.fontSmall": "Small",
    "settings.fontDefault": "Default",
    "settings.fontLarge": "Large",
    "settings.snippets": "Message previews",
    "settings.snippetsDesc": "Show a snippet of each message in the list.",
    "settings.unreadBold": "Bold unread",
    "settings.unreadBoldDesc": "Show unread conversations in bold text.",
    "settings.clock12h": "12-hour clock",
    "settings.clock12hDesc": "Show times as 1:30 PM instead of 13:30.",
    "settings.showFolderCounts": "Folder counts",
    "settings.showFolderCountsDesc":
      "Show the number of messages in each folder sidebar.",
    "settings.splitView": "Split view",
    "settings.splitViewDesc":
      "Show email list and message side by side when reading.",
    "settings.markRead": "Mark as read on open",
    "settings.markReadDesc": "Mark a conversation read when you open it.",
    "settings.perPage": "Messages to load",
    "settings.perPageDesc": "How many conversations to fetch per folder.",
    "settings.defaultFolder": "Default folder",
    "settings.defaultFolderDesc": "The folder shown when you open tarnmail.",
    "settings.signature": "Signature",
    "settings.signatureDesc": "Appended to the bottom of messages you compose.",
    "settings.signaturePlaceholder": "Sent from tarnmail",
    "settings.save": "Save",
    "settings.saved": "Saved",
    "settings.behavior": "Behavior",
    "settings.reset": "Reset settings",
    "settings.resetDesc": "Restore all settings to their defaults.",
    "settings.resetBtn": "Reset to defaults",

    /* Compose */
    "compose.title": "New message",
    "compose.to": "To",
    "compose.subject": "Subject",
    "compose.body": "Write your message…",
    "compose.attach": "Attach",
    "compose.cancel": "Cancel",
    "compose.send": "Send",
    "compose.sending": "Sending…",
    "compose.saveDraft": "Save as draft",
    "compose.savingDraft": "Saving draft…",

    /* Inbox chrome */
    "inbox.searchPlaceholder": "Search messages",
    "inbox.unread": "Unread",
    "inbox.filter": "Filter",
    "inbox.filterAll": "All",
    "inbox.selected": "{n} selected",
    "inbox.markRead": "Mark as read",
    "inbox.markUnread": "Mark as unread",
    "inbox.delete": "Delete",
    "inbox.empty": "Your inbox is empty.",
    "inbox.nothing": "Nothing here.",
    "inbox.noMatch": "No matching messages.",
    "inbox.loadError": "Couldn't load your mail.",
    "inbox.loadMore": "Load more",
    "inbox.signedInAs": "Signed in as",
    "inbox.backToInbox": "Back to inbox",
    "inbox.deleteConfirm": "Delete {n} conversation(s)?",
    "thread.from": "From",
    "thread.to": "To",
    "thread.mailingList": "This message is from a mailing list.",
    "thread.unsubscribe": "Unsubscribe",
    "thread.reply": "Reply",
    "thread.replyAll": "Reply all",
    "thread.forward": "Forward",
    "thread.noSubject": "(no subject)",
    "thread.deleteConfirm": "Delete this conversation?",

    /* Thread */
    "thread.attachFile": "Attach file",
    "thread.placeholder": "Write a message\u2026",
    "thread.send": "Send",
    "thread.sending": "Sending\u2026",
  },

  fr: {
    /* Nav */
    "nav.about": "\u00c0 propos",
    "nav.pricing": "Tarifs",
    "nav.business": "Entreprise",
    "nav.features": "Fonctionnalit\u00e9s",
    "nav.blog": "Blog",
    "nav.support": "Assistance",
    "nav.tryFree": "Essai gratuit",
    "nav.login": "Connexion",
    "nav.language": "Français",

    /* Hero */
    "hero.heading1": "Chaque bo\u00eete,",
    "hero.heading2": "gard\u00e9e profonde et silencieuse",
    "hero.subtext":
      "tarnmail rassemble Gmail, Outlook et Yahoo dans un seul client crypt\u00e9. Lisez, recherchez et r\u00e9pondez \u00e0 tous vos comptes \u00e0 la fois. Nous ne pouvons pas lire vos messages et nous ne les vendons jamais.",
    "hero.passwordless": "Aucun mot de passe requis \u2014 d\u00e9couvrez",
    "hero.howWeProtect": "comment nous prot\u00e9geons vos messages",
    "hero.cta": "Connecter votre bo\u00eete",

    /* Hero Visual */
    "heroVisual.inbox": "Bo\u00eete de r\u00e9ception",
    "heroVisual.drafts": "Brouillons",
    "heroVisual.sent": "Envoy\u00e9s",
    "heroVisual.trash": "Corbeille",
    "heroVisual.spam": "Spam",
    "heroVisual.workFolder": "Dossier travail",
    "heroVisual.compose": "Nouveau message",
    "heroVisual.manageFolders": "G\u00e9rer les dossiers",
    "heroVisual.reply": "R\u00e9pondre",
    "heroVisual.forward": "Transf\u00e9rer",
    "heroVisual.from": "De : Dana Whitlock <dana@workmail.com>",
    "heroVisual.to": "\u00c0 : vous (sur 3 comptes connect\u00e9s)",
    "heroVisual.encrypted":
      "Jeton crypt\u00e9 au repos \u2014 nous ne lisons jamais ceci",
    "heroVisual.emailGreeting": "Bonjour,",
    "heroVisual.emailBody":
      "Je regroupe la feuille de route dans un seul fil pour \u00e9viter qu'elle ne se disperse. Derni\u00e8res notes jointes \u2014 r\u00e9pondez d'ici et le message partira toujours de votre vraie adresse.",
    "heroVisual.emailThanks": "Merci,",
    "heroVisual.emailSignoff": "Dana",
    "heroVisual.attachment": "roadmap-Q3.pdf (38,2 Ko)",

    /* Trust Band */
    "trust.noTracking": "Aucun pistage, aucun profilage",
    "trust.allInOne": "Gmail, Outlook et Yahoo au m\u00eame endroit",
    "trust.oauthOnly":
      "OAuth uniquement \u2014 mots de passe jamais stock\u00e9s",
    "trust.encryptedTokens":
      "Jetons crypt\u00e9s r\u00e9vocables \u00e0 tout moment",

    /* Features */
    "features.sectionLabel": "Le client",
    "features.heading": "Vos messages, r\u00e9unis dans une eau calme.",
    "features.unifiedInbox": "Bo\u00eete unifi\u00e9e",
    "features.unifiedDesc":
      "Gmail, Outlook et Yahoo rassembl\u00e9s dans un seul fil chronologique, ou filtr\u00e9s par compte en un clic.",
    "features.replyNatively": "R\u00e9pondre naturellement",
    "features.replyDesc":
      "R\u00e9digez et envoyez via le pipeline de chaque fournisseur, vos messages atterrissent toujours depuis votre vraie adresse.",
    "features.passwordFree": "Connexion sans mot de passe",
    "features.passwordFreeDesc":
      "Nous utilisons OAuth. Vous autorisez directement chez Google ou Microsoft\u00a0\u2014\u00a0tarnmail ne voit jamais votre mot de passe.",
    "features.searchEverything": "Recherche tout",
    "features.searchDesc":
      "Recherche plein texte dans tous vos comptes connect\u00e9s \u00e0 la fois. Une seule requ\u00eate, toutes les bo\u00eetes.",
    "features.encrypted": "Crypt\u00e9 au repos",
    "features.encryptedDesc":
      "Les jetons d'acc\u00e8s sont crypt\u00e9s et limit\u00e9s aux droits strictement n\u00e9cessaires. R\u00e9vocation en un clic.",
    "features.noSurveillance": "Aucune surveillance",
    "features.noSurveillanceDesc":
      "Pas de profilage publicitaire, pas d'exploitation de contenu, pas de revente. Le produit, c'est le client.",

    /* Security */
    "security.sectionLabel": "Mod\u00e8le de s\u00e9curit\u00e9",
    "security.heading": "Acc\u00e8s OAuth, jetons chiffr\u00e9s, moindre privil\u00e8ge.",
    "security.desc":
      "tarnmail se connecte \u00e0 vos fournisseurs via leurs flux OAuth officiels. Nous stockons un jeton d'acc\u00e8s chiffr\u00e9 et limit\u00e9. Jamais votre mot de passe. Vous pouvez r\u00e9voquer ce lien depuis votre compte Google ou Microsoft \u00e0 tout moment.",
    "security.auth":
      "OAuth 2.0 autoris\u00e9 chez le fournisseur, jamais sur nos formulaires",
    "security.store":
      "Jetons crypt\u00e9s au repos, isol\u00e9s par ligne utilisateur",
    "security.scope":
      "Port\u00e9es de moindre privil\u00e8ge\u00a0: lecture + envoi uniquement",
    "security.transport":
      "TLS partout, URLs de t\u00e9l\u00e9chargement sign\u00e9es et courtes",
    "security.control":
      "D\u00e9connectez un compte instantan\u00e9ment, jetons purg\u00e9s",

    /* Pricing */
    "pricing.sectionLabel": "Tarifs",
    "pricing.heading": "Payez pour le logiciel, pas avec votre bo\u00eete.",
    "pricing.tarnName": "Tarn",
    "pricing.tarnPrice": "Gratuit",
    "pricing.tarnNote": "pour un compte",
    "pricing.tarnFeat1": "1 compte connect\u00e9",
    "pricing.tarnFeat2": "Fil unifi\u00e9",
    "pricing.tarnFeat3": "Recherche plein texte",
    "pricing.tarnFeat4": "Jetons crypt\u00e9s",
    "pricing.tarnCta": "Commencer gratuit",
    "pricing.deepName": "Deep",
    "pricing.deepPrice": "5\u20ac",
    "pricing.deepNote": "par mois",
    "pricing.deepFeat1": "Jusqu'\u00e0 5 comptes",
    "pricing.deepFeat2": "Recherche multi-comptes",
    "pricing.deepFeat3": "Envoi depuis n'importe quelle adresse",
    "pricing.deepFeat4": "Synchronisation prioritaire",
    "pricing.deepFeat5": "1 Go de pi\u00e8ces jointes",
    "pricing.deepCta": "Connecter la bo\u00eete",
    "pricing.fathomName": "Fathom",
    "pricing.fathomPrice": "12\u20ac",
    "pricing.fathomNote": "par mois",
    "pricing.fathomFeat1": "Comges illimit\u00e9s",
    "pricing.fathomFeat2": "Alias d'\u00e9quipe",
    "pricing.fathomFeat3": "10 Go de pi\u00e8ces jointes",
    "pricing.fathomFeat4": "Journal d'audit",
    "pricing.fathomFeat5": "Assistance prioritaire",
    "pricing.fathomCta": "Choisir Fathom",
    "pricing.mostChosen": "Le plus populaire",

    /* Final CTA */
    "cta.heading": "Ramenez toutes vos bo\u00eetes \u00e0 la surface.",
    "cta.subtext":
      "Connectez votre premier compte en moins d'une minute. Aucun mot de passe ne quitte jamais le fournisseur.",
    "cta.button": "Connecter votre bo\u00eete",

    /* Footer */
    "footer.product": "Produit",
    "footer.features": "Fonctionnalit\u00e9s",
    "footer.pricing": "Tarifs",
    "footer.changelog": "Nouveaut\u00e9s",
    "footer.status": "Statut",
    "footer.company": "Soci\u00e9t\u00e9",
    "footer.about": "\u00c0 propos",
    "footer.blog": "Blog",
    "footer.contact": "Contact",
    "footer.legal": "L\u00e9gal",
    "footer.privacy": "Confidentialit\u00e9",
    "footer.terms": "Conditions",
    "footer.security": "S\u00e9curit\u00e9",

    /* Cookie banner */
    "cookies.title": "Votre vie priv\u00e9e compte",
    "cookies.body":
      "Nous utilisons un cookie d'analyse respectueux de la vie priv\u00e9e pour comprendre l'usage du site. Les cookies essentiels font fonctionner tarnmail.",
    "cookies.learnMore": "Lire notre politique de confidentialit\u00e9",
    "cookies.acceptAll": "Tout accepter",
    "cookies.essential": "Refuser le non-essentiel",
    "cookies.customize": "Personnaliser",
    "cookies.customizeTitle": "Pr\u00e9f\u00e9rences de cookies",
    "cookies.customizeBody":
      "Choisissez les cookies que tarnmail peut utiliser. Modifiable \u00e0 tout moment.",
    "cookies.cat.essential": "Strictement n\u00e9cessaires",
    "cookies.cat.essentialDesc":
      "Requis pour le fonctionnement du site. Non d\u00e9sactivables.",
    "cookies.cat.analytics": "Analytique",
    "cookies.cat.analyticsDesc":
      "Statistiques d'usage respectueuses de la vie priv\u00e9e pour am\u00e9liorer tarnmail.",
    "cookies.alwaysOn": "Toujours actif",
    "cookies.cancel": "Annuler",
    "cookies.savePrefs": "Enregistrer",

    "footer.tagline":
      "Email priv\u00e9, recherche rapide, z\u00e9ro suivi.",
    "footer.madeFor":
      "Con\u00e7u pour ceux qui v\u00e9rifient leur email deux fois par jour.",
    "footer.copyright":
      "(c) {year} tarnmail",

    /* Login */
    "login.title": "Connexion",
    "login.subtitle":
      "Connectez-vous avec votre fournisseur de messagerie. Nous ne voyons jamais votre mot de passe.",
    "login.continueWith": "Continuer avec {provider}",
    "login.agreement":
      "En continuant, vous acceptez les Conditions d'utilisation et la Politique de confidentialit\u00e9. L'acc\u00e8s peut \u00eatre r\u00e9voqu\u00e9 \u00e0 tout moment depuis votre compte fournisseur.",
    "login.error.linked":
      "Cet email est d\u00e9j\u00e0 li\u00e9 \u00e0 une autre connexion.",
    "login.error.denied": "Acc\u00e8s refus\u00e9. Veuillez r\u00e9essayer.",
    "login.error.config":
      "L'authentification n'est pas encore enti\u00e8rement configur\u00e9e.",
    "login.error.default": "Connexion impossible. Veuillez r\u00e9essayer.",

    /* Admin */
    "admin.users.title": "Utilisateurs",
    "admin.users.count": "{count} inscrits",
    "admin.users.email": "Email",
    "admin.users.name": "Nom",
    "admin.users.linked": "Connect\u00e9",
    "admin.users.joined": "Inscrit le",

    /* Inbox */
    "inbox.title": "Bo\u00eete de r\u00e9ception",
    "inbox.new": "Nouveau message",
    "inbox.more": "Moins",
    "inbox.storage": "0,3 Go / 15 Go utilis\u00e9s",
    "heroVisual.starred": "Suivis",
    "heroVisual.archive": "Archives",
    "heroVisual.allMail": "Tous les messages",

    /* Settings */
    "settings.search": "Rechercher dans les paramètres",
    "settings.inbox": "Boîte de réception",
    "settings.groupAccount": "Compte",
    "settings.groupApp": "tarnmail",
    "settings.home": "Accueil",
    "settings.account": "Compte",
    "settings.language": "Langue",
    "settings.appearance": "Apparence",
    "settings.privacy": "Sécurité et confidentialité",
    "settings.about": "À propos",
    "settings.yourAccount": "Votre compte",
    "settings.signedIn": "Connecté",
    "settings.signedInDesc": "Le compte Google connecté à tarnmail.",
    "settings.connectedGoogle": "Connecté via Google",
    "settings.signOut": "Se déconnecter",
    "settings.permissions": "Autorisations",
    "settings.permissionsDesc":
      "Réautorisez si vous modifiez ce que tarnmail peut consulter.",
    "settings.reconnect": "Reconnecter le compte Google",
    "settings.storage": "Stockage",
    "settings.storageDesc": "Votre quota Google, partagé avec Drive et Photos.",
    "settings.storageUnavailable": "Stockage indisponible.",
    "settings.signInAgain": "Reconnectez-vous",
    "settings.grantDrive": "pour accorder l'accès à Drive.",
    "settings.usedOf": "{used} sur {total} utilisés",
    "settings.usedUnlimited": "{used} utilisés · illimité",
    "settings.interfaceLang": "Langue de l'interface",
    "settings.interfaceLangDesc":
      "Choisissez la langue de l'interface tarnmail.",
    "settings.appearanceDesc": "Personnalisez l'apparence de tarnmail.",
    "settings.density": "Densité",
    "settings.densityDesc":
      "À quel point les messages sont resserrés dans la liste.",
    "settings.comfortable": "Confortable",
    "settings.compact": "Compact",
    "settings.showAvatars": "Avatars des expéditeurs",
    "settings.showAvatarsDesc":
      "Afficher les initiales colorées dans la liste et les messages.",
    "settings.showFavicons": "Icônes des sites expéditeurs",
    "settings.showFaviconsDesc":
      "Afficher la vraie icône du site de chaque expéditeur au lieu des initiales.",
    "settings.blockImages": "Bloquer les images distantes",
    "settings.blockImagesDesc":
      "Bloquez les pixels espions en chargeant les images à la demande.",
    "settings.confirmDelete": "Confirmer avant de supprimer",
    "settings.confirmDeleteDesc":
      "Demander avant de mettre des conversations à la corbeille.",
    "settings.privacyTracking": "Suivi et contenu",
    "settings.privacyTrackingDesc":
      "Contrôlez ce que les expéditeurs peuvent voir et charger.",
    "settings.stripTracking": "Nettoyer les liens de suivi",
    "settings.stripTrackingDesc":
      "Retirer les paramètres de suivi (utm_*, fbclid, gclid…) des liens avant ouverture.",
    "settings.hideSenderEmail": "Masquer les adresses",
    "settings.hideSenderEmailDesc":
      "Afficher uniquement le nom de l'expéditeur, pas son adresse e-mail.",
    "settings.security": "Sécurité",
    "settings.securityDesc":
      "Confirmations supplémentaires avant les actions à risque.",
    "settings.openLinksNewTab": "Ouvrir les liens dans un nouvel onglet",
    "settings.openLinksNewTabDesc":
      "Gardez tarnmail ouvert en ouvrant les liens dans un onglet séparé.",
    "settings.warnLinks": "Avertir avant les liens externes",
    "settings.warnLinksDesc":
      "Afficher la destination et confirmer avant d'ouvrir les liens des messages.",
    "settings.confirmUnsub": "Confirmer la désinscription",
    "settings.confirmUnsubDesc":
      "Demander avant d'ouvrir le lien de désinscription d'un expéditeur.",
    "settings.confirmSend": "Confirmer avant l'envoi",
    "settings.confirmSendDesc":
      "Demander confirmation avant l'envoi d'un message.",
    "settings.privacyGlance": "Confidentialité en bref",
    "settings.howProtect": "Comment tarnmail vous protège",
    "settings.factOauth": "OAuth uniquement",
    "settings.factOauthDesc":
      "Vous autorisez directement chez Google. tarnmail ne voit jamais votre mot de passe.",
    "settings.factTokens": "Jetons chiffrés",
    "settings.factTokensDesc":
      "Les jetons d'accès sont chiffrés et limités au strict nécessaire.",
    "settings.factTracker": "Protection anti-traceurs",
    "settings.factTrackerDesc":
      "Les images distantes sont bloquées par défaut pour stopper les pixels espions.",
    "settings.factNoSurv": "Aucune surveillance",
    "settings.factNoSurvDesc":
      "Aucun profilage publicitaire, aucune exploitation du contenu, rien de vendu.",
    "settings.aboutDesc":
      "Une interface priv\u00e9e pour votre Gmail. Vos messages sont lus en direct depuis Google. Rien n'est stock\u00e9 sur nos serveurs.",
    "settings.groupMail": "Courrier",
    "settings.messages": "Messages",
    "settings.theme": "Thème",
    "settings.themeDesc": "Interface claire ou sombre, ou selon votre système.",
    "settings.themeLight": "Clair",
    "settings.themeDark": "Sombre",
    "settings.themeSystem": "Système",
    "settings.accentColor": "Couleur d'accent",
    "settings.accentColorDesc":
      "Choisissez la couleur de surbrillance de tarnmail.",
    "settings.fontSize": "Taille du texte",
    "settings.fontSizeDesc": "Ajustez la taille générale du texte.",
    "settings.fontSmall": "Petite",
    "settings.fontDefault": "Par défaut",
    "settings.fontLarge": "Grande",
    "settings.snippets": "Aperçus des messages",
    "settings.snippetsDesc":
      "Afficher un extrait de chaque message dans la liste.",
    "settings.unreadBold": "Non lus en gras",
    "settings.unreadBoldDesc": "Afficher les conversations non lues en gras.",
    "settings.clock12h": "Format 12 heures",
    "settings.clock12hDesc":
      "Afficher les heures comme 1:30 PM au lieu de 13:30.",
    "settings.showFolderCounts": "Nombre de messages",
    "settings.showFolderCountsDesc":
      "Afficher le nombre de messages dans chaque dossier de la barre latérale.",
    "settings.splitView": "Vue partagée",
    "settings.splitViewDesc":
      "Afficher la liste des emails et le message côte à côte lors de la lecture.",
    "settings.markRead": "Marquer comme lu à l'ouverture",
    "settings.markReadDesc":
      "Marquer une conversation comme lue quand vous l'ouvrez.",
    "settings.perPage": "Messages à charger",
    "settings.perPageDesc": "Nombre de conversations à récupérer par dossier.",
    "settings.defaultFolder": "Dossier par défaut",
    "settings.defaultFolderDesc":
      "Le dossier affiché à l'ouverture de tarnmail.",
    "settings.signature": "Signature",
    "settings.signatureDesc": "Ajoutée au bas des messages que vous rédigez.",
    "settings.signaturePlaceholder": "Envoyé depuis tarnmail",
    "settings.save": "Enregistrer",
    "settings.saved": "Enregistré",
    "settings.behavior": "Comportement",
    "settings.reset": "Réinitialiser les paramètres",
    "settings.resetDesc": "Restaurer tous les paramètres par défaut.",
    "settings.resetBtn": "Réinitialiser",

    /* Compose */
    "compose.title": "Nouveau message",
    "compose.to": "\u00c0",
    "compose.subject": "Objet",
    "compose.body": "\u00c9crivez votre message…",
    "compose.attach": "Joindre",
    "compose.cancel": "Annuler",
    "compose.send": "Envoyer",
    "compose.sending": "Envoi en cours…",
    "compose.saveDraft": "Enregistrer comme brouillon",
    "compose.savingDraft": "Enregistrement du brouillon…",

    /* Thread */
    "thread.attachFile": "Joindre un fichier",
    "thread.placeholder": "\u00c9crire un message\u2026",
    "thread.send": "Envoyer",
    "thread.sending": "Envoi en cours\u2026",
  },
};
