export default function decodeURLLike(input) {
    if (typeof input !== "string") return null;

    // For this, I am specifying "only characters that are not allowed in any of the URL control sets."
    // In the URL spec (https://url.spec.whatwg.org), this reduces to excluding characters in the fragment percent-encode set
    // and the query percent-encode set. Everything else is derived from these with other characters blocked.
    if (input.match(/^([!$#$&-;=?-~]|%[0-9a-fA-F]{2})+$/)) {
        let url = null;
        try {
            url = new URL(input);
        } catch (e) {}
        if (url != null) {
            let parts = [];
            
            if (url.protocol) {
                parts.push({
                    title: "Protocol",
                    value: url.protocol
                });
            }
            if (url.username) {
                parts.push({
                    title: "Username",
                    value: url.username
                });
            }
            if (url.password) {
                parts.push({
                    title: "Password",
                    value: url.username
                });
            }
            if (url.hostname) {
                parts.push({
                    title: "Hostname",
                    value: url.hostname
                });
            }
            if (url.port) {
                parts.push({
                    title: "Port",
                    value: parseInt(url.port)
                });
            }
            if (url.pathname) {
                parts.push({
                    title: "Path",
                    value: url.pathname,
                    children: url.pathname.split("/").filter(element => element.length > 0).map(element => ({value: element}))
                });
            }
            if (url.search) {
                parts.push({
                    title: "Query",
                    value: url.search,
                    children: [...url.searchParams.entries()].map(([key, value]) => {
                        return {
                            title: key,
                            value: value
                        };
                    })
                });
            }
            if (url.hash) {
                parts.push({
                    title: "Hash",
                    value: url.hash
                });
            }

            return {
                title: "URL",
                value: input,
                children: parts
            };
        }

        if (input.includes("%")) {
            return {
                title: "URL Component",
                value: decodeURIComponent(input)
            };
        }
    }
    return null;
}