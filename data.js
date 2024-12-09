
// Override these if most of your data is from a different country
const COUNTRY = "Magyarország"
const COUNTRY_ASCII = "Hungary"

// Fill the values
const name = {
    title: "",
    first: "",
    middle: "",
    last: ""
}

// Override if your name has changed
const maidenName = {
    first: name.first,
    middle: name.middle,
    last: name.last
}

// Override if your name contains accents
const name_ascii = {
    first: name.first,
    middle: name.middle,
    last: name.last
}

// Override if your name has changed AND it contains accents
const maidenName_ascii = {
    first: maidenName.first,
    middle: maidenName.middle,
    last: maidenName.last
}

// Fill the values
const mothersMaidenName = {
    first: "",
    middle: "",
    last: ""
}

// Override if your mother's name contains accents
const mothersMaidenName_ascii = {
    first: mothersMaidenName.first,
    middle: mothersMaidenName.middle,
    last: mothersMaidenName.last
}

// Fill the values
const birth = {
    country: COUNTRY,
    city: "",
    year: "",
    month: "",
    day: ""
}

// Override if your place of birth contains accents
const birth_ascii = {
    country: COUNTRY_ASCII,
    city: birth.city
}

// Fill the values
const phone = {
    countryCode: "36",
    carrierCode: "",
    number: ""
}

// Fill the value
const email = ""

// Fill the values
const address = {
    country: COUNTRY,
    zipCode: "",
    city: "",
    streetName: "",
    streetType: "",
    number: "",
    floor: "",
    door: ""
}

// Override if your address contains accents
const address_ascii = {
    country: COUNTRY_ASCII,
    city: address.city,
    street_name: address.streetName,
    street_type: address.streetType
}
