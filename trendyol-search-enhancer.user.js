// ==UserScript==
// @name         Trendyol Search Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  An extension that enhances your search experience on Trendyol.com
// @author       fatih-yavuz & linuxgemini
// @match        *://*.trendyol.com/*
// @icon         https://cdn.dsmcdn.com/web/production/favicon.ico
// @grant        none
// @run-at       document-start
// @license      ISC
// ==/UserScript==

(() => {
    "use strict";

    /**
     * checks if url is under /sr
     * @param {string} url
     * @returns {boolean}
     */
    const isUnderSearchPath = (url) => ((new URL(url)).pathname === "/sr");

    /**
     * checks if filter doesn't have "only with comments" selected
     * @param {string} url
     * @returns {boolean}
     */
    const onlyWithCommentsNotSelected = (url) => !((new URL(url)).searchParams.has("eea"));

    /**
     * checks if url is under search path and does not have the "only with comments" filter
     * @param {string} url
     * @returns {boolean}
     */
    const isNotAFilteredSearch = (url) => (isUnderSearchPath(url) && onlyWithCommentsNotSelected(url));

    /**
     * appends url the following query strings
     *   - indicate that we only want products with commented reviews
     *   - order by most rated to least
     *   - only show ratings above 4.3
     * @param {string} url original URL
     * @returns {string} modified URL
     */
    const enhanceURL = (url) => {
        const parsedURL = new URL(url);

        parsedURL.searchParams.append("eea", "1");
        if (!parsedURL.searchParams.has("sst")) parsedURL.searchParams.append("sst", "MOST_RATED");
        if (!parsedURL.searchParams.has("pr")) parsedURL.searchParams.append("pr", "4.3");

        /**
         * this is here to fix a quirk where the URL() class
         * and the URLSearchParams class in some js engines
         * parses down spaces correctly but stringifies
         * with + instead of %20 for http spec compliance(?)
         * without providing an option to change it
         */
        parsedURL.searchParams.forEach((value, key) => {
            parsedURL.searchParams.set(key, encodeURIComponent(value));
        });

        // decodeURIComponent is also part of the quirk fix
        return decodeURIComponent(parsedURL.toString());
    };

    let oldHref = document.location.href;
    if (isNotAFilteredSearch(window.location.href)) window.location.replace(enhanceURL(window.location.toString()));

    window.onload = () => {
        const bodyList = document.querySelector("body");
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (oldHref != document.location.href) {
                    oldHref = document.location.href;
                    if (isNotAFilteredSearch(window.location.href)) window.location.replace(enhanceURL(window.location.toString()));
                }
            });
        });
        const config = {
            childList: true,
            subtree: true
        };
        observer.observe(bodyList, config);
    };
})();