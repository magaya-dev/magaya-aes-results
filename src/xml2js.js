const xml2js = require('xml2js');

const transformXmlToJson = async (xmlString) => {
    try {
        const js = await xml2js.parseStringPromise(xmlString, { explicitArray: false });
        if (js.AESAcelynk && js.AESAcelynk.XT) {
            if (js.AESAcelynk.XT.ES1) {
                js.AESAcelynk.XT.ES1 = Array.isArray(js.AESAcelynk.XT.ES1) ? js.AESAcelynk.XT.ES1 : [js.AESAcelynk.XT.ES1];
            }
            else {
                s.AESAcelynk.XT.ES1 = [];
            }
            return js.AESAcelynk.XT;
        }
        throw new Error('Invalid Acelynk XML!');
    } catch (error) {
        console.log('Error parsing XML in ResponseDetails');
        console.log(error.message);
    }
    return null;
}

module.exports = transformXmlToJson;