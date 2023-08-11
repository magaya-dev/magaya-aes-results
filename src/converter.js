const ExtensionId = require("../package.json").name;
const aitn = "Assigned Internal Transaction Number";
const xml2js = require('./xml2js')

function toDate(sd) {
	try {
		return Date.parse(sd);
	} catch (error) {
		console.log(error.message);
		return 0;
	}
}

function getComments(js) {
	const comments = js.ES1.reduce((msg, es1) => {
		let desc = '';
		if (es1.ResponseCode) {
			desc = `Response Code: ${es1.ResponseCode}; `;
		}
		if (es1.NarrativeText) {
			desc += `Narrative Text: ${es1.NarrativeText};`
		}
		msg = msg + (desc && (desc + '\n'));
		return msg;
	}, '');
	return comments;
}

function getITN(js) {
	const itn = js.ES1.find( es1 => es1.ResponseCode >= 900  && es1.ResponseCode <= 1000);
	return (itn && itn.AESInternalTransactionNo) || '';

}
function getStatus(js) {
	const itn = js.ES1.find( es1 => es1.ResponseCode >= 900  && es1.ResponseCode <= 1000);
	return (itn && itn.NarrativeText) || '';
}

module.exports = async ({ aesContent, mgyShipmentGuid }) => {

	const jsDetails = await xml2js(aesContent.ResponseDetails);

	return {
		//Comments: aesContent.ResponseMessage,
		Comments: (jsDetails ? getComments(jsDetails) : '' ) + aesContent.ResponseMessage,
		Data: aesContent.ResponseDetails,
		ExtensionId,
		TransactionType: "Acelynk message",
		AESITNNumber: jsDetails ?  getITN(jsDetails) : '',
		AESStatus: jsDetails ? getStatus(jsDetails) : '',
		AESXTNNumber: aesContent.TransactionID,
		ToBeDecided: aesContent.RequestCorrelationID,
		AESFilingDate: toDate(aesContent.CreatedDateTime),
		guid: mgyShipmentGuid,
	};
};
