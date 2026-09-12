// ==UserScript==
// @name         FormFiller
// @version      2.1.0
// @description  Fills form fields on configured websites
// @author       gbq6
// @match        *://*/*
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

;(async function () {
	'use strict'

	const DASH = '-'
	const SPACE = ' '
	const NOTHING = ''
	const STORAGE_KEY = 'formfiller_data_v1'

	const defaultData = {
		COUNTRY: 'Magyarország',
		COUNTRY_ASCII: 'Hungary',
		name: { title: '', first: '', middle: '', last: '' },
		maidenName: { first: '', middle: '', last: '' },
		mothersMaidenName: { first: '', middle: '', last: '' },
		birth: { country: 'Magyarország', city: '', year: '', month: '', day: '' },
		phone: { countryCode: '36', carrierCode: '', number: '' },
		email: '',
		address: {
			country: 'Magyarország',
			zipCode: '',
			city: '',
			streetName: '',
			streetType: '',
			number: '',
			floor: '',
			door: '',
		},
	}

	async function loadData() {
		const raw = await GM.getValue(STORAGE_KEY, null)
		if (!raw) {
			await GM.setValue(STORAGE_KEY, defaultData)
			return defaultData
		}
		return typeof raw === 'string' ? JSON.parse(raw) : raw
	}

	async function saveData(newData) {
		try {
			await GM.setValue(STORAGE_KEY, newData)
		} catch (err) {}
	}

	let profile = await loadData()

	function removeAccents(str) {
		if (!str || typeof str !== 'string') return ''
		return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
	}

	function getMaidenName() {
		const maidenName = profile.maidenName
		const name = profile.name
		return {
			first: maidenName.first && maidenName.first.trim() !== '' ? maidenName.first : name.first,
			middle: maidenName.middle && maidenName.middle.trim() !== '' ? maidenName.middle : name.middle,
			last: maidenName.last && maidenName.last.trim() !== '' ? maidenName.last : name.last,
		}
	}

	const maidenName = getMaidenName()
	const mothersMaidenName = profile.mothersMaidenName
	const birth = profile.birth
	const address = profile.address

	const name_ascii = {
		first: removeAccents(profile.name.first),
		middle: removeAccents(profile.name.middle),
		last: removeAccents(profile.name.last),
	}

	const maidenName_ascii = {
		first: removeAccents(maidenName.first),
		middle: removeAccents(maidenName.middle),
		last: removeAccents(maidenName.last),
	}

	const mothersMaidenName_ascii = {
		first: removeAccents(mothersMaidenName.first),
		middle: removeAccents(mothersMaidenName.middle),
		last: removeAccents(mothersMaidenName.last),
	}

	const websites = {
		'bekeltet.bkik.hu': {
			'edit-vezeteknev': profile.name.last,
			'edit-keresztnev': profile.name.first,
			'edit-telefonszam': join(
				NOTHING,
				profile.phone.countryCode,
				profile.phone.carrierCode,
				profile.phone.number
			),
			'edit-e-mail': profile.email,

			'edit-fogyaszto-cim-orszag': address.country,
			'edit-fogyaszto-cim-iranyitoszam': address.zipCode,
			'edit-fogyaszto-cim-telepules': address.city,
			'edit-fogyaszto-cim-utca': join(SPACE, address.streetName, address.streetType),
			'edit-fogyaszto-cim-hazszam': address.number,

			'edit-ugyfelkapu-nev': join(
				SPACE,
				profile.name.title,
				profile.name.last,
				profile.name.first,
				profile.name.middle
			),
			'edit-ugyfelkapu-szuletesi-nev': join(SPACE, maidenName.last, maidenName.first, maidenName.middle),
			'edit-ugyfelkapu-anyja-neve': join(
				SPACE,
				mothersMaidenName.last,
				mothersMaidenName.first,
				mothersMaidenName.middle
			),
			'edit-ugyfelkapu-szuletesi-hely': birth.city,
			'edit-ugyfelkapu-szuletesi-ido': join(DASH, birth.year, birth.month, birth.day),
		},
		'e-nmhh.nmhh.hu': {
			form_ViseltNev_elo: profile.name.title,
			form_ViseltNev_vezetek: profile.name.last,
			form_ViseltNev_kereszt: profile.name.first,
			form_ViseltNev_uto: profile.name.middle,

			form_Szulnev_vezetek: maidenName.last,
			form_Szulnev_kereszt: maidenName.first,
			form_Szulnev_uto: maidenName.middle,

			form_AnyjaSzulNeve_vezetek: mothersMaidenName.last,
			form_AnyjaSzulNeve_kereszt: mothersMaidenName.first,
			form_AnyjaSzulNeve_uto: mothersMaidenName.middle,

			form_Szulhely_te: birth.city,
			form_SzuletesiIdo: join(DASH, birth.year, birth.month, birth.day),

			form_A11_pref: profile.phone.countryCode,
			form_A11_telBlock1: profile.phone.carrierCode,
			form_A11_telBock2: profile.phone.number,

			form_emailAddress: profile.email,

			form_Benyujto_Lakcim_ir: address.zipCode,
			form_Benyujto_Lakcim_varos: address.city,
			form_Benyujto_Lakcim_utca: join(
				SPACE,
				address.streetName,
				address.streetType,
				address.number,
				address.floor,
				address.door
			),
		},
		'panaszrendezes.hu': {
			'fogyaszto-vezeteknev': profile.name.last,
			'fogyaszto-keresztnev': join(SPACE, profile.name.first, profile.name.middle),
			'fogyaszto-cim': join(
				SPACE,
				address.zipCode,
				address.city,
				address.streetName,
				address.streetType,
				address.number
			),
			'ugyfelkapu-adat-nev-online': join(SPACE, profile.name.title, profile.name.last, profile.name.first, profile.name.middle),
			'ugyfelkapu-adat-szul-nev-online': join(SPACE, maidenName.last, maidenName.first, maidenName.middle),
			'ugyfelkapu-adat-anyja-neve-online': join(SPACE, mothersMaidenName.last, mothersMaidenName.first, mothersMaidenName.middle),
			'ugyfelkapu-adat-szul-hely-online': birth.city,
			'ugyfelkapu-adat-szul-ido-online': join(DASH, birth.year, birth.month, birth.day),
		},
	}

	function join(separator, ...strings) {
		return strings.filter((string) => string && typeof string === 'string' && string.trim() !== '').join(separator)
	}

	function initUI() {
		const websiteConfig = websites[window.location.hostname]

		if (!websiteConfig) return
		if (document.getElementById('ff-toolbar')) return

		const toolbar = document.createElement('div')
		toolbar.id = 'ff-toolbar'
		toolbar.style.position = 'fixed'
		toolbar.style.bottom = '15px'
		toolbar.style.right = '15px'
		toolbar.style.zIndex = '2147483647'
		toolbar.style.display = 'flex'
		toolbar.style.gap = '8px'

		const fillButton = createButton('⚡ Fill Form', '#007BFF', () => fillFormFields(websiteConfig))
		toolbar.appendChild(fillButton)

		const settingsButton = createButton('⚙️ Settings', '#343A40', openSettingsModal)
		toolbar.appendChild(settingsButton)

		if (document.body) {
			document.body.appendChild(toolbar)
		} else {
			document.documentElement.appendChild(toolbar)
		}

		document.addEventListener('keydown', (event) => {
			if (event.ctrlKey && event.altKey && (event.key === 'r' || event.key === 'R')) {
				event.preventDefault()
				fillFormFields(websiteConfig)
			}
		})
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initUI)
		window.addEventListener('load', initUI)
	} else {
		initUI()
	}

	function createButton(text, backgroundColor, onClick) {
		const button = document.createElement('button')
		button.textContent = text
		button.style.padding = '8px 14px'
		button.style.backgroundColor = backgroundColor
		button.style.color = 'white'
		button.style.border = 'none'
		button.style.borderRadius = '6px'
		button.style.cursor = 'pointer'
		button.style.fontFamily = 'system-ui, sans-serif'
		button.style.fontSize = '13px'
		button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)'
		button.addEventListener('click', onClick)
		return button
	}

	function fillFormFields(config) {
		const scriptContent = `
          (function() {
              const config = ${JSON.stringify(config)};
              Object.keys(config).forEach((key) => {
                  const value = config[key];
                  let field = document.getElementById(key) || 
                              document.querySelector('[name="' + key + '"]') || 
                              document.querySelector(key);

                  if (field) {
                      field.value = value || '';
                      field.dispatchEvent(new Event('input', { bubbles: true }));
                      field.dispatchEvent(new Event('change', { bubbles: true }));
                  }
              });
          })();
       `
		const scriptEl = document.createElement('script')
		scriptEl.textContent = scriptContent
		;(document.head || document.documentElement).appendChild(scriptEl)
		scriptEl.remove()
	}

	function openSettingsModal() {
		let existing = document.getElementById('ff-modal-overlay')
		if (existing) existing.remove()

		const overlay = document.createElement('div')
		overlay.id = 'ff-modal-overlay'
		overlay.style.position = 'fixed'
		overlay.style.top = '0'
		overlay.style.left = '0'
		overlay.style.width = '100vw'
		overlay.style.height = '100vh'
		overlay.style.backgroundColor = 'rgba(0,0,0,0.6)'
		overlay.style.zIndex = '2147483647'
		overlay.style.display = 'flex'
		overlay.style.justifyContent = 'center'
		overlay.style.alignItems = 'center'

		const modal = document.createElement('div')
		modal.style.backgroundColor = '#1a1a1a'
		modal.style.color = '#f1f1f1'
		modal.style.padding = '25px'
		modal.style.borderRadius = '10px'
		modal.style.width = '500px'
		modal.style.maxHeight = '85vh'
		modal.style.overflowY = 'auto'
		modal.style.fontFamily = 'system-ui, sans-serif'
		modal.style.boxShadow = '0 4px 25px rgba(0,0,0,0.6)'
		modal.style.border = '1px solid #333'

		modal.innerHTML = `
            <h3 style="margin-top:0; color:#fff; font-size:16px;">FormFiller Settings</h3>
            <form id="ff-settings-form">
                <fieldset style="margin-bottom:12px; border:1px solid #444; border-radius:6px; padding:10px;">
                    <legend style="font-weight:bold; font-size:12px; color:#aaa; padding:0 4px;">Name</legend>
                    <div style="display:flex; gap:8px; margin-bottom:8px;">
                        <input type="text" id="ff-title" placeholder="Title" value="${profile.name.title || ''}" style="width:25%">
                        <input type="text" id="ff-lastname" placeholder="Last Name" value="${profile.name.last || ''}" style="width:75%">
                    </div>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="ff-firstname" placeholder="First Name" value="${profile.name.first || ''}" style="width:50%">
                        <input type="text" id="ff-middlename" placeholder="Middle Name" value="${profile.name.middle || ''}" style="width:50%">
                    </div>
                </fieldset>

                <fieldset style="margin-bottom:12px; border:1px solid #444; border-radius:6px; padding:10px;">
                    <legend style="font-weight:bold; font-size:12px; color:#aaa; padding:0 4px;">Maiden Name (leave blank to use main name)</legend>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="ff-m-lastname" placeholder="Last" value="${profile.maidenName.last || ''}" style="width:40%">
                        <input type="text" id="ff-m-firstname" placeholder="First" value="${profile.maidenName.first || ''}" style="width:30%">
                        <input type="text" id="ff-m-middlename" placeholder="Middle" value="${profile.maidenName.middle || ''}" style="width:30%">
                    </div>
                </fieldset>

                <fieldset style="margin-bottom:12px; border:1px solid #444; border-radius:6px; padding:10px;">
                    <legend style="font-weight:bold; font-size:12px; color:#aaa; padding:0 4px;">Mother's Maiden Name</legend>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="ff-mom-lastname" placeholder="Last" value="${profile.mothersMaidenName.last || ''}" style="width:40%">
                        <input type="text" id="ff-mom-firstname" placeholder="First" value="${profile.mothersMaidenName.first || ''}" style="width:30%">
                        <input type="text" id="ff-mom-middlename" placeholder="Middle" value="${profile.mothersMaidenName.middle || ''}" style="width:30%">
                    </div>
                </fieldset>

                <fieldset style="margin-bottom:12px; border:1px solid #444; border-radius:6px; padding:10px;">
                    <legend style="font-weight:bold; font-size:12px; color:#aaa; padding:0 4px;">Birth & Contact</legend>
                    <input type="text" id="ff-birthcountry" placeholder="Country" value="${profile.birth.country || ''}" style="width:100%; margin-bottom:8px;">
                    <input type="text" id="ff-birthcity" placeholder="City" value="${profile.birth.city || ''}" style="width:100%; margin-bottom:8px;">
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <input type="text" id="ff-birthyear" placeholder="YYYY" value="${profile.birth.year || ''}" style="width:33%">
                        <input type="text" id="ff-birthmonth" placeholder="MM" value="${profile.birth.month || ''}" style="width:33%">
                        <input type="text" id="ff-birthday" placeholder="DD" value="${profile.birth.day || ''}" style="width:33%">
                    </div>
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <input type="text" id="ff-ccode" placeholder="CC (36)" value="${profile.phone.countryCode || ''}" style="width:25%">
                        <input type="text" id="ff-carrier" placeholder="Carrier" value="${profile.phone.carrierCode || ''}" style="width:25%">
                        <input type="text" id="ff-phonenum" placeholder="Number" value="${profile.phone.number || ''}" style="width:50%">
                    </div>
                    <input type="email" id="ff-email" placeholder="Email Address" value="${profile.email || ''}" style="width:100%;">
                </fieldset>

                <fieldset style="margin-bottom:15px; border:1px solid #444; border-radius:6px; padding:10px;">
                    <legend style="font-weight:bold; font-size:12px; color:#aaa; padding:0 4px;">Address</legend>
                    <input type="text" id="ff-acountry" placeholder="Country" value="${profile.address.country || ''}" style="width:100%; margin-bottom:8px;">
                    <div style="display:flex; gap:8px; margin-bottom:8px;">
                        <input type="text" id="ff-zip" placeholder="Zip Code" value="${profile.address.zipCode || ''}" style="width:30%">
                        <input type="text" id="ff-city" placeholder="City" value="${profile.address.city || ''}" style="width:70%">
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:8px;">
                        <input type="text" id="ff-street" placeholder="Street Name" value="${profile.address.streetName || ''}" style="width:70%">
                        <input type="text" id="ff-stype" placeholder="Type (utca)" value="${profile.address.streetType || ''}" style="width:30%">
                    </div>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="ff-house" placeholder="House #" value="${profile.address.number || ''}" style="width:33%">
                        <input type="text" id="ff-floor" placeholder="Floor" value="${profile.address.floor || ''}" style="width:33%">
                        <input type="text" id="ff-door" placeholder="Door" value="${profile.address.door || ''}" style="width:33%">
                    </div>
                </fieldset>

                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" id="ff-cancel" style="padding:8px 12px; background:#3a3a3a; color:#ddd; border:none; border-radius:4px; cursor:pointer;">Cancel</button>
                    <button type="submit" style="padding:8px 14px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">Save Changes</button>
                </div>
            </form>
        `

		setTimeout(() => {
			modal.querySelectorAll('input').forEach((input) => {
				input.style.padding = '6px'
				input.style.boxSizing = 'border-box'
				input.style.backgroundColor = '#2a2a2a'
				input.style.color = '#fff'
				input.style.border = '1px solid #555'
				input.style.borderRadius = '4px'
				input.style.fontSize = '13px'
			})
		}, 10)

		overlay.appendChild(modal)
		document.body.appendChild(overlay)

		function closeModal() {
			document.removeEventListener('keydown', modalKeyListener)
			overlay.remove()
		}

		async function handleSave() {
			profile.name.title = document.getElementById('ff-title').value
			profile.name.last = document.getElementById('ff-lastname').value
			profile.name.first = document.getElementById('ff-firstname').value
			profile.name.middle = document.getElementById('ff-middlename').value

			profile.maidenName.last = document.getElementById('ff-m-lastname').value
			profile.maidenName.first = document.getElementById('ff-m-firstname').value
			profile.maidenName.middle = document.getElementById('ff-m-middlename').value

			profile.mothersMaidenName.last = document.getElementById('ff-mom-lastname').value
			profile.mothersMaidenName.first = document.getElementById('ff-mom-firstname').value
			profile.mothersMaidenName.middle = document.getElementById('ff-mom-middlename').value

			profile.birth.country = document.getElementById('ff-birthcountry').value
			profile.birth.city = document.getElementById('ff-birthcity').value
			profile.birth.year = document.getElementById('ff-birthyear').value
			profile.birth.month = document.getElementById('ff-birthmonth').value
			profile.birth.day = document.getElementById('ff-birthday').value

			profile.phone.countryCode = document.getElementById('ff-ccode').value
			profile.phone.carrierCode = document.getElementById('ff-carrier').value
			profile.phone.number = document.getElementById('ff-phonenum').value
			profile.email = document.getElementById('ff-email').value

			profile.address.country = document.getElementById('ff-acountry').value
			profile.address.zipCode = document.getElementById('ff-zip').value
			profile.address.city = document.getElementById('ff-city').value
			profile.address.streetName = document.getElementById('ff-street').value
			profile.address.streetType = document.getElementById('ff-stype').value
			profile.address.number = document.getElementById('ff-house').value
			profile.address.floor = document.getElementById('ff-floor').value
			profile.address.door = document.getElementById('ff-door').value

			await saveData(profile)
			closeModal()
			location.reload()
		}

		const modalKeyListener = (event) => {
			if (event.key === 'Escape') {
				event.preventDefault()
				closeModal()
			} else if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
				event.preventDefault()
				handleSave()
			}
		}
		document.addEventListener('keydown', modalKeyListener)

		document.getElementById('ff-cancel').addEventListener('click', closeModal)

		overlay.addEventListener('click', (event) => {
			if (event.target === overlay) {
				closeModal()
			}
		})

		document.getElementById('ff-settings-form').addEventListener('submit', (event) => {
			event.preventDefault()
			handleSave()
		})
	}
})()
