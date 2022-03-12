// ==UserScript==
// @name         Add List Items to Cart
// @namespace    http://tampermonkey.net/
// @version      0.3
// @updateURL    https://github.com/joltmans/userwebscripts/blob/main/Add%20List%20Items%20to%20Cart.user.js
// @downloadURL  https://github.com/joltmans/userwebscripts/blob/main/Add%20List%20Items%20to%20Cart.user.js
// @description  Adds a button to saved lists to add all items to cart. Also adds a button in the cart to remove all items from cart.
// @author       James Oltmans
// @match        https://www.walmart.com/*
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
            buttonsText: ['Add to cart', 'Add'],
            loadWait: 2,
            cooldown: 0, // Set to 0 to disable the refresh.
            active: true,
            linkLocationSelector:'h1',
            cartSelector:'h2:contains("Cart")',
            removeSelector:'button:contains("Remove")',
        }
    ];

    function insertAddAllButton(buttonId, sel) {
        let buttons = getFilteredButtonsSelection(buttonId, sel);
        let count = buttons.length;
        let addAllText = `Add all (${count}) to cart`;
        if (count > 0) {
            if ($(`#${buttonId}`).length == 0) {
                $(sel.linkLocationSelector).first().append(` <button id="${buttonId}">${addAllText}</button>`);
            } else {
                $(`#${buttonId}`).text(addAllText);
            }
            $(`#${buttonId}`).on("click", function() { triggerClicks(buttons); });
        } else {
            $(`#${buttonId}`).remove();
        }
        $(`#${buttonId}`).on("mouseover", function() { highlightButtons(buttons); });
    }

    function insertRemoveAllFromCartButton(buttonId, sel) {
        let buttons = getRemoveButtons(buttonId, sel);
        let count = buttons.length;
        let removeText = `Remove all (${count}) from cart`;
        if (count > 0) {
            if ($(`#${buttonId}`).length == 0) {
                $(sel.cartSelector).first().append(` <button id="${buttonId}">${removeText}</button>`);
            } else {
                $(`#${buttonId}`).text(removeText);
            }
            $(`#${buttonId}`).on("click", function() { triggerClicks(buttons); });
        } else {
            $(`#${buttonId}`).remove();
        }
        $(`#${buttonId}`).on("mouseover", function() { highlightButtons(buttons); });
    }

    function getFilteredButtonsSelection(buttonId, sel) {
        let buttons = $(sel.selector).filter(function() {
            return sel.buttonsText.indexOf($(this).children().text()) != -1;
        });
        buttons.not(`#${buttonId}`);
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


    function gmMain () {
        // function main()
        SELECTORS.forEach((sel) => {
            if (sel.active) {
                if ($(sel.linkLocationSelector).length > 0)
                {
                    let buttonId = "AddAllListItemsToCartButton__";
                    insertAddAllButton(buttonId, sel);
                }
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
    
    var pageCheckTimer = setInterval (
    function () {
        gmMain();
        findCart();
    }
        , 222
    );

})();