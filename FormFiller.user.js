// ==UserScript==
// @name         FormFiller
// @version      1.6
// @description  Fills form fields on configured websites
// @author       gbq6
// @match        *://*/*
// @grant        none
// ==/UserScript==

const DASH = "-"
const DOT = "."
const SPACE = " "

// DO NOT MODIFY ANYTHING ABOVE THIS LINE

// PASTE THE CONTENT OF THE FILLED DATA.JS FILE BELOW

// PASTE THE CONTENT OF THE FILLED DATA.JS FILE ABOVE

// DO NOT MODIFY ANYTHING BELOW THIS LINE

const websites = {
    "e-nmhh.nmhh.hu": {
        "form_ViseltNev_elo": name.title,
        "form_ViseltNev_vezetek": name.last,
        "form_ViseltNev_kereszt": name.first,
        "form_ViseltNev_uto": name.middle,

        "form_Szulnev_vezetek": maidenName.last,
        "form_Szulnev_kereszt": maidenName.first,
        "form_Szulnev_uto": maidenName.middle,

        "form_AnyjaSzulNeve_vezetek": mothersMaidenName.last,
        "form_AnyjaSzulNeve_kereszt": mothersMaidenName.first,
        "form_AnyjaSzulNeve_uto": mothersMaidenName.middle,

        "form_Szulhely_te": birth.city,
        "form_SzuletesiIdo": join(DASH, birth.year, birth.month, birth.day),

        "form_A11_pref": phone.countryCode,
        "form_A11_telBlock1": phone.carrierCode,
        "form_A11_telBock2": phone.number,

        "form_emailAddress": email,

        "form_Benyujto_Lakcim_ir": address.zipCode,
        "form_Benyujto_Lakcim_varos": address.city,
        "form_Benyujto_Lakcim_utca":
            join(SPACE, address.streetName, address.streetType, address.number, address.floor, address.door)
    }
}

function join(separator, ...strings) {
    return strings
        .filter(string => string.trim() !== "")
        .join(separator)
}

(function () {
    'use strict'

    console.log("Userscript loaded!")

    // Wait for the page to fully load
    window.addEventListener('load', () => {
        console.log("Page fully loaded!")

        const websiteConfig = websites[window.location.hostname]
        if (!websiteConfig) {
            console.warn(`No configuration found for ${window.location.hostname}`)
            return
        }

        // Add a manual trigger button to the page
        const triggerButton = document.createElement("button")
        triggerButton.textContent = "Fill Form"
        triggerButton.style.position = "fixed"
        triggerButton.style.bottom = "10px"
        triggerButton.style.right = "10px"
        triggerButton.style.zIndex = "1000"
        triggerButton.style.padding = "10px 20px"
        triggerButton.style.backgroundColor = "#007BFF"
        triggerButton.style.color = "white"
        triggerButton.style.border = "none"
        triggerButton.style.borderRadius = "5px"
        triggerButton.style.cursor = "pointer"
        triggerButton.title = "Click to fill the form fields"

        document.body.appendChild(triggerButton)

        // Add a click event to the button
         triggerButton.addEventListener("click", () => fillFormFields(websiteConfig))

        // Add a keyboard shortcut: Option + Ctrl + R
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.altKey && (e.key === "r" || e.key === "R")) {
                e.preventDefault()
                fillFormFields(websiteConfig)
            }
        })
    })

    function fillFormFields(config) {
        console.log("Filling form fields...")
        Object.keys(config).forEach((elementId) => {
            const field = document.getElementById(elementId)
            const value = config[elementId]

            if (field) {
                field.value = value || ""
                console.log(`Filled ${elementId} with "${value}"`)
            } else {
                console.warn(`Field ${elementId} not found!`)
            }
        })
    }

})()
