import { objkt } from "./objkt";

const xUserCache = new Map<string, string[]>();

function getXUsername(bookmarkButton: Element) {
    const tweetContainer = bookmarkButton.closest('[data-testid="tweet"]');
    if (!tweetContainer) { return null; }

    // Primero buscar si es un retweet mirando el elemento con data-testid="socialContext"
    const retweetContext = tweetContainer.querySelector('[data-testid="socialContext"]');

    // Si es retweet, buscar el link del usuario original dentro del contenedor del tweet
    if (retweetContext) {
        const originalUserLink = tweetContainer.querySelector('div[data-testid="User-Name"] a[role="link"]');
        if (originalUserLink) {
            const originalUsername = originalUserLink.getAttribute('href')?.slice(1);
            return originalUsername || null;
        }
    }

    // Si no es retweet, buscar el primer link de usuario como antes
    const originalUserLink = tweetContainer.querySelector('a[href^="/"][role="link"]');
    if (originalUserLink) {
        const originalUsername = originalUserLink.getAttribute('href')?.slice(1);
        return originalUsername || null;
    }

    return null;
}

function activeBandogButton(button: HTMLElement, addresses: string[] | undefined) {
    if ((addresses?.length ?? 0) > 0) {
        button.style.display = "flex";

        // On Click.
        button.addEventListener('click', () => {
            window.open(`https://bandog.pet/scanner/${addresses![0]}`);
        });
    }
}

function genBandogImage(title: string) {
    const bandogImage = document.createElement('img');
    bandogImage.src = "https://bandog.pet/png/logo-white.png";
    bandogImage.style.objectFit = "contain";
    bandogImage.title = title;
    return bandogImage;
}

function addBandogButton() {
    const bookmarkButtons = document.querySelectorAll('[data-testid="bookmark"]');

    bookmarkButtons.forEach(bookmarkButton => {
        if (bookmarkButton?.parentElement === null) { return; }
        if (bookmarkButton.parentElement.querySelector('.bandog-button')) { return; } //Already added.

        const xUser = getXUsername(bookmarkButton);
        if (xUser == null) { return; }

        // Generate button.
        const purpleButton = document.createElement('button');
        purpleButton.className = 'bandog-button';
        purpleButton.style.background = "none";
        purpleButton.style.border = "none";
        purpleButton.style.marginRight = "18px";
        purpleButton.style.cursor = "pointer";
        purpleButton.style.padding = "0";
        purpleButton.style.width = "16px";
        purpleButton.style.height = "20px";
        purpleButton.appendChild(genBandogImage(`Scan @${xUser} on Bandog!`))
        purpleButton.style.display = "none";

        // Insert.
        bookmarkButton?.parentElement.insertBefore(purpleButton, bookmarkButton);

        if (xUserCache.has(xUser)) {
            activeBandogButton(purpleButton, xUserCache.get(xUser));
        } else {
            objkt.GetXUserTezosAddresses(xUser).then(x => x)
                .then((addresses) => {
                    if (!xUserCache.has(xUser)) {
                        xUserCache.set(xUser, addresses);
                    }
                    activeBandogButton(purpleButton, addresses);
                });
        }
    });
}

// Observer
const observer = new MutationObserver(addBandogButton);
observer.observe(document.body, { childList: true, subtree: true });
addBandogButton();