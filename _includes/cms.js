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

    function createInfoBlockInnerHTML (title, markdownContent) {
        return `<div class="block-header">${title}</div><div class="block-body">${marked(markdownContent)}</div>`;
    }

    function fetchInfoBlock (blockElement) {
        const slug = blockElement.getAttribute("data-cms-slug");
        const queryString = `infoblocks (where: {
                                slug: "${slug}"
                            }) {
                                body
                                title
                            }`;

        fetch("https://cms.hack.gt/graphql", {
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
        .then(r => r.json())
        .then(json => {
            if (json.data.infoblocks.length == 0) {
                console.warn('No infoblock with specified slug on CMS');
                return;
            }
            const markdownContent = json.data.infoblocks[0].body;
            const title = json.data.infoblocks[0].title;
            const elementString = createInfoBlockInnerHTML(title, markdownContent);
            blockElement.innerHTML = elementString;
        })
        .catch(err => {
            console.error(err);
        });
    }

    document.querySelectorAll('.cms-infoblock').forEach(element => {
        fetchInfoBlock(element);
    });
    
})();
</script>