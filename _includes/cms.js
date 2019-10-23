<script>
/**
 * CMS-backed reusable lightweight components.
 */

// This is an anonymous function to keep the functions and variables here out
// of the global scope
(function() {

    // Populate infoblocks on CMS.
    // Event pages can use layout: one_column_cms or two_column_cms
    // to use these CMS-backed blocks.
    function fetchCMS(queryString) {
        return fetch("https://cms.hack.gt/graphql", {
            method: "POST",
            headers: {
                "Content-Type": `application/json`,
                "Accept": `application/json`
            },
            body: JSON.stringify({
                query: `query {
                    ${queryString}
                }`
            })
        })
        .then(r => {
            if (!r.ok) {
                console.warn("CMS is down");
                return;
            }
            return r.json();
        })
        .then(json => json.data)
        .catch(err => {
            console.error(err);
        });
    }

    function createInfoBlockInnerHTML (title, markdownContent) {
        return `<div class="block-header">${title}</div><div class="block-body">${marked(markdownContent)}</div>`;
    }

    function createChallengeBlockInnerHTML (title, description, prizes, partner) {
        const descString = "#### Description\n" + description && description.length > 0 ? description : "Stay tuned for more details!";
        const prizeString = prizes && prizes.length > 0 ? `\n\n#### Prizes\n ${prizes}` : "";
        console.log(partner);
        const partnerString = partner && !!partner.name && partner.name.length > 0 ? `#### *Presented by ${!!partner.website ?
            `[${partner.name}](${partner.website})` : partner.name}*\n` : "";
        console.log(partnerString);
        return `<div class="block-header">${title}</div>
        <div class="block-body">${marked(partnerString + descString + prizeString)}</div>
        `;
    }

    function fetchInfoBlock (blockElement) {
        const slug = blockElement.getAttribute("data-cms-slug");
        const queryString = `infoblocks (where: {
                                slug: "${slug}"
                            }) {
                                body
                                title
                            }`;
        fetchCMS(queryString)
            .then(data => {
                if (data.infoblocks.length == 0) {
                    console.warn('No infoblock with specified slug on CMS');
                    return;
                }
                const markdownContent = data.infoblocks[0].body;
                const title = data.infoblocks[0].title;
                const elementString = createInfoBlockInnerHTML(title, markdownContent);
                blockElement.innerHTML = elementString;
            })
            .catch(err => {
                console.error(err);
            });
    }

    function fetchChallengeBlock (blockElement) {
        const slug = blockElement.getAttribute("data-cms-slug");
        const queryString = `challenges (where: {
                                slug: "${slug}"
                            }) {
                                title
                                prize
                                description
                                partner {
                                    name
                                    website
                                }
                            }`;
        fetchCMS(queryString)
        .then(data => {
            if (data.challenges.length == 0) {
                console.warn('No challenge with specified slug on CMS');
                return;
            }
            const prizeMd = data.challenges[0].prize;
            const descriptionMd = data.challenges[0].description;
            const title = data.challenges[0].title;
            const partner = data.challenges[0].partner;
            const elementString = createChallengeBlockInnerHTML(title, descriptionMd, prizeMd, partner);
            blockElement.innerHTML = elementString;
        })
        .catch(err => {
            console.error(err);
        });
    }

    document.querySelectorAll('.cms-infoblock').forEach(element => {
        fetchInfoBlock(element);
    });

    document.querySelectorAll('.cms-challengeblock').forEach(element => {
        fetchChallengeBlock(element);
    });
})();
</script>