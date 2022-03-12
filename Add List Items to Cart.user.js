// ==UserScript==
// @name         Add List Items to Cart
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds all items from a List to cart
// @author       James Oltmans
// @match        https://www.walmart.com/lists/*
// @grant        none
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    console.log('Running Add to cart.');

    const SELECTORS = [
        {
            site: 'Walmart',
            urls: ['https://www.walmart.com/lists'],
            selector: 'div.main-content button',
            buttonsText: ['Add to cart'],
            loadWait: 2,
            cooldown: 0, // Set to 0 to disable the refresh.
            active: true,
            linkLocationSelector:'h1',
            cartSelector:'h2:contains("Cart")',
            removeSelector:'button:contains("Remove")',
        }
    ];

    function insertAddAllButton(buttonId, sel) {
        let buttons = getFilteredButtonsSelection(sel);
        let count = buttons.length;
        if (count > 0) {
            $(sel.linkLocationSelector).first().append(` <button id="${buttonId}">Add all (${count}) to cart</button>`);
            $(`#${buttonId}`).on("click", function() { triggerClicks(buttons); });
        } else {
            $(sel.linkLocationSelector).first().append(` <span id="${buttonId}">( No cart buttons detected. )</span>`);
        }
        $(`#${buttonId}`).on("mouseover", function() { highlightButtons(buttons); });
    }

    function insertRemoveAllFromCartButton(buttonId, sel) {
        let buttons = getRemoveButtons(buttonId, sel);
        let count = buttons.length;
        if (count > 0) {
            if ($(`#${buttonId}`).length == 0) {
                $(sel.cartSelector).first().append(` <button id="${buttonId}">Remove all (${count}) from cart</button>`);
            } else {
                $(`#${buttonId}`).text(`Remove all (${count}) from cart`);
            }
            $(`#${buttonId}`).on("click", function() { triggerClicks(buttons); });
        } else {
            $(`#${buttonId}`).remove();
        }
        $(`#${buttonId}`).on("mouseover", function() { highlightButtons(buttons); });
    }

    function getFilteredButtonsSelection(sel) {
        let buttons = $(sel.selector).filter(function() {
            return sel.buttonsText.indexOf($(this).children().text()) != -1;
        });
        return buttons;
    }

    function highlightButtons(buttons) {
        buttons.css("outline", "5px red dotted");
    }

    function getRemoveButtons(buttonId, sel) {
        const buttons = $(sel.removeSelector).not(`#${buttonId}`);
        return buttons;
    }

    // Scan the page for the provided selector and "click" them if present.
    function triggerClicks(buttons) {
        var anyClicked = false;

        // No available "Add to Cart" buttons. Cool down and refresh.
        if (!buttons.length) {
            console.log(`No buttons to click.`);
            return anyClicked;
        }

        buttons.each(function() {
            $(this).trigger("click");
            console.log(`Clicked button.`);
            anyClicked = true;
        });

        return anyClicked;
    }

    function waitToClick(sel, callback) {
        console.log(`Evaluating site ${sel.site} for clickable elements.`);
        window.setTimeout(() => {
            callback(sel);
        }, sel.loadWait * 1000);
    }

    var pageURLCheckTimer = setInterval (
    function () {
        if (this.lastPathStr !== location.pathname
            || this.lastQueryStr !== location.search
            || this.lastPathStr === null
            || this.lastQueryStr === null
           ) {
            this.lastPathStr = location.pathname;
            this.lastQueryStr = location.search;
            gmMain ();
        }
        findCart();
    }
        , 222
    );


    function gmMain () {
        // function main()
        SELECTORS.forEach((sel) => {
            if (sel.active) {
                waitToClick(sel, (sel) => {
                    //highlightButtons(sel);
                    let buttonId = "AddAllListItemsToCartButton__";
                    if ($(`#${buttonId}`).length < 1)
                        insertAddAllButton(buttonId, sel);
                });
            }
        });
    }

    function findCart() {
        SELECTORS.forEach((sel) => {
            if (sel.active) {
                if ($(sel.cartSelector).length > 0)
                {
                    let buttonId = "RemoveAllItemsFromCartButton__"
                    insertRemoveAllFromCartButton(buttonId, sel);
                }
            }
        });
    }

})();