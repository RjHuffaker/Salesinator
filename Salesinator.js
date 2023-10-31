// ==UserScript==
// @name         Salesinator
// @namespace    http://tampermonkey.net/
// @version      0.35
// @description  A simple script to automate the transfer of customer details from PestRoutes to PestPac
// @author       RjHuffaker
// @match        app.pestpac.com/*
// @match        dancanpest.pestroutes.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        window.focus
// @grant        window.close
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const urlContains = (list) => {
        let yesItDoes = false;
        for(let i = 0; i < list.length; i++){
            if(window.location.href.indexOf(list[i]) > -1) {
                yesItDoes = true;
            }
        }
        return yesItDoes;
    }

    const focusListener = () => {
        if(urlContains(["app.pestpac.com"]) && !urlContains(["appointment"])){

            const recordFocus = () => {
                window.name = Date.now();

                GM_setValue("PestPacFocus", window.name);
            }

            recordFocus();

            window.addEventListener("focus", (event) => {
                recordFocus();
            }, false);
        }
    }

    const checkLastFocus = () => {
        var lastFocus = GM_getValue("PestPacFocus");

        if(lastFocus === window.name){
            return true;
        } else {
            return false;
        }
    }


    const frCustomers = () => {

        const customerSearch = document.getElementById('customerSearch');

        const recurringServiceForm = document.getElementById('recurringServiceForm');

        const subscriptionPanel = document.getElementById('subscriptionPanel');

        var observer = new MutationObserver(function(mutations){

            mutations.forEach(function(mutation){

                if (!mutation.addedNodes) return

                for (var i = 0; i < mutation.addedNodes.length; i++) {

                    var node = mutation.addedNodes[i];

                    if(node){
                        if(node.children && node.children[0]){
                            if(node.id==='customerWindow'){
                                console.log(node)
                                addPestPacLink();
                            }
                        }
                    }
                }

            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    const addPestPacLink = () => {
        const pestPacAnchor = document.createElement('a');
        pestPacAnchor.innerHTML = 'PestPac =>';
        pestPacAnchor.href="#";
        pestPacAnchor.style.float = 'right';
        pestPacAnchor.onclick = goToPestPac;
        const customerPanel = document.getElementById('customerPanel');
        console.log(customerPanel);
        customerPanel.children[0].children[0].appendChild(pestPacAnchor);
    }

    const goToPestPac = () => {
        let customer = getCustomer();
        console.log(customer);
        GM_setValue('PR_to_PP', {customer});
    }

    const getCustomer = () => {
        const custId = document.getElementsByClassName('customerTitleSpan')[0].innerHTML.replace(/[\[\]]+/g, "").replace(" ","");
        const fname = document.getElementsByName('fname')[0].value;
        const lname = document.getElementsByName('lname')[0].value;
        const email = document.getElementsByName('email')[0].value;
        const phone1 = document.getElementsByName('phone1')[0].value.replace(/[()\-]/g, "").replace(" ","");
        const phone2 = document.getElementsByName('phone2')[0].value.replace(/[()\-]/g, "").replace(" ","");
        const address = document.getElementsByName('address')[0].value;
        const city = document.getElementsByName('city')[0].value;
        const state = 'TX';
        const zip = document.getElementsByName('zip')[0].value;

        return {
            custId, fname, lname, email, phone1, phone2, address, city, state, zip
        }
    }


    const addLocationListener = () => {
        console.log('createAccountListener');

        GM_deleteValue("PR_to_PP");

        GM_addValueChangeListener("PR_to_PP", function(name, old_value, new_value, remote){
            if(!checkLastFocus()) return;

            window.focus();

            const prevAcct = document.getElementById('UserDef1');
            const fnameInput = document.getElementById('FName');
            const lnameInput = document.getElementById('LName');
            const emailInput = document.getElementById('EMail');
            const phoneInput = document.getElementById('Phone');
            const altPhoneInput = document.getElementById('AltPhone');
            const addressInput = document.getElementById('Address');
            const cityInput = document.getElementById('City');
            const stateInput = document.getElementById('State');
            const zipInput = document.getElementById('Zip');

            const customer = new_value.customer;

            if(customer){
                prevAcct.value = customer.custId;
                fnameInput.value = customer.fname;
                lnameInput.value = customer.lname;
                emailInput.value = customer.email;
                phoneInput.value = customer.phone1;
                altPhoneInput.value = customer.phone2;
                addressInput.value = customer.address;
                cityInput.value = customer.city;
                stateInput.value = customer.state;
                zipInput.value = customer.zip;
            }

            GM_deleteValue("PR_to_PP");

        });
    }



    const initializeSalesinator = () => {
        if(urlContains(["dancanpest.pestroutes.com"])){
            frCustomers();
        } else if(urlContains(["app.pestpac.com/location/add.asp"])){
            focusListener();
            addLocationListener();
        }
    }

    initializeSalesinator();

})();