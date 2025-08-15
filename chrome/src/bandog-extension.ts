import { objkt } from "./objkt";

const xUserCache = new Map<string, string[]>();

function getXUsername(bookmarkButton: Element) {
    const tweetContainer = bookmarkButton.closest('[data-testid="tweet"]');
    if (!tweetContainer) { return null; }

    // First check if it's a retweet by looking for element with data-testid="socialContext"
    const retweetContext = tweetContainer.querySelector('[data-testid="socialContext"]');

    // If it's a retweet, find the original user's link inside the tweet container
    if (retweetContext) {
        const originalUserLink = tweetContainer.querySelector('div[data-testid="User-Name"] a[role="link"]');
        if (originalUserLink) {
            const originalUsername = originalUserLink.getAttribute('href')?.slice(1);
            return originalUsername || null;
        }
    }

    // If it's not a retweet, find the first user link as before
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
        button.addEventListener('click', () => {
            addresses?.forEach(address => window.open(`https://bandog.pet/scanner/${address}`));
        });
    }
}

function genBandogImage(title: string) {
    const bandogImage = document.createElement('img');
    bandogImage.src = "https://bandog.pet/png/logo-white.png";
    bandogImage.style.objectFit = "contain";
    bandogImage.style.margin = "auto"
    bandogImage.title = title;
    bandogImage.style.transition = "0.5s";
    bandogImage.style.opacity = "0.5";
    bandogImage.style.filter = "drop-shadow( 0px 0px 0px rgba(255, 255, 255, 1))";

    bandogImage.onmouseover = () => {
        bandogImage.style.filter = "drop-shadow( 0px 0px 10px rgba(255, 255, 255, 1))";
        bandogImage.style.opacity = "1";
    };

    bandogImage.onmouseleave = () => {
        bandogImage.style.filter = "drop-shadow( 0px 0px 0px rgba(255, 255, 255, 1))";
        bandogImage.style.opacity = "0.5";
    };

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
        const dogButton = document.createElement('button');
        dogButton.className = 'bandog-button';
        dogButton.style.background = "none";
        dogButton.style.border = "none";
        dogButton.style.marginRight = "18px";
        dogButton.style.cursor = "pointer";
        dogButton.style.padding = "0";
        dogButton.style.width = "16px";
        dogButton.style.height = "100%";
        dogButton.appendChild(genBandogImage(`Scan @${xUser} on Bandog!`))
        dogButton.style.display = "none";

        // Insert.
        bookmarkButton?.parentElement.insertBefore(dogButton, bookmarkButton);

        if (xUserCache.has(xUser)) {
            activeBandogButton(dogButton, xUserCache.get(xUser));
        } else {
            objkt.GetXUserTezosAddresses(xUser).then(x => x)
                .then((addresses) => {
                    if (!xUserCache.has(xUser)) {
                        xUserCache.set(xUser, addresses);
                    }
                    activeBandogButton(dogButton, addresses);
                });
        }
    });
}

// Observer
const observer = new MutationObserver(addBandogButton);
observer.observe(document.body, { childList: true, subtree: true });
addBandogButton();